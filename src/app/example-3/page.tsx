// 'use client';
import { Wave } from '@/components/wave';
import Image from 'next/image';

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
                                    right: [0.5, 0.4, -0.3],
                                },
                                {
                                    left: [0.9, 0.6, -0.6],
                                    right: [0.3, 0.4, -0.4],
                                },
                            ],
                            scrollOffset: ['50% 0%', '150% 80%'],
                        }}
                    />
                </div>
            </div>
            <div className="relative z-10 grid grid-cols-2 min-h-screen">
                <div className="relative z-10">
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
                                    right: [0.5, 0.4, -0.3],
                                },
                                {
                                    left: [0.9, 0.6, -0.6],
                                    right: [0.3, 0.4, -0.4],
                                },
                            ],
                            scrollOffset: ['50% 0%', '150% 80%'],
                        }}
                    />
                </div>
                <div className="bg-white-washed-dark text-black-washed flex flex-col justify-center">
                    <div className="text-lg p-24 font-mono">
                        <p className="">
                            In our standardized world, I embrace unique design and personal aesthetics. Not as a
                            counterpoint to standardization, but as a celebration of the creative freedom they enable.
                        </p>
                    </div>
                </div>
            </div>

            <div className=" relative  py-56 flex flex-col justify-center bg-white-washed-dark">
                <div className="absolute -inset-x-12 top-0 bottom-0">
                    <Wave
                        waveConfig={{
                            fill: 'hsl(160 10% 16%)',
                            strokeStyle: 'rgba(255,255,255,0.4)',
                            strokeWidth: 80,
                            curveAmount: 1,
                            offsetLeft: -94,
                            offsetRight: -104,
                            configs: [
                                {
                                    left: [0.4, 0.5, 0.2],
                                    right: [0.3, 0.6, 0.2],
                                },
                                {
                                    left: [0.5, 0.3, -0.3],
                                    right: [0.9, 0.2, -0.6],
                                },
                                {
                                    left: [1, 0.3, -0.3],
                                    right: [1, 0.2, -0.2],
                                },
                            ],
                            scrollOffset: ['start 70%', '100% 30%'],
                        }}
                    />
                </div>
                {/* <div
                    className="absolute z-10 -left-1/3 top-0 w-[200%] h-full rounded-full opacity-40"
                    style={{
                        background: 'radial-gradient(ellipse at center, #414795 0%, transparent 70%)',
                    }}
                /> */}
            </div>
            <div className="relative col-span-8 col-start-3 pt-32 pb-96 bg-white-washed-dark">
                <Image className="mx-auto relative" src="logo_triangle_dark.svg" width={180} height={40} alt="logo" />
            </div>
        </div>
    );
}
