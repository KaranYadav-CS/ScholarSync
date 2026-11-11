/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9ec',
          300: '#94bde0',
          400: '#5e9bd0',
          500: '#1b64a8', // restrained academic navy/blue
          600: '#134e87',
          700: '#103f6f',
          800: '#0f365d',
          900: '#0e2d4e',
          950: '#081c33',
        },
        tealAccent: {
          500: '#0d9488',
          600: '#0f766e',
        },
      },
    },
  },
  plugins: [],
};
