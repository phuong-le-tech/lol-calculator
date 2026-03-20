import type {
  Champion,
  ChampionBaseStats,
  AttackType,
  Ability,
  AbilityKey,
  AbilityScaling,
  DamageType,
  ScalingType,
  Item,
  ItemStats,
} from "@lol-sim/types";
import type {
  MerakiChampion,
  MerakiAbility,
  MerakiModifier,
  MerakiItem,
  MerakiItemStatBlock,
  DataClient,
} from "./client";

const ABILITY_KEYS: AbilityKey[] = ["P", "Q", "W", "E", "R"];

interface DamageCandidate {
  baseDamage: number[];
  scalings: AbilityScaling[];
  priority: number; // lower = better
}

// ── Champion Normalization ──────────────────────────────

/**
 * Normalize a Meraki champion into our schema.
 * Uses Meraki for stats + structured ability data,
 * Data Dragon for versioned image URLs.
 */
export function normalizeChampion(
  raw: MerakiChampion,
  version: string,
  client: DataClient
): Champion {
  const baseStats: ChampionBaseStats = {
    hp: raw.stats.health.flat,
    hpGrowth: raw.stats.health.perLevel,
    mp: raw.stats.mana.flat,
    mpGrowth: raw.stats.mana.perLevel,
    ad: raw.stats.attackDamage.flat,
    adGrowth: raw.stats.attackDamage.perLevel,
    armor: raw.stats.armor.flat,
    armorGrowth: raw.stats.armor.perLevel,
    mr: raw.stats.magicResistance.flat,
    mrGrowth: raw.stats.magicResistance.perLevel,
    attackSpeed: raw.stats.attackSpeed.flat,
    attackSpeedRatio: raw.stats.attackSpeedRatio.flat,
    attackSpeedGrowth: raw.stats.attackSpeed.perLevel,
    moveSpeed: raw.stats.movespeed.flat,
    range: raw.stats.attackRange.flat,
  };

  const abilities: Ability[] = [];

  for (const key of ABILITY_KEYS) {
    const abilityList = raw.abilities[key];
    if (abilityList && abilityList.length > 0) {
      abilities.push(
        normalizeMerakiAbility(abilityList[0], key, raw.key, version, client)
      );
    }
  }

  return {
    riotId: raw.key, // e.g. "Jinx"
    name: raw.name,
    title: raw.title,
    role: raw.roles[0] || raw.positions[0] || "Unknown",
    attackType: raw.attackType as AttackType,
    imageUrl: client.getChampionImageUrl(version, raw.key),
    patchId: version,
    baseStats,
    abilities,
  };
}

function normalizeMerakiAbility(
  raw: MerakiAbility,
  key: AbilityKey,
  championKey: string,
  version: string,
  client: DataClient
): Ability {
  const maxRank = key === "P" ? 1 : key === "R" ? 3 : 5;

  // Extract base damage and scalings from leveling data
  const { baseDamage, scalings, damageType } = extractDamageData(raw, key, maxRank);

  // Extract cooldown
  const cooldown = extractModifierValues(raw.cooldown?.modifiers, maxRank);

  // Extract cost
  const cost = extractModifierValues(raw.cost?.modifiers, maxRank);

  // Meraki icon field is a full Community Dragon URL — use it directly.
  // Fall back to champion portrait if missing.
  const imageUrl = raw.icon || client.getChampionImageUrl(version, championKey);

  return {
    key,
    name: raw.name,
    description: raw.effects[0]?.description || "",
    imageUrl,
    maxRank,
    baseDamage,
    damageType,
    scalings,
    cooldown,
    cost,
  };
}

/**
 * Extract base damage values, scaling ratios, and damage type
 * from Meraki's structured leveling data.
 *
 * Meraki structure:
 *   effects[].leveling[] → each has { attribute, modifiers[] }
 *   Each modifier has { values: number[], units: string[] }
 *
 * We look for the first leveling entry that contains "Damage" in its attribute
 * name. The first modifier (no unit) is base damage, subsequent modifiers
 * with units like "% AP", "% AD" are scalings.
 */
