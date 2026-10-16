import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import {
  autoStep, autoTarget, canAutoComplete, canMove, canPlaceFound, canPlaceTab, drawStock, evalPoker, golfDeal, golfDraw, golfFits, golfPlay, handValue, hasMoves,
  isBlackjack, klondikeDeal, klondikeWon, moveCards, newDeck, pokerPay, pyramidDeal, pyramidFree, settleBlackjack, shuffled, suggestHold, warRound, type Card, type KState,
} from './cards'

const C = (rank: number, suit: 0 | 1 | 2 | 3, up = true): Card => ({ id: rank + suit * 13, rank, suit, up })

describe('deck', () => {
  it('has 52 unique cards and shuffles deterministically', () => {
    const d = newDeck()
    expect(new Set(d.map((c) => `${c.suit}${c.rank}`)).size).toBe(52)
    expect(shuffled(makeRng(1)).map((c) => c.id)).toEqual(shuffled(makeRng(1)).map((c) => c.id))
    expect(shuffled(makeRng(1)).map((c) => c.id)).not.toEqual(shuffled(makeRng(2)).map((c) => c.id))
  })
})

describe('klondike', () => {
  it('deals 28 tableau cards (top ones face up) and 24 stock cards', () => {
    const s = klondikeDeal(makeRng(5), 3)
    expect(s.tab.map((p) => p.length)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(s.tab.every((p) => p.filter((c) => c.up).length === 1 && p[p.length - 1].up)).toBe(true)
    expect(s.stock.length).toBe(24)
  })
  it('placement rules', () => {
    expect(canPlaceTab(C(5, 1), [C(6, 0)])).toBe(true)
    expect(canPlaceTab(C(5, 1), [C(6, 2)])).toBe(false)
    expect(canPlaceTab(C(5, 1), [C(7, 0)])).toBe(false)
    expect(canPlaceTab(C(13, 1), [])).toBe(true)
    expect(canPlaceTab(C(12, 1), [])).toBe(false)
    expect(canPlaceFound(C(1, 2), [])).toBe(true)
    expect(canPlaceFound(C(2, 2), [C(1, 2)])).toBe(true)
    expect(canPlaceFound(C(2, 1), [C(1, 2)])).toBe(false)
  })
  it('moves a run of cards, flips the exposed card and scores', () => {
    const s = klondikeDeal(makeRng(1), 1)
    s.tab = [[C(9, 3, false), C(6, 0), C(5, 1)], [C(7, 1)], [], [], [], [], []]
    const n = moveCards(s, { kind: 'tab', i: 0, k: 1 }, { kind: 'tab', i: 1, k: 0 })!
    expect(n.tab[1].map((c) => c.rank)).toEqual([7, 6, 5])
    expect(n.tab[0][0].up).toBe(true)
    expect(n.score).toBe(5)
    expect(moveCards(s, { kind: 'tab', i: 0, k: 2 }, { kind: 'tab', i: 1, k: 0 })).toBeNull()
    // original is untouched
    expect(s.tab[0].length).toBe(3)
  })
  it('draw 3 and recycling the waste', () => {
    let s = klondikeDeal(makeRng(2), 3, 1)
    s = drawStock(s)!
    expect(s.waste.length).toBe(3)
    expect(s.stock.length).toBe(21)
    for (let i = 0; i < 7; i++) s = drawStock(s)!
    expect(s.stock.length).toBe(0)
    s = drawStock(s)!
    expect(s.stock.length).toBe(24)
    expect(s.stock.every((c) => !c.up)).toBe(true)
    for (let i = 0; i < 8; i++) s = drawStock(s)!
    expect(drawStock(s)).toBeNull()
  })
  it('auto target prefers foundation; auto-complete finishes a solved layout', () => {
    const s = klondikeDeal(makeRng(1), 1)
    s.stock = []
    s.waste = []
    s.found = [[], [], [], []]
    s.tab = [[], [], [], [], [], [], []]
    // build four suits stacked in the tableau, all face up
    for (let suit = 0; suit < 4; suit++) for (let r = 13; r >= 1; r--) s.tab[suit].push(C(r, suit as 0 | 1 | 2 | 3))
    expect(canAutoComplete(s)).toBe(true)
    expect(autoTarget(s, { kind: 'tab', i: 0, k: 12 })).toEqual({ kind: 'found', i: 0, k: 0 })
    let cur: KState | null = s
    let steps = 0
    while (cur && !klondikeWon(cur) && steps++ < 100) cur = autoStep(cur)
    expect(cur && klondikeWon(cur)).toBe(true)
    expect(steps).toBe(52)
    expect(hasMoves(s)).toBe(true)
  })
  it('canMove refuses face-down and same-pile moves', () => {
    const s = klondikeDeal(makeRng(1), 1)
    expect(canMove(s, { kind: 'tab', i: 6, k: 0 }, { kind: 'tab', i: 5, k: 0 })).toBe(false)
    expect(canMove(s, { kind: 'tab', i: 6, k: 6 }, { kind: 'tab', i: 6, k: 0 })).toBe(false)
  })
})

describe('golf & pyramid', () => {
  it('golf deals 35 + 16 + 1 and plays +/-1 ranks', () => {
    const s = golfDeal(makeRng(3), false)
    expect(s.cols.every((c) => c.length === 5)).toBe(true)
    expect(s.stock.length).toBe(16)
    expect(s.waste.length).toBe(1)
    expect(golfFits(C(5, 0), C(6, 1), false)).toBe(true)
    expect(golfFits(C(1, 0), C(13, 1), false)).toBe(false)
    expect(golfFits(C(1, 0), C(13, 1), true)).toBe(true)
    const t = { ...s, waste: [C(s.cols[0][4].rank === 13 ? 12 : s.cols[0][4].rank + 1, 0)] }
    expect(golfPlay(t, 0)).not.toBeNull()
    expect(golfDraw(s)!.waste.length).toBe(2)
  })
  it('pyramid exposes only the bottom row first', () => {
    const s = pyramidDeal(makeRng(1))
    expect(s.rows.length).toBe(7)
    expect(s.stock.length).toBe(24)
    expect(pyramidFree(s, 6, 0)).toBe(true)
    expect(pyramidFree(s, 0, 0)).toBe(false)
  })
})

describe('blackjack', () => {
  it('hand values handle soft aces', () => {
    expect(handValue([C(1, 0), C(13, 0)])).toEqual({ total: 21, soft: true })
    expect(handValue([C(1, 0), C(1, 1), C(9, 0)])).toEqual({ total: 21, soft: true })
    expect(handValue([C(1, 0), C(9, 1), C(5, 0)]).total).toBe(15)
    expect(handValue([C(10, 0), C(5, 1), C(9, 0)]).total).toBe(24)
    expect(isBlackjack([C(1, 0), C(12, 2)])).toBe(true)
    expect(isBlackjack([C(5, 0), C(6, 2), C(10, 0)])).toBe(false)
  })
  it('settles payouts', () => {
    expect(settleBlackjack(100, [C(1, 0), C(13, 0)], [C(10, 0), C(8, 0)]).delta).toBe(150)
    expect(settleBlackjack(100, [C(10, 0), C(9, 0)], [C(10, 1), C(10, 2), C(5, 0)]).result).toBe('win')
    expect(settleBlackjack(100, [C(10, 0), C(9, 0)], [C(10, 1), C(9, 2)]).result).toBe('push')
    expect(settleBlackjack(100, [C(10, 0), C(6, 0), C(9, 3)], [C(10, 1), C(9, 2)]).result).toBe('bust')
    expect(settleBlackjack(100, [C(1, 0), C(13, 0)], [C(1, 1), C(13, 1)]).result).toBe('push')
  })
})

describe('video poker', () => {
  const hand = (...s: [number, 0 | 1 | 2 | 3][]) => s.map(([r, su]) => C(r, su))
  it('ranks hands correctly', () => {
    expect(evalPoker(hand([1, 0], [13, 0], [12, 0], [11, 0], [10, 0]))).toBe('Royal Flush')
    expect(evalPoker(hand([5, 2], [6, 2], [7, 2], [8, 2], [9, 2]))).toBe('Straight Flush')
    expect(evalPoker(hand([9, 0], [9, 1], [9, 2], [9, 3], [2, 0]))).toBe('Four of a Kind')
    expect(evalPoker(hand([9, 0], [9, 1], [9, 2], [4, 3], [4, 0]))).toBe('Full House')
    expect(evalPoker(hand([2, 0], [5, 0], [7, 0], [9, 0], [13, 0]))).toBe('Flush')
    expect(evalPoker(hand([1, 0], [2, 1], [3, 2], [4, 3], [5, 0]))).toBe('Straight')
    expect(evalPoker(hand([10, 0], [11, 1], [12, 2], [13, 3], [1, 0]))).toBe('Straight')
    expect(evalPoker(hand([9, 0], [9, 1], [9, 2], [4, 3], [2, 0]))).toBe('Three of a Kind')
    expect(evalPoker(hand([9, 0], [9, 1], [4, 2], [4, 3], [2, 0]))).toBe('Two Pair')
    expect(evalPoker(hand([11, 0], [11, 1], [4, 2], [5, 3], [2, 0]))).toBe('Jacks or Better')
    expect(evalPoker(hand([1, 0], [1, 1], [4, 2], [5, 3], [2, 0]))).toBe('Jacks or Better')
    expect(evalPoker(hand([10, 0], [10, 1], [4, 2], [5, 3], [2, 0]))).toBe('Nothing')
    expect(evalPoker(hand([13, 0], [1, 1], [2, 2], [3, 3], [4, 0]))).toBe('Nothing')
  })
  it('pays per coin and max-bet royal', () => {
    expect(pokerPay('Two Pair', 3)).toBe(6)
    expect(pokerPay('Royal Flush', 5)).toBe(800)
    expect(pokerPay('Nothing', 5)).toBe(0)
  })
  it('hold advice keeps a made hand and pairs', () => {
    const rng = makeRng(1)
    const made = [C(9, 0), C(9, 1), C(9, 2), C(4, 3), C(4, 0)]
    const deck = newDeck().filter((c) => !made.some((m) => m.rank === c.rank && m.suit === c.suit))
    expect(suggestHold(made, deck, rng).every(Boolean)).toBe(true)
    const pair = [C(12, 0), C(12, 1), C(2, 2), C(5, 3), C(8, 0)]
    const deck2 = newDeck().filter((c) => !pair.some((m) => m.rank === c.rank && m.suit === c.suit))
    expect(suggestHold(pair, deck2, makeRng(2))).toEqual([true, true, false, false, false])
  })
})

describe('war', () => {
  it('conserves cards through many rounds and eventually ends or caps', () => {
    const rng = makeRng(4)
    const d = shuffled(rng)
    let a = d.slice(0, 26)
    let b = d.slice(26)
    for (let i = 0; i < 800 && a.length && b.length; i++) {
      const r = warRound(a, b, rng)
      a = r.a
      b = r.b
      expect(a.length + b.length).toBe(52)
    }
    expect(a.length + b.length).toBe(52)
  })
  it('higher card wins both cards', () => {
    const r = warRound([C(13, 0), C(2, 0)], [C(3, 1), C(4, 1)], makeRng(1))
    expect(r.winner).toBe(0)
    expect(r.a.length).toBe(3)
    expect(r.b.length).toBe(1)
  })
})
