import { describe, expect, it } from 'vitest'
import { FLAVORS, LEADER_DECK, LIFE_DECK, pickFlavor } from './reignsDeck'

describe('reigns deck', () => {
  const all = [...LEADER_DECK, ...LIFE_DECK]
  it('has at least 60 unique cards', () => {
    expect(all.length).toBeGreaterThanOrEqual(80)
    expect(new Set(all.map((c) => c.id)).size).toBe(all.length)
  })
  it('chains point to existing chain cards', () => {
    const ids = new Map(all.map((c) => [c.id, c]))
    for (const c of all) for (const o of [c.L, c.R]) if (o.next) expect(ids.get(o.next[0])?.chain).toBe(true)
  })
  it('every card uses known roles and has finite effects', () => {
    for (const c of all) for (const f of Object.values(FLAVORS)) {
      expect(f.roles[c.who]).toBeTruthy()
      for (const o of [c.L, c.R]) expect(o.fx.every((x) => Number.isFinite(x))).toBe(true)
    }
  })
  it('picks flavors', () => {
    expect(pickFlavor('Mayor for a Day', 'myth').id).toBe('politics')
    expect(pickFlavor('Space Station Living', 'space').id).toBe('life')
    expect(pickFlavor('Pirate Democracy', 'pirate').id).toBe('pirate')
    expect(pickFlavor('Kingdom Reigns', 'fantasy').id).toBe('kingdom')
  })
})
