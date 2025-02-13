// 'use client';
import { Play, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Music2, Settings } from 'lucide-react';
import { Wave } from '@/components/wave';
import Image from 'next/image';
import { MotionDiv } from '@/components/motion-div';

export const dynamic = 'force-static';

export default function Home() {
    return (
        <div className="relative min-h-screen bg-gray-darkest-washed max-w-full  overflow-x-hidden">
            <div className=" relative z-10 py-16 px-24 min-h-screen flex flex-col justify-end ">
                {/* <div
                    className="absolute -left-1/2 -top-1/3 w-full h-full"
                    style={{
                        background: 'radial-gradient(ellipse at center, #2d3a64 0%, transparent 60%, transparent 100%)',
                    }}
                /> */}
                <div className="absolute left-0 top-0 w-full h-full ">
                    <Wave
                        waveConfig={{
                            featheredOut: 'top',
                            strokeStyle: 'rgba(255,255,255,0.4)',
                            fill: 'hsl(160 10% 14%)',
                            curveAmount: 14,
                            offsetLeft: -24,
                            offsetRight: -8,
                            configs: [
                                {
                                    left: [0.5, 0.2, 0.2],
                                    right: [0.05, 0.7, -0.2],
                                },
                                {
                                    left: [0.6, 0.2, 0.4],
                                    right: [0.2, 0.6, -0.2],
                                },
                                {
                                    left: [0.9, 0.6, 0.2],
                                    right: [0.3, 0.4, -0.4],
                                },
                            ],
                            scrollOffset: ['5% 0%', '150% 80%'],
                        }}
                    />
                </div>
                <MotionDiv className="grid grid-cols-8 gap-4 pb-32">
                    <h1 className="relative z-20 text-4xl leading-1 font-bold col-span-3 flex flex-col col-start-5 gap-6">
                        <span className="">
                            ai empowered <br />
                            enthusiasm
                        </span>
                        <span>
                            leveraging
                            <br /> your business
                        </span>
                    </h1>
                </MotionDiv>
            </div>

            <div className=" relative py-56  flex flex-col justify-center">
                {/* <div
                    className="absolute -right-1/2 -top-1/4 w-full h-full opacity-30"
                    style={{
                        background: 'radial-gradient(ellipse at center, #414795 0%, transparent 70%)',
                    }}
                /> */}
                {/* <div
                    className="absolute left-1/2 top-0 w-full h-1/2 opacity-70"
                    style={{
                        transform: 'translateX(-50%)',
                        background: 'radial-gradient(ellipse at center, #322343 0%, transparent 70%)',
                    }}
                /> */}
                <div className="absolute left-0 top-0 w-full h-full">
                    <Wave
                        waveConfig={{
                            featheredOut: 'top',
                            fill: 'hsl(160 10% 16%)',
                            strokeStyle: 'rgba(255,255,255,0.4)',
                            curveAmount: 20,
                            offsetLeft: -8,
                            offsetRight: -24,
                            configs: [
                                {
                                    left: [0, 0.7, 0],
                                    right: [0.5, 0.2, 0.6],
                                },
                                {
                                    left: [0, 0.6, 0],
                                    right: [0.5, 0.2, 0],
                                },
                                {
                                    left: [1, 0.3, -0.2],
                                    right: [1, 0.3, -0.2],
                                },
                            ],
                            scrollOffset: ['start 70%', '100% 30%'],
                        }}
                    />
                </div>
                <MotionDiv className="relative z-10 p-24 grid grid-cols-8 gap-4">
                    <div className="relative col-start-3 col-span-2 flex flex-col gap-8">
                        <h2 className=" text-4xl leading-1 font-bold">change has come</h2>
                        <p className="">
                            We believe that the careful alignment of efficiency and standards can carve out space for
                            genuine human expression, meaningful design, and enduring value. Our technology —
                            particularly AI — streamlines processes lorem ipsum.
                        </p>
                        <p>
                            By minimizing complexity that doesn&apos;t serve a real purpose, we create an environment
                            where creativity, empathy, and intellectual depth can naturally unfold.
                        </p>
                    </div>
                </MotionDiv>
            </div>

            <div className=" relative  py-56 flex flex-col justify-center bg-white-washed-dark">
                <div className="absolute left-0 top-0 w-full h-full">
                    <Wave
                        waveConfig={{
                            fill: 'hsl(160 10% 16%)',
                            strokeStyle: 'rgba(255,255,255,0.3)',
                            curveAmount: 4,
                            offsetLeft: -24,
                            offsetRight: -7,
                            configs: [
                                {
                                    left: [0.3, 0.5, 0.2],
                                    right: [0.1, 0.6, 0.2],
                                },
                                {
                                    left: [0.4, 0.3, -0.4],
                                    right: [0.6, 0.2, -0.6],
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
                <MotionDiv className="relative  z-10 p-24 grid grid-cols-12 gap-12  ">
                    <div className="relative col-span-8 col-start-3">
                        {/* <div className="absolute rounded-full inset-0 bg-[#332964] blur-[200px]"></div> */}
                        {/* <div className="absolute rounded-full top-0 bottom-0 left-4 right-4 translate-y-2 bg-[#43475c] bg-blend-color-dodge blur-[30px]"></div> */}
                        <div className="relative grid grid-cols-8 border border-ui-border gap-12 p-8 bg-linear-gradient bg-gradient-to-t from-ui-gradient-bottom  to-ui-gradient-top  rounded-full shadow-xl shadow-ui-shadow/20">
                            <SkipBack className="size-4 mx-auto text-white-washed" />
                            <Play className="size-4 mx-auto text-white-washed" />
                            <SkipForward className="size-4 mx-auto text-white-washed" />
                            <Volume2 className="size-4 mx-auto text-white-washed" />
                            <Music2 className="size-4 mx-auto text-white-washed" />
                            <Repeat className="size-4 mx-auto text-white-washed" />
                            <Shuffle className="size-4 mx-auto text-white-washed" />
                            <Settings className="size-4 mx-auto text-white-washed" />
                        </div>
                    </div>
                </MotionDiv>
            </div>
            <div className="relative col-span-8 col-start-3 pt-32 pb-96 bg-white-washed-dark">
                <Image className="mx-auto " src="logo_triangle_dark.svg" width={320} height={200} alt="logo" />
                {/* <p className="text-center mt-6 text-lg font-mono text-[#1b191e]">solutions</p> */}
            </div>
        </div>
    );
}
