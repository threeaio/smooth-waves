'use client';
import { useAnimationFrame, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';
import { clamp, drawDebug, extractChannels, featherMask, resolveConfig } from './core';
import type { ScrollOffset, WaveConfig } from './core';

export type { WaveConfig } from './core';

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
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
    const needsRedrawRef = useRef(true);
    const reducedMotionRef = useRef(false);
    const scratchRef = useRef<WaveConfig>({ left: [0, 0, 0], right: [0, 0, 0] });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: curveConfig.scrollOffset,
    });

    const smoothProgress = useSpring(scrollYProgress, { damping: 80, mass: 0.27, stiffness: 250 });

    const channels = useMemo(() => extractChannels(curveConfig.configs), [curveConfig.configs]);

    // Redraw when the config itself changes (fill, stroke, configs, ...).
    useEffect(() => {
        needsRedrawRef.current = true;
    }, [curveConfig, channels]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => {
            reducedMotionRef.current = mediaQuery.matches;
            needsRedrawRef.current = true;
        };
        update();
        mediaQuery.addEventListener('change', update);
        return () => mediaQuery.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        ctxRef.current = canvas.getContext('2d');

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const width = container.clientWidth;
            const height = container.clientHeight;
            sizeRef.current = { width, height, dpr };

            // Setting width/height resets the canvas, so this must stay out of the draw loop.
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            needsRedrawRef.current = true;
        };

        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    useMotionValueEvent(smoothProgress, 'change', () => {
        if (!reducedMotionRef.current) {
            needsRedrawRef.current = true;
        }
    });

    useAnimationFrame(() => {
        if (!needsRedrawRef.current) return;

        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        const configs = curveConfig.configs;
        if (!canvas || !ctx || configs.length === 0) return;

        needsRedrawRef.current = false;

        const sp = reducedMotionRef.current ? 0.5 : clamp(0, 1, smoothProgress.get());

        const targetConfig = resolveConfig(configs, channels, scratchRef.current, sp);

        const { width, height, dpr } = sizeRef.current;

        // Reset transformation to ensure no accumulation from previous frames.
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply scaling for HiDPI rendering.
        ctx.scale(dpr, dpr);

        ctx.fillStyle = curveConfig.fill ?? defaultCurveConfig.fill;
        ctx.strokeStyle = curveConfig.strokeStyle ?? defaultCurveConfig.strokeStyle!;
        ctx.lineWidth = curveConfig.strokeWidth ?? defaultCurveConfig.strokeWidth!;

        drawWavePath(
            ctx,
            targetConfig,
            curveConfig.curveAmount ?? 1,
            curveConfig.offsetLeft ?? 0,
            curveConfig.offsetRight ?? 0,
            width,
            height,
            curveConfig.flip ?? false,
        );

        if (curveConfig.debug) {
            drawDebug(ctx, width, height, sp);
        }
    });

    return (
        <div className="absolute inset-0 overflow-hidden" ref={containerRef}>
            <div
                className="absolute inset-0"
                style={{ mask: featherMask(curveConfig.featheredOut) }}
            >
                <canvas ref={canvasRef} className="size-full" />
            </div>
        </div>
    );
}
