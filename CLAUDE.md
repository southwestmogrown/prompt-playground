# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Prism** — A multi-model LLM prompt testing tool. Run any prompt against multiple AI models simultaneously, compare responses side by side, score them, and save runs for later review. Includes a demo mode for unauthenticated visitors.

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
- `app/api/run/route.ts` — core run execution (parallel model calls)
- `app/api/keys/route.ts` — CRUD for encrypted API keys
- `app/api/templates/route.ts` — CRUD for prompt templates (GET, POST, PUT, DELETE)

### Key Library Files

- `lib/types.ts` — all shared TypeScript interfaces (`Run`, `ModelResponse`, `RunRequest`, `DemoSession`, `ProviderName`, etc.)
- `lib/models.ts` — `SUPPORTED_MODELS` and `DEMO_MODELS` — single source of truth for model options
- `lib/pricing.ts` — per-model pricing table and `estimateCost()` for client-side cost estimation
- `lib/diff.ts` — LCS-based `wordDiff()` utility for the diff view
- `lib/demo.ts` — demo session logic, rate limiting, draft persistence, and restore-run storage (all sessionStorage-backed)
- `lib/providers/` — one file per provider (anthropic, openai, google, mistral, groq, xai). Uniform interface: `(modelId, systemPrompt, userMessage, apiKey) → { response, latency_ms }`. Dispatched via `PROVIDER_MAP` in `api/run/route.ts` — adding a provider is one new file + one map entry.
- `lib/supabase/client.ts` — browser client (`createBrowserClient` from `@supabase/ssr`)
- `lib/supabase/server.ts` — server client (`createServerClient`, reads/sets cookies via async Next.js `cookies()`)

### Key Component Files

- `components/playground/ResponseCard.tsx` — per-model response card; shows response text, latency bar, cost estimate, score input, and "Fastest" badge
- `components/playground/DiffView.tsx` — side-by-side word-level diff between two `ModelResponse` objects
- `components/playground/TemplateSelector.tsx` — save/load/edit/delete named system prompt templates; inline edit form, confirm-on-overwrite guard
- `components/history/RunCard.tsx` — expandable history card with "Open in Playground →" button
- `components/shared/KeyManager.tsx` — add/remove encrypted API keys per provider

### Proxy (formerly Middleware)

`src/proxy.ts` handles session refresh and route protection. Next.js 16 renamed `middleware.ts` → `proxy.ts` and `export function middleware` → `export function proxy`. Protects `/playground` and `/history`; redirects authenticated users away from `/login` and `/signup`. The dashboard layout (`app/(dashboard)/layout.tsx`) also guards server-side.

### /api/run Route Behavior

- All selected models execute in **parallel** (`Promise.all`)
- Each model call is wrapped in try/catch — one failure does not block others
- Latency measured per model with `Date.now()`
- Provider dispatch via `PROVIDER_MAP: Record<ProviderName, ProviderFn>` — exhaustiveness enforced by TypeScript
- Demo runs use `DEMO_ANTHROPIC_KEY` and validate against `DEMO_RUN_LIMIT` (server-side, per IP)
- Auth runs validate Supabase session before decrypting and using stored keys

### API Key Storage

Keys are encrypted with AES-256-GCM (Node `crypto.createCipheriv`) using `ENCRYPTION_SECRET` before storing in Supabase. Only the last 4 chars (`key_hint`) are ever returned to the client. Encryption key derived once at module load via `scryptSync` — never per-request.

### Database Tables

- `profiles` — mirrors `auth.users`, created by trigger on signup
- `api_keys` — encrypted provider keys per user; unique on `(user_id, provider)`; RLS: own rows only
- `runs` — saved playground runs with JSONB `responses` array; RLS: own rows only
- `prompt_templates` — named system prompts per user; RLS: own rows only; supports GET/POST/PUT/DELETE

### Adding a Provider

1. `src/lib/providers/{name}.ts` — export `call{Name}(modelId, systemPrompt, userMessage, apiKey) → { response, latency_ms }`
2. `src/lib/types.ts` — add to `ProviderName` union
3. `src/app/api/run/route.ts` — add to `PROVIDER_MAP`
4. `src/lib/models.ts` — add models to `SUPPORTED_MODELS`
5. `src/app/api/keys/route.ts` — add to provider allowlist
6. `src/components/shared/KeyManager.tsx` — add to `PROVIDER_LABELS` and the dropdown

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
