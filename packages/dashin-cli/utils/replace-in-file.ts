const fs = require("fs")

export default async function replaceInFile(
  filePath: string,
  from: string,
  to: string
): Promise<undefined | string> {
  let originContent: string = ""
  try {
    originContent = await fs.readFileSync(filePath, "utf8")
  } catch (e) {
    console.error(e)
    return `File ${filePath} does not exist`
  }

  const fromRegx = new RegExp(from, "g")
  const result = originContent.replace(fromRegx, to)

  try {
    await fs.writeFileSync(filePath, result, "utf8")
  } catch (e) {
    console.error(e)
    return `Failed to update file 123 ${filePath}`
  }
}
