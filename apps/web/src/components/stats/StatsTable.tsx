"use client";

import { useSimulationResult } from "../../hooks/useSimulationResult";

interface StatRow {
  label: string;
  value: number;
  baseValue?: number;
  format?: "number" | "percent" | "decimal";
}

function formatStat(value: number, format: "number" | "percent" | "decimal" = "number"): string {
  if (format === "percent") return `${Math.round(value)}%`;
  if (format === "decimal") return value.toFixed(2);
  return Math.round(value).toLocaleString();
}

function StatRowDisplay({ label, value, baseValue, format = "number" }: StatRow) {
  const bonus = baseValue !== undefined ? value - baseValue : 0;
  const hasBonus = bonus > 0;

  return (
    <div className="flex items-center justify-between px-3 py-1.5">
      <span className="text-sm text-dark-50">{label}</span>
      <span className="text-sm font-medium text-dark-100">
        {formatStat(value, format)}
        {hasBonus && (
          <span className="ml-1 text-stat-health">(+{formatStat(bonus, format)})</span>
        )}
      </span>
    </div>
  );
}

export function StatsTable() {
  const { stats, baseStats } = useSimulationResult();

  if (!stats || !baseStats) return null;

  const leftColumn: StatRow[] = [
    { label: "Attack Damage", value: stats.ad, baseValue: baseStats.ad },
    { label: "Health", value: stats.hp, baseValue: baseStats.hp },
    { label: "Armor", value: stats.armor, baseValue: baseStats.armor },
    { label: "Attack Speed", value: stats.attackSpeed, format: "decimal" },
    { label: "Crit Chance", value: stats.critChance, format: "percent" },
    { label: "Lethality", value: stats.lethality },
    { label: "Ability Haste", value: stats.abilityHaste },
    { label: "Armor Pen%", value: stats.armorPen, format: "percent" },
  ];

  const rightColumn: StatRow[] = [
    { label: "Ability Power", value: stats.ap },
    { label: "Mana", value: stats.mp, baseValue: baseStats.mp },
    { label: "Magic Resist", value: stats.mr, baseValue: baseStats.mr },
    { label: "Ability Haste", value: stats.abilityHaste },
    { label: "On-hit Dmg", value: 0 },
    { label: "Flat Magic Pen", value: stats.magicPen },
    { label: "Magic Pen%", value: stats.magicPenPercent, format: "percent" },
    { label: "Move Speed", value: stats.moveSpeed },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-4">
      <div className="flex flex-col">
        {leftColumn.map((row, i) => (
          <div key={`left-${i}`} className={i % 2 === 0 ? "bg-dark-400/50 rounded" : ""}>
            <StatRowDisplay {...row} />
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        {rightColumn.map((row, i) => (
          <div key={`right-${i}`} className={i % 2 === 0 ? "bg-dark-400/50 rounded" : ""}>
            <StatRowDisplay {...row} />
          </div>
        ))}
      </div>
    </div>
  );
}
