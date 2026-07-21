'use client';

import { useEffect, useRef } from 'react';

/** rAF loop while `enabled` — calls `advance` with the frame delta in seconds. */
export function usePlayback(enabled: boolean, advance: (dtSeconds: number) => void) {
    const advanceRef = useRef(advance);
    advanceRef.current = advance;
    useEffect(() => {
        if (!enabled) return;
        let raf = 0;
        let last = performance.now();
        const step = (now: number) => {
            advanceRef.current((now - last) / 1000);
            last = now;
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [enabled]);
}
