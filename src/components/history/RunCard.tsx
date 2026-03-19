"use client";

import { useState } from "react";
import type { Run } from "@/lib/types";
import { SUPPORTED_MODELS } from "@/lib/models";

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
  const [expanded, setExpanded] = useState(false);

  const bestScore = run.responses.reduce<number | null>((best, r) => {
    if (r.score === null) return best;
    return best === null ? r.score : Math.max(best, r.score);
  }, null);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Collapsed header — always visible */}
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-sm text-gray-800 leading-snug">
            {truncate(run.user_message, 120)}
          </p>
          <div className="flex flex-wrap gap-1.5 items-center">
            {run.models.map((m) => (
              <span
                key={m}
                className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
              >
                {modelName(m)}
              </span>
            ))}
            <span className="text-xs text-gray-400 ml-1">
              Best score: {bestScore !== null ? `${bestScore}/5` : "—"}
            </span>
          </div>
          <p className="text-xs text-gray-400">{formatDate(run.created_at)}</p>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-xs text-blue-600 hover:text-blue-800 mt-0.5"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50">
          {run.system_prompt && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">System prompt</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{run.system_prompt}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">User message</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{run.user_message}</p>
          </div>
          <div
            className={`grid gap-3 ${
              run.responses.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {run.responses.map((r) => (
              <div key={r.model} className="bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-700">{modelName(r.model)}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {r.score !== null && (
                      <span className="text-blue-600 font-medium">{r.score}/5</span>
                    )}
                    <span>{r.latency_ms}ms</span>
                  </div>
                </div>
                <div className="px-3 py-2">
                  {r.error ? (
                    <p className="text-xs text-red-600 italic">{r.error}</p>
                  ) : (
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
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
