import Wave from '@/components/wave';
import Image from 'next/image';

export default function Home() {
    return (
        <div className="relative min-h-screen bg-[#171C1A] font-[family-name:var(--font-geist)]">
            <div className=" relative z-10 p-24 min-h-screen flex flex-col gap-48">
                <div className="absolute -left-1/2 top-0 w-full h-full bg-[#172125] blur-[500px] rounded-full "></div>
                <div className="absolute left-0 top-0 w-full h-full">
                    <Wave />
                </div>
                <div className={` relative z-20`}>
                    <Image className=" " src="logo-3a.svg" width={120} height={200} alt="logo" />
                </div>
                <div className="grid grid-cols-8 gap-4">
                    <h1 className="relative z-20 text-4xl leading-tight col-span-2 flex flex-col col-start-3 gap-6">
                        <span className="">ai powered enthusiasm</span>
                        <span className="text-[#F73A59]">leveraging your business</span>
                    </h1>
                </div>
            </div>

            <div className=" relative z-10 min-h-screen">
                <div className="absolute left-1/2 top-0 w-1/2 h-1/2 bg-[#2b2136] blur-[500px] rounded-full "></div>
                <div className="absolute left-0 top-0 w-full h-2/3">
                    <Wave />
                </div>
                <div className="relative z-10 p-24 grid grid-cols-8 gap-4">
                    <div className="relative col-start-3 col-span-2 flex flex-col gap-8">
                        <h2 className=" text-4xl leading-tight ">change has come</h2>
                        <p className="">
                            We believe that the careful alignment of efficiency and standards can carve out space for
                            genuine human expression, meaningful design, and enduring value. Our technology —
                            particularly AI — streamlines processes lorem ipsum.
                        </p>
                        <p>
                            By minimizing complexity that doesn’t serve a real purpose, we create an environment where
                            creativity, empathy, and intellectual depth can naturally unfold.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
