// Pure helpers for the paint engine: flood fill, symmetry, falling-sand world, noise and spirograph maths.
import type { Rng } from '../kit'

// ---------- flood fill ----------

/** Scanline flood fill on RGBA data. Returns the number of filled pixels. */
export function floodFill(data: Uint8ClampedArray, w: number, h: number, sx: number, sy: number, rgba: readonly [number, number, number, number], tol = 40): number {
  sx = Math.floor(sx)
  sy = Math.floor(sy)
  if (sx < 0 || sy < 0 || sx >= w || sy >= h) return 0
  const i0 = (sy * w + sx) * 4
  const tr = data[i0]
  const tg = data[i0 + 1]
  const tb = data[i0 + 2]
  const ta = data[i0 + 3]
  if (Math.abs(tr - rgba[0]) < 2 && Math.abs(tg - rgba[1]) < 2 && Math.abs(tb - rgba[2]) < 2 && Math.abs(ta - rgba[3]) < 2) return 0
  const match = (i: number) => {
    const da = Math.abs(data[i + 3] - ta)
    if (da > tol) return false
    // Fully transparent pixels all look the same regardless of their (ignored) colour channels.
    if (ta < 8 && data[i + 3] < 8) return true
    return Math.abs(data[i] - tr) <= tol && Math.abs(data[i + 1] - tg) <= tol && Math.abs(data[i + 2] - tb) <= tol
  }
  const seen = new Uint8Array(w * h)
  const stack: number[] = [sx, sy]
  let n = 0
  while (stack.length) {
    const y = stack.pop()!
    let x = stack.pop()!
    while (x >= 0 && !seen[y * w + x] && match((y * w + x) * 4)) x--
    x++
    let up = false
    let down = false
    while (x < w && !seen[y * w + x] && match((y * w + x) * 4)) {
      const p = y * w + x
      seen[p] = 1
      const i = p * 4
      data[i] = rgba[0]
      data[i + 1] = rgba[1]
      data[i + 2] = rgba[2]
      data[i + 3] = rgba[3]
      n++
      if (y > 0) {
        const m = !seen[p - w] && match((p - w) * 4)
        if (m && !up) stack.push(x, y - 1)
        up = m
      }
      if (y < h - 1) {
        const m = !seen[p + w] && match((p + w) * 4)
        if (m && !down) stack.push(x, y + 1)
        down = m
      }
      x++
    }
  }
  return n
}

// ---------- symmetry ----------

export type SymMode = 'off' | 'mirror' | 'quad' | 'kaleido' | 'mandala'
export const SYM_ORDER: SymMode[] = ['off', 'mirror', 'quad', 'kaleido', 'mandala']
export interface SymT {
  rot: number
  flip: boolean
}

/** Rotation/reflection set applied around the canvas centre for each symmetry mode. */
export function symTransforms(mode: SymMode): SymT[] {
  const out: SymT[] = []
  const add = (n: number, flip: boolean) => {
    for (let k = 0; k < n; k++) {
      out.push({ rot: (k * Math.PI * 2) / n, flip: false })
      if (flip) out.push({ rot: (k * Math.PI * 2) / n, flip: true })
    }
  }
  if (mode === 'off') add(1, false)
  else if (mode === 'mirror') add(1, true)
  else if (mode === 'quad') add(2, true)
  else if (mode === 'kaleido') add(6, false)
  else add(8, true)
  return out
}

// ---------- falling sand ----------

export const E = 0
export const SAND = 1
export const WATER = 2
export const WALL = 3
export const FIRE = 4
export const WOOD = 5
export const SMOKE = 6

