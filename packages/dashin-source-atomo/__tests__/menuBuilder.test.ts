import { describe, it, expect } from "vitest"
import { getModelEvaIcon, buildAtomoMenuData } from "../src/menuBuilder"
import { AtomoSchemaMeta } from "../src/types"

describe("menuBuilder", () => {
  it("picks sensible Eva icons based on model names", () => {
    expect(getModelEvaIcon("users")).toBe("person-outline")
    expect(getModelEvaIcon("contacts")).toBe("people-outline")
    expect(getModelEvaIcon("orders")).toBe("shopping-bag-outline")
    expect(getModelEvaIcon("products")).toBe("cube-outline")
    expect(getModelEvaIcon("companies")).toBe("grid-outline")
    expect(getModelEvaIcon("deals")).toBe("briefcase-outline")
    expect(getModelEvaIcon("custom_entity")).toBe("file-text-outline")
  })

  it("builds Dashin MenuType array from Atomo schema", () => {
    const schema: AtomoSchemaMeta = {
      models: {
        users: {
          tableName: "users",
          primaryKey: "id",
          fields: {},
        },
        deals: {
          tableName: "deals",
          primaryKey: "id",
          fields: {},
        },
      },
    }

    const menu = buildAtomoMenuData(schema, {
      parentGroup: "crm",
      parentLabel: "CRM Suite",
    })

    expect(menu).toHaveLength(3) // 1 parent + 2 children

    const parent = menu[0]
    expect(parent.id).toBe("group_crm")
    expect(parent.name).toBe("crm")
    expect(parent.label).toBe("CRM Suite")
    expect(parent.parent).toBe("")

    const usersItem = menu.find(m => m.name === "users")
    expect(usersItem?.label).toBe("Users")
    expect(usersItem?.parent).toBe("group_crm")
    expect(usersItem?.slug).toBe("crm-users")
    expect(usersItem?.icon).toBe("person-outline")
  })

  it("filters menu items based on access rules and userRole", () => {
    const schema: AtomoSchemaMeta = {
      models: {
        publicArticles: {
          tableName: "articles",
          primaryKey: "id",
          fields: {},
          access: { read: "authenticated" },
        },
        adminSettings: {
          tableName: "settings",
          primaryKey: "id",
          fields: {},
          access: { read: "admin" },
        },
      },
    }

    const viewerMenu = buildAtomoMenuData(schema, { userRole: "viewer" })
    expect(viewerMenu.some(m => m.name === "adminSettings")).toBe(false)
    expect(viewerMenu.some(m => m.name === "publicArticles")).toBe(true)

    const adminMenu = buildAtomoMenuData(schema, { userRole: "admin" })
    expect(adminMenu.some(m => m.name === "adminSettings")).toBe(true)
    expect(adminMenu.some(m => m.name === "publicArticles")).toBe(true)
  })
})
