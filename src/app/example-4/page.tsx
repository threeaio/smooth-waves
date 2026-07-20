import { Wave, type WaveAnimation } from '@threeaio/smooth-waves';
import { NsLogo } from '@/components/logos/ns-logo';
import { cn } from '@/lib/utils';

export const dynamic = 'force-static';

const ink = '#231112';
const magenta = '#ff015e';
const amber = '#ffbb00';
// not part of the palette — the mood's orange is the magenta/orange blend zone
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
 * Shared content column: an 8-col grid whose inner block sits offset from the
 * left, so every text block on the page lines up at the same width and position.
 */
function Container({
    children,
    className,
    style,
}: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <div className="relative z-20 px-4 md:px-24 grid xl:grid-cols-8 gap-4" style={style}>
            <div className={cn('xl:col-span-4 xl:col-start-2 flex flex-col gap-6', className)}>{children}</div>
        </div>
    );
}

/**
 * One color field inside a scene, spanning the FULL scene height.
 *
 * Boundary stacking: the scene background is the bottom-most color, and every
 * field on top fills from the top edge down to its curve (painter's algorithm,
 * DOM order = paint order). Every visible edge is therefore a designed curve —
 * straight canvas edges can't appear, because no canvas ends mid-composition.
 *
 * Note: y-values in the configs are fractions of the whole SCENE, not the
 * viewport — keep them within ~0.05–0.95 so the spline overshoot (3+ keyframes)
 * stays inside the canvas.
 */
function Field({ blur = 0, waveConfig }: { blur?: number; waveConfig: WaveAnimation }) {
    return (
        <div
            aria-hidden
            className="absolute -inset-x-[4%] inset-y-0 pointer-events-none"
            style={{ filter: blur ? `blur(${blur}px)` : undefined }}
        >
            <Wave waveConfig={waveConfig} />
        </div>
    );
}

export default function Home() {
    return (
        <div className="relative min-h-screen max-w-full overflow-x-hidden text-white" style={{ backgroundColor: ink }}>
            <Grain />

            {/* Scene 1 — hero. Bottom-most color is amber; the cut to scene 2 runs
                through flat amber, so the seam between the scenes is invisible. */}
            <section className="relative " style={{ backgroundColor: amber }}>
                <div className="absolute inset-0" aria-hidden>
                    {/* orange band: visible between its own curve and the ink curve above it */}
            
                    {/* ink field: the dark hero area the headline sits on */}
                    <Field
                        blur={60}
                        waveConfig={{
                            fill: ink,
                            strokeStyle: magenta,
                            strokeWidth: 1.4,
                            // fan needs curveAmount × offsetRight px of room BELOW the curve —
                            // 16 × 28 = 448px, which fits inside the scene incl. the bottom spacer
                            offsetLeft: 8,
                            offsetRight: 28,
                            curveAmount: 16,
                            configs: [
                                {
                                    left: [0.3, 0.25, 0.5],
                                    right: [0.6, 0.2, -0.3],
                                },
                                {
                                    left: [0.9, 0.4, -0.6],
                                    right: [0.6, 0.5, -0.4],
                                },
                                // {
                                //     left: [0.45, 0.5, 0.11],
                                //     right: [0.47, 0.75, -0.08],
                                // },
                            ],
                            scrollOffset: ['start start', 'end 25%'],
                        }}
                    />
                    {/* magenta glow at the very top, with fine contour lines */}
                    <Field
                        waveConfig={{
                            fill: magenta,
                            curveAmount: 16,
                            strokeStyle: ink,
                            strokeWidth: 0.4,
                            offsetLeft: -10,
                            offsetRight: -36,
                            configs: [
                                {
                                    left: [0.02, 0.2, 0.4],
                                    right: [0.07, 0.6, -0.05],
                                },
                                {
                                    left: [0.13, 0.7, 0.04],
                                    right: [1, 0.5, -0.08],
                                },
                            ],
                            scrollOffset: ['start start', 'end 25%'],
                        }}
                    />
                </div>

                <div className="relative z-10 min-h-screen flex flex-col justify-center py-16">
                    <Container className="-mt-24">
                        <h1 className="text-5xl md:text-7xl font-[800] uppercase leading-[0.95] tracking-tight">
                            KI so nutzen, dass sie funktioniert
                        </h1>
                    </Container>
                </div>

                {/* flat-amber run-out: gives the ink field's line fan room inside
                    THIS scene's canvas before the (invisible) cut to scene 2 */}
                <div className="h-[50vh]" />
            </section>

            {/* Scene 2 — content + footer. Starts flat amber (matching scene 1's
                bottom), ends in the ink the root already provides. */}
            <section className="relative">
                <div className="absolute inset-0 overflow-hidden" aria-hidden>
                    {/* magenta field between amber and the dark footer */}
                    <Field
                        blur={60}
                        waveConfig={{
                            fill: magenta,
                            // curveAmount defaults to 1 (not 0) with a white default stroke —
                            // without this you get a white hairline along the curve
                            curveAmount: 0,
                            configs: [
                                {
                                    left: [0.5, 0.3, 0.5],
                                    right: [0.7, 0.6, 0.08],
                                },
                                {
                                    left: [0.7, 0.2, -0.4],
                                    right: [0.96, 0.4, 0.5],
                                },
                            ],
                            scrollOffset: ['start 75%', 'end end'],
                        }}
                    />
                    {/* amber field the text sits on, with magenta contour lines fanning into it */}
                    <Field
                        waveConfig={{
                            fill: amber,
                            curveAmount: 6,
                            strokeStyle: ink,
                            strokeWidth: 0.4,
                            offsetLeft: 10,
                            offsetRight: 36,
                            configs: [
                                {
                                    left: [0.4, 0.3, -0.4],
                                    right: [0.3, 0.4, -0.5],
                                },
                                {
                                    left: [0.5, 0.3, -0.2],
                                    right: [0.6, 0.5, -0.1],
                                },
                            ],
                            scrollOffset: ['start 85%', 'end end'],
                        }}
                    />
                </div>

                <Container className="pb-80" style={{ color: ink }}>
                    <h2 className="text-4xl md:text-6xl font-[800] uppercase leading-[0.95] tracking-tight">
                        Farbe kommt beim Scrollen
                    </h2>
                    <p className="max-w-md text-balance font-mono text-sm">
                        Jede Farbfläche ist eine eigene Wave — Magenta, Orange, Amber laufen auf einer Spring-Animation
                        übereinander. Das Korn liegt als Overlay darüber.
                    </p>
                </Container>

                <div className="relative z-10 py-56 flex flex-col justify-center">
                    <div className="relative z-10 flex justify-center pt-40 pb-8">
                        <NsLogo centered className="w-36 h-auto text-white" />
                    </div>
                </div>
            </section>
        </div>
    );
}
