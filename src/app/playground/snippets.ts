import type { WaveConfig } from '@threeaio/smooth-waves';
import { round, type EdgeState, type LayerState } from './defaults';
import { effectiveCurveAmount } from './figma-export';

const WAVE_DEFAULTS = {
    strokeStyle: '#fff',
    strokeWidth: 0.4,
    curveAmount: 0,
    offsetLeft: 0,
    offsetRight: 0,
} as const;

// WaveBand edges default curveAmount to 0 (no hairline trap)
const EDGE_DEFAULTS = {
    strokeStyle: '#fff',
    strokeWidth: 0.4,
    curveAmount: 0,
    offsetLeft: 0,
    offsetRight: 0,
} as const;

function configLines(configs: WaveConfig[]): string[] {
    const lines: string[] = ['configs: ['];
    for (const c of configs) {
        lines.push(`    {`);
        lines.push(`        left: [${c.left.map(round).join(', ')}],`);
        lines.push(`        right: [${c.right.map(round).join(', ')}],`);
        lines.push(`    },`);
    }
    lines.push('],');
    return lines;
}

/** Serialize one wave layer as a ready-to-paste `<Wave />` snippet, omitting defaults. */
export function toWaveSnippet(s: LayerState): string {
    // strokes vanish under heavy blur — export them as off instead of as waste
    const curveAmount = effectiveCurveAmount(s.blur, s.curveAmount);
    const lines: string[] = [];
    lines.push(`fill: '${s.fill}',`);
    if (s.strokeStyle !== WAVE_DEFAULTS.strokeStyle) lines.push(`strokeStyle: '${s.strokeStyle}',`);
    if (s.strokeWidth !== WAVE_DEFAULTS.strokeWidth) lines.push(`strokeWidth: ${round(s.strokeWidth)},`);
    if (curveAmount !== WAVE_DEFAULTS.curveAmount) lines.push(`curveAmount: ${curveAmount},`);
    if (s.offsetLeft !== WAVE_DEFAULTS.offsetLeft) lines.push(`offsetLeft: ${s.offsetLeft},`);
    if (s.offsetRight !== WAVE_DEFAULTS.offsetRight) lines.push(`offsetRight: ${s.offsetRight},`);
    if (s.flip) lines.push(`flip: true,`);
    if (s.featheredOut !== 'none') lines.push(`featheredOut: '${s.featheredOut}',`);
    if (s.featheredOut !== 'none' && s.featherDepth > 0) lines.push(`featherDepth: ${s.featherDepth},`);
    if (s.debug) lines.push(`debug: true,`);
    lines.push(...configLines(s.configs));
    lines.push(`scrollOffset: ['${s.scrollStart}', '${s.scrollEnd}'],`);

    const body = lines.map((l) => `        ${l}`).join('\n');
    return `<Wave\n    waveConfig={{\n${body}\n    }}\n/>`;
}

function edgeLines(name: 'top' | 'bottom', e: EdgeState, blur: number): string[] {
    const curveAmount = effectiveCurveAmount(blur, e.curveAmount);
    const lines: string[] = [`${name}: {`];
    if (e.strokeStyle !== EDGE_DEFAULTS.strokeStyle && curveAmount > 0)
        lines.push(`    strokeStyle: '${e.strokeStyle}',`);
    if (e.strokeWidth !== EDGE_DEFAULTS.strokeWidth && curveAmount > 0)
        lines.push(`    strokeWidth: ${round(e.strokeWidth)},`);
    if (curveAmount !== EDGE_DEFAULTS.curveAmount) lines.push(`    curveAmount: ${curveAmount},`);
    if (e.offsetLeft !== EDGE_DEFAULTS.offsetLeft && curveAmount > 0) lines.push(`    offsetLeft: ${e.offsetLeft},`);
    if (e.offsetRight !== EDGE_DEFAULTS.offsetRight && curveAmount > 0)
        lines.push(`    offsetRight: ${e.offsetRight},`);
    lines.push(...configLines(e.configs).map((l) => `    ${l}`));
    lines.push('},');
    return lines;
}

/** Serialize one band layer as a ready-to-paste `<WaveBand />` snippet, omitting defaults. */
export function toBandSnippet(s: LayerState): string {
    const lines: string[] = [];
    lines.push(`fill: '${s.fill}',`);
    if (s.featheredOut !== 'none') lines.push(`featheredOut: '${s.featheredOut}',`);
    if (s.featheredOut !== 'none' && s.featherDepth > 0) lines.push(`featherDepth: ${s.featherDepth},`);
    if (s.debug) lines.push(`debug: true,`);
    lines.push(...edgeLines('top', s.top, s.blur));
    lines.push(...edgeLines('bottom', s.bottom, s.blur));
    lines.push(`scrollOffset: ['${s.scrollStart}', '${s.scrollEnd}'],`);

    const body = lines.map((l) => `        ${l}`).join('\n');
    return `<WaveBand\n    waveConfig={{\n${body}\n    }}\n/>`;
}

/** The whole visible stack as one section snippet, in paint order. */
export function toStackSnippet(layers: LayerState[], sectionPx: number, bleedX: number): string {
    const indent = (text: string, by: string) =>
        text
            .split('\n')
            .map((line) => `${by}${line}`)
            .join('\n');
    const slug = (name: string) => name.toLowerCase().replace(/\W+/g, '-');
    const parts = layers
        .filter((l) => l.visible)
        .map((l) => {
            const snippet = l.mode === 'wave' ? toWaveSnippet(l) : toBandSnippet(l);
            const filter = [
                l.blur > 0 ? `blur(${l.blur}px)` : null,
                l.dissolve > 0 ? `url(#dissolve-${slug(l.name)})` : null,
            ]
                .filter(Boolean)
                .join(' ');
            if (bleedX === 0 && !filter) return `    {/* ${l.name} */}\n${indent(snippet, '    ')}`;
            // e4's Field wrapper: horizontal overscan + optional blur/dissolve
            const inset = bleedX > 0 ? `-inset-x-[${bleedX}%] inset-y-0` : 'inset-0';
            const style = filter ? ` style={{ filter: '${filter}' }}` : '';
            return (
                `    {/* ${l.name} */}\n` +
                `    <div aria-hidden className="pointer-events-none absolute ${inset}"${style}>\n` +
                `${indent(snippet, '        ')}\n` +
                `    </div>`
            );
        });
    // grainy-dissolve: noise-displace the soft edge, blend the original back underneath
    const dissolving = layers.filter((l) => l.visible && l.dissolve > 0);
    const defs =
        dissolving.length > 0
            ? `    <svg width="0" height="0" aria-hidden className="absolute">\n` +
              dissolving
                  .map(
                      (l) =>
                          `        <filter id="dissolve-${slug(l.name)}" colorInterpolationFilters="sRGB">\n` +
                          `            <feTurbulence type="fractalNoise" baseFrequency="${(0.9713 / Math.max(1, l.dissolveSize)).toFixed(4)}" numOctaves="4" />\n` +
                          `            <feDisplacementMap in="SourceGraphic" scale={${l.dissolve}} xChannelSelector="R" />\n` +
                          `            <feBlend in2="SourceGraphic" />\n` +
                          `        </filter>\n`,
                  )
                  .join('') +
              `    </svg>\n`
            : '';
    return `<div className="relative h-[${sectionPx}px] overflow-x-clip">\n${defs}${parts.join('\n')}\n</div>`;
}
