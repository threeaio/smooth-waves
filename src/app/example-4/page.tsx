import { Wave, type WaveAnimation } from '@threeaio/smooth-waves';
import Image from 'next/image';

export const dynamic = 'force-static';

const ink = '#231112';
const magenta = '#ff015e';
const amber = '#ffbb00';
// not part of the palette — the mood's orange is the magenta/amber blend zone
const orange = '#ff5e2f';

const grain =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='12' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function Grain() {
    return (
        <>
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-40 mix-blend-overlay opacity-75"
                style={{ backgroundImage: grain, backgroundSize: '256px 256px', filter: 'contrast(170%)' }}
            />
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-40 opacity-[0.05]"
                style={{ backgroundImage: grain, backgroundSize: '256px 256px' }}
            />
        </>
    );
}

/**
 * A blurred, overscanned wave: the canvas extends past the section on all
 * sides so the blur never fades at a visible edge and neighboring fields
 * flow into each other across section boundaries.
 */
function SoftWave({ blur = 144, waveConfig }: { blur?: number; waveConfig: WaveAnimation }) {
    return (
        <div
            aria-hidden
            className="absolute -inset-x-[10%] -top-1/4 -bottom-1/4 pointer-events-none"
            style={{ filter: `blur(${blur}px)` }}
        >
            <Wave waveConfig={waveConfig} />
        </div>
    );
}

export default function Home() {
    return (
        <div className="relative min-h-screen max-w-full overflow-x-hidden text-white" style={{ backgroundColor: ink }}>
            <Grain />

            {/* Hero — magenta glow from the top, orange + amber flowing up from below */}
            <div className="relative z-10 min-h-screen flex flex-col justify-center py-16 px-4 md:px-24">
                <SoftWave
                    blur={40}
                    waveConfig={{
                        fill: magenta,
                        curveAmount: 0,
                        configs: [
                            {
                                left: [0.15, 0.45, 0.2],
                                right: [0.48, 0.35, -0.25],
                            },
                            {
                                left: [0.38, 0.5, 0.25],
                                right: [0.2, 0.45, -0.15],
                            },
                        ],
                        scrollOffset: ['5% 0%', '150% 80%'],
                    }}
                />
                <SoftWave
                    blur={52}
                    waveConfig={{
                        flip: true,
                        fill: orange,
                        curveAmount: 0,
                        configs: [
                            {
                                left: [0.58, 0.45, 0.2],
                                right: [0.26, 0.4, -0.18],
                            },
                            {
                                left: [0.42, 0.5, 0.15],
                                right: [0.55, 0.35, -0.25],
                            },
                        ],
                        scrollOffset: ['5% 0%', '150% 80%'],
                    }}
                />
                <SoftWave
                    blur={46}
                    waveConfig={{
                        flip: true,
                        fill: amber,
                        curveAmount: 0,
                        configs: [
                            {
                                left: [0.44, 0.45, 0.28],
                                right: [0.16, 0.5, -0.1],
                            },
                            {
                                left: [0.28, 0.5, 0.15],
                                right: [0.42, 0.4, -0.3],
                            },
                            {
                                left: [0.5, 0.35, 0.3],
                                right: [0.3, 0.35, -0.28],
                            },
                        ],
                        scrollOffset: ['5% 0%', '150% 80%'],
                    }}
                />

                <div className="absolute top-24 md:top-28 left-4 md:left-24 z-20">
                    <Image src="/logo-ns.svg" width={150} height={52} alt="nikolaj sokolowski logo" />
                </div>

                <h1 className="relative z-20 max-w-3xl -mt-24 text-5xl md:text-7xl font-[800] uppercase leading-[0.95] tracking-tight">
                    KI so nutzen, dass sie funktioniert
                </h1>
            </div>

            {/* Amber field carries on from the hero (the overscanned canvases overlap
                across the boundary), magenta wells up from below the content. */}
            <div className="relative z-10">
                <SoftWave
                    blur={46}
                    waveConfig={{
                        fill: amber,
                        curveAmount: 0,
                        configs: [
                            {
                                left: [0.78, 0.45, 0.15],
                                right: [0.5, 0.4, -0.25],
                            },
                            {
                                left: [0.52, 0.5, 0.2],
                                right: [0.72, 0.35, -0.15],
                            },
                        ],
                        scrollOffset: ['start 80%', 'end 30%'],
                    }}
                />
                <SoftWave
                    blur={52}
                    waveConfig={{
                        flip: true,
                        fill: magenta,
                        curveAmount: 0,
                        configs: [
                            {
                                left: [0.24, 0.5, 0.15],
                                right: [0.48, 0.4, -0.2],
                            },
                            {
                                left: [0.5, 0.45, 0.2],
                                right: [0.22, 0.5, -0.1],
                            },
                        ],
                        scrollOffset: ['start 80%', 'end 30%'],
                    }}
                />
                <div className="relative z-10 px-4 md:px-24 pt-32 pb-80 grid xl:grid-cols-8 gap-4" style={{ color: ink }}>
                    <div className="xl:col-span-4 xl:col-start-2 flex flex-col gap-6">
                        <h2 className="text-4xl md:text-6xl font-[800] uppercase leading-[0.95] tracking-tight">
                            Farbe kommt beim Scrollen
                        </h2>
                        <p className="max-w-md text-balance font-mono text-sm">
                            Jede Farbfläche ist eine eigene Wave — Magenta, Orange, Amber laufen auf einer
                            Spring-Animation übereinander. Das Korn liegt als Overlay darüber.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer — the magenta dissolves into the dark, the logo sits below. */}
            <div className="relative z-10 py-56 flex flex-col justify-center">
                <SoftWave
                    blur={48}
                    waveConfig={{
                        fill: magenta,
                        curveAmount: 0,
                        configs: [
                            {
                                left: [0.36, 0.45, 0.25],
                                right: [0.6, 0.35, -0.25],
                            },
                            {
                                left: [0.58, 0.5, 0.15],
                                right: [0.32, 0.45, -0.15],
                            },
                        ],
                        scrollOffset: ['start 80%', 'end end'],
                    }}
                />
                <div className="relative z-10 flex justify-center pt-40 pb-8">
                    <Image src="/logo-ns.svg" width={120} height={42} alt="nikolaj sokolowski logo" />
                </div>
            </div>
        </div>
    );
}
