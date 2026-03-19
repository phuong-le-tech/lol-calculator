"use client";

interface LevelSliderProps {
  level: number;
  onLevelChange: (level: number) => void;
  label?: string;
}

export function LevelSlider({ level, onLevelChange, label = "LEVEL" }: LevelSliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={1}
          max={18}
          value={level}
          onChange={(e) => onLevelChange(Number(e.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-dark-300 accent-gold-300"
        />
        <span className="min-w-[2ch] text-right font-ui text-4xl font-bold text-gold-300">
          {level}
        </span>
      </div>
    </div>
  );
}
