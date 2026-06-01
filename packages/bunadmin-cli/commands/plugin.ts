import copyFolder from "../utils/copy-folder"
import replaceInFile from "../utils/replace-in-file"
import { DASHIN_CLI_PATH } from "../utils/config"
const path = require("path")

const sourceFolder = path.resolve(
  DASHIN_CLI_PATH,
  "templates/typescript-plugin/bunadmin-plugin-myteam-myblog"
)

export default async function newPlugin(
  name = "myteam-myblog"
): Promise<undefined | string> {
  // check in the plugins path
  const currentPath = path.resolve()

  // check if the user ist in the `plugins` folder
  if (!/.*(\/|\\)plugins$/.test(currentPath)) {
    return "You need to run this command in the plugins path"
  }

  let errors: undefined | string
  // split team and group
  const input = name.split("-")
  const team = input[0]
  const group = input[1]
  if (!group || group === "") return `group '${group}' format is incorrect`
  // copy template files to target folder
  const targetFolder = path.resolve(`bunadmin-plugin-${name}`)
  errors = await copyFolder(sourceFolder, targetFolder)
  if (errors) return errors

  // replace {team name} in file: `index.ts`
  let indexFile = path.resolve(targetFolder, "index.ts")
  errors = await replaceInFile(indexFile, "myteam", team)
  if (errors) return errors

  // replace {group name} in file: `index.ts`
  indexFile = path.resolve(targetFolder, "index.ts")
  return await replaceInFile(indexFile, "myblog", group)
}
