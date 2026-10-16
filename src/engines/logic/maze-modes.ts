// Maze sub-modes: trace puzzles (fill / knight / turn-right / visit), Euler trails, graph untangling and tour planning.
import type { Rng } from '../kit'

export type TraceKind = 'fill' | 'knight' | 'right' | 'visit'

const ORTH: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0]]
const KNIGHT: [number, number][] = [[1, -2], [2, -1], [2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2]]

export interface Trace {
  kind: TraceKind
  w: number
  h: number
  /** true = blocked cell. */
  wall: boolean[]
  start: number
  /** Exit cell for `right`; -1 otherwise. */
  exit: number
  /** Plant cells for `visit`. */
  plants: number[]
  /** Maximum path length (cells) for `visit`; 0 = unlimited. */
  limit: number
  /** One valid solution path. */
  solution: number[]
}

export const stepsOf = (kind: TraceKind): [number, number][] => (kind === 'knight' ? KNIGHT : ORTH)

/** Randomised Warnsdorff-style self-avoiding walk. */
function walk(rng: Rng, w: number, h: number, kind: TraceKind, len: number, allowed: (c: number) => boolean): number[] {
  const steps = stepsOf(kind)
  const used = new Uint8Array(w * h)
  const degree = (c: number): number => {
    let n = 0
    for (const [dx, dy] of steps) {
      const x = (c % w) + dx
      const y = ((c / w) | 0) + dy
      if (x >= 0 && y >= 0 && x < w && y < h && !used[y * w + x] && allowed(y * w + x)) n++
    }
    return n
  }
  const start = kind === 'knight' ? rng.pick([0, w - 1, w * (h - 1), w * h - 1]) : rng.int(0, w * h - 1)
  const path = [start]
  used[start] = 1
  while (path.length < len) {
    const c = path[path.length - 1]
    const opts: { n: number; d: number }[] = []
    for (const [dx, dy] of steps) {
      const x = (c % w) + dx
      const y = ((c / w) | 0) + dy
      if (x < 0 || y < 0 || x >= w || y >= h) continue
      const d = y * w + x
      if (used[d] || !allowed(d)) continue
      opts.push({ n: degree(d) + rng() * 0.9, d })
    }
    if (!opts.length) break
    opts.sort((a, b) => a.n - b.n)
    // mostly the tightest neighbour (keeps the walk space-filling), sometimes a looser one for variety
    const pick = opts[rng.chance(0.85) ? 0 : Math.min(opts.length - 1, 1)]
    used[pick.d] = 1
    path.push(pick.d)
  }
  return path
}

/** Walk that only goes straight or turns right. */
function rightWalk(rng: Rng, w: number, h: number, len: number): number[] {
  for (let tries = 0; tries < 60; tries++) {
    const used = new Uint8Array(w * h)
    let c = rng.int(0, w * h - 1)
    let dir = rng.int(0, 3)
    const path = [c]
    used[c] = 1
    while (path.length < len) {
      const opts = [dir, (dir + 1) % 4].filter((d) => {
        const x = (c % w) + ORTH[d][0]
        const y = ((c / w) | 0) + ORTH[d][1]
        return x >= 0 && y >= 0 && x < w && y < h && !used[y * w + x]
      })
      if (!opts.length) break
      dir = opts.length === 2 && rng.chance(0.4) ? opts[1] : opts[0]
      c = ((c / w) | 0) * w + (c % w)
      c = (((c / w) | 0) + ORTH[dir][1]) * w + (c % w) + ORTH[dir][0]
      used[c] = 1
      path.push(c)
    }
    if (path.length >= len * 0.8) return path
  }
  return walk(rng, w, h, 'fill', len, () => true)
}

