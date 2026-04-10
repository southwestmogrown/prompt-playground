# Devlog — April 10, 2026: Comparison Features + Prompt Templates

## Summary

Six features shipped in one session: re-run from history, token/cost estimates, diff view, latency visualization, prompt templates (with inline edit), and multi-provider expansion. The app is now meaningfully more useful as a comparison tool, not just a multi-model runner.

---

## Re-run from History

**Problem:** History was read-only. You could see what you ran, but getting back to the playground with the same setup required copying the prompt manually and re-selecting models.

**Fix:** "Open in Playground →" button in each expanded RunCard. Saves `{ systemPrompt, userMessage, models }` to sessionStorage under `prism_restore_run`, then navigates to `/playground`. PlaygroundClient's mount effect checks for a restore run before checking for a draft, restores valid models (filters out any that have since been removed from the model list), then clears the key.

**Files:** `src/lib/demo.ts` (3 new helpers), `src/components/history/RunCard.tsx`, `src/app/(dashboard)/playground/PlaygroundClient.tsx`

---

## Token Count + Cost Estimate

**Approach:** Static pricing table in `src/lib/pricing.ts`, computed client-side using character-count token approximation (÷4, accurate to ~10% for English). No tokenizer library, no external calls.

`estimateCost(modelId, inputText, outputText)` returns `number | null` — null if the model isn't in the pricing table, which renders as nothing rather than $NaN.

Shown in `ResponseCard` header alongside latency. Very small costs (<$0.0001) render in exponential notation to avoid showing `$0.0000`.

**Files:** `src/lib/pricing.ts` (new), `src/components/playground/ResponseCard.tsx`

---

## Diff View

**What:** Word-level diff between any two responses. With exactly 2 responses, "Compare" goes straight to diff view. With 3+, it enters a selection mode — clicking cards picks the pair (ring highlight on selected, dimmed on unselectable), auto-advances to diff when two are chosen.

**Algorithm:** LCS-based word diff in `src/lib/diff.ts`. Splits on whitespace, standard DP table + backtrack. Returns parallel `{ left: DiffPart[], right: DiffPart[] }` — same index positions can be "same", "removed" (left only), or "added" (right only). No library dependency.

**Files:** `src/lib/diff.ts` (new), `src/components/playground/DiffView.tsx` (new), `PlaygroundClient.tsx`

---

## Latency Visualization

**What:** A 3px indigo bar at the bottom of each ResponseCard header. Width = `(minLatency / card.latency_ms) × 100%` — fastest card fills the bar, slower ones scale down proportionally. "Wider = faster" reads naturally. Fastest card also gets a green "Fastest" badge.

Only rendered when 2+ non-errored responses exist. Errored cards have no bar. Single-model runs have no bars.

Computed in `PlaygroundClient` before the render loop — `minLatency` and `isFastest` passed as props to each `ResponseCard`.

**Files:** `src/components/playground/ResponseCard.tsx`, `PlaygroundClient.tsx`

---

## Prompt Templates

**What:** Save named system prompts, reload them in future sessions, edit in place.

**Schema:** New `prompt_templates` table (id, user_id, name, system_prompt, created_at). RLS scoped to owner. Migration: `supabase/migrations/20260410000000_prompt_templates.sql`.

**API:** `/api/templates` — GET, POST, PUT, DELETE. Pattern identical to `/api/keys`. PUT (edit) included from the start — delete/recreate loops are bad UX.

**UI:** `TemplateSelector` component in the playground sidebar (hidden in demo mode). Template list with click-to-select → "Load selected" with confirm dialog if the editor has content. Each template has Edit and Remove buttons. Edit expands an inline form pre-filled with name + system_prompt textarea — no modal, no navigation. Cancel/Update inline. Only one template editable at a time.

**Files:** `supabase/migrations/20260410000000_prompt_templates.sql` (new), `src/app/api/templates/route.ts` (new), `src/components/playground/TemplateSelector.tsx` (new), `PlaygroundClient.tsx`

