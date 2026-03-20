"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Item } from "@lol-sim/types";
import { getPassive } from "@lol-sim/engine";
import { ItemIcon } from "./ItemIcon";
import { DURATION, EASE } from "../../lib/motion";

const CATEGORY_LABELS: Record<string, string> = {
  damage: "Attack Damage",
  magic: "Ability Power",
  defense: "Defense",
  attack_speed: "Attack Speed",
  boots: "Boots",
  other: "Other",
};

const STAT_LABELS: Record<string, { label: string; format: "flat" | "percent" }> = {
  ad: { label: "Attack Damage", format: "flat" },
  ap: { label: "Ability Power", format: "flat" },
  hp: { label: "Health", format: "flat" },
  mana: { label: "Mana", format: "flat" },
  armor: { label: "Armor", format: "flat" },
  mr: { label: "Magic Resist", format: "flat" },
  attackSpeed: { label: "Attack Speed", format: "percent" },
  critChance: { label: "Critical Strike Chance", format: "percent" },
  lethality: { label: "Lethality", format: "flat" },
  armorPen: { label: "Armor Penetration", format: "percent" },
  magicPen: { label: "Magic Penetration", format: "flat" },
  magicPenPercent: { label: "Magic Pen %", format: "percent" },
  abilityHaste: { label: "Ability Haste", format: "flat" },
  lifeSteal: { label: "Life Steal", format: "percent" },
  omnivamp: { label: "Omnivamp", format: "percent" },
  moveSpeed: { label: "Move Speed", format: "flat" },
  moveSpeedPercent: { label: "Move Speed", format: "percent" },
};

interface ItemDetailProps {
  item: Item | null;
  onEquip: () => void;
}

export function ItemDetail({ item, onEquip }: ItemDetailProps) {
  return (
    <AnimatePresence mode="wait">
      {!item ? (
        <motion.div
          key="empty"
          className="flex flex-1 items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.fast }}
        >
          <p className="text-sm text-dark-50">Select an item to view details</p>
        </motion.div>
      ) : (
        <motion.div
          key={item.riotId}
          className="flex flex-col gap-4 p-5"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: DURATION.normal, ease: EASE }}
        >
          <div className="flex items-start gap-4">
            <ItemIcon
              src={item.imageUrl}
              alt={item.name}
              size={64}
              className="shrink-0 rounded-lg"
            />
            <div>
              <h3 className="text-lg font-semibold text-gold-100">{item.name}</h3>
              <p className="text-sm text-gold-500">{item.cost.toLocaleString()}g</p>
              <span className="mt-1 inline-block rounded bg-dark-300 px-2 py-0.5 text-xs text-dark-100">
                {CATEGORY_LABELS[item.category] ?? item.category}
              </span>
            </div>
          </div>

          <ItemStats item={item} />
          <ItemPassives item={item} />

          <motion.button
            onClick={onEquip}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="mt-auto rounded-lg bg-gold-300 px-6 py-3 text-sm font-semibold text-dark-600 transition-colors hover:bg-gold-200"
          >
            Equip Item
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ItemStats({ item }: { item: Item }) {
  const nonZeroStats = Object.entries(item.stats).filter(
    ([, value]) => value !== undefined && value !== 0
  );

  if (nonZeroStats.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">Stats</span>
      {nonZeroStats.map(([key, value]) => {
        const meta = STAT_LABELS[key];
        if (!meta) return null;
        const formatted = meta.format === "percent" ? `+${value}%` : `+${value}`;
        return (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-dark-50">{meta.label}</span>
            <span className="text-dark-100">{formatted}</span>
          </div>
        );
      })}
    </div>
  );
}

function ItemPassives({ item }: { item: Item }) {
  const passive = getPassive(item.riotId);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">Passives</span>
        {passive ? (
          <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success">
            SIMULATED
          </span>
        ) : (
          <span className="rounded-full bg-dark-300 px-2 py-0.5 text-xs font-medium text-dark-50">
            NOT SIMULATED
          </span>
        )}
      </div>
      {passive && (
        <p className="text-sm font-medium text-gold-100">{passive.name}</p>
      )}
      {item.description && (
        <p className="text-xs leading-relaxed text-dark-100">{item.description}</p>
      )}
    </div>
  );
}
