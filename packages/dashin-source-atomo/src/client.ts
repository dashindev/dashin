import { ENV, storedToken } from "@dashin-dev/dashin"
import { AtomoSchemaMeta } from "./types"

export interface AtomoClientOptions {
  baseUrl?: string
  token?: string
  fetchFn?: typeof fetch
}

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

export function camelizeKeys(obj: any): any {
  if (Array.isArray(obj)) return obj.map(camelizeKeys)
  if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [snakeToCamel(k), camelizeKeys(v)])
    )
  }
  return obj
}

export function getAtomoBaseUrl(override?: string): string {
  if (override) return override.replace(/\/+$/, "")
  const envUrl = ENV.MAIN_URL || ENV.AUTH_URL
  if (envUrl) return envUrl.replace(/\/+$/, "")
  if (typeof window !== "undefined") {
    const w = window as any
    if (w.__ATOMO_URL__) return w.__ATOMO_URL__.replace(/\/+$/, "")
  }
  return "http://localhost:3000"
}

export async function getAtomoToken(override?: string): Promise<string | null> {
  if (override) return override
  try {
    const token = await storedToken()
    if (token) return String(token).replace(/^Bearer\s+/i, "")
  } catch {
    // ignore in headless test environments where IndexedDB might be unavailable
  }
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("atomo_auth_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("atomo_auth_token") ||
      sessionStorage.getItem("token")
    )
  }
  return null
}

function getFetcher(options: AtomoClientOptions) {
  if (options.fetchFn) return options.fetchFn
  if (typeof window !== "undefined" && window.fetch) return window.fetch.bind(window)
  if (typeof globalThis !== "undefined" && globalThis.fetch) return globalThis.fetch.bind(globalThis)
  return fetch
}

export async function fetchAtomoMetadata(options: AtomoClientOptions = {}): Promise<AtomoSchemaMeta> {
  const baseUrl = getAtomoBaseUrl(options.baseUrl)
  const token = await getAtomoToken(options.token)
  const fetcher = getFetcher(options)

  const headers: Record<string, string> = {
    Accept: "application/json",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetcher(`${baseUrl}/meta/schema`, { headers })
  if (!res.ok) {
    throw new Error(`Failed to fetch Atomo metadata from ${baseUrl}/meta/schema: HTTP ${res.status}`)
  }
  const raw = await res.json()
  return raw as AtomoSchemaMeta
}

export async function atomoGraphQLRequest<T = any>(
  query: string,
  variables: Record<string, any> = {},
  options: AtomoClientOptions = {}
): Promise<T> {
  const baseUrl = getAtomoBaseUrl(options.baseUrl)
  const token = await getAtomoToken(options.token)
  const fetcher = getFetcher(options)

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetcher(`${baseUrl}/graphql`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    throw new Error(`Atomo GraphQL request failed HTTP ${res.status}: ${res.statusText}`)
  }

  const json = await res.json()
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e: any) => e.message || String(e)).join("; "))
  }

  return json.data as T
}

export async function atomoListRecords<T = any>(
  model: string,
  params: {
    page?: number
    limit?: number
    where?: Record<string, any>
    orderBy?: Record<string, string>
  },
  options: AtomoClientOptions = {}
): Promise<{ data: T[]; totalCount: number; page: number; limit: number }> {
  const page = params.page && params.page > 0 ? params.page : 1
  const limit = params.limit && params.limit > 0 ? params.limit : 20
  const offset = (page - 1) * limit

  const query = `
    query PaginatedRecords($model: String!, $where: JSON, $orderBy: JSON, $limit: Int, $offset: Int) {
      paginatedRecords(model: $model, where: $where, orderBy: $orderBy, limit: $limit, offset: $offset) {
        data
        pageInfo {
          totalCount
          hasNextPage
          hasPreviousPage
        }
      }
    }
  `

  const data = await atomoGraphQLRequest<{
    paginatedRecords: {
      data: any[]
      pageInfo: { totalCount: number }
    }
  }>(query, {
    model,
    where: params.where && Object.keys(params.where).length > 0 ? params.where : undefined,
    orderBy: params.orderBy,
    limit,
    offset,
  }, options)

  const paginated = data?.paginatedRecords
  const rows = camelizeKeys(paginated?.data || [])
  return {
    data: rows as T[],
    totalCount: paginated?.pageInfo?.totalCount || 0,
    page,
    limit,
  }
}

export async function atomoCreateRecord<T = any>(
  model: string,
  record: Record<string, any>,
  options: AtomoClientOptions = {}
): Promise<T> {
  const query = `
    mutation CreateRecord($model: String!, $data: JSON!) {
      create(model: $model, data: $data)
    }
  `
  const data = await atomoGraphQLRequest<{ create: any }>(query, { model, data: record }, options)
  return camelizeKeys(data.create) as T
}

export async function atomoUpdateRecord<T = any>(
  model: string,
  id: string,
  record: Record<string, any>,
  options: AtomoClientOptions = {}
): Promise<T> {
  const query = `
    mutation UpdateRecord($model: String!, $where: JSON!, $data: JSON!) {
      update(model: $model, where: $where, data: $data)
    }
  `
  const data = await atomoGraphQLRequest<{ update: any }>(query, {
    model,
    where: { id: { equals: id } },
    data: record,
  }, options)
  return camelizeKeys(data.update) as T
}

export async function atomoGetRecord<T = any>(
  model: string,
  id: string,
  options: AtomoClientOptions = {}
): Promise<T> {
  const query = `
    query GetRecord($model: String!, $id: String!) {
      record(model: $model, id: $id)
    }
  `
  const data = await atomoGraphQLRequest<{ record: any }>(query, { model, id }, options)
  return camelizeKeys(data?.record) as T
}

export async function atomoDeleteRecord(
  model: string,
  id: string,
  options: AtomoClientOptions = {}
): Promise<void> {
  const query = `
    mutation DeleteRecord($model: String!, $where: JSON!) {
      delete(model: $model, where: $where)
    }
  `
  await atomoGraphQLRequest(query, {
    model,
    where: { id: { equals: id } },
  }, options)
}

