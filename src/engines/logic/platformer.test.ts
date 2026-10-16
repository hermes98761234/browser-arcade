import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { genLevel, solvable, T, type GenOpts } from './platformer'

describe('platformer generator', () => {
  const variants: Partial<GenOpts>[] = [{}, { grapple: true }, { gravity: true }, { key: true }, { sky: true }, { climb: true }, { climb: true, key: true, grapple: true }, { gravity: true, key: true, grapple: true }]
  it('always produces solvable levels', () => {
    for (const v of variants) {
      for (let seed = 1; seed <= 25; seed++) {
        for (let level = 1; level <= 6; level++) {
          const l = genLevel(makeRng(seed * 7919 + level), { level, diff: (seed % 3) as 0 | 1 | 2, ...v })
          expect(solvable(l), `${JSON.stringify(v)} seed ${seed} level ${level}`).toBe(true)
        }
      }
    }
  })
  it('is deterministic and gets longer', () => {
    const a = genLevel(makeRng(5), { level: 1, diff: 1 })
    const b = genLevel(makeRng(5), { level: 1, diff: 1 })
    expect(Array.from(a.tiles)).toEqual(Array.from(b.tiles))
    expect(genLevel(makeRng(5), { level: 5, diff: 1 }).w).toBeGreaterThan(a.w)
  })
  it('places key and door when asked', () => {
    const l = genLevel(makeRng(9), { level: 2, diff: 1, key: true })
    expect(l.key).not.toBeNull()
    expect(l.tiles.includes(T.DOOR)).toBe(true)
  })
})
