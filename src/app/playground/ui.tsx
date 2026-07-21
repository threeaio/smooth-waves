'use client';

import { cn } from '@/lib/utils';
import { normalizeColor } from './figma-export';
import { round, clamp } from './defaults';
import { useRef, useState } from 'react';

/**
 * Editor chrome atoms. The tool has its own quiet, Figma-UI3-like light theme
 * (floating white cards, hairline borders, tinted inputs, one blue accent) that
 * stays out of the composition's way — all lowercase, no decorative typography.
 */

export const accentText = 'text-[#0d99ff]';
export const inputCls =
    'rounded-md border border-transparent bg-black/[0.05] px-2 py-1 font-mono text-[11px] text-zinc-800 outline-none focus:border-[#0d99ff]/60';

/* Figma-style range input: hairline track (painted via background gradient) + round white thumb. */
export const sliderCls =
    'h-[3px] min-w-0 cursor-pointer appearance-none rounded-full outline-none ' +
    '[&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full ' +
    '[&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/20 [&::-webkit-slider-thumb]:bg-white ' +
    '[&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.35)] ' +
    '[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border ' +
    '[&::-moz-range-thumb]:border-black/20 [&::-moz-range-thumb]:bg-white';

/** Track paint: accent up to the thumb, quiet gray after. `pct` in 0..100. */
export const sliderFill = (pct: number): string =>
    `linear-gradient(to right, #0d99ff ${pct}%, rgba(0,0,0,0.10) ${pct}%)`;

export function Slider({
    value,
    min,
    max,
    step,
    onChange,
    className,
}: {
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    className?: string;
}) {
    const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
    return (
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={cn(sliderCls, 'w-full', className)}
            style={{ background: sliderFill(pct) }}
        />
    );
}

/** Normalize any CSS color (hsl, rgba, named, …) to #rrggbb for the color input's swatch. */
export function toSwatchHex(value: string): string {
    return normalizeColor(value).hex;
}

/** One inspector group: quiet lowercase title, hairline below. */
export function Group({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-2.5 border-b border-black/[0.06] px-3 py-3">
            <h3 className="text-[10px] font-medium text-zinc-400">{title}</h3>
            {children}
        </section>
    );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="grid grid-cols-[4.5rem_1fr] items-center gap-2 text-[11px] text-zinc-700">
            <span className="truncate text-zinc-500">{label}</span>
            {children}
        </label>
    );
}

export function SliderRow({
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
        <div className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-2 text-[11px] text-zinc-700">
            <span className="truncate text-zinc-500">{label}</span>
            <Slider value={value} min={min} max={max} step={step} onChange={onChange} />
            <NumberField value={round(value)} min={min} max={max} step={step} onChange={onChange} />
        </div>
    );
}

export function ColorRow({
    label,
    value,
    onChange,
    palette,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    /** Page palette — rendered as one-click swatches under the field. */
    palette?: string[];
}) {
    const hex = toSwatchHex(value);
    return (
        <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-[4.5rem_1fr] items-center gap-2 text-[11px] text-zinc-700">
                <span className="truncate text-zinc-500">{label}</span>
                {/* Figma-style color field: swatch + value share one tinted container */}
                <label className="flex items-center gap-1.5 rounded-md border border-transparent bg-black/[0.05] pl-1.5 focus-within:border-[#0d99ff]/60">
                    <input
                        type="color"
                        value={hex}
                        onChange={(e) => onChange(e.target.value)}
                        // SSR can't resolve CSS colors (no canvas) and renders the fallback swatch
                        suppressHydrationWarning
                        className="size-4 shrink-0 cursor-pointer appearance-none rounded-[4px] border border-black/10 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-[3px] [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
                    />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        spellCheck={false}
                        className="w-full min-w-0 bg-transparent py-1 pr-2 font-mono text-[11px] text-zinc-800 outline-none"
                    />
                </label>
            </div>
            {palette && palette.length > 0 && (
                <div className="grid grid-cols-[4.5rem_1fr] items-center gap-2">
                    <span />
                    <div className="flex gap-1.5">
                        {palette.map((color, i) => (
                            <button
                                key={`${color}-${i}`}
                                type="button"
                                title={color}
                                onClick={() => onChange(color)}
                                suppressHydrationWarning
                                className={cn(
                                    'size-4 rounded-full border transition-transform hover:scale-125',
                                    toSwatchHex(color) === hex ? 'border-zinc-700' : 'border-black/10',
                                )}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export function Toggle({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center justify-between text-[11px] text-zinc-700">
            <span className="text-zinc-500">{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative h-4 w-7 rounded-full border transition-colors',
                    checked ? 'border-[#0d99ff]/50 bg-[#0d99ff]' : 'border-black/10 bg-black/[0.08]',
                )}
            >
                <span
                    className={cn(
                        'absolute top-[2px] size-[10px] rounded-full bg-white shadow-sm transition-all',
                        checked ? 'left-[14px]' : 'left-[2px]',
                    )}
                />
            </button>
        </label>
    );
}

export function Segmented<T extends string>({
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
        <div className="grid grid-cols-[4.5rem_1fr] items-center gap-2 text-[11px] text-zinc-700">
            <span className="truncate text-zinc-500">{label}</span>
            <div className="grid grid-flow-col gap-px overflow-hidden rounded-md border border-black/10">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={cn(
                            'px-1 py-1 text-[10px] transition-colors',
                            option === value
                                ? cn('bg-[#0d99ff]/10 font-medium', accentText)
                                : 'bg-black/[0.02] text-zinc-500 hover:text-zinc-800',
                        )}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function NumberField({
    value,
    min,
    max,
    step = 0.01,
    onChange,
}: {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
}) {
    return (
        <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
                const v = e.target.valueAsNumber;
                if (!Number.isNaN(v)) onChange(round(clamp(min, max, v)));
            }}
            className={cn(
                inputCls,
                'w-full text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            )}
        />
    );
}

/** A small labeled action button that flashes feedback for 2s after its (async) action. */
export function FlashButton({
    label,
    title,
    onAction,
    className,
}: {
    label: string;
    title?: string;
    onAction: () => Promise<string | null> | string | null;
    className?: string;
}) {
    const [feedback, setFeedback] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    return (
        <button
            type="button"
            title={title}
            onClick={async () => {
                const message = await onAction();
                if (!message) return;
                setFeedback(message);
                if (timerRef.current) clearTimeout(timerRef.current);
                timerRef.current = setTimeout(() => setFeedback(null), 2000);
            }}
            className={cn(
                'rounded-md border px-2 py-1 font-mono text-[11px] transition-colors',
                feedback
                    ? cn('border-[#0d99ff]/50', accentText)
                    : 'border-black/10 text-zinc-600 hover:border-black/25 hover:text-zinc-900',
                className,
            )}
        >
            {feedback ?? label}
        </button>
    );
}
