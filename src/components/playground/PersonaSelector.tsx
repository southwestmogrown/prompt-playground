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
    <div className="glass-panel ghost-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container-low/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            person
          </span>
          <span className="text-sm font-bold text-on-surface">Persona Presets</span>
        </div>
        <span className={`material-symbols-outlined text-outline text-[16px] transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          keyboard_arrow_down
        </span>
      </button>

      {open && (
        <div className="border-t border-[rgba(174,173,170,0.10)]">
          <div className="px-4 pt-3 max-h-[280px] overflow-y-auto">
            {/* Category chips */}
            <div className="flex flex-wrap gap-1 pb-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setPreview(null); }}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                    activeCategory === cat
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Persona list */}
            <div className="space-y-0.5">
              {filtered.map((persona) => (
                <div
                  key={persona.id}
                  className={`rounded-xl px-3 py-2 cursor-pointer transition-colors ${
                    preview?.id === persona.id
                      ? "bg-secondary-container/40 border border-secondary/20"
                      : "hover:bg-surface-container-low border border-transparent"
                  }`}
                  onClick={() => setPreview(preview?.id === persona.id ? null : persona)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-on-surface">{persona.name}</span>
                    <span className="text-[10px] text-outline shrink-0 ml-2">{persona.category}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">{persona.description}</p>
                </div>
              ))}
            </div>

            {/* Preview pane */}
            {preview && (
              <div className="bg-surface-container-low/50 ghost-border rounded-xl p-3 space-y-2 mt-3 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">{preview.name}</span>
                  <button
                    onClick={() => handleUse(preview)}
                    className="text-xs text-on-primary px-3 py-1 rounded-xl font-bold bg-gradient-to-r from-primary to-primary-container shadow-[0_4px_12px_rgba(160,58,15,0.2)] hover:shadow-[0_6px_16px_rgba(160,58,15,0.3)] transition-all"
                  >
                    Use this
                  </button>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed whitespace-pre-wrap font-mono">
                  {preview.systemPrompt}
                </p>
              </div>
            )}
          </div>
          <div className="px-4 pb-4" />
        </div>
      )}
    </div>
  );
}
