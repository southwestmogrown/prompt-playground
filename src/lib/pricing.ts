interface ModelPricing {
  inputPer1M: number;
  outputPer1M: number;
}

const MODEL_PRICING: Partial<Record<string, ModelPricing>> = {
  "claude-opus-4-6":           { inputPer1M: 15.00, outputPer1M: 75.00 },
  "claude-sonnet-4-6":         { inputPer1M: 3.00,  outputPer1M: 15.00 },
  "claude-haiku-4-5-20251001": { inputPer1M: 0.80,  outputPer1M: 4.00  },
  "gpt-4.1":                   { inputPer1M: 2.00,  outputPer1M: 8.00  },
  "gpt-4o":                    { inputPer1M: 2.50,  outputPer1M: 10.00 },
  "gpt-4o-mini":               { inputPer1M: 0.15,  outputPer1M: 0.60  },
  "o3-mini":                   { inputPer1M: 1.10,  outputPer1M: 4.40  },
  "gemini-2.0-flash":          { inputPer1M: 0.10,  outputPer1M: 0.40  },
  "gemini-1.5-pro":            { inputPer1M: 1.25,  outputPer1M: 5.00  },
  "mistral-large-latest":      { inputPer1M: 2.00,  outputPer1M: 6.00  },
  "mistral-small-latest":      { inputPer1M: 0.10,  outputPer1M: 0.30  },
  "llama-3.3-70b-versatile":   { inputPer1M: 0.59,  outputPer1M: 0.79  },
  "llama-3.1-8b-instant":      { inputPer1M: 0.05,  outputPer1M: 0.08  },
  "grok-3":                    { inputPer1M: 3.00,  outputPer1M: 15.00 },
  "grok-3-mini":               { inputPer1M: 0.30,  outputPer1M: 0.50  },
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
