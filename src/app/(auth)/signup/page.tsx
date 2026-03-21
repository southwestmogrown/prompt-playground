import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up — Prism",
};

export default async function SignupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0D1117] px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2 text-[#E6EDF3]">Create your account</h1>
        <p className="text-center text-sm text-[#8B949E] mb-8">Free to start. Bring your own API keys.</p>
        <SignupForm />
      </div>
    </main>
  );
}
