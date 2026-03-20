import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;

if (!ENCRYPTION_SECRET) {
  throw new Error("ENCRYPTION_SECRET environment variable is not set");
}

const ENCRYPTION_KEY: Buffer = crypto.scryptSync(ENCRYPTION_SECRET, "salt", 32);

function getEncryptionKey(): Buffer {
  return ENCRYPTION_KEY;
}

function encryptApiKey(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, provider, key_hint, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ keys: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider, apiKey } = await request.json();
  if (!provider || !apiKey) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!["anthropic", "openai"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const encrypted_key = encryptApiKey(apiKey);
  const key_hint = apiKey.slice(-4);

  const { error } = await supabase.from("api_keys").upsert(
    { user_id: user.id, provider, encrypted_key, key_hint },
    { onConflict: "user_id,provider" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, key_hint });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
