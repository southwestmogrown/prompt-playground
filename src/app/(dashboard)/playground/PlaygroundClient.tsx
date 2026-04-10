"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ModelOption, ModelResponse, RunResult, ModelParams, ProviderName } from "@/lib/types";
import { getDemoSession, incrementDemoRun, saveDraft, getDraft, clearDraft, getRestoreRun, clearRestoreRun } from "@/lib/demo";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import DemoBanner from "@/components/shared/DemoBanner";
import KeyManager from "@/components/shared/KeyManager";
import ModelSelector from "@/components/playground/ModelSelector";
import PromptEditor from "@/components/playground/PromptEditor";
import ResponseCard from "@/components/playground/ResponseCard";
import DiffView from "@/components/playground/DiffView";
import TemplateSelector from "@/components/playground/TemplateSelector";
import PersonaSelector from "@/components/playground/PersonaSelector";
import ExportModal from "@/components/playground/ExportModal";
import InjectionPanel from "@/components/playground/InjectionPanel";

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
  const [showExport, setShowExport] = useState(false);
  const [modelParams] = useState<Record<string, ModelParams>>({});

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
  const [storedProviders, setStoredProviders] = useState<ProviderName[]>([]);

  // Fetch stored keys to determine which providers are available
  useEffect(() => {
    if (isDemo) return;
    async function loadKeys() {
      try {
        const res = await fetch("/api/keys");
        if (!res.ok) return;
        const data = await res.json();
        const providers = (data.keys ?? []).map((k: { provider: ProviderName }) => k.provider);
        setStoredProviders(providers);
      } catch { /* ignore */ }
    }
    loadKeys();
  }, [isDemo]);

  function handleKeysChange() {
    // Re-fetch stored keys after KeyManager changes
    async function loadKeys() {
      try {
        const res = await fetch("/api/keys");
        if (!res.ok) return;
        const data = await res.json();
        const providers = (data.keys ?? []).map((k: { provider: ProviderName }) => k.provider);
        setStoredProviders(providers);
      } catch { /* ignore */ }
    }
    loadKeys();
  }
  const limitReached = isDemo && runsUsed >= demoRunLimit;
  const modelMap = Object.fromEntries(models.map((m) => [m.id, m.name]));

  function handleSignUp() {
    if (systemPrompt || userMessage) {
      saveDraft(systemPrompt, userMessage);
    }
    router.push("/signup");
  }

  async function handleRunWithMessage(message: string) {
    setUserMessage(message);
    await runPrompt(message);
  }

  async function handleRun() {
    await runPrompt(userMessage);
  }

  async function runPrompt(message: string) {
    if (!message.trim()) {
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
          userMessage: message,
          models: selectedModels,
          isDemo,
        }),
      });

      const data: RunResult & { error?: string } = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Run failed");
        return;
      }

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
    <div className="min-h-screen bg-mesh text-on-surface">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[400px] h-[400px] rounded-full bg-secondary/6 blur-[100px]" />
      </div>

      <Header userEmail={userEmail} isDemo={isDemo} />

      {isDemo && (
        <DemoBanner
          runsUsed={runsUsed}
          runLimit={demoRunLimit}
          limitReached={limitReached}
          onSignUp={handleSignUp}
        />
      )}

      {!isDemo && <Sidebar userEmail={userEmail} />}

      <main className={`relative ${!isDemo ? "lg:ml-64" : ""} px-4 sm:px-6 py-6 pb-16`}>
        <div className="max-w-7xl mx-auto">

          {/* Page header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-headline font-extrabold tracking-tighter text-3xl text-on-surface">
                Playground
              </h1>
              <p className="text-on-surface-variant text-sm mt-0.5">
                Run any prompt across multiple models simultaneously
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left panel */}
            <div className="lg:col-span-1 space-y-4">

              <PersonaSelector
                systemPrompt={systemPrompt}
                onLoad={(prompt) => setSystemPrompt(prompt)}
              />

              <PromptEditor
                systemPrompt={systemPrompt}
                userMessage={userMessage}
                onSystemPromptChange={setSystemPrompt}
                onUserMessageChange={setUserMessage}
                disabled={loading}
              />

              <InjectionPanel
                onInject={setUserMessage}
                onInjectAndRun={handleRunWithMessage}
                loading={loading}
              />

              {!isDemo && (
                <TemplateSelector
                  systemPrompt={systemPrompt}
                  userMessage={userMessage}
                  selectedModels={selectedModels}
                  onLoad={(prompt) => setSystemPrompt(prompt)}
                />
              )}

              <ModelSelector
                models={models}
                selected={selectedModels}
                onChange={setSelectedModels}
                availableProviders={storedProviders}
              />

              {error && (
                <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-error rounded-2xl px-4 py-3 text-sm">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {error}
                </div>
              )}

              {/* Execute Run button */}
              <button
                onClick={handleRun}
                disabled={loading || (isDemo && limitReached)}
                className="w-full inline-flex items-center justify-center gap-2 text-on-primary py-3.5 px-6 rounded-2xl font-black disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-gradient-to-r from-primary to-primary-container shadow-[0_10px_30px_rgba(160,58,15,0.3)] hover:shadow-[0_15px_40px_rgba(160,58,15,0.4)] hover:-translate-y-0.5 text-base"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Running…
                  </>
                ) : isDemo && limitReached ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">block</span>
                    Demo limit reached
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    Execute Run
                  </>
                )}
              </button>

              {!isDemo && <KeyManager onKeysChange={handleKeysChange} />}
            </div>

            {/* Right panel: responses */}
            <div className="lg:col-span-2">
              {loading && (
                <div className="flex flex-col items-center justify-center h-60 glass-panel ghost-border rounded-3xl gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[24px] animate-spin">progress_activity</span>
                  </div>
                  <p className="text-on-surface-variant text-sm font-medium">Waiting for responses…</p>
                </div>
              )}

              {!loading && responses.length === 0 && (
                <div className="flex flex-col items-center justify-center h-60 ghost-border border-2 border-dashed rounded-3xl gap-3 bg-surface-container-lowest/20">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline text-[24px]">chat_bubble_outline</span>
                  </div>
                  <p className="text-outline text-sm">Responses will appear here</p>
                </div>
              )}

              {responses.length > 0 && (
                <div className="space-y-4">
                  {/* Action bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!isDemo && (
                      <button
                        onClick={handleSave}
                        disabled={saving || saved}
                        className={`inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-sm font-bold transition-all ${
                          saved
                            ? "bg-green-100 border border-green-200 text-green-700"
                            : "glass-panel ghost-border text-on-surface hover:-translate-y-0.5"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}>
                          {saved ? "check_circle" : "save"}
                        </span>
                        {saving ? "Saving…" : saved ? "Saved" : "Save Run"}
                      </button>
                    )}

                    <button
                      onClick={() => setShowExport(true)}
                      className="inline-flex items-center gap-1.5 glass-panel ghost-border text-on-surface py-2 px-4 rounded-xl text-sm font-bold hover:-translate-y-0.5 transition-all"
                    >
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      Export
                    </button>

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
                            className="inline-flex items-center gap-1.5 glass-panel ghost-border text-on-surface py-2 px-4 rounded-xl text-sm font-bold hover:-translate-y-0.5 transition-all"
                          >
                            <span className="material-symbols-outlined text-[15px]">compare</span>
                            Compare
                          </button>
                        )}
                        {(diffMode === "selecting" || diffMode === "viewing") && (
                          <button
                            onClick={() => { setDiffMode("off"); setDiffSelections([]); }}
                            className="inline-flex items-center gap-1.5 glass-panel ghost-border text-on-surface py-2 px-4 rounded-xl text-sm font-bold hover:-translate-y-0.5 transition-all"
                          >
                            <span className="material-symbols-outlined text-[15px]">close</span>
                            {diffMode === "selecting" ? "Cancel" : "Exit Compare"}
                          </button>
                        )}
                        {diffMode === "selecting" && (
                          <span className="text-xs text-outline">
                            {diffSelections.length === 0
                              ? "Select two responses to compare"
                              : "Select one more"}
                          </span>
                        )}
                      </>
                    )}

                    {saveError && (
                      <p className="text-sm text-error flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {saveError}
                      </p>
                    )}
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
                  {diffMode !== "viewing" && (() => {
                    const successfulResponses = responses.filter((r) => !r.error && r.latency_ms > 0);
                    const minLatency = successfulResponses.length
                      ? Math.min(...successfulResponses.map((r) => r.latency_ms))
                      : 0;
                    const showLatencyBars = successfulResponses.length > 1;

                    return (
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
                                      ? "cursor-pointer ring-2 ring-primary/60 rounded-[2rem]"
                                      : "cursor-pointer hover:ring-2 hover:ring-outline/40 rounded-[2rem]"
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
                                minLatency={showLatencyBars ? minLatency : undefined}
                                isFastest={showLatencyBars && r.latency_ms === minLatency && !r.error}
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showExport && (
        <ExportModal
          systemPrompt={systemPrompt}
          userMessage={userMessage}
          selectedModels={selectedModels}
          modelParams={modelParams}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
