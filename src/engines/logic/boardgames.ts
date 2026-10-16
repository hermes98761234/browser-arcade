// Rules and AI for the small board games of the "board" engine (everything except chess).
// Player 0 always moves first. States are immutable (apply returns a new state).

export interface Game<S, M> {
  init(): S
  turn(s: S): 0 | 1
  moves(s: S): M[]
  apply(s: S, m: M): S
  /** null while running, otherwise the winner (0 / 1) or -1 for a draw. */
  over(s: S): null | -1 | 0 | 1
  /** Heuristic from player 0's point of view (higher is better for player 0). */
  eval(s: S): number
}

const WIN = 1e6

/** Alpha-beta minimax over a Game. noise > 0 picks randomly among near-best moves (weaker play). */
export function searchMove<S, M>(g: Game<S, M>, s: S, depth: number, rnd: () => number, noise = 0, order?: (m: M) => number): M {
  const moves = g.moves(s)
  if (moves.length === 1) return moves[0]
  if (order) moves.sort((a, b) => order(b) - order(a))
  const me = g.turn(s)
  const val = (st: S, d: number, a: number, b: number): number => {
    const o = g.over(st)
    if (o !== null) return o === -1 ? 0 : o === 0 ? WIN + d : -WIN - d
    if (d <= 0) return g.eval(st)
    const t = g.turn(st)
    const ms = g.moves(st)
    if (order) ms.sort((x, y) => order(y) - order(x))
    if (t === 0) {
      let v = -Infinity
      for (const m of ms) {
        v = Math.max(v, val(g.apply(st, m), d - 1, a, b))
        a = Math.max(a, v)
        if (a >= b) break
      }
      return v
    }
    let v = Infinity
    for (const m of ms) {
      v = Math.min(v, val(g.apply(st, m), d - 1, a, b))
      b = Math.min(b, v)
      if (a >= b) break
    }
    return v
  }
  const scored: [M, number][] = []
  let best = me === 0 ? -Infinity : Infinity
  for (const m of moves) {
    const lo = noise ? -Infinity : me === 0 ? best : -Infinity
    const hi = noise ? Infinity : me === 0 ? Infinity : best
    const v = val(g.apply(s, m), depth - 1, lo, hi)
    scored.push([m, v])
    best = me === 0 ? Math.max(best, v) : Math.min(best, v)
  }
  const sign = me === 0 ? 1 : -1
  const top = Math.max(...scored.map(([, v]) => v * sign))
  const pool = scored.filter(([, v]) => v * sign >= top - noise - 1e-9)
  return pool[Math.floor(rnd() * pool.length)][0]
}

// ---------------------------------------------------------------- Reversi
export interface RevState { b: Int8Array; t: 0 | 1 }
const rdc = [-1, 0, 1, -1, 1, -1, 0, 1]
export function revFlips(b: Int8Array, i: number, who: number): number[] {
  if (b[i] !== 0) return []
  const out: number[] = []
  const r = i >> 3
  const c = i & 7
  for (let d = 0; d < 8; d++) {
    const dr = d < 3 ? -1 : d < 5 ? 0 : 1
    const line: number[] = []
    let rr = r + dr
    let cc = c + rdc[d]
    while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === -who) {
      line.push(rr * 8 + cc)
      rr += dr
      cc += rdc[d]
    }
    if (line.length && rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === who) out.push(...line)
  }
  return out
}
const revWho = (t: number) => (t === 0 ? 1 : -1)
const revList = (b: Int8Array, who: number) => {
  const out: number[] = []
  for (let i = 0; i < 64; i++) if (b[i] === 0 && revFlips(b, i, who).length) out.push(i)
  return out
}
const REVW = [
  100, -20, 10, 5, 5, 10, -20, 100, -20, -50, -2, -2, -2, -2, -50, -20, 10, -2, 1, 1, 1, 1, -2, 10, 5, -2, 1, 0, 0, 1, -2, 5,
  5, -2, 1, 0, 0, 1, -2, 5, 10, -2, 1, 1, 1, 1, -2, 10, -20, -50, -2, -2, -2, -2, -50, -20, 100, -20, 10, 5, 5, 10, -20, 100,
]
export const reversi: Game<RevState, number> = {
  init() {
    const b = new Int8Array(64)
    b[27] = b[36] = -1
    b[28] = b[35] = 1
    return { b, t: 0 }
  },
  turn: (s) => s.t,
  moves(s) {
    const m = revList(s.b, revWho(s.t))
    if (m.length) return m
    return revList(s.b, -revWho(s.t)).length ? [-1] : []
  },
  apply(s, m) {
    const b = new Int8Array(s.b)
    if (m >= 0) {
      const who = revWho(s.t)
      for (const f of revFlips(b, m, who)) b[f] = who
      b[m] = who
    }
    return { b, t: s.t === 0 ? 1 : 0 }
  },
  over(s) {
    if (revList(s.b, 1).length || revList(s.b, -1).length) return null
    const n = revCount(s.b)
    return n[0] === n[1] ? -1 : n[0] > n[1] ? 0 : 1
  },
  eval(s) {
    let v = 0
    let n = 0
    for (let i = 0; i < 64; i++) {
      v += s.b[i] * REVW[i]
      n += s.b[i] !== 0 ? 1 : 0
    }
    const mob = revList(s.b, 1).length - revList(s.b, -1).length
    return v + mob * 6 + (n > 54 ? (revCount(s.b)[0] - revCount(s.b)[1]) * 8 : 0)
  },
}
export const revCount = (b: Int8Array): [number, number] => {
  let a = 0
  let c = 0
  for (const v of b) {
    if (v === 1) a++
    else if (v === -1) c++
  }
  return [a, c]
}

