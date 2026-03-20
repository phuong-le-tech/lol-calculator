"use client";

import { useEffect } from "react";
import type { Champion, Item, RuneTree } from "@lol-sim/types";
import { STAT_SHARD_ROWS } from "@lol-sim/ddragon";
import { useDataStore } from "../stores/useDataStore";
import { TopBar } from "./layout/TopBar";
import { LeftSidebar } from "./layout/LeftSidebar";
import { CenterPanel } from "./layout/CenterPanel";
import { RightSidebar } from "./layout/RightSidebar";
import { ChampionSelectModal } from "./champion/ChampionSelectModal";
import { ItemSelectModal } from "./items/ItemSelectModal";
import { RuneSelectModal } from "./runes/RuneSelectModal";

interface SimulatorPageProps {
  champions: Champion[];
  items: Item[];
  runeTrees: RuneTree[];
  patchVersion: string;
}

export function SimulatorPage({ champions, items, runeTrees, patchVersion }: SimulatorPageProps) {
  const setData = useDataStore((s) => s.setData);
  const setRuneData = useDataStore((s) => s.setRuneData);

  useEffect(() => {
    setData(champions, items, patchVersion);
    setRuneData(runeTrees, STAT_SHARD_ROWS);
  }, [champions, items, runeTrees, patchVersion, setData, setRuneData]);

  return (
    <>
      <div className="flex h-screen flex-col">
        <TopBar />
        <div className="flex min-h-0 flex-1">
          <LeftSidebar />
          <CenterPanel />
          <RightSidebar />
        </div>
      </div>
      <ChampionSelectModal />
      <ItemSelectModal />
      <RuneSelectModal />
    </>
  );
}
