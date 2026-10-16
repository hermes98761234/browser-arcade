// Pure 2048 / tier-merge rules. Cells hold a tier (0 = empty, t = 2^t in classic mode).
import type { Rng } from '../kit'

export type Dir = 'left' | 'right' | 'up' | 'down'
export interface Trans { from: number; to: number; merged: boolean }
export interface MoveResult { grid: number[]; gained: number; moved: boolean; trans: Trans[]; maxMerged: number }

/** Move all tiles in a direction. gain(tier) = points for creating that tier. */
export function moveGrid(g: number[], n: number, dir: Dir, gain: (t: number) => number = (t) => 2 ** t): MoveResult {
  const out = new Array(n * n).fill(0)
  const trans: Trans[] = []
  let gained = 0
  let moved = false
  let maxMerged = 0
  for (let line = 0; line < n; line++) {
    // indices of this line ordered from the wall the tiles slide toward
    const idx: number[] = []
    for (let i = 0; i < n; i++) {
      idx.push(dir === 'left' ? line * n + i : dir === 'right' ? line * n + (n - 1 - i) : dir === 'up' ? i * n + line : (n - 1 - i) * n + line)
    }
    const tiles = idx.filter((i) => g[i] > 0)
    let w = 0
    for (let j = 0; j < tiles.length; j++) {
      const a = tiles[j]
      const b = tiles[j + 1]
      const to = idx[w]
      if (b !== undefined && g[a] === g[b]) {
        out[to] = g[a] + 1
        trans.push({ from: a, to, merged: true }, { from: b, to, merged: true })
        gained += gain(g[a] + 1)
        maxMerged = Math.max(maxMerged, g[a] + 1)
        j++
        if (a !== to || b !== to) moved = true
        moved = true
      } else {
        out[to] = g[a]
        trans.push({ from: a, to, merged: false })
        if (a !== to) moved = true
      }
      w++
    }
  }
  return { grid: out, gained, moved, trans, maxMerged }
}

export const canMove = (g: number[], n: number) => (['left', 'right', 'up', 'down'] as Dir[]).some((d) => moveGrid(g, n, d).moved)

/** Add a new tile (tier 1, or tier 2 with probability p2) in a random empty cell; returns its index or -1. */
export function addTile(g: number[], rng: Rng, p2 = 0.1): number {
  const empty: number[] = []
  g.forEach((v, i) => v === 0 && empty.push(i))
  if (!empty.length) return -1
  const i = rng.pick(empty)
  g[i] = rng.chance(p2) ? 2 : 1
  return i
}
