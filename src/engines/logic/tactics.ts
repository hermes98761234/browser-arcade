// Pure tactics logic: unit classes, terrain generation, movement ranges, creature types and damage.
import type { Rng } from '../kit'

export type Cls = 'warrior' | 'archer' | 'healer' | 'mage' | 'knight' | 'rogue'
export interface ClsDef { hp: number; atk: number; move: number; rmin: number; rmax: number; icon: string; label: string; cost: number; cd: number }
export const CLS: Record<Cls, ClsDef> = {
  warrior: { hp: 34, atk: 9, move: 3, rmin: 1, rmax: 1, icon: '⚔️', label: 'Warrior', cost: 3, cd: 1 },
  knight: { hp: 48, atk: 7, move: 2, rmin: 1, rmax: 1, icon: '🛡️', label: 'Knight', cost: 4, cd: 1.1 },
  archer: { hp: 20, atk: 8, move: 3, rmin: 2, rmax: 3, icon: '🏹', label: 'Archer', cost: 3, cd: 1 },
  mage: { hp: 18, atk: 10, move: 3, rmin: 2, rmax: 3, icon: '✨', label: 'Mage', cost: 5, cd: 1.3 },
  healer: { hp: 22, atk: 4, move: 3, rmin: 1, rmax: 3, icon: '✚', label: 'Healer', cost: 4, cd: 1.1 },
  rogue: { hp: 18, atk: 11, move: 4, rmin: 1, rmax: 1, icon: '🗡️', label: 'Rogue', cost: 4, cd: 0.8 },
}
export const CLS_LIST = Object.keys(CLS) as Cls[]

/** 0 grass, 1 forest (cover, move cost 2), 2 water (blocked), 3 rock (blocked) */
export type Terrain = 0 | 1 | 2 | 3
export const blockedT = (t: number) => t === 2 || t === 3

export function genTerrain(rng: Rng, cols: number, rows: number, zone: number): Terrain[] {
  const t: Terrain[] = Array(cols * rows).fill(0)
  const axisLong = cols >= rows
  const long = axisLong ? cols : rows
  const inSpawn = (c: number, r: number) => {
    const a = axisLong ? c : r
    return a < zone || a >= long - zone
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (inSpawn(c, r)) { if (rng.chance(0.12)) t[r * cols + c] = 1; continue }
    const v = rng()
    t[r * cols + c] = v < 0.1 ? 2 : v < 0.2 ? 3 : v < 0.38 ? 1 : 0
  }
  // guarantee a walkable corridor between the two spawn zones
  const start = axisLong ? [0, Math.floor(rows / 2)] : [Math.floor(cols / 2), 0]
  const goal = axisLong ? [cols - 1, Math.floor(rows / 2)] : [Math.floor(cols / 2), rows - 1]
  if (!connected(t, cols, rows, start[0], start[1], goal[0], goal[1])) {
    let [x, y] = start
    while (x !== goal[0] || y !== goal[1]) {
      t[y * cols + x] = 0
      if (axisLong) x++; else y++
    }
    t[goal[1] * cols + goal[0]] = 0
  }
  return t
}

export function connected(t: Terrain[], cols: number, rows: number, x0: number, y0: number, x1: number, y1: number): boolean {
  const seen = new Set<number>([y0 * cols + x0])
  const q = [[x0, y0]]
  while (q.length) {
    const [x, y] = q.pop()!
    if (x === x1 && y === y1) return true
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || blockedT(t[ny * cols + nx]) || seen.has(ny * cols + nx)) continue
      seen.add(ny * cols + nx)
      q.push([nx, ny])
    }
  }
  return false
}

/** Dijkstra move range: returns cost map index -> cost for tiles reachable with `move` points. Occupied tiles can't be entered. */
export function reach(t: Terrain[], cols: number, rows: number, from: number, move: number, occupied: Set<number>): Map<number, number> {
  const best = new Map<number, number>([[from, 0]])
  const open = [from]
  while (open.length) {
    open.sort((a, b) => best.get(a)! - best.get(b)!)
    const cur = open.shift()!
    const cc = best.get(cur)!
    const x = cur % cols
    const y = Math.floor(cur / cols)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
      const i = ny * cols + nx
      if (blockedT(t[i]) || occupied.has(i)) continue
      const nc = cc + (t[i] === 1 ? 2 : 1)
      if (nc > move || nc >= (best.get(i) ?? 1e9)) continue
      best.set(i, nc)
      open.push(i)
    }
  }
  return best
}

