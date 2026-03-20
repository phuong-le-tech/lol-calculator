"use client";

import { useSimulationResult } from "../../hooks/useSimulationResult";

interface StatRow {
  label: string;
  value: number;
  baseValue?: number;
  format?: "number" | "percent" | "decimal";
  color: string;
}

function formatStat(value: number, format: "number" | "percent" | "decimal" = "number"): string {
  if (format === "percent") return `${Math.round(value)}%`;
  if (format === "decimal") return value.toFixed(2);
  return Math.round(value).toLocaleString();
}

function StatRowDisplay({ label, value, baseValue, format = "number", color }: StatRow) {
  const bonus = baseValue !== undefined ? value - baseValue : 0;
  const hasBonus = bonus > 0;

  return (
    <div
      className={`flex flex-1 items-center justify-between rounded-lg bg-[#111827AA] px-3 border-l-[3px] ${color}`}
    >
      <span className="text-sm text-dark-100">{label}</span>
      <span className="font-mono text-sm text-gold-100">
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
    { label: "Attack Damage", value: stats.ad, baseValue: baseStats.ad, color: "border-dmg-physical" },
    { label: "Health", value: stats.hp, baseValue: baseStats.hp, color: "border-stat-health" },
    { label: "Armor", value: stats.armor, baseValue: baseStats.armor, color: "border-stat-armor" },
    { label: "Attack Speed", value: stats.attackSpeed, baseValue: baseStats.attackSpeed, format: "decimal", color: "border-stat-as" },
    { label: "Crit Chance", value: stats.critChance, baseValue: 0, format: "percent", color: "border-stat-crit" },
    { label: "Lethality", value: stats.lethality, baseValue: 0, color: "border-dmg-physical" },
    { label: "Ability Haste", value: stats.abilityHaste, baseValue: 0, color: "border-stat-ms" },
    { label: "Armor Pen%", value: stats.armorPen, baseValue: 0, format: "percent", color: "border-dmg-physical" },
  ];

  const rightColumn: StatRow[] = [
    { label: "Ability Power", value: stats.ap, baseValue: 0, color: "border-dmg-magic" },
    { label: "Mana", value: stats.mp, baseValue: baseStats.mp, color: "border-dmg-magic" },
    { label: "Magic Resist", value: stats.mr, baseValue: baseStats.mr, color: "border-stat-mr" },
    { label: "Crit Damage", value: stats.critDamage ?? 0, baseValue: 175, format: "percent", color: "border-stat-crit" },
    { label: "On-hit Dmg", value: 0, baseValue: 0, color: "border-dmg-physical" },
    { label: "Flat Magic Pen", value: stats.magicPen, baseValue: 0, color: "border-dmg-magic" },
    { label: "Magic Pen%", value: stats.magicPenPercent, baseValue: 0, format: "percent", color: "border-dmg-magic" },
    { label: "Move Speed", value: stats.moveSpeed, baseValue: baseStats.moveSpeed, color: "border-stat-ms" },
  ];

  return (
    <div className="grid flex-1 grid-cols-2 gap-x-4">
      <div className="flex flex-col gap-1">
        {leftColumn.map((row, i) => (
          <StatRowDisplay key={`left-${i}`} {...row} />
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {rightColumn.map((row, i) => (
          <StatRowDisplay key={`right-${i}`} {...row} />
        ))}
      </div>
    </div>
  );
}
