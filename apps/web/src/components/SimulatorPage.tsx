"use client";

import { useEffect } from "react";
import type { Champion, Item } from "@lol-sim/types";
import { useDataStore } from "../stores/useDataStore";
import { TopBar } from "./layout/TopBar";
import { LeftSidebar } from "./layout/LeftSidebar";
import { CenterPanel } from "./layout/CenterPanel";
import { RightSidebar } from "./layout/RightSidebar";
import { ChampionSelectModal } from "./champion/ChampionSelectModal";

interface SimulatorPageProps {
  champions: Champion[];
  items: Item[];
  patchVersion: string;
}

export function SimulatorPage({ champions, items, patchVersion }: SimulatorPageProps) {
  const setData = useDataStore((s) => s.setData);

  useEffect(() => {
    setData(champions, items, patchVersion);
  }, [champions, items, patchVersion, setData]);

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
    </>
  );
}
