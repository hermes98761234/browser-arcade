// 1v1 fighting rules: moves, hit detection, blocking, combos, projectiles and a reaction-based AI. Pure and deterministic.

export type Act = 'idle' | 'punch' | 'kick' | 'special' | 'block' | 'hit' | 'ko'
export interface Fighter {
  x: number
  /** height above the floor (>= 0) */
  y: number
  vx: number
  vy: number
  face: 1 | -1
  hp: number
  maxHp: number
  energy: number
  act: Act
  t: number
  hitDone: boolean
  stun: number
  /** consecutive hits dealt, and time left to continue the chain */
  chain: number
  chainT: number
  walk: number
  scale: number
  /** flash timer for visual hit feedback */
  flash: number
  /** which attack variant (alternates jab / cross) */
  alt: number
}
export interface Proj { x: number; y: number; vx: number; owner: 0 | 1; life: number; dmg: number }
export interface Input { dir: -1 | 0 | 1; jump: boolean; block: boolean; punch: boolean; kick: boolean; special: boolean }
export const NO_INPUT: Input = { dir: 0, jump: false, block: false, punch: false, kick: false, special: false }

export interface MoveDef { startup: number; active: number; recovery: number; dmg: number; reach: number; kb: number; stun: number; stop: number }
export const MOVES: Record<'punch' | 'kick' | 'special', MoveDef> = {
  punch: { startup: 0.07, active: 0.09, recovery: 0.13, dmg: 6, reach: 58, kb: 70, stun: 0.26, stop: 0.06 },
  kick: { startup: 0.15, active: 0.1, recovery: 0.24, dmg: 11, reach: 76, kb: 140, stun: 0.38, stop: 0.1 },
  special: { startup: 0.22, active: 0.05, recovery: 0.3, dmg: 16, reach: 0, kb: 220, stun: 0.5, stop: 0.14 },
}
export const SPECIAL_COST = 50
export const BODY = 34

export interface Config {
  width: number
  speed: number
  dmgMul: number
  /** 0 = no jumping/kicks (boxing) */
  boxing: boolean
  /** sumo: attacks shove, round ends on ring-out and hp is ignored */
  sumo: boolean
  ring: number
}
export interface World {
  f: [Fighter, Fighter]
  proj: Proj[]
  cfg: Config
  hitstop: number
  time: number
  events: Ev[]
}
export type Ev = { k: 'hit' | 'block' | 'ko' | 'whiff' | 'special' | 'ringout'; who: 0 | 1; x: number; y: number; dmg?: number; chain?: number }

export const mkFighter = (x: number, face: 1 | -1, maxHp = 100, scale = 1): Fighter => ({
  x, y: 0, vx: 0, vy: 0, face, hp: maxHp, maxHp, energy: 0, act: 'idle', t: 0, hitDone: false, stun: 0, chain: 0, chainT: 0, walk: 0, scale, flash: 0, alt: 0,
})
export const mkWorld = (cfg: Config, hp = 100, scaleA = 1, scaleB = 1): World => ({
  f: [mkFighter(cfg.width * 0.3, 1, hp, scaleA), mkFighter(cfg.width * 0.7, -1, hp, scaleB)],
  proj: [], cfg, hitstop: 0, time: 0, events: [],
})

export const phase = (a: 'punch' | 'kick' | 'special', t: number): 'startup' | 'active' | 'recovery' | 'done' => {
  const m = MOVES[a]
  return t < m.startup ? 'startup' : t < m.startup + m.active ? 'active' : t < m.startup + m.active + m.recovery ? 'recovery' : 'done'
}
export const isAttack = (a: Act): a is 'punch' | 'kick' | 'special' => a === 'punch' || a === 'kick' || a === 'special'

/** Damage after combo scaling (+8% per chained hit up to +40%) and blocking (10% chip). */
export function damageFor(base: number, chain: number, blocked: boolean, mul = 1): number {
  const scaled = base * (1 + Math.min(5, chain) * 0.08) * mul
  return blocked ? Math.max(1, Math.round(scaled * 0.1)) : Math.round(scaled)
}

