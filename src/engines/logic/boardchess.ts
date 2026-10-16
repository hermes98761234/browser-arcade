// Chess rules + alpha-beta AI. Squares are 0..63 with 0 = a8 and 63 = h1 (row 0 is rank 8).
// Pieces: 1 P, 2 N, 3 B, 4 R, 5 Q, 6 K; white positive, black negative.

export const P = 1, N = 2, B = 3, R = 4, Q = 5, K = 6
export interface ChessState {
  b: Int8Array
  side: 1 | -1
  /** bits: 1 white O-O, 2 white O-O-O, 4 black O-O, 8 black O-O-O */
  castle: number
  /** en-passant target square or -1 */
  ep: number
  half: number
  full: number
}
export interface ChessMove {
  from: number
  to: number
  /** promotion piece type (2..5) or 0 */
  promo: number
  /** 0 normal, 1 double push, 2 en passant, 3 castling */
  flag: number
}

const BACK = [R, N, B, Q, K, B, N, R]
export function startState(): ChessState {
  const b = new Int8Array(64)
  for (let c = 0; c < 8; c++) {
    b[c] = -BACK[c]
    b[8 + c] = -P
    b[48 + c] = P
    b[56 + c] = BACK[c]
  }
  return { b, side: 1, castle: 15, ep: -1, half: 0, full: 1 }
}

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]
const KN: number[][] = []
const KG: number[][] = []
const RAYS: number[][][] = []
for (let sq = 0; sq < 64; sq++) {
  const r = sq >> 3
  const c = sq & 7
  KN[sq] = []
  KG[sq] = []
  for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
    const rr = r + dr
    const cc = c + dc
    if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) KN[sq].push(rr * 8 + cc)
  }
  RAYS[sq] = DIRS.map(([dr, dc]) => {
    const ray: number[] = []
    for (let rr = r + dr, cc = c + dc; rr >= 0 && rr < 8 && cc >= 0 && cc < 8; rr += dr, cc += dc) ray.push(rr * 8 + cc)
    return ray
  })
  for (const ray of RAYS[sq]) if (ray.length) KG[sq].push(ray[0])
}

export function isAttacked(b: Int8Array, sq: number, by: 1 | -1): boolean {
  const r = sq >> 3
  const c = sq & 7
  // pawns: a white pawn attacks up (decreasing row), so a white attacker sits on row+1
  const pr = by === 1 ? r + 1 : r - 1
  if (pr >= 0 && pr < 8) {
    if (c > 0 && b[pr * 8 + c - 1] === by * P) return true
    if (c < 7 && b[pr * 8 + c + 1] === by * P) return true
  }
  for (const t of KN[sq]) if (b[t] === by * N) return true
  for (const t of KG[sq]) if (b[t] === by * K) return true
  const rays = RAYS[sq]
  for (let d = 0; d < 8; d++) {
    const straight = d < 4
    for (const t of rays[d]) {
      const v = b[t]
      if (v === 0) continue
      if (v * by > 0) {
        const a = Math.abs(v)
        if (a === Q || (straight ? a === R : a === B)) return true
      }
      break
    }
  }
  return false
}

export function kingSquare(b: Int8Array, side: 1 | -1): number {
  return b.indexOf(side * K)
}
export function inCheck(s: ChessState, side: 1 | -1 = s.side): boolean {
  const k = kingSquare(s.b, side)
  return k >= 0 && isAttacked(s.b, k, (-side) as 1 | -1)
}

