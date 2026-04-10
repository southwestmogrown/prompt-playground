"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ModelOption, ModelResponse, RunResult } from "@/lib/types";
import { getDemoSession, incrementDemoRun, saveDraft, getDraft, clearDraft, getRestoreRun, clearRestoreRun } from "@/lib/demo";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/shared/Header";
import DemoBanner from "@/components/shared/DemoBanner";
import KeyManager from "@/components/shared/KeyManager";
import ModelSelector from "@/components/playground/ModelSelector";
import PromptEditor from "@/components/playground/PromptEditor";
import ResponseCard from "@/components/playground/ResponseCard";
import DiffView from "@/components/playground/DiffView";

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
  const [diffMode, setDiffMode] = useState<"off" | "selecting" | "viewing">("off");
  const [diffSelections, setDiffSelections] = useState<string[]>([]);

  // Restore state from a previous draft (pre-signup) or from history "Open in Playground"
  useEffect(() => {
    if (!isDemo) {
      const restore = getRestoreRun();
      if (restore) {
        setSystemPrompt(restore.systemPrompt);
        setUserMessage(restore.userMessage);
        const validIds = new Set(models.map((m) => m.id));
        const validModels = restore.models.filter((id) => validIds.has(id));
        if (validModels.length) setSelectedModels(validModels);
        clearRestoreRun();
        return;
      }
      const draft = getDraft();
      if (draft && (draft.systemPrompt || draft.userMessage)) {
        setSystemPrompt(draft.systemPrompt);
        setUserMessage(draft.userMessage);
        clearDraft();
      }
    }
  }, [isDemo, models]);

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
    setDiffMode("off");
    setDiffSelections([]);

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
      const { data: { user } } = await supabase.auth.getUser();
      const { error: dbError } = await supabase.from("runs").insert({
        user_id: user?.id,
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
    <div className="min-h-screen flex flex-col bg-[#0D1117]">
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
            <h1 className="text-lg font-semibold text-[#E6EDF3] tracking-tight">Playground</h1>

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
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleRun}
              disabled={loading || (isDemo && limitReached)}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Running…" : isDemo && limitReached ? "Demo limit reached" : "Run"}
            </button>

            {!isDemo && <KeyManager />}
          </div>

          {/* Right panel: responses */}
          <div className="lg:col-span-2">
            {loading && (
              <div className="flex items-center justify-center h-40 text-[#484F58] text-sm">
                Waiting for responses…
              </div>
            )}

            {!loading && responses.length === 0 && (
              <div className="flex items-center justify-center h-40 text-[#484F58] text-sm border-2 border-dashed border-[#30363D] rounded-lg">
                Responses will appear here
              </div>
            )}

            {responses.length > 0 && (
              <div className="space-y-4">
                {/* Action bar */}
                <div className="flex items-center gap-3 flex-wrap">
                  {!isDemo && (
                    <button
                      onClick={handleSave}
                      disabled={saving || saved}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-4 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? "Saving…" : saved ? "Saved ✓" : "Save Run"}
                    </button>
                  )}

                  {/* Diff controls — only for non-errored responses */}
                  {responses.filter((r) => !r.error).length >= 2 && (
                    <>
                      {diffMode === "off" && (
                        <button
                          onClick={() => {
                            if (responses.filter((r) => !r.error).length === 2) {
                              setDiffMode("viewing");
                            } else {
                              setDiffMode("selecting");
                              setDiffSelections([]);
                            }
                          }}
                          className="py-1.5 px-4 rounded-lg text-sm font-medium border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#484F58] transition-colors"
                        >
                          Compare
                        </button>
                      )}
                      {(diffMode === "selecting" || diffMode === "viewing") && (
                        <button
                          onClick={() => { setDiffMode("off"); setDiffSelections([]); }}
                          className="py-1.5 px-4 rounded-lg text-sm font-medium border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#484F58] transition-colors"
                        >
                          {diffMode === "selecting" ? "Cancel" : "Exit Compare"}
                        </button>
                      )}
                      {diffMode === "selecting" && (
                        <span className="text-xs text-[#484F58]">
                          {diffSelections.length === 0
                            ? "Select two responses to compare"
                            : "Select one more"}
                        </span>
                      )}
                    </>
                  )}

                  {saveError && <p className="text-sm text-red-400">{saveError}</p>}
                </div>

                {/* Diff view */}
                {diffMode === "viewing" && (() => {
                  const validResponses = responses.filter((r) => !r.error);
                  const [l, r] =
                    diffSelections.length === 2
                      ? [
                          validResponses.find((x) => x.model === diffSelections[0])!,
                          validResponses.find((x) => x.model === diffSelections[1])!,
                        ]
                      : [validResponses[0], validResponses[1]];
                  return (
                    <DiffView
                      left={l}
                      right={r}
                      leftName={modelMap[l.model] ?? l.model}
                      rightName={modelMap[r.model] ?? r.model}
                    />
                  );
                })()}

                {/* Normal response grid */}
                {diffMode !== "viewing" && (
                  <div
                    className={`grid gap-4 ${
                      responses.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
                    }`}
                  >
                    {responses.map((r) => {
                      const isSelected = diffSelections.includes(r.model);
                      const isSelectable = diffMode === "selecting" && !r.error;
                      const isDisabledByLimit = diffMode === "selecting" && diffSelections.length === 2 && !isSelected;

                      function handleDiffSelect() {
                        if (!isSelectable || isDisabledByLimit) return;
                        setDiffSelections((prev) => {
                          const next = isSelected
                            ? prev.filter((id) => id !== r.model)
                            : [...prev, r.model];
                          if (next.length === 2) setDiffMode("viewing");
                          return next;
                        });
                      }

                      return (
                        <div
                          key={r.model}
                          onClick={isSelectable && !isDisabledByLimit ? handleDiffSelect : undefined}
                          className={
                            isSelectable
                              ? isDisabledByLimit
                                ? "opacity-40 cursor-not-allowed"
                                : isSelected
                                  ? "cursor-pointer ring-2 ring-indigo-500 rounded-lg"
                                  : "cursor-pointer hover:ring-2 hover:ring-[#484F58] rounded-lg"
                              : ""
                          }
                        >
                          <ResponseCard
                            response={r}
                            modelName={modelMap[r.model] ?? r.model}
                            score={scores[r.model] ?? null}
                            onScore={(s) => setScores((prev) => ({ ...prev, [r.model]: s }))}
                            isDemo={isDemo}
                            inputText={systemPrompt ? `${systemPrompt}\n${userMessage}` : userMessage}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
