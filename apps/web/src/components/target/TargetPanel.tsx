"use client";

import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useSimulationResult } from "../../hooks/useSimulationResult";
import { TargetViewTabs } from "./TargetViewTabs";
import { DummyTarget } from "./DummyTarget";
import { ChampionTarget } from "./ChampionTarget";
import { MonsterTarget } from "./MonsterTarget";

const SECTION_LABEL = "text-[11px] font-semibold uppercase tracking-[1.5px] text-dark-100 font-ui";

export function TargetPanel() {
  const targetMode = useSimulatorStore((s) => s.targetMode);
  const { stats, autoAttack, timeToKill, effectiveHP } = useSimulationResult();

  return (
    <div className="flex flex-col gap-3">
      <span className={SECTION_LABEL}>Target</span>
      <TargetViewTabs />

      {/* Target-specific content */}
      {targetMode === "custom" && <DummyTarget />}
      {targetMode === "champion" && <ChampionTarget />}
      {targetMode === "monster" && <MonsterTarget />}

      {/* Effective HP */}
      {effectiveHP && (
        <div className="flex flex-col gap-2 pt-3">
          <span className={SECTION_LABEL}>Effective HP</span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between rounded bg-[#111827AA] px-2" style={{ height: "28px" }}>
              <span className="text-[13px] text-dark-100">vs Physical</span>
              <span className="font-mono text-sm font-medium text-dmg-physical">
                {Math.round(effectiveHP.physical).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between rounded bg-[#111827AA] px-2" style={{ height: "28px" }}>
              <span className="text-[13px] text-dark-100">vs Magic</span>
              <span className="font-mono text-sm font-medium text-dmg-magic">
                {Math.round(effectiveHP.magic).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between rounded bg-[#111827AA] px-2" style={{ height: "28px" }}>
              <span className="text-[13px] text-dark-100">vs True</span>
              <span className="font-mono text-sm font-medium text-dmg-true">
                {Math.round(effectiveHP.true).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Time to Kill */}
      {timeToKill && autoAttack && (
        <div className="flex flex-col gap-2.5 pt-3">
          <span className={SECTION_LABEL}>Time to Kill</span>
          <p className="font-mono text-4xl font-medium text-gold-100">
            {Number.isFinite(timeToKill.autoOnly)
              ? `${timeToKill.autoOnly.toFixed(1)}s`
              : "—"}
          </p>
          {/* TTK stat cards */}
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded bg-[#111827AA] py-2">
              <span className="font-ui text-[10px] font-semibold uppercase tracking-wider text-dark-100">DPS</span>
              <span className="font-mono text-sm font-medium text-gold-100">
                {Math.round(autoAttack.dps).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded bg-[#111827AA] py-2">
              <span className="font-ui text-[10px] font-semibold uppercase tracking-wider text-dark-100">Per Hit</span>
              <span className="font-mono text-sm font-medium text-gold-100">
                {Math.round(autoAttack.final).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded bg-[#111827AA] py-2">
              <span className="font-ui text-[10px] font-semibold uppercase tracking-wider text-dark-100">Atk Spd</span>
              <span className="font-mono text-sm font-medium text-gold-100">
                {stats ? stats.attackSpeed.toFixed(2) : "—"}
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded bg-[#111827AA] py-2">
              <span className="font-ui text-[10px] font-semibold uppercase tracking-wider text-dark-100">Hits</span>
              <span className="font-mono text-sm font-medium text-gold-100">
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
