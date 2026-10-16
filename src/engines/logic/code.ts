// Lightbot-style programming puzzle logic: interpreter + solvable level generator.
import type { Rng } from '../kit'

export type Op = 'F' | 'L' | 'R' | 'J' | 'A' | 'P' | 'X2' | 'X3' | 'X4'
export type Prog = (Op | null)[]

export interface Level {
  w: number
  h: number
  /** Tile heights, index y*w+x. */
  heights: number[]
  /** Goal tile indices. */
  goals: number[]
  start: { x: number; y: number; dir: number }
  mainSlots: number
  p1Slots: number
  /** Blocks available in the palette. */
  ops: Op[]
  solution: { main: Op[]; p1: Op[] }
}

export interface Step {
  x: number
  y: number
  dir: number
  /** Height level of the tile the robot stands on. */
  z: number
  op: Op
  fn: 'M' | 'P'
  slot: number
  moved: boolean
  bump: boolean
  /** Goal index lit by this step, or -1. */
  lit: number
}

export interface RunResult {
  steps: Step[]
  lit: Set<number>
  solved: boolean
  bumps: number
  truncated: boolean
}

export const DX = [1, 0, -1, 0]
export const DY = [0, 1, 0, -1]
const MAX_STEPS = 400

/**
 * Execute a program. `fill` switches on lazy terrain (used by the generator): unset tiles (-1) are
 * assigned a height the first time the robot tries to enter them.
 */
export function run(level: Level, main: readonly (Op | null)[], p1: readonly (Op | null)[], fill?: (cur: number, jump: boolean) => number, goalSink?: Set<number>): RunResult {
  const { w, h, heights } = level
  let { x, y, dir } = level.start
  const goals = new Set(level.goals)
  const lit = new Set<number>()
  const steps: Step[] = []
  let bumps = 0
  let truncated = false

  const doOp = (op: Op, fn: 'M' | 'P', slot: number) => {
    if (steps.length >= MAX_STEPS) {
      truncated = true
      return
    }
    let moved = false
    let bump = false
    let litIdx = -1
    if (op === 'L') dir = (dir + 3) % 4
    else if (op === 'R') dir = (dir + 1) % 4
    else if (op === 'F' || op === 'J') {
      const nx = x + DX[dir]
      const ny = y + DY[dir]
      const cur = heights[y * w + x]
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) bump = true
      else {
        if (fill && heights[ny * w + nx] < 0) heights[ny * w + nx] = fill(cur, op === 'J')
        const d = heights[ny * w + nx] - cur
        if (op === 'F' ? d === 0 : Math.abs(d) === 1) {
          x = nx
          y = ny
          moved = true
        } else bump = true
      }
      if (bump) bumps++
    } else if (op === 'A') {
      const idx = y * w + x
      if (goalSink) {
        if (!(x === level.start.x && y === level.start.y) && !goalSink.has(idx)) {
          goalSink.add(idx)
          goals.add(idx)
        }
      }
      if (goals.has(idx) && !lit.has(idx)) {
        lit.add(idx)
        litIdx = idx
      }
    }
    steps.push({ x, y, dir, z: Math.max(0, heights[y * w + x]), op, fn, slot, moved, bump, lit: litIdx })
  }

  const exec = (prog: readonly (Op | null)[], fn: 'M' | 'P') => {
    for (let i = 0; i < prog.length && !truncated; i++) {
      const op = prog[i]
      if (!op) continue
      if (op[0] === 'X') {
        const n = Number(op.slice(1))
        let j = i + 1
        while (j < prog.length && !prog[j]) j++
        if (j >= prog.length) break
        const body = prog[j]!
        for (let r = 0; r < n && !truncated; r++) call(body, fn, j)
        i = j
      } else call(op, fn, i)
    }
  }
  const call = (op: Op, fn: 'M' | 'P', slot: number) => {
    if (op === 'P') {
      if (fn === 'M') exec(p1, 'P')
    } else if (op[0] !== 'X') doOp(op, fn, slot)
  }
  exec(main, 'M')
  return { steps, lit, solved: goals.size > 0 && lit.size === goals.size, bumps, truncated }
}

export interface Spec {
  w: number
  h: number
  gMin: number
  gMax: number
  heights: boolean
  rep: boolean
  p1: boolean
  mainLen: number
}

export interface GenOpts {
  /** 0 easy, 1 normal, 2 hard: extra slots beyond the minimum. */
  slack: number
  loopWords?: boolean
  funcWords?: boolean
}

