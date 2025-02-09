'use client';
import { motion, useAnimationFrame, useScroll, useVelocity } from 'motion/react';
import { config } from 'process';
import { useState } from 'react';

/**
 * Bezier config is an array of 3 numbers
 * The first number is the y coordinate of the control point (left and right is determined by the direction of the curve)
 * the second number is the x-offset, the third number is the y-offset from the control point
 */
type bezierConfig = [number, number, number];
// TODO: need 3 exölicit configs, in, out stable for:
// use the bezierConfig type for the configs
/*
  right: {
        y: number;
        controlShiftX: number;
        verticalShiftY: number;
    };
    left: {
        y: number;
        controlShiftX: number;
        verticalShiftY: number;
    };


*/
interface CurveConfig {
    initialCurveIntensity: number;
    effectStrength: number;
    right: {
        y: number;
        controlShiftX: number;
        verticalShiftY: number;
    };
    left: {
        y: number;
        controlShiftX: number;
        verticalShiftY: number;
    };
}

interface WaveProps {
    curveConfig?: CurveConfig;
}

const defaultCurveConfig: CurveConfig = {
    initialCurveIntensity: 0.5,
    effectStrength: 1,
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

export default function Wave({ curveConfig = defaultCurveConfig }: WaveProps) {
    const { scrollY, scrollYProgress } = useScroll();
    const velocity = useVelocity(scrollY);
    const [currentVariant, setCurrentVariant] = useState<
        'neutral' | 'strongUp' | 'slightUp' | 'strongDown' | 'slightDown'
    >('neutral');

    const WIDTH = 100;
    const HEIGHT = 100;

    // Helper function to create wave path
    const createWavePath = (curveIntensity: number = 1) => {
        const startPoint = `M 0,0`;
        const topLine = `L ${WIDTH},0`;
        const rightLine = `L ${WIDTH},${HEIGHT * curveConfig.right.y}`;

        const curveControl1 = `${WIDTH - curveConfig.right.controlShiftX * WIDTH},${curveConfig.right.y * HEIGHT + curveConfig.right.verticalShiftY * curveIntensity * HEIGHT}`;
        const curveControl2 = `${curveConfig.left.controlShiftX * WIDTH},${curveConfig.left.y * HEIGHT + curveConfig.left.verticalShiftY * curveIntensity * HEIGHT}`;
        const curveEnd = curveConfig.left.y * HEIGHT;

        const waveCurve = `C ${curveControl1} ${curveControl2} 0,${curveEnd}`;

        return `${startPoint} ${topLine} ${rightLine} ${waveCurve} Z`;
    };

    // Define variants using the helper function
    const pathVariants = {
        neutral: {
            d: createWavePath(curveConfig.initialCurveIntensity * curveConfig.effectStrength),
        },
        strongUp: {
            d: createWavePath(-0.4 * curveConfig.effectStrength),
        },
        slightUp: {
            d: createWavePath(-0.2 * curveConfig.effectStrength),
        },
        strongDown: {
            d: createWavePath(0.4 * curveConfig.effectStrength),
        },
        slightDown: {
            d: createWavePath(0.2 * curveConfig.effectStrength),
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

    const getVariantFromScrollYProgress = () => {
        if (scrollYProgress.get() > 0.8) return 'strongUp';
        if (scrollYProgress.get() < 0.3) return 'strongDown';
        return 'neutral';
    };

    useAnimationFrame(() => {
        setCurrentVariant(getVariantFromScrollYProgress());
    });

    return (
        <motion.div
            className="absolute inset-0"
            style={{ mask: 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 100) 30%)' }}
        >
            <svg className="size-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
                <motion.path
                    className="fill-[#171C1A]"
                    variants={pathVariants}
                    animate={currentVariant}
                    transition={{
                        ease: 'easeInOut',
                        duration: 0.5,
                    }}
                />
            </svg>
        </motion.div>
    );
}
