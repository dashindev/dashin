import React, { useState } from "react"
import { EnhancedStore, AnyAction } from "@reduxjs/toolkit"
import { ThunkMiddlewareFor } from "@reduxjs/toolkit/src/getDefaultMiddleware"
import PropTypes from "prop-types"
import { SnackbarKey, SnackbarMessage, useSnackbar } from "notistack"
import Collapse from "@mui/material/Collapse"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import CheckCircleIcon from "@mui/icons-material/OpenInNew"
import { useStyles } from "./styles"
import { SeverityType } from "@/core/notice/types"
import { useTheme } from "@mui/material/styles"
import { useSelector } from "react-redux"
import { selectNotice, toggleNotifyDrawer } from "@/slices/noticeSlice"
import { useTranslation } from "react-i18next"

interface State {
  severity?: SeverityType
  content?: string | null
}

type Props = {
  store: EnhancedStore<any, AnyAction, [ThunkMiddlewareFor<any>]>
  id: SnackbarKey
  message: SnackbarMessage
}

const SnackMessage = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { t } = useTranslation()
  const notice = useSelector(selectNotice)

  const theme = useTheme()
  const classes = useStyles()
  const { closeSnackbar } = useSnackbar()
  const [expanded, setExpanded] = useState(false)
  const [state, setState] = useState<State>({})

  const colors = {
    none: null,
    success: `linear-gradient(45deg, ${theme.palette.success.light} 30%, rgba(200, 200, 200, 0.88) 125%)`,
    error: `linear-gradient(45deg, ${theme.palette.error.light} 30%, rgba(200, 200, 200, 0.88) 125%)`,
    warning: `linear-gradient(45deg, ${theme.palette.warning.light} 30%, rgba(200, 200, 200, 0.88) 125%)`,
    info: `linear-gradient(45deg, ${theme.palette.info.light} 30%, rgba(200, 200, 200, 0.88) 125%)`
  }

  React.useEffect(() => {
    setState({
      severity: notice.severity || "success",
      content: notice.content
    })
  }, [notice])

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  const handleDismiss = () => {
    closeSnackbar(props.id)
  }

  return (
    <Card
      ref={ref}
      component="div"
      style={{
        // theme.bunadmin.iconColor // theme.palette.primary.light
        background: colors[state.severity || "success"],
        transition: "width .2s ease-in-out"
      }}
      className={classes.card}
    >
      <CardActions classes={{ root: classes.actionRoot }}>
        <Typography variant="subtitle2" className={classes.typography}>
          {props.message}
        </Typography>
        <div className={classes.icons}>
          {state.content && (
            <IconButton
              aria-label="Show more"
              color="inherit"
              className={
                expanded
                  ? `${classes.expand} ${classes.expandOpen}`
                  : classes.expand
              }
              onClick={handleExpandClick}
              size="large"
            >
              <ExpandMoreIcon />
            </IconButton>
          )}
          <IconButton
            color="inherit"
            className={classes.expand}
            onClick={handleDismiss}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </div>
      </CardActions>
      <Collapse
        in={expanded}
        timeout="auto"
        unmountOnExit
        addEndListener={undefined}
      >
        <Paper className={classes.collapse}>
          <Typography gutterBottom>{state.content}</Typography>
          <Button
            size="small"
            className={classes.button}
            onClick={() => props.store.dispatch(toggleNotifyDrawer())}
          >
            <CheckCircleIcon className={classes.checkIcon} />
            {t("Open List")}
          </Button>
        </Paper>
      </Collapse>
    </Card>
  )
})

export default SnackMessage
