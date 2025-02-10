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

interface WaveAnimation {
    forceOverlay: boolean;
    stable: WaveConfig;
    in: WaveConfig;
    out: WaveConfig;
    scrollOffset?: ScrollOffset;
    curveAmount?: number;
    offsetLeft?: number;
    offsetRight?: number;
}

const WIDTH = 100;
const HEIGHT = 100;

const defaultCurveConfig: WaveAnimation = {
    forceOverlay: false,
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

function lerpNumber(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

function lerpBezier(start: BezierConfig, end: BezierConfig, t: number): BezierConfig {
    return [lerpNumber(start[0], end[0], t), lerpNumber(start[1], end[1], t), lerpNumber(start[2], end[2], t)];
}

function lerpBeziers(start: WaveConfig, end: WaveConfig, t: number): WaveConfig {
    return {
        left: lerpBezier(start.left, end.left, t),
        right: lerpBezier(start.right, end.right, t),
    };
}

// Helper function to create wave path using BezierConfig
function createWavePath(
    config: WaveConfig,
    curveIntensity: number = 1,
    curveAmount = 1,
    offsetLeft = 0,
    offsetRight = 0,
) {
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

    const fullPath = `${startPoint} ${topLine} ${rightLine} C ${curveControl1} ${curveControl2} 0,${curveEnd} Z`;

    // Generate array of curve paths with offsets
    const curvePaths = Array.from({ length: curveAmount }, (_, index) => {
        const offset = index + 1;
        const curveControl1 = `${WIDTH - config.right[1] * WIDTH},${
            config.right[0] * HEIGHT + config.right[2] * curveIntensity * HEIGHT + offsetRight * offset
        }`;
        const curveControl2 = `${config.left[1] * WIDTH},${
            config.left[0] * HEIGHT + config.left[2] * curveIntensity * HEIGHT + offsetLeft * offset
        }`;
        const curveEnd = config.left[0] * HEIGHT + offsetLeft * offset;

        return `M ${WIDTH},${HEIGHT * config.right[0] + offsetRight * offset} C ${curveControl1} ${curveControl2} 0,${curveEnd}`;
    });

    return {
        fullPath,
        curvePaths,
    };
}

export default function Wave({ waveConfig: curveConfig = defaultCurveConfig }: { waveConfig?: WaveAnimation }) {
    const waveRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: waveRef,
        offset: curveConfig.scrollOffset,
    });

    const [currentPath, setCurrentPath] = useState<string>(
        createWavePath(
            curveConfig.in,
            1,
            curveConfig.curveAmount ?? 1,
            curveConfig.offsetLeft ?? 0,
            curveConfig.offsetRight ?? 0,
        ).fullPath,
    );

    const [currentCurves, setCurrentCurves] = useState<string[]>(
        createWavePath(
            curveConfig.in,
            1,
            curveConfig.curveAmount ?? 1,
            curveConfig.offsetLeft ?? 0,
            curveConfig.offsetRight ?? 0,
        ).curvePaths,
    );

    const getVariantFromScrollYProgress = () => {
        const sp = scrollYProgress.get();
        let lerpedConfig: WaveConfig;
        if (sp > 0.5) {
            const progressOut = (sp - 0.5) * 2;
            lerpedConfig = lerpBeziers(curveConfig.stable, curveConfig.out, progressOut);
        } else {
            const progressIn = sp * 2;
            lerpedConfig = lerpBeziers(curveConfig.in, curveConfig.stable, progressIn);
        }
        return createWavePath(
            lerpedConfig,
            1,
            curveConfig.curveAmount ?? 1,
            curveConfig.offsetLeft ?? 0,
            curveConfig.offsetRight ?? 0,
        );
    };

    useAnimationFrame(() => {
        const paths = getVariantFromScrollYProgress();
        setCurrentPath(paths.fullPath);
        setCurrentCurves(paths.curvePaths);
    });

    return (
        <>
            {curveConfig.forceOverlay && (
                <svg className="size-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
                    <motion.path
                        initial={false}
                        fill="#242e2b"
                        animate={{
                            d: currentPath,
                        }}
                        transition={{
                            ease: 'easeOut',
                            duration: 0.3,
                        }}
                    />
                </svg>
            )}
            <div
                ref={waveRef}
                className="absolute inset-0"
                style={{ mask: 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 100) 30%)' }}
            >
                <svg className="size-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
                    <motion.path
                        initial={false}
                        fill="hsl(162,12%,14%)"
                        animate={{
                            d: currentPath,
                        }}
                        transition={{
                            ease: 'easeOut',
                            duration: 0.3,
                        }}
                    />
                    {currentCurves.map((curve, index) => (
                        <motion.path
                            key={index}
                            initial={false}
                            className="opacity-100 stroke-red-500"
                            fill="none"
                            stroke="white"
                            strokeWidth=".04"
                            strokeDasharray={'0.2 0.4'}
                            strokeDashoffset={1}
                            animate={{
                                d: curve,
                            }}
                            transition={{
                                ease: 'easeOut',
                                duration: 0.3,
                            }}
                        />
                    ))}
                </svg>
            </div>
        </>
    );
}
