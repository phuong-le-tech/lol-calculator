import type { Item } from "@lol-sim/types";
import { DataClient } from "./client";
import { normalizeItem } from "./normalizer";

/**
 * Fetch and normalize all items from Meraki Analytics.
 * @param completedOnly - If true, filter to completed items only (tier 2+, no further upgrades)
 */
export async function fetchAllItems(
  client: DataClient,
  version: string,
  completedOnly: boolean = true
): Promise<Item[]> {
  const raw = await client.getAllItems();
  const items: Item[] = [];

  for (const item of Object.values(raw)) {
    // Skip removed items
    if (item.removed) continue;
    // Skip items that aren't purchasable
    if (!item.shop.purchasable) continue;

    const normalized = normalizeItem(item, version, client);

    if (!completedOnly || normalized.isCompleted) {
      items.push(normalized);
    }
  }

  return items;
}
