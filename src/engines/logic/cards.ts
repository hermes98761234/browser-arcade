// Card game rules: deck, Klondike, Golf solitaire, Pyramid, blackjack, video poker, war. Pure and deterministic given an rng.
import type { Rng } from '../kit'

export interface Card { id: number; suit: 0 | 1 | 2 | 3; rank: number; up: boolean }
export const SUITS = ['♠', '♥', '♦', '♣']
export const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
export const isRed = (c: Card) => c.suit === 1 || c.suit === 2

export function newDeck(decks = 1): Card[] {
  const out: Card[] = []
  for (let d = 0; d < decks; d++) for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) out.push({ id: d * 52 + s * 13 + r - 1, suit: s as 0 | 1 | 2 | 3, rank: r, up: false })
  return out
}
export function shuffled(rng: Rng, decks = 1): Card[] {
  return rng.shuffle(newDeck(decks))
}
const cc = (c: Card): Card => ({ ...c })

// ---------------------------------------------------------------- Klondike
export interface KState {
  stock: Card[]
  waste: Card[]
  found: Card[][]
  tab: Card[][]
  score: number
  moves: number
  draw: 1 | 3
  redeals: number
}
export type Loc = { kind: 'tab' | 'found' | 'waste'; i: number; k: number }

export function klondikeDeal(rng: Rng, draw: 1 | 3, redeals = 99): KState {
  const deck = shuffled(rng)
  const tab: Card[][] = []
  let n = 0
  for (let i = 0; i < 7; i++) {
    const pile: Card[] = []
    for (let j = 0; j <= i; j++) {
      const c = deck[n++]
      c.up = j === i
      pile.push(c)
    }
    tab.push(pile)
  }
  return { stock: deck.slice(n), waste: [], found: [[], [], [], []], tab, score: 0, moves: 0, draw, redeals }
}
export function cloneK(s: KState): KState {
  return { ...s, stock: s.stock.map(cc), waste: s.waste.map(cc), found: s.found.map((p) => p.map(cc)), tab: s.tab.map((p) => p.map(cc)) }
}
export const canPlaceTab = (c: Card, pile: Card[]): boolean => {
  if (!pile.length) return c.rank === 13
  const t = pile[pile.length - 1]
  return t.up && isRed(t) !== isRed(c) && t.rank === c.rank + 1
}
export const canPlaceFound = (c: Card, pile: Card[]): boolean => (!pile.length ? c.rank === 1 : pile[pile.length - 1].suit === c.suit && pile[pile.length - 1].rank + 1 === c.rank)

