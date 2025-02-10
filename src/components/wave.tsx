'use client';
import { useAnimationFrame, useScroll, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { easeInOutCubic } from '@threeaio/utils/animation';
import { lerp } from '@threeaio/utils/math';

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
    const waveRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

    const easingFunction = easeInOutCubic;

    // Add inView detection with some margin to preload
    const isInView = useInView(waveRef, { margin: '400px' });

    const { scrollYProgress } = useScroll({
        target: waveRef,
        offset: curveConfig.scrollOffset,
    });

    const [dpr, setDpr] = useState(1);

    // Add state for current configuration and transition
    const [currentConfig, setCurrentConfig] = useState<WaveConfig>(curveConfig.in);
    const transitionTimeRef = useRef<number | null>(null);
    const TRANSITION_DURATION = 4000; // 1 second in milliseconds

    // Add a ref to track the last scroll position
    const lastScrollRef = useRef(0);

    useEffect(() => {
        setDpr(window.devicePixelRatio || 1);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            const overlayCanvas = overlayCanvasRef.current;
            if (!canvas || !waveRef.current) return;

            const container = waveRef.current;
            const width = container.clientWidth;
            const height = container.clientHeight;

            // Set display size
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            // Set actual size in memory
            canvas.width = width * dpr;
            canvas.height = height * dpr;

            // Handle overlay canvas if it exists
            if (overlayCanvas && curveConfig.forceOverlay) {
                overlayCanvas.style.width = `${width}px`;
                overlayCanvas.style.height = `${height}px`;
                overlayCanvas.width = width * dpr;
                overlayCanvas.height = height * dpr;
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dpr, curveConfig.forceOverlay]);

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
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 0.4;
        ctx.setLineDash([4, 8]);

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
        if (!isInView) return;

        const sp = scrollYProgress.get();

        // Calculate target configuration
        let targetConfig: WaveConfig;
        if (sp > 0.5) {
            const progressOut = (sp - 0.5) * 2;
            targetConfig = lerpBeziers(curveConfig.stable, curveConfig.out, progressOut);
        } else {
            const progressIn = sp * 2;
            targetConfig = lerpBeziers(curveConfig.in, curveConfig.stable, progressIn);
        }

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
        if (curveConfig.forceOverlay) {
            drawWave(overlayCanvasRef.current, lerpedConfig, '#242e2b');
        }
        drawWave(canvasRef.current, lerpedConfig, 'hsl(162,12%,14%)');
    });

    // Cleanup canvases when not in view
    useEffect(() => {
        if (!isInView) {
            const canvas = canvasRef.current;
            const overlayCanvas = overlayCanvasRef.current;

            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }

            if (overlayCanvas) {
                const ctx = overlayCanvas.getContext('2d');
                ctx?.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            }
        }
    }, [isInView]);

    return (
        <>
            {curveConfig.forceOverlay && <canvas ref={overlayCanvasRef} className="size-full" />}
            <div
                ref={waveRef}
                className="absolute inset-0"
                style={{ mask: 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 100) 30%)' }}
            >
                <canvas ref={canvasRef} className="size-full" />
            </div>
        </>
    );
}
