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
    featheredFill: string;
    strokeStyle?: string;
    fill?: string;
    stable: WaveConfig;
    in: WaveConfig;
    out: WaveConfig;
    scrollOffset?: ScrollOffset;
    curveAmount?: number;
    offsetLeft?: number;
    offsetRight?: number;
}
declare function Wave({ waveConfig: curveConfig }: {
    waveConfig?: WaveAnimation;
}): react_jsx_runtime.JSX.Element;

export { Wave, type WaveAnimation, type WaveConfig };
