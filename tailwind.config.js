/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        accent: { DEFAULT: "#00C896", dark: "#00a07a", light: "#e0fff5" },
        surface: { DEFAULT: "#0d0f14", 2: "#13161e", 3: "#1a1d28", 4: "#222536" },
        border: "#ffffff14",
        "border-hover": "#ffffff28",
      },
    },
  },
  plugins: [],
};
