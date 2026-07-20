# smooth-waves

Monorepo for [`@threeaio/smooth-waves`](https://www.npmjs.com/package/@threeaio/smooth-waves) — a React component for smooth, scroll-based wave animations — and its demo site.

- **`packages/smooth-waves/`** — the published npm package ([docs](packages/smooth-waves/README.md))
- **`src/`** — the Next.js demo site showcasing the component

## Development

```bash
pnpm install

# Build the package (the demo consumes its dist output)
pnpm --filter @threeaio/smooth-waves build

# Run the demo site
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The demo pages (`/`, `/example-1`, `/example-2`, `/example-3`) each showcase different wave configurations.

When working on the package itself, run its watch build alongside the dev server:

```bash
pnpm --filter @threeaio/smooth-waves dev
```

## Releasing the package

```bash
cd packages/smooth-waves
npm run release   # builds and publishes to npm
```
