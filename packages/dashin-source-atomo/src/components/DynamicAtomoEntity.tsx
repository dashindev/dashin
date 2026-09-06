import React, { useRef } from "react"
import { CrudTable, CubeSpinner } from "@dashin-dev/dashin"
import { useAtomoModel, useAtomoSchema } from "./DynamicAtomoProvider"
import { humanizeTitle } from "../schemaMapper"
import dataCtrl from "../controllers/dataCtrl"
import editableCtrl from "../controllers/editableCtrl"
import bulkDeleteCtrl from "../controllers/bulkDeleteCtrl"

export interface DynamicAtomoEntityProps {
  model: string
  title?: string
  searchField?: string
  disableAdd?: boolean
  baseUrl?: string
}

export const DynamicAtomoEntity: React.FC<DynamicAtomoEntityProps> = ({
  model,
  title,
  searchField = "name",
  disableAdd = false,
  baseUrl,
}) => {
  const tableRef = useRef<any>(null)
  const { baseUrl: contextBaseUrl } = useAtomoSchema()
  const effectiveBaseUrl = baseUrl || contextBaseUrl
  const { modelMeta, columns, loading, error } = useAtomoModel(model)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <CubeSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-bn border border-danger/20 bg-danger/10 p-6 text-danger m-4">
        <h3 className="font-semibold text-base mb-1">Failed to load Atomo Schema</h3>
        <p className="text-sm">{error.message}</p>
      </div>
    )
  }

  if (!modelMeta) {
    return (
      <div className="rounded-bn border border-bn-border bg-content-box p-6 text-icon-muted m-4 text-center">
        <h3 className="font-semibold text-base mb-1">Model Not Found</h3>
        <p className="text-sm">Model '{model}' is not defined in the loaded Atomo Schema.</p>
      </div>
    )
  }

  const tableTitle = title || humanizeTitle(modelMeta.tableName || model)

  return (
    <CrudTable
      title={tableTitle}
      columns={columns}
      disableAdd={disableAdd}
      data={query =>
        dataCtrl({
          model,
          tableQuery: query,
          searchField,
          baseUrl: effectiveBaseUrl,
        })
      }
      editable={editableCtrl({
        model,
        baseUrl: effectiveBaseUrl,
      })}
      actions={[
        bulkDeleteCtrl({
          model,
          tableRef,
          baseUrl: effectiveBaseUrl,
        }),
      ]}
    />
  )
}

export default DynamicAtomoEntity
