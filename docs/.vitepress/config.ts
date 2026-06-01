import { defineConfig } from "vitepress"

export default defineConfig({
  title: "Dashin",
  description:
    "Vite + Tailwind React admin scaffold with AI-assisted, schema-validated generation.",
  lastUpdated: true,
  cleanUrls: true,

  ignoreDeadLinks: [/^http:\/\/localhost/, /\.tsx?$/, /\.js$/],

  // README.md files (kept for GitHub browsing) serve as section indexes.
  rewrites: {
    "ai/README.md": "ai/index.md",
    "pocketbase/README.md": "pocketbase/index.md",
    "appwrite/README.md": "appwrite/index.md",
    "supabase/README.md": "supabase/index.md",
    "directus/README.md": "directus/index.md",
    "payload/README.md": "payload/index.md",
    "turso/README.md": "turso/index.md"
  },

  themeConfig: {
    outline: "deep",
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Features", link: "/features/tables" },
      { text: "AI Generation", link: "/ai/" },
      { text: "Connectors", link: "/connectors/" },
      { text: "GitHub", link: "https://github.com/Chris533/bunadmin" }
    ],
    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Introduction", link: "/guide/getting-started" },
          { text: "Flagship demo", link: "/guide/demo" }
        ]
      },
      {
        text: "Features",
        items: [
          { text: "Tables & CRUD", link: "/features/tables" },
          { text: "Theming", link: "/features/theming" },
          { text: "Layout & regions", link: "/features/layout" },
          { text: "Plugins & auth", link: "/features/plugins" }
        ]
      },
      {
        text: "AI-Assisted Generation",
        items: [{ text: "generate / theme / refine", link: "/ai/" }]
      },
      {
        text: "Connectors",
        items: [
          { text: "Overview", link: "/connectors/" },
          { text: "PocketBase", link: "/pocketbase/" },
          { text: "Appwrite", link: "/appwrite/" },
          { text: "Supabase / Postgres", link: "/supabase/" },
          { text: "Directus", link: "/directus/" },
          { text: "Payload", link: "/payload/" },
          { text: "Turso / libSQL", link: "/turso/" }
        ]
      },
      {
        text: "Project",
        items: [{ text: "Docs contributors", link: "/CONTRIBUTORS" }]
      }
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/Chris533/bunadmin" }
    ],
    search: { provider: "local" }
  }
})
