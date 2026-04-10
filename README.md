# Prism

> Run any prompt against multiple AI models at once, compare responses side by side, and save the runs that matter.

Built for developers and prompt engineers who are tired of switching tabs to test the same prompt across GPT-4, Claude, Gemini, and whatever came out last week. Prism puts them all in one place.

---

## Features

- **Multi-model parallel execution** — run a prompt against any combination of supported models simultaneously, results appear as they land
- **6 providers, 15 models** — Anthropic, OpenAI, Google Gemini, Mistral, Groq (Llama), and xAI Grok
- **Side-by-side comparison** — latency bars, cost estimates, and per-model scoring make tradeoffs obvious at a glance
- **Diff view** — highlight word-level differences between any two responses; select which two when running 3+ models
- **Prompt templates** — save and reload named system prompts; edit them in place without delete/recreate
- **Re-run from history** — any saved run can be opened in the playground with prompt and models pre-filled
- **Save and revisit runs** — authenticated users can save scored runs to a searchable history
- **Demo mode** — try it without signing up; 3 runs, no API key required, powered by a server-side Anthropic key
- **Your keys, encrypted** — API keys are stored AES-256-GCM encrypted; only the last 4 characters are ever returned to the client

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Auth & Database | Supabase (Postgres + RLS) |
| AI Providers | Anthropic, OpenAI, Google Generative AI, Mistral, Groq, xAI |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (free tier works)
- At least one AI provider API key (Anthropic, OpenAI, Google, Mistral, Groq, or xAI)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/prompt-playground
cd prompt-playground

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your Supabase URL, anon key, service role key,
# a 32-character ENCRYPTION_SECRET, and your DEMO_ANTHROPIC_KEY

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Setup

Run the migrations in `supabase/migrations/` in order against your Supabase project (SQL editor or `supabase db push`):

| Migration | What it does |
|---|---|
| `20260101000000_initial_schema.sql` | Core tables: `profiles`, `api_keys`, `runs`, RLS policies, signup trigger |
| `20260320000000_api_keys_unique_constraint.sql` | Unique constraint on `(user_id, provider)` for key upserts |
| `20260410000000_prompt_templates.sql` | `prompt_templates` table with RLS |

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role key |
| `DEMO_ANTHROPIC_KEY` | Anthropic key used for unauthenticated demo runs |
| `DEMO_RUN_LIMIT` | Max demo runs per session (default: `3`) |
| `ENCRYPTION_SECRET` | 32-character string used to derive the AES-256 encryption key |

---

## Usage

**Demo mode** — hit the landing page and click "Try Demo." No account needed. You get 3 runs against Claude models using a shared server-side key.

**Authenticated mode** — sign up, add your provider API keys in the playground sidebar, select any combination of models, write your prompt, and run. Score each response, save the run to history, or open a past run to iterate on it.

---

## Supported Models

| Provider | Models |
|---|---|
| Anthropic | Claude Opus 4.6, Claude Sonnet 4.6, Claude Haiku 4.5 |
| OpenAI | GPT-4.1, GPT-4o, GPT-4o Mini, o3-mini |
| Google | Gemini 2.0 Flash, Gemini 1.5 Pro |
| Mistral | Mistral Large, Mistral Small |
| Groq | Llama 3.3 70B, Llama 3.1 8B |
| xAI | Grok 3, Grok 3 Mini |

Demo mode is limited to Anthropic models using a shared server-side key.

---

## Architecture

The app has two distinct operating modes that share the same UI. Demo runs are gated server-side by IP (using `DEMO_RUN_LIMIT`) and use a shared Anthropic key — no user key required. Authenticated runs decrypt the user's stored keys at request time and execute all selected models in parallel via `Promise.all`, with per-model error isolation so one failure doesn't block the others.

Route protection is handled by `src/proxy.ts` (Next.js 16's renamed middleware layer). The dashboard layout adds a secondary server-side auth check.

```
app/
├── page.tsx                    # Landing page
├── (auth)/login + signup       # Unauthenticated auth pages
├── (dashboard)/
│   ├── playground/             # Main prompt UI (server + client components)
│   └── history/                # Saved runs (server component)
└── api/
    ├── run/route.ts            # Parallel model execution
    ├── keys/route.ts           # Encrypted key CRUD
    └── templates/route.ts      # Prompt template CRUD
```

### Adding a Provider

1. Add a file `src/lib/providers/{name}.ts` — export `call{Name}(modelId, systemPrompt, userMessage, apiKey) → { response, latency_ms }`
2. Add the provider name to `ProviderName` in `src/lib/types.ts`
3. Add an entry to `PROVIDER_MAP` in `src/app/api/run/route.ts`
4. Add models to `SUPPORTED_MODELS` in `src/lib/models.ts`
5. Add to the provider allowlist in `src/app/api/keys/route.ts`
6. Add to `PROVIDER_LABELS` in `src/components/shared/KeyManager.tsx`

Mistral, Groq, and xAI all use OpenAI-compatible APIs — their providers reuse the `openai` package with a custom `baseURL`. Only Google required a new SDK (`@google/generative-ai`).

---

## Development

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

---

## Future Features

**Prompt versioning** — group history runs by system prompt, show average score trends over time. MVP can be client-side grouping in `RunList` — no schema changes needed.

**Team workspaces** — shared workspace with unified history and shared templates. Requires new `workspaces` + `workspace_members` tables, RLS overhaul, and workspace switcher UI.

---

## License

MIT
