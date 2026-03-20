"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { ItemGrid } from "./ItemGrid";
import { ItemDetail } from "./ItemDetail";
import { DURATION, SPRING, fadeVariants, scaleInVariants } from "../../lib/motion";
import type { Item } from "@lol-sim/types";

export function ItemSelectModal() {
  const isOpen = useSimulatorStore((s) => s.isItemSelectOpen);
  const activeSlot = useSimulatorStore((s) => s.activeItemSlot);
  const setItemSelectOpen = useSimulatorStore((s) => s.setItemSelectOpen);
  const addItem = useSimulatorStore((s) => s.addItem);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleEquip = () => {
    if (!selectedItem || activeSlot === null) return;
    addItem(activeSlot, selectedItem.riotId);
    setSelectedItem(null);
    setItemSelectOpen(false);
  };

  const handleClose = () => {
    setSelectedItem(null);
    setItemSelectOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && activeSlot !== null && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: DURATION.modal }}
          role="dialog"
          aria-modal="true"
          aria-label="Select Item"
        >
          {/* Backdrop */}
          <motion.div className="absolute inset-0 bg-black/60" />

          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={handleClose}
            aria-label="Close modal"
            tabIndex={-1}
          />

          {/* Modal body */}
          <motion.div
            className="relative flex h-[690px] max-h-[80vh] w-[1060px] flex-col overflow-hidden rounded-xl border border-dark-200 bg-dark-500 shadow-2xl"
            variants={scaleInVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={SPRING.gentle}
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
              <div className="flex w-[520px] shrink-0 flex-col border-r border-dark-200 p-4">
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
