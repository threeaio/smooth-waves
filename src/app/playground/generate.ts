import type { WaveConfig } from '@threeaio/smooth-waves';
import { clamp, createLayer, palettePresets, round, scrollPresets, type LayerState } from './defaults';

/**
 * Seeded random-layout generator. The rules are distilled from the curated
 * defaults (e4) and the palette slot semantics: a composition is a sentence
 * from a small grammar of archetypes — anchor fields, glow slivers, floating
 * bands — placed into vertical zones with an effects budget on top. Everything
 * numeric is jittered inside ranges taken from configs that are known to look
 * good; a coverage check rejects results with too little breathing room.
 */

/* ------------------------------- seeded rng ------------------------------- */

// mulberry32 — tiny, good-enough, reproducible
function createRng(seed: number) {
    let a = seed >>> 0;
    const next = () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
        next,
        range: (min: number, max: number) => min + next() * (max - min),
        int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
        pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
        chance: (p: number) => next() < p,
        sign: (): 1 | -1 => (next() < 0.5 ? -1 : 1),
        shuffle: <T>(arr: readonly T[]): T[] => {
            const out = [...arr];
            for (let i = out.length - 1; i > 0; i--) {
                const j = Math.floor(next() * (i + 1));
                [out[i], out[j]] = [out[j], out[i]];
            }
            return out;
        },
    };
}
type Rng = ReturnType<typeof createRng>;

function weighted<T>(r: Rng, entries: Array<[T, number]>): T {
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let t = r.next() * total;
    for (const [value, w] of entries) {
        t -= w;
        if (t <= 0) return value;
    }
    return entries[entries.length - 1][0];
}

/* ------------------------------ color helpers ----------------------------- */

// palette slot semantics (see palettePresets): 0 dark ink, 1 hot accent, 2 light ground
interface Roles {
    ink: string;
    accent: string;
    ground: string;
    extras: string[];
}

/* ------------------------------ curve builders ---------------------------- */

const bezier = (y: number, xOffset: number, yOffset: number): [number, number, number] => [
    round(clamp(0.02, 0.96, y)),
    round(xOffset),
    round(yOffset),
];

// The main bezier runs right → left; once the two handle x-offsets sum past the
// width, the control points cross and the curve doubles back in x — the shape
// folds over into a vertical flap. Sampling the PAIR with a bounded sum (the
// curated configs all stay ≤ ~1) rules that out by construction.
const handlePair = (r: Rng): [number, number] => {
    const total = r.range(0.3, 1);
    const split = r.range(0.2, 0.8);
    return [total * split, total * (1 - split)];
};

// keyframe 2 is a bounded walk from keyframe 1 — independent samples would
// make the scroll pass teleport
function waveKeyframes(r: Rng, yLeft: number, yRight: number, amp: number): WaveConfig[] {
    const kf = (yL: number, yR: number, bow: 1 | -1): WaveConfig => {
        const [leftXo, rightXo] = handlePair(r);
        // mostly bow-coherent (both handles pull the same way → a clear concave
        // or convex sweep); sometimes one end pulls against it → S-curve
        const pull = () => bow * r.range(0.08, 0.5) * amp * (r.chance(0.25) ? -1 : 1);
        return { left: bezier(yL, leftXo, pull()), right: bezier(yR, rightXo, pull()) };
    };
    const bow = r.sign();
    let yL = yLeft;
    let yR = yRight;
    let currentBow = bow;
    const frames = [kf(yL, yR, currentBow)];
    // each end walks on its own — opposing directions rotate/steepen the shape
    // over the scroll pass instead of just sliding it down the page; flipping
    // the bow turns concave into convex. The curated examples use up to three
    // keyframes, so sometimes the walk continues.
    const steps = r.chance(0.35) ? 2 : 1;
    for (let i = 0; i < steps; i++) {
        yL += r.sign() * r.range(0.1, 0.4) * amp;
        yR += r.sign() * r.range(0.1, 0.4) * amp;
        if (r.chance(0.6)) currentBow = (-currentBow) as 1 | -1;
        frames.push(kf(yL, yR, currentBow));
    }
    return frames;
}

