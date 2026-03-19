import { DataClient } from "./client";

/**
 * Check if a new patch is available compared to the current one.
 */
export async function checkForNewPatch(
  client: DataClient,
  currentPatch: string | null
): Promise<{ isNew: boolean; version: string }> {
  const latest = await client.getLatestVersion();
  return {
    isNew: latest !== currentPatch,
    version: latest,
  };
}
