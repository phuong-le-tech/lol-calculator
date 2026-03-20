"use client";

import { useState, useEffect } from "react";
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

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
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-200 ${
        isVisible ? "bg-black/60" : "bg-black/0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Select Item"
    >
      {/* Invisible backdrop button for closing */}
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={handleClose}
        aria-label="Close modal"
        tabIndex={-1}
      />
      <div
        className={`relative flex h-[690px] max-h-[80vh] w-[860px] flex-col overflow-hidden rounded-xl border border-dark-200 bg-dark-500 shadow-2xl transition-all duration-200 ${
          isVisible
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-dark-200 px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gold-100">
            Select Item
          </h2>
          <button
            onClick={handleClose}
            className="text-dark-50 transition-colors hover:text-dark-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          {/* Left panel — item grid */}
          <div className="flex w-[370px] shrink-0 flex-col border-r border-dark-200 p-4">
            <ItemGrid
              selectedItemId={selectedItem?.riotId ?? null}
              onSelectItem={setSelectedItem}
            />
          </div>

          {/* Right panel — item detail */}
          <div className="flex flex-1 flex-col overflow-y-auto bg-dark-400">
            <ItemDetail item={selectedItem} onEquip={handleEquip} />
          </div>
        </div>
      </div>
    </div>
  );
}
