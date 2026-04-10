import OpenAI from "openai";

export async function callXAI(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  apiKey: string
): Promise<{ response: string; latency_ms: number }> {
  const client = new OpenAI({ apiKey, baseURL: "https://api.x.ai/v1" });
  const start = Date.now();

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: userMessage });

  const completion = await client.chat.completions.create({ model: modelId, messages });
  const latency_ms = Date.now() - start;

  return { response: completion.choices[0]?.message?.content ?? "", latency_ms };
}
