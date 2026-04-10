import type { ModelOption } from "@/lib/types";

interface ModelSelectorProps {
  models: ModelOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function ModelSelector({ models, selected, onChange }: ModelSelectorProps) {
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
          return (
            <label
              key={model.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs cursor-pointer select-none transition-all duration-200 ${
                checked
                  ? "bg-surface-container-lowest shadow-sm text-on-surface font-bold"
                  : "text-on-surface-variant hover:text-on-surface font-medium"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => toggle(model.id)}
              />
              {model.name}
            </label>
          );
        })}
      </div>
    </div>
  );
}
