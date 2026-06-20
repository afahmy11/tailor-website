import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#E9E1D4',
        ivory: '#F7F3EC',
        charcoal: '#2B2926',
        rose: '#B79189',
        sage: '#9AA792',
        muted: '#6F6A62',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'var(--font-arabic)', 'serif'],
        sans: ['var(--font-sans)', 'var(--font-arabic)', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
};

export default config;
