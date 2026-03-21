interface PromptEditorProps {
  systemPrompt: string;
  userMessage: string;
  onSystemPromptChange: (v: string) => void;
  onUserMessageChange: (v: string) => void;
  disabled?: boolean;
}

export default function PromptEditor({
  systemPrompt,
  userMessage,
  onSystemPromptChange,
  onUserMessageChange,
  disabled,
}: PromptEditorProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-[#8B949E] mb-1 uppercase tracking-wide">
          System prompt{" "}
          <span className="normal-case font-normal text-[#484F58]">(optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="You are a helpful assistant…"
          value={systemPrompt}
          onChange={(e) => onSystemPromptChange(e.target.value)}
          disabled={disabled}
          className="w-full border border-[#30363D] bg-[#161B22] text-[#E6EDF3] placeholder-[#484F58] rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-mono"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#8B949E] mb-1 uppercase tracking-wide">
          User message <span className="text-red-400 normal-case font-normal">*</span>
        </label>
        <textarea
          rows={5}
          placeholder="Enter your prompt here…"
          value={userMessage}
          onChange={(e) => onUserMessageChange(e.target.value)}
          disabled={disabled}
          className="w-full border border-[#30363D] bg-[#161B22] text-[#E6EDF3] placeholder-[#484F58] rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-mono"
        />
      </div>
    </div>
  );
}
