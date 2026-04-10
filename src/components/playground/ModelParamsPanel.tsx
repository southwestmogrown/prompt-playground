"use client";

import { useState } from "react";
import type { ModelParams } from "@/lib/types";

interface ModelParamsPanelProps {
  selectedModels: string[];
  modelParams: Record<string, ModelParams>;
  onChange: (params: Record<string, ModelParams>) => void;
}

const PARAM_DEFS = [
  {
    key: "temperature" as const,
    label: "Temperature",
    description: "Controls randomness",
    min: 0,
    max: 2,
    step: 0.05,
    default: 1.0,
    format: (v: number) => v.toFixed(2),
  },
  {
    key: "top_p" as const,
    label: "Top P",
    description: "Nucleus sampling threshold",
    min: 0,
    max: 1,
    step: 0.05,
    default: 1.0,
    format: (v: number) => v.toFixed(2),
  },
  {
    key: "max_tokens" as const,
    label: "Max Tokens",
    description: "Maximum response length",
    min: 256,
    max: 8192,
    step: 256,
    default: 4096,
    format: (v: number) => v.toString(),
  },
] as const;

function ParamSlider({
  param,
  value,
  onChange,
}: {
  param: (typeof PARAM_DEFS)[number];
  value: number | undefined;
  onChange: (key: keyof ModelParams, val: number) => void;
}) {
  const current = value ?? param.default;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-on-surface">{param.label}</span>
          <span className="text-[10px] text-outline">{param.description}</span>
        </div>
        <span className="text-xs font-mono text-primary font-bold tabular-nums">
          {param.format(current)}
        </span>
      </div>
      <input
        type="range"
        min={param.min}
        max={param.max}
        step={param.step}
        value={current}
        onChange={(e) => onChange(param.key, parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary bg-surface-container-high"
      />
    </div>
  );
}

export default function ModelParamsPanel({
  selectedModels,
  modelParams,
  onChange,
}: ModelParamsPanelProps) {
  const [open, setOpen] = useState(false);

  function updateParam(modelId: string, key: keyof ModelParams, val: number) {
    onChange({
      ...modelParams,
      [modelId]: { ...(modelParams[modelId] ?? {}), [key]: val },
    });
  }

  const hasCustom =
    Object.values(modelParams).some(
      (p) =>
        p.temperature !== undefined ||
        p.top_p !== undefined ||
        p.max_tokens !== undefined
    );

  return (
    <div className="glass-panel ghost-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container-low transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
            tune
          </span>
          <span className="text-sm font-semibold text-on-surface">Parameters</span>
          {hasCustom && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </div>
        <span
          className="material-symbols-outlined text-[16px] text-on-surface-variant transition-transform"
          style={{ fontVariationSettings: open ? "'FILL' 1" : "'FILL' 0" }}
        >
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-[rgba(174,173,170,0.08)]">
          {selectedModels.length === 0 ? (
            <p className="text-xs text-outline py-2">Select a model to configure parameters</p>
          ) : selectedModels.length === 1 ? (
            <div className="flex flex-col gap-4">
              {PARAM_DEFS.map((param) => (
                <ParamSlider
                  key={param.key}
                  param={param}
                  value={modelParams[selectedModels[0]]?.[param.key]}
                  onChange={(key, val) => updateParam(selectedModels[0], key, val)}
                />
              ))}
            </div>
          ) : (
            <>
              <p className="text-xs text-outline mb-3">
                Configure parameters per model below
              </p>
              <div className="flex flex-col gap-4">
                {selectedModels.map((modelId) => (
                  <div key={modelId} className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-primary">{modelId}</span>
                    <div className="flex flex-col gap-3">
                      {PARAM_DEFS.map((param) => (
                        <ParamSlider
                          key={param.key}
                          param={param}
                          value={modelParams[modelId]?.[param.key]}
                          onChange={(key, val) => updateParam(modelId, key, val)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
