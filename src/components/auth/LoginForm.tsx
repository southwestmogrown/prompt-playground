"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/playground");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel ghost-border rounded-3xl p-8 space-y-5 shadow-ambient">
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full bg-surface-container-high ghost-border rounded-2xl px-4 py-3 text-sm text-on-surface placeholder-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary/30 transition-all"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full bg-surface-container-high ghost-border rounded-2xl px-4 py-3 text-sm text-on-surface placeholder-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary/30 transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full text-on-primary py-3 px-4 rounded-2xl text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-gradient-to-r from-primary to-primary-container shadow-[0_8px_24px_rgba(160,58,15,0.3)] hover:shadow-[0_12px_32px_rgba(160,58,15,0.4)] hover:-translate-y-0.5"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-on-surface-variant">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-semibold hover:text-primary-container transition-colors">
          Sign up
        </Link>
      </p>
    </form>
  );
}
