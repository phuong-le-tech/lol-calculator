"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useDataStore } from "../../stores/useDataStore";
import { ItemIcon } from "./ItemIcon";
import { X } from "lucide-react";

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
                className="group relative overflow-hidden rounded border-2 border-gold-600"
              >
                <ItemIcon src={item.imageUrl} alt={item.name} size={32} />
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(i);
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
              className="h-8 w-8 rounded bg-dark-300 transition-colors hover:bg-dark-200"
            />
          );
        })}
      </div>
      {totalCost > 0 && (
        <span className="text-xs text-dark-50">
          Build Cost: {totalCost.toLocaleString()}g
        </span>
      )}
    </div>
  );
}
