import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { gapSize, genTerrain, landingOk, nextGapY, terrainY } from './flappy'

describe('flappy logic', () => {
  it('gap centres stay reachable and in bounds', () => {
    const r = makeRng(4)
    let y = 300
    for (let i = 0; i < 200; i++) {
      const ny = nextGapY(r, y, 150, 40, 500, 120)
      expect(Math.abs(ny - y)).toBeLessThanOrEqual(120.001)
      expect(ny - 75).toBeGreaterThanOrEqual(39.9)
      expect(ny + 75).toBeLessThanOrEqual(500.1)
      y = ny
    }
  })
  it('gaps shrink to a floor', () => {
    expect(gapSize(100, 160, 110)).toBe(110)
    expect(gapSize(0, 160, 110)).toBe(160)
  })
  it('terrain has flat pads', () => {
    for (let s = 1; s < 30; s++) {
      const t = genTerrain(makeRng(s), 640, 360, 1 + (s % 5))
      expect(t.pads.length).toBeGreaterThan(0)
      for (const p of t.pads) expect(terrainY(t, p.x0 + 1)).toBeCloseTo(terrainY(t, p.x1 - 1), 5)
    }
  })
  it('landing rules', () => {
    expect(landingOk(5, 20, 0.05, 1)).toBe(true)
    expect(landingOk(5, 90, 0, 1)).toBe(false)
    expect(landingOk(5, 20, 1, 1)).toBe(false)
  })
})