export class SandWorld {
  t: Uint8Array
  /** Colour index (palette) for sand and walls. */
  c: Uint8Array
  /** Life counter for fire/smoke, shade variant for the others. */
  l: Uint8Array
  private u: Uint8Array
  private flip = false
  w: number
  h: number
  constructor(w: number, h: number) {
    this.w = w
    this.h = h
    this.t = new Uint8Array(w * h)
    this.c = new Uint8Array(w * h)
    this.l = new Uint8Array(w * h)
    this.u = new Uint8Array(w * h)
  }
  clear() {
    this.t.fill(0)
    this.c.fill(0)
    this.l.fill(0)
  }
  set(x: number, y: number, type: number, col: number, rng: () => number) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return
    const i = y * this.w + x
    if (type !== E && this.t[i] !== E) return
    this.t[i] = type
    this.c[i] = col
    this.l[i] = type === FIRE ? 20 + Math.floor(rng() * 30) : type === SMOKE ? 25 + Math.floor(rng() * 25) : Math.floor(rng() * 4)
  }
  count(type: number): number {
    let n = 0
    for (let i = 0; i < this.t.length; i++) if (this.t[i] === type) n++
    return n
  }
  private swap(a: number, b: number) {
    const t = this.t[a]
    const c = this.c[a]
    const l = this.l[a]
    this.t[a] = this.t[b]
    this.c[a] = this.c[b]
    this.l[a] = this.l[b]
    this.t[b] = t
    this.c[b] = c
    this.l[b] = l
    this.u[a] = 1
    this.u[b] = 1
  }
  step(rng: () => number) {
    const { w, h, t, u } = this
    u.fill(0)
    this.flip = !this.flip
    for (let y = h - 1; y >= 0; y--) {
      for (let xi = 0; xi < w; xi++) {
        const x = this.flip ? xi : w - 1 - xi
        const i = y * w + x
        if (u[i]) continue
        const k = t[i]
        if (k === E || k === WALL || k === WOOD) continue
        const below = y < h - 1 ? i + w : -1
        const dir = rng() < 0.5 ? -1 : 1
        if (k === SAND) {
          if (below >= 0 && (t[below] === E || t[below] === WATER)) this.swap(i, below)
          else if (below >= 0) {
            const a = x + dir
            const b = x - dir
            if (a >= 0 && a < w && (t[below + dir] === E || t[below + dir] === WATER) && (t[i + dir] === E || t[i + dir] === WATER)) this.swap(i, below + dir)
            else if (b >= 0 && b < w && (t[below - dir] === E || t[below - dir] === WATER) && (t[i - dir] === E || t[i - dir] === WATER)) this.swap(i, below - dir)
          }
        } else if (k === WATER) {
          if (below >= 0 && t[below] === E) this.swap(i, below)
          else {
            const a = x + dir
            const b = x - dir
            if (below >= 0 && a >= 0 && a < w && t[below + dir] === E && t[i + dir] === E) this.swap(i, below + dir)
            else if (below >= 0 && b >= 0 && b < w && t[below - dir] === E && t[i - dir] === E) this.swap(i, below - dir)
            else if (a >= 0 && a < w && t[i + dir] === E) {
              // spread sideways a little further for a flatter surface
              let j = i + dir
              if (a + dir >= 0 && a + dir < w && t[j + dir] === E && rng() < 0.5) j += dir
              this.swap(i, j)
            } else if (b >= 0 && b < w && t[i - dir] === E) this.swap(i, i - dir)
          }
        } else if (k === FIRE) {
          this.fire(i, x, y, rng)
        } else if (k === SMOKE) {
          if (this.l[i] === 0) {
            t[i] = E
            continue
          }
          this.l[i]--
          if (y > 0 && rng() < 0.7) {
            const j = i - w + (rng() < 0.4 ? dir : 0)
            if (j >= 0 && t[j] === E && Math.abs((j % w) - x) <= 1) this.swap(i, j)
          } else if (rng() < 0.3) {
            const j = i + dir
            if (x + dir >= 0 && x + dir < w && t[j] === E) this.swap(i, j)
          }
        }
      }
    }
  }
  private fire(i: number, x: number, y: number, rng: () => number) {
    const { w, h, t } = this
    if (this.l[i] === 0) {
      t[i] = rng() < 0.45 ? SMOKE : E
      this.l[i] = 20 + Math.floor(rng() * 20)
      return
    }
    this.l[i]--
    let fuel = false
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
        const j = ny * w + nx
        if (t[j] === WOOD) {
          fuel = true
          if (rng() < 0.22) {
            t[j] = FIRE
            this.l[j] = 40 + Math.floor(rng() * 40)
            this.u[j] = 1
          }
        } else if (t[j] === WATER) {
          // extinguish: both become steam
          t[i] = SMOKE
          this.l[i] = 30
          if (rng() < 0.5) {
            t[j] = SMOKE
            this.l[j] = 30
          }
          return
        }
      }
    if (fuel && this.l[i] < 6) this.l[i] += 2
    if (y > 0 && rng() < (fuel ? 0.12 : 0.5)) {
      const dir = Math.floor(rng() * 3) - 1
      const nx = x + dir
      const j = i - w + dir
      if (nx >= 0 && nx < w && t[j] === E) this.swap(i, j)
    }
  }
}

// ---------- noise & generative maths ----------

/** Smooth 2D value noise in [0,1), deterministic per seed. */
export function makeNoise(seed: number): (x: number, y: number) => number {
  const hash = (x: number, y: number) => {
    let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed | 0, 2246822519)) | 0
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296
  }
  const fade = (t: number) => t * t * (3 - 2 * t)
  return (x, y) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = fade(x - xi)
    const yf = fade(y - yi)
    const a = hash(xi, yi)
    const b = hash(xi + 1, yi)
    const c = hash(xi, yi + 1)
    const d = hash(xi + 1, yi + 1)
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf
  }
}

/** Hypotrochoid point. */
export function spiro(R: number, r: number, d: number, t: number): [number, number] {
  const k = (R - r) / r
  return [(R - r) * Math.cos(t) + d * Math.cos(k * t), (R - r) * Math.sin(t) - d * Math.sin(k * t)]
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
/** Parameter range after which the spirograph curve closes. */
export function spiroPeriod(R: number, r: number): number {
  return (2 * Math.PI * Math.round(r)) / gcd(Math.round(R), Math.round(r))
}

export function randomSpiro(rng: Rng): { r: number; d: number } {
  return { r: rng.int(20, 140), d: rng.int(30, 160) }
}
