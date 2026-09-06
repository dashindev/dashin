import copyFolder from "../utils/copy-folder"
import replaceInFile from "../utils/replace-in-file"
import { DASHIN_CLI_PATH } from "../utils/config"
const path = require("path")

export default async function newProject(
  name = "my-dashboard",
  options: any = { nextjs: false }
): Promise<undefined | string> {
  let sourceFolder = path.resolve(DASHIN_CLI_PATH, "templates/typescript-vite")
  if (options.nextjs || options.template === "nextjs") {
    sourceFolder = path.resolve(
      DASHIN_CLI_PATH,
      "templates/typescript-nextjs"
    )
  } else if (options.atomo || options.template === "atomo") {
    sourceFolder = path.resolve(
      DASHIN_CLI_PATH,
      "templates/fullstack-atomo"
    )
  }
  let errors: undefined | string
  // copy template files to target folder
  const targetFolder = path.resolve(name)
  errors = await copyFolder(sourceFolder, targetFolder)
  if (errors) return errors

  // materialize a working .env from the committed .env.example
  const fs = require("fs")
  const envExample = path.resolve(targetFolder, ".env.example")
  const envFile = path.resolve(targetFolder, ".env")
  if (fs.existsSync(envExample) && !fs.existsSync(envFile)) {
    fs.copyFileSync(envExample, envFile)
  }

  // replace {project name} in file: `package.json`
  const packageFile = path.resolve(targetFolder, "package.json")
  return await replaceInFile(packageFile, "dashin-typescript", name)
}
