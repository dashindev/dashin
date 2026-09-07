import { FieldDiff } from "./types"

export const DEFAULT_MASKED_FIELDS = [
  "password",
  "token",
  "secret",
  "apikey",
  "api_key",
  "creditcard",
  "credit_card",
  "privatekey",
  "private_key",
  "authorization",
  "access_token",
  "refresh_token",
]

export const DEFAULT_IGNORED_FIELDS = [
  "updated_at",
  "updatedat",
  "last_modified",
  "lastmodified",
  "modified_at",
]

export interface DiffOptions {
  maskedFields?: string[]
  maskValue?: string
  ignoredFields?: string[]
}

function isMaskedField(fieldName: string, customMasked?: string[]): boolean {
  const list = (customMasked || DEFAULT_MASKED_FIELDS).map(f => f.toLowerCase())
  const normalized = fieldName.toLowerCase().replace(/[-_]/g, "")
  return list.some(m => {
    const cleanM = m.replace(/[-_]/g, "")
    return normalized === cleanM || normalized.endsWith(cleanM)
  })
}

function isIgnoredField(fieldName: string, customIgnored?: string[]): boolean {
  const list = (customIgnored || DEFAULT_IGNORED_FIELDS).map(f => f.toLowerCase().replace(/[-_]/g, ""))
  const normalized = fieldName.toLowerCase().replace(/[-_]/g, "")
  return list.includes(normalized)
}

function sanitizeValue(fieldName: string, val: any, options?: DiffOptions): any {
  if (val == null) return val
  if (isMaskedField(fieldName, options?.maskedFields)) {
    return options?.maskValue || "********"
  }
  if (typeof val === "object" && !(val instanceof Date)) {
    try {
      return JSON.parse(JSON.stringify(val))
    } catch {
      return String(val)
    }
  }
  return val
}

function areValuesEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null && b == null) return true
  if (a == null || b == null) return false

  if (typeof a === "object" && typeof b === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b)
    } catch {
      return false
    }
  }
  return false
}

/**
 * Calculates granular field diffs between before and after states.
 */
export function calculateFieldDiffs(
  before: Record<string, any> | null | undefined,
  after: Record<string, any> | null | undefined,
  options?: DiffOptions
): FieldDiff[] {
  const diffs: FieldDiff[] = []

  // Case 1: Creation (before is empty)
  if (!before && after) {
    for (const [key, val] of Object.entries(after)) {
      if (isIgnoredField(key, options?.ignoredFields)) continue
      diffs.push({
        field: key,
        type: "added",
        oldValue: null,
        newValue: sanitizeValue(key, val, options),
      })
    }
    return diffs
  }

  // Case 2: Deletion (after is empty)
  if (before && !after) {
    for (const [key, val] of Object.entries(before)) {
      if (isIgnoredField(key, options?.ignoredFields)) continue
      diffs.push({
        field: key,
        type: "removed",
        oldValue: sanitizeValue(key, val, options),
        newValue: null,
      })
    }
    return diffs
  }

  if (!before && !after) return diffs

  const keyMap: Record<string, boolean> = {}
  for (const k of Object.keys(before!)) keyMap[k] = true
  for (const k of Object.keys(after!)) keyMap[k] = true
  const allKeys = Object.keys(keyMap)

  for (const key of allKeys) {
    if (isIgnoredField(key, options?.ignoredFields)) continue

    const hasOld = key in before!
    const hasNew = key in after!

    const oldVal = before![key]
    const newVal = after![key]

    if (!hasOld && hasNew) {
      diffs.push({
        field: key,
        type: "added",
        oldValue: null,
        newValue: sanitizeValue(key, newVal, options),
      })
    } else if (hasOld && !hasNew) {
      diffs.push({
        field: key,
        type: "removed",
        oldValue: sanitizeValue(key, oldVal, options),
        newValue: null,
      })
    } else if (!areValuesEqual(oldVal, newVal)) {
      diffs.push({
        field: key,
        type: "modified",
        oldValue: sanitizeValue(key, oldVal, options),
        newValue: sanitizeValue(key, newVal, options),
      })
    }
  }

  return diffs
}
