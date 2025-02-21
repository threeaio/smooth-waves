// 'use client';
import { Wave } from '@/components/wave';
import Image from 'next/image';
import { MotionDiv } from '@/components/motion-div';
import { InstallationInfo } from '@/components/installation-info';
import { ReactIcon } from '@/components/logos/react-icon';
import { MotionIcon } from '@/components/logos/motion-icon';

export const dynamic = 'force-static';

export default function Home() {
    return (
        <div className="relative min-h-screen bg-gray-darkest-washed max-w-full  overflow-x-hidden">
            <div className=" relative z-10 py-16 px-24 min-h-screen flex flex-col justify-end ">
                <div
                    className="absolute -left-1/2 -top-1/3 -rotate-12 w-[140%] h-full opacity-60"
                    style={{
                        background: 'radial-gradient(ellipse at center, #2d3a64 0%, transparent 60%, transparent 100%)',
                    }}
                />
                <div className="absolute left-0 top-0 w-full h-full ">
                    <Wave
                        waveConfig={{
                            featheredOut: 'top',
                            strokeStyle: 'rgba(255,255,255,0.2)',
                            strokeWidth: 1,
                            fill: 'hsl(160 10% 16%)',
                            curveAmount: 1,
                            offsetLeft: -8,
                            offsetRight: -42,
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
                    <div className="relative z-20 col-span-3 col-start-5 flex flex-col gap-6">
                        <h1 className="text-5xl text-white leading-1 font-bold ">
                            <span className="">smooth waves</span>
                        </h1>
                        <p className="text-balance">
                            A simple motion based react-component to create smooth, scroll-based wave animations.
                        </p>
                    </div>
                    <div className="col-span-3 col-start-5 flex flex-row gap-8 items-center">
                        <ReactIcon className="size-10 text-white-washed" />
                        <MotionIcon className="size-16" />
                    </div>
                </MotionDiv>
            </div>

            <div className=" relative py-56  flex flex-col justify-center">
                <div
                    className="absolute -right-1/2 -top-1/3 rotate-12 w-[140%] h-full opacity-60"
                    style={{
                        background: 'radial-gradient(ellipse at center, #2d3a64 0%, transparent 60%, transparent 100%)',
                    }}
                />
                <div className="absolute left-0 top-0 w-full h-full">
                    <Wave
                        waveConfig={{
                            featheredOut: 'top',
                            fill: 'hsl(160 10% 16%)',
                            strokeStyle: 'rgba(255,255,255,0.2)',
                            strokeWidth: 1,
                            curveAmount: 1,
                            offsetLeft: -42,
                            offsetRight: -8,
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
                                    left: [0.9, 0.3, -0.22],
                                    right: [0.8, 0.3, -0.22],
                                },
                            ],
                            scrollOffset: ['start 70%', '100% 30%'],
                        }}
                    />

                    <Wave
                        waveConfig={{
                            featheredOut: 'bottom',
                            fill: 'transparent',
                            strokeStyle: 'rgba(255,255,255,0.2)',
                            strokeWidth: 1,
                            curveAmount: 1,
                            offsetLeft: -42,
                            offsetRight: -8,
                            configs: [
                                {
                                    left: [0.1, 0.7, 0],
                                    right: [0.6, 0.2, 0.6],
                                },
                                {
                                    left: [0.3, 0.6, 0],
                                    right: [0.6, 0.2, 0],
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
                <MotionDiv className="relative  z-10 p-4 md:p-12 xl:p-24 grid grid-cols-8 gap-4">
                    <InstallationInfo className="col-span-8 w-full max-w-[1200px] mx-auto" />
                </MotionDiv>
            </div>

            <div className=" relative  py-56 flex flex-col justify-center bg-gray-darkest-washed">
                <div
                    className="absolute -left-1/2 -top-1/3 -rotate-12 w-[140%] h-full opacity-60"
                    style={{
                        background: 'radial-gradient(ellipse at center, #2d3a64 0%, transparent 60%, transparent 100%)',
                    }}
                />
                <Wave
                    waveConfig={{
                        flip: true,
                        fill: 'hsl(165 5% 72%)',
                        strokeStyle: 'rgba(255,255,255,.2)',
                        strokeWidth: 1,
                        curveAmount: 0.4,
                        offsetLeft: -8,
                        offsetRight: -64,
                        configs: [
                            {
                                left: [0.8, 0.3, -0.3],
                                right: [0.7, 0.2, -0.2],
                            },
                            {
                                left: [0.6, 0.3, -0.5],
                                right: [0.6, 0.3, -0.4],
                            },
                            {
                                left: [0.4, 0.2, -0.3],
                                right: [0.45, 0.3, -0.4],
                            },
                        ],
                        scrollOffset: ['start 80%', 'end end'],
                    }}
                />
                <div className="relative col-span-8 col-start-3 py-64">
                    <Image className="mx-auto " src="logo_triangle_dark.svg" width={320} height={200} alt="logo" />
                    {/* <p className="text-center mt-6 text-lg font-mono text-[#1b191e]">solutions</p> */}
                </div>
            </div>
        </div>
    );
}
