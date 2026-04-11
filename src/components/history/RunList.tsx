"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Run } from "@/lib/types";
import RunCard from "./RunCard";

const PAGE_SIZE = 20;

interface RunListProps {
  runs: Run[];
}

export default function RunList({ runs: initialRuns }: RunListProps) {
  const [runs, setRuns] = useState(initialRuns);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialRuns.length === PAGE_SIZE);

  function handleDelete(id: string) {
    setRuns((prev) => prev.filter((r) => r.id !== id));
  }

  function handleTagClick(tag: string) {
    setActiveTag((prev) => (prev === tag ? null : tag));
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/history?limit=${PAGE_SIZE}&offset=${runs.length}`);
      if (!res.ok) return;
      const data = await res.json();
      setRuns((prev) => [...prev, ...data.runs]);
      setHasMore(data.hasMore);
    } catch { /* ignore */ } finally {
      setLoadingMore(false);
    }
  }

  const allTags = useMemo(() => {
    const seen = new Set<string>();
    for (const run of runs) {
      for (const tag of run.tags ?? []) seen.add(tag);
    }
    return [...seen].sort();
  }, [runs]);

  const filtered = useMemo(() => {
    let list = runs;
    if (activeTag) list = list.filter((r) => r.tags?.includes(activeTag));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.user_message.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [runs, activeTag, search]);

  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center ghost-border border-2 border-dashed rounded-3xl bg-surface-container-lowest/30">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            history
          </span>
        </div>
        <p className="font-headline font-bold text-xl text-on-surface mb-2">No saved runs yet</p>
        <p className="text-on-surface-variant text-sm mb-6 max-w-xs">
          Head to the Playground, run a prompt, and save it. It&apos;ll appear here.
        </p>
        <Link
          href="/playground"
          className="inline-flex items-center gap-2 text-on-primary px-6 py-3 rounded-2xl font-bold bg-primary shadow-[0_8px_24px_rgba(0,212,255,0.2)] hover:shadow-[0_12px_32px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 text-sm"
        >
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          Go to Playground
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-outline">search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search runs by name, message, or tag…"
          className="w-full bg-surface-container border border-[rgba(255,255,255,0.07)] rounded-lg pl-9 pr-4 py-2.5 font-mono text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/40 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        )}
      </div>

      {/* Tag filter bar */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="console-label">Filter:</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`console-label px-2.5 py-1 rounded border transition-colors ${
                activeTag === tag
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "bg-surface-container text-on-surface-variant border-[rgba(255,255,255,0.07)] hover:border-primary/30 hover:text-primary"
              }`}
            >
              #{tag}
            </button>
          ))}
          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              className="console-label text-outline hover:text-on-surface transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[12px]">close</span>
              Clear
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="console-label py-8 text-center">
          No runs match{" "}
          {search ? <span className="text-primary">&ldquo;{search}&rdquo;</span> : null}
          {search && activeTag ? " in tag " : null}
          {activeTag ? <span className="text-primary">#{activeTag}</span> : null}.
        </p>
      ) : (
        filtered.map((run) => (
          <RunCard key={run.id} run={run} onDelete={handleDelete} onTagClick={handleTagClick} />
        ))
      )}

      {/* Load more */}
      {hasMore && !activeTag && !search && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 console-label px-5 py-2.5 rounded-lg border border-[rgba(255,255,255,0.07)] bg-surface-container hover:border-primary/30 hover:text-primary transition-all disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                Loading…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
                Load more
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
