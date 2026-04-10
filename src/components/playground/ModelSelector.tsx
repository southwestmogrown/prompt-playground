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
    <div className="space-y-2.5">
      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Models</p>
      <div className="flex bg-surface-container-low/50 backdrop-blur-md ghost-border rounded-2xl p-1.5 flex-wrap gap-1">
        {models.map((model) => {
          const checked = selected.includes(model.id);
          const hasKey = availableProviders.includes(model.provider);
          const providerLabel = PROVIDER_LABELS[model.provider] ?? model.provider;

          return (
            <label
              key={model.id}
              title={!hasKey ? `Add your ${providerLabel} API key in API Keys to enable this model` : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs select-none transition-all duration-200 ${
                checked
                  ? "bg-surface-container-lowest shadow-sm text-on-surface font-bold"
                  : hasKey
                    ? "text-on-surface-variant hover:text-on-surface font-medium"
                    : "text-outline cursor-not-allowed"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => toggle(model.id)}
                disabled={!hasKey}
              />
              {model.name}
              {!hasKey && (
                <span className="material-symbols-outlined text-[10px] text-outline/60" title={`Add ${providerLabel} key`}>lock</span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
