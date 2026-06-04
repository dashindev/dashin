import React from "react"

export default function CubeSpinner() {
  React.useEffect(() => {
    document.title = "Loading..."
  }, [])

  return (
    <>
      <div id="main" data-testid="loading">
        <span className="spinner" />
      </div>
    </>
  )
}
