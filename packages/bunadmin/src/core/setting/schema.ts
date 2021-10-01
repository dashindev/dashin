import { BunadminSchema } from "@/utils"

export const Primary = "name"

export const Schema: BunadminSchema = {
  title: "Bunadmin Setting",
  description: "Manage your Bunadmin Settings",
  version: 0,
  primaryKey: Primary,
  type: "object",
  properties: {
    [Primary]: {
      type: "string",
    },
    updated_at: {
      type: "number",
    },
    value: {
      type: "string"
    }
  },
  required: [],
  indexes: ["updated_at"]
}
