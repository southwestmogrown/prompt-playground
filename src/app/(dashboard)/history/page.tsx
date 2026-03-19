import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/shared/Header";
import RunList from "@/components/history/RunList";
import type { Run } from "@/lib/types";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: runs } = await supabase
    .from("runs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userEmail={user.email} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">History</h1>
        <RunList runs={(runs ?? []) as Run[]} />
      </main>
    </div>
  );
}
