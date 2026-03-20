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

const HIGHLIGHT_PATTERNS: { pattern: RegExp; color: string }[] = [
  // Percentage numbers with stat type: "80% AD", "60% AP", etc.
  { pattern: /\d+(?:\.\d+)?%\s*(?:bonus\s+)?(?:AD|attack damage)/gi, color: "text-dmg-physical font-semibold" },
  { pattern: /\d+(?:\.\d+)?%\s*(?:bonus\s+)?(?:AP|ability power)/gi, color: "text-dmg-magic font-semibold" },
  { pattern: /\d+(?:\.\d+)?%\s*(?:bonus\s+)?(?:max(?:imum)?\s+)?(?:HP|health)/gi, color: "text-stat-health font-semibold" },
  { pattern: /\d+(?:\.\d+)?%\s*(?:bonus\s+)?(?:armor)/gi, color: "text-stat-armor font-semibold" },
  { pattern: /\d+(?:\.\d+)?%\s*(?:bonus\s+)?(?:magic resist(?:ance)?|MR)/gi, color: "text-stat-mr font-semibold" },
  { pattern: /\d+(?:\.\d+)?%\s*(?:bonus\s+)?(?:attack speed)/gi, color: "text-stat-as font-semibold" },
  { pattern: /\d+(?:\.\d+)?%\s*(?:bonus\s+)?(?:critical strike|crit)/gi, color: "text-stat-crit font-semibold" },
  { pattern: /\d+(?:\.\d+)?%\s*(?:bonus\s+)?(?:move(?:ment)?\s+speed)/gi, color: "text-stat-ms font-semibold" },
  { pattern: /\d+(?:\.\d+)?%\s*(?:bonus\s+)?(?:ability haste|cooldown reduction)/gi, color: "text-[--color-stat-haste] font-semibold" },
  // Damage type keywords
  { pattern: /physical damage/gi, color: "text-dmg-physical font-medium" },
  { pattern: /magic damage/gi, color: "text-dmg-magic font-medium" },
  { pattern: /true damage/gi, color: "text-dmg-true font-medium" },
  // Stat keywords — each with distinct color
  { pattern: /move(?:ment)?\s+speed/gi, color: "text-stat-ms font-medium" },
  { pattern: /ability haste/gi, color: "text-[--color-stat-haste] font-medium" },
  { pattern: /cooldown reduction/gi, color: "text-[--color-stat-haste] font-medium" },
  { pattern: /cooldown/gi, color: "text-[--color-stat-haste] font-medium" },
  { pattern: /slow(?:ed|s)?/gi, color: "text-[--color-stat-cc] font-medium" },
  { pattern: /stun(?:ned|s)?/gi, color: "text-[--color-stat-cc] font-medium" },
  { pattern: /root(?:ed|s)?/gi, color: "text-[--color-stat-cc] font-medium" },
  { pattern: /knock(?:ed)?\s*(?:up|back|aside)/gi, color: "text-[--color-stat-cc] font-medium" },
  { pattern: /snare[ds]?/gi, color: "text-[--color-stat-cc] font-medium" },
  { pattern: /suppress(?:ed|ion)?/gi, color: "text-[--color-stat-cc] font-medium" },
  { pattern: /silence[ds]?/gi, color: "text-[--color-stat-cc] font-medium" },
  { pattern: /charm(?:ed|s)?/gi, color: "text-[--color-stat-cc] font-medium" },
  { pattern: /taunt(?:ed|s)?/gi, color: "text-[--color-stat-cc] font-medium" },
  { pattern: /fear(?:ed|s)?/gi, color: "text-[--color-stat-cc] font-medium" },
  // Rank-scaled numbers: "10/20/30/40/50"
  { pattern: /\d+(?:\/\d+){2,}/g, color: "text-gold-300 font-mono font-medium" },
  // Standalone numbers (damage values, durations) — at least 2 digits or a decimal
  { pattern: /(?<!\w)\d+(?:\.\d+)?(?:\s*seconds?|\s*sec)/gi, color: "text-gold-100 font-medium" },
];

function highlightDescription(text: string): React.ReactNode[] {
  // Build a combined regex with named groups
  const parts: { start: number; end: number; text: string; color: string }[] = [];

  for (const { pattern, color } of HIGHLIGHT_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      // Check no overlap with existing parts
      const start = match.index;
      const end = start + match[0].length;
      const overlaps = parts.some((p) => start < p.end && end > p.start);
      if (!overlaps) {
        parts.push({ start, end, text: match[0], color });
      }
    }
  }

  // Sort by position
  parts.sort((a, b) => a.start - b.start);

  if (parts.length === 0) return [text];

  const result: React.ReactNode[] = [];
  let cursor = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (cursor < part.start) {
      result.push(text.slice(cursor, part.start));
    }
    result.push(
      <span key={i} className={part.color}>{part.text}</span>
    );
    cursor = part.end;
  }
  if (cursor < text.length) {
    result.push(text.slice(cursor));
  }

  return result;
}

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
    <div className="flex flex-col gap-3 rounded-xl border border-dark-200/60 bg-[#111827AA] p-3">
      {/* Top: icon + name + key badge */}
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-dark-200">
          <Image
            src={ability.imageUrl}
            alt={ability.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gold-100">{ability.name}</span>
            <span className="rounded bg-gold-600/20 px-1.5 py-0.5 font-ui text-[10px] font-bold text-gold-300">
              {ability.key}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-dark-100">{highlightDescription(ability.description)}</p>
        </div>
      </div>

      {/* Scaling badges */}
      {ability.scalings.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {baseDmg !== null && baseDmg > 0 && (
            <span className={`font-mono text-xs font-semibold ${dmgColor}`}>
              {Math.round(baseDmg)} base
            </span>
          )}
          {ability.scalings.map((scaling, i) => (
            <ScalingBadge key={i} scaling={scaling} rank={Math.max(rank, 1)} />
          ))}
        </div>
      )}

      {/* Bottom: rank pips | damage | cooldown */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isPassive && maxRank > 1 && (
            <div className="flex gap-1">
              {Array.from({ length: maxRank }).map((_, i) => (
                <div
                  key={i}
                  className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-mono leading-none ${
                    i < rank
                      ? "bg-gold-600 font-bold text-dark-600"
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

        <div className="flex items-center gap-3">
          {damage !== null && damage > 0 && (
            <span className={`font-mono text-[13px] font-bold ${dmgColor}`}>
              {Math.round(damage)} DMG
            </span>
          )}
          {cooldown !== null && cooldown > 0 && (
            <span className="text-[11px] text-dark-100">{cooldown}s CD</span>
          )}
          {cost !== null && cost > 0 && (
            <span className="text-[11px] text-stat-mana">{cost} mana</span>
          )}
        </div>
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

  const sortedAbilities = [...champion.abilities].sort(
    (a, b) => KEY_ORDER.indexOf(a.key as typeof KEY_ORDER[number]) - KEY_ORDER.indexOf(b.key as typeof KEY_ORDER[number])
  );

  const passive = sortedAbilities.find((a) => a.key === "P");
  const basic = sortedAbilities.filter((a) => a.key !== "P");

  const renderCard = (ability: Ability) => {
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
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Passive — full width */}
      {passive && renderCard(passive)}

      {/* Q/W and E/R — 2-column bento grid */}
      <div className="grid grid-cols-2 gap-2">
        {basic.map((ability) => renderCard(ability))}
      </div>
    </div>
  );
}
