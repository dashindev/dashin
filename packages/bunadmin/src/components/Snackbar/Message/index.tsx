import React, { useState } from "react"
import PropTypes from "prop-types"
import { SnackbarKey, SnackbarMessage, useSnackbar } from "notistack"
import Collapse from "@material-ui/core/Collapse"
import Paper from "@material-ui/core/Paper"
import Typography from "@material-ui/core/Typography"
import Card from "@material-ui/core/Card"
import CardActions from "@material-ui/core/CardActions"
import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import CloseIcon from "@material-ui/icons/Close"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import CheckCircleIcon from "@material-ui/icons/OpenInNew"
import { useStyles } from "./styles"
import { SeverityType } from "@/core/notice/types"
import { useTheme } from "@material-ui/core/styles"
import { useSelector } from "react-redux"
import { selectNotice, toggleNotifyDrawer } from "@/slices/noticeSlice"
import { store } from "@/utils"
import { useTranslation } from "react-i18next"

interface State {
  severity?: SeverityType
  content?: string | null
}

const SnackMessage = React.forwardRef(
  (props: { id: SnackbarKey; message: SnackbarMessage }, ref) => {
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
        style={{
          // theme.bunadmin.iconColor // theme.palette.primary.light
          background: colors[state.severity || "success"],
          transition: "width .2s ease-in-out"
        }}
        className={classes.card}
        ref={ref}
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
              >
                <ExpandMoreIcon />
              </IconButton>
            )}
            <IconButton
              color="inherit"
              className={classes.expand}
              onClick={handleDismiss}
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
              onClick={() => store.dispatch(toggleNotifyDrawer())}
            >
              <CheckCircleIcon className={classes.checkIcon} />
              {t("Open List")}
            </Button>
          </Paper>
        </Collapse>
      </Card>
    )
  }
)

SnackMessage.propTypes = {
  id: PropTypes.number.isRequired
}

export default SnackMessage
