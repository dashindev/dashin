#!/usr/bin/env node
"use strict"
const React = require("react")
const importJsx = require("import-jsx")
const { render } = require("ink")
const meow = require("meow")

const ui = importJsx("./lib/ui")

const cli = meow(`
	Create a new project (Vite or Next.js)
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

	Generate an admin table from a backend schema (AI, bring-your-own-key)
	  $ bunadmin ai generate --url <pocketbase-url> --collection <name> [--token <admin>] [--out <dir>]
	  Set BUNADMIN_AI_PROVIDER (openai|anthropic|ollama) + BUNADMIN_AI_API_KEY,
	  or pass --mock '<json>' for a dry run. Output is validated against the live schema.

	Generate an admin THEME from a description (AI, bring-your-own-key)
	  $ bunadmin ai theme "dark mode with a purple accent" [--out <dir>]
	  Emits a validated { preset, mode, overrides } theme config for applyPreset().

	Refine an existing generated admin with a natural-language instruction
	  $ bunadmin ai refine "make views numeric" --url <url> --collection <name> --columns '<json>'
	  Updated columns are re-validated against the live schema before re-emitting.
`)

render(
  React.createElement(ui, {
    inputs: cli.input,
    options: cli.flags
  })
)