// A band is ONE spine with a thickness profile: the bottom edge reuses the top
// edge's handle geometry, just shifted down — two independently curved edges
// twist through each other mid-span no matter how the endpoints are ordered.
// Tapering (different left/right thickness) is fine; crossing is not.
function bandKeyframes(
    r: Rng,
    center: number,
    thickness: number,
    amp: number,
): { top: WaveConfig[]; bottom: WaveConfig[] } {
    let topL = center - thickness / 2;
    let topR = topL + r.sign() * r.range(0.02, 0.28) * amp;
    let thickL = thickness * r.range(0.6, 1.4);
    let thickR = thickness * r.range(0.6, 1.4);
    const kf = (bow: 1 | -1) => {
        const tL = clamp(0.02, 0.9, topL);
        const tR = clamp(0.02, 0.9, topR);
        const [leftXo, rightXo] = handlePair(r);
        // the band bends as one body in the bow direction
        const yoL = bow * r.range(0.05, 0.4) * amp;
        const yoR = bow * r.range(0.05, 0.4) * amp;
        const drift = () => r.range(-0.04, 0.04) * amp; // near-parallel, never opposing
        return {
            top: { left: bezier(tL, leftXo, yoL), right: bezier(tR, rightXo, yoR) },
            bottom: {
                left: bezier(tL + Math.max(0.04 * amp, thickL), leftXo, yoL + drift()),
                right: bezier(tR + Math.max(0.04 * amp, thickR), rightXo, yoR + drift()),
            },
        };
    };
    const bow = r.sign();
    const k1 = kf(bow);
    // ends walk independently (tilt/rotation), the thickness profile reshapes,
    // and the bow flips concave↔convex more often than not
    topL += r.sign() * r.range(0.08, 0.35) * amp;
    topR += r.sign() * r.range(0.08, 0.35) * amp;
    thickL *= r.range(0.5, 1.8);
    thickR *= r.range(0.5, 1.8);
    const k2 = kf(r.chance(0.6) ? ((-bow) as 1 | -1) : bow);
    return { top: [k1.top, k2.top], bottom: [k1.bottom, k2.bottom] };
}

/* ------------------------------- archetypes ------------------------------- */

type Side = 'top' | 'bottom';

// anchor mass growing from the top or bottom edge; extent = how far it reaches
function makeField(r: Rng, roles: Roles, side: Side, extent: number, amp: number, id: number, fill?: string): LayerState {
    const layer = createLayer('wave', id);
    layer.name = `field ${side}`;
    layer.flip = side === 'bottom';
    layer.fill = fill ?? roles.ink;
    layer.configs = waveKeyframes(r, extent, clamp(0.03, 0.9, extent + r.sign() * r.range(0.02, 0.3) * amp), amp);
    // stroke fans are the signature of the curated examples — three flavors:
    // dense hairlines (e3), sparse wide sweeps (e1), and a rare fat echo edge
    // (e3's strokeWidth-80 double line). Both offsets share a sign — a fan
    // spreading up on one side and down on the other crosses its own edge.
    if (r.chance(0.7)) {
        layer.strokeStyle = r.chance(0.7) ? roles.accent : r.pick([roles.ground, ...roles.extras]);
        const dir = r.sign();
        const fan = weighted(r, [
            ['dense', 0.45],
            ['sparse', 0.45],
            ['echo', 0.1],
        ] as Array<['dense' | 'sparse' | 'echo', number]>);
        if (fan === 'dense') {
            layer.curveAmount = r.int(10, 24);
            layer.strokeWidth = round(r.range(0.3, 1.2));
            layer.offsetLeft = dir * r.int(4, 20);
            layer.offsetRight = dir * r.int(12, 44);
        } else if (fan === 'sparse') {
            layer.curveAmount = r.int(2, 5);
            layer.strokeWidth = round(r.range(0.4, 2));
            layer.offsetLeft = dir * r.int(20, 60);
            layer.offsetRight = dir * r.int(60, 130);
        } else {
            layer.curveAmount = 1;
            layer.strokeWidth = r.int(40, 90);
            layer.offsetLeft = dir * r.int(80, 110);
            layer.offsetRight = dir * r.int(80, 110);
        }
    } else {
        layer.curveAmount = 0;
        // even without a fan, keep the (invisible) stroke color inside the palette —
        // it shows in the inspector and lands in copied JSX
        layer.strokeStyle = roles.accent;
    }
    return layer;
}

