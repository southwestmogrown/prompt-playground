import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { streamAnthropic } from "@/lib/providers/anthropic";
import { streamOpenAI } from "@/lib/providers/openai";
import { streamGoogle } from "@/lib/providers/google";
import { streamMistral } from "@/lib/providers/mistral";
import { streamGroq } from "@/lib/providers/groq";
import { streamXAI } from "@/lib/providers/xai";
import { SUPPORTED_MODELS, DEMO_MODELS } from "@/lib/models";
import type { RunRequest, ModelParams, ProviderName } from "@/lib/types";

type ProviderStreamFn = (
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  params?: ModelParams
) => AsyncGenerator<string, void, void>;

const PROVIDER_STREAM_MAP: Record<ProviderName, ProviderStreamFn> = {
  anthropic: streamAnthropic,
  openai:    streamOpenAI,
  google:    streamGoogle,
  mistral:   streamMistral,
  groq:      streamGroq,
  xai:       streamXAI,
};

const rawDemoRunLimit = process.env.DEMO_RUN_LIMIT;
const parsedDemoRunLimit = rawDemoRunLimit ? parseInt(rawDemoRunLimit, 10) : NaN;
const DEMO_RUN_LIMIT =
  Number.isNaN(parsedDemoRunLimit) || parsedDemoRunLimit <= 0 ? 3 : parsedDemoRunLimit;

const demoIpCounts = new Map<string, number>();

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;
if (!ENCRYPTION_SECRET) {
  throw new Error("ENCRYPTION_SECRET environment variable is not set");
}
const ENCRYPTION_KEY: Buffer = crypto.scryptSync(ENCRYPTION_SECRET, "salt", 32);

function decryptApiKey(encrypted: string): string {
  const parts = encrypted.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted key format");
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

function buildStream(
  models: string[],
  systemPrompt: string,
  userMessage: string,
  keyMap: Record<string, string>,
  parameters: Record<string, ModelParams>
): ReadableStream {
  const encode = (obj: object) =>
    new TextEncoder().encode(JSON.stringify(obj) + "\n");

  return new ReadableStream({
    async start(controller) {
      await Promise.all(
        models.map(async (modelId) => {
          const model = SUPPORTED_MODELS.find((m) => m.id === modelId);
          if (!model) {
            controller.enqueue(
              encode({ model: modelId, done: true, latency_ms: 0, error: "Unknown model" })
            );
            return;
          }
          const apiKey = keyMap[model.provider];
          if (!apiKey) {
            controller.enqueue(
              encode({ model: modelId, done: true, latency_ms: 0, error: `No ${model.provider} API key configured` })
            );
            return;
          }
          const start = Date.now();
          try {
            const gen = PROVIDER_STREAM_MAP[model.provider](
              modelId, systemPrompt, userMessage, apiKey, parameters[modelId]
            );
            for await (const token of gen) {
              controller.enqueue(encode({ model: modelId, token }));
            }
            controller.enqueue(
              encode({ model: modelId, done: true, latency_ms: Date.now() - start })
            );
          } catch (err) {
            controller.enqueue(
              encode({
                model: modelId,
                done: true,
                latency_ms: Date.now() - start,
                error: err instanceof Error ? err.message : "Unknown error",
              })
            );
          }
        })
      );
      controller.close();
    },
  });
}

export async function DELETE(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get("id");
  if (!runId) {
    return NextResponse.json({ error: "Missing run id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("runs")
    .delete()
    .eq("id", runId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const body: RunRequest = await request.json();
  const { systemPrompt = "", userMessage, models, isDemo, parameters = {} } = body;

  if (!userMessage?.trim() || !models?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const uniqueModels = [...new Set(models)];

  if (isDemo) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const count = demoIpCounts.get(ip) ?? 0;
    if (count >= DEMO_RUN_LIMIT) {
      return NextResponse.json({ error: "Demo limit reached" }, { status: 429 });
    }
    // Increment before opening the stream to prevent race conditions
    demoIpCounts.set(ip, count + 1);

    const demoKey = process.env.DEMO_ANTHROPIC_KEY;
    if (!demoKey) {
      return NextResponse.json({ error: "Demo not configured" }, { status: 503 });
    }

    const allowedIds = new Set(DEMO_MODELS.map((m) => m.id));
    const validModels = uniqueModels.filter((m) => allowedIds.has(m));
    if (!validModels.length) {
      return NextResponse.json({ error: "No valid demo models selected" }, { status: 400 });
    }

    const keyMap = Object.fromEntries(
      DEMO_MODELS.map((m) => [m.provider, demoKey])
    );

    const stream = buildStream(validModels, systemPrompt, userMessage, keyMap, parameters);
    return new Response(stream, {
      headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache" },
    });
  }

  // Authenticated mode
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
      console.warn("Failed to decrypt key for provider", k.provider, err instanceof Error ? err.message : err);
    }
  }

  const stream = buildStream(uniqueModels, systemPrompt, userMessage, keyMap, parameters);
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache" },
  });
}
