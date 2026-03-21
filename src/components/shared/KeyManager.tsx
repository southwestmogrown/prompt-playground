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
};

export default function KeyManager() {
  const [keys, setKeys] = useState<StoredKey[]>([]);
  const [provider, setProvider] = useState<ProviderName>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    <div className="border border-[#30363D] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#30363D] bg-[#1E2330]">
        <h2 className="text-sm font-semibold text-[#E6EDF3]">API Keys</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Security note */}
        <div className="flex gap-2.5 bg-indigo-500/5 border border-indigo-500/15 rounded-md px-3 py-2.5">
          <svg className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 4.418-3.134 8.573-7 9.93C8.134 20.573 5 16.418 5 12V7l7-4z" />
          </svg>
          <p className="text-xs text-[#8B949E] leading-relaxed">
            Keys are encrypted with{" "}
            <span className="text-[#E6EDF3]">AES-256-GCM</span> before storage.
            Only the last 4 characters are ever readable. Your full key is
            inaccessible to us.
          </p>
        </div>

        {keys.length > 0 && (
          <ul className="space-y-2">
            {keys.map((k) => (
              <li key={k.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-[#8B949E]">
                  {PROVIDER_LABELS[k.provider]}{" "}
                  <span className="font-mono text-[#484F58]">…{k.key_hint}</span>
                </span>
                <button
                  onClick={() => handleDelete(k.id)}
                  disabled={deletingId === k.id}
                  className="text-red-400 hover:text-red-300 text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {deletingId === k.id ? "Removing…" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSave} className="space-y-2">
          {error && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-emerald-400">{success}</p>}
          <div className="flex gap-2">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as ProviderName)}
              className="border border-[#30363D] bg-[#1E2330] text-[#E6EDF3] rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
            </select>
            <input
              type="password"
              placeholder="Paste API key…"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="flex-1 border border-[#30363D] bg-[#1E2330] text-[#E6EDF3] placeholder-[#484F58] rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
