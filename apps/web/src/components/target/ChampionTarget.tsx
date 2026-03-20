"use client";

import Image from "next/image";
import { useDataStore } from "../../stores/useDataStore";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { calcChampionStats } from "@lol-sim/engine";
import { Swords } from "lucide-react";

const SECTION_LABEL = "text-[11px] font-semibold uppercase tracking-[1.5px] text-dark-100 font-ui";

function StatDisplay({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className={SECTION_LABEL}>{label}</span>
        <span className={`font-mono text-lg font-medium ${color}`}>
          {Math.round(value).toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-dark-300">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, label === "Health" ? (value / 5000) * 100 : (value / 300) * 100)}%`,
            backgroundColor: label === "Health" ? "var(--color-stat-health)" : label === "Armor" ? "var(--color-stat-armor)" : "var(--color-stat-mr)",
          }}
        />
      </div>
    </div>
  );
}

export function ChampionTarget() {
  const champions = useDataStore((s) => s.champions);
  const getChampion = useDataStore((s) => s.getChampion);
  const targetChampionId = useSimulatorStore((s) => s.targetChampionId);
  const targetLevel = useSimulatorStore((s) => s.targetLevel);
  const setCustomTarget = useSimulatorStore((s) => s.setCustomTarget);
  const setChampionSelectOpen = useSimulatorStore((s) => s.setChampionSelectOpen);

  const targetChampion = targetChampionId ? getChampion(targetChampionId) : null;

  if (!targetChampion) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Swords size={40} className="text-dark-100" />
        <p className="text-center text-sm text-dark-100">
          Select a champion target to compare against
        </p>
        <p className="text-center text-xs text-dark-100">
          Champion target coming soon
        </p>
      </div>
    );
  }

  const targetStats = calcChampionStats(targetChampion.baseStats, targetLevel);

  return (
    <div className="flex flex-col gap-3">
      {/* Champion info card */}
      <div className="flex items-center gap-3 rounded-xl border border-gold-300/10 bg-[#111827AA] p-2 px-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gold-600">
          <Image
            src={targetChampion.imageUrl}
            alt={targetChampion.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gold-100">{targetChampion.name}</span>
          <span className="font-mono text-xs text-dark-100">
            Lv{targetLevel} · {targetChampion.role}
          </span>
        </div>
      </div>

      {/* Stats display */}
      <StatDisplay label="Health" value={targetStats.hp} color="text-stat-health" />
      <StatDisplay label="Armor" value={targetStats.armor} color="text-stat-armor" />
      <StatDisplay label="Magic Resist" value={targetStats.mr} color="text-stat-mr" />
    </div>
  );
}
