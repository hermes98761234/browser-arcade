import { describe, expect, it } from 'vitest'
import { faceAlong, nextSpots, simulate } from './chain-topple'

describe('chain topple', () => {
  const line = [0, 1, 2, 3, 4].map((i) => ({ x: 20 + i * 30, y: 50 }))
  it('a straight line falls in order and reaches a target at the end', () => {
    const r = simulate(faceAlong(line), [{ x: 170, y: 50 }], 0)
    expect(r.dom.every((t) => t >= 0)).toBe(true)
    expect(r.dom[4]).toBeGreaterThan(r.dom[1])
    expect(r.tgt[0]).toBeGreaterThan(r.dom[4])
  })
  it('a gap that is too wide stops the chain', () => {
    const gap = [...line.slice(0, 2), { x: 200, y: 50 }]
    const r = simulate(faceAlong(gap), [], 0)
    expect(r.dom[2]).toBe(-1)
  })
  it('dominoes behind the pusher stay standing', () => {
    const r = simulate(faceAlong(line), [], 2)
    expect(r.dom[1]).toBe(-1)
    expect(r.dom[3]).toBeGreaterThan(0)
  })
  it('nextSpots spaces points evenly', () => {
    const s = nextSpots({ x: 0, y: 0 }, { x: 100, y: 0 }, 30)
    expect(s.length).toBe(3)
    expect(s[0].x).toBe(30)
  })
})
