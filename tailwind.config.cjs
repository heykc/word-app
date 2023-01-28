/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'bg-emerald-700',
    'bg-yellow-700',
    'bg-red-700',
    'bg-cyan-700',
  ]
}
