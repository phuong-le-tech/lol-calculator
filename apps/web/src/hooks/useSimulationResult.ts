"use client";

import { useMemo } from "react";
import { useDataStore } from "../stores/useDataStore";
import { useSimulatorStore } from "../stores/useSimulatorStore";
import {
  mergeStats,
  aggregateItemStats,
  calcAutoAttackDamage,
  calcTimeToKillAutoOnly,
  calcEffectiveResist,
  calcChampionStats,
} from "@lol-sim/engine";
import type { FinalStats } from "@lol-sim/types";

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
  const selectedChampionId = useSimulatorStore((s) => s.selectedChampionId);
  const level = useSimulatorStore((s) => s.level);
  const customTarget = useSimulatorStore((s) => s.customTarget);

  return useMemo(() => {
    if (!selectedChampionId) {
      return { stats: null, baseStats: null, autoAttack: null, timeToKill: null, effectiveHP: null };
    }

    const champion = getChampion(selectedChampionId);
    if (!champion) {
      return { stats: null, baseStats: null, autoAttack: null, timeToKill: null, effectiveHP: null };
    }

    const emptyItemStats = aggregateItemStats([]);
    const stats = mergeStats(champion.baseStats, level, emptyItemStats);
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
  }, [selectedChampionId, level, customTarget, getChampion]);
}
