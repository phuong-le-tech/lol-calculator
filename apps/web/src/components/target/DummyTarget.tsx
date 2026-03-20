"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { Target } from "lucide-react";

const SECTION_LABEL = "text-[11px] font-semibold uppercase tracking-[1.5px] text-dark-100 font-ui";

const PRESETS = [
  { label: "Squishy", hp: 2000, armor: 40, mr: 30 },
  { label: "Bruiser", hp: 3000, armor: 100, mr: 60 },
  { label: "Tank", hp: 4000, armor: 200, mr: 150 },
  { label: "ADC lv18", hp: 2100, armor: 100, mr: 40 },
];

interface StatSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  color: string;
  textColor: string;
}

function StatSlider({ label, value, onChange, min = 0, max, color, textColor }: StatSliderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className={SECTION_LABEL}>{label}</span>
        <span className={`font-mono text-lg font-medium ${textColor}`}>
          {value.toLocaleString()}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-current"
        style={{ color }}
      />
    </div>
  );
}

export function DummyTarget() {
  const customTarget = useSimulatorStore((s) => s.customTarget);
  const setCustomTarget = useSimulatorStore((s) => s.setCustomTarget);

  return (
    <div className="flex flex-col gap-3">
      {/* Presets */}
      <span className={SECTION_LABEL}>Target Presets</span>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setCustomTarget({ hp: preset.hp, armor: preset.armor, mr: preset.mr })}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium font-ui transition-colors ${
              customTarget.hp === preset.hp && customTarget.armor === preset.armor && customTarget.mr === preset.mr
                ? "bg-gold-glow text-gold-100"
                : "border border-gold-300/15 bg-[#111827AA] text-gold-500 hover:text-gold-300"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Target info card */}
      <div className="flex items-center gap-3 rounded-xl border border-gold-300/10 bg-[#111827AA] p-2 px-3">
        <Target size={32} className="shrink-0 text-gold-600" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gold-100">Dummy Target</span>
          <span className="font-mono text-xs text-dark-100">Custom Stats</span>
        </div>
      </div>

      {/* Stat sliders */}
      <StatSlider
        label="Health"
        value={customTarget.hp}
        onChange={(hp) => setCustomTarget({ hp })}
        min={1}
        max={10000}
        color="var(--color-stat-health)"
        textColor="text-stat-health"
      />
      <StatSlider
        label="Armor"
        value={customTarget.armor}
        onChange={(armor) => setCustomTarget({ armor })}
        max={500}
        color="var(--color-stat-armor)"
        textColor="text-stat-armor"
      />
      <StatSlider
        label="Magic Resist"
        value={customTarget.mr}
        onChange={(mr) => setCustomTarget({ mr })}
        max={500}
        color="var(--color-stat-mr)"
        textColor="text-stat-mr"
      />
    </div>
  );
}