/** Reconstruct a path (list of tile indices) from `from` to `to` within the move budget. */
export function pathTo(t: Terrain[], cols: number, rows: number, from: number, to: number, move: number, occupied: Set<number>): number[] {
  const cost = reach(t, cols, rows, from, move, occupied)
  if (!cost.has(to)) return []
  const out = [to]
  let cur = to
  while (cur !== from) {
    const x = cur % cols
    const y = Math.floor(cur / cols)
    let next = -1
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
      const i = ny * cols + nx
      const c = cost.get(i)
      if (c !== undefined && c + (t[cur] === 1 ? 2 : 1) === cost.get(cur)) { next = i; break }
    }
    if (next < 0) return []
    out.push(next)
    cur = next
  }
  return out.reverse()
}

export const manhattan = (a: number, b: number, cols: number) => Math.abs((a % cols) - (b % cols)) + Math.abs(Math.floor(a / cols) - Math.floor(b / cols))

// ---------- creatures ----------
export const TYPES = ['fire', 'water', 'plant', 'electric', 'earth', 'air'] as const
export type CType = (typeof TYPES)[number]
export const TYPE_ICON: Record<CType, string> = { fire: '🔥', water: '💧', plant: '🌿', electric: '⚡', earth: '🪨', air: '💨' }
const STRONG: Record<CType, CType[]> = {
  fire: ['plant'], water: ['fire', 'earth'], plant: ['water', 'earth'], electric: ['water', 'air'], earth: ['fire', 'electric'], air: ['plant'],
}
export function typeMult(a: CType, d: CType): number {
  if (STRONG[a].includes(d)) return 2
  if (STRONG[d].includes(a)) return 0.5
  return 1
}

export interface Move { name: string; type: CType | 'normal'; power: number; acc: number; pp: number; heal?: number }
export interface Creature {
  name: string
  emoji: string
  type: CType
  lvl: number
  maxHp: number
  hp: number
  atk: number
  def: number
  spd: number
  moves: Move[]
}

const SYL: Record<CType, string[]> = {
  fire: ['Pyro', 'Ember', 'Blaz', 'Cinder'], water: ['Aqua', 'Tidal', 'Splash', 'Drip'], plant: ['Leaf', 'Sprout', 'Mossy', 'Bloom'],
  electric: ['Zap', 'Volt', 'Spark', 'Jolt'], earth: ['Rock', 'Dusty', 'Pebb', 'Terra'], air: ['Gust', 'Zeph', 'Whirl', 'Puff'],
}
const END = ['ling', 'ix', 'o', 'on', 'ie', 'ar', 'us', 'y']
const MOVES: Record<CType, [string, string]> = {
  fire: ['Flame Jab', 'Inferno'], water: ['Bubble Shot', 'Tidal Wave'], plant: ['Vine Whip', 'Leaf Storm'],
  electric: ['Spark', 'Thunder'], earth: ['Rock Toss', 'Quake'], air: ['Gust', 'Cyclone'],
}

export function genCreature(rng: Rng, emoji: string, lvl: number, type?: CType): Creature {
  const ty = type ?? rng.pick(TYPES)
  const name = rng.pick(SYL[ty]) + rng.pick(END)
  const other = rng.pick(TYPES.filter((x) => x !== ty))
  const maxHp = 34 + lvl * 7 + rng.int(0, 6)
  return {
    name, emoji, type: ty, lvl, maxHp, hp: maxHp,
    atk: 10 + lvl * 2 + rng.int(0, 3), def: 9 + lvl * 1.6 + rng.int(0, 3), spd: 8 + rng.int(0, 10) + lvl,
    moves: [
      { name: MOVES[ty][0], type: ty, power: 50, acc: 100, pp: 18 },
      { name: MOVES[ty][1], type: ty, power: 85, acc: 80, pp: 8 },
      { name: MOVES[other][0], type: other, power: 55, acc: 95, pp: 12 },
      { name: 'Recover', type: 'normal', power: 0, acc: 100, pp: 3, heal: 0.4 },
    ],
  }
}

/** Damage of a move (rand in [0,1)). */
export function moveDamage(a: Creature, d: Creature, m: Move, rand: number): number {
  if (m.power <= 0) return 0
  const mult = m.type === 'normal' ? 1 : typeMult(m.type, d.type)
  const stab = m.type === a.type ? 1.2 : 1
  return Math.max(1, Math.floor(m.power * (a.atk / d.def) * 0.32 * (0.85 + rand * 0.3) * mult * stab))
}
