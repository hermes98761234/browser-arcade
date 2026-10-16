// Racer track generators: OutRun-style segment roads (curves + hills) and closed top-down circuits.
import type { Rng } from '../kit'

export const SEG = 200

export interface Road {
  n: number
  /** Curvature per segment. */
  curve: number[]
  /** World height at the start of each segment (index n wraps to 0). */
  y: number[]
}

const easeIn = (a: number, b: number, p: number) => a + (b - a) * p * p
const easeInOut = (a: number, b: number, p: number) => a + (b - a) * (-Math.cos(p * Math.PI) / 2 + 0.5)

export function buildRoad(rng: Rng, o: { segments: number; curvy: number; hilly: number }): Road {
  const curve: number[] = []
  const y: number[] = []
  const add = (c: number, yy: number) => {
    curve.push(c)
    y.push(yy)
  }
  const lastY = () => (y.length ? y[y.length - 1] : 0)
  const section = (enter: number, hold: number, leave: number, c: number, h: number) => {
    const startY = lastY()
    const endY = startY + h * SEG
    const total = enter + hold + leave
    for (let i = 0; i < enter; i++) add(easeIn(0, c, i / enter), easeInOut(startY, endY, i / total))
    for (let i = 0; i < hold; i++) add(c, easeInOut(startY, endY, (enter + i) / total))
    for (let i = 0; i < leave; i++) add(easeInOut(c, 0, i / leave), easeInOut(startY, endY, (enter + hold + i) / total))
  }
  section(25, 25, 25, 0, 0)
  while (curve.length < o.segments - 320) {
    const r = rng()
    const dir = rng.chance(0.5) ? 1 : -1
    const len = rng.int(20, 45)
    if (r < 0.2) section(len, len, len, 0, 0)
    else if (r < 0.55) section(len, len * 2, len, dir * rng.range(1, 2 + 3 * o.curvy), rng.chance(o.hilly) ? rng.range(-20, 30) : 0)
    else if (r < 0.7) {
      section(len, len, len, dir * rng.range(2, 2 + 2 * o.curvy), 0)
      section(len, len, len, -dir * rng.range(2, 2 + 2 * o.curvy), 0)
    } else if (r < 0.9) section(len, len, len, 0, rng.range(20, 20 + 40 * o.hilly) * (rng.chance(0.5) ? 1 : -0.6))
    else {
      section(len, len, len, dir * rng.range(1, 3), rng.range(10, 40))
      section(len, len, len, 0, -rng.range(10, 40))
    }
  }
  // return to the starting height so the lap loops seamlessly, then settle on a straight
  const h = -lastY() / SEG
  section(40, 40, 40, 0, h)
  while (curve.length < o.segments) add(0, 0)
  y[y.length - 1] = 0
  return { n: curve.length, curve, y }
}

export interface TopTrack {
  pts: { x: number; y: number }[]
  /** Half road width. */
  hw: number
}

/** A closed star-shaped circuit (single-valued radius around the centre, so it never self-intersects). */
export function buildTopTrack(rng: Rng, o: { radius: number; wobble: number; hw: number; samples?: number }): TopTrack {
  const n = o.samples ?? 220
  const harm = [2, 3, 4].map((k) => ({ k, a: rng.range(0.4, 1) / k, p: rng.range(0, 6.28) }))
  const sx = rng.range(1.15, 1.5)
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    let r = 1
    for (const h of harm) r += o.wobble * h.a * Math.sin(h.k * a + h.p)
    r = Math.max(0.55, r)
    pts.push({ x: Math.cos(a) * r * o.radius * sx, y: Math.sin(a) * r * o.radius })
  }
  return { pts, hw: o.hw }
}

/** Smallest distance between points whose index gap is large: must exceed twice the road width. */
export function minClearance(t: TopTrack): number {
  const n = t.pts.length
  let m = 1e9
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const gap = Math.min(j - i, n - (j - i))
      if (gap < 30) continue
      m = Math.min(m, Math.hypot(t.pts[i].x - t.pts[j].x, t.pts[i].y - t.pts[j].y))
    }
  return m
}
