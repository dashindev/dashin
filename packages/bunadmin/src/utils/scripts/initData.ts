import rxInitData from "@/utils/database/rxInitData"
import { Collection as Setting, SettingNames } from "@/core/setting/collections"
import rxDb from "@/utils/database/rxConnect"
import { Primary as AuthPrimary } from "@/core/auth/schema"
import { ENV } from "@/utils/config"
import { MenuType, SchemaType } from "@/core"
import { BunadminCollection, IAuthPlugin, PluginData, store } from "@/utils"
import { setNestedMenu } from "@/slices/nestedMenuSlice"
import { setSchema } from "@/slices/schemaSlice"
import { Dispatch, SetStateAction } from "react"
import authorization from "@/utils/scripts/authorization"
import initDocsData from "@/utils/database/rxInitData/initDocsData"
import { Type } from "@/core/schema/types"
import addResource from "@/utils/scripts/addResource"
import { i18n } from "i18next"

type Props = {
  i18n: i18n
  authPlugin: IAuthPlugin
  setIsProtected: Dispatch<SetStateAction<boolean>>
  pluginsData: PluginData[]
  requirePlugin: (path: string) => any
  initialized: boolean
  setInitialized: Dispatch<SetStateAction<boolean>>
  collections?: BunadminCollection[] // additional collections
}

export default async function initData({
  i18n,
  authPlugin,
  setIsProtected,
  pluginsData,
  requirePlugin,
  initialized,
  setInitialized,
  collections
}: Props): Promise<undefined | { menuData: MenuType[] }> {
  const {
    authResponseKey,
    authRequestUrl,
    authRequestMethod,
    authorizationOverwrite
  } = authPlugin

  /**
   * Authenticate the current user, fail to execute redirect
   */
  let isVerified: boolean
  if (authorizationOverwrite) {
    isVerified = await authorizationOverwrite()
  } else {
    isVerified = await authorization({
      authResponseKey, // Successful when the response data[key] is not null
      authRequestUrl,
      authRequestMethod
    })
  }

  setIsProtected(!isVerified)

  /**
   * Avoid repeated initialization
   */
  if (initialized) return

  let db = await rxDb(collections)

  /**
   * Init core setting data
   */
  db = await rxInitData({
    db,
    collection: Setting.name,
    name: SettingNames.init_status,
    collections,
    initFunc: () =>
      initDocsData({
        db,
        collection: Setting.name,
        docsData: [
          {
            name: SettingNames.i18n_code,
            value: ENV.I18N_CODE
          },
          {
            name: AuthPrimary, // username
            value: undefined
          },
          {
            name: SettingNames.role,
            value: undefined
          },
          {
            name: SettingNames.site_name,
            value: undefined
          },
          {
            name: SettingNames.theme,
            value: undefined
          }
        ]
      })
  })

  /**
   * Init plugins data
   */
  const initPluginsDataRes = await initPluginsData(pluginsData)

  /**
   * Init I18n for plugins
   */
  const setting = db[Setting.name]
  const resI18nCode = await setting
    .findOne({ selector: { name: { $eq: SettingNames.i18n_code } } })
    .exec()
  if (resI18nCode) i18n.changeLanguage(resI18nCode.value).then()

  addSources(i18n, pluginsData)

  setInitialized(true)

  if (initPluginsDataRes) {
    // /**
    //  * !!!DEBUG ONLY
    //  * Initialize data after refreshing
    //  */
    // await setting.remove() // !!!DEBUG ONLY

    return { menuData: initPluginsDataRes.menuData }
  }

  function addSources(i18n: i18n, pluginsData: PluginData[]) {
    const schemas = pluginsData as SchemaType[]
    schemas.map((item: Type) => ({ ...item }))

    /**
     * Add i18n resource
     */
    let pathObj: any
    schemas.map(({ team, group }: SchemaType) => {
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
    pluginsData.map(data => {
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
