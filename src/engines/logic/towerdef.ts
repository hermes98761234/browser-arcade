// Pure tower-defense logic: winding path generator and wave composition.
import type { Rng } from '../kit'

export interface Cell { x: number; y: number }

/** A winding left-to-right path of orthogonally connected, unique cells. */
export function genPath(rng: Rng, cols: number, rows: number): Cell[] {
  const xs = [0]
  let x = 0
  while (x < cols - 1) {
    x = Math.min(cols - 1, x + rng.int(3, 4))
    if (cols - 1 - x < 3) x = cols - 1
    xs.push(x)
  }
  const rs = [rng.int(1, rows - 2)]
  for (let i = 1; i < xs.length; i++) {
    const prev = rs[i - 1]
    const opts: number[] = []
    for (let r = 1; r <= rows - 2; r++) if (Math.abs(r - prev) >= 3) opts.push(r)
    rs.push(opts.length ? rng.pick(opts) : prev)
  }
  const out: Cell[] = []
  const push = (c: Cell) => {
    const l = out[out.length - 1]
    if (!l || l.x !== c.x || l.y !== c.y) out.push(c)
  }
  for (let i = 0; i < xs.length - 1; i++) {
    for (let cx = xs[i]; cx <= xs[i + 1]; cx++) push({ x: cx, y: rs[i] })
    const dir = Math.sign(rs[i + 1] - rs[i])
    for (let cy = rs[i]; cy !== rs[i + 1] + dir; cy += dir) push({ x: xs[i + 1], y: cy })
  }
  return out
}

export type FoeKind = 'grunt' | 'runner' | 'tank' | 'swarm' | 'boss'
export interface WaveGroup { kind: FoeKind; count: number }

/** Composition of wave n (1-based) out of total waves. */
export function waveSpec(n: number, total: number, bossMod: boolean): WaveGroup[] {
  const g: WaveGroup[] = [{ kind: 'grunt', count: Math.min(24, 5 + n) }]
  if (n % 3 === 2) g.push({ kind: 'runner', count: 4 + Math.floor(n / 2) })
  if (n >= 4) g.push({ kind: 'tank', count: Math.floor(n / 3) })
  if (n >= 7 && n % 2 === 1) g.push({ kind: 'swarm', count: 10 + n })
  if (n === total || (bossMod && n % 5 === 0)) g.push({ kind: 'boss', count: n === total ? (bossMod ? 2 : 1) : 1 })
  return g
}

export const hpScale = (n: number) => Math.pow(1.17, n - 1)

// ---------------------------------------------------------------- variants
export type TdMode = 'path' | 'lanes' | 'ring' | 'train' | 'maze' | 'reverse'
export interface TdOpts {
  mode: TdMode
  /** Tap two identical towers to merge them into one stronger tower. */
  merge: boolean
  /** Build from a random hand of tower cards. */
  draft: boolean
  /** A hero unit you steer; it shoots and speeds up nearby towers. */
  hero: boolean
  /** Place four-cell tetromino groups of towers. */
  tetro: boolean
  /** Different towers side by side boost each other. */
  synergy: boolean
  /** Spike traps on the path. */
  dungeon: boolean
  /** Slow tower becomes a gravity well that drags foes back. */
  gravity: boolean
  /** Slow tower becomes a bubble that nearly freezes foes. */
  bubble: boolean
}

export function pickTd(info: string): TdOpts {
  const s = info.toLowerCase()
  const mode: TdMode = /reverse rampart|monster rig|play attackers/.test(s) ? 'reverse'
    : /maze maker|build mazes/.test(s) ? 'maze'
      : /spinning citadel|rotating ring|orbital picket|defend planet from orbit/.test(s) ? 'ring'
        : /train track|moving trains/.test(s) ? 'train'
          : /\blanes?\b|garden|gnome|candy castle|jack-o|pumpkin/.test(s) ? 'lanes' : 'path'
  return {
    mode,
    merge: /merge/.test(s),
    draft: /card tower|draw cards|roguelite|draft/.test(s),
    hero: /hero plus|hero unit/.test(s),
    tetro: /tetris|tetromino/.test(s),
    synergy: /weave|combine element/.test(s),
    dungeon: /dungeon|imp workshop|craft traps/.test(s),
    gravity: /gravity well|bend enemy paths/.test(s),
    bubble: /bubble|trap enemies/.test(s),
  }
}

