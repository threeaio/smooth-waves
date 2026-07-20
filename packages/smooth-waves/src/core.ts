export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const clamp = (min: number, max: number, value: number): number => Math.min(max, Math.max(min, value));

type SupportedEdgeUnit = 'px' | 'vw' | 'vh' | '%';
type EdgeUnit = `${number}${SupportedEdgeUnit}`;
type NamedEdges = 'start' | 'end' | 'center';
type EdgeString = NamedEdges | EdgeUnit | `${number}`;
type Edge = EdgeString | number;
type ProgressIntersection = [number, number];
type Intersection = `${Edge} ${Edge}`;
export type ScrollOffset = Array<Edge | Intersection | ProgressIntersection>;

/**
 * Bezier config is a tuple of 3 numbers
 * [y-coordinate, x-offset, y-offset]
 * y-coordinate: The y coordinate of the source
 * x-offset: The horizontal shift of the control point from the source
 * y-offset: The vertical shift from the control point from the source
 */
export type BezierConfig = [number, number, number]; // [y-coordinate, x-offset, y-offset]

export interface WaveConfig {
    left: BezierConfig;
    right: BezierConfig;
}

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

// One interpolation channel per bezier component, pre-extended with duplicated
// boundary points ([first, ...points, last]) so the hot path allocates nothing.
type BezierChannels = [number[], number[], number[]];

export interface WaveChannels {
    left: BezierChannels;
    right: BezierChannels;
}

function extendPoints(points: number[]): number[] {
    return [points[0], ...points, points[points.length - 1]];
}

export function extractChannels(configs: WaveConfig[]): WaveChannels {
    const channel = (side: keyof WaveConfig, component: number) =>
        extendPoints(configs.map((c) => c[side][component]));

    return {
        left: [channel('left', 0), channel('left', 1), channel('left', 2)],
        right: [channel('right', 0), channel('right', 1), channel('right', 2)],
    };
}

function interpolateExtended(extended: number[], t: number): number {
    const count = extended.length - 2; // number of original points
    if (count <= 0) return 0;
    if (count === 1) return extended[1];

    t = clamp(0, 1, t);
    if (t === 1) return extended[count];

    const segments = count - 1;
    const segmentT = t * segments;
    const segment = Math.floor(segmentT);
    const localT = segmentT - segment;

    const p0 = extended[segment];
    const p1 = extended[segment + 1];
    const p2 = extended[segment + 2];
    const p3 = extended[Math.min(segment + 3, extended.length - 1)];

    return catmullRom(p0, p1, p2, p3, localT);
}

function interpolateInto(target: WaveConfig, channels: WaveChannels, t: number): void {
    for (let i = 0; i < 3; i++) {
        target.left[i] = interpolateExtended(channels.left[i], t);
        target.right[i] = interpolateExtended(channels.right[i], t);
    }
}

function lerpInto(target: WaveConfig, start: WaveConfig, end: WaveConfig, t: number): void {
    for (let i = 0; i < 3; i++) {
        target.left[i] = lerp(start.left[i], end.left[i], t);
        target.right[i] = lerp(start.right[i], end.right[i], t);
    }
}

/**
 * Resolve the wave shape at scroll progress `t`:
 * 1 keyframe = static, 2 = linear interpolation, 3+ = Catmull-Rom spline
 * (which overshoots keyframe values). Writes into `scratch` to avoid
 * allocations in the draw loop.
 */
export function resolveConfig(configs: WaveConfig[], channels: WaveChannels, scratch: WaveConfig, t: number): WaveConfig {
    if (configs.length === 1) return configs[0];
    if (configs.length === 2) {
        lerpInto(scratch, configs[0], configs[1], t);
        return scratch;
    }
    interpolateInto(scratch, channels, t);
    return scratch;
}

/**
 * One-shot sampling of the interpolated shape at progress `t` — for exports,
 * SSR snapshots, or anywhere outside the animation loop. Same keyframe
 * semantics as the components: 1 = static, 2 = lerp, 3+ = Catmull-Rom.
 */
export function sampleConfig(configs: WaveConfig[], t: number): WaveConfig {
    const scratch: WaveConfig = { left: [0, 0, 0], right: [0, 0, 0] };
    const resolved = resolveConfig(configs, extractChannels(configs), scratch, clamp(0, 1, t));
    return { left: [...resolved.left], right: [...resolved.right] };
}

export function drawDebug(ctx: CanvasRenderingContext2D, width: number, height: number, scrollProgress: number) {
    ctx.font = '12px monospace';
    ctx.fillStyle = '#f00';
    ctx.fillText(scrollProgress.toFixed(3), width - 50, clamp(20, height, scrollProgress * height));
}

export function featherMask(featheredOut?: 'top' | 'bottom' | 'both'): string | undefined {
    switch (featheredOut) {
        case 'top':
            return 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 40%)';
        case 'bottom':
            return 'linear-gradient(rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%)';
        case 'both':
            return 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)';
        default:
            return undefined;
    }
}
