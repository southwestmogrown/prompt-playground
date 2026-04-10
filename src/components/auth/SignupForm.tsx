"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="glass-panel ghost-border rounded-3xl p-8 text-center space-y-4 shadow-ambient">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-100 border border-green-200 mb-1">
          <span className="material-symbols-outlined text-green-600 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <p className="font-headline font-bold text-lg text-on-surface">Check your email</p>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          We sent a confirmation link to{" "}
          <span className="text-on-surface font-semibold">{email}</span>.
          Click it to activate your account.
        </p>
      </div>
    );
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
          minLength={6}
          placeholder="••••••••"
          className="w-full bg-surface-container-high ghost-border rounded-2xl px-4 py-3 text-sm text-on-surface placeholder-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary/30 transition-all"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirm" className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-semibold hover:text-primary-container transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
}
