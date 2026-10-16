import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { genPath, waveSpec } from './towerdef'

describe('towerdef path', () => {
  it('is connected, unique and crosses the board', () => {
    for (let seed = 1; seed < 200; seed++) {
      const p = genPath(makeRng(seed), 16, 11)
      expect(p[0].x).toBe(0)
      expect(p[p.length - 1].x).toBe(15)
      const seen = new Set<string>()
      p.forEach((c, i) => {
        expect(c.x >= 0 && c.x < 16 && c.y >= 0 && c.y < 11).toBe(true)
        const k = `${c.x},${c.y}`
        expect(seen.has(k)).toBe(false)
        seen.add(k)
        if (i) expect(Math.abs(c.x - p[i - 1].x) + Math.abs(c.y - p[i - 1].y)).toBe(1)
      })
    }
  })
  it('has a boss on the last wave', () => {
    expect(waveSpec(14, 14, false).some((g) => g.kind === 'boss')).toBe(true)
    expect(waveSpec(5, 14, true).some((g) => g.kind === 'boss')).toBe(true)
    expect(waveSpec(5, 14, false).some((g) => g.kind === 'boss')).toBe(false)
  })
})
