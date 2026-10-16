import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { countBreakable, genLevel } from './breakout'

describe('breakout genLevel', () => {
  it('is deterministic and symmetric with breakable bricks', () => {
    for (let s = 1; s < 60; s++) {
      const o = { cols: 12, rows: 7, level: 1 + (s % 6), diff: (s % 3) as 0 | 1 | 2, indestructible: true }
      const a = genLevel(makeRng(s), o)
      expect(a).toEqual(genLevel(makeRng(s), o))
      expect(countBreakable(a)).toBeGreaterThanOrEqual(8)
      for (const row of a) expect(row).toEqual([...row].reverse())
    }
  })
  it('only uses indestructible bricks from level 2', () => {
    const g = genLevel(makeRng(5), { cols: 12, rows: 7, level: 1, diff: 1, indestructible: true })
    expect(g.flat().includes(-1)).toBe(false)
  })
})
