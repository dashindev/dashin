import React, { useState } from "react"
import { Theme, createStyles } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
import Typography from "@mui/material/Typography"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { AccordionActions, IconButton, Paper, Button } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Clear"
import SortIcon from "@mui/icons-material/DragHandle"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%"
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: "33.33%",
      flexShrink: 0
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary
    },
    item: {
      position: "relative"
    },
    actions: {
      position: "absolute",
      right: theme.spacing(5),
      top: theme.spacing(0),
      zIndex: theme.zIndex.drawer - 1,
      minHeight: theme.spacing(6),
      transition: "min-height 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
    },
    actions_expanded: {
      minHeight: theme.spacing(8)
    },
    addNewItem: {
      marginTop: 1,
      paddingTop: theme.spacing(2),
      backgroundColor: "#FFF"
    }
  })
)

export type RepeaterDetailProps<T> = T & { index: number }

interface RepeaterProps<T> {
  data: any[]
  title?: string // item title or
  titleKey?: string // key of item title, if existed will overwrite title
  summary?: string // item summary
  summaryKey?: string // key of item summary, if existed will overwrite summary
  detail(props: RepeaterDetailProps<T>, index: number): JSX.Element
  deletable?: boolean
  onCreate?: () => void
  onDelete?: (i: number) => number
  sortable?: boolean
}

export default function Repeater({
  data,
  title,
  titleKey,
  summary,
  summaryKey,
  detail,
  deletable = true,
  sortable = false,
  onCreate,
  onDelete
}: RepeaterProps<any>) {
  const classes = useStyles()
  const [expanded, setExpanded] = useState<number | false>(false)

  const handleChange = (panel: number) => (
    _event: React.ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false)
  }

  return (
    <div className={classes.root}>
      {data.map((item = {}, i) => (
        <Paper key={i} className={classes.item}>
          <AccordionActions
            className={
              expanded === i
                ? `${classes.actions} ${classes.actions_expanded}`
                : classes.actions
            }
          >
            {deletable && (
              <IconButton
                size="small"
                aria-label="delete"
                onClick={() => {
                  if (!onDelete) return
                  const deletedI = onDelete(i)
                  if (!expanded) return
                  if (deletedI < expanded) {
                    setExpanded(expanded - 1)
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
            {sortable && (
              <IconButton size="small" aria-label="sort">
                <SortIcon fontSize="small" />
              </IconButton>
            )}
          </AccordionActions>
          <Accordion expanded={expanded === i} onChange={handleChange(i)}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1bh-content"
              id="panel1bh-header"
            >
              <Typography className={classes.heading}>
                {titleKey
                  ? handleKeyPoints(item, titleKey) || title || i + 1
                  : title || i + 1}
              </Typography>
              <Typography className={classes.secondaryHeading}>
                {(summaryKey && handleKeyPoints(item, summaryKey)) || summary}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>{detail({ ...item }, i)}</AccordionDetails>
          </Accordion>
        </Paper>
      ))}
      <Button
        className={classes.addNewItem}
        fullWidth={true}
        color="primary"
        onClick={() => {
          if (!onCreate) return
          onCreate()
          setExpanded(data.length)
        }}
      >
        ADD NEW ITEM
      </Button>
    </div>
  )

  function handleKeyPoints(obj: any, k: string): string | undefined {
    if (k.indexOf(".") < 1 && obj[k] === "string") return obj[k]

    let subObj: any = obj
    const keys = k.split(".")

    for (let i = 0; i < keys.length; i++) {
      const tmpKey = keys[i]
      subObj = subObj[tmpKey]

      if (!subObj) return

      if (typeof subObj === "string") return subObj
    }
  }
}
