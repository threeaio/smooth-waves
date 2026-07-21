'use client';

import { useMemo } from 'react';
import { useActiveLayer, useComposer } from '../composer-context';
import { layerOutlines } from '../hit-test';
import { useView } from '../view-context';

/** Hover: bold dashed outline · selected: solid accent outline — at the layers' current progress. */
export function OutlineOverlay() {
    const { layers, selection, bleedX } = useComposer();
    const active = useActiveLayer();
    const { hoveredLayerId, layerT, mockWide } = useView();

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

    if (outlineCurves.length === 0) return null;
    return (
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
                            stroke={kind === 'hover' ? '#fff' : 'rgb(var(--ed-accent))'}
                            strokeWidth={2}
                            strokeDasharray={kind === 'hover' ? '8 6' : undefined}
                            vectorEffect="non-scaling-stroke"
                        />
                    </g>
                ))}
            </svg>
        </div>
    );
}
