import * as fs from "fs"

/**
 * Overwrite the bunadmin router file (in node_modules path)
 * Only used for next.js project
 * @param modulePath
 */
export function useNextJsRouter(modulePath: string) {
  const routerContent = `var useNextJsRouter = require("next/dist/client/router")
exports.useRouter = useNextJsRouter.useRouter
`
  fs.writeFile(
    `${modulePath}/@xbuilder/bunadmin/lib/router.js`,
    routerContent,
    e => {
      if (e) console.error("cannot generating pluginsData.ts: " + e)
    }
  )
}
