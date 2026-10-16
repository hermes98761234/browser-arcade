// Pure logic for toggle puzzles: Lights Out, Flood-It, hue sorting, laser mirrors and symmetry.
import type { Rng } from '../kit'

// ---------- Lights Out ----------
export function press(g: boolean[], n: number, i: number) {
  const x = i % n
  const y = Math.floor(i / n)
  g[i] = !g[i]
  if (x > 0) g[i - 1] = !g[i - 1]
  if (x < n - 1) g[i + 1] = !g[i + 1]
  if (y > 0) g[i - n] = !g[i - n]
  if (y < n - 1) g[i + n] = !g[i + n]
}
/** Solvable board built by random presses from all-off. `solution` = cells to press (each once). */
export function genLights(n: number, rng: Rng, presses: number): { grid: boolean[]; solution: Set<number> } {
  for (;;) {
    const grid = new Array<boolean>(n * n).fill(false)
    const sol = new Set<number>()
    for (let k = 0; k < presses; k++) {
      const i = rng.int(0, n * n - 1)
      press(grid, n, i)
      if (sol.has(i)) sol.delete(i)
      else sol.add(i)
    }
    if (grid.some(Boolean)) return { grid, solution: sol }
  }
}

// ---------- Flood-It ----------
export function genFlood(n: number, colors: number, rng: Rng): number[] {
  return Array.from({ length: n * n }, () => rng.int(0, colors - 1))
}
/** Region connected to the corner (cell 0) with its current colour. */
export function region(g: number[], n: number): number[] {
  const c = g[0]
  const seen = new Set([0])
  const q = [0]
  for (let h = 0; h < q.length; h++) {
    const i = q[h]
    const x = i % n
    const y = Math.floor(i / n)
    for (const [ok, j] of [[x > 0, i - 1], [x < n - 1, i + 1], [y > 0, i - n], [y < n - 1, i + n]] as const) {
      if (ok && g[j] === c && !seen.has(j)) {
        seen.add(j)
        q.push(j)
      }
    }
  }
  return q
}
/** Flood the corner region with colour c; returns the cells whose colour changed (BFS order). */
export function floodMove(g: number[], n: number, c: number): number[] {
  if (g[0] === c) return []
  const r = region(g, n)
  for (const i of r) g[i] = c
  return r
}
export const isFlooded = (g: number[]) => g.every((v) => v === g[0])
/** Greedy solver (pick the colour that grows the region most); returns the move count. */
export function greedyFlood(g0: number[], n: number, colors: number): number {
  const g = g0.slice()
  let moves = 0
  while (!isFlooded(g) && moves < 500) {
    let best = -1
    let bestSize = -1
    for (let c = 0; c < colors; c++) {
      if (c === g[0]) continue
      const t = g.slice()
      floodMove(t, n, c)
      const s = region(t, n).length
      if (s > bestSize) {
        bestSize = s
        best = c
      }
    }
    floodMove(g, n, best)
    moves++
  }
  return moves
}

// ---------- Hue sort ----------
export type RGB = [number, number, number]
const hsl = (h: number, s: number, l: number): RGB => {
  const a = s * Math.min(l, 1 - l)
  const f = (k: number) => {
    const m = (k + h / 30) % 12
    return l - a * Math.max(-1, Math.min(m - 3, 9 - m, 1))
  }
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}
/** Smooth two-axis gradient (hue drifts along x and y, lightness along y); index = y*n + x. */
export function hueGradient(n: number, rng: Rng): RGB[] {
  const h0 = rng.range(0, 360)
  const a = rng.range(70, 120)
  const b = rng.range(60, 110)
  const out: RGB[] = []
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const u = x / (n - 1)
      const v = y / (n - 1)
      out.push(hsl(h0 + u * a + v * b, 0.8, 0.7 - 0.28 * v + 0.06 * u))
    }
  }
  return out
}
/** Shuffle everything except locked cells; returns perm[cell] = tile id. */
export function shuffleHue(n: number, locked: Set<number>, rng: Rng): number[] {
  const free = [...Array(n * n).keys()].filter((i) => !locked.has(i))
  for (;;) {
    const vals = rng.shuffle(free.slice())
    const p = [...Array(n * n).keys()]
    free.forEach((c, i) => (p[c] = vals[i]))
    if (p.some((v, i) => v !== i)) return p
  }
}
/** Minimum swaps to sort (n - cycles). */
export function minSwaps(p: number[]): number {
  const seen = new Array(p.length).fill(false)
  let swaps = 0
  for (let i = 0; i < p.length; i++) {
    if (seen[i]) continue
    let j = i
    let len = 0
    while (!seen[j]) {
      seen[j] = true
      j = p[j]
      len++
    }
    swaps += len - 1
  }
  return swaps
}

// ---------- Laser mirrors ----------
/** '/' = 1, '\\' = 2, 0 none. */
export interface LaserLevel { n: number; src: number; mirrors: number[]; solution: number[]; targets: number[] }
export const DIRS: [number, number][] = [[1, 0], [0, 1], [-1, 0], [0, -1]]

