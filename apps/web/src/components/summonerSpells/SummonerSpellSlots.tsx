"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useDataStore } from "../../stores/useDataStore";
import { X, Plus } from "lucide-react";

export function SummonerSpellSlots() {
  const spellIds = useSimulatorStore((s) => s.summonerSpellIds);
  const setSummonerSpellSelectOpen = useSimulatorStore((s) => s.setSummonerSpellSelectOpen);
  const removeSummonerSpell = useSimulatorStore((s) => s.removeSummonerSpell);
  const getSummonerSpell = useDataStore((s) => s.getSummonerSpell);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-dark-100">
        Summoner Spells
      </span>
      <div className="flex gap-2">
        {spellIds.map((id, i) => {
          const spell = id ? getSummonerSpell(id) : null;
          if (spell) {
            return (
              <button
                key={i}
                onClick={() => setSummonerSpellSelectOpen(true, i)}
                className="group relative overflow-hidden rounded border-2 border-gold-600 transition-all hover:border-gold-300 hover:shadow-sm hover:shadow-gold-glow"
              >
                <img
                  src={spell.imageUrl}
                  alt={spell.name}
                  className="h-9 w-9 object-cover"
                />
                <div
                  role="button"
                  tabIndex={0}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-all group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSummonerSpell(i);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      removeSummonerSpell(i);
                    }
                  }}
                >
                  <X size={14} className="text-dark-100" />
                </div>
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => setSummonerSpellSelectOpen(true, i)}
              className="flex h-9 w-9 items-center justify-center rounded border border-dashed border-dark-200 bg-dark-300 transition-all hover:border-gold-600 hover:bg-dark-200 hover:shadow-sm hover:shadow-gold-glow"
            >
              <Plus size={12} className="text-dark-100" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
