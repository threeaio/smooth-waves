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
      fontWeight: {
        bold: '500',
        normal: '300',
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
      },
    },
  },
  plugins: [],
} satisfies Config;
