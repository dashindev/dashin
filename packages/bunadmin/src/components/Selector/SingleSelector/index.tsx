import React from "react"
import { Theme } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import { Column, EditComponentProps } from "material-table"
import { store } from "@/utils"
import { selectTable, setTable, TableFilter } from "@/slices/tableSlice"
import { useSelector } from "react-redux"

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 100
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
}))

type Props<RowData extends object> = {
  columnDef: Column<RowData>
  // filterComponent
  filterProps?: {
    toLowerCase?: boolean
    replaceSpace?: boolean // replace ' ' with '_'
    onFilterChanged?: (rowId: string, value: any) => void
    onFilterField?: string
  }
  // editComponent
  editProps?: EditComponentProps<any>
}

export default function SingleSelector<RowData extends object>(
  props: Props<RowData>
) {
  const table = useSelector(selectTable)
  const classes = useStyles()

  const { columnDef, filterProps = {}, editProps } = props
  const {
    toLowerCase,
    replaceSpace,
    onFilterChanged,
    onFilterField
  } = filterProps

  let defaultName = ""
  if (editProps && columnDef.field) {
    const { rowData } = editProps
    if (rowData[columnDef.field]) defaultName = rowData[columnDef.field].id
  }
  const [selectedName, setSelectedName] = React.useState<string>(defaultName)

  let names: string[] = []
  let keys: string[] = []

  if (columnDef.lookup) names = Object.values(columnDef.lookup)
  if (columnDef.lookup) keys = Object.keys(columnDef.lookup)

  const handleChange = async (event: SelectChangeEvent<string>) => {
    const selValue = event.target.value as string
    setSelectedName(selValue)

    // Insert to MUI Table Field
    if (editProps && columnDef.field) {
      const { rowData } = editProps

      editProps.onChange(selValue)
      editProps.onRowDataChange({ ...rowData, [columnDef.field]: selValue })
      return
    }

    let newValue = selValue
    if (toLowerCase) newValue = newValue.toLowerCase()
    if (replaceSpace) newValue = newValue.replace(/ /g, "_")

    if (onFilterField) {
      const newFilters: TableFilter[] = []

      if (table.filters.length > 0) {
        table.filters.map((item: TableFilter) => {
          if (item.column?.field === columnDef?.field) {
            newFilters.push({
              ...item,
              filterField: onFilterField,
              filterOperator: ""
            })
          } else {
            newFilters.push(item)
          }
        })
      } else {
        newFilters.push({
          column: {
            field: columnDef?.field
          },
          filterField: onFilterField,
          filterOperator: ""
        })
      }

      store.dispatch(
        setTable({
          ...table,
          filters: newFilters
        })
      )
    }

    // callback onFilterChanged function
    if (columnDef && onFilterChanged) {
      onFilterChanged(
        // @ts-ignore
        columnDef.tableData.id,
        newValue
      )
    }
  }

  return (
    <div>
      <FormControl className={classes.formControl}>
        <Select
          labelId="single-selector-label"
          id="single-selector"
          value={selectedName}
          onChange={e => handleChange(e)}
        >
          {names.map((name, i) => (
            <MenuItem key={name} value={keys[i]}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
