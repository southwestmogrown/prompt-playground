import Link from "next/link";

interface DemoBannerProps {
  runsUsed: number;
  runLimit: number;
}

export default function DemoBanner({ runsUsed, runLimit }: DemoBannerProps) {
  const remaining = runLimit - runsUsed;

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Demo mode</span> — You have{" "}
          <span className="font-semibold">{remaining}</span> of {runLimit} free
          runs remaining. Sign up to unlock unlimited runs, all models, and
          saved history.
        </p>
        <Link
          href="/signup"
          className="text-sm font-medium bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          Sign Up Free
        </Link>
      </div>
    </div>
  );
}
