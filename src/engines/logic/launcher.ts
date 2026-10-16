// Compact rigid-body sim (circles + axis-aligned boxes, gravity, friction) and level generator for the launcher engine.
import type { Rng } from '../kit'

export type Mat = 'wood' | 'stone' | 'glass' | 'foe' | 'proj'
export interface Body {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  /** box size (circles: w = h = 2r) */
  w: number
  h: number
  r: number
  circle: boolean
  m: number
  hp: number
  maxHp: number
  mat: Mat
  foe: boolean
  dead: boolean
  e: number
  flash: number
  grounded: boolean
  /** emoji index for foes */
  skin: number
}
export interface Impact { x: number; y: number; power: number; mat: Mat; id: number }
export interface WorldL {
  bodies: Body[]
  ground: number
  width: number
  gravity: number
  impacts: Impact[]
  nextId: number
}

const MAT: Record<Exclude<Mat, 'foe' | 'proj'>, { hp: number; dens: number; e: number }> = {
  wood: { hp: 42, dens: 0.0011, e: 0.12 },
  stone: { hp: 130, dens: 0.0022, e: 0.05 },
  glass: { hp: 14, dens: 0.0007, e: 0.2 },
}

export const mkWorld = (width: number, ground: number): WorldL => ({ bodies: [], ground, width, gravity: 900, impacts: [], nextId: 1 })

export function addBox(w: WorldL, x: number, y: number, bw: number, bh: number, mat: Exclude<Mat, 'foe' | 'proj'>): Body {
  const d = MAT[mat]
  const b: Body = {
    id: w.nextId++, x, y, vx: 0, vy: 0, w: bw, h: bh, r: 0, circle: false, m: bw * bh * d.dens, hp: d.hp, maxHp: d.hp, mat, foe: false, dead: false, e: d.e, flash: 0, grounded: false, skin: 0,
  }
  w.bodies.push(b)
  return b
}
export function addFoe(w: WorldL, x: number, y: number, r: number, skin = 0, hp = 24): Body {
  const b: Body = {
    id: w.nextId++, x, y, vx: 0, vy: 0, w: r * 2, h: r * 2, r, circle: true, m: r * r * 0.0035, hp, maxHp: hp, mat: 'foe', foe: true, dead: false, e: 0.1, flash: 0, grounded: false, skin,
  }
  w.bodies.push(b)
  return b
}
export function addProjectile(w: WorldL, x: number, y: number, r: number, vx: number, vy: number, m = 4): Body {
  const b: Body = {
    id: w.nextId++, x, y, vx, vy, w: r * 2, h: r * 2, r, circle: true, m, hp: 9999, maxHp: 9999, mat: 'proj', foe: false, dead: false, e: 0.25, flash: 0, grounded: false, skin: 0,
  }
  w.bodies.push(b)
  return b
}

interface Contact { nx: number; ny: number; pen: number }

function circleCircle(a: Body, b: Body): Contact | null {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d2 = dx * dx + dy * dy
  const min = a.r + b.r
  if (d2 >= min * min) return null
  const d = Math.sqrt(d2) || 0.0001
  return { nx: dx / d, ny: dy / d, pen: min - d }
}
/** circle a vs box b; normal points from a to b */
function circleBox(a: Body, b: Body): Contact | null {
  const hx = b.w / 2
  const hy = b.h / 2
  const cx = Math.max(b.x - hx, Math.min(a.x, b.x + hx))
  const cy = Math.max(b.y - hy, Math.min(a.y, b.y + hy))
  const dx = cx - a.x
  const dy = cy - a.y
  const d2 = dx * dx + dy * dy
  if (d2 >= a.r * a.r) return null
  if (d2 > 1e-8) {
    const d = Math.sqrt(d2)
    return { nx: dx / d, ny: dy / d, pen: a.r - d }
  }
  // centre inside the box: push out along the shallowest axis
  const ox = hx - Math.abs(a.x - b.x)
  const oy = hy - Math.abs(a.y - b.y)
  if (ox < oy) return { nx: a.x < b.x ? 1 : -1, ny: 0, pen: ox + a.r }
  return { nx: 0, ny: a.y < b.y ? 1 : -1, pen: oy + a.r }
}
function boxBox(a: Body, b: Body): Contact | null {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const px = (a.w + b.w) / 2 - Math.abs(dx)
  if (px <= 0) return null
  const py = (a.h + b.h) / 2 - Math.abs(dy)
  if (py <= 0) return null
  if (px < py) return { nx: dx < 0 ? -1 : 1, ny: 0, pen: px }
  return { nx: 0, ny: dy < 0 ? -1 : 1, pen: py }
}
function contact(a: Body, b: Body): Contact | null {
  if (a.circle && b.circle) return circleCircle(a, b)
  if (a.circle) return circleBox(a, b)
  if (b.circle) {
    const c = circleBox(b, a)
    return c ? { nx: -c.nx, ny: -c.ny, pen: c.pen } : null
  }
  return boxBox(a, b)
}

