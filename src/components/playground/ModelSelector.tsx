import type { ModelOption, ProviderName } from "@/lib/types";

interface ModelSelectorProps {
  models: ModelOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  availableProviders: ProviderName[];
}

const PROVIDER_LABELS: Record<ProviderName, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  mistral: "Mistral",
  groq: "Groq",
  xai: "xAI",
};

export default function ModelSelector({ models, selected, onChange, availableProviders }: ModelSelectorProps) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((m) => m !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="console-panel rounded-xl overflow-hidden">
      {/* Panel header */}
      <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-2">
        <span className="material-symbols-outlined text-on-surface-variant text-[14px]">memory</span>
        <span className="console-label">Models</span>
        <span className="ml-auto console-label text-primary">{selected.length} selected</span>
      </div>

      {/* Channel buttons grid */}
      <div className="p-3 grid grid-cols-2 gap-1.5">
        {models.map((model, i) => {
          const checked = selected.includes(model.id);
          const hasKey = availableProviders.includes(model.provider);
          const providerLabel = PROVIDER_LABELS[model.provider] ?? model.provider;
          const channelNum = String(i + 1).padStart(2, "0");

          return (
            <label
              key={model.id}
              title={!hasKey ? `Add your ${providerLabel} API key to enable` : undefined}
              className={`relative flex flex-col gap-0.5 px-3 py-2.5 rounded-lg border select-none transition-all cursor-pointer ${
                !hasKey
                  ? "opacity-30 cursor-not-allowed border-[rgba(255,255,255,0.06)] bg-surface-container-lowest"
                  : checked
                    ? "border-primary/50 bg-primary/8 hover:bg-primary/12"
                    : "border-[rgba(255,255,255,0.07)] bg-surface-container-lowest hover:border-[rgba(255,255,255,0.14)] hover:bg-surface-container"
              }`}
              style={checked ? { boxShadow: "0 0 12px rgba(0,212,255,0.1)" } : undefined}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => hasKey && toggle(model.id)}
                disabled={!hasKey}
              />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-on-surface-variant">{channelNum}</span>
                <div className="flex items-center gap-1">
                  {!hasKey && (
                    <span className="material-symbols-outlined text-[10px] text-outline">lock</span>
                  )}
                  <span className={`led ${checked ? "led-active" : ""}`} style={{ width: "5px", height: "5px" }} />
                </div>
              </div>
              <span className={`font-mono text-[11px] font-medium leading-tight ${checked ? "text-primary" : "text-on-surface"}`}>
                {model.name}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