function pseudo(s: ChessState, capsOnly = false): ChessMove[] {
  const out: ChessMove[] = []
  const { b, side } = s
  const push = (from: number, to: number, promo = 0, flag = 0) => out.push({ from, to, promo, flag })
  for (let sq = 0; sq < 64; sq++) {
    const v = b[sq]
    if (v === 0 || v * side < 0) continue
    const a = Math.abs(v)
    const r = sq >> 3
    const c = sq & 7
    if (a === P) {
      const dr = -side
      const nr = r + dr
      const last = nr === 0 || nr === 7
      const addP = (to: number, flag = 0) => {
        if (last) for (const p of [Q, R, B, N]) push(sq, to, p, flag)
        else push(sq, to, 0, flag)
      }
      if (!capsOnly || last) {
        if (b[nr * 8 + c] === 0) {
          addP(nr * 8 + c)
          const start = side === 1 ? 6 : 1
          if (!capsOnly && r === start && b[(r + 2 * dr) * 8 + c] === 0) push(sq, (r + 2 * dr) * 8 + c, 0, 1)
        }
      }
      for (const dc of [-1, 1]) {
        const cc = c + dc
        if (cc < 0 || cc > 7) continue
        const t = nr * 8 + cc
        if (b[t] * side < 0) addP(t)
        else if (t === s.ep) push(sq, t, 0, 2)
      }
    } else if (a === N || a === K) {
      for (const t of a === N ? KN[sq] : KG[sq]) {
        if (b[t] * side > 0) continue
        if (capsOnly && b[t] === 0) continue
        push(sq, t)
      }
      if (a === K && !capsOnly) {
        const home = side === 1 ? 60 : 4
        if (sq === home && !isAttacked(b, sq, (-side) as 1 | -1)) {
          const ks = side === 1 ? 1 : 4
          const qs = side === 1 ? 2 : 8
          if ((s.castle & ks) && b[home + 1] === 0 && b[home + 2] === 0 && b[home + 3] === side * R && !isAttacked(b, home + 1, (-side) as 1 | -1)) push(sq, home + 2, 0, 3)
          if ((s.castle & qs) && b[home - 1] === 0 && b[home - 2] === 0 && b[home - 3] === 0 && b[home - 4] === side * R && !isAttacked(b, home - 1, (-side) as 1 | -1)) push(sq, home - 2, 0, 3)
        }
      }
    } else {
      const rays = RAYS[sq]
      const from = a === B ? 4 : 0
      const to = a === R ? 4 : 8
      for (let d = from; d < to; d++) {
        for (const t of rays[d]) {
          const tv = b[t]
          if (tv * side > 0) break
          if (!capsOnly || tv !== 0) push(sq, t)
          if (tv !== 0) break
        }
      }
    }
  }
  return out
}

export function makeMove(s: ChessState, m: ChessMove): ChessState {
  const b = new Int8Array(s.b)
  const piece = b[m.from]
  const a = Math.abs(piece)
  const captured = b[m.to] !== 0 || m.flag === 2
  let castle = s.castle
  b[m.to] = m.promo ? s.side * m.promo : piece
  b[m.from] = 0
  if (m.flag === 2) b[m.to + s.side * 8] = 0
  if (m.flag === 3) {
    if (m.to > m.from) {
      b[m.from + 1] = b[m.from + 3]
      b[m.from + 3] = 0
    } else {
      b[m.from - 1] = b[m.from - 4]
      b[m.from - 4] = 0
    }
  }
  if (a === K) castle &= s.side === 1 ? ~3 : ~12
  for (const sq of [m.from, m.to]) {
    if (sq === 63) castle &= ~1
    else if (sq === 56) castle &= ~2
    else if (sq === 7) castle &= ~4
    else if (sq === 0) castle &= ~8
  }
  return {
    b,
    side: (-s.side) as 1 | -1,
    castle,
    ep: m.flag === 1 ? (m.from + m.to) >> 1 : -1,
    half: a === P || captured ? 0 : s.half + 1,
    full: s.full + (s.side === -1 ? 1 : 0),
  }
}

export function legalMoves(s: ChessState): ChessMove[] {
  const out: ChessMove[] = []
  for (const m of pseudo(s)) {
    const n = makeMove(s, m)
    if (!inCheck(n, s.side)) out.push(m)
  }
  return out
}

export function perft(s: ChessState, depth: number): number {
  if (depth === 0) return 1
  let n = 0
  for (const m of legalMoves(s)) n += depth === 1 ? 1 : perft(makeMove(s, m), depth - 1)
  return n
}

