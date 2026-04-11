import OpenAI from "openai";
import type { ModelParams } from "@/lib/types";

const BASE_URL = "https://api.mistral.ai/v1";

export async function callMistral(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  params?: ModelParams
): Promise<{ response: string; latency_ms: number }> {
  const client = new OpenAI({ apiKey, baseURL: BASE_URL });
  const start = Date.now();

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: userMessage });

  const completion = await client.chat.completions.create({
    model: modelId,
    messages,
    ...(params?.max_tokens !== undefined && { max_tokens: params.max_tokens }),
    ...(params?.temperature !== undefined && { temperature: params.temperature }),
    ...(params?.top_p !== undefined && { top_p: params.top_p }),
  });

  return { response: completion.choices[0]?.message?.content ?? "", latency_ms: Date.now() - start };
}

export async function* streamMistral(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  params?: ModelParams
): AsyncGenerator<string, void, void> {
  const client = new OpenAI({ apiKey, baseURL: BASE_URL });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: userMessage });

  const stream = await client.chat.completions.create({
    model: modelId,
    messages,
    stream: true,
    ...(params?.max_tokens !== undefined && { max_tokens: params.max_tokens }),
    ...(params?.temperature !== undefined && { temperature: params.temperature }),
    ...(params?.top_p !== undefined && { top_p: params.top_p }),
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) yield token;
  }
}
