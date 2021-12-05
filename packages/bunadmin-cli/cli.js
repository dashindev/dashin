#!/usr/bin/env node
"use strict"
const React = require("react")
const importJsx = require("import-jsx")
const { render } = require("ink")
const meow = require("meow")

const ui = importJsx("./lib/ui")

const cli = meow(`
	Create a new project (CRA or Next.js)
	  $ bunadmin new {name}
	  $ bunadmin new {name} --nextjs

    Options
      --plugin  with demo plugin
      --doc     with demo document

	Create a plugin
	  $ bunadmin plugin [team]-[group]
	  (Run in the plugins directory: plugins/)

	Create a schema
	  $ bunadmin schema [name]
	  (Run in the plugin directory: plugins/bunadmin-plugin-[team]-[group]/)
`)

render(
  React.createElement(ui, {
    inputs: cli.input,
    options: cli.flags
  })
)
