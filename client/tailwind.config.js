/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        investigation: {
          900: '#0d1117',
          800: '#161b22',
          700: '#21262d',
          600: '#30363d',
          gold: '#d29922',
          crimson: '#f85149',
          amber: '#e3b341',
          emerald: '#3fb950',
          cyan: '#58a6ff'
        }
      }
    },
  },
  plugins: [],
}

