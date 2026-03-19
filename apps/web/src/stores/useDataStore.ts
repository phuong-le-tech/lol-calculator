"use client";

import { create } from "zustand";
import type { Champion, Item } from "@lol-sim/types";

interface DataStore {
  champions: Champion[];
  items: Item[];
  patchVersion: string;
  setData: (champions: Champion[], items: Item[], patchVersion: string) => void;
  getChampion: (id: string) => Champion | undefined;
  getItem: (id: number) => Item | undefined;
}

export const useDataStore = create<DataStore>((set, get) => ({
  champions: [],
  items: [],
  patchVersion: "",
  setData: (champions, items, patchVersion) => set({ champions, items, patchVersion }),
  getChampion: (id) => get().champions.find((c) => c.riotId === id),
  getItem: (id) => get().items.find((i) => i.riotId === id),
}));
