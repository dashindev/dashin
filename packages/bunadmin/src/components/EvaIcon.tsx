import React from "react"
import {
  Settings,
  Link as LinkIcon,
  Layers,
  RefreshCw,
  Download,
  Upload,
  Mail,
  Hash,
  Lock,
  User,
  FilePlus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  HelpCircle,
  LucideIcon
} from "lucide-react"

/**
 * Drop-in replacement for `react-eva-icons` backed by lucide-react.
 * Preserves the eva API (name/size/fill) so existing string-name call sites
 * (MenuIcon, tableIcons, settingMenus, schema icon config) work unchanged.
 * Replaces the unmaintained react-eva-icons (0.0.8). Unknown names render a
 * neutral fallback rather than crashing.
 */
export interface EvaIconProps {
  name: string
  size?: "small" | "medium" | "large" | string | number
  fill?: string
  animation?: any
}

// eva icon-name -> lucide component (covers all names used in the codebase)
const MAP: Record<string, LucideIcon> = {
  "settings-outline": Settings,
  "link-outline": LinkIcon,
  "layers-outline": Layers,
  "sync-outline": RefreshCw,
  "download-outline": Download,
  "upload-outline": Upload,
  email: Mail,
  identifier: Hash,
  password: Lock,
  username: User,
  "file-add": FilePlus,
  "edit-2-outline": Pencil,
  "trash-2-outline": Trash2,
  search: Search,
  close: X,
  "arrow-ios-back": ChevronLeft,
  "arrow-ios-forward": ChevronRight,
  "arrowhead-left": ChevronsLeft,
  "arrowhead-right": ChevronsRight,
  "arrow-ios-downward-outline": ChevronDown
}

const SIZE_PX: Record<string, number> = { small: 16, medium: 20, large: 24 }

export default function EvaIcon({ name, size = "large", fill }: EvaIconProps) {
  const Cmp = MAP[name] || HelpCircle
  const px = typeof size === "number" ? size : SIZE_PX[size] || Number(size) || 24
  return <Cmp size={px} color={fill || "currentColor"} strokeWidth={1.8} />
}
