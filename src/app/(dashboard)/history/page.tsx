import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/shared/Header";
import RunList from "@/components/history/RunList";
import type { Run } from "@/lib/types";

export const metadata: Metadata = {
  title: "History — Prompt Playground",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: runs, error: runsError } = await supabase
    .from("runs")
    .select("id, created_at, models, system_prompt, user_message, responses")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen flex flex-col bg-[#0D1117]">
      <Header userEmail={user.email} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-lg font-semibold text-[#E6EDF3] tracking-tight mb-6">History</h1>
        {runsError ? (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded px-4 py-3">
            Failed to load history: {runsError.message}
          </p>
        ) : (
          <RunList runs={(runs ?? []) as Run[]} />
        )}
      </main>
    </div>
  );
}
