"use client";

import { create } from "zustand";
import type { RuneSelection } from "@lol-sim/types";

const EMPTY_RUNE_SELECTION: RuneSelection = {
  primaryTreeId: null,
  keystoneId: null,
  primaryRuneIds: [null, null, null],
  secondaryTreeId: null,
  secondaryRuneIds: [null, null],
  statShardIds: [null, null, null],
};

interface SimulatorStore {
  // Attacker
  selectedChampionId: string | null;
  level: number;
  itemIds: number[];
  abilityRanks: Record<string, number>;
  runeSelection: RuneSelection;

  // Target
  targetMode: "custom" | "champion" | "monster";
  customTarget: { hp: number; armor: number; mr: number };
  targetChampionId: string | null;
  targetLevel: number;
  monsterType: string | null;

  // UI
  activeTab: "stats" | "abilities" | "breakdown";
  isChampionSelectOpen: boolean;
  isItemSelectOpen: boolean;
  activeItemSlot: number | null;
  isRuneSelectOpen: boolean;

  // Actions
  setChampion: (id: string) => void;
  setLevel: (level: number) => void;
  setActiveTab: (tab: "stats" | "abilities" | "breakdown") => void;
  setTargetMode: (mode: "custom" | "champion" | "monster") => void;
  setCustomTarget: (stats: Partial<{ hp: number; armor: number; mr: number }>) => void;
  setMonsterType: (type: string) => void;
  setChampionSelectOpen: (open: boolean) => void;
  addItem: (slotIndex: number, itemId: number) => void;
  removeItem: (slotIndex: number) => void;
  setItemSelectOpen: (open: boolean, slotIndex?: number) => void;
  setRuneSelectOpen: (open: boolean) => void;
  setPrimaryTree: (treeId: number) => void;
  setKeystone: (id: number) => void;
  setPrimaryRune: (tier: number, id: number) => void;
  setSecondaryTree: (treeId: number) => void;
  setSecondaryRune: (slot: number, id: number) => void;
  setStatShard: (row: number, id: number) => void;
  setRuneSelection: (selection: RuneSelection) => void;
  reset: () => void;
}

const initialState = {
  selectedChampionId: null,
  level: 1,
  itemIds: [0, 0, 0, 0, 0, 0] as number[],
  abilityRanks: {} as Record<string, number>,
  runeSelection: { ...EMPTY_RUNE_SELECTION },
  targetMode: "custom" as const,
  customTarget: { hp: 2000, armor: 100, mr: 100 },
  targetChampionId: null,
  targetLevel: 1,
  monsterType: null,
  activeTab: "stats" as const,
  isChampionSelectOpen: false,
  isItemSelectOpen: false,
  activeItemSlot: null as number | null,
  isRuneSelectOpen: false,
};

export const useSimulatorStore = create<SimulatorStore>((set) => ({
  ...initialState,

  setChampion: (id) => set({ selectedChampionId: id }),
  setLevel: (level) => set({ level: Math.max(1, Math.min(18, level)) }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTargetMode: (mode) => set({ targetMode: mode }),
  setCustomTarget: (stats) =>
    set((state) => ({
      customTarget: { ...state.customTarget, ...stats },
    })),
  setMonsterType: (type) => set({ monsterType: type }),
  setChampionSelectOpen: (open) => set({ isChampionSelectOpen: open }),
  addItem: (slotIndex, itemId) =>
    set((state) => {
      const newIds = [...state.itemIds];
      newIds[slotIndex] = itemId;
      return { itemIds: newIds };
    }),
  removeItem: (slotIndex) =>
    set((state) => {
      const newIds = [...state.itemIds];
      newIds[slotIndex] = 0;
      return { itemIds: newIds };
    }),
  setItemSelectOpen: (open, slotIndex) =>
    set({
      isItemSelectOpen: open,
      activeItemSlot: open ? (slotIndex ?? null) : null,
    }),
  setRuneSelectOpen: (open) => set({ isRuneSelectOpen: open }),
  setPrimaryTree: (treeId) =>
    set((state) => ({
      runeSelection: {
        ...state.runeSelection,
        primaryTreeId: treeId,
        keystoneId: null,
        primaryRuneIds: [null, null, null],
        // Reset secondary if same as new primary
        ...(state.runeSelection.secondaryTreeId === treeId
          ? { secondaryTreeId: null, secondaryRuneIds: [null, null] as [null, null] }
          : {}),
      },
    })),
  setKeystone: (id) =>
    set((state) => ({
      runeSelection: { ...state.runeSelection, keystoneId: id },
    })),
  setPrimaryRune: (tier, id) =>
    set((state) => {
      const newIds = [...state.runeSelection.primaryRuneIds] as [number | null, number | null, number | null];
      newIds[tier] = id;
      return { runeSelection: { ...state.runeSelection, primaryRuneIds: newIds } };
    }),
  setSecondaryTree: (treeId) =>
    set((state) => ({
      runeSelection: {
        ...state.runeSelection,
        secondaryTreeId: treeId,
        secondaryRuneIds: [null, null],
      },
    })),
  setSecondaryRune: (slot, id) =>
    set((state) => {
      const newIds = [...state.runeSelection.secondaryRuneIds] as [number | null, number | null];
      newIds[slot] = id;
      return { runeSelection: { ...state.runeSelection, secondaryRuneIds: newIds } };
    }),
  setStatShard: (row, id) =>
    set((state) => {
      const newIds = [...state.runeSelection.statShardIds] as [number | null, number | null, number | null];
      newIds[row] = id;
      return { runeSelection: { ...state.runeSelection, statShardIds: newIds } };
    }),
  setRuneSelection: (selection) => set({ runeSelection: selection }),
  reset: () => set(initialState),
}));
