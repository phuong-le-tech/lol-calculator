"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useDataStore } from "../../stores/useDataStore";
import type { RuneTree, Rune, RuneSelection, StatShard } from "@lol-sim/types";

// ── Stat Shard Labels ───────────────────────────────────
const SHARD_LABELS: Record<number, string> = {
  5008: "+9 Adaptive",
  5005: "+10% AS",
  5007: "+8 AH",
  5010: "+2% MS",
  5011: "+65 HP",
  5002: "+6 Armor",
  5003: "+8 MR",
};

const SHARD_COLORS: Record<number, string> = {
  5008: "text-gold-300",
  5005: "text-stat-as",
  5007: "text-stat-ms",
  5010: "text-stat-ms",
  5011: "text-stat-health",
  5002: "text-stat-armor",
  5003: "text-stat-mr",
};

// ── Sub-components ──────────────────────────────────────

function TreeButton({
  tree,
  isSelected,
  onClick,
}: {
  tree: RuneTree;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-lg border py-2 transition-all ${
        isSelected
          ? "border-gold-300 bg-gold-300/10"
          : "border-dark-200 bg-dark-400 hover:border-dark-100 hover:bg-dark-300"
      }`}
    >
      <img src={tree.icon} alt={tree.name} className="h-5 w-5" />
      <span
        className={`text-[11px] font-semibold ${
          isSelected ? "text-gold-300" : "text-dark-100"
        }`}
      >
        {tree.name}
      </span>
    </button>
  );
}

function KeystoneCard({
  rune,
  isSelected,
  onClick,
}: {
  rune: Rune;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-20 flex-col items-center justify-center gap-1.5 rounded-lg border-2 p-2 transition-all ${
        isSelected
          ? "border-gold-300 bg-gold-300/10 shadow-sm shadow-gold-glow"
          : "border-dark-200 bg-dark-400 hover:border-dark-100"
      }`}
    >
      <img src={rune.icon} alt={rune.name} className="h-7 w-7" />
      <span
        className={`text-center text-[9px] font-medium leading-tight ${
          isSelected ? "text-gold-100" : "text-dark-100"
        }`}
      >
        {rune.name}
      </span>
    </button>
  );
}

function RuneOption({
  rune,
  isSelected,
  onClick,
}: {
  rune: Rune;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center gap-2 rounded-md border px-3 py-2 transition-all ${
        isSelected
          ? "border-gold-600 bg-gold-300/10"
          : "border-dark-200 bg-dark-400 hover:border-dark-100"
      }`}
    >
      <img
        src={rune.icon}
        alt={rune.name}
        className={`h-6 w-6 rounded-full ${isSelected ? "" : "opacity-60"}`}
      />
      <span
        className={`text-xs ${isSelected ? "text-gold-100" : "text-dark-100"}`}
      >
        {rune.name}
      </span>
    </button>
  );
}

function StatShardButton({
  shard,
  isSelected,
  onClick,
}: {
  shard: StatShard;
  isSelected: boolean;
  onClick: () => void;
}) {
  const label = SHARD_LABELS[shard.id] ?? shard.name;
  const color = SHARD_COLORS[shard.id] ?? "text-dark-100";

  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center rounded-md border px-2 py-1.5 transition-all ${
        isSelected
          ? "border-gold-600 bg-gold-300/10"
          : "border-dark-200 bg-dark-400 hover:border-dark-100"
      }`}
    >
      <span className={`text-[11px] font-medium ${isSelected ? color : "text-dark-100"}`}>
        {label}
      </span>
    </button>
  );
}

function GoldDivider() {
  return (
    <div
      className="h-px w-full"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, #C89B3C44 50%, transparent 100%)",
      }}
    />
  );
}

// ── Main Modal ──────────────────────────────────────────