// ---------------------------------------------------------------- Checkers (American)
// 1/2 = player 0 man/king (moves up), -1/-2 = player 1. Dark squares have (r+c) odd.
export interface ChkState { b: Int8Array; t: 0 | 1 }
export interface ChkMove { path: number[]; caps: number[] }
const chkWho = (t: number) => (t === 0 ? 1 : -1)
function chkJumps(b: Int8Array, from: number, who: number, king: boolean, caps: number[], path: number[], out: ChkMove[]) {
  const r = from >> 3
  const c = from & 7
  let any = false
  for (const dr of [-1, 1]) {
    if (!king && dr !== -who) continue
    for (const dc of [-1, 1]) {
      const mr = r + dr
      const mc = c + dc
      const lr = r + 2 * dr
      const lc = c + 2 * dc
      if (lr < 0 || lr > 7 || lc < 0 || lc > 7) continue
      const mid = mr * 8 + mc
      const land = lr * 8 + lc
      if (b[mid] * who >= 0 || caps.includes(mid)) continue
      // landing must be empty (the origin square counts as empty during the jump)
      if (b[land] !== 0 && land !== path[0]) continue
      any = true
      const crowned = !king && (lr === 0 || lr === 7)
      const nc = [...caps, mid]
      const np = [...path, land]
      if (crowned) out.push({ path: np, caps: nc })
      else chkJumps(b, land, who, king, nc, np, out)
    }
  }
  if (!any && caps.length) out.push({ path, caps })
}
export function chkMoves(s: ChkState): ChkMove[] {
  const who = chkWho(s.t)
  const jumps: ChkMove[] = []
  const steps: ChkMove[] = []
  for (let i = 0; i < 64; i++) {
    const v = s.b[i]
    if (v * who <= 0) continue
    const king = Math.abs(v) === 2
    chkJumps(s.b, i, who, king, [], [i], jumps)
    if (jumps.length) continue
    const r = i >> 3
    const c = i & 7
    for (const dr of [-1, 1]) {
      if (!king && dr !== -who) continue
      for (const dc of [-1, 1]) {
        const rr = r + dr
        const cc = c + dc
        if (rr < 0 || rr > 7 || cc < 0 || cc > 7 || s.b[rr * 8 + cc] !== 0) continue
        steps.push({ path: [i, rr * 8 + cc], caps: [] })
      }
    }
  }
  return jumps.length ? jumps : steps
}
export const checkers: Game<ChkState, ChkMove> = {
  init() {
    const b = new Int8Array(64)
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) b[r * 8 + c] = r < 3 ? -1 : r > 4 ? 1 : 0
    return { b, t: 0 }
  },
  turn: (s) => s.t,
  moves: chkMoves,
  apply(s, m) {
    const b = new Int8Array(s.b)
    const from = m.path[0]
    const to = m.path[m.path.length - 1]
    let v = b[from]
    b[from] = 0
    for (const c of m.caps) b[c] = 0
    const tr = to >> 3
    if (Math.abs(v) === 1 && (tr === 0 || tr === 7)) v = v * 2
    b[to] = v
    return { b, t: s.t === 0 ? 1 : 0 }
  },
  over(s) {
    return chkMoves(s).length ? null : s.t === 0 ? 1 : 0
  },
  eval(s) {
    let v = 0
    for (let i = 0; i < 64; i++) {
      const p = s.b[i]
      if (!p) continue
      const r = i >> 3
      const c = i & 7
      const a = Math.abs(p)
      const sign = p > 0 ? 1 : -1
      let x = a === 2 ? 170 : 100
      if (a === 1) x += (p > 0 ? 7 - r : r) * 4
      if (c === 0 || c === 7) x += 3
      if (a === 1 && (p > 0 ? r === 7 : r === 0)) x += 8
      v += sign * x
    }
    return v
  },
}

