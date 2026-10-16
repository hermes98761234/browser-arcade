import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import {
  calcDamage, CARDS, CARD_BY_ID, endTurn, ENEMIES, floorEnemies, livingEnemies, playCard, playable, rewardChoices, startCombat, STARTER, type Combat,
} from './deckbuilder'

const rng = () => makeRng(7)
const setHand = (c: Combat, ids: string[]) => {
  c.hand = ids.slice()
}

describe('deckbuilder', () => {
  it('has 30+ cards with unique ids and sane costs', () => {
    expect(CARDS.length).toBeGreaterThanOrEqual(30)
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(CARDS.length)
    for (const c of CARDS) {
      expect(c.cost).toBeGreaterThanOrEqual(0)
      expect(c.cost).toBeLessThanOrEqual(3)
      expect(c.desc.length).toBeGreaterThan(3)
    }
    for (const id of STARTER) expect(CARD_BY_ID.has(id)).toBe(true)
  })
  it('opening hand has 5 cards and 3 energy', () => {
    const c = startCombat(STARTER, 70, 70, [ENEMIES.grunt], rng(), 1)
    expect(c.hand.length).toBe(5)
    expect(c.draw.length).toBe(5)
    expect(c.player.energy).toBe(3)
  })
  it('damage goes through block, then hp; vulnerable and weak scale damage', () => {
    const c = startCombat(STARTER, 70, 70, [ENEMIES.grunt], rng(), 1)
    c.enemies[0].block = 4
    setHand(c, ['strike', 'strike', 'bash'])
    playCard(c, 0, 0, rng())
    expect(c.enemies[0].block).toBe(0)
    expect(c.enemies[0].hp).toBe(30 - 2)
    playCard(c, 0, 0, rng())
    expect(c.enemies[0].hp).toBe(30 - 2 - 6)
    expect(c.player.energy).toBe(1)
    expect(playable(c, 0)).toBe(false) // bash costs 2
    expect(calcDamage(10, { hp: 1, maxHp: 1, block: 0, str: 0, vuln: 0, weak: 1 }, { hp: 1, maxHp: 1, block: 0, str: 0, vuln: 2, weak: 0 })).toBe(10)
  })
  it('exhaust, powers and draw/reshuffle work', () => {
    const c = startCombat(['strike', 'strike', 'strike', 'strike', 'strike', 'rage', 'adren', 'defend'], 70, 70, [ENEMIES.grunt], rng(), 1)
    setHand(c, ['rage', 'adren', 'strike'])
    c.draw = []
    c.discard = ['defend', 'defend']
    playCard(c, 0, 0, rng())
    expect(c.player.str).toBe(2)
    playCard(c, 0, 0, rng())
    expect(c.exhaust).toContain('adren')
    expect(c.player.energy).toBe(3 - 1 + 1)
    expect(c.hand.includes('defend')).toBe(true)
  })
  it('enemy intents fire at end of turn, block resets and the player can die', () => {
    const c = startCombat(STARTER, 10, 70, [ENEMIES.grunt], rng(), 1)
    c.player.block = 3
    const ev = endTurn(c, rng())
    expect(ev.some((e) => e.k === 'dmg' && e.to === 'p')).toBe(true)
    expect(c.player.hp).toBe(10 - 4)
    expect(c.turn).toBe(2)
    expect(c.player.block).toBe(0)
    c.player.hp = 3
    c.enemies[0].intent = { k: 'attack', n: 50 }
    endTurn(c, rng())
    expect(c.over).toBe('lose')
  })
  it('killing every enemy wins; AoE hits all', () => {
    const c = startCombat(STARTER, 70, 70, [{ ...ENEMIES.twin, hp: 5 }, { ...ENEMIES.caster, hp: 5 }], rng(), 2)
    setHand(c, ['cleave'])
    playCard(c, 0, 0, rng())
    expect(livingEnemies(c).length).toBe(0)
    expect(c.over).toBe('win')
  })
  it('targeting a dead or missing enemy is rejected when several are alive', () => {
    const c = startCombat(STARTER, 70, 70, [ENEMIES.twin, ENEMIES.caster], rng(), 2)
    setHand(c, ['strike'])
    expect(playCard(c, 0, 9, rng())).toBeNull()
  })
  it('reward choices are 3 distinct non-starter cards', () => {
    for (let s = 1; s < 20; s++) {
      const r = rewardChoices(makeRng(s), 1 + (s % 3))
      expect(new Set(r.map((x) => x.id)).size).toBe(3)
      expect(r.some((x) => x.id === 'strike' || x.id === 'defend')).toBe(false)
    }
  })
  it('a greedy bot beats floor 1 on easy and the whole run is finite', () => {
    const r = makeRng(11)
    let wins = 0
    for (let trial = 0; trial < 10; trial++) {
      const c = startCombat(STARTER, 90, 90, floorEnemies(1, r, 0), r, 1)
      for (let turn = 0; turn < 40 && !c.over; turn++) {
        for (let guard = 0; guard < 12; guard++) {
          const order = c.hand.map((id, i) => ({ i, d: CARD_BY_ID.get(id)! })).filter((x) => x.d.cost <= c.player.energy).sort((a, b) => (b.d.dmg ?? 0) - (a.d.dmg ?? 0))
          const play = order.find((x) => x.d.dmg !== undefined) ?? order.find((x) => x.d.block !== undefined)
          if (!play) break
          playCard(c, play.i, 0, r)
          if (c.over) break
        }
        if (!c.over) endTurn(c, r)
      }
      if (c.over === 'win') wins++
    }
    expect(wins).toBeGreaterThanOrEqual(8)
  })
})
