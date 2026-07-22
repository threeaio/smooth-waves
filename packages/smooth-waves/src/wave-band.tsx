'use client';
import { useAnimationFrame, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';
import { clamp, cubicYRange, drawDebug, extractChannels, featherErase, featherMask, resolveConfig } from './core';
import type { ScrollOffset, WaveConfig } from './core';

/**
 * One edge of a WaveBand. `configs` uses the same keyframe semantics as Wave:
 * 1 keyframe = static, 2 = linear interpolation, 3+ = Catmull-Rom spline
 * (which overshoots keyframe values — keep y within ~0.05–0.95).
 *
 * y-values are fractions of the canvas height measured from the top for BOTH
 * edges — there is no `flip`, each edge is explicit.
 */
export interface WaveBandEdge {
    configs: WaveConfig[];
    strokeStyle?: string;
    strokeWidth?: number;
    /** Number of decorative stroke lines fanning off this edge (default 0). */
    curveAmount?: number;
    /**
     * Per-line fan offset in px. The sign controls the fan direction:
     * negative fans up, positive fans down. The fan needs
     * `curveAmount × offset` px of room inside the canvas before it gets
     * clipped at the edge.
     */
    offsetLeft?: number;
    offsetRight?: number;
}

/**
 * A ribbon with a designed curve on BOTH edges: the fill is the closed path
 * between the top and the bottom curve, transparent outside — so unlike Wave
 * (which always fills to a canvas edge) a band can float over any background.
 * Both edges share the same scroll progress and spring, so they move
 * coherently.
 *
 * If the top curve crosses below the bottom curve the path self-intersects;
 * canvas fills the resulting twist via nonzero winding. That can be used
 * deliberately, but with 3+ keyframes watch the spline overshoot.
 */
export interface WaveBandAnimation {
    fill: string;
    top: WaveBandEdge;
    bottom: WaveBandEdge;
    scrollOffset?: ScrollOffset;
    featheredOut?: 'top' | 'bottom' | 'both';
    /**
     * Fade depth of `featheredOut` in px. When set, the feather is drawn into
     * the canvas anchored at the BAND's drawn extent — `top` fades the band's
     * first `depth` px in, `bottom` its last `depth` px out, wherever the band
     * currently sits. When omitted, the legacy %-based CSS mask applies
     * (40% of the canvas height, anchored at the canvas edges).
     */
    featherDepth?: number;
    debug?: boolean;
}

// Absolute-pixel geometry of one resolved edge: anchor points at x=0 / x=width
// plus the two bezier control points.
interface EdgeGeometry {
    leftY: number;
    leftCx: number;
    leftCy: number;
    rightY: number;
    rightCx: number;
    rightCy: number;
}

function edgeGeometry(config: WaveConfig, width: number, height: number): EdgeGeometry {
    const leftY = config.left[0] * height;
    const rightY = config.right[0] * height;
    return {
        leftY,
        leftCx: config.left[1] * width,
        leftCy: leftY + config.left[2] * height,
        rightY,
        rightCx: width - config.right[1] * width,
        rightCy: rightY + config.right[2] * height,
    };
}

function drawBandPath(ctx: CanvasRenderingContext2D, top: EdgeGeometry, bottom: EdgeGeometry, width: number) {
    ctx.beginPath();
    ctx.moveTo(0, top.leftY);
    // top curve, left → right
    ctx.bezierCurveTo(top.leftCx, top.leftCy, top.rightCx, top.rightCy, width, top.rightY);
    ctx.lineTo(width, bottom.rightY);
    // bottom curve, right → left
    ctx.bezierCurveTo(bottom.rightCx, bottom.rightCy, bottom.leftCx, bottom.leftCy, 0, bottom.leftY);
    ctx.closePath();
    ctx.fill();
}

function strokeEdgeFan(ctx: CanvasRenderingContext2D, geometry: EdgeGeometry, edge: WaveBandEdge, width: number) {
    const curveAmount = edge.curveAmount ?? 0;
    if (curveAmount <= 0) return;

    ctx.strokeStyle = edge.strokeStyle ?? '#fff';
    ctx.lineWidth = edge.strokeWidth ?? 0.4;
    const offsetLeft = edge.offsetLeft ?? 0;
    const offsetRight = edge.offsetRight ?? 0;

    for (let i = 0; i < curveAmount; i++) {
        const offset = i + 1;
        ctx.beginPath();
        ctx.moveTo(0, geometry.leftY + offsetLeft * offset);
        ctx.bezierCurveTo(
            geometry.leftCx,
            geometry.leftCy + offsetLeft * offset,
            geometry.rightCx,
            geometry.rightCy + offsetRight * offset,
            width,
            geometry.rightY + offsetRight * offset,
        );
        ctx.stroke();
    }
}

export default function WaveBand({ waveConfig }: { waveConfig: WaveBandAnimation }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
    const needsRedrawRef = useRef(true);
    const reducedMotionRef = useRef(false);
    const topScratchRef = useRef<WaveConfig>({ left: [0, 0, 0], right: [0, 0, 0] });
    const bottomScratchRef = useRef<WaveConfig>({ left: [0, 0, 0], right: [0, 0, 0] });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: waveConfig.scrollOffset,
    });

    const smoothProgress = useSpring(scrollYProgress, { damping: 80, mass: 0.27, stiffness: 250 });

    const topChannels = useMemo(() => extractChannels(waveConfig.top.configs), [waveConfig.top.configs]);
    const bottomChannels = useMemo(() => extractChannels(waveConfig.bottom.configs), [waveConfig.bottom.configs]);

    // Redraw when the config itself changes (fill, stroke, configs, ...).
    useEffect(() => {
        needsRedrawRef.current = true;
    }, [waveConfig, topChannels, bottomChannels]);

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
        const { top, bottom } = waveConfig;
        if (!canvas || !ctx || top.configs.length === 0 || bottom.configs.length === 0) return;

        needsRedrawRef.current = false;

        const sp = reducedMotionRef.current ? 0.5 : clamp(0, 1, smoothProgress.get());

        const topConfig = resolveConfig(top.configs, topChannels, topScratchRef.current, sp);
        const bottomConfig = resolveConfig(bottom.configs, bottomChannels, bottomScratchRef.current, sp);

        const { width, height, dpr } = sizeRef.current;

        // Reset transformation to ensure no accumulation from previous frames.
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply scaling for HiDPI rendering.
        ctx.scale(dpr, dpr);

        const topGeometry = edgeGeometry(topConfig, width, height);
        const bottomGeometry = edgeGeometry(bottomConfig, width, height);

        ctx.fillStyle = waveConfig.fill;
        drawBandPath(ctx, topGeometry, bottomGeometry, width);

        strokeEdgeFan(ctx, topGeometry, top, width);
        strokeEdgeFan(ctx, bottomGeometry, bottom, width);

        if (waveConfig.featheredOut && waveConfig.featherDepth) {
            // the band's drawn y-extent: the top edge's highest point and the
            // bottom edge's lowest, each pushed out by its fan lines' reach
            const fanReach = (edge: WaveBandEdge) => {
                const fan = edge.curveAmount ?? 0;
                return [(edge.offsetLeft ?? 0) * fan, (edge.offsetRight ?? 0) * fan];
            };
            const [topMin] = cubicYRange(topGeometry.leftY, topGeometry.leftCy, topGeometry.rightCy, topGeometry.rightY);
            const [, bottomMax] = cubicYRange(
                bottomGeometry.leftY,
                bottomGeometry.leftCy,
                bottomGeometry.rightCy,
                bottomGeometry.rightY,
            );
            featherErase(ctx, width, height, waveConfig.featheredOut, waveConfig.featherDepth, {
                top: topMin + Math.min(0, ...fanReach(top)),
                bottom: bottomMax + Math.max(0, ...fanReach(bottom)),
            });
        }

        if (waveConfig.debug) {
            drawDebug(ctx, width, height, sp);
        }
    });

    return (
        <div className="absolute inset-0 overflow-hidden" ref={containerRef}>
            <div
                className="absolute inset-0"
                style={{ mask: waveConfig.featherDepth ? undefined : featherMask(waveConfig.featheredOut) }}
            >
                <canvas ref={canvasRef} className="size-full" />
            </div>
        </div>
    );
}
