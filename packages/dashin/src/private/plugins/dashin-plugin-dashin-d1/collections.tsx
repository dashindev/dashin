import React from "react"
import { CollectionRegistry } from "@/components/RelatedPreview"
import { execute } from "@dashin-dev/source-d1"
import { editableCtrl } from "@dashin-dev/source-d1"
import { columns as customerColumns } from "./customers/columns"
import { columns as orderColumns } from "./orders/columns"
import { CUSTOMER_LOOKUP, ORDER_STATUS_LOOKUP, money } from "./lookups"

const fetchRow = async (table: string, id: string | number) => {
  const { rows } = await execute(
    { sql: `SELECT * FROM "${table}" WHERE "id" = ? LIMIT 1`, args: [id] }
  )
  return rows[0] ?? null
}

const fetchRelatedOrders = async (customerId: number) => {
  const { rows } = await execute(
    { sql: `SELECT * FROM "orders" WHERE "customer_id" = ? ORDER BY "created_at" DESC LIMIT 20`, args: [customerId] }
  )
  return rows
}

export const collections = (t: (k: string) => string): CollectionRegistry => ({
  customers: {
    meta: {
      label: "Customer",
      title: r => r.name,
      subtitle: r => r.email,
      summary: [
        { label: t("Country"), value: r => r.country || "—" },
        { label: t("Joined"), value: r => r.created_at?.slice(0, 10) || "—" }
      ],
      relations: [
        { label: t("Orders"), slug: "orders", list: true, value: r => r._orders }
      ]
    },
    columns: customerColumns({ t }),
    editable: editableCtrl({ t, SchemaName: "customers" }),
    fetch: async (id) => {
      const customer = await fetchRow("customers", id)
      if (customer) customer._orders = await fetchRelatedOrders(customer.id)
      return customer
    }
  },
  orders: {
    meta: {
      label: "Order",
      title: r => `Order #${r.id}`,
      subtitle: r => {
        const name = CUSTOMER_LOOKUP[r.customer_id] || `Customer ${r.customer_id}`
        return <span>{name}</span>
      },
      summary: [
        { label: t("Total"), value: r => money(r.total) },
        { label: t("Status"), value: r => ORDER_STATUS_LOOKUP[r.status] || r.status },
        { label: t("Date"), value: r => r.created_at?.slice(0, 10) || "—" }
      ],
      relations: [
        { label: t("Customer"), slug: "customers", value: r => r.customer_id }
      ]
    },
    columns: orderColumns({ t }),
    editable: editableCtrl({ t, SchemaName: "orders" }),
    fetch: (id) => fetchRow("orders", id)
  }
})
