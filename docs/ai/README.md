# AI-Assisted Admin Generation

> Point bunadmin at your backend → AI introspects the schema → generates a
> working, **validated** admin. Bring your own key (BYOK); cheap models work
> because output is validated against your real schema, not freeform code.

bunadmin ships two AI commands. Both follow the same principle: **the AI never
writes UI code — it fills a constrained, validated contract.** That's why a small
model (e.g. Llama-3.1-8B) hits ~100% valid output: the generation target is
narrow and every result is checked against ground truth.

---

## `bunadmin ai generate` — schema → admin table

Introspects a backend collection and emits a bunadmin table definition (columns,
lookups, types) — the same file shape you'd write by hand, so it drops straight
into the existing generator.

```bash
# bring your own key (any OpenAI-compatible endpoint, Anthropic, or Ollama)
export DASHIN_AI_PROVIDER=openai          # openai | anthropic | ollama
export DASHIN_AI_API_KEY=sk-...           # your key
export DASHIN_AI_MODEL=gpt-4o-mini        # or llama-3.1-8b-instant, etc.
export DASHIN_AI_BASE_URL=https://api.openai.com/v1   # optional (Groq/Ollama/etc.)

bunadmin ai generate --url http://127.0.0.1:8090 --collection posts --token <admin>
# → writes posts.generated.tsx
```

Dry run with no key (uses a mock model, still validates):
```bash
bunadmin ai generate --url http://127.0.0.1:8090 --collection posts \
  --token <admin> --mock '{"columns":[{"field":"id"},{"field":"name"},{"field":"status"}]}'
```

**The moat — validation.** Before writing anything, the output is checked against
the live schema:
- every column must reference a **real field** (hallucinated fields → rejected)
- `lookup` values must match the source enum
- all fields must be covered

If the model hallucinates, it's rejected and retried — you never get a broken
admin. (A freeform "AI writes React" tool has no such guarantee.)

---

## `bunadmin ai theme` — description → validated theme

Turns a plain-English description into a validated `{ preset, mode, overrides }`
theme config consumed by `applyPreset()` at runtime. The AI may only pick a known
preset/mode and override known design tokens with valid CSS values.

```bash
bunadmin ai theme "dark mode with a purple accent and rounded corners"
# → writes bunadmin.theme.ts:
#   export const theme = { preset: "modern", mode: "dark",
#     overrides: { primary: "#7c3aed", radius: "16px" } }
```

Apply it in your app:
```ts
import { applyPreset } from "@dashin-dev/dashin"
import theme from "./bunadmin.theme"
applyPreset(theme.preset, theme.mode, theme.overrides)
```

Invented tokens, bad colors, or unknown presets are rejected — the result is
always a professional, on-brand theme by construction.

---

## Flagship walkthrough: describe → working PocketBase admin (5 min)

1. **Run a backend.** Any PocketBase instance (see [`../pocketbase/README.md`](../pocketbase/README.md)); seed demo data with `node docs/pocketbase/seed.js`.
2. **Scaffold a project:** `bunadmin new my-admin` (Vite template).
3. **Point it at PocketBase** in `.env`:
   ```
   VITE_AUTH_PLUGIN=@dashin-dev/auth-pocketbase
   VITE_AUTH_URL=http://127.0.0.1:8090
   ```
4. **Generate the posts admin:**
   ```bash
   export DASHIN_AI_PROVIDER=openai DASHIN_AI_API_KEY=sk-... DASHIN_AI_MODEL=gpt-4o-mini
   bunadmin ai generate --url http://127.0.0.1:8090 --collection posts --token <admin> --out src/plugins/blog/post
   ```
5. **Theme it:** `bunadmin ai theme "clean light theme, indigo accent"`.
6. **Run it:** `yarn dev` → a validated, themed admin for your real data.

The same flow works for **Appwrite** (`@dashin-dev/source-appwrite`) and
Strapi — point `ai generate` at the backend, get a validated admin.

---

## Why cheap models are enough (the benchmark)

Against a live PocketBase across 3 collections, both a **cheap 8B model**
(Llama-3.1-8B) and a 70B model produced **100% valid output, first try** — because
generation targets a constrained, validated contract. You don't need (or pay for)
a frontier model to get a reliable admin.

## Supported providers (BYOK)
`openai` (and any OpenAI-compatible base URL — Groq, Together, etc.), `anthropic`,
`ollama` (local/self-hosted). The product never resells tokens: you bring a key or
point at a cheap/self-hosted endpoint.
