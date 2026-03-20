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
    <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-dark-400 to-dark-300 p-4 shadow-lg shadow-gold-300/10">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 border-gold-600">
        <Image
          src={champion.imageUrl}
          alt={champion.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-semibold text-gold-100">{champion.name}</h1>
          <span className="rounded bg-dark-300 px-1.5 py-0.5 text-xs font-semibold text-gold-300">
            Lv{level}
          </span>
          <span className="text-xs text-dark-50">{champion.role}</span>
        </div>
        <HealthBar current={stats.hp} max={stats.hp} color="var(--color-stat-health)" label="HP" />
        <HealthBar current={stats.mp} max={stats.mp} color="var(--color-stat-mana)" label="MP" />

        {/* Combo damage bar — physical only for now */}
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-dark-300">
          <div className="h-full rounded-full bg-dmg-physical" style={{ width: "100%" }} />
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-mono text-4xl font-bold text-gold-300">
          {autoAttack ? Math.round(autoAttack.dps).toLocaleString() : "—"}
        </p>
        <p className="text-xs text-dark-50">Damage per second</p>
      </div>
    </div>
  );
}
