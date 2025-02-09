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
    stable: WaveConfig;
    in: WaveConfig;
    out: WaveConfig;
    scrollOffset?: ScrollOffset;
}

const WIDTH = 100;
const HEIGHT = 100;

const defaultCurveConfig: WaveAnimation = {
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
function createWavePath(config: WaveConfig, curveIntensity: number = 1) {
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
}

export default function Wave({ waveConfig: curveConfig = defaultCurveConfig }: { waveConfig?: WaveAnimation }) {
    const waveRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: waveRef,
        offset: curveConfig.scrollOffset,
    });

    const [currentPath, setCurrentPath] = useState<string>(createWavePath(curveConfig.in));

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
        return createWavePath(lerpedConfig);
    };

    useAnimationFrame(() => {
        setCurrentPath(getVariantFromScrollYProgress());
    });

    return (
        <div
            ref={waveRef}
            className="absolute inset-0"
            style={{ mask: 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 100) 50%)' }}
        >
            <svg className="size-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
                <motion.path
                    initial={false}
                    className="fill-[hsl(162,12%,14%)]"
                    animate={{
                        d: currentPath,
                    }}
                    transition={{
                        ease: 'easeOut',
                        duration: 0.3,
                    }}
                />
            </svg>
        </div>
    );
}
