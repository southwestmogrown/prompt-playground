import Link from "next/link";
import type { Run } from "@/lib/types";
import RunCard from "./RunCard";

interface RunListProps {
  runs: Run[];
}

export default function RunList({ runs }: RunListProps) {
  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-lg">
        <p className="text-gray-500 text-sm">No saved runs yet.</p>
        <p className="text-gray-400 text-sm mt-1">
          Head to the{" "}
          <Link href="/playground" className="text-blue-600 hover:underline">
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