export function cardsAt(s: KState, l: Loc): Card[] {
  if (l.kind === 'tab') return s.tab[l.i].slice(l.k)
  if (l.kind === 'waste') return s.waste.length ? [s.waste[s.waste.length - 1]] : []
  return s.found[l.i].length ? [s.found[l.i][s.found[l.i].length - 1]] : []
}
/** Can the cards at `from` be moved onto `to`? */
export function canMove(s: KState, from: Loc, to: Loc): boolean {
  const cs = cardsAt(s, from)
  if (!cs.length || !cs[0].up) return false
  if (to.kind === 'waste') return false
  if (to.kind === 'found') return cs.length === 1 && !(from.kind === 'found' && from.i === to.i) && canPlaceFound(cs[0], s.found[to.i])
  if (from.kind === 'tab' && from.i === to.i) return false
  return canPlaceTab(cs[0], s.tab[to.i])
}
export function moveCards(s: KState, from: Loc, to: Loc): KState | null {
  if (!canMove(s, from, to)) return null
  const n = cloneK(s)
  let cards: Card[]
  if (from.kind === 'tab') cards = n.tab[from.i].splice(from.k)
  else if (from.kind === 'waste') cards = [n.waste.pop()!]
  else cards = [n.found[from.i].pop()!]
  if (to.kind === 'found') n.found[to.i].push(...cards)
  else n.tab[to.i].push(...cards)
  // scoring
  if (to.kind === 'found') n.score += 10
  else if (from.kind === 'waste') n.score += 5
  else if (from.kind === 'found') n.score -= 15
  if (from.kind === 'tab') {
    const p = n.tab[from.i]
    if (p.length && !p[p.length - 1].up) {
      p[p.length - 1].up = true
      n.score += 5
    }
  }
  n.moves++
  return n
}
export function drawStock(s: KState): KState | null {
  const n = cloneK(s)
  if (n.stock.length) {
    for (let i = 0; i < n.draw && n.stock.length; i++) {
      const c = n.stock.shift()!
      c.up = true
      n.waste.push(c)
    }
  } else if (n.waste.length && n.redeals > 0) {
    n.stock = n.waste.reverse().map((c) => ({ ...c, up: false }))
    n.waste = []
    n.redeals--
    if (n.draw === 1) n.score = Math.max(0, n.score - 20)
  } else return null
  n.moves++
  return n
}
/** Best automatic destination for a card: foundation first, then a tableau pile. */
export function autoTarget(s: KState, from: Loc): Loc | null {
  const cs = cardsAt(s, from)
  if (!cs.length || !cs[0].up) return null
  if (cs.length === 1) for (let i = 0; i < 4; i++) if (canMove(s, from, { kind: 'found', i, k: 0 })) return { kind: 'found', i, k: 0 }
  for (let i = 0; i < 7; i++) {
    if (!canMove(s, from, { kind: 'tab', i, k: 0 })) continue
    // do not shuffle a king between empty piles
    if (!s.tab[i].length && from.kind === 'tab' && from.k === 0) continue
    return { kind: 'tab', i, k: 0 }
  }
  return null
}
export const klondikeWon = (s: KState) => s.found.every((p) => p.length === 13)
export function canAutoComplete(s: KState): boolean {
  return !klondikeWon(s) && s.stock.length === 0 && s.tab.every((p) => p.every((c) => c.up))
}
/** One step of auto-complete: move any card that fits to a foundation. */
export function autoStep(s: KState): KState | null {
  const locs: Loc[] = [{ kind: 'waste', i: 0, k: 0 }]
  s.tab.forEach((p, i) => {
    if (p.length) locs.push({ kind: 'tab', i, k: p.length - 1 })
  })
  for (const l of locs) {
    for (let f = 0; f < 4; f++) {
      const r = moveCards(s, l, { kind: 'found', i: f, k: 0 })
      if (r) return r
    }
  }
  return null
}
/** Is there at least one useful move left (used for "no moves" hint)? */
export function hasMoves(s: KState): boolean {
  if (s.stock.length || (s.waste.length && s.redeals > 0)) return true
  const locs: Loc[] = []
  if (s.waste.length) locs.push({ kind: 'waste', i: 0, k: 0 })
  s.tab.forEach((p, i) => p.forEach((c, k) => c.up && locs.push({ kind: 'tab', i, k })))
  s.found.forEach((p, i) => p.length && locs.push({ kind: 'found', i, k: 0 }))
  for (const l of locs) if (autoTarget(s, l)) return true
  return false
}

// ---------------------------------------------------------------- Golf solitaire
export interface GState { cols: Card[][]; stock: Card[]; waste: Card[]; moves: number; streak: number; best: number; wrap: boolean }
export function golfDeal(rng: Rng, wrap: boolean): GState {
  const deck = shuffled(rng)
  deck.forEach((c) => (c.up = true))
  const cols: Card[][] = []
  for (let i = 0; i < 7; i++) cols.push(deck.slice(i * 5, i * 5 + 5))
  const rest = deck.slice(35)
  const first = rest.shift()!
  return { cols, stock: rest, waste: [first], moves: 0, streak: 0, best: 0, wrap }
}
export const golfFits = (c: Card, top: Card, wrap: boolean) => {
  const d = Math.abs(c.rank - top.rank)
  return d === 1 || (wrap && d === 12)
}
export function golfPlay(s: GState, col: number): GState | null {
  const p = s.cols[col]
  if (!p.length || !s.waste.length) return null
  const c = p[p.length - 1]
  if (!golfFits(c, s.waste[s.waste.length - 1], s.wrap)) return null
  const streak = s.streak + 1
  return { ...s, cols: s.cols.map((q, i) => (i === col ? q.slice(0, -1) : q)), waste: [...s.waste, c], moves: s.moves + 1, streak, best: Math.max(s.best, streak) }
}
export function golfDraw(s: GState): GState | null {
  if (!s.stock.length) return null
  const [c, ...rest] = s.stock
  return { ...s, stock: rest, waste: [...s.waste, c], moves: s.moves + 1, streak: 0 }
}
export const golfWon = (s: GState) => s.cols.every((p) => !p.length)
export const golfStuck = (s: GState) => !s.stock.length && !s.cols.some((_, i) => golfPlay(s, i))

