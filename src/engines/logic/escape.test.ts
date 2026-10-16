import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { caesar, clueValue, genRoom, genSlider, isSolved, neighbours, newState, nextHint, pickFlavor, slide, solveSlider, tap, tryLock, readItem, type Action, type Room } from './escape'

const POOL = ['🍎', '🔑', '💎', '🕯️', '📜', '🍄']

/** A bot that plays with full knowledge of the answers, using only the public interaction API. */
function solve(room: Room): boolean {
  const st = newState()
  const act = (a: Action) => {
    if (a.t === 'modal') {
      const m = a.modal
      if (m.t === 'lock') {
        const l = m.lock
        const attempt = l.t === 'item' ? '' : l.code
        tryLock(room, st, m.id, attempt)
      } else if (m.t === 'slider') solveSlider(room, st, m.id)
    }
  }
  for (let round = 0; round < 40 && !st.exited; round++) {
    for (const h of room.hotspots) {
      for (const sel of [null, ...st.inv]) {
        act(tap(room, st, h.id, sel))
        if (st.exited) break
      }
    }
    if (st.inv.includes('codenote')) readItem(room, st, 'codenote')
  }
  return st.exited
}

describe('escape rooms', () => {
  it('are always solvable and deterministic', () => {
    for (let seed = 1; seed <= 150; seed++) {
      for (const diff of [0, 1, 2] as const) {
        const rng = makeRng(seed * 7 + diff)
        const rooms = [0, 1, 2].map((index) => genRoom(rng, { index, diff, flavor: pickFlavor('Locked Lab', new Set()), pool: POOL }))
        for (const r of rooms) {
          expect(solve(r), `seed ${seed} diff ${diff} room ${r.index}`).toBe(true)
          expect(r.hotspots.length).toBeLessThanOrEqual(15)
          for (const h of r.hotspots) {
            expect(h.x).toBeGreaterThan(0)
            expect(h.x).toBeLessThan(100)
          }
        }
        const again = makeRng(seed * 7 + diff)
        expect(genRoom(again, { index: 0, diff, flavor: pickFlavor('Locked Lab', new Set()), pool: POOL }).code).toBe(rooms[0].code)
      }
    }
  })

  it('clues really spell out the code', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const r = genRoom(makeRng(seed), { index: seed % 3, diff: 1, flavor: pickFlavor('x', new Set()), pool: POOL })
      const hs = r.hotspots
      if (r.lockKind === 'digits') {
        const vals = r.sources.map((s) => {
          const h = hs.find((x) => x.id === s)!
          if (h.kind === 'slider') return String((h.reward as { digit: number }).digit)
          return clueValue(h.clue!)
        })
        expect(vals.join('')).toBe(r.code)
      } else if (r.lockKind === 'colors') {
        expect(clueValue(hs.find((x) => x.id === 'colors')!.clue!)).toBe(r.code)
      } else {
        expect(clueValue(hs.find((x) => x.id === 'cipher')!.clue!)).toBe(r.code)
      }
    }
  })

  it('hints progress as the room is solved', () => {
    const r = genRoom(makeRng(5), { index: 0, diff: 1, flavor: pickFlavor('x', new Set()), pool: POOL })
    const st = newState()
    const first = nextHint(r, st)
    expect(first.length).toBeGreaterThan(5)
    expect(solve(r)).toBe(true)
  })

  it('caesar round-trips', () => {
    expect(caesar(caesar('SEVEN', 5), -5)).toBe('SEVEN')
  })
})

describe('slider', () => {
  it('shuffles to solvable, unsolved boards', () => {
    for (let s = 1; s < 80; s++) {
      const t = genSlider(makeRng(s))
      expect(isSolved(t)).toBe(false)
      // solvable: inversion parity of a 3x3 board must be even
      const flat = t.filter((v) => v !== 0)
      let inv = 0
      for (let i = 0; i < flat.length; i++) for (let j = i + 1; j < flat.length; j++) if (flat[i] > flat[j]) inv++
      expect(inv % 2).toBe(0)
    }
  })
  it('slides only adjacent tiles', () => {
    const t = [1, 2, 3, 4, 5, 6, 7, 0, 8]
    expect(slide(t, 0)).toBe(false)
    expect(slide(t, 8)).toBe(true)
    expect(isSolved(t)).toBe(true)
    expect(neighbours(4).length).toBe(4)
  })
})