// ---------- FEN, SAN, status ----------
const LETTERS = ' PNBRQK'
export function fromFen(fen: string): ChessState {
  const [pos, side, cast, ep, half, full] = fen.split(' ')
  const b = new Int8Array(64)
  let i = 0
  for (const ch of pos) {
    if (ch === '/') continue
    if (ch >= '1' && ch <= '8') i += +ch
    else {
      const p = LETTERS.indexOf(ch.toUpperCase())
      b[i++] = ch === ch.toUpperCase() ? p : -p
    }
  }
  let castle = 0
  if (cast.includes('K')) castle |= 1
  if (cast.includes('Q')) castle |= 2
  if (cast.includes('k')) castle |= 4
  if (cast.includes('q')) castle |= 8
  return { b, side: side === 'w' ? 1 : -1, castle, ep: ep && ep !== '-' ? sqFromName(ep) : -1, half: +(half ?? 0), full: +(full ?? 1) }
}
export const sqName = (sq: number) => 'abcdefgh'[sq & 7] + (8 - (sq >> 3))
export const sqFromName = (n: string) => (8 - +n[1]) * 8 + 'abcdefgh'.indexOf(n[0])

export function toSAN(s: ChessState, m: ChessMove, legal = legalMoves(s)): string {
  const a = Math.abs(s.b[m.from])
  let out = ''
  if (m.flag === 3) out = m.to > m.from ? 'O-O' : 'O-O-O'
  else {
    const cap = s.b[m.to] !== 0 || m.flag === 2
    if (a === P) {
      if (cap) out += 'abcdefgh'[m.from & 7]
    } else {
      out += LETTERS[a]
      const others = legal.filter((o) => o.from !== m.from && o.to === m.to && Math.abs(s.b[o.from]) === a)
      if (others.length) {
        if (others.every((o) => (o.from & 7) !== (m.from & 7))) out += 'abcdefgh'[m.from & 7]
        else if (others.every((o) => (o.from >> 3) !== (m.from >> 3))) out += 8 - (m.from >> 3)
        else out += sqName(m.from)
      }
    }
    if (cap) out += 'x'
    out += sqName(m.to)
    if (m.promo) out += '=' + LETTERS[m.promo]
  }
  const n = makeMove(s, m)
  if (inCheck(n)) out += legalMoves(n).length ? '+' : '#'
  return out
}

export type ChessEnd = null | 'checkmate' | 'stalemate' | 'fifty' | 'material' | 'repetition'
export function insufficient(b: Int8Array): boolean {
  const minors: number[] = []
  for (let i = 0; i < 64; i++) {
    const a = Math.abs(b[i])
    if (a === P || a === R || a === Q) return false
    if (a === N || a === B) minors.push(a === B ? 100 + ((i >> 3) + (i & 7)) % 2 : 0)
  }
  if (minors.length <= 1) return true
  // only bishops on one colour
  return minors.every((m) => m === minors[0] && m >= 100)
}
export const posKey = (s: ChessState) => `${Array.from(s.b).join(',')}|${s.side}|${s.castle}|${s.ep}`
export function chessEnd(s: ChessState, seen: Map<string, number>, legal = legalMoves(s)): ChessEnd {
  if (!legal.length) return inCheck(s) ? 'checkmate' : 'stalemate'
  if (insufficient(s.b)) return 'material'
  if (s.half >= 100) return 'fifty'
  if ((seen.get(posKey(s)) ?? 0) >= 3) return 'repetition'
  return null
}

