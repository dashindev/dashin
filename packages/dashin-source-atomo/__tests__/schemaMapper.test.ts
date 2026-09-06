import { describe, it, expect } from "vitest"
import {
  humanizeTitle,
  mapAtomoTypeToColumnType,
  atomoFieldsToDashinColumns,
} from "../src/schemaMapper"
import { AtomoModelMeta } from "../src/types"

describe("schemaMapper", () => {
  it("humanizes field names into readable titles", () => {
    expect(humanizeTitle("id")).toBe("ID")
    expect(humanizeTitle("firstName")).toBe("First Name")
    expect(humanizeTitle("open_deal_value")).toBe("Open Deal Value")
    expect(humanizeTitle("welcomeSentAt")).toBe("Welcome Sent At")
  })

  it("maps Atomo types to Dashin column types", () => {
    expect(mapAtomoTypeToColumnType("number")).toBe("numeric")
    expect(mapAtomoTypeToColumnType("boolean")).toBe("boolean")
    expect(mapAtomoTypeToColumnType("datetime")).toBe("datetime")
    expect(mapAtomoTypeToColumnType("string")).toBe("string")
    expect(mapAtomoTypeToColumnType("email")).toBe("string")
    expect(mapAtomoTypeToColumnType("blocks")).toBe("string")
  })

  it("converts Atomo model metadata into Dashin Column array", () => {
    const modelMeta: AtomoModelMeta = {
      tableName: "users",
      primaryKey: "id",
      fields: {
        id: { name: "id", type: "id", attributes: ["primary"] },
        email: { name: "email", type: "email", attributes: ["unique", "required"] },
        firstName: { name: "firstName", type: "string" },
        role: { name: "role", type: "select" },
        createdAt: { name: "createdAt", type: "datetime", attributes: ["readonly"] },
      },
      ui: {
        listView: ["email", "firstName", "role"],
      },
    }

    const columns = atomoFieldsToDashinColumns(modelMeta)

    expect(columns).toHaveLength(5)

    const idCol = columns.find(c => c.field === "id")
    expect(idCol?.editable).toBe("never")
    expect(idCol?.hidden).toBe(true) // Not in listView

    const emailCol = columns.find(c => c.field === "email")
    expect(emailCol?.title).toBe("Email")
    expect(emailCol?.type).toBe("string")
    expect(emailCol?.hidden).toBe(false) // In listView

    const createdAtCol = columns.find(c => c.field === "createdAt")
    expect(createdAtCol?.type).toBe("datetime")
    expect(createdAtCol?.editable).toBe("never")
    expect(createdAtCol?.hidden).toBe(true)
  })
})
