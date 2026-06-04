import { defineConfig } from "vitepress"

export default defineConfig({
  title: "Dashin",
  description:
    "Vite + Tailwind React admin scaffold with AI-assisted, schema-validated generation.",
  lastUpdated: true,
  cleanUrls: true,

  ignoreDeadLinks: [/^http:\/\/localhost/, /\.tsx?$/, /\.js$/],

  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }],
    ["meta", { name: "theme-color", content: "#3366ff" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "Dashin" }],
    [
      "meta",
      {
        property: "og:description",
        content:
          "Vite + Tailwind React admin scaffold with AI-assisted, schema-validated generation."
      }
    ],
    ["meta", { property: "og:image", content: "https://dashin.dev/og.png" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:image", content: "https://dashin.dev/og.png" }]
  ],

  // README.md files (kept for GitHub browsing) serve as section indexes.
  rewrites: {
    "ai/README.md": "ai/index.md",
    "pocketbase/README.md": "pocketbase/index.md",
    "appwrite/README.md": "appwrite/index.md",
    "supabase/README.md": "supabase/index.md",
    "directus/README.md": "directus/index.md",
    "payload/README.md": "payload/index.md",
    "turso/README.md": "turso/index.md",
    "d1/README.md": "d1/index.md"
  },

  themeConfig: {
    logo: "/logo.svg",
    outline: "deep",
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Features", link: "/features/tables" },
      { text: "AI Generation", link: "/ai/" },
      { text: "Connectors", link: "/connectors/" },
      { text: "GitHub", link: "https://github.com/dashindev/dashin" }
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
          { text: "UI Primitives", link: "/features/ui-primitives" },
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
          { text: "Turso / libSQL", link: "/turso/" },
          { text: "Cloudflare D1 (free)", link: "/d1/" }
        ]
      },
      {
        text: "Project",
        items: [{ text: "Docs contributors", link: "/CONTRIBUTORS" }]
      }
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/dashindev/dashin" }
    ],
    search: { provider: "local" }
  }
})
