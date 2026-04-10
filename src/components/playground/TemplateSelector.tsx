"use client";

import { useState, useEffect } from "react";

interface Template {
  id: string;
  name: string;
  system_prompt: string;
  created_at: string;
}

interface TemplateSelectorProps {
  systemPrompt: string;
  onLoad: (systemPrompt: string) => void;
}

export default function TemplateSelector({ systemPrompt, onLoad }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState("");

  // Save state
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [updating, setUpdating] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/templates");
        if (!active) return;
        if (!res.ok) { setTemplates([]); return; }
        const data = await res.json();
        setTemplates(data.templates ?? []);
      } catch {
        if (!active) return;
        setTemplates([]);
      }
    }
    load();
    return () => { active = false; };
  }, [refreshKey]);

  function handleLoad() {
    const template = templates.find((t) => t.id === selectedId);
    if (!template) return;
    if (systemPrompt && !confirm("Replace current system prompt?")) return;
    onLoad(template.system_prompt);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!saveName.trim() || !systemPrompt) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: saveName.trim(), system_prompt: systemPrompt }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      setSaveName("");
      setShowSaveInput(false);
      setRefreshKey((k) => k + 1);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(template: Template) {
    setEditingId(template.id);
    setEditName(template.name);
    setEditPrompt(template.system_prompt);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditPrompt("");
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;
    setError(null);
    setUpdating(true);
    try {
      const res = await fetch("/api/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name: editName.trim(), system_prompt: editPrompt }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to update"); return; }
      cancelEdit();
      setRefreshKey((k) => k + 1);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setDeletingId(id);
    try {
      const res = await fetch("/api/templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        if (selectedId === id) setSelectedId("");
        if (editingId === id) cancelEdit();
        setRefreshKey((k) => k + 1);
      } else {
        setError("Failed to delete template.");
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
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Templates</h2>
      </div>

      <div className="p-4 space-y-3">
        {error && <p className="text-xs text-red-400">{error}</p>}

        {/* Load */}
        {templates.length === 0 ? (
          <p className="text-xs text-[#484F58]">No saved templates</p>
        ) : (
          <div className="space-y-2">
            {templates.map((t) => (
              <div key={t.id}>
                {editingId === t.id ? (
                  /* Inline edit form */
                  <form onSubmit={handleUpdate} className="space-y-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Template name"
                      required
                      className="w-full border border-[#30363D] bg-[#0D1117] text-[#E6EDF3] placeholder-[#484F58] rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      rows={3}
                      className="w-full border border-[#30363D] bg-[#0D1117] text-[#E6EDF3] placeholder-[#484F58] rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={updating || !editName.trim()}
                        className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded disabled:opacity-50 transition-colors"
                      >
                        {updating ? "Saving…" : "Update"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-xs text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Template row */
                  <div className="flex items-center justify-between text-xs py-0.5">
                    <button
                      onClick={() => setSelectedId(selectedId === t.id ? "" : t.id)}
                      className={`text-left truncate max-w-[60%] transition-colors ${
                        selectedId === t.id
                          ? "text-indigo-400"
                          : "text-[#8B949E] hover:text-[#E6EDF3]"
                      }`}
                      title={t.name}
                    >
                      {t.name}
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => startEdit(t)}
                        className="text-[#484F58] hover:text-[#8B949E] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        className="text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors"
                      >
                        {deletingId === t.id ? "…" : "Remove"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {selectedId && (
              <button
                onClick={handleLoad}
                className="text-xs bg-[#1E2330] border border-[#30363D] hover:border-[#484F58] text-[#E6EDF3] px-3 py-1.5 rounded w-full transition-colors"
              >
                Load selected
              </button>
            )}
          </div>
        )}

        {/* Save */}
        {!showSaveInput ? (
          <button
            onClick={() => setShowSaveInput(true)}
            disabled={!systemPrompt}
            className="text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            + Save current as template
          </button>
        ) : (
          <form onSubmit={handleSave} className="space-y-2">
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Template name…"
              required
              autoFocus
              className="w-full border border-[#30363D] bg-[#0D1117] text-[#E6EDF3] placeholder-[#484F58] rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !saveName.trim()}
                className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => { setShowSaveInput(false); setSaveName(""); }}
                className="text-xs text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
