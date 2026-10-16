import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { addTile, canMove, moveGrid } from './merge'

describe('merge', () => {
  it('merges pairs once per move', () => {
    const r = moveGrid([1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 4, 'left')
    expect(r.grid.slice(0, 4)).toEqual([2, 2, 0, 0])
    expect(r.gained).toBe(8)
    expect(r.moved).toBe(true)
  })
  it('does not chain merges', () => {
    const r = moveGrid([1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 4, 'left')
    expect(r.grid.slice(0, 4)).toEqual([2, 2, 0, 0])
  })
  it('slides in every direction', () => {
    const g = new Array(16).fill(0)
    g[5] = 3
    expect(moveGrid(g, 4, 'right').grid[7]).toBe(3)
    expect(moveGrid(g, 4, 'up').grid[1]).toBe(3)
    expect(moveGrid(g, 4, 'down').grid[13]).toBe(3)
  })
  it('detects no-op moves and game over', () => {
    expect(moveGrid([1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 4, 'left').moved).toBe(false)
    const full = [1, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 1]
    expect(canMove(full, 4)).toBe(false)
    const g = new Array(16).fill(0)
    expect(addTile(g, makeRng(1))).toBeGreaterThanOrEqual(0)
    expect(g.filter(Boolean)).toHaveLength(1)
  })
})
