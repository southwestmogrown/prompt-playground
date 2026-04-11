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
    id: "gpt-5.4",
    name: "GPT-5.4",
    provider: "openai",
    contextWindow: 1000000,
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT-5.4 Mini",
    provider: "openai",
    contextWindow: 400000,
  },

  // Google Gemini
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    provider: "google",
    contextWindow: 1000000,
  },
  {
    id: "gemini-3.1-flash-lite-preview",
    name: "Gemini 3.1 Flash Lite",
    provider: "google",
    contextWindow: 1000000,
  },

  // Mistral
  // Verified ID: mistral-small-4-0-26-03 (released March 2026; "mistral-small-4" alone is not a valid alias)
  {
    id: "mistral-small-4-0-26-03",
    name: "Mistral Small 4",
    provider: "mistral",
    contextWindow: 256000,
  },

  // Groq (Meta Llama)
  // Llama 4 Maverick deprecated on Groq as of Feb 20, 2026 — Scout only
  // Groq Llama 4 IDs use full paths unlike legacy short-form IDs
  {
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    name: "Llama 4 Scout",
    provider: "groq",
    contextWindow: 131072,
  },

  // xAI Grok
  // User supplied "grok-4.20" — verified ID is grok-4.1 (GA as of 2026)
  {
    id: "grok-4.1",
    name: "Grok 4.1",
    provider: "xai",
    contextWindow: 256000,
  },
];

export const DEMO_MODELS = SUPPORTED_MODELS.filter(
  (m) => m.provider === "anthropic"
);
