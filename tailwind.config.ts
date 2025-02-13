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
        'black-washed': 'var(--black-washed)',
        'gray-darkest-washed': 'var(--gray-darkest-washed)',
        'white-washed': 'var(--white-washed)',
        'white-washed-dark': 'var(--white-washed-dark)',
        'ui-border': 'var(--ui-border)',
        'ui-shadow': 'var(--ui-shadow)',  
        'ui-gradient-bottom': 'var(--ui-gradient-bottom)',
        'ui-gradient-top': 'var(--ui-gradient-top)',
      },
    },
  },
  plugins: [],
} satisfies Config;
