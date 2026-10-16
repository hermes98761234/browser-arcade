import { describe, expect, it } from 'vitest'
import { ALL_EVENTS, JFLAVORS, pickKind } from './journeyEvents'

describe('journey events', () => {
  it('has at least 40 events with unique ids and valid outcomes', () => {
    expect(ALL_EVENTS.length).toBeGreaterThanOrEqual(40)
    expect(new Set(ALL_EVENTS.map((e) => e.id)).size).toBe(ALL_EVENTS.length)
    for (const e of ALL_EVENTS) {
      expect(e.ch.length).toBeGreaterThanOrEqual(2)
      for (const c of e.ch) {
        expect(c.outs.length).toBeGreaterThan(0)
        const w = c.outs.reduce((s, o) => s + o[0], 0)
        expect(w).toBeCloseTo(1, 5)
      }
    }
  })
  it('every flavor has enough towns, names and events', () => {
    for (const f of Object.values(JFLAVORS)) {
      expect(f.towns.length).toBeGreaterThanOrEqual(12)
      expect(f.names.length).toBeGreaterThanOrEqual(8)
      expect(f.events.length).toBeGreaterThanOrEqual(20)
    }
  })
  it('picks a kind from keywords', () => {
    expect(pickKind('Desert Caravan', 'western')).toBe('desert')
    expect(pickKind('Starship Captain Log', 'space')).toBe('space')
    expect(pickKind('Ash Wanderer', 'wasteland')).toBe('waste')
    expect(pickKind('Pioneer Trail Town', 'nature')).toBe('trail')
  })
})
