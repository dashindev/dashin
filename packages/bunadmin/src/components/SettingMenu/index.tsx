import React from "react"
import { Theme, createStyles, useTheme } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Collapse from "@mui/material/Collapse"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import EvaIcon from "react-eva-icons"
import { settingMenus } from "@/utils/config/settingMenus"
import { useRouter } from "@/router"
import { DynamicRoute } from "@/utils/routes"
import { useTranslation } from "react-i18next"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper
    },
    nested: {
      paddingLeft: theme.spacing(4),
      transition: "padding-left 0.5s ease"
    },
    expandIcon: {
      color: theme.bunadmin.iconColor
    }
  })
)

export default function SettingMenu() {
  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()
  const { group: qGroup, name: qName } = router.query
  const classes = useStyles()
  const [open, setOpen] = React.useState(true)

  const handleClick = () => {
    setOpen(!open)
  }

  const handleRoute = ({ route }: { route: string }) => {
    router.push(DynamicRoute, route)
  }

  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      className={classes.root}
    >
      <ListItem button onClick={handleClick}>
        <ListItemIcon>
          <EvaIcon
            name="settings-outline"
            size="large"
            fill={theme.bunadmin.iconColor}
          />
        </ListItemIcon>
        <ListItemText primary={t("Setting")} />
        {open ? (
          <ExpandLess fontSize="small" className={classes.expandIcon} />
        ) : (
          <ExpandMore fontSize="small" className={classes.expandIcon} />
        )}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {settingMenus({ theme }).map((item, index) => (
            <ListItem
              key={index}
              button
              selected={item.route === `/${qGroup}/${qName}`}
              className={classes.nested}
              onClick={() => handleRoute({ route: item.route })}
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText primary={t(item.name)} />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </List>
  )
}
