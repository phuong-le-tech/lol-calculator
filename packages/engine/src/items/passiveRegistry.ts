import type { ItemPassiveDefinition, CombatHook, CombatContext } from "@lol-sim/types";

export class PassiveRegistry {
  private registry = new Map<number, ItemPassiveDefinition>();

  register(passive: ItemPassiveDefinition): void {
    this.registry.set(passive.itemId, passive);
  }

  get(itemId: number): ItemPassiveDefinition | undefined {
    return this.registry.get(itemId);
  }

  getAll(): ItemPassiveDefinition[] {
    return Array.from(this.registry.values());
  }

  /**
   * Apply all passives for a given hook phase.
   * Deep-clones stats to prevent mutation of the caller's object.
   * Returns the (potentially modified) context.
   */
  applyPassives(
    hook: CombatHook,
    equippedItemIds: number[],
    context: CombatContext
  ): CombatContext {
    // Deep-clone stats so passives don't corrupt the caller's object
    const ctx: CombatContext = {
      ...context,
      stats: { ...context.stats },
    };

    for (const itemId of equippedItemIds) {
      const passive = this.registry.get(itemId);
      if (passive && passive.hook === hook) {
        passive.apply(ctx);
      }
    }

    return ctx;
  }

  /** Clear all registered passives (for testing only) */
  clear(): void {
    this.registry.clear();
  }
}

/** Default registry instance — pre-loaded with all built-in passives */
export const defaultRegistry = new PassiveRegistry();

// Legacy function exports that delegate to the default registry
export function registerPassive(passive: ItemPassiveDefinition): void {
  defaultRegistry.register(passive);
}

export function getPassive(itemId: number): ItemPassiveDefinition | undefined {
  return defaultRegistry.get(itemId);
}

export function getAllPassives(): ItemPassiveDefinition[] {
  return defaultRegistry.getAll();
}

export function applyPassives(
  hook: CombatHook,
  equippedItemIds: number[],
  context: CombatContext
): CombatContext {
  return defaultRegistry.applyPassives(hook, equippedItemIds, context);
}
