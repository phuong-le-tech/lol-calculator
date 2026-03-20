import { DataClient, fetchAllChampions, fetchAllItems, fetchAllRunes } from "@lol-sim/ddragon";
import { SimulatorPage } from "../components/SimulatorPage";

export default async function Home() {
  try {
    const client = new DataClient();
    const version = await client.getLatestVersion();
    const [champions, items, runeTrees] = await Promise.all([
      fetchAllChampions(client, version),
      fetchAllItems(client, version),
      fetchAllRunes(client, version),
    ]);

    return <SimulatorPage champions={champions} items={items} runeTrees={runeTrees} patchVersion={version} />;
  } catch {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-600">
        <div className="text-center">
          <p className="text-xl text-gold-300">Failed to load game data</p>
          <p className="mt-2 text-dark-50">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }
}