// ---------- AI ----------
const VAL = [0, 100, 320, 330, 500, 900, 0]
const PST: number[][] = [
  [],
  [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
  [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
  [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
  [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
  [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
]
const KING_END = [-50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50]

/** Static evaluation in centipawns from the side-to-move's perspective. */
export function evaluate(s: ChessState): number {
  let score = 0
  let material = 0
  for (let i = 0; i < 64; i++) {
    const a = Math.abs(s.b[i])
    if (a && a !== K && a !== P) material += VAL[a]
  }
  const endgame = material < 2600
  for (let i = 0; i < 64; i++) {
    const v = s.b[i]
    if (!v) continue
    const a = Math.abs(v)
    const white = v > 0
    const idx = white ? i : i ^ 56
    const table = a === K && endgame ? KING_END : PST[a]
    const val = VAL[a] + table[idx]
    score += white ? val : -val
  }
  return s.side === 1 ? score : -score
}

const MATE = 30000
interface Search { deadline: number; nodes: number; stop: boolean; killers: ChessMove[][] }

function orderScore(s: ChessState, m: ChessMove, killers?: ChessMove[]): number {
  const cap = Math.abs(s.b[m.to]) || (m.flag === 2 ? P : 0)
  let sc = 0
  if (cap) sc = 10000 + VAL[cap] * 10 - VAL[Math.abs(s.b[m.from])]
  if (m.promo) sc += 9000 + VAL[m.promo]
  if (!cap && killers && killers.some((k) => k.from === m.from && k.to === m.to)) sc += 5000
  return sc
}

function quiesce(s: ChessState, alpha: number, beta: number, se: Search, ply: number): number {
  const stand = evaluate(s)
  if (stand >= beta || ply > 6) return stand
  if (stand > alpha) alpha = stand
  const ms = pseudo(s, true).sort((a, b) => orderScore(s, b) - orderScore(s, a))
  for (const m of ms) {
    const n = makeMove(s, m)
    if (inCheck(n, s.side)) continue
    se.nodes++
    const v = -quiesce(n, -beta, -alpha, se, ply + 1)
    if (v >= beta) return v
    if (v > alpha) alpha = v
  }
  return alpha
}

function negamax(s: ChessState, depth: number, alpha: number, beta: number, se: Search, ply: number): number {
  if ((++se.nodes & 1023) === 0 && performance.now() > se.deadline) se.stop = true
  if (se.stop) return 0
  if (s.half >= 100) return 0
  const check = inCheck(s)
  if (depth <= 0 && !check) return quiesce(s, alpha, beta, se, 0)
  const ks = (se.killers[ply] ??= [])
  const ms = pseudo(s).sort((a, b) => orderScore(s, b, ks) - orderScore(s, a, ks))
  let legal = 0
  let best = -Infinity
  for (const m of ms) {
    const n = makeMove(s, m)
    if (inCheck(n, s.side)) continue
    legal++
    const v = -negamax(n, depth - 1, -beta, -alpha, se, ply + 1)
    if (se.stop) return 0
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) {
      if (!s.b[m.to]) {
        ks.unshift(m)
        ks.length = Math.min(ks.length, 2)
      }
      break
    }
  }
  if (!legal) return check ? -MATE + ply : 0
  return best
}

/** Iterative deepening alpha-beta. noise (centipawns) randomises the choice for weaker levels. */
export function bestMove(s: ChessState, opts: { depth: number; ms: number; noise?: number; rnd?: () => number }): ChessMove | null {
  const legal = legalMoves(s)
  if (!legal.length) return null
  if (legal.length === 1) return legal[0]
  const se: Search = { deadline: performance.now() + opts.ms, nodes: 0, stop: false, killers: [] }
  const rnd = opts.rnd ?? Math.random
  const noise = opts.noise ?? 0
  let best = legal[0]
  let scores = new Map<ChessMove, number>()
  legal.sort((a, b) => orderScore(s, b) - orderScore(s, a))
  for (let d = 1; d <= opts.depth; d++) {
    const cur = new Map<ChessMove, number>()
    let alpha = -Infinity
    let cb = legal[0]
    for (const m of legal) {
      const v = -negamax(makeMove(s, m), d - 1, -Infinity, noise ? Infinity : -alpha, se, 1)
      if (se.stop) break
      cur.set(m, v)
      if (v > alpha) {
        alpha = v
        cb = m
      }
    }
    if (se.stop) break
    best = cb
    scores = cur
    // search best first next iteration
    legal.sort((a, b) => (cur.get(b) ?? -1e9) - (cur.get(a) ?? -1e9))
    if (alpha > MATE - 50) break
  }
  if (noise && scores.size) {
    let top = -Infinity
    for (const v of scores.values()) top = Math.max(top, v)
    const pool = [...scores.entries()].filter(([, v]) => v >= top - noise)
    if (pool.length) best = pool[Math.floor(rnd() * pool.length)][0]
  }
  return best
}
