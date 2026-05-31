import React from "react"
import { Listbox } from "@headlessui/react"
import { Column } from "@/components/Table/models/material-table-shim"

type Props = {
  columnDef?: Column<any>
  onFilterChanged?: (rowId: string | number, value: any) => void
  valueToLowerCase?: boolean
  valueReplaceSpaces?: boolean
}

export default function MultipleSelector(props: Props) {
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

  const handleChange = (selectedValues: string[]) => {
    setSelectedName(selectedValues)

    // callback onFilterChanged function
    if (columnDef && onFilterChanged) {
      const replacedValues: string[] = []
      selectedValues.map(v => {
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
      <div className="m-1 min-w-[120px] max-w-[200px]">
        <Listbox value={selectedName} onChange={handleChange} multiple>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-pointer border-b border-bn-border bg-transparent py-2 pr-8 text-left text-sm focus:border-primary focus:outline-none">
              <span className="block truncate">
                {selectedName.length > 0 ? selectedName.join(", ") : "\u00A0"}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
                <svg className="h-5 w-5 fill-current text-icon-muted" viewBox="0 0 20 20">
                  <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-[230px] w-[250px] overflow-auto rounded bg-content-box py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
              {names.map(name => (
                <Listbox.Option
                  key={name}
                  value={name}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-primary/10" : ""}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <input
                          type="checkbox"
                          checked={selected}
                          readOnly
                          className="h-4 w-4 rounded border-bn-border text-primary"
                        />
                      </span>
                      <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                        {name}
                      </span>
                    </>
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
