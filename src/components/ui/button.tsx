import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type ButtonVariant = 'ghost' | 'primary' | 'danger';
export type ButtonSize = 'xs' | 'sm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Accent-tinted active state (segmented tabs, play, "live result"). */
    selected?: boolean;
    /** Floating pill shape for overlay affordances (fullscreen chrome). */
    pill?: boolean;
    icon?: LucideIcon;
    /** Per project rule: className is for LAYOUT only (margins, grid placement) — looks come from variants. */
    className?: string;
}

const base =
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap border font-mono transition-colors ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ed-accent ' +
    'disabled:pointer-events-none disabled:opacity-40';

const variants: Record<ButtonVariant, string> = {
    ghost: 'border-ed-border text-ed-text hover:border-ed-border-strong hover:text-ed-text-strong',
    primary: 'border-transparent bg-ed-accent text-white hover:bg-ed-accent-hover',
    danger: 'border-ed-border text-red-500 hover:border-red-400/60',
};

const sizes: Record<ButtonSize, string> = {
    xs: 'rounded-md px-1.5 py-0.5 text-3xs',
    sm: 'rounded-md px-2 py-1 text-2xs',
};

const selectedCls = 'border-ed-accent/50 bg-ed-accent/10 text-ed-accent hover:border-ed-accent/50 hover:text-ed-accent';

const iconSize: Record<ButtonSize, number> = { xs: 12, sm: 13 };

export function Button({
    variant = 'ghost',
    size = 'sm',
    selected = false,
    pill = false,
    icon: Icon,
    className,
    children,
    type = 'button',
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                base,
                variants[variant],
                sizes[size],
                pill && 'rounded-full px-4 py-2 shadow-lg',
                pill && variant === 'ghost' && 'bg-ed-panel/90 backdrop-blur',
                selected && variant !== 'primary' && selectedCls,
                className,
            )}
            {...rest}
        >
            {Icon && <Icon size={pill ? 14 : iconSize[size]} aria-hidden />}
            {children}
        </button>
    );
}
