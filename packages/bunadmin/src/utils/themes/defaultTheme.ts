/**
 * Plain theme object (MUI createTheme removed).
 * Keeps the `bunadmin` namespace and a minimal `palette` shape that the
 * remaining consumers read (e.g. _document theme-color, tableIcons iconColor).
 * Visual styling now lives in Tailwind (see src/tailwind.css + tailwind.config.js).
 */
const iconColor = "#8f9bb3"
const contentBg = "#EDF1F7"
const contentBoxBg = "#FFF"
export const JSON_VIEW_BG = "rgba(143, 155, 179, 0.3)"

const defaultTheme = {
  bunadmin: {
    iconColor,
    contentBg,
    contentBoxBg,
    jsonViewBg: JSON_VIEW_BG
  },
  palette: {
    primary: { main: "#36f" },
    secondary: { main: "#00d68f" },
    error: { main: "#ff1744" },
    background: { default: contentBg }
  }
}

export type DefaultTheme = typeof defaultTheme

export default defaultTheme
