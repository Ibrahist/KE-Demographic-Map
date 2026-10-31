/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-primary)', 'Mulish', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        primary: ['var(--font-primary)', 'Mulish', 'sans-serif'],
        secondary: ['var(--font-secondary)', 'Mulish', 'sans-serif'],
      },
      colors: {
        opengis: {
          primary: '#ef4444',
          primaryDark: '#d63c3c',
          secondary: '#f3f4f6',
          secondaryDark: '#334155',
          body: '#ffffff',
          border: '#eaeaea',
          light: '#f6f6f6',
          dark: '#040404',
          text: '#444444',
          textDark: '#040404',
          textLight: '#717171',
          textLighter: '#99a1af',
          darkBody: '#1e2939',
          darkBodyDark: '#020617',
          darkBorder: '#3e3e3e',
          darkLight: '#364153',
          darkDark: '#0f172a',
          darkText: '#d1d5dc',
          darkTextDark: '#ffffff',
          darkTextLight: '#b4afb6',
        },
        kenya: {
          green: "#006600",
          red: "#990000",
          black: "#111111",
        }
      }
    },
  },
  plugins: [],
};
