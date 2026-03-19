"use client";

import { useDataStore } from "../../stores/useDataStore";
import { Search, User } from "lucide-react";

export function TopBar() {
  const patchVersion = useDataStore((s) => s.patchVersion);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-dark-200 bg-dark-500 px-6">
      <span className="font-logo text-lg text-gold-300">LoL Sim</span>
      <span className="text-xs font-medium text-dark-50">
        Patch v{patchVersion}
      </span>
      <div className="flex items-center gap-3">
        <button className="text-dark-50 hover:text-dark-100">
          <Search size={16} />
        </button>
        <button className="text-dark-50 hover:text-dark-100">
          <User size={16} />
        </button>
      </div>
    </header>
  );
}
