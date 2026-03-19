const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";
const MERAKI_BASE = "https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US";

const FETCH_TIMEOUT_MS = 15_000;

const ALLOWED_HOSTNAMES = new Set([
  "ddragon.leagueoflegends.com",
  "cdn.merakianalytics.com",
]);

const VERSION_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Champion name allowlist: letters, digits, apostrophes, spaces */
const CHAMPION_NAME_PATTERN = /^[A-Za-z0-9' .]+$/;

/** Safe pattern for IDs used in URL paths (alphanumeric, dots, underscores, hyphens) */
const SAFE_PATH_SEGMENT = /^[A-Za-z0-9._-]+$/;

export interface DataClientOptions {
  /** Override base URL for Data Dragon (images + patch versions) */
  ddragonBaseUrl?: string;
  /** Override base URL for Meraki Analytics (champion + item data) */
  merakiBaseUrl?: string;
  /** Force a specific patch version */
  patchOverride?: string;
}

export class DataClient {
  private ddragonBase: string;
  private merakiBase: string;
  private patchOverride?: string;
  private cachedVersion?: string;
  private cachedVersionAt?: number;

  constructor(options?: DataClientOptions) {
    // Validate overrides are HTTPS and from allowed hostnames before assignment
    if (options?.ddragonBaseUrl) {
      validateBaseUrl(options.ddragonBaseUrl);
    }
    if (options?.merakiBaseUrl) {
      validateBaseUrl(options.merakiBaseUrl);
    }

    this.ddragonBase = options?.ddragonBaseUrl || DDRAGON_BASE;
    this.merakiBase = options?.merakiBaseUrl || MERAKI_BASE;
    this.patchOverride = options?.patchOverride;
  }

  // ── Patch Versions (Data Dragon) ────────────────────────

  /** Get the latest patch version from Data Dragon */
  async getLatestVersion(): Promise<string> {
    if (this.patchOverride) return this.patchOverride;

    // Check cache with TTL
    if (
      this.cachedVersion &&
      this.cachedVersionAt &&
      Date.now() - this.cachedVersionAt < VERSION_CACHE_TTL_MS
    ) {
      return this.cachedVersion;
    }

    const res = await fetchWithTimeout(`${this.ddragonBase}/api/versions.json`);
    if (!res.ok) throw new Error(`Failed to fetch versions: ${res.status}`);

    const data: unknown = await res.json();
    if (!Array.isArray(data) || typeof data[0] !== "string") {
      throw new Error("Unexpected versions payload from Data Dragon");
    }

    this.cachedVersion = data[0];
    this.cachedVersionAt = Date.now();
    return this.cachedVersion;
  }

  /** Invalidate the cached version (call after detecting a new patch) */
  clearVersionCache(): void {
    this.cachedVersion = undefined;
    this.cachedVersionAt = undefined;
  }

  // ── Champion Data (Meraki Analytics) ────────────────────

  /** Fetch all champions with full data from Meraki */
  async getAllChampions(): Promise<Record<string, MerakiChampion>> {
    const res = await fetchWithTimeout(`${this.merakiBase}/champions.json`);
    if (!res.ok) throw new Error(`Failed to fetch champions from Meraki: ${res.status}`);

    const data: unknown = await res.json();
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new Error("Unexpected champions payload from Meraki");
    }

    // Validate that entries have the critical fields we depend on
    const record = data as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      validateMerakiChampion(key, value);
    }

    return data as Record<string, MerakiChampion>;
  }

  /** Fetch a single champion from Meraki */
  async getChampion(name: string): Promise<MerakiChampion> {
    if (!CHAMPION_NAME_PATTERN.test(name)) {
      throw new Error(`Invalid champion name: ${name}`);
    }

    const res = await fetchWithTimeout(
      `${this.merakiBase}/champions/${encodeURIComponent(name)}.json`
    );
    if (!res.ok) throw new Error(`Failed to fetch champion ${name} from Meraki: ${res.status}`);

    const data: unknown = await res.json();
    if (typeof data !== "object" || data === null) {
      throw new Error(`Unexpected champion payload for ${name}`);
    }
    validateMerakiChampion(name, data);
    return data as MerakiChampion;
  }

  // ── Item Data (Meraki Analytics) ────────────────────────

  /** Fetch all items from Meraki */
  async getAllItems(): Promise<Record<string, MerakiItem>> {
    const res = await fetchWithTimeout(`${this.merakiBase}/items.json`);
    if (!res.ok) throw new Error(`Failed to fetch items from Meraki: ${res.status}`);

    const data: unknown = await res.json();
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new Error("Unexpected items payload from Meraki");
    }

    // Validate that entries have the critical fields we depend on
    const items = data as Record<string, unknown>;
    for (const [key, value] of Object.entries(items)) {
      validateMerakiItem(key, value);
    }

    return data as Record<string, MerakiItem>;
  }

  // ── Image URLs (Data Dragon CDN) ────────────────────────

  /** Get champion icon URL from Data Dragon */
  getChampionImageUrl(version: string, championId: string): string {
    validatePathSegment(version, "version");
    validatePathSegment(championId, "championId");
    return `${this.ddragonBase}/cdn/${version}/img/champion/${championId}.png`;
  }

  /** Get item icon URL from Data Dragon */
  getItemImageUrl(version: string, itemId: string | number): string {
    validatePathSegment(version, "version");
    validatePathSegment(String(itemId), "itemId");
    return `${this.ddragonBase}/cdn/${version}/img/item/${itemId}.png`;
  }

  /** Get ability icon URL from Data Dragon */
  getSpellImageUrl(version: string, spellKey: string): string {
    validatePathSegment(version, "version");
    validatePathSegment(spellKey, "spellKey");
    return `${this.ddragonBase}/cdn/${version}/img/spell/${spellKey}.png`;
  }

  /** Get champion splash art URL */
  getSplashUrl(championId: string, skinNum: number = 0): string {
    validatePathSegment(championId, "championId");
    if (!Number.isInteger(skinNum) || skinNum < 0) {
      throw new Error("skinNum must be a non-negative integer");
    }
    return `${this.ddragonBase}/cdn/img/champion/splash/${championId}_${skinNum}.jpg`;
  }
}

