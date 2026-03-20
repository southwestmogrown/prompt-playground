interface DemoBannerProps {
  runsUsed: number;
  runLimit: number;
  limitReached: boolean;
  onSignUp?: () => void;
}

export default function DemoBanner({ runsUsed, runLimit, limitReached, onSignUp }: DemoBannerProps) {
  const remaining = Math.max(0, runLimit - runsUsed);

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-blue-800">
          {limitReached ? (
            <>
              <span className="font-medium">Demo limit reached</span> — sign up
              to continue.
            </>
          ) : (
            <>
              <span className="font-medium">Demo mode</span> — You have{" "}
              <span className="font-semibold">{remaining}</span> of {runLimit}{" "}
              free runs remaining. Sign up to unlock unlimited runs, all models,
              and saved history.
            </>
          )}
        </p>
        <button
          onClick={onSignUp}
          className="text-sm font-medium bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          Sign Up Free
        </button>
      </div>
    </div>
  );
}
