// 'use client';
import { Play, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Music2, Settings } from 'lucide-react';
import { Wave } from '@/components/wave';
import Image from 'next/image';
import { MotionDiv } from '@/components/motion-div';

export const dynamic = 'force-static';

export default function Home() {
    return (
        <div className="relative min-h-screen bg-white-washed-dark max-w-full  overflow-x-hidden">
            <div className=" relative z-10 py-16 px-24 mx-auto mt-[500px] mb-[500px] overflow-hidden max-w-screen-xl flex flex-col justify-end border border-ui-border/20 bg-white-washed rounded-[48px] shadow-2xl shadow-ui-shadow/10">
                {/* <div
                    className="absolute -left-1/2 -top-1/3 w-full h-full"
                    style={{
                        background: 'radia
                        l-gradient(ellipse at center, #2d3a64 0%, transparent 60%, transparent 100%)',
                    }}
                /> */}
                <div className="absolute left-0 top-0 w-full h-full ">
                    <Wave
                        waveConfig={{
                            fill: 'transparent',
                            strokeStyle: 'hsl(160 10% 16%)',
                            curveAmount: 12,
                            offsetLeft: -32,
                            offsetRight: -62,
                            configs: [
                                {
                                    left: [1.8, 0.2, -1.6],
                                    right: [1.4, 0.3, -1.9],
                                },
                                {
                                    left: [2.6, 0.1, -0.4],
                                    right: [1.4, 0.5, -0.8],
                                },
                            ],
                            scrollOffset: ['start 50%', 'start -10%'],
                        }}
                    />
                    <Wave
                        waveConfig={{
                            fill: 'hsl(160 10% 16%)',
                            strokeStyle: 'hsl(35 15% 62%)',
                            curveAmount: 12,
                            offsetLeft: -32,
                            offsetRight: -8,
                            configs: [
                                {
                                    left: [2.2, 0.3, -1.6],
                                    right: [1.2, 0.1, -1.9],
                                },
                                {
                                    left: [1.2, 0.3, -2.6],
                                    right: [1.2, 0.1, -2.9],
                                },
                            ],
                            scrollOffset: ['start 50%', 'start start'],
                        }}
                    />
                </div>
                <MotionDiv className="grid grid-cols-8 gap-4 pb-1 pt-72">
                    <h1 className="relative z-20 text-lg leading-1 font-bold col-span-3 flex flex-col col-start-7 gap-6 text-black-washed">
                        <span className="">
                            fluid motion <br />
                            in design
                        </span>
                        <span>
                            waves that
                            <br /> shape space
                        </span>
                    </h1>
                </MotionDiv>
            </div>

            <div
                className=" relative py-56  flex flex-col justify-center "
                style={{
                    mask: 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 40%)',
                }}
            >
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
                            // featheredOut: 'bottom',
                            flip: true,
                            fill: 'hsl(150 86.5% 59.4%)',
                            strokeStyle: 'hsl(165 5% 72%)',
                            strokeWidth: 2,
                            curveAmount: 20,
                            offsetLeft: 8,
                            offsetRight: 24,
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
                            scrollOffset: ['start 50%', 'start -10%'],
                        }}
                    />
                    {/* <Wave
                        waveConfig={{
                            featheredOut: 'top',
                            fill: 'hsl(150 86.5% 59.4%)',
                            strokeStyle: 'hsl(165 5% 72%)',
                            strokeWidth: 2,
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
                    /> */}
                </div>
                <MotionDiv className="relative z-10 p-24 grid grid-cols-8 gap-4 ">
                    <div className="relative col-start-3 col-span-2 flex flex-col gap-8 text-black-washed">
                        <h2 className=" text-4xl leading-1 font-bold">flow meets function</h2>
                        <p className="">
                            Discover how organic wave animations can transform static layouts into dynamic experiences.
                            Our wave components bring subtle motion and depth to your interfaces, creating a natural
                            rhythm that guides the users&apos;s journey.
                        </p>
                        <p>
                            By combining mathematical precision with visual fluidity, we create wave patterns that
                            respond naturally to user interaction while maintaining performance and accessibility.
                        </p>
                    </div>
                </MotionDiv>
            </div>

            <div className=" relative  py-56 flex flex-col justify-center bg-white-washed-dark">
                <div className="absolute left-0 top-0 w-full h-full">
                    <Wave
                        waveConfig={{
                            // featheredOut: 'top',
                            fill: 'hsl(150 86.5% 59.4%)',
                            strokeStyle: 'hsl(165 5% 72%)',
                            strokeWidth: 2,
                            curveAmount: 4,
                            offsetLeft: -24,
                            offsetRight: -7,
                            configs: [
                                {
                                    left: [1, 0.3, -0.3],
                                    right: [1, 0.2, -0.2],
                                },
                                {
                                    left: [0.4, 0.3, -0.4],
                                    right: [0.6, 0.2, -0.6],
                                },
                                {
                                    left: [0.6, 0.5, -0.2],
                                    right: [0.7, 0.6, -0.2],
                                },
                            ],
                            scrollOffset: ['start 50%', 'start -10%'],
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
