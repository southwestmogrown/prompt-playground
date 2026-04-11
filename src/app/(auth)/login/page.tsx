import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — Prism AI",
};

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/playground");

  return (
    <main className="min-h-screen bg-grid flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle cyan glow behind form */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)] border-t-[rgba(255,255,255,0.18)]">
            <Image src="/prism-logo.png" alt="Prism" width={56} height={56} className="object-cover w-full h-full" />
          </div>
          <div>
            <p className="font-mono text-xs tracking-widest text-primary uppercase mb-1">Prism AI</p>
            <h1 className="font-headline font-extrabold text-2xl tracking-tighter text-on-surface">Welcome back</h1>
            <p className="text-on-surface-variant text-sm mt-1">Sign in to your account</p>
          </div>
        </div>

        {/* Form panel */}
        <div className="console-panel rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-2">
            <span className="led led-active" />
            <span className="console-label">Authentication</span>
          </div>
          <div className="p-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
