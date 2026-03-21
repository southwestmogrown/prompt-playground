# prompt-playground — GitHub Issues

## Repo name
`prompt-playground`

## Description
A multi-model LLM prompt testing tool. Run any prompt against multiple AI models simultaneously, compare responses side by side, score them, and save runs for later review. Includes a demo mode for unauthenticated visitors.

## Stack
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS v4
- Supabase (auth + Postgres database)
- Vercel (frontend + API routes)
- Anthropic SDK, OpenAI SDK

## Two modes of operation

**Demo mode** — no login required. Visitor clicks "Try Demo" on the landing
page. They get a rate-limited session using a server-side API key you control.
Limited to 3 runs per session, Claude only, no saving. A banner persists
throughout with a signup CTA. Zero friction for portfolio visitors.

**Authenticated mode** — full product. User signs up, adds their own API keys
for any supported provider, runs prompts against any combination of models,
scores responses, and saves runs to their history.

---

## Milestones

| Milestone | Due |
|---|---|
| M1 — Foundation + Auth | End of Day 1 |
| M2 — Playground Core | End of Day 2 |
| M3 — Saving + History | End of Day 3 |
| M4 — Demo Mode + Polish | End of Day 4 |
| M5 — Ship | End of Day 5 |

---

## Database schema (set up in Supabase dashboard before writing code)

**profiles**
| Column | Type | Notes |
|---|---|---|
| id | uuid | references auth.users, primary key |
| email | text | |
| created_at | timestamptz | |

**api_keys**
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key, gen_random_uuid() |
| user_id | uuid | references profiles.id |
| provider | text | "anthropic" or "openai" |
| key_hint | text | last 4 chars only, for display |
| key_encrypted | text | full key, encrypted at rest |
| created_at | timestamptz | |

RLS policy: users can only select/insert/delete their own rows.

**runs**
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key, gen_random_uuid() |
| user_id | uuid | references profiles.id |
| system_prompt | text | |
| user_message | text | |
| models | text[] | array of model id strings |
| responses | jsonb | array of ModelResponse objects |
| created_at | timestamptz | |

RLS policy: users can only select/insert their own rows.

---

## Folder structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← auth guard, redirect if not logged in
│   │   ├── page.tsx            ← playground
│   │   └── history/page.tsx
│   ├── api/
│   │   ├── run/route.ts        ← executes prompt against models
│   │   └── keys/route.ts       ← CRUD for stored API keys
│   ├── layout.tsx
│   ├── page.tsx                ← landing page with demo + login CTAs
│   └── globals.css
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── playground/
│   │   ├── PromptEditor.tsx
│   │   ├── ModelSelector.tsx
│   │   ├── ResponseCard.tsx
│   │   └── ScoreInput.tsx
│   ├── history/
│   │   ├── RunList.tsx
│   │   └── RunCard.tsx
│   └── shared/
│       ├── Header.tsx
│       ├── DemoBanner.tsx
│       └── KeyManager.tsx
├── lib/
│   ├── types.ts
│   ├── models.ts               ← supported model definitions
│   ├── demo.ts                 ← demo session logic and rate limiting
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── providers/
│       ├── anthropic.ts
│       └── openai.ts
└── middleware.ts
```

---

## M1 — Foundation + Auth

### #1 — Scaffold project and install dependencies
**Labels:** `setup`
**Milestone:** M1 — Foundation + Auth

Bootstrap the Next.js app, configure Tailwind, install all dependencies, and
establish the full folder structure.

**Dependencies:**
```
@supabase/supabase-js
@supabase/ssr
@anthropic-ai/sdk
openai
```

**Acceptance criteria**
- Repo on GitHub, public, description set
- App runs locally on localhost:3000 with no errors
- All dependencies in package.json
- Folder structure matches plan, placeholder exports in all empty files
- Vercel connected and auto-deploying on push

**Commits**
```
chore: initialize Next.js app with TypeScript and Tailwind
chore: install Supabase, Anthropic, and OpenAI dependencies
chore: establish folder structure with placeholder exports
```

---

### #2 — Define TypeScript types
**Labels:** `types`
**Milestone:** M1 — Foundation + Auth

Create `lib/types.ts` with every shared interface the app needs.

```typescript
export type ProviderName = "anthropic" | "openai";

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  provider: ProviderName;
  key_hint: string;      // last 4 chars, e.g. "sk-...a3f2"
  created_at: string;
}

