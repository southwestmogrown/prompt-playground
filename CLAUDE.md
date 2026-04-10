# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**prompt-playground** — A multi-model LLM prompt testing tool. Run any prompt against multiple AI models simultaneously, compare responses side by side, score them, and save runs for later review. Includes a demo mode for unauthenticated visitors.

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

### Key Library Files

- `lib/types.ts` — all shared TypeScript interfaces (`Run`, `ModelResponse`, `RunRequest`, `DemoSession`, etc.)
- `lib/models.ts` — `SUPPORTED_MODELS` and `DEMO_MODELS` — single source of truth for model options
- `lib/demo.ts` — demo session logic and rate limiting (sessionStorage-backed)
- `lib/providers/` — one file per provider (anthropic, openai, google, mistral, groq, xai). Uniform interface: `(modelId, systemPrompt, userMessage, apiKey) → { response, latency_ms }`. Dispatched via `PROVIDER_MAP` in `api/run/route.ts` — adding a provider means adding one file and one entry to that map.
- `lib/supabase/client.ts` — browser client (`createBrowserClient` from `@supabase/ssr`)
- `lib/supabase/server.ts` — server client (`createServerClient`, reads/sets cookies via async Next.js `cookies()`)

### Proxy (formerly Middleware)

`src/proxy.ts` handles session refresh and route protection. Next.js 16 renamed `middleware.ts` → `proxy.ts` and `export function middleware` → `export function proxy`. Protects `/playground` and `/history`; redirects authenticated users away from `/login` and `/signup`. The dashboard layout (`app/(dashboard)/layout.tsx`) also guards server-side.

### /api/run Route Behavior

- All selected models execute in **parallel** (`Promise.all`)
- Each model call is wrapped in try/catch — one failure does not block others
- Latency measured per model with `Date.now()`
- Demo runs use `DEMO_ANTHROPIC_KEY` and validate against `DEMO_RUN_LIMIT` (server-side, per IP)
- Auth runs validate Supabase session before decrypting and using stored keys

### API Key Storage

Keys are encrypted with AES-256-GCM (Node `crypto.createCipheriv`) using `ENCRYPTION_SECRET` before storing in Supabase. Only the last 4 chars (`key_hint`) are ever returned to the client.

### Database Tables

- `profiles` — mirrors `auth.users`
- `api_keys` — encrypted provider keys per user (RLS: own rows only)
- `runs` — saved playground runs with JSONB `responses` array (RLS: own rows only)

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
