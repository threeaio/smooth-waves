# Smooth Waves

A React component for creating beautiful, interactive wave animations that respond to scroll position. Perfect for creating engaging section dividers, or decorative elements that respond to user scrolling.

## Installation

```bash
# Using npm
npm install @threeaio/smooth-waves

# Using yarn
yarn add @threeaio/smooth-waves

# Using pnpm
pnpm add @threeaio/smooth-waves
```

## Agent skill

The package ships an [Agent Skill](https://docs.claude.com/en/docs/agents-and-tools/agent-skills) that teaches coding agents how to use the library (embedding rules, keyframe semantics, recipes, pitfalls). To make it available in a project:

```bash
cp -r node_modules/@threeaio/smooth-waves/skills/smooth-waves .claude/skills/
```

## Requirements

Peer dependencies (installed alongside the package):

- `react` 18+
- `motion` 12+

## Basic Usage

```tsx
import { Wave } from '@threeaio/smooth-waves';

function MyComponent() {
    return (
        <div className="relative h-[500px]">
            <Wave />
        </div>
    );
}
```

## How It Works

Smooth Waves uses canvas-based rendering to create fluid wave animations that respond to scroll position. The waves are generated using Bezier curves and can be customized through various configuration parameters. The animation is optimized for performance using `requestAnimationFrame` and supports high DPI displays.

Key features:

- Scroll-based animation using Motion's `useScroll` hook
- Smooth spring physics for fluid animations
- HiDPI/Retina display support
- Configurable wave shapes and behaviors
- Optional debug mode for development

## Configuration

The Wave component accepts a `waveConfig` prop of type `WaveAnimation`:

```typescript
interface WaveAnimation {
    featheredOut?: 'top' | 'bottom' | 'both';
    featherDepth?: number;
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
```

### Configuration Parameters

#### Basic Styling

- `fill` (required): Background color of the wave (supports any valid CSS color)
- `strokeStyle`: Color of the wave lines (default: '#fff')
- `strokeWidth`: Width of the wave lines (default: 0.4)
- `featheredOut`: Adds a fade-out effect ('top', 'bottom', or 'both')
- `featherDepth`: Fade depth in px. When set, the fade is drawn into the canvas anchored at the shape's drawn extent — `top` fades the shape's first `featherDepth` px in, `bottom` its last px out, wherever the shape currently sits (follows the scroll animation, includes the stroke fans). When omitted, a legacy %-based CSS mask applies (40% of the canvas height, anchored at the canvas edges).

#### Wave Behavior

- `configs`: Array of wave configurations defining the shape and movement
- `curveAmount`: Number of decorative additional curve-lines to draw (default: 0 — changed from 1 in 0.3.0; add `curveAmount: 1` to keep the old look)
- `offsetLeft`: Left side offset for decorative curves
- `offsetRight`: Right side offset for decorative curves
- `flip`: Flips the wave vertically when true
- `debug`: Enables debug visualization when true

#### Scroll Configuration

- `scrollOffset`: Controls when the animation starts and ends relative to scroll position (see motions [offset](https://motion.dev/docs/scroll#offset) to get the syntax)

### Wave Configuration Structure

Each wave configuration in the `configs` array follows this structure:

```typescript
interface WaveConfig {
    left: BezierConfig;
    right: BezierConfig;
}

type BezierConfig = [number, number, number]; // [y-coordinate, x-offset, y-offset]
```

The `BezierConfig` tuple controls the wave shape:

1. y-coordinate: Vertical position (0-1)
2. x-offset: Horizontal control point offset
3. y-offset: Vertical control point offset

The range 0-1 basically desribes percent values, so 0.1 for y-coordinate basically says 10% from the top (currently 100% is the height of the next positioned (non-static) parent-element).

## Examples

### Basic Wave

```tsx
const basicConfig: WaveAnimation = {
    fill: 'rgba(0,0,0,0.1)',
    configs: [
        {
            right: [0.2, 0.9, -0.8],
            left: [0.7, 0.6, 0.9],
        },
    ],
};

<Wave waveConfig={basicConfig} />;
```

### Animated Wave Sequence

```tsx
const animatedConfig: WaveAnimation = {
    fill: '#2563eb',
    strokeStyle: '#ffffff',
    strokeWidth: 0.5,
    configs: [
        {
            right: [0.2, 0.9, -0.8],
            left: [0.7, 0.6, 0.9],
        },
        {
            right: [0.2, 0.9, -0.5],
            left: [0.7, 0.6, 0.6],
        },
        {
            right: [0.2, 0.9, -0.2],
            left: [0.7, 0.6, 0.3],
        },
    ],
    scrollOffset: ['end end', 'start start'],
    curveAmount: 3,
};

<Wave waveConfig={animatedConfig} />;
```

## WaveBand

`Wave` always fills from a canvas edge down (or up) to its single curve — a color field with ONE designed edge. `WaveBand` is a ribbon with a designed curve on BOTH edges: it fills the closed path between a top and a bottom curve and is transparent outside itself, so it can float over any background (gradients, images, other waves). Both edges are driven by the same scroll progress and spring, so they move coherently.

```tsx
import { WaveBand } from '@threeaio/smooth-waves';

<WaveBand
    waveConfig={{
        fill: '#ff5e2f',
        scrollOffset: ['start 80%', 'end end'],
        top: {
            configs: [
                { left: [0.3, 0.25, 0.5], right: [0.4, 0.2, -0.3] },
                { left: [0.5, 0.4, -0.2], right: [0.45, 0.5, -0.3] },
            ],
            strokeStyle: '#231112',
            strokeWidth: 0.4,
            curveAmount: 6,
            offsetLeft: -10,
            offsetRight: -36,
        },
        bottom: {
            configs: [
                { left: [0.6, 0.4, -0.2], right: [0.7, 0.3, 0.1] },
                { left: [0.8, 0.3, 0.2], right: [0.75, 0.4, -0.1] },
            ],
        },
    }}
/>;
```

### WaveBand Configuration

```typescript
interface WaveBandAnimation {
    fill: string;
    top: WaveBandEdge;
    bottom: WaveBandEdge;
    scrollOffset?: ScrollOffset;
    featheredOut?: 'top' | 'bottom' | 'both';
    featherDepth?: number; // same semantics as Wave — px fade anchored at the band's drawn extent
    debug?: boolean;
}

interface WaveBandEdge {
    configs: WaveConfig[]; // same keyframe semantics as Wave
    strokeStyle?: string; // default '#fff'
    strokeWidth?: number; // default 0.4
    curveAmount?: number; // decorative stroke lines fanning off this edge (default 0)
    offsetLeft?: number; // per-line fan offset in px — negative fans up, positive down
    offsetRight?: number;
}
```

Notes:

- There is no `flip` — both edges are explicit, and y-values are always fractions from the top.
- `curveAmount` defaults to `0` (same as Wave since 0.3.0), so no stroke appears unless you ask for one.
- Decorative fans need `curveAmount × offset` px of room inside the canvas before they get clipped.
- If the top curve crosses below the bottom curve the path self-intersects and canvas fills the twist (nonzero winding). Usable as an effect, but watch the Catmull-Rom overshoot with 3+ keyframes.

## Tips and Best Practices

1. Always wrap the Wave component in a container with relative positioning
2. Use the `scrollOffset` parameter to fine-tune when the animation starts and ends
3. Experiment with different `curveAmount` values for varied visual effects
4. Enable `debug` mode during development to visualize scroll progress
5. Use `featheredOut` for smooth transitions between sections

## License

MIT
