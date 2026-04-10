import { GoogleGenerativeAI } from "@google/generative-ai";

export async function callGoogle(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  apiKey: string
): Promise<{ response: string; latency_ms: number }> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelId,
    ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
  });

  const start = Date.now();
  const result = await model.generateContent(userMessage);
  const latency_ms = Date.now() - start;

  return { response: result.response.text(), latency_ms };
}
