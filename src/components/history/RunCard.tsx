"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Run } from "@/lib/types";
import { SUPPORTED_MODELS } from "@/lib/models";
import { saveRestoreRun } from "@/lib/demo";

interface RunCardProps {
  run: Run;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max) + "…";
}

function modelName(id: string): string {
  return SUPPORTED_MODELS.find((m) => m.id === id)?.name ?? id;
}

function modelProvider(id: string): string {
  return SUPPORTED_MODELS.find((m) => m.id === id)?.provider ?? "unknown";
}

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "bg-[#d97706]/10 text-[#d97706]",
  openai:    "bg-[#10a37f]/10 text-[#10a37f]",
  google:    "bg-[#4285f4]/10 text-[#4285f4]",
  mistral:   "bg-[#6a3cc9]/10 text-[#6a3cc9]",
  groq:      "bg-primary/10 text-primary",
  xai:       "bg-on-surface/10 text-on-surface",
};

export default function RunCard({ run }: RunCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  function handleOpenInPlayground() {
    saveRestoreRun(run.system_prompt, run.user_message, run.models);
    router.push("/playground");
  }

  const bestScore = run.responses.reduce<number | null>((best, r) => {
    if (r.score === null) return best;
    return best === null ? r.score : Math.max(best, r.score);
  }, null);

  const successCount = run.responses.filter((r) => !r.error).length;

  return (
    <div className="group relative bg-surface-container-lowest/60 backdrop-blur-2xl ghost-border rounded-3xl overflow-hidden shadow-ambient hover:-translate-y-1 transition-all duration-500">
      {/* Hover glow border */}
      <div className="absolute inset-0 rounded-3xl border-2 border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Card header */}
      <div className="px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            {/* User message preview */}
            <p className="text-sm font-medium text-on-surface leading-snug">
              {truncate(run.user_message, 140)}
            </p>

            {/* Model pills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {run.models.map((m) => {
                const provider = modelProvider(m);
                const colorClass = PROVIDER_COLORS[provider] ?? "bg-surface-container text-on-surface-variant";
                return (
                  <span
                    key={m}
                    className={`inline-block text-xs px-2.5 py-1 rounded-full font-semibold ${colorClass}`}
                  >
                    {modelName(m)}
                  </span>
                );
              })}
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-3 text-xs text-outline">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">schedule</span>
                {formatDate(run.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {successCount}/{run.responses.length} responses
              </span>
              {bestScore !== null && (
                <span className="flex items-center gap-1 text-[#765600]">
                  <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  Best {bestScore}/5
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenInPlayground}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-[0_4px_16px_rgba(160,58,15,0.25)] hover:shadow-[0_6px_20px_rgba(160,58,15,0.35)] hover:-translate-y-0.5 transition-all duration-300"
              title="Open in Playground"
            >
              <span className="material-symbols-outlined text-on-primary text-[16px]">open_in_new</span>
            </button>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-9 h-9 rounded-xl bg-surface-container ghost-border flex items-center justify-center hover:bg-surface-container-high transition-colors"
              title={expanded ? "Collapse" : "Expand"}
            >
              <span
                className={`material-symbols-outlined text-on-surface-variant text-[16px] transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              >
                keyboard_arrow_down
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[rgba(174,173,170,0.12)] px-6 py-5 space-y-5 bg-surface-container-low/30">
          {run.system_prompt && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">System prompt</p>
              <p className="text-sm text-on-surface-variant whitespace-pre-wrap font-mono leading-relaxed bg-surface-container-lowest/60 rounded-2xl px-4 py-3">
                {run.system_prompt}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">User message</p>
            <p className="text-sm text-on-surface-variant whitespace-pre-wrap font-mono leading-relaxed bg-surface-container-lowest/60 rounded-2xl px-4 py-3">
              {run.user_message}
            </p>
          </div>
          <div
            className={`grid gap-4 ${
              run.responses.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {run.responses.map((r) => (
              <div key={r.model} className="bg-surface-container-lowest/70 ghost-border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(174,173,170,0.10)]">
                  <span className="text-sm font-bold text-on-surface">{modelName(r.model)}</span>
                  <div className="flex items-center gap-2">
                    {r.score !== null && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#765600]/10 text-[#765600] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        {r.score}/5
                      </span>
                    )}
                    <span className="text-xs font-mono text-outline">{r.latency_ms}ms</span>
                  </div>
                </div>
                <div className="px-4 py-3">
                  {r.error ? (
                    <p className="text-xs text-error italic">{r.error}</p>
                  ) : (
                    <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">
                      {r.response}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
