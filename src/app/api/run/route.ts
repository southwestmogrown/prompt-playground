import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { callAnthropic } from "@/lib/providers/anthropic";
import { callOpenAI } from "@/lib/providers/openai";
import { callGoogle } from "@/lib/providers/google";
import { callMistral } from "@/lib/providers/mistral";
import { callGroq } from "@/lib/providers/groq";
import { callXAI } from "@/lib/providers/xai";
import { SUPPORTED_MODELS, DEMO_MODELS } from "@/lib/models";
import type { RunRequest, ModelResponse, ModelParams, ProviderName } from "@/lib/types";

type ProviderFn = (modelId: string, systemPrompt: string, userMessage: string, apiKey: string, params?: ModelParams) => Promise<{ response: string; latency_ms: number }>;

const PROVIDER_MAP: Record<ProviderName, ProviderFn> = {
  anthropic: callAnthropic,
  openai: callOpenAI,
  google: callGoogle,
  mistral: callMistral,
  groq: callGroq,
  xai: callXAI,
};

const rawDemoRunLimit = process.env.DEMO_RUN_LIMIT;
const parsedDemoRunLimit = rawDemoRunLimit ? parseInt(rawDemoRunLimit, 10) : NaN;
const DEMO_RUN_LIMIT =
  Number.isNaN(parsedDemoRunLimit) || parsedDemoRunLimit <= 0 ? 3 : parsedDemoRunLimit;

// In-memory per-IP demo rate limiting (resets on server restart)
const demoIpCounts = new Map<string, number>();

// Derive and cache the encryption key once at module load — scrypt is intentionally
// slow and must not be called on every request.
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;
if (!ENCRYPTION_SECRET) {
  throw new Error("ENCRYPTION_SECRET environment variable is not set");
}
const ENCRYPTION_KEY: Buffer = crypto.scryptSync(ENCRYPTION_SECRET, "salt", 32);

function decryptApiKey(encrypted: string): string {
  const parts = encrypted.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted key format");
  }
  const [ivHex, authTagHex, encryptedHex] = parts;
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    ENCRYPTION_KEY,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  return (
    decipher.update(Buffer.from(encryptedHex, "hex")).toString() +
    decipher.final().toString()
  );
}

async function callModel(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  params?: ModelParams
): Promise<ModelResponse> {
  const model = SUPPORTED_MODELS.find((m) => m.id === modelId);
  if (!model) {
    return { model: modelId, response: "", score: null, latency_ms: 0, error: "Unknown model" };
  }
  try {
    const result = await PROVIDER_MAP[model.provider](modelId, systemPrompt, userMessage, apiKey, params);
    return { model: modelId, response: result.response, score: null, latency_ms: result.latency_ms };
  } catch (err) {
    return {
      model: modelId,
      response: "",
      score: null,
      latency_ms: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function POST(request: NextRequest) {
  const body: RunRequest = await request.json();
  const { systemPrompt = "", userMessage, models, isDemo, parameters = {} } = body;

  if (!userMessage?.trim() || !models?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Deduplicate model IDs to prevent duplicate responses and React key collisions.
  const uniqueModels = [...new Set(models)];

  if (isDemo) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const count = demoIpCounts.get(ip) ?? 0;
    if (count >= DEMO_RUN_LIMIT) {
      return NextResponse.json({ error: "Demo limit reached" }, { status: 429 });
    }

    const demoKey = process.env.DEMO_ANTHROPIC_KEY;
    if (!demoKey) {
      return NextResponse.json({ error: "Demo not configured" }, { status: 503 });
    }

    const allowedIds = new Set(DEMO_MODELS.map((m) => m.id));
    const validModels = uniqueModels.filter((m) => allowedIds.has(m));
    if (!validModels.length) {
      return NextResponse.json({ error: "No valid demo models selected" }, { status: 400 });
    }

    const responses = await Promise.all(
      validModels.map((modelId) =>
        callModel(modelId, systemPrompt, userMessage, demoKey, parameters[modelId])
      )
    );
    demoIpCounts.set(ip, count + 1);
    return NextResponse.json({ responses });
  }

  // Authenticated mode
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: apiKeys, error: apiKeysError } = await supabase
    .from("api_keys")
    .select("provider, encrypted_key")
    .eq("user_id", user.id);
  if (apiKeysError) {
    console.error("Failed to fetch API keys for user", user.id, apiKeysError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const keyMap: Record<string, string> = {};
  for (const k of apiKeys ?? []) {
    try {
      keyMap[k.provider] = decryptApiKey(k.encrypted_key);
    } catch (err) {
      // Log corrupt keys so they're distinguishable from simply missing keys.
      console.warn("Failed to decrypt key for provider", k.provider, err instanceof Error ? err.message : err);
    }
  }

  const responses = await Promise.all(
    uniqueModels.map((modelId) => {
      const model = SUPPORTED_MODELS.find((m) => m.id === modelId);
      if (!model) {
        return Promise.resolve<ModelResponse>({
          model: modelId,
          response: "",
          score: null,
          latency_ms: 0,
          error: "Unknown model",
        });
      }
      const apiKey = keyMap[model.provider];
      if (!apiKey) {
        return Promise.resolve<ModelResponse>({
          model: modelId,
          response: "",
          score: null,
          latency_ms: 0,
          error: `No ${model.provider} API key configured`,
        });
      }
      return callModel(modelId, systemPrompt, userMessage, apiKey, parameters[modelId]);
    })
  );

  return NextResponse.json({ responses });
}
