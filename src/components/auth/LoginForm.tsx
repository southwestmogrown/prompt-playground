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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg font-mono text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor="email" className="console-label block">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full bg-surface-container border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 font-mono text-sm text-on-surface placeholder-outline focus:outline-none focus:border-primary/50 focus:bg-surface-container-high transition-all"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="console-label block">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full bg-surface-container border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 font-mono text-sm text-on-surface placeholder-outline focus:outline-none focus:border-primary/50 focus:bg-surface-container-high transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-on-primary py-3 px-4 rounded-lg font-mono text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-primary"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center console-label">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:text-on-surface transition-colors">
          Sign up
        </Link>
      </p>
    </form>
  );
}
