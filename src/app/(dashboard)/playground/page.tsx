import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SUPPORTED_MODELS, DEMO_MODELS } from "@/lib/models";
import PlaygroundClient from "./PlaygroundClient";

export const metadata: Metadata = {
  title: "Playground — Prompt Playground",
};

interface PageProps {
  searchParams: Promise<{ demo?: string }>;
}

export default async function PlaygroundPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const isDemo = params.demo === "true";

  let userEmail: string | null = null;
  if (!isDemo) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  const models = isDemo ? DEMO_MODELS : SUPPORTED_MODELS;
  const demoRunLimit = Number(process.env.DEMO_RUN_LIMIT ?? 3);

  return (
    <PlaygroundClient
      models={models}
      isDemo={isDemo}
      userEmail={userEmail}
      demoRunLimit={demoRunLimit}
    />
  );
}
