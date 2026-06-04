/* Render the Dashin brand HTML to PNGs. Regenerate with: node assets/brand/render.cjs */
const fs = require("fs")
const path = require("path")
const { chromium } = require("playwright-core")

const jobs = [
  { html: "social.html", out: "social-preview.png", w: 1280, h: 640 },
  { html: "banner.html", out: "banner.png", w: 1280, h: 340 },
]

// Use whatever chromium Playwright already has on disk (revisions drift).
function findChrome() {
  const base = path.join(process.env.LOCALAPPDATA, "ms-playwright")
  for (const d of fs.readdirSync(base).filter(x => /^chromium-\d/.test(x)).sort().reverse())
    for (const c of ["chrome-win64/chrome.exe", "chrome-win/chrome.exe"]) {
      const p = path.join(base, d, c)
      if (fs.existsSync(p)) return p
    }
  return undefined
}

;(async () => {
  const browser = await chromium.launch({ executablePath: findChrome() })
  for (const j of jobs) {
    const page = await browser.newPage({
      viewport: { width: j.w, height: j.h },
      deviceScaleFactor: 2,
    })
    await page.goto("file://" + path.resolve(__dirname, j.html).replace(/\\/g, "/"))
    await page.screenshot({
      path: path.resolve(__dirname, "..", j.out),
      clip: { x: 0, y: 0, width: j.w, height: j.h },
    })
    await page.close()
    console.log("rendered assets/" + j.out + "  (" + j.w * 2 + "x" + j.h * 2 + ")")
  }
  await browser.close()
})()
