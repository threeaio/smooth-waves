'use client';

import { cn } from '@/lib/utils';

/* Figma-style range input: hairline track (painted via background gradient) + round white thumb. */
export const sliderCls =
    'h-[3px] min-w-0 cursor-pointer appearance-none rounded-full outline-none ' +
    '[&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full ' +
    '[&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-ed-border-strong [&::-webkit-slider-thumb]:bg-white ' +
    '[&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.35)] ' +
    '[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border ' +
    '[&::-moz-range-thumb]:border-ed-border-strong [&::-moz-range-thumb]:bg-white';

/** Track paint: accent up to the thumb, quiet gray after. `pct` in 0..100. */
export const sliderFill = (pct: number): string =>
    `linear-gradient(to right, rgb(var(--ed-accent)) ${pct}%, var(--ed-border) ${pct}%)`;

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
    /** Layout only. */
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
