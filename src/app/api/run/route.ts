import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { callAnthropic } from "@/lib/providers/anthropic";
import { callOpenAI } from "@/lib/providers/openai";
import { SUPPORTED_MODELS, DEMO_MODELS } from "@/lib/models";
import type { RunRequest, ModelResponse } from "@/lib/types";

const rawDemoRunLimit = process.env.DEMO_RUN_LIMIT;
const parsedDemoRunLimit = rawDemoRunLimit ? parseInt(rawDemoRunLimit, 10) : NaN;
const DEMO_RUN_LIMIT =
  Number.isNaN(parsedDemoRunLimit) || parsedDemoRunLimit <= 0 ? 3 : parsedDemoRunLimit;

// In-memory per-IP demo rate limiting (resets on server restart)
const demoIpCounts = new Map<string, number>();

function getEncryptionKey(): Buffer {
  return crypto.scryptSync(process.env.ENCRYPTION_SECRET!, "salt", 32);
}

function decryptApiKey(encrypted: string): string {
  const [ivHex, authTagHex, encryptedHex] = encrypted.split(":");
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
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
  apiKey: string
): Promise<ModelResponse> {
  const model = SUPPORTED_MODELS.find((m) => m.id === modelId);
  if (!model) {
    return { model: modelId, response: "", score: null, latency_ms: 0, error: "Unknown model" };
  }
  try {
    const result =
      model.provider === "anthropic"
        ? await callAnthropic(modelId, systemPrompt, userMessage, apiKey)
        : await callOpenAI(modelId, systemPrompt, userMessage, apiKey);
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
  const { systemPrompt = "", userMessage, models, isDemo } = body;

  if (!userMessage?.trim() || !models?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

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
    const validModels = models.filter((m) => allowedIds.has(m));
    if (!validModels.length) {
      return NextResponse.json({ error: "No valid demo models selected" }, { status: 400 });
    }

    const responses = await Promise.all(
      validModels.map((modelId) =>
        callModel(modelId, systemPrompt, userMessage, demoKey)
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
    } catch {
      // skip invalid keys
    }
  }

  const responses = await Promise.all(
    models.map((modelId) => {
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
      return callModel(modelId, systemPrompt, userMessage, apiKey);
    })
  );

  return NextResponse.json({ responses });
}
