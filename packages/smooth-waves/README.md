# Smooth Waves

A React component for creating beautiful, interactive wave animations that respond to scroll position. Perfect for creating engaging page transitions, section dividers, or decorative elements that respond to user scrolling.

## Installation

```bash
# Using npm
npm install @threeaio/smooth-waves

# Using yarn
yarn add @threeaio/smooth-waves

# Using pnpm
pnpm add @threeaio/smooth-waves
```

## Requirements

- React 18+
- Motion (from `motion/react`)
- `@threeaio/utils` (for math utilities)

## Basic Usage

```tsx
import Wave from '@threeaio/smooth-waves';

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
- `featheredOut`: Adds a gradient fade effect ('top', 'bottom', or 'both')

#### Wave Behavior

- `configs`: Array of wave configurations defining the shape and movement
- `curveAmount`: Number of decorative curves to draw (default: 1)
- `offsetLeft`: Left side offset for decorative curves
- `offsetRight`: Right side offset for decorative curves
- `flip`: Flips the wave vertically when true
- `debug`: Enables debug visualization when true

#### Scroll Configuration

- `scrollOffset`: Controls when the animation starts and ends relative to scroll position

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

## Tips and Best Practices

1. Always wrap the Wave component in a container with relative positioning and explicit height
2. Use the `scrollOffset` parameter to fine-tune when the animation starts and ends
3. Experiment with different `curveAmount` values for varied visual effects
4. Enable `debug` mode during development to visualize scroll progress
5. Use `featheredOut` for smooth transitions between sections

## License

MIT