// ── Helpers ───────────────────────────────────────────────

function validatePathSegment(value: string, name: string): void {
  if (!SAFE_PATH_SEGMENT.test(value)) {
    throw new Error(`Invalid ${name}: must be alphanumeric (with dots, underscores, hyphens)`);
  }
}

function validateBaseUrl(url: string): void {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") {
    throw new Error(`Base URL must use HTTPS: ${url}`);
  }
  if (!ALLOWED_HOSTNAMES.has(parsed.hostname)) {
    throw new Error(`Base URL hostname not allowed: ${parsed.hostname}`);
  }
}

async function fetchWithTimeout(url: string): Promise<Response> {
  return fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
}

// ── Runtime Validation ────────────────────────────────────

function validateMerakiChampion(key: string, value: unknown): void {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Invalid champion entry "${key}": not an object`);
  }
  const obj = value as Record<string, unknown>;
  if (typeof obj.key !== "string") {
    throw new Error(`Invalid champion "${key}": missing "key" field`);
  }
  if (typeof obj.name !== "string") {
    throw new Error(`Invalid champion "${key}": missing "name" field`);
  }
  if (typeof obj.stats !== "object" || obj.stats === null) {
    throw new Error(`Invalid champion "${key}": missing "stats" object`);
  }
  if (typeof obj.abilities !== "object" || obj.abilities === null) {
    throw new Error(`Invalid champion "${key}": missing "abilities" object`);
  }
}

function validateMerakiItem(key: string, value: unknown): void {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Invalid item entry "${key}": not an object`);
  }
  const obj = value as Record<string, unknown>;
  if (typeof obj.id !== "number") {
    throw new Error(`Invalid item "${key}": missing "id" field`);
  }
  if (typeof obj.name !== "string") {
    throw new Error(`Invalid item "${key}": missing "name" field`);
  }
  if (typeof obj.stats !== "object" || obj.stats === null) {
    throw new Error(`Invalid item "${key}": missing "stats" object`);
  }
}

