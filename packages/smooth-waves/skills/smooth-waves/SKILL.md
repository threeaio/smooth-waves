---
name: smooth-waves
description: Build scroll-driven wave backgrounds, section dividers, animated hero shapes, and floating ribbons in React with @threeaio/smooth-waves (Wave, WaveBand). Use when adding organic canvas wave animations to a website, when the user mentions smooth-waves or @threeaio/smooth-waves, or when composing layered wave scenes and multi-section pages without visible seams.
license: MIT
---

# smooth-waves

Scroll-driven canvas wave animations for React. Two components: `Wave` (a color field with ONE designed edge, filling to a canvas edge) and `WaveBand` (a ribbon with a designed curve on BOTH edges, transparent outside itself). Rendering is Canvas 2D — not SVG, not WebGL.

## Setup

```bash
npm i @threeaio/smooth-waves   # peer deps: react >= 18, motion >= 12
```

```tsx
import { Wave, WaveBand } from '@threeaio/smooth-waves';
```

The `'use client'` boundary lives INSIDE the package — `Wave`/`WaveBand` render fine in React Server Components and statically exported pages. Do not add `'use client'` to a page just for them.

## Embedding rule (the #1 mistake)

The component renders `position: absolute; inset: 0` and fills its nearest positioned ancestor. That parent needs:

1. **Positioning** (`relative`/`absolute`), so `inset-0` refers to it.
2. **A height that comes from something other than the wave itself** — content, padding, `min-h-*`, flex stretch, or an explicit height. The wave is absolutely positioned and contributes no height; an otherwise-empty parent collapses to 0 and the wave is invisible.

```tsx
<section className="relative py-56 pb-[500px]">  {/* height from padding/content */}
    <Wave waveConfig={...} />
    <div className="relative z-10">content above the wave</div>
</section>
```

The parent's height is the coordinate space: all y values in configs are fractions of it (0 = top, 1 = bottom). Height changes are tracked via ResizeObserver; HiDPI is handled automatically.

## Mental model

Each edge is one cubic bezier from the left canvas edge to the right, defined by a `WaveConfig`:

```ts
type BezierConfig = [number, number, number]; // [y, xOffset, yOffset]
interface WaveConfig {
    left: BezierConfig;  // anchor at x = 0
    right: BezierConfig; // anchor at x = width
}
```

- `y` — anchor height as a fraction of the container (0.3 = 30% from the top).
- `xOffset` — horizontal pull of that anchor's control point, fraction of the width (both sides pull inward).
- `yOffset` — vertical pull of the control point, fraction of the height. Positive pulls down, negative up. This is what makes the curve swing.

`Wave` fills from the TOP canvas edge down to its curve. `flip: true` fills from the bottom up instead — then `y` is measured from the bottom, but `yOffset` keeps its screen direction (positive is still down). `WaveBand` has no `flip`; both edges are explicit and always measured from the top.

## Keyframes & scroll

`configs` is an array of keyframes scrubbed by scroll progress:

- 1 config → static shape
- 2 configs → linear interpolation
- 3+ configs → Catmull-Rom spline. **The spline overshoots keyframe values** — keep `y` within ~0.05–0.95 or the curve will clip at the canvas edges mid-animation.

`scrollOffset` uses motion's `useScroll` offset syntax, relative to the wave's own container:

```ts
scrollOffset: ['start end', 'end start']  // animate while the section crosses the viewport
scrollOffset: ['start 80%', 'end end']
scrollOffset: ['end end', 'start start']
```

Progress is smoothed with a built-in spring; `prefers-reduced-motion` renders a static frame at t = 0.5. Redraws only happen while progress actually changes (dirty-flag + rAF), so many waves per page are fine.

## Decorative stroke fans

`curveAmount` draws that many hairline copies of the curve, each shifted by `offsetLeft`/`offsetRight` **absolute px** per line (sign = fan direction; the two sides may differ, which splays the fan). Default is `0` since 0.3.0 — no stroke appears unless you ask. Fans need `curveAmount × offset` px of room inside the canvas before they clip. `strokeStyle` (default `'#fff'`) and `strokeWidth` (default `0.4`) style them. On `WaveBand` these live per edge (`top.curveAmount`, …).

## Feathering (fading an edge out)

```ts
featheredOut: 'top' | 'bottom' | 'both'
featherDepth: 600  // px — recommended
```

With `featherDepth`, the fade is drawn into the canvas anchored at the SHAPE's drawn extent: `top` fades the shape's first N px in, `bottom` its last N px out, wherever the shape currently sits — it follows the scroll animation and includes the stroke fans. Without `featherDepth`, a legacy CSS mask fades 40% zones anchored at the canvas edges (kept for 0.2.x compat; prefer `featherDepth`).

## Recipes

### Section divider

```tsx
<section className="relative h-[900px]">
    <Wave
        waveConfig={{
            fill: 'hsl(220 30% 12%)',
            featheredOut: 'bottom',
            featherDepth: 500,
            configs: [
                { left: [0.55, 0.5, 0.3], right: [0.25, 0.4, -0.25] },
                { left: [0.3, 0.5, -0.2], right: [0.6, 0.4, 0.2] },
            ],
            scrollOffset: ['start end', 'end start'],
        }}
    />
</section>
```

