# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Prism AI** — A multi-model LLM prompt testing tool. Run any prompt against multiple AI models simultaneously, compare responses side by side, score them, and save runs for later review. Includes a demo mode for unauthenticated visitors.

**Stack:** Next.js 16 (App Router, TypeScript), Tailwind CSS v4, Supabase (auth + Postgres), Vercel, Anthropic SDK, OpenAI SDK, Google Generative AI SDK.

## Commands

```bash
npm run dev        # start dev server on localhost:3000
npm run build      # production build
npm run lint       # ESLint
```

## Architecture

### Two Modes of Operation

- **Demo mode** — no login. Server-side API key (`DEMO_ANTHROPIC_KEY`), limited to 3 runs per session (tracked in `sessionStorage`), Claude-only models, no saving. `DemoBanner` persists with signup CTA.
- **Authenticated mode** — full product. Users store their own API keys (encrypted AES-256-GCM), run any combination of supported models, score and save runs to history.

### Route Structure

- `app/page.tsx` — public landing page (Try Demo + Sign Up CTAs)
- `app/(auth)/login` and `app/(auth)/signup` — unauthenticated auth pages
- `app/(dashboard)/playground/page.tsx` — playground (auth-guarded, `/playground`)
- `app/(dashboard)/history/page.tsx` — saved runs, Server Component (`/history`)
- `app/api/run/route.ts` — POST: returns a `ReadableStream` of NDJSON (`{ model, token }` per chunk; `{ model, done, latency_ms }` on completion; `{ model, done, error }` on failure). All models stream concurrently via `PROVIDER_STREAM_MAP`. Demo rate limit increments before stream opens to prevent races. DELETE: remove a run by `?id=`.
- `app/api/history/route.ts` — GET paginated run history (`?limit=20&offset=N`); returns `{ runs, hasMore }`
- `app/api/keys/route.ts` — CRUD for encrypted API keys
- `app/api/templates/route.ts` — CRUD for prompt templates (GET, POST, PUT, DELETE)

### Key Library Files

- `lib/types.ts` — all shared TypeScript interfaces (`Run`, `ModelResponse`, `RunRequest`, `RunResult`, `DemoSession`, `ProviderName`, `ModelParams`, etc.)
- `lib/models.ts` — `SUPPORTED_MODELS` and `DEMO_MODELS` — single source of truth for model options
- `lib/pricing.ts` — per-model pricing table and `estimateCost()` for client-side cost estimation
- `lib/diff.ts` — LCS-based `wordDiff()` utility for the diff view
- `lib/demo.ts` — demo session logic, rate limiting, draft persistence, and restore-run storage (all sessionStorage-backed)
- `lib/providers/` — one file per provider (anthropic, openai, google, mistral, groq, xai). Each exports two functions: `call{Name}(modelId, systemPrompt, userMessage, apiKey, params?) → { response, latency_ms }` (non-streaming, kept for future batch use) and `stream{Name}(...)  → AsyncGenerator<string>` (yields raw token strings). All six providers accept `ModelParams` (temperature, top_p, max_tokens). Dispatched via `PROVIDER_STREAM_MAP` in `api/run/route.ts`.
- `lib/personas.ts` — preset system prompt personas (data only, no UI logic)
- `lib/injections.ts` — preset injection test strings (data only, no UI logic)
- `lib/supabase/client.ts` — browser client (`createBrowserClient` from `@supabase/ssr`)
- `lib/supabase/server.ts` — server client (`createServerClient`, reads/sets cookies via async Next.js `cookies()`)

### Key Component Files

- `components/playground/ResponseCard.tsx` — per-model response card; accepts `streaming` prop. While streaming: LED pulses, latency shows `…`, bar shows animated pulse, blinking cursor appended to text, copy/score hidden. On completion: fixed latency bar, copy and score appear. "Fastest" badge driven by TTFT (time-to-first-token), not completion time.
- `components/playground/DiffView.tsx` — side-by-side word-level diff between two `ModelResponse` objects
- `components/playground/TemplateSelector.tsx` — save/load/edit/delete named templates; stores system_prompt, user_message, and selected_models; inline edit form
- `components/playground/ModelSelector.tsx` — model chip selector; models without a stored API key are disabled with a lock icon and tooltip; `availableProviders` prop gates selection
- `components/playground/ModelParamsPanel.tsx` — accordion panel for per-model inference parameters (temperature, top_p, max_tokens); renders one `ParamSlider` per param; shows a dot indicator when any param differs from default; collapses/expands via local state; renders per-model sections when multiple models selected
- `components/playground/PersonaSelector.tsx` — accordion panel of persona presets; scrollable when open (`max-h-[280px] overflow-y-auto`)
- `components/playground/InjectionPanel.tsx` — accordion panel of injection tests; scrollable when open; "Test All" button below scroll region
- `components/playground/ExportModal.tsx` — modal for exporting a run as code (SDK snippets)
- `components/playground/ScoreInput.tsx` — inline 1–5 score picker for a model response
- `components/history/RunCard.tsx` — expandable history card; shows run name (falls back to truncated user message), model pills, tag pills (clickable — fires `onTagClick`), meta row, inline delete confirm, "Open in Playground" button
- `components/history/RunList.tsx` — Client Component; owns local `runs` state (initialized from server props, 20 at a time); search bar filters across `name`, `user_message`, and `tags` client-side; tag filter bar; "Load more" button fetches next page from `GET /api/history`; passes `onDelete` + `onTagClick` down to RunCards
- `components/shared/Header.tsx` — sticky top bar (h-14); renders logo, nav links, and auth controls. Has two modes: `isDemo` (shows Sign in / Sign up CTAs) and authenticated (shows user email + sign out). On mobile, renders nav links inline; on desktop (lg+) nav lives in the Sidebar instead.
- `components/shared/Sidebar.tsx` — fixed left rail (`w-56`), desktop-only (`hidden lg:flex`). Shows brand block, Playground / History nav with active state (cyan bg + LED dot), and sign out at the bottom. Sits below the Header (`pt-14`).
- `components/shared/DemoBanner.tsx` — thin strip below Header in demo mode; shows runs remaining with a LED status indicator; turns red and shows "Demo limit reached" copy when limit hit; "Sign up free" CTA calls `onSignUp` prop.
- `components/shared/KeyManager.tsx` — add/remove encrypted API keys per provider; `onKeysChange` callback to notify parent of key mutations

