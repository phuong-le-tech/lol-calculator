"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useDataStore } from "../../stores/useDataStore";

export function RuneSlots() {
  const runeSelection = useSimulatorStore((s) => s.runeSelection);
  const setRuneSelectOpen = useSimulatorStore((s) => s.setRuneSelectOpen);
  const getRuneTree = useDataStore((s) => s.getRuneTree);
  const getRune = useDataStore((s) => s.getRune);

  const primaryTree = runeSelection.primaryTreeId ? getRuneTree(runeSelection.primaryTreeId) : null;
  const keystone = runeSelection.keystoneId ? getRune(runeSelection.keystoneId) : null;
  const secondaryTree = runeSelection.secondaryTreeId ? getRuneTree(runeSelection.secondaryTreeId) : null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-dark-100">
        Runes
      </span>
      <button
        onClick={() => setRuneSelectOpen(true)}
        className="flex gap-3 rounded-lg p-1 transition-colors hover:bg-dark-300/40"
      >
        {/* Primary rune */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-dark-200 bg-dark-300">
            {keystone ? (
              <img src={keystone.icon} alt={keystone.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-dark-300" />
            )}
          </div>
          <span className="max-w-[60px] truncate text-[10px] text-dark-100">
            {keystone?.name ?? "Primary"}
          </span>
        </div>

        {/* Secondary tree */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-dark-200 bg-dark-300">
            {secondaryTree ? (
              <img src={secondaryTree.icon} alt={secondaryTree.name} className="h-full w-full object-cover" />
            ) : primaryTree ? (
              <img src={primaryTree.icon} alt={primaryTree.name} className="h-full w-full object-cover opacity-40" />
            ) : (
              <div className="h-full w-full bg-dark-300" />
            )}
          </div>
          <span className="max-w-[60px] truncate text-[10px] text-dark-100">
            {secondaryTree?.name ?? "Secondary"}
          </span>
        </div>
      </button>
    </div>
  );
}
