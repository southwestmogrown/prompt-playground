import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ModelParams } from "@/lib/types";

function buildRequest(userMessage: string, params?: ModelParams) {
  const request: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
  };
  if (
    params?.max_tokens !== undefined ||
    params?.temperature !== undefined ||
    params?.top_p !== undefined
  ) {
    const cfg: Record<string, unknown> = {};
    if (params.max_tokens !== undefined) cfg.maxOutputTokens = params.max_tokens;
    if (params.temperature !== undefined) cfg.temperature = params.temperature;
    if (params.top_p !== undefined) cfg.topP = params.top_p;
    request.generationConfig = cfg;
  }
  return request;
}

export async function callGoogle(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  params?: ModelParams
): Promise<{ response: string; latency_ms: number }> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelId,
    ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
  });

  const start = Date.now();
  const result = await model.generateContent(
    buildRequest(userMessage, params) as unknown as Parameters<typeof model.generateContent>[0]
  );

  return { response: result.response.text(), latency_ms: Date.now() - start };
}

export async function* streamGoogle(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  params?: ModelParams
): AsyncGenerator<string, void, void> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelId,
    ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
  });

  const result = await model.generateContentStream(
    buildRequest(userMessage, params) as unknown as Parameters<typeof model.generateContentStream>[0]
  );

  for await (const chunk of result.stream) {
    const token = chunk.text();
    if (token) yield token;
  }
}