// tone-on-tone wash with a feathered base — e2's solid #c9cbce fields on gray;
// a quiet close-tone mass, no transparency (user rule)
function makeVeil(r: Rng, roles: Roles, amp: number, id: number): LayerState {
    const layer = createLayer('wave', id);
    layer.name = 'veil';
    const side = r.pick<Side>(['top', 'bottom']);
    layer.flip = side === 'bottom';
    layer.featheredOut = side;
    const pool = roles.extras.length ? roles.extras : [roles.accent];
    layer.fill = r.pick(pool);
    layer.curveAmount = 0;
    layer.strokeStyle = roles.accent; // unused (no fan), but stays in-palette
    const base = r.range(0.3, 0.6);
    layer.configs = waveKeyframes(r, base, clamp(0.1, 0.8, base + r.sign() * r.range(0.05, 0.3) * amp), amp);
    return layer;
}

// thin sliver hugging an edge — e4's magenta glow
function makeGlow(r: Rng, roles: Roles, side: Side, amp: number, id: number): LayerState {
    const layer = createLayer('wave', id);
    layer.name = `glow ${side}`;
    layer.flip = side === 'bottom';
    layer.fill = r.chance(0.75) ? roles.accent : r.pick([roles.ground, ...roles.extras]);
    // a glow is a *sliver* — its height is part of the look, so it scales in px
    const extent = r.range(0.02, 0.12) * amp;
    layer.configs = waveKeyframes(r, extent, clamp(0.02 * amp, 0.3, extent + r.sign() * r.range(0.01, 0.15) * amp), amp);
    if (r.chance(0.6)) {
        layer.curveAmount = r.int(8, 24);
        layer.strokeStyle = layer.fill === roles.accent ? roles.ink : roles.accent;
        layer.strokeWidth = round(r.range(0.3, 1.2));
        const dir = r.chance(0.7) ? -1 : 1; // fans mostly reach back into the sliver, like e4
        layer.offsetLeft = dir * r.int(4, 16);
        layer.offsetRight = dir * r.int(8, 40);
    } else {
        layer.curveAmount = 0;
        layer.strokeStyle = layer.fill === roles.accent ? roles.ink : roles.accent; // in-palette even when unused
    }
    return layer;
}

// floating translucent stripe
function makeBand(r: Rng, roles: Roles, center: number, thickness: number, amp: number, id: number): LayerState {
    const layer = createLayer('band', id);
    layer.name = 'band';
    // solid fills only (user rule: no transparency for now)
    layer.fill = weighted(r, [
        [roles.accent, 0.45],
        [r.pick([roles.ground, ...roles.extras]), 0.3],
        [roles.ink, 0.25],
    ]);
    // thickness is part of the stripe's look → constant in px, not relative
    const cfg = bandKeyframes(r, center, thickness * amp, amp);
    // edge strokes default to an in-palette color even when no fan fires below
    layer.top = { ...layer.top, configs: cfg.top, curveAmount: 0, strokeStyle: roles.ink };
    layer.bottom = { ...layer.bottom, configs: cfg.bottom, curveAmount: 0, strokeStyle: roles.ink };
    for (const edge of ['top', 'bottom'] as const) {
        if (!r.chance(0.3)) continue;
        const dir = r.sign(); // shared sign — see makeField
        layer[edge] = {
            ...layer[edge],
            curveAmount: r.int(4, 16),
            strokeStyle: r.chance(0.5) ? roles.ink : roles.accent,
            strokeWidth: round(r.range(0.3, 1.2)),
            offsetLeft: dir * r.int(2, 10),
            offsetRight: dir * r.int(4, 14),
        };
    }
    if (r.chance(0.15)) layer.featheredOut = 'both';
    return layer;
}

