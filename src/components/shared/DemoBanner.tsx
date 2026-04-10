interface DemoBannerProps {
  runsUsed: number;
  runLimit: number;
  limitReached: boolean;
  onSignUp?: () => void;
}

export default function DemoBanner({ runsUsed, runLimit, limitReached, onSignUp }: DemoBannerProps) {
  const remaining = Math.max(0, runLimit - runsUsed);

  return (
    <div className="bg-primary/5 border-b border-primary/10 backdrop-blur-md px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {limitReached ? "warning" : "info"}
          </span>
          <p className="text-sm text-on-surface-variant">
            {limitReached ? (
              <>
                <span className="font-bold text-on-surface">Demo limit reached</span>
                {" "}— sign up for unlimited runs, all models, and saved history.
              </>
            ) : (
              <>
                <span className="font-bold text-on-surface">Demo mode</span>
                {" "}—{" "}
                <span className="font-bold text-primary">{remaining}</span> of {runLimit} free runs remaining.
                Sign up to unlock everything.
              </>
            )}
          </p>
        </div>
        <button
          onClick={onSignUp}
          className="text-sm font-black text-on-primary px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-container shadow-[0_4px_16px_rgba(160,58,15,0.25)] hover:shadow-[0_6px_20px_rgba(160,58,15,0.35)] hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
        >
          Sign up free
        </button>
      </div>
    </div>
  );
}