const halfH = (b: Body) => b.h / 2

export function stepWorldL(w: WorldL, dt: number): void {
  w.impacts.length = 0
  const sub = 3
  const h = dt / sub
  const bodies = w.bodies
  for (let s = 0; s < sub; s++) {
    for (const b of bodies) {
      if (b.dead) continue
      b.grounded = false
      b.vy += w.gravity * h
      b.x += b.vx * h
      b.y += b.vy * h
      b.flash = Math.max(0, b.flash - h)
    }
    for (let iter = 0; iter < 6; iter++) {
      for (let i = 0; i < bodies.length; i++) {
        const a = bodies[i]
        if (a.dead) continue
        for (let j = i + 1; j < bodies.length; j++) {
          const b = bodies[j]
          if (b.dead) continue
          // cheap reject
          const reach = Math.max(a.w, a.h) / 2 + Math.max(b.w, b.h) / 2
          if (Math.abs(a.x - b.x) > reach || Math.abs(a.y - b.y) > reach) continue
          const c = contact(a, b)
          if (!c) continue
          const ia = 1 / a.m
          const ib = 1 / b.m
          const tot = ia + ib
          const corr = Math.max(0, c.pen - 0.01) * 0.85
          a.x -= c.nx * corr * (ia / tot)
          a.y -= c.ny * corr * (ia / tot)
          b.x += c.nx * corr * (ib / tot)
          b.y += c.ny * corr * (ib / tot)
          const rvx = b.vx - a.vx
          const rvy = b.vy - a.vy
          const vn = rvx * c.nx + rvy * c.ny
          if (c.ny > 0.7) a.grounded = true
          if (c.ny < -0.7) b.grounded = true
          if (vn < 0) {
            const e = vn < -140 ? Math.max(a.e, b.e) * 0.6 : 0
            const j2 = (-(1 + e) * vn) / tot
            a.vx -= j2 * ia * c.nx
            a.vy -= j2 * ia * c.ny
            b.vx += j2 * ib * c.nx
            b.vy += j2 * ib * c.ny
            // friction
            const tx = -c.ny
            const ty = c.nx
            const vt = rvx * tx + rvy * ty
            const jt = Math.max(-0.5 * j2, Math.min(0.5 * j2, -vt / tot))
            a.vx -= jt * ia * tx
            a.vy -= jt * ia * ty
            b.vx += jt * ib * tx
            b.vy += jt * ib * ty
            const sp = -vn
            if (sp > 110) {
              const wa = b.m / (a.m + b.m)
              const wb = a.m / (a.m + b.m)
              hurt(w, a, (sp - 90) * 0.1 * wa * 2, c)
              hurt(w, b, (sp - 90) * 0.1 * wb * 2, c)
              w.impacts.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, power: sp, mat: a.mat === 'proj' ? b.mat : a.mat, id: a.mat === 'proj' ? b.id : a.id })
            }
          }
        }
      }
    }
    // ground and side walls
    for (const b of bodies) {
      if (b.dead) continue
      const bottom = b.y + halfH(b)
      if (bottom > w.ground) {
        b.y = w.ground - halfH(b)
        b.grounded = true
        if (b.vy > 160) {
          hurt(w, b, (b.vy - 120) * (b.mat === 'proj' ? 0 : 0.05), { nx: 0, ny: 1, pen: 0 })
          w.impacts.push({ x: b.x, y: w.ground, power: b.vy, mat: b.mat, id: b.id })
        }
        b.vy = b.vy > 200 && b.mat === 'proj' ? -b.vy * 0.3 : 0
        b.vx *= b.circle ? 0.985 : 0.88
        if (b.circle && b.mat !== 'proj') b.vx *= 0.97
      }
      if (b.mat !== 'proj') {
        if (b.x < b.w / 2) {
          b.x = b.w / 2
          b.vx = Math.abs(b.vx) * 0.2
        } else if (b.x > w.width - b.w / 2) {
          b.x = w.width - b.w / 2
          b.vx = -Math.abs(b.vx) * 0.2
        }
      }
      if (b.grounded && Math.abs(b.vx) < 10 && Math.abs(b.vy) < 120) {
        b.vx = 0
        b.vy = 0
      } else if (b.grounded) {
        b.vx *= 0.995
      }
      // never let numbers explode
      const sp = Math.hypot(b.vx, b.vy)
      if (sp > 1400) {
        b.vx *= 1400 / sp
        b.vy *= 1400 / sp
      }
    }
  }
}

