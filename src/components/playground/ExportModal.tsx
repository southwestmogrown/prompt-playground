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

  // OpenAI-compat (openai, mistral, groq, xai)
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

  // OpenAI-compat
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

  // OpenAI-compat
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
  if (provider === "anthropic" || provider === "google") return "";  // handled inline above
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363D]">
          <h2 className="text-sm font-semibold text-[#E6EDF3]">Export as Code</h2>
          <button
            onClick={onClose}
            className="text-[#484F58] hover:text-[#8B949E] text-lg leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5 overflow-y-auto">
          {/* Model selector (if multiple) */}
          {selectedModels.length > 1 && (
            <div className="flex flex-wrap gap-1">
              {selectedModels.map((id) => {
                const m = SUPPORTED_MODELS.find((x) => x.id === id);
                return (
                  <button
                    key={id}
                    onClick={() => setActiveModel(id)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      activeModel === id
                        ? "bg-indigo-500 text-white"
                        : "bg-[#1E2330] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]"
                    }`}
                  >
                    {m?.name ?? id}
                  </button>
                );
              })}
            </div>
          )}

          {/* Language tabs */}
          <div className="flex gap-1">
            {LANGS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setLang(id)}
                className={`text-xs px-3 py-1.5 rounded transition-colors ${
                  lang === id
                    ? "bg-[#1E2330] border border-indigo-500/60 text-[#E6EDF3]"
                    : "text-[#8B949E] hover:text-[#E6EDF3]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Code block */}
          <div className="relative">
            <pre className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 text-[11px] text-[#E6EDF3] font-mono leading-relaxed overflow-x-auto whitespace-pre">
              {code}
            </pre>
            <button
              onClick={copyCode}
              className="absolute top-2 right-2 text-[10px] bg-[#1E2330] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] px-2 py-1 rounded transition-colors"
            >
              Copy
            </button>
          </div>

          <p className="text-[11px] text-[#484F58]">
            Replace <code className="text-[#8B949E]">YOUR_API_KEY</code> with your actual key before running.
          </p>
        </div>
      </div>
    </div>
  );
}
