export function fsDownload(file: Blob, fileName: string) {
  const a = document.createElement("a")
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.click()
}
