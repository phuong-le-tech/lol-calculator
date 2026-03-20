import type { RuneTree, StatShard } from "@lol-sim/types";
import type { DataClient } from "./client";

const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";

interface DDragonRuneTree {
  id: number;
  key: string;
  name: string;
  icon: string;
  slots: {
    runes: {
      id: number;
      key: string;
      name: string;
      icon: string;
      shortDesc: string;
      longDesc: string;
    }[];
  }[];
}

function resolveIconUrl(iconPath: string): string {
  return `${DDRAGON_BASE}/cdn/img/${iconPath}`;
}

function normalizeRuneTree(raw: DDragonRuneTree): RuneTree {
  return {
    id: raw.id,
    key: raw.key,
    name: raw.name,
    icon: resolveIconUrl(raw.icon),
    slots: raw.slots.map((slot) => ({
      runes: slot.runes.map((rune) => ({
        id: rune.id,
        key: rune.key,
        name: rune.name,
        icon: resolveIconUrl(rune.icon),
        shortDesc: rune.shortDesc,
        longDesc: rune.longDesc,
      })),
    })),
  };
}

export async function fetchAllRunes(
  client: DataClient,
  version: string
): Promise<RuneTree[]> {
  const url = `${DDRAGON_BASE}/cdn/${encodeURIComponent(version)}/data/en_US/runesReforged.json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`Failed to fetch runes: ${res.status}`);

  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Unexpected runes payload from Data Dragon");
  }

  // Suppress unused parameter warning — client reserved for future use (e.g. image URL overrides)
  void client;

  return data.map((tree: DDragonRuneTree) => normalizeRuneTree(tree));
}

// ── Stat Shards ─────────────────────────────────────────
// DDragon does not include stat shards in runesReforged.json.
// These are hardcoded based on current League of Legends values.

export const STAT_SHARD_ROWS: StatShard[][] = [
  // Row 1 (Offense)
  [
    { id: 5008, name: "Adaptive Force", icon: "", stats: { adaptiveForce: 9 } },
    { id: 5005, name: "Attack Speed", icon: "", stats: { attackSpeed: 10 } },
    { id: 5007, name: "Ability Haste", icon: "", stats: { abilityHaste: 8 } },
  ],
  // Row 2 (Flex)
  [
    { id: 5008, name: "Adaptive Force", icon: "", stats: { adaptiveForce: 9 } },
    { id: 5010, name: "Move Speed", icon: "", stats: { moveSpeed: 2 } },
    { id: 5011, name: "Health", icon: "", stats: { hp: 65 } },
  ],
  // Row 3 (Defense)
  [
    { id: 5011, name: "Health", icon: "", stats: { hp: 65 } },
    { id: 5002, name: "Armor", icon: "", stats: { armor: 6 } },
    { id: 5003, name: "Magic Resist", icon: "", stats: { mr: 8 } },
  ],
];
