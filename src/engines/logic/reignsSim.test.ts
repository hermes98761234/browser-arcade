import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { LEADER_DECK, LIFE_DECK, type Card } from './reignsDeck'

function run(deck: Card[], seed: number, smart: boolean, goal = 60) {
  const rng = makeRng(seed)
  const m = [50, 54, 46, 54]
  const recent: string[] = []
  const pend: { id: string; in: number }[] = []
  for (let y = 1; y <= goal; y++) {
    let c: Card | undefined
    for (const p of pend) p.in--
    const di = pend.findIndex((p) => p.in <= 0)
    if (di >= 0) { const pid = pend.splice(di, 1)[0].id; c = deck.find((x) => x.id === pid) }
    if (!c) {
      const pool = deck.filter((x) => !x.chain && !recent.includes(x.id))
      const ext = m.map((v) => (v < 25 ? 1 : v > 75 ? -1 : 0))
      const w = (x: Card) => { let s = 1; for (const o of [x.L, x.R]) { let h = 0; o.fx.forEach((d, i) => { if (ext[i] && Math.sign(d) === ext[i]) h += Math.abs(d) }); if (h >= 6) s += 1.6 } return s }
      const tot = pool.reduce((a, x) => a + w(x), 0)
      let r = rng() * tot
      c = pool[0]
      for (const x of pool) { r -= w(x); if (r <= 0) { c = x; break } }
    }
    const cost = (fx: number[]) => fx.reduce((a, d, i) => a + (m[i] + d - 50) ** 2, 0)
    const o = smart ? (cost(c!.L.fx) <= cost(c!.R.fx) ? c!.L : c!.R) : rng() < 0.5 ? c!.L : c!.R
    o.fx.forEach((d, i) => (m[i] += d))
    if (o.next) pend.push({ id: o.next[0], in: o.next[1] })
    recent.push(c!.id)
    if (recent.length > 14) recent.shift()
    if (m.some((v) => v <= 0 || v >= 100)) return y
  }
  return goal
}
describe('reigns balance', () => {
  it('prints survival', () => {
    for (const [nm, deck] of [['leader', LEADER_DECK], ['life', LIFE_DECK]] as const) {
      const sm = Array.from({ length: 200 }, (_, s) => run(deck, s + 1, true))
      const rd = Array.from({ length: 200 }, (_, s) => run(deck, s + 1, false))
      const avg = (a: number[]) => Math.round(a.reduce((x, y) => x + y, 0) / a.length)
      console.log(nm, 'smart avg', avg(sm), 'win%', sm.filter((x) => x >= 60).length / 2, 'random avg', avg(rd))
      expect(avg(sm)).toBeGreaterThan(50)
      expect(avg(rd)).toBeLessThan(55)
    }
  })
})
