"use client";

import Image from "next/image";
import { useDataStore } from "../../stores/useDataStore";
import { useSimulatorStore } from "../../stores/useSimulatorStore";
import { useSimulationResult } from "../../hooks/useSimulationResult";

export function ChampionHeader() {
  const selectedChampionId = useSimulatorStore((s) => s.selectedChampionId);
  const level = useSimulatorStore((s) => s.level);
  const getChampion = useDataStore((s) => s.getChampion);
  const { stats, autoAttack, timeToKill } = useSimulationResult();
  const customTarget = useSimulatorStore((s) => s.customTarget);

  const champion = selectedChampionId ? getChampion(selectedChampionId) : null;

  if (!champion || !stats) return null;

  const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.riotId}_0.jpg`;

  // Combo HP percentage
  const comboDmg = autoAttack ? autoAttack.final : 0;
  const hpPercent = customTarget.hp > 0 ? Math.min(100, Math.round((comboDmg / customTarget.hp) * 100)) : 0;
  const isLethal = timeToKill && Number.isFinite(timeToKill.autoOnly) && timeToKill.autoOnly < 10;

  return (
    <div className="relative overflow-hidden rounded-xl shadow-lg shadow-gold-300/10">
      {/* Splash art background */}
      <Image
        src={splashUrl}
        alt=""
        fill
        sizes="(max-width: 1200px) 100vw, 800px"
        className="object-cover"
        style={{ objectPosition: "center 20%" }}
        priority
      />
      {/* Dark gradient overlay — heavier at bottom for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1af0] via-[#0a0e1a99] to-[#0a0e1a44]" />

      {/* Content */}
      <div className="relative flex flex-col gap-3 p-5 pt-12">
        {/* Top row: champion info + DPS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Round champion icon */}
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border-2 border-gold-600 shadow-lg shadow-black/40">
              <Image
                src={champion.imageUrl}
                alt={champion.name}
                fill
                sizes="72px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="font-logo text-2xl text-gold-100">{champion.name}</h1>
              <span className="font-ui text-[13px] text-dark-50">
                Level {level} · {champion.role}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-0.5">
            <p className="font-mono text-[40px] font-medium leading-none text-gold-300">
              {autoAttack ? Math.round(autoAttack.dps).toLocaleString() : "—"}
            </p>
            <p className="font-ui text-[10px] font-semibold uppercase tracking-[1.5px] text-dark-50">
              Damage per second
            </p>
          </div>
        </div>

        {/* Damage mix bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-ui text-[10px] font-semibold uppercase tracking-[1.5px] text-dark-50">
              Damage mix
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px]">
                <span className="inline-block h-2 w-2 rounded-full bg-dmg-physical" />
                <span className="text-dark-50">Physical</span>
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <span className="inline-block h-2 w-2 rounded-full bg-dmg-magic" />
                <span className="text-dark-50">Magic</span>
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <span className="inline-block h-2 w-2 rounded-full bg-dmg-true" />
                <span className="text-dark-50">True</span>
              </span>
            </div>
          </div>
          <div className="flex h-7 w-full overflow-hidden rounded-md bg-dark-600/80">
            <div className="h-full bg-dmg-physical transition-all" style={{ width: "100%" }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[13px] text-gold-100">
              {hpPercent}% HP per hit
            </span>
            {isLethal && (
              <span className="rounded bg-red-600 px-2 py-0.5 font-ui text-[11px] font-semibold uppercase tracking-wider text-white">
                Lethal
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