/* ------------------------------- composition ------------------------------ */

type CompositionMode = 'classic' | 'bands' | 'band-dominant' | 'minimal';

// All config numbers are relative to the section height, but they render
// against a fixed viewport width — the same 0.4 bow is 800px on a 2000px
// section and 3200px on an 8000px one, so tall documents came out vertically
// stretched. A longer doc should mean a longer scroll, not a different
// aesthetic: vertical SHAPE energy (bows, tilts, keyframe walks, band
// thickness, glow slivers) is scaled so its absolute px size stays at the
// ~2000px look the ranges were tuned for. Placement (zones, band centers,
// field extents) stays relative — that's what distributes over the scroll.
const SHAPE_REF_PX = 2000;
const shapeAmp = (sectionPx: number) => clamp(0.1, 1.3, SHAPE_REF_PX / sectionPx);

// stratified centers: one band per zone, jittered inside it — keeps stacks
// distributed over the height instead of clumping
function bandStrata(
    r: Rng,
    roles: Roles,
    count: number,
    lo: number,
    hi: number,
    amp: number,
    nextId: () => number,
): LayerState[] {
    const bands: LayerState[] = [];
    const step = (hi - lo) / count;
    for (let i = 0; i < count; i++) {
        const center = r.range(lo + step * i + 0.02, lo + step * (i + 1) - 0.02);
        const thickness = r.range(0.05, Math.min(0.3, step * 1.2));
        bands.push(makeBand(r, roles, center, thickness, amp, nextId()));
    }
    return bands;
}

// rough ink share of the section — used to reject compositions without
// breathing room (or with almost nothing on them)
function coverage(layers: LayerState[], amp: number): number {
    let total = 0;
    for (const l of layers) {
        // veils are tone-on-tone washes — they don't read as ink coverage
        if (l.name.startsWith('veil')) continue;
        if (l.mode === 'wave') {
            total += (l.configs[0].left[0] + l.configs[0].right[0]) / 2;
        } else {
            const th =
                (l.bottom.configs[0].left[0] - l.top.configs[0].left[0] +
                    (l.bottom.configs[0].right[0] - l.top.configs[0].right[0])) /
                2;
            // band thickness is px-constant (÷amp back to reference-relative),
            // otherwise tall sections would read as "too empty" and re-roll
            total += Math.max(0, th) / amp;
        }
    }
    return total;
}

export interface GeneratedArtwork {
    seed: number;
    palette: string[];
    pageBg: string;
    layers: LayerState[];
}

