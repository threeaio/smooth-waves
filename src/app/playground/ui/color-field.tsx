'use client';

import { cn } from '@/lib/utils';
import { normalizeColor } from '../figma-export';
import { fieldGrid } from './field';

/** Normalize any CSS color (hsl, rgba, named, …) to #rrggbb for the color input's swatch. */
export function toSwatchHex(value: string): string {
    return normalizeColor(value).hex;
}

export function ColorField({
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
            <div className={cn(fieldGrid, 'text-2xs text-ed-text')}>
                <span className="truncate text-ed-text-muted">{label}</span>
                {/* Figma-style color field: swatch + value share one tinted container */}
                <label className="flex items-center gap-1.5 rounded-md border border-transparent bg-ed-fill pl-1.5 focus-within:border-ed-accent/60">
                    <input
                        type="color"
                        value={hex}
                        aria-label={`${label} color`}
                        onChange={(e) => onChange(e.target.value)}
                        // SSR can't resolve CSS colors (no canvas) and renders the fallback swatch
                        suppressHydrationWarning
                        className="size-4 shrink-0 cursor-pointer appearance-none rounded border border-ed-border bg-transparent p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
                    />
                    <input
                        type="text"
                        value={value}
                        aria-label={label}
                        onChange={(e) => onChange(e.target.value)}
                        spellCheck={false}
                        className="w-full min-w-0 bg-transparent py-1 pr-2 font-mono text-2xs text-ed-text-strong outline-none"
                    />
                </label>
            </div>
            {palette && palette.length > 0 && (
                <div className={fieldGrid}>
                    <span />
                    <div className="flex gap-1.5">
                        {palette.map((color, i) => (
                            <button
                                key={`${color}-${i}`}
                                type="button"
                                title={color}
                                aria-label={`use ${color}`}
                                onClick={() => onChange(color)}
                                suppressHydrationWarning
                                className={cn(
                                    'size-4 rounded-full border transition-transform hover:scale-125',
                                    toSwatchHex(color) === hex ? 'border-zinc-700' : 'border-ed-border',
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
