"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";

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
            className={`flex flex-1 items-center justify-center px-3 text-xs font-medium transition-colors border
              ${isFirst ? "rounded-l" : ""}
              ${isLast ? "rounded-r" : ""}
              ${isActive
                ? "bg-dark-300 border-gold-600 text-gold-300"
                : "bg-dark-400 border-dark-200 text-dark-100 hover:text-gold-100"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
