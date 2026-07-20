import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    banner: { js: "'use client';" },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    minify: false,
    splitting: false,
    sourcemap: true,
    external: ['react', 'motion'],
});
