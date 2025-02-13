'use client';
import { Play, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Music2, Settings } from 'lucide-react';
import { Wave } from '@threeaio/smooth-waves';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function Home() {
    return (
        <div className="relative min-h-screen bg-[#242e2b] font-[family-name:var(--font-geist)] max-w-full  overflow-x-hidden">
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
                            fillStyle: 'transparent',
                            strokeStyle: 'rgba(255,255,255,0.4)',
                            forceOverlay: false,
                            curveAmount: 14,
                            offsetLeft: -24,
                            offsetRight: -8,
                            stable: {
                                left: [0.5, 0.2, 1],
                                right: [0.05, 0.7, -0.2],
                            },
                            in: {
                                left: [0.6, 0.2, 0.4],
                                right: [0.2, 0.6, -0.2],
                            },
                            out: {
                                left: [0.9, 0.6, 0.2],
                                right: [0.3, 0.4, -0.4],
                            },
                            scrollOffset: ['5% 0%', '150% 80%'],
                        }}
                    />
                </div>
                <div className={` fixed top-12 left-12 z-200`}>
                    <Image className=" " src="logo_triangle.svg" width={180} height={200} alt="logo" />
                </div>
                <motion.div
                    className="grid grid-cols-8 gap-4 pb-32"
                    initial={{ opacity: 0, y: 20 }}
                    viewport={{ once: true }}
                    whileInView={{ opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.7 } }}
                >
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
                </motion.div>
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
                            fillStyle: 'transparent',
                            strokeStyle: 'rgba(255,255,255,0.4)',
                            forceOverlay: false,
                            curveAmount: 20,
                            offsetLeft: -8,
                            offsetRight: -24,
                            stable: {
                                left: [0, 0.7, 0],
                                right: [0.5, 0.2, 0.6],
                            },
                            in: {
                                left: [0, 0.6, 0],
                                right: [0.5, 0.2, 0],
                            },
                            out: {
                                left: [1, 0.3, -0.2],
                                right: [1, 0.3, -0.2],
                            },
                            scrollOffset: ['start 70%', '100% 30%'],
                        }}
                    />
                </div>
                <motion.div
                    className="relative z-10 p-24 grid grid-cols-8 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    viewport={{ once: true }}
                    whileInView={{ opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.7 } }}
                >
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
                </motion.div>
            </div>

            <div className=" relative  py-56 flex flex-col justify-center bg-[#b4bcba]">
                <div className="absolute left-0 top-0 w-full h-full">
                    <Wave
                        waveConfig={{
                            fillStyle: 'transparent',
                            fillStyleOverlay: '#242e2b',
                            strokeStyle: 'rgba(255,255,255,0.3)',
                            forceOverlay: true,
                            curveAmount: 4,
                            offsetLeft: -24,
                            offsetRight: -7,
                            stable: {
                                left: [0.3, 0.5, 0.2],
                                right: [0.1, 0.6, 0.2],
                            },
                            in: {
                                left: [0.4, 0.3, -0.4],
                                right: [0.6, 0.2, -0.6],
                            },
                            out: {
                                left: [1, 0.3, -0.3],
                                right: [1, 0.2, -0.2],
                            },
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
                <motion.div
                    className="relative  z-10 p-24 grid grid-cols-12 gap-12  "
                    initial={{ opacity: 0, y: 100 }}
                    viewport={{ once: true }}
                    whileInView={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.7 } }}
                >
                    <div className="relative col-span-8 col-start-3">
                        {/* <div className="absolute rounded-full inset-0 bg-[#332964] blur-[200px]"></div> */}
                        {/* <div className="absolute rounded-full top-0 bottom-0 left-4 right-4 translate-y-2 bg-[#43475c] bg-blend-color-dodge blur-[30px]"></div> */}
                        <div className="relative grid grid-cols-8 border border-[#2a3532] gap-12 p-8 bg-linear-gradient bg-gradient-to-t from-[#1a211f] to-[#2a3532]  rounded-full shadow-xl shadow-[#242e2b]/20">
                            <SkipBack className="size-4 mx-auto text-white/80 hover:text-white transition-colors" />
                            <Play className="size-4 mx-auto text-white/80 hover:text-white transition-colors" />
                            <SkipForward className="size-4 mx-auto text-white/80 hover:text-white transition-colors" />
                            <Volume2 className="size-4 mx-auto text-white/80 hover:text-white transition-colors" />
                            <Music2 className="size-4 mx-auto text-white/80 hover:text-white transition-colors" />
                            <Repeat className="size-4 mx-auto text-white/80 hover:text-white transition-colors" />
                            <Shuffle className="size-4 mx-auto text-white/80 hover:text-white transition-colors" />
                            <Settings className="size-4 mx-auto text-white/80 hover:text-white transition-colors" />
                        </div>
                    </div>
                </motion.div>
            </div>
            <div className="relative col-span-8 col-start-3 pt-32 pb-96 bg-[#b4bcba]">
                <Image className="mx-auto " src="logo_triangle_dark.svg" width={320} height={200} alt="logo" />
                {/* <p className="text-center mt-6 text-lg font-mono text-[#1b191e]">solutions</p> */}
            </div>
        </div>
    );
}
