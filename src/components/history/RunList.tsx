import Link from "next/link";
import type { Run } from "@/lib/types";
import RunCard from "./RunCard";

interface RunListProps {
  runs: Run[];
}

export default function RunList({ runs }: RunListProps) {
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
          className="inline-flex items-center gap-2 text-on-primary px-6 py-3 rounded-2xl font-bold bg-gradient-to-r from-primary to-primary-container shadow-[0_8px_24px_rgba(160,58,15,0.25)] hover:shadow-[0_12px_32px_rgba(160,58,15,0.35)] hover:-translate-y-0.5 transition-all duration-300 text-sm"
        >
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          Go to Playground
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {runs.map((run) => (
        <RunCard key={run.id} run={run} />
      ))}
    </div>
  );
}
