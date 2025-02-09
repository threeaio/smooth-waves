'use client';
import { motion, useAnimationFrame, useScroll } from 'motion/react';
import { useRef, useState } from 'react';

type SupportedEdgeUnit = 'px' | 'vw' | 'vh' | '%';
type EdgeUnit = `${number}${SupportedEdgeUnit}`;
type NamedEdges = 'start' | 'end' | 'center';
type EdgeString = NamedEdges | EdgeUnit | `${number}`;
type Edge = EdgeString | number;
type ProgressIntersection = [number, number];
type Intersection = `${Edge} ${Edge}`;
type ScrollOffset = Array<Edge | Intersection | ProgressIntersection>;

/**
 * Bezier config is an array of 3 numbers
 * [y-coordinate, x-offset, y-offset]
 * y-coordinate: The y coordinate of the control point
 * x-offset: The horizontal shift of the control point
 * y-offset: The vertical shift from the control point
 */
type BezierConfig = [number, number, number];

interface WaveConfig {
    left: BezierConfig;
    right: BezierConfig;
}

interface CurveConfig {
    initialCurveIntensity: number;
    effectStrength: number;
    stable: WaveConfig;
    in: WaveConfig;
    out: WaveConfig;
    scrollOffset?: ScrollOffset;
}

const defaultCurveConfig: CurveConfig = {
    initialCurveIntensity: 0.5,
    effectStrength: 1,
    stable: {
        right: [0.2, 0.9, -0.5],
        left: [0.7, 0.6, 0.6],
    },
    in: {
        right: [0.2, 0.9, -0.8],
        left: [0.7, 0.6, 0.9],
    },
    out: {
        right: [0.2, 0.9, -0.2],
        left: [0.7, 0.6, 0.3],
    },
    scrollOffset: ['start 80%', 'end 90%'],
};

export default function Wave({ curveConfig = defaultCurveConfig }: { curveConfig?: CurveConfig }) {
    const waveRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: waveRef,
        offset: curveConfig.scrollOffset,
    });
    const [currentVariant, setCurrentVariant] = useState<
        'neutral' | 'strongUp' | 'slightUp' | 'strongDown' | 'slightDown'
    >('neutral');

    const WIDTH = 100;
    const HEIGHT = 100;

    // Helper function to create wave path using BezierConfig
    const createWavePath = (config: WaveConfig, curveIntensity: number = 1) => {
        const startPoint = `M 0,0`;
        const topLine = `L ${WIDTH},0`;
        const rightLine = `L ${WIDTH},${HEIGHT * config.right[0]}`;

        const curveControl1 = `${WIDTH - config.right[1] * WIDTH},${
            config.right[0] * HEIGHT + config.right[2] * curveIntensity * HEIGHT
        }`;
        const curveControl2 = `${config.left[1] * WIDTH},${
            config.left[0] * HEIGHT + config.left[2] * curveIntensity * HEIGHT
        }`;
        const curveEnd = config.left[0] * HEIGHT;

        return `${startPoint} ${topLine} ${rightLine} C ${curveControl1} ${curveControl2} 0,${curveEnd} Z`;
    };

    // Define variants using the helper function
    const pathVariants = {
        neutral: {
            d: createWavePath(curveConfig.stable, curveConfig.initialCurveIntensity * curveConfig.effectStrength),
        },
        strongUp: {
            d: createWavePath(curveConfig.out, curveConfig.effectStrength),
        },
        slightUp: {
            d: createWavePath(curveConfig.out, curveConfig.effectStrength),
        },
        strongDown: {
            d: createWavePath(curveConfig.in, curveConfig.effectStrength),
        },
        slightDown: {
            d: createWavePath(curveConfig.in, curveConfig.effectStrength),
        },
    };

    const getVariantFromScrollYProgress = () => {
        const sp = scrollYProgress.get();
        console.log('sp', sp);
        if (sp > 0.9) return 'strongUp';
        if (sp < 0.3) return 'strongDown';
        return 'neutral';
    };

    useAnimationFrame(() => {
        setCurrentVariant(getVariantFromScrollYProgress());
    });

    return (
        <div
            ref={waveRef}
            className="absolute inset-0"
            style={{ mask: 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 100) 30%)' }}
        >
            <svg className="size-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
                <motion.path
                    initial={false}
                    className="fill-[#171C1A]"
                    variants={pathVariants}
                    animate={currentVariant}
                    transition={{
                        ease: 'easeOut',
                        duration: 1,
                    }}
                />
            </svg>
        </div>
    );
}
