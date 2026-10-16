// Ball / water sort logic: legal moves, solved test, BFS solver and a reverse-move level generator.
import type { Rng } from '../kit'

export type Tubes = number[][]

/** How many balls would move from -> to (0 = illegal). `multi` pours the whole top run (water sort). */
export function moveCount(tubes: Tubes, cap: number, from: number, to: number, multi: boolean): number {
  if (from === to) return 0
  const a = tubes[from]
  const b = tubes[to]
  if (!a.length || b.length >= cap) return 0
  const c = a[a.length - 1]
  if (b.length && b[b.length - 1] !== c) return 0
  if (!multi) return 1
  let run = 0
  while (run < a.length && a[a.length - 1 - run] === c) run++
  return Math.min(run, cap - b.length)
}

export function applyMove(tubes: Tubes, cap: number, from: number, to: number, multi: boolean): number {
  const n = moveCount(tubes, cap, from, to, multi)
  for (let i = 0; i < n; i++) tubes[to].push(tubes[from].pop()!)
  return n
}

export const isSortSolved = (tubes: Tubes, cap: number): boolean => tubes.every((t) => !t.length || (t.length === cap && t.every((c) => c === t[0])))

const key = (t: Tubes) => t.map((x) => x.join('.')).join('|')

/** BFS solver for small boards. Returns [from,to] moves or null. */
export function solveSort(start: Tubes, cap: number, multi: boolean, limit = 200000): [number, number][] | null {
  if (isSortSolved(start, cap)) return []
  const prev = new Map<string, { from: string; m: [number, number] }>()
  const k0 = key(start)
  prev.set(k0, { from: '', m: [0, 0] })
  let q: Tubes[] = [start.map((t) => t.slice())]
  while (q.length && prev.size < limit) {
    const next: Tubes[] = []
    for (const s of q) {
      const ks = key(s)
      for (let i = 0; i < s.length; i++) for (let j = 0; j < s.length; j++) {
        if (!moveCount(s, cap, i, j, multi)) continue
        const n = s.map((t) => t.slice())
        applyMove(n, cap, i, j, multi)
        const kn = key(n)
        if (prev.has(kn)) continue
        prev.set(kn, { from: ks, m: [i, j] })
        if (isSortSolved(n, cap)) {
          const out: [number, number][] = []
          for (let c = kn; c !== k0; c = prev.get(c)!.from) out.push(prev.get(c)!.m)
          return out.reverse()
        }
        next.push(n)
      }
    }
    q = next
  }
  return null
}

export interface SortLevel {
  tubes: Tubes
  cap: number
  /** A known solution (forward moves). */
  solution: [number, number][]
}

export interface SortOpts {
  colors: number
  cap: number
  empty: number
  multi: boolean
}

/** Start solved, then apply random *reverse* moves, so the result is solvable by construction. */
export function genSort(rng: Rng, o: SortOpts): SortLevel {
  const { colors, cap, empty, multi } = o
  const tubes: Tubes = []
  for (let c = 0; c < colors; c++) tubes.push(Array(cap).fill(c))
  for (let i = 0; i < empty; i++) tubes.push([])
  const rev: [number, number][] = []
  const mixed = () => tubes.filter((t) => t.length && !t.every((c) => c === t[0])).length
  const target = Math.max(2, Math.ceil(colors * 0.9))
  for (let step = 0; step < colors * cap * 40; step++) {
    if (step > colors * cap * 3 && mixed() >= target) break
    const to = rng.int(0, tubes.length - 1) // tube receiving the ball in reverse (= source of the forward move)
    const y = rng.int(0, tubes.length - 1) // tube losing it in reverse (= destination of the forward move)
    if (to === y || !tubes[y].length || tubes[to].length >= cap) continue
    const Y = tubes[y]
    const c = Y[Y.length - 1]
    let run = 0
    while (run < Y.length && Y[Y.length - 1 - run] === c) run++
    const X = tubes[to]
    if (!multi) {
      if (Y.length > 1 && Y[Y.length - 2] !== c) continue
      X.push(Y.pop()!)
      rev.push([to, y])
    } else {
      if (X.length && X[X.length - 1] === c) continue
      const room = Math.min(run, cap - X.length)
      const ks: number[] = []
      for (let k = 1; k <= room; k++) if (k < run || k === Y.length) ks.push(k)
      if (!ks.length) continue
      const k = rng.pick(ks)
      for (let i = 0; i < k; i++) X.push(Y.pop()!)
      rev.push([to, y])
    }
  }
  if (isSortSolved(tubes, cap)) return genSort(rng, o)
  return { tubes, cap, solution: rev.reverse() }
}
