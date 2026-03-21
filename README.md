# Prism

> Run any prompt against multiple AI models at once, compare responses side by side, and save the runs that matter.

Built for developers and prompt engineers who are tired of switching tabs to test the same prompt across GPT-4, Claude, and whatever came out last week. Prompt Playground puts them all in one place.

---

## Features

- **Multi-model parallel execution** — run a prompt against any combination of supported models simultaneously, results appear as they land
- **Side-by-side response comparison** — score each response and see latency per model
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
| AI Providers | Anthropic SDK, OpenAI SDK |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (free tier works)
- At least one AI provider API key (Anthropic and/or OpenAI)

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

**Authenticated mode** — sign up, add your Anthropic and/or OpenAI API keys in the playground sidebar, select any combination of models, write your prompt, and run. Score each response, then save the run to history for later review.

---

## Architecture

The app has two distinct operating modes that share the same UI. Demo runs are gated server-side by IP (using `DEMO_RUN_LIMIT`) and use a shared Anthropic key — no user key required. Authenticated runs decrypt the user's stored keys at request time and execute all selected models in parallel via `Promise.all`, with per-model error isolation so one failure doesn't block the others.

Route protection is handled by `src/proxy.ts` (Next.js 16's renamed middleware layer). The dashboard layout adds a secondary server-side auth check.

```
app/
├── page.tsx                  # Landing page
├── (auth)/login + signup     # Unauthenticated auth pages
├── (dashboard)/
│   ├── playground/           # Main prompt UI (server + client components)
│   └── history/              # Saved runs (server component)
└── api/
    ├── run/route.ts          # Parallel model execution
    └── keys/route.ts         # Encrypted key CRUD
```

---

## Development

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

---

## Future Features

Features planned but not yet built, in rough priority order.

**Diff view** — When two responses are selected, highlight what's meaningfully different between them. Useful for comparing subtle prompt variations where the responses look similar at a glance but diverge in specific ways.

**Re-run from history** — An "Open in Playground" button on any history card that pre-fills the prompt editor and model selection from that run. Closes the loop between reviewing past results and iterating on them.

**Token count and cost estimate** — Show an estimated token count and API cost per model run next to the latency figure. Computed from model pricing tables on the server — no external calls needed. Useful for teams with budget constraints or anyone optimizing for cost vs. quality.

**Prompt versioning** — Track how a prompt evolves across runs. If the same system prompt appears in multiple saves, group them and show a quality trend (average score over time). Makes it easier to see whether prompt changes are actually improving output.

**Team workspaces** — Multiple users under a shared workspace with a unified history and shared templates. The natural next step if this moves from individual use to a team tool.

---

## License

MIT
