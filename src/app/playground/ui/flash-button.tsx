'use client';

import { useRef, useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';

export interface FlashButtonProps
    extends Pick<ButtonProps, 'variant' | 'size' | 'icon' | 'pill' | 'title' | 'aria-label' | 'className'> {
    /** Omit for icon-only flash buttons (pass aria-label instead). */
    children?: React.ReactNode;
    /** Return the feedback to flash (or null to stay quiet). */
    onAction: () => Promise<React.ReactNode | null> | React.ReactNode | null;
    flashMs?: number;
}

/** An action button that flashes its result for a moment (copy/export feedback). */
export function FlashButton({ children, onAction, flashMs = 2000, ...button }: FlashButtonProps) {
    const [feedback, setFeedback] = useState<React.ReactNode>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    return (
        <Button
            {...button}
            selected={feedback != null}
            onClick={async () => {
                const message = await onAction();
                if (message == null) return;
                setFeedback(message);
                if (timerRef.current) clearTimeout(timerRef.current);
                timerRef.current = setTimeout(() => setFeedback(null), flashMs);
            }}
        >
            {feedback ?? children}
        </Button>
    );
}
