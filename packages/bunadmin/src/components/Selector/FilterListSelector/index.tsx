import React, { useState } from "react"
import { ChevronsUpDown, Loader2 } from "lucide-react"
import { Combobox } from "@headlessui/react"
import { Column, Query } from "@/components/Table/models/material-table-shim"
import { notice } from "@/core"

interface OptionType {
  id: string
  name: string
}

interface ListSelectProps<RowData extends object> {
  rowData?: RowData
  columnDef: Column<any>
  onFilterChanged: (rowId: string, value: any) => void
  width?: number | string
  label?: string
  shortName: string
  schemaName: string
  querySer: (query: Query<any>) => Promise<any>
  customKey?: keyof OptionType
  variant?: "outlined"
}

export default function FilterListSelector({
  rowData,
  columnDef,
  onFilterChanged,
  width,
  label,
  shortName,
  schemaName,
  querySer,
  customKey,
  variant
}: ListSelectProps<any>) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<OptionType[]>([])
  const [name, setName] = React.useState("")
  const [selected, setSelected] = useState(rowData && rowData[shortName])
  const loading = open && options.length === 0

  React.useEffect(() => {
    if (!loading) {
      return undefined
    }

    ;(async () => {
      await dataCtrl()
    })()
  }, [loading])

  React.useEffect(() => {
    if (!open) {
      setOptions([])
    }
  }, [open])

  async function dataCtrl() {
    const { data: res, errors } = await querySer({
      search: name,
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

    const resList: any[] = res && res[schemaName]

    const options: OptionType[] = []
    resList.map(item => {
      const nameObj = customKey
        ? { [customKey]: item[customKey] }
        : { name: item.name }
      options.push({ id: item.id, name: "", ...nameObj })
    })
    setOptions(options)
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value)
    await dataCtrl()
  }

  function handleSelect(value: any) {
    // @ts-ignore for columnDef.tableData
    onFilterChanged(columnDef.tableData.id, value ? value.id : undefined)
    setSelected(value)
  }

  const displayValue = (option: OptionType | null) => {
    if (!option) return ""
    return customKey ? (option[customKey] as string) : option.name
  }

  return (
    <div style={{ width: width ? width : 135 }}>
      <Combobox value={selected || null} onChange={handleSelect}>
        <div className="relative">
          {label && (
            <label className="absolute -top-2 left-2 bg-content-box px-1 text-xs text-icon-muted">
              {label}
            </label>
          )}
          <div className="relative">
            <Combobox.Input
              className={`w-full py-2 pr-8 text-sm outline-none ${
                variant === "outlined"
                  ? "rounded border border-bn-border px-3 focus:border-primary focus:ring-1 focus:ring-primary"
                  : "border-b border-bn-border bg-transparent focus:border-primary"
              }`}
              displayValue={displayValue}
              onChange={handleChange}
              onClick={() => setOpen(true)}
              onBlur={() => setOpen(false)}
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-1">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-icon-muted" />
              ) : (
                <ChevronsUpDown className="h-5 w-5 text-icon-muted" />
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
                  {customKey ? option[customKey] : option.name}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  )
}
