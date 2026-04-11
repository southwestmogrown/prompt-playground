import Anthropic from "@anthropic-ai/sdk";
import type { ModelParams } from "@/lib/types";

export async function callAnthropic(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  params?: ModelParams
): Promise<{ response: string; latency_ms: number }> {
  const client = new Anthropic({ apiKey });
  const start = Date.now();

  const message = await client.messages.create({
    model: modelId,
    max_tokens: params?.max_tokens ?? 4096,
    system: systemPrompt || undefined,
    messages: [{ role: "user", content: userMessage }],
    ...(params?.temperature !== undefined && { temperature: params.temperature }),
    ...(params?.top_p !== undefined && { top_p: params.top_p }),
  });

  const latency_ms = Date.now() - start;
  const response =
    message.content[0].type === "text" ? message.content[0].text : "";

  return { response, latency_ms };
}

export async function* streamAnthropic(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  params?: ModelParams
): AsyncGenerator<string, void, void> {
  const client = new Anthropic({ apiKey });

  const stream = client.messages.stream({
    model: modelId,
    max_tokens: params?.max_tokens ?? 4096,
    system: systemPrompt || undefined,
    messages: [{ role: "user", content: userMessage }],
    ...(params?.temperature !== undefined && { temperature: params.temperature }),
    ...(params?.top_p !== undefined && { top_p: params.top_p }),
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
