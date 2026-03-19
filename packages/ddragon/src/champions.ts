import type { Champion } from "@lol-sim/types";
import { DataClient } from "./client";
import { normalizeChampion } from "./normalizer";

/**
 * Fetch and normalize all champions using Meraki Analytics.
 * @param version - Data Dragon patch version (used for image URLs)
 */
export async function fetchAllChampions(
  client: DataClient,
  version: string
): Promise<Champion[]> {
  const raw = await client.getAllChampions();
  return Object.values(raw).map((champ) =>
    normalizeChampion(champ, version, client)
  );
}

/**
 * Fetch and normalize a single champion by name.
 * @param name - Champion name as it appears in Meraki (e.g., "Jinx", "LeeSin")
 */
export async function fetchChampion(
  client: DataClient,
  version: string,
  name: string
): Promise<Champion> {
  const raw = await client.getChampion(name);
  return normalizeChampion(raw, version, client);
}
