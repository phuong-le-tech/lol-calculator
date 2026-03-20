"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useDataStore } from "../../stores/useDataStore";
import type { SummonerSpell } from "@lol-sim/types";

export function SummonerSpellSelectModal() {
  const isOpen = useSimulatorStore((s) => s.isSummonerSpellSelectOpen);
  const activeSlot = useSimulatorStore((s) => s.activeSummonerSlot);
  const spellIds = useSimulatorStore((s) => s.summonerSpellIds);
  const setSummonerSpellSelectOpen = useSimulatorStore((s) => s.setSummonerSpellSelectOpen);
  const setSummonerSpell = useSimulatorStore((s) => s.setSummonerSpell);
  const summonerSpells = useDataStore((s) => s.summonerSpells);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen || activeSlot === null) return null;

  // The other slot's spell (can't pick the same spell twice)
  const otherSlotSpellId = spellIds[activeSlot === 0 ? 1 : 0];

  const handleSelect = (spell: SummonerSpell) => {
    setSummonerSpell(activeSlot, spell.id);
    setSummonerSpellSelectOpen(false);
  };

  const handleClose = () => {
    setSummonerSpellSelectOpen(false);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-200 ${
        isVisible ? "bg-black/60" : "bg-black/0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Select Summoner Spell"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={handleClose}
        aria-label="Close modal"
        tabIndex={-1}
      />
      <div
        className={`relative flex w-[420px] flex-col overflow-hidden rounded-2xl border border-gold-300/40 bg-dark-500/95 shadow-2xl backdrop-blur-xl transition-all duration-200 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[1.5px] text-gold-300">
            Summoner Spell
          </h2>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-dark-400 text-dark-100 transition-colors hover:text-gold-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Spell grid */}
        <div className="grid grid-cols-3 gap-3 px-5 pb-5">
          {summonerSpells.map((spell) => {
            const isOtherSlot = spell.id === otherSlotSpellId;
            return (
              <button
                key={spell.id}
                onClick={() => !isOtherSlot && handleSelect(spell)}
                disabled={isOtherSlot}
                className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
                  isOtherSlot
                    ? "cursor-not-allowed border-dark-200 bg-dark-400 opacity-40"
                    : "border-dark-200 bg-dark-400 hover:border-gold-600 hover:bg-dark-300"
                }`}
              >
                <img
                  src={spell.imageUrl}
                  alt={spell.name}
                  className="h-10 w-10 rounded"
                />
                <span className="text-[11px] font-medium text-dark-100">
                  {spell.name}
                </span>
                <span className="text-[10px] text-dark-50">
                  {spell.cooldown}s
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
