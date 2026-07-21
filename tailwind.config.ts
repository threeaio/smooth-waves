import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/smooth-waves/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      borderRadius: {
        'huge': '4rem',
      },
      // NOTE: bold/normal are remapped (500/300) — the landing page depends on this.
      // Composer convention: use font-medium for emphasis inside the editor chrome, never font-bold.
      fontWeight: {
        bold: '500',
        normal: '300',
      },
      fontSize: {
        // editor micro scale: 2xs for values/names/buttons, 3xs for labels/hints
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        '3xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        'ed-left': 'var(--ed-left-w)',
        'ed-right': 'var(--ed-right-w)',
        'ed-toolbar': 'var(--ed-toolbar-h)',
        'ed-timeline': 'var(--ed-timeline-h)',
      },
      colors: {
        '3a-green': 'hsl(var(--3a-green))',
        '3a-red': 'hsl(var(--3a-red))',
        'black-washed': 'hsl(var(--black-washed))',
        'gray-darkest-washed': 'hsl(var(--gray-darkest-washed))',
        'white-washed': 'hsl(var(--white-washed))',
        'white-washed-dark': 'hsl(var(--white-washed-dark))',
        'ui-border': 'hsl(var(--ui-border))',
        'ui-shadow': 'hsl(var(--ui-shadow))',  
        'ui-gradient-bottom': 'hsl(var(--ui-gradient-bottom))',
        'ui-gradient-top': 'hsl(var(--ui-gradient-top))',
        'ed-accent': 'rgb(var(--ed-accent) / <alpha-value>)',
        'ed-accent-hover': 'rgb(var(--ed-accent-hover) / <alpha-value>)',
        'ed-canvas': 'rgb(var(--ed-canvas) / <alpha-value>)',
        'ed-panel': 'rgb(var(--ed-panel) / <alpha-value>)',
        'ed-code': 'rgb(var(--ed-code) / <alpha-value>)',
        'ed-hairline': 'var(--ed-hairline)',
        'ed-border': 'var(--ed-border)',
        'ed-border-strong': 'var(--ed-border-strong)',
        'ed-fill': 'var(--ed-fill)',
        'ed-fill-faint': 'var(--ed-fill-faint)',
        'ed-text-strong': 'rgb(var(--ed-text-strong) / <alpha-value>)',
        'ed-text': 'rgb(var(--ed-text) / <alpha-value>)',
        'ed-text-muted': 'rgb(var(--ed-text-muted) / <alpha-value>)',
      },
    },
  },
  plugins: [],
} satisfies Config;
