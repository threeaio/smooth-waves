'use client';

import {
    sampleConfig,
    Wave,
    WaveBand,
    type WaveAnimation,
    type WaveBandAnimation,
    type WaveConfig,
} from '@threeaio/smooth-waves';
import { cn } from '@/lib/utils';
import { CurveOverlay, type OverlayEdge, type Selection } from './curve-overlay';
import {
    grainTexture,
    initialLayers,
    MOCK_WIDTH,
    palettePresets,
    remapPaletteColor,
    sage,
    createLayer,
    type EdgeState,
    type LayerState,
    type Mode,
} from './defaults';
import { buildFigmaSvg, effectiveCurveAmount, layerProgress } from './figma-export';
import { layerContains, layerOutlines } from './hit-test';
import { LayerInspector, PageInspector } from './inspector';
import { LayersPanel } from './layers-panel';
import { toStackSnippet } from './snippets';
import { accentText, FlashButton, sliderCls, sliderFill } from './ui';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function Grain({ clipPath }: { clipPath?: string }) {
    // clipPath crops the fixed layers to the frame column WITHOUT a wrapper — a clipping
    // ancestor would isolate the stacking context and break the overlay blend
    return (
        <>
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-30 mix-blend-overlay opacity-75"
                style={{ backgroundImage: grainTexture, backgroundSize: '256px 256px', filter: 'contrast(170%)', clipPath }}
            />
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-30 opacity-[0.05]"
                style={{ backgroundImage: grainTexture, backgroundSize: '256px 256px', clipPath }}
            />
        </>
    );
}

// editor chrome dimensions — the fit calculation needs them in px
const TOOLBAR_H = 44;
const TIMELINE_H = 40;
const LEFT_W = 224;
const RIGHT_W = 288;
/** Breathing room between the artboard (incl. its bleed overscan) and the docked chrome. */
const MARGIN = 24;

// docked chrome, Figma-UI3 style — opaque panels with hairline borders; the canvas
// area between them stays completely clear (handles must never hide under UI)
const panelCls = 'border-black/[0.08] bg-white text-zinc-700';

