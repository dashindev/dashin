import React, { useEffect, useState } from "react"
import { Theme, createStyles } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Collapse from "@mui/material/Collapse"
import { Type } from "@/core/menu/types"
import MenuIcon from "./MenuIcon"
import { useRouter } from "@/router"
import { DynamicRoute, DynamicDocRoute } from "@/utils/routes"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import { useTranslation } from "react-i18next"
import { SETTING_NAMES, specialPluginSlug } from "@/utils"
import { BA_DB } from "@/utils/database"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
      padding: 0
    },
    nested: {
      paddingLeft: theme.spacing(5),
      transition: "padding-left 0.5s ease"
    },
    expandIcon: {
      color: theme.bunadmin.iconColor
    }
  })
)

interface Props {
  data: Type[]
}

export default function NestedList({ data }: Props): any {
  const { t } = useTranslation("plugins")
  const router = useRouter()
  let { group: qGroup = "", name: qName } = router.query
  const classes = useStyles()
  const [open, setOpen] = useState({} as { [key: string]: boolean })
  const [currentRole, setCurrentRole] = useState("")
  const [parentMenus, setParentMenus] = useState<string[]>([])
  const [selectedRootName, setSelectedRootName] = useState<string>()

  if (router.route === DynamicDocRoute) {
    qGroup = "docs/" + router.query.category
    qName = router.query.slug
  }

  useEffect(() => {
    // set default opened parent
    if (typeof qGroup === "object") return
    const parent = qGroup.replace("docs/", "")
    handleOpen({ name: parent })
    ;(async () => {
      // query role from bunadmin_setting
      const db = BA_DB
      const settingRes = await db.settings
        .where("name")
        .equals(SETTING_NAMES.role)
        .first()
      const role = (settingRes && settingRes.value) || ""
      setCurrentRole(role)
    })()
    // mapping menu data
    const parentTmp: string[] = []
    data.map(item => {
      if (item.parent && item.parent !== "" && !parentTmp.includes(item.parent))
        parentTmp.push(item.parent)
    })
    setParentMenus(parentTmp)

    // Open the root menu of the selected submenu
    if (selectedRootName) {
      setOpen({
        ...open,
        [selectedRootName]: true
      })
    }
  }, [])

  const handleOpen = ({ name }: { name: string }) => {
    setOpen({
      ...open,
      [name]: !open[name]
    })
  }

  const handleClick = ({ name, slug }: { name: string; slug?: string }) => {
    if (parentMenus.includes(name)) {
      return handleOpen({ name })
    }

    if (slug !== undefined && slug !== "") {
      const isUrl = new RegExp("^http.*").test(slug)

      if (!isUrl) {
        if (router.route === DynamicDocRoute) {
          return router.push(DynamicDocRoute, slug)
        }

        router.push(DynamicRoute, slug)
      } else {
        router.push(slug)
      }
    } else {
      handleOpen({ name })
    }
  }

  if (data.length === 0) return null

  // sorting
  data = [...data]
  data = data.sort(function(a, b) {
    return Number(b.rank) - Number(a.rank)
  })

  // handing role
  function isAllowedRole(currentRole: string, allowedRole: string): boolean {
    const currentRoles: string[] = currentRole.split(",")
    const allowedRoles: string[] = allowedRole.split(",")

    for (let i = 0; i < currentRoles.length; i++) {
      // both are Array
      if (allowedRoles.includes(currentRoles[i])) return true
      // currentRole is Array, allowedRole is String
      if (allowedRole === currentRoles[i]) return true
    }

    // currentRole is String, allowedRole is Array
    if (allowedRoles.includes(currentRole)) return true

    // both are String
    if (allowedRole && allowedRole !== currentRole) return false

    return false
  }

  return (
    <>
      {data
        .filter(item => item.parent === "")
        .map(item => {
          const { name, label, icon, icon_type, role } = item

          // Check the role
          if (role && !isAllowedRole(currentRole, role)) return null

          let { slug } = item
          if (slug) slug = specialPluginSlug(slug)

          return (
            <List key={name} component="nav" className={classes.root}>
              <ListItem
                button
                selected={slug === `/${qGroup}/${qName}`}
                onClick={() => handleClick({ name, slug })}
              >
                <ListItemIcon>
                  <MenuIcon name={name} icon={icon} icon_type={icon_type} />
                </ListItemIcon>
                <ListItemText primary={t(label || name)} />
                {/* Expand Icon */}
                {data.filter(item => item.parent === name).length > 0 &&
                  (open[name] ? (
                    <ExpandLess
                      fontSize="small"
                      className={classes.expandIcon}
                    />
                  ) : (
                    <ExpandMore
                      fontSize="small"
                      className={classes.expandIcon}
                    />
                  ))}
              </ListItem>
              {/* Collapse */}
              <Collapse in={open[name]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {/* Submenus */}
                  {data
                    .filter(item => item.parent === name)
                    .map(item => {
                      const { name, label, parent } = item
                      let { slug } = item
                      if (slug) slug = specialPluginSlug(slug)
                      const isSelected = slug === `/${qGroup}/${qName}`

                      if (isSelected && !selectedRootName)
                        setSelectedRootName(parent)

                      return (
                        <ListItem
                          key={name}
                          button
                          className={classes.nested}
                          selected={isSelected}
                          onClick={() => handleClick({ name, slug })}
                        >
                          <ListItemText primary={t(label || name)} />
                        </ListItem>
                      )
                    })}
                </List>
              </Collapse>
            </List>
          )
        })}
    </>
  )
}
