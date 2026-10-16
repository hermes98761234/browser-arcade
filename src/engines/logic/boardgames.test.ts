import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import {
  c4Line, checkers, chkMoves, connect4, dots, dotsAI, goInit, goPlay, goScore, gomoku, gomokuAI, hex, hexChain, mancala, nim, nimAI, reversi, searchMove,
  sow, ttt, ultimate, GN, type Game,
} from './boardgames'

function playOut<S, M>(g: Game<S, M>, pick: (s: S) => M, cap = 600) {
  let s = g.init()
  let n = 0
  while (g.over(s) === null && n++ < cap) s = g.apply(s, pick(s))
  return { s, n, over: g.over(s) }
}

describe('generic games finish with random play', () => {
  const rnd = makeRng(3)
  const rand = <S, M>(g: Game<S, M>) => (s: S) => rnd.pick(g.moves(s))
  it('reversi', () => expect(playOut(reversi, rand(reversi)).over).not.toBeNull())
  it('checkers', () => {
    const r = playOut(checkers, rand(checkers), 400)
    expect(r.n).toBeGreaterThan(5)
  })
  it('connect four', () => expect(playOut(connect4, rand(connect4)).over).not.toBeNull())
  it('ultimate ttt', () => expect(playOut(ultimate, rand(ultimate)).over).not.toBeNull())
  it('mancala', () => expect(playOut(mancala, rand(mancala)).over).not.toBeNull())
  it('dots', () => {
    const g = dots(4)
    const r = playOut(g, rand(g))
    expect(r.s.sc[0] + r.s.sc[1]).toBe(16)
  })
  it('hex always has a winner', () => expect(playOut(hex, rand(hex)).over).not.toBeNull())
})

describe('rules', () => {
  it('reversi opening has 4 moves', () => expect(reversi.moves(reversi.init()).sort()).toEqual([19, 26, 37, 44]))
  it('checkers opening has 7 moves and captures are forced', () => {
    const s = checkers.init()
    expect(chkMoves(s).length).toBe(7)
    const b = new Int8Array(64)
    b[5 * 8 + 2] = 1
    b[4 * 8 + 3] = -1
    b[1 * 8 + 6] = -1
    const ms = chkMoves({ b, t: 0 })
    expect(ms.length).toBe(1)
    expect(ms[0].caps).toEqual([35])
  })
  it('checkers multi-jump', () => {
    const b = new Int8Array(64)
    b[7 * 8 + 0] = 1
    b[6 * 8 + 1] = -1
    b[4 * 8 + 3] = -1
    const ms = chkMoves({ b, t: 0 })
    expect(ms.length).toBe(1)
    expect(ms[0].path.length).toBe(3)
    expect(ms[0].caps.length).toBe(2)
  })
  it('connect four detects a vertical win', () => {
    let s = connect4.init()
    for (const c of [0, 1, 0, 1, 0, 1, 0]) s = connect4.apply(s, c)
    expect(connect4.over(s)).toBe(0)
    expect(c4Line(s.b)).not.toBeNull()
  })
  it('classic ttt AI never loses against random', () => {
    const rnd = makeRng(9)
    for (let i = 0; i < 20; i++) {
      let s = ttt.init()
      while (ttt.over(s) === null) s = ttt.apply(s, s.t === 0 ? searchMove(ttt, s, 9, rnd) : rnd.pick(ttt.moves(s)))
      expect(ttt.over(s)).not.toBe(1)
    }
  })
  it('ultimate ttt sends the opponent to the matching board', () => {
    const s = ultimate.apply(ultimate.init(), 3 * 9 + 5)
    expect(s.next).toBe(5)
    expect(ultimate.moves(s).every((m) => ((m / 9) | 0) === 5)).toBe(true)
  })
  it('mancala: extra turn, capture and total seeds are conserved', () => {
    const s = mancala.init()
    const r = sow(s, 2) // 4 seeds from pit 2 end in the store
    expect(r.extra).toBe(true)
    expect(r.s.p.reduce((a, b) => a + b, 0)).toBe(48)
    const p = new Int8Array(14)
    p[0] = 1
    p[1] = 0
    p[11] = 5
    p[3] = 2
    p[9] = 1
    const c = sow({ p, t: 0 }, 0)
    expect(c.capture).toBe(1)
    expect(c.s.p[6]).toBe(1 + 5)
  })
  it('gomoku detects five and AI blocks an open four', () => {
    let s = gomoku.init()
    const seq = [0, 1, 2, 3].map((k) => 7 * GN + 3 + k)
    for (const m of seq) {
      s = gomoku.apply(s, m)
      s = gomoku.apply(s, (m % GN) + 8)
    }
    s = { ...s, t: 1 }
    expect(s.w).toBe(-1)
    const block = gomokuAI(s, 2, makeRng(1))
    expect([7 * GN + 2, 7 * GN + 7]).toContain(block)
  })
  it('dots AI takes a free box', () => {
    const g = dots(3)
    let s = g.init()
    // box 0 edges: top 0, bottom 3, left h+0, right h+1 (h=12)
    for (const e of [0, 3, 12]) s = { ...s, e: Uint8Array.from(Object.assign([...s.e], { [e]: 1 })) }
    expect(dotsAI(g, s, 1, makeRng(1))).toBe(13)
  })
  it('nim AI wins from a winning position', () => {
    const g = nim([3, 4, 5], false)
    const rnd = makeRng(2)
    let s = g.init()
    s = g.apply(s, { h: 2, take: 1 }) // 3,4,4 -> xor 3 ... P1 to move and winning for P1
    while (g.over(s) === null) s = g.apply(s, s.t === 1 ? nimAI(g, s, 2, rnd) : g.moves(s)[Math.floor(rnd() * g.moves(s).length)])
    expect(g.over(s)).toBe(1)
  })
  it('go captures and forbids suicide', () => {
    let s = goInit()
    // black surrounds a white stone at (1,1)
    const idx = (r: number, c: number) => r * 9 + c
    const plays: [number, number][] = [[0, 1], [1, 1], [1, 0], [8, 8], [1, 2], [7, 7], [2, 1]]
    for (const [r, c] of plays) s = goPlay(s, idx(r, c))!
    expect(s.b[idx(1, 1)]).toBe(0)
    expect(s.caps[0]).toBe(1)
    const sc = goScore(s.b)
    expect(sc.black).toBeGreaterThan(3)
    // corner suicide: white plays into a black-surrounded point
    const b = new Int8Array(81)
    b[1] = 1
    b[9] = 1
    expect(goPlay({ ...goInit(), b, t: 1 }, 0)).toBeNull()
  })
  it('hex chain detection', () => {
    const b = new Int8Array(81)
    for (let r = 0; r < 9; r++) b[r * 9 + 4] = 1
    expect(hexChain(b, 1)).not.toBeNull()
    expect(hexChain(b, -1)).toBeNull()
  })
})
