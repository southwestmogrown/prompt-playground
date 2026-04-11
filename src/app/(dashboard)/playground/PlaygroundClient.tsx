"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ModelOption, ModelResponse, ModelParams, ProviderName } from "@/lib/types";
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
import ModelParamsPanel from "@/components/playground/ModelParamsPanel";

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
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveTags, setSaveTags] = useState("");
  const [diffMode, setDiffMode] = useState<"off" | "selecting" | "viewing">("off");
  const [diffSelections, setDiffSelections] = useState<string[]>([]);
  const [showExport, setShowExport] = useState(false);
  const [modelParams, setModelParams] = useState<Record<string, ModelParams>>({});
  const abortRef = useRef<AbortController | null>(null);
  const systemPromptRef = useRef<HTMLTextAreaElement>(null);

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

    // Cancel any in-flight stream before starting a new one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setLoading(true);
    setSaved(false);
    setSaveError(null);
    setShowSaveForm(false);
    setSaveName("");
    setSaveTags("");
    setDiffMode("off");
    setDiffSelections([]);
    setScores({});

    // Initialize shell cards immediately so cards appear in loading state
    const shells: ModelResponse[] = selectedModels.map((modelId) => ({
      model: modelId,
      response: "",
      score: null,
      latency_ms: 0,
      streaming: true,
    }));
    setResponses(shells);

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt,
          userMessage: message,
          models: selectedModels,
          isDemo,
          parameters: modelParams,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Run failed");
        setResponses([]);
        return;
      }

      if (isDemo) {
        const updated = incrementDemoRun();
        setRunsUsed(updated.runsUsed);
      }

      // Read NDJSON stream
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const runStart = Date.now();
      const ttfts: Record<string, number> = {};

      setLoading(false); // cards are visible; stop the full-screen spinner

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // keep incomplete last line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line) as {
              model: string;
              token?: string;
              done?: boolean;
              latency_ms?: number;
              error?: string;
            };

            if (chunk.token !== undefined) {
              // First token — record TTFT
              if (ttfts[chunk.model] === undefined) {
                ttfts[chunk.model] = Date.now() - runStart;
              }
              setResponses((prev) =>
                prev.map((r) =>
                  r.model === chunk.model
                    ? { ...r, response: r.response + chunk.token }
                    : r
                )
              );
            } else if (chunk.done) {
              setResponses((prev) => {
                const updated = prev.map((r) =>
                  r.model === chunk.model
                    ? {
                        ...r,
                        streaming: false,
                        latency_ms: chunk.latency_ms ?? 0,
                        ttft: ttfts[chunk.model],
                        ...(chunk.error ? { error: chunk.error, response: "" } : {}),
                      }
                    : r
                );
                return updated;
              });
            }
          } catch {
            // Malformed line — skip
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return; // intentional cancel
      setError("Network error. Please try again.");
      setResponses([]);
    } finally {
      setLoading(false);
    }
  }

  function openSaveForm() {
    setSaveName(userMessage.slice(0, 60).trim());
    setSaveTags("");
    setShowSaveForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const responsesWithScores = responses.map((r) => ({
        ...r,
        score: scores[r.model] ?? null,
      }));
      const parsedTags = saveTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { error: dbError } = await supabase.from("runs").insert({
        user_id: user?.id,
        system_prompt: systemPrompt,
        user_message: userMessage,
        models: selectedModels,
        responses: responsesWithScores,
        name: saveName.trim() || null,
        tags: parsedTags,
      });
      if (dbError) {
        setSaveError(dbError.message);
      } else {
        setSaved(true);
        setShowSaveForm(false);
      }
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-grid text-on-surface">

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

      <main className={`relative ${!isDemo ? "lg:ml-56" : ""} px-4 sm:px-6 py-6 pb-16`}>
        <div className="max-w-7xl mx-auto">

          {/* Page header */}
          <div className="mb-6 flex items-center gap-3">
            <span className="led led-active" />
            <div>
              <h1 className="font-mono font-bold text-lg text-on-surface tracking-wider uppercase">
                Playground
              </h1>
              <p className="console-label mt-0.5">
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
                systemPromptRef={systemPromptRef}
              />

              <PromptEditor
                systemPrompt={systemPrompt}
                userMessage={userMessage}
                onSystemPromptChange={setSystemPrompt}
                onUserMessageChange={setUserMessage}
                disabled={loading}
                systemPromptRef={systemPromptRef}
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

              <ModelParamsPanel
                selectedModels={selectedModels}
                modelParams={modelParams}
                onChange={setModelParams}
              />

              {error && (
                <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-error rounded-lg px-4 py-3 text-sm font-mono">
                  <span className="material-symbols-outlined text-[15px]">error</span>
                  {error}
                </div>
              )}

              {/* Execute Run button */}
              <button
                onClick={handleRun}
                disabled={loading || (isDemo && limitReached)}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary py-3.5 px-6 rounded-lg font-mono font-bold text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-primary"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Running…
                  </>
                ) : isDemo && limitReached ? (
                  <>
                    <span className="material-symbols-outlined text-[16px]">block</span>
                    Demo limit reached
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    Execute Run
                  </>
                )}
              </button>

              {!isDemo && <KeyManager onKeysChange={handleKeysChange} />}
            </div>

            {/* Right panel: responses */}
            <div className="lg:col-span-2">
              {loading && (
                <div className="flex flex-col items-center justify-center h-60 console-panel rounded-xl gap-3">
                  <div className="flex items-center gap-3">
                    <span className="led led-active animate-pulse" />
                    <span className="material-symbols-outlined text-primary text-[20px] animate-spin">progress_activity</span>
                  </div>
                  <p className="console-label text-primary">Waiting for responses…</p>
                </div>
              )}

              {!loading && responses.length === 0 && (
                <div className="flex flex-col items-center justify-center h-60 console-panel rounded-xl gap-3 border-dashed">
                  <div className="w-10 h-10 rounded-lg bg-surface-container border border-[rgba(255,255,255,0.07)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline text-[20px]">chat_bubble_outline</span>
                  </div>
                  <p className="console-label">Responses will appear here</p>
                </div>
              )}

              {responses.length > 0 && (
                <div className="space-y-4">
                  {/* Action bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!isDemo && !saved && !showSaveForm && (
                      <button
                        onClick={openSaveForm}
                        className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg console-label border border-[rgba(255,255,255,0.1)] bg-surface-container hover:border-[rgba(255,255,255,0.18)] text-on-surface transition-all"
                      >
                        <span className="material-symbols-outlined text-[13px]">save</span>
                        Save Run
                      </button>
                    )}
                    {!isDemo && saved && (
                      <span className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg console-label border border-green/40 bg-green/8 text-green">
                        <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Saved
                      </span>
                    )}

                    <button
                      onClick={() => setShowExport(true)}
                      className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg console-label border border-[rgba(255,255,255,0.1)] bg-surface-container hover:border-[rgba(255,255,255,0.18)] text-on-surface transition-all"
                    >
                      <span className="material-symbols-outlined text-[13px]">download</span>
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
                            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg console-label border border-[rgba(255,255,255,0.1)] bg-surface-container hover:border-[rgba(255,255,255,0.18)] text-on-surface transition-all"
                          >
                            <span className="material-symbols-outlined text-[13px]">compare</span>
                            Compare
                          </button>
                        )}
                        {(diffMode === "selecting" || diffMode === "viewing") && (
                          <button
                            onClick={() => { setDiffMode("off"); setDiffSelections([]); }}
                            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg console-label border border-[rgba(255,255,255,0.1)] bg-surface-container hover:border-[rgba(255,255,255,0.18)] text-on-surface transition-all"
                          >
                            <span className="material-symbols-outlined text-[13px]">close</span>
                            {diffMode === "selecting" ? "Cancel" : "Exit Compare"}
                          </button>
                        )}
                        {diffMode === "selecting" && (
                          <span className="console-label">
                            {diffSelections.length === 0
                              ? "Select two responses to compare"
                              : "Select one more"}
                          </span>
                        )}
                      </>
                    )}

                    {saveError && (
                      <p className="console-label text-error flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        {saveError}
                      </p>
                    )}
                  </div>

                  {/* Inline save form */}
                  {showSaveForm && !saved && (
                    <div className="console-panel rounded-xl px-4 py-3 flex flex-col gap-3">
                      <p className="console-label text-on-surface font-semibold">Save run</p>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={saveName}
                          onChange={(e) => setSaveName(e.target.value)}
                          placeholder="Name (optional)"
                          className="w-full bg-surface-container-high border border-[rgba(255,255,255,0.07)] rounded-lg px-3 py-2 font-mono text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/40"
                        />
                        <input
                          type="text"
                          value={saveTags}
                          onChange={(e) => setSaveTags(e.target.value)}
                          placeholder="Tags — comma separated (e.g. gpt4, creative)"
                          className="w-full bg-surface-container-high border border-[rgba(255,255,255,0.07)] rounded-lg px-3 py-2 font-mono text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/40"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg console-label bg-primary text-on-primary font-bold glow-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <span className="material-symbols-outlined text-[13px]">save</span>
                          {saving ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={() => setShowSaveForm(false)}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg console-label border border-[rgba(255,255,255,0.1)] bg-surface-container hover:bg-surface-container-high transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

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
                    // Fastest = lowest TTFT among models that have received at least one token
                    const respondedModels = responses.filter((r) => r.ttft !== undefined);
                    const minTTFT = respondedModels.length
                      ? Math.min(...respondedModels.map((r) => r.ttft!))
                      : null;

                    return (
                      <div
                        className={`grid gap-4 ${
                          responses.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
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
                                      ? "cursor-pointer ring-2 ring-primary/60 rounded-xl"
                                      : "cursor-pointer hover:ring-2 hover:ring-outline/40 rounded-xl"
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
                                isFastest={minTTFT !== null && r.ttft === minTTFT && !r.error}
                                streaming={r.streaming}
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
