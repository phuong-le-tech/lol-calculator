"use client";

import { useState } from "react";

const VIEW_TABS = [
  { id: "champion", label: "Champion" },
  { id: "synergy", label: "Synergy" },
  { id: "counter", label: "Counter" },
];

export function TargetViewTabs() {
  const [activeView, setActiveView] = useState("champion");

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
