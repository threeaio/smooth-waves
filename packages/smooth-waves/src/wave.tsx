'use client';
import { useAnimationFrame, useScroll } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { lerp, remap } from '@threeaio/utils/math';
import { easeOut } from 'motion';

type SupportedEdgeUnit = 'px' | 'vw' | 'vh' | '%';
type EdgeUnit = `${number}${SupportedEdgeUnit}`;
type NamedEdges = 'start' | 'end' | 'center';
type EdgeString = NamedEdges | EdgeUnit | `${number}`;
type Edge = EdgeString | number;
type ProgressIntersection = [number, number];
type Intersection = `${Edge} ${Edge}`;
type ScrollOffset = Array<Edge | Intersection | ProgressIntersection>;

/**
 * Bezier config is an tuple of 3 numbers
 * [y-coordinate, x-offset, y-offset]
 * y-coordinate: The y coordinate of the source
 * x-offset: The horizontal shift of the control point from the source
 * y-offset: The vertical shift from the control point from the source
 */
type BezierConfig = [number, number, number];

export interface WaveConfig {
    left: BezierConfig;
    right: BezierConfig;
}

export interface WaveAnimation {
    featheredOut?: 'top' | 'bottom' | 'both';
    strokeStyle?: string;
    fill: string;
    configs: WaveConfig[];
    scrollOffset?: ScrollOffset;
    curveAmount?: number;
    offsetLeft?: number;
    offsetRight?: number;
}

const defaultCurveConfig: WaveAnimation = {
    featheredOut: 'top',
    strokeStyle: '#fff',
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
    return {
        left: lerpBezier(start.left, end.left, t),
        right: lerpBezier(start.right, end.right, t),
    };
}

function drawWavePath(
    ctx: CanvasRenderingContext2D,
    config: WaveConfig,
    curveIntensity: number = 1,
    curveAmount = 1,
    offsetLeft = 0,
    offsetRight = 0,
    width: number,
    height: number,
) {
    // Draw main wave
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height * config.right[0]);

    // Main curve
    ctx.bezierCurveTo(
        width - config.right[1] * width,
        config.right[0] * height + config.right[2] * curveIntensity * height,
        config.left[1] * width,
        config.left[0] * height + config.left[2] * curveIntensity * height,
        0,
        config.left[0] * height,
    );
    ctx.closePath();
    ctx.fill();

    // Draw decorative curves
    for (let i = 0; i < curveAmount; i++) {
        const offset = i + 1;
        ctx.beginPath();
        ctx.moveTo(width, height * config.right[0] + offsetRight * offset);
        ctx.bezierCurveTo(
            width - config.right[1] * width,
            config.right[0] * height + config.right[2] * curveIntensity * height + offsetRight * offset,
            config.left[1] * width,
            config.left[0] * height + config.left[2] * curveIntensity * height + offsetLeft * offset,
            0,
            config.left[0] * height + offsetLeft * offset,
        );
        ctx.stroke();
    }
}

export default function Wave({ waveConfig: curveConfig = defaultCurveConfig }: { waveConfig?: WaveAnimation }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

    const easingFunction = easeOut;

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: curveConfig.scrollOffset,
    });

    const [dpr, setDpr] = useState(1);

    // Add state for current configuration and transition
    const [currentConfig, setCurrentConfig] = useState<WaveConfig>(curveConfig.configs[0]);
    const transitionTimeRef = useRef<number | null>(null);
    const TRANSITION_DURATION = 60;

    // Add a ref to track the last scroll position
    const lastScrollRef = useRef(scrollYProgress.get());

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

            // Handle overlay canvas if it exists
            // if (overlayCanvas && curveConfig.forceOverlay) {
            //     overlayCanvas.style.width = `${width}px`;
            //     overlayCanvas.style.height = `${height}px`;
            //     overlayCanvas.width = width * dpr;
            //     overlayCanvas.height = height * dpr;
            // }
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
        ctx.strokeStyle = curveConfig.strokeStyle ?? 'white';
        ctx.lineWidth = 0.4;
        // ctx.setLineDash([4, 8]);

        drawWavePath(
            ctx,
            config,
            1,
            curveConfig.curveAmount ?? 1,
            curveConfig.offsetLeft ?? 0,
            curveConfig.offsetRight ?? 0,
            canvas.width / dpr,
            canvas.height / dpr,
        );
    };

    // Modified animation frame handling
    useAnimationFrame((time) => {
        const sp = scrollYProgress.get();
        const configCount = curveConfig.configs.length;

        // If only one config is provided, use it directly without interpolation
        const targetConfig =
            configCount === 1
                ? curveConfig.configs[0]
                : (() => {
                      // Calculate which segment we're in and the progress within that segment
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
                      const startConfig = curveConfig.configs[segmentIndex];
                      const endConfig = curveConfig.configs[segmentIndex + 1];

                      // Calculate target configuration
                      return lerpBeziers(startConfig, endConfig, segmentProgress);
                  })();

        // Handle transition timing
        if (!transitionTimeRef.current) {
            transitionTimeRef.current = time;
        }

        // Calculate transition progress
        const elapsed = time - transitionTimeRef.current;
        const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
        const easedProgress = easingFunction(progress);

        // Smoothly transition to target configuration
        const lerpedConfig: WaveConfig = {
            left: lerpBezier(currentConfig.left, targetConfig.left, easedProgress),
            right: lerpBezier(currentConfig.right, targetConfig.right, easedProgress),
        };

        // Reset transition timing and update current config if scroll position changed
        setCurrentConfig(lerpedConfig);

        if (sp !== lastScrollRef.current) {
            transitionTimeRef.current = time;
            lastScrollRef.current = sp;
        }

        // Draw the wave with lerped configuration
        // if (curveConfig.forceOverlay) {
        //     drawWave(overlayCanvasRef.current, lerpedConfig, curveConfig.fill ?? '#242e2b');
        // }
        drawWave(canvasRef.current, lerpedConfig, curveConfig.fill ?? defaultCurveConfig.fill!);
    });

    return (
        <div className="absolute inset-0" ref={containerRef}>
            {/* {curveConfig.forceOverlay && <canvas ref={overlayCanvasRef} className="size-full" />} */}
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
