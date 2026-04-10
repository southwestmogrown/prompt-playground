import Link from "next/link";

function PrismIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <polygon
        points="20,4 36,34 4,34"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="20" y1="4" x2="20" y2="34" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />
      <line x1="20" y1="4" x2="36" y2="34" stroke="#818cf8" strokeWidth="1.5" strokeOpacity="0.7" />
      <line x1="20" y1="4" x2="28" y2="34" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.55" />
      <line x1="20" y1="4" x2="4"  y2="34" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity="0.7" />
      <line x1="20" y1="4" x2="12" y2="34" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.55" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#0D1117] text-[#E6EDF3]">

      {/* Nav */}
      <nav className="border-b border-[#30363D] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PrismIcon className="w-7 h-7 text-[#E6EDF3]" />
            <span className="text-base font-semibold tracking-tight">Prism</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-md font-medium transition-colors"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-center mb-4">
            <PrismIcon className="w-16 h-16 text-[#E6EDF3]" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            One prompt.{" "}
            <span className="text-indigo-400">Every model.</span>
          </h1>
          <p className="text-lg text-[#8B949E] leading-relaxed max-w-xl mx-auto">
            Run any prompt across Claude, GPT-4, and more — simultaneously.
            See every response side by side, score what works, and save the
            runs that matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/playground?demo=true"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium transition-colors text-sm"
            >
              Try the demo
            </Link>
            <Link
              href="/signup"
              className="border border-[#30363D] text-[#E6EDF3] bg-[#161B22] hover:bg-[#1E2330] px-8 py-3 rounded-lg font-medium transition-colors text-sm"
            >
              Sign up free
            </Link>
          </div>
          <p className="text-xs text-[#484F58]">
            No credit card required. Bring your own API keys.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[#30363D] px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-semibold mb-12 text-[#E6EDF3]">
            Built for the way you actually test prompts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "Run in parallel",
                body: "Every model fires at once. No switching tabs, no copying prompts, no waiting in sequence. Results land together.",
              },
              {
                icon: "◎",
                title: "Compare side by side",
                body: "All responses on one screen. Score each one 1–5 to track quality across runs and find which model fits your use case.",
              },
              {
                icon: "↗",
                title: "Save what matters",
                body: "Every run you save goes to your history. Come back, review, and compare across sessions — not just the current tab.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 space-y-3"
              >
                <span className="text-2xl">{f.icon}</span>
                <h3 className="font-semibold text-[#E6EDF3]">{f.title}</h3>
                <p className="text-sm text-[#8B949E] leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="border-t border-[#30363D] px-6 py-20 bg-[#161B22]">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 4.418-3.134 8.573-7 9.93C8.134 20.573 5 16.418 5 12V7l7-4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-[#E6EDF3]">
            Your API keys never leave your hands.
          </h2>
          <p className="text-[#8B949E] leading-relaxed">
            Every key is encrypted with{" "}
            <span className="text-[#E6EDF3] font-medium">AES-256-GCM</span>{" "}
            using a unique random initialization vector before it ever touches
            our database. We store only the last 4 characters — enough for you
            to identify which key is which. Your full key is cryptographically
            inaccessible to us. Even in a worst-case data breach, your keys
            are protected.
          </p>
          <p className="text-sm text-[#484F58] leading-relaxed">
            You own your keys. You control your usage. Your bill goes directly
            to Anthropic and OpenAI — not through us. We never see your
            traffic or your charges.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#30363D] px-6 py-16 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl font-semibold text-[#E6EDF3]">
            Ready to find your best model?
          </h2>
          <p className="text-[#8B949E] text-sm">
            Start with the demo — no account needed. Upgrade when you&apos;re ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/playground?demo=true"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium transition-colors text-sm"
            >
              Try the demo
            </Link>
            <Link
              href="/signup"
              className="border border-[#30363D] text-[#E6EDF3] bg-[#161B22] hover:bg-[#1E2330] px-8 py-3 rounded-lg font-medium transition-colors text-sm"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#30363D] px-6 py-6 text-center">
        <p className="text-xs text-[#484F58]">
          © {new Date().getFullYear()} Prism. Built for developers who care about output quality.
        </p>
      </footer>

    </main>
  );
}
