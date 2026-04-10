import { ModelOption } from "./types";

export const SUPPORTED_MODELS: ModelOption[] = [
  // Anthropic
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    provider: "anthropic",
    contextWindow: 200000,
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "anthropic",
    contextWindow: 200000,
  },
  {
    id: "claude-haiku-4-5-20251001",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    contextWindow: 200000,
  },

  // OpenAI
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    contextWindow: 1047576,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    contextWindow: 128000,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    contextWindow: 128000,
  },
  {
    id: "o3-mini",
    name: "o3-mini",
    provider: "openai",
    contextWindow: 200000,
  },

  // Google Gemini
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    contextWindow: 1000000,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    contextWindow: 2000000,
  },

  // Mistral
  {
    id: "mistral-large-latest",
    name: "Mistral Large",
    provider: "mistral",
    contextWindow: 128000,
  },
  {
    id: "mistral-small-latest",
    name: "Mistral Small",
    provider: "mistral",
    contextWindow: 128000,
  },

  // Groq (Meta Llama)
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    provider: "groq",
    contextWindow: 128000,
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B",
    provider: "groq",
    contextWindow: 128000,
  },

  // xAI Grok
  {
    id: "grok-3",
    name: "Grok 3",
    provider: "xai",
    contextWindow: 131072,
  },
  {
    id: "grok-3-mini",
    name: "Grok 3 Mini",
    provider: "xai",
    contextWindow: 131072,
  },
];

export const DEMO_MODELS = SUPPORTED_MODELS.filter(
  (m) => m.provider === "anthropic"
);
