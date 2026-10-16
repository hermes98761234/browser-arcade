import { describe, expect, it } from 'vitest'
import { bestMove, chessEnd, fromFen, inCheck, legalMoves, makeMove, perft, sqFromName, startState, toSAN } from './boardchess'

const KIWI = 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1'
const mv = (s: ReturnType<typeof startState>, a: string, b: string, promo = 0) => {
  const m = legalMoves(s).find((x) => x.from === sqFromName(a) && x.to === sqFromName(b) && x.promo === promo)
  if (!m) throw new Error(`illegal ${a}${b}`)
  return m
}

describe('chess rules', () => {
  it('perft from the start position', () => {
    const s = startState()
    expect(perft(s, 1)).toBe(20)
    expect(perft(s, 2)).toBe(400)
    expect(perft(s, 3)).toBe(8902)
  })
  it('perft kiwipete (castling, ep, promotions, pins)', () => {
    const s = fromFen(KIWI)
    expect(perft(s, 1)).toBe(48)
    expect(perft(s, 2)).toBe(2039)
    expect(perft(s, 3)).toBe(97862)
  })
  it('perft endgame position 3 (en passant pins)', () => {
    const s = fromFen('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1')
    expect(perft(s, 3)).toBe(2812)
    expect(perft(s, 4)).toBe(43238)
  })
  it('detects fool\'s mate and produces SAN', () => {
    let s = startState()
    const line: [string, string][] = [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4'], ['d8', 'h4']]
    const san: string[] = []
    for (const [a, b] of line) {
      const m = mv(s, a, b)
      san.push(toSAN(s, m))
      s = makeMove(s, m)
    }
    expect(san).toEqual(['f3', 'e5', 'g4', 'Qh4#'])
    expect(inCheck(s)).toBe(true)
    expect(chessEnd(s, new Map())).toBe('checkmate')
  })
  it('finds mate in one', () => {
    const s = fromFen('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1')
    const m = bestMove(s, { depth: 3, ms: 2000 })!
    expect(toSAN(s, m)).toBe('Ra8#')
  })
  it('stalemate is detected', () => {
    const s = fromFen('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')
    expect(chessEnd(s, new Map())).toBe('stalemate')
  })
})
