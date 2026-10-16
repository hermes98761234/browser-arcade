import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { BOSS_KINDS, bossVolley, kindsFor, patternStyle, waveSpec } from './shmup'

describe('shmup logic', () => {
  it('waves are deterministic and grow', () => {
    expect(waveSpec(3, makeRng(9), 1, false)).toEqual(waveSpec(3, makeRng(9), 1, false))
    expect(waveSpec(8, makeRng(9), 1, false).groups.length).toBeGreaterThanOrEqual(waveSpec(1, makeRng(9), 1, false).groups.length)
    expect(waveSpec(3, makeRng(1), 1, true).boss).toBe(true)
  })
  it('volleys are non-empty and finite', () => {
    for (const k of BOSS_KINDS) {
      const v = bossVolley(k, 12, 5, 1.2)
      expect(v.length).toBeGreaterThan(0)
      for (const s of v) expect(Number.isFinite(s.a) && s.spd > 0).toBe(true)
    }
  })
  it('has volleys for the extra pattern kinds', () => {
    for (const k of ['snow', 'star', 'ribbon', 'curtain'] as const) expect(bossVolley(k, 12, 3, 0).length).toBeGreaterThan(2)
    expect(patternStyle('petal storm cherry blossom')).toBe('flower')
    expect(kindsFor('snow', 0)).toHaveLength(3)
  })
})