---

## Patterns Worth Noting

**Static pricing tables beat live lookups for estimates.** Cost estimation doesn't need to be exact — within 10% is enough for "is this model 10x cheaper?" decisions. A hardcoded table with a char÷4 approximation handles it with zero runtime cost and no external dependency. Update the table when pricing changes.

**`Record<Union, V>` as exhaustiveness enforcement.** `PROVIDER_MAP: Record<ProviderName, ProviderFn>` means adding a new provider to the union without a map entry is a compile-time error, not a runtime `undefined`. Same pattern applied to `PROVIDER_LABELS` in KeyManager. No switch statements, no runtime checks needed.

**Confirm-on-overwrite at the call site.** The `onLoad` callback in TemplateSelector calls `confirm()` before overwriting a non-empty system prompt. The guard lives in the component that owns the action, not scattered across callers. Simple, predictable, no custom dialog infrastructure needed.

**Inline edit over delete/recreate.** Omitting PUT from an API because "MVP" just means users do two round-trips and lose their original if something goes wrong. The cost of adding PUT upfront is low; the cost of not having it is user frustration on every edit.

---

# Devlog — April 10, 2026: Multi-Provider Expansion

## Summary

Expanded provider support from 2 (Anthropic + OpenAI) to 6, adding Google Gemini, Mistral, Groq (Meta Llama), and xAI Grok. Refreshed the Anthropic model catalog to 4.6 and added newer OpenAI models. Total model count: 15 across 6 providers.

---

## What Changed

### New providers

**Google Gemini** — uses `@google/generative-ai` SDK (the only new package added). Google's API differs enough from the OpenAI chat completions shape that it warrants its own SDK: `getGenerativeModel()` + `generateContent()`, with system prompt passed as `systemInstruction`.

**Mistral, Groq, xAI** — all three expose OpenAI-compatible chat completions APIs. Implemented as thin wrappers reusing the `openai` SDK with a custom `baseURL`:
- Mistral: `https://api.mistral.ai/v1`
- Groq: `https://api.groq.com/openai/v1`
- xAI: `https://api.x.ai/v1`

No new packages for these three.

### Provider dispatch refactor

Replaced a growing ternary chain with a `PROVIDER_MAP` object:

```typescript
const PROVIDER_MAP: Record<ProviderName, ProviderFn> = {
  anthropic: callAnthropic,
  openai: callOpenAI,
  google: callGoogle,
  mistral: callMistral,
  groq: callGroq,
  xai: callXAI,
};

const result = await PROVIDER_MAP[model.provider](modelId, systemPrompt, userMessage, apiKey);
```

`Record<ProviderName, ProviderFn>` means the TypeScript compiler will error at build time if a new provider is added to the `ProviderName` union without a corresponding entry in the map. Zero-cost exhaustiveness check.

### Model catalog updates

- Anthropic: `claude-opus-4-5` → `claude-opus-4-6`, `claude-sonnet-4-5` → `claude-sonnet-4-6`, Haiku model ID corrected to `claude-haiku-4-5-20251001`
- OpenAI: added `gpt-4.1` and `o3-mini` alongside existing `gpt-4o` / `gpt-4o-mini`

### KeyManager UI

Added the four new providers to the dropdown and `PROVIDER_LABELS` map. The `Record<ProviderName, string>` type on `PROVIDER_LABELS` caught the omission at build time before it could ship as a runtime error.

---

## Patterns Worth Noting

**OpenAI-compatible APIs reduce integration cost significantly.** Mistral, Groq, and xAI all took under 10 lines each to integrate — just a `baseURL` swap on the existing OpenAI client. When evaluating a new provider, checking for OpenAI compatibility first is worth the 30 seconds.

**`Record<Union, V>` as an exhaustiveness check.** Using `Record<ProviderName, ...>` for both `PROVIDER_MAP` and `PROVIDER_LABELS` turns "did I forget a provider?" from a runtime bug into a compile-time error. No explicit switch exhaustion or runtime validation needed — the type does it.

