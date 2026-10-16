import { describe, expect, it } from 'vitest'
import { bounceOffCircle, landingX, paddleBounce, predictY } from './pong'

describe('pong helpers', () => {
  it('predicts wall reflections', () => {
    expect(predictY(0, 100, 100, 100, 500, 0, 540)).toBeCloseTo(540 - 60, 5) // 100 + 500 = 600 -> reflect to 480
    expect(predictY(0, 270, 100, 0, 500, 0, 540)).toBe(270)
    const y = predictY(0, 10, 100, -100, 300, 0, 540)
    expect(y).toBeGreaterThanOrEqual(0)
    expect(y).toBeLessThanOrEqual(540)
  })
  it('paddle bounce keeps speed and direction', () => {
    for (const off of [-1, -0.4, 0, 0.7, 1]) {
      const v = paddleBounce(500, off, -1, 0)
      expect(Math.hypot(v.vx, v.vy)).toBeCloseTo(500, 3)
      expect(v.vx).toBeLessThan(0)
    }
    expect(paddleBounce(500, 1, 1).vy).toBeGreaterThan(0)
  })
  it('ball bounces away from an obstacle', () => {
    const b = { x: 10, y: 0, vx: -100, vy: 0, r: 5 }
    expect(bounceOffCircle(b, 0, 0, 0, 0, 20)).toBe(true)
    expect(b.vx).toBeGreaterThan(0)
    expect(Math.hypot(b.x, b.y)).toBeCloseTo(25, 5)
    expect(bounceOffCircle({ x: 100, y: 0, vx: 0, vy: 0, r: 5 }, 0, 0, 0, 0, 20)).toBe(false)
  })
  it('landing x', () => {
    expect(landingX(0, 0, 100, 0, 1000, 500)).toBeCloseTo(100 * Math.sqrt(1), 3)
  })
})
