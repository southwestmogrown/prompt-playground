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

export default function KeyManager() {
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
    <div className="glass-panel ghost-border rounded-3xl overflow-hidden shadow-ambient">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[rgba(174,173,170,0.12)] flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          key
        </span>
        <h2 className="text-sm font-bold text-on-surface">API Keys</h2>
      </div>

      <div className="p-5 space-y-4">
        {/* Security note */}
        <div className="flex gap-2.5 bg-primary/6 border border-primary/15 rounded-2xl px-4 py-3">
          <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield
          </span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Keys are encrypted with{" "}
            <span className="text-on-surface font-semibold">AES-256-GCM</span> before storage.
            Only the last 4 characters are readable. Your full key is inaccessible to us.
          </p>
        </div>

        {/* Stored keys list */}
        {keys.length > 0 && (
          <ul className="space-y-2">
            {keys.map((k) => (
              <li key={k.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    vpn_key
                  </span>
                  <span className="text-sm text-on-surface font-medium">{PROVIDER_LABELS[k.provider]}</span>
                  <span className="font-mono text-xs text-outline">…{k.key_hint}</span>
                </div>
                <button
                  onClick={() => handleDelete(k.id)}
                  disabled={deletingId === k.id}
                  className="text-xs text-error/70 hover:text-error disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {deletingId === k.id ? "Removing…" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add key form */}
        <form onSubmit={handleSave} className="space-y-3">
          {error && (
            <p className="text-xs text-error flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-green-600 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {success}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as ProviderName)}
              className="bg-surface-container-high ghost-border text-on-surface rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tertiary/30 transition-all sm:shrink-0"
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
              className="flex-1 min-w-0 bg-surface-container-high ghost-border text-on-surface placeholder-outline rounded-xl px-3 py-2 text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary/30 transition-all"
            />
            <button
              type="submit"
              disabled={saving}
              className="text-on-primary px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 transition-all bg-gradient-to-r from-primary to-primary-container shadow-[0_4px_16px_rgba(160,58,15,0.25)] hover:shadow-[0_6px_20px_rgba(160,58,15,0.35)] hover:-translate-y-0.5 sm:shrink-0"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
