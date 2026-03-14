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
        /**
         * ── Brand token system ────────────────────────────────────────────
         * Single source of truth. All components use these classes.
         * Values are CSS custom properties defined in globals.css.
         *
         * Usage:
         *   bg-brand-canvas          — page background (#F2F4F6)
         *   bg-brand-surface         — card/panel background (#FFFFFF)
         *   text-brand-primary       — primary brand text (#0D1117)
         *   text-brand-secondary     — secondary text (#3A4654)
         *   text-brand-muted         — muted/meta text (#6B7888)
         *   border-brand-border      — subtle borders (#D8DDE5)
         *   bg-brand-ink             — dark navbar/footer (#1C2B3A)
         *   bg-brand-ink-deep        — deepest dark (#0D1117)
         *   text-brand-accent        — amber accent (#C8820A)
         *   text-brand-accent-lt     — amber light (#F0A318)
         *   text-brand-crimson       — breaking/alert red (#B8282A)
         */
        brand: {
          /* Surfaces */
          canvas:      'var(--bg-canvas)',
          surface:     'var(--bg-surface)',
          /* Ink (dark backgrounds) */
          ink:         'var(--brand-primary)',
          'ink-deep':  'var(--brand-dark)',
          'ink-mid':   'var(--brand-secondary)',
          /* Text */
          primary:     'var(--text-primary)',
          secondary:   'var(--text-secondary)',
          muted:       'var(--text-muted)',
          link:        'var(--text-link)',
          /* Borders */
          border:      'var(--brand-border)',
          /* Accents */
          accent:      'var(--accent-amber)',
          'accent-lt': 'var(--accent-amber-lt)',
          crimson:     'var(--accent-crimson)',
          teal:        'var(--accent-teal)',
          /* Legacy aliases — kept for backward compat */
          red:         'var(--brand-red)',
          dark:        'var(--brand-dark)',
          gray:        'var(--brand-gray)',
        },

        /* ── Granite aliases (backward compat — do not use in new code) ── */
        granite: {
          primary: 'var(--granite-primary)',
          dark:    'var(--granite-dark)',
          accent:  'var(--granite-accent)',
          surface: 'var(--granite-surface)',
          muted:   'var(--granite-muted)',
        },

        /* ── gp aliases (backward compat — do not use in new code) ── */
        gp: {
          primary:   'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          canvas:    'var(--bg-canvas)',
          surface:   'var(--bg-surface)',
        },

        /* ── Semantic accent tokens ── */
        accent: {
          amber:   'var(--accent-amber)',
          amberLt: 'var(--accent-amber-lt)',
          crimson: 'var(--accent-crimson)',
          teal:    'var(--accent-teal)',
        },

        /* ── Text tokens ── */
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
  plugins: [require('@tailwindcss/typography')],
}

export default config