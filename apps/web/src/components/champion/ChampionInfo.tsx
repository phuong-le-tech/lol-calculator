"use client";

import Image from "next/image";
import { useDataStore } from "../../stores/useDataStore";
import { useSimulatorStore } from "../../stores/useSimulatorStore";

export function ChampionInfo() {
  const selectedChampionId = useSimulatorStore((s) => s.selectedChampionId);
  const getChampion = useDataStore((s) => s.getChampion);

  const champion = selectedChampionId ? getChampion(selectedChampionId) : null;

  if (!champion) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dark-300">
          <span className="text-2xl text-dark-50">?</span>
        </div>
        <span className="text-sm font-medium text-dark-50">No Champion</span>
        <span className="text-xs text-dark-50">Select a champion</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gold-600">
        <Image
          src={champion.imageUrl}
          alt={champion.name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="text-center">
        <p className="font-semibold text-gold-100">{champion.name}</p>
        <span className="inline-block rounded bg-dark-300 px-2 py-0.5 text-xs text-dark-100">
          {champion.role}
        </span>
      </div>
    </div>
  );
}
