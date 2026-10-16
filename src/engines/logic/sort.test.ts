import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { applyMove, genSort, isSortSolved, moveCount, solveSort } from './sort'

describe('sort rules', () => {
  it('single moves need empty or matching top', () => {
    const t = [[0, 1], [1], [0, 0]]
    expect(moveCount(t, 4, 0, 1, false)).toBe(1)
    expect(moveCount(t, 4, 0, 2, false)).toBe(0)
    expect(moveCount(t, 2, 1, 0, false)).toBe(0)
  })
  it('pour moves the whole run up to the free room', () => {
    const t = [[2, 1, 1, 1], [1], []]
    expect(moveCount(t, 4, 0, 1, true)).toBe(3)
    expect(moveCount(t, 4, 0, 2, true)).toBe(3)
    applyMove(t, 4, 0, 2, true)
    expect(t[2]).toEqual([1, 1, 1])
  })
})

describe('sort generator', () => {
  for (const multi of [false, true]) {
    it(`replays its solution (${multi ? 'pour' : 'ball'})`, () => {
      for (let s = 1; s <= 20; s++) {
        const lvl = genSort(makeRng(s), { colors: 3 + (s % 6), cap: 4, empty: 2, multi })
        expect(isSortSolved(lvl.tubes, lvl.cap)).toBe(false)
        const t = lvl.tubes.map((x) => x.slice())
        for (const [a, b] of lvl.solution) expect(applyMove(t, lvl.cap, a, b, multi)).toBeGreaterThan(0)
        expect(isSortSolved(t, lvl.cap)).toBe(true)
      }
    })
    it(`BFS solves small boards (${multi ? 'pour' : 'ball'})`, () => {
      for (let s = 1; s <= 6; s++) {
        const lvl = genSort(makeRng(s + 50), { colors: 3, cap: 3, empty: 2, multi })
        expect(solveSort(lvl.tubes, lvl.cap, multi)).not.toBeNull()
      }
    })
  }
})
