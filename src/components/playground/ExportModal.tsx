"use client";

import { useState } from "react";
import { SUPPORTED_MODELS } from "@/lib/models";
import type { ProviderName } from "@/lib/types";
import type { ModelParams } from "@/lib/types";

interface ExportModalProps {
  systemPrompt: string;
  userMessage: string;
  selectedModels: string[];
  modelParams: Record<string, ModelParams>;
  onClose: () => void;
}

type Lang = "python" | "typescript" | "curl";

const BASE_URLS: Partial<Record<ProviderName, string>> = {
  mistral: "https://api.mistral.ai/v1",
  groq: "https://api.groq.com/openai/v1",
  xai: "https://api.x.ai/v1",
};

function escape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function pythonCode(
  modelId: string,
  provider: ProviderName,
  systemPrompt: string,
  userMessage: string,
  params: ModelParams
): string {
  const paramLines = buildParamLines(params, provider, "    ");
  if (provider === "anthropic") {
    return `import anthropic

client = anthropic.Anthropic(api_key="YOUR_API_KEY")

message = client.messages.create(
    model="${modelId}",
    max_tokens=${params.max_tokens ?? 1024},${paramLines}${systemPrompt ? `\n    system="${escape(systemPrompt)}",` : ""}
    messages=[{"role": "user", "content": "${escape(userMessage)}"}],
)
print(message.content[0].text)`;
  }

  if (provider === "google") {
    return `import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel(
    model_name="${modelId}",${systemPrompt ? `\n    system_instruction="${escape(systemPrompt)}",` : ""}
)
response = model.generate_content(
    "${escape(userMessage)}",
    generation_config=genai.GenerationConfig(
        max_output_tokens=${params.max_tokens ?? 1024},${params.temperature !== undefined ? `\n        temperature=${params.temperature},` : ""}${params.top_p !== undefined ? `\n        top_p=${params.top_p},` : ""}
    ),
)
print(response.text)`;
  }

  const baseUrl = BASE_URLS[provider];
  return `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",${baseUrl ? `\n    base_url="${baseUrl}",` : ""}
)

completion = client.chat.completions.create(
    model="${modelId}",
    max_tokens=${params.max_tokens ?? 1024},${paramLines}
    messages=[${systemPrompt ? `\n        {"role": "system", "content": "${escape(systemPrompt)}"},` : ""}
        {"role": "user", "content": "${escape(userMessage)}"},
    ],
)
print(completion.choices[0].message.content)`;
}

function typescriptCode(
  modelId: string,
  provider: ProviderName,
  systemPrompt: string,
  userMessage: string,
  params: ModelParams
): string {
  const paramLines = buildParamLines(params, provider, "  ");
  if (provider === "anthropic") {
    return `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: "YOUR_API_KEY" });

const message = await client.messages.create({
  model: "${modelId}",
  max_tokens: ${params.max_tokens ?? 1024},${paramLines}${systemPrompt ? `\n  system: "${escape(systemPrompt)}",` : ""}
  messages: [{ role: "user", content: "${escape(userMessage)}" }],
});
console.log(message.content[0].type === "text" ? message.content[0].text : "");`;
  }

  if (provider === "google") {
    return `import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("YOUR_API_KEY");
const model = genAI.getGenerativeModel({
  model: "${modelId}",${systemPrompt ? `\n  systemInstruction: "${escape(systemPrompt)}",` : ""}
});

const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: "${escape(userMessage)}" }] }],
  generationConfig: {
    maxOutputTokens: ${params.max_tokens ?? 1024},${params.temperature !== undefined ? `\n    temperature: ${params.temperature},` : ""}${params.top_p !== undefined ? `\n    topP: ${params.top_p},` : ""}
  },
});
console.log(result.response.text());`;
  }

  const baseUrl = BASE_URLS[provider];
  return `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",${baseUrl ? `\n  baseURL: "${baseUrl}",` : ""}
});

const completion = await client.chat.completions.create({
  model: "${modelId}",
  max_tokens: ${params.max_tokens ?? 1024},${paramLines}
  messages: [${systemPrompt ? `\n    { role: "system", content: "${escape(systemPrompt)}" },` : ""}
    { role: "user", content: "${escape(userMessage)}" },
  ],
});
console.log(completion.choices[0]?.message?.content ?? "");`;
}

