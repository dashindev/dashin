/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "../../plugins/**/*.{ts,tsx}",
    "../bunadmin-rich-text-editor/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // mapped from src/utils/themes/defaultTheme.ts
        primary: "#36f",
        secondary: "#00d68f",
        danger: "#ff1744",
        "content-bg": "#EDF1F7",
        "content-box": "#FFF",
        "icon-muted": "#8f9bb3"
      }
    }
  },
  plugins: []
}
