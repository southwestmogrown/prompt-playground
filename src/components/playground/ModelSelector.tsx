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
    <div className="space-y-2">
      <p className="text-xs font-medium text-[#8B949E] uppercase tracking-wide">Models</p>
      <div className="flex flex-wrap gap-2">
        {models.map((model) => {
          const checked = selected.includes(model.id);
          return (
            <label
              key={model.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm cursor-pointer select-none transition-colors ${
                checked
                  ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-300"
                  : "bg-[#161B22] border-[#30363D] text-[#8B949E] hover:border-[#484F58] hover:text-[#E6EDF3]"
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
