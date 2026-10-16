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

import { bfsPath, lanePaths, pickTd, rotateShape, TETROS } from './towerdef'
describe('towerdef variants', () => {
  it('routes names to modes', () => {
    expect(pickTd('Reverse Rampart play attackers vs AI towers').mode).toBe('reverse')
    expect(pickTd('Maze Maker TD build mazes with towers').mode).toBe('maze')
    expect(pickTd('Spinning Citadel rotating ring tower defense').mode).toBe('ring')
    expect(pickTd('Sky Lanes Defense air paths in 3 layers').mode).toBe('lanes')
    expect(pickTd('Merge Tower Rush merge identical towers').merge).toBe(true)
    expect(pickTd('Mage Tower spell-tower TD').mode).toBe('path')
  })
  it('lanes are straight and cross the board', () => {
    const l = lanePaths(16, 11, false)
    expect(l).toHaveLength(3)
    expect(l[0][15]).toEqual({ x: 15, y: l[0][0].y })
    const p = lanePaths(9, 13, true)
    expect(p[1][12].y).toBe(12)
  })
  it('bfs finds a path and detects a full block', () => {
    const p = bfsPath(5, 5, new Set(), { x: 0, y: 2 }, { x: 4, y: 2 })
    expect(p).toHaveLength(5)
    const wall = new Set([0, 1, 2, 3, 4].map((y) => y * 5 + 2))
    expect(bfsPath(5, 5, wall, { x: 0, y: 2 }, { x: 4, y: 2 })).toBeNull()
  })
  it('rotating a tetromino keeps four cells at the origin', () => {
    for (const t of TETROS) {
      const r = rotateShape(t)
      expect(r).toHaveLength(4)
      expect(Math.min(...r.map((c) => c.x))).toBe(0)
      expect(Math.min(...r.map((c) => c.y))).toBe(0)
    }
  })
})