// ---------------------------------------------------------------- Connect Four
export const C4W = 7
export const C4H = 6
export interface C4State { b: Int8Array; t: 0 | 1; w: -1 | 0 | 1 | 2; last: number }
const C4WIN: number[][] = []
for (let r = 0; r < C4H; r++) {
  for (let c = 0; c < C4W; c++) {
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      const er = r + 3 * dr
      const ec = c + 3 * dc
      if (er < 0 || er >= C4H || ec < 0 || ec >= C4W) continue
      C4WIN.push([0, 1, 2, 3].map((k) => (r + k * dr) * C4W + c + k * dc))
    }
  }
}
export function c4Line(b: Int8Array): number[] | null {
  for (const w of C4WIN) {
    const v = b[w[0]]
    if (v && v === b[w[1]] && v === b[w[2]] && v === b[w[3]]) return w
  }
  return null
}
export const c4Drop = (b: Int8Array, col: number) => {
  for (let r = C4H - 1; r >= 0; r--) if (b[r * C4W + col] === 0) return r
  return -1
}
export const connect4: Game<C4State, number> = {
  init: () => ({ b: new Int8Array(C4W * C4H), t: 0, w: -1, last: -1 }),
  turn: (s) => s.t,
  moves(s) {
    if (s.w !== -1) return []
    return [3, 2, 4, 1, 5, 0, 6].filter((c) => s.b[c] === 0)
  },
  apply(s, col) {
    const b = new Int8Array(s.b)
    const r = c4Drop(b, col)
    b[r * C4W + col] = s.t === 0 ? 1 : -1
    const line = c4Line(b)
    const full = b.every((x) => x !== 0)
    return { b, t: s.t === 0 ? 1 : 0, w: line ? s.t : full ? 2 : -1, last: r * C4W + col }
  },
  over: (s) => (s.w === -1 ? null : s.w === 2 ? -1 : (s.w as 0 | 1)),
  eval(s) {
    let v = 0
    for (const w of C4WIN) {
      let a = 0
      let c = 0
      for (const i of w) {
        if (s.b[i] === 1) a++
        else if (s.b[i] === -1) c++
      }
      if (a && c) continue
      if (a) v += [0, 1, 6, 30][a] ?? 0
      if (c) v -= [0, 1, 6, 30][c] ?? 0
    }
    for (let r = 0; r < C4H; r++) v += s.b[r * C4W + 3] * 4
    return v
  },
}

// ---------------------------------------------------------------- Tic-tac-toe (classic + ultimate)
const LINES3 = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
export const winner3 = (b: ArrayLike<number>, off = 0): number => {
  for (const [a, c, d] of LINES3) {
    const v = b[off + a]
    if (v && v === b[off + c] && v === b[off + d]) return v
  }
  return 0
}
export interface TttState { b: Int8Array; t: 0 | 1 }
export const ttt: Game<TttState, number> = {
  init: () => ({ b: new Int8Array(9), t: 0 }),
  turn: (s) => s.t,
  moves: (s) => (winner3(s.b) ? [] : [4, 0, 2, 6, 8, 1, 3, 5, 7].filter((i) => !s.b[i])),
  apply(s, m) {
    const b = new Int8Array(s.b)
    b[m] = s.t === 0 ? 1 : -1
    return { b, t: s.t === 0 ? 1 : 0 }
  },
  over(s) {
    const w = winner3(s.b)
    if (w) return w === 1 ? 0 : 1
    return s.b.every((x) => x) ? -1 : null
  },
  eval: () => 0,
}

