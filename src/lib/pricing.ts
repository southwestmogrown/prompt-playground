interface ModelPricing {
  inputPer1M: number;
  outputPer1M: number;
}

const MODEL_PRICING: Partial<Record<string, ModelPricing>> = {
  "claude-opus-4-6":           { inputPer1M: 15.00, outputPer1M: 75.00 },
  "claude-sonnet-4-6":         { inputPer1M: 3.00,  outputPer1M: 15.00 },
  "claude-haiku-4-5-20251001": { inputPer1M: 0.80,  outputPer1M: 4.00  },
  "gpt-5.4":                                        { inputPer1M: 2.50,  outputPer1M: 15.00 },
  "gpt-5.4-mini":                                   { inputPer1M: 0.75,  outputPer1M: 4.50  },
  // gemini-3.1-pro-preview / gemini-3.1-flash-lite-preview: pricing not yet published (preview)
  "mistral-small-4-0-26-03":                        { inputPer1M: 0.15,  outputPer1M: 0.60  },
  "meta-llama/llama-4-scout-17b-16e-instruct":      { inputPer1M: 0.11,  outputPer1M: 0.34  },
  // grok-4.1: pricing not yet confirmed in public docs
};

// Character-based token approximation (~4 chars per token for English text).
// Accurate to ~10%, sufficient for cost estimates.
function approxTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function estimateCost(
  modelId: string,
  inputText: string,
  outputText: string
): number | null {
  const pricing = MODEL_PRICING[modelId];
  if (!pricing) return null;
  const inputTokens = approxTokens(inputText);
  const outputTokens = approxTokens(outputText);
  return (inputTokens / 1_000_000) * pricing.inputPer1M
       + (outputTokens / 1_000_000) * pricing.outputPer1M;
}