### Hero closing wave (bottom of a full-height section, with a fan)

```tsx
<div className="relative min-h-screen flex flex-col justify-end">
    <Wave
        waveConfig={{
            fill: 'hsl(0 0% 85%)',
            strokeStyle: 'hsl(35 15% 12%)',
            curveAmount: 3,
            offsetLeft: -42,
            offsetRight: -12,
            configs: [
                { left: [0.7, 0.6, 0.2], right: [0.2, 0.9, -0.4] },
                { left: [0.5, 0.6, 0.4], right: [0.35, 0.9, -0.2] },
            ],
            scrollOffset: ['end end', 'start start'],
        }}
    />
</div>
```

### Floating ribbon (WaveBand)

Fills the closed path between its two curves, transparent outside — it can float over gradients, images, or other waves.

```tsx
<WaveBand
    waveConfig={{
        fill: '#ff5e2f',
        scrollOffset: ['start 80%', 'end end'],
        top: {
            configs: [
                { left: [0.3, 0.25, 0.5], right: [0.4, 0.2, -0.3] },
                { left: [0.5, 0.4, -0.2], right: [0.45, 0.5, -0.3] },
            ],
            curveAmount: 6, offsetLeft: -10, offsetRight: -36,
            strokeStyle: '#231112',
        },
        bottom: {
            configs: [
                { left: [0.6, 0.4, -0.2], right: [0.7, 0.3, 0.1] },
                { left: [0.8, 0.3, 0.2], right: [0.75, 0.4, -0.1] },
            ],
        },
    }}
/>
```

If the top curve crosses below the bottom curve the path self-intersects and canvas fills the twist (nonzero winding) — usable deliberately, but watch the spline overshoot with 3+ keyframes.

### Layered scene

Stack layers as absolute siblings inside ONE positioned section, painted in order. Wrap each layer for horizontal overscan (so blur doesn't reveal hard canvas sides) and per-layer CSS effects:

```tsx
<div className="relative h-[4000px] overflow-x-clip">
    {/* back wash */}
    <div aria-hidden className="pointer-events-none absolute -inset-x-[10%] inset-y-0" style={{ filter: 'blur(60px)' }}>
        <Wave waveConfig={...} />
    </div>
    {/* ribbon on top */}
    <div aria-hidden className="pointer-events-none absolute inset-0">
        <WaveBand waveConfig={...} />
    </div>
</div>
```

Each layer keeps its own `scrollOffset`, so layers can move at different phases of the same scroll.

## Stacking multiple sections (seamless page flow)

Every section is its own canvas — nothing ever draws across the cut between two sections. **A seam is invisible only when both sides of the cut show the same flat color.** The rules:

1. **End section A flat.** Its CSS `backgroundColor` provides the color at the cut; every curve must stay clear of the bottom edge — across ALL keyframes (they're scrubbed by scroll, so check the lowest `y` any keyframe reaches), plus spline overshoot with 3+ keyframes, plus downward fan reach (`curveAmount × offset` px). The practical tool is a flat run-out spacer after the content that gives curves and fans room inside the section:

```tsx
<section className="relative" style={{ backgroundColor: amber }}>
    <div className="absolute inset-0" aria-hidden>{/* waves */}</div>
    <div className="relative z-10 min-h-screen">{/* content */}</div>
    <div className="h-[50vh]" /> {/* flat run-out: the cut below goes through plain amber */}
</section>
```

2. **Start section B in the same color.** Either as its CSS background, or as a top-anchored `Wave` (fills from the top edge down) with `fill` = that color — then its `y` keyframes must stay comfortably above 0 so the curve never runs up into the top edge (upward fans with negative offsets eat into this margin too).

3. **Alternatively, fade instead of cut.** A shape can hand itself off into the flat color before the boundary with `featheredOut: 'bottom'` + `featherDepth` — the fade ends in the section background, and the cut below stays flat.

4. **Page ends count as seams too.** The page/root background should match the first section's top and the last section's bottom, so nothing "falls off" the document edges.

A broken seam always looks the same: a hard horizontal line where a curve or fan got clipped by the section boundary. If you see one, either grow the run-out, pull the offending keyframe's `y` away from the edge, or match the colors on both sides of the cut.

## Not in the package

Grain and dissolve effects seen on the demo site are plain app-level CSS/SVG (`feTurbulence` textures and `feDisplacementMap` filters applied around the components), not part of the library. Smooth-scroll libraries like Lenis are optional — the package only needs native scroll.

## API quick reference

- `Wave`, `WaveBand` — the components (`waveConfig` prop).
- `sampleConfig(configs, t)` — one-shot keyframe interpolation at progress `t` (same semantics as the components) for static snapshots, SSR previews, or SVG export.
- Types: `WaveAnimation`, `WaveBandAnimation`, `WaveBandEdge`, `WaveConfig`, `BezierConfig`, `ScrollOffset`.
- `debug: true` overlays the live scroll progress on the canvas.
