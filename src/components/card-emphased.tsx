import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardEmphasedProps {
    className?: string;
    children: ReactNode;
}

export const CardEmphased = ({ className, children }: CardEmphasedProps) => {
    return (
        <div
            className={cn(
                'relative border border-ui-border px-5 py-8 md:p-8 xl:p-12 bg-linear-gradient bg-gradient-to-t from-ui-gradient-bottom to-ui-gradient-top rounded-huge md:rounded-full shadow-2xl shadow-ui-shadow/80 overflow-hidden',
                className,
            )}
        >
            <div
                className="absolute right-0 -top-1/2 w-full h-full opacity-20"
                style={{
                    background: 'radial-gradient(ellipse at center, #414795 0%, transparent 70%)',
                }}
            />
            {children}
        </div>
    );
};
