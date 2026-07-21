import { sampleConfig, type WaveConfig } from '@threeaio/smooth-waves';

/**
 * SVG snapshot of a layer stack at a given scroll progress — Figma pastes SVG
 * markup from the clipboard as editable vectors, so this IS the Figma export.
 * The path math replicates the canvas drawing 1:1 (drawWavePath in wave.tsx,
 * edgeGeometry/drawBandPath/strokeEdgeFan in wave-band.tsx).
 */

export interface ExportEdge {
    configs: WaveConfig[];
    strokeStyle: string;
    strokeWidth: number;
    curveAmount: number;
    offsetLeft: number;
    offsetRight: number;
}

export interface ExportLayer {
    name: string;
    mode: 'wave' | 'band';
    fill: string;
    featheredOut: 'none' | 'top' | 'bottom' | 'both';
    /** CSS wrapper blur in px — not expressible in Figma-pasteable SVG, noted as a comment. */
    blur: number;
    /** Grainy-dissolve displacement in px — an SVG filter, not exportable; noted as a comment. */
    dissolve: number;
    scrollStart: string;
    scrollEnd: string;
    // wave
    strokeStyle: string;
    strokeWidth: number;
    flip: boolean;
    curveAmount: number;
    offsetLeft: number;
    offsetRight: number;
    configs: WaveConfig[];
    // band
    top: ExportEdge;
    bottom: ExportEdge;
}

const r = (n: number): number => Math.round(n * 100) / 100;
const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

/** Decorative strokes are invisible under heavy blur — above this radius they are skipped as waste. */
export const BLUR_HIDES_STROKES = 4;
export const effectiveCurveAmount = (blur: number, curveAmount: number): number =>
    blur > BLUR_HIDES_STROKES ? 0 : curveAmount;

/* ------------------------------- scroll progress ------------------------------- */

/** One side of a motion offset intersection ("start", "end", "center", "N%", "Npx", bare fraction) → px. */
function parsePoint(token: string, length: number): number | null {
    if (token === 'start') return 0;
    if (token === 'center') return length / 2;
    if (token === 'end') return length;
    const pct = token.match(/^(-?\d*\.?\d+)%$/);
    if (pct) return (Number(pct[1]) / 100) * length;
    const px = token.match(/^(-?\d*\.?\d+)px$/);
    if (px) return Number(px[1]);
    const num = token.match(/^(-?\d*\.?\d+)$/);
    if (num) return Number(num[1]) * length;
    return null;
}

/**
 * motion offset semantics: "A B" = the scrollY at which section point A meets
 * viewport point B. A single token means "A A".
 */
function offsetToScrollY(
    offset: string,
    sectionTop: number,
    sectionHeight: number,
    viewportHeight: number,
): number | null {
    const tokens = offset.trim().split(/\s+/);
    const a = parsePoint(tokens[0] ?? '', sectionHeight);
    const b = parsePoint(tokens[1] ?? tokens[0] ?? '', viewportHeight);
    if (a === null || b === null) return null;
    return sectionTop + a - b;
}

/** The progress a layer's useScroll would report at `scrollY` (sectionTop in document coords). */
export function layerProgress(
    scrollStart: string,
    scrollEnd: string,
    sectionTop: number,
    sectionHeight: number,
    viewportHeight: number,
    scrollY: number,
): number {
    let y0 = offsetToScrollY(scrollStart, sectionTop, sectionHeight, viewportHeight);
    let y1 = offsetToScrollY(scrollEnd, sectionTop, sectionHeight, viewportHeight);
    if (y0 === null || y1 === null) {
        console.warn(
            `[playground] cannot parse scroll offsets "${scrollStart}" / "${scrollEnd}" — exporting a full pass instead`,
        );
        y0 = offsetToScrollY('start end', sectionTop, sectionHeight, viewportHeight)!;
        y1 = offsetToScrollY('end start', sectionTop, sectionHeight, viewportHeight)!;
    }
    if (y1 === y0) return 0;
    return clamp01((scrollY - y0) / (y1 - y0));
}

