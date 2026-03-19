"use client";

import { useState } from "react";
import type { ModelOption, ModelResponse, RunResult } from "@/lib/types";
import { getDemoSession, incrementDemoRun, isDemoLimitReached, DEMO_RUN_LIMIT } from "@/lib/demo";
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
}

export default function PlaygroundClient({
  models,
  isDemo,
  userEmail,
}: PlaygroundClientProps) {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>(
    models.slice(0, 1).map((m) => m.id)
  );
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoSession = isDemo ? getDemoSession() : null;
  const runsUsed = demoSession?.runsUsed ?? 0;
  const limitReached = isDemo && isDemoLimitReached();

  const modelMap = Object.fromEntries(models.map((m) => [m.id, m.name]));

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

    if (isDemo) {
      incrementDemoRun();
    }

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

      setResponses(data.responses);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userEmail={userEmail} isDemo={isDemo} />

      {isDemo && (
        <DemoBanner runsUsed={runsUsed} runLimit={DEMO_RUN_LIMIT} />
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