/** Ultimate: cell index = big * 9 + small. big[i]: 0 open, 1 / -1 won, 2 drawn. next = forced board or -1. */
export interface UltState { b: Int8Array; big: Int8Array; next: number; t: 0 | 1; w: -1 | 0 | 1 | 2 }
const bigWinner = (big: Int8Array) => {
  for (const [a, c, d] of LINES3) {
    const v = big[a]
    if ((v === 1 || v === -1) && v === big[c] && v === big[d]) return v
  }
  return 0
}
export const ultimate: Game<UltState, number> = {
  init: () => ({ b: new Int8Array(81), big: new Int8Array(9), next: -1, t: 0, w: -1 }),
  turn: (s) => s.t,
  moves(s) {
    if (s.w !== -1) return []
    const out: number[] = []
    for (let g = 0; g < 9; g++) {
      if (s.next !== -1 && s.next !== g) continue
      if (s.big[g]) continue
      for (let c = 0; c < 9; c++) if (!s.b[g * 9 + c]) out.push(g * 9 + c)
    }
    if (!out.length) {
      // forced board is closed/full: play anywhere open
      for (let g = 0; g < 9; g++) if (!s.big[g]) for (let c = 0; c < 9; c++) if (!s.b[g * 9 + c]) out.push(g * 9 + c)
    }
    return out
  },
  apply(s, m) {
    const b = new Int8Array(s.b)
    const big = new Int8Array(s.big)
    const g = (m / 9) | 0
    const c = m % 9
    const who = s.t === 0 ? 1 : -1
    b[m] = who
    if (!big[g]) {
      if (winner3(b, g * 9)) big[g] = who
      else if (!b.subarray(g * 9, g * 9 + 9).includes(0)) big[g] = 2
    }
    const bw = bigWinner(big)
    let w: -1 | 0 | 1 | 2 = -1
    if (bw) w = bw === 1 ? 0 : 1
    else if (big.every((x) => x)) {
      let a = 0
      for (const x of big) a += x === 1 ? 1 : x === -1 ? -1 : 0
      w = a === 0 ? 2 : a > 0 ? 0 : 1
    }
    const next = big[c] ? -1 : c
    return { b, big, next, t: s.t === 0 ? 1 : 0, w }
  },
  over: (s) => (s.w === -1 ? null : s.w === 2 ? -1 : (s.w as 0 | 1)),
  eval(s) {
    let v = 0
    for (let g = 0; g < 9; g++) {
      const w = s.big[g]
      if (w === 1 || w === -1) v += w * (g === 4 ? 60 : g % 2 === 0 ? 45 : 30)
      else if (!w) {
        for (const [a, c, d] of LINES3) {
          const x = [s.b[g * 9 + a], s.b[g * 9 + c], s.b[g * 9 + d]]
          const p = x.filter((q) => q === 1).length
          const o = x.filter((q) => q === -1).length
          if (p && !o) v += p * p
          if (o && !p) v -= o * o
        }
        if (s.b[g * 9 + 4] === 1) v += 2
        if (s.b[g * 9 + 4] === -1) v -= 2
      }
    }
    // meta-line potential
    for (const [a, c, d] of LINES3) {
      const x = [s.big[a], s.big[c], s.big[d]]
      const p = x.filter((q) => q === 1).length
      const o = x.filter((q) => q === -1).length
      if (p && !o) v += p * p * 12
      if (o && !p) v -= o * o * 12
    }
    return v
  },
}

// ---------------------------------------------------------------- Mancala (Kalah)
// Pits 0..5 belong to player 0 (store 6); pits 7..12 to player 1 (store 13). Sowing runs counter-clockwise.
export interface ManState { p: Int8Array; t: 0 | 1 }
export interface Sow { s: ManState; trail: number[]; extra: boolean; capture: number; captured: number }
export function sow(s: ManState, pit: number): Sow {
  const p = new Int8Array(s.p)
  const me = s.t
  const store = me === 0 ? 6 : 13
  const skip = me === 0 ? 13 : 6
  let n = p[pit]
  p[pit] = 0
  let i = pit
  const trail: number[] = []
  while (n > 0) {
    i = (i + 1) % 14
    if (i === skip) continue
    p[i]++
    trail.push(i)
    n--
  }
  let extra = i === store
  let capture = -1
  let captured = 0
  const mine = me === 0 ? i >= 0 && i <= 5 : i >= 7 && i <= 12
  if (mine && p[i] === 1 && p[12 - i] > 0) {
    captured = p[12 - i] + 1
    capture = i
    p[store] += captured
    p[i] = 0
    p[12 - i] = 0
  }
  let t: 0 | 1 = extra ? me : me === 0 ? 1 : 0
  // game end: a side is empty -> the other side banks its seeds
  const a = p.slice(0, 6).every((x) => x === 0)
  const c = p.slice(7, 13).every((x) => x === 0)
  if (a || c) {
    for (let k = 0; k < 6; k++) {
      p[6] += p[k]
      p[k] = 0
      p[13] += p[7 + k]
      p[7 + k] = 0
    }
    extra = false
    t = me === 0 ? 1 : 0
  }
  return { s: { p, t }, trail, extra, capture, captured }
}
export const mancala: Game<ManState, number> = {
  init() {
    const p = new Int8Array(14).fill(4)
    p[6] = p[13] = 0
    return { p, t: 0 }
  },
  turn: (s) => s.t,
  moves(s) {
    if (manOver(s) !== null) return []
    const out: number[] = []
    const base = s.t === 0 ? 0 : 7
    for (let i = 5; i >= 0; i--) if (s.p[base + i] > 0) out.push(base + i)
    return out
  },
  apply: (s, m) => sow(s, m).s,
  over: manOver,
  eval: (s) => s.p[6] - s.p[13] + (s.p.slice(0, 6).reduce((a, b) => a + b, 0) - s.p.slice(7, 13).reduce((a, b) => a + b, 0)) * 0.15,
}
function manOver(s: ManState): null | -1 | 0 | 1 {
  const a = s.p.slice(0, 6).every((x) => x === 0)
  const c = s.p.slice(7, 13).every((x) => x === 0)
  if (!a && !c) return null
  const x = s.p[6] + s.p.slice(0, 6).reduce((q, w) => q + w, 0)
  const y = s.p[13] + s.p.slice(7, 13).reduce((q, w) => q + w, 0)
  return x === y ? -1 : x > y ? 0 : 1
}

