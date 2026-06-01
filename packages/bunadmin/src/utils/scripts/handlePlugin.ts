/**
 * Handle plugin path → dynamic import path (matches the plugin package basename).
 * special (auth/upload): @dashin-dev/auth-local → "auth-local/[name]"
 * regular custom plugin:  dashin-plugin-[team]-[group] → "dashin-plugin-[team]-[group]/[name]"
 */
export function handlePluginPath({
  team,
  group,
  name
}: {
  team: string
  group: string
  name: string
}): string {
  const isSpecialPlugin = RegExp(".*-auth|.*-upload").test(`${team}-${group}`)

  if (isSpecialPlugin) {
    // dynamic folder = package basename, e.g. "auth-local", "upload-strapi"
    return `${group}/${name}`
  }

  // custom plugin package basename: dashin-plugin-[team]-[group]
  return `dashin-plugin-${team}-${group}/${name}`
}

/**
 * Handle special group, remove [team]
 * [slug plugin]-[team] -> [slug plugin]
 * @param group
 */
export function specialPluginGroup(group: string): string {
  group = group.replace(/^auth-.*/g, "auth")
  group = group.replace(/^upload-.*/g, "upload")

  return group
}

/**
 * Handle special slug, remove [team]
 * /[slug plugin]-[team]/[name] -> /[slug plugin]/[name]
 * @param slug
 */
export function specialPluginSlug(slug: string): string {
  slug = slug.replace(/^\/auth-.*\/.*?/, "/auth/")
  slug = slug.replace(/^\/upload-.*\/.*?/, "/upload/")

  return slug
}
