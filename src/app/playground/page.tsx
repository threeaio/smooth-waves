'use client';

import { Wave, WaveBand, type WaveAnimation, type WaveBandAnimation, type WaveConfig } from '@threeaio/smooth-waves';
import { CopyButton } from '@/components/copy-button';
import { cn } from '@/lib/utils';
import { CurveOverlay, keyframeColor, type OverlayEdge, type Selection } from './curve-overlay';
import { buildFigmaSvg, layerProgress, normalizeColor } from './figma-export';
import Link from 'next/link';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

type FeatheredOut = 'none' | 'top' | 'bottom' | 'both';
type Mode = 'wave' | 'band';

interface EdgeState {
    strokeStyle: string;
    strokeWidth: number;
    curveAmount: number;
    offsetLeft: number;
    offsetRight: number;
    configs: WaveConfig[];
}

interface LayerState {
    id: string;
    name: string;
    mode: Mode; // fixed at creation
    visible: boolean;
    fill: string;
    featheredOut: FeatheredOut;
    debug: boolean;
    scrollStart: string;
    scrollEnd: string;
    // Wave
    strokeStyle: string;
    strokeWidth: number;
    flip: boolean;
    curveAmount: number;
    offsetLeft: number;
    offsetRight: number;
    configs: WaveConfig[];
    // WaveBand
    top: EdgeState;
    bottom: EdgeState;
}

const layerTemplate: Omit<LayerState, 'id' | 'name' | 'mode' | 'visible'> = {
    // clearly visible against the page bg (hsl(160 10% ~12%)) — the lab should show, not hint
    fill: 'hsl(160 12% 32%)',
    featheredOut: 'none',
    debug: false,
    scrollStart: 'start end',
    scrollEnd: 'end start',
    strokeStyle: 'rgba(255,255,255,0.2)',
    strokeWidth: 1,
    flip: false,
    curveAmount: 2,
    offsetLeft: -8,
    offsetRight: -42,
    configs: [
        {
            left: [0.3, 0.2, 0.2],
            right: [0.2, 0.4, -0.1],
        },
        {
            left: [0.6, 0.2, 0.4],
            right: [0.2, 0.6, -0.2],
        },
        {
            left: [0.9, 0.6, 0.2],
            right: [0.3, 0.4, -0.4],
        },
    ],
    top: {
        strokeStyle: 'rgba(255,255,255,0.2)',
        strokeWidth: 1,
        curveAmount: 2,
        offsetLeft: -8,
        offsetRight: -24,
        configs: [
            {
                left: [0.35, 0.3, 0.2],
                right: [0.5, 0.3, -0.2],
            },
            {
                left: [0.6, 0.3, -0.2],
                right: [0.4, 0.4, 0.2],
            },
        ],
    },
    bottom: {
        strokeStyle: 'rgba(255,255,255,0.2)',
        strokeWidth: 1,
        curveAmount: 0,
        offsetLeft: 8,
        offsetRight: 24,
        configs: [
            {
                left: [0.55, 0.3, 0.3],
                right: [0.7, 0.4, -0.1],
            },
            {
                left: [0.85, 0.3, -0.1],
                right: [0.65, 0.3, 0.2],
            },
        ],
    },
};

function createLayer(mode: Mode, n: number): LayerState {
    return {
        ...structuredClone(layerTemplate),
        id: `layer-${n}`,
        name: `${mode} ${n}`,
        mode,
        visible: true,
        // bands float over other layers — a translucent contrast fill shows the stacking
        ...(mode === 'band' ? { fill: 'hsl(20 40% 45% / 0.5)' } : {}),
    };
}

// two layers out of the box so the stacking is visible immediately
const initialLayers = [createLayer('wave', 1), createLayer('band', 2)];

const scrollPresets: Array<{ label: string; start: string; end: string }> = [
    { label: 'start end → end start (full pass)', start: 'start end', end: 'end start' },
    { label: 'start start → end end (while pinned)', start: 'start start', end: 'end end' },
    { label: '5% 0% → 150% 80% (hero)', start: '5% 0%', end: '150% 80%' },
    { label: 'start 80% → end 30% (content)', start: 'start 80%', end: 'end 30%' },
];

/* ---------------------------------- code output --------------------------------- */

const WAVE_DEFAULTS = {
    strokeStyle: '#fff',
    strokeWidth: 0.4,
    curveAmount: 1,
    offsetLeft: 0,
    offsetRight: 0,
} as const;

// WaveBand edges default curveAmount to 0 (no hairline trap)
const EDGE_DEFAULTS = {
    strokeStyle: '#fff',
    strokeWidth: 0.4,
    curveAmount: 0,
    offsetLeft: 0,
    offsetRight: 0,
} as const;

function round(n: number): number {
    return Math.round(n * 100) / 100;
}

const clamp = (min: number, max: number, value: number): number => Math.min(max, Math.max(min, value));

function configLines(configs: WaveConfig[]): string[] {
    const lines: string[] = ['configs: ['];
    for (const c of configs) {
        lines.push(`    {`);
        lines.push(`        left: [${c.left.map(round).join(', ')}],`);
        lines.push(`        right: [${c.right.map(round).join(', ')}],`);
        lines.push(`    },`);
    }
    lines.push('],');
    return lines;
}