export interface ModelOption {
  id: string;            // "claude-opus-4-5", "gpt-4o", etc.
  name: string;          // display name
  provider: ProviderName;
  contextWindow: number;
}

export interface ModelResponse {
  model: string;
  response: string;
  score: number | null;  // null until user scores it, 1-5
  latency_ms: number;
  error?: string;        // populated if the model call failed
}

export interface Run {
  id: string;
  user_id: string;
  system_prompt: string;
  user_message: string;
  models: string[];
  responses: ModelResponse[];
  created_at: string;
}

export interface RunRequest {
  systemPrompt: string;
  userMessage: string;
  models: string[];
  isDemo?: boolean;      // true = use server key, skip auth check
}

export interface RunResult {
  responses: ModelResponse[];
}

// Demo session stored in sessionStorage
export interface DemoSession {
  runsUsed: number;      // increments each run, max 3
  startedAt: string;     // ISO timestamp
}
```

**Acceptance criteria**
- All interfaces exported, no TypeScript errors
- Covers every shape used by API routes, Supabase queries, and components

**Commits**
```
feat: define all TypeScript interfaces in lib/types.ts
```

---

### #3 — Configure Supabase and define supported models
**Labels:** `infrastructure`
**Milestone:** M1 — Foundation + Auth

Set up Supabase client files and the model definitions list.

**lib/supabase/client.ts** — browser Supabase client using createBrowserClient
from @supabase/ssr. Used in Client Components.

**lib/supabase/server.ts** — server Supabase client using createServerClient.
Used in Server Components and API routes. Reads and sets cookies via Next.js
headers/cookies.

**lib/models.ts** — static list of supported models. This is the single source
of truth for what appears in the ModelSelector dropdown.

```typescript
import { ModelOption } from "./types";

export const SUPPORTED_MODELS: ModelOption[] = [
  {
    id: "claude-opus-4-5",
    name: "Claude Opus 4.5",
    provider: "anthropic",
    contextWindow: 200000,
  },
  {
    id: "claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    contextWindow: 200000,
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    contextWindow: 200000,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    contextWindow: 128000,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    contextWindow: 128000,
  },
];

// Models available in demo mode — Claude only, server key
export const DEMO_MODELS = SUPPORTED_MODELS.filter(
  (m) => m.provider === "anthropic"
);
```

**env vars needed:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    ← server only, never exposed to client
DEMO_ANTHROPIC_KEY=           ← your key, used for demo runs only
DEMO_RUN_LIMIT=3              ← max runs per demo session
```

**Acceptance criteria**
- Browser and server Supabase clients export correctly
- SUPPORTED_MODELS covers at least 3 Anthropic and 2 OpenAI models
- All env vars documented in .env.example
- No TypeScript errors

**Commits**
```
feat: configure Supabase browser and server clients
feat: define supported models list in lib/models.ts
chore: document all required env vars in .env.example
```

---

### #4 — Implement auth — signup, login, session, route protection
**Labels:** `auth`
**Milestone:** M1 — Foundation + Auth

This is the largest issue in M1. Implement the full auth flow using Supabase.

**middleware.ts** — at the repo root. Intercepts every request, refreshes the
Supabase session, and redirects unauthenticated users away from protected
routes. Protected routes are anything under /(dashboard).

```typescript
// Rough shape — implement using @supabase/ssr createServerClient
export async function middleware(request: NextRequest) {
  // refresh session
  // if no session and route is under /history or / (dashboard), redirect to /login
  // if session exists and route is /login or /signup, redirect to /
}
```

**app/(auth)/login/page.tsx and signup/page.tsx** — server pages that render
LoginForm and SignupForm respectively. If user is already logged in, redirect
to dashboard.

**components/auth/LoginForm.tsx** — email + password inputs, submit calls
Supabase `signInWithPassword`. On success, router.push to dashboard. On error,
show inline error message. "Don't have an account? Sign up" link.

**components/auth/SignupForm.tsx** — email + password + confirm password.
Calls Supabase `signUp`. On success, show "Check your email to confirm your
account" message. "Already have an account? Log in" link.

**app/(dashboard)/layout.tsx** — server component. Gets session from Supabase
server client. If no session, redirect to /login. If session exists, render
children with Header.

