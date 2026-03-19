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
    <div className="flex gap-1 rounded-lg bg-dark-400 p-1">
      {VIEW_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveView(tab.id)}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeView === tab.id
              ? "bg-dark-300 text-gold-300"
              : "text-dark-50 hover:text-dark-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