const GRAV = 1700
const JUMP = 640

export function step(w: World, ins: [Input, Input], dt: number): void {
  w.events.length = 0
  if (w.hitstop > 0) {
    w.hitstop = Math.max(0, w.hitstop - dt)
    return
  }
  w.time += dt
  const { cfg } = w
  for (const i of [0, 1] as const) {
    const me = w.f[i]
    const foe = w.f[i === 0 ? 1 : 0]
    const inp = ins[i]
    me.t += dt
    me.flash = Math.max(0, me.flash - dt)
    me.chainT -= dt
    if (me.chainT <= 0) me.chain = 0
    const grounded = me.y <= 0 && me.vy <= 0
    if (me.act === 'ko') {
      me.vx *= 0.9
    } else if (me.act === 'hit') {
      if (me.t >= me.stun) {
        me.act = 'idle'
        me.t = 0
      }
    } else if (isAttack(me.act)) {
      const m = MOVES[me.act]
      if (me.t >= m.startup + m.active + m.recovery) {
        me.act = 'idle'
        me.t = 0
      }
    } else {
      // free to act
      if (inp.block && grounded && !cfg.sumo) {
        if (me.act !== 'block') {
          me.act = 'block'
          me.t = 0
        }
      } else if (me.act === 'block') {
        me.act = 'idle'
        me.t = 0
      }
      if (me.act !== 'block') {
        if (inp.special && me.energy >= SPECIAL_COST && grounded && !cfg.sumo) {
          me.energy -= SPECIAL_COST
          me.act = 'special'
          me.t = 0
          me.hitDone = false
        } else if (inp.kick && !cfg.boxing) {
          me.act = 'kick'
          me.t = 0
          me.hitDone = false
        } else if (inp.punch || (inp.kick && cfg.boxing)) {
          me.act = 'punch'
          me.t = 0
          me.hitDone = false
          me.alt ^= 1
        }
      }
    }
    // movement
    if (me.act === 'idle') {
      if (grounded) {
        me.vx = inp.dir * 250 * cfg.speed
        if (inp.jump && !cfg.sumo) {
          me.vy = JUMP
          me.y = 0.01
        }
      }
      if (inp.dir !== 0) me.walk += dt * 9
    } else if (me.act === 'block' || (isAttack(me.act) && grounded)) {
      me.vx *= 0.8
    }
    me.vy -= GRAV * dt
    me.y += me.vy * dt
    if (me.y <= 0) {
      me.y = 0
      me.vy = 0
    }
    me.x += me.vx * dt
    if (me.act === 'hit' || me.act === 'ko') me.vx *= Math.pow(0.04, dt)
    if (!cfg.sumo) me.x = Math.max(30, Math.min(cfg.width - 30, me.x))
    if (grounded && me.act !== 'ko' && !isAttack(me.act) && me.act !== 'hit') me.face = foe.x >= me.x ? 1 : -1
  }
  // body push
  const a = w.f[0]
  const b = w.f[1]
  const min = BODY * ((a.scale + b.scale) / 2)
  if (Math.abs(a.x - b.x) < min && Math.abs(a.y - b.y) < 70) {
    const d = (min - Math.abs(a.x - b.x)) / 2
    const s = a.x <= b.x ? 1 : -1
    a.x -= d * s
    b.x += d * s
    if (!cfg.sumo) {
      a.x = Math.max(30, Math.min(cfg.width - 30, a.x))
      b.x = Math.max(30, Math.min(cfg.width - 30, b.x))
    }
  }
  // attacks
  for (const i of [0, 1] as const) {
    const me = w.f[i]
    const foe = w.f[i === 0 ? 1 : 0]
    if (!isAttack(me.act) || me.hitDone) continue
    const ph = phase(me.act, me.t)
    if (ph !== 'active') continue
    if (me.act === 'special') {
      me.hitDone = true
      w.proj.push({ x: me.x + me.face * 34, y: 52 + me.y, vx: me.face * 380, owner: i, life: 1.6, dmg: MOVES.special.dmg })
      w.events.push({ k: 'special', who: i, x: me.x, y: 60 })
      continue
    }
    const m = MOVES[me.act]
    const reach = (m.reach + (me.scale - 1) * 20) * (me.act === 'kick' && me.y > 0 ? 1.1 : 1)
    const dx = (foe.x - me.x) * me.face
    const near = dx > -10 && dx < reach + BODY * foe.scale * 0.5
    const vert = Math.abs(foe.y - me.y) < 62
    if (near && vert && foe.act !== 'ko') {
      me.hitDone = true
      landHit(w, i, m, foe)
    }
  }
  // whiff event when recovery starts without a hit
  // projectiles
  for (let pi = w.proj.length - 1; pi >= 0; pi--) {
    const p = w.proj[pi]
    p.x += p.vx * dt
    p.life -= dt
    const foeI = p.owner === 0 ? 1 : 0
    const foe = w.f[foeI]
    if (p.life <= 0 || p.x < -40 || p.x > cfg.width + 40) {
      w.proj.splice(pi, 1)
      continue
    }
    if (foe.act !== 'ko' && Math.abs(foe.x - p.x) < 28 * foe.scale && foe.y < 70) {
      w.proj.splice(pi, 1)
      landHit(w, p.owner, { ...MOVES.special, dmg: p.dmg }, foe, true)
    }
  }
  if (cfg.sumo) {
    for (const i of [0, 1] as const) {
      const f = w.f[i]
      if (Math.abs(f.x - cfg.width / 2) > cfg.ring && f.act !== 'ko') {
        f.act = 'ko'
        f.t = 0
        f.hp = 0
        w.events.push({ k: 'ringout', who: i, x: f.x, y: 0 })
      }
    }
  }
}