**Acceptance criteria**
- Unauthenticated user visiting /history gets redirected to /login
- Successful login redirects to dashboard
- Successful signup shows email confirmation message
- Invalid login credentials show an inline error
- Logged-in user visiting /login gets redirected to dashboard
- Session persists across page refreshes

**Commits**
```
feat: add middleware for session refresh and route protection
feat: add LoginForm with Supabase signInWithPassword
feat: add SignupForm with Supabase signUp
feat: add dashboard layout with server-side auth guard
```

---

## M2 — Playground Core

### #5 — Build PromptEditor component
**Labels:** `component`
**Milestone:** M2 — Playground Core

Two textarea inputs stacked vertically. System prompt on top (collapsible,
optional), user message below (required). Character counts on both. Each has
a clear button. Calls parent onChange with current values.

```typescript
interface PromptEditorProps {
  systemPrompt: string;
  userMessage: string;
  onSystemPromptChange: (value: string) => void;
  onUserMessageChange: (value: string) => void;
  disabled?: boolean;  // true while a run is in progress
}
```

The system prompt section is collapsed by default with a toggle to expand.
This keeps the UI clean for users who don't need it.

**Acceptance criteria**
- System prompt section collapses and expands via toggle
- Character counts update as user types
- Clear buttons reset each field independently
- Both fields disabled while disabled prop is true
- onChange fires on every keystroke

**Commits**
```
feat: add PromptEditor with collapsible system prompt
```

---

### #6 — Build ModelSelector component
**Labels:** `component`
**Milestone:** M2 — Playground Core

A grid of model cards. Each card shows the model name, provider badge, and
context window. Clicking toggles selection. At least 2 models must be selected
to run (enforced via disabled state on the Run button in the parent, not here).
In demo mode, only DEMO_MODELS are shown and an "Authenticated models locked"
message appears below.

```typescript
interface ModelSelectorProps {
  selected: string[];           // array of selected model IDs
  onChange: (models: string[]) => void;
  isDemo?: boolean;
  availableProviders: ProviderName[];  // which providers the user has keys for
}
```

Models the user doesn't have a key for are shown but disabled with a "Add
[Provider] key" tooltip. This nudges users to add their keys rather than hiding
options entirely.

**Acceptance criteria**
- Clicking a card toggles it in/out of selected array
- Selected cards have a visible active state (border-accent)
- Models without a key are visibly disabled with tooltip
- Demo mode shows only Anthropic models
- Provider badge shows "Anthropic" or "OpenAI" with distinct colors

**Commits**
```
feat: add ModelSelector with provider-aware disabled states
```

---

### #7 — Build /api/run route
**Labels:** `api`
**Milestone:** M2 — Playground Core

The core API route. Accepts a RunRequest, retrieves the user's API keys from
Supabase (or uses the demo key if isDemo is true), calls each selected model
in parallel, and returns a RunResult.

**Key decisions baked in:**
- Model calls run in parallel with Promise.all — not sequentially
- Each call is wrapped in try/catch so one failure doesn't kill the whole run
- Latency is measured per model with Date.now()
- Demo runs are validated against DEMO_RUN_LIMIT (tracked server-side via a
  simple in-memory counter per IP — good enough for demo use)
- Auth runs validate the Supabase session before fetching keys

**lib/providers/anthropic.ts** — wrapper function that accepts a model ID,
system prompt, user message, and API key. Returns { response, latency_ms } or
throws on error.

**lib/providers/openai.ts** — same shape as the Anthropic wrapper.

**Acceptance criteria**
- POST with valid auth session and 2 models returns 2 ModelResponse objects
- POST with isDemo:true uses DEMO_ANTHROPIC_KEY, no session required
- Demo runs beyond DEMO_RUN_LIMIT return 429 with a clear error message
- One model failing does not prevent other models from returning
- Latency is measured and returned per model
- Returns 401 if session is invalid on non-demo run

**Commits**
```
feat: add Anthropic and OpenAI provider wrappers in lib/providers
feat: add /api/run route with parallel model execution
feat: add demo run validation and rate limiting to /api/run
```

---

### #8 — Build ResponseCard and ScoreInput components
**Labels:** `component`
**Milestone:** M2 — Playground Core

