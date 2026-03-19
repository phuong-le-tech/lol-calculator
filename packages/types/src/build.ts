import type { ComboStep } from "./simulation";

export const MAX_NOTES_LENGTH = 5000;

const ENTITY_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};
const ESCAPE_RE = /[&<>"']/g;

/**
 * Escape special HTML characters to prevent XSS.
 * Uses entity-encoding only (no regex-based tag stripping).
 * In React, prefer rendering notes as `{notes}` which auto-escapes.
 * Use this function for non-React rendering contexts (e.g. API responses, emails).
 */
export function sanitizeNotes(raw: string): string {
  const truncated = raw.slice(0, MAX_NOTES_LENGTH);
  return truncated.replace(ESCAPE_RE, (ch) => ENTITY_MAP[ch] || ch);
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const MAX_SLUG_LENGTH = 32;

/** Validate a build slug: lowercase alphanumeric and hyphens only, max 32 chars. */
export function validateSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= MAX_SLUG_LENGTH && SLUG_RE.test(slug);
}

export interface SavedBuild {
  id: string;
  name: string;
  slug: string;
  userId: string;
  championRiotId: string;
  level: number;
  itemRiotIds: number[];
  abilityRanks: Record<string, number>;
  target: {
    mode: "custom" | "champion";
    hp: number;
    armor: number;
    mr: number;
    championRiotId?: string;
    level?: number;
  };
  combo: ComboStep[];
  /** Free-form text. MUST be sanitized (strip HTML) before rendering to prevent XSS. */
  notes?: string;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}
