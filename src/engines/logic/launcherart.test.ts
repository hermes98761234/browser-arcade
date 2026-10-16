import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { aiAim, carve, genTerrain, GRAV, simShell, surfaceY } from './launcherart'

describe('artillery', () => {
  it('terrain is finite, flat under the cannons and carve lowers the ground', () => {
    const t = genTerrain(makeRng(2), 800, 450, [70, 730])
    for (const v of t.y) expect(Number.isFinite(v)).toBe(true)
    expect(Math.abs(surfaceY(t, 60) - surfaceY(t, 80))).toBeLessThan(1)
    const before = surfaceY(t, 400)
    const n = carve(t, 400, before + 5, 30)
    expect(n).toBeGreaterThan(5)
    expect(surfaceY(t, 400)).toBeGreaterThan(before + 10)
  })
  it('shell lands where ballistics says on flat ground', () => {
    const t = genTerrain(makeRng(1), 2000, 450, [])
    t.y.fill(400)
    const v = 500
    const a = Math.PI / 4
    const hit = simShell(t, [], 100, 400 - 0.001, Math.cos(a) * v, -Math.sin(a) * v, 0)
    const range = (v * v * Math.sin(2 * a)) / GRAV
    expect(hit.kind).toBe('ground')
    expect(Math.abs(hit.x - 100 - range)).toBeLessThan(15)
  })
  it('wind pushes the shell', () => {
    const t = genTerrain(makeRng(1), 2000, 450, [])
    t.y.fill(400)
    const a = simShell(t, [], 100, 399, 300, -300, 0)
    const b = simShell(t, [], 100, 399, 300, -300, 80)
    expect(b.x).toBeGreaterThan(a.x + 20)
  })
  it('hard AI lands very close to the target, easy is looser', () => {
    let hard = 0
    let easy = 0
    for (let s = 1; s <= 6; s++) {
      const t = genTerrain(makeRng(s), 800, 450, [70, 730])
      const cs = [{ x: 70, y: surfaceY(t, 70) - 12 }, { x: 730, y: surfaceY(t, 730) - 12 }]
      const wind = (s % 3 - 1) * 40
      for (const [diff, acc] of [[2, 'hard'], [0, 'easy']] as const) {
        const r = makeRng(s * 7)
        const aim = aiAim(t, cs, 1, wind, diff, r)
        const h = simShell(t, cs, cs[1].x, cs[1].y - 14, -Math.cos(aim.angle) * aim.speed, -Math.sin(aim.angle) * aim.speed, wind, 9, 1)
        const d = Math.hypot(h.x - cs[0].x, h.y - cs[0].y)
        if (acc === 'hard') hard += d
        else easy += d
      }
    }
    expect(hard / 6).toBeLessThan(45)
    expect(hard).toBeLessThan(easy)
  })
})