ResponseCard displays a single model's response. Shows model name and provider
badge at the top, response text below, latency in the footer, and ScoreInput
at the bottom.

```typescript
interface ResponseCardProps {
  response: ModelResponse;
  onScore: (score: number) => void;
  isLoading?: boolean;
}
```

ScoreInput is a row of 5 star buttons. Clicking a star sets the score for that
response. Selected stars fill with accent color. Unselected are muted outlines.

```typescript
interface ScoreInputProps {
  value: number | null;
  onChange: (score: number) => void;
  disabled?: boolean;
}
```

Loading state shows a pulsing skeleton where the response text will appear,
with the model name still visible so the user knows which model is running.

**Acceptance criteria**
- ResponseCard renders model name, provider badge, response text, latency
- ScoreInput shows 5 stars, selected ones fill with accent color
- Clicking a star calls onScore with the star number (1-5)
- Loading skeleton pulses while isLoading is true
- Error state shows error message if response.error is populated

**Commits**
```
feat: add ResponseCard with loading skeleton
feat: add ScoreInput with 5-star rating
```

---

### #9 — Assemble playground page
**Labels:** `integration`
**Milestone:** M2 — Playground Core

Compose all playground components in app/(dashboard)/page.tsx. Wire the full
run flow: collect prompt + models, POST to /api/run, render responses as they
return, enable scoring.

**State to manage:**
```typescript
const [systemPrompt, setSystemPrompt] = useState("");
const [userMessage, setUserMessage] = useState("");
const [selectedModels, setSelectedModels] = useState<string[]>([]);
const [responses, setResponses] = useState<ModelResponse[]>([]);
const [isRunning, setIsRunning] = useState(false);
const [availableProviders, setAvailableProviders] = useState<ProviderName[]>([]);
```

**Run button disabled when:**
- isRunning is true
- userMessage is empty
- selectedModels.length < 2

