import copyFolder from "../utils/copy-folder"
import replaceInFile from "../utils/replace-in-file"
import { BUNADMIN_CLI_PATH } from "../utils/config"
const path = require("path")

export default async function newProject(
  name = "my-dashboard",
  options = { nextjs: false }
): Promise<undefined | string> {
  let sourceFolder = path.resolve(BUNADMIN_CLI_PATH, "templates/typescript-vite")
  if (options.nextjs) {
    sourceFolder = path.resolve(
      BUNADMIN_CLI_PATH,
      "templates/typescript-nextjs"
    )
  }
  let errors: undefined | string
  // copy template files to target folder
  const targetFolder = path.resolve(name)
  errors = await copyFolder(sourceFolder, targetFolder)
  if (errors) return errors

  // replace {project name} in file: `package.json`
  const packageFile = path.resolve(targetFolder, "package.json")
  return await replaceInFile(packageFile, "bunadmin-typescript", name)
}
