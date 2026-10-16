// Pure match-3 rules: runs, special pieces, cascades planning, gravity and board generation.
import type { Rng } from '../kit'

export interface Cell { k: number; s: number }
export type Grid<T extends Cell = Cell> = (T | null)[]

/** Special piece types. */
export const SP = { none: 0, row: 1, col: 2, bomb: 3, color: 4 } as const
/** Kind used by colour bombs (never matches anything). */
export const WILD = 100

export interface Run { cells: number[]; horiz: boolean; k: number }
export interface Plan {
  /** Cells that are removed this step (includes everything triggered by specials). */
  clear: number[]
  /** Cells that turn into a special piece instead of being removed. */
  spawn: { idx: number; s: number }[]
  /** Number of special pieces that were triggered. */
  fired: number
}

export function runs(g: Grid, n: number): Run[] {
  const out: Run[] = []
  for (let a = 0; a < n; a++) {
    for (const horiz of [true, false]) {
      let start = 0
      for (let b = 1; b <= n; b++) {
        const at = (i: number) => (horiz ? g[a * n + i] : g[i * n + a])
        const prev = at(b - 1)
        const cur = b < n ? at(b) : null
        if (cur && prev && cur.k === prev.k && cur.k < WILD && cur.k >= 0) continue
        const len = b - start
        const first = at(start)
        if (len >= 3 && first && first.k < WILD && first.k >= 0) {
          const cells: number[] = []
          for (let i = start; i < b; i++) cells.push(horiz ? a * n + i : i * n + a)
          out.push({ cells, horiz, k: first.k })
        }
        start = b
      }
    }
  }
  return out
}

/** Add everything a special at idx destroys; chains into other specials. */
function expand(g: Grid, n: number, seed: Iterable<number>, clear: Set<number>, targetK: Map<number, number>): number {
  const queue = [...seed]
  const fired = new Set<number>()
  for (const i of queue) clear.add(i)
  while (queue.length) {
    const i = queue.shift()!
    const c = g[i]
    if (!c || c.s === SP.none || fired.has(i)) continue
    fired.add(i)
    const x = i % n
    const y = Math.floor(i / n)
    const add = (j: number) => {
      if (!clear.has(j) && g[j]) {
        clear.add(j)
        queue.push(j)
      }
    }
    if (c.s === SP.row) for (let q = 0; q < n; q++) add(y * n + q)
    else if (c.s === SP.col) for (let q = 0; q < n; q++) add(q * n + x)
    else if (c.s === SP.bomb) {
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const xx = x + dx
        const yy = y + dy
        if (xx >= 0 && yy >= 0 && xx < n && yy < n) add(yy * n + xx)
      }
    } else if (c.s === SP.color) {
      let tk = targetK.get(i)
      if (tk === undefined) {
        const cnt = new Map<number, number>()
        for (const o of g) if (o && o.k < WILD) cnt.set(o.k, (cnt.get(o.k) ?? 0) + 1)
        tk = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0
      }
      if (tk === -2) for (let j = 0; j < g.length; j++) add(j)
      else for (let j = 0; j < g.length; j++) if (g[j]?.k === tk) add(j)
    }
  }
  return fired.size
}

/** Plan the clearing of all current matches. pivots: preferred cells (the swapped ones) for new specials. */
export function planClear(g: Grid, n: number, pivots: number[] = []): Plan | null {
  const rs = runs(g, n)
  if (!rs.length) return null
  // Merge runs that share cells.
  const owner = rs.map((_, i) => i)
  const find = (i: number): number => (owner[i] === i ? i : (owner[i] = find(owner[i])))
  const byCell = new Map<number, number>()
  rs.forEach((r, i) => {
    for (const c of r.cells) {
      const o = byCell.get(c)
      if (o === undefined) byCell.set(c, i)
      else owner[find(i)] = find(o)
    }
  })
  const comps = new Map<number, Run[]>()
  rs.forEach((r, i) => {
    const f = find(i)
    if (!comps.has(f)) comps.set(f, [])
    comps.get(f)!.push(r)
  })
  const matched = new Set<number>()
  const spawn: { idx: number; s: number }[] = []
  for (const comp of comps.values()) {
    const cells = new Set<number>()
    for (const r of comp) for (const c of r.cells) cells.add(c)
    for (const c of cells) matched.add(c)
    const longest = comp.reduce((a, b) => (b.cells.length > a.cells.length ? b : a))
    const hasH = comp.some((r) => r.horiz)
    const hasV = comp.some((r) => !r.horiz)
    let s: number = SP.none
    if (longest.cells.length >= 5) s = SP.color
    else if (hasH && hasV) s = SP.bomb
    else if (longest.cells.length === 4) s = longest.horiz ? SP.row : SP.col
    if (s === SP.none) continue
    let idx = pivots.find((p) => cells.has(p)) ?? -1
    if (idx < 0 && s === SP.bomb) {
      // intersection cell of an H and a V run
      const hs = new Set(comp.filter((r) => r.horiz).flatMap((r) => r.cells))
      idx = comp.filter((r) => !r.horiz).flatMap((r) => r.cells).find((c) => hs.has(c)) ?? -1
    }
    if (idx < 0) idx = longest.cells[Math.floor(longest.cells.length / 2)]
    const cell = g[idx]!
    if (cell.s !== SP.none) continue // an existing special simply fires
    spawn.push({ idx, s })
  }
  const skip = new Set(spawn.map((p) => p.idx))
  const clear = new Set<number>()
  const seed = [...matched].filter((c) => !skip.has(c))
  const fired = expand(g, n, seed, clear, new Map())
  for (const sp of spawn) clear.delete(sp.idx)
  return { clear: [...clear], spawn, fired }
}