**Google's SDK is meaningfully different.** The `generateContent` API doesn't use a messages array — it takes a single content string for simple prompts, with `systemInstruction` as a top-level model config option. Worth noting if adding streaming later: Gemini's streaming API (`generateContentStream`) also differs from OpenAI's.

---

# Devlog — March 20, 2026: Production Bug Fixes + Prism Rebrand

## Summary

Three production bugs fixed post-deploy, then a full visual rebrand from "Prompt Playground" to **Prism**. All pushed directly to main and deployed via Vercel.

---

## Bug Fixes (Production)

### Bug 1 — `api_keys` upsert failing: missing unique constraint

**Error:** `there is no unique or exclusion constraint matching the ON CONFLICT specification`

The `/api/keys` POST route uses `.upsert()` with `onConflict: "user_id,provider"`, which requires a `UNIQUE(user_id, provider)` constraint in Postgres. The constraint was never created. Fixed by running the migration in Supabase SQL editor:

```sql
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_user_id_provider_key UNIQUE (user_id, provider);
```

### Bug 2 — API key save failing: foreign key violation

**Error:** `insert or update on table "api_keys" violates foreign key constraint "api_keys_user_id_fkey"`

The `api_keys` table FK references `profiles.id`, but the `profiles` row didn't exist for the user. Root cause: the trigger that auto-creates a profile row on signup wasn't set up in Supabase. Fixed by backfilling existing users and creating the trigger:

```sql
INSERT INTO profiles (id)
SELECT id FROM auth.users WHERE id NOT IN (SELECT id FROM profiles);
```

Also identified a broader RLS policy bug: all three tables (`profiles`, `api_keys`, `runs`) were using `FOR ALL USING (...)` policies, which don't apply `WITH CHECK` to writes. Split all policies into explicit `SELECT`, `INSERT`, `UPDATE`, `DELETE` policies with proper `WITH CHECK` clauses.

### Bug 3 — Run save failing: RLS violation

**Error:** `new row violates row-level security policy for table "runs"`

Two compounding issues: (1) the RLS `INSERT` policy lacked `WITH CHECK` (fixed above), and (2) `PlaygroundClient.handleSave` was inserting into `runs` without passing `user_id`. Postgres inserted `NULL`, which failed the policy. Fixed by fetching the current user from the Supabase browser client immediately before the insert and including `user_id` in the payload.

**File:** `src/app/(dashboard)/playground/PlaygroundClient.tsx`

---

## Schema Housekeeping

Created `supabase/migrations/` to document schema state going forward:

- `20260101000000_initial_schema.sql` — full schema: `profiles`, `api_keys`, `runs`, RLS policies, signup trigger
- `20260320000000_api_keys_unique_constraint.sql` — the unique constraint that unblocked the upsert

No migration runner is configured — these files are documentation of what's been applied manually in Supabase. Worth wiring up `supabase db push` if schema changes become frequent.

---

## Rebrand: Prism

Full visual identity pass. 18 files changed.

**Brand decisions:**
- Name: **Prism** — one prompt in, multiple model outputs out. Matches what a prism does to light.
- Tagline: *"One prompt. Every model."*
- Icon: SVG prism triangle with colored refraction lines (indigo, violet, blue, emerald)

**Design system:**
- Dark base: `#0D1117` (page), `#161B22` (surface), `#1E2330` (elevated), `#30363D` (border)
- Text: `#E6EDF3` (primary), `#8B949E` (secondary), `#484F58` (muted)
- Accent: `indigo-500` — used exclusively for primary CTAs and focus rings
- Save button: `emerald-600` — semantically distinct from Run
- Fixed body font: was falling back to Arial despite Geist being loaded

**Landing page:** Hero, 3-feature grid, explicit security section (names AES-256-GCM, explains zero-knowledge key storage), CTA, footer.

**KeyManager:** Inline security callout with shield icon placed directly in the API key form — where user anxiety is highest.