/** Serialize one wave layer as a ready-to-paste `<Wave />` snippet, omitting defaults. */
function toWaveSnippet(s: LayerState): string {
    const lines: string[] = [];
    lines.push(`fill: '${s.fill}',`);
    if (s.strokeStyle !== WAVE_DEFAULTS.strokeStyle) lines.push(`strokeStyle: '${s.strokeStyle}',`);
    if (s.strokeWidth !== WAVE_DEFAULTS.strokeWidth) lines.push(`strokeWidth: ${round(s.strokeWidth)},`);
    if (s.curveAmount !== WAVE_DEFAULTS.curveAmount) lines.push(`curveAmount: ${s.curveAmount},`);
    if (s.offsetLeft !== WAVE_DEFAULTS.offsetLeft) lines.push(`offsetLeft: ${s.offsetLeft},`);
    if (s.offsetRight !== WAVE_DEFAULTS.offsetRight) lines.push(`offsetRight: ${s.offsetRight},`);
    if (s.flip) lines.push(`flip: true,`);
    if (s.featheredOut !== 'none') lines.push(`featheredOut: '${s.featheredOut}',`);
    if (s.debug) lines.push(`debug: true,`);
    lines.push(...configLines(s.configs));
    lines.push(`scrollOffset: ['${s.scrollStart}', '${s.scrollEnd}'],`);

    const body = lines.map((l) => `        ${l}`).join('\n');
    return `<Wave\n    waveConfig={{\n${body}\n    }}\n/>`;
}

function edgeLines(name: 'top' | 'bottom', e: EdgeState): string[] {
    const lines: string[] = [`${name}: {`];
    if (e.strokeStyle !== EDGE_DEFAULTS.strokeStyle && e.curveAmount > 0)
        lines.push(`    strokeStyle: '${e.strokeStyle}',`);
    if (e.strokeWidth !== EDGE_DEFAULTS.strokeWidth && e.curveAmount > 0)
        lines.push(`    strokeWidth: ${round(e.strokeWidth)},`);
    if (e.curveAmount !== EDGE_DEFAULTS.curveAmount) lines.push(`    curveAmount: ${e.curveAmount},`);
    if (e.offsetLeft !== EDGE_DEFAULTS.offsetLeft && e.curveAmount > 0) lines.push(`    offsetLeft: ${e.offsetLeft},`);
    if (e.offsetRight !== EDGE_DEFAULTS.offsetRight && e.curveAmount > 0)
        lines.push(`    offsetRight: ${e.offsetRight},`);
    lines.push(...configLines(e.configs).map((l) => `    ${l}`));
    lines.push('},');
    return lines;
}

/** Serialize one band layer as a ready-to-paste `<WaveBand />` snippet, omitting defaults. */
function toBandSnippet(s: LayerState): string {
    const lines: string[] = [];
    lines.push(`fill: '${s.fill}',`);
    if (s.featheredOut !== 'none') lines.push(`featheredOut: '${s.featheredOut}',`);
    if (s.debug) lines.push(`debug: true,`);
    lines.push(...edgeLines('top', s.top));
    lines.push(...edgeLines('bottom', s.bottom));
    lines.push(`scrollOffset: ['${s.scrollStart}', '${s.scrollEnd}'],`);

    const body = lines.map((l) => `        ${l}`).join('\n');
    return `<WaveBand\n    waveConfig={{\n${body}\n    }}\n/>`;
}

/** The whole visible stack as one section snippet, in paint order. */
function toStackSnippet(layers: LayerState[], sectionVh: number): string {
    const parts = layers
        .filter((l) => l.visible)
        .map((l) => {
            const snippet = l.mode === 'wave' ? toWaveSnippet(l) : toBandSnippet(l);
            const indented = snippet
                .split('\n')
                .map((line) => `    ${line}`)
                .join('\n');
            return `    {/* ${l.name} */}\n${indented}`;
        });
    return `<div className="relative h-[${sectionVh}vh]">\n${parts.join('\n')}\n</div>`;
}

/* --------------------------------- control atoms --------------------------------- */

function Section({
    title,
    open,
    onToggle,
    children,
}: {
    title: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <section className="border-b border-ui-border/40">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between px-5 py-4 text-[11px] uppercase tracking-[0.2em]"
            >
                <span className={open ? 'opacity-90' : 'opacity-60'}>{title}</span>
                <span className={cn('text-xs opacity-50 transition-transform', open && 'rotate-90')}>▸</span>
            </button>
            {open && <div className="flex flex-col gap-3 px-5 pb-5">{children}</div>}
        </section>
    );
}

function SliderRow({
    label,
    value,
    min,
    max,
    step,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}) {
    return (
        <label className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2 text-xs">
            <span className="opacity-80">{label}</span>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="accent-3a-green h-1 w-full cursor-pointer"
            />
            <span className="text-right font-mono tabular-nums">{round(value)}</span>
        </label>
    );
}