export default function Playground() {
    const [layers, setLayers] = useState<LayerState[]>(initialLayers);
    // canvas/list selection: 'page' (composition settings) or a layer id
    const [activeId, setActiveId] = useState<string>('page');
    const [selection, setSelection] = useState<Selection | null>(null);
    const [onion, setOnion] = useState(false);
    // the composition should read as a real page — its background is part of the design
    const [pageBg, setPageBg] = useState(sage);
    // e4 lays its grain over the whole page — part of the mood, so on by default
    const [grainOn, setGrainOn] = useState(true);
    // horizontal overscan per layer (e4: -inset-x-[14%]) — curves bleed off-canvas,
    // so their steep outer parts are cropped and the visible sweep looks calmer
    const [bleedX, setBleedX] = useState(14);
    // working palette (editable + presets) — offered as quick swatches in every color field
    const [palette, setPalette] = useState<string[]>([...palettePresets[0].colors]);
    // fit view: the page laid out at a mocked wide-screen width, scaled down so the
    // whole section fits between the chrome — the composer opens here; Z / toolbar → 100%
    const [mockWide, setMockWide] = useState(true);
    const [viewport, setViewport] = useState({ w: 1728, h: 1000 });
    // hovering a layer (row or canvas) highlights that layer's curve(s) in the preview
    const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);
    // in the fitted overview there is no scroll room — the progress slider drives
    // a virtual scroll position instead (0..1 across the mocked page)
    const [scrubT, setScrubT] = useState(0);
    // playback: loops the virtual progress in fit view, so motion is judged without scrolling
    const [playing, setPlaying] = useState(false);
    // fullscreen preview: hides all editor chrome (panels, markers, overlay)
    const [fullscreen, setFullscreen] = useState(false);
    // pages may start or end with the waves themselves — the surrounding scroll room is
    // optional; the default composition fills its section edge to edge, so both are off
    const [spaceBefore, setSpaceBefore] = useState(false);
    const [spaceAfter, setSpaceAfter] = useState(false);
    // the wave section's height in px — the main driver of the page's total height
    const [sectionPx, setSectionPx] = useState(2500);
    const scrubberRef = useRef<HTMLInputElement>(null);
    const tLabelRef = useRef<HTMLSpanElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const layerCounter = useRef(initialLayers.length + 1);

    const active = layers.find((l) => l.id === activeId);

    const patch = (partial: Partial<LayerState>) =>
        setLayers((ls) => ls.map((l) => (l.id === activeId ? { ...l, ...partial } : l)));
    const patchEdge = (edge: 'top' | 'bottom', partial: Partial<EdgeState>) =>
        setLayers((ls) => ls.map((l) => (l.id === activeId ? { ...l, [edge]: { ...l[edge], ...partial } } : l)));

    // Palette edits recolor every color that was taken from the old palette
    // (fills, strokes, page bg — alpha preserved), so preset switches restyle
    // the whole composition live.
    const applyPalette = (next: string[]) => {
        const remap = (value: string) => remapPaletteColor(value, palette, next);
        setLayers((ls) =>
            ls.map((l) => ({
                ...l,
                fill: remap(l.fill),
                strokeStyle: remap(l.strokeStyle),
                top: { ...l.top, strokeStyle: remap(l.top.strokeStyle) },
                bottom: { ...l.bottom, strokeStyle: remap(l.bottom.strokeStyle) },
            })),
        );
        setPageBg(remap(pageBg));
        setPalette(next);
    };

    /* ---- layer management ---- */
    const selectTarget = (id: string) => {
        if (id !== activeId) setSelection(null); // selection always belongs to the active layer
        setActiveId(id);
    };

    const addLayer = (mode: Mode) => {
        const layer = createLayer(mode, layerCounter.current++);
        setLayers((ls) => [...ls, layer]);
        setSelection(null);
        setActiveId(layer.id);
    };

    const removeLayer = (id: string) => {
        if (layers.length <= 1) return;
        const next = layers.filter((l) => l.id !== id);
        setLayers(next);
        if (id === activeId) {
            setSelection(null);
            setActiveId(next[next.length - 1].id);
        }
    };

    const moveLayer = (id: string, dir: 1 | -1) => {
        setLayers((ls) => {
            const i = ls.findIndex((l) => l.id === id);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= ls.length) return ls;
            const next = [...ls];
            [next[i], next[j]] = [next[j], next[i]];
            return next;
        });
    };

    const toggleVisible = (id: string) =>
        setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
    const renameLayer = (id: string, name: string) =>
        setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, name } : l)));

    /* ---- preview ---- */
    // The progress a layer would have at the virtual scroll position `scrubT` on the
    // mocked page (as if it were laid out unscaled) — drives the fitted overview.
    const virtualProgress = useCallback(
        (layer: Pick<LayerState, 'scrollStart' | 'scrollEnd'>): number => {
            const totalH = ((spaceBefore ? 0.8 : 0) + (spaceAfter ? 0.8 : 0)) * viewport.h + sectionPx;
            const virtualScrollY = scrubT * Math.max(0, totalH - viewport.h);
            const sectionTop = spaceBefore ? 0.8 * viewport.h : 0;
            return layerProgress(layer.scrollStart, layer.scrollEnd, sectionTop, sectionPx, viewport.h, virtualScrollY);
        },
        [scrubT, viewport.h, spaceBefore, spaceAfter, sectionPx],
    );

    // A layer's current progress, wherever the preview is (fit view or real scroll).
    const layerT = useCallback(
        (layer: LayerState): number => {
            if (mockWide) return virtualProgress(layer);
            const el = sectionRef.current;
            if (!el) return 0;
            const rect = el.getBoundingClientRect();
            return layerProgress(
                layer.scrollStart,
                layer.scrollEnd,
                rect.top + window.scrollY,
                rect.height,
                window.innerHeight,
                window.scrollY,
            );
        },
        [mockWide, virtualProgress],
    );

    // Only the active layer gets pinned while editing — the rest of the stack keeps animating.
    // Per-layer keys remount only the affected component (motion's useScroll reads `offset` at hook setup).
    const previewLayers = useMemo(() => {
        // e4's Field wrapper: horizontal overscan + optional blur/dissolve around every layer
        const wrap = (key: string, layer: LayerState, child: React.ReactNode) => {
            const filter = [
                layer.blur > 0 ? `blur(${layer.blur}px)` : null,
                layer.dissolve > 0 ? `url(#dissolve-${layer.id})` : null,
            ]
                .filter(Boolean)
                .join(' ');
            return (
                <div
                    key={key}
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0"
                    style={{
                        left: `-${bleedX}%`,
                        right: `-${bleedX}%`,
                        filter: filter || undefined,
                    }}
                >
                    {child}
                </div>
            );
        };
        return layers
            .filter((l) => l.visible)
            .map((layer) => {
                const pinned = layer.id === activeId && selection ? selection : null;
                // spacer/height changes shift the section in the document — remount so useScroll re-anchors
                const key = `${layer.id}|${layer.scrollStart}|${layer.scrollEnd}|${spaceBefore}|${spaceAfter}|${sectionPx}|${mockWide}|${
                    pinned ? `pin-${pinned.edge}-${pinned.index}` : 'live'
                }`;
                const featheredOut = layer.featheredOut === 'none' ? undefined : layer.featheredOut;
                const scrollOffset = [layer.scrollStart, layer.scrollEnd] as WaveAnimation['scrollOffset'];
                if (layer.mode === 'wave') {
                    const config: WaveAnimation = {
                        fill: layer.fill,
                        strokeStyle: layer.strokeStyle,
                        strokeWidth: layer.strokeWidth,
                        curveAmount: effectiveCurveAmount(layer.blur, layer.curveAmount),
                        offsetLeft: layer.offsetLeft,
                        offsetRight: layer.offsetRight,
                        flip: layer.flip,
                        debug: layer.debug,
                        featheredOut,
                        // pinned: a single keyframe renders static, so the shape holds still while
                        // editing; in the fitted overview a sampled snapshot follows the scrubber
                        configs: pinned
                            ? [layer.configs[Math.min(pinned.index, layer.configs.length - 1)]]
                            : mockWide
                              ? [sampleConfig(layer.configs, virtualProgress(layer))]
                              : layer.configs,
                        scrollOffset,
                    };
                    return wrap(key, layer, <Wave waveConfig={config} />);
                }
                const pin = (e: EdgeState): EdgeState => {
                    const edge = { ...e, curveAmount: effectiveCurveAmount(layer.blur, e.curveAmount) };
                    if (pinned) return { ...edge, configs: [e.configs[Math.min(pinned.index, e.configs.length - 1)]] };
                    if (mockWide) return { ...edge, configs: [sampleConfig(e.configs, virtualProgress(layer))] };
                    return edge;
                };
                const config: WaveBandAnimation = {
                    fill: layer.fill,
                    debug: layer.debug,
                    featheredOut,
                    top: pin(layer.top),
                    bottom: pin(layer.bottom),
                    scrollOffset,
                };
                return wrap(key, layer, <WaveBand waveConfig={config} />);
            });
    }, [layers, activeId, selection, spaceBefore, spaceAfter, sectionPx, bleedX, mockWide, virtualProgress]);

    const code = useMemo(() => toStackSnippet(layers, sectionPx, bleedX), [layers, sectionPx, bleedX]);

    // ghosts + handles only for the active layer — all layers at once would be chaos
    const overlayEdges = useMemo<OverlayEdge[]>(() => {
        if (!active) return [];
        const updateConfig = (edge: 'wave' | 'top' | 'bottom', i: number, config: WaveConfig) =>
            setLayers((ls) =>
                ls.map((l) => {
                    if (l.id !== activeId) return l;
                    if (edge === 'wave') return { ...l, configs: l.configs.map((c, j) => (j === i ? config : c)) };
                    return {
                        ...l,
                        [edge]: { ...l[edge], configs: l[edge].configs.map((c, j) => (j === i ? config : c)) },
                    };
                }),
            );
        if (active.mode === 'wave') {
            return [
                {
                    edge: 'wave',
                    configs: active.configs,
                    flip: active.flip,
                    onChange: (i, config) => updateConfig('wave', i, config),
                },
            ];
        }
        return [
            { edge: 'top', configs: active.top.configs, onChange: (i, config) => updateConfig('top', i, config) },
            {
                edge: 'bottom',
                configs: active.bottom.configs,
                dashed: true,
                onChange: (i, config) => updateConfig('bottom', i, config),
            },
        ];
    }, [active, activeId]);

    /* ---- canvas interaction: click to select, hover to highlight ---- */
    const hitsAt = (e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>): string[] => {
        const rect = e.currentTarget.getBoundingClientRect();
        // the overlay spans the bleed-wide canvas — normalized coords match the layer geometry
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const hits: string[] = [];
        for (let i = layers.length - 1; i >= 0; i--) {
            const l = layers[i];
            if (!l.visible) continue;
            if (layerContains(l, layerT(l), x, y)) hits.push(l.id);
        }
        return hits;
    };

    const onCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        const hits = hitsAt(e);
        if (hits.length === 0) {
            selectTarget('page');
            return;
        }
        // click selects the topmost shape; clicking again drills to the next one below (deep select)
        const i = hits.indexOf(activeId);
        selectTarget(hits[(i + 1) % hits.length]);
    };

    // hover + selection outlines at the layers' current progress, in normalized
    // coords (the svg stretches them over the bleed-wide canvas)
    const hoveredLayer = hoveredLayerId ? layers.find((l) => l.id === hoveredLayerId) : undefined;
    const outlineCurves = useMemo(() => {
        const items: Array<{ d: string; kind: 'hover' | 'selected' }> = [];
        if (hoveredLayer?.visible) {
            for (const d of layerOutlines(hoveredLayer, layerT(hoveredLayer))) items.push({ d, kind: 'hover' });
        }
        // while a keyframe is pinned the CurveOverlay owns the canvas — no extra outline
        if (active && active.visible && !selection && active.id !== hoveredLayerId) {
            for (const d of layerOutlines(active, layerT(active))) items.push({ d, kind: 'selected' });
        }
        return items;
    }, [hoveredLayer, active, selection, hoveredLayerId, layerT]);

    /* ---- figma export ---- */
    const buildExport = (): { svg: string; t: number } | null => {
        const el = sectionRef.current;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const visible = layers.filter((l) => l.visible);
        if (visible.length === 0) return null;
        // fitted overview: the on-screen rect is scaled down — export the mocked
        // screen at its true size, at the scrubber's virtual progress
        if (mockWide) {
            return {
                svg: buildFigmaSvg(visible, MOCK_WIDTH, sectionPx, virtualProgress, pageBg, bleedX / 100),
                t: scrubT,
            };
        }
        const svg = buildFigmaSvg(
            visible,
            rect.width,
            rect.height,
            (layer) =>
                layerProgress(
                    layer.scrollStart,
                    layer.scrollEnd,
                    sectionTop,
                    rect.height,
                    window.innerHeight,
                    window.scrollY,
                ),
            pageBg,
            bleedX / 100,
        );
        // headline progress for the feedback label: the section's full pass
        const t = layerProgress('start end', 'end start', sectionTop, rect.height, window.innerHeight, window.scrollY);
        return { svg, t };
    };

    /* ---- effects ---- */
    // Viewport size feeds the fit calculation (scale factor + height compensation).
    useEffect(() => {
        const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // Keep the timeline in sync with real scrolling without re-rendering on every frame.
    useEffect(() => {
        const onScroll = () => {
            const el = scrubberRef.current;
            if (!el) return;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const t = max > 0 ? window.scrollY / max : 0;
            el.value = String(Math.round(t * 100));
            el.style.background = sliderFill(t * 100);
            if (tLabelRef.current) tLabelRef.current.textContent = t.toFixed(2);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // …and with the virtual progress in fit view (play + scrub share one input).
    useEffect(() => {
        if (!mockWide) return;
        if (scrubberRef.current) {
            scrubberRef.current.value = String(scrubT * 100);
            scrubberRef.current.style.background = sliderFill(scrubT * 100);
        }
        if (tLabelRef.current) tLabelRef.current.textContent = scrubT.toFixed(2);
    }, [scrubT, mockWide]);

    // Playback: loop the virtual progress — one full pass every 12s.
    useEffect(() => {
        if (!playing || !mockWide) return;
        let raf = 0;
        let last = performance.now();
        const step = (now: number) => {
            const dt = (now - last) / 1000;
            last = now;
            setScrubT((t) => (t + dt / 12) % 1);
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [playing, mockWide]);

    // Allow deep links like /playground?mode=band — activates the first layer of that type.
    useEffect(() => {
        const mode = new URLSearchParams(window.location.search).get('mode');
        if (mode === 'band' || mode === 'wave') {
            const target = initialLayers.find((l) => l.mode === mode);
            if (target) setActiveId(target.id);
        }
    }, []);

    // Escape backs out (fullscreen → pinned keyframe → layer selection);
    // F fullscreen, Z fit/100%, space plays in fit view.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const typing = !!(target && (target.closest('input, textarea, select') || target.isContentEditable));
            if (e.key === 'Escape') {
                if (fullscreen) setFullscreen(false);
                else if (selection) setSelection(null);
                else setActiveId('page');
                return;
            }
            if (typing) return;
            if (e.key === 'f' || e.key === 'F') {
                setSelection(null);
                setFullscreen((v) => !v);
            }
            if (e.key === 'z' || e.key === 'Z') setMockWide((v) => !v);
            if (e.key === ' ' && mockWide) {
                e.preventDefault();
                setSelection(null);
                setPlaying((v) => !v);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [fullscreen, selection, mockWide]);

    const scrubTo = (percent: number) => {
        // scrubbing means "show me the animation" — release a pinned keyframe first,
        // otherwise the preview stays static and the slider seems to do nothing
        setSelection(null);
        setPlaying(false);
        // fitted overview: no scroll room — drive the virtual scroll position instead
        if (mockWide) {
            setScrubT(percent / 100);
            return;
        }
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: (percent / 100) * max });
    };

    /* ---- canvas area layout ---- */
    // The canvas is the clear rect between the docked chrome (nothing floats over it).
    // In fit view the page is laid out at MOCK_WIDTH and scaled so the whole section
    // INCLUDING its bleed overscan fits that rect — curve handles live at the bleed
    // edges and must stay visible and reachable next to the artboard, Figma-style.
    // The outer wrapper keeps the document height honest (transforms don't affect
    // layout, so without it the page would scroll into a void).
    const chrome = !fullscreen;
    const lg = viewport.w >= 1024;
    const leftW = chrome && lg ? LEFT_W : 0;
    const rightW = chrome && lg ? RIGHT_W : 0;
    const topH = chrome ? TOOLBAR_H : 0;
    const bottomH = chrome ? TIMELINE_H : 0;
    const availW = viewport.w - leftW - rightW;
    const availH = viewport.h - topH - bottomH;
    const margin = chrome ? MARGIN : 12;
    // reserve room for the bleed only while editing — fullscreen is a clean preview
    const bleedFactor = chrome ? 1 + (2 * bleedX) / 100 : 1;
    const mockScale = Math.min((availW - 2 * margin) / (MOCK_WIDTH * bleedFactor), (availH - 2 * margin) / sectionPx, 1);
    const mockOffsetX = leftW + Math.max(0, (availW - MOCK_WIDTH * mockScale) / 2);
    const mockContentH = ((spaceBefore ? 0.8 : 0) + (spaceAfter ? 0.8 : 0)) * viewport.h + sectionPx;
    const mockOffsetY = topH + Math.max(chrome ? margin : 0, (availH - mockContentH * mockScale) / 2);
    // 100% view: the real-scroll preview also stays inside the clear canvas area
    // (bleed included), so even here "100%" is a bit less than the full window
    const scrollW = chrome ? Math.max(320, (availW - 2 * margin) / bleedFactor) : viewport.w;
    const scrollOffsetX = chrome ? leftW + Math.max(0, (availW - scrollW) / 2) : 0;

    const deselectToPage = (e: React.MouseEvent<HTMLElement>) => {
        if (e.target === e.currentTarget) selectTarget('page');
    };

    return (
        <div
            onClick={deselectToPage}
            className="relative min-h-screen max-w-full overflow-x-hidden"
            // in fit view the page bg lives INSIDE the frame — around it: neutral editor canvas
            style={{ backgroundColor: mockWide || chrome ? '#e8e8eb' : pageBg }}
        >
            {/* --------------------------------- canvas --------------------------------- */}
            <main onClick={deselectToPage}>
                <div
                    onClick={deselectToPage}
                    style={
                        mockWide
                            ? { height: mockContentH * mockScale, paddingTop: mockOffsetY }
                            : { paddingTop: chrome ? topH + margin : 0, paddingBottom: chrome ? bottomH + margin : 0 }
                    }
                >
                    <div
                        // framed like a device/artboard — the ARTWORK clips inside the frame
                        // (see below), while overlays and handles may overflow into the clear
                        // editor canvas around it
                        className={cn('relative', chrome && 'ring-1 ring-black/10', mockWide && chrome && 'shadow-2xl')}
                        style={
                            mockWide
                                ? {
                                      width: MOCK_WIDTH,
                                      transform: `scale(${mockScale})`,
                                      transformOrigin: 'top left',
                                      marginLeft: mockOffsetX,
                                      backgroundColor: pageBg,
                                  }
                                : { width: scrollW, marginLeft: scrollOffsetX, backgroundColor: pageBg }
                        }
                    >
                        {spaceBefore && <div className="h-[80vh]" />}

                        <div ref={sectionRef} className="relative" style={{ height: `${sectionPx}px` }}>
                            {!mockWide && chrome && (
                                <div className="absolute inset-x-0 top-0 z-10 border-t border-dashed border-white/20 px-4 md:px-16">
                                    <span className="font-mono text-[10px] text-white/50">wave section — start</span>
                                </div>
                            )}
                            {/* the artwork clips at the frame like a real viewport — the bleed
                                overscan is cropped here, NOT further out at the editor panels */}
                            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                                {/* grainy-dissolve filters (per layer): dense fractal noise displaces
                                    the soft edge's pixels into speckle, then the original blends back
                                    underneath — soft falloff + grain, solid core stays solid */}
                                <svg width={0} height={0} aria-hidden className="absolute">
                                    <defs>
                                        {layers
                                            .filter((l) => l.visible && l.dissolve > 0)
                                            .map((l) => (
                                                <filter
                                                    key={l.id}
                                                    id={`dissolve-${l.id}`}
                                                    colorInterpolationFilters="sRGB"
                                                >
                                                    <feTurbulence
                                                        type="fractalNoise"
                                                        // grain size scales the noise frequency inversely —
                                                        // 1 = per-pixel speckle, higher = coarser clumps
                                                        baseFrequency={(0.9713 / Math.max(1, l.dissolveSize)).toFixed(4)}
                                                        numOctaves="4"
                                                    />
                                                    <feDisplacementMap
                                                        in="SourceGraphic"
                                                        scale={l.dissolve}
                                                        xChannelSelector="R"
                                                    />
                                                    <feBlend in2="SourceGraphic" />
                                                </filter>
                                            ))}
                                    </defs>
                                </svg>
                                {previewLayers}
                            </div>
                            {/* click-select: hit testing on the real curve shapes; while a keyframe
                                is pinned the CurveOverlay owns all pointer input instead */}
                            {chrome && !selection && (
                                <div
                                    className="absolute inset-y-0 z-10"
                                    style={{ left: `-${bleedX}%`, right: `-${bleedX}%` }}
                                    onClick={onCanvasClick}
                                    onPointerMove={(e) => setHoveredLayerId(hitsAt(e)[0] ?? null)}
                                    onPointerLeave={() => setHoveredLayerId(null)}
                                />
                            )}
                            {/* hover: bold dashed outline · selected: solid accent outline */}
                            {chrome && outlineCurves.length > 0 && (
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-y-0 z-20"
                                    style={{ left: `-${bleedX}%`, right: `-${bleedX}%` }}
                                >
                                    <svg className="size-full" viewBox="0 0 1 1" preserveAspectRatio="none">
                                        {outlineCurves.map(({ d, kind }, i) => (
                                            // non-scaling strokes stay at screen px, so the fitted
                                            // view gets extra weight to keep the highlight loud
                                            <g key={i}>
                                                <path
                                                    d={d}
                                                    fill="none"
                                                    stroke={kind === 'hover' ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.35)'}
                                                    strokeWidth={kind === 'hover' ? (mockWide ? 5 : 4) : 4}
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                                <path
                                                    d={d}
                                                    fill="none"
                                                    stroke={kind === 'hover' ? '#fff' : '#0d99ff'}
                                                    strokeWidth={kind === 'hover' ? 2 : 2}
                                                    strokeDasharray={kind === 'hover' ? '8 6' : undefined}
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                            </g>
                                        ))}
                                    </svg>
                                </div>
                            )}
                            {/* handle overlay spans the same bleed-wide rect as the artwork —
                                ghost curves and handles land exactly on the rendered curves,
                                and the edge anchors stay visible just outside the frame */}
                            {chrome && active && (
                                <div className="absolute inset-y-0" style={{ left: `-${bleedX}%`, right: `-${bleedX}%` }}>
                                    <CurveOverlay
                                        edges={overlayEdges}
                                        selection={selection}
                                        onSelect={setSelection}
                                        // no pin yet → all keyframes show as labeled ghosts, so picking
                                        // one to edit happens right on the canvas; while pinned the
                                        // onion toggle decides
                                        showGhosts={onion || !selection}
                                        scale={mockWide ? mockScale : 1}
                                    />
                                </div>
                            )}
                            {!mockWide && chrome && (
                                <div className="absolute inset-x-0 bottom-0 z-10 border-b border-dashed border-white/20 px-4 md:px-16">
                                    <span className="font-mono text-[10px] text-white/50">wave section — end</span>
                                </div>
                            )}
                        </div>

                        {spaceAfter && <div className="h-[80vh]" />}
                        {/* inside the frame, `fixed` is relative to the transformed wrapper —
                            the grain covers exactly the mocked screen, not the editor canvas */}
                        {mockWide && grainOn && <Grain />}
                    </div>
                </div>
            </main>

            {/* 100% view: the grain stays viewport-fixed, cropped to the frame column */}
            {!mockWide && grainOn && (
                <Grain
                    clipPath={
                        chrome
                            ? `inset(0 ${Math.max(0, viewport.w - scrollOffsetX - scrollW)}px 0 ${scrollOffsetX}px)`
                            : undefined
                    }
                />
            )}

            {/* --------------------------------- toolbar -------------------------------- */}
            {chrome && (
                <header
                    className={cn('fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b px-3', panelCls)}
                    style={{ height: TOOLBAR_H }}
                >
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] font-medium text-zinc-800">wave composer</span>
                        <Link
                            href="/"
                            title="exit composer"
                            className="font-mono text-[10px] text-zinc-400 transition-colors hover:text-zinc-900"
                        >
                            exit
                        </Link>
                    </div>
                    {/* view switch lives centered over the canvas, like a zoom control */}
                    <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
                        <div className="grid grid-flow-col overflow-hidden rounded-md border border-black/10">
                            {([true, false] as const).map((fit) => (
                                <button
                                    key={String(fit)}
                                    type="button"
                                    title={fit ? 'fit the whole section (Z)' : 'real 100% scroll view (Z)'}
                                    onClick={() => setMockWide(fit)}
                                    className={cn(
                                        'px-2.5 py-1 font-mono text-[10px] transition-colors',
                                        mockWide === fit
                                            ? cn('bg-[#0d99ff]/10 font-medium', accentText)
                                            : 'bg-black/[0.02] text-zinc-500 hover:text-zinc-800',
                                    )}
                                >
                                    {fit ? 'fit' : '100%'}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            title="fullscreen preview — hides all chrome (F)"
                            onClick={() => {
                                setSelection(null);
                                setFullscreen(true);
                            }}
                            className="rounded-md border border-black/10 px-2 py-[3px] font-mono text-[11px] leading-none text-zinc-500 transition-colors hover:border-black/25 hover:text-zinc-900"
                        >
                            ⛶
                        </button>
                        {mockWide && (
                            <span className="font-mono text-[10px] tabular-nums text-zinc-400">
                                {MOCK_WIDTH} × {sectionPx} · {Math.round(mockScale * 100)}%
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <FlashButton
                            label="copy jsx"
                            title="copy the whole visible stack as a ready-to-paste JSX section"
                            onAction={async () => {
                                await navigator.clipboard.writeText(code);
                                return 'jsx ✓';
                            }}
                        />
                        <FlashButton
                            label="copy figma svg"
                            title="copies an SVG snapshot at the current progress — paste directly into Figma (⌘V)"
                            onAction={async () => {
                                const result = buildExport();
                                if (!result) return null;
                                await navigator.clipboard.writeText(result.svg);
                                return `svg @ ${result.t.toFixed(2)} ✓`;
                            }}
                        />
                        <FlashButton
                            label="⤓"
                            title="download the same snapshot as .svg"
                            onAction={() => {
                                const result = buildExport();
                                if (!result) return null;
                                const url = URL.createObjectURL(new Blob([result.svg], { type: 'image/svg+xml' }));
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'wave-composition.svg';
                                a.click();
                                URL.revokeObjectURL(url);
                                return '✓';
                            }}
                        />
                    </div>
                </header>
            )}

            {/* ------------------------------- layers panel ------------------------------ */}
            {chrome && (
                <aside
                    data-lenis-prevent
                    className={cn('fixed bottom-0 left-0 z-40 hidden w-[224px] overflow-hidden border-r lg:block', panelCls)}
                    style={{ top: TOOLBAR_H }}
                >
                    <LayersPanel
                        layers={layers}
                        activeId={activeId}
                        hoveredLayerId={hoveredLayerId}
                        onSelect={selectTarget}
                        onToggleVisible={toggleVisible}
                        onMove={moveLayer}
                        onRemove={removeLayer}
                        onRename={renameLayer}
                        onHover={setHoveredLayerId}
                        onAdd={addLayer}
                    />
                </aside>
            )}

            {/* -------------------------------- inspector -------------------------------- */}
            {chrome && (
                <aside
                    data-lenis-prevent
                    className={cn('fixed bottom-0 right-0 z-40 hidden w-[288px] flex-col overflow-hidden border-l lg:flex', panelCls)}
                    style={{ top: TOOLBAR_H }}
                >
                    <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 py-2">
                        <span className="font-mono text-[11px] font-medium text-zinc-800">
                            {active ? active.name : 'page'}
                        </span>
                        {active && (
                            <span className="rounded border border-black/15 px-1 font-mono text-[9px] text-zinc-500">
                                {active.mode}
                            </span>
                        )}
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {active ? (
                            <LayerInspector
                                layer={active}
                                palette={palette}
                                selection={selection}
                                onSelection={setSelection}
                                onion={onion}
                                onOnion={setOnion}
                                patch={patch}
                                patchEdge={patchEdge}
                            />
                        ) : (
                            <PageInspector
                                palette={palette}
                                onApplyPalette={applyPalette}
                                pageBg={pageBg}
                                onPageBg={setPageBg}
                                sectionPx={sectionPx}
                                onSectionPx={setSectionPx}
                                bleedX={bleedX}
                                onBleedX={setBleedX}
                                grainOn={grainOn}
                                onGrainOn={setGrainOn}
                                spaceBefore={spaceBefore}
                                onSpaceBefore={setSpaceBefore}
                                spaceAfter={spaceAfter}
                                onSpaceAfter={setSpaceAfter}
                                code={code}
                            />
                        )}
                    </div>
                </aside>
            )}

            {/* --------------------------------- timeline -------------------------------- */}
            {chrome && (
                <footer
                    // docked between the two panels — the canvas above stays completely clear
                    className={cn(
                        'fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t px-4 lg:left-[224px] lg:right-[288px]',
                        panelCls,
                    )}
                    style={{ height: TIMELINE_H }}
                >
                    {mockWide && (
                        <button
                            type="button"
                            title={playing ? 'pause (space)' : 'play the scroll pass (space)'}
                            onClick={() => {
                                setSelection(null);
                                setPlaying((v) => !v);
                            }}
                            className={cn(
                                'flex size-6 items-center justify-center rounded-full border text-[10px] transition-colors',
                                playing
                                    ? cn('border-[#0d99ff]/50 bg-[#0d99ff]/10', accentText)
                                    : 'border-black/10 text-zinc-600 hover:border-black/25 hover:text-zinc-900',
                            )}
                        >
                            {playing ? '❚❚' : '▶'}
                        </button>
                    )}
                    <span className="font-mono text-[10px] text-zinc-400">t</span>
                    <span ref={tLabelRef} className="w-8 font-mono text-[11px] tabular-nums text-zinc-800">
                        {scrubT.toFixed(2)}
                    </span>
                    <input
                        ref={scrubberRef}
                        type="range"
                        min={0}
                        max={100}
                        step={0.5}
                        defaultValue={0}
                        onChange={(e) => scrubTo(Number(e.target.value))}
                        className={cn(sliderCls, 'flex-1')}
                        style={{ background: sliderFill(0) }}
                    />
                    {/* keyframe edit status lives in the docked bar — never on the canvas */}
                    {selection && active && (
                        <div className="flex min-w-0 items-center gap-2 font-mono text-[10px]">
                            <span className="truncate text-zinc-500">
                                editing keyframe {selection.index + 1}
                                {active.mode === 'band' ? ` · ${selection.edge}` : ''} · {active.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelection(null)}
                                className={cn('shrink-0 transition-opacity hover:opacity-80', accentText)}
                            >
                                done
                            </button>
                        </div>
                    )}
                </footer>
            )}

            {/* fullscreen preview: a single quiet affordance at the top to get the chrome back */}
            {fullscreen && (
                <button
                    type="button"
                    title="back to the editor (Esc)"
                    onClick={() => setFullscreen(false)}
                    className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 font-mono text-[11px] text-zinc-600 shadow-lg backdrop-blur transition-colors hover:text-zinc-900"
                >
                    <span>⛶</span>
                    <span>back</span>
                </button>
            )}
        </div>
    );
}
