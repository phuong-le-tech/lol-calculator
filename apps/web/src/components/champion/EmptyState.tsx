"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";

export function EmptyState() {
  const setChampionSelectOpen = useSimulatorStore((s) => s.setChampionSelectOpen);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="absolute inset-0 -m-8 rounded-full bg-gold-glow blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-gold-600 bg-dark-400">
          <svg
            className="h-12 w-12 animate-spin text-gold-300"
            style={{ animationDuration: "8s" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M12 2a10 10 0 1 0 10 10" strokeLinecap="round" />
            <path d="M12 6a6 6 0 1 0 6 6" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gold-100">Select Your Champion</h2>
        <p className="mt-2 text-sm text-dark-50">
          Choose a champion from the sidebar or use the search to find your main
        </p>
      </div>
      <button
        onClick={() => setChampionSelectOpen(true)}
        className="rounded-md border border-gold-600 bg-dark-400 px-6 py-2.5 text-sm font-medium text-gold-300 transition-colors hover:bg-dark-300"
      >
        Click a champion tile or use the select bar
      </button>
    </div>
  );
}
