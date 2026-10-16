// Sokoban logic: movement rules (with optional ice), a BFS solver and a generator that builds levels by
// reverse-pulling boxes away from their goals, so every generated level is solvable by construction.
import type { Rng } from '../kit'

export const SDIR = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
] as const

export interface Room {
  w: number
  h: number
  /** 1 = wall. */
  wall: Uint8Array
  /** 1 = ice (the player keeps sliding over free ice). */
  ice: Uint8Array
}

export interface Sok extends Room {
  goals: number[]
  boxes: number[]
  player: number
  /** Direction indices (SDIR) that solve the level when ice is off. */
  solution: number[]
}

export interface MoveResult {
  boxes: number[]
  player: number
  pushed: boolean
}

const step = (r: Room, c: number, d: number): number => {
  const x = (c % r.w) + SDIR[d].dx
  const y = ((c / r.w) | 0) + SDIR[d].dy
  return x < 0 || y < 0 || x >= r.w || y >= r.h ? -1 : y * r.w + x
}

/** One player move. Returns null when blocked. */
export function move(r: Room, boxes: number[], player: number, d: number): MoveResult | null {
  const n = step(r, player, d)
  if (n < 0 || r.wall[n]) return null
  let bx = boxes
  let pushed = false
  const bi = boxes.indexOf(n)
  if (bi >= 0) {
    const t = step(r, n, d)
    if (t < 0 || r.wall[t] || boxes.includes(t)) return null
    bx = boxes.slice()
    bx[bi] = t
    pushed = true
  }
  let p = n
  while (r.ice[p]) {
    const q = step(r, p, d)
    if (q < 0 || r.wall[q] || bx.includes(q)) break
    p = q
  }
  return { boxes: bx, player: p, pushed }
}

export const isSolved = (goals: number[], boxes: number[]) => boxes.every((b) => goals.includes(b))

/** BFS solver. Returns the move list, or null if none within the state cap. */
export function solve(r: Room, goals: number[], boxes: number[], player: number, cap = 150000): number[] | null {
  const key = (p: number, b: number[]) => `${p}|${b.slice().sort((a, c) => a - c).join(',')}`
  const prev = new Map<string, { from: string; d: number }>()
  const start = key(player, boxes)
  prev.set(start, { from: '', d: -1 })
  let q: [number, number[]][] = [[player, boxes]]
  if (isSolved(goals, boxes)) return []
  while (q.length && prev.size < cap) {
    const next: [number, number[]][] = []
    for (const [p, b] of q) {
      const k = key(p, b)
      for (let d = 0; d < 4; d++) {
        const m = move(r, b, p, d)
        if (!m) continue
        const nk = key(m.player, m.boxes)
        if (prev.has(nk)) continue
        prev.set(nk, { from: k, d })
        if (isSolved(goals, m.boxes)) {
          const out: number[] = []
          let cur = nk
          while (cur !== start) {
            const e = prev.get(cur)!
            out.push(e.d)
            cur = e.from
          }
          return out.reverse()
        }
        next.push([m.player, m.boxes])
      }
    }
    q = next
  }
  return null
}

/** Replays moves from a level; returns true if the final position has every box on a goal. */
export function replay(l: Sok, moves: number[]): boolean {
  let boxes = l.boxes
  let p = l.player
  for (const d of moves) {
    const m = move(l, boxes, p, d)
    if (!m) return false
    boxes = m.boxes
    p = m.player
  }
  return isSolved(l.goals, boxes)
}

function floorConnected(w: number, h: number, wall: Uint8Array): boolean {
  let start = -1
  let total = 0
  for (let i = 0; i < w * h; i++) if (!wall[i]) {
    total++
    if (start < 0) start = i
  }
  const seen = new Set([start])
  const q = [start]
  for (let i = 0; i < q.length; i++) {
    for (let d = 0; d < 4; d++) {
      const x = (q[i] % w) + SDIR[d].dx
      const y = ((q[i] / w) | 0) + SDIR[d].dy
      const n = y * w + x
      if (x >= 0 && y >= 0 && x < w && y < h && !wall[n] && !seen.has(n)) {
        seen.add(n)
        q.push(n)
      }
    }
  }
  return seen.size === total
}

export interface GenOpts {
  w: number
  h: number
  boxes: number
  ice?: boolean
}

export function genSokoban(rng: Rng, o: GenOpts): Sok {
  const { w, h } = o
  let best: Sok | null = null
  for (let attempt = 0; attempt < 120; attempt++) {
    const wall = new Uint8Array(w * h)
    for (let i = 0; i < w * h; i++) {
      const x = i % w
      const y = (i / w) | 0
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) wall[i] = 1
    }
    const inner = (w - 2) * (h - 2)
    const nw = Math.floor(inner * rng.range(0.05, 0.14))
    for (let i = 0; i < nw; i++) wall[rng.int(1, h - 2) * w + rng.int(1, w - 2)] = 1
    if (!floorConnected(w, h, wall)) continue
    const room: Room = { w, h, wall, ice: new Uint8Array(w * h) }
    const floor: number[] = []
    for (let i = 0; i < w * h; i++) if (!wall[i]) floor.push(i)
    if (floor.length < o.boxes * 3 + 4) continue
    rng.shuffle(floor)
    const goals = floor.slice(0, o.boxes)
    const boxes = goals.slice()
    let player = floor[o.boxes]
    const rev: number[] = []
    let pulls = 0
    const wantPulls = o.boxes * 6 + 4
    for (let s = 0; s < 400 + o.boxes * 150 && pulls < wantPulls; s++) {
      const d = rng.int(0, 3)
      const n = step(room, player, d)
      if (n < 0 || wall[n] || boxes.includes(n)) continue
      const back = step(room, player, (d + 2) % 4)
      const bi = back >= 0 ? boxes.indexOf(back) : -1
      if (bi >= 0 && rng.chance(0.7)) {
        boxes[bi] = player
        pulls++
      }
      player = n
      rev.push((d + 2) % 4)
    }
    const off = boxes.filter((b) => !goals.includes(b)).length
    if (off < Math.max(1, o.boxes - 1)) continue
    const lvl: Sok = { ...room, goals, boxes, player, solution: rev.reverse() }
    if (!replay(lvl, lvl.solution)) continue
    best = lvl
    break
  }
  if (!best) {
    // Trivial fallback: one box one push from its goal in an open room.
    const wall = new Uint8Array(w * h)
    for (let i = 0; i < w * h; i++) {
      const x = i % w
      const y = (i / w) | 0
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) wall[i] = 1
    }
    best = { w, h, wall, ice: new Uint8Array(w * h), goals: [2 * w + 4], boxes: [2 * w + 3], player: 2 * w + 2, solution: [1] }
  }
  if (o.ice) {
    for (let t = 0; t < 5; t++) {
      const ice = new Uint8Array(w * h)
      const p = 0.4 - t * 0.06
      for (let i = 0; i < w * h; i++) if (!best.wall[i] && !best.goals.includes(i) && rng.chance(p)) ice[i] = 1
      if (ice[best.player]) ice[best.player] = 0
      const cand: Sok = { ...best, ice }
      const sol = solve(cand, cand.goals, cand.boxes, cand.player, 40000)
      if (sol && sol.length > 0) return { ...cand, solution: sol }
    }
  }
  return best
}
