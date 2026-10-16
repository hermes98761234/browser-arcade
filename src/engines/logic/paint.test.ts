import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { FIRE, floodFill, makeNoise, SAND, SandWorld, spiro, spiroPeriod, SYM_ORDER, symTransforms, WATER, WOOD } from './paint'

describe('floodFill', () => {
  it('fills only the enclosed region', () => {
    const w = 10
    const h = 10
    const d = new Uint8ClampedArray(w * h * 4)
    for (let y = 0; y < h; y++) for (const x of [5]) { const i = (y * w + x) * 4; d[i + 3] = 255 }
    const n = floodFill(d, w, h, 1, 1, [255, 0, 0, 255])
    expect(n).toBe(50)
    expect(d[(1 * w + 7) * 4 + 3]).toBe(0)
    expect(floodFill(d, w, h, 1, 1, [255, 0, 0, 255])).toBe(0)
  })
})

describe('symmetry', () => {
  it('has expected copies', () => {
    expect(SYM_ORDER.map((m) => symTransforms(m).length)).toEqual([1, 2, 4, 6, 16])
  })
})

describe('sand world', () => {
  it('conserves sand and settles it on the floor', () => {
    const r = makeRng(3)
    const s = new SandWorld(20, 30)
    for (let i = 0; i < 40; i++) s.set(10, i % 10, SAND, 0, r)
    const before = s.count(SAND)
    for (let i = 0; i < 200; i++) s.step(r)
    expect(s.count(SAND)).toBe(before)
    let airborne = 0
    for (let y = 0; y < 25; y++) for (let x = 0; x < 20; x++) if (s.t[y * 20 + x] === SAND) airborne++
    expect(airborne).toBe(0)
  })
  it('water flows flat and sand sinks through it', () => {
    const r = makeRng(5)
    const s = new SandWorld(12, 12)
    for (let x = 4; x < 8; x++) s.set(x, 0, WATER, 0, r)
    for (let i = 0; i < 100; i++) s.step(r)
    expect(s.count(WATER)).toBe(4)
    let row = 0
    for (let x = 0; x < 12; x++) if (s.t[11 * 12 + x] === WATER) row++
    expect(row).toBe(4)
  })
  it('fire burns wood away', () => {
    const r = makeRng(9)
    const s = new SandWorld(10, 10)
    for (let x = 2; x < 8; x++) s.set(x, 9, WOOD, 0, r)
    s.set(2, 8, FIRE, 0, r)
    for (let i = 0; i < 600; i++) {
      if (s.count(FIRE) === 0 && i > 5) break
      s.step(r)
    }
    expect(s.count(WOOD)).toBeLessThan(6)
  })
})

describe('generative maths', () => {
  it('noise is deterministic and bounded', () => {
    const a = makeNoise(4)
    const b = makeNoise(4)
    for (let i = 0; i < 50; i++) {
      const v = a(i * 0.37, i * 0.11)
      expect(v).toBe(b(i * 0.37, i * 0.11))
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    }
  })
  it('spirograph closes after its period', () => {
    const T = spiroPeriod(200, 50)
    const p0 = spiro(200, 50, 80, 0)
    const p1 = spiro(200, 50, 80, T)
    expect(Math.hypot(p0[0] - p1[0], p0[1] - p1[1])).toBeLessThan(1e-6)
  })
})
