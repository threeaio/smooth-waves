'use client';

import { useEffect } from 'react';

export interface KeyboardHandlers {
    /** Fires even while typing — Escape always backs out one level. */
    onEscape: () => void;
    onToggleFullscreen: () => void;
    onToggleZoom: () => void;
    onTogglePlay: (e: KeyboardEvent) => void;
}

/**
 * Global composer shortcuts: Escape backs out (fullscreen → pinned keyframe →
 * layer selection), F fullscreen, Z fit/100%, space plays in fit view.
 * Handlers must be useCallback-stable — the listener re-subscribes when they change.
 */
export function useKeyboardShortcuts({ onEscape, onToggleFullscreen, onToggleZoom, onTogglePlay }: KeyboardHandlers) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const typing = !!(target && (target.closest('input, textarea, select') || target.isContentEditable));
            if (e.key === 'Escape') {
                onEscape();
                return;
            }
            if (typing) return;
            if (e.key === 'f' || e.key === 'F') onToggleFullscreen();
            if (e.key === 'z' || e.key === 'Z') onToggleZoom();
            if (e.key === ' ') onTogglePlay(e);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onEscape, onToggleFullscreen, onToggleZoom, onTogglePlay]);
}
