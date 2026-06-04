import React from "react"
import ReactDOM from "react-dom/client"
import "./tailwind.css"
import App from "./App"

export * from "./main"

const container = document.getElementById("root")!
// Guard against double createRoot (HMR / module re-eval).
const w = window as any
const root = w.__dashinRoot || (w.__dashinRoot = ReactDOM.createRoot(container))
root.render(<App />)
