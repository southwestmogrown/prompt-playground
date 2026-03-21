import Link from "next/link";
import type { Run } from "@/lib/types";
import RunCard from "./RunCard";

interface RunListProps {
  runs: Run[];
}

export default function RunList({ runs }: RunListProps) {
  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[#30363D] rounded-lg">
        <p className="text-[#8B949E] text-sm">No saved runs yet.</p>
        <p className="text-[#484F58] text-sm mt-1">
          Head to the{" "}
          <Link href="/playground" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Playground
          </Link>{" "}
          to run your first prompt.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {runs.map((run) => (
        <li key={run.id}>
          <RunCard run={run} />
        </li>
      ))}
    </ul>
  );
}
