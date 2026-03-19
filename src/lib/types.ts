export type ProviderName = "anthropic" | "openai";

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  provider: ProviderName;
  key_hint: string;
  created_at: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: ProviderName;
  contextWindow: number;
}

export interface ModelResponse {
  model: string;
  response: string;
  score: number | null;
  latency_ms: number;
  error?: string;
}

export interface Run {
  id: string;
  user_id: string;
  system_prompt: string;
  user_message: string;
  models: string[];
  responses: ModelResponse[];
  created_at: string;
}

export interface RunRequest {
  systemPrompt: string;
  userMessage: string;
  models: string[];
  isDemo?: boolean;
}

export interface RunResult {
  responses: ModelResponse[];
}

export interface DemoSession {
  runsUsed: number;
  startedAt: string;
}
