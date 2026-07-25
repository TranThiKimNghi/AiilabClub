/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0044B0',
          hover: '#0038A0',
          light: '#e6eef9',
        },
        secondary: {
          DEFAULT: '#F4B400',
          hover: '#d9a000',
          light: '#fef7e0',
        },
        customBg: '#F6F8FC',
      },
      borderRadius: {
        'custom': '20px',
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 68, 176, 0.06), 0 2px 10px -1px rgba(0, 68, 176, 0.03)',
        'soft-hover': '0 10px 25px -3px rgba(0, 68, 176, 0.10), 0 4px 12px -2px rgba(0, 68, 176, 0.05)',
      }
    },
  },
  plugins: [],
}
