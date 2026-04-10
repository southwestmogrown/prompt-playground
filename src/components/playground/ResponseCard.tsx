"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { ModelResponse } from "@/lib/types";
import { estimateCost } from "@/lib/pricing";
import ScoreInput from "./ScoreInput";

interface ResponseCardProps {
  response: ModelResponse;
  modelName: string;
  score: number | null;
  onScore: (score: number) => void;
  isDemo?: boolean;
  inputText?: string;
  minLatency?: number;
  isFastest?: boolean;
}

export default function ResponseCard({
  response,
  modelName,
  score,
  onScore,
  isDemo,
  inputText = "",
  minLatency,
  isFastest,
}: ResponseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cost = !response.error
    ? estimateCost(response.model, inputText, response.response)
    : null;

  const barWidth =
    minLatency && !response.error && response.latency_ms > 0
      ? (minLatency / response.latency_ms) * 100
      : null;

  return (
    <div className="group bg-surface-container-lowest/70 backdrop-blur-[40px] ghost-border rounded-[2rem] flex flex-col prism-glow hover:refractive-shadow transition-all duration-300">
      {/* Header */}
      <div className="px-5 pt-4 pb-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface leading-tight">{modelName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {cost !== null && (
              <span className="text-xs font-mono text-outline">
                ~${cost < 0.0001 ? cost.toExponential(1) : cost.toFixed(4)}
              </span>
            )}
            {isFastest && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 border border-green-200 text-green-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                Fastest
              </span>
            )}
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              {response.latency_ms}ms
            </span>
            <button
              onClick={() => setExpanded((e) => !e)}
              title={expanded ? "Collapse" : "Expand"}
              className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
            >
              <span className={`material-symbols-outlined text-[14px] text-on-surface-variant transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
                expand_more
              </span>
            </button>
          </div>
        </div>

        {/* Latency bar */}
        {barWidth !== null && (
          <div className="h-[3px] bg-surface-container rounded-full overflow-hidden mt-3 -mx-0">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-700"
              style={{ width: `${barWidth}%` }}
            />
          </div>
        )}

        <div className="border-t border-[rgba(174,173,170,0.10)] mt-3" />
      </div>

      {/* Response body */}
      <div className={`flex-1 px-5 py-4 ${expanded ? "max-h-none" : "max-h-52"} overflow-y-auto`}>
        {response.error ? (
          <p className="text-sm text-error italic">{response.error}</p>
        ) : (
          <div className="text-sm text-on-surface leading-relaxed font-medium [&_p]:mb-2 [&_p:last-child]:mb-0 [&_code]:font-mono [&_code]:bg-surface-container-low [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-[13px] [&_pre]:bg-surface-container-low [&_pre]:rounded-xl [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:mb-2 [&_pre>code]:bg-transparent [&_pre>code]:p-0">
            <ReactMarkdown>{response.response}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Score footer */}
      {!response.error && !isDemo && (
        <div className="px-5 py-3 border-t border-[rgba(174,173,170,0.10)] flex items-center gap-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Score</span>
          <ScoreInput value={score} onChange={onScore} />
        </div>
      )}
    </div>
  );
}
