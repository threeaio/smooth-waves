import Wave from '@/components/wave';
import Image from 'next/image';

export default function Home() {
    return (
        <div className="relative min-h-screen bg-[#171C1A] font-[family-name:var(--font-geist)]">
            <div className={` relative z-20 p-24 bg-[#171C1A] `}>
                <Image className=" " src="logo-3a.svg" width={120} height={200} alt="logo" />
            </div>
            <div className=" relative z-10 p-24 min-h-[3000px] grid grid-cols-8  gap-4">
                <div className="absolute -left-1/4 top-0 w-full h-screen bg-[#172125] blur-[500px] rounded-full "></div>
                <div className="absolute left-0 top-0 w-full h-screen">
                    <Wave />
                </div>
                <h1 className="relative z-20 text-4xl leading-tight col-span-2 flex flex-col col-start-4 gap-8">
                    <span className="">ai powered enthusiasm</span>
                    <span className="text-[#F73A59]">leveraging your business</span>
                </h1>
            </div>
        </div>
    );
}
