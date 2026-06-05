import { resolve } from "path"

/**
 * Absolute path to this CLI package's root — the directory that contains
 * `templates/`. Resolved from the compiled file's own location (this file ships
 * as `lib/utils/config.js`, so `../..` is the package root), which works for
 * every install method: `npx`, global, and local. The previous hardcoded global
 * path (`<home>/npm/node_modules/dashin-cli`) only resolved in one specific
 * layout and broke `dashin new` / `plugin` / `schema` from npm.
 */
export const DASHIN_CLI_PATH = resolve(__dirname, "..", "..")