**Score update logic:**
When a user scores a response, update the local responses state immediately
(optimistic update) then persist to Supabase in the background. In M3 this
connects to the save flow.

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Header                                     │
├─────────────┬───────────────────────────────┤
│             │                               │
│  Prompt     │  Model Selector               │
│  Editor     │                               │
│             ├───────────────────────────────┤
│             │  [Run Button]                 │
├─────────────┴───────────────────────────────┤
│  Response Cards (side by side)              │
└─────────────────────────────────────────────┘
```

**Acceptance criteria**
- Full page renders without errors
- Run button triggers API call and populates response cards
- At least 2 models required to enable Run button
- Responses render side by side (grid-cols-2 for 2 models, grid-cols-3 for 3)
- Scoring a response updates the star display immediately

**Commits**
```
feat: assemble playground page with full run flow
```

---

## M3 — Saving + History

### #10 — Build /api/keys route and KeyManager component
**Labels:** `feature`
**Milestone:** M3 — Saving + History

Users need to add their API keys before they can use non-demo models. The key
is encrypted before storing in Supabase and never returned in full — only the
hint (last 4 chars) is ever sent back to the client.

**app/api/keys/route.ts:**
- GET — returns list of user's stored keys (id, provider, hint, created_at only)
- POST — accepts { provider, key }, encrypts key, stores in Supabase
- DELETE — accepts key id, deletes from Supabase

Encryption: use Node's built-in `crypto.createCipheriv` with AES-256-GCM.
Key is derived from ENCRYPTION_SECRET env var.

**components/shared/KeyManager.tsx:**
A settings panel (modal or sidebar). Lists stored keys by provider with their
hint. Add key button opens an inline input. Delete button removes a key with a
confirmation step.

**Acceptance criteria**
- User can add an Anthropic key and see it appear as "...a3f2"
- User can add an OpenAI key separately
- User can delete a key with a confirmation prompt
- Keys are never returned in full from the API
- ModelSelector reflects available providers immediately after key is added

**Commits**
```
feat: add /api/keys route with AES-256-GCM encryption
feat: add KeyManager component for adding and removing API keys
```

---

### #11 — Save runs to Supabase
**Labels:** `feature`
**Milestone:** M3 — Saving + History

After a run completes and the user has scored at least one response, a Save
button appears. Clicking it POSTs the full run to Supabase. Demo runs cannot
be saved — the Save button is hidden in demo mode.

Add the save logic to the playground page:

```typescript
const saveRun = async () => {
  const run = {
    system_prompt: systemPrompt,
    user_message: userMessage,
    models: selectedModels,
    responses: responses,
  };
  const { error } = await supabase.from("runs").insert(run);
  if (error) { /* show error toast */ }
  else { /* show success toast, clear form */ }
};
```

**Acceptance criteria**
- Save button appears after run completes
- Save button hidden in demo mode
- Successful save shows a brief success confirmation
- Saved run appears in history page
- Supabase RLS prevents users from reading other users' runs

**Commits**
```
feat: add run saving to Supabase with RLS validation
```

---

### #12 — Build history page
**Labels:** `feature`
**Milestone:** M3 — Saving + History

app/(dashboard)/history/page.tsx — server component that fetches the user's
runs from Supabase and renders them as a list.

**components/history/RunList.tsx** — maps over runs array, renders a RunCard
for each. Empty state if no runs yet.

**components/history/RunCard.tsx** — shows truncated user message, models used
as pills, best score, and created_at timestamp. Expandable to show full
responses inline.

**Acceptance criteria**
- History page shows all saved runs in reverse chronological order
- Each card shows user message preview, model pills, and timestamp
- Expanding a card reveals full responses and scores
- Empty state renders when user has no saved runs
- Page is a Server Component — data fetched on the server, no client fetch

**Commits**
```
feat: add history page with server-side run fetching
feat: add RunCard with expandable response view
```

---

## M4 — Demo Mode + Polish

### #13 — Build landing page and demo mode
**Labels:** `feature`
**Milestone:** M4 — Demo Mode + Polish

app/page.tsx — the public landing page. Not behind auth. Two CTAs: "Try Demo"
and "Sign Up". Brief description of what the tool does.

**Demo flow:**
1. User clicks "Try Demo"
2. A DemoSession is created in sessionStorage: `{ runsUsed: 0, startedAt: ISO }`
3. User is redirected to the playground with isDemo:true in session state
4. DemoBanner renders at the top showing runs remaining (e.g. "2 of 3 demo runs used")
5. After 3 runs, banner changes to "Demo limit reached — sign up to continue"
6. ModelSelector shows only DEMO_MODELS
7. Save button is hidden

**components/shared/DemoBanner.tsx** — sticky banner below Header. Shows runs
used / runs remaining. Sign Up button on the right. Dismissible only after
signing up.

**Acceptance criteria**
- Landing page renders with both CTAs
- Clicking Try Demo creates session and redirects to playground
- DemoBanner shows correct run count throughout session
- After 3 runs, playground inputs are disabled with upgrade message
- Signing up from the banner preserves the current prompt as a draft

**Commits**
```
feat: add landing page with demo and signup CTAs
feat: add demo session logic in lib/demo.ts
feat: add DemoBanner with run count and signup CTA
```

---

### #14 — Polish pass
**Labels:** `polish`
**Milestone:** M4 — Demo Mode + Polish

Loading states, error handling, empty states, responsive layout check, page
titles, favicons.

**Acceptance criteria**
- No layout shift during run execution
- Error toast appears if /api/run returns non-200
- All pages have correct titles
- Mobile layout is at minimum not broken (not required to be perfect)
- Console is clean — no errors or warnings in production build

**Commits**
```
fix: add error toasts and loading states throughout
chore: set page titles and favicon
```

---

## Backlog — Future Features

### #16 — Prompt templates
**Labels:** `feature`, `backlog`

Let users save a named prompt template (system prompt + user message) and load it into the playground with one click. Templates live in Supabase under a `templates` table (user_id, name, system_prompt, user_message, created_at). A template picker dropdown appears above the PromptEditor. Selecting a template fills both fields. Users can also save the current prompt as a new template directly from the playground.

**Schema addition:**
```sql
CREATE TABLE public.templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  system_prompt TEXT NOT NULL DEFAULT '',
  user_message  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates: own rows" ON public.templates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

**Acceptance criteria**
- User can save the current prompt as a named template
- Template picker lists saved templates; selecting one fills PromptEditor
- Templates persist across sessions
- User can delete a template from the picker
- Empty state in the picker prompts user to save their first template

---

### #17 — Copy response button
**Labels:** `feature`, `backlog`

