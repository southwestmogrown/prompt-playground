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
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
