import { MenuType } from "@dashin-dev/dashin"
import { AtomoSchemaMeta } from "./types"
import { humanizeTitle } from "./schemaMapper"

export function getModelEvaIcon(modelName: string): string {
  const lower = modelName.toLowerCase()
  if (lower.includes("user") || lower.includes("account")) return "person-outline"
  if (lower.includes("customer") || lower.includes("contact")) return "people-outline"
  if (lower.includes("order") || lower.includes("invoice")) return "shopping-bag-outline"
  if (lower.includes("product") || lower.includes("item")) return "cube-outline"
  if (lower.includes("compan") || lower.includes("org")) return "grid-outline"
  if (lower.includes("deal") || lower.includes("lead")) return "briefcase-outline"
  if (lower.includes("activity") || lower.includes("event") || lower.includes("log")) return "activity-outline"
  if (lower.includes("workflow") || lower.includes("task")) return "options-2-outline"
  if (lower.includes("setting") || lower.includes("config")) return "settings-2-outline"
  return "file-text-outline"
}

export interface BuildMenuOptions {
  parentGroup?: string
  parentLabel?: string
  parentIcon?: string
  userRole?: string
  basePathPrefix?: string
}

export function buildAtomoMenuData(
  schema: AtomoSchemaMeta,
  options: BuildMenuOptions = {}
): MenuType[] {
  const {
    parentGroup = "atomo",
    parentLabel = "Atomo Core",
    parentIcon = "layers-outline",
    userRole,
  } = options

  const menuItems: MenuType[] = []

  // 1. Parent group header
  const parentId = `group_${parentGroup}`
  menuItems.push({
    id: parentId,
    name: parentGroup,
    label: parentLabel,
    parent: "",
    icon: parentIcon,
    icon_type: "eva",
    rank: "01",
  })

  // 2. Child items for each model
  let rankIndex = 1
  for (const [modelName, model] of Object.entries(schema.models || {})) {
    // Check access rules if userRole is specified
    if (userRole && model.access && model.access.read) {
      const allowedRoles = String(model.access.read).split("|").map(r => r.trim())
      if (!allowedRoles.includes(userRole) && !allowedRoles.includes("authenticated") && !allowedRoles.includes("true")) {
        continue
      }
    }

    const rankStr = rankIndex < 10 ? `0${rankIndex}` : `${rankIndex}`
    rankIndex++

    menuItems.push({
      id: `atomo_${modelName}`,
      name: modelName,
      label: humanizeTitle(modelName),
      slug: `${parentGroup}-${modelName}`,
      parent: parentId,
      icon: getModelEvaIcon(modelName),
      icon_type: "eva",
      rank: rankStr,
    })
  }

  return menuItems
}
