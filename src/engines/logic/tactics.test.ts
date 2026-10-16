import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { connected, genCreature, genTerrain, moveDamage, pathTo, reach, typeMult } from './tactics'

describe('tactics logic', () => {
  it('terrain always links the two spawn zones', () => {
    for (let s = 1; s < 80; s++) {
      for (const [c, r] of [[12, 8], [7, 11]]) {
        const t = genTerrain(makeRng(s), c, r, 2)
        const long = c >= r
        expect(connected(t, c, r, long ? 0 : Math.floor(c / 2), long ? Math.floor(r / 2) : 0, long ? c - 1 : Math.floor(c / 2), long ? Math.floor(r / 2) : r - 1)).toBe(true)
      }
    }
  })
  it('reach and path agree', () => {
    const t = Array(25).fill(0)
    t[7] = 2
    const m = reach(t, 5, 5, 6, 3, new Set())
    expect(m.has(7)).toBe(false)
    const p = pathTo(t, 5, 5, 6, 8, 4, new Set())
    expect(p[0]).toBe(6)
    expect(p[p.length - 1]).toBe(8)
  })
  it('type chart is consistent and damage is positive', () => {
    expect(typeMult('fire', 'plant')).toBe(2)
    expect(typeMult('plant', 'fire')).toBe(0.5)
    const r = makeRng(3)
    const a = genCreature(r, 'x', 5, 'fire')
    const d = genCreature(r, 'y', 5, 'plant')
    expect(moveDamage(a, d, a.moves[0], 0.5)).toBeGreaterThan(moveDamage(d, a, d.moves[0], 0.5))
  })
})
