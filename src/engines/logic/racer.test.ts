import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { buildRoad, buildTopTrack, minClearance } from './racer'

describe('racer tracks', () => {
  it('roads loop back to height zero with bounded curves', () => {
    for (let s = 1; s <= 20; s++) {
      const r = buildRoad(makeRng(s), { segments: 1800, curvy: 1, hilly: 0.6 })
      expect(r.n).toBe(1800)
      expect(r.y[r.n - 1]).toBe(0)
      expect(Math.max(...r.curve.map(Math.abs))).toBeLessThan(6)
    }
  })
  it('circuits are closed and wide enough to race on', () => {
    for (let s = 1; s <= 30; s++) {
      const t = buildTopTrack(makeRng(s), { radius: 700, wobble: 0.35, hw: 62 })
      expect(minClearance(t)).toBeGreaterThan(t.hw * 2 + 40)
    }
  })
})
