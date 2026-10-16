import { describe, expect, it } from 'vitest'
import { City, Colony, pickBuild, pickColony } from './idleSim'

describe('idle city builder', () => {
  it('adjacency pays: shops next to homes earn more', () => {
    const c = new City(6)
    c.money = 1e4
    c.build(0, 0)
    c.build(7, 0)
    const solo = new City(6)
    solo.money = 1e4
    solo.build(0, 3)
    c.build(1, 3)
    expect(c.tileIncome(1)).toBeGreaterThan(solo.tileIncome(0))
  })
  it('guards protect neighbours from strikes', () => {
    const c = new City(6)
    c.money = 1e4
    c.build(0, 0)
    c.build(1, 5)
    c.build(20, 0)
    const out = c.strike(5, () => 0)
    expect(out).toEqual([20])
    expect(c.cells[0]).not.toBeNull()
  })
  it('a greedy bot reaches 60000 coins in a sensible time', () => {
    const c = new City(6)
    let t = 0
    for (; t < 3600 && c.earned < 60000; t += 0.5) {
      c.tick(0.5)
      let best: { i: number; k: number; r: number } | null = null
      for (let k = 0; k < 5; k++) {
        const cost = c.buildCost(k)
        if (cost > c.money) continue
        for (let i = 0; i < 36; i++) {
          if (c.cells[i]) continue
          const before = c.income()
          c.cells[i] = { k, lv: 1 }
          const d = c.income() - before
          c.cells[i] = null
          const r = d / cost
          if (!best || r > best.r) best = { i, k, r }
        }
      }
      if (best) c.build(best.i, best.k)
      for (let i = 0; i < 36; i++) if (c.cells[i] && c.upCost(i) <= c.money * 0.5) c.upgrade(i)
    }
    console.log('city bot seconds to 60000', t)
    expect(t).toBeLessThan(900)
    expect(t).toBeGreaterThan(60)
  })
  it('themes resolve', () => {
    expect(pickBuild('Volcano Village').kinds[5][0]).toBe('Lava Wall')
    expect(pickColony('Space Colony manage oxygen').needs[0][0]).toBe('Oxygen')
    expect(pickColony('Pet Virtual Tamagotchi').pop).toBe('Pets')
  })
})

describe('idle colony', () => {
  it('overpopulation without upgrades shrinks the population', () => {
    const c = new Colony()
    c.pop = 8
    for (let t = 0; t < 400 && !c.lost; t += 0.5) c.tick(0.5)
    expect(c.pop).toBeLessThan(8)
  })
  it('an attentive bot thrives and earns', () => {
    const c = new Colony()
    let t = 0
    for (; t < 1500 && c.earned < 6000 && !c.lost; t += 0.25) {
      c.tick(0.25)
      for (let i = 0; i < 4; i++) if (c.needs[i] < 40) c.boost(i)
      // buy the weakest supply first, housing when everything is positive
      let w = 0
      for (let i = 1; i < 4; i++) if (c.net(i) < c.net(w)) w = i
      if (c.net(w) < 0.5) c.buyMaker(w)
      else if (c.pop >= c.cap()) c.buyHome()
      else c.buyAuto()
    }
    console.log('colony bot seconds to 6000', t, 'pop', c.pop)
    expect(c.lost).toBe(false)
    expect(t).toBeLessThan(900)
    expect(t).toBeGreaterThan(60)
  })
})
