"use client";

import { useEffect } from "react";
import type { Champion, Item, RuneTree, SummonerSpell } from "@lol-sim/types";
import { STAT_SHARD_ROWS } from "@lol-sim/ddragon";
import { useDataStore } from "../stores/useDataStore";
import { TopBar } from "./layout/TopBar";
import { LeftSidebar } from "./layout/LeftSidebar";
import { CenterPanel } from "./layout/CenterPanel";
import { RightSidebar } from "./layout/RightSidebar";
import { ChampionSelectModal } from "./champion/ChampionSelectModal";
import { ItemSelectModal } from "./items/ItemSelectModal";
import { RuneSelectModal } from "./runes/RuneSelectModal";
import { SummonerSpellSelectModal } from "./summonerSpells/SummonerSpellSelectModal";

interface SimulatorPageProps {
  champions: Champion[];
  items: Item[];
  runeTrees: RuneTree[];
  summonerSpells: SummonerSpell[];
  patchVersion: string;
}

export function SimulatorPage({ champions, items, runeTrees, summonerSpells, patchVersion }: SimulatorPageProps) {
  const setData = useDataStore((s) => s.setData);
  const setRuneData = useDataStore((s) => s.setRuneData);
  const setSummonerSpells = useDataStore((s) => s.setSummonerSpells);

  useEffect(() => {
    setData(champions, items, patchVersion);
    setRuneData(runeTrees, STAT_SHARD_ROWS);
    setSummonerSpells(summonerSpells);
  }, [champions, items, runeTrees, summonerSpells, patchVersion, setData, setRuneData, setSummonerSpells]);

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
      <SummonerSpellSelectModal />
    </>
  );
}
