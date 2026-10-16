import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { flipFrom, flipSolution, genOrder, isOrdered, minSwaps, swapAt } from './sort-order'

describe('sort order', () => {
  it('generates shuffled permutations', () => {
    const a = genOrder(makeRng(3), 8)
    expect([...a].sort((x, y) => x - y)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    expect(isOrdered(a)).toBe(false)
  })
  it('min swaps sorts the row', () => {
    let a = genOrder(makeRng(4), 7)
    const n = minSwaps(a)
    for (let i = 0; i < a.length; i++) while (a[i] !== i) a = swapAt(a, i, a[i])
    expect(isOrdered(a)).toBe(true)
    expect(n).toBeGreaterThan(0)
  })
  it('flip solution sorts', () => {
    for (let s = 1; s < 10; s++) {
      let a = genOrder(makeRng(s), 7)
      for (const i of flipSolution(a)) a = flipFrom(a, i)
      expect(isOrdered(a)).toBe(true)
    }
  })
})
