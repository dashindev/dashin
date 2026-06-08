/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    // include the installed dashin packages so their Tailwind classes compile
    "./node_modules/@dashin-dev/**/lib/**/*.js"
  ],
  theme: {
    extend: {
      // Token-driven theme — mirrors @dashin-dev/dashin's tailwind.config +
      // the --bn-* CSS variables in src/tailwind.css (light = :root, dark =
      // .dark). Keep in sync with the core package so the app shell (TopBar,
      // sidebar, cards, borders, radius, gradient logo) renders fully styled
      // and the theme toggle works.
      colors: {
        primary: "var(--bn-primary)",
        "primary-foreground": "var(--bn-primary-foreground)",
        "primary-hover": "var(--bn-primary-hover)",
        secondary: "var(--bn-success)",
        success: "var(--bn-success)",
        warning: "var(--bn-warning)",
        danger: "var(--bn-danger)",
        "content-bg": "var(--bn-bg)",
        "content-box": "var(--bn-surface)",
        sidebar: "var(--bn-sidebar)",
        foreground: "var(--bn-foreground)",
        "icon-muted": "var(--bn-muted)",
        "bn-border": "var(--bn-border)"
      },
      borderRadius: {
        bn: "var(--bn-radius)"
      },
      boxShadow: {
        bn: "var(--bn-shadow)"
      },
      ringColor: {
        bn: "var(--bn-ring)"
      },
      backgroundImage: {
        "primary-gradient": "var(--bn-primary-gradient)"
      }
    }
  },
  plugins: []
}
