// Static lookup maps for the D1 e-commerce demo. The Worker seed is fixed and
// uses stable ids (schema has no AUTOINCREMENT), so these maps match the data:
// category_id 1..8 and customer_id 1..24 always resolve to the same names.

export const CATEGORY_LOOKUP: Record<number, string> = {
  1: "Electronics",
  2: "Apparel",
  3: "Home & Kitchen",
  4: "Books",
  5: "Toys & Games",
  6: "Sports & Outdoors",
  7: "Beauty",
  8: "Grocery"
}

export const CUSTOMER_LOOKUP: Record<number, string> = {
  1: "Ava Thompson",
  2: "Liam Chen",
  3: "Sofia Rossi",
  4: "Noah Müller",
  5: "Emma Dubois",
  6: "Oliver Smith",
  7: "Mia Garcia",
  8: "Lucas Silva",
  9: "Hana Sato",
  10: "Arjun Patel",
  11: "Charlotte Brown",
  12: "Ethan Wilson",
  13: "Isabella Moore",
  14: "Mateo Lopez",
  15: "Amelia Taylor",
  16: "James Anderson",
  17: "Yuki Tanaka",
  18: "Lena Schmidt",
  19: "Hugo Martin",
  20: "Grace Kim",
  21: "Daniel Nguyen",
  22: "Freya Olsen",
  23: "Marco Bianchi",
  24: "Zoe Clark"
}

export const PRODUCT_STATUS_LOOKUP: Record<string, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived"
}

export const ORDER_STATUS_LOOKUP: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  cancelled: "Cancelled"
}

/** Format a number as USD for display in a column `render`. */
export const money = (n: number | null | undefined): string =>
  n == null || isNaN(Number(n))
    ? "—"
    : "$" +
      Number(n).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
