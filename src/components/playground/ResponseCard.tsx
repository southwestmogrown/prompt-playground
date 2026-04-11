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
  streaming?: boolean;
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
  streaming,
}: ResponseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(response.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const cost = !response.error && !streaming
    ? estimateCost(response.model, inputText, response.response)
    : null;

  const barWidth =
    minLatency && !response.error && response.latency_ms > 0
      ? (minLatency / response.latency_ms) * 100
      : null;

  const hasResponse = !response.error && response.response;

  return (
    <div className="console-panel rounded-xl flex flex-col overflow-hidden transition-colors hover:border-[rgba(255,255,255,0.12)]">
      {/* Channel header */}
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`led ${
            response.error ? "bg-red-500" :
            streaming ? "led-active animate-pulse" :
            hasResponse ? "led-active" : ""
          }`} />
          <p className="font-mono text-xs font-medium text-on-surface truncate">{modelName}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {cost !== null && (
            <span className="console-label">
              ~${cost < 0.0001 ? cost.toExponential(1) : cost.toFixed(4)}
            </span>
          )}
          {isFastest && (
            <span className="flex items-center gap-1 console-label border border-green/30 bg-green/8 text-green px-2 py-0.5 rounded">
              <span className="led led-green" style={{ width: "5px", height: "5px" }} />
              Fastest
            </span>
          )}
          <span className="font-mono text-xs text-primary border border-primary/25 bg-primary/8 px-2 py-0.5 rounded">
            {streaming ? "…" : `${response.latency_ms}ms`}
          </span>
          {hasResponse && !streaming && (
            <button
              onClick={handleCopy}
              title="Copy response"
              className="w-6 h-6 rounded flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors border border-[rgba(255,255,255,0.07)]"
            >
              <span className={`material-symbols-outlined text-[13px] transition-colors duration-200 ${copied ? "text-green" : "text-on-surface-variant"}`}>
                {copied ? "check" : "content_copy"}
              </span>
            </button>
          )}
          <button
            onClick={() => setExpanded((e) => !e)}
            title={expanded ? "Collapse" : "Expand"}
            className="w-6 h-6 rounded flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors border border-[rgba(255,255,255,0.07)]"
          >
            <span className={`material-symbols-outlined text-[13px] text-on-surface-variant transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>
        </div>
      </div>

      {/* VU latency bar — pulse while streaming, fixed width when done */}
      {streaming ? (
        <div className="h-[2px] bg-surface-container-high">
          <div
            className="h-full bg-primary animate-pulse"
            style={{ width: "60%", boxShadow: "0 0 8px rgba(0,212,255,0.5)" }}
          />
        </div>
      ) : barWidth !== null ? (
        <div className="h-[2px] bg-surface-container-high">
          <div
            className="h-full bg-primary transition-all duration-700"
            style={{ width: `${barWidth}%`, boxShadow: "0 0 8px rgba(0,212,255,0.5)" }}
          />
        </div>
      ) : null}

      {/* Response body */}
      <div className={`flex-1 bg-surface-container-lowest ${expanded ? "max-h-none" : "max-h-52"} overflow-y-auto`}>
        {response.error ? (
          <p className="text-sm text-error italic px-4 py-4">{response.error}</p>
        ) : streaming && !response.response ? (
          <div className="px-4 py-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-primary animate-spin">progress_activity</span>
            <span className="console-label text-primary">Waiting for first token…</span>
          </div>
        ) : (
          <div className="text-sm text-on-surface leading-relaxed px-4 py-4 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_code]:font-mono [&_code]:bg-surface-container [&_code]:border [&_code]:border-[rgba(255,255,255,0.07)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[12px] [&_code]:text-primary [&_pre]:bg-[#070a0d] [&_pre]:border [&_pre]:border-[rgba(255,255,255,0.07)] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:mb-2 [&_pre>code]:bg-transparent [&_pre>code]:p-0 [&_pre>code]:border-0 [&_pre>code]:text-on-surface">
            <ReactMarkdown>{response.response}</ReactMarkdown>
            {streaming && <span className="inline-block w-[2px] h-[1em] bg-primary align-middle ml-0.5 animate-pulse" />}
          </div>
        )}
      </div>

      {/* Score footer — only when done */}
      {!response.error && !isDemo && !streaming && (
        <div className="px-4 py-2.5 border-t border-[rgba(255,255,255,0.07)] bg-surface-container flex items-center gap-3">
          <span className="console-label">Score</span>
          <ScoreInput value={score} onChange={onScore} />
        </div>
      )}
    </div>
  );
}
