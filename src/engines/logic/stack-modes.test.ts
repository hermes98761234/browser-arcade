import { describe, expect, it } from 'vitest'
import { bestSpot, canMove, hanoiSolved, layerHolds, moveDisc, newHanoi, newTower, pullCollapses, putOnTop, tips, type Weight } from './stack-modes'

describe('hanoi', () => {
  it('cannot place big on small', () => {
    const p = moveDisc(newHanoi(3), 0, 1)
    expect(canMove(p, 0, 1)).toBe(false)
    expect(canMove(p, 0, 2)).toBe(true)
    expect(hanoiSolved(newHanoi(3), 3)).toBe(false)
  })
})
describe('jenga', () => {
  it('pulling the middle then one end collapses a loaded tower', () => {
    const t = newTower(4)
    expect(pullCollapses(t, 0, 1)).toBe(false)
    t[0][1] = false
    expect(layerHolds(t[0])).toBe(true)
    expect(pullCollapses(t, 0, 0)).toBe(true)
  })
  it('puts blocks on top and opens new layers', () => {
    let t = newTower(2)
    t = putOnTop(t)
    expect(t.length).toBe(3)
    t = putOnTop(putOnTop(t))
    expect(t[2].filter(Boolean).length).toBe(3)
    expect(putOnTop(t).length).toBe(4)
  })
})
describe('seesaw', () => {
  it('best spot cancels torque', () => {
    const ws: Weight[] = [{ p: -0.8, w: 3 }]
    const p = bestSpot(ws, 3)
    expect(p).toBeCloseTo(0.8)
    expect(tips([...ws, { p, w: 3 }])).toBe(false)
    expect(tips([{ p: 1, w: 9 }])).toBe(true)
  })
})
