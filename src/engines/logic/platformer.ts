// Platformer level generator: levels are stitched from segments whose gaps and steps are guaranteed jumpable.
import type { Rng } from '../kit'

/** Tile ids. */
export const T = { AIR: 0, SOLID: 1, ONEWAY: 2, DOOR: 3, SPIKE: 4, SPIKE_DOWN: 5, FLIP: 6, SPRING: 7 } as const

export const ROWS = 14
export const TOWER_W = 16

export interface Pt { x: number; y: number }
export interface Walker extends Pt { kind: 'walk' | 'fly' | 'spiky'; x0: number; x1: number }
export interface Link { from: [number, number]; to: [number, number] }

export interface Level {
  w: number
  h: number
  tiles: Uint8Array
  spawn: Pt
  goal: Pt
  checkpoints: Pt[]
  walkers: Walker[]
  stars: Pt[]
  anchors: Pt[]
  key: Pt | null
  doorX: number
  /** Extra guaranteed connections (gravity rooms, grapple gaps) used by the solvability test. */
  links: Link[]
  climb: boolean
}

export interface GenOpts {
  level: number
  diff: 0 | 1 | 2
  climb?: boolean
  grapple?: boolean
  gravity?: boolean
  key?: boolean
  /** Ground made of one-way cloud platforms (pits below). */
  sky?: boolean
}

const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x)

export const tileAt = (l: Level, x: number, y: number): number => (x < 0 || x >= l.w ? T.SOLID : y < 0 || y >= l.h ? T.AIR : l.tiles[y * l.w + x])

export function genLevel(rng: Rng, o: GenOpts): Level {
  return o.climb ? genTower(rng, o) : genRun(rng, o)
}

