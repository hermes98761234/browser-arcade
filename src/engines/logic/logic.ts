// Pure logic for grid logic puzzles: minesweeper, sudoku, nonogram, akari (light up) and binairo (takuzu).
import type { Rng } from '../kit'

// =====================================================================
// Minesweeper (square or hex grids, odd-r offset rows for hex)
// =====================================================================
export type Topo = 'sq' | 'hex'

export function neighbors(topo: Topo, cols: number, rows: number, i: number): number[] {
  const x = i % cols
  const y = Math.floor(i / cols)
  const out: number[] = []
  const deltas: [number, number][] =
    topo === 'sq'
      ? [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]
      : y % 2 === 0
        ? [[-1, -1], [0, -1], [-1, 0], [1, 0], [-1, 1], [0, 1]]
        : [[0, -1], [1, -1], [-1, 0], [1, 0], [0, 1], [1, 1]]
  for (const [dx, dy] of deltas) {
    const nx = x + dx
    const ny = y + dy
    if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) out.push(ny * cols + nx)
  }
  return out
}

/** Place mines randomly, never on `safe` or (when room allows) its neighbours: the first click is always a safe opening. */
export function placeMines(topo: Topo, cols: number, rows: number, mines: number, safe: number, rng: Rng): boolean[] {
  const total = cols * rows
  const avoid = new Set([safe, ...neighbors(topo, cols, rows, safe)])
  if (total - avoid.size < mines) {
    avoid.clear()
    avoid.add(safe)
  }
  const cells = rng.shuffle([...Array(total).keys()].filter((i) => !avoid.has(i)))
  const m = new Array<boolean>(total).fill(false)
  for (const c of cells.slice(0, mines)) m[c] = true
  return m
}
export function mineCounts(topo: Topo, cols: number, rows: number, mine: boolean[]): number[] {
  return mine.map((_, i) => neighbors(topo, cols, rows, i).filter((j) => mine[j]).length)
}
/** Reveal i (flood-opens zeros). Returns newly revealed cells. */
export function revealFrom(topo: Topo, cols: number, rows: number, counts: number[], mine: boolean[], revealed: boolean[], flagged: boolean[], i: number): number[] {
  const out: number[] = []
  if (revealed[i] || flagged[i]) return out
  const q = [i]
  revealed[i] = true
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    out.push(c)
    if (counts[c] === 0 && !mine[c]) {
      for (const j of neighbors(topo, cols, rows, c)) {
        if (!revealed[j] && !flagged[j] && !mine[j]) {
          revealed[j] = true
          q.push(j)
        }
      }
    }
  }
  return out
}

// =====================================================================
// Sudoku (N x N, boxes bw x bh)
// =====================================================================
export interface SudokuSpec { n: number; bw: number; bh: number }
export const SUDOKU9: SudokuSpec = { n: 9, bw: 3, bh: 3 }
export const SUDOKU6: SudokuSpec = { n: 6, bw: 3, bh: 2 }

function candidates(g: number[], sp: SudokuSpec, i: number): number {
  const { n, bw, bh } = sp
  const x = i % n
  const y = Math.floor(i / n)
  let used = 0
  for (let k = 0; k < n; k++) {
    used |= 1 << (g[y * n + k] || 0)
    used |= 1 << (g[k * n + x] || 0)
  }
  const bx = x - (x % bw)
  const by = y - (y % bh)
  for (let dy = 0; dy < bh; dy++) for (let dx = 0; dx < bw; dx++) used |= 1 << (g[(by + dy) * n + bx + dx] || 0)
  let c = 0
  for (let v = 1; v <= n; v++) if (!(used & (1 << v))) c |= 1 << v
  return c
}
const bits = (m: number) => {
  let c = 0
  while (m) {
    m &= m - 1
    c++
  }
  return c
}

