import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { genPipes, identity, isSolved, optimalPipeMoves, pipesSolved, powered, roll, rotMask, scramblePipes, shuffleSlide, shuffleSwap, shuffleTwist, slideSolvable, slideTo, twist } from './slide'

describe('slide logic', () => {
  it('shuffles are solvable and not solved', () => {
    for (const n of [3, 4, 5]) for (let s = 1; s < 15; s++) {
      const p = shuffleSlide(n, makeRng(s), 30 * n)
      expect(isSolved(p)).toBe(false)
      expect(slideSolvable(p, n)).toBe(true)
    }
  })
  it('slideTo moves a whole row toward the blank', () => {
    const p = identity(3)
    const moved = slideTo(p, 3, 6) // blank is cell 8 (same row)
    expect(moved).toEqual([7, 6])
    expect(p).toEqual([0, 1, 2, 3, 4, 5, 8, 6, 7])
    expect(slideTo(p, 3, 1)).toEqual([])
  })
  it('twist and roll are reversible', () => {
    const p = identity(4)
    twist(p, 4, 1, 1, true)
    twist(p, 4, 1, 1, false)
    expect(isSolved(p)).toBe(true)
    roll(p, 4, true, 2, 1)
    expect(isSolved(p)).toBe(false)
    roll(p, 4, true, 2, -1)
    expect(isSolved(p)).toBe(true)
    expect(isSolved(shuffleTwist(4, makeRng(2), 20))).toBe(false)
    expect(isSolved(shuffleSwap(3, makeRng(5)))).toBe(false)
  })
  it('pipe trees are spanning and solved; scramble is fixable', () => {
    for (let s = 1; s < 20; s++) {
      const n = 4 + (s % 3)
      const pp = genPipes(n, makeRng(s))
      expect(pp.masks.every((m) => m > 0)).toBe(true)
      expect(pipesSolved(pp.masks, n, pp.src)).toBe(true)
      expect(powered(pp.masks, n, pp.src).every((d) => d >= 0)).toBe(true)
      const sc = scramblePipes(pp, makeRng(s + 100))
      expect(pipesSolved(sc, n, pp.src)).toBe(false)
      const fix = sc.map((m, i) => { let v = m; while (v !== pp.masks[i]) v = rotMask(v); return v })
      expect(pipesSolved(fix, n, pp.src)).toBe(true)
      expect(optimalPipeMoves(pp.masks, sc)).toBeGreaterThan(0)
    }
  })
})
