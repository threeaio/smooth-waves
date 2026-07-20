import * as react_jsx_runtime from 'react/jsx-runtime';

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
type BezierConfig = [number, number, number];
interface WaveConfig {
    left: BezierConfig;
    right: BezierConfig;
}
/**
 * One-shot sampling of the interpolated shape at progress `t` — for exports,
 * SSR snapshots, or anywhere outside the animation loop. Same keyframe
 * semantics as the components: 1 = static, 2 = lerp, 3+ = Catmull-Rom.
 */
declare function sampleConfig(configs: WaveConfig[], t: number): WaveConfig;

interface WaveAnimation {
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
declare function Wave({ waveConfig: curveConfig }: {
    waveConfig?: WaveAnimation;
}): react_jsx_runtime.JSX.Element;

/**
 * One edge of a WaveBand. `configs` uses the same keyframe semantics as Wave:
 * 1 keyframe = static, 2 = linear interpolation, 3+ = Catmull-Rom spline
 * (which overshoots keyframe values — keep y within ~0.05–0.95).
 *
 * y-values are fractions of the canvas height measured from the top for BOTH
 * edges — there is no `flip`, each edge is explicit.
 */
interface WaveBandEdge {
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
interface WaveBandAnimation {
    fill: string;
    top: WaveBandEdge;
    bottom: WaveBandEdge;
    scrollOffset?: ScrollOffset;
    featheredOut?: 'top' | 'bottom' | 'both';
    debug?: boolean;
}
declare function WaveBand({ waveConfig }: {
    waveConfig: WaveBandAnimation;
}): react_jsx_runtime.JSX.Element;

export { type BezierConfig, Wave, type WaveAnimation, WaveBand, type WaveBandAnimation, type WaveBandEdge, type WaveConfig, sampleConfig };