// ---------------------------------------------------------------- Pyramid (pairs summing to 13)
export interface PState { rows: (Card | null)[][]; stock: Card[]; waste: Card[]; moves: number; redeals: number }
export function pyramidDeal(rng: Rng): PState {
  const deck = shuffled(rng)
  deck.forEach((c) => (c.up = true))
  const rows: (Card | null)[][] = []
  let n = 0
  for (let r = 0; r < 7; r++) {
    const row: Card[] = []
    for (let j = 0; j <= r; j++) row.push(deck[n++])
    rows.push(row)
  }
  return { rows, stock: deck.slice(n), waste: [], moves: 0, redeals: 2 }
}
export function pyramidFree(s: PState, r: number, j: number): boolean {
  if (!s.rows[r][j]) return false
  if (r === 6) return true
  return !s.rows[r + 1][j] && !s.rows[r + 1][j + 1]
}
export const pyramidWon = (s: PState) => s.rows.every((r) => r.every((c) => !c))

// ---------------------------------------------------------------- Blackjack
export function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0
  let aces = 0
  for (const c of cards) {
    if (c.rank === 1) {
      aces++
      total += 11
    } else total += Math.min(10, c.rank)
  }
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  return { total, soft: aces > 0 }
}
export const isBlackjack = (cards: Card[]) => cards.length === 2 && handValue(cards).total === 21
export const dealerHits = (cards: Card[], hitSoft17: boolean) => {
  const v = handValue(cards)
  return v.total < 17 || (hitSoft17 && v.total === 17 && v.soft)
}
/** Net chip change for a settled hand (bet already includes any double). */
export function settleBlackjack(bet: number, player: Card[], dealer: Card[]): { delta: number; result: 'blackjack' | 'win' | 'lose' | 'push' | 'bust' } {
  const p = handValue(player).total
  const d = handValue(dealer).total
  const pbj = isBlackjack(player)
  const dbj = isBlackjack(dealer)
  if (p > 21) return { delta: -bet, result: 'bust' }
  if (pbj && !dbj) return { delta: Math.floor(bet * 1.5), result: 'blackjack' }
  if (dbj && !pbj) return { delta: -bet, result: 'lose' }
  if (d > 21 || p > d) return { delta: bet, result: 'win' }
  if (p === d) return { delta: 0, result: 'push' }
  return { delta: -bet, result: 'lose' }
}

