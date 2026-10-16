// Pure logic for the flappy engine: gap schedule, lander terrain and landing rules.
import type { Rng } from '../kit'

/** Next gap centre: random but always reachable from the previous one. */
export function nextGapY(rng: Rng, prev: number, gap: number, top: number, bottom: number, maxStep: number): number {
  const lo = Math.max(top + gap / 2, prev - maxStep)
  const hi = Math.min(bottom - gap / 2, prev + maxStep)
  return lo >= hi ? (lo + hi) / 2 : rng.range(lo, hi)
}

/** Gap size for the n-th obstacle. */
export const gapSize = (n: number, base: number, min: number) => Math.max(min, base - n * 1.6)

export interface Pad { x0: number; x1: number; mult: number }
export interface Terrain { step: number; ys: number[]; pads: Pad[] }

/** Terrain heights (y from top) sampled every `step` px across width w, with flat landing pads. */
export function genTerrain(rng: Rng, w: number, h: number, level: number): Terrain {
  const step = 10
  const n = Math.ceil(w / step) + 1
  const ys: number[] = []
  let y = h * rng.range(0.7, 0.85)
  const rough = 6 + level * 3
  for (let i = 0; i < n; i++) {
    y = Math.min(h * 0.92, Math.max(h * 0.55, y + rng.range(-rough, rough)))
    ys.push(y)
  }
  const nPads = Math.max(1, 3 - Math.floor(level / 2))
  const padW = Math.max(4, 9 - level)
  const pads: Pad[] = []
  const seg = Math.floor((n - 2) / nPads)
  for (let p = 0; p < nPads; p++) {
    const i0 = p * seg + rng.int(2, Math.max(2, seg - padW - 2))
    const lvl = ys[i0]
    for (let i = i0; i <= i0 + padW && i < n; i++) ys[i] = lvl
    pads.push({ x0: i0 * step, x1: (i0 + padW) * step, mult: padW <= 5 ? 5 : padW <= 7 ? 3 : 2 })
  }
  return { step, ys, pads }
}

export const terrainY = (t: Terrain, x: number) => {
  const f = Math.max(0, x) / t.step
  const i = Math.min(t.ys.length - 2, Math.floor(f))
  return t.ys[i] + (t.ys[i + 1] - t.ys[i]) * (f - i)
}

export function landingOk(vx: number, vy: number, angle: number, diff: 0 | 1 | 2): boolean {
  const k = [1.3, 1, 0.8][diff]
  return Math.abs(vy) < 48 * k && Math.abs(vx) < 32 * k && Math.abs(angle) < 0.3 * k + 0.05
}