/* ---------------------------------- colors ---------------------------------- */

let colorCtx: CanvasRenderingContext2D | null = null;

/**
 * Normalize any CSS color to hex + alpha via a canvas round-trip. Needed both
 * for the color input's swatch and for the SVG export (Figma's SVG parser does
 * not understand modern `hsl(160 12% 32%)` / `rgb(... / a)` notations).
 */
export function normalizeColor(value: string): { hex: string; alpha: number } {
    if (/^#[0-9a-f]{6}$/i.test(value)) return { hex: value, alpha: 1 };
    if (typeof document === 'undefined') return { hex: '#000000', alpha: 1 };
    colorCtx ??= document.createElement('canvas').getContext('2d');
    if (!colorCtx) return { hex: '#000000', alpha: 1 };
    colorCtx.fillStyle = '#000';
    colorCtx.fillStyle = value; // invalid strings are ignored and keep the previous value
    const normalized = colorCtx.fillStyle;
    if (/^#[0-9a-f]{6}$/i.test(normalized)) return { hex: normalized, alpha: 1 };
    // translucent colors normalize to rgba(r, g, b, a)
    const m = normalized.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!m) return { hex: '#000000', alpha: 1 };
    return {
        hex: `#${[m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`,
        alpha: m[4] === undefined ? 1 : Number(m[4]),
    };
}

function fillAttrs(color: string): string {
    const { hex, alpha } = normalizeColor(color);
    return `fill="${hex}"${alpha < 1 ? ` fill-opacity="${r(alpha)}"` : ''}`;
}

function strokeAttrs(color: string, width: number): string {
    const { hex, alpha } = normalizeColor(color);
    return `fill="none" stroke="${hex}"${alpha < 1 ? ` stroke-opacity="${r(alpha)}"` : ''} stroke-width="${r(width)}"`;
}

/* ---------------------------------- geometry ---------------------------------- */

interface EdgeGeometry {
    leftY: number;
    leftCx: number;
    leftCy: number;
    rightY: number;
    rightCx: number;
    rightCy: number;
}

// flip mirrors the anchor y only — y-offsets are NOT flipped, matching the package
function edgeGeometry(config: WaveConfig, w: number, h: number, flip = false): EdgeGeometry {
    const leftY = (flip ? 1 - config.left[0] : config.left[0]) * h;
    const rightY = (flip ? 1 - config.right[0] : config.right[0]) * h;
    return {
        leftY,
        leftCx: config.left[1] * w,
        leftCy: leftY + config.left[2] * h,
        rightY,
        rightCx: w - config.right[1] * w,
        rightCy: rightY + config.right[2] * h,
    };
}

/* ----------------------------------- layers ----------------------------------- */

function waveGroup(layer: ExportLayer, w: number, h: number, t: number): string {
    const g = edgeGeometry(sampleConfig(layer.configs, t), w, h, layer.flip);
    const base = layer.flip ? h : 0;
    const fill =
        `M 0 ${r(base)} L ${r(w)} ${r(base)} L ${r(w)} ${r(g.rightY)} ` +
        `C ${r(g.rightCx)} ${r(g.rightCy)}, ${r(g.leftCx)} ${r(g.leftCy)}, 0 ${r(g.leftY)} Z`;
    const paths = [`    <path d="${fill}" ${fillAttrs(layer.fill)} />`];
    for (let i = 0; i < effectiveCurveAmount(layer.blur, layer.curveAmount); i++) {
        const k = i + 1;
        const oL = layer.offsetLeft * k;
        const oR = layer.offsetRight * k;
        const d =
            `M ${r(w)} ${r(g.rightY + oR)} ` +
            `C ${r(g.rightCx)} ${r(g.rightCy + oR)}, ${r(g.leftCx)} ${r(g.leftCy + oL)}, 0 ${r(g.leftY + oL)}`;
        paths.push(`    <path d="${d}" ${strokeAttrs(layer.strokeStyle, layer.strokeWidth)} />`);
    }
    return paths.join('\n');
}

function edgeFan(g: EdgeGeometry, edge: ExportEdge, w: number, blur: number): string[] {
    const paths: string[] = [];
    for (let i = 0; i < effectiveCurveAmount(blur, edge.curveAmount); i++) {
        const k = i + 1;
        const oL = edge.offsetLeft * k;
        const oR = edge.offsetRight * k;
        const d =
            `M 0 ${r(g.leftY + oL)} ` +
            `C ${r(g.leftCx)} ${r(g.leftCy + oL)}, ${r(g.rightCx)} ${r(g.rightCy + oR)}, ${r(w)} ${r(g.rightY + oR)}`;
        paths.push(`    <path d="${d}" ${strokeAttrs(edge.strokeStyle, edge.strokeWidth)} />`);
    }
    return paths;
}

function bandGroup(layer: ExportLayer, w: number, h: number, t: number): string {
    const top = edgeGeometry(sampleConfig(layer.top.configs, t), w, h);
    const bottom = edgeGeometry(sampleConfig(layer.bottom.configs, t), w, h);
    const fill =
        `M 0 ${r(top.leftY)} ` +
        `C ${r(top.leftCx)} ${r(top.leftCy)}, ${r(top.rightCx)} ${r(top.rightCy)}, ${r(w)} ${r(top.rightY)} ` +
        `L ${r(w)} ${r(bottom.rightY)} ` +
        `C ${r(bottom.rightCx)} ${r(bottom.rightCy)}, ${r(bottom.leftCx)} ${r(bottom.leftCy)}, 0 ${r(bottom.leftY)} Z`;
    return [
        `    <path d="${fill}" ${fillAttrs(layer.fill)} />`,
        ...edgeFan(top, layer.top, w, layer.blur),
        ...edgeFan(bottom, layer.bottom, w, layer.blur),
    ].join('\n');
}

const escapeAttr = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Build the paste-into-Figma SVG for the visible stack; `progressFor` supplies each
 * layer's scroll progress. `bleed` is the horizontal overscan per side (fraction of
 * width, e4: 0.14) — layers are computed on the wider canvas and shifted left, so
 * their visible sweep matches the preview.
 */