function genRun(rng: Rng, o: GenOpts): Level {
  const len = clamp(80 + 14 * o.level + (o.diff - 1) * 10, 70, 190)
  const WB = len + 80
  const tiles = new Uint8Array(WB * ROWS)
  const set = (x: number, y: number, v: number) => {
    if (x >= 0 && x < WB && y >= 0 && y < ROWS) tiles[y * WB + x] = v
  }
  const ground = (x0: number, x1: number, gy: number) => {
    for (let x = x0; x < x1; x++) {
      if (o.sky) set(x, gy, T.ONEWAY)
      else for (let y = gy; y < ROWS; y++) set(x, y, T.SOLID)
    }
  }
  const walkers: Walker[] = []
  const stars: Pt[] = []
  const anchors: Pt[] = []
  const links: Link[] = []
  const checkpoints: Pt[] = []
  let key: Pt | null = null
  let g = 10
  ground(0, 8, g)
  const spawn = { x: 2, y: g - 1 }
  checkpoints.push(spawn)
  let x = 8
  let nextCp = 36
  let rooms = 0
  const lvl = o.level
  const arc = (cx: number, cy: number, n: number, h: number) => {
    for (let i = 0; i < n; i++) stars.push({ x: cx + i, y: cy - Math.sin(n === 1 ? Math.PI / 2 : (i / (n - 1)) * Math.PI) * h })
  }
  const maxWalk = o.diff === 0 ? 0.25 : 0.4
  let needKey = !!o.key

  const flat = (n: number) => {
    ground(x, x + n, g)
    if (rng.chance(0.6)) arc(x + 1, g - 2, Math.min(n - 2, rng.int(3, 5)), rng.chance(0.5) ? 1 : 0)
    if (n >= 5 && rng.chance(maxWalk + 0.07 * lvl)) {
      const spiky = lvl >= 3 && rng.chance(0.18)
      walkers.push({ kind: spiky ? 'spiky' : 'walk', x: x + n / 2, y: g - 1, x0: x, x1: x + n })
    }
    x += n
  }
  const gap = () => {
    const gw = rng.int(2, 3)
    const ups = gw <= 2 ? [-2, -1, 0, 0, 1, 2] : [0, 0, 1, 2]
    const g2 = clamp(g + rng.pick(ups), 7, 12)
    const n = rng.int(3, 6)
    links.push({ from: [x - 1, g - 1], to: [x + gw, g2 - 1] })
    arc(x, Math.min(g, g2) - 3, gw + 1, 1.2)
    ground(x + gw, x + gw + n, g2)
    if (lvl >= 3 && gw >= 3 && rng.chance(0.3)) walkers.push({ kind: 'fly', x: x + gw / 2, y: Math.min(g, g2) - 4, x0: x - 1, x1: x + gw + 1 })
    x += gw + n
    g = g2
  }
  const stairs = () => {
    const dir = rng.chance(0.5) ? -1 : 1
    const n = rng.int(2, 4)
    for (let i = 0; i < n; i++) {
      const ng = clamp(g + dir, 7, 12)
      g = ng
      ground(x, x + 3, g)
      stars.push({ x: x + 1.5, y: g - 2 })
      x += 3
    }
    ground(x, x + 2, g)
    x += 2
  }
  const tier = () => {
    ground(x, x + 9, g)
    set(x + 2, g - 2, T.ONEWAY)
    for (let i = 2; i < 5; i++) set(x + i, g - 2, T.ONEWAY)
    for (let i = 5; i < 9; i++) set(x + i, g - 4, T.ONEWAY)
    stars.push({ x: x + 3, y: g - 3 }, { x: x + 4, y: g - 3 }, { x: x + 6, y: g - 5 }, { x: x + 7, y: g - 5 })
    if (needKey) {
      key = { x: x + 7.5, y: g - 5 }
      needKey = false
    }
    if (rng.chance(0.3)) {
      set(x + 1, g - 1, T.SPRING)
      for (let i = 0; i < 3; i++) stars.push({ x: x + 0.5 + i, y: g - 7 })
    }
    if (lvl >= 2 && rng.chance(0.4)) walkers.push({ kind: 'walk', x: x + 6.5, y: g - 5, x0: x + 5, x1: x + 9 })
    x += 9
  }
  const alley = () => {
    ground(x, x + 11, g)
    walkers.push({ kind: 'walk', x: x + 3, y: g - 1, x0: x, x1: x + 11 }, { kind: lvl >= 3 && rng.chance(0.3) ? 'spiky' : 'walk', x: x + 8, y: g - 1, x0: x, x1: x + 11 })
    arc(x + 2, g - 3, 6, 1.5)
    x += 11
  }
  const spikes = () => {
    ground(x, x + 8, g)
    const n = rng.int(1, 2)
    for (let i = 0; i < n; i++) set(x + 4 + i, g - 1, T.SPIKE)
    arc(x + 3, g - 3, 4, 1.5)
    x += 8
  }
  const bats = () => {
    ground(x, x + 9, g)
    walkers.push({ kind: 'fly', x: x + 4, y: g - 3, x0: x + 1, x1: x + 8 })
    arc(x + 2, g - 2, 5, 0.5)
    x += 9
  }
  const grapple = () => {
    ground(x, x + 1, g)
    const gw = rng.int(5, 7)
    anchors.push({ x: x + gw / 2 + 0.5, y: g - 5 })
    stars.push({ x: x + gw / 2 - 0.5, y: g - 2 }, { x: x + gw / 2 + 1.5, y: g - 2 })
    links.push({ from: [x - 1, g - 1], to: [x + gw, g - 1] })
    ground(x + gw, x + gw + 5, g)
    x += gw + 5
  }
  const flipRoom = () => {
    g = clamp(g, 9, 11)
    const x0 = x
    ground(x0, x0 + 6, g)
    ground(x0 + 12, x0 + 20, g)
    for (let xx = x0 + 2; xx < x0 + 18; xx++) for (let y = 0; y <= g - 6; y++) set(xx, y, T.SOLID)
    set(x0 + 3, g - 1, T.FLIP)
    set(x0 + 13, g - 5, T.FLIP)
    for (let i = 0; i < 6; i++) stars.push({ x: x0 + 5 + i, y: g - 5 })
    links.push({ from: [x0 + 3, g - 1], to: [x0 + 13, g - 1] })
    x = x0 + 20
    rooms++
  }

  while (x < len) {
    if (x > nextCp) {
      checkpoints.push({ x: x + 1, y: g - 1 })
      ground(x, x + 4, g)
      x += 4
      nextCp += 40
      continue
    }
    if (needKey && x > len * 0.3) {
      tier()
      continue
    }
    const w: [string, number][] = [['flat', 3], ['gap', 3.2], ['stairs', 1.1], ['tier', 1.2]]
    if (lvl >= 2) w.push(['alley', 1], ['spikes', 1.1])
    if (lvl >= 3) w.push(['bats', 1])
    if (o.grapple) w.push(['grapple', 3])
    if (o.gravity && rooms < 1 + Math.floor(lvl / 2) && x > 18) w.push(['flip', 2.4])
    let r = rng() * w.reduce((a, b) => a + b[1], 0)
    let pick = 'flat'
    for (const [k, v] of w) {
      r -= v
      if (r <= 0) {
        pick = k
        break
      }
    }
    if (pick === 'flat') flat(rng.int(4, 8))
    else if (pick === 'gap') gap()
    else if (pick === 'stairs') stairs()
    else if (pick === 'tier') tier()
    else if (pick === 'alley') alley()
    else if (pick === 'spikes') spikes()
    else if (pick === 'bats') bats()
    else if (pick === 'grapple') grapple()
    else flipRoom()
  }
  // exit
  ground(x, x + 16, g)
  let doorX = -1
  if (o.key) {
    doorX = x + 5
    for (let y = g - 3; y < g; y++) set(doorX, y, T.DOOR)
  }
  if (o.key && !key) key = { x: x - 2, y: g - 2 }
  const goal = { x: x + 11, y: g - 1 }
  const w = x + 16
  const out = new Uint8Array(w * ROWS)
  for (let y = 0; y < ROWS; y++) out.set(tiles.subarray(y * WB, y * WB + w), y * w)
  return { w, h: ROWS, tiles: out, spawn, goal, checkpoints, walkers, stars, anchors, key, doorX, links, climb: false }
}

