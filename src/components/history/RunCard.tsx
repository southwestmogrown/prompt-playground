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

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
      {/* Collapsed header — always visible */}
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-sm text-[#E6EDF3] leading-snug">
            {truncate(run.user_message, 120)}
          </p>
          <div className="flex flex-wrap gap-1.5 items-center">
            {run.models.map((m) => (
              <span
                key={m}
                className="inline-block bg-[#1E2330] text-[#8B949E] text-xs px-2 py-0.5 rounded-full border border-[#30363D]"
              >
                {modelName(m)}
              </span>
            ))}
            <span className="text-xs text-[#484F58] ml-1 font-mono">
              Best: {bestScore !== null ? `${bestScore}/5` : "—"}
            </span>
          </div>
          <p className="text-xs text-[#484F58] font-mono">{formatDate(run.created_at)}</p>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-0.5"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[#30363D] px-4 py-4 space-y-4 bg-[#0D1117]">
          {run.system_prompt && (
            <div>
              <p className="text-xs font-medium text-[#484F58] uppercase tracking-wide mb-1">System prompt</p>
              <p className="text-sm text-[#8B949E] whitespace-pre-wrap font-mono">{run.system_prompt}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-[#484F58] uppercase tracking-wide mb-1">User message</p>
            <p className="text-sm text-[#8B949E] whitespace-pre-wrap font-mono">{run.user_message}</p>
          </div>
          <div
            className={`grid gap-3 ${
              run.responses.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {run.responses.map((r) => (
              <div key={r.model} className="bg-[#161B22] border border-[#30363D] rounded-lg">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363D] bg-[#1E2330] rounded-t-lg">
                  <span className="text-xs font-medium text-[#E6EDF3]">{modelName(r.model)}</span>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    {r.score !== null && (
                      <span className="text-indigo-400 font-medium">{r.score}/5</span>
                    )}
                    <span className="text-[#484F58]">{r.latency_ms}ms</span>
                  </div>
                </div>
                <div className="px-3 py-2">
                  {r.error ? (
                    <p className="text-xs text-red-400 italic">{r.error}</p>
                  ) : (
                    <p className="text-sm text-[#E6EDF3] whitespace-pre-wrap leading-relaxed">
                      {r.response}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={handleOpenInPlayground}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Open in Playground →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