export function genTrace(rng: Rng, kind: TraceKind, level: number, diff: 0 | 1 | 2): Trace {
  const base = Math.min(7, 4 + Math.floor((level - 1) / 2))
  const w = kind === 'knight' ? Math.min(6, 4 + Math.floor((level - 1) / 3)) : base
  const h = w
  let path: number[]
  let wall = new Array<boolean>(w * h).fill(false)
  let plants: number[] = []
  let limit = 0
  if (kind === 'fill' || kind === 'knight') {
    const goal = Math.round(w * h * (kind === 'knight' ? 0.75 : diff === 0 ? 0.7 : 0.85))
    let best: number[] = []
    for (let i = 0; i < 80 && best.length < goal; i++) {
      const p = walk(rng, w, h, kind, w * h, () => true)
      if (p.length > best.length) best = p
    }
    path = best
    const on = new Set(path)
    wall = wall.map((_, i) => !on.has(i))
  } else if (kind === 'right') {
    path = rightWalk(rng, w, h, Math.round(w * h * 0.55))
    const on = new Set(path)
    for (let i = 0; i < w * h; i++) wall[i] = !on.has(i) && rng.chance(0.3)
  } else {
    path = walk(rng, w, h, 'fill', Math.round(w * h * 0.55), () => true)
    const on = new Set(path)
    const near: number[] = []
    for (let i = 0; i < w * h; i++) {
      if (on.has(i)) continue
      const x = i % w
      const y = (i / w) | 0
      if (ORTH.some(([dx, dy]) => on.has((y + dy) * w + x + dx) && x + dx >= 0 && x + dx < w)) near.push(i)
    }
    rng.shuffle(near)
    plants = []
    for (const c of near) {
      if (plants.length >= Math.min(6, 2 + level)) break
      if (plants.every((q) => Math.abs((q % w) - (c % w)) + Math.abs(((q / w) | 0) - ((c / w) | 0)) > 1)) plants.push(c)
    }
    limit = path.length + (diff === 0 ? 6 : diff === 1 ? 3 : 1)
  }
  return { kind, w, h, wall, start: path[0], exit: kind === 'right' ? path[path.length - 1] : -1, plants, limit, solution: path }
}

export const canStep = (t: Trace, a: number, b: number): boolean => {
  if (b < 0 || b >= t.w * t.h || t.wall[b]) return false
  const dx = (b % t.w) - (a % t.w)
  const dy = ((b / t.w) | 0) - ((a / t.w) | 0)
  return stepsOf(t.kind).some(([x, y]) => x === dx && y === dy)
}

/** Direction index (0 up, 1 right, 2 down, 3 left) of an orthogonal step or -1. */
export const dirOf = (w: number, a: number, b: number): number => {
  const dx = (b % w) - (a % w)
  const dy = ((b / w) | 0) - ((a / w) | 0)
  return ORTH.findIndex(([x, y]) => x === dx && y === dy)
}

export function traceWon(t: Trace, path: number[]): boolean {
  if (!path.length || path[0] !== t.start) return false
  const last = path[path.length - 1]
  if (t.kind === 'right') return last === t.exit
  if (t.kind === 'visit') {
    if (path.length > t.limit) return false
    const on = new Set(path)
    return t.plants.every((p) => ORTH.some(([dx, dy]) => on.has(p + dy * t.w + dx) && (p % t.w) + dx >= 0 && (p % t.w) + dx < t.w))
  }
  return path.length === t.wall.filter((x) => !x).length
}

/** Whether `next` may extend `path`. */
export function traceMoveOk(t: Trace, path: number[], next: number): boolean {
  const last = path[path.length - 1]
  if (!canStep(t, last, next) || path.includes(next)) return false
  if (t.kind === 'right' && path.length >= 2) {
    const d0 = dirOf(t.w, path[path.length - 2], last)
    const d1 = dirOf(t.w, last, next)
    if (d1 !== d0 && d1 !== (d0 + 1) % 4) return false
  }
  return true
}

// ---------- Euler trail ----------

export interface Euler {
  nodes: { x: number; y: number }[]
  edges: [number, number][]
  /** An Euler trail as node indices. */
  solution: number[]
}

export function genEuler(rng: Rng, level: number): Euler {
  const w = Math.min(5, 3 + Math.floor(level / 3))
  const h = Math.min(4, 3 + Math.floor(level / 4))
  const target = Math.min(w * (h - 1) + h * (w - 1), 7 + level * 2)
  for (let tries = 0; tries < 40; tries++) {
    const used = new Set<string>()
    let c = rng.int(0, w * h - 1)
    const trail = [c]
    for (;;) {
      const x = c % w
      const y = (c / w) | 0
      const opts: number[] = []
      for (const [dx, dy] of ORTH) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
        const d = ny * w + nx
        if (!used.has(`${Math.min(c, d)}-${Math.max(c, d)}`)) opts.push(d)
      }
      if (!opts.length || used.size >= target) break
      const d = rng.pick(opts)
      used.add(`${Math.min(c, d)}-${Math.max(c, d)}`)
      trail.push(d)
      c = d
    }
    if (used.size < target * 0.8) continue
    const edges = [...used].map((e) => e.split('-').map(Number) as [number, number])
    const ids = [...new Set(edges.flat())]
    const nodes = ids.map((i) => ({ x: i % w, y: (i / w) | 0 }))
    const remap = new Map(ids.map((id, i) => [id, i]))
    return { nodes, edges: edges.map(([a, b]) => [remap.get(a)!, remap.get(b)!]), solution: trail.map((i) => remap.get(i)!) }
  }
  return { nodes: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }], edges: [[0, 1], [1, 2]], solution: [0, 1, 2] }
}

