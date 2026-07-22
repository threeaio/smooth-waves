import type { WaveConfig } from '@threeaio/smooth-waves';
import { normalizeColor } from './figma-export';

export type FeatheredOut = 'none' | 'top' | 'bottom' | 'both';
export type Mode = 'wave' | 'band';

export interface EdgeState {
    strokeStyle: string;
    strokeWidth: number;
    curveAmount: number;
    offsetLeft: number;
    offsetRight: number;
    configs: WaveConfig[];
}

export interface LayerState {
    id: string;
    name: string;
    mode: Mode; // fixed at creation
    visible: boolean;
    fill: string;
    featheredOut: FeatheredOut;
    /**
     * Fade depth of the feather in px (height-invariant, drawn in-canvas).
     * 0 falls back to the legacy %-based CSS mask (40% of the section height).
     */
    featherDepth: number;
    /** CSS blur on the layer's wrapper (px) — e4 softens its big fields with 60px. */
    blur: number;
    /**
     * Grainy dissolve (displacement px): dense fractal noise scatters the layer's
     * edge into speckle — the risograph "grainy gradient" look. On a hard edge it
     * yields a pure speckle band; combined with blur, falloff + grain. The solid
     * core stays solid either way.
     */
    dissolve: number;
    /**
     * Grain size of the dissolve noise (1 = per-pixel speckle). Scales the noise
     * frequency inversely — bigger values clump the speckle into coarser grain.
     */
    dissolveSize: number;
    debug: boolean;
    scrollStart: string;
    scrollEnd: string;
    // Wave
    strokeStyle: string;
    strokeWidth: number;
    flip: boolean;
    curveAmount: number;
    offsetLeft: number;
    offsetRight: number;
    configs: WaveConfig[];
    // WaveBand
    top: EdgeState;
    bottom: EdgeState;
}

export const round = (n: number): number => Math.round(n * 100) / 100;
export const clamp = (min: number, max: number, value: number): number => Math.min(max, Math.max(min, value));

// composer default palette (user-curated): deep ink, hot pink, sage page ground —
// the 'e4 ink & neon' preset keeps the original example-4 colors
export const ink = '#08090c';
export const pink = '#ff0a99';
export const sage = '#9dafa1';

/**
 * A small working palette, editable in the page inspector and offered as quick
 * swatches in every color field. Presets: the two house palettes first, then
 * user-picked Alex Cristache #MindfulPalettes (mp### = palette number) and the
 * threeaio "liquid neon" set. Slot order is tuned for `applyPalette` remapping:
 * 0 = dark ink, 1 = hot accent, 2 = light ground, rest = extras.
 */
export const palettePresets: Array<{ name: string; colors: string[] }> = [
    { name: 'ink & pink', colors: [ink, pink, sage, '#f81683', '#0c0542'] },
    { name: 'e4 ink & neon', colors: ['#231112', '#FF015E', '#FFBB00', '#FF5E2F', '#FFF3E0'] },
    // from the user's Figma landing-page WIP (coral sweep, ink fields, sage midfield, cream type)
    { name: 'coral & sage', colors: ['#272B38', '#FF6467', '#8EC199', '#F7F6D3'] },
    { name: 'liquid neon', colors: ['#0C121B', '#C8FF00', '#F4F5FA', '#0247FE'] },
    { name: 'patrinia violet', colors: ['#17184B', '#8547B5', '#C9D2DF', '#D9B611', '#553592', '#F2F2F4'] },
    { name: 'mp047 neon berry', colors: ['#040348', '#FD177B', '#DEDBFF', '#FFB800', '#330099', '#F8F0FB'] },
    { name: 'mp234 often orange', colors: ['#111122', '#FF714E', '#F0EEEE', '#004466', '#9698A3', '#3A383F'] },
    { name: 'mp274 screech owl', colors: ['#161820', '#C93F38', '#EAE4D8', '#2D4B65', '#2F323D', '#FAF7F0'] },
    { name: 'mp275 butternut', colors: ['#014B43', '#E3664C', '#FFD978', '#F4A461', '#005A85', '#FFFAF0'] },
    { name: 'mp281 wisteria', colors: ['#231C4D', '#A87DC2', '#E1DEE8', '#514B98', '#3F74B1', '#F8F8FF'] },
    { name: 'mp282 ocean bowl', colors: ['#082D4F', '#68DFBB', '#F0F4F8', '#FBEC5E', '#2599B2', '#225288'] },
];

