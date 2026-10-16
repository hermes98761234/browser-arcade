// Falling-block logic (7-bag, rotation with wall kicks, line clears) plus polyomino packing and block-blast helpers.
import type { Rng } from '../kit'

export type Cell = [number, number]

// ---------- tetrominoes ----------

/** Rotation-0 cells inside an n×n box, in the order I O T S Z J L. */
const BASE: { n: number; cells: Cell[] }[] = [
  { n: 4, cells: [[0, 1], [1, 1], [2, 1], [3, 1]] },
  { n: 2, cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { n: 3, cells: [[1, 0], [0, 1], [1, 1], [2, 1]] },
  { n: 3, cells: [[1, 0], [2, 0], [0, 1], [1, 1]] },
  { n: 3, cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  { n: 3, cells: [[0, 0], [0, 1], [1, 1], [2, 1]] },
  { n: 3, cells: [[2, 0], [0, 1], [1, 1], [2, 1]] },
]
export const TETRO_COUNT = BASE.length

const rotCache: Cell[][][] = BASE.map((b) => {
  const out: Cell[][] = [b.cells]
  for (let r = 1; r < 4; r++) out.push(out[r - 1].map(([x, y]) => [b.n - 1 - y, x] as Cell))
  return out
})

export const cellsOf = (type: number, rot: number): Cell[] => rotCache[type][((rot % 4) + 4) % 4]

export interface Board {
  w: number
  h: number
  /** 0 empty, otherwise piece type + 1. */
  g: Uint8Array
}

export const newBoard = (w: number, h: number): Board => ({ w, h, g: new Uint8Array(w * h) })

export function collides(b: Board, type: number, rot: number, x: number, y: number): boolean {
  for (const [cx, cy] of cellsOf(type, rot)) {
    const px = x + cx
    const py = y + cy
    if (px < 0 || px >= b.w || py >= b.h) return true
    if (py >= 0 && b.g[py * b.w + px]) return true
  }
  return false
}

const KICKS: Cell[] = [[0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1], [-2, 0], [2, 0], [0, -2]]

/** Rotate with simple wall kicks; returns the new placement or null. */
export function tryRotate(b: Board, type: number, rot: number, x: number, y: number, dir: 1 | -1): { rot: number; x: number; y: number } | null {
  const nr = (rot + dir + 4) % 4
  for (const [kx, ky] of KICKS) {
    if (!collides(b, type, nr, x + kx, y + ky)) return { rot: nr, x: x + kx, y: y + ky }
  }
  return null
}

export function dropY(b: Board, type: number, rot: number, x: number, y: number): number {
  let yy = y
  while (!collides(b, type, rot, x, yy + 1)) yy++
  return yy
}

export function lockPiece(b: Board, type: number, rot: number, x: number, y: number): boolean {
  let above = false
  for (const [cx, cy] of cellsOf(type, rot)) {
    const py = y + cy
    if (py < 0) above = true
    else b.g[py * b.w + x + cx] = type + 1
  }
  return above
}

/** Removes full rows, returns their indices (before compaction). */
export function clearLines(b: Board): number[] {
  const rows: number[] = []
  for (let y = 0; y < b.h; y++) {
    let full = true
    for (let x = 0; x < b.w; x++) if (!b.g[y * b.w + x]) full = false
    if (full) rows.push(y)
  }
  if (!rows.length) return rows
  let dst = b.h - 1
  for (let y = b.h - 1; y >= 0; y--) {
    if (rows.includes(y)) continue
    if (dst !== y) b.g.copyWithin(dst * b.w, y * b.w, (y + 1) * b.w)
    dst--
  }
  b.g.fill(0, 0, (dst + 1) * b.w)
  return rows
}

/** 7-bag generator. */
export function makeBag(rng: Rng): () => number {
  let bag: number[] = []
  return () => {
    if (!bag.length) bag = rng.shuffle([0, 1, 2, 3, 4, 5, 6])
    return bag.pop()!
  }
}

export const LINE_SCORE = [0, 100, 300, 500, 800]
export const lineScore = (lines: number, level: number) => (LINE_SCORE[Math.min(4, lines)] ?? 800) * level

/** Seconds per gravity step. */
export const fallDelay = (level: number, speed = 1) => Math.max(0.06, (0.85 - (level - 1) * 0.07) / speed)

// ---------- polyomino packing ----------

export interface Packing {
  w: number
  h: number
  /** 1 = cell of the target shape. */
  shape: Uint8Array
  /** Pieces in a random orientation; each is normalised to start at 0,0. */
  pieces: Cell[][]
  /** The cut pieces in their solved positions (absolute cells). */
  solution: Cell[][]
}

export const normalize = (cells: Cell[]): Cell[] => {
  const mx = Math.min(...cells.map((c) => c[0]))
  const my = Math.min(...cells.map((c) => c[1]))
  return cells.map(([x, y]) => [x - mx, y - my] as Cell).sort((a, b) => a[1] - b[1] || a[0] - b[0])
}
export const rotateCW = (cells: Cell[]): Cell[] => normalize(cells.map(([x, y]) => [-y, x] as Cell))
export const flipH = (cells: Cell[]): Cell[] => normalize(cells.map(([x, y]) => [-x, y] as Cell))

export interface PackOpts {
  w: number
  h: number
  /** Target piece size; 0 = mixed sizes (3-5). */
  size: number
  /** Cells carved off the rectangle for an irregular outline. */
  carve?: number
}

function connected(cells: Cell[]): boolean {
  const key = new Set(cells.map(([x, y]) => `${x},${y}`))
  const seen = new Set([`${cells[0][0]},${cells[0][1]}`])
  const q = [cells[0]]
  for (let i = 0; i < q.length; i++) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = `${q[i][0] + dx},${q[i][1] + dy}`
      if (key.has(k) && !seen.has(k)) {
        seen.add(k)
        q.push([q[i][0] + dx, q[i][1] + dy])
      }
    }
  }
  return seen.size === cells.length
}

