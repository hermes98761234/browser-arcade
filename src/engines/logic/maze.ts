// Maze logic: perfect maze generation, BFS solving, colour-coded keys and doors, and Flow-style path boards.
import type { Rng } from '../kit'

export const N = 1
export const E = 2
export const S = 4
export const W = 8
export const DIRS = [
  { bit: N, opp: S, dx: 0, dy: -1 },
  { bit: E, opp: W, dx: 1, dy: 0 },
  { bit: S, opp: N, dx: 0, dy: 1 },
  { bit: W, opp: E, dx: -1, dy: 0 },
] as const

export interface Maze {
  w: number
  h: number
  /** Bit set = wall present on that side of the cell. */
  walls: Uint8Array
}

/** Perfect maze via iterative recursive backtracker. */
export function genMaze(w: number, h: number, rng: Rng): Maze {
  const walls = new Uint8Array(w * h).fill(15)
  const seen = new Uint8Array(w * h)
  const stack = [rng.int(0, w * h - 1)]
  seen[stack[0]] = 1
  while (stack.length) {
    const c = stack[stack.length - 1]
    const cx = c % w
    const cy = (c / w) | 0
    const opts = DIRS.filter((d) => {
      const nx = cx + d.dx
      const ny = cy + d.dy
      return nx >= 0 && ny >= 0 && nx < w && ny < h && !seen[ny * w + nx]
    })
    if (!opts.length) {
      stack.pop()
      continue
    }
    const d = rng.pick(opts)
    const n = (cy + d.dy) * w + cx + d.dx
    walls[c] &= ~d.bit
    walls[n] &= ~d.opp
    seen[n] = 1
    stack.push(n)
  }
  return { w, h, walls }
}

/** Neighbour cell indices reachable (no wall) from c. `blocked` optionally forbids edges. */
export function neighbors(m: Maze, c: number, blocked?: (a: number, b: number) => boolean): number[] {
  const out: number[] = []
  const cx = c % m.w
  const cy = (c / m.w) | 0
  for (const d of DIRS) {
    if (m.walls[c] & d.bit) continue
    const n = (cy + d.dy) * m.w + cx + d.dx
    if (blocked && blocked(c, n)) continue
    out.push(n)
  }
  return out
}

export function distances(m: Maze, from: number, blocked?: (a: number, b: number) => boolean): Int32Array {
  const dist = new Int32Array(m.w * m.h).fill(-1)
  dist[from] = 0
  const q = [from]
  for (let i = 0; i < q.length; i++) {
    for (const n of neighbors(m, q[i], blocked)) {
      if (dist[n] < 0) {
        dist[n] = dist[q[i]] + 1
        q.push(n)
      }
    }
  }
  return dist
}

/** Shortest path of cell indices from a to b (inclusive). */
export function solvePath(m: Maze, a: number, b: number): number[] {
  const prev = new Int32Array(m.w * m.h).fill(-1)
  prev[a] = a
  const q = [a]
  for (let i = 0; i < q.length && prev[b] < 0; i++) {
    for (const n of neighbors(m, q[i])) {
      if (prev[n] < 0) {
        prev[n] = q[i]
        q.push(n)
      }
    }
  }
  const path = [b]
  while (path[path.length - 1] !== a) path.push(prev[path[path.length - 1]])
  return path.reverse()
}

export interface Lock {
  /** Door sits on the edge between these two cells. */
  a: number
  b: number
  /** Cell holding the matching key. */
  key: number
}

/** Doors along the start→goal path and matching keys in regions that are reachable before each door. */
export function placeLocks(m: Maze, start: number, goal: number, n: number, rng: Rng): Lock[] {
  const path = solvePath(m, start, goal)
  const count = Math.min(n, Math.floor((path.length - 2) / 3))
  const locks: Lock[] = []
  let prevRegion = new Set<number>([start])
  const used = new Set<number>([start, goal])
  for (let i = 0; i < count; i++) {
    const p = Math.floor(((i + 1) * (path.length - 1)) / (count + 1))
    const a = path[p - 1]
    const b = path[p]
    const blocked = (x: number, y: number) => (x === a && y === b) || (x === b && y === a)
    const d = distances(m, start, blocked)
    const region: number[] = []
    for (let c = 0; c < d.length; c++) if (d[c] >= 0 && !used.has(c)) region.push(c)
    let cand = region.filter((c) => !prevRegion.has(c))
    if (!cand.length) cand = region
    const dead = cand.filter((c) => neighbors(m, c).length === 1)
    const key = rng.pick(dead.length ? dead : cand)
    used.add(key)
    locks.push({ a, b, key })
    prevRegion = new Set(region)
    prevRegion.add(start)
  }
  return locks
}

