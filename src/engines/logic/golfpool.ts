// Circle physics for pool, bowling and curling, plus pool AI and bowling scoring (pure, testable).

export interface PBall {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  r: number
  m: number
  /** removed from play (pocketed / fell) */
  out: boolean
  /** free-form label: 'cue' | 'solid' | 'stripe' | 'eight' | 'nine' | 'pin' | 'stone' | 'ball' */
  kind: string
  num: number
  team: 0 | 1
  /** pins: knocked over */
  down: boolean
  /** per-ball friction override [k, c] */
  fr?: [number, number]
}
export interface Pocket { x: number; y: number; r: number }
export interface Arena {
  x: number
  y: number
  w: number
  h: number
  pockets: Pocket[]
  /** velocity kept after hitting a wall */
  wall: number
  /** ball-ball restitution */
  e: number
  /** exponential damping and constant deceleration (px/s^2) */
  k: number
  c: number
  /** if false, walls do not bounce (balls leaving are 'out' by the caller) */
  walls: boolean
}
export interface PEvents { hits: { a: number; b: number; speed: number }[]; cushions: number; pocketed: PBall[] }

export const mkBall = (id: number, x: number, y: number, r: number, kind: string, num = 0, m = 1, team: 0 | 1 = 0): PBall => ({ id, x, y, vx: 0, vy: 0, r, m, out: false, kind, num, team, down: false })

export function moving(balls: PBall[], eps = 6): boolean {
  for (const b of balls) if (!b.out && Math.hypot(b.vx, b.vy) > eps) return true
  return false
}

export function stepBalls(balls: PBall[], a: Arena, dt: number, ev: PEvents, skip?: (b: PBall) => boolean, ignorePair?: (p: PBall, q: PBall) => boolean): void {
  let vmax = 0
  for (const b of balls) if (!b.out) vmax = Math.max(vmax, Math.hypot(b.vx, b.vy))
  const minR = 9
  const n = Math.max(1, Math.ceil((vmax * dt) / (minR * 0.25)))
  const h = dt / n
  for (let s = 0; s < n; s++) {
    for (const b of balls) {
      if (b.out || (skip && skip(b))) continue
      let sp = Math.hypot(b.vx, b.vy)
      if (sp > 0) {
        const f = Math.exp(-(b.fr ? b.fr[0] : a.k) * h)
        sp = Math.max(0, sp * f - (b.fr ? b.fr[1] : a.c) * h)
        const old = Math.hypot(b.vx, b.vy)
        b.vx *= sp / old
        b.vy *= sp / old
        if (sp < 5) b.vx = b.vy = 0
      }
      b.x += b.vx * h
      b.y += b.vy * h
      // pockets
      let pocketed = false
      for (const p of a.pockets) {
        if (Math.hypot(b.x - p.x, b.y - p.y) < p.r) {
          b.out = true
          b.vx = b.vy = 0
          ev.pocketed.push(b)
          pocketed = true
          break
        }
      }
      if (pocketed) continue
      if (a.walls && !a.pockets.some((p) => Math.hypot(b.x - p.x, b.y - p.y) < p.r * 1.6)) {
        if (b.x < a.x + b.r) {
          b.x = a.x + b.r
          b.vx = Math.abs(b.vx) * a.wall
          ev.cushions++
        } else if (b.x > a.x + a.w - b.r) {
          b.x = a.x + a.w - b.r
          b.vx = -Math.abs(b.vx) * a.wall
          ev.cushions++
        }
        if (b.y < a.y + b.r) {
          b.y = a.y + b.r
          b.vy = Math.abs(b.vy) * a.wall
          ev.cushions++
        } else if (b.y > a.y + a.h - b.r) {
          b.y = a.y + a.h - b.r
          b.vy = -Math.abs(b.vy) * a.wall
          ev.cushions++
        }
      }
    }
    for (let i = 0; i < balls.length; i++) {
      const p = balls[i]
      if (p.out || (skip && skip(p))) continue
      for (let j = i + 1; j < balls.length; j++) {
        const q = balls[j]
        if (q.out || (skip && skip(q)) || (ignorePair && ignorePair(p, q))) continue
        const dx = q.x - p.x
        const dy = q.y - p.y
        const min = p.r + q.r
        const d2 = dx * dx + dy * dy
        if (d2 >= min * min || d2 === 0) continue
        const d = Math.sqrt(d2)
        const nx = dx / d
        const ny = dy / d
        const mt = p.m + q.m
        const pen = min - d
        p.x -= nx * pen * (q.m / mt)
        p.y -= ny * pen * (q.m / mt)
        q.x += nx * pen * (p.m / mt)
        q.y += ny * pen * (p.m / mt)
        const rv = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny
        if (rv < 0) {
          const jmp = (-(1 + a.e) * rv) / (1 / p.m + 1 / q.m)
          p.vx -= (jmp / p.m) * nx
          p.vy -= (jmp / p.m) * ny
          q.vx += (jmp / q.m) * nx
          q.vy += (jmp / q.m) * ny
          ev.hits.push({ a: p.id, b: q.id, speed: -rv })
        }
      }
    }
  }
}

