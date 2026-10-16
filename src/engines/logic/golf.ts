// Mini golf: hole generator and ball physics (pure, testable).
import type { Rng } from '../kit'

export interface Rect { x: number; y: number; w: number; h: number }
export interface Circle { x: number; y: number; r: number }
export interface Ramp extends Rect { dx: number; dy: number }
export interface Mover { base: Rect; ax: number; ay: number; speed: number; phase: number }
export interface Hole {
  w: number
  h: number
  bounds: Rect
  tee: { x: number; y: number }
  cup: Circle
  walls: Rect[]
  bumpers: Circle[]
  water: Rect[]
  sand: Rect[]
  ramps: Ramp[]
  tele: { a: { x: number; y: number }; b: { x: number; y: number } } | null
  movers: Mover[]
  par: number
}

export const BALL_R = 9
const WALL_T = 18

const overlap = (a: Rect, b: Rect, pad = 0) => a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y
const circleRect = (c: Circle, r: Rect, pad = 0) => {
  const nx = Math.max(r.x, Math.min(c.x, r.x + r.w))
  const ny = Math.max(r.y, Math.min(c.y, r.y + r.h))
  return (c.x - nx) ** 2 + (c.y - ny) ** 2 < (c.r + pad) ** 2
}

/** Is there a walkable path from tee to cup (walls, bumpers and water treated as blocked)? */
export function reachable(h: Hole, avoidWater = true): boolean {
  const cell = 10
  const cols = Math.ceil(h.w / cell)
  const rows = Math.ceil(h.h / cell)
  const blocked = (cx: number, cy: number) => {
    const c = { x: cx * cell + cell / 2, y: cy * cell + cell / 2, r: BALL_R }
    if (c.x < h.bounds.x + BALL_R || c.x > h.bounds.x + h.bounds.w - BALL_R || c.y < h.bounds.y + BALL_R || c.y > h.bounds.y + h.bounds.h - BALL_R) return true
    for (const w of h.walls) if (circleRect(c, w)) return true
    if (avoidWater) for (const w of h.water) if (circleRect(c, w)) return true
    for (const b of h.bumpers) if (Math.hypot(c.x - b.x, c.y - b.y) < b.r + BALL_R) return true
    return false
  }
  const key = (x: number, y: number) => y * cols + x
  const sx = Math.floor(h.tee.x / cell)
  const sy = Math.floor(h.tee.y / cell)
  const gx = Math.floor(h.cup.x / cell)
  const gy = Math.floor(h.cup.y / cell)
  const seen = new Uint8Array(cols * rows)
  const q = [key(sx, sy)]
  seen[q[0]] = 1
  for (let i = 0; i < q.length; i++) {
    const cx = q[i] % cols
    const cy = (q[i] / cols) | 0
    if (Math.abs(cx - gx) <= 1 && Math.abs(cy - gy) <= 1) return true
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx
      const ny = cy + dy
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || seen[key(nx, ny)] || blocked(nx, ny)) continue
      seen[key(nx, ny)] = 1
      q.push(key(nx, ny))
    }
  }
  return false
}

function transpose(h: Hole): Hole {
  const tr = (r: Rect): Rect => ({ x: r.y, y: r.x, w: r.h, h: r.w })
  const tp = (p: { x: number; y: number }) => ({ x: p.y, y: p.x })
  return {
    w: h.h, h: h.w, bounds: tr(h.bounds), tee: tp(h.tee), cup: { ...tp(h.cup), r: h.cup.r },
    walls: h.walls.map(tr), bumpers: h.bumpers.map((b) => ({ x: b.y, y: b.x, r: b.r })), water: h.water.map(tr), sand: h.sand.map(tr),
    ramps: h.ramps.map((r) => ({ ...tr(r), dx: r.dy, dy: r.dx })),
    tele: h.tele ? { a: tp(h.tele.a), b: tp(h.tele.b) } : null,
    movers: h.movers.map((m) => ({ base: tr(m.base), ax: m.ay, ay: m.ax, speed: m.speed, phase: m.phase })),
    par: h.par,
  }
}

