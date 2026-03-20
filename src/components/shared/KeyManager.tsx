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
            message = "Your session has expired. Please sign in again to view your API keys.";
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
        setError("Unable to connect to the server. Please try again.");
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

    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, apiKey }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save key");
      return;
    }

    setApiKey("");
    setSuccess(`${PROVIDER_LABELS[provider]} key saved (…${data.key_hint})`);
    setRefreshKey((k) => k + 1);
  }

  async function handleDelete(id: string) {
    const res = await fetch("/api/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setRefreshKey((k) => k + 1);
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <h2 className="text-sm font-semibold text-gray-900">API Keys</h2>

      {keys.length > 0 && (
        <ul className="space-y-2">
          {keys.map((k) => (
            <li key={k.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {PROVIDER_LABELS[k.provider]}{" "}
                <span className="font-mono text-gray-500">…{k.key_hint}</span>
              </span>
              <button
                onClick={() => handleDelete(k.id)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSave} className="space-y-2">
        {error && <p className="text-xs text-red-600">{error}</p>}
        {success && <p className="text-xs text-green-600">{success}</p>}
        <div className="flex gap-2">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as ProviderName)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
