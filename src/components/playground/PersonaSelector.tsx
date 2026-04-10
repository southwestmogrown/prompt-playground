"use client";

import { useState } from "react";
import { PERSONAS, PERSONA_CATEGORIES } from "@/lib/personas";
import type { Persona } from "@/lib/personas";

interface PersonaSelectorProps {
  systemPrompt: string;
  onLoad: (systemPrompt: string) => void;
}

export default function PersonaSelector({ systemPrompt, onLoad }: PersonaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [preview, setPreview] = useState<Persona | null>(null);

  const categories = ["All", ...PERSONA_CATEGORIES];
  const filtered =
    activeCategory === "All"
      ? PERSONAS
      : PERSONAS.filter((p) => p.category === activeCategory);

  function handleUse(persona: Persona) {
    if (systemPrompt && !confirm("Replace current system prompt?")) return;
    onLoad(persona.systemPrompt);
    setOpen(false);
    setPreview(null);
  }

  return (
    <div className="border border-[#30363D] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center justify-between bg-[#1E2330] hover:bg-[#252D3D] transition-colors"
      >
        <span className="text-sm font-semibold text-[#E6EDF3]">Persona Presets</span>
        <span className="text-xs text-[#484F58]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPreview(null); }}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  activeCategory === cat
                    ? "bg-indigo-500 text-white"
                    : "bg-[#1E2330] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#484F58]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Persona list */}
          <div className="space-y-1">
            {filtered.map((persona) => (
              <div
                key={persona.id}
                className={`rounded px-3 py-2 cursor-pointer transition-colors ${
                  preview?.id === persona.id
                    ? "bg-indigo-500/10 border border-indigo-500/30"
                    : "hover:bg-[#1E2330] border border-transparent"
                }`}
                onClick={() => setPreview(preview?.id === persona.id ? null : persona)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#E6EDF3]">{persona.name}</span>
                  <span className="text-[10px] text-[#484F58] shrink-0 ml-2">{persona.category}</span>
                </div>
                <p className="text-[11px] text-[#8B949E] mt-0.5">{persona.description}</p>
              </div>
            ))}
          </div>

          {/* Preview pane */}
          {preview && (
            <div className="border border-[#30363D] rounded-lg p-3 space-y-2 bg-[#0D1117]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#E6EDF3]">{preview.name}</span>
                <button
                  onClick={() => handleUse(preview)}
                  className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded transition-colors"
                >
                  Use this
                </button>
              </div>
              <p className="text-[11px] text-[#8B949E] leading-relaxed whitespace-pre-wrap font-mono">
                {preview.systemPrompt}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
