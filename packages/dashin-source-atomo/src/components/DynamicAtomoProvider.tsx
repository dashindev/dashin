import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { AtomoModelMeta, AtomoSchemaMeta } from "../types"
import { fetchAtomoMetadata } from "../client"
import { atomoFieldsToDashinColumns } from "../schemaMapper"
import { Column } from "@dashin-dev/dashin"

export interface AtomoContextValue {
  schema: AtomoSchemaMeta | null
  loading: boolean
  error: Error | null
  refreshSchema: () => Promise<void>
  baseUrl?: string
}

const AtomoContext = createContext<AtomoContextValue>({
  schema: null,
  loading: true,
  error: null,
  refreshSchema: async () => {},
})

export interface DynamicAtomoProviderProps {
  children: React.ReactNode
  baseUrl?: string
  initialSchema?: AtomoSchemaMeta
}

export const DynamicAtomoProvider: React.FC<DynamicAtomoProviderProps> = ({
  children,
  baseUrl,
  initialSchema,
}) => {
  const [schema, setSchema] = useState<AtomoSchemaMeta | null>(initialSchema || null)
  const [loading, setLoading] = useState<boolean>(!initialSchema)
  const [error, setError] = useState<Error | null>(null)

  const refreshSchema = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAtomoMetadata({ baseUrl })
      setSchema(data)
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  useEffect(() => {
    if (!initialSchema) {
      refreshSchema()
    }
  }, [refreshSchema, initialSchema])

  const contextValue = useMemo<AtomoContextValue>(
    () => ({
      schema,
      loading,
      error,
      refreshSchema,
      baseUrl,
    }),
    [schema, loading, error, refreshSchema, baseUrl]
  )

  return <AtomoContext.Provider value={contextValue}>{children}</AtomoContext.Provider>
}

export function useAtomoSchema(): AtomoContextValue {
  return useContext(AtomoContext)
}

export function useAtomoModel<RowData extends object = any>(modelName: string): {
  modelMeta: AtomoModelMeta | null
  columns: Column<RowData>[]
  loading: boolean
  error: Error | null
} {
  const { schema, loading, error } = useAtomoSchema()

  const modelMeta = useMemo<AtomoModelMeta | null>(() => {
    if (!schema || !schema.models) return null
    return schema.models[modelName] || null
  }, [schema, modelName])

  const columns = useMemo<Column<RowData>[]>(() => {
    if (!modelMeta) return []
    return atomoFieldsToDashinColumns<RowData>(modelMeta)
  }, [modelMeta])

  return {
    modelMeta,
    columns,
    loading,
    error,
  }
}
