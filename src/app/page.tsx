import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-grid text-on-surface overflow-x-hidden">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-surface-container-low border-b border-[rgba(255,255,255,0.07)]">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
              <Image src="/prism-logo.png" alt="Prism" width={28} height={28} className="object-cover w-full h-full" />
            </div>
            <span className="font-mono text-sm font-medium tracking-widest text-primary uppercase">Prism</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="console-label px-4 py-2 rounded-lg hover:bg-surface-container transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="console-label px-4 py-2 rounded-lg bg-primary text-on-primary font-bold glow-primary transition-all">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-24 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/8 rounded px-3 py-1.5">
              <span className="led led-active" />
              <span className="console-label text-primary">Live streaming · Persona studio · v1.1.2</span>
            </div>

            <h1 className="font-headline font-extrabold tracking-tighter leading-[0.9] text-6xl sm:text-7xl text-on-surface">
              One prompt.{" "}
              <span className="text-primary" style={{ textShadow: "0 0 40px rgba(0,212,255,0.4)" }}>
                Every model.
              </span>
            </h1>

            <p className="text-lg text-on-surface-variant leading-relaxed max-w-lg font-body">
              The multi-model prompt testing tool built for developers who care about output quality.
              Run any prompt across 10 models simultaneously — watch responses stream in live,
              compare word-level diffs, score what works, and save the runs that matter.
            </p>

            <div className="flex flex-wrap gap-6 pt-1">
              {[
                { label: "Providers", value: "6" },
                { label: "Models", value: "10" },
                { label: "Execution", value: "Parallel" },
                { label: "Streaming", value: "Live" },
              ].map((s) => (
                <div key={s.label} className="space-y-0.5">
                  <p className="console-label">{s.label}</p>
                  <p className="font-mono text-sm text-primary font-medium">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/playground?demo=true"
                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-3.5 rounded-lg font-mono font-bold text-sm uppercase tracking-wider glow-primary transition-all"
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Try demo
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-surface-container border border-[rgba(255,255,255,0.1)] text-on-surface px-8 py-3.5 rounded-lg font-mono font-medium text-sm uppercase tracking-wider hover:border-[rgba(255,255,255,0.2)] transition-all"
              >
                Sign up free
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <p className="console-label">No credit card required · Bring your own API keys</p>
          </div>

          {/* Right — hero graphic */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-[80px] scale-125" />
              <div className="absolute inset-8 rounded-full bg-primary/6 blur-[40px]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/prism-logo.png"
                  alt="Prism"
                  width={256}
                  height={256}
                  className="w-64 h-64 object-contain drop-shadow-[0_0_40px_rgba(0,212,255,0.25)]"
                  priority
                />
              </div>
              <div className="absolute -top-3 -right-3 console-panel rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="led led-green" />
                <span className="console-label text-green">10 models live</span>
              </div>
              <div className="absolute -bottom-3 -left-3 console-panel rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="led led-active" />
                <span className="console-label text-primary">Streaming now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators — what nobody else has */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="console-label mb-2 text-primary">What makes Prism different</p>
            <h2 className="font-headline font-extrabold tracking-tighter text-3xl text-on-surface">
              Features you won&apos;t find anywhere else
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Per-model params */}
            <div className="console-panel rounded-xl p-5 border-primary/20 hover:border-primary/40 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface mb-2">Per-model parameters</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed mb-4">
                Set a different temperature, top_p, and max_tokens for each model in the same run. Compare Claude at 0.2 vs GPT-4o at 1.0 — simultaneously.
              </p>
              {/* Mini param demo */}
              <div className="space-y-2 pt-1">
                {[
                  { model: "Claude", temp: "0.20", color: "bg-primary" },
                  { model: "GPT-5.4", temp: "1.00", color: "bg-[#10a37f]" },
                  { model: "Gemini", temp: "0.75", color: "bg-[#4285f4]" },
                ].map((r) => (
                  <div key={r.model} className="flex items-center gap-2">
                    <span className="console-label w-12 shrink-0">{r.model}</span>
                    <div className="flex-1 h-1 bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full`} style={{ width: `${parseFloat(r.temp) * 50}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-primary w-8 text-right">{r.temp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live streaming + TTFT */}
            <div className="console-panel rounded-xl p-5 border-green/20 hover:border-green/40 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-green/10 border border-green/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-green text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>stream</span>
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface mb-2">Live streaming + TTFT</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed mb-4">
                Every response streams token by token. The &ldquo;Fastest&rdquo; badge goes to the first model to produce a token — not the first to finish. That&apos;s a different signal.
              </p>
              {/* Mini streaming demo */}
              <div className="space-y-2 pt-1">
                {[
                  { model: "Groq", ttft: "42ms", badge: true },
                  { model: "Claude", ttft: "310ms", badge: false },
                  { model: "GPT-5.4", ttft: "480ms", badge: false },
                ].map((r) => (
                  <div key={r.model} className="flex items-center gap-2">
                    <span className="console-label w-12 shrink-0">{r.model}</span>
                    <span className="font-mono text-[10px] text-primary">{r.ttft}</span>
                    {r.badge && (
                      <span className="ml-auto flex items-center gap-1 console-label border border-green/30 bg-green/8 text-green px-1.5 py-0.5 rounded text-[9px]">
                        <span className="w-1 h-1 rounded-full bg-green inline-block" />
                        Fastest
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Injection testing */}
            <div className="console-panel rounded-xl p-5 border-secondary/20 hover:border-secondary/40 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface mb-2">Injection testing</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed mb-4">
                Built-in prompt injection and jailbreak test presets. Fire them at every model at once and see which ones hold — and which ones fold.
              </p>
              <div className="space-y-1.5 pt-1">
                {["Ignore previous instructions", "Roleplay as DAN", "Indirect injection via context", "System prompt extraction"].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-secondary shrink-0" />
                    <span className="console-label text-[10px]">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Templates save model selection */}
            <div className="console-panel rounded-xl p-5 border-primary/20 hover:border-primary/40 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface mb-2">Templates remember everything</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed mb-4">
                Save a named template and it restores your system prompt, user message, <em>and</em> exactly which models you had selected. Most tools save only the prompt.
              </p>
              <div className="space-y-1.5 pt-1">
                {[
                  { name: "Code review", models: "Claude · GPT-5.4" },
                  { name: "Security audit", models: "Claude · Mistral · xAI" },
                ].map((t) => (
                  <div key={t.name} className="flex flex-col gap-0.5 bg-surface-container rounded px-2 py-1.5">
                    <span className="font-mono text-[10px] text-on-surface font-medium">{t.name}</span>
                    <span className="console-label text-[9px]">{t.models}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full features bento */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="console-label mb-2">Full capabilities</p>
            <h2 className="font-headline font-extrabold tracking-tighter text-3xl text-on-surface">
              Everything you need to find the best model for the job
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Multi-model playground — wide */}
            <div className="md:col-span-2 console-panel rounded-xl p-6 hover:border-[rgba(255,255,255,0.14)] transition-colors">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
                </div>
                <div className="space-y-2">
                  <p className="console-label">Multi-model execution</p>
                  <h3 className="font-headline font-bold text-xl text-on-surface">6 providers. 10 models. One prompt.</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Claude, GPT-5.4, Gemini, Mistral, Groq, and xAI Grok run in parallel. Responses stream in as tokens arrive — no waiting for the slowest model to finish.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {[
                      { name: "Claude", color: "text-primary border-primary/30 bg-primary/8" },
                      { name: "GPT-4o", color: "text-[#10a37f] border-[#10a37f]/30 bg-[#10a37f]/8" },
                      { name: "Gemini", color: "text-[#4285f4] border-[#4285f4]/30 bg-[#4285f4]/8" },
                      { name: "Mistral", color: "text-[#6a3cc9] border-[#6a3cc9]/30 bg-[#6a3cc9]/8" },
                      { name: "Groq", color: "text-primary border-primary/30 bg-primary/8" },
                      { name: "xAI Grok", color: "text-on-surface border-[rgba(255,255,255,0.1)] bg-surface-container" },
                    ].map((m) => (
                      <span key={m.name} className={`console-label px-2.5 py-1 rounded border ${m.color}`}>{m.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Latency / TTFT card */}
            <div className="console-panel rounded-xl p-6 hover:border-[rgba(255,255,255,0.14)] transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-green/10 border border-green/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
                </div>
                <p className="console-label">Latency visualization</p>
                <h3 className="font-headline font-bold text-xl text-on-surface">VU meter. Per model.</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Per-model latency bars show relative speed at a glance. Cost estimates appear on completion.
                </p>
                <div className="space-y-1.5 pt-2">
                  {[
                    { label: "Groq", pct: 100, ms: "420ms" },
                    { label: "Claude", pct: 61, ms: "690ms" },
                    { label: "GPT-5.4", pct: 44, ms: "960ms" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-2">
                      <span className="console-label w-10 shrink-0 text-[10px]">{r.label}</span>
                      <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${r.pct}%`, boxShadow: "0 0 6px rgba(0,212,255,0.5)" }} />
                      </div>
                      <span className="console-label w-12 text-right text-[10px]">{r.ms}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Word-level diff */}
            <div className="console-panel rounded-xl p-6 hover:border-[rgba(255,255,255,0.14)] transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>compare</span>
                </div>
                <p className="console-label">Diff view</p>
                <h3 className="font-headline font-bold text-xl text-on-surface">Word-level diffs</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  LCS-based word diff between any two responses. Pick which two to compare when running 3+ models.
                </p>
                <div className="font-mono text-xs leading-relaxed pt-1 space-y-1">
                  <p className="text-on-surface-variant">The model <span className="bg-red-500/20 text-red-400 px-0.5 rounded">returned</span><span className="bg-green/20 text-green px-0.5 rounded">generated</span> a response.</p>
                  <p className="text-on-surface-variant"><span className="bg-green/20 text-green px-0.5 rounded">It cited three sources</span> with high confidence.</p>
                </div>
              </div>
            </div>

            {/* History + search + tags — wide */}
            <div className="md:col-span-2 console-panel rounded-xl p-6 hover:border-[rgba(255,255,255,0.14)] transition-colors">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                </div>
                <div className="space-y-2">
                  <p className="console-label">Run history</p>
                  <h3 className="font-headline font-bold text-xl text-on-surface">Save, name, tag, search.</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Every run you save goes to your history with an optional name and free-form tags. Search across name, message, and tags. Restore any past run — prompt and model selection — directly into the playground with one click.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["#security", "#creative", "#code-review", "#gpt-vs-claude"].map((t) => (
                      <span key={t} className="console-label px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Persona selector */}
            <div className="console-panel rounded-xl p-6 hover:border-[rgba(255,255,255,0.14)] transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <p className="console-label">Personas</p>
                <h3 className="font-headline font-bold text-xl text-on-surface">Preset system prompts</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  24 preset system prompts across 5 categories. Preview and edit each persona section by section before applying — or load one directly and keep editing in the field.
                </p>
              </div>
            </div>

            {/* Export as code */}
            <div className="console-panel rounded-xl p-6 hover:border-[rgba(255,255,255,0.14)] transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>code</span>
                </div>
                <p className="console-label">Export</p>
                <h3 className="font-headline font-bold text-xl text-on-surface">Export as code</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Any run exports to SDK code snippets. Copy the exact call that produced the response you want.
                </p>
                <div className="font-mono text-[10px] text-primary bg-surface-container-lowest rounded-lg px-3 py-2 mt-1 border border-[rgba(255,255,255,0.06)]">
                  <span className="text-on-surface-variant">await </span>anthropic.messages.create(&#123;...&#125;)
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="console-panel rounded-xl p-6 hover:border-[rgba(255,255,255,0.14)] transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                </div>
                <p className="console-label">Key storage</p>
                <h3 className="font-headline font-bold text-xl text-on-surface">AES-256 encrypted</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Your API keys are AES-256-GCM encrypted before storage. Only the last 4 chars are ever returned to the client. Your full key is cryptographically inaccessible to us.
                </p>
              </div>
            </div>

            {/* Scoring */}
            <div className="console-panel rounded-xl p-6 hover:border-[rgba(255,255,255,0.14)] transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-green/10 border border-green/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="console-label">Scoring</p>
                <h3 className="font-headline font-bold text-xl text-on-surface">Score every response</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Rate each model&apos;s response 1–5 before saving. Your scores persist with the run in history.
                </p>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="material-symbols-outlined text-[18px]" style={{ color: n <= 4 ? "#4ade80" : "#364550", fontVariationSettings: n <= 4 ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                  ))}
                  <span className="console-label ml-2">4/5</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="console-panel rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <p className="console-label mb-6">How it works</p>
            <h2 className="font-headline font-extrabold tracking-tighter text-3xl text-on-surface mb-8">
              Prompt to answer in three steps
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  icon: "edit_note",
                  title: "Write your prompt",
                  desc: "Enter a system prompt and user message. Load a persona preset, or pull from saved templates — prompt, message, and model selection restored in one click.",
                },
                {
                  step: "02",
                  icon: "tune",
                  title: "Pick models and parameters",
                  desc: "Select any combination of Claude, GPT, Gemini, and more. Set a different temperature and max_tokens for each model if you want to make it a fair fight — or an unfair one.",
                },
                {
                  step: "03",
                  icon: "stream",
                  title: "Watch responses stream in",
                  desc: "Every model streams live as tokens arrive. Score, diff, copy, or export any response. Save the run with a name and tags when you find something worth keeping.",
                },
              ].map((s) => (
                <div key={s.step} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-3xl font-medium text-primary/30 leading-none">{s.step}</span>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                    </div>
                  </div>
                  <h3 className="font-headline font-bold text-base text-on-surface">{s.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Provider strip */}
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="console-panel rounded-xl px-6 py-5">
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              <p className="console-label shrink-0">Supported providers</p>
              <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-end">
                {[
                  { name: "Anthropic", color: "text-primary border-primary/30 bg-primary/8" },
                  { name: "OpenAI", color: "text-[#10a37f] border-[#10a37f]/30 bg-[#10a37f]/8" },
                  { name: "Google", color: "text-[#4285f4] border-[#4285f4]/30 bg-[#4285f4]/8" },
                  { name: "Mistral", color: "text-[#6a3cc9] border-[#6a3cc9]/30 bg-[#6a3cc9]/8" },
                  { name: "Groq", color: "text-primary border-primary/30 bg-primary/8" },
                  { name: "xAI", color: "text-on-surface border-[rgba(255,255,255,0.1)] bg-surface-container" },
                ].map((p) => (
                  <span key={p.name} className={`console-label px-3 py-1.5 rounded border font-semibold ${p.color}`}>{p.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo mode callout */}
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="console-panel rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
              </div>
              <div>
                <p className="font-mono text-sm font-bold text-on-surface">Try the demo — no account required</p>
                <p className="console-label mt-0.5">3 free runs against Claude models. No API key. No signup. Just go.</p>
              </div>
            </div>
            <Link
              href="/playground?demo=true"
              className="shrink-0 inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg font-mono font-bold text-sm uppercase tracking-wider glow-primary transition-all"
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              Launch demo
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto console-panel rounded-xl p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="absolute inset-0 bg-primary/3 pointer-events-none" />
          <div className="relative space-y-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="led led-active" />
              <span className="console-label text-primary">Ready to deploy</span>
            </div>
            <h2 className="font-headline font-extrabold tracking-tighter text-4xl text-on-surface">
              Find your best model.{" "}
              <span className="text-primary" style={{ textShadow: "0 0 30px rgba(0,212,255,0.35)" }}>Fast.</span>
            </h2>
            <p className="text-on-surface-variant">
              Bring your own API keys. Your keys, your data, your history.
              Start free — no credit card, no commitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-3.5 rounded-lg font-mono font-bold text-sm uppercase tracking-wider glow-primary transition-all"
              >
                Create free account
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
              <Link
                href="/playground?demo=true"
                className="inline-flex items-center justify-center gap-2 bg-surface-container border border-[rgba(255,255,255,0.1)] text-on-surface px-8 py-3.5 rounded-lg font-mono font-medium text-sm uppercase tracking-wider hover:border-[rgba(255,255,255,0.2)] transition-all"
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Try demo first
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded overflow-hidden">
              <Image src="/prism-logo.png" alt="Prism" width={20} height={20} className="object-cover" />
            </div>
            <span className="font-mono text-xs tracking-widest text-on-surface-variant uppercase">Prism AI</span>
          </div>
          <p className="console-label">
            © {new Date().getFullYear()} Prism AI · Built for developers who care about output quality.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="console-label hover:text-on-surface transition-colors">Sign in</Link>
            <Link href="/signup" className="console-label hover:text-on-surface transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
