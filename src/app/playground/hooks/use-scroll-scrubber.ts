'use client';

import { useEffect, useRef } from 'react';
import { sliderFill } from '../ui';

/**
 * Keeps the timeline scrubber + t label in sync with real scrolling WITHOUT
 * re-rendering on every frame: the input stays uncontrolled and both elements
 * are written imperatively. In fit view (no scroll room) the virtual progress
 * `scrubT` drives the same elements instead.
 */
export function useScrollScrubber({ mockWide, scrubT }: { mockWide: boolean; scrubT: number }) {
    const scrubberRef = useRef<HTMLInputElement>(null);
    const tLabelRef = useRef<HTMLSpanElement>(null);

    // real scroll → imperative writes at 60fps, invisible to React
    useEffect(() => {
        const onScroll = () => {
            const el = scrubberRef.current;
            if (!el) return;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const t = max > 0 ? window.scrollY / max : 0;
            el.value = String(Math.round(t * 100));
            el.style.background = sliderFill(t * 100);
            if (tLabelRef.current) tLabelRef.current.textContent = t.toFixed(2);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // …and with the virtual progress in fit view (play + scrub share one input)
    useEffect(() => {
        if (!mockWide) return;
        if (scrubberRef.current) {
            scrubberRef.current.value = String(scrubT * 100);
            scrubberRef.current.style.background = sliderFill(scrubT * 100);
        }
        if (tLabelRef.current) tLabelRef.current.textContent = scrubT.toFixed(2);
    }, [scrubT, mockWide]);

    return { scrubberRef, tLabelRef };
}
