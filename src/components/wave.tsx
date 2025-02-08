'use client';
import { motion, useAnimationFrame, useScroll, useVelocity } from 'motion/react';
import { useState } from 'react';

export default function Wave() {
    const { scrollY } = useScroll();
    const velocity = useVelocity(scrollY);
    const [currentVariant, setCurrentVariant] = useState<
        'neutral' | 'strongUp' | 'slightUp' | 'strongDown' | 'slightDown'
    >('neutral');

    const WIDTH = 100;
    const HEIGHT = 100;

    const curve = {
        right: {
            y: 0.2,
            controlShiftX: 0.9,
            verticalShiftY: -0.5,
        },
        left: {
            y: 0.7,
            controlShiftX: 0.6,
            verticalShiftY: 0.6,
        },
    };

    // Helper function to create wave path
    const createWavePath = (curveIntensity: number = 1) => {
        const startPoint = `M 0,0`;
        const topLine = `L ${WIDTH},0`;
        const rightLine = `L ${WIDTH},${HEIGHT * curve.right.y}`;

        const curveControl1 = `${WIDTH - curve.right.controlShiftX * WIDTH * curveIntensity},${curve.right.y * HEIGHT + curve.right.verticalShiftY * curveIntensity * HEIGHT}`;
        const curveControl2 = `${curve.left.controlShiftX * WIDTH * curveIntensity},${curve.left.y * HEIGHT + curve.left.verticalShiftY * curveIntensity * HEIGHT}`;
        const curveEnd = curve.left.y * HEIGHT;

        const waveCurve = `C ${curveControl1} ${curveControl2} 0,${curveEnd}`;

        return `${startPoint} ${topLine} ${rightLine} ${waveCurve} Z`;
    };

    // Define variants using the helper function
    const pathVariants = {
        neutral: {
            d: createWavePath(0.4),
        },
        strongUp: {
            d: createWavePath(-1),
        },
        slightUp: {
            d: createWavePath(-0.8),
        },
        strongDown: {
            d: createWavePath(1),
        },
        slightDown: {
            d: createWavePath(0.8),
        },
    };

    // Helper function to determine variant based on velocity
    const getVariantFromVelocity = (speed: number) => {
        if (speed > 800) return 'strongUp';
        if (speed > 300) return currentVariant === 'strongUp' ? 'neutral' : 'slightUp';
        if (speed < -800) return 'strongDown';
        if (speed < -300) return currentVariant === 'strongDown' ? 'neutral' : 'slightDown';
        return 'neutral';
    };

    useAnimationFrame(() => {
        setCurrentVariant(getVariantFromVelocity(velocity.get()));
    });

    return (
        <motion.div className="absolute inset-0 ">
            <svg className="size-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
                <motion.path
                    className="fill-[#171C1A]"
                    variants={pathVariants}
                    animate={currentVariant}
                    transition={{ type: 'spring', stiffness: 100, damping: 50 }}
                />
            </svg>
            {/* <div className="fixed top-0 left-0 text-black">{currentVariant}</div> */}
        </motion.div>
    );
}