/** Count solutions up to `limit` (backtracking with minimum-remaining-values). */
export function countSolutions(grid: number[], sp: SudokuSpec, limit = 2): number {
  const g = grid.slice()
  let count = 0
  const rec = (): void => {
    if (count >= limit) return
    let best = -1
    let bestC = 0
    let bestN = 99
    for (let i = 0; i < g.length; i++) {
      if (g[i]) continue
      const c = candidates(g, sp, i)
      const b = bits(c)
      if (b === 0) return
      if (b < bestN) {
        bestN = b
        best = i
        bestC = c
        if (b === 1) break
      }
    }
    if (best < 0) {
      count++
      return
    }
    for (let v = 1; v <= sp.n; v++) {
      if (bestC & (1 << v)) {
        g[best] = v
        rec()
        g[best] = 0
        if (count >= limit) return
      }
    }
  }
  rec()
  return count
}
export function solveSudoku(grid: number[], sp: SudokuSpec): number[] | null {
  const g = grid.slice()
  const rec = (): boolean => {
    let best = -1
    let bestC = 0
    let bestN = 99
    for (let i = 0; i < g.length; i++) {
      if (g[i]) continue
      const c = candidates(g, sp, i)
      const b = bits(c)
      if (b === 0) return false
      if (b < bestN) {
        bestN = b
        best = i
        bestC = c
      }
    }
    if (best < 0) return true
    for (let v = 1; v <= sp.n; v++) {
      if (bestC & (1 << v)) {
        g[best] = v
        if (rec()) return true
        g[best] = 0
      }
    }
    return false
  }
  return rec() ? g : null
}
export function genSudoku(sp: SudokuSpec, givens: number, rng: Rng, symmetric = false): { puzzle: number[]; solution: number[] } {
  const { n } = sp
  const empty = new Array(n * n).fill(0)
  // random full grid: fill diagonal-ish randomly then solve with shuffled value order
  const g = empty.slice()
  const order = rng.shuffle([...Array(n * n).keys()])
  for (const i of order.slice(0, n)) {
    const c = candidates(g, sp, i)
    const vs = rng.shuffle([...Array(n).keys()].map((v) => v + 1).filter((v) => c & (1 << v)))
    if (vs.length) g[i] = vs[0]
  }
  const solution = solveSudoku(g, sp) ?? solveSudoku(empty, sp)!
  const puzzle = solution.slice()
  let filled = n * n
  for (const i of rng.shuffle([...Array(n * n).keys()])) {
    if (filled <= givens) break
    if (!puzzle[i]) continue
    const j = symmetric ? n * n - 1 - i : i
    const a = puzzle[i]
    const b = puzzle[j]
    puzzle[i] = 0
    puzzle[j] = 0
    if (countSolutions(puzzle, sp, 2) === 1) filled -= i === j ? 1 : 2
    else {
      puzzle[i] = a
      puzzle[j] = b
    }
  }
  return { puzzle, solution }
}
/** Cells whose value duplicates another in its row, column or box. */
export function sudokuConflicts(g: number[], sp: SudokuSpec): boolean[] {
  const { n, bw, bh } = sp
  const bad = new Array<boolean>(n * n).fill(false)
  const check = (cells: number[]) => {
    const seen = new Map<number, number>()
    for (const c of cells) {
      const v = g[c]
      if (!v) continue
      if (seen.has(v)) {
        bad[c] = true
        bad[seen.get(v)!] = true
      } else seen.set(v, c)
    }
  }
  for (let k = 0; k < n; k++) {
    check(Array.from({ length: n }, (_, i) => k * n + i))
    check(Array.from({ length: n }, (_, i) => i * n + k))
  }
  for (let by = 0; by < n; by += bh) for (let bx = 0; bx < n; bx += bw) {
    const cells: number[] = []
    for (let dy = 0; dy < bh; dy++) for (let dx = 0; dx < bw; dx++) cells.push((by + dy) * n + bx + dx)
    check(cells)
  }
  return bad
}

// =====================================================================
// Nonogram
// =====================================================================
export function lineClue(line: boolean[]): number[] {
  const out: number[] = []
  let run = 0
  for (const v of line) {
    if (v) run++
    else if (run) {
      out.push(run)
      run = 0
    }
  }
  if (run) out.push(run)
  return out.length ? out : [0]
}
export const rowOf = (g: boolean[], n: number, y: number) => Array.from({ length: n }, (_, x) => g[y * n + x])
export const colOf = (g: boolean[], n: number, x: number) => Array.from({ length: n }, (_, y) => g[y * n + x])