// ---------------------------------------------------------------- Gomoku
export const GN = 15
export interface GomState { b: Int8Array; t: 0 | 1; w: -1 | 0 | 1 | 2; n: number; last: number; line: number[] }
export function gomWin(b: Int8Array, i: number): number[] | null {
  const v = b[i]
  const r = (i / GN) | 0
  const c = i % GN
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const line = [i]
    for (const sgn of [1, -1]) {
      for (let k = 1; k < 5; k++) {
        const rr = r + dr * k * sgn
        const cc = c + dc * k * sgn
        if (rr < 0 || rr >= GN || cc < 0 || cc >= GN || b[rr * GN + cc] !== v) break
        line.push(rr * GN + cc)
      }
    }
    if (line.length >= 5) return line
  }
  return null
}
export const gomoku = {
  init: (): GomState => ({ b: new Int8Array(GN * GN), t: 0, w: -1, n: 0, last: -1, line: [] }),
  apply(s: GomState, m: number): GomState {
    const b = new Int8Array(s.b)
    b[m] = s.t === 0 ? 1 : -1
    const line = gomWin(b, m)
    return { b, t: s.t === 0 ? 1 : 0, w: line ? s.t : s.n + 1 >= GN * GN ? 2 : -1, n: s.n + 1, last: m, line: line ?? [] }
  },
}
function gomScore(b: Int8Array, i: number, who: number): number {
  const r = (i / GN) | 0
  const c = i % GN
  let total = 0
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    let cnt = 1
    let open = 0
    for (const sgn of [1, -1]) {
      let k = 1
      for (; k < 5; k++) {
        const rr = r + dr * k * sgn
        const cc = c + dc * k * sgn
        if (rr < 0 || rr >= GN || cc < 0 || cc >= GN || b[rr * GN + cc] !== who) break
        cnt++
      }
      const rr = r + dr * k * sgn
      const cc = c + dc * k * sgn
      if (rr >= 0 && rr < GN && cc >= 0 && cc < GN && b[rr * GN + cc] === 0) open++
    }
    if (cnt >= 5) total += 100000
    else if (cnt === 4) total += open === 2 ? 10000 : open === 1 ? 1500 : 0
    else if (cnt === 3) total += open === 2 ? 1200 : open === 1 ? 100 : 0
    else if (cnt === 2) total += open === 2 ? 100 : open === 1 ? 10 : 0
    else total += open
  }
  return total
}
export function gomokuAI(s: GomState, level: 0 | 1 | 2, rnd: () => number): number {
  const b = s.b
  if (s.n === 0) return ((GN / 2) | 0) * GN + ((GN / 2) | 0)
  const me = s.t === 0 ? 1 : -1
  const cand: [number, number][] = []
  for (let i = 0; i < b.length; i++) {
    if (b[i]) continue
    const r = (i / GN) | 0
    const c = i % GN
    let near = false
    for (let dr = -2; dr <= 2 && !near; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const rr = r + dr
        const cc = c + dc
        if (rr >= 0 && rr < GN && cc >= 0 && cc < GN && b[rr * GN + cc]) {
          near = true
          break
        }
      }
    }
    if (!near) continue
    const atk = gomScore(b, i, me)
    const def = gomScore(b, i, -me)
    const defW = level === 0 ? 0.7 : level === 1 ? 0.95 : 1.1
    const centre = 7 - Math.max(Math.abs(r - 7), Math.abs(c - 7))
    cand.push([i, atk + def * defW + centre + rnd() * (level === 0 ? 120 : 2)])
  }
  cand.sort((a, c) => c[1] - a[1])
  if (level === 0 && rnd() < 0.2) return cand[Math.min(cand.length - 1, 1 + Math.floor(rnd() * 3))][0]
  return cand[0][0]
}

