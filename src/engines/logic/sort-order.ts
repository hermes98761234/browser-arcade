// Ordering puzzles: arrange a shuffled row so ranks ascend. Variants: swap any two, swap neighbours only, pancake flips.
import type { Rng } from '../kit'

export type OrderKind = 'swap' | 'bubble' | 'flip'

export const isOrdered = (a: number[]): boolean => a.every((v, i) => v === i)

export function genOrder(rng: Rng, n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let t = 0; t < 20; t++) {
    rng.shuffle(a)
    if (!isOrdered(a) && a.some((v, i) => Math.abs(v - i) > 1)) return a
  }
  return a.reverse()
}

export const swapAt = (a: number[], i: number, j: number): number[] => {
  const b = a.slice()
  ;[b[i], b[j]] = [b[j], b[i]]
  return b
}

/** Reverse everything from index i to the end (flip a spatula under pancake i). */
export const flipFrom = (a: number[], i: number): number[] => [...a.slice(0, i), ...a.slice(i).reverse()]

export const inversions = (a: number[]): number => {
  let n = 0
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) n++
  return n
}

/** Minimum swaps of any two = n - cycles. */
export function minSwaps(a: number[]): number {
  const seen = new Array(a.length).fill(false)
  let cycles = 0
  for (let i = 0; i < a.length; i++) {
    if (seen[i]) continue
    cycles++
    for (let j = i; !seen[j]; j = a[j]) seen[j] = true
  }
  return a.length - cycles
}

/** Reference move count shown as "par". Flip par is the simple selection-flip bound (2 flips per pancake). */
export function parFor(kind: OrderKind, a: number[]): number {
  return kind === 'bubble' ? inversions(a) : kind === 'swap' ? minSwaps(a) : Math.max(2, a.length * 2 - 3)
}

/** Flip solve (selection by flips) so the player is never stuck; returns the flip indices. */
export function flipSolution(a: number[]): number[] {
  let cur = a.slice()
  const out: number[] = []
  for (let i = 0; i < cur.length; i++) {
    let m = i
    for (let j = i; j < cur.length; j++) if (cur[j] < cur[m]) m = j
    if (m === i) continue
    // bring smallest of the tail to the very top, then flip it down to position i
    const top = cur.length - 1
    if (m !== top) {
      cur = flipFrom(cur, m)
      out.push(m)
    }
    cur = flipFrom(cur, i)
    out.push(i)
  }
  return out
}
