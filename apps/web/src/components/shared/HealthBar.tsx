interface HealthBarProps {
  current: number;
  max: number;
  color: string;
  label?: string;
}

export function HealthBar({ current, max, color, label }: HealthBarProps) {
  const percent = max > 0 ? Math.min(100, (current / max) * 100) : 0;

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="w-8 text-xs font-medium text-dark-50">{label}</span>
      )}
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-dark-300">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <span className="min-w-[4ch] text-right text-xs text-dark-100">
        {Math.round(current)}
      </span>
    </div>
  );
}
