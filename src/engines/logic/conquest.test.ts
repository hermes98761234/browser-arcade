import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { genHex, genPlanets, pickConquest, reachable } from './conquest'

describe('conquest maps', () => {
  it('free-form map has distinct starts and no overlapping planets', () => {
    for (let s = 1; s < 60; s++) {
      const m = genPlanets(makeRng(s), 800, 440, 3, 14)
      expect(m.nodes.length).toBeGreaterThanOrEqual(8)
      for (const o of [0, 1, 2]) expect(m.nodes.filter((n) => n.owner === o).length).toBe(1)
      for (const a of m.nodes) for (const b of m.nodes) if (a !== b) expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(a.r + b.r)
    }
  })
  it('hex map keeps all starts connected', () => {
    for (let s = 1; s < 60; s++) {
      const m = genHex(makeRng(s), 12, 6, 38, 40, 40, 3)
      const starts = m.nodes.filter((n) => n.owner >= 0)
      expect(starts.length).toBe(3)
      const reach = reachable(m, starts[0].id)
      for (const st of starts) expect(reach.has(st.id)).toBe(true)
    }
  })
})

describe('conquest mode', () => {
  it('routes 4X games to turns and hex games to hex', () => {
    expect(pickConquest('Pocket Empires 30-turn mini 4X matches', new Set()).turn).toBe(true)
    expect(pickConquest('Panzer Hex Front', new Set(['hex']))).toEqual({ hex: true, turn: false })
    expect(pickConquest('Mini RTS Battle small-scale RTS', new Set()).turn).toBe(false)
    expect(pickConquest('Barnacle Battle cling and defend hull territory', new Set()).turn).toBe(false)
  })
})
