// 'use client';
import { Wave } from '@/components/wave';
import Image from 'next/image';
import { MotionDiv } from '@/components/motion-div';
import { InstallationInfo } from '@/components/installation-info';

export const dynamic = 'force-static';

export default function Home() {
    return (
        <div className="relative min-h-screen bg-white-washed-dark max-w-full  overflow-x-hidden">
            <div className=" relative min-h-screen flex flex-col justify-end items-center ">
                <Wave
                    waveConfig={{
                        fill: 'hsl(0 0% 85%)',
                        flip: false,
                        debug: true,
                        strokeStyle: 'hsl(35 15% 12%)',
                        curveAmount: 2,
                        strokeWidth: 0.4,
                        offsetLeft: -42,
                        offsetRight: -128,
                        scrollOffset: ['start start', 'end 10%'],
                        configs: [
                            {
                                left: [0.3, 0.3, 0.1],
                                right: [0.4, 0.3, -0.3],
                            },
                            {
                                left: [0.5, 0.3, -0.2],
                                right: [0.6, 0.3, -0.2],
                            },
                            {
                                left: [0.9, 0.3, -0.1],
                                right: [0.95, 0.3, 0.1],
                            },
                        ],
                    }}
                />
                <div className="relative z-10 py-24 px-4 md:px-24 xl:w-9/12  max-w-screen-xl  grid grid-cols-8 gap-4 md:gap-8 items-baseline">
                    <div className="col-span-8 text-[8rem] md:text-[12rem] 2xl:text-[18rem] leading-[.8em] text-black-washed font-bold opacity-80">
                        3A
                    </div>
                    <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2 col-start-4 md:col-start-3 xl:col-start-4  text-black-washed text-xs ">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                    </div>
                    <div className="col-span-6 sm:col-span-4 md:col-span-3  xl:col-span-2 col-start-4 sm:col-start-auto  text-black-washed text-xs ">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                    </div>
                </div>

                {/* <div className=" relative z-10 py-16 px-24 w-9/12 overflow-hidden max-w-screen-xl flex flex-col justify-end border border-ui-border/20 bg-white-washed rounded-[32px] shadow-2xl shadow-ui-shadow/10">
                    <div className="absolute left-0 top-0 w-full h-full ">
                        <Wave
                            waveConfig={{
                                debug: true,
                                fill: 'hsl(160 10% 9%)',
                                strokeStyle: 'hsl(35 15% 42%)',
                                curveAmount: 5,
                                offsetLeft: -32,
                                offsetRight: -8,
                                configs: [
                                    {
                                        left: [0.7, 0.3, 0.2],
                                        right: [0.04, 0.6, 0],
                                    },
                                    {
                                        left: [0.8, 0.5, 0.5],
                                        right: [0.1, 0.6, -0.3],
                                    },
                                ],
                                scrollOffset: ['start 70%', '100% 30%'],
                            }}
                        />
                        <div
                            className="absolute -left-1/2 -top-2/3 w-[220%] h-[120%] opacity-30 -rotate-12 mix-blend-screen"
                            style={{
                                background:
                                    'radial-gradient(ellipse at center, #33aaff 0%, transparent 60%, transparent 100%)',
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-8 gap-4 pb-1 pt-72">
                        <h1 className="relative z-20 text-lg leading-1  col-span-3 flex flex-col col-start-7 gap-6 text-black-washed">
                            <span className="">
                                fluid motion <br />
                                in design
                            </span>
                            <span>
                                waves that
                                <br /> shape space
                            </span>
                        </h1>
                    </div>
                </div> */}
            </div>

            <div className="relative py-56 pb-[500px]">
                <Wave
                    waveConfig={{
                        fill: 'rgba(20, 20, 55, 0.1)',
                        featheredOut: 'top',
                        debug: true,
                        strokeStyle: 'hsl(35 15% 12%)',
                        curveAmount: 3,
                        strokeWidth: 0.4,
                        offsetLeft: 24,
                        offsetRight: 108,
                        scrollOffset: ['start end', 'end 10%'],
                        configs: [
                            {
                                left: [0.1, 0.3, 0.1],
                                right: [0, 0.3, -0.2],
                            },
                            {
                                left: [0.5, 0.3, 0.2],
                                right: [0.2, 0.3, 0.2],
                            },
                        ],
                    }}
                />
                {/* <div className="relative grid grid-cols-2 gap-px max-w-screen-xl mx-auto rounded-3xl overflow-hidden opacity-95">
                    <div className="relative rounded-0 overflow-hidden aspect-square bg-black-washed">
                        <Image
                            className="object-cover opacity-50 filter saturate-0"
                            src="/Solitude in Modern Architecture.jpeg"
                            alt="Image 1"
                            fill
                        />
                    </div>
                    <div className="relative rounded-0 overflow-hidden aspect-square bg-black-washed">
                        <Image
                            className="object-cover opacity-50 filter saturate-0"
                            src="/Serenity in Curvilinear Modernity.jpeg"
                            alt="Image 1"
                            fill
                        />
                    </div>
                    <div className="relative col-span-2 rounded-0 overflow-hidden aspect-[2/1] bg-black-washed">
                        <Image
                            className="object-cover object-[center_75%] opacity-50 filter saturate-0"
                            src="/Architectural Elegance with Human Element.jpeg"
                            alt="Image 1"
                            fill
                        />
                    </div>
                </div> */}
            </div>

            <div className=" relative py-56  flex flex-col justify-center ">
                <div className="absolute left-0 top-0 w-full h-full">
                    <Wave
                        waveConfig={{
                            flip: true,
                            debug: true,
                            fill: 'hsl(0 0% 85%)',
                            strokeStyle: 'hsl(165 5% 72%)',
                            strokeWidth: 2,
                            curveAmount: 4,
                            offsetLeft: 24,
                            offsetRight: 44,
                            scrollOffset: ['start end', 'end start'],
                            configs: [
                                {
                                    left: [0, 0.7, 0],
                                    right: [0.8, 0.2, 0.2],
                                },
                                {
                                    left: [0.8, 0.2, -0.1],
                                    right: [0.8, 0.3, -0.2],
                                },
                                {
                                    left: [1, 0.6, 0],
                                    right: [0.8, 0.5, -0.2],
                                },
                            ],
                        }}
                    />
                </div>
                <MotionDiv className="relative z-10 px-4 md:px-24 grid grid-cols-8 gap-4 ">
                    <div className="relative col-span-6 col-start-2 md:col-start-3 md:col-span-3 xl:col-start-3 xl:col-span-2 flex flex-col gap-8 text-black-washed">
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
                            fill: 'hsl(0 0% 85%)',
                            strokeStyle: 'hsl(165 5% 72%)',
                            strokeWidth: 2,
                            curveAmount: 4,
                            offsetLeft: -32,
                            offsetRight: -12,
                            debug: true,
                            configs: [
                                {
                                    left: [1, 0.3, -0.3],
                                    right: [1, 0.2, -0.2],
                                },
                                {
                                    left: [0.5, 0.3, -0.35],
                                    right: [0.7, 0.2, -0.6],
                                },
                                {
                                    left: [0.6, 0.35, -0.3],
                                    right: [0.7, 0.6, -0.2],
                                },
                            ],
                            scrollOffset: ['start 70%', '100% 30%'],
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
