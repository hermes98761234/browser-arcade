import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { genHole, reachable, simulate, BALL_R } from './golf'

describe('mini golf holes', () => {
  it('every generated hole is reachable, deterministic and leaves tee/cup free', () => {
    for (const [W, H] of [[960, 540], [540, 960]] as const) {
      for (let seed = 1; seed <= 12; seed++) {
        for (let level = 1; level <= 9; level++) {
          const a = genHole(makeRng(seed * 7 + level), level, W, H, (seed % 3) as 0 | 1 | 2)
          const b = genHole(makeRng(seed * 7 + level), level, W, H, (seed % 3) as 0 | 1 | 2)
          expect(a).toEqual(b)
          expect(reachable(a)).toBe(true)
          expect(a.par).toBeGreaterThanOrEqual(2)
          expect(a.par).toBeLessThanOrEqual(5)
          expect(a.tee.x).toBeGreaterThan(a.bounds.x)
          expect(a.tee.y).toBeLessThan(a.bounds.y + a.bounds.h)
          for (const w of a.walls) {
            const nx = Math.max(w.x, Math.min(a.tee.x, w.x + w.w))
            const ny = Math.max(w.y, Math.min(a.tee.y, w.y + w.h))
            expect(Math.hypot(a.tee.x - nx, a.tee.y - ny)).toBeGreaterThan(BALL_R)
          }
        }
      }
    }
  })
  it('a straight hole can be holed with a gentle putt and a hard shot passes the cup', () => {
    const h = genHole(makeRng(3), 1, 960, 540, 1)
    const dx = h.cup.x - h.tee.x
    const dy = h.cup.y - h.tee.y
    const d = Math.hypot(dx, dy)
    // initial speed s decays ~ exp(-0.9 t) - 26 t; choose speed to roughly stop at the cup
    let holed = false
    for (let s = 150; s < 900 && !holed; s += 10) holed = simulate(h, h.tee.x, h.tee.y, (dx / d) * s, (dy / d) * s).b.sunk
    expect(holed).toBe(true)
    const fast = simulate(h, h.tee.x, h.tee.y, (dx / d) * 1500, (dy / d) * 1500)
    expect(fast.b.sunk).toBe(false)
    expect(fast.b.x).toBeLessThanOrEqual(h.bounds.x + h.bounds.w)
  })
  it('walls stop the ball and it stays inside the bounds', () => {
    const h = genHole(makeRng(5), 5, 960, 540, 1)
    for (let a = 0; a < 6.28; a += 0.4) {
      const r = simulate(h, h.tee.x, h.tee.y, Math.cos(a) * 900, Math.sin(a) * 900)
      expect(r.b.x).toBeGreaterThanOrEqual(h.bounds.x)
      expect(r.b.x).toBeLessThanOrEqual(h.bounds.x + h.bounds.w)
      expect(r.b.y).toBeGreaterThanOrEqual(h.bounds.y)
      expect(r.b.y).toBeLessThanOrEqual(h.bounds.y + h.bounds.h)
    }
  })
})
