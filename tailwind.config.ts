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
        brand: {
          red: 'var(--brand-red)',
          dark: 'var(--brand-dark)',
          gray: 'var(--brand-gray)',
          border: 'var(--brand-border)',
          muted: 'var(--brand-muted)',
        },
        granite: {
          primary: 'var(--granite-primary)',
          dark: 'var(--granite-dark)',
          accent: 'var(--granite-accent)',
          surface: 'var(--granite-surface)',
          muted: 'var(--granite-muted)',
        },
      },

      backgroundImage: {
        'granite-gradient':
          'linear-gradient(135deg, var(--granite-primary) 0%, var(--granite-dark) 100%)',

        'granite-gradient-b':
          'linear-gradient(180deg, var(--granite-primary) 0%, var(--granite-dark) 100%)',

        'granite-accent-gradient':
          'linear-gradient(135deg, var(--granite-accent) 0%, #F5C800 100%)',

        'granite-surface-gradient':
          'linear-gradient(180deg, var(--granite-surface) 0%, var(--granite-muted) 100%)',
      },

      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
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