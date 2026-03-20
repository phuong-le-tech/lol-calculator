"use client";

import { useDataStore } from "../../stores/useDataStore";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useSimulationResult } from "../../hooks/useSimulationResult";
import { calcAbilityDamage } from "@lol-sim/engine";
import type { DamageType } from "@lol-sim/types";

const DAMAGE_COLORS: Record<DamageType, { text: string; bg: string; badge: string }> = {
  physical: { text: "text-dmg-physical", bg: "bg-dmg-physical", badge: "Physical" },
  magic: { text: "text-dmg-magic", bg: "bg-dmg-magic", badge: "Magic" },
  true: { text: "text-dmg-true", bg: "bg-dmg-true", badge: "True" },
};

const KEY_ORDER = ["P", "Q", "W", "E", "R"] as const;

function getAbilityRank(key: string, level: number): number {
  if (key === "P") return 1;
  if (key === "R") {
    if (level >= 16) return 3;
    if (level >= 11) return 2;
    if (level >= 6) return 1;
    return 0;
  }
  const nonUltLevels = level - (level >= 16 ? 3 : level >= 11 ? 2 : level >= 6 ? 1 : 0);
  const priorities = ["Q", "W", "E"];
  const idx = priorities.indexOf(key);
  if (idx === -1) return 0;
  let rank = 0;
  let assigned = 0;
  for (let lvl = 1; lvl <= nonUltLevels && assigned < nonUltLevels; lvl++) {
    const slot = (lvl - 1) % 3;
    if (slot === idx) rank++;
    assigned++;
  }
  return Math.min(rank, 5);
}

interface BreakdownRow {
  name: string;
  damageType: DamageType;
  raw: number;
  final: number;
}

