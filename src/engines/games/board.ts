// Board: classic two-player board games against an AI (or two players on one device).
// Sub-mode is picked from mods / name / description: chess, checkers, reversi (default), connect, ttt, mancala, gomoku, dots, nim, go, hex.
import { background, Bag, byDiff, createStage, emoji, loop, Particles, pointer, roundRect, Shake, text, type Engine, type GameEnv, type Rng } from '../kit'
import type { Theme } from '../../lib/themes'
import { pickMode } from '../logic/boardmode'
import {
  bestMove, chessEnd, inCheck, insufficient, kingSquare, legalMoves, makeMove, posKey, startState, toSAN, type ChessMove, type ChessState,
} from '../logic/boardchess'
import {
  C4H, C4W, GN, GO, GO_KOMI, HEXN, c4Line, checkers, chkMoves, connect4, dotH, dots, dotsAI, goAI, goInit, goPlay, goScore, gomoku,
  gomokuAI, hex, hexChain, mancala, nim, nimAI, nimIsWinning, revCount, revFlips, reversi, searchMove, sow, ttt, ultimate, goGroup,
  type ChkMove, type ChkState, type DotState, type Game, type GoState, type GomState, type HexState, type ManState, type NimMove, type NimState, type RevState,
  type TttState, type UltState, type C4State,
} from '../logic/boardgames'

const W = 960
const H = 540
const PX = 640 // panel left edge

interface Host {
  env: GameEnv
  ctx: CanvasRenderingContext2D
  t: Theme
  ptr: { x: number; y: number; down: boolean; active: boolean }
  fx: Particles
  shake: Shake
  rng: Rng
  two: boolean
  diff: 0 | 1 | 2
  time: () => number
  /** player emoji (hero, foe) */
  ch: [string, string]
}

/** A mode adapter: everything the shared shell needs from one game. */
interface Mode {
  title: string
  rule: string
  turn(): 0 | 1
  result(): null | -1 | 0 | 1
  busy(): boolean
  down(x: number, y: number): void
  up(x: number, y: number): void
  update(dt: number): void
  draw(): void
  aiMove(): void
  log: string[]
  info(p: 0 | 1): string
  status(): string
  undo(): boolean
  reset(): void
  pass(): boolean
  canPass(): boolean
  score(): number
  /** short outcome line */
  outcome(): string
}

interface Spec<S, M> {
  title: string
  rule: string
  g: Pick<Game<S, M>, 'init' | 'turn' | 'apply'> & { over(s: S): null | -1 | 0 | 1 }
  ai(s: S): M
  san(s: S, m: M): string
  draw(s: S, busyAnim: boolean): void
  /** click / press. Return a move to play. */
  down(s: S, x: number, y: number): M | null
  up?(s: S, x: number, y: number): M | null
  onMove?(prev: S, m: M, next: S): void
  update?(dt: number): void
  busy?(): boolean
  reset?(): void
  info?(s: S, p: 0 | 1): string
  score?(s: S): number
  status?(s: S): string
  pass?(s: S): M | null
  outcome?(s: S, r: -1 | 0 | 1): string
}

function session<S, M>(h: Host, sp: Spec<S, M>): Mode {
  let s = sp.g.init()
  let hist: S[] = []
  let res: null | -1 | 0 | 1 = null
  const log: string[] = []
  const play = (m: M) => {
    const prev = s
    log.push(sp.san(prev, m))
    hist.push(prev)
    s = sp.g.apply(prev, m)
    sp.onMove?.(prev, m, s)
    res = sp.g.over(s)
  }
  const humanTurn = () => h.two || sp.g.turn(s) === 0
  return {
    title: sp.title,
    rule: sp.rule,
    turn: () => sp.g.turn(s),
    result: () => res,
    busy: () => sp.busy?.() ?? false,
    down(x, y) {
      if (res !== null || sp.busy?.() || !humanTurn()) return
      const m = sp.down(s, x, y)
      if (m !== null) play(m)
    },
    up(x, y) {
      if (res !== null || sp.busy?.() || !humanTurn()) return
      const m = sp.up?.(s, x, y) ?? null
      if (m !== null) play(m)
    },
    update: (dt) => sp.update?.(dt),
    draw: () => sp.draw(s, sp.busy?.() ?? false),
    aiMove() {
      if (res !== null) return
      play(sp.ai(s))
    },
    log,
    info: (p) => sp.info?.(s, p) ?? '',
    status: () => sp.status?.(s) ?? '',
    undo() {
      if (!hist.length || sp.busy?.() || res !== null) return false
      const back = h.two ? 1 : hist.length >= 2 || sp.g.turn(s) === 0 ? (sp.g.turn(s) === 0 ? 2 : 1) : 1
      for (let i = 0; i < back && hist.length; i++) {
        s = hist.pop()!
        log.pop()
      }
      // keep the human on move in single-player mode
      while (!h.two && sp.g.turn(s) !== 0 && hist.length) {
        s = hist.pop()!
        log.pop()
      }
      sp.reset?.()
      return true
    },
    reset() {
      s = sp.g.init()
      hist = []
      log.length = 0
      res = null
      sp.reset?.()
    },
    pass() {
      const m = sp.pass?.(s) ?? null
      if (m === null || res !== null || !humanTurn()) return false
      play(m)
      return true
    },
    canPass: () => !!sp.pass && res === null && humanTurn() && !sp.busy?.(),
    score: () => sp.score?.(s) ?? 0,
    outcome: () => (res === null ? '' : (sp.outcome?.(s, res) ?? '')),
  }
}

// ---------------------------------------------------------------- shared drawing
const dark = 'rgba(14,16,26,0.84)'
function disc(h: Host, x: number, y: number, r: number, who: 0 | 1, size = r * 1.25, alpha = 1, glow = false) {
  const { ctx, t } = h
  const col = who === 0 ? t.accent : t.accent2
  ctx.save()
  ctx.globalAlpha = alpha
  if (glow) {
    ctx.shadowColor = col
    ctx.shadowBlur = 16
  }
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = col
  ctx.fill()
  ctx.shadowBlur = 0
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r)
  g.addColorStop(0, 'rgba(255,255,255,0.5)')
  g.addColorStop(0.55, 'rgba(255,255,255,0)')
  g.addColorStop(1, 'rgba(0,0,0,0.38)')
  ctx.fillStyle = g
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.stroke()
  ctx.restore()
  if (size > 6) emoji(ctx, h.ch[who], x, y + 1, size)
}
const coord = (i: number, n = 8) => 'abcdefghijklmnopqrstuvwxyz'[i % n] + (n - ((i / n) | 0))
const ease = (x: number) => 1 - (1 - x) * (1 - x)
const lerpN = (a: number, b: number, t: number) => a + (b - a) * t
function plate(h: Host, x: number, y: number, w: number, hh: number, color: string) {
  const { ctx } = h
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 6
  roundRect(ctx, x, y, w, hh, 10, color)
  ctx.restore()
  roundRect(ctx, x, y, w, hh, 10, undefined, h.t.accent, 2)
}

