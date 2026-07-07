import { createContext, useContext } from "react"
import { CollectionEntry, CollectionRegistry } from "./types"

/** The collection registry (slug → entry), provided by RelatedPreviewProvider. */
export const CollectionsContext = createContext<CollectionRegistry>({})
export const useCollection = (slug: string): CollectionEntry | undefined =>
  useContext(CollectionsContext)[slug]

/** Opening a related-record preview. Null when rendered outside a provider — in
 *  which case cards stay read-only (non-clickable). */
export type OpenPreview = (slug: string, value: any) => void
export const PreviewContext = createContext<OpenPreview | null>(null)
export const usePreviewOpen = (): OpenPreview | null => useContext(PreviewContext)
