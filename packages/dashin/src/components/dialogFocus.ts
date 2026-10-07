/** Only the highest visible modal owns document-level keyboard events.
 * Focus can temporarily move to body when a submitting button is disabled. */
export function isTopDialog(panel: HTMLElement | null): boolean {
  if (!panel) return false
  const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]'))
    .filter(dialog => !dialog.hidden && getComputedStyle(dialog).display !== "none")
  const zIndex = (dialog: HTMLElement) => parseInt(getComputedStyle(dialog).zIndex, 10) || 0
  const top = dialogs.reduce<HTMLElement | null>((current, dialog) =>
    !current || zIndex(dialog) >= zIndex(current) ? dialog : current, null)
  return top === panel
}

let scrollLocks = 0
let previousOverflow = ""
/** Reference counting allows multiple stacked dialogs to close in any order. */
export function lockDialogScroll(): () => void {
  if (scrollLocks++ === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
  }
  return () => {
    if (--scrollLocks === 0) document.body.style.overflow = previousOverflow
  }
}
