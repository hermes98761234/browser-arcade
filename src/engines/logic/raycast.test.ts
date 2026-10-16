import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { bfs, EXIT, genRayLevel } from './raycast'

describe('raycast levels', () => {
  for (const style of ['maze', 'dungeon'] as const) {
    it(`${style}: everything is reachable and the exit is far away`, () => {
      for (let s = 1; s <= 25; s++) {
        const size = style === 'maze' ? 6 + (s % 6) : 24 + (s % 10)
        const l = genRayLevel(makeRng(s * 31), { style, size, keys: 2, foes: 4, loot: 6 })
        const d = bfs(l.tiles, l.w, l.h, l.start)
        expect(d[l.exitFront.y * l.w + l.exitFront.x]).toBeGreaterThan(size / 2)
        expect(l.tiles[l.exit.y * l.w + l.exit.x]).toBe(EXIT)
        for (const c of [...l.keys, ...l.treasures, ...l.health, ...l.ammo, ...l.foes]) expect(d[c.y * l.w + c.x]).toBeGreaterThanOrEqual(0)
        // borders are solid
        for (let x = 0; x < l.w; x++) {
          expect(l.tiles[x]).not.toBe(0)
          expect(l.tiles[(l.h - 1) * l.w + x]).not.toBe(0)
        }
      }
    })
  }
})
