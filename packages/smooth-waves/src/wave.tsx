'use client';
import { useAnimationFrame, useScroll, useSpring } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { lerp, clamp } from '@threeaio/utils/math';

type SupportedEdgeUnit = 'px' | 'vw' | 'vh' | '%';
type EdgeUnit = `${number}${SupportedEdgeUnit}`;
type NamedEdges = 'start' | 'end' | 'center';
type EdgeString = NamedEdges | EdgeUnit | `${number}`;
type Edge = EdgeString | number;
type ProgressIntersection = [number, number];
type Intersection = `${Edge} ${Edge}`;
type ScrollOffset = Array<Edge | Intersection | ProgressIntersection>;

/**
 * Bezier config is a tuple of 3 numbers
 * [y-coordinate, x-offset, y-offset]
 * y-coordinate: The y coordinate of the source
 * x-offset: The horizontal shift of the control point from the source
 * y-offset: The vertical shift from the control point from the source
 */
type BezierConfig = [number, number, number]; // [y-coordinate, x-offset, y-offset]

export interface WaveConfig {
    left: BezierConfig;
    right: BezierConfig;
}

export interface WaveAnimation {
    featheredOut?: 'top' | 'bottom' | 'both';
    strokeStyle?: string;
    strokeWidth?: number;
    fill: string;
    configs: WaveConfig[];
    scrollOffset?: ScrollOffset;
    curveAmount?: number;
    offsetLeft?: number;
    offsetRight?: number;
    flip?: boolean;
    debug?: boolean;
}

const defaultCurveConfig: WaveAnimation = {
    strokeStyle: '#fff',
    strokeWidth: 0.4,
    fill: 'rgba(0,0,0,0.1)',
    configs: [
        {
            right: [0.2, 0.9, -0.8],
            left: [0.7, 0.6, 0.9],
        },
        {
            right: [0.2, 0.9, -0.5],
            left: [0.7, 0.6, 0.6],
        },
        {
            right: [0.2, 0.9, -0.2],
            left: [0.7, 0.6, 0.3],
        },
    ],
    scrollOffset: ['end end', 'start start'],
};

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const t2 = t * t;
    const t3 = t2 * t;

    return (
        (-t3 + 2 * t2 - t) * p0 * 0.5 +
        (3 * t3 - 5 * t2 + 2) * p1 * 0.5 +
        (-3 * t3 + 4 * t2 + t) * p2 * 0.5 +
        (t3 - t2) * p3 * 0.5
    );
}

function interpolateSequence(points: number[], t: number): number {
    if (points.length === 0) return 0;
    if (points.length === 1) return points[0];

    // Clamp t to [0, 1]
    t = clamp(0, 1, t);

    // For t = 1, return the last point
    if (t === 1) return points[points.length - 1];

    // Extend points array with better boundary handling
    const extendedPoints = [
        points[0], // First control point
        ...points, // Original points
        points[points.length - 1], // Last control point
    ];

    // Calculate segment index
    const segments = points.length - 1;
    const segmentT = t * segments;
    const segment = Math.floor(segmentT);
    const localT = segmentT - segment;

    // Get the four points needed for interpolation
    const p0 = extendedPoints[segment];
    const p1 = extendedPoints[segment + 1];
    const p2 = extendedPoints[segment + 2];
    const p3 = extendedPoints[Math.min(segment + 3, extendedPoints.length - 1)];

    return catmullRom(p0, p1, p2, p3, localT);
}

function interpolateBezierConfig(configs: BezierConfig[], t: number): BezierConfig {
    // Extract individual components into separate arrays
    const yCoords = configs.map((c) => c[0]);
    const xOffsets = configs.map((c) => c[1]);
    const yOffsets = configs.map((c) => c[2]);

    // Interpolate each component separately
    return [interpolateSequence(yCoords, t), interpolateSequence(xOffsets, t), interpolateSequence(yOffsets, t)];
}

function interpolateWaveConfig(configs: WaveConfig[], t: number): WaveConfig {
    // Extract left and right configs separately
    const leftConfigs = configs.map((c) => c.left);
    const rightConfigs = configs.map((c) => c.right);

    return {
        left: interpolateBezierConfig(leftConfigs, t),
        right: interpolateBezierConfig(rightConfigs, t),
    };
}

function lerpBezier(start: BezierConfig, end: BezierConfig, t: number): BezierConfig {
    return [lerp(start[0], end[0], t), lerp(start[1], end[1], t), lerp(start[2], end[2], t)];
}

function lerpBeziers(start: WaveConfig, end: WaveConfig, t: number): WaveConfig {
    try {
        return {
            left: lerpBezier(start.left, end.left, t),
            right: lerpBezier(start.right, end.right, t),
        };
    } catch (error) {
        console.error(error, start, end, t);
        return start;
    }
}

