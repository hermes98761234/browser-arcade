// Dungeon generation, field of view and pathfinding for the roguelike engine (pure, tested).
import type { Rng } from '../kit'

export type LevelKind = 'bsp' | 'cave' | 'maze'
export interface Rect { x: number; y: number; w: number; h: number }
export interface Level {
  w: number
  h: number
  /** 1 = floor, 0 = wall. */
  tiles: Uint8Array
  start: { x: number; y: number }
  stairs: { x: number; y: number }
  /** Open areas used for spawning (rooms for BSP, random pockets for caves/mazes). */
  rooms: Rect[]
}

const idx = (w: number, x: number, y: number) => y * w + x

export function genLevel(rng: Rng, w: number, h: number, kind: LevelKind): Level {
  for (let attempt = 0; attempt < 20; attempt++) {
    const lv = kind === 'cave' ? genCave(rng, w, h) : kind === 'maze' ? genMaze(rng, w, h) : genBsp(rng, w, h)
    if (lv && floorCount(lv.tiles) > (w * h) / 8) return finish(lv)
  }
  return finish(genBsp(rng, w, h)!)
}

const floorCount = (t: Uint8Array) => t.reduce((a, b) => a + b, 0)

/** Place start and stairs: start in a room, stairs at the walkable tile farthest from it. */
function finish(lv: Level): Level {
  const first = lv.rooms[0]
  let sx = Math.floor(first.x + first.w / 2)
  let sy = Math.floor(first.y + first.h / 2)
  if (!lv.tiles[idx(lv.w, sx, sy)]) {
    const f = nearestFloor(lv, sx, sy)
    sx = f.x
    sy = f.y
  }
  lv.start = { x: sx, y: sy }
  const d = bfsField(lv.tiles, lv.w, lv.h, sx, sy, 9999)
  let best = 0
  let bi = idx(lv.w, sx, sy)
  for (let i = 0; i < d.length; i++) {
    if (d[i] > best) {
      best = d[i]
      bi = i
    }
  }
  lv.stairs = { x: bi % lv.w, y: Math.floor(bi / lv.w) }
  return lv
}

function nearestFloor(lv: Level, x: number, y: number) {
  for (let r = 0; r < Math.max(lv.w, lv.h); r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const xx = x + dx
        const yy = y + dy
        if (xx > 0 && yy > 0 && xx < lv.w - 1 && yy < lv.h - 1 && lv.tiles[idx(lv.w, xx, yy)]) return { x: xx, y: yy }
      }
    }
  }
  return { x: 1, y: 1 }
}

function genBsp(rng: Rng, w: number, h: number): Level | null {
  const tiles = new Uint8Array(w * h)
  const rooms: Rect[] = []
  const leaves: Rect[] = []
  const split = (r: Rect, depth: number) => {
    const canH = r.w >= 16
    const canV = r.h >= 12
    if ((!canH && !canV) || depth > 5 || (depth > 2 && rng.chance(0.25))) {
      leaves.push(r)
      return
    }
    const horiz = canH && canV ? rng.chance(r.w / (r.w + r.h)) : canH
    if (horiz) {
      const cut = rng.int(7, r.w - 7)
      split({ x: r.x, y: r.y, w: cut, h: r.h }, depth + 1)
      split({ x: r.x + cut, y: r.y, w: r.w - cut, h: r.h }, depth + 1)
    } else {
      const cut = rng.int(6, r.h - 6)
      split({ x: r.x, y: r.y, w: r.w, h: cut }, depth + 1)
      split({ x: r.x, y: r.y + cut, w: r.w, h: r.h - cut }, depth + 1)
    }
  }
  split({ x: 1, y: 1, w: w - 2, h: h - 2 }, 0)
  const centers: { x: number; y: number }[] = []
  for (const l of leaves) {
    const rw = rng.int(4, Math.max(4, l.w - 3))
    const rh = rng.int(4, Math.max(4, l.h - 3))
    const rx = l.x + rng.int(1, Math.max(1, l.w - rw - 1))
    const ry = l.y + rng.int(1, Math.max(1, l.h - rh - 1))
    const room = { x: rx, y: ry, w: Math.min(rw, w - 2 - rx), h: Math.min(rh, h - 2 - ry) }
    if (room.w < 3 || room.h < 3) continue
    rooms.push(room)
    for (let y = room.y; y < room.y + room.h; y++) for (let x = room.x; x < room.x + room.w; x++) tiles[idx(w, x, y)] = 1
    centers.push({ x: Math.floor(room.x + room.w / 2), y: Math.floor(room.y + room.h / 2) })
  }
  if (rooms.length < 3) return null
  // Chain rooms in a random order (guaranteed connected), then add a couple of extra loops.
  const order = rng.shuffle(centers.map((_, i) => i))
  const carve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    let { x, y } = a
    const horizFirst = rng.chance(0.5)
    const run = (horiz: boolean) => {
      while (horiz ? x !== b.x : y !== b.y) {
        if (horiz) x += Math.sign(b.x - x)
        else y += Math.sign(b.y - y)
        tiles[idx(w, x, y)] = 1
      }
    }
    run(horizFirst)
    run(!horizFirst)
  }
  for (let i = 1; i < order.length; i++) carve(centers[order[i - 1]], centers[order[i]])
  for (let i = 0; i < 2; i++) carve(centers[rng.int(0, centers.length - 1)], centers[rng.int(0, centers.length - 1)])
  return { w, h, tiles, start: { x: 0, y: 0 }, stairs: { x: 0, y: 0 }, rooms: rng.shuffle(rooms) }
}

