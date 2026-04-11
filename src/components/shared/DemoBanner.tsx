interface DemoBannerProps {
  runsUsed: number;
  runLimit: number;
  limitReached: boolean;
  onSignUp?: () => void;
}

export default function DemoBanner({ runsUsed, runLimit, limitReached, onSignUp }: DemoBannerProps) {
  const remaining = Math.max(0, runLimit - runsUsed);

  return (
    <div className="bg-surface-container-low border-b border-[rgba(255,255,255,0.07)] px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className={`led ${limitReached ? "bg-error" : "led-active"}`} />
          <p className="console-label">
            {limitReached ? (
              <>
                <span className="text-error">Demo limit reached</span>
                {" "}— sign up for unlimited runs, all models, and saved history.
              </>
            ) : (
              <>
                <span className="text-on-surface">Demo mode</span>
                {" "}—{" "}
                <span className="text-primary">{remaining}</span> of {runLimit} free runs remaining.
                Sign up to unlock everything.
              </>
            )}
          </p>
        </div>
        <button
          onClick={onSignUp}
          className="console-label px-4 py-1.5 rounded-lg bg-primary text-on-primary font-bold glow-primary transition-all whitespace-nowrap"
        >
          Sign up free
        </button>
      </div>
    </div>
  );
}
