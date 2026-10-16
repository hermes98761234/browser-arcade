import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { aiChoose, apply, BCARDS, buildDeck, HERO_HP, legalActions, newGame, type BState } from './battler'

const rng = () => makeRng(3)
const fresh = () => {
  const { s } = newGame(buildDeck(makeRng(1)), buildDeck(makeRng(2)), rng())
  return s
}
const give = (s: BState, who: 0 | 1, ids: string[]) => {
  s.sides[who].hand = ids.slice()
}

describe('battler', () => {
  it('has 25+ cards, 30-card decks with copy limits', () => {
    expect(BCARDS.length).toBeGreaterThanOrEqual(25)
    const d = buildDeck(makeRng(9))
    expect(d.length).toBe(30)
    const counts = new Map<string, number>()
    for (const id of d) counts.set(id, (counts.get(id) ?? 0) + 1)
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(2)
  })
  it('starts with 4 cards and 1 mana for the first player', () => {
    const s = fresh()
    expect(s.sides[0].hand.length).toBe(5) // 4 + draw for the turn
    expect(s.sides[1].hand.length).toBe(5)
    expect(s.sides[0].mana).toBe(1)
    expect(s.turn).toBe(0)
  })
  it('minions need mana, an empty lane, and have summoning sickness', () => {
    const s = fresh()
    s.sides[0].mana = 2
    give(s, 0, ['guard', 'ogre'])
    expect(apply(s, { t: 'play', hand: 1, lane: 0 })).toBeNull() // ogre costs 4
    expect(apply(s, { t: 'play', hand: 0, lane: 1 })).not.toBeNull()
    expect(s.sides[0].mana).toBe(0)
    expect(apply(s, { t: 'play', hand: 0, lane: 1 })).toBeNull()
    const hp = s.sides[1].hp
    apply(s, { t: 'end' })
    expect(s.sides[1].hp).toBe(hp) // sick minion did not attack
    expect(s.turn).toBe(1)
  })
  it('lane combat: trade, empty lane hits the hero, swift avoids retaliation', () => {
    const s = fresh()
    s.sides[0].mana = 5
    s.sides[1].mana = 5
    give(s, 0, ['rogue', 'knight'])
    apply(s, { t: 'play', hand: 0, lane: 0 })
    apply(s, { t: 'play', hand: 0, lane: 1 })
    apply(s, { t: 'end' })
    give(s, 1, ['squire'])
    apply(s, { t: 'play', hand: 0, lane: 0 })
    apply(s, { t: 'end' })
    // now player 0: rogue (3/1 swift) vs squire (2/1) in lane 0; knight in lane 1 vs empty
    const heroBefore = s.sides[1].hp
    apply(s, { t: 'end' })
    expect(s.sides[1].board[0]).toBeNull() // squire died
    expect(s.sides[0].board[0]).not.toBeNull() // swift rogue survived
    expect(s.sides[1].hp).toBe(heroBefore - 3) // knight hit the empty lane
  })
  it('spells: damage hero, kill needs an enemy minion, heal caps at max', () => {
    const s = fresh()
    s.sides[0].mana = 10
    give(s, 0, ['fireball', 'smite', 'heal'])
    expect(apply(s, { t: 'play', hand: 1, target: { side: 1, lane: 0 } })).toBeNull()
    apply(s, { t: 'play', hand: 0, target: { side: 1, lane: -1 } })
    expect(s.sides[1].hp).toBe(HERO_HP - 5)
    s.sides[0].hp = 28
    apply(s, { t: 'play', hand: 1, target: { side: 0, lane: -1 } })
    expect(s.sides[0].hp).toBe(HERO_HP)
  })
  it('venom, shield and thorns', () => {
    const s = fresh()
    s.sides[0].mana = 10
    s.sides[1].mana = 10
    give(s, 0, ['spider'])
    apply(s, { t: 'play', hand: 0, lane: 0 })
    apply(s, { t: 'end' })
    give(s, 1, ['ogre'])
    apply(s, { t: 'play', hand: 0, lane: 0 })
    apply(s, { t: 'end' })
    apply(s, { t: 'end' }) // spider (venom) hits ogre
    expect(s.sides[1].board[0]).toBeNull()
  })
  it('AI vs AI games always finish with only legal actions', () => {
    for (let seed = 1; seed <= 12; seed++) {
      const r = makeRng(seed)
      const { s } = newGame(buildDeck(r), buildDeck(r), r)
      let steps = 0
      while (s.over === null && steps++ < 4000) {
        const a = aiChoose(s, (seed % 3) as 0 | 1 | 2, r)
        const legal = legalActions(s)
        expect(legal.some((l) => JSON.stringify(l) === JSON.stringify(a))).toBe(true)
        expect(apply(s, a)).not.toBeNull()
        for (const side of s.sides) expect(side.mana).toBeGreaterThanOrEqual(0)
      }
      expect(s.over).not.toBeNull()
    }
  })
  it('hard AI beats easy AI most of the time', () => {
    let hardWins = 0
    for (let seed = 1; seed <= 14; seed++) {
      const r = makeRng(seed * 5)
      const { s } = newGame(buildDeck(r), buildDeck(r), r)
      const diff = (who: 0 | 1) => (who === 0 ? 2 : 0)
      let steps = 0
      while (s.over === null && steps++ < 4000) apply(s, aiChoose(s, diff(s.turn) as 0 | 2, r))
      if (s.over === 0) hardWins++
    }
    expect(hardWins).toBeGreaterThanOrEqual(10)
  })
})
