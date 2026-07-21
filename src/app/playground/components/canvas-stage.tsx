'use client';

import type { WaveConfig } from '@threeaio/smooth-waves';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useActiveLayer, useComposer, useComposerDispatch } from '../composer-context';
import { MOCK_WIDTH } from '../defaults';
import { layerContains } from '../hit-test';
import { useView } from '../view-context';
import { CurveOverlay, type OverlayEdge } from './curve-overlay';
import { Grain } from './grain';
import { OutlineOverlay } from './outline-overlay';
import { PreviewLayers } from './preview-layers';

/**
 * The artboard between the docked chrome: the layer stack framed like a
 * device viewport, plus every canvas interaction — click-select with deep
 * select, hover highlighting, and the pen-tool overlay for pinned keyframes.
 */
export function CanvasStage() {
    const { layers, activeId, selection, pageBg, sectionPx, bleedX, grainOn, spaceBefore, spaceAfter } = useComposer();
    const active = useActiveLayer();
    const dispatch = useComposerDispatch();
    const { mockWide, chrome, fit, layerT, setHoveredLayerId, onion, sectionRef, viewport } = useView();

    // ghosts + handles only for the active layer — all layers at once would be chaos
    const overlayEdges = useMemo<OverlayEdge[]>(() => {
        if (!active) return [];
        const updateConfig = (edge: 'wave' | 'top' | 'bottom', i: number, config: WaveConfig) =>
            dispatch({ type: 'keyframe/update', edge, index: i, config });
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
    }, [active, dispatch]);

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
            dispatch({ type: 'select', id: 'page' });
            return;
        }
        // click selects the topmost shape; clicking again drills to the next one below (deep select)
        const i = hits.indexOf(activeId);
        dispatch({ type: 'select', id: hits[(i + 1) % hits.length] });
    };

    const deselectToPage = (e: React.MouseEvent<HTMLElement>) => {
        if (e.target === e.currentTarget) dispatch({ type: 'select', id: 'page' });
    };

    return (
        <>
            <main onClick={deselectToPage}>
                <div
                    onClick={deselectToPage}
                    style={
                        mockWide
                            ? { height: fit.mockContentH * fit.mockScale, paddingTop: fit.mockOffsetY }
                            : {
                                  paddingTop: chrome ? fit.topH + fit.margin : 0,
                                  paddingBottom: chrome ? fit.bottomH + fit.margin : 0,
                              }
                    }
                >
                    <div
                        // framed like a device/artboard — the ARTWORK clips inside the frame
                        // (see below), while overlays and handles may overflow into the clear
                        // editor canvas around it
                        className={cn('relative', chrome && 'ring-1 ring-ed-border', mockWide && chrome && 'shadow-2xl')}
                        style={
                            mockWide
                                ? {
                                      width: MOCK_WIDTH,
                                      transform: `scale(${fit.mockScale})`,
                                      transformOrigin: 'top left',
                                      marginLeft: fit.mockOffsetX,
                                      backgroundColor: pageBg,
                                  }
                                : { width: fit.scrollW, marginLeft: fit.scrollOffsetX, backgroundColor: pageBg }
                        }
                    >
                        {spaceBefore && <div className="h-[80vh]" />}

                        <div ref={sectionRef} className="relative" style={{ height: `${sectionPx}px` }}>
                            {!mockWide && chrome && (
                                <div className="absolute inset-x-0 top-0 z-10 border-t border-dashed border-white/20 px-4 md:px-16">
                                    <span className="text-3xs text-white/50">wave section — start</span>
                                </div>
                            )}
                            {/* the artwork clips at the frame like a real viewport — the bleed
                                overscan is cropped here, NOT further out at the editor panels */}
                            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                                <PreviewLayers />
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
                            {chrome && <OutlineOverlay />}
                            {/* handle overlay spans the same bleed-wide rect as the artwork —
                                ghost curves and handles land exactly on the rendered curves,
                                and the edge anchors stay visible just outside the frame */}
                            {chrome && active && (
                                <div className="absolute inset-y-0" style={{ left: `-${bleedX}%`, right: `-${bleedX}%` }}>
                                    <CurveOverlay
                                        edges={overlayEdges}
                                        selection={selection}
                                        onSelect={(selection) => dispatch({ type: 'selection/set', selection })}
                                        // no pin yet → all keyframes show as labeled ghosts, so picking
                                        // one to edit happens right on the canvas; while pinned the
                                        // onion toggle decides
                                        showGhosts={onion || !selection}
                                        scale={mockWide ? fit.mockScale : 1}
                                    />
                                </div>
                            )}
                            {!mockWide && chrome && (
                                <div className="absolute inset-x-0 bottom-0 z-10 border-b border-dashed border-white/20 px-4 md:px-16">
                                    <span className="text-3xs text-white/50">wave section — end</span>
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
                            ? `inset(0 ${Math.max(0, viewport.w - fit.scrollOffsetX - fit.scrollW)}px 0 ${fit.scrollOffsetX}px)`
                            : undefined
                    }
                />
            )}
        </>
    );
}
