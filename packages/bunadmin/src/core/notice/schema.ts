import { BunadminSchema } from "@/utils"

export const Primary = "id"

export const Schema: BunadminSchema = {
  title: "Local Notice",
  description: "local notices",
  version: 0,
  primaryKey: Primary,
  type: "object",
  properties: {
    [Primary]: {
      type: "string",
    },
    created_at: {
      type: "number",
    },
    title: {
      type: "string"
    },
    severity: {
      type: "string",
      enum: ["success", "info", "warning", "error"]
    },
    content: {
      type: "string"
    }
  },
  required: ["title", "severity"],
  indexes: ["created_at"]
}
