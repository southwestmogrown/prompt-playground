interface DemoBannerProps {
  runsUsed: number;
  runLimit: number;
  limitReached: boolean;
  onSignUp?: () => void;
}

export default function DemoBanner({ runsUsed, runLimit, limitReached, onSignUp }: DemoBannerProps) {
  const remaining = Math.max(0, runLimit - runsUsed);

  return (
    <div className="border-b border-indigo-500/20 bg-indigo-500/5 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-[#8B949E]">
          {limitReached ? (
            <>
              <span className="font-medium text-[#E6EDF3]">Demo limit reached</span>
              {" "}— sign up for unlimited runs, all models, and saved history.
            </>
          ) : (
            <>
              <span className="font-medium text-[#E6EDF3]">Demo mode</span>
              {" "}—{" "}
              <span className="font-semibold text-indigo-400">{remaining}</span> of {runLimit} free runs remaining.
              Sign up to unlock everything.
            </>
          )}
        </p>
        <button
          onClick={onSignUp}
          className="text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md transition-colors whitespace-nowrap"
        >
          Sign up free
        </button>
      </div>
    </div>
  );
}