function curlCode(
  modelId: string,
  provider: ProviderName,
  systemPrompt: string,
  userMessage: string,
  params: ModelParams
): string {
  if (provider === "anthropic") {
    const body: Record<string, unknown> = {
      model: modelId,
      max_tokens: params.max_tokens ?? 1024,
      messages: [{ role: "user", content: userMessage }],
    };
    if (systemPrompt) body.system = systemPrompt;
    if (params.temperature !== undefined) body.temperature = params.temperature;
    if (params.top_p !== undefined) body.top_p = params.top_p;
    return `curl https://api.anthropic.com/v1/messages \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '${JSON.stringify(body, null, 2)}'`;
  }

  if (provider === "google") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=YOUR_API_KEY`;
    const body: Record<string, unknown> = {
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: {
        maxOutputTokens: params.max_tokens ?? 1024,
        ...(params.temperature !== undefined && { temperature: params.temperature }),
        ...(params.top_p !== undefined && { topP: params.top_p }),
      },
    };
    if (systemPrompt) body.system_instruction = { parts: [{ text: systemPrompt }] };
    return `curl "${url}" \\
  -H "content-type: application/json" \\
  -d '${JSON.stringify(body, null, 2)}'`;
  }

  const baseUrl = BASE_URLS[provider] ?? "https://api.openai.com/v1";
  const messages: Array<{ role: string; content: string }> = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: userMessage });
  const body: Record<string, unknown> = {
    model: modelId,
    max_tokens: params.max_tokens ?? 1024,
    messages,
  };
  if (params.temperature !== undefined) body.temperature = params.temperature;
  if (params.top_p !== undefined) body.top_p = params.top_p;
  return `curl ${baseUrl}/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "content-type: application/json" \\
  -d '${JSON.stringify(body, null, 2)}'`;
}

function buildParamLines(
  params: ModelParams,
  provider: ProviderName,
  indent: string
): string {
  const lines: string[] = [];
  if (params.temperature !== undefined) lines.push(`${indent}temperature: ${params.temperature},`);
  if (params.top_p !== undefined) lines.push(`${indent}top_p: ${params.top_p},`);
  if (provider === "anthropic" || provider === "google") return "";
  return lines.length ? "\n" + lines.join("\n") : "";
}

export default function ExportModal({
  systemPrompt,
  userMessage,
  selectedModels,
  modelParams,
  onClose,
}: ExportModalProps) {
  const [lang, setLang] = useState<Lang>("python");
  const [activeModel, setActiveModel] = useState(selectedModels[0] ?? "");

  const model = SUPPORTED_MODELS.find((m) => m.id === activeModel);
  const provider = model?.provider ?? "anthropic";
  const params = modelParams[activeModel] ?? {};

  const code =
    lang === "python"
      ? pythonCode(activeModel, provider, systemPrompt, userMessage, params)
      : lang === "typescript"
      ? typescriptCode(activeModel, provider, systemPrompt, userMessage, params)
      : curlCode(activeModel, provider, systemPrompt, userMessage, params);

  function copyCode() {
    navigator.clipboard.writeText(code).catch(() => {});
  }

  const LANGS: { id: Lang; label: string }[] = [
    { id: "python", label: "Python" },
    { id: "typescript", label: "TypeScript" },
    { id: "curl", label: "curl" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-md p-4">
      <div className="glass-panel ghost-border rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_30px_80px_rgba(160,58,15,0.15)] refractive-shadow">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(174,173,170,0.12)]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              code
            </span>
            <h2 className="text-sm font-bold text-on-surface">Export as Code</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6 overflow-y-auto">
          {/* Model selector */}
          {selectedModels.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedModels.map((id) => {
                const m = SUPPORTED_MODELS.find((x) => x.id === id);
                return (
                  <button
                    key={id}
                    onClick={() => setActiveModel(id)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                      activeModel === id
                        ? "bg-primary/10 border border-primary/25 text-primary"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {m?.name ?? id}
                  </button>
                );
              })}
            </div>
          )}

          {/* Language tabs */}
          <div className="flex bg-surface-container-low/50 ghost-border rounded-xl p-1 gap-1">
            {LANGS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setLang(id)}
                className={`flex-1 text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                  lang === id
                    ? "bg-surface-container-lowest shadow-sm text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Code block */}
          <div className="relative">
            <pre className="bg-surface-container-lowest ghost-border rounded-2xl p-5 text-[11px] text-on-surface font-mono leading-relaxed overflow-x-auto whitespace-pre">
              {code}
            </pre>
            <button
              onClick={copyCode}
              className="absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] glass-panel ghost-border text-on-surface-variant hover:text-on-surface px-2.5 py-1 rounded-lg transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-[12px]">content_copy</span>
              Copy
            </button>
          </div>

          <p className="text-xs text-outline">
            Replace <code className="text-on-surface font-semibold">YOUR_API_KEY</code> with your actual key before running.
          </p>
        </div>
      </div>
    </div>
  );
}