function genTower(rng: Rng, o: GenOpts): Level {
  const W = TOWER_W
  const platforms = 18 + o.level * 5 + o.diff * 2
  const H = 8 + platforms * 2 + 4
  const tiles = new Uint8Array(W * H)
  const set = (x: number, y: number, v: number) => {
    if (x >= 0 && x < W && y >= 0 && y < H) tiles[y * W + x] = v
  }
  for (let y = 0; y < H; y++) {
    set(0, y, T.SOLID)
    set(W - 1, y, T.SOLID)
  }
  for (let x = 0; x < W; x++) for (let y = H - 2; y < H; y++) set(x, y, T.SOLID)
  const walkers: Walker[] = []
  const stars: Pt[] = []
  const anchors: Pt[] = []
  const checkpoints: Pt[] = []
  let key: Pt | null = null
  let y = H - 2
  let ax = 1
  let aw = W - 2
  const spawn = { x: W / 2, y: H - 3 }
  checkpoints.push(spawn)
  let doorX = -1
  for (let i = 0; i < platforms; i++) {
    const last = i === platforms - 1
    y -= 2
    const pw = last ? 7 : rng.int(3, 6)
    const lo = Math.max(1, ax - pw - 2)
    const hi = Math.min(W - 1 - pw, ax + aw + 2)
    let px = rng.int(lo, Math.max(lo, hi))
    if (last) px = clamp(Math.floor((W - pw) / 2), lo, Math.max(lo, hi))
    for (let xx = px; xx < px + pw; xx++) set(xx, y, T.ONEWAY)
    if (rng.chance(0.7)) for (let s = 0; s < Math.min(pw, 3); s++) stars.push({ x: px + 1 + s, y: y - 2 })
    if (pw >= 4 && !last && i > 1 && rng.chance(0.3 + 0.05 * o.level)) walkers.push({ kind: o.level >= 3 && rng.chance(0.2) ? 'spiky' : 'walk', x: px + pw / 2, y: y - 1, x0: px, x1: px + pw })
    if (pw >= 5 && !last && o.level >= 2 && rng.chance(0.2)) set(px + 2, y - 1, T.SPIKE)
    if (i > 0 && i % 7 === 0 && !last) checkpoints.push({ x: px + 1, y: y - 1 })
    if (o.grapple && i > 2 && i % 5 === 0) anchors.push({ x: px + pw / 2 + 0.5, y: y - 5 })
    if (o.key && i === Math.floor(platforms / 2)) key = { x: px + pw / 2, y: y - 1 }
    if (last) {
      if (o.key) {
        doorX = px + 4
        for (let yy = y - 3; yy < y; yy++) set(doorX, yy, T.DOOR)
      }
    }
    ax = px
    aw = pw
  }
  const goal = { x: ax + aw - 1.5, y: y - 1 }
  return { w: W, h: H, tiles, spawn, goal, checkpoints, walkers, stars, anchors, key, doorX, links: [], climb: true }
}

/** Conservative reachability check (used by tests): can a standard jumper get from spawn to goal? */
export function solvable(l: Level): boolean {
  const solid = (x: number, y: number) => {
    const t = tileAt(l, x, y)
    return t === T.SOLID || t === T.ONEWAY
  }
  const stand = (x: number, y: number) => {
    const t = tileAt(l, x, y)
    return y >= 0 && y < l.h && (t === T.AIR || t === T.DOOR || t === T.FLIP || t === T.SPRING) && solid(x, y + 1)
  }
  const id = (x: number, y: number) => y * l.w + x
  const sx = Math.floor(l.spawn.x)
  const sy = Math.floor(l.spawn.y)
  const gx = Math.floor(l.goal.x)
  const gy = Math.floor(l.goal.y)
  const seen = new Set<number>([id(sx, sy)])
  const q: [number, number][] = [[sx, sy]]
  const linkMap = new Map<number, [number, number][]>()
  for (const k of l.links) {
    const a = id(k.from[0], k.from[1])
    linkMap.set(a, [...(linkMap.get(a) ?? []), k.to])
  }
  while (q.length) {
    const [cx, cy] = q.pop()!
    if (Math.abs(cx - gx) <= 1 && cy === gy) return true
    const next: [number, number][] = [...(linkMap.get(id(cx, cy)) ?? [])]
    for (let dx = -5; dx <= 5; dx++) {
      for (let ny = cy - 2; ny <= cy + 7; ny++) {
        const up = cy - ny
        const maxDx = up >= 1 ? 3 : up === 0 ? 4 : 5
        if (Math.abs(dx) > maxDx || !stand(cx + dx, ny)) continue
        next.push([cx + dx, ny])
      }
    }
    for (const [nx, ny] of next) {
      if (!seen.has(id(nx, ny))) {
        seen.add(id(nx, ny))
        q.push([nx, ny])
      }
    }
  }
  return false
}
