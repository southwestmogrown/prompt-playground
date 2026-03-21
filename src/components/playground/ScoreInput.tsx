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
          className={`w-7 h-7 rounded text-sm font-medium transition-colors ${
            value === n
              ? "bg-indigo-500 text-white"
              : "bg-[#1E2330] text-[#8B949E] hover:bg-[#30363D] hover:text-[#E6EDF3]"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
