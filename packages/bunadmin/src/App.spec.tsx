import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import App from "./App"
import { ENV } from "@/utils"

test("index page", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  )

  await waitFor(() => screen.getByTestId("loading"))

  expect(screen.getByTestId("loading")).not.toBeNull()

  await waitFor(() => screen.getAllByText(ENV.SITE_NAME), { timeout: 5000 })

  expect(screen.getAllByText(ENV.SITE_NAME)).not.toBeNull()
})
