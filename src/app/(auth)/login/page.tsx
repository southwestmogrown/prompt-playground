import type { Metadata } from "next";
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
    <main className="min-h-screen bg-mesh flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-40 w-[400px] h-[400px] rounded-full bg-secondary/8 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-container mb-3">
            <span className="material-symbols-outlined text-on-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>filter_vintage</span>
          </div>
          <h1 className="font-headline font-extrabold text-3xl tracking-tighter text-on-surface">Welcome back</h1>
          <p className="text-on-surface-variant text-sm">Sign in to your Prism AI account</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
