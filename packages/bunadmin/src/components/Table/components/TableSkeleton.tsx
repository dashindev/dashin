import React from "react"

interface Props {
  title?: string
  msg?: string
}

const Bar = ({ w }: { w?: string }) => (
  <div
    className="my-2 h-4 animate-pulse rounded bg-gray-200"
    style={{ width: w || "100%" }}
  />
)

export default function TableSkeleton({ title, msg }: Props) {
  return (
    <div className="p-6">
      {title ? (
        <span className="text-xs uppercase tracking-wide capitalize">
          {title}
        </span>
      ) : (
        <Bar w="100px" />
      )}
      {msg && <p>{msg}</p>}
      <Bar />
      <Bar />
      <Bar />
      <Bar />
      <Bar />
    </div>
  )
}