/** Straight lanes (3 when possible) from one board edge to the other. Landscape: left to right; portrait: top to bottom (already x/y in board cells). */
export function lanePaths(cols: number, rows: number, portrait: boolean): Cell[][] {
  const out: Cell[][] = []
  if (!portrait) {
    const n = rows >= 11 ? 3 : 2
    for (let i = 0; i < n; i++) {
      const y = Math.round(((i + 0.5) * rows) / n - 0.5)
      out.push(Array.from({ length: cols }, (_, x) => ({ x, y })))
    }
  } else {
    const n = 3
    for (let i = 0; i < n; i++) {
      const x = Math.round(((i + 0.5) * cols) / n - 0.5)
      out.push(Array.from({ length: rows }, (_, y) => ({ x, y })))
    }
  }
  return out
}

/** Shortest orthogonal path through free cells (BFS), or null when blocked. */
export function bfsPath(cols: number, rows: number, blocked: ReadonlySet<number>, from: Cell, to: Cell): Cell[] | null {
  const id = (c: Cell) => c.y * cols + c.x
  const prev = new Int32Array(cols * rows).fill(-2)
  const q: Cell[] = [from]
  prev[id(from)] = -1
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    if (c.x === to.x && c.y === to.y) {
      const out: Cell[] = []
      for (let i = id(c); i !== -1; i = prev[i]) out.push({ x: i % cols, y: Math.floor(i / cols) })
      return out.reverse()
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = { x: c.x + dx, y: c.y + dy }
      if (n.x < 0 || n.y < 0 || n.x >= cols || n.y >= rows) continue
      const i = id(n)
      if (prev[i] !== -2 || blocked.has(i)) continue
      prev[i] = id(c)
      q.push(n)
    }
  }
  return null
}

export const TETROS: Cell[][] = [
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }],
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
]
/** Rotate a cell group 90 degrees clockwise and normalise it to the origin. */
export function rotateShape(s: Cell[]): Cell[] {
  const r = s.map((c) => ({ x: -c.y, y: c.x }))
  const mx = Math.min(...r.map((c) => c.x))
  const my = Math.min(...r.map((c) => c.y))
  return r.map((c) => ({ x: c.x - mx, y: c.y - my }))
}

/** Tower names per theme keyword (fast, splash, slow, sniper). */
export const TD_NAMES: { re: RegExp; names: [string, string, string, string] }[] = [
  { re: /cell|immun|pathogen|virus/i, names: ['Antibody', 'Macrophage', 'Fever', 'T-Cell'] },
  { re: /firewall|packet|network/i, names: ['Port Filter', 'Packet Bomb', 'Throttle', 'Deep Scan'] },
  { re: /garden|gnome|plant/i, names: ['Pea Shooter', 'Watermelon', 'Frost Pepper', 'Cactus'] },
  { re: /candy/i, names: ['Gumdrop Gun', 'Jawbreaker', 'Syrup Trap', 'Lollipop'] },
  { re: /hive|bee|hornet/i, names: ['Stinger', 'Honey Bomb', 'Nectar Glue', 'Royal Guard'] },
  { re: /pumpkin|jack-o/i, names: ['Seed Spitter', 'Pumpkin Bomb', 'Cobweb', 'Candle Sniper'] },
  { re: /haunted|graveyard/i, names: ['Wisp', 'Tomb Slam', 'Cold Fog', 'Banshee'] },
  { re: /snow/i, names: ['Snowball', 'Snow Cannon', 'Ice Wall', 'Icicle'] },
  { re: /lighthouse/i, names: ['Lamp', 'Flare', 'Fog Horn', 'Beacon'] },
  { re: /mage|spell/i, names: ['Spark', 'Fireball', 'Frost Rune', 'Arcane Bolt'] },
  { re: /kaiju|city defense/i, names: ['Missile', 'Artillery', 'Net Gun', 'Railgun'] },
  { re: /convoy|raider|outpost|frontier/i, names: ['Rifleman', 'Dynamite', 'Bear Trap', 'Sharpshooter'] },
  { re: /orc|barracks|castle|wall|gate/i, names: ['Archer', 'Catapult', 'Pitch Pot', 'Ballista'] },
  { re: /orbit|citadel|space/i, names: ['Laser', 'Plasma Bomb', 'Gravity Net', 'Railgun'] },
  { re: /train/i, names: ['Gatling', 'Mortar Car', 'Frost Car', 'Sniper Car'] },
  { re: /weave|element/i, names: ['Spark', 'Fire', 'Water', 'Wind'] },
  { re: /tetris/i, names: ['I-Block', 'O-Block', 'T-Block', 'L-Block'] },
]
export const tdNames = (s: string) => TD_NAMES.find((t) => t.re.test(s))?.names
