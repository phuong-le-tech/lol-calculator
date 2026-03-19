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
    <div className="grid grid-cols-3 gap-2">
      {displayed.map((champ) => (
        <button
          key={champ.riotId}
          onClick={() => setChampion(champ.riotId)}
          className={`relative aspect-square overflow-hidden rounded-md border-2 transition-colors ${
            selectedChampionId === champ.riotId
              ? "border-gold-300"
              : "border-dark-200 hover:border-dark-100"
          }`}
        >
          <Image
            src={champ.imageUrl}
            alt={champ.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        </button>
      ))}
    </div>
  );
}
