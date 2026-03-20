"use client";

import { ChampionGrid } from "../champion/ChampionGrid";
import { ChampionInfo } from "../champion/ChampionInfo";
import { LevelSlider } from "../shared/LevelSlider";
import { ItemSlots } from "../items/ItemSlots";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { Search } from "lucide-react";

export function LeftSidebar() {
  const level = useSimulatorStore((s) => s.level);
  const setLevel = useSimulatorStore((s) => s.setLevel);
  const setChampionSelectOpen = useSimulatorStore((s) => s.setChampionSelectOpen);

  return (
    <aside className="flex w-[300px] shrink-0 flex-col gap-3 overflow-y-auto border-r border-dark-200 bg-dark-500 p-4">
      {/* Search bar */}
      <button
        onClick={() => setChampionSelectOpen(true)}
        className="flex items-center gap-2 rounded-md bg-dark-400 px-3 py-2 text-sm text-dark-50 hover:bg-dark-300"
      >
        <Search size={14} />
        <span>Search champion...</span>
      </button>

      {/* Champion quick-pick grid */}
      <ChampionGrid />

      {/* Selected champion info */}
      <ChampionInfo />

      {/* Level slider */}
      <LevelSlider level={level} onLevelChange={setLevel} />

      {/* Runes placeholder */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">Runes</span>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-8 rounded-full bg-dark-300" />
          ))}
        </div>
      </div>

      {/* Summoner Spells placeholder */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">
          Summoner Spells
        </span>
        <div className="flex gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-8 w-8 rounded bg-dark-300" />
          ))}
        </div>
      </div>

      <ItemSlots />
    </aside>
  );
}