// the template mirrors e4's ink field (wave) / blend band (band) — new layers
// drop into the same palette and scroll behavior as the initial stack
const layerTemplate: Omit<LayerState, 'id' | 'name' | 'mode' | 'visible'> = {
    fill: ink,
    featheredOut: 'none',
    featherDepth: 600,
    blur: 0,
    dissolve: 0,
    dissolveSize: 1,
    debug: false,
    scrollStart: 'start start',
    scrollEnd: 'end 25%',
    strokeStyle: pink,
    strokeWidth: 1.4,
    flip: false,
    curveAmount: 16,
    offsetLeft: 8,
    offsetRight: 28,
    configs: [
        {
            left: [0.36, 0.2, -0.07],
            right: [0.2, 0.59, -0.04],
        },
        {
            left: [0.65, 0.43, -0.47],
            right: [0.6, 0.06, -0.55],
        },
    ],
    top: {
        strokeStyle: pink,
        strokeWidth: 0.4,
        curveAmount: 16,
        offsetLeft: -8,
        offsetRight: -28,
        configs: [
            {
                left: [0.49, 0.25, 0.5],
                right: [0.64, 0.2, -0.3],
            },
            {
                left: [0.84, 0.4, -0.55],
                right: [0.54, 0.5, -0.38],
            },
        ],
    },
    bottom: {
        strokeStyle: pink,
        strokeWidth: 0.4,
        curveAmount: 0,
        offsetLeft: 8,
        offsetRight: 28,
        configs: [
            {
                left: [0.64, 0.35, 0.35],
                right: [0.9, 0.3, -0.2],
            },
            {
                left: [0.97, 0.45, -0.55],
                right: [0.64, 0.55, -0.25],
            },
        ],
    },
};

export function createLayer(mode: Mode, n: number): LayerState {
    return {
        ...structuredClone(layerTemplate),
        id: `layer-${n}`,
        name: `${mode} ${n}`,
        mode,
        visible: true,
        // bands float over other layers — the blend band sits at 90% opacity
        ...(mode === 'band' ? { fill: 'rgb(255 10 153 / 0.9)' } : {}),
    };
}

