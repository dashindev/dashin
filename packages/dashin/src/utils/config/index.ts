function strToArr(str?: string) {
  if (!str) return []
  return str.split(/[ ,]+/)
}

export const DEFAULT_AUTH_PLUGIN = "@dashin-dev/auth-local"

type EnvTypes = {
  SITE_NAME: string
  AUTH_PLUGIN: string
  MAIN_URL?: string
  AUTH_URL?: string
  UPLOAD_URL?: string
  FILE_PREVIEW_URL?: string
  SITE_URLS: string[]
  DB_NAME: string
  DB_VERSION: string
  ON_I18N: boolean
  ON_SETTING: boolean
  ON_DOC: boolean
  I18N_CODE: string
  ON_MOCK: boolean
  REACT_APP_IGNORED_PLUGINS: string[]
  PATHS_WITHOUT_LAYOUT: string[]
  PATHS_WITHOUT_AUTH: string[]
  NOTIFICATION_PLUGIN?: string
  ON_NOTIFICATION_INTERVAL_COUNT: boolean
  // Connector config (read by source-* plugins)
  SUPABASE_KEY?: string
  APPWRITE_PROJECT?: string
  APPWRITE_DATABASE?: string
}

// VITE_* env. Read via process.env so this file also compiles to CJS lib/
// (Vite's `define` statically replaces process.env.VITE_* at build/dev).
const v = (key: string): string | undefined =>
  (process.env as any)[`VITE_${key}`]

export const ENV: EnvTypes = {
  SITE_NAME: v("SITE_NAME") || "Dashin",
  AUTH_PLUGIN: v("AUTH_PLUGIN") || DEFAULT_AUTH_PLUGIN,
  MAIN_URL: v("MAIN_URL"),
  AUTH_URL: v("AUTH_URL") || v("MAIN_URL"),
  UPLOAD_URL: v("UPLOAD_URL") || v("AUTH_URL") || v("MAIN_URL"),
  FILE_PREVIEW_URL: v("FILE_PREVIEW_URL"),
  SITE_URLS: strToArr(v("SITE_URLS")),
  DB_NAME: v("DB_NAME") || "DashinDatabase",
  DB_VERSION: v("DB_VERSION") || "1",
  ON_I18N: v("ON_I18N") === "true",
  ON_SETTING: v("ON_SETTING") === "true",
  ON_DOC: v("ON_DOC") === "true",
  I18N_CODE: v("I18N_CODE") || "en",
  ON_MOCK: v("ON_MOCK") === "true",
  REACT_APP_IGNORED_PLUGINS: strToArr(v("IGNORED_PLUGINS")),
  PATHS_WITHOUT_LAYOUT: strToArr(v("PATHS_WITHOUT_LAYOUT")),
  PATHS_WITHOUT_AUTH: strToArr(v("PATHS_WITHOUT_AUTH")),
  NOTIFICATION_PLUGIN: v("NOTIFICATION_PLUGIN"),
  ON_NOTIFICATION_INTERVAL_COUNT:
    v("OFF_NOTIFICATION_INTERVAL_COUNT") === "true",
  // Connector config
  SUPABASE_KEY: v("SUPABASE_KEY") || v("SUPABASE_ANON_KEY"),
  APPWRITE_PROJECT: v("APPWRITE_PROJECT") || v("PROJECT_ID"),
  APPWRITE_DATABASE: v("APPWRITE_DATABASE") || v("DATABASE_ID")
}

export const SETTING_NAMES = {
  i18n_code: "i18n_code",
  site_name: "site_name",
  theme: "theme",
  role: "role",
  init_status: "init_status"
  // others: init_{team}_{name}, {username}(AuthPrimary)
}
