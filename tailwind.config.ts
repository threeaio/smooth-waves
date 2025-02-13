import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      fontWeight: {
        bold: '500',
        normal: '300',
      },
      colors: {
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
