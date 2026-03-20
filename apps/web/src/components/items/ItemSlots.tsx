"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useDataStore } from "../../stores/useDataStore";
import { ItemIcon } from "./ItemIcon";
import { X, Plus } from "lucide-react";
import { DURATION } from "../../lib/motion";
import type { Item } from "@lol-sim/types";

const STAT_LABELS: Record<string, { label: string; color: string; format?: "percent" | "decimal" }> = {
  ad: { label: "Attack Damage", color: "text-dmg-physical" },
  ap: { label: "Ability Power", color: "text-dmg-magic" },
  hp: { label: "Health", color: "text-stat-health" },
  mana: { label: "Mana", color: "text-stat-mana" },
  armor: { label: "Armor", color: "text-stat-armor" },
  mr: { label: "Magic Resist", color: "text-stat-mr" },
  attackSpeed: { label: "Attack Speed", color: "text-stat-as", format: "percent" },
  critChance: { label: "Crit Chance", color: "text-stat-crit", format: "percent" },
  lethality: { label: "Lethality", color: "text-dmg-physical" },
  armorPen: { label: "Armor Pen", color: "text-dmg-physical", format: "percent" },
  magicPen: { label: "Magic Pen", color: "text-dmg-magic" },
  magicPenPercent: { label: "Magic Pen %", color: "text-dmg-magic", format: "percent" },
  abilityHaste: { label: "Ability Haste", color: "text-stat-ms" },
  lifeSteal: { label: "Life Steal", color: "text-stat-health", format: "percent" },
  omnivamp: { label: "Omnivamp", color: "text-stat-health", format: "percent" },
  moveSpeed: { label: "Move Speed", color: "text-stat-ms" },
  moveSpeedPercent: { label: "Move Speed %", color: "text-stat-ms", format: "percent" },
};

function formatStatValue(key: string, value: number): string {
  const info = STAT_LABELS[key];
  if (info?.format === "percent") return `${Math.round(value * 100)}%`;
  if (info?.format === "decimal") return value.toFixed(2);
  return `+${Math.round(value)}`;
}

function ItemTooltip({ item, slotIndex }: { item: Item; slotIndex: number }) {
  const statEntries = Object.entries(item.stats).filter(
    ([, v]) => v !== undefined && v !== 0
  ) as [string, number][];

  const alignClass = slotIndex <= 1
    ? "left-0"
    : slotIndex >= 4
      ? "right-0"
      : "left-1/2 -translate-x-1/2";
  const arrowAlign = slotIndex <= 1
    ? "left-3"
    : slotIndex >= 4
      ? "right-3"
      : "left-1/2 -translate-x-1/2";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: DURATION.fast }}
      className={`absolute bottom-full z-50 mb-2 w-48 rounded-lg border border-gold-300/20 bg-dark-500 p-2.5 shadow-xl shadow-black/50 ${alignClass}`}
    >
      {/* Arrow */}
      <div className={`absolute -bottom-1 h-2 w-2 rotate-45 border-b border-r border-gold-300/20 bg-dark-500 ${arrowAlign}`} />

      <p className="text-sm font-semibold text-gold-100">{item.name}</p>
      <p className="mb-1.5 text-[11px] text-gold-500">{item.cost.toLocaleString()}g</p>

      {statEntries.length > 0 && (
        <div className="flex flex-col gap-0.5 border-t border-dark-200 pt-1.5">
          {statEntries.map(([key, value]) => {
            const info = STAT_LABELS[key];
            if (!info) return null;
            return (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[11px] text-dark-100">{info.label}</span>
                <span className={`font-mono text-[11px] font-semibold ${info.color}`}>
                  {formatStatValue(key, value)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export function ItemSlots() {
  const itemIds = useSimulatorStore((s) => s.itemIds);
  const setItemSelectOpen = useSimulatorStore((s) => s.setItemSelectOpen);
  const removeItem = useSimulatorStore((s) => s.removeItem);
  const getItem = useDataStore((s) => s.getItem);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const equippedItems = itemIds.map((id) => (id !== 0 ? getItem(id) : null));
  const totalCost = equippedItems.reduce((sum, item) => sum + (item?.cost ?? 0), 0);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-dark-100">Items</span>
      <div className="flex gap-2">
        {itemIds.map((id, i) => {
          const item = equippedItems[i];
          return (
            <div key={i} className="relative">
              <AnimatePresence mode="wait">
                {item ? (
                  <motion.div
                    key={`item-${id}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: DURATION.fast }}
                    onMouseEnter={() => setHoveredSlot(i)}
                    onMouseLeave={() => setHoveredSlot(null)}
                  >
                    <button
                      onClick={() => setItemSelectOpen(true, i)}
                      className="group relative overflow-hidden rounded border-2 border-gold-600 transition-all duration-200 hover:border-gold-300 hover:shadow-sm hover:shadow-gold-glow"
                    >
                      <ItemIcon src={item.imageUrl} alt={item.name} size={32} />
                      <div
                        role="button"
                        tabIndex={0}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-all duration-200 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(i);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            removeItem(i);
                          }
                        }}
                      >
                        <X size={14} className="text-dark-100" />
                      </div>
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key={`empty-${i}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: DURATION.fast }}
                    onClick={() => setItemSelectOpen(true, i)}
                    className="flex h-8 w-8 items-center justify-center rounded border border-dashed border-dark-200 bg-dark-300 transition-all duration-200 hover:border-gold-600 hover:bg-dark-200 hover:shadow-sm hover:shadow-gold-glow"
                  >
                    <Plus size={12} className="text-dark-100" />
                  </motion.button>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {hoveredSlot === i && item && (
                  <ItemTooltip item={item} slotIndex={i} />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      {totalCost > 0 && (
        <span className="text-xs text-dark-100">
          Build Cost: <span className="text-gold-500">{totalCost.toLocaleString()}g</span>
        </span>
      )}
    </div>
  );
}