function build(r: Rng, seed: number, sectionPx: number, startId: number): GeneratedArtwork {
    const preset = r.pick(palettePresets);
    const colors = [...preset.colors];
    let roles: Roles = { ink: colors[0], accent: colors[1], ground: colors[2], extras: colors.slice(3) };
    // occasional inversion: dark ground, light masses
    if (r.chance(0.15)) roles = { ...roles, ink: roles.ground, ground: roles.ink };

    let id = startId;
    const nextId = () => id++;
    const layers: LayerState[] = [];
    // taller sections earn more elements
    const density = clamp(0.8, 2, sectionPx / 2500);
    // …but the elements themselves keep their absolute px shape (see shapeAmp)
    const amp = shapeAmp(sectionPx);

    // the curated examples are field-driven — bands exist but stay the exception
    const mode = weighted<CompositionMode>(r, [
        ['classic', 0.45],
        ['bands', 0.15],
        ['band-dominant', 0.15],
        ['minimal', 0.25],
    ]);

    if (mode === 'classic') {
        const sides = weighted<Side[]>(r, [
            [['top', 'bottom'], 0.5],
            [['top'], 0.25],
            [['bottom'], 0.25],
        ]);
        if (r.chance(0.35)) layers.push(makeBand(r, roles, r.range(0.3, 0.7), r.range(0.08, 0.26), amp, nextId()));
        // taller sections get extra midfield interest — a veil wash or a band
        if (r.chance(0.35)) layers.push(makeVeil(r, roles, amp, nextId()));
        if (density > 1.2 && r.chance(0.4))
            layers.push(makeBand(r, roles, r.range(0.25, 0.75), r.range(0.05, 0.18), amp, nextId()));
        for (const side of sides) {
            layers.push(makeField(r, roles, side, r.range(0.18, 0.45), amp, nextId()));
            if (r.chance(0.25))
                layers.push(
                    makeField(r, roles, side, r.range(0.06, 0.2), amp, nextId(), r.pick([roles.accent, ...roles.extras])),
                );
            if (r.chance(0.5)) layers.push(makeGlow(r, roles, side, amp, nextId()));
        }
    } else if (mode === 'bands') {
        const count = Math.max(2, Math.min(6, Math.round(r.range(2, 4.5) * density)));
        layers.push(...bandStrata(r, roles, count, 0.06, 0.94, amp, nextId));
        if (r.chance(0.25)) layers.push(makeGlow(r, roles, r.pick(['top', 'bottom']), amp, nextId()));
    } else if (mode === 'band-dominant') {
        layers.push(...bandStrata(r, roles, r.int(2, density > 1.3 ? 4 : 3), 0.1, 0.9, amp, nextId));
        const side = r.pick<Side>(['top', 'bottom']);
        if (r.chance(0.7)) layers.push(makeField(r, roles, side, r.range(0.1, 0.24), amp, nextId()));
        else layers.push(makeGlow(r, roles, side, amp, nextId()));
    } else {
        // minimal: one statement, lots of ground — mostly a field, rarely bands
        if (r.chance(0.7)) {
            const side = r.pick<Side>(['top', 'bottom']);
            if (r.chance(0.4)) layers.push(makeVeil(r, roles, amp, nextId()));
            layers.push(makeField(r, roles, side, r.range(0.15, 0.35), amp, nextId()));
            if (r.chance(0.3)) layers.push(makeGlow(r, roles, side, amp, nextId()));
        } else {
            layers.push(...bandStrata(r, roles, r.int(1, density > 1.3 ? 3 : 2), 0.15, 0.85, amp, nextId));
        }
    }

    // scroll choreography: shuffled pool, cycled — neighbors move at different speeds
    const pool = r.shuffle([
        { start: 'start start', end: 'end 25%' },
        ...scrollPresets.map((p) => ({ start: p.start, end: p.end })),
    ]);
    layers.forEach((l, i) => {
        l.scrollStart = pool[i % pool.length].start;
        l.scrollEnd = pool[i % pool.length].end;
    });

    // effects budget: at most one blurred, at most one dissolving layer
    if (r.chance(mode === 'minimal' ? 0.6 : 0.4)) r.pick(layers).blur = r.int(12, 70);
    if (r.chance(0.35)) {
        const l = r.pick(layers);
        l.dissolve = r.int(8, 48) * 10;
        l.dissolveSize = r.pick([1, 1, 1, 2, 2, 3, 4]);
        // dissolve works on hard edges but reads best as falloff + grain —
        // pair it with blur almost always
        if (l.blur === 0 && r.chance(0.85)) l.blur = r.int(10, 45);
    }

    // unique names (they feed the dissolve filter ids and the layers panel)
    const seen = new Map<string, number>();
    for (const l of layers) {
        const count = (seen.get(l.name) ?? 0) + 1;
        seen.set(l.name, count);
        if (count > 1) l.name = `${l.name} ${count}`;
    }

    return { seed, palette: colors, pageBg: roles.ground, layers };
}

/** Generate a full artwork from a seed — same seed, same result. */
export function generateArtwork(seed: number, sectionPx: number, startId: number): GeneratedArtwork {
    for (let attempt = 0; ; attempt++) {
        const r = createRng(seed + attempt * 7919);
        const art = build(r, seed, sectionPx, startId);
        const ink = coverage(art.layers, shapeAmp(sectionPx));
        if (attempt >= 7 || (ink >= 0.18 && ink <= 0.95)) return art;
    }
}
