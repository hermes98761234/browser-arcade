import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { genSokoban, isSolved, move, replay, solve } from './sokoban'

describe('sokoban generator', () => {
  it('builds solvable levels of growing size', () => {
    for (let s = 1; s <= 24; s++) {
      const boxes = 1 + (s % 5)
      const l = genSokoban(makeRng(s), { w: 7 + (s % 3), h: 6 + (s % 3), boxes })
      expect(l.boxes).toHaveLength(boxes)
      expect(isSolved(l.goals, l.boxes)).toBe(false)
      expect(replay(l, l.solution)).toBe(true)
    }
  })
  it('is deterministic', () => {
    const a = genSokoban(makeRng(9), { w: 8, h: 7, boxes: 3 })
    const b = genSokoban(makeRng(9), { w: 8, h: 7, boxes: 3 })
    expect(a).toEqual(b)
  })
  it('BFS solver agrees on small levels', () => {
    for (let s = 1; s <= 8; s++) {
      const l = genSokoban(makeRng(s + 100), { w: 6, h: 6, boxes: 2 })
      const sol = solve(l, l.goals, l.boxes, l.player)
      expect(sol).not.toBeNull()
      expect(replay(l, sol!)).toBe(true)
    }
  })
  it('ice levels are verified solvable', () => {
    for (let s = 1; s <= 5; s++) {
      const l = genSokoban(makeRng(s + 7), { w: 6, h: 6, boxes: 2, ice: true })
      expect(replay(l, l.solution)).toBe(true)
    }
  })
  it('slides on ice until blocked', () => {
    const w = 6
    const wall = new Uint8Array(w * 3)
    for (let i = 0; i < w * 3; i++) if (i % w === 0 || i % w === w - 1 || i < w || i >= 2 * w) wall[i] = 1
    const ice = new Uint8Array(w * 3).fill(1)
    const r = move({ w, h: 3, wall, ice }, [], w + 1, 1)
    expect(r!.player).toBe(w + 4)
  })
})