// ── Meraki Champion Types ─────────────────────────────────

export interface MerakiStatBlock {
  flat: number;
  percent: number;
  perLevel: number;
  percentPerLevel: number;
}

export interface MerakiChampionStats {
  health: MerakiStatBlock;
  healthRegen: MerakiStatBlock;
  mana: MerakiStatBlock;
  manaRegen: MerakiStatBlock;
  armor: MerakiStatBlock;
  magicResistance: MerakiStatBlock;
  attackDamage: MerakiStatBlock;
  movespeed: MerakiStatBlock;
  attackSpeed: MerakiStatBlock;
  attackSpeedRatio: MerakiStatBlock;
  attackRange: MerakiStatBlock;
  criticalStrikeDamage: MerakiStatBlock;
  criticalStrikeDamageModifier: MerakiStatBlock;
}

export interface MerakiModifier {
  values: number[];
  units: string[];
}

export interface MerakiLeveling {
  attribute: string;
  modifiers: MerakiModifier[];
}

export interface MerakiEffect {
  description: string;
  leveling: MerakiLeveling[];
}

export interface MerakiAbility {
  name: string;
  icon: string;
  effects: MerakiEffect[];
  cost: {
    modifiers: MerakiModifier[];
  } | null;
  cooldown: {
    modifiers: MerakiModifier[];
    affectedByCdr: boolean;
  } | null;
  targeting: string;
  affects: string;
  spellshieldable: string | null;
  damageType: "PHYSICAL_DAMAGE" | "MAGIC_DAMAGE" | null;
  notes: string;
  blurb: string | null;
  castTime: string | null;
  targetRange: string | null;
}

export interface MerakiChampion {
  id: number;
  key: string;
  name: string;
  title: string;
  fullName: string;
  icon: string;
  resource: string;
  attackType: "MELEE" | "RANGED";
  adaptiveType: "PHYSICAL_DAMAGE" | "MAGIC_DAMAGE";
  stats: MerakiChampionStats;
  positions: string[];
  roles: string[];
  abilities: {
    P: MerakiAbility[];
    Q: MerakiAbility[];
    W: MerakiAbility[];
    E: MerakiAbility[];
    R: MerakiAbility[];
  };
  releaseDate: string;
  patchLastChanged: string;
  price: { blueEssence: number; rp: number };
}

// ── Meraki Item Types ─────────────────────────────────────

export interface MerakiItemStatBlock {
  flat: number;
  percent: number;
  perLevel: number;
  percentPerLevel: number;
  percentBase: number;
  percentBonus: number;
}

export interface MerakiItemPassive {
  unique: boolean;
  mythic: boolean;
  name: string;
  effects: string;
  range: number | null;
  cooldown: number | null;
  stats?: Record<string, MerakiItemStatBlock>;
}

export interface MerakiItem {
  name: string;
  id: number;
  tier: number;
  rank: string[];
  buildsFrom: number[];
  buildsInto: number[];
  specialRecipe: number;
  noEffects: boolean;
  removed: boolean;
  requiredChampion: string;
  requiredAlly: string;
  icon: string;
  simpleDescription: string;
  nicknames: string[];
  passives: MerakiItemPassive[];
  active: MerakiItemPassive[];
  stats: Record<string, MerakiItemStatBlock>;
  shop: {
    prices: { total: number; combined: number; sell: number };
    purchasable: boolean;
    tags: string[];
  };
  iconOverlay: boolean;
}
