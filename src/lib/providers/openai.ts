import OpenAI from "openai";
import type { ModelParams } from "@/lib/types";

export async function callOpenAI(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  params?: ModelParams
): Promise<{ response: string; latency_ms: number }> {
  const client = new OpenAI({ apiKey });
  const start = Date.now();

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: userMessage });

  const completion = await client.chat.completions.create({
    model: modelId,
    messages,
    ...(params?.max_tokens !== undefined && { max_tokens: params.max_tokens }),
    ...(params?.temperature !== undefined && { temperature: params.temperature }),
    ...(params?.top_p !== undefined && { top_p: params.top_p }),
  });

  const latency_ms = Date.now() - start;
  const response = completion.choices[0]?.message?.content ?? "";

  return { response, latency_ms };
}