/** Generate hole number `level` (1..9). Landscape fields run left→right, portrait fields bottom→top. */
export function genHole(rng: Rng, level: number, W: number, H: number, diff: 0 | 1 | 2 = 1): Hole {
  const portrait = H > W
  const w = portrait ? H : W
  const h = portrait ? W : H
  for (let attempt = 0; attempt < 40; attempt++) {
    const m = 26
    const bounds: Rect = { x: m, y: m, w: w - 2 * m, h: h - 2 * m }
    const hole: Hole = {
      w, h, bounds,
      tee: { x: bounds.x + 62, y: bounds.y + bounds.h / 2 + rng.range(-bounds.h / 4, bounds.h / 4) },
      cup: { x: bounds.x + bounds.w - 62, y: bounds.y + bounds.h / 2 + rng.range(-bounds.h / 4, bounds.h / 4), r: 15 - (diff === 2 ? 1.5 : diff === 0 ? -2 : 0) },
      walls: [], bumpers: [], water: [], sand: [], ramps: [], tele: null, movers: [], par: 2,
    }
    const nDiv = level <= 1 ? 0 : level <= 3 ? 1 : level <= 5 ? 2 : level <= 7 ? 3 : 4
    const span = hole.cup.x - hole.tee.x
    const gapH = Math.max(88, 150 - level * 6 - diff * 10)
    let dir = rng.chance(0.5) ? 1 : -1
    const divX: number[] = []
    for (let i = 0; i < nDiv; i++) {
      const x = hole.tee.x + (span * (i + 1)) / (nDiv + 1) - WALL_T / 2
      divX.push(x)
      const gc = dir > 0 ? rng.range(bounds.y + gapH / 2 + 10, bounds.y + bounds.h * 0.4) : rng.range(bounds.y + bounds.h * 0.6, bounds.y + bounds.h - gapH / 2 - 10)
      dir = -dir
      const top: Rect = { x, y: bounds.y, w: WALL_T, h: gc - gapH / 2 - bounds.y }
      const bot: Rect = { x, y: gc + gapH / 2, w: WALL_T, h: bounds.y + bounds.h - (gc + gapH / 2) }
      if (top.h > 4) hole.walls.push(top)
      if (bot.h > 4) hole.walls.push(bot)
    }
    // keep tee/cup clear of walls
    if (hole.walls.some((r) => circleRect({ x: hole.tee.x, y: hole.tee.y, r: 26 }, r) || circleRect({ x: hole.cup.x, y: hole.cup.y, r: 30 }, r))) continue
    // a few free-standing blocks for variety
    if (level >= 3 && rng.chance(0.7)) {
      const bw = rng.range(24, 40)
      const bh = rng.range(60, 110)
      const x = hole.tee.x + span * rng.range(0.15, 0.85)
      const r: Rect = { x, y: rng.range(bounds.y + 40, bounds.y + bounds.h - bh - 40), w: bw, h: bh }
      if (!hole.walls.some((q) => overlap(q, r, 50))) hole.walls.push(r)
    }
    const free = (r: Rect, pad = 24) =>
      !hole.walls.some((q) => overlap(q, r, pad)) && !hole.water.some((q) => overlap(q, r, pad)) && !hole.sand.some((q) => overlap(q, r, 6)) &&
      !hole.ramps.some((q) => overlap(q, r, 6)) && !hole.bumpers.some((q) => circleRect(q, r, pad)) &&
      !circleRect({ x: hole.tee.x, y: hole.tee.y, r: 40 }, r) && !circleRect({ x: hole.cup.x, y: hole.cup.y, r: 40 }, r) &&
      r.x > bounds.x + 10 && r.y > bounds.y + 10 && r.x + r.w < bounds.x + bounds.w - 10 && r.y + r.h < bounds.y + bounds.h - 10
    const place = (bw: number, bh: number, tries = 30): Rect | null => {
      for (let i = 0; i < tries; i++) {
        const r: Rect = { x: rng.range(bounds.x + 20, bounds.x + bounds.w - bw - 20), y: rng.range(bounds.y + 20, bounds.y + bounds.h - bh - 20), w: bw, h: bh }
        if (free(r)) return r
      }
      return null
    }
    const nb = level < 2 ? 0 : rng.int(1, 1 + Math.min(4, Math.floor(level / 2)))
    for (let i = 0; i < nb; i++) {
      const r = rng.range(16, 22)
      const p = place(r * 2, r * 2)
      if (p) hole.bumpers.push({ x: p.x + r, y: p.y + r, r })
    }
    if (level >= 3) for (let i = 0; i < rng.int(1, 2); i++) {
      const p = place(rng.range(80, 130), rng.range(50, 90))
      if (p) hole.sand.push(p)
    }
    if (level >= 4) {
      const p = place(rng.range(50, 80), rng.range(70, 120))
      if (p) {
        hole.water.push(p)
        if (!reachable(hole)) hole.water.pop()
      }
    }
    if (level >= 5) {
      const p = place(90, 50)
      if (p) {
        const d = rng.pick([[1, 0], [-1, 0], [0, 1], [0, -1]])
        hole.ramps.push({ ...p, dx: d[0], dy: d[1] })
      }
    }
    if (level >= 6 && rng.chance(0.8)) {
      const a = place(30, 30)
      const b = place(30, 30)
      if (a && b && b.x > a.x + 120) hole.tele = { a: { x: a.x + 15, y: a.y + 15 }, b: { x: b.x + 15, y: b.y + 15 } }
    }
    if (level >= 7 && divX.length) {
      const x = divX[0] + (divX.length > 1 ? (divX[1] - divX[0]) / 2 : 90)
      const r: Rect = { x, y: bounds.y + bounds.h / 2 - 40, w: 14, h: 80 }
      if (free(r, 10)) hole.movers.push({ base: r, ax: 0, ay: bounds.h / 2 - 70, speed: 0.9 + level * 0.08, phase: rng.range(0, 6) })
    }
    hole.par = Math.min(5, 2 + Math.floor((nDiv + (hole.water.length ? 1 : 0) + (hole.movers.length ? 1 : 0)) / 2))
    if (!reachable(hole)) continue
    return portrait ? transpose(hole) : hole
  }
  // fallback: straight empty hole
  const m = 26
  const hole: Hole = {
    w, h, bounds: { x: m, y: m, w: w - 2 * m, h: h - 2 * m }, tee: { x: m + 62, y: h / 2 }, cup: { x: w - m - 62, y: h / 2, r: 15 },
    walls: [], bumpers: [], water: [], sand: [], ramps: [], tele: null, movers: [], par: 2,
  }
  return portrait ? transpose(hole) : hole
}

