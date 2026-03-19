import { createClient } from "@/lib/supabase/server";
import { SUPPORTED_MODELS, DEMO_MODELS } from "@/lib/models";
import PlaygroundClient from "./PlaygroundClient";

interface PageProps {
  searchParams: { demo?: string };
}

export default async function PlaygroundPage({ searchParams }: PageProps) {
  const isDemo = searchParams.demo === "true";

  let userEmail: string | null = null;
  if (!isDemo) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  const models = isDemo ? DEMO_MODELS : SUPPORTED_MODELS;

  return (
    <PlaygroundClient
      models={models}
      isDemo={isDemo}
      userEmail={userEmail}
    />
  );
}
