import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import RunList from "@/components/history/RunList";
import type { Run } from "@/lib/types";

export const metadata: Metadata = {
  title: "History — Prism AI",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: runs, error: runsError } = await supabase
    .from("runs")
    .select("id, created_at, models, system_prompt, user_message, responses, name, tags")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(0, 19);

  return (
    <div className="min-h-screen bg-grid text-on-surface">
      <Header userEmail={user.email} />
      <Sidebar userEmail={user.email} />

      <main className="relative lg:ml-56 px-6 py-8 pb-16">
        {/* Page title */}
        <div className="mb-8 flex items-center gap-3">
          <span className="led led-active" />
          <div>
            <h1 className="font-mono font-bold text-lg text-on-surface tracking-wider uppercase">History</h1>
            <p className="console-label mt-0.5">Every saved run, one place. Restore any of them to the playground.</p>
          </div>
        </div>

        {runsError ? (
          <div className="console-panel rounded-xl px-5 py-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-[18px]">error</span>
            <p className="font-mono text-xs text-error">Failed to load history: {runsError.message}</p>
          </div>
        ) : (
          <RunList runs={(runs ?? []) as Run[]} />
        )}
      </main>
    </div>
  );
}
