'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CopyButtonProps {
    textToCopy: string;
    className?: string;
}

export const CopyButton = ({ textToCopy, className }: CopyButtonProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <button onClick={handleCopy} className={className} aria-label="Copy install command">
            <div className="relative size-4">
                <Copy
                    className={`absolute size-4 transition-opacity duration-200 ${
                        copied ? 'opacity-0' : 'opacity-100'
                    }`}
                />
                <Check
                    className={`absolute size-4 text-3a-green transition-opacity duration-200 ${
                        copied ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            </div>
        </button>
    );
};
