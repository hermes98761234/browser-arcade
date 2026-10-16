import { describe, expect, it } from 'vitest'
import { chainPoints, chainSpec } from './chain'

describe('chain specs', () => {
  it('grow with level and need stays below total', () => {
    for (const d of [0, 1, 2] as const) {
      let prev = 0
      for (let l = 1; l <= 12; l++) {
        const s = chainSpec(l, d)
        expect(s.need).toBeLessThan(s.total)
        expect(s.need).toBeGreaterThan(0)
        expect(s.total).toBeGreaterThanOrEqual(prev)
        prev = s.total
      }
    }
  })
  it('easy asks for less than hard', () => {
    expect(chainSpec(5, 0).need / chainSpec(5, 0).total).toBeLessThan(chainSpec(5, 2).need / chainSpec(5, 2).total)
  })
  it('combo multiplies later dots', () => {
    expect(chainPoints(8, true)).toBeGreaterThan(chainPoints(8, false))
    expect(chainPoints(1, true)).toBe(chainPoints(1, false))
  })
})