function BreakdownRowDisplay({ row, maxDamage }: { row: BreakdownRow; maxDamage: number }) {
  const colors = DAMAGE_COLORS[row.damageType];
  const mitigation = row.raw > 0 ? ((1 - row.final / row.raw) * 100) : 0;
  const barWidth = maxDamage > 0 ? (row.final / maxDamage) * 100 : 0;

  return (
    <div className="flex flex-1 items-center gap-2 rounded-lg bg-[#111827AA] px-3 py-2">
      {/* Left: Name + badge */}
      <div className="flex w-[130px] shrink-0 flex-col gap-1">
        <span className="font-ui text-[13px] font-medium text-gold-100">{row.name}</span>
        <span className={`inline-flex w-fit rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase text-dark-600 ${colors.bg}`}>
          {colors.badge}
        </span>
      </div>

      {/* Center: labeled breakdown */}
      <div className="flex flex-1 items-center gap-2">
        {/* Raw */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-sm font-medium text-dark-100">{Math.round(row.raw)}</span>
          <span className="text-[9px] uppercase tracking-wider text-dark-100">Raw</span>
        </div>

        <span className="text-dark-100">→</span>

        {/* Mitigation */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-sm font-medium text-red-400">
            -{mitigation.toFixed(1)}%
          </span>
          <span className="text-[9px] uppercase tracking-wider text-dark-100">Resist</span>
        </div>

        <span className="text-dark-100">→</span>

        {/* Final */}
        <div className="flex flex-col items-center">
          <span className={`font-mono text-base font-bold ${colors.text}`}>
            {Math.round(row.final)}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-dark-100">Final</span>
        </div>
      </div>

      {/* Right: proportion bar */}
      <div className="flex w-16 shrink-0 flex-col items-end gap-0.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-dark-300">
          <div
            className={`h-full rounded-full transition-all ${colors.bg}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-dark-100">
          {barWidth.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

export function BreakdownTab() {
  const selectedChampionId = useSimulatorStore((s) => s.selectedChampionId);
  const level = useSimulatorStore((s) => s.level);
  const customTarget = useSimulatorStore((s) => s.customTarget);
  const getChampion = useDataStore((s) => s.getChampion);
  const { stats, autoAttack } = useSimulationResult();

  const champion = selectedChampionId ? getChampion(selectedChampionId) : null;

  if (!champion || !stats || !autoAttack) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-dark-100">Select a champion to view breakdown</p>
      </div>
    );
  }

  const target = { armor: customTarget.armor, mr: customTarget.mr, hp: customTarget.hp };
  const rows: BreakdownRow[] = [];

  // Auto attack row
  rows.push({
    name: "Auto Attack",
    damageType: "physical",
    raw: autoAttack.raw,
    final: autoAttack.final,
  });

  // Ability rows
  const sortedAbilities = [...champion.abilities]
    .filter(a => a.key !== "P")
    .sort(
      (a, b) => KEY_ORDER.indexOf(a.key as typeof KEY_ORDER[number]) - KEY_ORDER.indexOf(b.key as typeof KEY_ORDER[number])
    );

  for (const ability of sortedAbilities) {
    const rank = getAbilityRank(ability.key, level);
    if (rank <= 0) continue;
    const result = calcAbilityDamage(ability, rank, stats, level, target);
    if (!result) continue;
    rows.push({
      name: `${ability.key} - ${ability.name}`,
      damageType: ability.damageType,
      raw: result.raw,
      final: result.final,
    });
  }

  const maxDamage = Math.max(...rows.map(r => r.final), 1);
  const totalRaw = rows.reduce((sum, r) => sum + r.raw, 0);
  const totalFinal = rows.reduce((sum, r) => sum + r.final, 0);
  const totalMitigation = totalRaw > 0 ? ((1 - totalFinal / totalRaw) * 100) : 0;
  const hpPercent = customTarget.hp > 0 ? Math.min(100, (totalFinal / customTarget.hp) * 100) : 0;

  return (
    <div className="flex flex-1 flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3">
        <span className="w-[130px] shrink-0 text-[10px] font-semibold uppercase tracking-[1.5px] text-dark-100 font-ui">
          Source
        </span>
        <div className="flex flex-1 items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-dark-100 font-ui">
            Raw → Resist → Final damage
          </span>
        </div>
        <span className="w-16 shrink-0 text-right text-[10px] font-semibold uppercase tracking-[1.5px] text-dark-100 font-ui">
          Share
        </span>
      </div>

      {/* Breakdown rows */}
      <div className="flex flex-1 flex-col gap-1">
        {rows.map((row) => (
          <BreakdownRowDisplay key={row.name} row={row} maxDamage={maxDamage} />
        ))}
      </div>

      {/* Total summary */}
      <div className="flex items-center gap-2 rounded-lg border border-gold-300/15 bg-dark-400/60 px-3 py-3">
        <div className="flex w-[130px] shrink-0 flex-col">
          <span className="font-ui text-sm font-semibold text-gold-100">Full Combo</span>
          <span className="text-[11px] text-dark-100">All abilities + auto</span>
        </div>
        <div className="flex flex-1 items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="font-mono text-sm font-medium text-dark-100">{Math.round(totalRaw).toLocaleString()}</span>
            <span className="text-[9px] uppercase tracking-wider text-dark-100">Raw</span>
          </div>
          <span className="text-dark-100">→</span>
          <div className="flex flex-col items-center">
            <span className="font-mono text-sm font-medium text-red-400">-{totalMitigation.toFixed(1)}%</span>
            <span className="text-[9px] uppercase tracking-wider text-dark-100">Avg resist</span>
          </div>
          <span className="text-dark-100">→</span>
          <div className="flex flex-col items-center">
            <span className="font-mono text-lg font-bold text-gold-300">{Math.round(totalFinal).toLocaleString()}</span>
            <span className="text-[9px] uppercase tracking-wider text-dark-100">Total</span>
          </div>
        </div>
        <div className="flex w-16 shrink-0 flex-col items-end">
          <span className="font-mono text-sm font-bold text-gold-100">{hpPercent.toFixed(0)}%</span>
          <span className="text-[9px] uppercase tracking-wider text-dark-100">of HP</span>
        </div>
      </div>
    </div>
  );
}
