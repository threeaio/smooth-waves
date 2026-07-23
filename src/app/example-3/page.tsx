// 'use client';
import { Wave } from '@threeaio/smooth-waves';
import { NsLogo } from '@/components/logos/ns-logo';

export const dynamic = 'force-static';

export default function Home() {
    return (
        <div className="relative min-h-screen bg-gray-darkest-washed max-w-full  overflow-x-hidden">
            <div className="relative z-10 grid grid-cols-2 min-h-screen">
                <div className="bg-white-washed-dark text-black-washed flex flex-col justify-center">
                    <div className="text-lg p-24 font-mono">
                        <p className="">
                            In our standardized world, I embrace unique design and personal aesthetics. Not as a
                            counterpoint to standardization, but as a celebration of the creative freedom they enable.
                        </p>
                    </div>
                </div>
                <div className="relative z-10">
                    {/* visible at page load — the animation window spans the whole
                        scroll-out of this first screen, so it moves from the first tick */}
                    <Wave
                        waveConfig={{
                            strokeStyle: 'rgba(255,255,255,0.4)',
                            strokeWidth: 1,
                            fill: 'hsl(160 10% 16%)',
                            curveAmount: 16,
                            offsetLeft: -44,
                            offsetRight: -18,
                            configs: [
                                {
                                    left: [1, 0.5, 0.2],
                                    right: [0.55, 0.4, -0.35],
                                },
                                {
                                    left: [0.85, 0.55, -0.45],
                                    right: [0.3, 0.45, -0.4],
                                },
                                {
                                    left: [0.7, 0.6, -0.6],
                                    right: [0.15, 0.4, -0.25],
                                },
                            ],
                            scrollOffset: ['start start', 'end start'],
                        }}
                    />
                </div>
            </div>
            <div className="relative z-10 grid grid-cols-2 min-h-screen">
                <div className="relative z-10">
                    {/* the first wave mirrored: fan anchored bottom-left, rising
                        while the section crosses the viewport */}
                    <Wave
                        waveConfig={{
                            strokeStyle: 'rgba(255,255,255,0.4)',
                            strokeWidth: 1,
                            fill: 'hsl(160 10% 16%)',
                            curveAmount: 16,
                            offsetLeft: -18,
                            offsetRight: -44,
                            configs: [
                                {
                                    left: [0.55, 0.4, -0.35],
                                    right: [1, 0.5, 0.2],
                                },
                                {
                                    left: [0.75, 0.45, -0.5],
                                    right: [0.8, 0.55, -0.45],
                                },
                                {
                                    left: [0.9, 0.4, -0.3],
                                    right: [0.6, 0.6, -0.6],
                                },
                            ],
                            scrollOffset: ['start end', 'end start'],
                        }}
                    />
                </div>
                <div className="bg-white-washed-dark text-black-washed flex flex-col justify-center">
                    <div className="text-lg p-24 font-mono">
                        <p className="">
                            Repetition is a choice too — the same wave, mirrored and retimed, becomes a different
                            gesture. Motion here is designed, not generated.
                        </p>
                    </div>
                </div>
            </div>

            {/* after the two 50/50 screens the full-width section switches to the
                lighter neutral (white-washed vs. the split screens' greenish
                white-washed-dark) — a different room for the framed piece */}
            <div className=" relative py-56 flex flex-col justify-center bg-white-washed">
                {/* the same component, framed: a squircle card (corner-shape via the
                    rounded-3xl utility where supported) instead of a full-bleed canvas */}
                <div className="relative mx-auto w-[min(90vw,1200px)] flex flex-col gap-6">
                    {/* rounded-huge (4rem) carries corner-shape: squircle via globals.css
                        in supporting browsers */}
                    <div className="relative h-[70vh] overflow-hidden rounded-huge bg-gray-darkest-washed shadow-2xl shadow-ui-shadow/20">
                        {/* x-bleed: the strokes run past the frame, so no line ends inside it */}
                        <div className="absolute -inset-x-[12%] inset-y-0" aria-hidden>
                            <Wave
                                waveConfig={{
                                    fill: 'hsl(160 8% 21%)',
                                    strokeStyle: 'rgba(255,255,255,0.4)',
                                    strokeWidth: 1,
                                    curveAmount: 16,
                                    offsetLeft: -44,
                                    offsetRight: -18,
                                    configs: [
                                        {
                                            left: [0.75, 0.4, -0.3],
                                            right: [0.35, 0.4, 0.25],
                                        },
                                        {
                                            left: [0.5, 0.5, -0.5],
                                            right: [0.65, 0.4, -0.3],
                                        },
                                    ],
                                    scrollOffset: ['start 80%', 'end 20%'],
                                }}
                            />
                        </div>
                    </div>
                    <p className="font-mono text-xs text-black-washed opacity-60 px-2">
                        the wave fills whatever positioned container it gets — here a framed squircle instead of the
                        full page width.
                    </p>
                </div>
            </div>
            <div className="relative col-span-8 col-start-3 pt-32 pb-96 bg-white-washed">
                <NsLogo centered className="mx-auto relative w-36 h-auto text-black-washed" />
            </div>
        </div>
    );
}