/** Line solver step: known cells are 0 unknown, 1 filled, 2 empty. Returns the refined line or null on contradiction. */
export function solveLine(clue: number[], known: number[]): number[] | null {
  const L = known.length
  const blocks = clue[0] === 0 ? [] : clue
  let canFill = new Array<boolean>(L).fill(false)
  let canEmpty = new Array<boolean>(L).fill(false)
  let any = false
  const cur = new Array<number>(L).fill(2)
  const rec = (pos: number, b: number) => {
    if (b === blocks.length) {
      for (let i = pos; i < L; i++) if (known[i] === 1) return
      any = true
      for (let i = 0; i < L; i++) {
        if (i >= pos) cur[i] = 2
        if (cur[i] === 1) canFill[i] = true
        else canEmpty[i] = true
      }
      return
    }
    const need = blocks.slice(b).reduce((a, c) => a + c, 0) + (blocks.length - b - 1)
    for (let s = pos; s + need <= L; s++) {
      // cells pos..s-1 empty
      let ok = true
      for (let i = pos; i < s; i++) if (known[i] === 1) ok = false
      if (!ok) break
      for (let i = s; i < s + blocks[b]; i++) if (known[i] === 2) ok = false
      if (!ok) continue
      if (b < blocks.length - 1 || s + blocks[b] < L) if (s + blocks[b] < L && known[s + blocks[b]] === 1) continue
      for (let i = pos; i < s; i++) cur[i] = 2
      for (let i = s; i < s + blocks[b]; i++) cur[i] = 1
      if (s + blocks[b] < L) cur[s + blocks[b]] = 2
      rec(Math.min(L, s + blocks[b] + 1), b + 1)
    }
  }
  rec(0, 0)
  if (!any) return null
  const out = known.slice()
  for (let i = 0; i < L; i++) {
    if (canFill[i] && !canEmpty[i]) out[i] = 1
    else if (!canFill[i] && canEmpty[i]) out[i] = 2
  }
  canFill = []
  canEmpty = []
  return out
}
/** Solve by line logic alone. Returns the grid (1/2/0) and whether it is fully determined. */
export function solveNonogram(rowC: number[][], colC: number[][], n: number): { grid: number[]; solved: boolean } {
  const g = new Array<number>(n * n).fill(0)
  let changed = true
  while (changed) {
    changed = false
    for (let y = 0; y < n; y++) {
      const r = solveLine(rowC[y], Array.from({ length: n }, (_, x) => g[y * n + x]))
      if (!r) return { grid: g, solved: false }
      r.forEach((v, x) => {
        if (v !== g[y * n + x]) {
          g[y * n + x] = v
          changed = true
        }
      })
    }
    for (let x = 0; x < n; x++) {
      const r = solveLine(colC[x], Array.from({ length: n }, (_, y) => g[y * n + x]))
      if (!r) return { grid: g, solved: false }
      r.forEach((v, y) => {
        if (v !== g[y * n + x]) {
          g[y * n + x] = v
          changed = true
        }
      })
    }
  }
  return { grid: g, solved: g.every((v) => v !== 0) }
}
export function nonogramClues(pic: boolean[], n: number) {
  return { rows: Array.from({ length: n }, (_, y) => lineClue(rowOf(pic, n, y))), cols: Array.from({ length: n }, (_, x) => lineClue(colOf(pic, n, x))) }
}
/** Random picture solvable by line logic (falls back to the best attempt for large sizes). */
export function genNonogram(n: number, rng: Rng, density = 0.58): { pic: boolean[]; solvable: boolean } {
  let last: boolean[] = []
  for (let attempt = 0; attempt < 80; attempt++) {
    const pic = new Array<boolean>(n * n).fill(false)
    const mirror = rng.chance(0.65)
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < Math.ceil(n / 2); x++) {
        const v = rng.chance(density)
        pic[y * n + x] = v
        if (mirror) pic[y * n + (n - 1 - x)] = v
      }
      if (!mirror) for (let x = Math.ceil(n / 2); x < n; x++) pic[y * n + x] = rng.chance(density)
    }
    if (pic.every((v) => !v) || pic.every(Boolean)) continue
    last = pic
    const { rows, cols } = nonogramClues(pic, n)
    if (solveNonogram(rows, cols, n).solved) return { pic, solvable: true }
  }
  return { pic: last.length ? last : new Array<boolean>(n * n).fill(true), solvable: false }
}

