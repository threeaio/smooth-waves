import { sampleConfig, type WaveConfig } from '@threeaio/smooth-waves';
import type { LayerState } from './defaults';

/**
 * Geometry helpers for direct manipulation on the canvas: outline paths for the
 * hover/selection highlights and a y-at-x evaluation for click hit testing.
 * Everything works in normalized coordinates (0..1 across the bleed-wide canvas,
 * 0..1 down the section) so it survives the fitted view's scale transform.
 */

interface Pt {
    x: number;
    y: number;
}

// flip mirrors the anchor y only — y-offsets are NOT flipped, matching the package
function controls(config: WaveConfig, flip = false): { p0: Pt; p1: Pt; p2: Pt; p3: Pt } {
    const ly = flip ? 1 - config.left[0] : config.left[0];
    const ry = flip ? 1 - config.right[0] : config.right[0];
    return {
        p0: { x: 0, y: ly },
        p1: { x: config.left[1], y: ly + config.left[2] },
        p2: { x: 1 - config.right[1], y: ry + config.right[2] },
        p3: { x: 1, y: ry },
    };
}

/**
 * A layer's curve as a normalized 0..1 path — rendered into an svg with
 * viewBox 0 0 1 1 + preserveAspectRatio="none" (cubic beziers survive
 * non-uniform scaling).
 */
export function curvePath(config: WaveConfig, flip = false): string {
    const { p0, p1, p2, p3 } = controls(config, flip);
    return `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
}

const cubic = (a: number, b: number, c: number, d: number, u: number): number => {
    const v = 1 - u;
    return v * v * v * a + 3 * v * v * u * b + 3 * v * u * u * c + u * u * u * d;
};

/** The curve's y at normalized x — sampled, so it tolerates non-monotonic x. */
export function curveYAt(config: WaveConfig, flip: boolean, x: number): number {
    const { p0, p1, p2, p3 } = controls(config, flip);
    let px = p0.x;
    let py = p0.y;
    for (let i = 1; i <= 64; i++) {
        const u = i / 64;
        const cx = cubic(p0.x, p1.x, p2.x, p3.x, u);
        const cy = cubic(p0.y, p1.y, p2.y, p3.y, u);
        if ((px <= x && cx >= x) || (px >= x && cx <= x)) {
            const f = cx === px ? 0 : (x - px) / (cx - px);
            return py + f * (cy - py);
        }
        px = cx;
        py = cy;
    }
    return x < 0.5 ? p0.y : p3.y;
}

/**
 * Is the normalized point inside the layer's filled shape at progress `t`?
 * Waves fill from their base edge (top, or bottom when flipped) to the curve;
 * bands fill between their two edge curves.
 */
export function layerContains(layer: LayerState, t: number, x: number, y: number): boolean {
    if (layer.mode === 'wave') {
        const cy = curveYAt(sampleConfig(layer.configs, t), layer.flip, x);
        return layer.flip ? y >= cy : y <= cy;
    }
    const ty = curveYAt(sampleConfig(layer.top.configs, t), false, x);
    const by = curveYAt(sampleConfig(layer.bottom.configs, t), false, x);
    return y >= Math.min(ty, by) && y <= Math.max(ty, by);
}

/** The layer's edge curve(s) at progress `t`, as normalized outline paths. */
export function layerOutlines(layer: LayerState, t: number): string[] {
    if (layer.mode === 'wave') return [curvePath(sampleConfig(layer.configs, t), layer.flip)];
    return [curvePath(sampleConfig(layer.top.configs, t)), curvePath(sampleConfig(layer.bottom.configs, t))];
}