// ---------------------------------------------------------------- shot planning (pool AI)
/** Distance a ball rolls from initial speed v0 under dv/dt = -k v - c. */
export function rollDistance(v0: number, k: number, c: number): number {
  if (v0 <= 0) return 0
  return v0 / k - (c / (k * k)) * Math.log(1 + (k * v0) / c)
}
/** Initial speed needed to roll exactly d pixels. */
export function speedForDistance(d: number, k: number, c: number): number {
  let lo = 0
  let hi = 6000
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (rollDistance(mid, k, c) < d) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
/** Speed left after rolling d pixels from v0 (0 if it stops earlier). */
export function speedAfter(v0: number, d: number, k: number, c: number): number {
  const rest = rollDistance(v0, k, c) - d
  return rest <= 0 ? 0 : speedForDistance(rest, k, c)
}

const segDist = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
  const dx = bx - ax
  const dy = by - ay
  const l2 = dx * dx + dy * dy
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

export interface Shot { angle: number; speed: number; target: number; pocket: number; score: number }
/** Pick the best pot among `targets` (ball ids). Returns null if no clean pot exists. */
export function planShot(balls: PBall[], a: Arena, cueId: number, targets: number[], maxSpeed = 1600): Shot | null {
  const cue = balls.find((b) => b.id === cueId)!
  const live = balls.filter((b) => !b.out)
  let best: Shot | null = null
  for (const tid of targets) {
    const t = live.find((b) => b.id === tid)
    if (!t) continue
    for (let pi = 0; pi < a.pockets.length; pi++) {
      const p = a.pockets[pi]
      const tx = p.x - t.x
      const ty = p.y - t.y
      const dTP = Math.hypot(tx, ty)
      if (dTP < 1) continue
      const ux = tx / dTP
      const uy = ty / dTP
      const gx = t.x - ux * (t.r + cue.r)
      const gy = t.y - uy * (t.r + cue.r)
      const cx = gx - cue.x
      const cy = gy - cue.y
      const dCG = Math.hypot(cx, cy)
      if (dCG < 1) continue
      const cos = (cx * ux + cy * uy) / dCG
      if (cos < 0.34) continue // cut too thin
      // cue path must be clear
      let clear = true
      for (const o of live) {
        if (o.id === cueId || o.id === tid) continue
        if (segDist(o.x, o.y, cue.x, cue.y, gx, gy) < o.r + cue.r - 1) clear = false
        if (segDist(o.x, o.y, t.x, t.y, p.x, p.y) < o.r + t.r - 1) clear = false
        if (!clear) break
      }
      if (!clear) continue
      // the pocket must be reachable: pocket centre not too close to a rail behind the ball
      const vObj = speedForDistance(dTP * 1.1 + 30, a.k, a.c)
      const vImpact = vObj / Math.max(cos, 0.4) / 0.95
      const v0 = Math.min(maxSpeed, speedForDistance(rollDistance(vImpact, a.k, a.c) + dCG, a.k, a.c))
      const score = cos * 600 - dCG - dTP * 1.2
      if (!best || score > best.score) best = { angle: Math.atan2(cy, cx), speed: v0, target: tid, pocket: pi, score }
    }
  }
  return best
}

// ---------------------------------------------------------------- bowling
/** Score a bowling game from a flat list of rolls. Returns per-frame running totals (null until known). */
export function bowlingScore(rolls: number[]): { frames: (number | null)[]; total: number } {
  const frames: (number | null)[] = []
  let i = 0
  let total = 0
  for (let f = 0; f < 10; f++) {
    const r1 = rolls[i]
    if (r1 === undefined) break
    if (r1 === 10) {
      const b1 = rolls[i + 1]
      const b2 = rolls[i + 2]
      if (b1 === undefined || b2 === undefined) {
        frames.push(null)
        i += 1
        continue
      }
      total += 10 + b1 + b2
      frames.push(total)
      i += 1
    } else {
      const r2 = rolls[i + 1]
      if (r2 === undefined) break
      if (r1 + r2 === 10) {
        const b = rolls[i + 2]
        if (b === undefined) {
          frames.push(null)
          i += 2
          continue
        }
        total += 10 + b
      } else total += r1 + r2
      frames.push(total)
      i += 2
    }
  }
  return { frames, total }
}
