/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    // include the installed bunadmin packages so their Tailwind classes compile
    "./node_modules/@xbuilder/**/lib/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
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