/** Normalize any CSS color (hsl, rgba, named, …) to #rrggbb for the color input's swatch. */
function toSwatchHex(value: string): string {
    return normalizeColor(value).hex;
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    const hex = toSwatchHex(value);
    return (
        <label className="grid grid-cols-[5.5rem_1.5rem_1fr] items-center gap-2 text-xs">
            <span className="opacity-80">{label}</span>
            <input
                type="color"
                value={hex}
                onChange={(e) => onChange(e.target.value)}
                // SSR can't resolve CSS colors (no canvas) and renders the fallback swatch
                suppressHydrationWarning
                className="size-6 cursor-pointer rounded border border-ui-border/60 bg-transparent"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
                className="w-full rounded border border-ui-border/60 bg-black-washed px-2 py-1 font-mono text-xs"
            />
        </label>
    );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
    return (
        <label className="flex cursor-pointer items-center justify-between text-xs">
            <span className="opacity-80">{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative h-5 w-9 rounded-full border border-ui-border/60 transition-colors',
                    checked ? 'bg-3a-green/80' : 'bg-black-washed',
                )}
            >
                <span
                    className={cn(
                        'absolute top-0.5 size-3.5 rounded-full bg-white-washed transition-all',
                        checked ? 'left-[1.15rem]' : 'left-0.5',
                    )}
                />
            </button>
        </label>
    );
}

