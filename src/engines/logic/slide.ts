// Pure logic for sliding / rotating tile puzzles: slide-15 shuffles, 2x2 twists, row rolls, jigsaw swaps and pipe networks.
import type { Rng } from '../kit'

/** perm[cell] = tile id. The blank (slide mode) is the last id. */
export type Perm = number[]
export const identity = (n: number): Perm => Array.from({ length: n * n }, (_, i) => i)
export const isSolved = (p: Perm) => p.every((v, i) => v === i)

/** Slide the tile(s) at `cell` towards the blank if they share a row/column. Returns the moved cell list (old positions, blank-side first) or []. */
export function slideTo(p: Perm, n: number, cell: number): number[] {
  const blank = p.indexOf(p.length - 1)
  const bx = blank % n
  const by = Math.floor(blank / n)
  const cx = cell % n
  const cy = Math.floor(cell / n)
  if (cell === blank || (bx !== cx && by !== cy)) return []
  const dx = Math.sign(bx - cx)
  const dy = Math.sign(by - cy)
  const moved: number[] = []
  let x = bx
  let y = by
  while (x !== cx || y !== cy) {
    const px = x - dx
    const py = y - dy
    p[y * n + x] = p[py * n + px]
    moved.push(py * n + px)
    x = px
    y = py
  }
  p[cell] = p.length - 1
  return moved
}

/** Shuffle by random legal moves from the solved state (always solvable). */
export function shuffleSlide(n: number, rng: Rng, steps: number): Perm {
  const p = identity(n)
  let blank = p.length - 1
  let prev = -1
  for (let i = 0; i < steps || isSolved(p); i++) {
    const x = blank % n
    const y = Math.floor(blank / n)
    const opts: number[] = []
    if (x > 0) opts.push(blank - 1)
    if (x < n - 1) opts.push(blank + 1)
    if (y > 0) opts.push(blank - n)
    if (y < n - 1) opts.push(blank + n)
    const choices = opts.filter((o) => o !== prev)
    const to = rng.pick(choices.length ? choices : opts)
    p[blank] = p[to]
    p[to] = p.length - 1
    prev = blank
    blank = to
  }
  return p
}

/** Is a slide permutation solvable (inversion parity rule)? */
export function slideSolvable(p: Perm, n: number): boolean {
  const blankId = p.length - 1
  const arr = p.filter((v) => v !== blankId)
  let inv = 0
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) if (arr[i] > arr[j]) inv++
  if (n % 2 === 1) return inv % 2 === 0
  const rowFromBottom = n - Math.floor(p.indexOf(blankId) / n)
  return (inv + rowFromBottom) % 2 === 1
}

/** Rotate the 2x2 block whose top-left cell is (x,y). cw by default. */
export function twist(p: Perm, n: number, x: number, y: number, cw = true) {
  const a = y * n + x
  const ring = cw ? [a, a + 1, a + 1 + n, a + n] : [a, a + n, a + 1 + n, a + 1]
  const last = p[ring[3]]
  for (let i = 3; i > 0; i--) p[ring[i]] = p[ring[i - 1]]
  p[ring[0]] = last
}
export function shuffleTwist(n: number, rng: Rng, steps: number): Perm {
  const p = identity(n)
  for (let i = 0; i < steps || isSolved(p); i++) twist(p, n, rng.int(0, n - 2), rng.int(0, n - 2), rng.chance(0.5))
  return p
}

/** Cyclically shift a row (dir +1 right / -1 left) or column (+1 down / -1 up). */
export function roll(p: Perm, n: number, row: boolean, idx: number, dir: 1 | -1) {
  const cells = Array.from({ length: n }, (_, i) => (row ? idx * n + i : i * n + idx))
  const vals = cells.map((c) => p[c])
  cells.forEach((c, i) => (p[c] = vals[(i - dir + n) % n]))
}
export function shuffleRoll(n: number, rng: Rng, steps: number): Perm {
  const p = identity(n)
  for (let i = 0; i < steps || isSolved(p); i++) roll(p, n, rng.chance(0.5), rng.int(0, n - 1), rng.chance(0.5) ? 1 : -1)
  return p
}

/** Random permutation that is not the identity (jigsaw). */
export function shuffleSwap(n: number, rng: Rng): Perm {
  const p = identity(n)
  do rng.shuffle(p)
  while (isSolved(p))
  return p
}

// ---------- pipes ----------

export const N_ = 1
export const E_ = 2
export const S_ = 4
export const W_ = 8
/** Rotate a 4-bit edge mask clockwise. */
export const rotMask = (m: number) => ((m << 1) | (m >> 3)) & 15
export const bitsOf = (m: number) => (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) + ((m >> 3) & 1)

export interface Pipes { n: number; masks: number[]; src: number }

/** Random spanning tree of the n x n grid rooted at the centre; masks are the tree edges per cell. */
export function genPipes(n: number, rng: Rng): Pipes {
  const src = Math.floor(n / 2) * n + Math.floor(n / 2)
  const masks = new Array(n * n).fill(0)
  const seen = new Set([src])
  const frontier = [src]
  while (frontier.length < 1e9 && frontier.length) {
    const fi = rng.chance(0.65) ? frontier.length - 1 : rng.int(0, frontier.length - 1)
    const c = frontier[fi]
    const x = c % n
    const y = Math.floor(c / n)
    const opts: [number, number, number][] = []
    if (y > 0) opts.push([c - n, N_, S_])
    if (x < n - 1) opts.push([c + 1, E_, W_])
    if (y < n - 1) opts.push([c + n, S_, N_])
    if (x > 0) opts.push([c - 1, W_, E_])
    const free = opts.filter((o) => !seen.has(o[0]))
    if (!free.length) {
      frontier.splice(fi, 1)
      continue
    }
    const [to, a, b] = rng.pick(free)
    masks[c] |= a
    masks[to] |= b
    seen.add(to)
    frontier.push(to)
  }
  return { n, masks, src }
}

/** BFS from the source over matching edges; returns distance per cell (-1 = unpowered). */
export function powered(masks: number[], n: number, src: number): number[] {
  const dist = new Array(n * n).fill(-1)
  dist[src] = 0
  const q = [src]
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    const x = c % n
    const y = Math.floor(c / n)
    const tryGo = (ok: boolean, to: number, a: number, b: number) => {
      if (ok && masks[c] & a && masks[to] & b && dist[to] < 0) {
        dist[to] = dist[c] + 1
        q.push(to)
      }
    }
    tryGo(y > 0, c - n, N_, S_)
    tryGo(x < n - 1, c + 1, E_, W_)
    tryGo(y < n - 1, c + n, S_, N_)
    tryGo(x > 0, c - 1, W_, E_)
  }
  return dist
}
export const pipesSolved = (masks: number[], n: number, src: number) => powered(masks, n, src).every((d) => d >= 0)

/** Scramble by random rotations; returns the scrambled masks (never already solved). */
export function scramblePipes(p: Pipes, rng: Rng): number[] {
  let m: number[]
  do m = p.masks.map((v) => { let r = rng.int(0, 3); while (r--) v = rotMask(v); return v })
  while (pipesSolved(m, p.n, p.src))
  return m
}
/** Fewest clicks (left-click clockwise / right-click counter-clockwise) to match the original tree orientation. */
export function optimalPipeMoves(orig: number[], cur: number[]): number {
  let total = 0
  for (let i = 0; i < orig.length; i++) {
    let m = cur[i]
    for (let r = 0; r < 4; r++) {
      if (m === orig[i]) {
        total += Math.min(r, 4 - r)
        break
      }
      m = rotMask(m)
    }
  }
  return total
}
