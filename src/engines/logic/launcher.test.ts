import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { addBox, addFoe, addProjectile, foesAlive, genLevel, mkWorld, settled, stepWorldL, trajectory } from './launcher'

describe('launcher physics', () => {
  it('a box falls, lands on the ground and rests', () => {
    const w = mkWorld(800, 400)
    const b = addBox(w, 300, 100, 40, 40, 'wood')
    for (let i = 0; i < 240; i++) stepWorldL(w, 1 / 60)
    expect(b.y + 20).toBeCloseTo(400, 0)
    expect(Math.abs(b.vy)).toBeLessThan(1)
  })
  it('stacked boxes stay put', () => {
    const w = mkWorld(800, 400)
    const a = addBox(w, 300, 380, 40, 40, 'stone')
    const b = addBox(w, 300, 340, 40, 40, 'wood')
    const c = addBox(w, 300, 300, 40, 40, 'wood')
    for (let i = 0; i < 300; i++) stepWorldL(w, 1 / 60)
    expect(a.y).toBeCloseTo(380, 0)
    expect(b.y).toBeGreaterThan(335)
    expect(b.y).toBeLessThan(345)
    expect(c.y).toBeGreaterThan(295)
    expect(c.y).toBeLessThan(345)
  })
  it('a fast projectile kills a foe, a gentle one does not', () => {
    const w = mkWorld(800, 400)
    const f = addFoe(w, 500, 384, 16, 0, 24)
    const p = addProjectile(w, 300, 384, 14, 700, 0)
    for (let i = 0; i < 120; i++) stepWorldL(w, 1 / 60)
    expect(f.dead).toBe(true)
    expect(p.dead).toBe(false)
    const w2 = mkWorld(800, 400)
    const f2 = addFoe(w2, 500, 384, 16, 0, 24)
    addProjectile(w2, 400, 384, 14, 70, 0)
    for (let i = 0; i < 180; i++) stepWorldL(w2, 1 / 60)
    expect(f2.dead).toBe(false)
  })
  it('generated levels are stable at rest and never explode', () => {
    for (let level = 1; level <= 8; level++) {
      for (let seed = 1; seed <= 6; seed++) {
        for (const [W, G] of [[800, 400], [480, 560]] as const) {
          const { world, info } = genLevel(makeRng(seed * 13 + level), level, W, G, 1)
          expect(info.foes).toBeGreaterThanOrEqual(2)
          expect(info.shots).toBeGreaterThanOrEqual(3)
          const start = world.bodies.map((b) => ({ x: b.x, y: b.y }))
          for (let i = 0; i < 360; i++) stepWorldL(world, 1 / 60)
          expect(foesAlive(world)).toBe(info.foes)
          world.bodies.forEach((b, i) => {
            expect(Number.isFinite(b.x) && Number.isFinite(b.y)).toBe(true)
            expect(Math.abs(b.x - start[i].x)).toBeLessThan(40)
            expect(b.y).toBeLessThanOrEqual(G)
          })
          expect(settled(world)).toBe(true)
        }
      }
    }
  })
  it('projectile into a tower does not explode the simulation', () => {
    const { world } = genLevel(makeRng(4), 6, 800, 400, 1)
    addProjectile(world, 60, 300, 14, 780, -120)
    for (let i = 0; i < 600; i++) stepWorldL(world, 1 / 60)
    for (const b of world.bodies) {
      expect(Number.isFinite(b.x)).toBe(true)
      expect(b.x).toBeGreaterThan(-200)
      expect(b.x).toBeLessThan(1200)
    }
  })
  it('trajectory is a parabola that ends at the ground', () => {
    const t = trajectory(100, 300, 300, -400, 900, 400, 200)
    expect(t.length).toBeGreaterThan(10)
    expect(t[t.length - 1].y).toBeLessThanOrEqual(400)
    expect(Math.min(...t.map((p) => p.y))).toBeLessThan(300)
  })
})