/** Can the maze be solved collecting keys on the way? (door i needs key i). */
export function solvableWithLocks(m: Maze, locks: Lock[], start: number, goal: number): boolean {
  const seen = new Set<number>()
  const q: [number, number][] = [[start, 0]]
  seen.add(start * 4096)
  for (let i = 0; i < q.length; i++) {
    const [c, mask] = q[i]
    if (c === goal) return true
    for (const n of neighbors(m, c)) {
      const di = locks.findIndex((l) => (l.a === c && l.b === n) || (l.a === n && l.b === c))
      if (di >= 0 && !(mask & (1 << di))) continue
      let nm = mask
      locks.forEach((l, k) => {
        if (l.key === n) nm |= 1 << k
      })
      const id = n * 4096 + nm
      if (!seen.has(id)) {
        seen.add(id)
        q.push([n, nm])
      }
    }
  }
  return false
}

// ---------- Flow-style path boards ----------

export interface Flow {
  w: number
  h: number
  /** Pair endpoints (cell indices). */
  pairs: { a: number; b: number }[]
  /** One valid solution: path of cell indices for each pair. */
  solution: number[][]
}

/** Lay random non-overlapping paths first, then extend them to fill most of the board. */
export function genFlow(w: number, h: number, pairs: number, rng: Rng): Flow {
  const total = w * h
  for (let attempt = 0; attempt < 400; attempt++) {
    const owner = new Int32Array(total).fill(-1)
    const paths: number[][] = []
    const adj = (c: number) => {
      const x = c % w
      const y = (c / w) | 0
      const r: number[] = []
      if (x > 0) r.push(c - 1)
      if (x < w - 1) r.push(c + 1)
      if (y > 0) r.push(c - w)
      if (y < h - 1) r.push(c + w)
      return r
    }
    let ok = true
    for (let p = 0; p < pairs && ok; p++) {
      const free: number[] = []
      for (let c = 0; c < total; c++) if (owner[c] < 0) free.push(c)
      if (!free.length) {
        ok = false
        break
      }
      const path = [rng.pick(free)]
      owner[path[0]] = p
      const target = rng.int(3, Math.max(3, Math.floor(total / pairs)))
      while (path.length < target) {
        const opts = adj(path[path.length - 1]).filter((c) => owner[c] < 0)
        if (!opts.length) break
        const c = rng.pick(opts)
        owner[c] = p
        path.push(c)
      }
      if (path.length < 3) ok = false
      paths.push(path)
    }
    if (!ok) continue
    // Extend ends greedily so the board is mostly covered.
    let changed = true
    while (changed) {
      changed = false
      for (let p = 0; p < pairs; p++) {
        const path = paths[p]
        const end = rng.chance(0.5)
        const tip = end ? path[path.length - 1] : path[0]
        const opts = adj(tip).filter((c) => owner[c] < 0)
        if (opts.length) {
          const c = rng.pick(opts)
          owner[c] = p
          if (end) path.push(c)
          else path.unshift(c)
          changed = true
        }
      }
    }
    const ends = new Set<number>()
    for (const p of paths) {
      ends.add(p[0])
      ends.add(p[p.length - 1])
    }
    if (ends.size !== pairs * 2) continue
    return { w, h, pairs: paths.map((p) => ({ a: p[0], b: p[p.length - 1] })), solution: paths }
  }
  // Fallback: straight rows.
  const paths: number[][] = []
  for (let p = 0; p < pairs; p++) paths.push(Array.from({ length: w }, (_, x) => (p % h) * w + x))
  return { w, h, pairs: paths.map((p) => ({ a: p[0], b: p[p.length - 1] })), solution: paths }
}

/** Validates a set of paths against a flow board: connected, adjacent steps, no shared cells. */
export function validFlowSolution(f: Flow, paths: number[][]): boolean {
  const used = new Set<number>()
  for (let i = 0; i < f.pairs.length; i++) {
    const p = paths[i]
    if (!p || p.length < 2) return false
    const { a, b } = f.pairs[i]
    const ends = [p[0], p[p.length - 1]]
    if (!(ends.includes(a) && ends.includes(b))) return false
    for (let j = 0; j < p.length; j++) {
      if (used.has(p[j])) return false
      used.add(p[j])
      if (j) {
        const dx = Math.abs((p[j] % f.w) - (p[j - 1] % f.w))
        const dy = Math.abs(((p[j] / f.w) | 0) - ((p[j - 1] / f.w) | 0))
        if (dx + dy !== 1) return false
      }
    }
  }
  return true
}
