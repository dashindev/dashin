import { i18nCodes } from "@/utils/i18n"

export default function addResource({
  i18n,
  team,
  group,
  requirePlugin
}: {
  i18n: any
  team: string
  group: string
  requirePlugin: (path: string) => any
}) {
  Object.keys(i18nCodes).forEach(lan => {
    let plugin = `bunadmin-plugin-${team}-${group}`
    if (group.indexOf("auth") > -1 || group.indexOf("upload") > -1)
      plugin = `bunadmin-${group}`

    const lang: any = requirePlugin(`${plugin}/utils/i18n/${lan}`)
    if (!lang) return

    lang.plugins &&
      i18n.addResourceBundle(lan, "plugins", lang.plugins, true, true)

    lang.table && i18n.addResourceBundle(lan, "table", lang.table, true, true)
  })
}
