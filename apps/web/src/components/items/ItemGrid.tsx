"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useDataStore } from "../../stores/useDataStore";
import { ItemIcon } from "./ItemIcon";
import type { Item } from "@lol-sim/types";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "damage", label: "AD" },
  { id: "magic", label: "AP" },
  { id: "hp", label: "HP" },
  { id: "attack_speed", label: "AS" },
  { id: "crit", label: "Crit" },
  { id: "defense", label: "Defense" },
];

interface ItemGridProps {
  selectedItemId: number | null;
  onSelectItem: (item: Item) => void;
}

export function ItemGrid({ selectedItemId, onSelectItem }: ItemGridProps) {
  const items = useDataStore((s) => s.items);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return items
      .filter((item) => item.isCompleted)
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
      .filter((item) => {
        if (category === "all") return true;
        if (category === "hp") return (item.stats.hp ?? 0) > 0;
        if (category === "crit") return (item.stats.critChance ?? 0) > 0;
        return item.category === category;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, search, category]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-md bg-dark-400 px-3 py-2">
        <Search size={14} className="text-dark-50" />
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-dark-100 outline-none placeholder:text-dark-50"
          autoFocus
        />
      </div>

      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === cat.id
                ? "bg-gold-300 text-dark-600"
                : "bg-dark-300 text-dark-100 hover:bg-dark-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((item) => (
            <button
              key={item.riotId}
              onClick={() => onSelectItem(item)}
              className={`flex items-center gap-2 rounded-lg border-2 p-2 text-left transition-colors ${
                selectedItemId === item.riotId
                  ? "border-gold-300 bg-dark-300"
                  : "border-dark-200 bg-dark-400 hover:border-dark-100"
              }`}
            >
              <ItemIcon
                src={item.imageUrl}
                alt={item.name}
                size={32}
                className="shrink-0 rounded"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-dark-100">{item.name}</p>
                <p className="text-xs text-gold-500">{item.cost}g</p>
              </div>
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-dark-50">No items found</p>
        )}
      </div>
    </div>
  );
}
