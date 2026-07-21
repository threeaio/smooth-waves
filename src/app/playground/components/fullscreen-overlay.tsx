'use client';

import { Button } from '@/components/ui/button';
import { Dices, Minimize2 } from 'lucide-react';
import { useRandomize } from '../composer-context';
import { useView } from '../view-context';

/** Fullscreen preview: quiet affordances at the top — chrome back, plus rerolling without leaving. */
export function FullscreenOverlay() {
    const { exitFullscreen } = useView();
    const randomize = useRandomize();
    return (
        <>
            <Button
                pill
                icon={Minimize2}
                title="back to the editor (Esc)"
                onClick={exitFullscreen}
                className="fixed left-1/2 top-4 z-50 -translate-x-1/2"
            >
                back
            </Button>
            <Button
                pill
                variant="primary"
                icon={Dices}
                title="generate a random composition"
                onClick={randomize}
                className="fixed right-4 top-4 z-50"
            >
                randomize
            </Button>
        </>
    );
}