**Header fix (post-deploy):** Logo link was sending authenticated users back to the splash page. Fixed: authenticated users go to `/playground`, demo users go to `/`.

---

## Patterns Worth Noting

**RLS `FOR ALL` doesn't cover writes the way you'd expect.** `FOR ALL USING (...)` applies the USING expression to SELECT, UPDATE, and DELETE — but for INSERT, Postgres requires an explicit `WITH CHECK`. Using `FOR ALL` without `WITH CHECK` silently allows reads while blocking writes. Always split by operation on tables that need insert protection.

**Don't omit `user_id` from inserts when RLS depends on it.** If the `WITH CHECK` policy is `auth.uid() = user_id`, the row must include `user_id`. A missing column means `NULL`, which never matches `auth.uid()`. The error surface is an RLS violation, not a null constraint — easy to misread.

**The Supabase signup trigger is load-bearing.** Any table that FKs to `profiles` will silently fail writes for users who don't have a profile row. The trigger is not set up by default — it must be created explicitly and backfilled for any existing users.

---

# Devlog — March 20, 2026: Code Review Findings & Fixes (M4)

## Summary

Pulled latest main (M4 milestone — demo mode polish, metadata/favicon pass), created branch `claude/m2-implementation-F7Rcl`, and ran a code review over all changed files. Took three rounds to get a clean pass. Found 7 issues across `PlaygroundClient`, `KeyManager`, `history/page.tsx`, and `playground/page.tsx`. All 7 fixed and pushed.

Quick list:

1. `runsUsed` stale — computed at render time, never updated after a demo run
2. Empty draft saved and blindly restored on sign-up navigation
3. `PlaygroundClient.handleSave` missing try/catch/finally — `saving` stuck on network failure
4. `KeyManager.handleSave` missing try/catch/finally — same bug
5. `KeyManager.handleDelete` swallowed thrown errors; no in-flight guard; stale error messages on success
6. `history/page.tsx` — `select("*")` with no limit would load all JSONB for all runs on every page load
7. `playground/page.tsx` — authenticated users visiting `?demo=true` silently downgraded to 3-run demo experience

---

## The Interesting Ones

### #1 — Stale demo run counter

`runsUsed` was computed from `getDemoSession()` in a plain variable at render time — not state. After `incrementDemoRun()` ran post-success, nothing triggered a re-render. The `DemoBanner` count, the Run button's disabled state, and the `limitReached` guard were all frozen at the values from initial render. A user who consumed their last demo run could still see the button enabled.

Fix: `const [runsUsed, setRunsUsed] = useState(() => getDemoSession()?.runsUsed ?? 0)`, then after `incrementDemoRun()` use its return value: `const updated = incrementDemoRun(); setRunsUsed(updated.runsUsed)`. Using the return value rather than `prev + 1` avoids a subtle divergence if `sessionStorage` was modified between mount and the run.

### #5 — handleDelete: three problems in one function

`handleDelete` in `KeyManager` had no try/catch (network error silently swallowed), no in-flight guard (clicking Remove twice fired two DELETE requests for the same key), and didn't clear error/success state on entry (a prior save error would persist visibly even after a successful delete). Fixed all three: try/catch/finally, `deletingId` state to disable the button while in flight, and `setError(null); setSuccess(null)` at entry.

### #7 — Authenticated user silently downgraded to demo mode

`playground/page.tsx` only fetched the Supabase session when `!isDemo`. So an authenticated user navigating to `/playground?demo=true` (e.g. from a shared link) got Claude-only models, a 3-run limit, and no save button — with no indication they were in a restricted mode. The fix: always fetch the session, then `effectiveDemo = isDemo && !user`. If there's an authenticated session, ignore the `?demo=true` param and serve the full experience.

---

## Patterns Worth Noting

**try/catch/finally on every async handler.** Issues #3 and #4 are the same bug in two different components — `setSaving(true)` without a guaranteed `setSaving(false)`. Whenever you set a loading state to `true`, the reset has to be in a `finally` block, not inline after the await. This is easy to miss and invisible in the happy path.

