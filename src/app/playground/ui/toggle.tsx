'use client';

import { cn } from '@/lib/utils';

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
        <label className="flex cursor-pointer items-center justify-between text-2xs text-ed-text">
            <span className="text-ed-text-muted">{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative h-4 w-7 rounded-full border transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ed-accent',
                    checked ? 'border-ed-accent/50 bg-ed-accent' : 'border-ed-border bg-ed-fill',
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
