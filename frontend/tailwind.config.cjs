/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        somniaPurple: '#A855F7',
        polkaPurple: '#A855F7',
        polkaPink: '#FF2EA6',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(168,85,247,0.18), 0 12px 40px rgba(168,85,247,0.12)',
      },
    },
  },
  plugins: [],
}

