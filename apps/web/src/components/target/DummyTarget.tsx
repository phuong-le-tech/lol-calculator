"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";

interface StatInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  color: string;
  barMax?: number;
}

function StatInput({ label, value, onChange, min = 0, max = 99999, color, barMax = 300 }: StatInputProps) {
  const barPercent = Math.min(100, (value / barMax) * 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-dark-50">{label}</span>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
          className="w-20 rounded bg-dark-400 px-2 py-1 text-right text-sm text-dark-100 outline-none focus:ring-1 focus:ring-gold-300"
        />
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-dark-300">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${barPercent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function DummyTarget() {
  const customTarget = useSimulatorStore((s) => s.customTarget);
  const setCustomTarget = useSimulatorStore((s) => s.setCustomTarget);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dark-300">
          <span className="text-lg text-dark-50">D</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gold-100">Dummy</p>
          <p className="text-xs text-dark-50">Custom target</p>
        </div>
      </div>

      <StatInput
        label="HP"
        value={customTarget.hp}
        onChange={(hp) => setCustomTarget({ hp })}
        min={1}
        max={99999}
        color="var(--color-stat-health)"
        barMax={5000}
      />
      <StatInput
        label="Armor"
        value={customTarget.armor}
        onChange={(armor) => setCustomTarget({ armor })}
        max={1000}
        color="var(--color-stat-armor)"
      />
      <StatInput
        label="Magic Resist"
        value={customTarget.mr}
        onChange={(mr) => setCustomTarget({ mr })}
        max={1000}
        color="var(--color-stat-mr)"
      />
    </div>
  );
}
