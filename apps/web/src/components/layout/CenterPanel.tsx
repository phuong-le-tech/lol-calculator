"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { EmptyState } from "../champion/EmptyState";
import { ChampionHeader } from "../champion/ChampionHeader";
import { TabBar } from "../shared/TabBar";
import { StatsTable } from "../stats/StatsTable";
import { AbilitiesTab } from "../stats/AbilitiesTab";
import { BreakdownTab } from "../stats/BreakdownTab";
import { DURATION, EASE } from "../../lib/motion";

const TABS = [
  { id: "stats", label: "Stats" },
  { id: "abilities", label: "Abilities" },
  { id: "breakdown", label: "Breakdown" },
];

export function CenterPanel() {
  const selectedChampionId = useSimulatorStore((s) => s.selectedChampionId);
  const activeTab = useSimulatorStore((s) => s.activeTab);
  const setActiveTab = useSimulatorStore((s) => s.setActiveTab);

  if (!selectedChampionId) {
    return (
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto p-5 px-6">
        <EmptyState />
      </main>
    );
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-5 px-6">
      <ChampionHeader />
      <TabBar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as "stats" | "abilities" | "breakdown")}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="flex min-h-0 flex-1 flex-col"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: DURATION.normal, ease: EASE }}
        >
          {activeTab === "stats" && <StatsTable />}
          {activeTab === "abilities" && <AbilitiesTab />}
          {activeTab === "breakdown" && <BreakdownTab />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