// e4 scene 1 stretched to landing-page height (4000px): blend band behind,
// ink field on top, magenta glow at the top edge — plus a violet band and a
// thin pink ribbon filling the midfield, and a soft glow under the bottom ink
export const initialLayers: LayerState[] = [
    {
        ...structuredClone(layerTemplate),
        id: 'layer-1',
        name: 'blend band',
        mode: 'band',
        visible: true,
        fill: 'rgb(255 10 153 / 0.9)',
    },
    {
        ...structuredClone(layerTemplate),
        id: 'layer-2',
        name: 'ink field',
        mode: 'wave',
        visible: true,
        curveAmount: 0,
    },
    {
        ...structuredClone(layerTemplate),
        id: 'layer-3',
        name: 'magenta glow',
        mode: 'wave',
        visible: true,
        fill: pink,
        strokeStyle: ink,
        strokeWidth: 0.4,
        offsetLeft: -10,
        offsetRight: -36,
        configs: [
            {
                left: [0.02, 0.2, 0.4],
                right: [0.07, 0.6, -0.05],
            },
            {
                left: [0.13, 0.7, 0.04],
                right: [1, 0.5, -0.08],
            },
        ],
    },
    {
        ...structuredClone(layerTemplate),
        id: 'layer-5',
        name: 'violet band',
        mode: 'band',
        visible: true,
        fill: '#0c0542',
        scrollStart: 'start 80%',
        scrollEnd: 'end 30%',
        top: {
            strokeStyle: pink,
            strokeWidth: 0.4,
            curveAmount: 0,
            offsetLeft: 0,
            offsetRight: 0,
            configs: [
                {
                    left: [0.5, 0.3, 0.15],
                    right: [0.58, 0.4, -0.2],
                },
                {
                    left: [0.62, 0.5, -0.25],
                    right: [0.48, 0.3, 0.2],
                },
            ],
        },
        bottom: {
            strokeStyle: pink,
            strokeWidth: 0.4,
            curveAmount: 0,
            offsetLeft: 0,
            offsetRight: 0,
            configs: [
                {
                    left: [0.62, 0.35, 0.12],
                    right: [0.68, 0.45, -0.15],
                },
                {
                    left: [0.72, 0.5, -0.2],
                    right: [0.6, 0.3, 0.18],
                },
            ],
        },
    },
    {
        ...structuredClone(layerTemplate),
        id: 'layer-6',
        name: 'pink ribbon',
        mode: 'band',
        visible: true,
        fill: pink,
        scrollStart: 'start end',
        scrollEnd: 'end start',
        top: {
            strokeStyle: ink,
            strokeWidth: 0.4,
            curveAmount: 0,
            offsetLeft: 0,
            offsetRight: 0,
            configs: [
                {
                    left: [0.38, 0.25, -0.12],
                    right: [0.32, 0.5, 0.18],
                },
                {
                    left: [0.3, 0.6, 0.2],
                    right: [0.4, 0.2, -0.15],
                },
            ],
        },
        bottom: {
            strokeStyle: ink,
            strokeWidth: 0.4,
            curveAmount: 0,
            offsetLeft: 0,
            offsetRight: 0,
            configs: [
                {
                    left: [0.42, 0.3, -0.1],
                    right: [0.37, 0.45, 0.15],
                },
                {
                    left: [0.35, 0.55, 0.18],
                    right: [0.45, 0.25, -0.12],
                },
            ],
        },
    },
    {
        ...structuredClone(layerTemplate),
        id: 'layer-4',
        name: 'ink bottom',
        mode: 'wave',
        visible: true,
        flip: true,
        configs: [
            {
                left: [0.3, 0.09, -0.03],
                right: [0.03, 0.16, -0.35],
            },
            {
                left: [0.06, 0.1, -0.17],
                right: [0.08, 0.5, -0.22],
            },
        ],
    },
    {
        ...structuredClone(layerTemplate),
        id: 'layer-7',
        name: 'glow bottom',
        mode: 'wave',
        visible: true,
        fill: pink,
        flip: true,
        blur: 36,
        curveAmount: 0,
        scrollStart: 'start end',
        scrollEnd: 'end start',
        configs: [
            {
                left: [0.05, 0.4, 0.15],
                right: [0.1, 0.3, -0.1],
            },
            {
                left: [0.12, 0.6, -0.2],
                right: [0.04, 0.3, 0.12],
            },
        ],
    },
];

// e4's grain: two fixed fractal-noise overlays on top of the whole page
export const grainTexture =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='12' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// the screen width the fitted artboard mocks (fixed for now); its height is the
// section height, so the fit view is an upright overview of the whole composition
export const MOCK_WIDTH = 1400;

export const scrollPresets: Array<{ label: string; start: string; end: string }> = [
    { label: 'start end → end start (full pass)', start: 'start end', end: 'end start' },
    { label: 'start start → end end (while pinned)', start: 'start start', end: 'end end' },
    { label: '5% 0% → 150% 80% (hero)', start: '5% 0%', end: '150% 80%' },
    { label: 'start 80% → end 30% (content)', start: 'start 80%', end: 'end 30%' },
];

/**
 * If `value` is (any alpha of) the previous palette color at some slot, return that
 * slot's new color with the alpha preserved. This is what makes palette edits and
 * preset switches recolor the whole composition — colors not taken from the palette
 * pass through untouched.
 */
export function remapPaletteColor(value: string, prev: string[], next: string[]): string {
    const { hex, alpha } = normalizeColor(value);
    const slot = prev.findIndex((c) => normalizeColor(c).hex.toLowerCase() === hex.toLowerCase());
    if (slot === -1 || !next[slot] || prev[slot] === next[slot]) return value;
    if (alpha >= 1) return next[slot];
    const nextHex = normalizeColor(next[slot]).hex;
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(nextHex.slice(i, i + 2), 16));
    return `rgb(${r} ${g} ${b} / ${alpha})`;
}
