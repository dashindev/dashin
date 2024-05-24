import React, { Dispatch } from "react"
import Paper from "@mui/material/Paper"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Divider from "@mui/material/Divider"
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