Add a clipboard icon button to the top-right of each ResponseCard. Clicking it copies the full response text to the clipboard. Button shows a brief "Copied!" state (checkmark icon, 1.5s) then resets. No new dependencies — use the `navigator.clipboard` API. Works in both demo and authenticated mode.

**Acceptance criteria**
- Clipboard icon visible on every ResponseCard (not just on hover — always present)
- Click copies `response.response` to clipboard
- Button transitions to a checkmark for 1.5s then resets to clipboard icon
- Button is not shown when `response.error` is populated (nothing to copy)

---

### #18 — Delete run from history
**Labels:** `feature`, `backlog`

Add a delete button to each RunCard in history. Clicking it removes the run from Supabase and from the local list without a full page refresh. Requires a `DELETE` endpoint — the existing `/api/run` route only handles `POST`. Add a new route or extend an existing one. Show a confirmation step (inline, not a modal) before deleting. The existing RLS policy on `runs` already allows delete for own rows.

**Acceptance criteria**
- Delete button visible on each RunCard (collapsed state)
- Clicking shows an inline "Are you sure? [Delete] [Cancel]" confirmation
- Confirming removes the row from Supabase and removes the card from the list optimistically
- Cancelling dismisses the confirmation with no change
- Failed delete shows an inline error and restores the card if it was removed optimistically

---

### #19 — Run naming and tagging
**Labels:** `feature`, `backlog`

Let users give a run a name and optional tags before (or after) saving. Name defaults to a truncation of the user message. Tags are free-form strings stored as a `text[]` column on the `runs` table. The history page gets a tag filter — clicking a tag filters the list to runs with that tag. Adds a `name` (text) and `tags` (text[]) column to the `runs` table via migration.

**Schema addition:**
```sql
ALTER TABLE public.runs ADD COLUMN name TEXT;
ALTER TABLE public.runs ADD COLUMN tags TEXT[] NOT NULL DEFAULT '{}';
CREATE INDEX runs_tags_idx ON public.runs USING GIN (tags);
```

**Acceptance criteria**
- Save Run dialog prompts for an optional name and tags (comma-separated input)
- Name defaults to first 60 chars of user message if left blank
- Tags render as pills on RunCard in history
- Clicking a tag in history filters the list to runs with that tag
- Tag filter shows a clear/reset button when active

---

### #20 — Streaming responses
**Labels:** `feature`, `backlog`

Replace the current batch response model (all models return together when the slowest finishes) with streaming. Each ResponseCard starts populating as tokens arrive from its model. This requires changing `/api/run` from a single JSON response to a streaming response using the Web Streams API, and updating `PlaygroundClient` to consume the stream and update each card incrementally.

Both Anthropic and OpenAI SDKs support streaming natively. The server emits newline-delimited JSON — one object per token per model — and the client appends tokens to the appropriate card's buffer.

**Key decisions:**
- Use `TransformStream` and `ReadableStream` on the server — no external dependencies
- Client uses `fetch` + `response.body.getReader()` to consume the stream
- Each streamed chunk includes a `model` field so the client routes tokens to the right card
- Latency is still measured and included in a terminal `done` event per model

**Acceptance criteria**
- Each ResponseCard begins showing text as it streams in, not after all models finish
- Cards update independently — a fast model populates fully while a slow one is still streaming
- Latency reported in the card footer after streaming completes
- Loading skeleton replaced with live streaming text
- Error handling: if a model stream errors mid-stream, the card shows the error and stops

---

## M5 — Ship

### #15 — Write README and deploy to production
**Labels:** `docs`
**Milestone:** M5 — Ship

README covers: what it is, how it works, local setup, env var documentation,
demo mode instructions, and a "why I built this" section tying it to the
QuizQuest eval harness work.

**Production env vars:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DEMO_ANTHROPIC_KEY=
DEMO_RUN_LIMIT=3
ENCRYPTION_SECRET=       ← 32-char random string for AES key derivation
```

**Acceptance criteria**
- README renders cleanly on GitHub
- Production URL live on Vercel
- All env vars set in Vercel dashboard
- Demo mode works on production URL
- Loom demo recorded (2 minutes max — show demo mode, then show authenticated mode)
- Issues #1–14 closed, all milestones marked complete

**Commits**
```
docs: add README with setup, env vars, and project context
chore: configure all production environment variables
```