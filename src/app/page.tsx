'use client';
import { DrizzleLogo } from '@/components/icons/drizzle-logo';
import { GatsbyLogo } from '@/components/icons/gatsby-logo';
import { LangChainLogo } from '@/components/icons/langchain-logo';
import { LangGraphLogo } from '@/components/icons/langgraph-logo';
import { PostgresLogo } from '@/components/icons/postgres-logo';
import { ReactLogo } from '@/components/icons/react-logo';
import { SolidLogo } from '@/components/icons/solid-logo';
import { ZodLogo } from '@/components/icons/zod-logo';
import Wave from '@/components/wave';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function Home() {
    return (
        <div className="relative min-h-screen bg-[#242e2b] font-[family-name:var(--font-geist)] max-w-full  overflow-x-hidden">
            <div className=" relative z-10 py-16 px-24 min-h-screen flex flex-col justify-between ">
                {/* <div className="absolute -left-1/2 top-0 w-full h-1/2 bg-[#2d3a64] blur-[500px] rounded-full  "></div> */}
                <div className="absolute left-0 top-0 w-full h-full ">
                    <Wave
                        waveConfig={{
                            forceOverlay: false,
                            curveAmount: 1,
                            offsetLeft: -10,
                            offsetRight: -1,
                            stable: {
                                left: [0.5, 0.2, 1],
                                right: [0.05, 0.7, -0.2],
                            },
                            in: {
                                left: [0.2, 0.2, 0.2],
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
                <div className={` relative z-20`}>
                    <Image className=" " src="logo-3a.svg" width={90} height={200} alt="logo" />
                </div>
                <motion.div
                    className="opacity-0"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.7 } }}
                >
                    <div className="grid grid-cols-8 gap-4 pb-32">
                        <h1 className="relative z-20 text-4xl leading-1 font-bold col-span-3 flex flex-col col-start-5 gap-6">
                            <span className="">
                                ai powered <br />
                                enthusiasm
                            </span>
                            {/* className="text-[#F73A59]" */}
                            <span>
                                leveraging
                                <br /> your business
                            </span>
                        </h1>
                    </div>
                </motion.div>
            </div>

            <div className=" relative py-56 z-10 flex flex-col justify-center">
                <div className="absolute -right-1/3 -top-1/3 w-1/2 h-1/2 bg-[#414795] blur-[500px] rounded-full "></div>
                <div className="absolute left-1/2 top-0 w-1/2 h-1/2 bg-[#322343] blur-[500px] rounded-full "></div>
                <div className="absolute left-0 top-0 w-full h-full">
                    <Wave
                        waveConfig={{
                            forceOverlay: false,
                            curveAmount: 1,
                            offsetLeft: -1,
                            offsetRight: -10,
                            stable: {
                                left: [0, 0.7, 0],
                                right: [0.5, 0.2, 0.6],
                            },
                            in: {
                                left: [0, 1, 0],
                                right: [0.5, 0, 0],
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
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.7 } }}
                >
                    <div className="relative z-10 p-24 grid grid-cols-8 gap-4">
                        <div className="relative col-start-3 col-span-2 flex flex-col gap-8">
                            <h2 className=" text-4xl leading-1 font-bold">change has come</h2>
                            <p className="">
                                We believe that the careful alignment of efficiency and standards can carve out space
                                for genuine human expression, meaningful design, and enduring value. Our technology —
                                particularly AI — streamlines processes lorem ipsum.
                            </p>
                            <p>
                                By minimizing complexity that doesn&apos;t serve a real purpose, we create an
                                environment where creativity, empathy, and intellectual depth can naturally unfold.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className=" relative z-10 py-56 flex flex-col justify-center bg-[#b4bcba]">
                <div className="absolute left-0 top-0 w-full h-full">
                    <Wave
                        waveConfig={{
                            forceOverlay: true,
                            curveAmount: 1,
                            offsetLeft: -5,
                            offsetRight: -3,
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
                <div className="absolute -left-1/3 top-0 w-1/2 h-1/2 bg-[#414795] blur-[500px] rounded-full "></div>
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.7 } }}
                >
                    <div className="relative  z-10 p-24 grid grid-cols-12 gap-12  ">
                        <div className="relative col-span-8 col-start-3">
                            <div className="absolute rounded-full inset-0 bg-[#332964] blur-[200px]"></div>
                            {/* <div className="absolute rounded-full top-0 bottom-0 left-4 right-4 translate-y-2 bg-[#43475c] bg-blend-color-dodge blur-[30px]"></div> */}
                            <div className="relative grid grid-cols-8 border border-[#252631] gap-12 p-8 bg-linear-gradient bg-gradient-to-t from-[#1b191e] to-[#26303e]   rounded-full shadow-xl ">
                                <DrizzleLogo className="size-8 mx-auto text-[#C5F74F]" />
                                <ReactLogo className="size-8 mx-auto text-[#00D8FF]" />
                                <ZodLogo className="size-8 mx-auto text-[#3068B7]" />
                                <SolidLogo className="size-8 mx-auto ]" />
                                <PostgresLogo className="size-8 mx-auto text-[#3068B7]" />
                                <LangGraphLogo className="size-8 mx-auto text-[#fff]" />
                                <LangChainLogo className="size-8 mx-auto text-[#fff]" />
                                <GatsbyLogo className="size-8 mx-auto text-[#64328B]" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            <div className="relative col-span-8 col-start-3 pt-32 pb-96 bg-[#b4bcba]">
                <Image className="mx-auto " src="logo-3a_inv.svg" width={120} height={200} alt="logo" />
                <p className="text-center mt-6 text-lg font-mono text-[#1b191e]">solutions</p>
            </div>
        </div>
    );
}
