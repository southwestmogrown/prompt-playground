interface ScoreInputProps {
  value: number | null;
  onChange: (score: number) => void;
}

export default function ScoreInput({ value, onChange }: ScoreInputProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          title={`Score ${n}`}
          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all duration-200 ${
            value === n
              ? "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-[0_2px_8px_rgba(160,58,15,0.3)]"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
