import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { Market } from './idleTrade'

const goods = [['a', 10], ['b', 28], ['c', 65], ['d', 120], ['e', 230], ['f', 420]].map(([name, base]) => ({ name: name as string, emoji: 'x', base: base as number }))

/** Simple bot: buy the cheapest-vs-base good with all cash, sell when price is 15% over what it paid. */
function run(seed: number, days: number, cap0: number) {
  const m = new Market(goods, makeRng(seed))
  let cash = 300
  let cap = cap0
  const held = goods.map(() => ({ n: 0, cost: 0 }))
  for (let d = 0; d < days; d++) {
    m.nextDay()
    goods.forEach((_g, i) => {
      const h = held[i]
      if (h.n && m.price[i] > (h.cost / h.n) * 1.18) { cash += h.n * m.price[i]; h.n = 0; h.cost = 0 }
    })
    const used = held.reduce((a, h) => a + h.n, 0)
    let best = -1
    let br = 1
    goods.forEach((g, i) => { const r = m.price[i] / g.base; if (r < 0.82 && r < br) { br = r; best = i } })
    if (best >= 0) {
      const n = Math.min(cap - used, Math.floor(cash / m.price[best]))
      if (n > 0) { cash -= n * m.price[best]; held[best].n += n; held[best].cost += n * m.price[best] }
    }
    if (cash > 1500 && cap < 60) { cap += 10; cash -= 400 }
  }
  return cash + held.reduce((a, h, i) => a + h.n * m.price[i], 0)
}

describe('market', () => {
  it('prices stay positive and a simple bot grows wealth', () => {
    const res = [1, 2, 3, 4, 5, 6, 7, 8].map((s) => Math.round(run(s, 60, 20)))
    console.log('trade bot net worth after 60 days', res.join(' '))
    expect(Math.min(...res)).toBeGreaterThan(0)
    const m = new Market(goods, makeRng(9))
    for (let i = 0; i < 200; i++) { m.nextDay(); expect(Math.min(...m.price)).toBeGreaterThanOrEqual(1) }
  })
})
