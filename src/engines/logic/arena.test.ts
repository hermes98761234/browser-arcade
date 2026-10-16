import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { grow, pickUpgrades, waveComposition } from './arena'

describe('arena logic', () => {
  it('waves escalate and end with a boss', () => {
    const cnt = (w: number) => waveComposition(w, 8, 1).reduce((a, s) => a + s.n, 0)
    expect(cnt(6)).toBeGreaterThan(cnt(1))
    expect(waveComposition(8, 8, 1)[0].kind).toBe('boss')
  })
  it('offers distinct upgrades that respect caps', () => {
    const u = pickUpgrades(makeRng(3), { dmg: 5 })
    expect(new Set(u.map((x) => x.id)).size).toBe(3)
    expect(u.some((x) => x.id === 'dmg')).toBe(false)
  })
  it('eating grows monotonically', () => {
    expect(grow(20, 10)).toBeGreaterThan(20)
  })
})