### Design System

`app/globals.css` defines all design tokens via `@theme inline` (Tailwind v4 pattern):

- **Primary:** cyan `#00d4ff` (`--color-primary`) — used for active states, badges, accents
- **Secondary:** violet `#8b5cf6`
- **Success/fastest:** green `#4ade80`
- **Surfaces:** layered dark blues — `background` (#070a0d) → `surface-0` → `surface-3` (#1f2b3a)
- **Text:** `on-surface` (#d0dce8), `on-surface-variant` (#6b8394 — muted labels)
- **Fonts:** Manrope (headlines), Inter (body/labels), JetBrains Mono (monospace/values)
- **Utility classes:** `glass-panel` (semi-transparent card), `ghost-border` (subtle border), `console-label` (mono xs muted text for labels/nav), `led` + `led-active` (small colored dot status indicator), `glow-primary` (cyan box-shadow glow on CTA buttons)
- **Icons:** Google Material Symbols (variable font, loaded via `globals.css`); use `<span className="material-symbols-outlined">icon_name</span>`; toggle fill state with `fontVariationSettings: "'FILL' 1"`

No orange. No glassmorphism gradients. Sharp corners preferred on interactive elements.

### Proxy (formerly Middleware)

`src/proxy.ts` handles session refresh and route protection. Next.js 16 renamed `middleware.ts` → `proxy.ts` and `export function middleware` → `export function proxy`. Protects `/playground` and `/history`; redirects authenticated users away from `/login` and `/signup`. The dashboard layout (`app/(dashboard)/layout.tsx`) also guards server-side.

### /api/run Route Behavior

- POST returns a `ReadableStream`; all models stream concurrently via `Promise.all` inside `ReadableStream.start`
- Each model generator is wrapped in try/catch — one failure emits an error chunk without blocking others
- Route emits NDJSON: `{ model, token }` per token, `{ model, done, latency_ms }` on completion, `{ model, done, error, latency_ms }` on failure
- Provider dispatch via `PROVIDER_STREAM_MAP: Record<ProviderName, ProviderStreamFn>`
- `RunRequest.parameters` is an optional `Record<string, ModelParams>` keyed by model ID
- Demo rate limit increments **before** stream opens (prevents race condition with concurrent requests)
- Auth runs validate Supabase session and decrypt keys before stream opens
- `DELETE /api/run?id=<uuid>` — validates session, deletes the run scoped to `user_id`

### API Key Storage

Keys are encrypted with AES-256-GCM (Node `crypto.createCipheriv`) using `ENCRYPTION_SECRET` before storing in Supabase. Only the last 4 chars (`key_hint`) are ever returned to the client. Encryption key derived once at module load via `scryptSync` — never per-request.

### Database Tables

- `profiles` — mirrors `auth.users`, created by trigger on signup
- `api_keys` — encrypted provider keys per user; unique on `(user_id, provider)`; RLS: own rows only
- `runs` — saved playground runs with JSONB `responses` array, optional `name TEXT`, and `tags TEXT[] DEFAULT '{}'`; RLS: own rows only; GIN index on `tags`
- `prompt_templates` — named prompt templates per user; RLS: own rows only; stores `system_prompt`, `user_message`, and `models` (TEXT[]) alongside the name; supports GET/POST/PUT/DELETE

### Adding a Provider

1. `src/lib/providers/{name}.ts` — export `call{Name}(..., params?: ModelParams) → { response, latency_ms }` and `stream{Name}(...) → AsyncGenerator<string>`
2. `src/lib/types.ts` — add to `ProviderName` union
3. `src/app/api/run/route.ts` — add to `PROVIDER_STREAM_MAP`
4. `src/lib/models.ts` — add models to `SUPPORTED_MODELS`
5. `src/app/api/keys/route.ts` — add to provider allowlist
6. `src/components/shared/KeyManager.tsx` — add to `PROVIDER_LABELS` and the dropdown
7. `src/components/playground/ModelSelector.tsx` — add provider to `PROVIDER_LABELS` so the gating tooltip shows the correct label

Mistral, Groq, xAI use OpenAI-compatible APIs — reuse the `openai` package with a custom `baseURL`, no new package needed. Google required `@google/generative-ai`.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server only
DEMO_ANTHROPIC_KEY=              # your key, used for demo runs
DEMO_RUN_LIMIT=3
ENCRYPTION_SECRET=               # 32-char string for AES key derivation
```

All documented in `.env.example`.

## Database Migrations

Migrations live in `supabase/migrations/` and are applied manually in the Supabase SQL editor (no migration runner configured). Apply in order:

1. `20260101000000_initial_schema.sql`
2. `20260320000000_api_keys_unique_constraint.sql`
3. `20260410000000_prompt_templates.sql`
4. `20260415000000_templates_save_models.sql` — adds `user_message TEXT` and `models TEXT[]` to `prompt_templates`
5. `20260410120000_runs_name_tags.sql` — adds `name TEXT` and `tags TEXT[]` to `runs`; GIN index on tags
