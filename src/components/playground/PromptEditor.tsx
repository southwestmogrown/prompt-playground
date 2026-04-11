interface PromptEditorProps {
  systemPrompt: string;
  userMessage: string;
  onSystemPromptChange: (v: string) => void;
  onUserMessageChange: (v: string) => void;
  disabled?: boolean;
  systemPromptRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function PromptEditor({
  systemPrompt,
  userMessage,
  onSystemPromptChange,
  onUserMessageChange,
  disabled,
  systemPromptRef,
}: PromptEditorProps) {
  return (
    <div className="console-panel rounded-xl overflow-hidden">
      {/* System prompt */}
      <div className="px-4 pt-3 pb-2">
        <label className="console-label block mb-2">
          System prompt{" "}
          <span className="normal-case font-normal text-outline">(optional)</span>
        </label>
        <textarea
          ref={systemPromptRef}
          rows={3}
          placeholder="You are a helpful assistant…"
          value={systemPrompt}
          onChange={(e) => onSystemPromptChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-transparent border-none text-on-surface placeholder-outline font-mono text-xs resize-none focus:outline-none disabled:opacity-50 leading-relaxed"
        />
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-[rgba(255,255,255,0.07)]" />

      {/* User message */}
      <div className="px-4 py-3">
        <label className="console-label block mb-2">
          User message <span className="text-primary">*</span>
        </label>
        <textarea
          rows={6}
          placeholder="Enter your prompt here…"
          value={userMessage}
          onChange={(e) => onUserMessageChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-transparent border-none text-on-surface placeholder-outline font-mono text-xs resize-none focus:outline-none disabled:opacity-50 leading-relaxed"
        />
      </div>
    </div>
  );
}