function landHit(w: World, i: 0 | 1, m: MoveDef, foe: Fighter, proj = false): void {
  const me = w.f[i]
  const fi = i === 0 ? 1 : 0
  const blocked = foe.act === 'block' && (proj || foe.face === -me.face)
  const dmg = damageFor(m.dmg, me.chain, blocked, w.cfg.dmgMul)
  const dir = (proj ? Math.sign(foe.x - me.x) || 1 : me.face) as 1 | -1
  if (w.cfg.sumo) {
    foe.vx = dir * (blocked ? 120 : 340 + me.chain * 20)
    foe.act = 'hit'
    foe.t = 0
    foe.stun = 0.25
    w.hitstop = m.stop
    w.events.push({ k: 'hit', who: fi, x: foe.x, y: 60 + foe.y, dmg: 0, chain: me.chain })
    me.chain++
    me.chainT = 0.9
    return
  }
  if (blocked) {
    foe.hp = Math.max(1, foe.hp - dmg)
    foe.vx = dir * m.kb * 0.5
    foe.energy = Math.min(100, foe.energy + 4)
    w.hitstop = m.stop * 0.5
    w.events.push({ k: 'block', who: fi, x: foe.x, y: 60 + foe.y, dmg })
    return
  }
  foe.hp = Math.max(0, foe.hp - dmg)
  foe.flash = 0.12
  foe.act = 'hit'
  foe.t = 0
  foe.stun = m.stun
  foe.vx = dir * m.kb
  if (m.kb > 150) {
    foe.vy = 260
    foe.y = Math.max(foe.y, 0.01)
  }
  me.chain++
  me.chainT = 0.9
  me.energy = Math.min(100, me.energy + (proj ? 4 : 9))
  foe.energy = Math.min(100, foe.energy + dmg * 0.6)
  w.hitstop = m.stop
  w.events.push({ k: 'hit', who: fi, x: foe.x, y: 60 + foe.y, dmg, chain: me.chain })
  if (foe.hp <= 0) {
    foe.act = 'ko'
    foe.t = 0
    foe.vx = dir * 260
    foe.vy = 300
    foe.y = Math.max(foe.y, 0.01)
    w.events.push({ k: 'ko', who: fi, x: foe.x, y: 60 })
  }
}