// =====================================================================
// Binairo / Takuzu: cells -1 empty, 0 or 1
// =====================================================================
export function binairoErrors(g: number[], n: number): boolean[] {
  const bad = new Array<boolean>(n * n).fill(false)
  const lines: number[][] = []
  for (let k = 0; k < n; k++) {
    lines.push(Array.from({ length: n }, (_, i) => k * n + i))
    lines.push(Array.from({ length: n }, (_, i) => i * n + k))
  }
  for (const line of lines) {
    for (let i = 0; i + 2 < n; i++) {
      const a = g[line[i]]
      if (a >= 0 && a === g[line[i + 1]] && a === g[line[i + 2]]) bad[line[i]] = bad[line[i + 1]] = bad[line[i + 2]] = true
    }
    for (const v of [0, 1]) if (line.filter((c) => g[c] === v).length > n / 2) for (const c of line) if (g[c] === v) bad[c] = true
  }
  // duplicate complete lines
  const seen = (kind: 'r' | 'c') => {
    const m = new Map<string, number>()
    for (let k = 0; k < n; k++) {
      const cells = Array.from({ length: n }, (_, i) => (kind === 'r' ? k * n + i : i * n + k))
      if (cells.some((c) => g[c] < 0)) continue
      const key = cells.map((c) => g[c]).join('')
      if (m.has(key)) {
        for (const c of cells) bad[c] = true
        const o = m.get(key)!
        for (let i = 0; i < n; i++) bad[kind === 'r' ? o * n + i : i * n + o] = true
      } else m.set(key, k)
    }
  }
  seen('r')
  seen('c')
  return bad
}
export function binairoSolved(g: number[], n: number): boolean {
  return g.every((v) => v >= 0) && !binairoErrors(g, n).some(Boolean)
}
/** Count solutions (up to limit) with local pruning. */
export function binairoCount(grid: number[], n: number, limit = 2): number {
  const g = grid.slice()
  let count = 0
  const localOk = (i: number): boolean => {
    const x = i % n
    const y = Math.floor(i / n)
    const v = g[i]
    const at = (xx: number, yy: number) => (xx >= 0 && yy >= 0 && xx < n && yy < n ? g[yy * n + xx] : -2)
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const a = at(x - dx, y - dy)
      const b = at(x - 2 * dx, y - 2 * dy)
      const c = at(x + dx, y + dy)
      const d = at(x + 2 * dx, y + 2 * dy)
      if ((a === v && b === v) || (a === v && c === v) || (c === v && d === v)) return false
    }
    let rc = 0
    let cc = 0
    for (let k = 0; k < n; k++) {
      if (g[y * n + k] === v) rc++
      if (g[k * n + x] === v) cc++
    }
    return rc <= n / 2 && cc <= n / 2
  }
  const rec = (): void => {
    if (count >= limit) return
    const i = g.indexOf(-1)
    if (i < 0) {
      count += binairoErrors(g, n).some(Boolean) ? 0 : 1
      return
    }
    for (const v of [0, 1]) {
      g[i] = v
      if (localOk(i)) rec()
      g[i] = -1
      if (count >= limit) return
    }
  }
  rec()
  return count
}
export function genBinairo(n: number, rng: Rng, givens: number): { puzzle: number[]; solution: number[] } {
  for (;;) {
    // random full solution by randomised backtracking
    const g = new Array<number>(n * n).fill(-1)
    const ok = (i: number): boolean => {
      const x = i % n
      const y = Math.floor(i / n)
      const v = g[i]
      const at = (xx: number, yy: number) => (xx >= 0 && yy >= 0 && xx < n && yy < n ? g[yy * n + xx] : -2)
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        if (at(x - dx, y - dy) === v && at(x - 2 * dx, y - 2 * dy) === v) return false
      }
      let rc = 0
      let cc = 0
      for (let k = 0; k < n; k++) {
        if (g[y * n + k] === v) rc++
        if (g[k * n + x] === v) cc++
      }
      if (rc > n / 2 || cc > n / 2) return false
      if (x === n - 1) {
        for (let r = 0; r < y; r++) if (Array.from({ length: n }, (_, k) => g[r * n + k] === g[y * n + k]).every(Boolean)) return false
      }
      if (y === n - 1) {
        for (let c = 0; c < x; c++) if (Array.from({ length: n }, (_, k) => g[k * n + c] === g[k * n + x]).every(Boolean)) return false
      }
      return true
    }
    let steps = 0
    const rec = (i: number): boolean => {
      if (++steps > 20000) return false
      if (i === n * n) return true
      for (const v of rng.shuffle([0, 1])) {
        g[i] = v
        if (ok(i) && rec(i + 1)) return true
      }
      g[i] = -1
      return false
    }
    if (!rec(0)) continue
    const solution = g.slice()
    const puzzle = g.slice()
    let filled = n * n
    for (const i of rng.shuffle([...Array(n * n).keys()])) {
      if (filled <= givens) break
      const a = puzzle[i]
      puzzle[i] = -1
      if (binairoCount(puzzle, n, 2) === 1) filled--
      else puzzle[i] = a
    }
    return { puzzle, solution }
  }
}

