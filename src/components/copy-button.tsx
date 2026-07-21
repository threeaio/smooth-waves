'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type CopyButtonVariant = 'inline' | 'framed' | 'overlay';

interface CopyButtonProps {
    textToCopy: string;
    /** inline: color-inheriting site button · framed: editor-chrome control · overlay: floats on dark code blocks. */
    variant?: CopyButtonVariant;
    'aria-label'?: string;
    /** Layout only. */
    className?: string;
}

const variants: Record<CopyButtonVariant, string> = {
    inline: 'text-current hover:text-3a-green',
    framed: 'rounded-md border border-ed-border p-1.5 text-ed-text-muted hover:text-ed-text-strong',
    overlay: 'rounded-md border border-white/10 bg-black/60 p-1.5 text-zinc-400 hover:text-white',
};

export const CopyButton = ({
    textToCopy,
    variant = 'inline',
    'aria-label': ariaLabel = 'copy to clipboard',
    className,
}: CopyButtonProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={cn(
                'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ed-accent',
                variants[variant],
                className,
            )}
            aria-label={ariaLabel}
        >
            <span className="relative block size-4">
                <Copy
                    aria-hidden
                    className={cn('absolute size-4 transition-opacity duration-200', copied ? 'opacity-0' : 'opacity-100')}
                />
                <Check
                    aria-hidden
                    className={cn(
                        'absolute size-4 text-3a-green transition-opacity duration-200',
                        copied ? 'opacity-100' : 'opacity-0',
                    )}
                />
            </span>
        </button>
    );
};
