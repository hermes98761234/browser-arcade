import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { bestTour, crossings, genEuler, genTour, genTrace, genUntangle, traceMoveOk, traceWon, tourLength, type TraceKind } from './maze-modes'

describe('trace', () => {
  for (const kind of ['fill', 'knight', 'right', 'visit'] as TraceKind[]) {
    it(`${kind} levels are solvable by their stored solution`, () => {
      for (let l = 1; l <= 8; l++) {
        const t = genTrace(makeRng(l * 11), kind, l, 1)
        const p = [t.solution[0]]
        for (const c of t.solution.slice(1)) {
          expect(traceMoveOk(t, p, c)).toBe(true)
          p.push(c)
        }
        expect(traceWon(t, p)).toBe(true)
      }
    })
  }
})
describe('euler', () => {
  it('stored trail uses every edge once', () => {
    for (let l = 1; l <= 10; l++) {
      const e = genEuler(makeRng(l), l)
      expect(e.solution.length - 1).toBe(e.edges.length)
    }
  })
})
describe('untangle', () => {
  it('solved layout has no crossings, shuffled has some', () => {
    for (let l = 1; l <= 8; l++) {
      const u = genUntangle(makeRng(l * 5), l)
      expect(crossings(u.solved, u.edges).length).toBe(0)
      expect(crossings(u.pts, u.edges).length).toBeGreaterThan(0)
    }
  })
})
describe('tour', () => {
  it('budget is above the heuristic best', () => {
    const t = genTour(makeRng(2), 3, 1)
    const b = bestTour(t.pts, 0)
    expect(b.len).toBeLessThan(t.budget)
    expect(tourLength(t.pts, b.order, true)).toBeCloseTo(b.len)
  })
})
