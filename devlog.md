# Devlog — April 10, 2026: UI Polish + Template Fixes + Model Key Gating

## Summary

Three focused changes in one session: UI bug fixes (scrollable dropdowns, responsive API key form, layout balance), template storage expanded to include user message and model selection, and model selection gated on provider API key availability.

---

## UI Punch List

### 1 — Persona Presets and Injection Testing scrollable

**Problem:** Both accordion panels in the sidebar expanded to reveal all items unbounded — 12 personas + 17 injection tests could push content far down the page.

**Fix:** Wrapped the open-panel content in both `PersonaSelector` and `InjectionPanel` with `max-h-[280px] overflow-y-auto`. In `InjectionPanel`, the "Test All" button and helper text remain below the scroll region so they're always accessible.

**Files:** `src/components/playground/PersonaSelector.tsx`, `src/components/playground/InjectionPanel.tsx`

---

### 2 — API Keys Save button clipped on narrow widths

**Problem:** The add-key form row (`provider select` + `API key input` + `Save button`) had no wrapping behavior. On narrow viewports the row overflowed past the `overflow-hidden rounded-3xl` container, clipping the button mid-letter.

**Fix:** Changed from `flex gap-2` to `flex flex-col sm:flex-row gap-2` — stacks vertically on mobile, horizontal above `sm`. Added `min-w-0` to the input to allow proper shrinking, and `sm:shrink-0` on the select and button.

**Files:** `src/components/shared/KeyManager.tsx`

---

### 3 — Excess space between sidebar and controls

**Problem:** The sidebar was `w-64` with `lg:ml-72` offset — leaving too much white space before the playground controls on wide screens.

**Fix:** Reduced sidebar width from `w-64` → `w-60` and main content offset from `lg:ml-72` → `lg:ml-64`. Recovers ~1rem without restructuring the grid.

**Files:** `src/components/shared/Sidebar.tsx`, `src/app/(dashboard)/playground/PlaygroundClient.tsx`

---

### 4 — ResponseCard markdown rendering + max-height + expand/collapse

**Problem:** Responses rendered as plain text with `whitespace-pre-wrap` — no markdown, no code block styling, no height constraint.

**Fix:**
- Added `react-markdown` dependency
- Replaced plain `<p>` with `<ReactMarkdown>` for proper formatting
- Added `expanded` state and expand/collapse button (arrow icon) in the card header
- Response body: `max-h-52 overflow-y-auto` when collapsed, `max-h-none` when expanded — scrollable in both states
- Tailwind prose overrides for `<code>`, `<pre>`, and `<p>` elements inside the markdown container (monospace, subtle backgrounds)

**Files:** `src/components/playground/ResponseCard.tsx`, `package.json`

---

## Branding: "Prism" → "Prism AI"

Updated all visible brand instances across pages and components:
- Landing page hero, nav logo, footer
- Auth page titles and subtitle ("Sign in to your Prism AI account")
- History page title
- Header and Sidebar logo text

**Files:** `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`, `src/app/(dashboard)/history/page.tsx`, `src/components/shared/Header.tsx`, `src/components/shared/Sidebar.tsx`

---

## Landing Page Visual — Prism Hero Image

**Changes:**
- Replaced the `filter_vintage` icon in the prism visual center with `prism-hero-1.png`
- Swapped `<img>` for Next.js `<Image>` component (eliminates LCP warning)
- Bumped the container from `80×80` to `96×96` for more breathing room
- Nested the same image in all three panes (outer glass card, middle layer, center) at decreasing opacity (60% → 80% → full) creating a recursive refraction effect

**Files:** `src/app/page.tsx`

---

## Template Storage Expanded: Save Full Run Config

**Problem:** "Save as template" only persisted `system_prompt`. Users expected the full run configuration (user message + selected models) to be saved and restored.

**Fix:** Extended the `prompt_templates` table schema and API to store `user_message` (TEXT) and `models` (TEXT[]) alongside `system_prompt`.

**DB Migration:** `supabase/migrations/20260415000000_templates_save_models.sql`
```sql
ALTER TABLE prompt_templates ADD COLUMN IF NOT EXISTS user_message TEXT DEFAULT '';
ALTER TABLE prompt_templates ADD COLUMN IF NOT EXISTS models TEXT[] DEFAULT '{}';
```

**API changes** (`/api/templates/route.ts`):
- `GET`: Returns `user_message` and `models` columns
- `POST`: Accepts and stores all four fields (`name`, `system_prompt`, `user_message`, `models`)
- `PUT`: Updates all four fields

**`TemplateSelector`** (`src/components/playground/TemplateSelector.tsx`):
- New props: `userMessage: string`, `selectedModels: string[]`
- Save form POSTs all four fields
- Inline edit form now shows: name input, system prompt textarea, user message textarea, comma-separated model IDs field
- `PlaygroundClient` passes `userMessage` and `selectedModels` down

**Files:** `supabase/migrations/20260415000000_templates_save_models.sql` (new), `src/app/api/templates/route.ts`, `src/components/playground/TemplateSelector.tsx`, `src/app/(dashboard)/playground/PlaygroundClient.tsx`

---

## Model Selection Gated on API Key Availability

**Problem:** All 15 models were always visible and selectable regardless of which API keys the user had configured. Users would select a model, run, and get a silent failure — they had no way to know which models were actually usable.

**Fix:** Models are now visually marked as available or unavailable based on whether the user has a stored key for that provider.

**`KeyManager`** (`src/components/shared/KeyManager.tsx`):
- New prop: `onKeysChange?: () => void`
- Called after every save and delete, triggering `PlaygroundClient` to re-fetch the current key state

