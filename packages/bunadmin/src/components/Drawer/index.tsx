import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react"
import CSS from "csstype"

export interface DrawerProps {
  width?: number | string
  height?: number | string
  direction?: "left" | "top" | "right" | "bottom"
  buttonTitle: string | JSX.Element
  buttonColor?: "primary" | "secondary" | "inherit" | "success" | "error" | "info" | "warning"
  buttonVariant?: "text" | "outlined" | "contained"
  buttonSize?: "small" | "medium" | "large"
  buttonDisabled?: boolean
  buttonHidden?: boolean
  buttonStyle?: CSS.Properties
  switchDrawer?: number
  onOpen?: (p: { contentRef: React.MutableRefObject<any | undefined> }) => void
  onClose?: (p: { contentRef: React.MutableRefObject<any | undefined> }) => void
  contentClassName?: string
  contentStyles?: CSS.Properties
  children: React.ReactNode
}

export default function Drawer({
  width,
  height,
  direction,
  buttonTitle,
  buttonColor,
  buttonVariant,
  buttonSize,
  buttonDisabled,
  buttonHidden,
  buttonStyle,
  switchDrawer,
  onOpen,
  onClose,
  contentClassName,
  contentStyles,
  children
}: DrawerProps) {
  const [state, setState] = useState({ open: false })
  const contentRef: MutableRefObject<any | undefined> = useRef()

  useEffect(() => {
    switchDrawer && switchDrawer > 0 && toggleDrawer()
  }, [switchDrawer])

  const toggleDrawer = useCallback(() => {
    if (!state.open) {
      onOpen && setTimeout(() => onOpen({ contentRef }), 200)
    } else {
      onClose && setTimeout(() => onClose({ contentRef }), 200)
    }
    setState({ ...state, open: !state.open })
  }, [state.open])

  const sizeClass = buttonSize === "small" ? "text-sm px-2 py-1" : buttonSize === "large" ? "text-lg px-5 py-3" : "px-4 py-2"
  const variantClass = buttonVariant === "contained"
    ? "bg-[#36f] text-white"
    : buttonVariant === "outlined"
    ? "border border-[#36f] text-[#36f]"
    : "text-[#36f]"

  const directionClasses: Record<string, string> = {
    left: "inset-y-0 left-0",
    right: "inset-y-0 right-0",
    top: "inset-x-0 top-0",
    bottom: "inset-x-0 bottom-0"
  }
  const translateHidden: Record<string, string> = {
    left: "-translate-x-full",
    right: "translate-x-full",
    top: "-translate-y-full",
    bottom: "translate-y-full"
  }
  const anchor = direction || "right"

  return (
    <>
      {!buttonHidden && (
        <button
          className={`${sizeClass} ${variantClass} rounded ${buttonDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          disabled={buttonDisabled}
          onClick={() => toggleDrawer()}
          style={buttonStyle}
        >
          {buttonTitle}
        </button>
      )}
      {/* Backdrop */}
      {state.open && (
        <div
          className="fixed inset-0 bg-black/50 z-[1200]"
          onClick={toggleDrawer}
        />
      )}
      {/* Drawer panel */}
      <aside
        className={`fixed z-[1300] bg-content-box transition-transform duration-300 ease-in-out ${directionClasses[anchor]} ${state.open ? "translate-x-0 translate-y-0" : translateHidden[anchor]}`}
        style={{ width: width || "auto", height: height || "100%" }}
      >
        <div
          ref={contentRef}
          className={contentClassName || "flex-grow p-6"}
          style={{ ...contentStyles }}
        >
          {children}
        </div>
      </aside>
    </>
  )
}
