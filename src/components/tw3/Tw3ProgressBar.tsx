interface Tw3ProgressBarProps {
  completed: number;
  total: number;
  compact?: boolean;
}

export default function Tw3ProgressBar({
  completed,
  total,
  compact = false,
}: Tw3ProgressBarProps) {
  const ratio = total > 0 ? completed / total : 0;
  const percent = Math.round(ratio * 100);

  return (
    <div className={`w-full ${compact ? "" : "max-w-md"}`}>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <p
          className={`font-semibold text-teal-900 leading-tight ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          Bone age progress
        </p>
        <p
          className={`font-semibold text-teal-700 tabular-nums ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          {completed}/{total}
        </p>
      </div>
      <div
        className={`rounded-full bg-gray-200 overflow-hidden ${
          compact ? "h-2" : "h-2.5"
        }`}
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Bone age progress ${completed} of ${total}`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
