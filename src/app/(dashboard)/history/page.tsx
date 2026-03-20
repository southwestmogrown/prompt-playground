import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "History — Prompt Playground",
};
import Header from "@/components/shared/Header";
import RunList from "@/components/history/RunList";
import type { Run } from "@/lib/types";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: runs, error: runsError } = await supabase
    .from("runs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userEmail={user.email} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">History</h1>
        {runsError ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
            Failed to load history: {runsError.message}
          </p>
        ) : (
          <RunList runs={(runs ?? []) as Run[]} />
        )}
      </main>
    </div>
  );
}
