import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — Prism",
};

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/playground");

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0D1117] px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2 text-[#E6EDF3]">Welcome back</h1>
        <p className="text-center text-sm text-[#8B949E] mb-8">Sign in to your Prism account</p>
        <LoginForm />
      </div>
    </main>
  );
}
