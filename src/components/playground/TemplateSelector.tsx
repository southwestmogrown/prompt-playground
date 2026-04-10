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

  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [updating, setUpdating] = useState(false);

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
    <div className="glass-panel ghost-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-[rgba(174,173,170,0.10)]">
        <span className="material-symbols-outlined text-[#765600] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          bookmark
        </span>
        <h2 className="text-sm font-bold text-on-surface">Templates</h2>
      </div>

      <div className="p-4 space-y-3">
        {error && (
          <p className="text-xs text-error flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[13px]">error</span>
            {error}
          </p>
        )}

        {templates.length === 0 ? (
          <p className="text-xs text-outline">No saved templates yet.</p>
        ) : (
          <div className="space-y-1.5">
            {templates.map((t) => (
              <div key={t.id}>
                {editingId === t.id ? (
                  <form onSubmit={handleUpdate} className="space-y-2 bg-surface-container-low/40 rounded-xl p-3">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Template name"
                      required
                      className="w-full bg-surface-container-high ghost-border text-on-surface placeholder-outline rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-tertiary/30 transition-all"
                    />
                    <textarea
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      rows={3}
                      className="w-full bg-surface-container-high ghost-border text-on-surface rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-tertiary/30 transition-all resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={updating || !editName.trim()}
                        className="text-xs text-on-primary px-3 py-1 rounded-lg font-bold bg-gradient-to-r from-primary to-primary-container disabled:opacity-50 transition-all"
                      >
                        {updating ? "Saving…" : "Update"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                      selectedId === t.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-surface-container-low text-on-surface-variant"
                    }`}
                    onClick={() => setSelectedId(selectedId === t.id ? "" : t.id)}
                  >
                    <span className="text-xs font-semibold truncate max-w-[55%]" title={t.name}>
                      {t.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); startEdit(t); }}
                        className="text-[11px] text-outline hover:text-on-surface transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                        disabled={deletingId === t.id}
                        className="text-[11px] text-error/70 hover:text-error disabled:opacity-40 transition-colors"
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
                className="w-full text-xs glass-panel ghost-border text-on-surface px-3 py-2 rounded-xl font-bold hover:-translate-y-0.5 transition-all"
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
            className="text-xs text-primary font-semibold hover:text-primary-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Save current as template
          </button>
        ) : (
          <form onSubmit={handleSave} className="space-y-2 bg-surface-container-low/40 rounded-xl p-3">
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Template name…"
              required
              autoFocus
              className="w-full bg-surface-container-high ghost-border text-on-surface placeholder-outline rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-tertiary/30 transition-all"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !saveName.trim()}
                className="text-xs text-on-primary px-3 py-1 rounded-lg font-bold bg-gradient-to-r from-primary to-primary-container disabled:opacity-50 transition-all"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => { setShowSaveInput(false); setSaveName(""); }}
                className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
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
