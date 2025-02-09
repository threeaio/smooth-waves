'use client';
import Wave from '@/components/wave';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function Home() {
    return (
        <div className="relative min-h-screen bg-[#181e1c] font-[family-name:var(--font-geist)]">
            <div className=" relative z-10 py-16 px-24 min-h-screen flex flex-col justify-between ">
                <div className="absolute -left-1/2 top-0 w-full h-full bg-[#172125] blur-[500px] rounded-full "></div>
                <div className="absolute left-0 top-0 w-full h-full">
                    <Wave
                        curveConfig={{
                            initialCurveIntensity: 0,
                            effectStrength: 0.3,
                            left: {
                                y: 0.3,
                                controlShiftX: 0.4,
                                verticalShiftY: 0.4,
                            },
                            right: {
                                y: 0.2,
                                controlShiftX: 0.7,
                                verticalShiftY: 0.1,
                            },
                        }}
                    />
                </div>
                <div className={` relative z-20`}>
                    <Image className=" " src="logo-3a.svg" width={120} height={200} alt="logo" />
                </div>
                <motion.div
                    className="opacity-0"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1, transition: { delay: 0.7, duration: 0.7 } }}
                >
                    <div className="grid grid-cols-8 gap-4 pb-24">
                        <h1 className="relative z-20 text-5xl leading-tight col-span-2 flex flex-col col-start-5 gap-6">
                            <span className="">
                                ai powered <br />
                                enthusiasm
                            </span>
                            <span className="text-[#F73A59]">
                                leveraging
                                <br /> your business
                            </span>
                        </h1>
                    </div>
                </motion.div>
            </div>

            <div className=" relative z-10 min-h-screen flex flex-col justify-center">
                <div className="absolute left-1/2 top-0 w-1/2 h-1/2 bg-[#2b2136] blur-[500px] rounded-full "></div>
                <div className="absolute left-0 top-0 w-full h-full">
                    <Wave
                        curveConfig={{
                            effectStrength: 0.4,
                            initialCurveIntensity: 0.9,
                            left: {
                                y: 0.2,
                                controlShiftX: 0.7,
                                verticalShiftY: -1.2,
                            },
                            right: {
                                y: 0.3,
                                controlShiftX: 0.3,
                                verticalShiftY: 1,
                            },
                        }}
                    />
                </div>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1, transition: { delay: 0.7, duration: 0.7 } }}
                >
                    <div className="relative z-10 p-24 grid grid-cols-8 gap-4">
                        <div className="relative col-start-3 col-span-2 flex flex-col gap-8">
                            <h2 className=" text-7xl leading-1 font-bold mb-24">change has come</h2>
                            <p className="">
                                We believe that the careful alignment of efficiency and standards can carve out space
                                for genuine human expression, meaningful design, and enduring value. Our technology —
                                particularly AI — streamlines processes lorem ipsum.
                            </p>
                            <p>
                                By minimizing complexity that doesn't serve a real purpose, we create an environment
                                where creativity, empathy, and intellectual depth can naturally unfold.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className=" relative z-10 min-h-screen flex flex-col justify-center">
                <div className="absolute -right-1/2 -top-full w-1/2 h-1/2 bg-[#6a4195] blur-[500px] rounded-full "></div>
                <div className="absolute -left-1/2 top-0 w-1/2 h-1/2 bg-[#414795] blur-[500px] rounded-full "></div>
                <div className="absolute left-0 top-0 w-full h-full">
                    <Wave
                        curveConfig={{
                            initialCurveIntensity: -2,
                            effectStrength: 0.1,
                            left: {
                                y: 0.4,
                                controlShiftX: 0.3,
                                verticalShiftY: -0.5,
                            },
                            right: {
                                y: 0.1,
                                controlShiftX: 0.2,
                                verticalShiftY: 0.4,
                            },
                        }}
                    />
                </div>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1, transition: { delay: 0.7, duration: 0.7 } }}
                >
                    <div className="relative  z-10 p-24 grid grid-cols-8 gap-4 pb-72">
                        <div className="relative col-start-3 col-span-2 flex flex-col gap-8">
                            <h2 className=" text-7xl leading-1 font-bold mb-24">current projects</h2>
                            <p className="">
                                We believe that the careful alignment of efficiency and standards can carve out space
                                for genuine human expression, meaningful design, and enduring value. Our technology —
                                particularly AI — streamlines processes lorem ipsum.
                            </p>
                            <p>
                                By minimizing complexity that doesn't serve a real purpose, we create an environment
                                where creativity, empathy, and intellectual depth can naturally unfold.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
