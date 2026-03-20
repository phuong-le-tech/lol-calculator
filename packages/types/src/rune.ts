export interface RuneTree {
  id: number;
  key: string;
  name: string;
  icon: string;
  slots: RuneSlot[];
}

export interface RuneSlot {
  runes: Rune[];
}

export interface Rune {
  id: number;
  key: string;
  name: string;
  icon: string;
  shortDesc: string;
  longDesc: string;
}

export interface StatShard {
  id: number;
  name: string;
  icon: string;
  stats: RuneStats;
}

export interface RuneStats {
  ad?: number;
  ap?: number;
  attackSpeed?: number;
  abilityHaste?: number;
  hp?: number;
  armor?: number;
  mr?: number;
  moveSpeed?: number;
  adaptiveForce?: number;
}

export interface RuneSelection {
  primaryTreeId: number | null;
  keystoneId: number | null;
  primaryRuneIds: [number | null, number | null, number | null];
  secondaryTreeId: number | null;
  secondaryRuneIds: [number | null, number | null];
  statShardIds: [number | null, number | null, number | null];
}
