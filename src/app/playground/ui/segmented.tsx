'use client';

import { cn } from '@/lib/utils';

const sizes = {
    xs: 'px-1.5 py-1 text-3xs',
    sm: 'px-2.5 py-1 text-2xs',
} as const;

/** Bare segmented control — wrap in a Field for a labeled inspector row. */
export function Segmented<T extends string>({
    options,
    value,
    onChange,
    size = 'xs',
    title,
    'aria-label': ariaLabel,
}: {
    options: readonly T[];
    value: T;
    onChange: (value: T) => void;
    size?: keyof typeof sizes;
    title?: string;
    'aria-label'?: string;
}) {
    return (
        <div
            role="radiogroup"
            title={title}
            aria-label={ariaLabel}
            className="grid grid-flow-col gap-px overflow-hidden rounded-md border border-ed-border"
        >
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={option === value}
                    onClick={() => onChange(option)}
                    className={cn(
                        'transition-colors focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-ed-accent',
                        sizes[size],
                        option === value
                            ? 'bg-ed-accent/10 font-medium text-ed-accent'
                            : 'bg-ed-fill-faint text-ed-text-muted hover:text-ed-text-strong',
                    )}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
