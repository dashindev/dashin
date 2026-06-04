export const DynamicRoute = "/[group]/[name]"
export const DynamicDocRoute = "/docs/[category]/[slug]"

const userPrefix = "/auth"

export const UserRoute = {
  signIn: `${userPrefix}/sign-in`,
  register: `${userPrefix}/register`,
  profile: `${userPrefix}/profile`
}

export const CoreGroupName = "core"

export const LocalDataRoute = {
  leftMenu: `/${CoreGroupName}/left-menu`,
  notice: `/${CoreGroupName}/notice`,
  schema: `/${CoreGroupName}/schema`,
  migration: `/${CoreGroupName}/migration`,
  auth: `/${CoreGroupName}/auth`
}