function hurt(w: WorldL, b: Body, dmg: number, _c: Contact): void {
  void w
  void _c
  if (b.mat === 'proj' || dmg <= 0) return
  b.hp -= dmg
  b.flash = 0.12
  if (b.hp <= 0) b.dead = true
}

export const foesAlive = (w: WorldL) => w.bodies.filter((b) => b.foe && !b.dead).length
/** True when nothing but the (ignored) projectile is still moving. */
export function settled(w: WorldL, eps = 12): boolean {
  for (const b of w.bodies) if (!b.dead && b.mat !== 'proj' && Math.hypot(b.vx, b.vy) > eps) return false
  return true
}

// ---------------------------------------------------------------- level generation
export interface LevelInfo { foes: number; blocks: number; shots: number }
/** Builds a level of towers with foes perched on and inside them. Deterministic from rng. */
export function genLevel(rng: Rng, level: number, width: number, ground: number, diff: 0 | 1 | 2): { world: WorldL; info: LevelInfo } {
  const world = mkWorld(width, ground)
  const nStruct = Math.min(3, 1 + Math.floor((level - 1) / 2))
  const x0 = width * 0.46
  const x1 = width - 50
  const slot = (x1 - x0) / nStruct
  let foes = 0
  const mats: ('wood' | 'stone' | 'glass')[] = level >= 4 ? ['wood', 'stone', 'glass', 'wood'] : level >= 2 ? ['wood', 'glass', 'wood'] : ['wood', 'glass']
  for (let s = 0; s < nStruct; s++) {
    const cx = x0 + slot * (s + 0.5)
    const layers = Math.min(4, 1 + Math.floor((level + s) / 2) + (rng.chance(0.4) ? 1 : 0))
    const span = Math.min(slot - 14, rng.range(70, 96))
    let top = ground
    for (let l = 0; l < layers; l++) {
      const pm = rng.pick(mats)
      const ph = rng.range(44, 58)
      const pw = 13
      // two pillars
      addBox(world, cx - span / 2 + pw / 2, top - ph / 2, pw, ph, pm)
      addBox(world, cx + span / 2 - pw / 2, top - ph / 2, pw, ph, pm)
      // foe between pillars on some layers
      if (rng.chance(0.55) && foes < 3 + level) {
        addFoe(world, cx, top - 15, 15, rng.int(0, 5), 24 + level)
        foes++
      }
      // plank
      const plankM = rng.pick(mats)
      addBox(world, cx, top - ph - 7, span + 16, 14, plankM)
      top -= ph + 14
    }
    // crown foe on the top plank
    addFoe(world, cx + rng.range(-12, 12), top - 16, 16, rng.int(0, 5), 26 + level)
    foes++
    if (level >= 3 && rng.chance(0.5)) addBox(world, cx + span / 2 + 28, ground - 16, 32, 32, rng.pick(mats))
  }
  if (foes < 2) {
    addFoe(world, x0 - 30, ground - 16, 16, 1)
    foes++
  }
  const shots = Math.max(3, 3 + Math.ceil(foes / 3) + (diff === 0 ? 2 : diff === 1 ? 1 : 0))
  return { world, info: { foes, blocks: world.bodies.filter((b) => !b.foe).length, shots } }
}

/** Predict the projectile path (no collisions with blocks) for the aiming preview. */
export function trajectory(x: number, y: number, vx: number, vy: number, g: number, ground: number, steps: number, dt = 1 / 30): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = []
  let px = x
  let py = y
  let ux = vx
  let uy = vy
  for (let i = 0; i < steps; i++) {
    ux *= 1
    uy += g * dt
    px += ux * dt
    py += uy * dt
    if (py > ground) break
    out.push({ x: px, y: py })
  }
  return out
}