function drawWavePath(
    ctx: CanvasRenderingContext2D,
    config: WaveConfig,
    curveAmount = 1,
    lineOffsetLeft = 0,
    lineOffsetRight = 0,
    width: number,
    height: number,
    flip = false,
) {
    // Draw main wave
    const leftX = 0;
    const leftY = flip ? height - config.left[0] * height : config.left[0] * height;
    const leftXOffset = config.left[1] * width;
    const leftYOffset = config.left[2] * height;
    const rightX = width;
    const rightY = flip ? height - config.right[0] * height : config.right[0] * height;
    const rightXOffset = config.right[1] * width;
    const rightYOffset = config.right[2] * height;

    ctx.beginPath();
    ctx.moveTo(leftX, flip ? height : 0);
    ctx.lineTo(rightX, flip ? height : 0);
    ctx.lineTo(rightX, rightY);

    // Main curve
    ctx.bezierCurveTo(
        rightX - rightXOffset,
        rightY + rightYOffset,
        leftX + leftXOffset,
        leftY + leftYOffset,
        leftX,
        leftY,
    );
    ctx.closePath();
    ctx.fill();

    // Draw decorative curves
    for (let i = 0; i < curveAmount; i++) {
        const offset = i + 1;
        ctx.beginPath();
        ctx.moveTo(rightX, rightY + lineOffsetRight * offset);
        ctx.bezierCurveTo(
            rightX - rightXOffset,
            rightY + rightYOffset + lineOffsetRight * offset,
            leftX + leftXOffset,
            leftY + leftYOffset + lineOffsetLeft * offset,
            leftX,
            leftY + lineOffsetLeft * offset,
        );
        ctx.stroke();
    }
}

export default function Wave({ waveConfig: curveConfig = defaultCurveConfig }: { waveConfig?: WaveAnimation }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: curveConfig.scrollOffset,
    });

    const smoothProgress = useSpring(scrollYProgress, { damping: 80, mass: 0.27, stiffness: 250 });

    const [dpr, setDpr] = useState(1);

    useEffect(() => {
        setDpr(window.devicePixelRatio || 1);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            // const overlayCanvas = overlayCanvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;

            const width = container.clientWidth;
            const height = container.clientHeight;

            // Set display size
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            // Set actual size in memory
            canvas.width = width * dpr;
            canvas.height = height * dpr;
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dpr]);

    const drawWave = (canvas: HTMLCanvasElement | null, config: WaveConfig, fillStyle: string) => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Reset transformation to ensure no accumulation from previous frames.
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Clear the entire canvas using its full size in device pixels.
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply scaling for HiDPI rendering.
        ctx.scale(dpr, dpr);

        // Set styles for drawing.
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = curveConfig.strokeStyle ?? defaultCurveConfig.strokeStyle!;
        ctx.lineWidth = curveConfig.strokeWidth ?? defaultCurveConfig.strokeWidth!;
        // ctx.setLineDash([4, 8]);

        drawWavePath(
            ctx,
            config,
            curveConfig.curveAmount ?? 1,
            curveConfig.offsetLeft ?? 0,
            curveConfig.offsetRight ?? 0,
            canvas.width / dpr,
            canvas.height / dpr,
            curveConfig.flip ?? false,
        );
    };

    const drawDebug = (canvas: HTMLCanvasElement, scrollProgress: number) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.font = '12px monospace';
        ctx.fillStyle = '#f00';
        ctx.fillText(
            scrollProgress.toFixed(3),
            canvas.width / dpr - 50,
            clamp(20, canvas.height / dpr, (scrollProgress * canvas.height) / dpr),
        );
    };

    // Modified animation frame handling
    useAnimationFrame(() => {
        const sp = clamp(0, 1, smoothProgress.get());
        const configCount = curveConfig.configs.length;

        const targetConfig = (() => {
            // Handle special cases
            if (configCount <= 1) return curveConfig.configs[0];
            if (configCount === 2) return lerpBeziers(curveConfig.configs[0], curveConfig.configs[1], sp);

            // Use Catmull-Rom interpolation for 3+ configs
            return interpolateWaveConfig(curveConfig.configs, sp);
        })();

        drawWave(canvasRef.current, targetConfig, curveConfig.fill ?? defaultCurveConfig.fill!);

        // Draw debug info if enabled
        if (curveConfig.debug && canvasRef.current) {
            drawDebug(canvasRef.current, sp);
        }
    });

    return (
        <div className="absolute inset-0 overflow-hidden" ref={containerRef}>
            <div
                className="absolute inset-0"
                style={{
                    mask:
                        curveConfig.featheredOut === 'top'
                            ? 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 40%)'
                            : curveConfig.featheredOut === 'bottom'
                              ? 'linear-gradient(rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%)'
                              : curveConfig.featheredOut === 'both'
                                ? 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)'
                                : undefined,
                }}
            >
                <canvas ref={canvasRef} className="size-full" />
            </div>
        </div>
    );
}
