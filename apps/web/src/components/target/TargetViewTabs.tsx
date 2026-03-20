"use client";

import { motion } from "framer-motion";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { SPRING } from "../../lib/motion";

const VIEW_TABS: { id: "champion" | "custom" | "monster"; label: string }[] = [
  { id: "champion", label: "Champion" },
  { id: "custom", label: "Dummy" },
  { id: "monster", label: "Monster" },
];

export function TargetViewTabs() {
  const activeView = useSimulatorStore((s) => s.targetMode);
  const setActiveView = useSimulatorStore((s) => s.setTargetMode);

  return (
    <div className="flex">
      {VIEW_TABS.map((tab, index) => {
        const isActive = activeView === tab.id;
        const isFirst = index === 0;
        const isLast = index === VIEW_TABS.length - 1;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            style={{ height: "36px" }}
            className={`relative flex flex-1 items-center justify-center px-3 text-xs font-medium transition-colors border
              ${isFirst ? "rounded-l" : ""}
              ${isLast ? "rounded-r" : ""}
              ${isActive
                ? "border-gold-600 text-gold-300"
                : "bg-dark-400 border-dark-200 text-dark-100 hover:text-gold-100"
              }
            `}
          >
            {isActive && (
              <motion.span
                layoutId="target-tab-bg"
                className="absolute inset-0 bg-dark-300 border border-gold-600 rounded"
                transition={SPRING.snappy}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
