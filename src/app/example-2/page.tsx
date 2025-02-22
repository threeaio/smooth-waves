// 'use client';
import { Wave } from '@/components/wave';
import Image from 'next/image';
import { MotionDiv } from '@/components/motion-div';
import { InstallationInfo } from '@/components/installation-info';

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
                                    right: [0.9, 0.6, 1],
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
                <MotionDiv className="relative z-10 pb-48 grid grid-cols-8 grid-rows-2 gap-12 text-xs mix-blend-difference">
                    <div className="col-start-3 col-span-6">
                        machine
                        <br /> generated.
                    </div>
                    <div className="!col-start-3 col-span-2 md:col-span-1">
                        delivered
                        <br /> with soul.
                    </div>
                    <div className="col-span-2 md:col-span-1">
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
                                    left: [0, 0.6, 0],
                                    right: [0.3, 0.3, -0.2],
                                },
                                {
                                    left: [0.9, 0.3, -0.5],
                                    right: [0.94, 0.4, -0.6],
                                },
                            ],
                            scrollOffset: ['start end', 'end 50%'],
                        }}
                    />
                </div>
                <MotionDiv className="relative p-2 z-10 grid grid-cols-8 gap-4">
                    <InstallationInfo className="col-span-8 w-full max-w-[1200px] mx-auto shadow-xl " />
                </MotionDiv>
            </div>
            <div className="relative col-span-8 col-start-3 pt-12 pb-96 px-12">
                <Image className="mx-auto relative" src="logo_triangle_dark.svg" width={180} height={40} alt="logo" />
            </div>
        </div>
    );
}