function Segmented<T extends string>({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: readonly T[];
    value: T;
    onChange: (value: T) => void;
}) {
    return (
        <div className="flex flex-col gap-1.5 text-xs">
            <span className="opacity-80">{label}</span>
            <div className="grid grid-flow-col gap-px overflow-hidden rounded border border-ui-border/60">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={cn(
                            'px-2 py-1.5 text-xs uppercase transition-colors',
                            option === value ? 'bg-3a-green/20 text-3a-green' : 'bg-black-washed opacity-75',
                        )}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ------------------------------------- layers ------------------------------------- */

const iconBtn =
    'flex size-6 items-center justify-center rounded text-[10px] opacity-60 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-15';

function LayerRow({
    layer,
    isActive,
    isFront,
    isBack,
    canRemove,
    onActivate,
    onToggleVisible,
    onMoveForward,
    onMoveBackward,
    onRemove,
}: {
    layer: LayerState;
    isActive: boolean;
    isFront: boolean;
    isBack: boolean;
    canRemove: boolean;
    onActivate: () => void;
    onToggleVisible: () => void;
    onMoveForward: () => void;
    onMoveBackward: () => void;
    onRemove: () => void;
}) {
    return (
        <div
            className={cn(
                'flex items-center gap-0.5 rounded border px-2 py-0.5 text-xs transition-colors',
                isActive ? 'border-3a-green/70 bg-3a-green/10' : 'border-ui-border/40',
                !layer.visible && 'opacity-40',
            )}
        >
            <button
                type="button"
                onClick={onActivate}
                className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
            >
                <span className="truncate font-mono">{layer.name}</span>
                <span
                    className={cn(
                        'rounded-sm border px-1 text-[9px] uppercase tracking-wider',
                        isActive ? 'border-3a-green/50 text-3a-green' : 'border-ui-border/60 opacity-60',
                    )}
                >
                    {layer.mode}
                </span>
            </button>
            <button type="button" title="toggle visibility" onClick={onToggleVisible} className={iconBtn}>
                {layer.visible ? '●' : '○'}
            </button>
            <button type="button" title="bring forward" disabled={isFront} onClick={onMoveForward} className={iconBtn}>
                ▲
            </button>
            <button type="button" title="send backward" disabled={isBack} onClick={onMoveBackward} className={iconBtn}>
                ▼
            </button>
            <button
                type="button"
                title="delete layer"
                disabled={!canRemove}
                onClick={onRemove}
                className={cn(iconBtn, 'text-3a-red')}
            >
                ✕
            </button>
        </div>
    );
}

/** Copy/download the visible stack as SVG at the current scroll position — pasteable straight into Figma. */
function FigmaExportButtons({ build }: { build: () => { svg: string; t: number } | null }) {
    const [feedback, setFeedback] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const flash = (message: string) => {
        setFeedback(message);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setFeedback(null), 2000);
    };

    const copy = async () => {
        const result = build();
        if (!result) return;
        await navigator.clipboard.writeText(result.svg);
        flash(`copied @ ${result.t.toFixed(2)} ✓`);
    };

    const download = () => {
        const result = build();
        if (!result) return;
        const url = URL.createObjectURL(new Blob([result.svg], { type: 'image/svg+xml' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wave-composition.svg';
        a.click();
        URL.revokeObjectURL(url);
        flash(`saved @ ${result.t.toFixed(2)} ✓`);
    };

    return (
        <div className="grid grid-cols-[1fr_auto] gap-1.5 text-xs">
            <button
                type="button"
                onClick={copy}
                title="copies an SVG snapshot at the current scroll position — paste directly into Figma (⌘V)"
                className={cn(
                    'flex items-center justify-center gap-2 rounded border py-1.5 font-mono uppercase transition-colors',
                    feedback
                        ? 'border-3a-green/70 text-3a-green'
                        : 'border-ui-border/60 opacity-85 hover:border-3a-green/60 hover:text-3a-green hover:opacity-100',
                )}
            >
                {feedback ?? 'copy figma svg'}
            </button>
            <button
                type="button"
                onClick={download}
                title="download the same snapshot as .svg"
                className="rounded border border-ui-border/60 px-2.5 font-mono opacity-85 transition-colors hover:border-3a-green/60 hover:text-3a-green hover:opacity-100"
            >
                ⤓
            </button>
        </div>
    );
}

/* ------------------------------------ keyframes ----------------------------------- */

function NumberField({
    value,
    min,
    max,
    onChange,
}: {
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
}) {
    return (
        <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={0.01}
            onChange={(e) => {
                const v = e.target.valueAsNumber;
                if (!Number.isNaN(v)) onChange(round(clamp(min, max, v)));
            }}
            className="w-full rounded border border-ui-border/60 bg-black-washed px-1.5 py-1 text-center font-mono text-xs tabular-nums"
        />
    );
}

/**
 * Chip strip for one edge's keyframes. Clicking a chip selects (pins) that
 * keyframe for canvas editing; clicking again deselects. `+` duplicates the
 * last keyframe and selects the copy.
 */
function KeyframeChips({
    label,
    edge,
    configs,
    selection,
    onSelect,
    onChange,
}: {
    label?: string;
    edge: Selection['edge'];
    configs: WaveConfig[];
    selection: Selection | null;
    onSelect: (selection: Selection | null) => void;
    onChange: (configs: WaveConfig[]) => void;
}) {
    return (
        <div className="flex items-center gap-2 text-xs">
            {label && <span className="w-14 opacity-80">{label}</span>}
            <div className="flex flex-wrap gap-1.5">
                {configs.map((_, i) => {
                    const isSelected = selection?.edge === edge && selection.index === i;
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onSelect(isSelected ? null : { edge, index: i })}
                            className={cn(
                                'size-7 rounded border font-mono transition-colors',
                                isSelected
                                    ? 'border-3a-green bg-3a-green/20 text-3a-green'
                                    : 'bg-black-washed opacity-90 hover:opacity-100',
                            )}
                            // unselected chips carry their keyframe's system color — same as the ghost curve
                            style={
                                isSelected
                                    ? undefined
                                    : { borderColor: `${keyframeColor(i)}99`, color: keyframeColor(i) }
                            }
                        >
                            {i + 1}
                        </button>
                    );
                })}
                <button
                    type="button"
                    onClick={() => {
                        const last = configs[configs.length - 1];
                        onChange([...configs, { left: [...last.left], right: [...last.right] }]);
                        onSelect({ edge, index: configs.length });
                    }}
                    className="size-7 rounded border border-dashed border-ui-border/60 opacity-70 transition-opacity hover:opacity-100"
                >
                    +
                </button>
            </div>
        </div>
    );
}

/** Numeric fine-tune readout for the selected keyframe — the canvas handles are the primary editor. */
function SelectedKeyframe({
    config,
    count,
    onChange,
    onDuplicate,
    onRemove,
}: {
    config: WaveConfig;
    count: number;
    onChange: (config: WaveConfig) => void;
    onDuplicate: () => void;
    onRemove: () => void;
}) {
    const set = (side: keyof WaveConfig, i: number, v: number) => {
        const next: WaveConfig = { left: [...config.left], right: [...config.right] };
        next[side][i] = v;
        onChange(next);
    };
    const ranges: Array<[number, number]> = [
        [0, 1],
        [0, 1],
        [-1, 1],
    ];
    return (
        <div className="flex flex-col gap-2 rounded-lg border border-3a-green/40 p-3 text-xs">
            <div className="grid grid-cols-[3rem_1fr_1fr_1fr] items-center gap-2">
                <span />
                <span className="text-center opacity-60">y</span>
                <span className="text-center opacity-60">x-off</span>
                <span className="text-center opacity-60">y-off</span>
                {(['left', 'right'] as const).map((side) => (
                    <Fragment key={side}>
                        <span className="opacity-80">{side}</span>
                        {config[side].map((v, i) => (
                            <NumberField
                                key={`${side}-${i}`}
                                value={v}
                                min={ranges[i][0]}
                                max={ranges[i][1]}
                                onChange={(next) => set(side, i, next)}
                            />
                        ))}
                    </Fragment>
                ))}
            </div>
            <div className="flex gap-1.5">
                <button
                    type="button"
                    onClick={onDuplicate}
                    className="rounded border border-ui-border/60 px-2 py-1 text-[11px] uppercase opacity-85 transition-opacity hover:opacity-100"
                >
                    duplicate
                </button>
                <button
                    type="button"
                    disabled={count <= 1}
                    onClick={onRemove}
                    className="rounded border border-ui-border/60 px-2 py-1 text-[11px] uppercase text-3a-red opacity-85 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-20"
                >
                    remove
                </button>
            </div>
        </div>
    );
}

/* ------------------------------------- page --------------------------------------- */

type SectionId = 'scroll' | 'appearance' | 'curves' | 'top' | 'bottom' | 'keyframes' | 'config';

export default function Playground() {
    const [layers, setLayers] = useState<LayerState[]>(initialLayers);
    const [activeLayerId, setActiveLayerId] = useState(initialLayers[0].id);
    const [selection, setSelection] = useState<Selection | null>(null);
    const [onion, setOnion] = useState(false);
    // the composition should read as a real page — its background is part of the design
    const [pageBg, setPageBg] = useState('hsl(160 10% 16%)');
    // fullscreen preview: hides all editor chrome (sidebar, markers, overlay)
    const [fullscreen, setFullscreen] = useState(false);
    // pages may start or end with the waves themselves — the surrounding scroll room is optional
    const [spaceBefore, setSpaceBefore] = useState(true);
    const [spaceAfter, setSpaceAfter] = useState(true);
    // the wave section's height in vh — the main driver of the page's total height
    const [sectionVh, setSectionVh] = useState(150);
    const [openSection, setOpenSection] = useState<SectionId>('keyframes');
    const scrubberRef = useRef<HTMLInputElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const layerCounter = useRef(initialLayers.length + 1);

    const active = layers.find((l) => l.id === activeLayerId) ?? layers[0];

    const patch = (partial: Partial<LayerState>) =>
        setLayers((ls) => ls.map((l) => (l.id === activeLayerId ? { ...l, ...partial } : l)));
    const patchEdge = (edge: 'top' | 'bottom', partial: Partial<EdgeState>) =>
        setLayers((ls) => ls.map((l) => (l.id === activeLayerId ? { ...l, [edge]: { ...l[edge], ...partial } } : l)));

    /* ---- layer management ---- */
    const activateLayer = (id: string) => {
        if (id !== activeLayerId) setSelection(null); // selection always belongs to the active layer
        setActiveLayerId(id);
    };

    const addLayer = (mode: Mode) => {
        const layer = createLayer(mode, layerCounter.current++);
        setLayers((ls) => [...ls, layer]);
        setSelection(null);
        setActiveLayerId(layer.id);
    };

    const removeLayer = (id: string) => {
        if (layers.length <= 1) return;
        const next = layers.filter((l) => l.id !== id);
        setLayers(next);
        if (id === activeLayerId) {
            setSelection(null);
            setActiveLayerId(next[next.length - 1].id);
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

    /* ---- preview ---- */
    // Only the active layer gets pinned while editing — the rest of the stack keeps animating.
    // Per-layer keys remount only the affected component (motion's useScroll reads `offset` at hook setup).
    const previewLayers = useMemo(() => {
        return layers
            .filter((l) => l.visible)
            .map((layer) => {
                const pinned = layer.id === activeLayerId && selection ? selection : null;
                // spacer/height changes shift the section in the document — remount so useScroll re-anchors
                const key = `${layer.id}|${layer.scrollStart}|${layer.scrollEnd}|${spaceBefore}|${spaceAfter}|${sectionVh}|${
                    pinned ? `pin-${pinned.edge}-${pinned.index}` : 'live'
                }`;
                const featheredOut = layer.featheredOut === 'none' ? undefined : layer.featheredOut;
                const scrollOffset = [layer.scrollStart, layer.scrollEnd] as WaveAnimation['scrollOffset'];
                if (layer.mode === 'wave') {
                    const config: WaveAnimation = {
                        fill: layer.fill,
                        strokeStyle: layer.strokeStyle,
                        strokeWidth: layer.strokeWidth,
                        curveAmount: layer.curveAmount,
                        offsetLeft: layer.offsetLeft,
                        offsetRight: layer.offsetRight,
                        flip: layer.flip,
                        debug: layer.debug,
                        featheredOut,
                        // pinned: a single keyframe renders static, so the shape holds still while editing
                        configs: pinned
                            ? [layer.configs[Math.min(pinned.index, layer.configs.length - 1)]]
                            : layer.configs,
                        scrollOffset,
                    };
                    return <Wave key={key} waveConfig={config} />;
                }
                const pin = (e: EdgeState): EdgeState =>
                    pinned ? { ...e, configs: [e.configs[Math.min(pinned.index, e.configs.length - 1)]] } : e;
                const config: WaveBandAnimation = {
                    fill: layer.fill,
                    debug: layer.debug,
                    featheredOut,
                    top: pin(layer.top),
                    bottom: pin(layer.bottom),
                    scrollOffset,
                };
                return <WaveBand key={key} waveConfig={config} />;
            });
    }, [layers, activeLayerId, selection, spaceBefore, spaceAfter, sectionVh]);

    const code = useMemo(() => toStackSnippet(layers, sectionVh), [layers, sectionVh]);

    // ghosts + handles only for the active layer — all layers at once would be chaos
    const overlayEdges = useMemo<OverlayEdge[]>(() => {
        const updateConfig = (edge: 'wave' | 'top' | 'bottom', i: number, config: WaveConfig) =>
            setLayers((ls) =>
                ls.map((l) => {
                    if (l.id !== activeLayerId) return l;
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
    }, [active, activeLayerId]);

    /* ---- figma export ---- */
    const buildExport = (): { svg: string; t: number } | null => {
        const el = sectionRef.current;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const visible = layers.filter((l) => l.visible);
        if (visible.length === 0) return null;
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
        );
        // headline progress for the feedback label: the section's full pass
        const t = layerProgress('start end', 'end start', sectionTop, rect.height, window.innerHeight, window.scrollY);
        return { svg, t };
    };

    // Keep the scrubber in sync with real scrolling without re-rendering on every frame.
    useEffect(() => {
        const onScroll = () => {
            const el = scrubberRef.current;
            if (!el) return;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            el.value = max > 0 ? String(Math.round((window.scrollY / max) * 100)) : '0';
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Allow deep links like /playground?mode=band — activates the first layer of that type.
    useEffect(() => {
        const mode = new URLSearchParams(window.location.search).get('mode');
        if (mode === 'band' || mode === 'wave') {
            const target = initialLayers.find((l) => l.mode === mode);
            if (target) setActiveLayerId(target.id);
        }
    }, []);

    // Escape leaves fullscreen preview, then releases the pinned keyframe; F toggles fullscreen.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (fullscreen) setFullscreen(false);
                else setSelection(null);
                return;
            }
            const target = e.target as HTMLElement | null;
            const typing = target && (target.closest('input, textarea, select') || target.isContentEditable);
            if ((e.key === 'f' || e.key === 'F') && !typing) {
                setSelection(null);
                setFullscreen((v) => !v);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [fullscreen]);

    const scrubTo = (percent: number) => {
        // scrubbing means "show me the animation" — release a pinned keyframe first,
        // otherwise the preview stays static and the slider seems to do nothing
        setSelection(null);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: (percent / 100) * max });
    };

    const section = (id: SectionId, title: string, children: React.ReactNode) => (
        <Section title={title} open={openSection === id} onToggle={() => setOpenSection(id)}>
            {children}
        </Section>
    );

    /* ---- keyframe helpers for the selected keyframe ---- */
    const selectedConfigs =
        selection?.edge === 'wave' ? active.configs : selection ? active[selection.edge].configs : null;
    const setSelectedConfigs = (configs: WaveConfig[]) => {
        if (!selection) return;
        if (selection.edge === 'wave') patch({ configs });
        else patchEdge(selection.edge, { configs });
    };

    // layer palette convention: top row = frontmost = last in paint order
    const reversedLayers = [...layers].reverse();

    return (
        <div
            className="relative min-h-screen max-w-full overflow-x-hidden text-white-washed"
            style={{ backgroundColor: pageBg }}
        >
            {/* --------------- preview: bare page impression, no lab copy --------------- */}
            <main className={cn(!fullscreen && 'lg:pr-[360px]')}>
                {spaceBefore && <div className="h-[80vh]" />}

                <div ref={sectionRef} className="relative" style={{ height: `${sectionVh}vh` }}>
                    {!fullscreen && (
                        <div className="absolute inset-x-0 top-0 z-10 border-t border-dashed border-white-washed/20 px-4 md:px-16">
                            <span className="font-mono text-[11px] uppercase opacity-60">wave section — start</span>
                        </div>
                    )}
                    {previewLayers}
                    {!fullscreen && (
                        <CurveOverlay
                            edges={overlayEdges}
                            selection={selection}
                            onSelect={setSelection}
                            showGhosts={onion}
                            context={active.name}
                        />
                    )}
                    {!fullscreen && (
                        <div className="absolute inset-x-0 bottom-0 z-10 border-b border-dashed border-white-washed/20 px-4 md:px-16">
                            <span className="font-mono text-[11px] uppercase opacity-60">wave section — end</span>
                        </div>
                    )}
                </div>

                {spaceAfter && <div className="h-[80vh]" />}
            </main>

            {/* fullscreen preview: a single quiet affordance to get the chrome back */}
            {fullscreen && (
                <button
                    type="button"
                    onClick={() => setFullscreen(false)}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-ui-border/60 bg-black-washed/90 px-4 py-2 font-mono text-xs uppercase opacity-70 backdrop-blur transition-opacity hover:opacity-100"
                >
                    <span>⛶</span>
                    <span>controls</span>
                </button>
            )}

            {/* ------------------------------ controls ------------------------------ */}
            {/* real editor chrome: opaque full-height sidebar, clearly separated from the page preview */}
            {/* data-lenis-prevent: Lenis hijacks wheel events globally; without it this nested scroll container never scrolls */}
            <aside
                data-lenis-prevent
                className={cn(
                    'flex flex-col border-t border-ui-border/40 bg-black-washed lg:fixed lg:inset-y-0 lg:right-0 lg:z-40 lg:w-[360px] lg:border-l lg:border-t-0',
                    fullscreen && 'hidden',
                )}
            >
                <div className="flex items-center justify-between border-b border-ui-border/40 px-5 py-4">
                    <span className="font-mono text-xs uppercase tracking-[0.25em]">wave composer</span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            title="fullscreen preview (F)"
                            onClick={() => {
                                setSelection(null);
                                setFullscreen(true);
                            }}
                            className={iconBtn}
                        >
                            ⛶
                        </button>
                        {/* the site nav is hidden on this page — this is the way back */}
                        <Link href="/" title="exit composer" className={iconBtn}>
                            ✕
                        </Link>
                    </div>
                </div>

                <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                    {/* always visible: layer palette + page bg + scroll scrubber + figma export */}
                    <div className="flex flex-col gap-3 border-b border-ui-border/40 px-5 py-5">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs opacity-80">layers (top = front)</span>
                            {reversedLayers.map((layer) => {
                                const index = layers.indexOf(layer);
                                return (
                                    <LayerRow
                                        key={layer.id}
                                        layer={layer}
                                        isActive={layer.id === active.id}
                                        isFront={index === layers.length - 1}
                                        isBack={index === 0}
                                        canRemove={layers.length > 1}
                                        onActivate={() => activateLayer(layer.id)}
                                        onToggleVisible={() => toggleVisible(layer.id)}
                                        onMoveForward={() => moveLayer(layer.id, 1)}
                                        onMoveBackward={() => moveLayer(layer.id, -1)}
                                        onRemove={() => removeLayer(layer.id)}
                                    />
                                );
                            })}
                            <div className="grid grid-cols-2 gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => addLayer('wave')}
                                    className="rounded border border-dashed border-ui-border/60 py-1 text-xs uppercase opacity-70 transition-opacity hover:opacity-100"
                                >
                                    + wave
                                </button>
                                <button
                                    type="button"
                                    onClick={() => addLayer('band')}
                                    className="rounded border border-dashed border-ui-border/60 py-1 text-xs uppercase opacity-70 transition-opacity hover:opacity-100"
                                >
                                    + band
                                </button>
                            </div>
                        </div>
                        <ColorRow label="page bg" value={pageBg} onChange={setPageBg} />
                        <Toggle label="space before waves" checked={spaceBefore} onChange={setSpaceBefore} />
                        <Toggle label="space after waves" checked={spaceAfter} onChange={setSpaceAfter} />
                        <SliderRow
                            label="section vh"
                            value={sectionVh}
                            min={50}
                            max={400}
                            step={10}
                            onChange={setSectionVh}
                        />
                        <label className="grid grid-cols-[5.5rem_1fr] items-center gap-2 text-xs">
                            <span className="opacity-80">progress</span>
                            <input
                                ref={scrubberRef}
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                defaultValue={0}
                                onChange={(e) => scrubTo(Number(e.target.value))}
                                className="accent-3a-green h-1 w-full cursor-pointer"
                            />
                        </label>
                        <FigmaExportButtons build={buildExport} />
                        <Toggle label="onion skin (all keyframes)" checked={onion} onChange={setOnion} />
                    </div>

                    {section(
                        'keyframes',
                        active.mode === 'wave' ? `Keyframes (${active.configs.length})` : 'Keyframes',
                        <>
                            {/* end editing and show the scroll-driven interpolation; doubles as a mode indicator */}
                            <button
                                type="button"
                                onClick={() => setSelection(null)}
                                className={cn(
                                    'flex items-center justify-center gap-2 rounded border py-1.5 font-mono text-xs uppercase transition-colors',
                                    selection
                                        ? 'border-ui-border/60 opacity-85 hover:border-3a-green/60 hover:text-3a-green hover:opacity-100'
                                        : 'border-3a-green bg-3a-green/20 text-3a-green',
                                )}
                            >
                                <span>▶</span>
                                <span>{selection ? 'show live result' : 'live result'}</span>
                            </button>
                            {active.mode === 'wave' ? (
                                <KeyframeChips
                                    edge="wave"
                                    configs={active.configs}
                                    selection={selection}
                                    onSelect={setSelection}
                                    onChange={(configs) => patch({ configs })}
                                />
                            ) : (
                                <>
                                    <KeyframeChips
                                        label="top"
                                        edge="top"
                                        configs={active.top.configs}
                                        selection={selection}
                                        onSelect={setSelection}
                                        onChange={(configs) => patchEdge('top', { configs })}
                                    />
                                    <KeyframeChips
                                        label="bottom"
                                        edge="bottom"
                                        configs={active.bottom.configs}
                                        selection={selection}
                                        onSelect={setSelection}
                                        onChange={(configs) => patchEdge('bottom', { configs })}
                                    />
                                </>
                            )}
                            {selection && selectedConfigs ? (
                                <SelectedKeyframe
                                    config={selectedConfigs[selection.index]}
                                    count={selectedConfigs.length}
                                    onChange={(config) =>
                                        setSelectedConfigs(
                                            selectedConfigs.map((c, i) => (i === selection.index ? config : c)),
                                        )
                                    }
                                    onDuplicate={() => {
                                        const c = selectedConfigs[selection.index];
                                        setSelectedConfigs([
                                            ...selectedConfigs.slice(0, selection.index + 1),
                                            { left: [...c.left], right: [...c.right] },
                                            ...selectedConfigs.slice(selection.index + 1),
                                        ]);
                                        setSelection({ ...selection, index: selection.index + 1 });
                                    }}
                                    onRemove={() => {
                                        setSelectedConfigs(selectedConfigs.filter((_, i) => i !== selection.index));
                                        setSelection(null);
                                    }}
                                />
                            ) : (
                                <p className="text-xs leading-relaxed opacity-70">
                                    Pick a keyframe chip to pin and edit it — drag the anchors and handles on the
                                    canvas. Onion skin shows all keyframes as dashed system curves (clickable too). 1
                                    keyframe is static, 2 blend linearly, 3+ flow through a smooth spline.
                                </p>
                            )}
                        </>,
                    )}

                    {section(
                        'scroll',
                        'Scroll',
                        <>
                            <label className="grid grid-cols-[5.5rem_1fr] items-center gap-2 text-xs">
                                <span className="opacity-80">preset</span>
                                <select
                                    value={
                                        scrollPresets.find(
                                            (p) => p.start === active.scrollStart && p.end === active.scrollEnd,
                                        )?.label ?? 'custom'
                                    }
                                    onChange={(e) => {
                                        const preset = scrollPresets.find((p) => p.label === e.target.value);
                                        if (preset) patch({ scrollStart: preset.start, scrollEnd: preset.end });
                                    }}
                                    className="w-full rounded border border-ui-border/60 bg-black-washed px-2 py-1 font-mono text-xs"
                                >
                                    <option value="custom" disabled>
                                        custom
                                    </option>
                                    {scrollPresets.map((p) => (
                                        <option key={p.label} value={p.label}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <details className="text-xs">
                                <summary className="cursor-pointer opacity-70 transition-opacity hover:opacity-100">
                                    custom offsets
                                </summary>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {(['scrollStart', 'scrollEnd'] as const).map((key) => (
                                        <label key={key} className="flex flex-col gap-1">
                                            <span className="opacity-80">
                                                {key === 'scrollStart' ? 'start' : 'end'}
                                            </span>
                                            <input
                                                type="text"
                                                value={active[key]}
                                                onChange={(e) => patch({ [key]: e.target.value })}
                                                spellCheck={false}
                                                className="w-full rounded border border-ui-border/60 bg-black-washed px-2 py-1 font-mono text-xs"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </details>
                        </>,
                    )}

                    {section(
                        'appearance',
                        'Appearance',
                        <>
                            <ColorRow label="fill" value={active.fill} onChange={(fill) => patch({ fill })} />
                            {active.mode === 'wave' && (
                                <>
                                    <ColorRow
                                        label="stroke"
                                        value={active.strokeStyle}
                                        onChange={(strokeStyle) => patch({ strokeStyle })}
                                    />
                                    <SliderRow
                                        label="stroke width"
                                        value={active.strokeWidth}
                                        min={0}
                                        max={4}
                                        step={0.1}
                                        onChange={(strokeWidth) => patch({ strokeWidth })}
                                    />
                                </>
                            )}
                            <Segmented
                                label="feathered out"
                                options={['none', 'top', 'bottom', 'both'] as const}
                                value={active.featheredOut}
                                onChange={(featheredOut) => patch({ featheredOut })}
                            />
                            {active.mode === 'wave' && (
                                <Toggle label="flip" checked={active.flip} onChange={(flip) => patch({ flip })} />
                            )}
                            <Toggle label="debug" checked={active.debug} onChange={(debug) => patch({ debug })} />
                        </>,
                    )}

                    {active.mode === 'wave'
                        ? section(
                              'curves',
                              'Decorative curves',
                              <>
                                  <SliderRow
                                      label="amount"
                                      value={active.curveAmount}
                                      min={0}
                                      max={8}
                                      step={1}
                                      onChange={(curveAmount) => patch({ curveAmount })}
                                  />
                                  <SliderRow
                                      label="offset left"
                                      value={active.offsetLeft}
                                      min={-150}
                                      max={150}
                                      step={1}
                                      onChange={(offsetLeft) => patch({ offsetLeft })}
                                  />
                                  <SliderRow
                                      label="offset right"
                                      value={active.offsetRight}
                                      min={-150}
                                      max={150}
                                      step={1}
                                      onChange={(offsetRight) => patch({ offsetRight })}
                                  />
                              </>,
                          )
                        : (['top', 'bottom'] as const).map((key) => (
                              <Fragment key={key}>
                                  {section(
                                      key,
                                      `${key} edge strokes`,
                                      <>
                                          <ColorRow
                                              label="stroke"
                                              value={active[key].strokeStyle}
                                              onChange={(strokeStyle) => patchEdge(key, { strokeStyle })}
                                          />
                                          <SliderRow
                                              label="stroke width"
                                              value={active[key].strokeWidth}
                                              min={0}
                                              max={4}
                                              step={0.1}
                                              onChange={(strokeWidth) => patchEdge(key, { strokeWidth })}
                                          />
                                          <SliderRow
                                              label="fan amount"
                                              value={active[key].curveAmount}
                                              min={0}
                                              max={8}
                                              step={1}
                                              onChange={(curveAmount) => patchEdge(key, { curveAmount })}
                                          />
                                          <SliderRow
                                              label="offset left"
                                              value={active[key].offsetLeft}
                                              min={-150}
                                              max={150}
                                              step={1}
                                              onChange={(offsetLeft) => patchEdge(key, { offsetLeft })}
                                          />
                                          <SliderRow
                                              label="offset right"
                                              value={active[key].offsetRight}
                                              min={-150}
                                              max={150}
                                              step={1}
                                              onChange={(offsetRight) => patchEdge(key, { offsetRight })}
                                          />
                                      </>,
                                  )}
                              </Fragment>
                          ))}

                    {section(
                        'config',
                        'Config',
                        <div className="relative">
                            <pre className="max-h-96 overflow-auto rounded-lg border border-ui-border/40 bg-gray-darkest-washed p-3 font-mono text-[11px] leading-relaxed">
                                {code}
                            </pre>
                            <CopyButton
                                textToCopy={code}
                                className="absolute right-2 top-2 rounded border border-ui-border/60 bg-black-washed p-1.5 opacity-80 transition-opacity hover:opacity-100"
                            />
                        </div>,
                    )}
                </div>
            </aside>
        </div>
    );
}
