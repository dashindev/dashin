import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("@dashin-dev/dashin", async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    notice: vi.fn().mockResolvedValue(undefined),
    storedToken: vi.fn().mockResolvedValue("test-token"),
    ENV: { MAIN_URL: "http://test.atomo", AUTH_URL: "http://test.atomo" },
  }
})

import {
  atomoOp,
  buildAtomoWhere,
  buildAtomoOrderBy,
  buildAtomoQueryParams,
} from "../src/services/filter"
import {
  camelizeKeys,
  atomoGraphQLRequest,
  atomoListRecords,
} from "../src/client"
import dataCtrl from "../src/controllers/dataCtrl"
import editableCtrl from "../src/controllers/editableCtrl"

describe("Atomo filter and query services", () => {
  it("maps table operators to Atomo operators correctly", () => {
    expect(atomoOp("=")).toBe("equals")
    expect(atomoOp("!=")).toBe("not")
    expect(atomoOp(">")).toBe("gt")
    expect(atomoOp(">=")).toBe("gte")
    expect(atomoOp("<")).toBe("lt")
    expect(atomoOp("<=")).toBe("lte")
    expect(atomoOp("contains")).toBe("contains")
    expect(atomoOp("in")).toBe("in")
    expect(atomoOp("startsWith")).toBe("startsWith")
  })

  it("builds where object from filters and search keywords", () => {
    const filters = [
      { column: { field: "role" }, operator: "=", value: "admin" },
      { column: { field: "score" }, operator: ">=", value: 80 },
    ]
    const where = buildAtomoWhere(filters as any, "john", "name")
    expect(where).toEqual({
      role: { equals: "admin" },
      score: { gte: 80 },
      name: { contains: "john" },
    })
  })

  it("builds orderBy dictionary from table query", () => {
    expect(buildAtomoOrderBy({ field: "createdAt" }, "desc")).toEqual({
      createdAt: "DESC",
    })
    expect(buildAtomoOrderBy("name", "asc")).toEqual({
      name: "ASC",
    })
    expect(buildAtomoOrderBy(undefined)).toBeUndefined()
  })

  it("builds Atomo query params with 1-based page index", () => {
    const query = {
      page: 2, // 0-based index 2 -> page 3
      pageSize: 15,
      filters: [{ column: { field: "status" }, operator: "=", value: "active" }],
      search: "test",
      orderBy: { field: "title" },
      orderDirection: "asc",
    }
    const params = buildAtomoQueryParams(query as any, "title")
    expect(params.page).toBe(3)
    expect(params.limit).toBe(15)
    expect(params.where).toEqual({
      status: { equals: "active" },
      title: { contains: "test" },
    })
    expect(params.orderBy).toEqual({ title: "ASC" })
  })
})

describe("Atomo client & helper utilities", () => {
  it("camelizes snake_case keys correctly", () => {
    const input = {
      user_id: "u123",
      contact_details: {
        first_name: "John",
        last_name: "Doe",
        nested_array: [{ item_name: "Book" }],
      },
    }
    expect(camelizeKeys(input)).toEqual({
      userId: "u123",
      contactDetails: {
        firstName: "John",
        lastName: "Doe",
        nestedArray: [{ itemName: "Book" }],
      },
    })
  })

  it("executes atomoGraphQLRequest through fetchFn", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { ping: "pong" } }),
    })
    const res = await atomoGraphQLRequest(
      "query { ping }",
      {},
      { baseUrl: "http://test.atomo", token: "secret", fetchFn: mockFetch as any }
    )
    expect(res).toEqual({ ping: "pong" })
    expect(mockFetch).toHaveBeenCalledWith(
      "http://test.atomo/graphql",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer secret",
        }),
      })
    )
  })
})

describe("Atomo controllers", () => {
  const mockFetcher = vi.fn()
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    mockFetcher.mockReset()
    globalThis.fetch = mockFetcher as any
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("dataCtrl fetches records and maps to QueryResult format", async () => {
    mockFetcher.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          paginatedRecords: {
            data: [{ id: "1", full_name: "Alice" }],
            pageInfo: { totalCount: 42, hasNextPage: true, hasPreviousPage: false },
          },
        },
      }),
    })

    const result = await dataCtrl({
      model: "users",
      tableQuery: {
        page: 0,
        pageSize: 10,
        filters: [],
      } as any,
      baseUrl: "http://test.atomo",
    })

    expect(result.page).toBe(0)
    expect(result.totalCount).toBe(42)
    expect(result.data).toEqual([{ id: "1", fullName: "Alice" }])
  })

  it("editableCtrl handles onRowAdd, onRowUpdate, and onRowDelete", async () => {
    mockFetcher
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { create: { id: "2", name: "Bob" } } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { update: { id: "2", name: "Bobby" } } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { delete: true } }),
      })

    const editable = editableCtrl({
      model: "users",
      baseUrl: "http://test.atomo",
    })

    const added = await editable.onRowAdd!({ name: "Bob" })
    expect(added).toEqual({ id: "2", name: "Bob" })

    const updated = await editable.onRowUpdate!({ id: "2", name: "Bobby" })
    expect(updated).toEqual({ id: "2", name: "Bobby" })

    await editable.onRowDelete!({ id: "2", name: "Bobby" })
    expect(mockFetcher).toHaveBeenCalledTimes(3)
  })
})
