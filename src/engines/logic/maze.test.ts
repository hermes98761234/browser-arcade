import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { distances, genFlow, genMaze, placeLocks, solvableWithLocks, solvePath, validFlowSolution } from './maze'

describe('maze', () => {
  it('generates a perfect (fully connected, acyclic) maze', () => {
    for (let s = 1; s < 8; s++) {
      const m = genMaze(12, 9, makeRng(s))
      const d = distances(m, 0)
      expect(d.every((x) => x >= 0)).toBe(true)
      let open = 0
      for (let c = 0; c < m.walls.length; c++) for (const bit of [2, 4]) if (!(m.walls[c] & bit)) open++
      expect(open).toBe(12 * 9 - 1)
    }
  })
  it('solves with a path of adjacent cells', () => {
    const m = genMaze(10, 10, makeRng(5))
    const p = solvePath(m, 0, 99)
    expect(p[0]).toBe(0)
    expect(p[p.length - 1]).toBe(99)
  })
  it('keys and doors stay solvable', () => {
    for (let s = 1; s < 25; s++) {
      const r = makeRng(s)
      const m = genMaze(14, 9, r)
      const locks = placeLocks(m, 0, 14 * 9 - 1, 3, r)
      expect(locks.length).toBeGreaterThan(0)
      expect(solvableWithLocks(m, locks, 0, 14 * 9 - 1)).toBe(true)
    }
  })
})

describe('flow', () => {
  it('generated boards have a valid solution', () => {
    for (let s = 1; s < 30; s++) {
      const r = makeRng(s)
      const f = genFlow(6, 6, 4, r)
      expect(f.pairs).toHaveLength(4)
      expect(validFlowSolution(f, f.solution)).toBe(true)
    }
  })
  it('rejects crossing solutions', () => {
    const f = genFlow(5, 5, 3, makeRng(2))
    const bad = f.solution.map((p) => [...p])
    bad[1] = [...bad[0]]
    expect(validFlowSolution(f, bad)).toBe(false)
  })
})
