import { resolve } from "path"

/** Home path
  OS X - '/Users/user/Library/Preferences'
  Windows 8 - 'C:\Users\user\AppData\Roaming'
  Windows XP - 'C:\Documents and Settings\user\Application Data'
  Linux - '/home/user/.local/share'
 */
const homePath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")

export const BUNADMIN_CLI_PATH = resolve(
  homePath,
  "npm/node_modules/bunadmin-cli"
)
