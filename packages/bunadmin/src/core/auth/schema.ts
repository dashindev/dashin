import { BunadminSchema } from "@/utils"

export const Primary = "username"

export const Schema: BunadminSchema = {
  title: "Authentication",
  description: "Store signed-in user's information",
  version: 0,
  primaryKey: Primary,
  type: "object",
  properties: {
    [Primary]: {
      type: "string",
    },
    id: {
      type: "string"
    },
    updated_at: {
      type: "number",
    },
    role: {
      type: "string"
    },
    token: {
      type: "string"
    },
    details: {
      type: "string"
    }
  },
  required: ["role", "token"],
  indexes: ["updated_at"]
}
