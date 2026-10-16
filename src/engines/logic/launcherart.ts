// Artillery duel helpers: destructible terrain, shell simulation and a simulation-based AI.
import type { Rng } from '../kit'

export interface Terrain { w: number; h: number; col: number; /** surface y (pixels from top) per column */ y: Float32Array }
export const CANNON_R = 20
export const GRAV = 420

export function genTerrain(rng: Rng, w: number, h: number, flat: number[], col = 4): Terrain {
  const n = Math.ceil(w / col) + 1
  const y = new Float32Array(n)
  const a1 = rng.range(30, 60)
  const a2 = rng.range(10, 25)
  const p1 = rng.range(0, 6.28)
  const p2 = rng.range(0, 6.28)
  const f1 = rng.range(0.006, 0.011)
  const f2 = rng.range(0.02, 0.035)
  for (let i = 0; i < n; i++) {
    const x = i * col
    y[i] = h * 0.72 + Math.sin(x * f1 + p1) * a1 + Math.sin(x * f2 + p2) * a2
  }
  // flatten the cannon platforms
  for (const fx of flat) {
    const base = y[Math.round(fx / col)]
    for (let i = 0; i < n; i++) {
      const d = Math.abs(i * col - fx)
      if (d < 46) y[i] = base
      else if (d < 90) {
        const k = (d - 46) / 44
        y[i] = base * (1 - k) + y[i] * k
      }
    }
  }
  return { w, h, col, y }
}
export function surfaceY(t: Terrain, x: number): number {
  const f = Math.max(0, Math.min(t.y.length - 1.001, x / t.col))
  const i = Math.floor(f)
  return t.y[i] + (t.y[i + 1] - t.y[i]) * (f - i)
}
/** Blast a crater: lowers the surface inside the circle. Returns the number of columns changed. */
export function carve(t: Terrain, cx: number, cy: number, r: number): number {
  let n = 0
  const i0 = Math.max(0, Math.floor((cx - r) / t.col))
  const i1 = Math.min(t.y.length - 1, Math.ceil((cx + r) / t.col))
  for (let i = i0; i <= i1; i++) {
    const dx = i * t.col - cx
    if (Math.abs(dx) >= r) continue
    const dy = Math.sqrt(r * r - dx * dx)
    const top = cy - dy
    const bottom = cy + dy
    if (t.y[i] >= top && t.y[i] < bottom) {
      t.y[i] = Math.min(t.h - 4, bottom)
      n++
    }
  }
  return n
}

export interface ShellHit { x: number; y: number; kind: 'ground' | 'cannon' | 'out'; cannon: number; t: number }
export function simShell(t: Terrain, cannons: { x: number; y: number }[], x: number, y: number, vx: number, vy: number, wind: number, maxT = 9, from = -1): ShellHit {
  const dt = 1 / 90
  let px = x
  let py = y
  let ux = vx
  let uy = vy
  for (let tm = 0; tm < maxT; tm += dt) {
    ux += wind * dt
    uy += GRAV * dt
    px += ux * dt
    py += uy * dt
    if (px < -20 || px > t.w + 20) return { x: px, y: py, kind: 'out', cannon: -1, t: tm }
    for (let i = 0; i < cannons.length; i++) {
      if (i === from && tm < 0.35) continue
      if (Math.hypot(px - cannons[i].x, py - cannons[i].y) < CANNON_R) return { x: px, y: py, kind: 'cannon', cannon: i, t: tm }
    }
    if (px >= 0 && py >= surfaceY(t, px)) return { x: px, y: surfaceY(t, px), kind: 'ground', cannon: -1, t: tm }
    if (py > t.h + 60) return { x: px, y: py, kind: 'out', cannon: -1, t: tm }
  }
  return { x: px, y: py, kind: 'out', cannon: -1, t: maxT }
}

export interface AimResult { angle: number; speed: number }
/** Search (angle, speed) for the muzzle at (x, y) firing at targetX, then add difficulty-based error. */
export function aiAim(t: Terrain, cannons: { x: number; y: number }[], me: number, wind: number, diff: 0 | 1 | 2, rnd: () => number): AimResult {
  const m = cannons[me]
  const target = cannons[me === 0 ? 1 : 0]
  const dir = target.x > m.x ? 1 : -1
  let best: AimResult = { angle: 0.8, speed: 500 }
  let bestD = Infinity
  for (let ang = 0.25; ang < 1.45; ang += 0.035) {
    for (let sp = 180; sp <= 900; sp += 20) {
      const vx = Math.cos(ang) * sp * dir
      const vy = -Math.sin(ang) * sp
      const h = simShell(t, cannons, m.x, m.y - 14, vx, vy, wind, 9, me)
      const d = Math.hypot(h.x - target.x, h.y - target.y) + (h.kind === 'out' ? 400 : 0)
      if (d < bestD) {
        bestD = d
        best = { angle: ang, speed: sp }
      }
    }
  }
  const g = () => rnd() + rnd() + rnd() - 1.5
  const ea = [0.12, 0.06, 0.02][diff]
  const es = [0.1, 0.05, 0.015][diff]
  return { angle: Math.max(0.1, Math.min(1.5, best.angle + g() * ea)), speed: Math.max(120, best.speed * (1 + g() * es)) }
}
