# Spike: schema-aware AI generation (BYOK)

**Status:** proof-of-concept, validated against a live PocketBase. Not production.

## Thesis
Generic AI codegen (v0/Bolt/Lovable) emits *freeform* React that is often
subtly broken, so it needs expensive frontier models to be reliable. bunadmin
has a **constrained, validated output contract** (the plugin/schema generator).
Generating into that contract is a *narrow* task, so:

1. **cheap / small / BYOK models are good enough**, and
2. we can **validate every generation against the live schema** and reject
   hallucinations — something freeform tools cannot do.

That combination (cheap models + validation) is the margin story and the moat.

## Pipeline
```
introspect (ground truth)  ->  LLM (BYOK/cheap)  ->  VALIDATE  ->  emit schema file
   /api/collections             provider.js          validate.js     generate.js
   = real fields, no guess      one interface:        THE MOAT        same shape a
                                openai|anthropic|     reject           human writes
                                ollama|byok           hallucinations   (feeds existing
                                                      + retry once      generator, 0
                                                                        runtime change)
```

## What this spike proves (run against live PocketBase)
- **Introspection** pulls the real `posts` schema (`name`/`status`/`views`) — the
  model fills a template, it doesn't invent.
- **Valid output → emitted a working bunadmin schema file in 1 attempt**, identical
  in shape to `docs/pocketbase/example-posts.tsx` (so the existing generator
  consumes it unchanged).
- **Hallucinated output → REJECTED.** The validator caught, against ground truth:
  - `hallucinated field "author_email"` (not in the collection)
  - `status` lookup value `Archived` not in the source enum
  - missing coverage of the real `views` field

  A freeform "AI writes React" tool would have shipped the broken column.
- Validator logic has unit tests (`ai/__tests__/validate.test.js`, 5/5).

## BYOK by default
`provider.js` supports `openai` / `anthropic` / `ollama` / any OpenAI-compatible
base URL via env (`BUNADMIN_AI_PROVIDER`, `_API_KEY`, `_MODEL`, `_BASE_URL`).
The product never resells tokens at launch: users bring a key or point at a
cheap/self-hosted endpoint. A managed tier (cheap models + this validation layer,
priced on convenience) is the later revenue layer.

## Try it
```bash
node packages/bunadmin-cli/ai/run.js \
  --url http://127.0.0.1:8090 --collection posts --token <admin-token> \
  --mock '{"columns":[{"field":"id"},{"field":"name"},{"field":"status"},{"field":"views"}]}'
# or with a real model: set BUNADMIN_AI_PROVIDER + key, drop --mock
```

## Benchmark (real models, Groq, live PocketBase; 3 collections x 6 runs)
Run via `node ai/bench.js` (needs BUNADMIN_AI_* + a Groq key in the env; the key
must NOT be committed). With 429 rate-limit backoff + pacing:

| model | valid | first-try |
|---|---|---|
| **llama-3.1-8b-instant** (cheap) | **18/18 (100%)** | 100% |
| llama-3.3-70b-versatile | 18/18 (100%) | 100% |

The cheap 8B model matches the 70B because generation is into a constrained,
validated contract. Earlier sub-100% runs were Groq free-tier TPM (6000/min)
throttling — an API quota artifact, not model quality. **This is the thesis:
validation makes small/cheap models production-viable for this task.**

## Not done (intentionally — this is a spike)
- Only PocketBase introspection (Appwrite/Supabase/Postgres next — same pattern).
- Not wired into the ink CLI command surface yet (`commands/ai.ts`).
- No relation/expand handling, no menu/i18n generation, no auth-rule awareness.
- Mock provider simulates the model; real-model quality on cheap endpoints is the
  next thing to measure.

## Venture implication
The defensible asset is **introspection + validation against a known contract**,
not the LLM call. It is what makes cheap models economically viable and what
generic codegen tools structurally cannot replicate. PocketBase is the winnable
beachhead; the same pipeline extends to Supabase/Postgres where the budgets are.
