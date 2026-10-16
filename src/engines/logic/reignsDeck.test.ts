import { describe, expect, it } from 'vitest'
import { FLAVORS, LEADER_DECK, LIFE_DECK, pickFlavor } from './reignsDeck'
import { MORE_FLAVORS } from './reignsMore'

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
    expect(pickFlavor('Space Station Living', 'space').id).toBe('spacelife')
    expect(pickFlavor('Pirate Democracy', 'pirate').id).toBe('pirate')
    expect(pickFlavor('Kingdom Reigns', 'fantasy').id).toBe('kingdom')
  })
  it('setting-specific decks only use their own roles and valid chains', () => {
    for (const f of Object.values(MORE_FLAVORS)) {
      const deck = f.deck!
      expect(deck.length).toBeGreaterThanOrEqual(12)
      expect(new Set(deck.map((c) => c.id)).size).toBe(deck.length)
      const ids = new Map(deck.map((c) => [c.id, c]))
      for (const c of deck) {
        expect(f.roles[c.who], `${f.id}:${c.id}`).toBeTruthy()
        for (const o of [c.L, c.R]) {
          expect(o.fx.every((x) => Number.isFinite(x))).toBe(true)
          if (o.next) expect(ids.get(o.next[0])?.chain).toBe(true)
        }
      }
      expect(f.end).toHaveLength(8)
    }
  })
  it('routes government and life sims to their decks', () => {
    expect(pickFlavor('Campaign Trail run for office', 'myth').id).toBe('campaign')
    expect(pickFlavor('Dictator\'s Dilemma keep power', 'myth').id).toBe('regime')
    expect(pickFlavor('College Years study, party, graduate', 'cozy').id).toBe('college')
    expect(pickFlavor('Island Hermit Days castaway daily routine', 'cozy').id).toBe('island')
    expect(pickFlavor('Little Apartment decorate flat', 'cozy').id).toBe('life')
  })
})