// ---------------------------------------------------------------- Video poker (Jacks or Better)
export type PokerHand = 'Royal Flush' | 'Straight Flush' | 'Four of a Kind' | 'Full House' | 'Flush' | 'Straight' | 'Three of a Kind' | 'Two Pair' | 'Jacks or Better' | 'Nothing'
export const PAYTABLE: [PokerHand, number][] = [
  ['Royal Flush', 250], ['Straight Flush', 50], ['Four of a Kind', 25], ['Full House', 9], ['Flush', 6], ['Straight', 4], ['Three of a Kind', 3], ['Two Pair', 2], ['Jacks or Better', 1],
]
export function evalPoker(cards: Card[]): PokerHand {
  const ranks = cards.map((c) => c.rank).sort((a, b) => a - b)
  const flush = cards.every((c) => c.suit === cards[0].suit)
  const counts = new Map<number, number>()
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1)
  const cnt = [...counts.values()].sort((a, b) => b - a)
  const uniq = [...counts.keys()].sort((a, b) => a - b)
  let straight = uniq.length === 5 && uniq[4] - uniq[0] === 4
  const wheelHigh = uniq.length === 5 && uniq.join(',') === '1,10,11,12,13'
  if (wheelHigh) straight = true
  if (straight && flush) return wheelHigh ? 'Royal Flush' : 'Straight Flush'
  if (cnt[0] === 4) return 'Four of a Kind'
  if (cnt[0] === 3 && cnt[1] === 2) return 'Full House'
  if (flush) return 'Flush'
  if (straight) return 'Straight'
  if (cnt[0] === 3) return 'Three of a Kind'
  if (cnt[0] === 2 && cnt[1] === 2) return 'Two Pair'
  if (cnt[0] === 2) {
    for (const [r, n] of counts) if (n === 2 && (r >= 11 || r === 1)) return 'Jacks or Better'
  }
  return 'Nothing'
}
export const pokerPay = (h: PokerHand, bet: number) => {
  const base = PAYTABLE.find(([n]) => n === h)?.[1] ?? 0
  return h === 'Royal Flush' && bet === 5 ? 800 * 1 : base * bet
}
/** Monte-Carlo estimate of the best cards to hold. Returns a boolean mask. */
export function suggestHold(hand: Card[], deck: Card[], rng: Rng, samples = 220): boolean[] {
  let best = 0
  let bestEv = -1
  for (let mask = 0; mask < 32; mask++) {
    const keep = hand.filter((_, i) => mask & (1 << i))
    const need = 5 - keep.length
    let ev = 0
    if (need === 0) ev = pokerPay(evalPoker(keep), 1)
    else {
      for (let s = 0; s < samples; s++) {
        const pool = deck.slice()
        const draw: Card[] = []
        for (let i = 0; i < need; i++) draw.push(pool.splice(Math.floor(rng() * pool.length), 1)[0])
        ev += pokerPay(evalPoker([...keep, ...draw]), 1)
      }
      ev /= samples
    }
    if (ev > bestEv + 1e-9) {
      bestEv = ev
      best = mask
    }
  }
  return hand.map((_, i) => !!(best & (1 << i)))
}

// ---------------------------------------------------------------- War
export interface WarResult { a: Card[]; b: Card[]; winner: 0 | 1 | -1; played: [Card, Card]; war: number }
/** Play one round of War. Piles are queues (draw from index 0, captured cards go to the bottom). Cards are conserved. */
export function warRound(a: Card[], b: Card[], rng: Rng): WarResult {
  const A = a.slice()
  const B = b.slice()
  const pot: Card[] = []
  let war = 0
  let top: [Card, Card] | null = null
  for (;;) {
    if (!A.length || !B.length) break
    const x = A.shift()!
    const y = B.shift()!
    pot.push(x, y)
    top = [x, y]
    if (x.rank !== y.rank) break
    // war: three face-down cards each (or as many as available), then compare again
    war++
    for (let i = 0; i < 3 && A.length > 1; i++) pot.push(A.shift()!)
    for (let i = 0; i < 3 && B.length > 1; i++) pot.push(B.shift()!)
  }
  const played = top ?? [pot[0], pot[1]]
  const lastA = played[0].rank
  const lastB = played[1].rank
  rng.shuffle(pot)
  if (lastA > lastB || (lastA === lastB && !B.length)) return { a: [...A, ...pot], b: B, winner: 0, played, war }
  if (lastB > lastA || (lastA === lastB && !A.length)) return { a: A, b: [...B, ...pot], winner: 1, played, war }
  return { a: [...A, ...pot.slice(0, pot.length >> 1)], b: [...B, ...pot.slice(pot.length >> 1)], winner: -1, played, war }
}