export function buildFigmaSvg(
    layers: ExportLayer[],
    width: number,
    height: number,
    progressFor: (layer: ExportLayer) => number,
    background?: string,
    bleed = 0,
): string {
    const layerW = width * (1 + 2 * bleed);
    const dx = bleed * width;
    const bgRect = background
        ? `\n  <rect id="background" width="${r(width)}" height="${r(height)}" ${fillAttrs(background)} />`
        : '';
    const groups = layers.map(
        (layer) =>
            `  <g id="${escapeAttr(layer.name)}"${dx > 0 ? ` transform="translate(${r(-dx)} 0)"` : ''}>\n${
                layer.mode === 'wave'
                    ? waveGroup(layer, layerW, height, progressFor(layer))
                    : bandGroup(layer, layerW, height, progressFor(layer))
            }\n  </g>`,
    );
    const notes: string[] = [];
    if (layers.some((l) => l.featheredOut !== 'none'))
        notes.push('\n  <!-- featheredOut is a CSS mask and not part of this export -->');
    for (const l of layers.filter((l) => l.blur > 0))
        notes.push(`\n  <!-- "${escapeAttr(l.name)}" has a ${r(l.blur)}px blur — add it as a Figma layer blur -->`);
    if (layers.some((l) => l.dissolve > 0))
        notes.push('\n  <!-- grainy dissolve is an SVG displacement filter and not part of this export -->');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${r(width)}" height="${r(height)}" viewBox="0 0 ${r(width)} ${r(height)}" fill="none">${notes.join('')}${bgRect}\n${groups.join('\n')}\n</svg>`;
}
