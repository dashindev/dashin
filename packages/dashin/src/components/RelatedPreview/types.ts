import { ReactNode } from "react"
import { Column, EditableData } from "../Table/models/material-table-shim"

/**
 * How to summarize a record of a collection wherever it appears as a related
 * item (cards, previews). Pure display — adapter-agnostic (URLs/values are
 * plain, so no source-package coupling).
 */
export interface CollectionMeta {
  label: string
  title: (record: any) => ReactNode
  subtitle?: (record: any) => ReactNode
  /** Resolved avatar/thumbnail URL (the app/adapter computes it, e.g. from a
   *  media object). Omit for no avatar. */
  avatarUrl?: (record: any) => string | null | undefined
  summary?: { label: string; value: (record: any) => ReactNode }[]
  /** Related records reachable from this one — rendered as clickable cards so
   *  you can drill in (A → its B → B's other A …). */
  relations?: { label: string; slug: string; list?: boolean; value: (record: any) => any }[]
}

/** Everything the preview system needs to render (and optionally edit) a
 *  collection's records, keyed by slug in the registry. */
export interface CollectionEntry {
  meta: CollectionMeta
  /** Columns for the nested edit form. Omit → the preview is view-only. */
  columns?: Column<any>[]
  /** Resolve a record by id (adapter-provided; e.g. a depth>=1 GET). Omit →
   *  only already-populated objects render, ids show a placeholder. */
  fetch?: (id: string | number) => Promise<any>
  /** CRUD handlers for the nested edit (adapter-provided, e.g. editableCtrl). */
  editable?: EditableData<any>
}

export type CollectionRegistry = Record<string, CollectionEntry>
