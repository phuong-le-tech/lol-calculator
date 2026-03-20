"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useDataStore } from "../../stores/useDataStore";
import { ItemIcon } from "./ItemIcon";
import { X, Plus } from "lucide-react";

export function ItemSlots() {
  const itemIds = useSimulatorStore((s) => s.itemIds);
  const setItemSelectOpen = useSimulatorStore((s) => s.setItemSelectOpen);
  const removeItem = useSimulatorStore((s) => s.removeItem);
  const getItem = useDataStore((s) => s.getItem);

  const equippedItems = itemIds.map((id) => (id !== 0 ? getItem(id) : null));
  const totalCost = equippedItems.reduce((sum, item) => sum + (item?.cost ?? 0), 0);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">Items</span>
      <div className="flex gap-2">
        {itemIds.map((id, i) => {
          const item = equippedItems[i];
          if (item) {
            return (
              <button
                key={i}
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
            );
          }
          return (
            <button
              key={i}
              onClick={() => setItemSelectOpen(true, i)}
              className="flex h-8 w-8 items-center justify-center rounded border border-dashed border-dark-200 bg-dark-300 transition-all duration-200 hover:border-gold-600 hover:bg-dark-200 hover:shadow-sm hover:shadow-gold-glow"
            >
              <Plus size={12} className="text-dark-50" />
            </button>
          );
        })}
      </div>
      {totalCost > 0 && (
        <span className="text-xs text-dark-50">
          Build Cost: <span className="text-gold-500">{totalCost.toLocaleString()}g</span>
        </span>
      )}
    </div>
  );
}
