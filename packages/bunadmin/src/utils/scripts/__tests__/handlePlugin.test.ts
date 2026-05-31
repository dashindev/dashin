import { describe, it, expect } from "vitest"
import {
  handlePluginPath,
  specialPluginGroup,
  specialPluginSlug
} from "../handlePlugin"

describe("handlePluginPath", () => {
  it("maps a regular plugin to bunadmin-plugin-[group]/[name]", () => {
    expect(
      handlePluginPath({ team: "bunadmin", group: "blog", name: "category" })
    ).toBe("bunadmin-plugin-blog/category")
  })

  it("maps an auth plugin to bunadmin-auth-[group]/[name]", () => {
    expect(
      handlePluginPath({ team: "buncms", group: "auth-buncms", name: "users" })
    ).toBe("bunadmin-auth-buncms/users")
  })

  it("maps an upload plugin to bunadmin-upload-[group]/[name]", () => {
    expect(
      handlePluginPath({
        team: "buncms",
        group: "upload-buncms",
        name: "files"
      })
    ).toBe("bunadmin-upload-buncms/files")
  })
})

describe("specialPluginGroup", () => {
  it("collapses auth-* to auth", () => {
    expect(specialPluginGroup("auth-buncms")).toBe("auth")
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
    expect(specialPluginSlug("/auth-buncms/users")).toBe("/auth/users")
  })
  it("normalizes an upload slug", () => {
    expect(specialPluginSlug("/upload-strapi/files")).toBe("/upload/files")
  })
  it("leaves a regular slug unchanged", () => {
    expect(specialPluginSlug("/blog/category")).toBe("/blog/category")
  })
})
