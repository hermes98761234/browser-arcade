// Pure economy model for the classic idle/tycoon mode (UI-free, so it can be simulated in tests).
import { bulkCost, maxAffordable, PROD_COST, PROD_RATE } from './idle'

export interface Upg {
  id: string
  name: string
  desc: string
  cost: number
  kind: 'click' | 'prod' | 'global' | 'finger'
  i: number
  /** Unlock condition. */
  req: (e: Econ) => boolean
}

export interface Goal {
  id: string
  name: string
  done: (e: Econ) => boolean
}

const TIERS = [
  { n: 1, c: 5, nm: 'Boost' },
  { n: 10, c: 50, nm: 'Mastery' },
  { n: 25, c: 500, nm: 'Perfection' },
]

export class Econ {
  money = 0
  earned = 0
  runEarned = 0
  clicks = 0
  count: number[] = Array(8).fill(0)
  owned = new Set<string>()
  pp = 0
  goalsDone = new Set<string>()
  prestiges = 0
  upgrades: Upg[]
  goals: Goal[]

  names: string[]
  unit: string

  constructor(names: string[], unit: string) {
    this.names = names
    this.unit = unit
    const u: Upg[] = []
    for (let l = 0; l < 6; l++) {
      u.push({ id: `click${l}`, name: `Stronger ${['hands', 'grip', 'focus', 'rhythm', 'fury', 'mastery'][l]}`, desc: 'Clicks are twice as strong', cost: 100 * 10 ** l * (l > 1 ? 1.5 : 1), kind: 'click', i: l, req: (e) => l === 0 || e.owned.has(`click${l - 1}`) })
    }
    for (let l = 0; l < 3; l++) {
      u.push({ id: `finger${l}`, name: `Golden touch ${'I'.repeat(l + 1)}`, desc: 'Clicks also give +1% of your income/s', cost: 5000 * 100 ** l, kind: 'finger', i: l, req: (e) => e.owned.has(`click${l + 1}`) && (l === 0 || e.owned.has(`finger${l - 1}`)) })
    }
    names.forEach((nm, i) => {
      TIERS.forEach((t, ti) => {
        u.push({ id: `p${i}t${ti}`, name: `${nm} ${t.nm}`, desc: `${nm} output x2`, cost: PROD_COST[i] * t.c, kind: 'prod', i, req: (e) => e.count[i] >= t.n && (ti === 0 || e.owned.has(`p${i}t${ti - 1}`)) })
      })
    })
    for (let g = 0; g < 4; g++) {
      u.push({ id: `g${g}`, name: ['Synergy', 'Efficiency', 'Logistics', 'Monopoly'][g], desc: 'All income +25%', cost: 2e4 * 20 ** g, kind: 'global', i: g, req: (e) => e.earned >= (2e4 * 20 ** g) / 4 })
    }
    this.upgrades = u
    this.goals = []
    for (const [i, v] of [1e3, 1e4, 1e5, 1e6, 1e7, 1e8].entries()) this.goals.push({ id: `e${i}`, name: `Earn ${v.toExponential(0).replace('e+', 'e')} total`, done: (e) => e.earned >= v })
    for (const v of [25, 100, 250]) this.goals.push({ id: `o${v}`, name: `Own ${v} producers`, done: (e) => e.totalOwned() >= v })
    for (const v of [100, 1000]) this.goals.push({ id: `c${v}`, name: `Click ${v} times`, done: (e) => e.clicks >= v })
    this.goals.push({ id: 'p10', name: `Own 10 ${names[1]}`, done: (e) => e.count[1] >= 10 })
    this.goals.push({ id: 'p0', name: `Own 25 ${names[0]}`, done: (e) => e.count[0] >= 25 })
    this.goals.push({ id: 'pr', name: 'Prestige once', done: (e) => e.prestiges >= 1 })
  }

  totalOwned() {
    return this.count.reduce((a, b) => a + b, 0)
  }
  globalMult() {
    let m = (1 + 0.3 * this.pp) * (1 + 0.03 * this.goalsDone.size)
    for (let g = 0; g < 4; g++) if (this.owned.has(`g${g}`)) m *= 1.25
    return m
  }
  prodMult(i: number) {
    let m = 1
    for (let t = 0; t < 3; t++) if (this.owned.has(`p${i}t${t}`)) m *= 2
    return m
  }
  rateOf(i: number) {
    return PROD_RATE[i] * this.count[i] * this.prodMult(i) * this.globalMult()
  }
  cps() {
    let s = 0
    for (let i = 0; i < 8; i++) s += this.rateOf(i)
    return s
  }
  clickValue() {
    let c = 1
    for (let l = 0; l < 6; l++) if (this.owned.has(`click${l}`)) c *= 2
    let f = 0
    for (let l = 0; l < 3; l++) if (this.owned.has(`finger${l}`)) f += 0.01
    return (c + f * this.cps() / Math.max(0.0001, this.globalMult())) * this.globalMult()
  }
  gain(n: number) {
    this.money += n
    this.earned += n
    this.runEarned += n
  }
  click() {
    const v = this.clickValue()
    this.clicks++
    this.gain(v)
    return v
  }
  tick(dt: number) {
    this.gain(this.cps() * dt)
  }
  costOf(i: number, n: number) {
    return bulkCost(PROD_COST[i], this.count[i], n)
  }
  maxBuy(i: number) {
    return maxAffordable(PROD_COST[i], this.count[i], this.money)
  }
  buy(i: number, n: number) {
    if (n < 1) return false
    const c = this.costOf(i, n)
    if (this.money < c) return false
    this.money -= c
    this.count[i] += n
    return true
  }
  available(): Upg[] {
    return this.upgrades.filter((u) => !this.owned.has(u.id) && u.req(this)).sort((a, b) => a.cost - b.cost)
  }
  buyUpgrade(u: Upg) {
    if (this.owned.has(u.id) || this.money < u.cost) return false
    this.money -= u.cost
    this.owned.add(u.id)
    return true
  }
  /** Returns newly completed goals. */
  checkGoals(): Goal[] {
    const out: Goal[] = []
    for (const g of this.goals) if (!this.goalsDone.has(g.id) && g.done(this)) { this.goalsDone.add(g.id); out.push(g) }
    return out
  }
  prestigeGain() {
    return Math.floor(Math.sqrt(this.runEarned / 1e5))
  }
  prestige() {
    const g = this.prestigeGain()
    if (g < 1) return 0
    this.pp += g
    this.prestiges++
    this.money = 0
    this.runEarned = 0
    this.count.fill(0)
    this.owned.clear()
    return g
  }
}
