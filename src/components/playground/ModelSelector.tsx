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
      <p className="text-sm font-medium text-gray-700">Models</p>
      <div className="flex flex-wrap gap-2">
        {models.map((model) => {
          const checked = selected.includes(model.id);
          return (
            <label
              key={model.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm cursor-pointer select-none transition-colors ${
                checked
                  ? "bg-blue-50 border-blue-400 text-blue-800"
                  : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
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
