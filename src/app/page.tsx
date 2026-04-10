import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mesh text-on-surface overflow-x-hidden">

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/3 -right-60 w-[500px] h-[500px] rounded-full bg-secondary/8 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-tertiary-container/40 blur-[80px]" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 glass-panel ghost-border shadow-[0_8px_32px_0_rgba(255,127,80,0.08)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[16px] font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                filter_vintage
              </span>
            </div>
            <span className="font-headline font-black tracking-tighter text-lg bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              Prism AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-on-surface-variant hover:text-on-surface transition-colors font-medium px-4 py-2 rounded-xl hover:bg-surface-container-low"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm text-on-primary px-5 py-2 rounded-2xl font-bold bg-gradient-to-r from-primary to-primary-container shadow-[0_4px_20px_rgba(160,58,15,0.3)] hover:shadow-[0_6px_24px_rgba(160,58,15,0.4)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-24 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-2 text-sm font-bold">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                bolt
              </span>
              Intelligence Reimagined
            </div>

            <h1 className="font-headline font-extrabold tracking-tighter leading-[0.9] text-6xl sm:text-7xl text-on-surface">
              One prompt.{" "}
              <span className="bg-gradient-to-r from-primary via-primary-container to-tertiary-container bg-clip-text text-transparent">
                Every model.
              </span>
            </h1>

            <p className="text-xl text-on-surface-variant leading-relaxed max-w-lg">
              Run any prompt across Claude, GPT-4o, Gemini, and more — simultaneously.
              Compare responses side by side, score what works, save the runs that matter.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href="/playground?demo=true"
                className="inline-flex items-center justify-center gap-2 text-on-primary px-8 py-3.5 rounded-2xl font-black bg-gradient-to-r from-primary to-primary-container shadow-[0_10px_30px_rgba(160,58,15,0.3)] hover:shadow-[0_15px_40px_rgba(160,58,15,0.4)] hover:-translate-y-0.5 transition-all duration-300 text-base"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
                Try the demo
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 glass-panel ghost-border text-on-surface px-8 py-3.5 rounded-2xl font-bold hover:-translate-y-0.5 transition-all duration-300 text-base"
              >
                Sign up free
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>

            <p className="text-sm text-outline">
              No credit card required · Bring your own API keys
            </p>
          </div>

          {/* Right — prism visual */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-96 h-96">
              {/* Glow behind */}
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary/20 to-tertiary-container/30 blur-3xl scale-110" />
              {/* Outer glass card */}
              <div className="absolute inset-0 glass-panel ghost-border rounded-[2.5rem] glass-gradient-border" />
              {/* Inner layers — refraction effect */}
              <div className="absolute inset-6 glass-panel ghost-border rounded-[2rem] bg-white/50 overflow-hidden">
                <Image
                  src="/prism-hero-1.png"
                  alt=""
                  fill
                  className="object-cover opacity-60"
                  aria-hidden="true"
                />
              </div>
              <div className="absolute inset-12 glass-panel ghost-border rounded-[1.5rem] bg-white/60 overflow-hidden">
                <Image
                  src="/prism-hero-1.png"
                  alt=""
                  fill
                  className="object-cover opacity-80"
                  aria-hidden="true"
                />
              </div>
              {/* Center icon — official prism icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(37,99,235,0.4)]">
                  <Image
                    src="/prism-icon-official.png"
                    alt="Prism"
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-3 -right-3 glass-panel ghost-border rounded-2xl px-3 py-2 flex items-center gap-1.5 shadow-ambient">
                <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <span className="text-xs font-bold text-on-surface">6 models</span>
              </div>
              <div className="absolute -bottom-3 -left-3 glass-panel ghost-border rounded-2xl px-3 py-2 flex items-center gap-1.5 shadow-ambient">
                <span className="material-symbols-outlined text-[#765600] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>timeline</span>
                <span className="text-xs font-bold text-on-surface">Side-by-side</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features bento grid */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 bg-tertiary/10 border border-tertiary/20 text-tertiary rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
              Features
            </div>
            <h2 className="font-headline font-extrabold tracking-tighter text-4xl text-on-surface">
              Built for the way you actually test prompts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Large card */}
            <div className="md:col-span-2 group relative bg-surface-container-lowest/60 backdrop-blur-[40px] ghost-border rounded-[2rem] p-7 refractive-shadow hover:-translate-y-2 transition-all duration-500 glass-gradient-border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    hub
                  </span>
                </div>
                <h3 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">
                  Multi-model playground
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Fire one prompt at Claude 3.5, GPT-4o, Gemini 1.5, Mistral, Groq, and xAI simultaneously.
                  All responses land at once — zero tab switching, zero repeated pasting.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {["Claude", "GPT-4o", "Gemini", "Mistral", "Groq", "xAI"].map((m) => (
                    <span key={m} className="text-xs font-bold px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tall card */}
            <div className="group relative bg-surface-container-lowest/60 backdrop-blur-[40px] ghost-border rounded-[2rem] p-7 refractive-shadow hover:-translate-y-2 transition-all duration-500 glass-gradient-border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#765600] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    speed
                  </span>
                </div>
                <h3 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">
                  Warp speed
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Parallel execution with per-model latency tracking. See exactly who&apos;s fast — and who&apos;s not.
                </p>
              </div>
            </div>

            {/* Small card */}
            <div className="group relative bg-surface-container-lowest/60 backdrop-blur-[40px] ghost-border rounded-[2rem] p-7 refractive-shadow hover:-translate-y-2 transition-all duration-500 glass-gradient-border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    lock
                  </span>
                </div>
                <h3 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">
                  Your keys, your data
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  AES-256-GCM encryption. We store only the last 4 chars. Your full key is cryptographically inaccessible to us.
                </p>
              </div>
            </div>

            {/* Medium card */}
            <div className="md:col-span-2 group relative bg-surface-container-lowest/60 backdrop-blur-[40px] ghost-border rounded-[2rem] p-7 refractive-shadow hover:-translate-y-2 transition-all duration-500 glass-gradient-border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    history
                  </span>
                </div>
                <h3 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">
                  Save what matters
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Every run you save goes to your history. Score each response 1–5, compare across sessions,
                  and restore any past run directly into the playground — complete with all model responses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface-container-low/40 backdrop-blur-xl ghost-border rounded-[2.5rem] p-10 relative overflow-hidden">
            {/* Decorative orb */}
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="text-center mb-10 space-y-2">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                  How it works
                </div>
                <h2 className="font-headline font-extrabold tracking-tighter text-4xl text-on-surface">
                  Optical inference in 3 steps
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: "01",
                    icon: "edit_note",
                    title: "Write your prompt",
                    desc: "Enter a system prompt and user message. Use templates to save and reuse your best setups.",
                  },
                  {
                    step: "02",
                    icon: "select_all",
                    title: "Pick your models",
                    desc: "Select any combination of Claude, GPT, Gemini, and more. One click enables a model.",
                  },
                  {
                    step: "03",
                    icon: "compare",
                    title: "Compare & score",
                    desc: "All responses arrive together. Score them, view word-level diffs, save the run.",
                  },
                ].map((s) => (
                  <div key={s.step} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-headline font-black text-4xl text-primary/20 leading-none">{s.step}</span>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {s.icon}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-headline font-bold text-lg text-on-surface tracking-tight">{s.title}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-headline font-extrabold tracking-tighter text-5xl text-on-surface">
            Ready to find your{" "}
            <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
              best model?
            </span>
          </h2>
          <p className="text-on-surface-variant text-lg">
            Start with the demo — no account needed. Upgrade when you&apos;re ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/playground?demo=true"
              className="inline-flex items-center justify-center gap-2 text-on-primary px-8 py-3.5 rounded-2xl font-black bg-gradient-to-r from-primary to-primary-container shadow-[0_10px_30px_rgba(160,58,15,0.3)] hover:shadow-[0_15px_40px_rgba(160,58,15,0.4)] hover:-translate-y-0.5 transition-all duration-300 text-base"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              Try the demo
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 glass-panel ghost-border text-on-surface px-8 py-3.5 rounded-2xl font-bold hover:-translate-y-0.5 transition-all duration-300 text-base"
            >
              Create an account
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-low/30 backdrop-blur-xl ghost-border border-t-0 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>filter_vintage</span>
            </div>
            <span className="font-headline font-black text-sm bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              Prism AI
            </span>
          </div>
          <p className="text-xs text-outline">
            © {new Date().getFullYear()} Prism AI · Built for developers who care about output quality.
          </p>
          <div className="flex items-center gap-4 text-xs text-outline">
            <Link href="/login" className="hover:text-on-surface transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-on-surface transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