export const edgeIndex = (e: Euler, a: number, b: number): number => e.edges.findIndex(([p, q]) => (p === a && q === b) || (p === b && q === a))

// ---------- untangle ----------

export interface Pt {
  x: number
  y: number
}

const orient = (a: Pt, b: Pt, c: Pt) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
export function segCross(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  const o1 = orient(a, b, c)
  const o2 = orient(a, b, d)
  const o3 = orient(c, d, a)
  const o4 = orient(c, d, b)
  return o1 * o2 < 0 && o3 * o4 < 0
}

export function crossings(pts: Pt[], edges: [number, number][]): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) {
    const [a, b] = edges[i]
    const [c, d] = edges[j]
    if (a === c || a === d || b === c || b === d) continue
    if (segCross(pts[a], pts[b], pts[c], pts[d])) out.push([i, j])
  }
  return out
}

export interface Untangle {
  pts: Pt[]
  edges: [number, number][]
  /** A crossing-free layout. */
  solved: Pt[]
}

/** Planar graph by greedy non-crossing edge insertion, then positions shuffled until it is tangled. */
export function genUntangle(rng: Rng, level: number): Untangle {
  const n = Math.min(14, 6 + level)
  const solved: Pt[] = []
  while (solved.length < n) {
    const p = { x: rng.range(0.06, 0.94), y: rng.range(0.1, 0.9) }
    if (solved.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > 0.16)) solved.push(p)
  }
  const pairs: [number, number, number][] = []
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j, Math.hypot(solved[i].x - solved[j].x, solved[i].y - solved[j].y)])
  pairs.sort((a, b) => a[2] - b[2])
  const edges: [number, number][] = []
  const want = Math.round(n * 1.5)
  for (const [i, j] of pairs) {
    if (edges.length >= want) break
    if (edges.every(([a, b]) => a === i || a === j || b === i || b === j || !segCross(solved[a], solved[b], solved[i], solved[j]))) edges.push([i, j])
  }
  let pts = solved.slice()
  for (let t = 0; t < 40; t++) {
    pts = rng.shuffle(solved.slice())
    if (crossings(pts, edges).length >= Math.max(2, Math.floor(n / 2))) break
  }
  return { pts, edges, solved }
}

// ---------- tour planning ----------

export interface Tour {
  pts: Pt[]
  /** Index of the depot (start). */
  depot: number
  /** Length budget for a closed tour (world units). */
  budget: number
  best: number
}

export const tourLength = (pts: Pt[], order: number[], close: boolean): number => {
  let l = 0
  for (let i = 1; i < order.length; i++) l += Math.hypot(pts[order[i]].x - pts[order[i - 1]].x, pts[order[i]].y - pts[order[i - 1]].y)
  if (close && order.length > 1) l += Math.hypot(pts[order[0]].x - pts[order[order.length - 1]].x, pts[order[0]].y - pts[order[order.length - 1]].y)
  return l
}

/** Nearest neighbour + 2-opt. */
export function bestTour(pts: Pt[], depot: number): { order: number[]; len: number } {
  const left = new Set(pts.map((_, i) => i))
  left.delete(depot)
  const order = [depot]
  while (left.size) {
    const c = order[order.length - 1]
    let b = -1
    let bd = Infinity
    for (const i of left) {
      const d = Math.hypot(pts[i].x - pts[c].x, pts[i].y - pts[c].y)
      if (d < bd) {
        bd = d
        b = i
      }
    }
    order.push(b)
    left.delete(b)
  }
  let improved = true
  while (improved) {
    improved = false
    for (let i = 1; i < order.length - 1; i++) for (let j = i + 1; j < order.length; j++) {
      const cand = [...order.slice(0, i), ...order.slice(i, j + 1).reverse(), ...order.slice(j + 1)]
      if (tourLength(pts, cand, true) < tourLength(pts, order, true) - 1e-9) {
        order.splice(0, order.length, ...cand)
        improved = true
      }
    }
  }
  return { order, len: tourLength(pts, order, true) }
}

export function genTour(rng: Rng, level: number, diff: 0 | 1 | 2): Tour {
  const n = Math.min(14, 5 + level)
  const pts: Pt[] = []
  while (pts.length < n) {
    const p = { x: rng.range(0.05, 0.95), y: rng.range(0.1, 0.92) }
    if (pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > 0.12)) pts.push(p)
  }
  const { len } = bestTour(pts, 0)
  return { pts, depot: 0, best: len, budget: len * (diff === 0 ? 1.4 : diff === 1 ? 1.25 : 1.12) }
}
