'use client';

import { useEffect, useState } from 'react';

/** Window size — feeds the fit calculation (scale factor + height compensation). */
export function useViewport(): { w: number; h: number } {
    const [viewport, setViewport] = useState({ w: 1728, h: 1000 });
    useEffect(() => {
        const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);
    return viewport;
}
