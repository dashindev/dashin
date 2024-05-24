import { createStyles, Theme } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120
    },
    selectEmpty: {
      marginTop: theme.spacing(5)
    }
  })
)
