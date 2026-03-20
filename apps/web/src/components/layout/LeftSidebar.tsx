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
    <aside className="flex w-[300px] shrink-0 flex-col gap-3 overflow-y-auto border-r border-gold-300/15 bg-dark-500/75 p-4 backdrop-blur-xl">
      {/* Search bar */}
      <button
        onClick={() => setChampionSelectOpen(true)}
        className="flex h-9 items-center gap-2 rounded-[10px] border border-gold-300/20 bg-dark-400/60 px-3 text-[13px] text-dark-50 hover:bg-dark-300/60"
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
        <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-dark-100">
          Runes
        </span>
        <div className="flex gap-3">
          {/* Primary rune group */}
          <div className="flex flex-col items-center gap-1">
            <div className="h-8 w-8 rounded-full bg-dark-300 border border-dark-200" />
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-5 w-5 rounded-full bg-dark-300 border border-dark-200" />
              ))}
            </div>
          </div>
          {/* Secondary rune group */}
          <div className="flex flex-col items-center gap-1">
            <div className="h-6 w-6 rounded-full bg-dark-300 border border-dark-200" />
            <div className="flex gap-1">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-5 w-5 rounded-full bg-dark-300 border border-dark-200" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summoner Spells placeholder */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-dark-100">
          Summoner Spells
        </span>
        <div className="flex gap-1">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-9 w-9 rounded border border-dark-200 bg-dark-400" />
          ))}
        </div>
      </div>

      <ItemSlots />
    </aside>
  );
}
