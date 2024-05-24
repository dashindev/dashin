import React from "react"
import { createStyles, Theme } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import Input from "@mui/material/Input"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import ListItemText from "@mui/material/ListItemText"
import Checkbox from "@mui/material/Checkbox"
import { Column } from "material-table"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      maxWidth: 200
    },
    chips: {
      display: "flex",
      flexWrap: "wrap"
    },
    chip: {
      margin: 2
    },
    noLabel: {
      marginTop: theme.spacing(3)
    }
  })
)

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

type Props = {
  columnDef?: Column<any>
  onFilterChanged?: (rowId: string, value: any) => void
  valueToLowerCase?: boolean
  valueReplaceSpaces?: boolean
}

export default function MultipleSelector(props: Props) {
  const classes = useStyles()
  const [selectedName, setSelectedName] = React.useState<string[]>([])

  const {
    columnDef,
    onFilterChanged,
    valueToLowerCase = true,
    valueReplaceSpaces = true
  } = props
  let names: string[] = []

  if (columnDef) {
    if (columnDef.lookup) names = Object.values(columnDef.lookup)
  }

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedValues = event.target.value as string[]
    setSelectedName(selectedValues)

    // callback onFilterChanged function
    if (columnDef && onFilterChanged) {
      const replacedValues: string[] = []
      selectedValues.map(v => {
        // lowercase and space to _
        if (valueToLowerCase) v.toLowerCase()
        if (valueReplaceSpaces) v = v.replace(/ /g, "_")
        replacedValues.push(v)
      })
      const rowId =
        // @ts-ignore
        (columnDef && columnDef.tableData && columnDef.tableData.id) || ""
      onFilterChanged(rowId, replacedValues)
    }
  }

  return (
    <div>
      <FormControl className={classes.formControl}>
        <Select
          labelId="demo-mutiple-checkbox-label"
          id="demo-mutiple-checkbox"
          multiple
          value={selectedName}
          onChange={handleChange}
          input={<Input />}
          renderValue={selected => (selected as string[]).join(", ")}
          MenuProps={MenuProps}
        >
          {names.map(name => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={selectedName.indexOf(name) > -1} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