function genCave(rng: Rng, w: number, h: number): Level | null {
  let t = new Uint8Array(w * h)
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) t[idx(w, x, y)] = rng.chance(0.56) ? 1 : 0
  for (let it = 0; it < 5; it++) {
    const n = new Uint8Array(w * h)
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let walls = 0
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (!t[idx(w, x + dx, y + dy)]) walls++
        n[idx(w, x, y)] = walls >= 5 ? 0 : 1
      }
    }
    t = n
  }
  // keep the largest connected region
  const comp = new Int32Array(w * h).fill(-1)
  let bestId = -1
  let bestSize = 0
  let id = 0
  for (let i = 0; i < t.length; i++) {
    if (!t[i] || comp[i] >= 0) continue
    let size = 0
    const stack = [i]
    comp[i] = id
    while (stack.length) {
      const c = stack.pop()!
      size++
      const x = c % w
      const y = Math.floor(c / w)
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const j = idx(w, x + dx, y + dy)
        if (t[j] && comp[j] < 0) {
          comp[j] = id
          stack.push(j)
        }
      }
    }
    if (size > bestSize) {
      bestSize = size
      bestId = id
    }
    id++
  }
  if (bestSize < (w * h) / 6) return null
  for (let i = 0; i < t.length; i++) if (comp[i] !== bestId) t[i] = 0
  const floors: number[] = []
  for (let i = 0; i < t.length; i++) if (t[i]) floors.push(i)
  const rooms: Rect[] = []
  for (let k = 0; k < 14; k++) {
    const f = floors[rng.int(0, floors.length - 1)]
    rooms.push({ x: f % w, y: Math.floor(f / w), w: 1, h: 1 })
  }
  return { w, h, tiles: t, start: { x: 0, y: 0 }, stairs: { x: 0, y: 0 }, rooms }
}

function genMaze(rng: Rng, w: number, h: number): Level | null {
  const W = w % 2 === 0 ? w - 1 : w
  const H = h % 2 === 0 ? h - 1 : h
  const t = new Uint8Array(w * h)
  const stack: [number, number][] = [[1, 1]]
  t[idx(w, 1, 1)] = 1
  while (stack.length) {
    const [x, y] = stack[stack.length - 1]
    const opts: [number, number][] = []
    for (const [dx, dy] of [[2, 0], [-2, 0], [0, 2], [0, -2]]) {
      const nx = x + dx
      const ny = y + dy
      if (nx > 0 && ny > 0 && nx < W - 1 && ny < H - 1 && !t[idx(w, nx, ny)]) opts.push([nx, ny])
    }
    if (!opts.length) {
      stack.pop()
      continue
    }
    const [nx, ny] = rng.pick(opts)
    t[idx(w, (x + nx) / 2, (y + ny) / 2)] = 1
    t[idx(w, nx, ny)] = 1
    stack.push([nx, ny])
  }
  // braid: knock out some walls so the maze has loops
  for (let k = 0; k < (w * h) / 40; k++) {
    const x = rng.int(2, W - 3)
    const y = rng.int(2, H - 3)
    if (!t[idx(w, x, y)] && ((t[idx(w, x - 1, y)] && t[idx(w, x + 1, y)]) || (t[idx(w, x, y - 1)] && t[idx(w, x, y + 1)]))) t[idx(w, x, y)] = 1
  }
  const rooms: Rect[] = []
  for (let k = 0; k < 14; k++) rooms.push({ x: 1 + 2 * rng.int(0, Math.floor((W - 3) / 2)), y: 1 + 2 * rng.int(0, Math.floor((H - 3) / 2)), w: 1, h: 1 })
  rooms[0] = { x: 1, y: 1, w: 1, h: 1 }
  return { w, h, tiles: t, start: { x: 1, y: 1 }, stairs: { x: 1, y: 1 }, rooms }
}

// ---------- pathfinding ----------

const DIRS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]