export function specFor(n: number, o: GenOpts): Spec {
  const rep = n >= (o.loopWords ? 2 : 5)
  const p1 = n >= (o.funcWords ? 3 : 7)
  return {
    w: Math.min(8, 4 + Math.floor((n + 1) / 2)),
    h: Math.min(6, 4 + Math.floor(n / 3)),
    gMin: Math.min(5, 1 + Math.floor(n / 2)),
    gMax: Math.min(9, 2 + Math.floor((n * 2) / 3) + 1),
    heights: n >= 3,
    rep,
    p1,
    mainLen: Math.min(12, 4 + n),
  }
}

function randomProg(sp: Spec, rng: Rng): { main: Op[]; p1: Op[] } {
  const basic: Op[] = ['F', 'F', 'F', 'L', 'R', 'A']
  if (sp.heights) basic.push('J', 'J')
  const pick = (): Op => rng.pick(basic)
  let p1: Op[] = []
  if (sp.p1) {
    const len = rng.int(2, 3)
    p1 = [rng.pick<Op>(['F', 'F', 'J'].filter((o) => o !== 'J' || sp.heights) as Op[])]
    while (p1.length < len) p1.push(pick())
    if (!p1.includes('A')) p1[p1.length - 1] = 'A'
  }
  const main: Op[] = []
  let calls = 0
  while (main.length < sp.mainLen) {
    const r = rng()
    if (sp.p1 && r < 0.3) {
      main.push('P')
      calls++
    } else if (sp.rep && r < 0.5 && main.length + 2 <= sp.mainLen) {
      main.push(rng.pick<Op>(['X2', 'X3', 'X3', 'X4']))
      main.push(sp.p1 && rng.chance(0.25) ? 'P' : rng.pick<Op>(['F', 'F', 'A', 'L', 'R']))
    } else main.push(pick())
  }
  if (sp.p1 && calls < 2) {
    main[main.length - 1] = 'P'
    main[Math.max(0, main.length - 4)] = 'P'
  }
  return { main, p1 }
}

export function genLevel(n: number, o: GenOpts, rng: Rng): Level {
  const sp = specFor(n, o)
  const ops: Op[] = ['F', 'L', 'R', 'A']
  if (sp.heights) ops.push('J')
  if (sp.rep) ops.push('X2', 'X3', 'X4')
  if (sp.p1) ops.push('P')
  const maxH = sp.heights ? 2 : 0
  let best: Level | null = null
  for (let attempt = 0; attempt < 1500; attempt++) {
    const { main, p1 } = randomProg(sp, rng)
    const lvl: Level = {
      w: sp.w, h: sp.h, heights: new Array(sp.w * sp.h).fill(-1), goals: [],
      start: { x: rng.int(0, sp.w - 1), y: rng.int(0, sp.h - 1), dir: rng.int(0, 3) },
      mainSlots: 0, p1Slots: 0, ops, solution: { main, p1 },
    }
    lvl.heights[lvl.start.y * sp.w + lvl.start.x] = sp.heights ? rng.int(0, 1) : 0
    const sink = new Set<number>()
    const res = run(lvl, main, p1, (cur, jump) => (jump ? (cur <= 0 ? 1 : cur >= maxH ? cur - 1 : cur + (rng.chance(0.5) ? 1 : -1)) : cur), sink)
    if (res.bumps > 0 || res.truncated) continue
    const hasJ = res.steps.some((s) => s.op === 'J' && s.moved)
    const cells = new Set(res.steps.map((s) => s.y * sp.w + s.x))
    const goalsOk = sink.size >= sp.gMin && sink.size <= sp.gMax
    const good = goalsOk && cells.size >= Math.min(5, 2 + n) && (!sp.heights || n < 4 || hasJ) && (!sp.p1 || main.filter((m) => m === 'P').length >= 2)
    if (sink.size >= 1 && !best) best = finish(lvl, sink, rng, maxH, o.slack)
    if (good) return finish(lvl, sink, rng, maxH, o.slack)
  }
  if (best) return best
  // Trivial fallback: walk forward and light.
  const lvl: Level = {
    w: sp.w, h: sp.h, heights: new Array(sp.w * sp.h).fill(0), goals: [1], start: { x: 0, y: 0, dir: 0 },
    mainSlots: 2 + o.slack, p1Slots: sp.p1 ? 3 : 0, ops, solution: { main: ['F', 'A'], p1: [] },
  }
  return lvl
}

function finish(lvl: Level, sink: Set<number>, rng: Rng, maxH: number, slack: number): Level {
  for (let i = 0; i < lvl.heights.length; i++) if (lvl.heights[i] < 0) lvl.heights[i] = maxH && rng.chance(0.4) ? rng.int(0, maxH) : 0
  lvl.goals = [...sink]
  const usesP = lvl.solution.main.includes('P')
  lvl.mainSlots = lvl.solution.main.length + slack
  lvl.p1Slots = usesP ? lvl.solution.p1.length + slack : lvl.ops.includes('P') ? lvl.solution.p1.length + slack : 0
  return lvl
}
