import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        /* Main page colors */
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        /* Brand colors */
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          foreground: 'var(--primary-foreground)',
        },

        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },

        surface: {
          DEFAULT: 'var(--surface)',
          foreground: 'var(--surface-foreground)',
        },

        /* Component surfaces */
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },

        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },

        /* Text colors */
        heading: 'var(--heading)',
        'body-text': 'var(--body-text)',
        'secondary-text': 'var(--secondary-text)',
        'muted-text': 'var(--muted-text)',
        'subtle-text': 'var(--subtle-text)',

        /* Inputs */
        border: 'var(--border)',

        input: {
          DEFAULT: 'var(--input)',
          hover: 'var(--input-hover)',
        },

        ring: 'var(--ring)',

        /* States */
        success: 'var(--success)',
        warning: 'var(--warning)',

        error: {
          DEFAULT: 'var(--error)',
          foreground: 'var(--error-foreground)',
        },
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },

  plugins: [],
} satisfies Config;