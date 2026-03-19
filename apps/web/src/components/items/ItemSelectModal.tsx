"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { ItemGrid } from "./ItemGrid";
import { ItemDetail } from "./ItemDetail";
import type { Item } from "@lol-sim/types";

export function ItemSelectModal() {
  const isOpen = useSimulatorStore((s) => s.isItemSelectOpen);
  const activeSlot = useSimulatorStore((s) => s.activeItemSlot);
  const setItemSelectOpen = useSimulatorStore((s) => s.setItemSelectOpen);
  const addItem = useSimulatorStore((s) => s.addItem);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  if (!isOpen || activeSlot === null) return null;

  const handleEquip = () => {
    if (!selectedItem) return;
    addItem(activeSlot, selectedItem.riotId);
    setSelectedItem(null);
    setItemSelectOpen(false);
  };

  const handleClose = () => {
    setSelectedItem(null);
    setItemSelectOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex max-h-[80vh] w-[860px] flex-col overflow-hidden rounded-xl border border-dark-200 bg-dark-500">
        <div className="flex items-center justify-between border-b border-dark-200 px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gold-100">
            Select Item
          </h2>
          <button onClick={handleClose} className="text-dark-50 hover:text-dark-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex w-[370px] shrink-0 flex-col border-r border-dark-200 p-4">
            <ItemGrid
              selectedItemId={selectedItem?.riotId ?? null}
              onSelectItem={setSelectedItem}
            />
          </div>

          <div className="flex flex-1 flex-col bg-dark-400">
            <ItemDetail item={selectedItem} onEquip={handleEquip} />
          </div>
        </div>
      </div>
    </div>
  );
}
