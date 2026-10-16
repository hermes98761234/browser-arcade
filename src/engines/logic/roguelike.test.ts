import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { bfsField, computeFov, findPath, genLevel, los, pickRogue, type LevelKind } from './roguelike'

describe('roguelike levels', () => {
  for (const kind of ['bsp', 'cave', 'maze'] as LevelKind[]) {
    it(`${kind}: stairs are reachable from the start and the level is deterministic`, () => {
      for (let s = 1; s <= 60; s++) {
        const lv = genLevel(makeRng(s), 48, 30, kind)
        const d = bfsField(lv.tiles, lv.w, lv.h, lv.start.x, lv.start.y, 9999)
        expect(lv.tiles[lv.start.y * lv.w + lv.start.x]).toBe(1)
        expect(d[lv.stairs.y * lv.w + lv.stairs.x], `seed ${s}`).toBeGreaterThan(10)
        const again = genLevel(makeRng(s), 48, 30, kind)
        expect(Array.from(again.tiles)).toEqual(Array.from(lv.tiles))
        // border is solid
        for (let x = 0; x < lv.w; x++) {
          expect(lv.tiles[x]).toBe(0)
          expect(lv.tiles[(lv.h - 1) * lv.w + x]).toBe(0)
        }
        // all floor tiles are connected to the start
        let unreachable = 0
        for (let i = 0; i < lv.tiles.length; i++) if (lv.tiles[i] && d[i] < 0) unreachable++
        expect(unreachable).toBe(0)
      }
    })
  }
})

describe('fov and paths', () => {
  const w = 20
  const h = 10
  const open = new Uint8Array(w * h)
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) open[y * w + x] = 1
  it('sees tiles within the radius in an open room', () => {
    const out = new Uint8Array(w * h)
    computeFov(open, w, h, 5, 5, 4, out)
    expect(out[5 * w + 8]).toBe(1)
    expect(out[5 * w + 12]).toBe(0)
  })
  it('walls block the view', () => {
    const t = open.slice()
    for (let y = 1; y < h - 1; y++) t[y * w + 8] = 0
    const out = new Uint8Array(w * h)
    computeFov(t, w, h, 5, 5, 10, out)
    expect(out[5 * w + 8]).toBe(1)
    expect(out[5 * w + 12]).toBe(0)
    expect(los(t, w, 5, 5, 12, 5)).toBe(false)
    expect(los(open, w, 5, 5, 12, 5)).toBe(true)
  })
  it('finds a path around walls', () => {
    const t = open.slice()
    for (let y = 1; y < h - 2; y++) t[y * w + 8] = 0
    const p = findPath(t, w, h, { x: 5, y: 3 }, { x: 12, y: 3 }, (i) => t[i] === 1)
    expect(p.length).toBeGreaterThan(7)
    expect(p[p.length - 1]).toEqual({ x: 12, y: 3 })
  })
})

describe('roguelike variants', () => {
  it('picks variants from game text', () => {
    const none = new Set<string>()
    expect(pickRogue('Dungeon Duo tank and healer roles', none, 'fantasy').ally).toBe('healer')
    expect(pickRogue("Wizard's Descent spell roguelike", none, 'fantasy').spells).toBe('wizard')
    expect(pickRogue('Rogue Archer bow combat dungeons', none, 'fantasy').bow).toBe(true)
    expect(pickRogue('Cat Burglar Night sneak through mansion rooftops', none, 'fantasy').stealth).toBe(true)
    expect(pickRogue('Noise Meter every footstep makes sound ripples', none, 'fantasy').noise).toBe(true)
    expect(pickRogue('One Room Dungeon single-screen rogue', none, 'fantasy').kind).toBe('room')
    expect(pickRogue('Slayer\'s Contract accept bounties on monsters', none, 'fantasy').contract).toBe(true)
    expect(pickRogue('ASCII Depths classic roguelike', none, 'fantasy').ascii).toBe(true)
  })
  it('a room level is walkable from start to stairs', () => {
    for (let seed = 1; seed < 40; seed++) {
      const lv = genLevel(makeRng(seed), 28, 13, 'room')
      const d = bfsField(lv.tiles, lv.w, lv.h, lv.start.x, lv.start.y, 999)
      expect(d[lv.stairs.y * lv.w + lv.stairs.x]).toBeGreaterThan(5)
    }
  })
})
