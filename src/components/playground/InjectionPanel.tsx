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
      // Trigger run and wait a tick between runs so state settles
      await new Promise<void>((resolve) => {
        onInjectAndRun(test.message);
        // Small delay to avoid overwhelming the API
        setTimeout(resolve, 500);
      });
    }
    setRunningAll(false);
  }

  const categoryColor: Record<string, string> = {
    "Instruction Override": "text-orange-400",
    "Prompt Leak": "text-yellow-400",
    "Role Confusion": "text-purple-400",
    Jailbreak: "text-red-400",
  };

  return (
    <div className="border border-[#30363D] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center justify-between bg-[#1E2330] hover:bg-[#252D3D] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#E6EDF3]">Injection Testing</span>
          <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">
            {INJECTION_TESTS.length} tests
          </span>
        </div>
        <span className="text-xs text-[#484F58]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
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

          {/* Test list */}
          <div className="space-y-1">
            {filtered.map((test) => (
              <div key={test.id} className="border border-[#30363D] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => setExpandedId(expandedId === test.id ? null : test.id)}
                      className="text-xs text-[#E6EDF3] text-left truncate hover:text-indigo-300 transition-colors"
                    >
                      {test.label}
                    </button>
                    <span className={`text-[10px] shrink-0 ${categoryColor[test.category] ?? "text-[#484F58]"}`}>
                      {test.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleTest(test)}
                    disabled={loading || runningAll}
                    className="text-xs bg-[#1E2330] border border-[#30363D] hover:border-orange-500/50 hover:text-orange-300 text-[#8B949E] px-2 py-0.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ml-2"
                  >
                    Test
                  </button>
                </div>
                {expandedId === test.id && (
                  <div className="px-3 pb-2 border-t border-[#30363D] pt-2 bg-[#0D1117]">
                    <p className="text-[11px] text-[#8B949E] font-mono leading-relaxed">
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
            className="w-full text-xs border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 py-1.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {runningAll ? "Running…" : `Test All (${filtered.length})`}
          </button>

          <p className="text-[11px] text-[#484F58]">
            Click a test label to preview the message. &quot;Test&quot; runs it immediately with your current system prompt.
          </p>
        </div>
      )}
    </div>
  );
}
