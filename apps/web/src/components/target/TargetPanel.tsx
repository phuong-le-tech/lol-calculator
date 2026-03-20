"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useSimulationResult } from "../../hooks/useSimulationResult";
import { TargetViewTabs } from "./TargetViewTabs";
import { DummyTarget } from "./DummyTarget";

const SECTION_LABEL = "text-[11px] font-semibold uppercase tracking-[1.2px] text-dark-100";

export function TargetPanel() {
  const level = useSimulatorStore((s) => s.level);
  const { stats, autoAttack, timeToKill, effectiveHP } = useSimulationResult();

  return (
    <div className="flex flex-col gap-3">
      <TargetViewTabs />
      <DummyTarget />

      {/* Level */}
      <div className="flex flex-col gap-1">
        <span className={SECTION_LABEL}>Level</span>
        <span className="font-mono text-2xl font-bold text-gold-300">{level}</span>
      </div>

      {/* Runes placeholder */}
      <div className="flex flex-col gap-2">
        <span className={SECTION_LABEL}>Runes</span>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-6 rounded-full bg-dark-300" />
          ))}
        </div>
      </div>

      {/* Effective HP */}
      {effectiveHP && (
        <div className="flex flex-col gap-2">
          <span className={SECTION_LABEL}>Effective HP</span>
          <div className="flex flex-col gap-[3px]">
            <div
              className="flex items-center justify-between rounded bg-dark-600 px-1.5 border-l-2 border-dmg-physical"
              style={{ height: "28px" }}
            >
              <span className="text-xs text-dmg-physical">vs Physical</span>
              <span className="font-mono text-xs text-dark-100">
                {Math.round(effectiveHP.physical).toLocaleString()}
              </span>
            </div>
            <div
              className="flex items-center justify-between rounded bg-dark-600 px-1.5 border-l-2 border-dmg-magic"
              style={{ height: "28px" }}
            >
              <span className="text-xs text-dmg-magic">vs Magic</span>
              <span className="font-mono text-xs text-dark-100">
                {Math.round(effectiveHP.magic).toLocaleString()}
              </span>
            </div>
            <div
              className="flex items-center justify-between rounded bg-dark-600 px-1.5 border-l-2 border-dmg-true"
              style={{ height: "28px" }}
            >
              <span className="text-xs text-dmg-true">vs True</span>
              <span className="font-mono text-xs text-dark-100">
                {Math.round(effectiveHP.true).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Damage Mix bar */}
      {autoAttack && (
        <div className="flex flex-col gap-2">
          <span className={SECTION_LABEL}>Damage Mix</span>
          <div className="flex h-2 overflow-hidden rounded-full">
            <div className="h-full bg-dmg-physical" style={{ width: "100%" }} />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-dmg-physical">Physical 100%</span>
          </div>
        </div>
      )}

      {/* Time to Kill */}
      {timeToKill && autoAttack && (
        <div className="flex flex-col gap-2">
          <span className={SECTION_LABEL}>Time to Kill</span>
          <p className="font-mono text-2xl font-bold text-gold-300">
            {Number.isFinite(timeToKill.autoOnly)
              ? `${timeToKill.autoOnly.toFixed(1)}s`
              : "—"}
          </p>
          {/* TTK stat cards */}
          <div className="grid grid-cols-4 gap-1">
            <div className="flex flex-col items-center rounded bg-dark-600 p-1.5">
              <span className="text-[10px] text-dark-50">DPS</span>
              <span className="font-mono text-xs font-medium text-dark-100">
                {Math.round(autoAttack.dps)}
              </span>
            </div>
            <div className="flex flex-col items-center rounded bg-dark-600 p-1.5">
              <span className="text-[10px] text-dark-50">Per Hit</span>
              <span className="font-mono text-xs font-medium text-dark-100">
                {Math.round(autoAttack.final)}
              </span>
            </div>
            <div className="flex flex-col items-center rounded bg-dark-600 p-1.5">
              <span className="text-[10px] text-dark-50">Atk Spd</span>
              <span className="font-mono text-xs font-medium text-dark-100">
                {stats ? stats.attackSpeed.toFixed(2) : "—"}
              </span>
            </div>
            <div className="flex flex-col items-center rounded bg-dark-600 p-1.5">
              <span className="text-[10px] text-dark-50">Hits</span>
              <span className="font-mono text-xs font-medium text-dark-100">
                {Number.isFinite(timeToKill.autoOnly) && stats
                  ? Math.ceil(timeToKill.autoOnly * stats.attackSpeed)
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
