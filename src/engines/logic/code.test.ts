import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { genLevel, run } from './code'

describe('code levels', () => {
  it('every generated level is solvable by its solution within the slot limits', () => {
    for (let seed = 1; seed < 12; seed++) {
      for (let n = 0; n < 10; n++) {
        for (const slack of [0, 1, 2]) {
          const lvl = genLevel(n, { slack, loopWords: seed % 2 === 0, funcWords: seed % 3 === 0 }, makeRng(seed * 31 + n))
          expect(lvl.solution.main.length).toBeLessThanOrEqual(lvl.mainSlots)
          expect(lvl.solution.p1.length).toBeLessThanOrEqual(lvl.p1Slots)
          const r = run(lvl, lvl.solution.main, lvl.solution.p1)
          expect(r.solved).toBe(true)
          expect(r.bumps).toBe(0)
          expect(lvl.goals.length).toBeGreaterThan(0)
        }
      }
    }
  })
  it('late levels use P1 and repeat', () => {
    const lvl = genLevel(9, { slack: 1 }, makeRng(7))
    expect(lvl.ops).toContain('P')
    expect(lvl.ops).toContain('X2')
    expect(lvl.solution.main).toContain('P')
  })
  it('is deterministic per seed', () => {
    expect(genLevel(5, { slack: 1 }, makeRng(3))).toEqual(genLevel(5, { slack: 1 }, makeRng(3)))
  })
})