function extractDamageData(
  raw: MerakiAbility,
  key: AbilityKey,
  maxRank: number
): {
  baseDamage: number[];
  scalings: AbilityScaling[];
  damageType: DamageType;
} {
  const scalings: AbilityScaling[] = [];
  let baseDamage: number[] = new Array(maxRank).fill(0);

  // Determine damage type from Meraki's damageType field
  let damageType: DamageType = "magic"; // default
  if (raw.damageType === "PHYSICAL_DAMAGE") {
    damageType = "physical";
  } else if (raw.damageType === "MAGIC_DAMAGE") {
    damageType = "magic";
  } else if (raw.damageType === null) {
    // null can mean true damage or no damage — check description
    const desc = raw.effects[0]?.description?.toLowerCase() || "";
    if (desc.includes("true damage")) {
      damageType = "true";
    }
  }

  // Passive abilities typically don't have rankable damage
  if (key === "P") {
    return { baseDamage: [0], scalings: [], damageType };
  }

  // Search through effects for damage-related leveling data.
  // Collect all candidates and prioritize "total damage" over "bonus damage".
  const candidates: DamageCandidate[] = [];

  for (const effect of raw.effects) {
    for (const leveling of effect.leveling) {
      const attr = leveling.attribute.toLowerCase();

      const isDamageAttr =
        attr.includes("damage") ||
        attr.includes("total damage") ||
        attr.includes("bonus damage");

      if (!isDamageAttr) continue;

      let candidateBase: number[] = new Array(maxRank).fill(0);
      const candidateScalings: AbilityScaling[] = [];

      for (const modifier of leveling.modifiers) {
        if (!modifier.values || modifier.values.length === 0) continue;

        const unit = (modifier.units[0] || "").trim();

        if (unit === "" || unit === " ") {
          candidateBase = modifier.values.slice(0, maxRank);
        } else {
          const scalingType = parseScalingUnit(unit);
          if (scalingType) {
            candidateScalings.push({
              type: scalingType,
              values: modifier.values.slice(0, maxRank).map((v) => v / 100),
            });
          }
        }
      }

      if (candidateBase.some((d) => d > 0) || candidateScalings.length > 0) {
        // Prioritize: "total damage" (0) > "damage" (1) > "bonus damage" (2)
        let priority = 1;
        if (attr.includes("total damage")) priority = 0;
        else if (attr.includes("bonus damage")) priority = 2;

        candidates.push({
          baseDamage: candidateBase,
          scalings: candidateScalings,
          priority,
        });
      }
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => a.priority - b.priority);
    const best = candidates[0];
    return { baseDamage: best.baseDamage, scalings: best.scalings, damageType };
  }

  return { baseDamage, scalings, damageType };
}

/** Parse Meraki unit strings like "% AP", "% AD", "% bonus AD" into ScalingType */
function parseScalingUnit(unit: string): ScalingType | null {
  const u = unit.toLowerCase().trim();

  if (u === "% ap") return "ap";
  if (u === "% ad") return "ad";
  if (u === "% bonus ad") return "bonusAd";
  if (u === "% bonus health") return "bonusHp";
  if (u === "% max health" || u === "% maximum health") return "maxHp";
  if (u === "% armor") return "armor";
  if (u === "% magic resistance" || u === "% mr") return "mr";
  if (u === "% target's max health" || u === "% of target's maximum health") return "targetMaxHp";
  if (u === "% target's current health" || u === "% of target's current health") return "targetCurrentHp";
  if (u === "% target's missing health" || u === "% of target's missing health") return "targetMissingHp";
  if (u === "% total ad") return "ad";
  if (u === "% total ap") return "ap";

  // Fallback: check for partial matches
  if (u.includes("bonus ad")) return "bonusAd";
  if (u.includes("ap")) return "ap";
  if (u.includes("ad")) return "ad";
  if (u.includes("bonus health") || u.includes("bonus hp")) return "bonusHp";
  if (u.includes("max health") || u.includes("maximum health")) return "maxHp";
  if (u.includes("armor")) return "armor";
  if (u.includes("magic res")) return "mr";

  if (u !== "") {
    console.warn(`[ddragon] Unknown ability scaling unit: "${unit}" — damage coefficient will be ignored`);
  }
  return null;
}

