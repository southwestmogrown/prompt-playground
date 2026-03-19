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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          System prompt{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="You are a helpful assistant…"
          value={systemPrompt}
          onChange={(e) => onSystemPromptChange(e.target.value)}
          disabled={disabled}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User message <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          placeholder="Enter your prompt here…"
          value={userMessage}
          onChange={(e) => onUserMessageChange(e.target.value)}
          disabled={disabled}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>
    </div>
  );
}
