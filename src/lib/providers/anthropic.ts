import Anthropic from "@anthropic-ai/sdk";

export async function callAnthropic(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  apiKey: string
): Promise<{ response: string; latency_ms: number }> {
  const client = new Anthropic({ apiKey });
  const start = Date.now();

  const message = await client.messages.create({
    model: modelId,
    max_tokens: 4096,
    system: systemPrompt || undefined,
    messages: [{ role: "user", content: userMessage }],
  });

  const latency_ms = Date.now() - start;
  const response =
    message.content[0].type === "text" ? message.content[0].text : "";

  return { response, latency_ms };
}
