import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ModelParams } from "@/lib/types";

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

  const request: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
  };
  if (params?.max_tokens !== undefined || params?.temperature !== undefined || params?.top_p !== undefined) {
    request.generationConfig = {};
    if (params?.max_tokens !== undefined) (request.generationConfig as Record<string, unknown>).maxOutputTokens = params.max_tokens;
    if (params?.temperature !== undefined) (request.generationConfig as Record<string, unknown>).temperature = params.temperature;
    if (params?.top_p !== undefined) (request.generationConfig as Record<string, unknown>).topP = params.top_p;
  }
  if (systemPrompt) request.system_instruction = { parts: [{ text: systemPrompt }] };

  const start = Date.now();
  const result = await model.generateContent(request as unknown as Parameters<typeof model.generateContent>[0]);
  const latency_ms = Date.now() - start;

  return { response: result.response.text(), latency_ms };
}
