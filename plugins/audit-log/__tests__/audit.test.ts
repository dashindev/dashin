import { describe, it, expect } from "vitest"
import { calculateFieldDiffs } from "../src/diff"
import { createAuditEntry, generateAuditId } from "../src/logger"
import { withAudit } from "../src/interceptor"
import { AuditActor } from "../src/types"

describe("Enterprise Audit Log Plugin (@dashin-dev/audit-log)", () => {
  const sampleActor: AuditActor = {
    id: "act_123",
    name: "Alice Security",
    email: "alice@enterprise.org",
    role: "compliance_admin",
    ipAddress: "192.168.1.100",
  }

  describe("Diff Calculator", () => {
    it("detects created records as added fields", () => {
      const created = {
        name: "Acme Production Key",
        tier: "enterprise",
        limit: 100000,
      }

      const diffs = calculateFieldDiffs(null, created)
      expect(diffs.length).toBe(3)
      expect(diffs.every(d => d.type === "added")).toBe(true)
      expect(diffs.find(d => d.field === "tier")?.newValue).toBe("enterprise")
    })

    it("detects deleted records as removed fields", () => {
      const before = {
        name: "Temporary Worker",
        status: "active",
      }

      const diffs = calculateFieldDiffs(before, null)
      expect(diffs.length).toBe(2)
      expect(diffs.every(d => d.type === "removed")).toBe(true)
      expect(diffs.find(d => d.field === "status")?.oldValue).toBe("active")
    })

    it("detects modified fields while ignoring unchanged ones", () => {
      const before = {
        id: "usr_1",
        email: "bob@acme.com",
        role: "viewer",
        status: "pending",
      }
      const after = {
        id: "usr_1",
        email: "bob@acme.com",
        role: "admin",
        status: "active",
      }

      const diffs = calculateFieldDiffs(before, after)
      expect(diffs.length).toBe(2)

      const roleDiff = diffs.find(d => d.field === "role")
      expect(roleDiff).toBeDefined()
      expect(roleDiff?.type).toBe("modified")
      expect(roleDiff?.oldValue).toBe("viewer")
      expect(roleDiff?.newValue).toBe("admin")
    })

    it("automatically masks sensitive fields (passwords, tokens, api keys)", () => {
      const before = { password: "old_plain_text", api_key: "sk_live_12345" }
      const after = { password: "new_secure_pwd", api_key: "sk_live_67890" }

      const diffs = calculateFieldDiffs(before, after)
      for (const d of diffs) {
        expect(d.oldValue).toBe("********")
        expect(d.newValue).toBe("********")
      }
    })

    it("filters out ignored transient timestamp fields", () => {
      const before = { status: "active", updated_at: "2026-09-01T00:00:00Z" }
      const after = { status: "suspended", updated_at: "2026-09-08T12:00:00Z" }

      const diffs = calculateFieldDiffs(before, after)
      expect(diffs.length).toBe(1)
      expect(diffs[0].field).toBe("status")
      expect(diffs.find(d => d.field === "updated_at")).toBeUndefined()
    })
  })

  describe("Audit Entry Construction", () => {
    it("generates a standard immutable audit log record", () => {
      const entry = createAuditEntry({
        action: "UPDATE",
        resource: "users",
        resourceId: "usr_888",
        actor: sampleActor,
        before: { role: "viewer" },
        after: { role: "super_admin" },
      })

      expect(entry.id).toMatch(/^aud_/)
      expect(entry.action).toBe("UPDATE")
      expect(entry.resource).toBe("users")
      expect(entry.resourceId).toBe("usr_888")
      expect(entry.actor.email).toBe("alice@enterprise.org")
      expect(entry.diff?.length).toBe(1)
      expect(entry.status).toBe("SUCCESS")
    })
  })

  describe("Audit Interceptor Wrapper (withAudit)", () => {
    it("executes operation, measures duration, and logs diffs on success", async () => {
      let loggedRecord: any = null

      const result = await withAudit(
        async () => {
          return { id: "record_1", title: "New Enterprise Post" }
        },
        {
          action: "CREATE",
          resource: "posts",
          resourceId: r => r.id,
          actor: sampleActor,
          config: {
            onLog: entry => {
              loggedRecord = entry
            },
          },
        }
      )

      expect(result.id).toBe("record_1")
      expect(loggedRecord).not.toBeNull()
      expect(loggedRecord.action).toBe("CREATE")
      expect(loggedRecord.status).toBe("SUCCESS")
      expect(loggedRecord.durationMs).toBeGreaterThanOrEqual(0)
    })

    it("logs failure status and re-throws when operation fails", async () => {
      let failureRecord: any = null

      await expect(
        withAudit(
          async () => {
            throw new Error("Database foreign key constraint violation")
          },
          {
            action: "DELETE",
            resource: "departments",
            resourceId: "dep_999",
            actor: sampleActor,
            config: {
              onLog: entry => {
                failureRecord = entry
              },
            },
          }
        )
      ).rejects.toThrow("Database foreign key constraint violation")

      expect(failureRecord).not.toBeNull()
      expect(failureRecord.status).toBe("FAILURE")
      expect(failureRecord.reason).toBe("Database foreign key constraint violation")
      expect(failureRecord.severity).toBe("warning")
    })
  })
})
