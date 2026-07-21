import { sampleConfig, type WaveConfig } from '@threeaio/smooth-waves';
import type { LayerState } from './defaults';
import { curveControls, curvePath, curveYAt } from './wave-geometry';

/**
 * Layer-level hit testing for direct manipulation on the canvas: outline paths
 * for the hover/selection highlights and containment checks for click hits.
 * Everything works in normalized coordinates (0..1 across the bleed-wide canvas,
 * 0..1 down the section) so it survives the fitted view's scale transform —
 * the curve math itself lives in wave-geometry.ts.
 */

const outline = (config: WaveConfig, flip = false): string => curvePath(curveControls(config, flip));

/**
 * Is the normalized point inside the layer's filled shape at progress `t`?
 * Waves fill from their base edge (top, or bottom when flipped) to the curve;
 * bands fill between their two edge curves.
 */
export function layerContains(layer: LayerState, t: number, x: number, y: number): boolean {
    if (layer.mode === 'wave') {
        const cy = curveYAt(curveControls(sampleConfig(layer.configs, t), layer.flip), x);
        return layer.flip ? y >= cy : y <= cy;
    }
    const ty = curveYAt(curveControls(sampleConfig(layer.top.configs, t)), x);
    const by = curveYAt(curveControls(sampleConfig(layer.bottom.configs, t)), x);
    return y >= Math.min(ty, by) && y <= Math.max(ty, by);
}

/** The layer's edge curve(s) at progress `t`, as normalized outline paths. */
export function layerOutlines(layer: LayerState, t: number): string[] {
    if (layer.mode === 'wave') return [outline(sampleConfig(layer.configs, t), layer.flip)];
    return [outline(sampleConfig(layer.top.configs, t)), outline(sampleConfig(layer.bottom.configs, t))];
}
