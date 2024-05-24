function strToArr(str?: string) {
  if (!str) return []
  return str.split(/[ ,]+/);
}

export const DEFAULT_AUTH_PLUGIN = "@xbuilder/bunadmin-auth-buncms"

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
}

export const ENV: EnvTypes = {
  SITE_NAME:
    process.env.REACT_APP_SITE_NAME ||
    process.env.NEXT_PUBLIC_SITE_NAME ||
    "BunAdmin",
  AUTH_PLUGIN:
    process.env.REACT_APP_AUTH_PLUGIN ||
    process.env.NEXT_PUBLIC_AUTH_PLUGIN ||
    DEFAULT_AUTH_PLUGIN,
  MAIN_URL: process.env.REACT_APP_MAIN_URL || process.env.NEXT_PUBLIC_MAIN_URL,
  AUTH_URL:
    process.env.REACT_APP_AUTH_URL ||
    process.env.REACT_APP_MAIN_URL ||
    process.env.NEXT_PUBLIC_AUTH_URL ||
    process.env.NEXT_PUBLIC_MAIN_URL,
  UPLOAD_URL:
    process.env.REACT_APP_UPLOAD_URL ||
    process.env.REACT_APP_AUTH_URL ||
    process.env.REACT_APP_MAIN_URL ||
    process.env.NEXT_PUBLIC_UPLOAD_URL ||
    process.env.NEXT_PUBLIC_AUTH_URL ||
    process.env.NEXT_PUBLIC_MAIN_URL,
  FILE_PREVIEW_URL:
    process.env.REACT_APP_FILE_PREVIEW_URL ||
    process.env.NEXT_PUBLIC_FILE_PREVIEW_URL,
  SITE_URLS:
    strToArr(process.env.REACT_APP_SITE_URLS) ||
    strToArr(process.env.NEXT_PUBLIC_SITE_URLS),
  DB_NAME:
    process.env.REACT_APP_DB_NAME ||
    process.env.NEXT_PUBLIC_DB_NAME ||
    "BunadminDatabase",
  DB_VERSION:
    process.env.REACT_APP_DB_VERSION ||
    process.env.NEXT_PUBLIC_DB_VERSION ||
    "BunadminDatabase",
  ON_I18N:
    process.env.REACT_APP_ON_I18N === "true" ||
    process.env.NEXT_PUBLIC_ON_I18N === "true" ||
    false,
  ON_SETTING:
    process.env.REACT_APP_ON_SETTING === "true" ||
    process.env.NEXT_PUBLIC_ON_SETTING === "true" ||
    false,
  ON_DOC:
    process.env.REACT_APP_ON_DOC === "true" ||
    process.env.NEXT_PUBLIC_ON_DOC === "true" ||
    false,
  I18N_CODE:
    process.env.REACT_APP_I18N_CODE ||
    process.env.NEXT_PUBLIC_I18N_CODE ||
    "en",
  ON_MOCK:
    process.env.REACT_APP_ON_MOCK === "true" ||
    process.env.NEXT_PUBLIC_ON_MOCK === "true" ||
    false,
  REACT_APP_IGNORED_PLUGINS:
    strToArr(process.env.REACT_APP_IGNORED_PLUGINS) ||
    strToArr(process.env.NEXT_PUBLIC_IGNORED_PLUGINS),
  PATHS_WITHOUT_LAYOUT:
    strToArr(process.env.REACT_APP_PATHS_WITHOUT_LAYOUT) ||
    strToArr(process.env.NEXT_PUBLIC_PATHS_WITHOUT_LAYOUT),
  PATHS_WITHOUT_AUTH:
    strToArr(process.env.REACT_APP_PATHS_WITHOUT_AUTH) ||
    strToArr(process.env.NEXT_PUBLIC_PATHS_WITHOUT_AUTH),
  NOTIFICATION_PLUGIN:
    process.env.REACT_APP_NOTIFICATION_PLUGIN ||
    process.env.NEXT_PUBLIC_NOTIFICATION_PLUGIN,
  ON_NOTIFICATION_INTERVAL_COUNT:
    process.env.REACT_APP_OFF_NOTIFICATION_INTERVAL_COUNT === "true" ||
    process.env.NEXT_PUBLIC_OFF_NOTIFICATION_INTERVAL_COUNT === "true" ||
    false
}

export const SETTING_NAMES = {
  i18n_code: "i18n_code",
  site_name: "site_name",
  theme: "theme",
  role: "role",
  init_status: "init_status"
  // others: init_{team}_{name}, {username}(AuthPrimary)
}