export function RuneSelectModal() {
  const isOpen = useSimulatorStore((s) => s.isRuneSelectOpen);
  const setRuneSelectOpen = useSimulatorStore((s) => s.setRuneSelectOpen);
  const storeSelection = useSimulatorStore((s) => s.runeSelection);
  const setRuneSelection = useSimulatorStore((s) => s.setRuneSelection);

  const runeTrees = useDataStore((s) => s.runeTrees);
  const statShardRows = useDataStore((s) => s.statShardRows);

  // Local draft state — only commits on confirm
  const [draft, setDraft] = useState<RuneSelection>({ ...storeSelection });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraft({ ...storeSelection });
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen, storeSelection]);

  if (!isOpen) return null;

  const primaryTree = runeTrees.find((t) => t.id === draft.primaryTreeId);
  const secondaryTree = runeTrees.find((t) => t.id === draft.secondaryTreeId);
  const availableSecondaryTrees = runeTrees.filter(
    (t) => t.id !== draft.primaryTreeId
  );

  const handleSelectPrimaryTree = (treeId: number) => {
    setDraft((prev) => ({
      ...prev,
      primaryTreeId: treeId,
      keystoneId: null,
      primaryRuneIds: [null, null, null],
      // Reset secondary if conflicts
      ...(prev.secondaryTreeId === treeId
        ? { secondaryTreeId: null, secondaryRuneIds: [null, null] as [null, null] }
        : {}),
    }));
  };

  const handleSelectKeystone = (id: number) => {
    setDraft((prev) => ({ ...prev, keystoneId: id }));
  };

  const handleSelectPrimaryRune = (tier: number, id: number) => {
    setDraft((prev) => {
      const newIds = [...prev.primaryRuneIds] as [number | null, number | null, number | null];
      newIds[tier] = id;
      return { ...prev, primaryRuneIds: newIds };
    });
  };

  const handleSelectSecondaryTree = (treeId: number) => {
    setDraft((prev) => ({
      ...prev,
      secondaryTreeId: treeId,
      secondaryRuneIds: [null, null],
    }));
  };

  const handleSelectSecondaryRune = (runeId: number) => {
    setDraft((prev) => {
      const current = [...prev.secondaryRuneIds] as [number | null, number | null];
      // If already selected, deselect
      const existingIdx = current.indexOf(runeId);
      if (existingIdx !== -1) {
        current[existingIdx] = null;
        return { ...prev, secondaryRuneIds: current };
      }
      // Fill first empty slot, or replace the first one
      const emptyIdx = current.indexOf(null);
      if (emptyIdx !== -1) {
        current[emptyIdx] = runeId;
      } else {
        current[0] = current[1];
        current[1] = runeId;
      }
      return { ...prev, secondaryRuneIds: current };
    });
  };

  const handleSelectStatShard = (row: number, shardId: number) => {
    setDraft((prev) => {
      const newIds = [...prev.statShardIds] as [number | null, number | null, number | null];
      newIds[row] = shardId;
      return { ...prev, statShardIds: newIds };
    });
  };

  const handleConfirm = () => {
    setRuneSelection(draft);
    setRuneSelectOpen(false);
  };

  const handleClose = () => {
    setRuneSelectOpen(false);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-200 ${
        isVisible ? "bg-black/60" : "bg-black/0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Select Runes"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={handleClose}
        aria-label="Close modal"
        tabIndex={-1}
      />
      <div
        className={`relative flex max-h-[85vh] w-[640px] flex-col overflow-hidden rounded-2xl border border-gold-300/40 bg-dark-500/95 shadow-2xl backdrop-blur-xl transition-all duration-200 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[1.5px] text-gold-300">
            Select Runes
          </h2>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-dark-400 text-dark-100 transition-colors hover:text-gold-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex flex-col gap-4 overflow-y-auto px-6 pb-6">
          {/* Tree selector */}
          <div className="flex gap-2">
            {runeTrees.map((tree) => (
              <TreeButton
                key={tree.id}
                tree={tree}
                isSelected={draft.primaryTreeId === tree.id}
                onClick={() => handleSelectPrimaryTree(tree.id)}
              />
            ))}
          </div>

          <GoldDivider />

          {/* Primary tree */}
          {primaryTree && (
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-dark-100">
                Primary — {primaryTree.name}
              </span>

              {/* Keystones (slot 0) */}
              <div className="flex justify-center gap-3">
                {primaryTree.slots[0]?.runes.map((rune) => (
                  <KeystoneCard
                    key={rune.id}
                    rune={rune}
                    isSelected={draft.keystoneId === rune.id}
                    onClick={() => handleSelectKeystone(rune.id)}
                  />
                ))}
              </div>

              {/* Tier rows (slots 1-3) */}
              {primaryTree.slots.slice(1, 4).map((slot, tierIdx) => (
                <div key={tierIdx} className="flex items-center gap-2">
                  <span className="w-10 shrink-0 text-[10px] font-medium text-dark-50">
                    Tier {tierIdx + 1}
                  </span>
                  <div className="flex flex-1 gap-2">
                    {slot.runes.map((rune) => (
                      <RuneOption
                        key={rune.id}
                        rune={rune}
                        isSelected={draft.primaryRuneIds[tierIdx] === rune.id}
                        onClick={() => handleSelectPrimaryRune(tierIdx, rune.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <GoldDivider />

          {/* Secondary tree */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-dark-100">
              Secondary{secondaryTree ? ` — ${secondaryTree.name}` : ""}
            </span>

            {/* Secondary tree picker (excludes primary) */}
            <div className="flex gap-2">
              {availableSecondaryTrees.map((tree) => (
                <TreeButton
                  key={tree.id}
                  tree={tree}
                  isSelected={draft.secondaryTreeId === tree.id}
                  onClick={() => handleSelectSecondaryTree(tree.id)}
                />
              ))}
            </div>

            {/* Secondary rune options: pick 2 from tier 1-3 */}
            {secondaryTree && (
              <div className="flex flex-col gap-2">
                {secondaryTree.slots.slice(1, 4).map((slot, tierIdx) => (
                  <div key={tierIdx} className="flex gap-2">
                    {slot.runes.map((rune) => {
                      const isSelected = draft.secondaryRuneIds.includes(rune.id);
                      return (
                        <RuneOption
                          key={rune.id}
                          rune={rune}
                          isSelected={isSelected}
                          onClick={() => handleSelectSecondaryRune(rune.id)}
                        />
                      );
                    })}
                  </div>
                ))}
                {draft.secondaryRuneIds.filter(Boolean).length > 0 && (
                  <p className="text-[10px] text-dark-50">
                    {draft.secondaryRuneIds.filter(Boolean).length}/2 selected
                  </p>
                )}
              </div>
            )}
          </div>

          <GoldDivider />

          {/* Stat shards */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-dark-100">
              Stat Shards
            </span>
            {statShardRows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-2">
                {row.map((shard, shardIdx) => (
                  <StatShardButton
                    key={`${rowIdx}-${shardIdx}`}
                    shard={shard}
                    isSelected={draft.statShardIds[rowIdx] === shard.id}
                    onClick={() => handleSelectStatShard(rowIdx, shard.id)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-gold-300 to-gold-600 py-3 font-semibold text-dark-600 shadow-md shadow-gold-glow/20 transition-all hover:shadow-lg hover:shadow-gold-glow/30"
          >
            <Check size={18} />
            <span className="text-[13px] uppercase tracking-wider">Confirm Runes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
