import React from "react"
import { Field, FieldProps } from "formik"

export type BunFieldTypes = (
  | React.InputHTMLAttributes<HTMLInputElement>
  | React.TextareaHTMLAttributes<HTMLTextAreaElement>
  | React.SelectHTMLAttributes<HTMLSelectElement>
) & {
  validate?: (value: any) => undefined | string | Promise<any>
  name: string
  render?: (props: FieldProps) => React.ReactNode
  children?: React.ReactNode | ((props: FieldProps) => React.ReactNode)
  as?: string | React.ComponentType<FieldProps["field"]>
  component?: string | React.ComponentType<FieldProps>
}

const BunField = (props: BunFieldTypes) => Field(props)

export default BunField
