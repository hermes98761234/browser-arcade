import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { cleared, genGridLevel, mass, remaining, tap } from './chain-grid'

describe('chain grid', () => {
  it('critical mass is the neighbour count', () => {
    expect(mass(4, 4, 0)).toBe(2)
    expect(mass(4, 4, 1)).toBe(3)
    expect(mass(4, 4, 5)).toBe(4)
  })
  it('a corner with one orb explodes on the second tap', () => {
    const g = { w: 3, h: 3, g: [1, 0, 0, 0, 0, 0, 0, 0, 0] }
    const r = tap(g, 'atoms', 0)
    expect(r.grid.g[0]).toBe(0)
    expect(r.grid.g[1]).toBe(1)
    expect(r.grid.g[3]).toBe(1)
  })
  it('cross blast chains through bombs in range', () => {
    const g = { w: 5, h: 1, g: [1, 1, 0, 1, 0] }
    const r = tap(g, 'cross', 0)
    expect(cleared(r.grid)).toBe(true)
    expect(tap(g, 'cross', 2).ok).toBe(false)
  })
  it('generated levels reach their goal within the budget', () => {
    for (const kind of ['atoms', 'cross'] as const) {
      for (let l = 1; l <= 10; l++) {
        const lv = genGridLevel(makeRng(l * 7), kind, l, 1)
        expect(lv.taps).toBeLessThan(40)
        let gr = lv.grid
        for (const i of lv.solution) gr = tap(gr, kind, i).grid
        expect(remaining(gr)).toBeLessThanOrEqual(lv.goal)
        expect(lv.solution.length).toBeLessThanOrEqual(lv.taps)
      }
    }
  })
})