/** Extract flat values from Meraki modifier arrays, padded to maxRank */
function extractModifierValues(
  modifiers: MerakiModifier[] | undefined,
  maxRank: number
): number[] {
  if (!modifiers || modifiers.length === 0) {
    return new Array(maxRank).fill(0);
  }
  // Take the first modifier's values, pad if shorter than maxRank
  const values = modifiers[0].values.slice(0, maxRank);
  while (values.length < maxRank) {
    values.push(values.length > 0 ? values[values.length - 1] : 0);
  }
  return values;
}

// ── Item Normalization ──────────────────────────────────

/** Mapping from Meraki stat keys to our ItemStats keys */
const MERAKI_STAT_MAPPING: Record<string, keyof ItemStats> = {
  attackDamage: "ad",
  abilityPower: "ap",
  health: "hp",
  mana: "mana",
  armor: "armor",
  magicResistance: "mr",
  attackSpeed: "attackSpeed",
  criticalStrikeChance: "critChance",
  lethality: "lethality",
  armorPenetration: "armorPen",
  magicPenetration: "magicPen",
  abilityHaste: "abilityHaste",
  lifeSteal: "lifeSteal",
  movespeed: "moveSpeed",
  omnivamp: "omnivamp",
};

/** Fields where Meraki stores the value as flat percentage (0-100) */
const PERCENT_STAT_FIELDS = new Set([
  "attackSpeed",
  "criticalStrikeChance",
  "lifeSteal",
  "armorPenetration",
  "magicPenetration",
  "omnivamp",
]);

function categorizeItem(tags: string[]): Item["category"] {
  if (tags.includes("Damage")) return "damage";
  if (tags.includes("SpellDamage")) return "magic";
  if (
    tags.includes("Defense") ||
    tags.includes("Health") ||
    tags.includes("Armor") ||
    tags.includes("SpellBlock")
  )
    return "defense";
  if (tags.includes("AttackSpeed")) return "attack_speed";
  if (tags.includes("Boots")) return "boots";
  return "other";
}

/**
 * Normalize a Meraki item into our schema.
 * Meraki provides structured stats with flat/percent/perLevel
 * and proper lethality, ability haste, and pen values.
 */
export function normalizeItem(
  raw: MerakiItem,
  version: string,
  client: DataClient
): Item {
  const stats: ItemStats = {};

  // Collect all stat sources: base stats + passive stats
  const allStatSources: Record<string, MerakiItemStatBlock>[] = [raw.stats];

  // Include stats from passives (many items list stats like AP, AD under passives)
  for (const passive of raw.passives) {
    if (passive.stats) {
      allStatSources.push(passive.stats);
    }
  }

  for (const statSource of allStatSources) {
    for (const [rawKey, statBlock] of Object.entries(statSource)) {
      const mappedKey = MERAKI_STAT_MAPPING[rawKey];
      if (!mappedKey || !statBlock) continue;

      // Use flat value for most stats
      let value = statBlock.flat;

      // Some stats use percent field instead of flat (like armorPen is % pen)
      if (PERCENT_STAT_FIELDS.has(rawKey) && statBlock.percent !== 0) {
        value = statBlock.percent;
      }

      // For magic pen, check both flat and percent
      if (rawKey === "magicPenetration") {
        if (statBlock.flat !== 0) {
          stats.magicPen = (stats.magicPen || 0) + statBlock.flat;
        }
        if (statBlock.percent !== 0) {
          stats.magicPenPercent = (stats.magicPenPercent || 0) + statBlock.percent;
        }
        continue;
      }

      // For armor pen, it's always % pen in the game now
      if (rawKey === "armorPenetration") {
        if (statBlock.percent !== 0) {
          stats.armorPen = (stats.armorPen || 0) + statBlock.percent;
        }
        continue;
      }

      if (value !== 0) {
        stats[mappedKey] = ((stats[mappedKey] as number) || 0) + value;
      }
    }
  }

  // Determine if completed: tier 3+ or no buildsInto
  const isCompleted =
    raw.tier >= 3 || (raw.buildsInto.length === 0 && raw.tier >= 2);

  return {
    riotId: raw.id,
    name: raw.name,
    description: raw.simpleDescription || "",
    imageUrl: client.getItemImageUrl(version, raw.id),
    cost: raw.shop.prices.total,
    category: categorizeItem(raw.shop.tags),
    stats,
    isCompleted,
    patchId: version,
  };
}
