"use client";

import { useMemo } from "react";
import { useDataStore } from "../stores/useDataStore";
import { useSimulatorStore } from "../stores/useSimulatorStore";
import {
  mergeStats,
  aggregateItemStats,
  aggregateRuneStats,
  calcAutoAttackDamage,
  calcTimeToKillAutoOnly,
  calcEffectiveResist,
  calcChampionStats,
} from "@lol-sim/engine";
import type { FinalStats, Item, StatShard } from "@lol-sim/types";

interface SimulationResultData {
  stats: FinalStats | null;
  baseStats: FinalStats | null;
  autoAttack: {
    raw: number;
    final: number;
    dps: number;
    effectiveArmor: number;
  } | null;
  timeToKill: {
    autoOnly: number;
  } | null;
  effectiveHP: {
    physical: number;
    magic: number;
    true: number;
  } | null;
}

export function useSimulationResult(): SimulationResultData {
  const getChampion = useDataStore((s) => s.getChampion);
  const getItem = useDataStore((s) => s.getItem);
  const statShardRows = useDataStore((s) => s.statShardRows);
  const selectedChampionId = useSimulatorStore((s) => s.selectedChampionId);
  const level = useSimulatorStore((s) => s.level);
  const customTarget = useSimulatorStore((s) => s.customTarget);
  const itemIds = useSimulatorStore((s) => s.itemIds);
  const runeSelection = useSimulatorStore((s) => s.runeSelection);

  return useMemo(() => {
    if (!selectedChampionId) {
      return { stats: null, baseStats: null, autoAttack: null, timeToKill: null, effectiveHP: null };
    }

    const champion = getChampion(selectedChampionId);
    if (!champion) {
      return { stats: null, baseStats: null, autoAttack: null, timeToKill: null, effectiveHP: null };
    }

    const equippedItems = itemIds
      .filter((id) => id !== 0)
      .map((id) => getItem(id))
      .filter((item): item is Item => item !== undefined);
    const itemStats = aggregateItemStats(equippedItems.map((i) => i.stats));

    // Resolve selected stat shards
    const selectedShards: (StatShard | null)[] = runeSelection.statShardIds.map(
      (shardId, rowIndex) => {
        if (shardId === null || !statShardRows[rowIndex]) return null;
        return statShardRows[rowIndex].find((s) => s.id === shardId) ?? null;
      }
    );

    // Determine if champion is AP-based (magic adaptive type)
    const isAP = champion.attackType === "RANGED"
      ? (itemStats.ap || 0) > (itemStats.ad || 0)
      : false;
    const runeStats = aggregateRuneStats(selectedShards, isAP);

    const stats = mergeStats(champion.baseStats, level, itemStats, runeStats);
    const baseStats = calcChampionStats(champion.baseStats, level);

    const target = {
      hp: customTarget.hp,
      armor: customTarget.armor,
      mr: customTarget.mr,
    };

    const autoAttack = calcAutoAttackDamage(stats, level, target);
    const timeToKillAutoOnly = calcTimeToKillAutoOnly(stats, level, target);

    const effectiveArmor = calcEffectiveResist({
      baseResist: target.armor,
      lethality: stats.lethality,
      percentPen: stats.armorPen,
    });
    const effectiveMR = calcEffectiveResist({
      baseResist: target.mr,
      flatMagicPen: stats.magicPen,
      percentPen: stats.magicPenPercent,
    });

    return {
      stats,
      baseStats,
      autoAttack,
      timeToKill: { autoOnly: timeToKillAutoOnly },
      effectiveHP: {
        physical: target.hp * (1 + effectiveArmor / 100),
        magic: target.hp * (1 + effectiveMR / 100),
        true: target.hp,
      },
    };
  }, [selectedChampionId, level, customTarget, itemIds, runeSelection, statShardRows, getChampion, getItem]);
}
