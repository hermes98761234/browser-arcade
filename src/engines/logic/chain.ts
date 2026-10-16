// Chain-reaction logic: level specs and scoring.
export interface ChainSpec {
  /** Drifting dots on the field. */
  total: number
  /** Dots that must be caught to clear the level. */
  need: number
  /** Blast radius of the player's first explosion and of chained ones. */
  radius: number
  speed: number
  /** Share of dots that are big bombs (when bomb mod is on). */
  bombs: number
}

export const MAX_CHAIN_LEVEL = 12

export function chainSpec(level: number, diff: 0 | 1 | 2): ChainSpec {
  const total = Math.min(70, 8 + level * 4 + (diff === 2 ? 4 : 0))
  const ratio = Math.min(0.85, 0.2 + level * 0.06 + (diff - 1) * 0.04)
  const need = Math.max(1, Math.min(total - 1, Math.round(total * (diff === 0 ? ratio - 0.07 : ratio))))
  return { total, need, radius: diff === 0 ? 52 : diff === 1 ? 46 : 42, speed: 38 + level * 3 + diff * 8, bombs: Math.min(0.25, 0.05 + level * 0.02) }
}

/** Points for the n-th dot caught in a chain (1-based); `combo` makes later ones worth much more. */
export const chainPoints = (n: number, combo: boolean): number => 100 * n * (combo ? 1 + Math.floor(n / 4) : 1)
