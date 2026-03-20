"use client";

import Image from "next/image";
import { useDataStore } from "../../stores/useDataStore";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useSimulationResult } from "../../hooks/useSimulationResult";
import { calcAbilityDamage } from "@lol-sim/engine";
import type { Ability, AbilityScaling, DamageType, ScalingType } from "@lol-sim/types";

const DAMAGE_TYPE_COLOR: Record<DamageType, string> = {
  physical: "text-dmg-physical",
  magic: "text-dmg-magic",
  true: "text-dmg-true",
};

const SCALING_LABELS: Record<ScalingType, string> = {
  ad: "AD",
  bonusAd: "bonus AD",
  ap: "AP",
  bonusHp: "bonus HP",
  maxHp: "max HP",
  armor: "Armor",
  mr: "MR",
  targetMaxHp: "target max HP",
  targetCurrentHp: "target current HP",
  targetMissingHp: "target missing HP",
};

const SCALING_COLORS: Record<ScalingType, string> = {
  ad: "text-dmg-physical",
  bonusAd: "text-dmg-physical",
  ap: "text-dmg-magic",
  bonusHp: "text-stat-health",
  maxHp: "text-stat-health",
  armor: "text-stat-armor",
  mr: "text-stat-mr",
  targetMaxHp: "text-stat-health",
  targetCurrentHp: "text-stat-health",
  targetMissingHp: "text-stat-health",
};

function ScalingBadge({ scaling, rank }: { scaling: AbilityScaling; rank: number }) {
  const idx = Math.max(0, Math.min(rank - 1, scaling.values.length - 1));
  const value = scaling.values[idx] ?? 0;
  const percent = Math.round(value * 100);
  const color = SCALING_COLORS[scaling.type] || "text-gold-300";
  const label = SCALING_LABELS[scaling.type] || scaling.type;

  return (
    <span className={`inline-flex items-center rounded bg-dark-600/80 px-1.5 py-0.5 font-mono text-[11px] font-semibold ${color}`}>
      {percent}% {label}
    </span>
  );
}

const KEY_ORDER = ["P", "Q", "W", "E", "R"] as const;

function getAbilityRank(key: string, level: number): number {
  // Standard auto-leveling: R at 6/11/16, then Q>W>E priority
  if (key === "P") return 1;
  if (key === "R") {
    if (level >= 16) return 3;
    if (level >= 11) return 2;
    if (level >= 6) return 1;
    return 0;
  }
  // Simplified: distribute remaining levels across Q/W/E
  const nonUltLevels = level - (level >= 16 ? 3 : level >= 11 ? 2 : level >= 6 ? 1 : 0);
  const priorities = ["Q", "W", "E"];
  const idx = priorities.indexOf(key);
  if (idx === -1) return 0;

  // Q gets every 3rd level starting from 1, W from 2, E from 3
  let rank = 0;
  let assigned = 0;
  for (let lvl = 1; lvl <= nonUltLevels && assigned < nonUltLevels; lvl++) {
    const slot = (lvl - 1) % 3;
    if (slot === idx) rank++;
    assigned++;
  }
  return Math.min(rank, 5);
}

function AbilityCard({ ability, rank, damage, level }: {
  ability: Ability;
  rank: number;
  damage: number | null;
  level: number;
}) {
  const isPassive = ability.key === "P";
  const maxRank = ability.maxRank;
  const cooldown = !isPassive && rank > 0 ? ability.cooldown[rank - 1] : null;
  const cost = !isPassive && rank > 0 ? ability.cost[rank - 1] : null;
  const baseDmg = rank > 0 ? ability.baseDamage[rank - 1] : null;
  const dmgColor = DAMAGE_TYPE_COLOR[ability.damageType];

  return (
    <div className="flex gap-3 rounded-lg bg-[#111827AA] p-3">
      {/* Key badge */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gold-600">
        <span className="font-ui text-sm font-bold text-dark-600">{ability.key}</span>
      </div>

      {/* Info — full width */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* Top row: name + rank dots + damage */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-gold-100">{ability.name}</span>
          <div className="flex items-center gap-2">
            {!isPassive && maxRank > 1 && (
              <div className="flex gap-1">
                {Array.from({ length: maxRank }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-5 w-5 rounded text-center text-[10px] font-mono leading-5 ${
                      i < rank
                        ? "bg-gold-600 text-dark-600 font-bold"
                        : "border border-dark-200 bg-dark-600 text-dark-100"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            {isPassive && (
              <span className="font-ui text-[10px] font-semibold uppercase tracking-wider text-dark-100">
                Passive
              </span>
            )}
          </div>
        </div>

        {/* Full description */}
        <p className="text-xs leading-relaxed text-dark-100">
          {ability.description}
        </p>

        {/* Scaling row: base damage + scaling badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {baseDmg !== null && baseDmg > 0 && (
            <span className={`font-mono text-xs font-semibold ${dmgColor}`}>
              {Math.round(baseDmg)} base
            </span>
          )}
          {ability.scalings.map((scaling, i) => (
            <ScalingBadge key={i} scaling={scaling} rank={Math.max(rank, 1)} />
          ))}
          {damage !== null && damage > 0 && (
            <>
              <span className="text-dark-100">→</span>
              <span className={`font-mono text-[13px] font-bold ${dmgColor}`}>
                {Math.round(damage)} dmg
              </span>
            </>
          )}
        </div>

        {/* Cooldown + cost */}
        {(cooldown || cost) && (
          <div className="flex items-center gap-3 text-[11px] text-dark-100">
            {cooldown !== null && cooldown > 0 && <span>{cooldown}s cooldown</span>}
            {cost !== null && cost > 0 && <span>{cost} mana</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function AbilitiesTab() {
  const selectedChampionId = useSimulatorStore((s) => s.selectedChampionId);
  const level = useSimulatorStore((s) => s.level);
  const customTarget = useSimulatorStore((s) => s.customTarget);
  const getChampion = useDataStore((s) => s.getChampion);
  const { stats } = useSimulationResult();

  const champion = selectedChampionId ? getChampion(selectedChampionId) : null;

  if (!champion || !stats) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-dark-100">Select a champion to view abilities</p>
      </div>
    );
  }

  // Sort abilities by key order
  const sortedAbilities = [...champion.abilities].sort(
    (a, b) => KEY_ORDER.indexOf(a.key as typeof KEY_ORDER[number]) - KEY_ORDER.indexOf(b.key as typeof KEY_ORDER[number])
  );

  return (
    <div className="flex flex-col gap-2">
      {sortedAbilities.map((ability) => {
        const rank = getAbilityRank(ability.key, level);
        const target = { armor: customTarget.armor, mr: customTarget.mr, hp: customTarget.hp };
        const result = rank > 0 ? calcAbilityDamage(ability, rank, stats, level, target) : null;

        return (
          <AbilityCard
            key={ability.key}
            ability={ability}
            rank={rank}
            damage={result?.final ?? null}
            level={level}
          />
        );
      })}
    </div>
  );
}
