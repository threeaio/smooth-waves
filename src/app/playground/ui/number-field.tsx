'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { round, clamp } from '../defaults';

export const inputCls =
    'rounded-md border border-transparent bg-ed-fill px-2 py-1 font-mono text-2xs text-ed-text-strong outline-none focus:border-ed-accent/60';

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
    // free typing: clamping "4000" at the first keystroke would snap "4" to min —
    // the draft holds the raw text while focused, min/max apply on commit (blur/Enter)
    const [draft, setDraft] = useState<string | null>(null);

    const commit = (raw: string) => {
        setDraft(null);
        const v = Number(raw);
        if (raw.trim() !== '' && !Number.isNaN(v)) onChange(round(clamp(min, max, v)));
    };

    return (
        <input
            type="number"
            value={draft ?? value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
                setDraft(e.target.value);
                // live-apply values that are already in range, so sliders/preview follow while typing
                const v = e.target.valueAsNumber;
                if (!Number.isNaN(v) && v >= min && v <= max) onChange(round(v));
            }}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
                if (e.key === 'Escape') setDraft(null);
                e.stopPropagation(); // keep shortcuts (F/Z/space) out while typing numbers
            }}
            className={cn(
                inputCls,
                'w-full text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            )}
        />
    );
}
