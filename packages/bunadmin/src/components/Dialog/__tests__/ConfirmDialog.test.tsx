import React from "react"
import { describe, it, expect, vi, beforeAll } from "vitest"
import { render, fireEvent, waitFor } from "@testing-library/react"

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any
})

vi.mock("react-i18next", () => ({
  Translation: ({ children }: any) => children((k: string) => k),
  useTranslation: () => ({ t: (k: string) => k })
}))

import ConfirmDialog from "../ConfirmDialog"

describe("ConfirmDialog", () => {
  it("renders without throwing", () => {
    const doFunc = vi.fn()
    expect(() =>
      render(
        <ConfirmDialog openModal={0} title="Test" msg="msg" doFunc={doFunc} />
      )
    ).not.toThrow()
  })

  it("shows title/msg and calls doFunc on agree click when open", async () => {
    const doFunc = vi.fn()
    const { findByText } = render(
      <ConfirmDialog
        openModal={1}
        title="Delete?"
        msg="Are you sure?"
        doFunc={doFunc}
        agree="Yes"
      />
    )

    const title = await findByText("Delete?")
    expect(title).toBeTruthy()

    const msg = await findByText("Are you sure?")
    expect(msg).toBeTruthy()

    const agreeBtn = await findByText("Yes")
    fireEvent.click(agreeBtn)

    await waitFor(() => {
      expect(doFunc).toHaveBeenCalledTimes(1)
    })
  })
})