// ---------------------------------------------------------------- Dots and boxes
export interface DotState { n: number; e: Uint8Array; box: Int8Array; t: 0 | 1; sc: [number, number] }
// Edges: horizontal (n+1 rows x n) first, then vertical (n rows x (n+1)).
export const dotH = (n: number) => (n + 1) * n
export const dotEdgeCount = (n: number) => 2 * n * (n + 1)
export function dotBoxEdges(n: number, bx: number): number[] {
  const r = (bx / n) | 0
  const c = bx % n
  return [r * n + c, (r + 1) * n + c, dotH(n) + r * (n + 1) + c, dotH(n) + r * (n + 1) + c + 1]
}
export const dots = (n: number): Game<DotState, number> => ({
  init: () => ({ n, e: new Uint8Array(dotEdgeCount(n)), box: new Int8Array(n * n).fill(-1), t: 0, sc: [0, 0] }),
  turn: (s) => s.t,
  moves(s) {
    const out: number[] = []
    for (let i = 0; i < s.e.length; i++) if (!s.e[i]) out.push(i)
    return out
  },
  apply(s, m) {
    const e = new Uint8Array(s.e)
    e[m] = 1
    const box = new Int8Array(s.box)
    const sc: [number, number] = [s.sc[0], s.sc[1]]
    let got = 0
    for (let bx = 0; bx < n * n; bx++) {
      if (box[bx] !== -1) continue
      if (dotBoxEdges(n, bx).every((x) => e[x])) {
        box[bx] = s.t
        sc[s.t]++
        got++
      }
    }
    return { n, e, box, t: got ? s.t : s.t === 0 ? 1 : 0, sc }
  },
  over: (s) => (s.sc[0] + s.sc[1] < n * n ? null : s.sc[0] === s.sc[1] ? -1 : s.sc[0] > s.sc[1] ? 0 : 1),
  eval: (s) => s.sc[0] - s.sc[1],
})
export function dotsAI(g: Game<DotState, number>, s: DotState, level: 0 | 1 | 2, rnd: () => number): number {
  const n = s.n
  const ms = g.moves(s)
  const completes = (m: number) => g.apply(s, m).t === s.t
  const takers = ms.filter(completes)
  if (takers.length && (level > 0 || rnd() < 0.8)) return takers[Math.floor(rnd() * takers.length)]
  if (level === 0 && rnd() < 0.35) return ms[Math.floor(rnd() * ms.length)]
  // safe moves: do not create a box with three sides
  const safe = ms.filter((m) => {
    const e = new Uint8Array(s.e)
    e[m] = 1
    for (let bx = 0; bx < n * n; bx++) {
      if (s.box[bx] !== -1) continue
      const c = dotBoxEdges(n, bx).reduce((a, x) => a + e[x], 0)
      if (c === 3) return false
    }
    return true
  })
  if (safe.length) return safe[Math.floor(rnd() * safe.length)]
  // sacrifice the smallest chain: simulate the opponent grabbing everything it can
  let best = ms[0]
  let bestLoss = Infinity
  for (const m of ms) {
    let st = g.apply(s, m)
    let loss = 0
    for (let guard = 0; guard < 64; guard++) {
      const t = g.moves(st).find((x) => g.apply(st, x).t === st.t && g.apply(st, x).sc[st.t] > st.sc[st.t])
      if (t === undefined || st.t === s.t) break
      st = g.apply(st, t)
      loss++
    }
    if (loss + rnd() * 0.4 < bestLoss) {
      bestLoss = loss + rnd() * 0.4
      best = m
    }
  }
  return best
}

// ---------------------------------------------------------------- Nim
export interface NimMove { h: number; take: number }
export interface NimState { heaps: number[]; t: 0 | 1; misere: boolean }
const nimMemo = new Map<string, boolean>()
/** True if the player to move wins (normal play: taking the last wins; misere: taking the last loses). */
function nimWins(heaps: number[], misere: boolean): boolean {
  const total = heaps.reduce((a, b) => a + b, 0)
  if (total === 0) return misere
  const key = `${misere ? 'm' : 'n'}${[...heaps].sort().join('.')}`
  const hit = nimMemo.get(key)
  if (hit !== undefined) return hit
  let win = false
  outer: for (let h = 0; h < heaps.length; h++) {
    for (let k = 1; k <= heaps[h]; k++) {
      const nh = [...heaps]
      nh[h] -= k
      if (!nimWins(nh, misere)) {
        win = true
        break outer
      }
    }
  }
  nimMemo.set(key, win)
  return win
}
export const nim = (heaps: number[], misere: boolean): Game<NimState, NimMove> => ({
  init: () => ({ heaps: [...heaps], t: 0, misere }),
  turn: (s) => s.t,
  moves(s) {
    const out: NimMove[] = []
    s.heaps.forEach((n, h) => {
      for (let k = 1; k <= n; k++) out.push({ h, take: k })
    })
    return out
  },
  apply(s, m) {
    const h = [...s.heaps]
    h[m.h] -= m.take
    return { heaps: h, t: s.t === 0 ? 1 : 0, misere: s.misere }
  },
  over(s) {
    if (s.heaps.some((x) => x > 0)) return null
    // the player who just moved took the last item
    const last = s.t === 0 ? 1 : 0
    return s.misere ? s.t : last
  },
  eval: () => 0,
})
export function nimAI(g: Game<NimState, NimMove>, s: NimState, level: 0 | 1 | 2, rnd: () => number): NimMove {
  const ms = g.moves(s)
  const good = ms.filter((m) => !nimWins(g.apply(s, m).heaps, s.misere))
  const blunder = level === 0 ? 0.55 : level === 1 ? 0.2 : 0
  if (good.length && rnd() >= blunder) return good[Math.floor(rnd() * good.length)]
  return ms[Math.floor(rnd() * ms.length)]
}
export const nimIsWinning = (s: NimState) => nimWins(s.heaps, s.misere)