// ---------------------------------------------------------------- AI
export interface AiState {
  /** perceived opponent state (refreshed every `react` seconds) */
  seen: { act: Act; t: number; dist: number; y: number } | null
  seenT: number
  plan: 'approach' | 'attack' | 'retreat' | 'wait' | 'block'
  planT: number
  pending: 'punch' | 'kick' | 'special' | null
  jumpT: number
}
export const mkAi = (): AiState => ({ seen: null, seenT: 0, plan: 'approach', planT: 0, pending: null, jumpT: 0 })

/** One AI decision tick. diff 0..2: reaction time, block chance, aggression grow with difficulty. */
export function aiInput(w: World, me: 0 | 1, ai: AiState, dt: number, diff: 0 | 1 | 2, rnd: () => number): Input {
  const f = w.f[me]
  const o = w.f[me === 0 ? 1 : 0]
  const react = [0.34, 0.2, 0.09][diff]
  const blockP = [0.2, 0.5, 0.8][diff]
  const aggro = [0.45, 0.7, 0.95][diff]
  ai.seenT -= dt
  if (ai.seenT <= 0 || !ai.seen) {
    ai.seenT = react
    ai.seen = { act: o.act, t: o.t, dist: Math.abs(o.x - f.x), y: o.y }
  }
  ai.planT -= dt
  ai.jumpT -= dt
  const dist = Math.abs(o.x - f.x)
  const toward = (o.x >= f.x ? 1 : -1) as 1 | -1
  const inp: Input = { dir: 0, jump: false, block: false, punch: false, kick: false, special: false }
  const seen = ai.seen
  const range = MOVES.punch.reach + 14
  // react to incoming attacks
  if ((isAttack(seen.act) && seen.dist < MOVES.kick.reach + 40 && f.act === 'idle') || f.act === 'block') {
    if (ai.plan !== 'block' && rnd() < blockP) {
      ai.plan = 'block'
      ai.planT = 0.35 + rnd() * 0.25
    }
  }
  if (w.proj.some((p) => p.owner !== me && Math.abs(p.x - f.x) < 150 && ((p.vx > 0) === (f.x > p.x)))) {
    if (diff >= 1 && f.y <= 0 && ai.jumpT <= 0 && rnd() < 0.5) {
      inp.jump = true
      ai.jumpT = 0.8
    } else if (rnd() < blockP) {
      ai.plan = 'block'
      ai.planT = 0.4
    }
  }
  if (ai.planT <= 0) {
    ai.plan = rnd() < aggro ? (dist > range ? 'approach' : 'attack') : rnd() < 0.5 ? 'wait' : 'retreat'
    ai.planT = 0.15 + rnd() * 0.3
  }
  switch (ai.plan) {
    case 'block':
      inp.block = true
      break
    case 'approach':
      inp.dir = toward
      if (dist < range - 8) ai.plan = 'attack'
      if (dist > 220 && f.energy >= SPECIAL_COST && rnd() < 0.02 + diff * 0.01) inp.special = true
      break
    case 'retreat':
      inp.dir = (-toward) as 1 | -1
      break
    case 'wait':
      break
    case 'attack':
      if (dist > range + 24) {
        inp.dir = toward
        break
      }
      if (f.act === 'idle' && o.act !== 'ko') {
        const r = rnd()
        if (f.energy >= SPECIAL_COST && dist > 60 && r < 0.1 + diff * 0.05) inp.special = true
        else if (r < 0.58) inp.punch = true
        else if (r < 0.88 && !w.cfg.boxing) inp.kick = true
        else if (w.cfg.boxing) inp.punch = true
        // after attacking back off sometimes
        ai.plan = rnd() < 0.35 ? 'retreat' : 'attack'
        ai.planT = 0.1 + rnd() * [0.5, 0.3, 0.12][diff]
      }
      break
  }
  return inp
}
