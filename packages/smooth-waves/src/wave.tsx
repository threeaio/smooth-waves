'use client';
import { useAnimationFrame, useScroll, useSpring } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { lerp, remap } from '@threeaio/utils/math';

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
}

const defaultCurveConfig: WaveAnimation = {
    featheredOut: 'top',
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
    scrollOffset: ['start 80%', 'end 90%'],
};

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
    // const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

    // const easingFunction = easeOut;

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: curveConfig.scrollOffset,
    });

    const smoothProgress = useSpring(scrollYProgress, { damping: 15, mass: 0.27, stiffness: 55 });

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

    // Modified animation frame handling
    useAnimationFrame(() => {
        const sp = Math.max(0, Math.min(1, smoothProgress.get()));
        const configCount = curveConfig.configs.length;

        // If only one config is provided, use it directly without interpolation
        const targetConfig =
            configCount === 1
                ? curveConfig.configs[0]
                : (() => {
                      if (configCount === 2) {
                          // Special case: always interpolate between first and last
                          return lerpBeziers(curveConfig.configs[0], curveConfig.configs[1], sp);
                      }

                      // For 3+ configs:
                      const segmentSize = 1 / (configCount - 1);
                      const segmentIndex = Math.min(Math.floor(sp / segmentSize), configCount - 2);
                      const segmentProgress = remap(
                          segmentIndex * segmentSize,
                          (segmentIndex + 1) * segmentSize,
                          0,
                          1,
                          sp,
                      );

                      // Get the two configs to interpolate between
                      //   console.log('segmentIndex', segmentIndex, configCount);
                      const startConfig = curveConfig.configs[segmentIndex];
                      const endConfig = curveConfig.configs[segmentIndex + 1];

                      // Calculate target configuration
                      return lerpBeziers(startConfig, endConfig, segmentProgress);
                  })();

        drawWave(canvasRef.current, targetConfig, curveConfig.fill ?? defaultCurveConfig.fill!);
    });

    return (
        <div className="absolute inset-0" ref={containerRef}>
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
