"use client";

import { useState } from "react";
import type { Persona } from "@/lib/personas";

interface Section {
  label: string;
  header: string; // original header line (empty for Role), used for reassembly
  content: string;
}

const SECTION_PATTERNS = [
  { key: "output format —", display: "Output Format" },
  { key: "output format:", display: "Output Format" },
  { key: "rules:", display: "Rules" },
  { key: "failure handling:", display: "Failure Handling" },
];

function parsePrompt(prompt: string): Section[] | null {
  const lower = prompt.toLowerCase();

  const found = SECTION_PATTERNS.map(({ key, display }) => {
    const i = lower.indexOf(key);
    return i === -1 ? null : { i, display };
  })
    .filter(Boolean)
    .sort((a, b) => a!.i - b!.i) as { i: number; display: string }[];

  if (found.length === 0) return null;

  const sections: Section[] = [];

  const role = prompt.slice(0, found[0].i).trim();
  if (role) sections.push({ label: "Role", header: "", content: role });

  for (let idx = 0; idx < found.length; idx++) {
    const cur = found[idx];
    const nextStart = idx + 1 < found.length ? found[idx + 1].i : prompt.length;
    const chunk = prompt.slice(cur.i, nextStart);
    const nlIdx = chunk.indexOf("\n");
    const headerStr = nlIdx === -1 ? chunk.trim() : chunk.slice(0, nlIdx).trim();
    const body = nlIdx === -1 ? "" : chunk.slice(nlIdx).trim();
    if (body) sections.push({ label: cur.display, header: headerStr, content: body });
  }

  return sections.length > 0 ? sections : null;
}

function reassemble(sections: Section[]): string {
  return sections
    .map((s) => (s.header ? `${s.header}\n${s.content}` : s.content))
    .join("\n\n");
}

interface PersonaPreviewModalProps {
  persona: Persona;
  onUse: (systemPrompt: string) => void;
  onClose: () => void;
}

export default function PersonaPreviewModal({
  persona,
  onUse,
  onClose,
}: PersonaPreviewModalProps) {
  const parsed = parsePrompt(persona.systemPrompt);
  const [sections, setSections] = useState<Section[]>(
    parsed ?? [{ label: "System Prompt", header: "", content: persona.systemPrompt }]
  );

  function handleSectionChange(idx: number, value: string) {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, content: value } : s)));
  }

  function handleUse() {
    onUse(reassemble(sections));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-[#0d1520] rounded-2xl ghost-border shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-5 py-4 border-b border-[rgba(174,173,170,0.10)] flex items-start justify-between shrink-0">
          <div>
            <h2 className="font-bold text-sm text-on-surface">{persona.name}</h2>
            <p className="console-label mt-0.5">{persona.category} · {persona.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-outline hover:text-on-surface transition-colors ml-3 mt-0.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {sections.map((section, idx) => (
            <div key={section.label} className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/80 font-mono">
                {section.label}
              </label>
              <textarea
                value={section.content}
                onChange={(e) => handleSectionChange(idx, e.target.value)}
                rows={Math.min(12, Math.max(3, section.content.split("\n").length + 1))}
                className="w-full bg-surface-container border border-[rgba(255,255,255,0.07)] rounded-lg px-3 py-2 font-mono text-xs text-on-surface resize-y focus:outline-none focus:border-primary/40 leading-relaxed"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[rgba(174,173,170,0.10)] flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg console-label border border-[rgba(255,255,255,0.1)] bg-surface-container hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUse}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-bold bg-primary text-on-primary glow-primary transition-all"
          >
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              person
            </span>
            Use this persona
          </button>
        </div>
      </div>
    </div>
  );
}
