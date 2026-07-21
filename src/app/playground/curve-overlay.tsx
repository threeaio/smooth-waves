'use client';

import { type WaveConfig } from '@threeaio/smooth-waves';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

export type EdgeKey = 'wave' | 'top' | 'bottom';

export interface Selection {
    edge: EdgeKey;
    index: number;
}

export interface OverlayEdge {
    edge: EdgeKey;
    configs: WaveConfig[];
    /** Mirrors anchor y only — matching the package, y-offsets are NOT flipped. */
    flip?: boolean;
    /** Ghost styling to tell band edges apart. */
    dashed?: boolean;
    onChange: (index: number, config: WaveConfig) => void;
}

const clamp = (min: number, max: number, value: number): number => Math.min(max, Math.max(min, value));
const round = (n: number): number => Math.round(n * 100) / 100;

/**
 * One system color per keyframe step — the ghost curve and its panel chip share
 * the color so the steps are immediately matchable. Green is reserved for the
 * active/selected keyframe.
 */
export const KEYFRAME_COLORS = ['#7dd3fc', '#fbbf24', '#c4b5fd', '#fb7185', '#fdba74', '#f9a8d4'] as const;

export const keyframeColor = (index: number): string => KEYFRAME_COLORS[index % KEYFRAME_COLORS.length];

interface Geometry {
    ly: number;
    ry: number;
    lcx: number;
    lcy: number;
    rcx: number;
    rcy: number;
}

function geometry(config: WaveConfig, w: number, h: number, flip?: boolean): Geometry {
    const ly = (flip ? 1 - config.left[0] : config.left[0]) * h;
    const ry = (flip ? 1 - config.right[0] : config.right[0]) * h;
    return {
        ly,
        ry,
        lcx: config.left[1] * w,
        lcy: ly + config.left[2] * h,
        rcx: w - config.right[1] * w,
        rcy: ry + config.right[2] * h,
    };
}

function curvePath(g: Geometry, w: number): string {
    return `M 0 ${g.ly} C ${g.lcx} ${g.lcy}, ${g.rcx} ${g.rcy}, ${w} ${g.ry}`;
}

type DragKind = 'anchorL' | 'anchorR' | 'ctrlL' | 'ctrlR';

/**
 * Onion-skin + edit overlay for the wave preview: every keyframe is drawn as a
 * clickable ghost curve; the selected keyframe gets draggable anchors (edge y)
 * and bezier control handles (x/y-offset), pen-tool style.
 */
