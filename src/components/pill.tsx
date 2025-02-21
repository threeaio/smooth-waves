import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type PillVariant = 'neutral' | 'success' | 'warning';

interface PillProps {
    variant?: PillVariant;
    children: ReactNode;
    className?: string;
}

const variantStyles: Record<PillVariant, string> = {
    neutral: 'border-ui-border  text-white-washed',
    success: 'border-3a-green/20  text-3a-green',
    warning: 'border-3a-red/20  text-3a-red',
};

export const Pill = ({ variant = 'neutral', children, className }: PillProps) => {
    return (
        <span className={cn('px-2 bg-black-washed py-0.5 text-xs rounded-full', variantStyles[variant], className)}>
            {children}
        </span>
    );
};
