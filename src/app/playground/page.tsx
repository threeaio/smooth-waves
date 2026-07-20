'use client';

import { Wave, type WaveAnimation, type WaveConfig } from '@threeaio/smooth-waves';
import { CopyButton } from '@/components/copy-button';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';

type FeatheredOut = 'none' | 'top' | 'bottom' | 'both';

interface PlaygroundState {
    fill: string;
    strokeStyle: string;
    strokeWidth: number;
    featheredOut: FeatheredOut;
    flip: boolean;
    debug: boolean;
    curveAmount: number;
    offsetLeft: number;
    offsetRight: number;
    configs: WaveConfig[];
    scrollStart: string;
    scrollEnd: string;
}

const initialState: PlaygroundState = {
    fill: 'hsl(160 10% 16%)',
    strokeStyle: 'rgba(255,255,255,0.2)',
    strokeWidth: 1,
    featheredOut: 'none',
    flip: false,
    debug: true,
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
    scrollStart: 'start end',
    scrollEnd: 'end start',
};

const scrollPresets: Array<{ label: string; start: string; end: string }> = [
    { label: 'start end → end start (full pass)', start: 'start end', end: 'end start' },
    { label: 'start start → end end (while pinned)', start: 'start start', end: 'end end' },
    { label: '5% 0% → 150% 80% (hero)', start: '5% 0%', end: '150% 80%' },
    { label: 'start 80% → end 30% (content)', start: 'start 80%', end: 'end 30%' },
];

/* ---------------------------------- code output --------------------------------- */

const PACKAGE_DEFAULTS = {
    strokeStyle: '#fff',
    strokeWidth: 0.4,
    curveAmount: 1,
    offsetLeft: 0,
    offsetRight: 0,
} as const;

function round(n: number): number {
    return Math.round(n * 100) / 100;
}

/** Serialize the current state as a ready-to-paste `<Wave />` snippet, omitting defaults. */
function toCodeSnippet(s: PlaygroundState): string {
    const lines: string[] = [];
    lines.push(`fill: '${s.fill}',`);
    if (s.strokeStyle !== PACKAGE_DEFAULTS.strokeStyle) lines.push(`strokeStyle: '${s.strokeStyle}',`);
    if (s.strokeWidth !== PACKAGE_DEFAULTS.strokeWidth) lines.push(`strokeWidth: ${round(s.strokeWidth)},`);
    if (s.curveAmount !== PACKAGE_DEFAULTS.curveAmount) lines.push(`curveAmount: ${s.curveAmount},`);
    if (s.offsetLeft !== PACKAGE_DEFAULTS.offsetLeft) lines.push(`offsetLeft: ${s.offsetLeft},`);
    if (s.offsetRight !== PACKAGE_DEFAULTS.offsetRight) lines.push(`offsetRight: ${s.offsetRight},`);
    if (s.flip) lines.push(`flip: true,`);
    if (s.featheredOut !== 'none') lines.push(`featheredOut: '${s.featheredOut}',`);
    if (s.debug) lines.push(`debug: true,`);
    lines.push(`configs: [`);
    for (const c of s.configs) {
        lines.push(`    {`);
        lines.push(`        left: [${c.left.map(round).join(', ')}],`);
        lines.push(`        right: [${c.right.map(round).join(', ')}],`);
        lines.push(`    },`);
    }
    lines.push(`],`);
    lines.push(`scrollOffset: ['${s.scrollStart}', '${s.scrollEnd}'],`);

    const body = lines.map((l) => `        ${l}`).join('\n');
    return `<Wave\n    waveConfig={{\n${body}\n    }}\n/>`;
}

/* --------------------------------- control atoms --------------------------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-3 border-b border-ui-border/40 px-5 py-5">
            <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-50">{title}</h3>
            {children}
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
            <span className="opacity-70">{label}</span>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="accent-3a-green h-1 w-full cursor-pointer"
            />
            <span className="text-right font-mono tabular-nums opacity-90">{round(value)}</span>
        </label>
    );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    const hex = /^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff';
    return (
        <label className="grid grid-cols-[5.5rem_1.5rem_1fr] items-center gap-2 text-xs">
            <span className="opacity-70">{label}</span>
            <input
                type="color"
                value={hex}
                onChange={(e) => onChange(e.target.value)}
                className="size-6 cursor-pointer rounded border border-ui-border/60 bg-transparent"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
                className="w-full rounded border border-ui-border/60 bg-black-washed px-2 py-1 font-mono text-[11px]"
            />
        </label>
    );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
    return (
        <label className="flex cursor-pointer items-center justify-between text-xs">
            <span className="opacity-70">{label}</span>
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
            <span className="opacity-70">{label}</span>
            <div className="grid grid-flow-col gap-px overflow-hidden rounded border border-ui-border/60">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={cn(
                            'px-2 py-1.5 text-[11px] uppercase transition-colors',
                            option === value ? 'bg-3a-green/20 text-3a-green' : 'bg-black-washed opacity-60',
                        )}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ------------------------------------ keyframes ----------------------------------- */

