import { describe, it, expect } from "vitest"
import { extractModelRelations, buildAtomoRegistry } from "../src/registryBuilder"
import { atomoFieldsToDashinColumns } from "../src/schemaMapper"
import { AtomoModelMeta, AtomoSchemaMeta } from "../src/types"

describe("registryBuilder and relationship integration", () => {
  const companyModel: AtomoModelMeta = {
    tableName: "companies",
    primaryKey: "id",
    fields: {
      id: { name: "id", type: "id" },
      name: { name: "name", type: "string" },
      domain: { name: "domain", type: "string" },
    },
  }

  const contactModel: AtomoModelMeta = {
    tableName: "contacts",
    primaryKey: "id",
    fields: {
      id: { name: "id", type: "id" },
      name: { name: "name", type: "string" },
      companyId: { name: "companyId", type: "relation" },
    },
    relationships: {
      company: {
        type: "many_to_one",
        model: "companies",
        foreignKey: "companyId",
      },
    },
  }

  const schema: AtomoSchemaMeta = {
    models: {
      companies: companyModel,
      contacts: contactModel,
    },
  }

  it("extracts relations from model relationships metadata", () => {
    const relations = extractModelRelations(contactModel)
    expect(relations).toBeDefined()
    expect(relations).toHaveLength(1)
    expect(relations![0].label).toBe("Company")
    expect(relations![0].slug).toBe("companies")
    expect(relations![0].list).toBe(false)
    expect(relations![0].value({ companyId: "comp_99" })).toBe("comp_99")
  })

  it("builds CollectionRegistry matching Dashin RelatedPreview contract", () => {
    const registry = buildAtomoRegistry(schema, { baseUrl: "http://test.atomo" })
    expect(registry).toHaveProperty("companies")
    expect(registry).toHaveProperty("contacts")

    const compEntry = registry.companies
    expect(compEntry.meta.label).toBe("Companies")
    expect(compEntry.meta.title({ name: "Acme Corp" })).toBe("Acme Corp")
    expect(compEntry.columns).toBeDefined()
    expect(typeof compEntry.fetch).toBe("function")
    expect(compEntry.editable).toBeDefined()

    const contactEntry = registry.contacts
    expect(contactEntry.meta.relations).toHaveLength(1)
  })

  it("automatically attaches RelatedCard renderer to foreignKey / relation columns", () => {
    const columns = atomoFieldsToDashinColumns(contactModel)
    const companyCol = columns.find(c => c.field === "companyId")
    expect(companyCol).toBeDefined()
    expect(typeof companyCol?.renderDetail).toBe("function")
    expect(typeof companyCol?.render).toBe("function")
  })
})
