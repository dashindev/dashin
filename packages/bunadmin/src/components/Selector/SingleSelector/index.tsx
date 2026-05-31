import React from "react"
import { Listbox } from "@headlessui/react"
import { Column, EditComponentProps } from "@/components/Table/models/material-table-shim"
import { store } from "@/utils"
import { selectTable, setTable, TableFilter } from "@/slices/tableSlice"
import { useSelector } from "react-redux"

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

  const handleChange = async (selValue: string) => {
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
      <div className="m-1 min-w-[100px]">
        <Listbox value={selectedName} onChange={handleChange}>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-pointer border-b border-gray-300 bg-transparent py-2 pr-8 text-left text-sm focus:border-primary focus:outline-none">
              <span className="block truncate">
                {names[keys.indexOf(selectedName)] || "\u00A0"}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
                <svg className="h-5 w-5 fill-current text-gray-400" viewBox="0 0 20 20">
                  <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-[230px] w-full overflow-auto rounded bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
              {names.map((name, i) => (
                <Listbox.Option
                  key={name}
                  value={keys[i]}
                  className={({ active }) =>
                    `cursor-pointer select-none px-4 py-2 ${active ? "bg-primary/10" : ""}`
                  }
                >
                  {({ selected }) => (
                    <span className={selected ? "font-medium" : "font-normal"}>
                      {name}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>
    </div>
  )
}