export function CurveOverlay({
    edges,
    selection,
    onSelect,
    showGhosts,
    scale = 1,
}: {
    edges: OverlayEdge[];
    selection: Selection | null;
    onSelect: (selection: Selection | null) => void;
    /** Onion-skin toggle — when off, only the pinned keyframe's curve + handles render. */
    showGhosts: boolean;
    /** The preview's on-screen scale (fit view) — handles/labels compensate so they keep their screen size. */
    scale?: number;
}) {
    // everything hand-sized is specified in screen px and blown up by 1/scale
    const k = 1 / scale;
    const svgRef = useRef<SVGSVGElement>(null);
    const dragRef = useRef<DragKind | null>(null);
    const [size, setSize] = useState({ w: 0, h: 0 });

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        const resize = () => setSize({ w: svg.clientWidth, h: svg.clientHeight });
        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(svg);
        return () => observer.disconnect();
    }, []);

    const { w, h } = size;
    const selectedEdge = selection ? edges.find((e) => e.edge === selection.edge) : undefined;
    const selectedConfig = selectedEdge?.configs[selection!.index];

    const onDragMove = (e: React.PointerEvent) => {
        const kind = dragRef.current;
        const svg = svgRef.current;
        if (!kind || !svg || !selection || !selectedEdge || !selectedConfig) return;

        const rect = svg.getBoundingClientRect();
        // map screen px into the svg's layout space — the preview may be scaled
        // down by the zoom-out mock, so rect and clientWidth can differ
        const px = (e.clientX - rect.left) * (w / rect.width);
        const py = (e.clientY - rect.top) * (h / rect.height);
        const flip = selectedEdge.flip;

        const next: WaveConfig = {
            left: [...selectedConfig.left] as WaveConfig['left'],
            right: [...selectedConfig.right] as WaveConfig['right'],
        };
        if (kind === 'anchorL') {
            next.left[0] = round(clamp(0, 1, flip ? 1 - py / h : py / h));
        } else if (kind === 'anchorR') {
            next.right[0] = round(clamp(0, 1, flip ? 1 - py / h : py / h));
        } else if (kind === 'ctrlL') {
            const anchorY = (flip ? 1 - next.left[0] : next.left[0]) * h;
            next.left[1] = round(clamp(0, 1, px / w));
            next.left[2] = round(clamp(-1, 1, (py - anchorY) / h));
        } else {
            const anchorY = (flip ? 1 - next.right[0] : next.right[0]) * h;
            next.right[1] = round(clamp(0, 1, (w - px) / w));
            next.right[2] = round(clamp(-1, 1, (py - anchorY) / h));
        }
        selectedEdge.onChange(selection.index, next);
    };

    const startDrag = (kind: DragKind) => (e: React.PointerEvent) => {
        dragRef.current = kind;
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
    };
    const endDrag = (e: React.PointerEvent) => {
        dragRef.current = null;
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    };

    const g = selectedConfig && w > 0 ? geometry(selectedConfig, w, h, selectedEdge?.flip) : null;

    const handleProps = (kind: DragKind) => ({
        onPointerDown: startDrag(kind),
        onPointerMove: onDragMove,
        onPointerUp: endDrag,
        className: cn(
            'pointer-events-auto touch-none',
            kind.startsWith('anchor')
                ? 'cursor-ns-resize fill-white stroke-[#0d99ff]'
                : 'cursor-move fill-[#0d99ff]',
        ),
    });

    return (
        <div aria-hidden={false} className="pointer-events-none absolute inset-0 z-20">
            <svg ref={svgRef} className="size-full overflow-visible">
                {/* onion-skin ghosts: schematic system rendering — one color, thin,
                    dashed (band edges get different dash patterns), no artwork styling */}
                {w > 0 &&
                    edges.map((edge) =>
                        edge.configs.map((config, i) => {
                            const isSelected = selection?.edge === edge.edge && selection.index === i;
                            if (!isSelected && !showGhosts) return null;
                            const eg = geometry(config, w, h, edge.flip);
                            const d = curvePath(eg, w);
                            const color = keyframeColor(i);
                            return (
                                <g key={`${edge.edge}-${i}`}>
                                    <path
                                        d={d}
                                        fill="none"
                                        className={cn(isSelected && 'stroke-[#0d99ff]')}
                                        style={isSelected ? undefined : { stroke: color }}
                                        strokeDasharray={
                                            isSelected ? undefined : edge.dashed ? `${2 * k} ${5 * k}` : `${7 * k} ${5 * k}`
                                        }
                                        strokeWidth={(isSelected ? 2 : 1) * k}
                                    />
                                    {/* invisible fat hit path — click to select/deselect */}
                                    <path
                                        d={d}
                                        fill="none"
                                        stroke="transparent"
                                        strokeWidth={18 * k}
                                        className="pointer-events-auto cursor-pointer"
                                        style={{ pointerEvents: 'stroke' }}
                                        onClick={() => onSelect(isSelected ? null : { edge: edge.edge, index: i })}
                                    />
                                    <text
                                        x={10 * k}
                                        y={eg.ly - 8 * k}
                                        className={cn(
                                            'pointer-events-auto cursor-pointer select-none font-mono',
                                            isSelected && 'fill-[#0d99ff]',
                                        )}
                                        style={{ fontSize: 11 * k, ...(isSelected ? {} : { fill: color }) }}
                                        onClick={() => onSelect(isSelected ? null : { edge: edge.edge, index: i })}
                                    >
                                        {edges.length > 1 ? `${edge.edge} ${i + 1}` : i + 1}
                                    </text>
                                </g>
                            );
                        }),
                    )}

                {/* handles for the selected keyframe */}
                {g && (
                    <g>
                        <line
                            x1={0}
                            y1={g.ly}
                            x2={g.lcx}
                            y2={g.lcy}
                            className="stroke-[#0d99ff]/50"
                            strokeDasharray={`${3 * k} ${3 * k}`}
                            strokeWidth={k}
                        />
                        <line
                            x1={w}
                            y1={g.ry}
                            x2={g.rcx}
                            y2={g.rcy}
                            className="stroke-[#0d99ff]/50"
                            strokeDasharray={`${3 * k} ${3 * k}`}
                            strokeWidth={k}
                        />
                        <circle cx={g.lcx} cy={g.lcy} r={6 * k} {...handleProps('ctrlL')} />
                        <circle cx={g.rcx} cy={g.rcy} r={6 * k} {...handleProps('ctrlR')} />
                        <circle cx={0} cy={g.ly} r={8 * k} strokeWidth={2 * k} {...handleProps('anchorL')} />
                        <circle cx={w} cy={g.ry} r={8 * k} strokeWidth={2 * k} {...handleProps('anchorR')} />
                    </g>
                )}
            </svg>
        </div>
    );
}
