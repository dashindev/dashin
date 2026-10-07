import type { TFunction } from "i18next"
import { Primary } from "@/core/auth/schema"
import noticeController from "@/core/notice/controllers/noticeController"
import { BA_DB, DashinDatabase } from "../database"
import { SETTING_NAMES } from "../config"

/**
 * Shared sign-in submit helper for auth plugins.
 *
 * One failure contract for every sign-in flow:
 * - only a well-formed success payload persists identity (a transaction writes
 *   the user row + active-identity settings together, so a mid-write failure
 *   leaves no half-active account);
 * - transport rejections (401/403/network/timeout), malformed 2xx envelopes
 *   and storage failures all release the submitting state and surface a
 *   readable notice — never a raw `JSON.stringify(response)` dump;
 * - `afterPersist` side effects (e.g. a plugin's own token store) run only
 *   after the identity is durably persisted;
 * - success navigates via a full page load by default so the app re-checks
 *   auth (a client-side `router.push("/")` from the sign-in page leaves the
 *   form mounted).
 */

export interface SignInResult {
  id?: string | number
  token?: string
  user?: {
    username?: string
    role?: string
    [key: string]: any
  }
  errors?: any
  [key: string]: any
}

export interface CompleteSignInOptions {
  /** i18n translator for the success/failure notice titles. */
  t: TFunction
  /** Performs the credential exchange; may resolve a mapped result or throw. */
  signIn: () => Promise<SignInResult | null | undefined>
  /** Formik-style submitting reset — always called in `finally`. */
  setSubmitting?: (isSubmitting: boolean) => void
  /** Require `res.token` on top of `res.user.username` (default: true). */
  requireToken?: boolean
  /** Storage backend — injectable for tests; defaults to the app Dexie db. */
  db?: DashinDatabase
  /** Notice sink — injectable for tests; defaults to the app notice controller. */
  notify?: (n: { title: string; severity?: "success" | "error"; content?: string }) => unknown
  /** Runs only after the identity is durably persisted (e.g. plugin token stores). */
  afterPersist?: (res: SignInResult) => void | Promise<void>
  /** Post-success navigation (default: full reload to "/"). */
  navigate?: () => void
  successTitle?: string
  failureTitle?: string
}

/** Best-effort readable message from a thrown error or an `{errors}` envelope. */
export function signInErrorMessage(e: any, fallback = "Sign in failed"): string {
  const body = e?.response?.data ?? e?.data ?? e
  const raw =
    (typeof body?.errors === "string" && body.errors) ||
    body?.errors?.[0]?.data?.errors?.[0]?.message ||
    body?.errors?.[0]?.message ||
    (typeof body?.message === "string" && body.message) ||
    body?.error?.description ||
    body?.error?.message ||
    (typeof body?.error === "string" && body.error) ||
    e?.description ||
    e?.message ||
    ""
  return String(raw).trim() || fallback
}

/**
 * Drive a sign-in submit to completion. Resolves `true` only after identity is
 * persisted and post-success hooks ran; resolves `false` (never rejects) on any
 * credential, transport, shape or storage failure.
 */
export async function completeSignIn(options: CompleteSignInOptions): Promise<boolean> {
  const {
    t,
    signIn,
    setSubmitting,
    requireToken = true,
    db = BA_DB,
    notify = noticeController,
    afterPersist,
    navigate = () => window.location.assign("/"),
    successTitle,
    failureTitle
  } = options
  const failTitle = failureTitle || t("Sign in failed") || "Sign in failed"

  try {
    const res = await signIn()
    const user = res?.user
    if (!user?.username || (requireToken && !res?.token)) {
      await notify({
        title: failTitle,
        severity: "error",
        content: signInErrorMessage(res, failTitle)
      })
      return false
    }

    const updated_at = Date.now()
    // Atomic: all three writes land or none does — a failed write can never
    // leave a half-active identity (user row without the active pointer, or
    // an active pointer without the user row).
    await db.transaction("rw", db.users, db.settings, async () => {
      await db.users.put({
        [Primary]: user.username!,
        id: String(res!.id ?? user.username!),
        token: res!.token ?? "",
        role: user.role ?? "",
        details: JSON.stringify(res),
        updated_at
      })
      await db.settings.put({ name: Primary, value: user.username, updated_at })
      await db.settings.put({ name: SETTING_NAMES.role, value: user.role ?? "", updated_at })
    })

    await afterPersist?.(res!)
    await notify({ title: successTitle || t("Sign in successful") || "Sign in successful" })
    navigate()
    return true
  } catch (e) {
    await notify({ title: failTitle, severity: "error", content: signInErrorMessage(e, failTitle) })
    return false
  } finally {
    setSubmitting?.(false)
  }
}
