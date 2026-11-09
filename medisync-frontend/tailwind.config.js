/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'], // <-- TAMBAHKAN INI
      },
      colors: {
        medisync: {
          dark: '#17324d',
          primary: '#1269d3',
          teal: '#0d9d92',
          light: '#f4f8fb',
        }
      }
    },
  },
  plugins: [],
}