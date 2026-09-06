import { CollectionRegistry, CollectionMeta } from "@dashin-dev/dashin"
import { AtomoSchemaMeta, AtomoModelMeta } from "./types"
import { atomoFieldsToDashinColumns, humanizeTitle } from "./schemaMapper"
import { atomoGetRecord } from "./client"
import editableCtrl from "./controllers/editableCtrl"

export interface BuildRegistryOptions {
  baseUrl?: string
  t?: (key: string) => string
  customTitleField?: Record<string, (rec: any) => string>
  customSubtitleField?: Record<string, (rec: any) => string>
}

export function extractModelRelations(
  model: AtomoModelMeta
): CollectionMeta["relations"] {
  if (!model.relationships) return undefined
  const relations: NonNullable<CollectionMeta["relations"]> = []

  for (const [relName, rel] of Object.entries(model.relationships)) {
    const isList = rel.type === "one_to_many" || rel.type === "many_to_many"
    const targetSlug = rel.model
    const foreignKey = rel.foreignKey

    relations.push({
      label: humanizeTitle(relName),
      slug: targetSlug,
      list: isList,
      value: (rec: any) => {
        if (!rec) return null
        if (isList) {
          return rec[`_${relName}`] || rec[relName] || []
        }
        return foreignKey ? rec[foreignKey] : rec[relName]
      },
    })
  }

  return relations.length > 0 ? relations : undefined
}

export function buildAtomoRegistry(
  schema: AtomoSchemaMeta,
  options: BuildRegistryOptions = {}
): CollectionRegistry {
  const { baseUrl, customTitleField = {}, customSubtitleField = {} } = options
  const registry: CollectionRegistry = {}

  for (const [slug, model] of Object.entries(schema.models || {})) {
    const defaultTitle = (rec: any) =>
      rec?.name ||
      rec?.title ||
      rec?.displayName ||
      rec?.email ||
      rec?.label ||
      (rec?.id ? `${humanizeTitle(slug)} #${rec.id}` : "")

    const defaultSubtitle = (rec: any) =>
      rec?.subtitle ||
      rec?.description ||
      rec?.email ||
      rec?.role ||
      rec?.companyName ||
      ""

    const titleFn = customTitleField[slug] || defaultTitle
    const subtitleFn = customSubtitleField[slug] || defaultSubtitle

    const meta: CollectionMeta = {
      label: humanizeTitle(model.tableName || slug),
      title: titleFn,
      subtitle: subtitleFn,
      relations: extractModelRelations(model),
    }

    registry[slug] = {
      meta,
      columns: atomoFieldsToDashinColumns(model),
      fetch: async (id: string | number) => {
        return await atomoGetRecord(slug, String(id), { baseUrl })
      },
      editable: editableCtrl({
        model: slug,
        baseUrl,
      }),
    }
  }

  return registry
}