**`PlaygroundClient`** (`src/app/(dashboard)/playground/PlaygroundClient.tsx`):
- Fetches `/api/keys` on mount for authenticated users, derives `storedProviders: ProviderName[]`
- Passes `storedProviders` to `ModelSelector`
- `handleKeysChange()` re-fetches after any `KeyManager` mutation

**`ModelSelector`** (`src/components/playground/ModelSelector.tsx`):
- New prop: `availableProviders: ProviderName[]`
- For each model: if the provider has no stored key:
  - Checkbox disabled
  - Row text muted to `text-outline`
  - `cursor-not-allowed` on the full label
  - Lock icon rendered next to model name
  - Hover tooltip: `"Add your [Provider] API key in API Keys to enable this model"`

**Files:** `src/components/shared/KeyManager.tsx`, `src/app/(dashboard)/playground/PlaygroundClient.tsx`, `src/components/playground/ModelSelector.tsx`

---

## Patterns Worth Noting

**Scroll containers need `overflow-hidden` stripped to work.** Both `PersonaSelector` and `InjectionPanel` had `overflow-hidden` on the outer glass panel, which clips any scroll overflow even when the inner content has `overflow-y-auto`. The scroll container must be inside the clipped boundary — the fix was moving the `max-h` + `overflow-y-auto` onto an inner div, not the panel itself.

**`flex-col sm:flex-row` for responsive stacking without JavaScript.** One CSS class swap handles mobile-first vertical stacking and horizontal layout at the breakpoint — no resize listeners or state needed.

**Disabled checkbox + `cursor-not-allowed` on the label, not just the input.** The `<input type="checkbox" className="sr-only">` pattern hides the native control. If only the input is `disabled`, the visible label still shows a pointer cursor. Setting `cursor-not-allowed` on the `<label>` covers the full clickable area including the visible text.

**Callback props vs. lifting state.** `KeyManager` needed to tell `PlaygroundClient` "keys changed" so PlaygroundClient could re-fetch and propagate the new provider set to `ModelSelector`. The cleanest approach is an `onKeysChange` callback prop — `KeyManager` doesn't need to know anything about how `PlaygroundClient` stores or uses the keys.

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

**What:** A 3px bar at the bottom of each ResponseCard header. Width = `(minLatency / card.latency_ms) × 100%` — fastest card fills the bar, slower ones scale down proportionally. Fastest card also gets a green "Fastest" badge.

Only rendered when 2+ non-errored responses exist.

Computed in `PlaygroundClient` before the render loop — `minLatency` and `isFastest` passed as props to each `ResponseCard`.

**Files:** `src/components/playground/ResponseCard.tsx`, `PlaygroundClient.tsx`

---

## Prompt Templates (v1)

**Schema:** `prompt_templates` table (id, user_id, name, system_prompt, user_message, models, created_at). RLS scoped to owner. Migration: `supabase/migrations/20260415000000_templates_save_models.sql`.

**API:** `/api/templates` — GET, POST, PUT, DELETE. Pattern identical to `/api/keys`. PUT included from the start — delete/recreate loops are bad UX.

**UI:** `TemplateSelector` component in the playground sidebar (hidden in demo mode). Template list with click-to-select → "Load selected" with confirm dialog if the editor has content. Inline edit with pre-filled name + system_prompt + user_message + models fields.

**Files:** `supabase/migrations/20260415000000_templates_save_models.sql` (new), `src/app/api/templates/route.ts`, `src/components/playground/TemplateSelector.tsx` (new), `PlaygroundClient.tsx`

---

## Multi-Provider Expansion

**Providers added:** Google Gemini (`@google/generative-ai` SDK), Mistral, Groq, xAI (all OpenAI-compatible, custom `baseURL`). Total models: 15 across 6 providers.

`PROVIDER_MAP: Record<ProviderName, ProviderFn>` enforces exhaustiveness at compile time — new providers added to the union without a map entry cause a build error, not a runtime `undefined`.

**Files:** `src/lib/providers/` (4 new), `src/lib/types.ts`, `src/app/api/run/route.ts`, `src/lib/models.ts`

---

## Patterns Worth Noting

**Static pricing tables beat live lookups for estimates.** Cost estimation doesn't need to be exact — within 10% is enough. A hardcoded table with a char÷4 approximation handles it with zero runtime cost and no external dependency.

**`Record<Union, V>` as exhaustiveness enforcement.** `PROVIDER_MAP: Record<ProviderName, ProviderFn>` means adding a new provider to the union without a map entry is a compile-time error. Same pattern applied to `PROVIDER_LABELS` in KeyManager.

**OpenAI-compatible APIs reduce integration cost significantly.** Mistral, Groq, and xAI all took under 10 lines each — just a `baseURL` swap on the existing OpenAI client.

**Confirm-on-overwrite at the call site.** `onLoad` in TemplateSelector calls `confirm()` before overwriting a non-empty system prompt — lives in the component that owns the action, not scattered across callers.

**Inline edit over delete/recreate.** Omitting PUT from an API because "MVP" just means users do two round-trips and risk losing their original. Low cost upfront, big UX difference.

**`try/catch/finally` on every async handler.** Always put `setLoading(false)` in a `finally` block — never inline after the await. Easy to miss and invisible in the happy path.

**`incrementDemoRun()` returns the updated session — use it.** Using `prev + 1` instead of the return value creates a second source of truth if sessionStorage diverges.

**URL params don't replace auth checks.** Using `?demo=true` to branch on auth-sensitive behavior without also checking the session is a correctness hole. Always validate session state server-side.

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