// ---------------------------------------------------------------- Go (9x9, area scoring)
export const GO = 9
export interface GoState { b: Int8Array; t: 0 | 1; prev: string; passes: number; caps: [number, number]; last: number; n: number }
export const goInit = (): GoState => ({ b: new Int8Array(GO * GO), t: 0, prev: '', passes: 0, caps: [0, 0], last: -1, n: 0 })
const goNeighbors = (i: number) => {
  const r = (i / GO) | 0
  const c = i % GO
  const out: number[] = []
  if (r > 0) out.push(i - GO)
  if (r < GO - 1) out.push(i + GO)
  if (c > 0) out.push(i - 1)
  if (c < GO - 1) out.push(i + 1)
  return out
}
export function goGroup(b: Int8Array, i: number): { stones: number[]; libs: Set<number> } {
  const v = b[i]
  const stones = [i]
  const seen = new Set([i])
  const libs = new Set<number>()
  for (let k = 0; k < stones.length; k++) {
    for (const n of goNeighbors(stones[k])) {
      if (b[n] === 0) libs.add(n)
      else if (b[n] === v && !seen.has(n)) {
        seen.add(n)
        stones.push(n)
      }
    }
  }
  return { stones, libs }
}
/** Returns the new state, or null when the move is illegal (occupied, suicide, ko). Pass = -1. */
export function goPlay(s: GoState, m: number): GoState | null {
  const who = s.t === 0 ? 1 : -1
  if (m < 0) return { ...s, b: s.b, t: s.t === 0 ? 1 : 0, prev: s.b.join(''), passes: s.passes + 1, last: -1, n: s.n + 1 }
  if (s.b[m]) return null
  const b = new Int8Array(s.b)
  b[m] = who
  let cap = 0
  for (const n of goNeighbors(m)) {
    if (b[n] === -who) {
      const g = goGroup(b, n)
      if (g.libs.size === 0) {
        for (const x of g.stones) b[x] = 0
        cap += g.stones.length
      }
    }
  }
  if (goGroup(b, m).libs.size === 0) return null
  const key = b.join('')
  if (key === s.prev) return null
  const caps: [number, number] = [s.caps[0], s.caps[1]]
  caps[s.t] += cap
  return { b, t: s.t === 0 ? 1 : 0, prev: s.b.join(''), passes: 0, caps, last: m, n: s.n + 1 }
}
export function goLegal(s: GoState): number[] {
  const out: number[] = []
  for (let i = 0; i < GO * GO; i++) if (!s.b[i] && goPlay(s, i)) out.push(i)
  return out
}
export const GO_KOMI = 5.5
/** Area score: stones + surrounded empty regions. Returns [black, white] (white includes komi). */
export function goScore(b: Int8Array): { black: number; white: number; owner: Int8Array } {
  const owner = new Int8Array(b)
  let black = 0
  let white = 0
  const seen = new Set<number>()
  for (let i = 0; i < b.length; i++) {
    if (b[i] === 1) black++
    else if (b[i] === -1) white++
    else if (!seen.has(i)) {
      const region = [i]
      seen.add(i)
      let touchB = false
      let touchW = false
      for (let k = 0; k < region.length; k++) {
        for (const n of goNeighbors(region[k])) {
          if (b[n] === 1) touchB = true
          else if (b[n] === -1) touchW = true
          else if (!seen.has(n)) {
            seen.add(n)
            region.push(n)
          }
        }
      }
      const o = touchB && !touchW ? 1 : touchW && !touchB ? -1 : 0
      for (const x of region) owner[x] = o === 0 ? 0 : (2 * o) as number
      if (o === 1) black += region.length
      else if (o === -1) white += region.length
    }
  }
  return { black, white: white + GO_KOMI, owner }
}
/** Weak heuristic AI: captures, saves, atari, shape. Passes when nothing useful remains. */
export function goAI(s: GoState, level: 0 | 1 | 2, rnd: () => number): number {
  const who = s.t === 0 ? 1 : -1
  const legal = goLegal(s)
  if (!legal.length) return -1
  const scored: [number, number][] = []
  for (const m of legal) {
    const n = goPlay(s, m)!
    let sc = rnd() * (level === 0 ? 6 : 2)
    sc += (n.caps[s.t] - s.caps[s.t]) * 12
    // do not fill own eyes: all neighbours friendly and group stays large
    const nb = goNeighbors(m)
    const friendly = nb.filter((x) => s.b[x] === who).length
    if (friendly === nb.length) sc -= 30
    // own group liberties after the move
    const g = goGroup(n.b, m)
    if (g.libs.size === 1) sc -= 14
    sc += Math.min(g.libs.size, 4) * 0.8
    // atari on enemy groups, and saving own groups
    for (const x of nb) {
      if (n.b[x] === -who) {
        const eg = goGroup(n.b, x)
        if (eg.libs.size === 1) sc += 6 + eg.stones.length
        else if (eg.libs.size === 2) sc += 1.5
      }
      if (s.b[x] === who) {
        const og = goGroup(s.b, x)
        if (og.libs.size === 1) sc += 10 + og.stones.length * 2
      }
    }
    // prefer 3rd/4th line, centre early
    const r = (m / GO) | 0
    const c = m % GO
    const edge = Math.min(r, c, GO - 1 - r, GO - 1 - c)
    sc += edge === 0 ? -2.5 : edge === 1 ? 0.5 : 2
    if (s.n < 10) sc += 3 - Math.hypot(r - 4, c - 4) * 0.6
    scored.push([m, sc])
  }
  scored.sort((a, c) => c[1] - a[1])
  const best = scored[0]
  if (best[1] < 1 && s.n > 24) return -1
  if (s.passes >= 1) {
    // opponent passed: pass too when ahead
    const sc = goScore(s.b)
    if ((who === 1 ? sc.black - sc.white : sc.white - sc.black) > 0) return -1
  }
  return best[0]
}

