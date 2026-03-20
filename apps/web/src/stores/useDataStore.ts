"use client";

import { create } from "zustand";
import type { Champion, Item, RuneTree, StatShard, Rune } from "@lol-sim/types";

interface DataStore {
  champions: Champion[];
  items: Item[];
  runeTrees: RuneTree[];
  statShardRows: StatShard[][];
  patchVersion: string;
  setData: (champions: Champion[], items: Item[], patchVersion: string) => void;
  setRuneData: (runeTrees: RuneTree[], statShardRows: StatShard[][]) => void;
  getChampion: (id: string) => Champion | undefined;
  getItem: (id: number) => Item | undefined;
  getRuneTree: (id: number) => RuneTree | undefined;
  getRune: (id: number) => Rune | undefined;
}

export const useDataStore = create<DataStore>((set, get) => ({
  champions: [],
  items: [],
  runeTrees: [],
  statShardRows: [],
  patchVersion: "",
  setData: (champions, items, patchVersion) => set({ champions, items, patchVersion }),
  setRuneData: (runeTrees, statShardRows) => set({ runeTrees, statShardRows }),
  getChampion: (id) => get().champions.find((c) => c.riotId === id),
  getItem: (id) => get().items.find((i) => i.riotId === id),
  getRuneTree: (id) => get().runeTrees.find((t) => t.id === id),
  getRune: (id) => {
    for (const tree of get().runeTrees) {
      for (const slot of tree.slots) {
        const rune = slot.runes.find((r) => r.id === id);
        if (rune) return rune;
      }
    }
    return undefined;
  },
}));
