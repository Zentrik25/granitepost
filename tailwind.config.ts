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
          red: '#BB1919',
          dark: '#1A1A1A',
          gray: '#F5F5F5',
          border: '#E0E0E0',
          muted: '#767676',
        },
        granite: {
          primary: '#142B6F',
          dark: '#0D1E50',
          accent: '#FFD601',
          surface: '#FFFFFF',
          muted: '#E1DEE6',
        },
      },
      backgroundImage: {
        'granite-gradient': 'linear-gradient(135deg, #142B6F 0%, #0D1E50 100%)',
        'granite-gradient-b': 'linear-gradient(180deg, #142B6F 0%, #0D1E50 100%)',
        'granite-accent-gradient': 'linear-gradient(135deg, #FFD601 0%, #F5C800 100%)',
        'granite-surface-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #E1DEE6 100%)',
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