/** Can an entity step from (x,y) by (dx,dy)? Diagonals may not cut wall corners. */
export function canStep(tiles: Uint8Array, w: number, x: number, y: number, dx: number, dy: number): boolean {
  const nx = x + dx
  const ny = y + dy
  if (!tiles[idx(w, nx, ny)]) return false
  if (dx && dy && (!tiles[idx(w, x + dx, y)] || !tiles[idx(w, x, y + dy)])) return false
  return true
}

/** Distance field (steps) from (x,y) over floor tiles; -1 when unreachable or beyond the limit. */
export function bfsField(tiles: Uint8Array, w: number, h: number, x: number, y: number, limit: number): Int16Array {
  const d = new Int16Array(w * h).fill(-1)
  const q: number[] = [idx(w, x, y)]
  d[q[0]] = 0
  for (let qi = 0; qi < q.length; qi++) {
    const c = q[qi]
    const cx = c % w
    const cy = Math.floor(c / w)
    if (d[c] >= limit) continue
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx
      const ny = cy + dy
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
      const j = idx(w, nx, ny)
      if (d[j] >= 0 || !canStep(tiles, w, cx, cy, dx, dy)) continue
      d[j] = d[c] + 1
      q.push(j)
    }
  }
  return d
}

/** Shortest path through explored floor (passable(i) decides) from a to b, excluding a. Empty when none. */
export function findPath(tiles: Uint8Array, w: number, h: number, a: { x: number; y: number }, b: { x: number; y: number }, passable: (i: number) => boolean): { x: number; y: number }[] {
  const start = idx(w, a.x, a.y)
  const goal = idx(w, b.x, b.y)
  const prev = new Int32Array(w * h).fill(-1)
  prev[start] = start
  const q = [start]
  for (let qi = 0; qi < q.length && prev[goal] < 0; qi++) {
    const c = q[qi]
    const cx = c % w
    const cy = Math.floor(c / w)
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx
      const ny = cy + dy
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
      const j = idx(w, nx, ny)
      if (prev[j] >= 0 || !canStep(tiles, w, cx, cy, dx, dy) || (j !== goal && !passable(j))) continue
      prev[j] = c
      q.push(j)
    }
  }
  if (prev[goal] < 0) return []
  const out: { x: number; y: number }[] = []
  for (let c = goal; c !== start; c = prev[c]) out.push({ x: c % w, y: Math.floor(c / w) })
  return out.reverse()
}

// ---------- line of sight & FOV ----------

export function los(tiles: Uint8Array, w: number, x0: number, y0: number, x1: number, y1: number): boolean {
  let x = x0
  let y = y0
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy
  while (x !== x1 || y !== y1) {
    if ((x !== x0 || y !== y0) && !tiles[idx(w, x, y)]) return false
    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x += sx
    }
    if (e2 < dx) {
      err += dx
      y += sy
    }
  }
  return true
}

const OCT: [number, number, number, number][] = [
  [1, 0, 0, 1], [0, 1, 1, 0], [0, -1, 1, 0], [-1, 0, 0, 1], [-1, 0, 0, -1], [0, -1, -1, 0], [0, 1, -1, 0], [1, 0, 0, -1],
]

/** Recursive shadowcasting. Marks out[i] = 1 for every tile visible from (ox,oy) within radius (walls that bound the view are included). */
export function computeFov(tiles: Uint8Array, w: number, h: number, ox: number, oy: number, radius: number, out: Uint8Array): void {
  out.fill(0)
  out[idx(w, ox, oy)] = 1
  const blocked = (x: number, y: number) => x < 0 || y < 0 || x >= w || y >= h || !tiles[idx(w, x, y)]
  const cast = (row: number, start: number, end: number, xx: number, xy: number, yx: number, yy: number) => {
    if (start < end) return
    let newStart = start
    for (let i = row; i <= radius; i++) {
      let wasBlocked = false
      for (let dx = -i, dy = -i; dx <= 0; dx++) {
        const lSlope = (dx - 0.5) / (dy + 0.5)
        const rSlope = (dx + 0.5) / (dy - 0.5)
        if (start < rSlope) continue
        if (end > lSlope) break
        const X = ox + dx * xx + dy * xy
        const Y = oy + dx * yx + dy * yy
        if (X >= 0 && Y >= 0 && X < w && Y < h && dx * dx + dy * dy <= radius * radius + radius) out[idx(w, X, Y)] = 1
        if (wasBlocked) {
          if (blocked(X, Y)) newStart = rSlope
          else {
            wasBlocked = false
            start = newStart
          }
        } else if (blocked(X, Y) && i < radius) {
          wasBlocked = true
          cast(i + 1, start, lSlope, xx, xy, yx, yy)
          newStart = rSlope
        }
      }
      if (wasBlocked) break
    }
  }
  for (const [xx, xy, yx, yy] of OCT) cast(1, 1, 0, xx, xy, yx, yy)
}