**`incrementDemoRun()` returns the updated session — use it.** The function already returns the new `DemoSession`. Using `prev + 1` instead of the return value creates a second source of truth. Always prefer the authoritative value from the function that mutated state over a local derivation.

**Don't skip session checks based on URL params.** The `?demo=true` bug is a reminder that URL params are user-controlled. Using them to branch on auth-sensitive behavior (which models to show, whether to limit runs) without also checking the actual session is a correctness hole.

---

# Devlog — March 19, 2026: Code Review Findings & Fixes (M2/M3)

## Summary

Ran a code review pass over the M2/M3 work — playground UI, `/api/run`, `/api/keys`, and the history page. Found 10 issues ranging from a genuine performance problem to silent failures and a subtle env var scoping bug. All 10 fixed.

Quick list:

1. scrypt called on every request in `/api/run`
2. Missing env guard in `/api/run/route.ts`
3. Demo run counter incremented before API success
4. Provider not validated in `/api/keys/route.ts`
5. `DEMO_RUN_LIMIT` always 3 on the client
6. `DemoBanner` shows negative remaining runs
7. `handleDelete` in `KeyManager` silently fails
8. Supabase error ignored in `history/page.tsx`
9. Duplicate model IDs cause React key collisions
10. `decryptApiKey` accepts malformed input

---

## The Interesting Ones

### #1 — scrypt on every request

`getEncryptionKey()` in `/api/run/route.ts` was calling `crypto.scryptSync()` inline, which means every authenticated run request was paying the KDF cost. scrypt is *designed* to be slow — that's the point for password hashing, but here we're deriving a key from a static env var that never changes. `/api/keys/route.ts` already had the right pattern: derive once at module load and cache the result. Easy fix, meaningful difference under any load.

### #3 — Demo counter increments on failure

This one is the most user-hostile bug in the batch. `PlaygroundClient` was calling `incrementDemoRun()` before awaiting the fetch response. So if `/api/run` returned a 503, or the request timed out, the user would lose a demo run with nothing to show for it. On a 3-run limit, burning one on a transient error is a bad experience.

The fix is straightforward — move the increment to after a successful response — but it's a good reminder that optimistic state updates need to be thought through carefully. We were being optimistic about a side effect that shouldn't be optimistic.

### #5 — `DEMO_RUN_LIMIT` env var scoping

This one is subtle. `lib/demo.ts` reads `process.env.DEMO_RUN_LIMIT` to determine when to cut off demo users. That works fine server-side, but `isDemoLimitReached()` also runs in the browser (it's reading sessionStorage). In the browser, `DEMO_RUN_LIMIT` is `undefined` because it's not prefixed `NEXT_PUBLIC_`. The fallback was `?? 3`, so the client always enforced a hard limit of 3 regardless of server config. If you ever wanted to bump the limit to 5 without redeploying a hardcoded constant, you'd be confused about why it wasn't working.

Fixed by reading the limit server-side in `playground/page.tsx` (where we have full env access) and passing it down as a `demoRunLimit` prop to `PlaygroundClient`. The client never reads `process.env` for this anymore — it uses what the server passes it.

---

## Patterns Worth Noting

**Silent failures are everywhere.** Issues #7 and #8 are both "something went wrong and the user has no idea." A failed key deletion just... didn't delete. A DB error on the history page rendered an empty list. These are easy to write and hard to notice in testing if you're not actively inducing failures. Worth a checklist pass on any new route or component: what does the error path look like?

**The env/client boundary keeps biting us.** Issue #5 is the second time we've been caught by a non-`NEXT_PUBLIC_` var silently being `undefined` on the client. Worth being more deliberate: any env var used in shared lib code needs explicit scoping thought, not just a `?? default` fallback.

**Validation at the boundary.** Issues #4 and #10 are both about accepting input too loosely. Provider should be an enum check. Encrypted key blobs should be format-validated before you try to use them. OpenSSL errors are not helpful diagnostics.
