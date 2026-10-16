import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { floodMove, genFlood, genLaser, genLights, genSymmetry, givenCells, greedyFlood, hueGradient, isFlooded, lasersolved, minSwaps, press, shuffleHue, symmetric, trace } from './lights'

describe('lights logic', () => {
  it('lights out boards are solvable by their solution', () => {
    for (let s = 1; s < 20; s++) {
      const n = 3 + (s % 4)
      const { grid, solution } = genLights(n, makeRng(s), 6 + s)
      for (const i of solution) press(grid, n, i)
      expect(grid.some(Boolean)).toBe(false)
    }
  })
  it('flood: greedy solves the board', () => {
    const n = 8
    const g = genFlood(n, 5, makeRng(4))
    const moves = greedyFlood(g, n, 5)
    expect(moves).toBeGreaterThan(2)
    const h = g.slice()
    for (let i = 0; i < 200 && !isFlooded(h); i++) floodMove(h, n, (h[0] + 1) % 5)
    expect(isFlooded(h)).toBe(true)
  })
  it('hue: min swaps and shuffle', () => {
    expect(hueGradient(5, makeRng(1))).toHaveLength(25)
    const locked = new Set([0, 4, 20, 24])
    const p = shuffleHue(5, locked, makeRng(2))
    for (const l of locked) expect(p[l]).toBe(l)
    expect(minSwaps(p)).toBeGreaterThan(0)
    expect(minSwaps([1, 0, 3, 2])).toBe(2)
  })
  it('laser levels are solvable and not pre-solved', () => {
    for (let s = 1; s < 25; s++) {
      const n = 5 + (s % 4)
      const lv = genLaser(n, 3 + (s % 4), 2 + (s % 3), s % 3, makeRng(s))
      expect(lasersolved(lv, lv.solution)).toBe(true)
      expect(lasersolved(lv, lv.mirrors)).toBe(false)
      expect(trace(n, lv.src, lv.solution).cells.length).toBeGreaterThan(2)
    }
  })
  it('symmetry puzzles complete by mirroring the given part', () => {
    for (const sym of ['v', 'h', 'both', 'point'] as const) {
      const n = 6
      const { grid, given, target } = genSymmetry(n, sym, 3, makeRng(7))
      expect(symmetric(grid, n, sym)).toBe(false)
      expect(symmetric(target, n, sym)).toBe(true)
      expect(given.size).toBeGreaterThan(0)
      expect(givenCells(n, sym).size).toBe(sym === 'both' ? 9 : 18)
    }
  })
})
