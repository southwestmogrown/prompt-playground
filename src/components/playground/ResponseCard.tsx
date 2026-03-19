import type { ModelResponse } from "@/lib/types";
import ScoreInput from "./ScoreInput";

interface ResponseCardProps {
  response: ModelResponse;
  modelName: string;
  score: number | null;
  onScore: (score: number) => void;
  isDemo?: boolean;
}

export default function ResponseCard({
  response,
  modelName,
  score,
  onScore,
  isDemo,
}: ResponseCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <span className="text-sm font-medium text-gray-800">{modelName}</span>
        <span className="text-xs text-gray-400">{response.latency_ms}ms</span>
      </div>

      <div className="flex-1 px-4 py-3 min-h-[120px]">
        {response.error ? (
          <p className="text-sm text-red-600 italic">{response.error}</p>
        ) : (
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {response.response}
          </p>
        )}
      </div>

      {!response.error && !isDemo && (
        <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-2">
          <span className="text-xs text-gray-500">Score:</span>
          <ScoreInput value={score} onChange={onScore} />
        </div>
      )}
    </div>
  );
}