// ---------------------------------------------------------------- Chess
const GLY = ' ♟♞♝♜♛♚'
interface CS { c: ChessState; seen: Map<string, number> }
function chessSpec(h: Host): Spec<CS, ChessMove> {
  const { ctx, t } = h
  const BX = 80
  const BY = 30
  const CS_ = 60
  const g = {
    init: (): CS => {
      const c = startState()
      return { c, seen: new Map([[posKey(c), 1]]) }
    },
    turn: (s: CS): 0 | 1 => (s.c.side === 1 ? 0 : 1),
    apply(s: CS, m: ChessMove): CS {
      const c = makeMove(s.c, m)
      const seen = new Map(s.seen)
      seen.set(posKey(c), (seen.get(posKey(c)) ?? 0) + 1)
      return { c, seen }
    },
    over(s: CS): null | -1 | 0 | 1 {
      const e = chessEnd(s.c, s.seen)
      if (!e) return null
      if (e === 'checkmate') return s.c.side === 1 ? 1 : 0
      return -1
    },
  }
  let sel = -1
  let hints: ChessMove[] = []
  let promo: { from: number; to: number } | null = null
  let drag = -1
  let anim: { v: number; from: number; to: number; t: number } | null = null
  let last: ChessMove | null = null
  const cellXY = (sq: number) => ({ x: BX + (sq & 7) * CS_, y: BY + (sq >> 3) * CS_ })
  const sqAt = (x: number, y: number) => {
    const c = Math.floor((x - BX) / CS_)
    const r = Math.floor((y - BY) / CS_)
    return c < 0 || c > 7 || r < 0 || r > 7 ? -1 : r * 8 + c
  }
  const glyph = (v: number, cx: number, cy: number, size = 50) => {
    const white = v > 0
    ctx.font = `${size}px "Segoe UI Symbol","Noto Sans Symbols 2","DejaVu Sans","Arial Unicode MS",serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const ch = GLY[Math.abs(v)] + '︎'
    ctx.lineJoin = 'round'
    ctx.lineWidth = white ? 3.2 : 2
    ctx.strokeStyle = white ? '#14141c' : '#f0e6c8'
    ctx.strokeText(ch, cx, cy + 2)
    ctx.fillStyle = white ? '#fbf6e8' : '#262633'
    ctx.fillText(ch, cx, cy + 2)
  }
  const select = (s: CS, sq: number) => {
    sel = sq
    hints = sq < 0 ? [] : legalMoves(s.c).filter((m) => m.from === sq)
  }
  const click = (s: CS, x: number, y: number): ChessMove | null => {
    if (promo) {
      const px = BX + 120
      const py = BY + 210
      const i = Math.floor((x - px) / 60)
      if (y >= py && y < py + 60 && i >= 0 && i < 4) {
        const p = [5, 4, 3, 2][i]
        const m = hints.find((q) => q.from === promo!.from && q.to === promo!.to && q.promo === p) ?? null
        promo = null
        select(s, -1)
        return m
      }
      promo = null
      return null
    }
    const sq = sqAt(x, y)
    if (sq < 0) {
      select(s, -1)
      return null
    }
    if (sel >= 0) {
      const ms = hints.filter((m) => m.to === sq)
      if (ms.length) {
        if (ms[0].promo) {
          promo = { from: sel, to: sq }
          return null
        }
        select(s, -1)
        return ms[0]
      }
    }
    const v = s.c.b[sq]
    if (v !== 0 && v * s.c.side > 0 && (h.two || v > 0)) {
      select(s, sq)
      drag = sq
    } else select(s, -1)
    return null
  }
  return {
    title: 'Chess',
    rule: 'Checkmate the enemy king',
    g,
    ai(s) {
      const d = byDiff(h.env, 2, 3, 4)
      return bestMove(s.c, { depth: d, ms: byDiff(h.env, 120, 500, 1100), noise: byDiff(h.env, 90, 12, 0), rnd: h.rng })!
    },
    san: (s, m) => toSAN(s.c, m),
    down: (s, x, y) => click(s, x, y),
    up(s, x, y) {
      const from = drag
      drag = -1
      if (from < 0 || sel < 0) return null
      const sq = sqAt(x, y)
      if (sq < 0 || sq === from) return null
      return click(s, x, y)
    },
    onMove(prev, m, next) {
      anim = { v: prev.c.b[m.from], from: m.from, to: m.to, t: 0 }
      last = m
      select(next, -1)
      promo = null
      const cap = prev.c.b[m.to] !== 0 || m.flag === 2
      const p = cellXY(m.to)
      if (cap) {
        h.fx.burst(p.x + 30, p.y + 30, t.accent2, 14, 150, 3)
        h.env.sfx('hit')
        h.shake.kick(3)
      } else h.env.sfx('move')
      if (inCheck(next.c)) h.env.sfx('power')
    },
    update(dt) {
      if (anim) {
        anim.t += dt / 0.2
        if (anim.t >= 1) anim = null
      }
    },
    busy: () => anim !== null,
    reset() {
      sel = -1
      hints = []
      promo = null
      anim = null
      last = null
      drag = -1
    },
    draw(s) {
      plate(h, BX - 14, BY - 14, 8 * CS_ + 28, 8 * CS_ + 28, '#2a2118')
      const checkSq = inCheck(s.c) ? kingSquare(s.c.b, s.c.side) : -1
      for (let sq = 0; sq < 64; sq++) {
        const { x, y } = cellXY(sq)
        const light = ((sq >> 3) + (sq & 7)) % 2 === 0
        ctx.fillStyle = light ? '#e9d8b4' : '#9a6b45'
        ctx.fillRect(x, y, CS_, CS_)
        if (last && (sq === last.from || sq === last.to)) {
          ctx.fillStyle = 'rgba(250,204,21,0.45)'
          ctx.fillRect(x, y, CS_, CS_)
        }
        if (sq === sel) {
          ctx.fillStyle = 'rgba(80,200,120,0.5)'
          ctx.fillRect(x, y, CS_, CS_)
        }
        if (sq === checkSq) {
          const gr = ctx.createRadialGradient(x + 30, y + 30, 4, x + 30, y + 30, 34)
          gr.addColorStop(0, 'rgba(255,40,40,0.9)')
          gr.addColorStop(1, 'rgba(255,40,40,0)')
          ctx.fillStyle = gr
          ctx.fillRect(x, y, CS_, CS_)
        }
        if ((sq & 7) === 0) text(ctx, String(8 - (sq >> 3)), x + 3, y + 8, { size: 8, color: light ? '#9a6b45' : '#e9d8b4', align: 'left' })
        if (sq >> 3 === 7) text(ctx, 'abcdefgh'[sq & 7], x + CS_ - 3, y + CS_ - 7, { size: 8, color: light ? '#9a6b45' : '#e9d8b4', align: 'right' })
      }
      for (let sq = 0; sq < 64; sq++) {
        const v = s.c.b[sq]
        if (!v) continue
        if (anim && sq === anim.to) continue
        if (drag === sq && h.ptr.down && sel === sq) continue
        const { x, y } = cellXY(sq)
        glyph(v, x + 30, y + 30)
        if (Math.abs(v) === 6) emoji(ctx, v > 0 ? h.ch[0] : h.ch[1], x + 48, y + 12, 15)
      }
      for (const m of hints) {
        const { x, y } = cellXY(m.to)
        const cap = s.c.b[m.to] !== 0 || m.flag === 2
        ctx.fillStyle = 'rgba(20,90,50,0.55)'
        ctx.beginPath()
        if (cap) {
          ctx.lineWidth = 5
          ctx.strokeStyle = 'rgba(20,90,50,0.6)'
          ctx.arc(x + 30, y + 30, 26, 0, Math.PI * 2)
          ctx.stroke()
        } else {
          ctx.arc(x + 30, y + 30, 9, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      if (anim) {
        const a = cellXY(anim.from)
        const b = cellXY(anim.to)
        const e = ease(anim.t)
        glyph(anim.v, lerpN(a.x, b.x, e) + 30, lerpN(a.y, b.y, e) + 30 - Math.sin(anim.t * Math.PI) * 8)
      }
      if (drag >= 0 && h.ptr.down && sel === drag) glyph(s.c.b[drag], h.ptr.x, h.ptr.y - 6, 58)
      if (promo) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(BX, BY, 480, 480)
        roundRect(ctx, BX + 110, BY + 200, 260, 80, 10, '#e9d8b4', t.accent, 3)
        const col = s.c.side
        ;[5, 4, 3, 2].forEach((p, i) => glyph(p * col, BX + 150 + i * 60, BY + 240, 50))
        text(ctx, 'PROMOTE', BX + 240, BY + 185, { size: 10, color: '#fff' })
      }
    },
    info(s, p) {
      let me = 0
      let foe = 0
      const v = [0, 1, 3, 3, 5, 9, 0]
      for (const x of s.c.b) {
        if (x > 0) me += v[x]
        else if (x < 0) foe += v[-x]
      }
      const d = me - foe
      return (p === 0 ? d : -d) > 0 ? `+${Math.abs(d)}` : ''
    },
    status(s) {
      const e = chessEnd(s.c, s.seen)
      if (e === 'checkmate') return 'Checkmate!'
      if (e === 'stalemate') return 'Stalemate'
      if (e) return 'Draw'
      return inCheck(s.c) ? 'Check!' : ''
    },
    score(s) {
      let d = 0
      const v = [0, 1, 3, 3, 5, 9, 0]
      for (const x of s.c.b) d += x > 0 ? v[x] : -v[-x]
      return Math.max(0, d) * 10
    },
    outcome(s, r) {
      const e = chessEnd(s.c, s.seen)
      if (r === -1) return e === 'stalemate' ? 'Stalemate' : e === 'fifty' ? 'Draw: 50-move rule' : e === 'repetition' ? 'Draw by repetition' : insufficient(s.c.b) ? 'Draw: not enough material' : 'Draw'
      return `Checkmate in ${s.c.full} moves`
    },
  }
}

// ---------------------------------------------------------------- Reversi
function reversiSpec(h: Host): Spec<RevState, number> {
  const { ctx, t } = h
  const BX = 80
  const BY = 30
  const C = 60
  const flips = new Map<number, number>()
  let placed = -1
  let placeT = 1
  let last = -1
  const cellAt = (x: number, y: number) => {
    const c = Math.floor((x - BX) / C)
    const r = Math.floor((y - BY) / C)
    return c < 0 || c > 7 || r < 0 || r > 7 ? -1 : r * 8 + c
  }
  return {
    title: 'Reversi',
    rule: 'Outflank discs to flip them',
    g: reversi,
    ai: (s) => searchMove(reversi, s, byDiff(h.env, 1, 3, 5), h.rng, byDiff(h.env, 40, 6, 0)),
    san: (_s, m) => (m < 0 ? 'pass' : coord(m)),
    onMove(prev, m, next) {
      if (m < 0) return
      placed = m
      placeT = 0
      last = m
      for (let i = 0; i < 64; i++) if (prev.b[i] && prev.b[i] !== next.b[i]) flips.set(i, 0)
      h.env.sfx('move')
      const c = BX + (m & 7) * C + 30
      const r = BY + (m >> 3) * C + 30
      h.fx.burst(c, r, prev.t === 0 ? t.accent : t.accent2, 8, 90, 3)
    },
    update(dt) {
      placeT = Math.min(1, placeT + dt * 5)
      for (const [k, v] of flips) {
        if (v >= 1) flips.delete(k)
        else flips.set(k, v + dt * 3)
      }
    },
    busy: () => flips.size > 0,
    reset() {
      flips.clear()
      last = -1
      placed = -1
    },
    down(s, x, y) {
      const sq = cellAt(x, y)
      if (sq < 0) return null
      const ms = reversi.moves(s)
      if (ms[0] === -1) return -1
      return ms.includes(sq) ? sq : null
    },
    draw(s) {
      plate(h, BX - 14, BY - 14, 8 * C + 28, 8 * C + 28, '#10241a')
      ctx.fillStyle = t.good
      ctx.fillRect(BX, BY, 8 * C, 8 * C)
      ctx.fillStyle = 'rgba(0,0,0,0.42)'
      ctx.fillRect(BX, BY, 8 * C, 8 * C)
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'
      ctx.lineWidth = 2
      for (let i = 0; i <= 8; i++) {
        ctx.beginPath()
        ctx.moveTo(BX + i * C, BY)
        ctx.lineTo(BX + i * C, BY + 8 * C)
        ctx.moveTo(BX, BY + i * C)
        ctx.lineTo(BX + 8 * C, BY + i * C)
        ctx.stroke()
      }
      const ms = reversi.moves(s)
      {
        const sq = cellAt(h.ptr.x, h.ptr.y)
        for (const m of ms) {
          if (m < 0) continue
          const x = BX + (m & 7) * C + 30
          const y = BY + (m >> 3) * C + 30
          ctx.beginPath()
          ctx.arc(x, y, m === sq ? 12 : 6, 0, Math.PI * 2)
          ctx.fillStyle = m === sq ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)'
          ctx.fill()
        }
      }
      for (let i = 0; i < 64; i++) {
        const v = s.b[i]
        if (!v) continue
        const x = BX + (i & 7) * C + 30
        const y = BY + (i >> 3) * C + 30
        const f = flips.get(i)
        if (f !== undefined) {
          const sx = Math.abs(Math.cos(f * Math.PI))
          ctx.save()
          ctx.translate(x, y)
          ctx.scale(Math.max(0.05, sx), 1)
          const who = (f < 0.5 ? (v === 1 ? 1 : 0) : v === 1 ? 0 : 1) as 0 | 1
          disc(h, 0, -Math.sin(f * Math.PI) * 6, 25, who, 28)
          ctx.restore()
        } else if (i === placed && placeT < 1) {
          disc(h, x, y - (1 - ease(placeT)) * 30, 25, v === 1 ? 0 : 1, 28, placeT)
        } else disc(h, x, y, 25, v === 1 ? 0 : 1, 28)
        if (i === last) {
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.setLineDash([4, 3])
          ctx.beginPath()
          ctx.arc(x, y, 29, 0, Math.PI * 2)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }
    },
    info: (s, p) => `${revCount(s.b)[p]} discs`,
    score: (s) => revCount(s.b)[0] * 5,
    status: (s) => (reversi.moves(s)[0] === -1 ? 'No moves: pass' : ''),
    pass: (s) => (reversi.moves(s)[0] === -1 ? -1 : null),
    outcome: (s) => `${revCount(s.b)[0]} to ${revCount(s.b)[1]}`,
  }
}
void revFlips

// ---------------------------------------------------------------- Checkers
function checkersSpec(h: Host): Spec<ChkState, ChkMove> {
  const { ctx, t } = h
  const BX = 80
  const BY = 30
  const C = 60
  let sel = -1
  let hints: ChkMove[] = []
  let anim: { m: ChkMove; v: number; t: number; capV: number[] } | null = null
  let last: ChkMove | null = null
  const cellAt = (x: number, y: number) => {
    const c = Math.floor((x - BX) / C)
    const r = Math.floor((y - BY) / C)
    return c < 0 || c > 7 || r < 0 || r > 7 ? -1 : r * 8 + c
  }
  const pos = (i: number) => ({ x: BX + (i & 7) * C + 30, y: BY + (i >> 3) * C + 30 })
  const piece = (v: number, x: number, y: number, lift = 0) => {
    const who = v > 0 ? 0 : 1
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.ellipse(x, y + 5, 22, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    disc(h, x, y - 3 - lift, 23, who, 26)
    if (Math.abs(v) === 2) {
      text(ctx, '♛', x, y - 26 - lift, { size: 20, color: '#fde047', font: 'serif', shadow: '#000' })
    }
  }
  const sel_ = (s: ChkState, sq: number) => {
    sel = sq
    hints = sq < 0 ? [] : chkMoves(s).filter((m) => m.path[0] === sq)
  }
  return {
    title: 'Checkers',
    rule: 'Jumps are mandatory',
    g: checkers,
    ai: (s) => searchMove(checkers, s, byDiff(h.env, 2, 5, 7), h.rng, byDiff(h.env, 30, 3, 0)),
    san: (_s, m) => `${coord(m.path[0])}${m.caps.length ? 'x' : '-'}${coord(m.path[m.path.length - 1])}`,
    down(s, x, y) {
      const sq = cellAt(x, y)
      if (sq < 0) return null
      if (sel >= 0) {
        const m = hints.find((q) => q.path[q.path.length - 1] === sq)
        if (m) {
          sel_(s, -1)
          return m
        }
      }
      const v = s.b[sq]
      const mine = h.two ? (s.t === 0 ? v > 0 : v < 0) : v > 0
      if (mine && chkMoves(s).some((m) => m.path[0] === sq)) sel_(s, sq)
      else sel_(s, -1)
      return null
    },
    onMove(prev, m, next) {
      anim = { m, v: prev.b[m.path[0]], t: 0, capV: m.caps.map((c) => prev.b[c]) }
      last = m
      sel_(next, -1)
      if (m.caps.length) {
        h.env.sfx('hit')
        h.shake.kick(2 + m.caps.length)
        for (const c of m.caps) h.fx.burst(pos(c).x, pos(c).y, c % 2 ? t.accent : t.accent2, 10, 120, 3)
      } else h.env.sfx('move')
    },
    update(dt) {
      if (anim) {
        anim.t += dt / (0.2 * Math.max(1, anim.m.path.length - 1) + 0.05)
        if (anim.t >= 1) anim = null
      }
    },
    busy: () => anim !== null,
    reset() {
      sel = -1
      hints = []
      anim = null
      last = null
    },
    draw(s) {
      plate(h, BX - 14, BY - 14, 8 * C + 28, 8 * C + 28, '#2a2118')
      for (let i = 0; i < 64; i++) {
        const x = BX + (i & 7) * C
        const y = BY + (i >> 3) * C
        const d = (((i >> 3) + (i & 7)) & 1) === 1
        ctx.fillStyle = d ? '#6b3f26' : '#e6d3a8'
        ctx.fillRect(x, y, C, C)
        if (last && (i === last.path[0] || i === last.path[last.path.length - 1])) {
          ctx.fillStyle = 'rgba(250,204,21,0.35)'
          ctx.fillRect(x, y, C, C)
        }
        if (i === sel) {
          ctx.fillStyle = 'rgba(80,220,120,0.45)'
          ctx.fillRect(x, y, C, C)
        }
      }
      const a = anim
      if (a) a.m.caps.forEach((c, k) => piece(a.capV[k], pos(c).x, pos(c).y))
      for (let i = 0; i < 64; i++) {
        const v = s.b[i]
        if (!v || (a && i === a.m.path[a.m.path.length - 1])) continue
        const p = pos(i)
        piece(v, p.x, p.y, i === sel ? 4 : 0)
      }
      if (a) {
        const segs = a.m.path.length - 1
        const f = Math.min(0.9999, a.t) * segs
        const k = Math.floor(f)
        const p0 = pos(a.m.path[k])
        const p1 = pos(a.m.path[k + 1])
        const e = ease(f - k)
        piece(a.v, lerpN(p0.x, p1.x, e), lerpN(p0.y, p1.y, e), Math.sin((f - k) * Math.PI) * 8)
      }
      for (const m of hints) {
        const p = pos(m.path[m.path.length - 1])
        ctx.fillStyle = 'rgba(80,255,140,0.7)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 9, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    info(s, p) {
      let n = 0
      for (const v of s.b) if (p === 0 ? v > 0 : v < 0) n++
      return `${n} pieces`
    },
    score(s) {
      let n = 0
      for (const v of s.b) if (v > 0) n += Math.abs(v) * 10
      return n
    },
    status: (s) => (chkMoves(s).some((m) => m.caps.length) ? 'Jump!' : ''),
    outcome: () => 'All pieces blocked or captured',
  }
}

// ---------------------------------------------------------------- Connect four
function connectSpec(h: Host): Spec<C4State, number> {
  const { ctx, t } = h
  const C = 70
  const BX = 75
  const BY = 80
  let drop: { col: number; row: number; y: number; vy: number; who: 0 | 1; done: boolean } | null = null
  let shownLast = -1
  return {
    title: 'Connect Four',
    rule: 'Line up four discs',
    g: connect4,
    ai: (s) => searchMove(connect4, s, byDiff(h.env, 2, 5, 7), h.rng, byDiff(h.env, 30, 2, 0)),
    san: (_s, m) => `col ${m + 1}`,
    down(s, x, y) {
      void y
      const c = Math.floor((x - BX) / C)
      if (c < 0 || c >= C4W || s.b[c] !== 0) return null
      return c
    },
    onMove(prev, m, next) {
      const row = (next.last / C4W) | 0
      drop = { col: m, row, y: BY - C, vy: 0, who: prev.t, done: false }
      shownLast = -1
    },
    update(dt) {
      if (!drop) return
      drop.vy += 2600 * dt
      drop.y += drop.vy * dt
      const target = BY + drop.row * C
      if (drop.y >= target) {
        if (drop.vy > 260) {
          drop.vy = -drop.vy * 0.28
          drop.y = target
          h.env.sfx('move')
        } else {
          drop.y = target
          h.fx.burst(BX + drop.col * C + C / 2, target + C / 2, drop.who === 0 ? t.accent : t.accent2, 8, 90, 3)
          shownLast = drop.row * C4W + drop.col
          drop = null
        }
      }
    },
    busy: () => drop !== null,
    reset() {
      drop = null
      shownLast = -1
    },
    draw(s) {
      const w = C4W * C
      const hh = C4H * C
      // hover preview
      const hc = Math.floor((h.ptr.x - BX) / C)
      const turn = s.t
      if (!drop && s.w === -1 && hc >= 0 && hc < C4W && h.ptr.active && (h.two || turn === 0)) {
        disc(h, BX + hc * C + C / 2, BY - 34, 26, turn, 26, 0.75)
      }
      const cell = (r: number, c: number) => ({ x: BX + c * C + C / 2, y: BY + r * C + C / 2 })
      const winLine = s.w === 0 || s.w === 1 ? c4Line(s.b) : null
      // discs behind the board frame
      for (let r = 0; r < C4H; r++) {
        for (let c = 0; c < C4W; c++) {
          const v = s.b[r * C4W + c]
          if (!v) continue
          if (drop && drop.row === r && drop.col === c) continue
          const p = cell(r, c)
          const win = winLine?.includes(r * C4W + c)
          disc(h, p.x, p.y, 26, v === 1 ? 0 : 1, 26, 1, !!win && Math.sin(h.time() * 8) > 0)
        }
      }
      if (drop) disc(h, BX + drop.col * C + C / 2, drop.y + C / 2, 26, drop.who, 26)
      // board frame with holes
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(BX - 12, BY - 12, w + 24, hh + 24, 14)
      for (let r = 0; r < C4H; r++) for (let c = 0; c < C4W; c++) {
        const p = cell(r, c)
        ctx.moveTo(p.x + 30, p.y)
        ctx.arc(p.x, p.y, 30, 0, Math.PI * 2, true)
      }
      ctx.fillStyle = '#1d4ed8'
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur = 16
      ctx.fill('evenodd')
      ctx.restore()
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ctx.lineWidth = 3
      for (let r = 0; r < C4H; r++) for (let c = 0; c < C4W; c++) {
        const p = cell(r, c)
        ctx.beginPath()
        ctx.arc(p.x, p.y, 30, 0, Math.PI * 2)
        ctx.stroke()
      }
      if (shownLast >= 0 && !winLine) {
        const p = cell((shownLast / C4W) | 0, shownLast % C4W)
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(p.x, p.y, 20, 0, Math.PI * 2)
        ctx.stroke()
      }
    },
    outcome: () => 'Four in a row',
  }
}

// ---------------------------------------------------------------- Tic-tac-toe (classic / ultimate)
function tttSpec(h: Host, ult: boolean): Spec<TttState | UltState, number> {
  const { ctx, t } = h
  const marks = new Map<number, number>()
  const mark = (x: number, y: number, who: 0 | 1, size: number, a = 1) => {
    ctx.globalAlpha = a
    emoji(ctx, h.ch[who], x, y, size)
    ctx.globalAlpha = 1
  }
  if (!ult) {
    const C = 150
    const BX = 95
    const BY = 45
    const g = ttt
    return {
      title: 'Tic-Tac-Toe',
      rule: 'Three in a row',
      g: g as Game<TttState | UltState, number>,
      ai(s) {
        const st = s as TttState
        if (h.diff === 0 && h.rng() < 0.4) return h.rng.pick(ttt.moves(st))
        return searchMove(ttt, st, 9, h.rng, 0)
      },
      san: (_s, m) => `${'abc'[m % 3]}${(m / 3 | 0) + 1}`,
      down(s, x, y) {
        const c = Math.floor((x - BX) / C)
        const r = Math.floor((y - BY) / C)
        if (c < 0 || c > 2 || r < 0 || r > 2) return null
        return s.b[r * 3 + c] ? null : r * 3 + c
      },
      onMove(prev, m) {
        marks.set(m, 0)
        h.env.sfx('move')
        h.fx.burst(BX + (m % 3) * C + C / 2, BY + ((m / 3) | 0) * C + C / 2, prev.t === 0 ? t.accent : t.accent2, 12, 120, 3)
      },
      update(dt) {
        for (const [k, v] of marks) marks.set(k, Math.min(1, v + dt * 5))
      },
      reset: () => marks.clear(),
      draw(s0) {
        const s = s0 as TttState
        plate(h, BX - 15, BY - 15, 3 * C + 30, 3 * C + 30, dark)
        ctx.strokeStyle = t.fg
        ctx.globalAlpha = 0.5
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        for (let i = 1; i < 3; i++) {
          ctx.beginPath()
          ctx.moveTo(BX + i * C, BY + 8)
          ctx.lineTo(BX + i * C, BY + 3 * C - 8)
          ctx.moveTo(BX + 8, BY + i * C)
          ctx.lineTo(BX + 3 * C - 8, BY + i * C)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        const hov = (() => {
          const c = Math.floor((h.ptr.x - BX) / C)
          const r = Math.floor((h.ptr.y - BY) / C)
          return c < 0 || c > 2 || r < 0 || r > 2 ? -1 : r * 3 + c
        })()
        for (let i = 0; i < 9; i++) {
          const x = BX + (i % 3) * C + C / 2
          const y = BY + ((i / 3) | 0) * C + C / 2
          if (s.b[i]) mark(x, y, s.b[i] === 1 ? 0 : 1, 78 * ease(marks.get(i) ?? 1))
          else if (i === hov && ttt.over(s) === null && (h.two || s.t === 0)) mark(x, y, s.t, 70, 0.35)
        }
        const w = (() => {
          for (const L of [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]) {
            if (s.b[L[0]] && s.b[L[0]] === s.b[L[1]] && s.b[L[0]] === s.b[L[2]]) return L
          }
          return null
        })()
        if (w) {
          ctx.strokeStyle = t.good
          ctx.lineWidth = 8
          ctx.shadowColor = t.good
          ctx.shadowBlur = 14
          ctx.beginPath()
          ctx.moveTo(BX + (w[0] % 3) * C + C / 2, BY + ((w[0] / 3) | 0) * C + C / 2)
          ctx.lineTo(BX + (w[2] % 3) * C + C / 2, BY + ((w[2] / 3) | 0) * C + C / 2)
          ctx.stroke()
          ctx.shadowBlur = 0
        }
      },
      outcome: () => 'Three in a row',
    }
  }
  // ultimate
  const CS_ = 48
  const GAP = 14
  const BX = 50
  const BY = 28
  const bsz = CS_ * 3
  const origin = (g: number) => ({ x: BX + (g % 3) * (bsz + GAP), y: BY + ((g / 3) | 0) * (bsz + GAP) })
  return {
    title: 'Ultimate Tic-Tac-Toe',
    rule: 'Your move sends the foe to that board',
    g: ultimate as Game<TttState | UltState, number>,
    ai(s) {
      const st = s as UltState
      if (h.diff === 0 && h.rng() < 0.25) return h.rng.pick(ultimate.moves(st))
      return searchMove(ultimate, st, byDiff(h.env, 2, 4, 5), h.rng, byDiff(h.env, 6, 0, 0))
    },
    san: (_s, m) => `${(m / 9 | 0) + 1}.${(m % 9) + 1}`,
    down(s0, x, y) {
      const s = s0 as UltState
      for (let g = 0; g < 9; g++) {
        const o = origin(g)
        const c = Math.floor((x - o.x) / CS_)
        const r = Math.floor((y - o.y) / CS_)
        if (c < 0 || c > 2 || r < 0 || r > 2) continue
        const m = g * 9 + r * 3 + c
        return ultimate.moves(s).includes(m) ? m : null
      }
      return null
    },
    onMove(prev, m) {
      marks.set(m, 0)
      h.env.sfx('move')
      const o = origin((m / 9) | 0)
      h.fx.burst(o.x + ((m % 9) % 3) * CS_ + CS_ / 2, o.y + (((m % 9) / 3) | 0) * CS_ + CS_ / 2, prev.t === 0 ? t.accent : t.accent2, 10, 100, 3)
    },
    update(dt) {
      for (const [k, v] of marks) marks.set(k, Math.min(1, v + dt * 5))
    },
    reset: () => marks.clear(),
    draw(s0) {
      const s = s0 as UltState
      const legal = new Set(ultimate.moves(s))
      const over = ultimate.over(s) !== null
      for (let g = 0; g < 9; g++) {
        const o = origin(g)
        const active = !over && [...legal].some((m) => ((m / 9) | 0) === g)
        roundRect(ctx, o.x - 4, o.y - 4, bsz + 8, bsz + 8, 8, active ? 'rgba(255,255,255,0.16)' : dark, active ? t.good : 'rgba(255,255,255,0.15)', active ? 3 : 1)
        ctx.strokeStyle = t.fg
        ctx.globalAlpha = 0.45
        ctx.lineWidth = 2
        for (let i = 1; i < 3; i++) {
          ctx.beginPath()
          ctx.moveTo(o.x + i * CS_, o.y + 4)
          ctx.lineTo(o.x + i * CS_, o.y + bsz - 4)
          ctx.moveTo(o.x + 4, o.y + i * CS_)
          ctx.lineTo(o.x + bsz - 4, o.y + i * CS_)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        for (let c = 0; c < 9; c++) {
          const v = s.b[g * 9 + c]
          const x = o.x + (c % 3) * CS_ + CS_ / 2
          const y = o.y + ((c / 3) | 0) * CS_ + CS_ / 2
          if (v) mark(x, y, v === 1 ? 0 : 1, 34 * ease(marks.get(g * 9 + c) ?? 1), s.big[g] && s.big[g] !== v ? 0.35 : 1)
          else if (active && legal.has(g * 9 + c)) {
            const hov = h.ptr.x >= x - CS_ / 2 && h.ptr.x < x + CS_ / 2 && h.ptr.y >= y - CS_ / 2 && h.ptr.y < y + CS_ / 2
            if (hov && (h.two || s.t === 0)) mark(x, y, s.t, 30, 0.4)
            else {
              ctx.fillStyle = 'rgba(255,255,255,0.28)'
              ctx.beginPath()
              ctx.arc(x, y, 3, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
        const w = s.big[g]
        if (w) {
          ctx.fillStyle = 'rgba(8,10,20,0.62)'
          ctx.fillRect(o.x, o.y, bsz, bsz)
          if (w === 1 || w === -1) mark(o.x + bsz / 2, o.y + bsz / 2, w === 1 ? 0 : 1, 110)
          else text(ctx, '=', o.x + bsz / 2, o.y + bsz / 2, { size: 40, color: '#fff' })
        }
      }
    },
    info(s0, p) {
      const s = s0 as UltState
      return `${[...s.big].filter((x) => x === (p === 0 ? 1 : -1)).length} boards`
    },
    outcome: () => 'Won the meta-board',
  }
}

// ---------------------------------------------------------------- Mancala
function mancalaSpec(h: Host): Spec<ManState, number> {
  const { ctx, t } = h
  const BX = 40
  const BY = 150
  const PW = 68
  // pit centres
  const pit = (i: number) => {
    if (i === 6) return { x: BX + 110 + 5 * PW + 80, y: BY + 90, r: 0 }
    if (i === 13) return { x: BX + 30, y: BY + 90, r: 0 }
    if (i < 6) return { x: BX + 110 + i * PW, y: BY + 150, r: 1 }
    return { x: BX + 110 + (12 - i) * PW, y: BY + 30, r: 1 }
  }
  let anim: { trail: number[]; idx: number; clock: number; p: Int8Array; who: 0 | 1; after: ManState; capture: number; captured: number; store: number; moved: boolean } | null = null
  let last = -1
  const pitAt = (x: number, y: number) => {
    for (let i = 0; i < 14; i++) {
      if (i === 6 || i === 13) continue
      const p = pit(i)
      if (Math.hypot(x - p.x, y - p.y) < 38) return i
    }
    return -1
  }
  const seeds = (i: number, n: number, cx: number, cy: number, big: boolean) => {
    const rr = h.rng
    void rr
    for (let k = 0; k < n; k++) {
      const a = (k * 2.399 + i * 1.3) % (Math.PI * 2)
      const rad = big ? 6 + Math.sqrt(k) * 8 : 4 + Math.sqrt(k) * 7.5
      const x = cx + Math.cos(a) * Math.min(rad, big ? 36 : 28)
      const y = cy + Math.sin(a) * Math.min(rad, big ? 52 : 28)
      ctx.beginPath()
      ctx.arc(x, y, 5.5, 0, Math.PI * 2)
      ctx.fillStyle = t.blocks[(k + i) % t.blocks.length]
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }
  return {
    title: 'Mancala',
    rule: 'Sow seeds, land in your store for extra turns',
    g: mancala,
    ai: (s) => searchMove(mancala, s, byDiff(h.env, 2, 5, 8), h.rng, byDiff(h.env, 3, 0, 0)),
    san: (s, m) => `${s.t === 0 ? 'A' : 'B'}${s.t === 0 ? m + 1 : m - 6}`,
    down(s, x, y) {
      const i = pitAt(x, y)
      if (i < 0) return null
      const mine = s.t === 0 ? i < 6 : i > 6
      return mine && s.p[i] > 0 ? i : null
    },
    onMove(prev, m) {
      const r = sow(prev, m)
      const p = new Int8Array(prev.p)
      p[m] = 0
      anim = { trail: r.trail, idx: 0, clock: 0.15, p, who: prev.t, after: r.s, capture: r.capture, captured: r.captured, store: prev.t === 0 ? 6 : 13, moved: false }
      last = m
    },
    update(dt) {
      if (!anim) return
      anim.clock -= dt
      if (anim.clock > 0) return
      if (anim.idx < anim.trail.length) {
        const i = anim.trail[anim.idx++]
        anim.p[i]++
        const pp = pit(i)
        h.fx.burst(pp.x, pp.y, t.accent2, 3, 50, 2)
        h.env.sfx('click')
        anim.clock = 0.17
      } else if (anim.captured && !anim.moved) {
        anim.moved = true
        const opp = anim.capture
        void opp
        h.env.sfx('power')
        anim.clock = 0.35
        const pp = pit(anim.store)
        h.fx.burst(pp.x, pp.y, t.good, 16, 140, 3)
        anim.p[anim.store] += anim.captured
        anim.p[anim.capture] = 0
        anim.p[12 - anim.capture] = 0
      } else {
        anim = null
      }
    },
    busy: () => anim !== null,
    reset() {
      anim = null
      last = -1
    },
    draw(s) {
      const p = anim ? anim.p : s.p
      plate(h, BX - 30, BY - 30, 620, 260, '#5b3a22')
      ctx.save()
      const grd = ctx.createLinearGradient(0, BY - 30, 0, BY + 230)
      grd.addColorStop(0, '#7a4e2c')
      grd.addColorStop(1, '#4a2e19')
      ctx.beginPath()
      ctx.roundRect(BX - 24, BY - 24, 608, 248, 36)
      ctx.fillStyle = grd
      ctx.fill()
      ctx.restore()
      for (let i = 0; i < 14; i++) {
        const c = pit(i)
        const store = i === 6 || i === 13
        ctx.beginPath()
        if (store) ctx.roundRect(c.x - 32, c.y - 82, 64, 164, 32)
        else ctx.arc(c.x, c.y, 35, 0, Math.PI * 2)
        const active = !anim && !store && (s.t === 0 ? i < 6 : i > 6) && p[i] > 0 && (h.two || s.t === 0)
        const hov = active && pitAt(h.ptr.x, h.ptr.y) === i
        ctx.fillStyle = hov ? '#2b1608' : '#34200f'
        ctx.fill()
        ctx.lineWidth = active ? 3 : 1.5
        ctx.strokeStyle = active ? (hov ? '#fff' : t.good) : 'rgba(0,0,0,0.5)'
        ctx.stroke()
        if (i === last && !anim) {
          ctx.strokeStyle = '#fde047'
          ctx.lineWidth = 2
          ctx.stroke()
        }
        seeds(i, p[i], c.x, c.y, store)
        text(ctx, String(p[i]), c.x, store ? c.y + (i === 6 ? 96 : 96) : c.y + (i < 6 ? 52 : -52), { size: 12, color: '#fff', shadow: '#000' })
        if (store) emoji(ctx, h.ch[i === 6 ? 0 : 1], c.x, c.y - 104, 22)
      }
    },
    info: (s, p) => `${s.p[p === 0 ? 6 : 13]} in store`,
    score: (s) => s.p[6] * 5,
    status: (s) => (s.t === 0 ? 'Pick a pit on your side' : ''),
    outcome: (s) => `${s.p[6]} to ${s.p[13]} seeds`,
  }
}

// ---------------------------------------------------------------- Gomoku
function gomokuSpec(h: Host): Spec<GomState, number> {
  const { ctx, t } = h
  const C = 32
  const BX = 80
  const BY = 30
  const cellAt = (x: number, y: number) => {
    const c = Math.round((x - BX - C / 2) / C)
    const r = Math.round((y - BY - C / 2) / C)
    return c < 0 || c >= GN || r < 0 || r >= GN ? -1 : r * GN + c
  }
  const grow = new Map<number, number>()
  const g: Game<GomState, number> = {
    init: gomoku.init,
    turn: (s) => s.t,
    moves: () => [],
    apply: gomoku.apply,
    over: (s) => (s.w === -1 ? null : s.w === 2 ? -1 : (s.w as 0 | 1)),
    eval: () => 0,
  }
  return {
    title: 'Gomoku',
    rule: 'Five in a row wins',
    g,
    ai: (s) => gomokuAI(s, h.diff, h.rng),
    san: (_s, m) => `${'abcdefghijklmno'[m % GN]}${GN - ((m / GN) | 0)}`,
    down(s, x, y) {
      const sq = cellAt(x, y)
      return sq >= 0 && !s.b[sq] ? sq : null
    },
    onMove(prev, m) {
      grow.set(m, 0)
      h.env.sfx('move')
      const c = BX + (m % GN) * C + C / 2
      const r = BY + ((m / GN) | 0) * C + C / 2
      h.fx.burst(c, r, prev.t === 0 ? t.accent : t.accent2, 8, 80, 2.5)
    },
    update(dt) {
      for (const [k, v] of grow) grow.set(k, Math.min(1, v + dt * 6))
    },
    reset: () => grow.clear(),
    draw(s) {
      plate(h, BX - 4, BY - 4, GN * C + 8, GN * C + 8, '#c99a5b')
      ctx.strokeStyle = 'rgba(60,35,10,0.8)'
      ctx.lineWidth = 1.2
      for (let i = 0; i < GN; i++) {
        ctx.beginPath()
        ctx.moveTo(BX + C / 2, BY + C / 2 + i * C)
        ctx.lineTo(BX + C / 2 + (GN - 1) * C, BY + C / 2 + i * C)
        ctx.moveTo(BX + C / 2 + i * C, BY + C / 2)
        ctx.lineTo(BX + C / 2 + i * C, BY + C / 2 + (GN - 1) * C)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(60,35,10,0.8)'
      for (const [r, c] of [[3, 3], [3, 11], [11, 3], [11, 11], [7, 7]]) {
        ctx.beginPath()
        ctx.arc(BX + C / 2 + c * C, BY + C / 2 + r * C, 3.5, 0, Math.PI * 2)
        ctx.fill()
      }
      const hv = cellAt(h.ptr.x, h.ptr.y)
      if (hv >= 0 && !s.b[hv] && s.w === -1 && (h.two || s.t === 0) && h.ptr.active) {
        disc(h, BX + C / 2 + (hv % GN) * C, BY + C / 2 + ((hv / GN) | 0) * C, 13, s.t, 0, 0.45)
      }
      for (let i = 0; i < s.b.length; i++) {
        if (!s.b[i]) continue
        const x = BX + C / 2 + (i % GN) * C
        const y = BY + C / 2 + ((i / GN) | 0) * C
        const gr = ease(grow.get(i) ?? 1)
        disc(h, x, y, 14.5 * gr, s.b[i] === 1 ? 0 : 1, 17 * gr, 1, s.line.includes(i))
        if (i === s.last && s.w === -1) {
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(x, y, 17, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    },
    info: (s, p) => `${s.b.filter((v) => v === (p === 0 ? 1 : -1)).length} stones`,
    outcome: () => 'Five in a row',
  }
}

// ---------------------------------------------------------------- Dots and boxes
function dotsSpec(h: Host): Spec<DotState, number> {
  const { ctx, t } = h
  const n = byDiff(h.env, 3, 4, 5)
  const g = dots(n)
  const C = n === 3 ? 110 : n === 4 ? 95 : 80
  const BX = 20 + (PX - 40 - n * C) / 2
  const BY = 40 + (440 - n * C) / 2
  const edgeSeg = (e: number) => {
    const hc = dotH(n)
    if (e < hc) {
      const r = (e / n) | 0
      const c = e % n
      return { x1: BX + c * C, y1: BY + r * C, x2: BX + (c + 1) * C, y2: BY + r * C }
    }
    const k = e - hc
    const r = (k / (n + 1)) | 0
    const c = k % (n + 1)
    return { x1: BX + c * C, y1: BY + r * C, x2: BX + c * C, y2: BY + (r + 1) * C }
  }
  const grow = new Map<number, number>()
  const boxPop = new Map<number, number>()
  const edgeAt = (s: DotState, x: number, y: number) => {
    let best = -1
    let bd = 22
    for (let e = 0; e < s.e.length; e++) {
      if (s.e[e]) continue
      const sg = edgeSeg(e)
      const mx = (sg.x1 + sg.x2) / 2
      const my = (sg.y1 + sg.y2) / 2
      const d = Math.hypot(x - mx, y - my)
      if (d < bd) {
        bd = d
        best = e
      }
    }
    return best
  }
  return {
    title: 'Dots & Boxes',
    rule: 'Close a box to score and move again',
    g,
    ai: (s) => dotsAI(g, s, h.diff, h.rng),
    san: (s, m) => (m < dotH(n) ? `h${m + 1}` : `v${m - dotH(n) + 1}`) + (s.t === 0 ? '' : ''),
    down: (s, x, y) => {
      const e = edgeAt(s, x, y)
      return e < 0 ? null : e
    },
    onMove(prev, m, next) {
      grow.set(m, 0)
      h.env.sfx('click')
      for (let b = 0; b < n * n; b++) {
        if (next.box[b] !== -1 && prev.box[b] === -1) {
          boxPop.set(b, 0)
          h.env.sfx('point')
          const r = (b / n) | 0
          const c = b % n
          h.fx.burst(BX + c * C + C / 2, BY + r * C + C / 2, prev.t === 0 ? t.accent : t.accent2, 12, 110, 3)
        }
      }
    },
    update(dt) {
      for (const [k, v] of grow) grow.set(k, Math.min(1, v + dt * 6))
      for (const [k, v] of boxPop) boxPop.set(k, Math.min(1, v + dt * 4))
    },
    reset() {
      grow.clear()
      boxPop.clear()
    },
    draw(s) {
      plate(h, BX - 30, BY - 30, n * C + 60, n * C + 60, dark)
      for (let b = 0; b < n * n; b++) {
        const o = s.box[b]
        if (o === -1) continue
        const r = (b / n) | 0
        const c = b % n
        const pop = ease(boxPop.get(b) ?? 1)
        ctx.globalAlpha = 0.35 * pop
        ctx.fillStyle = o === 0 ? t.accent : t.accent2
        ctx.fillRect(BX + c * C + 4, BY + r * C + 4, C - 8, C - 8)
        ctx.globalAlpha = 1
        emoji(ctx, h.ch[o as 0 | 1], BX + c * C + C / 2, BY + r * C + C / 2, C * 0.5 * pop)
      }
      const hov = h.ptr.active && (h.two || s.t === 0) && g.over(s) === null && !h.ptr.down ? edgeAt(s, h.ptr.x, h.ptr.y) : -1
      for (let e = 0; e < s.e.length; e++) {
        if (!s.e[e] && e !== hov) continue
        const sg = edgeSeg(e)
        const f = ease(grow.get(e) ?? 1)
        ctx.lineCap = 'round'
        ctx.lineWidth = s.e[e] ? 7 : 5
        ctx.strokeStyle = s.e[e] ? t.fg : s.t === 0 ? t.accent : t.accent2
        ctx.globalAlpha = s.e[e] ? 1 : 0.6
        ctx.beginPath()
        ctx.moveTo(sg.x1, sg.y1)
        ctx.lineTo(lerpN(sg.x1, sg.x2, f), lerpN(sg.y1, sg.y2, f))
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      ctx.fillStyle = '#fff'
      for (let r = 0; r <= n; r++) for (let c = 0; c <= n; c++) {
        ctx.beginPath()
        ctx.arc(BX + c * C, BY + r * C, 6, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    info: (s, p) => `${s.sc[p]} boxes`,
    score: (s) => s.sc[0] * 20,
    outcome: (s) => `${s.sc[0]} to ${s.sc[1]} boxes`,
  }
}

// ---------------------------------------------------------------- Nim
function nimSpec(h: Host): Spec<NimState, NimMove> {
  const { ctx, t } = h
  const heaps = byDiff(h.env, [3, 4, 5], [1, 3, 5, 7], [3, 4, 5, 6])
  const misere = h.diff === 2 || h.env.mods.has('hard')
  const g = nim(heaps, misere)
  const C = 52
  const rowY = (i: number) => 90 + i * 76
  const rowX = (k: number, len: number) => 70 + (k + 0.5) * Math.min(C + 10, 480 / Math.max(len, 1)) + 20
  const take = new Map<string, number>()
  const itemAt = (s: NimState, x: number, y: number) => {
    for (let r = 0; r < s.heaps.length; r++) {
      if (Math.abs(y - rowY(r)) > 34) continue
      for (let k = 0; k < s.heaps[r]; k++) if (Math.abs(x - rowX(k, heaps[r])) < 28) return { r, k }
    }
    return null
  }
  return {
    title: 'Nim',
    rule: misere ? 'Take any number from one row. Last item LOSES' : 'Take any number from one row. Last item WINS',
    g,
    ai: (s) => nimAI(g, s, h.diff, h.rng),
    san: (_s, m) => `row ${m.h + 1} -${m.take}`,
    down(s, x, y) {
      const it = itemAt(s, x, y)
      return it ? { h: it.r, take: s.heaps[it.r] - it.k } : null
    },
    onMove(prev, m) {
      for (let k = prev.heaps[m.h] - m.take; k < prev.heaps[m.h]; k++) {
        take.set(`${m.h},${k}`, 0)
        h.fx.burst(rowX(k, heaps[m.h]), rowY(m.h), prev.t === 0 ? t.accent : t.accent2, 8, 120, 3)
      }
      h.env.sfx('hit')
    },
    update(dt) {
      for (const [k, v] of take) {
        if (v >= 1) take.delete(k)
        else take.set(k, v + dt * 3)
      }
    },
    reset: () => take.clear(),
    draw(s) {
      const hv = h.ptr.active && (h.two || s.t === 0) ? itemAt(s, h.ptr.x, h.ptr.y) : null
      plate(h, 50, 40, 560, heaps.length * 76 + 30, dark)
      for (let r = 0; r < heaps.length; r++) {
        text(ctx, String(s.heaps[r]), 82, rowY(r), { size: 14, color: '#fff' })
        for (let k = 0; k < heaps[r]; k++) {
          const x = rowX(k, heaps[r])
          const gone = k >= s.heaps[r]
          const tk = take.get(`${r},${k}`)
          if (gone && tk === undefined) continue
          const sel = hv && hv.r === r && hv.k <= k && !gone
          const a = gone ? 1 - (tk ?? 1) : 1
          ctx.globalAlpha = a * (sel ? 0.45 : 1)
          emoji(ctx, t.items[r % t.items.length], x, rowY(r) - (gone ? (tk ?? 0) * 30 : 0) - (sel ? 6 : 0), 40 * (gone ? 1 + (tk ?? 0) * 0.4 : 1))
          ctx.globalAlpha = 1
        }
      }
    },
    status: (s) => (nimIsWinning(s) === (s.t === 0) ? '' : ''),
    outcome: (_s, r) => (r === 0 ? 'You took the right items' : 'The opponent outplayed you'),
  }
}

// ---------------------------------------------------------------- Go 9x9
function goSpec(h: Host): Spec<GoState, number> {
  const { ctx } = h
  const C = 52
  const BX = 90
  const BY = 40
  const cellAt = (x: number, y: number) => {
    const c = Math.round((x - BX - C / 2) / C)
    const r = Math.round((y - BY - C / 2) / C)
    return c < 0 || c >= GO || r < 0 || r >= GO ? -1 : r * GO + c
  }
  const g: Game<GoState, number> = {
    init: goInit,
    turn: (s) => s.t,
    moves: () => [],
    apply: (s, m) => goPlay(s, m) ?? s,
    over: (s) => {
      if (s.passes < 2) return null
      const sc = goScore(s.b)
      return sc.black > sc.white ? 0 : 1
    },
    eval: () => 0,
  }
  const grow = new Map<number, number>()
  const stone = (x: number, y: number, who: 0 | 1, r: number, a = 1) => {
    ctx.save()
    ctx.globalAlpha = a
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetY = 2
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    const gr = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r)
    gr.addColorStop(0, who === 0 ? '#5a5a66' : '#ffffff')
    gr.addColorStop(1, who === 0 ? '#0c0c12' : '#cfcfd6')
    ctx.fillStyle = gr
    ctx.fill()
    ctx.restore()
  }
  return {
    title: 'Go 9x9',
    rule: 'Surround more territory than the foe',
    g,
    ai: (s) => goAI(s, h.diff, h.rng),
    san: (_s, m) => (m < 0 ? 'pass' : `${'ABCDEFGHJ'[m % GO]}${GO - ((m / GO) | 0)}`),
    down(s, x, y) {
      const sq = cellAt(x, y)
      return sq >= 0 && goPlay(s, sq) ? sq : null
    },
    onMove(prev, m, next) {
      if (m < 0) {
        h.env.sfx('click')
        return
      }
      grow.set(m, 0)
      h.env.sfx('move')
      const caps = next.caps[prev.t] - prev.caps[prev.t]
      if (caps) {
        h.env.sfx('hit')
        h.shake.kick(3)
        for (let i = 0; i < 81; i++) {
          if (prev.b[i] && !next.b[i]) h.fx.burst(BX + C / 2 + (i % GO) * C, BY + C / 2 + ((i / GO) | 0) * C, '#fff', 10, 100, 3)
        }
      }
    },
    update(dt) {
      for (const [k, v] of grow) grow.set(k, Math.min(1, v + dt * 6))
    },
    reset: () => grow.clear(),
    pass: (s) => (s.passes >= 0 ? -1 : null),
    draw(s) {
      plate(h, BX - 16, BY - 16, GO * C + 32, GO * C + 32, '#d2a35f')
      ctx.strokeStyle = 'rgba(50,30,8,0.85)'
      ctx.lineWidth = 1.4
      for (let i = 0; i < GO; i++) {
        ctx.beginPath()
        ctx.moveTo(BX + C / 2, BY + C / 2 + i * C)
        ctx.lineTo(BX + C / 2 + (GO - 1) * C, BY + C / 2 + i * C)
        ctx.moveTo(BX + C / 2 + i * C, BY + C / 2)
        ctx.lineTo(BX + C / 2 + i * C, BY + C / 2 + (GO - 1) * C)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(50,30,8,0.85)'
      for (const [r, c] of [[2, 2], [2, 6], [6, 2], [6, 6], [4, 4]]) {
        ctx.beginPath()
        ctx.arc(BX + C / 2 + c * C, BY + C / 2 + r * C, 4, 0, Math.PI * 2)
        ctx.fill()
      }
      const hv = cellAt(h.ptr.x, h.ptr.y)
      if (hv >= 0 && h.ptr.active && (h.two || s.t === 0) && g.over(s) === null && !s.b[hv] && goPlay(s, hv)) {
        stone(BX + C / 2 + (hv % GO) * C, BY + C / 2 + ((hv / GO) | 0) * C, s.t, 21, 0.4)
      }
      const done = g.over(s) !== null
      const sc = done ? goScore(s.b) : null
      for (let i = 0; i < 81; i++) {
        const x = BX + C / 2 + (i % GO) * C
        const y = BY + C / 2 + ((i / GO) | 0) * C
        if (s.b[i]) {
          const gr = ease(grow.get(i) ?? 1)
          stone(x, y, s.b[i] === 1 ? 0 : 1, 22 * gr)
          if (i === s.last) {
            ctx.strokeStyle = s.b[i] === 1 ? '#fff' : '#111'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(x, y, 8, 0, Math.PI * 2)
            ctx.stroke()
          }
        } else if (sc && sc.owner[i] !== 0) {
          ctx.fillStyle = sc.owner[i] > 0 ? 'rgba(10,10,20,0.75)' : 'rgba(255,255,255,0.85)'
          ctx.fillRect(x - 6, y - 6, 12, 12)
        }
      }
      void goGroup
    },
    info(s, p) {
      const sc = goScore(s.b)
      return p === 0 ? `${sc.black} pts · ${s.caps[0]} cap` : `${sc.white} pts · ${s.caps[1]} cap`
    },
    status: (s) => (s.passes === 1 ? 'Opponent passed' : `Komi ${GO_KOMI}`),
    score: (s) => goScore(s.b).black * 3,
    outcome(s) {
      const sc = goScore(s.b)
      return `Black ${sc.black} - White ${sc.white}`
    },
  }
}

// ---------------------------------------------------------------- Hex
function hexSpec(h: Host): Spec<HexState, number> {
  const { ctx, t } = h
  const R = 22
  const dx = R * Math.sqrt(3)
  const dy = R * 1.5
  const OX = 80
  const OY = 110
  const pos = (i: number) => ({ x: OX + (i % HEXN) * dx + ((i / HEXN) | 0) * dx * 0.5, y: OY + ((i / HEXN) | 0) * dy })
  const cellAt = (x: number, y: number) => {
    let best = -1
    let bd = R * 0.95
    for (let i = 0; i < HEXN * HEXN; i++) {
      const p = pos(i)
      const d = Math.hypot(x - p.x, y - p.y)
      if (d < bd) {
        bd = d
        best = i
      }
    }
    return best
  }
  const grow = new Map<number, number>()
  const hexPath = (x: number, y: number, r: number) => {
    ctx.beginPath()
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI / 3) * k + Math.PI / 6
      const px = x + Math.cos(a) * r
      const py = y + Math.sin(a) * r
      if (k === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
  }
  return {
    title: 'Hex',
    rule: 'Connect your two sides',
    g: hex,
    ai: (s) => {
      // first move: take the centre
      if (s.b.every((v) => !v)) return 40
      const cand = hex.moves(s)
      const d = byDiff(h.env, 1, 1, 2)
      if (d === 2 && cand.length > 50) return searchMove(hex, s, 1, h.rng, 0)
      return searchMove(hex, s, d, h.rng, byDiff(h.env, 1, 0, 0))
    },
    san: (_s, m) => `${'abcdefghi'[m % HEXN]}${((m / HEXN) | 0) + 1}`,
    down(s, x, y) {
      const sq = cellAt(x, y)
      return sq >= 0 && !s.b[sq] ? sq : null
    },
    onMove(prev, m) {
      grow.set(m, 0)
      h.env.sfx('move')
      const p = pos(m)
      h.fx.burst(p.x, p.y, prev.t === 0 ? t.accent : t.accent2, 8, 90, 3)
    },
    update(dt) {
      for (const [k, v] of grow) grow.set(k, Math.min(1, v + dt * 6))
    },
    reset: () => grow.clear(),
    draw(s) {
      // edge bands: player 0 top/bottom, player 1 left/right
      const tl = pos(0)
      const tr = pos(HEXN - 1)
      const bl = pos(HEXN * (HEXN - 1))
      const br = pos(HEXN * HEXN - 1)
      ctx.lineWidth = 7
      ctx.lineCap = 'round'
      ctx.strokeStyle = t.accent
      for (const [a, b, o] of [[tl, tr, -R * 1.05], [bl, br, R * 1.05]] as const) {
        ctx.beginPath()
        ctx.moveTo(a.x - R, a.y + o)
        ctx.lineTo(b.x + R, b.y + o)
        ctx.stroke()
      }
      ctx.strokeStyle = t.accent2
      ctx.beginPath()
      ctx.moveTo(tl.x - R * 1.1, tl.y - R * 0.5)
      ctx.lineTo(bl.x - R * 1.1, bl.y + R * 0.5)
      ctx.moveTo(tr.x + R * 1.1, tr.y - R * 0.5)
      ctx.lineTo(br.x + R * 1.1, br.y + R * 0.5)
      ctx.stroke()
      const chain = s.w >= 0 ? hexChain(s.b, s.w === 0 ? 1 : -1) : null
      const hv = h.ptr.active && (h.two || s.t === 0) && s.w === -1 ? cellAt(h.ptr.x, h.ptr.y) : -1
      for (let i = 0; i < HEXN * HEXN; i++) {
        const p = pos(i)
        hexPath(p.x, p.y, R - 1.5)
        ctx.fillStyle = i === hv && !s.b[i] ? 'rgba(255,255,255,0.5)' : 'rgba(40,40,70,0.38)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'
        ctx.lineWidth = 1.5
        ctx.stroke()
        if (s.b[i]) {
          const gr = ease(grow.get(i) ?? 1)
          disc(h, p.x, p.y, (R - 4) * gr, s.b[i] === 1 ? 0 : 1, 18 * gr, 1, !!chain?.includes(i))
          if (i === s.last && s.w === -1) {
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(p.x, p.y, R - 2, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
      }
    },
    info: (_s, p) => (p === 0 ? 'top-bottom' : 'left-right'),
    outcome: () => 'Connected both sides',
  }
}

// ---------------------------------------------------------------- shell
interface Rect { x: number; y: number; w: number; h: number }
const engine: Engine = {
  start(env) {
    const hr = env.host.getBoundingClientRect()
    const portrait = hr.height > hr.width * 1.1
    const SW = portrait ? 560 : W
    const SH = portrait ? 1000 : H
    const K = portrait ? 0.88 : 1 // board-space scale
    const st = createStage(env.host, SW, SH)
    const ctx = st.ctx
    const bag = new Bag()
    const rp = pointer(st)
    // pointer in board space (hover, drag) – panel clicks use raw coordinates
    const ptr = { x: 0, y: 0, down: false, active: false }
    const syncPtr = () => {
      ptr.x = rp.x / K
      ptr.y = rp.y / K
      ptr.down = rp.down
      ptr.active = rp.active
    }
    const fx = new Particles()
    const shake = new Shake()
    const two = env.players === 2
    const t = env.theme
    const rng = env.rng
    let time = 0
    const h: Host = {
      env, ctx, t, ptr, fx, shake, rng, two, diff: env.difficulty, time: () => time,
      ch: [t.hero, t.foes.find((f) => f !== t.hero) ?? '👾'],
    }
    const id = pickMode(env.name, env.desc, env.mods)
    const make = (): Mode => {
      switch (id) {
        case 'chess': return session(h, chessSpec(h))
        case 'checkers': return session(h, checkersSpec(h))
        case 'connect': return session(h, connectSpec(h))
        case 'ttt': {
          const ult = env.difficulty === 2 || /ultimate|nested/i.test(`${env.name} ${env.desc}`)
          return session(h, tttSpec(h, ult) as Spec<TttState | UltState, number>)
        }
        case 'mancala': return session(h, mancalaSpec(h))
        case 'gomoku': return session(h, gomokuSpec(h))
        case 'dots': return session(h, dotsSpec(h))
        case 'nim': return session(h, nimSpec(h))
        case 'go': return session(h, goSpec(h))
        case 'hex': return session(h, hexSpec(h))
        default: return session(h, reversiSpec(h))
      }
    }
    const mode = make()
    const names: [string, string] = two ? ['Player 1', 'Player 2'] : ['You', 'Computer']
    let wait = 0.6
    let thinking = false
    let endAt = -1
    let finished = false
    let lastStatus = ''
    // panel layout
    const P: Rect = portrait ? { x: 10, y: 500, w: 540, h: 490 } : { x: PX, y: 14, w: W - PX - 14, h: H - 28 }
    const btn: Record<'new' | 'undo' | 'pass', Rect> = portrait
      ? { new: { x: P.x + 14, y: P.y + P.h - 66, w: 190, h: 52 }, undo: { x: P.x + 214, y: P.y + P.h - 66, w: 150, h: 52 }, pass: { x: P.x + 374, y: P.y + P.h - 66, w: 150, h: 52 } }
      : { new: { x: PX + 14, y: 476, w: 140, h: 38 }, undo: { x: PX + 164, y: 476, w: 92, h: 38 }, pass: { x: PX + 164, y: 430, w: 92, h: 38 } }
    const inB = (b: Rect, p: { x: number; y: number }) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h
    const inBoard = (x: number, y: number) => (portrait ? y < P.y - 4 : x < PX)
    const restart = () => {
      mode.reset()
      finished = false
      endAt = -1
      wait = 0.5
      thinking = false
      env.score(0)
    }
    rp.onDown((p) => {
      if (finished) return
      if (!inBoard(p.x, p.y)) {
        if (inB(btn.new, p)) restart()
        else if (inB(btn.undo, p) && !two) mode.undo()
        else if (inB(btn.pass, p) && mode.canPass()) mode.pass()
        return
      }
      mode.down(p.x / K, p.y / K)
    })
    rp.onUp((p) => {
      if (inBoard(p.x, p.y)) mode.up(p.x / K, p.y / K)
    })
    bag.on(window, 'keydown', (e) => {
      if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) restart()
      if ((e.code === 'KeyU' || e.code === 'Backspace') && !two) mode.undo()
    })

    const humanTurn = () => two || mode.turn() === 0

    const finish = () => {
      finished = true
      const r = mode.result()!
      const won = two ? r !== -1 : r === 0
      const base = r === -1 ? 400 : won ? 1000 : 100
      const score = Math.round(base * (1 + env.difficulty * 0.5) + mode.score())
      env.sfx(won ? 'win' : r === -1 ? 'click' : 'lose')
      const who = r === -1 ? 'Draw' : two ? `${names[r]} wins` : won ? 'You win' : 'You lose'
      env.score(score)
      env.end({ score, won: r === -1 ? false : won, text: `${who}. ${mode.outcome()}` })
    }

    const update = (dt: number) => {
      time += dt
      syncPtr()
      mode.update(dt)
      fx.update(dt)
      shake.update(dt)
      const res = mode.result()
      if (finished) return
      if (res !== null) {
        if (endAt < 0) {
          endAt = time + 1.5
          const w = res === -1 ? 'draw' : res === 0 ? 'win' : 'lose'
          for (let i = 0; i < 3; i++) fx.burst(300 + i * 60, 270, w === 'lose' ? t.danger : t.good, 30, 220, 4)
        } else if (time > endAt && !mode.busy()) finish()
        return
      }
      if (!humanTurn() && !mode.busy()) {
        wait -= dt
        if (wait <= 0) {
          if (!thinking) thinking = true
          else {
            thinking = false
            mode.aiMove()
            wait = 0.35
          }
        }
      } else thinking = false
      env.score(mode.score())
      const stt = `${mode.title} · ${mode.status() || (humanTurn() ? (two ? `${names[mode.turn()]}'s move` : 'Your move') : 'Thinking...')}`
      if (stt !== lastStatus) {
        lastStatus = stt
        env.status(stt)
      }
    }

    const draw = () => {
      background(ctx, SW, SH, t, 40, env.seed)
      ctx.save()
      ctx.scale(K, K)
      shake.apply(ctx)
      mode.draw()
      fx.draw(ctx)
      if (time < 2.4 && mode.result() === null) {
        ctx.globalAlpha = Math.min(1, (2.4 - time) * 1.5)
        roundRect(ctx, 80, 220, 480, 100, 14, 'rgba(8,10,20,0.88)', t.accent, 3)
        text(ctx, env.name.length > 26 ? mode.title : env.name, 320, 252, { size: 14, color: '#fff' })
        emoji(ctx, h.ch[0], 250, 292, 30)
        text(ctx, 'VS', 320, 292, { size: 12, color: t.accent })
        emoji(ctx, h.ch[1], 390, 292, 30)
        ctx.globalAlpha = 1
      }
      ctx.restore()
      // side / bottom panel
      roundRect(ctx, P.x, P.y, P.w, P.h, 14, dark, 'rgba(255,255,255,0.18)', 2)
      const cx = P.x + P.w / 2
      text(ctx, mode.title.toUpperCase(), cx, P.y + 26, { size: 14, color: t.accent, shadow: t.accent })
      const rule = mode.rule
      const lim = portrait ? 56 : 34
      const cut = rule.length > lim ? rule.lastIndexOf(' ', lim) : rule.length
      text(ctx, rule.slice(0, cut), cx, P.y + 48, { size: 8, color: 'rgba(255,255,255,0.7)' })
      if (cut < rule.length) text(ctx, rule.slice(cut).trim(), cx, P.y + 62, { size: 8, color: 'rgba(255,255,255,0.7)' })
      const res = mode.result()
      for (const p of [0, 1] as const) {
        const bw = portrait ? 258 : P.w - 24
        const bx = portrait ? P.x + 10 + p * 262 : P.x + 12
        const by = portrait ? P.y + 76 : P.y + 80 + p * 52
        const y = by + 22
        const active = res === null && mode.turn() === p
        roundRect(ctx, bx, by, bw, 44, 10, active ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.05)', active ? (p === 0 ? t.accent : t.accent2) : undefined, 2)
        emoji(ctx, h.ch[p], bx + 26, y, 26)
        text(ctx, names[p], bx + 52, y - 7, { size: 10, color: '#fff', align: 'left' })
        text(ctx, mode.info(p), bx + 52, y + 10, { size: 8, color: '#cfd8e3', align: 'left' })
        if (active) text(ctx, thinking || (!humanTurn() && wait < 0.3) ? '...' : '◀', bx + bw - 18, y, { size: 12, color: '#fff' })
      }
      const sline = res !== null ? (res === -1 ? 'Draw!' : two ? `${names[res]} wins!` : res === 0 ? 'You win!' : 'You lose!') : mode.status() || (humanTurn() ? (two ? `${names[mode.turn()]}'s move` : 'Your move') : 'Thinking...')
      text(ctx, sline, cx, portrait ? P.y + 150 : P.y + 212, { size: 11, color: res === null ? '#fff' : res === 1 && !two ? t.danger : t.good })
      // move list
      const ly = portrait ? P.y + 172 : 244
      const lh = portrait ? 220 : 178
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(P.x + 12, ly, P.w - 24, lh)
      const log = mode.log
      const rows = id === 'chess' ? Math.ceil(log.length / 2) : log.length
      const perCol = portrait ? 13 : 11
      const cols = portrait ? 3 : id === 'chess' ? 1 : 2
      const colW = portrait ? 172 : 136
      const startRow = Math.max(0, rows - perCol * cols)
      for (let r = startRow; r < rows; r++) {
        const idx = r - startRow
        const col = Math.floor(idx / perCol)
        const rowIn = idx % perCol
        const s2 = id === 'chess' ? `${r + 1}. ${log[r * 2]}${log[r * 2 + 1] ? '  ' + log[r * 2 + 1] : ''}` : `${r + 1}. ${log[r]}`
        text(ctx, s2, P.x + 22 + col * colW, ly + 14 + rowIn * 16, { size: 12, color: r === rows - 1 ? '#fff' : 'rgba(255,255,255,0.65)', align: 'left', font: 'ui-monospace, Menlo, Consolas, monospace', weight: 600 })
      }
      if (!log.length) text(ctx, 'moves appear here', cx, ly + lh / 2, { size: 9, color: 'rgba(255,255,255,0.35)' })
      const drawBtn = (b: Rect, label: string, on = true) => {
        const hov = on && !portrait && inB(b, rp)
        roundRect(ctx, b.x, b.y, b.w, b.h, 9, on ? (hov ? t.accent : 'rgba(255,255,255,0.14)') : 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.3)', 1.5)
        text(ctx, label, b.x + b.w / 2, b.y + b.h / 2, { size: 10, color: on ? (hov ? '#000' : '#fff') : 'rgba(255,255,255,0.3)' })
      }
      drawBtn(btn.new, 'NEW GAME')
      if (!two) drawBtn(btn.undo, 'UNDO', mode.log.length > 0 && res === null)
      if (id === 'go' || id === 'reversi') drawBtn(btn.pass, 'PASS', mode.canPass())
    }

    const lp = loop(update, draw)
    return {
      pause: (p) => lp.pause(p),
      destroy() {
        lp.stop()
        rp.dispose()
        bag.dispose()
        st.dispose()
      },
    }
  },
}
export default engine
