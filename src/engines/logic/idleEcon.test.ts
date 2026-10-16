import { describe, expect, it } from 'vitest'
import { Econ } from './idleEcon'

const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

/** Greedy bot: ~3 clicks/s, always saves for the best payback purchase. Returns seconds to reach `goal`. */
function sim(goal: number, clicksPerSec = 3, usePrestige = false): number {
  const e = new Econ(names, 'x')
  const dt = 0.1
  for (let t = 0; t < 3 * 3600; t += dt) {
    e.tick(dt)
    for (let k = 0; k < clicksPerSec * dt * 10; k++) if (Math.random() < 0.1) e.click()
    e.checkGoals()
    if (e.earned >= goal) return t
    // pick best payback among producers and upgrades
    const cps0 = e.cps() + e.clickValue() * clicksPerSec
    let best: { pay: number; cost: number; act: () => void } | null = null
    for (let i = 0; i < 8; i++) {
      const c = e.costOf(i, 1)
      e.count[i]++
      const d = e.cps() + e.clickValue() * clicksPerSec - cps0
      e.count[i]--
      if (d > 0 && (!best || c / d < best.pay)) best = { pay: c / d, cost: c, act: () => e.buy(i, 1) }
    }
    for (const u of e.available()) {
      e.owned.add(u.id)
      const d = e.cps() + e.clickValue() * clicksPerSec - cps0
      e.owned.delete(u.id)
      if (d > 0 && (!best || u.cost / d < best.pay)) best = { pay: u.cost / d, cost: u.cost, act: () => e.buyUpgrade(u) }
    }
    if (best && e.money >= best.cost) best.act()
    if (usePrestige && e.prestigeGain() >= Math.max(3, e.pp * 1.5) && e.cps() > 0) e.prestige()
  }
  return Infinity
}

describe('idle economy', () => {
  it('goals are reachable in a sensible time window', () => {
    const t = (g: number) => Math.round(sim(g) / 60)
    const res = { easy: t(3e5), normal: t(2e6), hard: t(1e7) }
    console.log('minutes to goal', JSON.stringify(res))
    expect(res.normal).toBeLessThan(16)
    expect(res.easy).toBeGreaterThan(0)
  })
  it('prestige resets the run but keeps a bonus', () => {
    const e = new Econ(names, 'x')
    e.gain(5e5)
    e.count[0] = 5
    const g = e.prestige()
    expect(g).toBe(2)
    expect(e.money).toBe(0)
    expect(e.globalMult()).toBeCloseTo(1.6)
  })
})
