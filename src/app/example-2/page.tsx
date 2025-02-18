// 'use client';
import { Play, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Music2, Settings } from 'lucide-react';
import { Wave } from '@/components/wave';
import Image from 'next/image';
import { MotionDiv } from '@/components/motion-div';

export const dynamic = 'force-static';

export default function Home() {
    return (
        <div className="relative min-h-screen bg-[#d4d5d4] max-w-full  overflow-x-hidden">
            <div className="min-h-screen relative   flex flex-col justify-end bg-[#171c1a] ">
                <div
                    className="absolute -right-1/2 -top-1/4 w-full h-full opacity-30"
                    style={{
                        background: 'radial-gradient(ellipse at center, #414795 0%, transparent 70%)',
                    }}
                />
                <div
                    className="absolute -left-1/4 -top-1/4 w-full h-full opacity-30"
                    style={{
                        background: 'radial-gradient(ellipse at center, #213A56   0%, transparent 70%)',
                    }}
                />
                <div className="absolute left-0 top-0 w-full h-full">
                    <Wave
                        waveConfig={{
                            fill: '#171C1A',
                            strokeStyle: 'hsl(165 5% 72%)',
                            strokeWidth: 2,
                            curveAmount: 0,
                            offsetLeft: 8,
                            offsetRight: 24,
                            configs: [
                                {
                                    left: [0.5, 0.5, 0],
                                    right: [0.1, 0.7, 0],
                                },
                                {
                                    left: [0.6, 0.3, 0],
                                    right: [0.9, 0.6, 0],
                                },
                            ],
                            scrollOffset: ['start start', 'end 50%'],
                        }}
                    />
                    <Wave
                        waveConfig={{
                            // featheredOut: 'bottom',
                            flip: true,
                            fill: '#c9cbce',
                            strokeStyle: 'hsl(165 5% 72%)',
                            strokeWidth: 2,
                            curveAmount: 0,
                            offsetLeft: 8,
                            offsetRight: 24,
                            configs: [
                                {
                                    left: [0.02, 0.7, 0],
                                    right: [0.25, 0.4, -0.1],
                                },
                                {
                                    left: [0.8, 0.7, 0],
                                    right: [0.05, 0.4, -0.1],
                                },
                            ],
                            scrollOffset: ['start start', 'end 50%'],
                        }}
                    />
                </div>
                <MotionDiv className="relative z-10 pb-48 grid grid-cols-8 grid-rows-2 gap-12 text-xs">
                    <div className="col-start-3 col-span-4">
                        machine
                        <br /> generated.
                    </div>
                    <div className="col-start-3 col-span-1">
                        delivered
                        <br /> with soul.
                    </div>
                    <div className="col-span-1">
                        change
                        <br /> has come.
                    </div>
                </MotionDiv>
            </div>

            <div className=" relative  py-56 flex flex-col justify-center">
                <div className="absolute left-0 top-0 w-full h-full">
                    <Wave
                        waveConfig={{
                            // featheredOut: 'bottom',
                            fill: '#c9cbce',
                            strokeStyle: 'hsl(165 5% 72%)',
                            strokeWidth: 2,
                            curveAmount: 0,
                            offsetLeft: 8,
                            offsetRight: 24,
                            configs: [
                                {
                                    left: [0.55, 0.6, 0],
                                    right: [0, 0.3, 0],
                                },
                                {
                                    left: [0.5, 0.3, 0.6],
                                    right: [0.6, 0.4, 0.4],
                                },
                            ],
                            scrollOffset: ['start start', 'end 50%'],
                        }}
                    />
                </div>
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
            <div className="relative col-span-8 col-start-3 pt-32 pb-96 ">
                <Image className="mx-auto " src="logo_triangle_dark.svg" width={320} height={200} alt="logo" />
                {/* <p className="text-center mt-6 text-lg font-mono text-[#1b191e]">solutions</p> */}
            </div>
        </div>
    );
}
