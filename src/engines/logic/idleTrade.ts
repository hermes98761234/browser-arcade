// Pure market model for the trade sub-mode: fluctuating prices over days with events.
import type { Rng } from '../kit'

export interface Good { name: string; emoji: string; base: number }
export interface MarketEvent { good: number; mult: number; days: number; text: string }

export class Market {
  day = 0
  price: number[]
  hist: number[][]
  amp: number[]
  period: number[]
  phase: number[]
  events: MarketEvent[] = []
  goods: Good[]
  private rng: Rng
  upText: string
  downText: string
  constructor(goods: Good[], rng: Rng, upText = 'shortage! Prices soar.', downText = 'glut! Prices crash.') {
    this.upText = upText
    this.downText = downText
    this.goods = goods
    this.rng = rng
    this.amp = goods.map(() => rng.range(0.28, 0.45))
    this.period = goods.map(() => rng.range(9, 16))
    this.phase = goods.map(() => rng.range(0, Math.PI * 2))
    this.price = goods.map((g, i) => Math.max(1, Math.round(this.target(i) * g.base)))
    this.hist = this.price.map((p) => [p])
  }
  private target(i: number) {
    let m = 1 + this.amp[i] * Math.sin((this.day / this.period[i]) * Math.PI * 2 + this.phase[i])
    for (const e of this.events) if (e.good === i) m *= e.mult
    return m
  }
  /** Advance one day. Returns a news line when an event starts. */
  nextDay(): string {
    this.day++
    let news = ''
    this.events = this.events.filter((e) => --e.days > 0)
    if (this.rng.chance(0.18)) {
      const i = this.rng.int(0, this.goods.length - 1)
      const up = this.rng.chance(0.5)
      const g = this.goods[i]
      this.events.push({ good: i, mult: up ? 1.55 : 0.55, days: 4, text: up ? `${g.emoji} ${g.name} ${this.upText}` : `${g.emoji} ${g.name} ${this.downText}` })
      news = this.events[this.events.length - 1].text
    }
    this.goods.forEach((g, i) => {
      const tgt = this.target(i) * g.base
      const noise = 1 + this.rng.range(-0.05, 0.05)
      this.price[i] = Math.max(1, Math.round((this.price[i] * 0.4 + tgt * 0.6) * noise))
      this.hist[i].push(this.price[i])
      if (this.hist[i].length > 14) this.hist[i].shift()
    })
    return news
  }
}