// =====================================================================
// Akari (light up)
// =====================================================================
export interface Akari { n: number; black: boolean[]; num: number[]; solution: boolean[] }
export function akariLit(black: boolean[], n: number, lamps: boolean[]): boolean[] {
  const lit = new Array<boolean>(n * n).fill(false)
  for (let i = 0; i < n * n; i++) {
    if (!lamps[i]) continue
    lit[i] = true
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let x = (i % n) + dx
      let y = Math.floor(i / n) + dy
      while (x >= 0 && y >= 0 && x < n && y < n && !black[y * n + x]) {
        lit[y * n + x] = true
        x += dx
        y += dy
      }
    }
  }
  return lit
}
export function genAkari(n: number, rng: Rng, blackRate: number, numRate: number): Akari {
  const black = Array.from({ length: n * n }, () => rng.chance(blackRate))
  const lamps = new Array<boolean>(n * n).fill(false)
  let lit = akariLit(black, n, lamps)
  for (const i of rng.shuffle([...Array(n * n).keys()])) {
    if (black[i] || lit[i]) continue
    lamps[i] = true
    lit = akariLit(black, n, lamps)
  }
  const num = new Array<number>(n * n).fill(-1)
  for (let i = 0; i < n * n; i++) {
    if (!black[i] || !rng.chance(numRate)) continue
    const x = i % n
    const y = Math.floor(i / n)
    let c = 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx
      const yy = y + dy
      if (xx >= 0 && yy >= 0 && xx < n && yy < n && lamps[yy * n + xx]) c++
    }
    num[i] = c
  }
  return { n, black, num, solution: lamps }
}
export interface AkariState { lit: boolean[]; bad: boolean[]; numOk: number[]; solved: boolean }
/** numOk: -1 no number, 0 not yet, 1 satisfied, 2 too many. */
export function akariCheck(a: Akari, lamps: boolean[]): AkariState {
  const { n, black, num } = a
  const lit = akariLit(black, n, lamps)
  const bad = new Array<boolean>(n * n).fill(false)
  for (let i = 0; i < n * n; i++) {
    if (!lamps[i]) continue
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      let x = (i % n) + dx
      let y = Math.floor(i / n) + dy
      while (x >= 0 && y >= 0 && x < n && y < n && !black[y * n + x]) {
        if (lamps[y * n + x]) bad[i] = bad[y * n + x] = true
        x += dx
        y += dy
      }
    }
  }
  const numOk = new Array<number>(n * n).fill(-1)
  for (let i = 0; i < n * n; i++) {
    if (num[i] < 0) continue
    const x = i % n
    const y = Math.floor(i / n)
    let c = 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx
      const yy = y + dy
      if (xx >= 0 && yy >= 0 && xx < n && yy < n && lamps[yy * n + xx]) c++
    }
    numOk[i] = c === num[i] ? 1 : c > num[i] ? 2 : 0
  }
  const allLit = black.every((b, i) => b || lit[i])
  return { lit, bad, numOk, solved: allLit && !bad.some(Boolean) && numOk.every((v) => v === -1 || v === 1) }
}
