import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/db/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Legacy tokens — kept for backward compat */
        brand: {
          red:    'var(--brand-red)',
          dark:   'var(--brand-dark)',
          gray:   'var(--brand-gray)',
          border: 'var(--brand-border)',
          muted:  'var(--brand-muted)',
        },
        granite: {
          primary: 'var(--granite-primary)',
          dark:    'var(--granite-dark)',
          accent:  'var(--granite-accent)',
          surface: 'var(--granite-surface)',
          muted:   'var(--granite-muted)',
        },

        /* ── The Granite Post brand system ── */
        gp: {
          primary:   'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          canvas:    'var(--bg-canvas)',
          surface:   'var(--bg-surface)',
        },
        accent: {
          amber:   'var(--accent-amber)',
          amberLt: 'var(--accent-amber-lt)',
          crimson: 'var(--accent-crimson)',
          teal:    'var(--accent-teal)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
          link:      'var(--text-link)',
        },
      },

      backgroundImage: {
        /* Updated to 3-stop dark brand gradient */
        'granite-gradient':
          'linear-gradient(135deg, #0D1117 0%, #1C2B3A 50%, #2E4A62 100%)',

        'granite-gradient-b':
          'linear-gradient(180deg, #0D1117 0%, #1C2B3A 100%)',

        'granite-accent-gradient':
          'linear-gradient(135deg, var(--accent-amber-lt) 0%, var(--accent-amber) 100%)',

        'granite-surface-gradient':
          'linear-gradient(180deg, var(--bg-surface) 0%, var(--granite-muted) 100%)',
      },

      fontFamily: {
        sans:  ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },

      aspectRatio: {
        '16/9': '16 / 9',
      },
    },
  },
  plugins: [],
}

export default config