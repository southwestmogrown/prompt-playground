"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ModelOption, ModelResponse, RunResult } from "@/lib/types";
import { getDemoSession, incrementDemoRun, saveDraft, getDraft, clearDraft } from "@/lib/demo";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/shared/Header";
import DemoBanner from "@/components/shared/DemoBanner";
import KeyManager from "@/components/shared/KeyManager";
import ModelSelector from "@/components/playground/ModelSelector";
import PromptEditor from "@/components/playground/PromptEditor";
import ResponseCard from "@/components/playground/ResponseCard";

interface PlaygroundClientProps {
  models: ModelOption[];
  isDemo: boolean;
  userEmail?: string | null;
  demoRunLimit: number;
}

export default function PlaygroundClient({
  models,
  isDemo,
  userEmail,
  demoRunLimit,
}: PlaygroundClientProps) {
  const router = useRouter();
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>(
    models.slice(0, 1).map((m) => m.id)
  );
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Restore draft prompt saved before navigating to sign up
  useEffect(() => {
    if (!isDemo) {
      const draft = getDraft();
      if (draft && (draft.systemPrompt || draft.userMessage)) {
        setSystemPrompt(draft.systemPrompt);
        setUserMessage(draft.userMessage);
        clearDraft();
      }
    }
  }, [isDemo]);

  const [runsUsed, setRunsUsed] = useState<number>(
    () => (isDemo ? getDemoSession()?.runsUsed ?? 0 : 0)
  );
  const limitReached = isDemo && runsUsed >= demoRunLimit;

  const modelMap = Object.fromEntries(models.map((m) => [m.id, m.name]));

  function handleSignUp() {
    if (systemPrompt || userMessage) {
      saveDraft(systemPrompt, userMessage);
    }
    router.push("/signup");
  }

  async function handleRun() {
    if (!userMessage.trim()) {
      setError("Please enter a user message.");
      return;
    }
    if (!selectedModels.length) {
      setError("Please select at least one model.");
      return;
    }
    if (isDemo && limitReached) {
      setError("You've used all demo runs. Sign up for more.");
      return;
    }

    setError(null);
    setLoading(true);
    setResponses([]);
    setScores({});
    setSaved(false);
    setSaveError(null);

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt,
          userMessage,
          models: selectedModels,
          isDemo,
        }),
      });

      const data: RunResult & { error?: string } = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Run failed");
        return;
      }

      // Increment only after a confirmed successful response so a network error
      // or server misconfiguration doesn't silently consume a demo run.
      if (isDemo) {
        const updated = incrementDemoRun();
        setRunsUsed(updated.runsUsed);
      }

      setResponses(data.responses);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const responsesWithScores = responses.map((r) => ({
        ...r,
        score: scores[r.model] ?? null,
      }));
      const supabase = createClient();
      const { error: dbError } = await supabase.from("runs").insert({
        system_prompt: systemPrompt,
        user_message: userMessage,
        models: selectedModels,
        responses: responsesWithScores,
      });
      if (dbError) {
        setSaveError(dbError.message);
      } else {
        setSaved(true);
      }
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userEmail={userEmail} isDemo={isDemo} />

      {isDemo && (
        <DemoBanner
          runsUsed={runsUsed}
          runLimit={demoRunLimit}
          limitReached={limitReached}
          onSignUp={handleSignUp}
        />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: inputs */}
          <div className="lg:col-span-1 space-y-4">
            <h1 className="text-xl font-bold text-gray-900">Playground</h1>

            <PromptEditor
              systemPrompt={systemPrompt}
              userMessage={userMessage}
              onSystemPromptChange={setSystemPrompt}
              onUserMessageChange={setUserMessage}
              disabled={loading}
            />

            <ModelSelector
              models={models}
              selected={selectedModels}
              onChange={setSelectedModels}
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleRun}
              disabled={loading || (isDemo && limitReached)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Running…" : isDemo && limitReached ? "Demo limit reached" : "Run"}
            </button>

            {!isDemo && <KeyManager />}
          </div>

          {/* Right panel: responses */}
          <div className="lg:col-span-2">
            {loading && (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                Waiting for responses…
              </div>
            )}

            {!loading && responses.length === 0 && (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                Responses will appear here
              </div>
            )}

            {responses.length > 0 && (
              <div className="space-y-4">
                {!isDemo && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving || saved}
                      className="bg-green-600 text-white py-1.5 px-4 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? "Saving…" : saved ? "Saved!" : "Save Run"}
                    </button>
                    {saveError && (
                      <p className="text-sm text-red-600">{saveError}</p>
                    )}
                  </div>
                )}
                <div
                  className={`grid gap-4 ${
                    responses.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
                  }`}
                >
                  {responses.map((r) => (
                    <ResponseCard
                      key={r.model}
                      response={r}
                      modelName={modelMap[r.model] ?? r.model}
                      score={scores[r.model] ?? null}
                      onScore={(s) => setScores((prev) => ({ ...prev, [r.model]: s }))}
                      isDemo={isDemo}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
