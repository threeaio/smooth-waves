import type { WaveConfig } from '@threeaio/smooth-waves';

/**
 * The single source for the composer's wave-curve math. Both the pen-tool
 * overlay (px space) and canvas hit testing (normalized space) derive their
 * geometry from here so the bezier construction can't drift apart.
 */

export interface Pt {
    x: number;
    y: number;
}

export interface CurveControls {
    p0: Pt;
    p1: Pt;
    p2: Pt;
    p3: Pt;
}

/** Normalized 0..1 control points. flip mirrors the anchor y only — y-offsets are NOT flipped, matching the package. */
export function curveControls(config: WaveConfig, flip = false): CurveControls {
    const ly = flip ? 1 - config.left[0] : config.left[0];
    const ry = flip ? 1 - config.right[0] : config.right[0];
    return {
        p0: { x: 0, y: ly },
        p1: { x: config.left[1], y: ly + config.left[2] },
        p2: { x: 1 - config.right[1], y: ry + config.right[2] },
        p3: { x: 1, y: ry },
    };
}

/** Scale normalized controls into a w×h box (the overlay's handle space). */
export function scaleControls(c: CurveControls, w: number, h: number): CurveControls {
    const s = (p: Pt): Pt => ({ x: p.x * w, y: p.y * h });
    return { p0: s(c.p0), p1: s(c.p1), p2: s(c.p2), p3: s(c.p3) };
}

/** SVG path string — works for normalized (viewBox 0 0 1 1) and px-space controls alike. */
export function curvePath(c: CurveControls): string {
    return `M ${c.p0.x} ${c.p0.y} C ${c.p1.x} ${c.p1.y}, ${c.p2.x} ${c.p2.y}, ${c.p3.x} ${c.p3.y}`;
}

export function cubicAt(a: number, b: number, c: number, d: number, u: number): number {
    const v = 1 - u;
    return v * v * v * a + 3 * v * v * u * b + 3 * v * u * u * c + u * u * u * d;
}

/** The curve's y at x — sampled, so it tolerates non-monotonic x. */
export function curveYAt(c: CurveControls, x: number): number {
    const { p0, p1, p2, p3 } = c;
    let px = p0.x;
    let py = p0.y;
    for (let i = 1; i <= 64; i++) {
        const u = i / 64;
        const cx = cubicAt(p0.x, p1.x, p2.x, p3.x, u);
        const cy = cubicAt(p0.y, p1.y, p2.y, p3.y, u);
        if ((px <= x && cx >= x) || (px >= x && cx <= x)) {
            const f = cx === px ? 0 : (x - px) / (cx - px);
            return py + f * (cy - py);
        }
        px = cx;
        py = cy;
    }
    return x < 0.5 ? p0.y : p3.y;
}
