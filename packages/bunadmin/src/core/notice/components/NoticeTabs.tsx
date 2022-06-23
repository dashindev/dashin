import React, { Dispatch } from "react"
import Paper from "@material-ui/core/Paper"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import Divider from "@material-ui/core/Divider"
import { TFunction } from "i18next"

export default function NoticeTabs({
  t,
  tab,
  setTab
}: {
  t: TFunction
  tab: number
  setTab: Dispatch<number>
}) {
  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue)
  }

  return (
    <Paper square>
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
        aria-label="core notice tabs"
      >
        <Tab label={<>{t("Local Notices")}</>} />
        <Tab label={<>{t("Online Notifications")}</>} />
      </Tabs>
      <Divider />
    </Paper>
  )
}
