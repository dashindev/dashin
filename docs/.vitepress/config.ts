import { defineConfig } from "vitepress"

export default defineConfig({
  title: "BunAdmin",
  description:
    "Vite + Tailwind React admin scaffold with AI-assisted, schema-validated generation.",
  lastUpdated: true,
  cleanUrls: true,

  // READMEs double as GitHub-browsable files and reference source files
  // (e.g. ./example-posts.tsx) + localhost URLs; don't fail the build on those.
  ignoreDeadLinks: [/^http:\/\/localhost/, /\.tsx?$/, /\.js$/],

  // Existing README.md files (kept for GitHub browsing) serve as section indexes.
  rewrites: {
    "ai/README.md": "ai/index.md",
    "pocketbase/README.md": "pocketbase/index.md",
    "appwrite/README.md": "appwrite/index.md",
    "supabase/README.md": "supabase/index.md"
  },

  themeConfig: {
    outline: "deep",
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "AI Generation", link: "/ai/" },
      {
        text: "Connectors",
        items: [
          { text: "PocketBase", link: "/pocketbase/" },
          { text: "Appwrite", link: "/appwrite/" },
          { text: "Supabase", link: "/supabase/" }
        ]
      },
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
        text: "AI-Assisted Generation",
        items: [{ text: "ai generate / theme / refine", link: "/ai/" }]
      },
      {
        text: "Backend Connectors",
        items: [
          { text: "PocketBase", link: "/pocketbase/" },
          { text: "Appwrite", link: "/appwrite/" },
          { text: "Supabase", link: "/supabase/" }
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
