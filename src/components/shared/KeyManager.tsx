"use client";

import { useState, useEffect } from "react";
import type { ProviderName } from "@/lib/types";

interface StoredKey {
  id: string;
  provider: ProviderName;
  key_hint: string;
  created_at: string;
}

const PROVIDER_LABELS: Record<ProviderName, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  mistral: "Mistral",
  groq: "Groq",
  xai: "xAI",
};

interface KeyManagerProps {
  onKeysChange?: () => void;
}

export default function KeyManager({ onKeysChange }: KeyManagerProps) {
  const [keys, setKeys] = useState<StoredKey[]>([]);
  const [provider, setProvider] = useState<ProviderName>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/keys");
        if (!active) return;
        if (!res.ok) {
          let message = "Failed to load API keys";
          try {
            const data = await res.json();
            if (data && typeof data.error === "string") message = data.error;
          } catch { /* ignore */ }
          if (res.status === 401) {
            message = "Your session has expired. Please sign in again.";
          }
          setKeys([]);
          setError(message);
          return;
        }
        const data = await res.json();
        setKeys(data.keys ?? []);
        setError(null);
      } catch {
        if (!active) return;
        setKeys([]);
        setError("Unable to connect. Please try again.");
      }
    }
    load();
    return () => { active = false; };
  }, [refreshKey]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save key");
        return;
      }

      setApiKey("");
      setSuccess(`${PROVIDER_LABELS[provider]} key saved (…${data.key_hint})`);
      setRefreshKey((k) => k + 1);
      onKeysChange?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setSuccess(null);
    setDeletingId(id);
    try {
      const res = await fetch("/api/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setRefreshKey((k) => k + 1);
        onKeysChange?.();
      } else {
        setError("Failed to remove key. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="console-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-2">
        <span className="material-symbols-outlined text-on-surface-variant text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>key</span>
        <span className="console-label">API Keys</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Security note */}
        <div className="border-l-2 border-primary/40 pl-3 py-0.5">
          <p className="console-label leading-relaxed">
            Keys encrypted with <span className="text-primary">AES-256-GCM</span>. Only last 4 chars stored. Your full key is inaccessible to us.
          </p>
        </div>

        {/* Stored keys list */}
        {keys.length > 0 && (
          <ul className="space-y-1">
            {keys.map((k) => (
              <li key={k.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-2">
                  <span className="led led-active" style={{ width: "5px", height: "5px" }} />
                  <span className="font-mono text-xs text-on-surface">{PROVIDER_LABELS[k.provider]}</span>
                  <span className="font-mono text-xs text-on-surface-variant">…{k.key_hint}</span>
                </div>
                <button
                  onClick={() => handleDelete(k.id)}
                  disabled={deletingId === k.id}
                  className="console-label text-error/60 hover:text-error disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {deletingId === k.id ? "Removing…" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add key form */}
        <form onSubmit={handleSave} className="space-y-2">
          {error && (
            <p className="console-label text-error flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px]">error</span>
              {error}
            </p>
          )}
          {success && (
            <p className="console-label text-green flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {success}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as ProviderName)}
              className="bg-surface-container border border-[rgba(255,255,255,0.08)] text-on-surface rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-primary/50 transition-all sm:shrink-0"
            >
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
              <option value="google">Google</option>
              <option value="mistral">Mistral</option>
              <option value="groq">Groq</option>
              <option value="xai">xAI</option>
            </select>
            <input
              type="password"
              placeholder="Paste API key…"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="flex-1 min-w-0 bg-surface-container border border-[rgba(255,255,255,0.08)] text-on-surface placeholder-outline rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-primary/50 focus:bg-surface-container-high transition-all"
            />
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg font-mono text-xs font-bold disabled:opacity-50 transition-all glow-primary sm:shrink-0"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
