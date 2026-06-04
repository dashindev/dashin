import { copySync } from "fs-extra"

// copy source folder to destination
export default async function copyFolder(
  source: string,
  destination: string
): Promise<undefined | string> {
  try {
    await copySync(source, destination)
  } catch (e) {
    console.error(e)
    return `An error occured while copying the folder.`
  }
}
