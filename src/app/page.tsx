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
            <span className="font-mono text-sm font-medium tracking-widest text-primary uppercase">
              Prism
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="console-label px-4 py-2 rounded-lg hover:bg-surface-container transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="console-label px-4 py-2 rounded-lg bg-primary text-on-primary font-bold glow-primary transition-all"
            >
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
              <span className="console-label text-primary">Multi-model AI testing</span>
            </div>

            <h1 className="font-headline font-extrabold tracking-tighter leading-[0.9] text-6xl sm:text-7xl text-on-surface">
              One prompt.{" "}
              <span className="text-primary" style={{ textShadow: "0 0 40px rgba(0,212,255,0.4)" }}>
                Every model.
              </span>
            </h1>

            <p className="text-lg text-on-surface-variant leading-relaxed max-w-lg font-body">
              Run any prompt across Claude, GPT-4o, Gemini, and more — simultaneously.
              Compare responses side by side, score what works, save the runs that matter.
            </p>

            <div className="flex flex-wrap gap-6 pt-1">
              {[
                { label: "Models", value: "10+" },
                { label: "Parallel", value: "Yes" },
                { label: "Latency", value: "Per-model" },
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
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
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

            <p className="console-label">
              No credit card required · Bring your own API keys
            </p>
          </div>

          {/* Right — prism icon hero */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-80 h-80">
              {/* Cyan glow halo */}
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-[80px] scale-125" />
              <div className="absolute inset-8 rounded-full bg-primary/6 blur-[40px]" />
              {/* Icon */}
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
              {/* Status chips */}
              <div className="absolute -top-3 -right-3 console-panel rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="led led-green" />
                <span className="console-label text-green">10 models live</span>
              </div>
              <div className="absolute -bottom-3 -left-3 console-panel rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="led led-active" />
                <span className="console-label text-primary">Parallel execution</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features bento */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="console-label mb-2">Capabilities</p>
            <h2 className="font-headline font-extrabold tracking-tighter text-3xl text-on-surface">
              Built for the way you actually test prompts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card */}
            <div className="md:col-span-2 console-panel rounded-xl p-6 group hover:border-[rgba(255,255,255,0.14)] transition-colors">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
                </div>
                <div className="space-y-2">
                  <p className="console-label">01 / Multi-model</p>
                  <h3 className="font-headline font-bold text-xl text-on-surface">Multi-model playground</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Fire one prompt at Claude, GPT-4o, Gemini, Mistral, Groq, and xAI simultaneously.
                    All responses land at once — zero tab switching.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["Claude", "GPT-4o", "Gemini", "Mistral", "Groq", "xAI"].map((m) => (
                      <span key={m} className="console-label px-2 py-1 bg-surface-container border border-[rgba(255,255,255,0.07)] rounded">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Latency card */}
            <div className="console-panel rounded-xl p-6 group hover:border-[rgba(255,255,255,0.14)] transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-green/10 border border-green/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
                </div>
                <p className="console-label">02 / Latency</p>
                <h3 className="font-headline font-bold text-xl text-on-surface">Warp speed</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Parallel execution with per-model latency tracking. See exactly who&apos;s fast — and who&apos;s not.
                </p>
                {/* Mini VU meter demo */}
                <div className="space-y-1.5 pt-2">
                  {[100, 72, 45].map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${w}%` }} />
                      </div>
                      <span className="console-label w-10 text-right">{Math.round(1200 / (w / 100))}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security card */}
            <div className="console-panel rounded-xl p-6 group hover:border-[rgba(255,255,255,0.14)] transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                </div>
                <p className="console-label">03 / Security</p>
                <h3 className="font-headline font-bold text-xl text-on-surface">Your keys, your data</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  AES-256-GCM encryption. We store only the last 4 chars. Your full key is cryptographically inaccessible to us.
                </p>
              </div>
            </div>

            {/* History card */}
            <div className="md:col-span-2 console-panel rounded-xl p-6 group hover:border-[rgba(255,255,255,0.14)] transition-colors">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                </div>
                <div className="space-y-2">
                  <p className="console-label">04 / History</p>
                  <h3 className="font-headline font-bold text-xl text-on-surface">Save what matters</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Every run you save goes to your history. Score each response 1–5, compare across sessions,
                    and restore any past run directly into the playground.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="console-panel rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <p className="console-label mb-6">How it works</p>
            <h2 className="font-headline font-extrabold tracking-tighter text-3xl text-on-surface mb-8">
              Three commands to output
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "01", icon: "edit_note", title: "Write your prompt", desc: "Enter a system prompt and user message. Use templates to save and reuse your best setups." },
                { step: "02", icon: "select_all", title: "Pick your models", desc: "Select any combination of Claude, GPT, Gemini, and more. One click enables a model." },
                { step: "03", icon: "compare", title: "Compare & score", desc: "All responses arrive together. Score them, view word-level diffs, save the run." },
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
              <span className="text-primary" style={{ textShadow: "0 0 30px rgba(0,212,255,0.35)" }}>
                Fast.
              </span>
            </h2>
            <p className="text-on-surface-variant">
              Start with the demo — no account needed. Upgrade when you&apos;re ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/playground?demo=true"
                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-3.5 rounded-lg font-mono font-bold text-sm uppercase tracking-wider glow-primary transition-all"
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Try the demo
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-surface-container border border-[rgba(255,255,255,0.1)] text-on-surface px-8 py-3.5 rounded-lg font-mono font-medium text-sm uppercase tracking-wider hover:border-[rgba(255,255,255,0.2)] transition-all"
              >
                Create account
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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
