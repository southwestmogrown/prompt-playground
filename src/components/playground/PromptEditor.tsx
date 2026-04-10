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
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/15 via-secondary/10 to-tertiary/15 rounded-[1.75rem] blur-xl opacity-30 group-focus-within:opacity-70 transition-opacity duration-500 pointer-events-none" />
        <div className="relative glass-panel ghost-border rounded-[1.5rem] overflow-hidden">
          {/* System prompt */}
          <div className="px-4 pt-4 pb-2">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              System prompt{" "}
              <span className="normal-case font-normal text-outline">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="You are a helpful assistant…"
              value={systemPrompt}
              onChange={(e) => onSystemPromptChange(e.target.value)}
              disabled={disabled}
              className="w-full bg-transparent border-none text-on-surface placeholder-outline text-sm resize-none focus:outline-none disabled:opacity-50 leading-relaxed"
            />
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-[rgba(174,173,170,0.12)]" />

          {/* User message */}
          <div className="px-4 py-3">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              User message <span className="text-primary normal-case font-normal">*</span>
            </label>
            <textarea
              rows={6}
              placeholder="Enter your prompt here…"
              value={userMessage}
              onChange={(e) => onUserMessageChange(e.target.value)}
              disabled={disabled}
              className="w-full bg-transparent border-none text-on-surface placeholder-outline text-sm resize-none focus:outline-none disabled:opacity-50 leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
