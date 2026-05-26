import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        honey: {
          50:  '#FFF8EC',
          100: '#FFEDC8',
          200: '#FFD98A',
          300: '#FFC04D',
          400: '#FFA620',
          500: '#F5A623',
          600: '#E08B00',
          700: '#B86D00',
          800: '#8A5000',
          900: '#5C3500',
        },
        slate: {
          950: '#0C1220',
        }
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body:    ['var(--font-body)'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.08), 0 8px 28px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.25rem',
      }
    },
  },
  plugins: [],
}
export default config
