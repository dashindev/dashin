import { MenuType, SchemaType } from "@/core"
import { IAuthPlugin, PluginData, SETTING_NAMES, store } from "@/utils"
import { setNestedMenu } from "@/slices/nestedMenuSlice"
import { setSchema } from "@/slices/schemaSlice"
import { Dispatch, SetStateAction } from "react"
import authorization from "@/utils/scripts/authorization"
import { Type } from "@/core/schema/types"
import addResource from "@/utils/scripts/addResource"
import { i18n } from "i18next"
import dxInitData from "../database/dx/dxInitData"
import { BA_DB, BunadminDatabase } from "../database"

type Props = {
  i18n: i18n
  authPlugin: IAuthPlugin
  setIsProtected: Dispatch<SetStateAction<boolean>>
  pluginsData: PluginData[]
  requirePlugin: (path: string) => any
  initialized: boolean
  setInitialized: Dispatch<SetStateAction<boolean>>
  dbOverride?: BunadminDatabase // override database
}

export default async function initData({
  i18n,
  authPlugin,
  setIsProtected,
  pluginsData,
  requirePlugin,
  initialized,
  setInitialized,
  dbOverride
}: Props): Promise<undefined | { menuData: MenuType[] }> {
  const {
    authResponseKey,
    authRequestUrl,
    authRequestMethod,
    authorizationOverwrite
  } = authPlugin

  /**
   * Avoid repeated initialization
   */
  if (initialized) {
    const isLoggedIn = await checkAuth()
    setIsProtected(!isLoggedIn)

    return
  }

  let db = dbOverride ? dbOverride : BA_DB
  /**
   * Init core setting data
   */
  await dxInitData(db)

  /**
   * Init plugins data
   */
  const initPluginsDataRes = await initPluginsData(pluginsData)

  /**
   * Init I18n for plugins
   */
  const setting = db.settings
  const resI18nCode = await setting
    .filter(item => item.name === SETTING_NAMES.i18n_code)
    .first()
  if (resI18nCode) i18n.changeLanguage(resI18nCode.value).then()

  addSources(i18n, pluginsData)

  setInitialized(true)

  const isLoggedIn = await checkAuth()
  setIsProtected(!isLoggedIn)

  if (initPluginsDataRes) {
    // /**
    //  * !!!DEBUG ONLY
    //  * Initialize data after refreshing
    //  */
    // await setting.remove() // !!!DEBUG ONLY

    return { menuData: initPluginsDataRes.menuData }
  }

  async function checkAuth() {
    if (authorizationOverwrite) {
      return await authorizationOverwrite()
    } else {
      return await authorization({
        authResponseKey, // Successful when the response data[key] is not null
        authRequestUrl,
        authRequestMethod
      })
    }
  }

  function addSources(i18n: i18n, pluginsData: PluginData[]) {
    const schemas = pluginsData as SchemaType[]
    schemas.map((item: Type) => ({ ...item }))

    /**
     * Add i18n resource
     */
    let pathObj: any
    schemas.forEach(({ team, group }: SchemaType) => {
      if (!pathObj) pathObj = {}
      if (!group) return
      /**
       * Continue when plugin path added
       */
      if (!pathObj[team + group]) {
        pathObj[team + group] = true
        addResource({ i18n, team, group, requirePlugin })
      }
    })
  }
}

async function initPluginsData(
  pluginsData: PluginData[]
): Promise<undefined | { schemaData: SchemaType[]; menuData: MenuType[] }> {
  /**
   * Set PluginsData
   */
  if (pluginsData) {
    /**
     * handle schemaData, menuData
     */
    const schemaData: SchemaType[] = []
    const menuData: MenuType[] = []
    pluginsData.forEach(data => {
      const item = data as SchemaType & MenuType
      !item.ignore_schema &&
        schemaData.push({
          id: item.id,
          name: item.name,
          label: item.label,
          group: item.group,
          team: item.team,
          customized: item.customized,
          columns: item.columns,
          created_at: Date.now(),
          role: item.role
        })
      // @ts-ignore
      const menuItem: MenuType = item
      !menuItem.ignore_menu &&
        menuData.push({
          id: item.id,
          name: item.name,
          label: item.label,
          slug:
            /**
             * disable onClick when the group is same as the name
             */
            item.group === item.name ? "" : `/${item.group}/${item.name}`,
          parent: menuItem.parent || "",
          rank: menuItem.rank || "0",
          icon_type: menuItem.icon_type,
          icon: menuItem.icon,
          role: menuItem.role
        })
    })
    /**
     * redux setSchema
     */
    store.dispatch(setSchema(schemaData))
    /**
     * redux setNestedMenu
     */
    store.dispatch(setNestedMenu(menuData))

    return { schemaData, menuData }
  }
}
