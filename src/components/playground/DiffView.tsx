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
          return <span key={i} className="text-on-surface">{part.text} </span>;
        }
        if (part.type === "removed") {
          return (
            <span key={i} className="bg-error/15 text-error rounded px-0.5">{part.text} </span>
          );
        }
        return (
          <span key={i} className="bg-green-100 text-green-700 rounded px-0.5">{part.text} </span>
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
      <div className="bg-surface-container-lowest/70 backdrop-blur-[40px] ghost-border rounded-[2rem] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(174,173,170,0.10)]">
          <span className="text-sm font-bold text-on-surface">{leftName}</span>
          <div className="flex items-center gap-3 text-xs font-mono text-outline">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-sm bg-error/40" />
              removed
            </span>
            <span>{left.latency_ms}ms</span>
          </div>
        </div>
        <div className="flex-1 px-5 py-4 min-h-[120px]">
          {left.error ? (
            <p className="text-sm text-error italic">{left.error}</p>
          ) : (
            <DiffText parts={leftParts} />
          )}
        </div>
      </div>

      {/* Right */}
      <div className="bg-surface-container-lowest/70 backdrop-blur-[40px] ghost-border rounded-[2rem] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(174,173,170,0.10)]">
          <span className="text-sm font-bold text-on-surface">{rightName}</span>
          <div className="flex items-center gap-3 text-xs font-mono text-outline">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-sm bg-green-400/60" />
              added
            </span>
            <span>{right.latency_ms}ms</span>
          </div>
        </div>
        <div className="flex-1 px-5 py-4 min-h-[120px]">
          {right.error ? (
            <p className="text-sm text-error italic">{right.error}</p>
          ) : (
            <DiffText parts={rightParts} />
          )}
        </div>
      </div>
    </div>
  );
}
