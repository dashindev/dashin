import React, { useEffect, useState } from "react"
import { Text } from "ink"
import newProject from "./commands/new"
import newPlugin from "./commands/plugin"
import newSchema from "./commands/schema"
import newAi from "./commands/ai"
import { BUNADMIN_CLI_PATH } from "./utils/config"
import * as path from "path"

type UIProps = {
  inputs: string[]
  options: { [key: string]: string | boolean } | any
}

type State = {
  command?: "new" | "plugin" | "schema" | "ai" | "-v"
  errors?: string
  message?: string
}

type PickOne<T> = {
  [P in keyof T]: Record<P, T[P]> &
    Partial<Record<Exclude<keyof T, P>, undefined>>
}[keyof T]

const UI = (props: UIProps) => {
  const { inputs, options } = props

  const [version, setVersion] = useState(null)
  const [state, setState] = useState<State>({
    command: undefined,
    errors: undefined
  })

  function updateState(obj: PickOne<State>) {
    setState({ ...state, ...obj })
  }

  const command: State["command"] | string = inputs[0]

  useEffect(() => {
    ;(async () => {
      const packagePath = path.resolve(BUNADMIN_CLI_PATH, "package.json")

      if (!command && options.v) {
        const packageJson = require(packagePath).version
        return setVersion(packageJson)
      }

      switch (command) {
        case "new":
          {
            updateState({ command })
            const projectName = inputs[1] || "my-bunadmin"
            const errors = await newProject(projectName, options)
            updateState({ errors })
          }
          break
        case "plugin":
          {
            updateState({ command })
            const pluginName = inputs[1] || "myteam-myblog"
            const errors = await newPlugin(pluginName)
            updateState({ errors })
          }
          break
        case "schema":
          {
            updateState({ command })
            const pluginName = inputs[1] || "mypost"
            const errors = await newSchema(pluginName)
            updateState({ errors })
          }
          break
        case "ai":
          {
            updateState({ command })
            const res = await newAi(inputs, options)
            setState(s => ({ ...s, errors: res.errors, message: res.message }))
          }
          break
        default:
          updateState({
            errors: "Command does not exist, please check help: bunadmin --help"
          })
      }
    })()
  }, [command])

  if (version) {
    return <Text>{version}</Text>
  }

  switch (command) {
    case "new":
    case "plugin":
    case "schema":
      return (
        <Text color={state.errors ? "red" : "green"}>
          {state.errors || "done"}
        </Text>
      )
    case "ai":
      return (
        <Text color={state.errors ? "red" : "green"}>
          {state.errors || state.message || "done"}
        </Text>
      )
    default:
      return <Text color="red">{state.errors}</Text>
  }
}

module.exports = UI