/** Plan after cells a and b have been swapped in g. Handles colour bombs and special+special swaps. */
export function planAfterSwap(g: Grid, n: number, a: number, b: number): Plan | null {
  const ca = g[a]
  const cb = g[b]
  if (!ca || !cb) return null
  const clear = new Set<number>()
  const tk = new Map<number, number>()
  if (ca.s === SP.color || cb.s === SP.color) {
    const bombs = [a, b].filter((i) => g[i]!.s === SP.color)
    for (const i of bombs) {
      const other = g[i === a ? b : a]!
      tk.set(i, bombs.length === 2 ? -2 : other.k < WILD ? other.k : -2)
    }
    const fired = expand(g, n, bombs, clear, tk)
    return { clear: [...clear], spawn: [], fired }
  }
  if (ca.s !== SP.none && cb.s !== SP.none) {
    const fired = expand(g, n, [a, b], clear, tk)
    return { clear: [...clear], spawn: [], fired }
  }
  return planClear(g, n, [a, b])
}

/** Find a legal swap [a,b]; null when the board is stuck. */
export function findMoves(g: Grid, n: number): [number, number][] {
  const out: [number, number][] = []
  const swap = (a: number, b: number) => {
    const t = g[a]
    g[a] = g[b]
    g[b] = t
  }
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const a = y * n + x
      for (const b of [a + 1, a + n]) {
        if (b === a + 1 && x === n - 1) continue
        if (b >= n * n) continue
        swap(a, b)
        if (planAfterSwap(g, n, a, b)) out.push([a, b])
        swap(a, b)
      }
    }
  }
  return out
}
export const hasMove = (g: Grid, n: number) => findMoves(g, n).length > 0

/** Random board with no matches and at least one move. */
export function genBoard(rng: Rng, n: number, kinds: number): Cell[] {
  for (;;) {
    const g: Cell[] = []
    for (let i = 0; i < n * n; i++) {
      const x = i % n
      const y = Math.floor(i / n)
      let k: number
      do k = rng.int(0, kinds - 1)
      while ((x >= 2 && g[i - 1].k === k && g[i - 2].k === k) || (y >= 2 && g[i - n].k === k && g[i - 2 * n].k === k))
      g.push({ k, s: 0 })
    }
    if (hasMove(g, n)) return g
  }
}

/** Rearrange the kinds (specials stay where they are) until there is no match but a move exists. */
export function reshuffle(g: Grid, n: number, rng: Rng, kinds: number) {
  const idx = g.map((c, i) => (c && c.s === SP.none ? i : -1)).filter((i) => i >= 0)
  const vals = idx.map((i) => g[i]!.k)
  for (let tries = 0; tries < 300; tries++) {
    rng.shuffle(vals)
    idx.forEach((i, j) => (g[i]!.k = vals[j]))
    if (!runs(g, n).length && hasMove(g, n)) return
  }
  const fresh = genBoard(rng, n, kinds)
  idx.forEach((i) => (g[i]!.k = fresh[i].k))
  for (let i = 0; i < g.length; i++) if (g[i] && g[i]!.s !== SP.none) g[i]!.s = SP.none
}

/**
 * Gravity: pieces fall down within columns, new pieces fill from the top.
 * onMove(from,to) for existing pieces, make() creates new ones (reported via onNew(idx, piece, depth)).
 */
export function drop<T extends Cell>(g: Grid<T>, n: number, make: () => T, onNew: (idx: number, piece: T, depth: number) => void) {
  for (let x = 0; x < n; x++) {
    let write = n - 1
    for (let y = n - 1; y >= 0; y--) {
      const c = g[y * n + x]
      if (c) {
        if (write !== y) {
          g[write * n + x] = c
          g[y * n + x] = null
        }
        write--
      }
    }
    const missing = write + 1
    for (let y = write; y >= 0; y--) {
      const p = make()
      g[y * n + x] = p
      onNew(y * n + x, p, missing - y)
    }
  }
}
