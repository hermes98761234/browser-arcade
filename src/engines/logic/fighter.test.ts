import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { aiInput, damageFor, mkAi, mkWorld, NO_INPUT, step, type Config, type Input, type World } from './fighter'

const cfg: Config = { width: 640, speed: 1, dmgMul: 1, boxing: false, sumo: false, ring: 200 }
const inp = (o: Partial<Input> = {}): Input => ({ ...NO_INPUT, ...o })
const run = (w: World, a: () => Input, b: () => Input, t: number) => {
  for (let i = 0; i < t * 60; i++) step(w, [a(), b()], 1 / 60)
}
const close = (w: World) => {
  w.f[0].x = 300
  w.f[1].x = 340
}

describe('fighter rules', () => {
  it('a punch in range hits, out of range misses', () => {
    const w = mkWorld(cfg)
    close(w)
    step(w, [inp({ punch: true }), inp()], 1 / 60)
    run(w, () => inp(), () => inp(), 0.4)
    expect(w.f[1].hp).toBeLessThan(100)
    const w2 = mkWorld(cfg)
    w2.f[0].x = 100
    w2.f[1].x = 500
    step(w2, [inp({ punch: true }), inp()], 1 / 60)
    run(w2, () => inp(), () => inp(), 0.5)
    expect(w2.f[1].hp).toBe(100)
  })
  it('blocking takes only chip damage', () => {
    const w = mkWorld(cfg)
    close(w)
    w.f[1].face = -1
    step(w, [inp({ kick: true }), inp({ block: true })], 1 / 60)
    run(w, () => inp(), () => inp({ block: true }), 0.6)
    expect(w.f[1].hp).toBeGreaterThan(95)
    expect(w.f[1].hp).toBeLessThan(100)
  })
  it('combo scaling increases damage and KO happens at 0 hp', () => {
    expect(damageFor(10, 3, false)).toBeGreaterThan(damageFor(10, 0, false))
    expect(damageFor(10, 0, true)).toBe(1)
    const w = mkWorld(cfg, 8)
    close(w)
    step(w, [inp({ kick: true }), inp()], 1 / 60)
    run(w, () => inp(), () => inp(), 0.4)
    expect(w.f[1].act).toBe('ko')
    expect(w.f[1].hp).toBe(0)
  })
  it('special spends energy and the fireball hits from afar', () => {
    const w = mkWorld(cfg)
    w.f[0].energy = 60
    w.f[0].x = 100
    w.f[1].x = 500
    step(w, [inp({ special: true }), inp()], 1 / 60)
    run(w, () => inp(), () => inp(), 1.6)
    expect(w.f[0].energy).toBeLessThan(60)
    expect(w.f[1].hp).toBeLessThan(100)
  })
  it('jumping avoids a fireball', () => {
    const w = mkWorld(cfg)
    w.f[0].energy = 100
    w.f[0].x = 100
    w.f[1].x = 500
    step(w, [inp({ special: true }), inp()], 1 / 60)
    let jumped = false
    for (let i = 0; i < 120; i++) {
      const p = w.proj[0]
      const j = !!p && Math.abs(p.x - w.f[1].x) < 140 && !jumped
      if (j) jumped = true
      step(w, [inp(), inp({ jump: j })], 1 / 60)
    }
    expect(w.f[1].hp).toBe(100)
  })
  it('fighters do not overlap and stay in the arena', () => {
    const w = mkWorld(cfg)
    run(w, () => inp({ dir: 1 }), () => inp({ dir: -1 }), 3)
    expect(Math.abs(w.f[0].x - w.f[1].x)).toBeGreaterThanOrEqual(30)
    run(w, () => inp({ dir: -1 }), () => inp({ dir: 1 }), 5)
    expect(w.f[0].x).toBeGreaterThanOrEqual(30)
    expect(w.f[1].x).toBeLessThanOrEqual(610)
  })
  it('sumo shoves the opponent out of the ring', () => {
    const w = mkWorld({ ...cfg, sumo: true, ring: 120 })
    w.f[0].x = 300
    w.f[1].x = 340
    for (let i = 0; i < 600 && w.f[1].act !== 'ko'; i++) {
      step(w, [inp({ punch: true, dir: 1 }), inp()], 1 / 60)
    }
    expect(w.f[1].act).toBe('ko')
  })
})

describe('fighter AI', () => {
  const fight = (diff: 0 | 1 | 2, seed: number) => {
    const w = mkWorld(cfg)
    const ai = mkAi()
    const r = makeRng(seed)
    for (let i = 0; i < 20 * 60 && w.f[1].act !== 'ko'; i++) step(w, [NO_INPUT, aiInput(w, 1, ai, 1 / 60, diff, r)], 1 / 60)
    return 100 - w.f[0].hp
  }
  it('attacks a passive dummy, harder AIs do more damage', () => {
    let easy = 0
    let hard = 0
    for (let s = 1; s <= 5; s++) {
      easy += fight(0, s)
      hard += fight(2, s)
    }
    expect(easy).toBeGreaterThan(0)
    expect(hard).toBeGreaterThan(easy)
  })
  it('hard AI beats a button-masher more often than easy AI', () => {
    const duel = (diff: 0 | 1 | 2, seed: number) => {
      const w = mkWorld(cfg)
      const ai = mkAi()
      const r = makeRng(seed)
      const m = makeRng(seed + 99)
      for (let i = 0; i < 40 * 60 && w.f[0].act !== 'ko' && w.f[1].act !== 'ko'; i++) {
        const dir = (w.f[1].x > w.f[0].x ? 1 : -1) as 1 | -1
        const masher = inp({ dir: Math.abs(w.f[1].x - w.f[0].x) > 60 ? dir : 0, punch: m() < 0.1, kick: m() < 0.05 })
        step(w, [masher, aiInput(w, 1, ai, 1 / 60, diff, r)], 1 / 60)
      }
      return w.f[0].hp - w.f[1].hp
    }
    let easy = 0
    let hard = 0
    for (let s = 1; s <= 8; s++) {
      easy += duel(0, s)
      hard += duel(2, s)
    }
    expect(hard).toBeLessThan(easy)
  })
})