export function genPacking(rng: Rng, o: PackOpts): Packing {
  const { w, h } = o
  for (let attempt = 0; attempt < 600; attempt++) {
    const shape = new Uint8Array(w * h).fill(1)
    // Carve corner-ish cells while keeping the shape connected.
    for (let i = 0; i < (o.carve ?? 0); i++) {
      const x = rng.chance(0.5) ? rng.int(0, 1) * (w - 1) : rng.int(0, w - 1)
      const y = x === 0 || x === w - 1 ? rng.int(0, h - 1) : rng.int(0, 1) * (h - 1)
      shape[y * w + x] = 0
    }
    const cells: Cell[] = []
    for (let i = 0; i < w * h; i++) if (shape[i]) cells.push([i % w, (i / w) | 0])
    if (cells.length < 4 || !connected(cells)) continue
    const size = o.size || 4
    const k = Math.max(2, Math.round(cells.length / size))
    if (o.size && cells.length % o.size) continue
    const owner = new Int16Array(w * h).fill(-1)
    const seeds = rng.shuffle(cells.slice()).slice(0, k)
    const regions: Cell[][] = seeds.map((s, i) => {
      owner[s[1] * w + s[0]] = i
      return [s]
    })
    const frontier = (r: Cell[]): Cell[] => {
      const out: Cell[] = []
      for (const [x, y] of r) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && ny >= 0 && nx < w && ny < h && shape[ny * w + nx] && owner[ny * w + nx] < 0) out.push([nx, ny])
      }
      return out
    }
    for (;;) {
      const order = regions.map((_, i) => i).sort((a, b) => regions[a].length - regions[b].length + (rng() - 0.5) * 0.8)
      let grew = false
      for (const i of order) {
        if (o.size && regions[i].length >= o.size) continue
        const f = frontier(regions[i])
        if (!f.length) continue
        const c = rng.pick(f)
        owner[c[1] * w + c[0]] = i
        regions[i].push(c)
        grew = true
        break
      }
      if (!grew) break
    }
    const covered = regions.reduce((s, r) => s + r.length, 0)
    if (covered !== cells.length) continue
    if (o.size && regions.some((r) => r.length !== o.size)) continue
    if (regions.some((r) => r.length < 2)) continue
    const pieces = regions.map((r) => {
      let c = normalize(r)
      for (let i = rng.int(0, 3); i > 0; i--) c = rotateCW(c)
      return rng.chance(0.5) ? flipH(c) : c
    })
    return { w, h, shape, pieces, solution: regions }
  }
  return genPacking(rng, { ...o, size: 0, carve: 0 })
}

