import { grainTexture } from '../defaults';

export function Grain({ clipPath }: { clipPath?: string }) {
    // clipPath crops the fixed layers to the frame column WITHOUT a wrapper — a clipping
    // ancestor would isolate the stacking context and break the overlay blend
    return (
        <>
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-30 mix-blend-overlay opacity-75"
                style={{ backgroundImage: grainTexture, backgroundSize: '256px 256px', filter: 'contrast(170%)', clipPath }}
            />
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-30 opacity-[0.05]"
                style={{ backgroundImage: grainTexture, backgroundSize: '256px 256px', clipPath }}
            />
        </>
    );
}