function BezierColumn({
    title,
    value,
    onChange,
}: {
    title: string;
    value: [number, number, number];
    onChange: (value: [number, number, number]) => void;
}) {
    const set = (i: number, v: number) => {
        const next: [number, number, number] = [...value];
        next[i] = v;
        onChange(next);
    };
    return (
        <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest opacity-40">{title}</span>
            <SliderRow label="y" value={value[0]} min={0} max={1} step={0.01} onChange={(v) => set(0, v)} />
            <SliderRow label="x-offset" value={value[1]} min={0} max={1} step={0.01} onChange={(v) => set(1, v)} />
            <SliderRow label="y-offset" value={value[2]} min={-1} max={1} step={0.01} onChange={(v) => set(2, v)} />
        </div>
    );
}

/* ------------------------------------- page --------------------------------------- */

export default function Playground() {
    const [state, setState] = useState<PlaygroundState>(initialState);
    const scrubberRef = useRef<HTMLInputElement>(null);

    const patch = (partial: Partial<PlaygroundState>) => setState((s) => ({ ...s, ...partial }));

    const patchConfig = (index: number, side: keyof WaveConfig, value: [number, number, number]) =>
        setState((s) => ({
            ...s,
            configs: s.configs.map((c, i) => (i === index ? { ...c, [side]: value } : c)),
        }));

    const waveConfig = useMemo<WaveAnimation>(
        () => ({
            fill: state.fill,
            strokeStyle: state.strokeStyle,
            strokeWidth: state.strokeWidth,
            curveAmount: state.curveAmount,
            offsetLeft: state.offsetLeft,
            offsetRight: state.offsetRight,
            flip: state.flip,
            debug: state.debug,
            featheredOut: state.featheredOut === 'none' ? undefined : state.featheredOut,
            configs: state.configs,
            scrollOffset: [state.scrollStart, state.scrollEnd] as WaveAnimation['scrollOffset'],
        }),
        [state],
    );

    const code = useMemo(() => toCodeSnippet(state), [state]);

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

    const scrubTo = (percent: number) => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: (percent / 100) * max });
    };

    return (
        <div className="relative min-h-screen max-w-full overflow-x-hidden bg-gray-darkest-washed text-white-washed">
            {/* ------------------------------ preview ------------------------------ */}
            <main className="lg:pr-[380px]">
                <div className="flex h-[80vh] flex-col items-start justify-center gap-2 px-4 pb-8 md:px-32 xl:px-56">
                    <h1 className="text-4xl font-bold">Wave Lab</h1>
                    <p className="max-w-sm text-sm opacity-70">
                        Tune the wave below, scroll (or scrub) to see the keyframes interpolate, then copy the config.
                    </p>
                </div>

                <div className="relative h-[150vh]">
                    <div className="absolute inset-x-0 top-0 z-10 border-t border-dashed border-white-washed/20 px-4 md:px-16">
                        <span className="font-mono text-[10px] uppercase opacity-40">wave section — start</span>
                    </div>
                    <Wave key={`${state.scrollStart}|${state.scrollEnd}`} waveConfig={waveConfig} />
                    <div className="absolute inset-x-0 bottom-0 z-10 border-b border-dashed border-white-washed/20 px-4 md:px-16">
                        <span className="font-mono text-[10px] uppercase opacity-40">wave section — end</span>
                    </div>
                </div>

                <div className="flex h-[80vh] items-end px-4 pb-16 md:px-32 xl:px-56">
                    <p className="font-mono text-[10px] uppercase opacity-30">
                        the canvas only lives inside the marked section — the spacers exist so it can scroll past the
                        viewport
                    </p>
                </div>
            </main>

            {/* ------------------------------ controls ------------------------------ */}
            {/* data-lenis-prevent: Lenis hijacks wheel events globally; without it this nested scroll container never scrolls */}
            <aside
                data-lenis-prevent
                className="border-t border-ui-border/40 bg-black-washed/80 backdrop-blur-md lg:fixed lg:bottom-4 lg:right-4 lg:top-24 lg:z-40 lg:w-[340px] lg:overflow-y-auto lg:rounded-2xl lg:border"
            >
                <Section title="Scroll">
                    <label className="grid grid-cols-[5.5rem_1fr] items-center gap-2 text-xs">
                        <span className="opacity-70">progress</span>
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
                    <label className="grid grid-cols-[5.5rem_1fr] items-center gap-2 text-xs">
                        <span className="opacity-70">preset</span>
                        <select
                            value={
                                scrollPresets.find((p) => p.start === state.scrollStart && p.end === state.scrollEnd)
                                    ?.label ?? 'custom'
                            }
                            onChange={(e) => {
                                const preset = scrollPresets.find((p) => p.label === e.target.value);
                                if (preset) patch({ scrollStart: preset.start, scrollEnd: preset.end });
                            }}
                            className="w-full rounded border border-ui-border/60 bg-black-washed px-2 py-1 font-mono text-[11px]"
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
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        {(['scrollStart', 'scrollEnd'] as const).map((key) => (
                            <label key={key} className="flex flex-col gap-1">
                                <span className="opacity-70">{key === 'scrollStart' ? 'start' : 'end'}</span>
                                <input
                                    type="text"
                                    value={state[key]}
                                    onChange={(e) => patch({ [key]: e.target.value })}
                                    spellCheck={false}
                                    className="w-full rounded border border-ui-border/60 bg-black-washed px-2 py-1 font-mono text-[11px]"
                                />
                            </label>
                        ))}
                    </div>
                </Section>

                <Section title="Appearance">
                    <ColorRow label="fill" value={state.fill} onChange={(fill) => patch({ fill })} />
                    <ColorRow
                        label="stroke"
                        value={state.strokeStyle}
                        onChange={(strokeStyle) => patch({ strokeStyle })}
                    />
                    <SliderRow
                        label="stroke width"
                        value={state.strokeWidth}
                        min={0}
                        max={4}
                        step={0.1}
                        onChange={(strokeWidth) => patch({ strokeWidth })}
                    />
                    <Segmented
                        label="feathered out"
                        options={['none', 'top', 'bottom', 'both'] as const}
                        value={state.featheredOut}
                        onChange={(featheredOut) => patch({ featheredOut })}
                    />
                    <Toggle label="flip" checked={state.flip} onChange={(flip) => patch({ flip })} />
                    <Toggle label="debug" checked={state.debug} onChange={(debug) => patch({ debug })} />
                </Section>

                <Section title="Decorative curves">
                    <SliderRow
                        label="amount"
                        value={state.curveAmount}
                        min={0}
                        max={8}
                        step={1}
                        onChange={(curveAmount) => patch({ curveAmount })}
                    />
                    <SliderRow
                        label="offset left"
                        value={state.offsetLeft}
                        min={-150}
                        max={150}
                        step={1}
                        onChange={(offsetLeft) => patch({ offsetLeft })}
                    />
                    <SliderRow
                        label="offset right"
                        value={state.offsetRight}
                        min={-150}
                        max={150}
                        step={1}
                        onChange={(offsetRight) => patch({ offsetRight })}
                    />
                </Section>

                <Section title={`Keyframes (${state.configs.length})`}>
                    <p className="text-[11px] leading-relaxed opacity-50">
                        Each keyframe is one wave shape. Scrolling interpolates between them — 1 is static, 2 blends
                        linearly, 3+ flow through a smooth spline.
                    </p>
                    {state.configs.map((config, i) => (
                        <div key={i} className="flex flex-col gap-3 rounded-lg border border-ui-border/40 p-3">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-[11px] opacity-70">{i + 1}</span>
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            patch({
                                                configs: [
                                                    ...state.configs.slice(0, i + 1),
                                                    { left: [...config.left], right: [...config.right] },
                                                    ...state.configs.slice(i + 1),
                                                ],
                                            })
                                        }
                                        className="rounded border border-ui-border/60 px-2 py-0.5 text-[10px] uppercase opacity-70 transition-opacity hover:opacity-100"
                                    >
                                        duplicate
                                    </button>
                                    <button
                                        type="button"
                                        disabled={state.configs.length <= 1}
                                        onClick={() => patch({ configs: state.configs.filter((_, j) => j !== i) })}
                                        className="rounded border border-ui-border/60 px-2 py-0.5 text-[10px] uppercase text-3a-red opacity-70 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-20"
                                    >
                                        remove
                                    </button>
                                </div>
                            </div>
                            <BezierColumn
                                title="left edge"
                                value={config.left}
                                onChange={(v) => patchConfig(i, 'left', v)}
                            />
                            <BezierColumn
                                title="right edge"
                                value={config.right}
                                onChange={(v) => patchConfig(i, 'right', v)}
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            const last = state.configs[state.configs.length - 1];
                            patch({
                                configs: [...state.configs, { left: [...last.left], right: [...last.right] }],
                            });
                        }}
                        className="rounded border border-ui-border/60 py-1.5 text-[11px] uppercase opacity-70 transition-opacity hover:opacity-100"
                    >
                        + add keyframe
                    </button>
                </Section>

                <Section title="Config">
                    <div className="relative">
                        <pre className="max-h-96 overflow-auto rounded-lg border border-ui-border/40 bg-gray-darkest-washed p-3 font-mono text-[10px] leading-relaxed">
                            {code}
                        </pre>
                        <CopyButton
                            textToCopy={code}
                            className="absolute right-2 top-2 rounded border border-ui-border/60 bg-black-washed p-1.5 opacity-70 transition-opacity hover:opacity-100"
                        />
                    </div>
                </Section>
            </aside>
        </div>
    );
}
