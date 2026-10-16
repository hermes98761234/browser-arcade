// Pure brick-layout generator for the breakout engine.
import type { Rng } from '../kit'

/** 0 = empty, >0 = hits needed, -1 = indestructible. */
export type Cell = number
export const PATTERNS = ['full', 'checker', 'pyramid', 'stripes', 'diamond', 'arch', 'waves', 'scatter'] as const
export type Pattern = (typeof PATTERNS)[number]

function filled(p: Pattern, r: number, c: number, rows: number, cols: number, rng: Rng, phase: number): boolean {
  const mid = (cols - 1) / 2
  const dx = Math.abs(c - mid)
  switch (p) {
    case 'full': return true
    case 'checker': return (r + c) % 2 === 0
    case 'pyramid': return dx <= (r + 1) * (mid / Math.max(1, rows - 1)) + 0.5
    case 'stripes': return r % 2 === 0 || c % 4 === 0
    case 'diamond': return dx + Math.abs(r - (rows - 1) / 2) * (mid / Math.max(1, (rows - 1) / 2)) <= mid + 0.5
    case 'arch': return dx > 1.2 || r < rows - 2 ? (dx + 0.5 > mid * 0.55 || r < 2) : false
    case 'waves': return Math.abs(Math.sin(c * 0.7 + phase) * (rows / 2 - 0.5) + (rows / 2 - 0.5) - r) < 1.6
    case 'scatter': return rng() < 0.7
  }
}

export interface LevelOpts { cols: number; rows: number; level: number; diff: 0 | 1 | 2; indestructible?: boolean }

/** Horizontally symmetric layout (also valid for rings: column = segment). Always has >= 8 destructible bricks. */
export function genLevel(rng: Rng, o: LevelOpts): Cell[][] {
  const pattern = rng.pick(PATTERNS)
  const phase = rng.range(0, 6)
  const maxHits = Math.min(4, 1 + Math.floor((o.level + o.diff) / 2))
  const half = Math.ceil(o.cols / 2)
  const g: Cell[][] = []
  for (let r = 0; r < o.rows; r++) {
    const row: Cell[] = new Array(o.cols).fill(0)
    for (let c = 0; c < half; c++) {
      if (!filled(pattern, r, c, o.rows, o.cols, rng, phase)) continue
      let v = 1
      if (maxHits > 1 && rng.chance(0.12 + 0.07 * o.level + 0.1 * o.diff)) v = rng.int(2, maxHits)
      row[c] = row[o.cols - 1 - c] = v
    }
    g.push(row)
  }
  if (o.indestructible && o.level >= 2) {
    const n = Math.min(2 + o.level, 7)
    for (let i = 0; i < n; i++) {
      const r = rng.int(1, Math.max(1, o.rows - 1))
      const c = rng.int(0, half - 1)
      if (g[r][c] > 0) g[r][c] = g[r][o.cols - 1 - c] = -1
    }
  }
  let alive = 0
  for (const row of g) for (const v of row) if (v > 0) alive++
  for (let r = 0; alive < 8 && r < o.rows; r++)
    for (let c = 0; alive < 8 && c < o.cols; c++) if (g[r][c] <= 0) { g[r][c] = 1; alive++ }
  return g
}

export const countBreakable = (g: Cell[][]) => g.reduce((a, row) => a + row.filter((v) => v > 0).length, 0)
