"use client";

import Image from "next/image";
import { useDataStore } from "../../stores/useDataStore";
import { useSimulatorStore } from "../../stores/useSimulatorStore";

export function ChampionGrid() {
  const champions = useDataStore((s) => s.champions);
  const selectedChampionId = useSimulatorStore((s) => s.selectedChampionId);
  const setChampion = useSimulatorStore((s) => s.setChampion);

  const displayed = champions
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 6);

  return (
    <div className="grid grid-cols-3 gap-[6px]">
      {displayed.map((champ) => (
        <button
          key={champ.riotId}
          onClick={() => setChampion(champ.riotId)}
          className={`relative flex aspect-[4/5] flex-col overflow-hidden rounded-lg bg-dark-500 transition-colors ${
            selectedChampionId === champ.riotId
              ? "border-2 border-gold-300 shadow-sm shadow-gold-glow"
              : "border border-dark-200 hover:border-dark-100"
          }`}
        >
          <div className="relative flex-1 overflow-hidden">
            <Image
              src={champ.imageUrl}
              alt={champ.name}
              fill
              sizes="80px"
              className="object-cover object-top"
            />
          </div>
          <div className="shrink-0 bg-dark-500/90 px-1 py-0.5 text-center text-[11px] leading-tight text-dark-100">
            {champ.name}
          </div>
        </button>
      ))}
    </div>
  );
}
