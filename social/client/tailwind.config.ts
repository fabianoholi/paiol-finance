import type { Config } from 'tailwindcss'

export default {
  content: ['./client/src/**/*.{tsx,ts,jsx,js}', './client/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#10b981',
        'accent-light': '#34d399',
        'accent-dark': '#059669',
        glass: {
          bg: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.1)',
          hover: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        glass: '40px',
      },
    },
  },
  plugins: [],
} satisfies Config