export interface GBall { x: number; y: number; vx: number; vy: number; r: number; sunk: boolean; tele: number }
export type GEvent = 'wall' | 'bumper' | 'water' | 'sink' | 'tele' | 'sand'

export const moverRect = (m: Mover, t: number): Rect => {
  const s = Math.sin(t * m.speed + m.phase)
  return { x: m.base.x + m.ax * s, y: m.base.y + m.ay * s, w: m.base.w, h: m.base.h }
}

const inRect = (x: number, y: number, r: Rect) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h

/** Advance the ball by dt seconds. Returns the events that happened. */
export function stepGolf(h: Hole, b: GBall, dt: number, time: number, restitution = 0.8): GEvent[] {
  const ev: GEvent[] = []
  if (b.sunk) return ev
  const sp0 = Math.hypot(b.vx, b.vy)
  const n = Math.max(1, Math.ceil((sp0 * dt) / (b.r * 0.6)))
  const sdt = dt / n
  for (let i = 0; i < n; i++) {
    b.tele = Math.max(0, b.tele - sdt)
    // zones
    let decay = 0.9
    let inSand = false
    for (const s of h.sand) if (inRect(b.x, b.y, s)) {
      decay = 4.2
      inSand = true
    }
    for (const r of h.ramps) if (inRect(b.x, b.y, r)) {
      b.vx += r.dx * 620 * sdt
      b.vy += r.dy * 620 * sdt
    }
    if (inSand && !ev.includes('sand') && Math.hypot(b.vx, b.vy) > 30) ev.push('sand')
    const f = Math.exp(-decay * sdt)
    b.vx *= f
    b.vy *= f
    let sp = Math.hypot(b.vx, b.vy)
    if (sp > 0) {
      const ns = Math.max(0, sp - 26 * sdt)
      b.vx *= ns / sp
      b.vy *= ns / sp
      sp = ns
    }
    if (sp < 7 && !h.ramps.some((r) => inRect(b.x, b.y, r))) {
      b.vx = 0
      b.vy = 0
    }
    b.x += b.vx * sdt
    b.y += b.vy * sdt
    // bounds
    const bd = h.bounds
    if (b.x < bd.x + b.r) {
      b.x = bd.x + b.r
      b.vx = Math.abs(b.vx) * restitution
      ev.push('wall')
    } else if (b.x > bd.x + bd.w - b.r) {
      b.x = bd.x + bd.w - b.r
      b.vx = -Math.abs(b.vx) * restitution
      ev.push('wall')
    }
    if (b.y < bd.y + b.r) {
      b.y = bd.y + b.r
      b.vy = Math.abs(b.vy) * restitution
      ev.push('wall')
    } else if (b.y > bd.y + bd.h - b.r) {
      b.y = bd.y + bd.h - b.r
      b.vy = -Math.abs(b.vy) * restitution
      ev.push('wall')
    }
    const rects = h.walls.concat(h.movers.map((m) => moverRect(m, time)))
    for (const r of rects) {
      const nx = Math.max(r.x, Math.min(b.x, r.x + r.w))
      const ny = Math.max(r.y, Math.min(b.y, r.y + r.h))
      let dx = b.x - nx
      let dy = b.y - ny
      let d = Math.hypot(dx, dy)
      if (d >= b.r) continue
      if (d < 1e-6) {
        // centre inside: push out along the shallowest axis
        const l = b.x - r.x
        const rr = r.x + r.w - b.x
        const t = b.y - r.y
        const bt = r.y + r.h - b.y
        const m = Math.min(l, rr, t, bt)
        dx = m === l ? -1 : m === rr ? 1 : 0
        dy = m === t ? -1 : m === bt ? 1 : 0
        d = 0
        b.x += dx * (m + b.r)
        b.y += dy * (m + b.r)
      } else {
        dx /= d
        dy /= d
        b.x = nx + dx * b.r
        b.y = ny + dy * b.r
      }
      const vn = b.vx * dx + b.vy * dy
      if (vn < 0) {
        b.vx -= (1 + restitution) * vn * dx
        b.vy -= (1 + restitution) * vn * dy
        ev.push('wall')
      }
    }
    for (const bu of h.bumpers) {
      const dx = b.x - bu.x
      const dy = b.y - bu.y
      const d = Math.hypot(dx, dy)
      if (d >= b.r + bu.r || d === 0) continue
      const nx = dx / d
      const ny = dy / d
      b.x = bu.x + nx * (b.r + bu.r)
      b.y = bu.y + ny * (b.r + bu.r)
      const vn = b.vx * nx + b.vy * ny
      if (vn < 0) {
        b.vx -= 2 * vn * nx
        b.vy -= 2 * vn * ny
        const s = Math.hypot(b.vx, b.vy)
        const boost = Math.max(1.15, Math.min(1.6, 240 / Math.max(s, 1)))
        b.vx *= boost
        b.vy *= boost
        ev.push('bumper')
      }
    }
    for (const w of h.water) if (inRect(b.x, b.y, w)) {
      ev.push('water')
      return ev
    }
    if (h.tele && b.tele <= 0) {
      for (const [from, to] of [[h.tele.a, h.tele.b], [h.tele.b, h.tele.a]] as const) {
        if (Math.hypot(b.x - from.x, b.y - from.y) < 16) {
          b.x = to.x
          b.y = to.y
          b.tele = 0.7
          ev.push('tele')
          break
        }
      }
    }
    const dc = Math.hypot(b.x - h.cup.x, b.y - h.cup.y)
    const spn = Math.hypot(b.vx, b.vy)
    if (dc < h.cup.r - 2 && spn < 420) {
      b.sunk = true
      b.x = h.cup.x
      b.y = h.cup.y
      b.vx = b.vy = 0
      ev.push('sink')
      return ev
    }
    // gentle pull toward the cup when rolling slowly over it
    if (dc < h.cup.r + 3 && spn < 150 && dc > 0) {
      b.vx += ((h.cup.x - b.x) / dc) * 380 * sdt
      b.vy += ((h.cup.y - b.y) / dc) * 380 * sdt
    }
  }
  return ev
}

/** Simulate a shot to completion (no time limit on movers: they use `time`). Returns end state and events. */
export function simulate(h: Hole, x: number, y: number, vx: number, vy: number, maxSteps = 1200, t0 = 0): { b: GBall; events: GEvent[]; steps: number } {
  const b: GBall = { x, y, vx, vy, r: BALL_R, sunk: false, tele: 0 }
  const events: GEvent[] = []
  let steps = 0
  for (; steps < maxSteps; steps++) {
    const ev = stepGolf(h, b, 1 / 60, t0 + steps / 60)
    events.push(...ev)
    if (b.sunk || ev.includes('water')) break
    if (b.vx === 0 && b.vy === 0) break
  }
  return { b, events, steps }
}
