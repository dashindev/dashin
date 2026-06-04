import { resolve } from "path"

/** Home path
  OS X - '/Users/user/Library/Preferences'
  Windows 8 - 'C:\Users\user\AppData\Roaming'
  Windows XP - 'C:\Documents and Settings\user\Application Data'
  Linux - '/home/user/.local/share'
 */
const homePath = process.env.APPDATA || process.env.HOME + "/.local/share"

export const DASHIN_CLI_PATH =
  process.platform == "darwin"
    ? "/usr/local/lib/node_modules/dashin-cli"
    : resolve(homePath, "npm/node_modules/dashin-cli")
