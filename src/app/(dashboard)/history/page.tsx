import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import RunList from "@/components/history/RunList";
import type { Run } from "@/lib/types";

export const metadata: Metadata = {
  title: "History — Prism",
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
    <div className="min-h-screen bg-mesh text-on-surface">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-secondary/6 blur-[100px]" />
      </div>

      <Header userEmail={user.email} />
      <Sidebar userEmail={user.email} />

      <main className="relative lg:ml-72 px-6 py-8 pb-16">
        {/* Page title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
            Your runs
          </div>
          <h1 className="font-headline font-extrabold tracking-tighter text-5xl text-on-surface">
            History
          </h1>
          <p className="text-on-surface-variant mt-2">Every saved run, one place. Restore any of them to the playground.</p>
        </div>

        {runsError ? (
          <div className="glass-panel ghost-border rounded-3xl px-6 py-5 flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-[20px]">error</span>
            <p className="text-sm text-error">Failed to load history: {runsError.message}</p>
          </div>
        ) : (
          <RunList runs={(runs ?? []) as Run[]} />
        )}
      </main>
    </div>
  );
}
