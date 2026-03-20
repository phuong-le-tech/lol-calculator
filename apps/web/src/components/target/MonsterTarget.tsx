"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { Skull } from "lucide-react";

const SECTION_LABEL = "text-[11px] font-semibold uppercase tracking-[1.5px] text-dark-100 font-ui";

interface MonsterPreset {
  id: string;
  name: string;
  subtitle: string;
  hp: number;
  armor: number;
  mr: number;
}

const MONSTERS: MonsterPreset[] = [
  { id: "baron", name: "Baron Nashor", subtitle: "Epic Monster · Spawns 20:00", hp: 12000, armor: 120, mr: 70 },
  { id: "dragon", name: "Elemental Drake", subtitle: "Epic Monster · Spawns 5:00", hp: 4350, armor: 21, mr: 30 },
  { id: "herald", name: "Rift Herald", subtitle: "Epic Monster · Spawns 14:00", hp: 5500, armor: 60, mr: 50 },
  { id: "voidgrub", name: "Void Grub", subtitle: "Voidborn · Spawns 5:00", hp: 1600, armor: 20, mr: 15 },
];

function StatDisplay({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className={SECTION_LABEL}>{label}</span>
        <span className={`font-mono text-lg font-medium ${color}`}>
          {value.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-dark-300">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, label === "Health" ? (value / 15000) * 100 : (value / 300) * 100)}%`,
            backgroundColor: label === "Health" ? "var(--color-stat-health)" : label === "Armor" ? "var(--color-stat-armor)" : "var(--color-stat-mr)",
          }}
        />
      </div>
    </div>
  );
}

export function MonsterTarget() {
  const monsterType = useSimulatorStore((s) => s.monsterType);
  const setMonsterType = useSimulatorStore((s) => s.setMonsterType);
  const setCustomTarget = useSimulatorStore((s) => s.setCustomTarget);

  const selectedMonster = MONSTERS.find((m) => m.id === monsterType) ?? MONSTERS[0];

  function selectMonster(monster: MonsterPreset) {
    setMonsterType(monster.id);
    setCustomTarget({ hp: monster.hp, armor: monster.armor, mr: monster.mr });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Presets */}
      <span className={SECTION_LABEL}>Monster Presets</span>
      <div className="flex flex-wrap gap-1.5">
        {MONSTERS.map((monster) => (
          <button
            key={monster.id}
            onClick={() => selectMonster(monster)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium font-ui transition-colors ${
              selectedMonster.id === monster.id
                ? "bg-gold-glow text-gold-100"
                : "border border-gold-300/15 bg-[#111827AA] text-gold-500 hover:text-gold-300"
            }`}
          >
            {monster.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Monster info card */}
      <div className="flex items-center gap-3 rounded-xl border border-gold-300/10 bg-[#111827AA] p-2 px-3">
        <Skull size={32} className="shrink-0 text-gold-600" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gold-100">{selectedMonster.name}</span>
          <span className="font-mono text-xs text-dark-100">{selectedMonster.subtitle}</span>
        </div>
      </div>

      {/* Stats display */}
      <StatDisplay label="Health" value={selectedMonster.hp} color="text-stat-health" />
      <StatDisplay label="Armor" value={selectedMonster.armor} color="text-stat-armor" />
      <StatDisplay label="Magic Resist" value={selectedMonster.mr} color="text-stat-mr" />
    </div>
  );
}
