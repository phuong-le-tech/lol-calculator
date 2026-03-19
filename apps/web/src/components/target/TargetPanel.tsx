"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useSimulationResult } from "../../hooks/useSimulationResult";
import { TargetViewTabs } from "./TargetViewTabs";
import { DummyTarget } from "./DummyTarget";

export function TargetPanel() {
  const level = useSimulatorStore((s) => s.level);
  const { autoAttack, timeToKill, effectiveHP } = useSimulationResult();

  return (
    <div className="flex flex-col gap-3">
      <TargetViewTabs />
      <DummyTarget />

      {/* Level (mirrors attacker level for dummy) */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">Level</span>
        <span className="text-2xl font-bold text-gold-300">{level}</span>
      </div>

      {/* Runes placeholder */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">Runes</span>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-6 rounded-full bg-dark-300" />
          ))}
        </div>
      </div>

      {/* Effective HP */}
      {effectiveHP && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">
            Effective HP
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="text-dmg-physical">vs Physical</span>
              <span className="text-dark-100">{Math.round(effectiveHP.physical).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dmg-magic">vs Magic</span>
              <span className="text-dark-100">{Math.round(effectiveHP.magic).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dmg-true">vs True</span>
              <span className="text-dark-100">{Math.round(effectiveHP.true).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Damage Mix bar */}
      {autoAttack && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">
            Damage Mix
          </span>
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
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-dark-50">
            Time to Kill
          </span>
          <p className="font-ui text-3xl font-bold text-gold-300">
            {Number.isFinite(timeToKill.autoOnly)
              ? `${timeToKill.autoOnly.toFixed(1)}s`
              : "—"}
          </p>
          <p className="text-xs text-dark-50">
            Auto attacks · {Math.round(autoAttack.dps)} DPS
          </p>
        </div>
      )}
    </div>
  );
}
