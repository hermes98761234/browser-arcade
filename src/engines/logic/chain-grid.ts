// Chain grid logic: "atoms" (critical-mass orbs that split into neighbours) and "cross" (bombs that blast their row and column).
import type { Rng } from '../kit'

export type GridKind = 'atoms' | 'cross'

export interface Grid {
  w: number
  h: number
  g: number[]
}

export const mass = (w: number, h: number, i: number): number => {
  const x = i % w
  const y = (i / w) | 0
  return (x > 0 ? 1 : 0) + (x < w - 1 ? 1 : 0) + (y > 0 ? 1 : 0) + (y < h - 1 ? 1 : 0)
}

const nbrs = (w: number, h: number, i: number): number[] => {
  const x = i % w
  const y = (i / w) | 0
  const r: number[] = []
  if (y > 0) r.push(i - w)
  if (x < w - 1) r.push(i + 1)
  if (y < h - 1) r.push(i + w)
  if (x > 0) r.push(i - 1)
  return r
}

/** Cross range: how far (in cells) a bomb blast reaches along its row and column. */
export const CROSS_RANGE = 2

export interface TapResult {
  /** Waves of exploding cells, in order (wave 0 is the tapped cell for cross, or the first overloaded cells for atoms). */
  waves: number[][]
  /** Board snapshot after each wave. */
  snaps: number[][]
  grid: Grid
  ok: boolean
}

export function tap(grid: Grid, kind: GridKind, i: number): TapResult {
  const { w, h } = grid
  const g = grid.g.slice()
  const waves: number[][] = []
  const snaps: number[][] = []
  if (kind === 'cross') {
    if (!g[i]) return { waves, snaps, grid, ok: false }
    let front = [i]
    g[i] = 0
    while (front.length) {
      waves.push(front)
      snaps.push(g.slice())
      const next: number[] = []
      for (const c of front) {
        const cx = c % w
        const cy = (c / w) | 0
        for (let d = 1; d <= CROSS_RANGE; d++) {
          for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) {
            const x = cx + dx
            const y = cy + dy
            if (x < 0 || y < 0 || x >= w || y >= h) continue
            const j = y * w + x
            if (g[j]) {
              g[j] = 0
              next.push(j)
            }
          }
        }
      }
      front = next
    }
    snaps[snaps.length - 1] = g.slice()
    return { waves, snaps, grid: { w, h, g }, ok: true }
  }
  g[i]++
  waves.push([])
  snaps.push(g.slice())
  for (let guard = 0; guard < 400; guard++) {
    const over: number[] = []
    for (let c = 0; c < g.length; c++) if (g[c] >= mass(w, h, c)) over.push(c)
    if (!over.length) break
    for (const c of over) {
      g[c] -= mass(w, h, c)
      for (const n of nbrs(w, h, c)) g[n]++
    }
    waves.push(over)
    snaps.push(g.slice())
  }
  return { waves, snaps, grid: { w, h, g }, ok: true }
}

export const remaining = (grid: Grid): number => grid.g.reduce((a, b) => a + b, 0)
export const cleared = (grid: Grid): boolean => remaining(grid) === 0

/** Randomised greedy run of at most `cap` taps. Returns the fewest orbs left at any point and the taps used to get there. */
export function greedyRun(grid: Grid, kind: GridKind, cap: number, rng?: Rng): { left: number; taps: number; seq: number[] } {
  let cur = grid
  const seq: number[] = []
  let best = { left: remaining(cur), taps: 0, seq: [] as number[] }
  for (let n = 1; n <= cap && best.left > 0; n++) {
    const cand: { r: Grid; s: number; i: number }[] = []
    for (let i = 0; i < cur.g.length; i++) {
      if (kind === 'cross' && !cur.g[i]) continue
      const r = tap(cur, kind, i)
      cand.push({ r: r.grid, s: remaining(r.grid), i })
    }
    if (!cand.length) break
    cand.sort((a, b) => a.s - b.s)
    const pick = cand[rng ? Math.min(cand.length - 1, rng.int(0, 2)) : 0]
    cur = pick.r
    seq.push(pick.i)
    const left = remaining(cur)
    if (left < best.left) best = { left, taps: n, seq: seq.slice() }
  }
  return best
}

/** Best of several runs: fewest orbs left, then fewest taps. */
export function bestRun(grid: Grid, kind: GridKind, cap: number, rng: Rng, runs = 24): { left: number; taps: number; seq: number[] } {
  let best = greedyRun(grid, kind, cap)
  for (let i = 0; i < runs; i++) {
    const r = greedyRun(grid, kind, cap, rng)
    if (r.left < best.left || (r.left === best.left && r.taps < best.taps)) best = r
  }
  return best
}

export interface GridLevel {
  grid: Grid
  /** Tap budget. */
  taps: number
  /** Win when this many orbs (or fewer) are left. 0 = clear the board. */
  goal: number
  /** One tap sequence that reaches the goal. */
  solution: number[]
}

/** Solvable by construction: the goal and budget come from a solver run on the same board. */
export function genGridLevel(rng: Rng, kind: GridKind, level: number, diff: 0 | 1 | 2): GridLevel {
  const size = Math.min(6, 4 + Math.floor((level - 1) / 3))
  const w = size
  const h = size + (level > 4 ? 1 : 0)
  const g: number[] = []
  for (let tries = 0; tries < 20; tries++) {
    g.length = 0
    for (let i = 0; i < w * h; i++) {
      if (kind === 'cross') g.push(rng.chance(0.38 + Math.min(0.2, level * 0.02)) ? 1 : 0)
      else g.push(rng.chance(0.5) ? rng.int(0, mass(w, h, i) - 1) : 0)
    }
    if (remaining({ w, h, g }) < 4) continue
    const grid = { w, h, g: g.slice() }
    if (kind === 'cross') {
      const r = bestRun(grid, kind, 14, rng, 12)
      if (r.left === 0 && r.taps > 0) return { grid, taps: r.taps + (diff === 0 ? 3 : diff === 1 ? 2 : 1), goal: 0, solution: r.seq }
    } else {
      const cap = 3 + Math.floor(level / 3) + (diff === 0 ? 1 : 0)
      const r = bestRun(grid, kind, cap, rng)
      if (r.taps > 0) return { grid, taps: cap, goal: r.left + (diff === 0 ? 3 : diff === 1 ? 1 : 0), solution: r.seq }
    }
  }
  const grid = { w: 4, h: 4, g: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] }
  if (kind === 'cross') return { grid, taps: 4, goal: 0, solution: [0, 15] }
  return { grid, taps: 4, goal: remaining(tap(grid, kind, 0).grid), solution: [0] }
}
