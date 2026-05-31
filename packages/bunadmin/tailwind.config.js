/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "../../plugins/**/*.{ts,tsx}",
    "../bunadmin-rich-text-editor/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Token-driven (var() mirrors src/utils/themes/tokens.ts + tailwind.css).
        primary: "var(--bn-primary)",
        "primary-foreground": "var(--bn-primary-foreground)",
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
      backgroundImage: {
        "primary-gradient": "var(--bn-primary-gradient)"
      }
    }
  },
  plugins: []
}
