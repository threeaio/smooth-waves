'use client';

import {
    sampleConfig,
    Wave,
    WaveBand,
    type WaveAnimation,
    type WaveBandAnimation,
} from '@threeaio/smooth-waves';
import { useMemo } from 'react';
import { useComposer } from '../composer-context';
import type { EdgeState, LayerState } from '../defaults';
import { effectiveCurveAmount } from '../figma-export';
import { useView } from '../view-context';

/**
 * The rendered layer stack (plus the per-layer dissolve filter defs). Owns the
 * remount-via-key strategy: motion's useScroll reads `offset` at hook setup, so
 * anything that shifts the section in the document remounts the affected layer.
 * Only the active layer gets pinned while editing — the rest keeps animating.
 */
export function PreviewLayers() {
    const { layers, activeId, selection, sectionPx, bleedX, spaceBefore, spaceAfter } = useComposer();
    const { mockWide, virtualProgress } = useView();

    const rendered = useMemo(() => {
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

    return (
        <>
            {/* grainy-dissolve filters (per layer): dense fractal noise displaces
                the soft edge's pixels into speckle, then the original blends back
                underneath — soft falloff + grain, solid core stays solid */}
            <svg width={0} height={0} aria-hidden className="absolute">
                <defs>
                    {layers
                        .filter((l) => l.visible && l.dissolve > 0)
                        .map((l) => (
                            <filter key={l.id} id={`dissolve-${l.id}`} colorInterpolationFilters="sRGB">
                                <feTurbulence
                                    type="fractalNoise"
                                    // grain size scales the noise frequency inversely —
                                    // 1 = per-pixel speckle, higher = coarser clumps
                                    baseFrequency={(0.9713 / Math.max(1, l.dissolveSize)).toFixed(4)}
                                    numOctaves="4"
                                />
                                <feDisplacementMap in="SourceGraphic" scale={l.dissolve} xChannelSelector="R" />
                                <feBlend in2="SourceGraphic" />
                            </filter>
                        ))}
                </defs>
            </svg>
            {rendered}
        </>
    );
}
