// Raycaster level generator: maze (recursive backtracker) or dungeon (rooms + corridors), with exit, keys, loot and foe spawns.
import type { Rng } from '../kit'

export const EXIT = 9

export interface Cell { x: number; y: number }

export interface RayLevel {
  w: number
  h: number
  /** 0 floor, 1..4 wall styles, 9 exit door. */
  tiles: Uint8Array
  start: Cell
  exit: Cell
  /** Floor cell in front of the exit. */
  exitFront: Cell
  keys: Cell[]
  treasures: Cell[]
  health: Cell[]
  ammo: Cell[]
  foes: Cell[]
}

export interface RayOpts {
  style: 'maze' | 'dungeon'
  /** Maze cells per side (tiles = 2n+1) or dungeon size in tiles. */
  size: number
  keys: number
  foes: number
  loot: number
}

export function bfs(tiles: Uint8Array, w: number, h: number, from: Cell): Int32Array {
  const dist = new Int32Array(w * h).fill(-1)
  const q = [from.y * w + from.x]
  dist[q[0]] = 0
  for (let i = 0; i < q.length; i++) {
    const c = q[i]
    const x = c % w
    const y = (c / w) | 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
      const ni = ny * w + nx
      if (tiles[ni] !== 0 || dist[ni] >= 0) continue
      dist[ni] = dist[c] + 1
      q.push(ni)
    }
  }
  return dist
}

function wallStyle(x: number, y: number) {
  return 1 + ((x >> 2) + (y >> 2)) % 4
}

function carveMaze(rng: Rng, n: number, w: number, t: Uint8Array) {
  const seen = new Uint8Array(n * n)
  const stack: [number, number][] = [[0, 0]]
  seen[0] = 1
  t[1 * w + 1] = 0
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1]
    const opts = rng.shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => {
      const nx = cx + dx
      const ny = cy + dy
      return nx >= 0 && ny >= 0 && nx < n && ny < n && !seen[ny * n + nx]
    }))
    if (!opts.length) {
      stack.pop()
      continue
    }
    const [dx, dy] = opts[0]
    const nx = cx + dx
    const ny = cy + dy
    seen[ny * n + nx] = 1
    t[(ny * 2 + 1) * w + nx * 2 + 1] = 0
    t[(cy * 2 + 1 + dy) * w + cx * 2 + 1 + dx] = 0
    stack.push([nx, ny])
  }
  // braid a few dead ends into loops so the maze is less of a pure tree
  for (let i = 0; i < n; i++) {
    const x = rng.int(1, n - 2) * 2 + 1
    const y = rng.int(1, n - 2) * 2 + 1
    const dx = rng.chance(0.5) ? 1 : 0
    if (rng.chance(0.5)) t[y * w + x + (dx ? 1 : 0)] = 0
    else t[(y + (dx ? 0 : 1)) * w + x] = 0
  }
}

function carveDungeon(rng: Rng, w: number, h: number, t: Uint8Array): Cell[] {
  const rooms: { x: number; y: number; w: number; h: number }[] = []
  for (let tries = 0; tries < 80 && rooms.length < Math.floor((w * h) / 90); tries++) {
    const rw = rng.int(4, 8)
    const rh = rng.int(4, 8)
    const rx = rng.int(1, w - rw - 2)
    const ry = rng.int(1, h - rh - 2)
    if (rooms.some((r) => rx < r.x + r.w + 2 && rx + rw + 2 > r.x && ry < r.y + r.h + 2 && ry + rh + 2 > r.y)) continue
    rooms.push({ x: rx, y: ry, w: rw, h: rh })
    for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) t[y * w + x] = 0
  }
  const ctr = (r: { x: number; y: number; w: number; h: number }) => ({ x: r.x + (r.w >> 1), y: r.y + (r.h >> 1) })
  const link = (a: Cell, b: Cell) => {
    let { x, y } = a
    while (x !== b.x) {
      t[y * w + x] = 0
      x += Math.sign(b.x - x)
    }
    while (y !== b.y) {
      t[y * w + x] = 0
      y += Math.sign(b.y - y)
    }
    t[y * w + x] = 0
  }
  for (let i = 1; i < rooms.length; i++) link(ctr(rooms[i - 1]), ctr(rooms[i]))
  if (rooms.length > 3) link(ctr(rooms[0]), ctr(rooms[rooms.length - 1]))
  return rooms.map(ctr)
}

export function genRayLevel(rng: Rng, o: RayOpts): RayLevel {
  const n = o.size
  const w = o.style === 'maze' ? n * 2 + 1 : n
  const h = w
  const t = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) t[y * w + x] = wallStyle(x, y)
  let start: Cell = { x: 1, y: 1 }
  if (o.style === 'maze') carveMaze(rng, n, w, t)
  else {
    const centres = carveDungeon(rng, w, h, t)
    start = centres[0] ?? { x: 2, y: 2 }
    if (!centres.length) t[start.y * w + start.x] = 0
  }
  const dist = bfs(t, w, h, start)
  const floors: Cell[] = []
  let far: Cell = start
  let fd = 0
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const d = dist[y * w + x]
      if (d < 0) {
        t[y * w + x] = wallStyle(x, y) // unreachable pockets become wall
        continue
      }
      floors.push({ x, y })
      if (d > fd) {
        fd = d
        far = { x, y }
      }
    }
  // exit door: a wall tile adjacent to the farthest floor cell
  let exit: Cell = { x: far.x, y: far.y }
  for (const [dx, dy] of rng.shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]])) {
    const nx = far.x + dx
    const ny = far.y + dy
    if (nx >= 0 && ny >= 0 && nx < w && ny < h && t[ny * w + nx] !== 0) {
      exit = { x: nx, y: ny }
      break
    }
  }
  t[exit.y * w + exit.x] = EXIT
  const used = new Set<number>([start.y * w + start.x, far.y * w + far.x])
  const pick = (minDist: number): Cell => {
    for (let i = 0; i < 200; i++) {
      const c = rng.pick(floors)
      const id = c.y * w + c.x
      if (used.has(id) || dist[id] < minDist) continue
      used.add(id)
      return c
    }
    return rng.pick(floors)
  }
  const keys = Array.from({ length: o.keys }, () => pick(Math.floor(fd * 0.25)))
  const treasures = Array.from({ length: o.loot }, () => pick(4))
  const health = Array.from({ length: Math.max(1, Math.round(o.loot / 3)) }, () => pick(6))
  const ammo = Array.from({ length: Math.max(1, Math.round(o.loot / 3)) }, () => pick(6))
  const foes = Array.from({ length: o.foes }, () => pick(Math.max(8, Math.floor(fd * 0.2))))
  return { w, h, tiles: t, start, exit, exitFront: far, keys, treasures, health, ammo, foes }
}
