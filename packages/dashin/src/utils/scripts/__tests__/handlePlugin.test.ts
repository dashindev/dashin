import { describe, it, expect } from "vitest"
import {
  handlePluginPath,
  specialPluginGroup,
  specialPluginSlug
} from "../handlePlugin"

describe("handlePluginPath", () => {
  it("maps a regular plugin to dashin-plugin-[team]-[group]/[name]", () => {
    expect(
      handlePluginPath({ team: "myteam", group: "blog", name: "category" })
    ).toBe("dashin-plugin-myteam-blog/category")
  })

  it("maps an auth plugin to its package basename auth-[x]/[name]", () => {
    expect(
      handlePluginPath({ team: "x", group: "auth-local", name: "users" })
    ).toBe("auth-local/users")
  })

  it("maps an upload plugin to its package basename upload-[x]/[name]", () => {
    expect(
      handlePluginPath({
        team: "x",
        group: "upload-strapi",
        name: "files"
      })
    ).toBe("upload-strapi/files")
  })
})

describe("specialPluginGroup", () => {
  it("collapses auth-* to auth", () => {
    expect(specialPluginGroup("auth-local")).toBe("auth")
  })
  it("collapses upload-* to upload", () => {
    expect(specialPluginGroup("upload-strapi")).toBe("upload")
  })
  it("leaves regular groups unchanged", () => {
    expect(specialPluginGroup("blog")).toBe("blog")
  })
})

describe("specialPluginSlug", () => {
  it("normalizes an auth slug", () => {
    expect(specialPluginSlug("/auth-local/users")).toBe("/auth/users")
  })
  it("normalizes an upload slug", () => {
    expect(specialPluginSlug("/upload-strapi/files")).toBe("/upload/files")
  })
  it("leaves a regular slug unchanged", () => {
    expect(specialPluginSlug("/blog/category")).toBe("/blog/category")
  })
})
