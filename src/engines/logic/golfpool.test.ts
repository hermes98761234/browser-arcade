import { describe, expect, it } from 'vitest'
import { bowlingScore, mkBall, moving, planShot, rollDistance, speedForDistance, stepBalls, type Arena, type PEvents } from './golfpool'

const arena = (pockets = true): Arena => ({
  x: 0, y: 0, w: 800, h: 400, wall: 0.8, e: 0.96, k: 0.25, c: 120, walls: true,
  pockets: pockets ? [[0, 0], [800, 0], [0, 400], [800, 400], [400, 0], [400, 400]].map(([x, y]) => ({ x, y, r: 24 })) : [],
})
const run = (balls: ReturnType<typeof mkBall>[], a: Arena, t = 20) => {
  const ev: PEvents = { hits: [], cushions: 0, pocketed: [] }
  for (let i = 0; i < t * 60 && (moving(balls, 5) || i < 2); i++) stepBalls(balls, a, 1 / 60, ev)
  return ev
}

describe('circle physics', () => {
  it('equal-mass head-on collision transfers momentum', () => {
    const a = { ...arena(false), k: 0, c: 0 }
    const q = mkBall(0, 100, 200, 10, 'cue')
    const t = mkBall(1, 300, 200, 10, 'solid', 1)
    q.vx = 400
    const ev = { hits: [], cushions: 0, pocketed: [] } as PEvents
    for (let i = 0; i < 60; i++) stepBalls([q, t], a, 1 / 60, ev)
    expect(ev.hits.length).toBe(1)
    expect(t.vx).toBeGreaterThan(350)
    expect(q.vx).toBeLessThan(40)
  })
  it('balls never overlap or leave the table after a break-like scatter', () => {
    const a = arena(false)
    const balls = Array.from({ length: 15 }, (_, i) => mkBall(i + 1, 500 + (i % 5) * 21, 150 + ((i / 5) | 0) * 21, 10, 'solid', i + 1))
    const cue = mkBall(0, 150, 200, 10, 'cue')
    cue.vx = 1400
    cue.vy = 30
    const all = [cue, ...balls]
    run(all, a)
    for (const b of all) {
      expect(b.x).toBeGreaterThanOrEqual(0)
      expect(b.x).toBeLessThanOrEqual(800)
    }
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) expect(Math.hypot(all[i].x - all[j].x, all[i].y - all[j].y)).toBeGreaterThan(17)
  })
  it('pockets capture balls', () => {
    const a = arena()
    const b = mkBall(1, 40, 40, 10, 'solid', 1)
    b.vx = -200
    b.vy = -200
    const ev = run([b], a)
    expect(ev.pocketed.length).toBe(1)
    expect(b.out).toBe(true)
  })
  it('roll distance model is invertible', () => {
    for (const d of [50, 200, 700]) expect(rollDistance(speedForDistance(d, 0.25, 120), 0.25, 120)).toBeCloseTo(d, 1)
  })
  it('AI plans a shot that actually pots an easy ball', () => {
    const a = arena()
    const cue = mkBall(0, 200, 200, 10.5, 'cue')
    const t = mkBall(1, 600, 120, 10.5, 'solid', 1)
    const far = mkBall(2, 300, 330, 10.5, 'stripe', 9)
    const balls = [cue, t, far]
    const shot = planShot(balls, a, 0, [1])!
    expect(shot).not.toBeNull()
    cue.vx = Math.cos(shot.angle) * shot.speed
    cue.vy = Math.sin(shot.angle) * shot.speed
    const ev = run(balls, a)
    expect(ev.pocketed.map((b) => b.id)).toContain(1)
  })
})

describe('bowling score', () => {
  it('perfect game is 300', () => expect(bowlingScore(Array(12).fill(10)).total).toBe(300))
  it('gutter game is 0', () => expect(bowlingScore(Array(20).fill(0)).total).toBe(0))
  it('all spares with 5 is 150', () => expect(bowlingScore(Array(21).fill(5)).total).toBe(150))
  it('mixed game', () => {
    const r = bowlingScore([10, 7, 3, 9, 0, 10, 0, 8, 8, 2, 0, 6, 10, 10, 10, 8, 1])
    expect(r.total).toBe(167)
  })
  it('pending strike has no total yet', () => expect(bowlingScore([10]).frames[0]).toBeNull())
})
