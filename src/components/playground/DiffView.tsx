import type { ModelResponse } from "@/lib/types";
import { wordDiff, type DiffPart } from "@/lib/diff";

interface DiffViewProps {
  left: ModelResponse;
  right: ModelResponse;
  leftName: string;
  rightName: string;
}

function DiffText({ parts }: { parts: DiffPart[] }) {
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        if (part.type === "same") {
          return <span key={i} className="text-[#E6EDF3]">{part.text} </span>;
        }
        if (part.type === "removed") {
          return (
            <span key={i} className="bg-red-500/20 text-red-300 rounded px-0.5">{part.text} </span>
          );
        }
        return (
          <span key={i} className="bg-emerald-500/20 text-emerald-300 rounded px-0.5">{part.text} </span>
        );
      })}
    </p>
  );
}

export default function DiffView({ left, right, leftName, rightName }: DiffViewProps) {
  const { left: leftParts, right: rightParts } = wordDiff(left.response, right.response);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Left */}
      <div className="border border-[#30363D] bg-[#161B22] rounded-lg flex flex-col">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#30363D] bg-[#1E2330] rounded-t-lg">
          <span className="text-sm font-medium text-[#E6EDF3]">{leftName}</span>
          <div className="flex items-center gap-3 text-xs font-mono text-[#484F58]">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-red-500/40" />
              removed
            </span>
            <span>{left.latency_ms}ms</span>
          </div>
        </div>
        <div className="flex-1 px-4 py-3 min-h-[120px]">
          {left.error ? (
            <p className="text-sm text-red-400 italic">{left.error}</p>
          ) : (
            <DiffText parts={leftParts} />
          )}
        </div>
      </div>

      {/* Right */}
      <div className="border border-[#30363D] bg-[#161B22] rounded-lg flex flex-col">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#30363D] bg-[#1E2330] rounded-t-lg">
          <span className="text-sm font-medium text-[#E6EDF3]">{rightName}</span>
          <div className="flex items-center gap-3 text-xs font-mono text-[#484F58]">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-emerald-500/40" />
              added
            </span>
            <span>{right.latency_ms}ms</span>
          </div>
        </div>
        <div className="flex-1 px-4 py-3 min-h-[120px]">
          {right.error ? (
            <p className="text-sm text-red-400 italic">{right.error}</p>
          ) : (
            <DiffText parts={rightParts} />
          )}
        </div>
      </div>
    </div>
  );
}