// ---------- block blast ----------

const S = (rows: string[]): Cell[] => {
  const out: Cell[] = []
  rows.forEach((r, y) => [...r].forEach((ch, x) => ch === '#' && out.push([x, y])))
  return out
}

export const BLAST_SHAPES: { cells: Cell[]; weight: number }[] = [
  { cells: S(['#']), weight: 2 },
  { cells: S(['##']), weight: 3 },
  { cells: S(['#', '#']), weight: 3 },
  { cells: S(['###']), weight: 3 },
  { cells: S(['#', '#', '#']), weight: 3 },
  { cells: S(['####']), weight: 2 },
  { cells: S(['#', '#', '#', '#']), weight: 2 },
  { cells: S(['#####']), weight: 1 },
  { cells: S(['#', '#', '#', '#', '#']), weight: 1 },
  { cells: S(['##', '##']), weight: 4 },
  { cells: S(['###', '###', '###']), weight: 1 },
  { cells: S(['##', '#.']), weight: 2 },
  { cells: S(['##', '.#']), weight: 2 },
  { cells: S(['#.', '##']), weight: 2 },
  { cells: S(['.#', '##']), weight: 2 },
  { cells: S(['###', '#..', '#..']), weight: 1 },
  { cells: S(['###', '..#', '..#']), weight: 1 },
  { cells: S(['#..', '#..', '###']), weight: 1 },
  { cells: S(['..#', '..#', '###']), weight: 1 },
  { cells: S(['###', '.#.']), weight: 2 },
  { cells: S(['.#.', '###']), weight: 2 },
  { cells: S(['#.', '##', '#.']), weight: 2 },
  { cells: S(['.#', '##', '.#']), weight: 2 },
  { cells: S(['.##', '##.']), weight: 2 },
  { cells: S(['##.', '.##']), weight: 2 },
  { cells: S(['#.', '##', '.#']), weight: 2 },
  { cells: S(['.#', '##', '#.']), weight: 2 },
  { cells: S(['###', '#.#']), weight: 1 },
  { cells: S(['#..', '###']), weight: 2 },
  { cells: S(['..#', '###']), weight: 2 },
  { cells: S(['###', '#..']), weight: 2 },
  { cells: S(['###', '..#']), weight: 2 },
]

export const canPlace = (b: Board, cells: Cell[], x: number, y: number): boolean =>
  cells.every(([cx, cy]) => {
    const px = x + cx
    const py = y + cy
    return px >= 0 && py >= 0 && px < b.w && py < b.h && !b.g[py * b.w + px]
  })

export function anyFits(b: Board, cells: Cell[]): boolean {
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) if (canPlace(b, cells, x, y)) return true
  return false
}

/** Clears full rows AND columns at once (no gravity). Returns what was cleared. */
export function clearRowsCols(b: Board): { rows: number[]; cols: number[] } {
  const rows: number[] = []
  const cols: number[] = []
  for (let y = 0; y < b.h; y++) if (Array.from({ length: b.w }, (_, x) => b.g[y * b.w + x]).every(Boolean)) rows.push(y)
  for (let x = 0; x < b.w; x++) if (Array.from({ length: b.h }, (_, y) => b.g[y * b.w + x]).every(Boolean)) cols.push(x)
  for (const y of rows) for (let x = 0; x < b.w; x++) b.g[y * b.w + x] = 0
  for (const x of cols) for (let y = 0; y < b.h; y++) b.g[y * b.w + x] = 0
  return { rows, cols }
}

/** Deals `n` shapes (indices into BLAST_SHAPES); at least one is guaranteed to fit if any shape can. */
export function dealBlast(rng: Rng, b: Board, n = 3): number[] {
  const total = BLAST_SHAPES.reduce((s, x) => s + x.weight, 0)
  const pick = () => {
    let r = rng() * total
    for (let i = 0; i < BLAST_SHAPES.length; i++) {
      r -= BLAST_SHAPES[i].weight
      if (r <= 0) return i
    }
    return 0
  }
  let out: number[] = []
  for (let t = 0; t < 30; t++) {
    out = Array.from({ length: n }, pick)
    if (out.some((i) => anyFits(b, BLAST_SHAPES[i].cells))) return out
  }
  return out
}
