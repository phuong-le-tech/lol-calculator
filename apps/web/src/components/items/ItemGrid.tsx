"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useDataStore } from "../../stores/useDataStore";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { ItemIcon } from "./ItemIcon";
import { SPRING, staggerContainer, staggerItem } from "../../lib/motion";
import type { Item } from "@lol-sim/types";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "ad", label: "AD" },
  { id: "ap", label: "AP" },
  { id: "hp", label: "HP" },
  { id: "as", label: "AS" },
  { id: "crit", label: "Crit" },
  { id: "defense", label: "Defense" },
];

function matchesCategory(item: Item, category: string): boolean {
  switch (category) {
    case "all":
      return true;
    case "ad":
      return (item.stats.ad ?? 0) > 0 || (item.stats.lethality ?? 0) > 0;
    case "ap":
      return (item.stats.ap ?? 0) > 0;
    case "hp":
      return (item.stats.hp ?? 0) > 0;
    case "as":
      return (item.stats.attackSpeed ?? 0) > 0;
    case "crit":
      return (item.stats.critChance ?? 0) > 0;
    case "defense":
      return (
        (item.stats.armor ?? 0) > 0 ||
        (item.stats.mr ?? 0) > 0 ||
        item.category === "defense"
      );
    default:
      return true;
  }
}

interface ItemGridProps {
  selectedItemId: number | null;
  onSelectItem: (item: Item) => void;
}

export function ItemGrid({ selectedItemId, onSelectItem }: ItemGridProps) {
  const items = useDataStore((s) => s.items);
  const itemIds = useSimulatorStore((s) => s.itemIds);
  const equippedSet = useMemo(() => new Set(itemIds.filter((id) => id !== 0)), [itemIds]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return items
      .filter((item) => item.isCompleted)
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
      .filter((item) => matchesCategory(item, category))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, search, category]);

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Search */}
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

      {/* Category filters with sliding indicator */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`relative rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === cat.id
                ? "text-dark-600"
                : "bg-dark-300 text-dark-100 hover:bg-dark-200"
            }`}
          >
            {category === cat.id && (
              <motion.span
                layoutId="item-category-bg"
                className="absolute inset-0 rounded-full bg-gold-300 shadow-sm shadow-gold-glow"
                transition={SPRING.snappy}
              />
            )}
            <span className="relative z-10">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Scrollable item grid with stagger */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <motion.div
          key={`${search}-${category}`}
          className="grid grid-cols-3 gap-2"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {filtered.map((item) => {
            const isEquipped = equippedSet.has(item.riotId);
            return (
              <motion.button
                key={item.riotId}
                variants={staggerItem}
                onClick={() => !isEquipped && onSelectItem(item)}
                disabled={isEquipped}
                whileHover={!isEquipped ? { scale: 1.02 } : undefined}
                whileTap={!isEquipped ? { scale: 0.98 } : undefined}
                className={`flex items-center gap-2 rounded-lg border-2 p-2 text-left transition-colors duration-150 ${
                  isEquipped
                    ? "cursor-not-allowed border-dark-200 bg-dark-400 opacity-40"
                    : selectedItemId === item.riotId
                      ? "border-gold-300 bg-dark-300 shadow-sm shadow-gold-glow"
                      : "border-dark-200 bg-dark-400 hover:border-gold-600 hover:bg-dark-300"
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
                  <p className="text-xs text-gold-500">
                    {isEquipped ? "Equipped" : `${item.cost}g`}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-dark-50">No items found</p>
        )}
      </div>
    </div>
  );
}
