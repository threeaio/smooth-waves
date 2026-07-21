import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type IconButtonVariant = 'plain' | 'ghost';
export type IconButtonSize = 'xs' | 'sm';

export interface IconButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
    /** Required — icon-only buttons are invisible to screen readers without it. */
    'aria-label': string;
    icon: LucideIcon;
    size?: IconButtonSize;
    /** plain: borderless row action · ghost: framed control. */
    variant?: IconButtonVariant;
    /** Destructive affordance (delete layer). */
    danger?: boolean;
    selected?: boolean;
    /** Layout only. */
    className?: string;
}

const base =
    'inline-flex shrink-0 items-center justify-center rounded-md transition-colors ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ed-accent ' +
    'disabled:pointer-events-none disabled:opacity-30';

const variants: Record<IconButtonVariant, string> = {
    plain: 'text-ed-text-muted hover:text-ed-text-strong',
    ghost: 'border border-ed-border text-ed-text hover:border-ed-border-strong hover:text-ed-text-strong',
};

const sizes: Record<IconButtonSize, { box: string; icon: number }> = {
    xs: { box: 'size-5', icon: 12 },
    sm: { box: 'size-6', icon: 14 },
};

export function IconButton({
    icon: Icon,
    size = 'sm',
    variant = 'ghost',
    danger = false,
    selected = false,
    className,
    type = 'button',
    ...rest
}: IconButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                base,
                variants[variant],
                sizes[size].box,
                danger && 'hover:text-red-500',
                selected && 'border-ed-accent/50 bg-ed-accent/10 text-ed-accent hover:text-ed-accent',
                className,
            )}
            {...rest}
        >
            <Icon size={sizes[size].icon} aria-hidden />
        </button>
    );
}
