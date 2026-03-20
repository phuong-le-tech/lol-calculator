"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDataStore } from "../../stores/useDataStore";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import {
  DURATION,
  SPRING,
  fadeVariants,
  scaleInVariants,
  staggerContainer,
  staggerItem,
} from "../../lib/motion";

const ROLES = ["All", "Fighter", "Tank", "Mage", "Marksman", "Assassin", "Support"];

export function ChampionSelectModal() {
  const isOpen = useSimulatorStore((s) => s.isChampionSelectOpen);
  const setChampionSelectOpen = useSimulatorStore((s) => s.setChampionSelectOpen);
  const setChampion = useSimulatorStore((s) => s.setChampion);
  const champions = useDataStore((s) => s.champions);

  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  const filtered = useMemo(() => {
    return champions
      .filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchesRole =
          selectedRole === "All" ||
          c.role.toLowerCase().includes(selectedRole.toLowerCase());
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [champions, search, selectedRole]);

  const handleSelect = (id: string) => {
    setChampion(id);
    setChampionSelectOpen(false);
    setSearch("");
    setSelectedRole("All");
  };

  const handleRandom = () => {
    if (champions.length === 0) return;
    const random = champions[Math.floor(Math.random() * champions.length)];
    handleSelect(random.riotId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: DURATION.modal }}
          role="dialog"
          aria-modal="true"
          aria-label="Select Champion"
        >
          {/* Backdrop */}
          <motion.div className="absolute inset-0 bg-black/60" />

          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setChampionSelectOpen(false)}
            aria-label="Close modal"
            tabIndex={-1}
          />

          {/* Modal body */}
          <motion.div
            className="relative flex max-h-[80vh] w-[560px] flex-col rounded-xl border border-dark-200 bg-dark-500"
            variants={scaleInVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={SPRING.gentle}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-dark-200 px-6 py-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gold-100">
                Select Champion
              </h2>
              <button
                onClick={() => setChampionSelectOpen(false)}
                className="text-dark-50 hover:text-dark-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-2 rounded-md bg-dark-400 px-3 py-2">
                <Search size={14} className="text-dark-50" />
                <input
                  type="text"
                  placeholder="Search champion..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-dark-100 outline-none placeholder:text-dark-50"
                  autoFocus
                />
              </div>
            </div>

            {/* Role filters */}
            <div className="flex flex-wrap gap-1 px-6 pt-3">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedRole === role
                      ? "bg-gold-300 text-dark-600"
                      : "bg-dark-300 text-dark-100 hover:bg-dark-200"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Champion grid */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <motion.div
                key={`${search}-${selectedRole}`}
                className="grid grid-cols-5 gap-3"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {filtered.map((champ) => (
                  <motion.button
                    key={champ.riotId}
                    variants={staggerItem}
                    onClick={() => handleSelect(champ.riotId)}
                    className="group flex flex-col items-center gap-1"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-md border-2 border-dark-200 transition-colors group-hover:border-gold-300">
                      <Image
                        src={champ.imageUrl}
                        alt={champ.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs text-dark-50 group-hover:text-gold-100">
                      {champ.name}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-dark-50">No champions found</p>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-dark-200 px-6 py-3 text-center">
              <button
                onClick={handleRandom}
                className="text-xs text-dark-50 hover:text-gold-300"
              >
                Or use random champion
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
