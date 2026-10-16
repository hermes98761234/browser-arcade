// Stacking logic: classic slab cutting, and a tiny static-stability model for the balance mode
// (a block group topples when its centre of mass leaves the contact area under it).

// ---------- classic slab stack ----------

export interface Slab {
  x: number
  w: number
}

export interface CutResult {
  /** Remaining slab (null when missed entirely). */
  slab: Slab | null
  /** Cut-off overhang, if any. */
  chop: Slab | null
  perfect: boolean
}

/** Drops `cur` on `below`. Within `tol` of aligned counts as perfect (snaps to below). */
export function cutSlab(below: Slab, cur: Slab, tol = 3): CutResult {
  const dx = cur.x - below.x
  if (Math.abs(dx) <= tol) return { slab: { x: below.x, w: below.w }, chop: null, perfect: true }
  const left = Math.max(cur.x, below.x)
  const right = Math.min(cur.x + cur.w, below.x + below.w)
  if (right <= left) return { slab: null, chop: { ...cur }, perfect: false }
  const slab = { x: left, w: right - left }
  const chop = dx > 0 ? { x: right, w: cur.x + cur.w - right } : { x: cur.x, w: left - cur.x }
  return { slab, chop, perfect: false }
}

// ---------- balance mode ----------

export interface Blk {
  id: number
  /** Left edge and bottom edge (y grows upward, platform top is y = 0). */
  x: number
  y: number
  w: number
  h: number
}

export interface Platform {
  x0: number
  x1: number
}

const mass = (b: Blk) => b.w * b.h
export const topOf = (b: Blk) => b.y + b.h
const EPS = 0.75

/** Blocks (and/or the platform, as null) directly holding b up. */
export function supporters(blocks: Blk[], plat: Platform, b: Blk): { blocks: Blk[]; platform: boolean } {
  const out: Blk[] = []
  for (const o of blocks) {
    if (o.id === b.id) continue
    if (Math.abs(topOf(o) - b.y) < EPS && Math.min(o.x + o.w, b.x + b.w) - Math.max(o.x, b.x) > 0.5) out.push(o)
  }
  const platform = Math.abs(b.y) < EPS && Math.min(plat.x1, b.x + b.w) - Math.max(plat.x0, b.x) > 0.5
  return { blocks: out, platform }
}

/** Where does a block of width w landing at left edge x settle? Returns its bottom y. */
export function landingY(blocks: Blk[], plat: Platform, x: number, w: number): number {
  let y = -Infinity
  if (Math.min(plat.x1, x + w) - Math.max(plat.x0, x) > 0.5) y = 0
  for (const o of blocks) if (Math.min(o.x + o.w, x + w) - Math.max(o.x, x) > 0.5) y = Math.max(y, topOf(o))
  return y
}

/** b plus everything that (transitively) rests on it. */
export function groupOf(blocks: Blk[], plat: Platform, b: Blk): Blk[] {
  const out = [b]
  const ids = new Set([b.id])
  for (let i = 0; i < out.length; i++) {
    for (const o of blocks) {
      if (ids.has(o.id)) continue
      if (supporters(blocks, plat, o).blocks.some((s) => s.id === out[i].id)) {
        ids.add(o.id)
        out.push(o)
      }
    }
  }
  return out
}

export interface Stability {
  /** COM offset from contact centre divided by half the contact width (>= 1 means toppling). */
  ratio: number
  dir: 1 | -1
}

/** Stability of b with everything above it, relative to what supports b. */
export function stabilityOf(blocks: Blk[], plat: Platform, b: Blk, grip = 0): Stability {
  const sup = supporters(blocks, plat, b)
  let lo = Infinity
  let hi = -Infinity
  for (const s of sup.blocks) {
    lo = Math.min(lo, Math.max(s.x, b.x))
    hi = Math.max(hi, Math.min(s.x + s.w, b.x + b.w))
  }
  if (sup.platform) {
    lo = Math.min(lo, Math.max(plat.x0, b.x))
    hi = Math.max(hi, Math.min(plat.x1, b.x + b.w))
  }
  const g = groupOf(blocks, plat, b)
  const m = g.reduce((s, o) => s + mass(o), 0)
  const com = g.reduce((s, o) => s + mass(o) * (o.x + o.w / 2), 0) / m
  const c = (lo + hi) / 2
  const half = Math.max(0.001, (hi - lo) / 2 - grip)
  return { ratio: Math.abs(com - c) / half, dir: com >= c ? 1 : -1 }
}

/** The lowest block whose group is unstable (its whole group topples), or null. */
export function findToppling(blocks: Blk[], plat: Platform, grip = 0): { block: Blk; dir: 1 | -1 } | null {
  let best: { block: Blk; dir: 1 | -1 } | null = null
  for (const b of blocks) {
    const s = stabilityOf(blocks, plat, b, grip)
    if (s.ratio > 1 && (!best || b.y < best.block.y)) best = { block: b, dir: s.dir }
  }
  return best
}
