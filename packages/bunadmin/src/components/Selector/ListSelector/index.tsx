import React, { useState } from "react"
import { Combobox } from "@headlessui/react"
import { Column, EditComponentProps, Query } from "@/components/Table/models/material-table-shim"
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

  const inputClass = (() => {
    switch (variant) {
      case "outlined":
        return "rounded border border-bn-border px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
      case "filled":
        return "rounded-t border-b border-bn-border bg-content-bg px-3 py-2 focus:border-primary"
      default:
        return "border-b border-bn-border bg-transparent py-2 focus:border-primary"
    }
  })()

  const displayValue = (option: any) => {
    if (!option) return ""
    return getOptionLabel(option) || ""
  }

  return (
    <div style={{ width }}>
      <Combobox value={selected || null} onChange={handleSelect} multiple={multiple as any}>
        <div className="relative">
          {label && (
            <label className="absolute -top-2 left-2 z-10 bg-content-box px-1 text-xs text-icon-muted">
              {label}
            </label>
          )}
          <div className="relative">
            <Combobox.Input
              className={`w-full pr-8 text-sm outline-none ${inputClass}`}
              displayValue={displayValue}
              onChange={handleSearch}
              onClick={() => setOpen(true)}
              onBlur={() => setOpen(false)}
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-1">
              {loading ? (
                <svg className="h-5 w-5 animate-spin text-icon-muted" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 fill-current text-icon-muted" viewBox="0 0 20 20">
                  <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </div>
          {open && options.length > 0 && (
            <Combobox.Options static className="absolute z-10 mt-1 max-h-[230px] w-full overflow-auto rounded bg-content-box py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
              {options.map(option => (
                <Combobox.Option
                  key={option.id}
                  value={option}
                  className={({ active }) =>
                    `cursor-pointer select-none px-4 py-2 ${active ? "bg-primary/10" : ""}`
                  }
                >
                  {getOptionLabel(option)}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  )

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

  async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
    await queryOptions()
  }

  async function handleSelect(value: any) {
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
