# Prism

> Run any prompt against multiple AI models at once, compare responses side by side, and save the runs that matter.

Built for developers and prompt engineers who are tired of switching tabs to test the same prompt across GPT-4, Claude, Gemini, and whatever came out last week. Prism puts them all in one place.

---

## Features

- **Multi-model parallel execution** — run a prompt against any combination of supported models simultaneously
- **6 providers, 15+ models** — Anthropic, OpenAI, Google Gemini, Mistral, Groq (Llama), and xAI Grok
- **Model parameters** — configure temperature, top_p, and max_tokens per model independently
- **Side-by-side comparison** — latency bars, cost estimates, and per-model scoring
- **Diff view** — word-level diff between any two responses
- **Prompt templates** — save and reload named prompts with system prompt, user message, and model selection
- **Persona selector** — preset system prompt personas (helpful assistant, adversarial, formal, etc.)
- **Injection panel** — preset prompt injection and jailbreak test strings; "Test All" runs the full suite
- **Export as code** — generate SDK snippets for any run
- **Run history** — save, name, and tag runs; search and filter by name, message, or tag; paginated load more
- **Re-run from history** — any saved run restores prompt and models into the playground
- **Delete runs** — inline confirm, optimistic removal
- **Demo mode** — try it without signing up; 3 runs, no API key required
- **Your keys, encrypted** — API keys stored AES-256-GCM encrypted; only the last 4 characters returned to the client

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
- At least one AI provider API key

### Installation

```bash
git clone https://github.com/your-username/prism
cd prism
npm install
cp .env.example .env
# Fill in your Supabase URL, anon key, service role key,
# a 32-character ENCRYPTION_SECRET, and your DEMO_ANTHROPIC_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Setup

Apply migrations in `supabase/migrations/` in order (Supabase SQL editor):

| Migration | What it does |
|---|---|
| `20260101000000_initial_schema.sql` | Core tables: `profiles`, `api_keys`, `runs`, RLS, signup trigger |
| `20260320000000_api_keys_unique_constraint.sql` | Unique constraint on `(user_id, provider)` |
| `20260410000000_prompt_templates.sql` | `prompt_templates` table with RLS |
| `20260415000000_templates_save_models.sql` | Adds `user_message` and `models[]` to templates |
| `20260410120000_runs_name_tags.sql` | Adds `name` and `tags[]` to runs; GIN index |

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

**Demo mode** — hit the landing page and click "Try Demo." No account needed. 3 runs against Claude models.

**Authenticated mode** — sign up, add your provider API keys in the playground sidebar, select models, write your prompt, and run. Adjust per-model parameters, score responses, diff any two, save with a name and tags, or export as code.

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

---

## Architecture

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── (auth)/login + signup           # Auth pages
│   ├── (dashboard)/
│   │   ├── playground/                 # Main prompt UI
│   │   └── history/                    # Saved runs
│   └── api/
│       ├── run/route.ts                # POST: parallel model execution; DELETE: remove run
│       ├── history/route.ts            # GET: paginated run history
│       ├── keys/route.ts               # Encrypted key CRUD
│       └── templates/route.ts          # Prompt template CRUD
├── components/
│   ├── playground/                     # ResponseCard, ModelSelector, ModelParamsPanel, etc.
│   ├── history/                        # RunCard, RunList
│   └── shared/                        # Header, Sidebar, DemoBanner, KeyManager
└── lib/
    ├── providers/                      # One file per AI provider
    ├── types.ts                        # All shared TypeScript interfaces
    ├── models.ts                       # SUPPORTED_MODELS + DEMO_MODELS
    ├── pricing.ts                      # Per-model cost estimates
    ├── personas.ts                     # Preset persona data
    └── injections.ts                   # Preset injection test data
```

### Adding a Provider

1. `src/lib/providers/{name}.ts` — export `call{Name}(modelId, systemPrompt, userMessage, apiKey, params?: ModelParams) → { response, latency_ms }`
2. Add to `ProviderName` union in `src/lib/types.ts`
3. Add to `PROVIDER_MAP` in `src/app/api/run/route.ts`
4. Add models to `SUPPORTED_MODELS` in `src/lib/models.ts`
5. Add to provider allowlist in `src/app/api/keys/route.ts`
6. Add to `PROVIDER_LABELS` in `src/components/shared/KeyManager.tsx` and `src/components/playground/ModelSelector.tsx`

Mistral, Groq, and xAI reuse the `openai` package with a custom `baseURL`. Only Google required a new SDK.

---

## Development

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

---

## Roadmap

- **Streaming responses** — per-model token streaming so cards populate as tokens arrive instead of waiting for the slowest model
- **Injection/red-team suite** — pass/fail detection, resistance scoring per model, red team report export
- **Prompt versioning** — group history by system prompt, track score trends over time
- **Team workspaces** — shared history, templates, and API keys across a team

---

## License

MIT
