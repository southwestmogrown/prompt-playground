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
}

export default function ResponseCard({
  response,
  modelName,
  score,
  onScore,
  isDemo,
  inputText = "",
}: ResponseCardProps) {
  const cost = !response.error
    ? estimateCost(response.model, inputText, response.response)
    : null;

  return (
    <div className="border border-[#30363D] bg-[#161B22] rounded-lg flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#30363D] bg-[#1E2330] rounded-t-lg">
        <span className="text-sm font-medium text-[#E6EDF3]">{modelName}</span>
        <div className="flex items-center gap-2 font-mono text-xs">
          {cost !== null && (
            <span className="text-[#484F58]">~${cost < 0.0001 ? cost.toExponential(1) : cost.toFixed(4)}</span>
          )}
          <span className="text-[#484F58]">{response.latency_ms}ms</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-3 min-h-[120px]">
        {response.error ? (
          <p className="text-sm text-red-400 italic">{response.error}</p>
        ) : (
          <p className="text-sm text-[#E6EDF3] whitespace-pre-wrap leading-relaxed">
            {response.response}
          </p>
        )}
      </div>

      {!response.error && !isDemo && (
        <div className="px-4 py-2.5 border-t border-[#30363D] flex items-center gap-2">
          <span className="text-xs text-[#484F58]">Score:</span>
          <ScoreInput value={score} onChange={onScore} />
        </div>
      )}
    </div>
  );
}
