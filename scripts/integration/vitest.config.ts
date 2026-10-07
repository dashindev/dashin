import { defineConfig } from "vitest/config"
export default defineConfig({ test: { include: [process.env.DASHIN_PAYLOAD_TEST_URL ? "scripts/integration/payload-adapter.test.ts" : "scripts/integration/d1-adapter.test.ts"], fileParallelism: false } })
