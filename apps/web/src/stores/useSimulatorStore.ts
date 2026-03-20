"use client";

import { create } from "zustand";

interface SimulatorStore {
  // Attacker
  selectedChampionId: string | null;
  level: number;
  itemIds: number[];
  abilityRanks: Record<string, number>;

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
  reset: () => void;
}

const initialState = {
  selectedChampionId: null,
  level: 1,
  itemIds: [0, 0, 0, 0, 0, 0] as number[],
  abilityRanks: {} as Record<string, number>,
  targetMode: "custom" as const,
  customTarget: { hp: 2000, armor: 100, mr: 100 },
  targetChampionId: null,
  targetLevel: 1,
  monsterType: null,
  activeTab: "stats" as const,
  isChampionSelectOpen: false,
  isItemSelectOpen: false,
  activeItemSlot: null as number | null,
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
  reset: () => set(initialState),
}));
