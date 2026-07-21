'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * Fullscreen preview is always the real 100% scroll view; leaving it restores
 * whichever view (fit/100%) was active before.
 */
export function useFullscreen({
    mockWide,
    setMockWide,
    onEnter,
}: {
    mockWide: boolean;
    setMockWide: (v: boolean) => void;
    onEnter?: () => void;
}) {
    const [fullscreen, setFullscreen] = useState(false);
    const preFullscreenFit = useRef(true);

    const enter = useCallback(() => {
        onEnter?.();
        preFullscreenFit.current = mockWide;
        setMockWide(false);
        setFullscreen(true);
    }, [mockWide, setMockWide, onEnter]);

    const exit = useCallback(() => {
        setFullscreen(false);
        setMockWide(preFullscreenFit.current);
    }, [setMockWide]);

    return { fullscreen, enter, exit };
}