/** Trace the beam from the source (it starts to the right). Returns visited cells in order and the exit flag. */
export function trace(n: number, src: number, mirrors: number[]): { cells: number[]; dirs: number[] } {
  const cells: number[] = []
  const dirs: number[] = []
  let x = (src % n) + 1
  let y = Math.floor(src / n)
  let d = 0
  for (let step = 0; step < n * n * 4; step++) {
    if (x < 0 || y < 0 || x >= n || y >= n) break
    const i = y * n + x
    const m = mirrors[i]
    if (m === 1) d = [3, 2, 1, 0][d] // '/': right->up, down->left, left->down, up->right
    else if (m === 2) d = [1, 0, 3, 2][d] // '\': right->down, down->right, left->up, up->left
    cells.push(i)
    dirs.push(d)
    x += DIRS[d][0]
    y += DIRS[d][1]
  }
  return { cells, dirs }
}

/** Generate a solvable level working backwards from a random beam path. */
export function genLaser(n: number, mirrorsWanted: number, nTargets: number, decoys: number, rng: Rng): LaserLevel {
  for (let attempt = 0; attempt < 400; attempt++) {
    const sy = rng.int(1, n - 2)
    const src = sy * n
    const used = new Set([src])
    const sol = new Array(n * n).fill(0)
    let x = 1
    let y = sy
    let d = 0
    let placed = 0
    const path: number[] = []
    let ok = true
    for (let step = 0; step < n * n; step++) {
      if (x < 0 || y < 0 || x >= n || y >= n) break
      const i = y * n + x
      if (used.has(i)) {
        ok = false
        break
      }
      used.add(i)
      path.push(i)
      const remaining = mirrorsWanted - placed
      if (remaining > 0 && rng.chance(0.4)) {
        // turn left or right if the next cell is free and in bounds
        const opts = [(d + 1) % 4, (d + 3) % 4].filter((nd) => {
          const nx = x + DIRS[nd][0]
          const ny = y + DIRS[nd][1]
          return nx >= 0 && ny >= 0 && nx < n && ny < n && !used.has(ny * n + nx)
        })
        if (opts.length) {
          const nd = rng.pick(opts)
          // choose mirror type that maps d -> nd
          const slash = [3, 2, 1, 0][d] === nd
          sol[i] = slash ? 1 : 2
          placed++
          d = nd
        }
      }
      x += DIRS[d][0]
      y += DIRS[d][1]
    }
    if (!ok || placed < Math.min(2, mirrorsWanted)) continue
    const straight = path.filter((c) => !sol[c])
    if (straight.length < nTargets) continue
    const targets = rng.shuffle(straight.slice()).slice(0, nTargets)
    // decoy mirrors on cells the solution beam never touches
    const free = [...Array(n * n).keys()].filter((c) => !used.has(c))
    const decoyCells = rng.shuffle(free).slice(0, decoys)
    const solution = sol.slice()
    for (const c of decoyCells) solution[c] = rng.pick([1, 2])
    // the beam must still hit the targets with decoys present (decoys are off-path so it does)
    const t = trace(n, src, solution)
    if (!targets.every((c) => t.cells.includes(c))) continue
    // scramble orientations: flip a random subset (at least one)
    const mirrors = solution.slice()
    const mcells = mirrors.map((m, i) => (m ? i : -1)).filter((i) => i >= 0)
    for (const c of mcells) if (rng.chance(0.6)) mirrors[c] = 3 - mirrors[c]
    if (targets.every((c) => trace(n, src, mirrors).cells.includes(c))) continue
    return { n, src, mirrors, solution, targets }
  }
  throw new Error('laser generation failed')
}
export const lasersolved = (l: LaserLevel, mirrors: number[]) => {
  const t = trace(l.n, l.src, mirrors).cells
  return l.targets.every((c) => t.includes(c))
}

// ---------- Symmetry ----------
export type Sym = 'v' | 'h' | 'both' | 'point'
/** Partner cells (mirror images) of cell i. */
export function partners(n: number, sym: Sym, i: number): number[] {
  const x = i % n
  const y = Math.floor(i / n)
  const mx = y * n + (n - 1 - x)
  const my = (n - 1 - y) * n + x
  const mp = (n - 1 - y) * n + (n - 1 - x)
  return sym === 'v' ? [mx] : sym === 'h' ? [my] : sym === 'both' ? [mx, my, mp] : [mp]
}
/** The cells the player may edit (the rest are given and define the pattern). */
export function givenCells(n: number, sym: Sym): Set<number> {
  const out = new Set<number>()
  const half = n / 2
  for (let i = 0; i < n * n; i++) {
    const x = i % n
    const y = Math.floor(i / n)
    const g = sym === 'v' ? x < half : sym === 'h' ? y < half : sym === 'both' ? x < half && y < half : y < half
    if (g) out.add(i)
  }
  return out
}
export function symmetric(g: number[], n: number, sym: Sym): boolean {
  return g.every((v, i) => partners(n, sym, i).every((p) => g[p] === v))
}
export function genSymmetry(n: number, sym: Sym, colors: number, rng: Rng): { grid: number[]; given: Set<number>; target: number[] } {
  const given = givenCells(n, sym)
  const target = new Array(n * n).fill(0)
  for (const i of given) target[i] = rng.int(0, colors - 1)
  for (const i of given) for (const p of partners(n, sym, i)) target[p] = target[i]
  const grid = target.slice()
  for (let i = 0; i < n * n; i++) if (!given.has(i)) grid[i] = rng.int(0, colors - 1)
  if (symmetric(grid, n, sym)) {
    const free = [...Array(n * n).keys()].filter((i) => !given.has(i))
    const i = rng.pick(free)
    grid[i] = (grid[i] + 1) % colors
  }
  return { grid, given, target }
}
