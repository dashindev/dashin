import copyFolder from "../utils/copy-folder"
import replaceInFile from "../utils/replace-in-file"
import { DASHIN_CLI_PATH } from "../utils/config"
const path = require("path")
const fs = require("fs")

const sourceFolder = path.resolve(
  DASHIN_CLI_PATH,
  "templates/typescript-plugin/dashin-plugin-myteam-myblog/post"
)

export default async function newSchema(
  name = "post"
): Promise<undefined | string> {
  // check in the plugin root path
  try {
    const indexFile = await fs.readFileSync("index.ts", "utf8")
    if (indexFile.indexOf("IPluginData") < 0) {
      return "You need to run this command in the plugin root path"
    }
  } catch (e) {
    console.error(e)
    return "You need to run this command in the plugin root path, and its 'index.ts' file needs to contain 'IPluginData'."
  }

  let errors: undefined | string
  // copy template files to target folder
  const targetFolder = path.resolve(name)
  errors = await copyFolder(sourceFolder, targetFolder)
  if (errors) return errors

  if (name.length < 2) return "Name is too short"
  // replace {nameUpper1} in file: `index.tsx`
  let indexFile = path.resolve(targetFolder, "index.tsx")
  const nameUpper1 = name.charAt(0).toUpperCase() + name.slice(1)
  errors = await replaceInFile(indexFile, "Post", nameUpper1)
  if (errors) return errors

  // replace SchemaName to {schema name} in file: `plugin.ts`
  indexFile = path.resolve(targetFolder, "plugin.ts")
  errors = await replaceInFile(indexFile, "posts", name)
  if (errors) return errors

  // replace SchemaLabel to {nameUpper1} in file: `plugin.ts`
  indexFile = path.resolve(targetFolder, "plugin.ts")
  return await replaceInFile(indexFile, "Posts", nameUpper1)
}
