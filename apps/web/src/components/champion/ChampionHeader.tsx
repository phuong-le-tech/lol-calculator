"use client";

import Image from "next/image";
import { useDataStore } from "../../stores/useDataStore";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useSimulationResult } from "../../hooks/useSimulationResult";
import { HealthBar } from "../shared/HealthBar";

export function ChampionHeader() {
  const selectedChampionId = useSimulatorStore((s) => s.selectedChampionId);
  const level = useSimulatorStore((s) => s.level);
  const getChampion = useDataStore((s) => s.getChampion);
  const { stats, autoAttack } = useSimulationResult();

  const champion = selectedChampionId ? getChampion(selectedChampionId) : null;

  if (!champion || !stats) return null;

  return (
    <div className="flex items-center gap-4 rounded-lg bg-dark-400 p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 border-gold-600">
        <Image
          src={champion.imageUrl}
          alt={champion.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-semibold text-gold-100">{champion.name}</h1>
          <span className="text-xs text-dark-50">
            Lv{level} {champion.role}
          </span>
        </div>
        <HealthBar current={stats.hp} max={stats.hp} color="var(--color-stat-health)" label="HP" />
        <HealthBar current={stats.mp} max={stats.mp} color="var(--color-stat-mana)" label="MP" />
      </div>

      <div className="shrink-0 text-right">
        <p className="font-ui text-4xl font-bold text-gold-300">
          {autoAttack ? Math.round(autoAttack.dps).toLocaleString() : "—"}
        </p>
        <p className="text-xs text-dark-50">Damage per second</p>
      </div>
    </div>
  );
}
