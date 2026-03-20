import type { SummonerSpell } from "@lol-sim/types";
import type { DataClient } from "./client";

const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";

/** Spells available in classic Summoner's Rift */
const CLASSIC_SPELL_IDS = new Set([
  "SummonerBarrier",
  "SummonerBoost",      // Cleanse
  "SummonerDot",        // Ignite
  "SummonerExhaust",
  "SummonerFlash",
  "SummonerHaste",      // Ghost
  "SummonerHeal",
  "SummonerSmite",
  "SummonerTeleport",
]);

interface DDragonSpell {
  id: string;
  name: string;
  description: string;
  key: string;
  cooldown: number[];
  image: { full: string };
  modes: string[];
}

export async function fetchAllSummonerSpells(
  client: DataClient,
  version: string
): Promise<SummonerSpell[]> {
  const url = `${DDRAGON_BASE}/cdn/${encodeURIComponent(version)}/data/en_US/summoner.json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`Failed to fetch summoner spells: ${res.status}`);

  const json: unknown = await res.json();
  if (typeof json !== "object" || json === null) {
    throw new Error("Unexpected summoner spells payload");
  }

  const data = (json as { data: Record<string, DDragonSpell> }).data;

  // Suppress unused parameter warning — client reserved for future use
  void client;

  return Object.values(data)
    .filter((spell) => CLASSIC_SPELL_IDS.has(spell.id))
    .map((spell) => ({
      id: spell.id,
      name: spell.name,
      description: spell.description,
      cooldown: spell.cooldown[0] ?? 0,
      imageUrl: `${DDRAGON_BASE}/cdn/${version}/img/spell/${spell.image.full}`,
      key: spell.key,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