// ---------------------------------------------------------------- Hex (rhombus board)
export const HEXN = 9
export interface HexState { b: Int8Array; t: 0 | 1; w: -1 | 0 | 1; last: number }
const hexNb = (i: number) => {
  const r = (i / HEXN) | 0
  const c = i % HEXN
  const out: number[] = []
  for (const [dr, dc] of [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0]]) {
    const rr = r + dr
    const cc = c + dc
    if (rr >= 0 && rr < HEXN && cc >= 0 && cc < HEXN) out.push(rr * HEXN + cc)
  }
  return out
}
/** Player 0 connects top and bottom, player 1 connects left and right. Returns the winning chain or null. */
export function hexChain(b: Int8Array, who: number): number[] | null {
  const prev = new Map<number, number>()
  const q: number[] = []
  for (let k = 0; k < HEXN; k++) {
    const i = who === 1 ? k : k * HEXN
    if (b[i] === who) {
      q.push(i)
      prev.set(i, -1)
    }
  }
  for (let h = 0; h < q.length; h++) {
    const i = q[h]
    const goal = who === 1 ? ((i / HEXN) | 0) === HEXN - 1 : i % HEXN === HEXN - 1
    if (goal) {
      const out = [i]
      for (let p = prev.get(i)!; p !== undefined && p !== -1; p = prev.get(p)!) out.push(p)
      return out
    }
    for (const n of hexNb(i)) if (b[n] === who && !prev.has(n)) {
      prev.set(n, i)
      q.push(n)
    }
  }
  return null
}
/** Cheapest number of empty cells still needed to connect (0-1 BFS style Dijkstra). */
function hexDist(b: Int8Array, who: number): number {
  const d = new Array<number>(HEXN * HEXN).fill(99)
  const q: number[] = []
  const cost = (i: number) => (b[i] === who ? 0 : b[i] === 0 ? 1 : 99)
  for (let k = 0; k < HEXN; k++) {
    const i = who === 1 ? k : k * HEXN
    d[i] = cost(i)
    q.push(i)
  }
  while (q.length) {
    let bi = 0
    for (let k = 1; k < q.length; k++) if (d[q[k]] < d[q[bi]]) bi = k
    const i = q.splice(bi, 1)[0]
    for (const n of hexNb(i)) {
      const nd = d[i] + cost(n)
      if (nd < d[n]) {
        d[n] = nd
        q.push(n)
      }
    }
  }
  let best = 99
  for (let k = 0; k < HEXN; k++) best = Math.min(best, d[who === 1 ? (HEXN - 1) * HEXN + k : k * HEXN + HEXN - 1])
  return best
}
export const hex: Game<HexState, number> = {
  init: () => ({ b: new Int8Array(HEXN * HEXN), t: 0, w: -1, last: -1 }),
  turn: (s) => s.t,
  moves(s) {
    if (s.w !== -1) return []
    const out: number[] = []
    for (let i = 0; i < s.b.length; i++) if (!s.b[i]) out.push(i)
    return out
  },
  apply(s, m) {
    const b = new Int8Array(s.b)
    const who = s.t === 0 ? 1 : -1
    b[m] = who
    return { b, t: s.t === 0 ? 1 : 0, w: hexChain(b, who) ? s.t : -1, last: m }
  },
  over: (s) => (s.w === -1 ? null : s.w),
  eval: (s) => hexDist(s.b, -1) - hexDist(s.b, 1),
}
