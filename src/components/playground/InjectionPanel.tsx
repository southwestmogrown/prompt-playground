"use client";

import { useState } from "react";
import { INJECTION_TESTS, INJECTION_CATEGORIES } from "@/lib/injections";
import type { InjectionTest } from "@/lib/injections";

interface InjectionPanelProps {
  onInject: (message: string) => void;
  onInjectAndRun: (message: string) => void;
  loading: boolean;
}

export default function InjectionPanel({
  onInject,
  onInjectAndRun,
  loading,
}: InjectionPanelProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);

  const categories = ["All", ...INJECTION_CATEGORIES];
  const filtered =
    activeCategory === "All"
      ? INJECTION_TESTS
      : INJECTION_TESTS.filter((t) => t.category === activeCategory);

  function handleTest(test: InjectionTest) {
    onInjectAndRun(test.message);
  }

  async function handleTestAll() {
    const confirmed = confirm(
      `This will run ${filtered.length} adversarial messages sequentially against the selected models. Each run consumes API credits. Continue?`
    );
    if (!confirmed) return;
    setRunningAll(true);
    for (const test of filtered) {
      onInject(test.message);
      await new Promise<void>((resolve) => {
        onInjectAndRun(test.message);
        setTimeout(resolve, 500);
      });
    }
    setRunningAll(false);
  }

  const categoryColor: Record<string, string> = {
    "Instruction Override": "text-[#d97706]",
    "Prompt Leak": "text-[#765600]",
    "Role Confusion": "text-secondary",
    Jailbreak: "text-error",
  };

  return (
    <div className="glass-panel ghost-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container-low/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            bug_report
          </span>
          <span className="text-sm font-bold text-on-surface">Injection Testing</span>
          <span className="text-[10px] bg-error/10 text-error border border-error/20 px-2 py-0.5 rounded-full font-bold">
            {INJECTION_TESTS.length}
          </span>
        </div>
        <span className={`material-symbols-outlined text-outline text-[16px] transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          keyboard_arrow_down
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-[rgba(174,173,170,0.10)]">
          {/* Category chips */}
          <div className="flex flex-wrap gap-1 pt-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                  activeCategory === cat
                    ? "bg-error/15 text-error border border-error/25"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Test list */}
          <div className="space-y-1">
            {filtered.map((test) => (
              <div key={test.id} className="ghost-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => setExpandedId(expandedId === test.id ? null : test.id)}
                      className="text-xs text-on-surface text-left truncate hover:text-primary transition-colors"
                    >
                      {test.label}
                    </button>
                    <span className={`text-[10px] shrink-0 font-semibold ${categoryColor[test.category] ?? "text-outline"}`}>
                      {test.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleTest(test)}
                    disabled={loading || runningAll}
                    className="text-xs text-on-primary px-2.5 py-1 rounded-lg font-bold bg-gradient-to-r from-primary to-primary-container disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ml-2 transition-all hover:-translate-y-0.5"
                  >
                    Test
                  </button>
                </div>
                {expandedId === test.id && (
                  <div className="px-3 pb-2.5 border-t border-[rgba(174,173,170,0.10)] pt-2 bg-surface-container-low/30">
                    <p className="text-[11px] text-on-surface-variant font-mono leading-relaxed">
                      {test.message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Test All */}
          <button
            onClick={handleTestAll}
            disabled={loading || runningAll}
            className="w-full text-xs border border-error/30 text-error hover:bg-error/8 py-2 rounded-xl font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {runningAll ? "Running…" : `Test All (${filtered.length})`}
          </button>

          <p className="text-[11px] text-outline">
            Click a test label to preview the message. &quot;Test&quot; runs it immediately with your current system prompt.
          </p>
        </div>
      )}
    </div>
  );
}
