export interface Target {
  mode: "custom" | "champion";
  hp: number;
  armor: number;
  mr: number;
  /** If mode === "champion" */
  championRiotId?: string;
  level?: number;
}
