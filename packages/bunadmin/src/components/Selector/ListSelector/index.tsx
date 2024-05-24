import React, { useState } from "react"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/lab/Autocomplete"
import CircularProgress from "@mui/material/CircularProgress"
import { Column, EditComponentProps, Query } from "material-table"
import { notice } from "@/core"

interface OptionType {
  id: string
  name: string
}

export type ListSelectorOnSelectProps = {
  selected: any
  options: OptionType[]
  index?: number
}

type Props = {
  columnDef: Column<any>
  // filterComponent
  filterProps?: {
    toLowerCase?: boolean
    replaceSpace?: boolean // replace ' ' with '_'
    onFilterChanged?: (rowId: string, value: any) => void
    onFilterField?: string
  }
  // editComponent
  editProps?: EditComponentProps<any>
  // ListSelector Props
  index?: number
  multiple?: boolean
  variant?: "filled" | "outlined" | "standard"
  defaultSelected?: any
  width?: number | string
  label?: string
  querySer: (query: Query<any>) => Promise<any>
  dataField?: string
  optionField?: string
  onSelect?: ({ selected, options, index }: ListSelectorOnSelectProps) => void
}

export function ListSelector({
  columnDef,
  editProps,
  index,
  multiple,
  variant,
  defaultSelected,
  width = "100%",
  label,
  querySer,
  dataField,
  optionField,
  onSelect
}: Props) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<OptionType[]>([])
  const [search, setSearch] = React.useState("")
  const loading = open && options.length === 0

  let rowData = []
  if (editProps) {
    rowData = editProps.rowData
  }

  let resField = dataField ? dataField : columnDef.field || "id"

  if (!defaultSelected && resField && rowData[resField]) {
    defaultSelected = rowData[resField]
  }

  const [selected, setSelected] = useState(defaultSelected)

  React.useEffect(() => {
    if (!loading) return undefined
    ;(async () => {
      await queryOptions()
    })()
  }, [loading])

  React.useEffect(() => {
    if (!open) setOptions([])
  }, [open])

  return (
    <Autocomplete
      id={`list-selector-${dataField}${index}`}
      style={{ width }}
      multiple={multiple}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onChange={handleSelect}
      isOptionEqualToValue={option => option.id === (selected && selected.id)}
      getOptionLabel={getOptionLabel}
      value={selected}
      options={options}
      loading={loading}
      renderInput={params => (
        <TextField
          {...params}
          label={label || undefined}
          variant={variant}
          onChange={handleSearch}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            )
          }}
        />
      )}
    />
  );

  function getOptionLabel(option: any) {
    if (!option) return undefined

    return optionField ? option[optionField] : option.name
  }

  async function queryOptions() {
    const { data: remoteData, errors } = await querySer({
      search: search,
      page: 0,
      pageSize: 30
    } as Query<any>)

    if (errors) {
      return await notice({
        title: "Fetch error",
        severity: "error",
        content: JSON.stringify(errors)
      })
    }

    let tmpArr: any[] = remoteData

    if (columnDef.field) {
      if (remoteData && remoteData[columnDef.field])
        tmpArr = remoteData[columnDef.field]
    }

    const options: OptionType[] = []
    tmpArr.map(item => {
      const nameObj = optionField
        ? { [optionField.toString()]: item[optionField].toString() }
        : { name: item.name }
      options.push({ id: item.id.toString(), name: "", ...nameObj })
    })

    setOptions(options)
  }

  async function handleSearch(e: {
    target: { value: React.SetStateAction<string> }
  }) {
    setSearch(e.target.value)
    await queryOptions()
  }

  async function handleSelect(_e: React.ChangeEvent<{}>, value: any) {
    setSelected(value)
    if (onSelect) {
      onSelect({ selected: value, options, index })
    }

    if (!multiple) {
      value = value ? value.id : null
    }

    if (!editProps || !columnDef.field) return

    editProps.onChange(value)
    editProps.onRowDataChange({
      ...editProps.rowData,
      [columnDef.field]: value
    })
  }
}
