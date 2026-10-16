// Arena: top-down arena action. Sub-modes: shooter (default twin-stick), melee (sword arc), tank (independent turret),
// io (eat smaller dots/blobs and grow), asteroids (inertia ship, splitting rocks, wrap-around).
import { background, Bag, byDiff, clamp, createStage, emoji, isTouch, keys, loop, Particles, pointer, roundRect, Shake, text, vpad, type Engine, type GameEnv, type Keys, type Pointer, type Stage } from '../kit'
import { grow, pickUpgrades, waveComposition, type FoeKind, type Upgrade } from '../logic/arena'

const TAU = Math.PI * 2
let W = 720
let H = 450

interface Ctx {
  env: GameEnv
  st: Stage
  ctx: CanvasRenderingContext2D
  k: Keys
  ptr: Pointer
  fx: Particles
  shake: Shake
  time: number
  intro: number
  over: boolean
  score: number
  add(n: number): void
  card(sub: string): void
}
interface Mode { update(dt: number): void; draw(): void }

const MELEE_RE = /melee|sword|axe\b|bat\b|brawl|fist|punch|blade|katana|club|hammer|scythe|mace|dagger|pan\b|knight|slash|samurai|viking|sumo|spear|lance|rapier|whip|tornado|bash|gladiator|colosseum|coliseum|gauntlet|dummies|wrestl|pitchfork|lumberjack|shovel|brawler|fight|clash/i
const IO_RE = /\bio\b|agar|orb eater|blob/i

// ---------------------------------------------------------------- combat (shooter / melee / tank)
interface Foe { kind: FoeKind; x: number; y: number; vx: number; vy: number; hp: number; max: number; r: number; spd: number; e: string; flash: number; fire: number; kx: number; ky: number; t: number; slow: number }
interface Bul { x: number; y: number; vx: number; vy: number; life: number; dmg: number; pierce: number; r: number; hostile: boolean; hit: Set<Foe> | null; bounce?: number; stun?: boolean }
interface Pick { x: number; y: number; k: 'heart' | 'coin' | 'rapid'; e: string; life: number }

function combat(C: Ctx, mode: 'shooter' | 'melee' | 'tank'): Mode {
  const { env, ctx, k, ptr, fx, shake } = C
  const t = env.theme
  const rng = env.rng
  const dark = env.mods.has('dark')
  const fast = env.mods.has('fast') ? 1.2 : 1
  const touch = isTouch()
  const tankM = mode === 'tank'
  const S0 = `${env.name} ${env.desc}`.toLowerCase()
  const bossRush = env.mods.has('boss') || /titan|tyrant|throne|echoes|kaiju|\bhunt|wyvern|behemoth|chimera|hydra|wurm|beast|monster/.test(S0)
  const TOTAL = bossRush ? byDiff(env, 3, 4, 5) : byDiff(env, 6, 8, 10)
  const weapon: 'std' | 'ricochet' | 'backward' | 'orbit' | 'flame' | 'pull' | 'beam' | 'stun' | 'paint' =
    mode !== 'shooter' ? 'std'
      : /ricochet|bounce/.test(S0) ? 'ricochet'
        : /backward|behind/.test(S0) ? 'backward'
          : /orbit/.test(S0) ? 'orbit'
            : /flame|water gun|pressure|short-range/.test(S0) ? 'flame'
              : /magnet|vacuum|suck|fling/.test(S0) ? 'pull'
                : env.mods.has('laser') || /laser|beam|flashlight/.test(S0) ? 'beam'
                  : /bubble|snowball|slingshot/.test(S0) ? 'stun'
                    : /paint/.test(S0) ? 'paint' : 'std'
  const shieldOn = env.mods.has('shield') || /rotating shield/.test(S0)
  const defend = /defend|protect|barricade|garden|flock|graveyard|basement|village|keep zombies/.test(S0)
  const vehicle = /derby|hovercraft|buggy|bulldozer|spiked wheels|truck|hover tank|jetski|submarine|\bsub\b/.test(S0)
  const ramOnly = /derby|bulldozer|spiked wheels/.test(S0)
  const ringOut = /\bring\b|sumo|wrestl|bumper|joust/.test(S0) && mode === 'melee'
  const spikes = /spike|\bpit\b|bash|bulldozer/.test(S0)
  const mc = (() => {
    if (/spear|lance|rapier|joust/.test(S0)) return { half: 0.3, reach: 108, cd: 0.36, kb: 120, dm: 1.2 }
    if (/dagger|knife/.test(S0)) return { half: 0.6, reach: 52, cd: 0.17, kb: 90, dm: 0.6 }
    if (/whip/.test(S0)) return { half: 0.32, reach: 122, cd: 0.4, kb: 200, dm: 1 }
    if (/hammer|mace|flail|shovel/.test(S0)) return { half: Math.PI, reach: 80, cd: 0.8, kb: 330, dm: 1.6 }
    if (/club|bat\b|pan\b|bash/.test(S0)) return { half: 1.2, reach: 66, cd: 0.55, kb: 310, dm: 1.4 }
    if (/tornado|spin|ring of blades/.test(S0)) return { half: Math.PI, reach: 62, cd: 0.42, kb: 200, dm: 1 }
    if (/scythe|katana|sweep/.test(S0)) return { half: 1.55, reach: 84, cd: 0.5, kb: 170, dm: 1 }
    return { half: 0.85, reach: 60, cd: 0.4, kb: 170, dm: 1 }
  })()
  const ring = { r: Math.min(W, H) * 0.46, min: Math.min(W, H) * 0.24 }
  const pits: { x: number; y: number; r: number }[] = []
  if (spikes) for (let i = 0; i < 3; i++) pits.push({ x: W * (0.2 + 0.3 * i + 0.05 * (i % 2)), y: H * (i % 2 ? 0.28 : 0.72), r: 26 })
  let coreHp = defend ? byDiff(env, 10, 8, 6) : 0
  const coreMax = coreHp
  const PG = 24
  const paintCells = new Uint8Array(PG * PG)
  let paintN = 0
  let moveA = 0
  const P = { x: W / 2, y: H / 2, vx: 0, vy: 0, hp: byDiff(env, 6, 5, 4), max: byDiff(env, 6, 5, 4), inv: 0, dash: 0, dashCd: 0, face: 0, hull: 0, cd: 0, swing: 0, swingA: 0, rapid: 0, beam: 0 }
  const S: Record<string, number> = {}
  let wave = 0
  let foes: Foe[] = []
  let queue: { kind: FoeKind; x: number; y: number; wait: number }[] = []
  let buls: Bul[] = []
  let picks: Pick[] = []
  let sweeps: { x: number; y: number; a: number; w: number; r: number; life: number }[] = []
  let choice: Upgrade[] | null = null
  let pause = 1.4
  let needUpgrade = false
  let banner = ''
  let bannerT = 0
  let combo = 0
  let comboT = 0
  const pillars: { x: number; y: number; r: number }[] = []
  const np = ringOut || defend ? 0 : spikes ? 1 : tankM ? 6 : mode === 'melee' ? 2 : 4
  for (let i = 0; i < np; i++) {
    const a = rng.range(0, TAU)
    const d = rng.range(80, 190)
    const q = { x: W / 2 + Math.cos(a) * d * 1.5, y: H / 2 + Math.sin(a) * d, r: rng.range(18, 28) }
    if (q.x > 40 && q.x < W - 40 && q.y > 40 && q.y < H - 40) pillars.push(q)
  }
  const stat = (n: string) => S[n] ?? 0
  const hud = () => env.status(`${bossRush ? 'Boss' : 'Wave'} ${Math.min(wave, TOTAL)}/${TOTAL} · ${'❤️'.repeat(Math.max(0, P.hp))}${defend ? ` · Core ${coreHp}/${coreMax}` : ''}${weapon === 'paint' ? ` · Painted ${Math.round(covF() * 100)}%` : ''}`)
  const say = (s: string) => { banner = s; bannerT = 1.6 }
  const pushOut = (o: { x: number; y: number }, r: number) => {
    for (const q of pillars) {
      const dx = o.x - q.x
      const dy = o.y - q.y
      const d = Math.hypot(dx, dy) || 1
      if (d < q.r + r) {
        o.x = q.x + (dx / d) * (q.r + r)
        o.y = q.y + (dy / d) * (q.r + r)
      }
    }
  }
  const startWave = () => {
    wave++
    const comp = bossRush ? [{ kind: 'boss' as FoeKind, n: 1 }, { kind: 'grunt' as FoeKind, n: 1 + wave * 2 }] : waveComposition(wave, TOTAL, env.difficulty)
    queue = []
    for (const s of comp)
      for (let i = 0; i < s.n; i++) {
        const side = rng.int(0, 3)
        let x = side === 0 ? 30 : side === 1 ? W - 30 : rng.range(40, W - 40)
        let y = side === 2 ? 30 : side === 3 ? H - 30 : rng.range(40, H - 40)
        if (ringOut) {
          const a = rng.range(0, TAU)
          x = W / 2 + Math.cos(a) * (ring.r - 24)
          y = H / 2 + Math.sin(a) * (ring.r - 24)
        }
        queue.push({ kind: s.kind, x, y, wait: s.kind === 'boss' ? 1.5 : rng.range(0, 1 + wave * 0.5) })
      }
    say(wave >= TOTAL ? 'BOSS!' : `WAVE ${wave}`)
    env.sfx('power')
    hud()
  }
  const mkFoe = (kind: FoeKind, x: number, y: number): Foe => {
    const sc = 1 + 0.1 * wave
    const d = byDiff(env, 0.85, 1, 1.15)
    const base = {
      grunt: [2, 62, 13], runner: [1, 125, 11], brute: [9, 44, 21], shooter: [3, 52, 13], splitter: [5, 70, 16], boss: [60 + 14 * env.difficulty * 3, 46, 36],
    }[kind]
    const hp = Math.max(1, Math.round(base[0] * (kind === 'boss' ? (bossRush ? 1 + 0.6 * (wave - 1) : 1) : sc * (mode === 'melee' ? 1.3 : 1))))
    const idx = kind === 'grunt' ? 0 : kind === 'runner' ? 1 : kind === 'brute' ? 2 : kind === 'shooter' ? 3 : kind === 'splitter' ? 4 : 0
    const em = kind === 'boss' && bossRush ? t.foes[(wave + 1) % t.foes.length] : t.foes[idx % t.foes.length]
    return { kind, x, y, vx: 0, vy: 0, hp, max: hp, r: base[2] * (kind === 'boss' && env.mods.has('giant') ? 1.4 : 1), spd: base[1] * d * (1 + wave * 0.025), e: em, flash: 0, fire: 1 + rng() * 2, kx: 0, ky: 0, t: 0, slow: 0 }
  }
  const aimAngle = () => {
    if (weapon === 'orbit') return C.time * 3.4
    if (weapon === 'backward') return moveA
    if (!touch && ptr.active) return Math.atan2(ptr.y - P.y, ptr.x - P.x)
    let best: Foe | null = null
    let bd = 1e9
    for (const f of foes) {
      const d = (f.x - P.x) ** 2 + (f.y - P.y) ** 2
      if (d < bd) { bd = d; best = f }
    }
    return best ? Math.atan2(best.y - P.y, best.x - P.x) : P.face
  }
  const covF = () => paintN / (PG * PG)
  const dmg = () => (tankM ? 2.2 : mode === 'melee' ? 2 * mc.dm : weapon === 'flame' ? 0.45 : weapon === 'beam' ? 0.3 : 1) * (1 + 0.3 * stat('dmg')) * (weapon === 'paint' ? 1 + covF() * 1.6 : 1)
  const cdBase = () => (tankM ? 0.55 : mode === 'melee' ? mc.cd : weapon === 'flame' ? 0.07 : weapon === 'beam' ? 0.06 : weapon === 'stun' ? 0.4 : 0.26) / ((1 + 0.2 * stat('rate')) * (P.rapid > 0 ? 1.8 : 1))

  const attack = () => {
    const a = P.face
    if (mode === 'melee') {
      const half = Math.min(Math.PI, mc.half + 0.3 * stat('multi'))
      const reach = (mc.reach + 10 * stat('range')) * 1
      P.swing = 0.18
      P.swingA = a
      sweeps.push({ x: P.x, y: P.y, a, w: half, r: reach, life: 0.18 })
      env.sfx('jump')
      for (const f of foes) {
        const dx = f.x - P.x
        const dy = f.y - P.y
        const d = Math.hypot(dx, dy)
        if (d > reach + f.r) continue
        let da = Math.atan2(dy, dx) - a
        da = Math.atan2(Math.sin(da), Math.cos(da))
        if (Math.abs(da) > half) continue
        hurtFoe(f, dmg())
        const kb = ((f.kind === 'boss' ? 40 : mc.kb + 110 * stat('pierce')) / (f.kind === 'brute' ? 2 : 1)) * (ringOut ? 1.8 : 1)
        f.kx = (dx / d) * kb
        f.ky = (dy / d) * kb
      }
      return
    }
    if (weapon === 'beam') {
      P.beam = 0.07
      const dx = Math.cos(a)
      const dy = Math.sin(a)
      for (const f of foes) {
        const px = f.x - P.x
        const py = f.y - P.y
        const al = px * dx + py * dy
        if (al < 0 || al > 520) continue
        if (Math.abs(px * dy - py * dx) < f.r + 6) hurtFoe(f, dmg())
      }
      return
    }
    const n = 1 + stat('multi') + (tankM ? 0 : 0)
    const sp = (tankM ? 400 : weapon === 'flame' ? 330 : weapon === 'stun' ? 300 : 480) * (1 + 0.1 * stat('range'))
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * 0.16
      const jit = weapon === 'flame' ? (rng() - 0.5) * 0.5 : 0
      buls.push({
        x: P.x + Math.cos(a) * 18, y: P.y + Math.sin(a) * 18, vx: Math.cos(a + o + jit) * sp, vy: Math.sin(a + o + jit) * sp,
        life: (weapon === 'flame' ? 0.3 : weapon === 'stun' ? 1.3 : 1) + 0.12 * stat('range'), dmg: dmg(), pierce: weapon === 'flame' ? 99 : stat('pierce'),
        r: tankM ? 6 : weapon === 'flame' ? 8 : weapon === 'stun' ? 9 : 4, hostile: false, hit: new Set(), bounce: weapon === 'ricochet' ? 3 : undefined, stun: weapon === 'stun' || undefined,
      })
    }
    if (tankM) { P.vx -= Math.cos(a) * 90; P.vy -= Math.sin(a) * 90; shake.kick(2) }
    env.sfx('shoot')
  }

  const hurtFoe = (f: Foe, d: number) => {
    f.hp -= d
    f.flash = 0.1
    env.sfx('hit')
    fx.burst(f.x, f.y, t.accent2, 4, 120, 2.5)
    if (f.hp > 0) return
    f.hp = -1
    combo++
    comboT = 2
    C.add(10 * f.max * (1 + Math.min(3, Math.floor(combo / 5)) * 0.25) + (f.kind === 'boss' ? 1000 : 0))
    fx.burst(f.x, f.y, t.danger, 14, 200, 3.5)
    shake.kick(f.kind === 'boss' ? 14 : 2)
    env.sfx('boom')
    if (f.kind === 'splitter') for (const s of [-1, 1]) { const g = mkFoe('grunt', f.x + s * 12, f.y); g.hp = g.max = 1; g.r = 9; foes.push(g) }
    const r = rng()
    if (r < 0.1) picks.push({ x: f.x, y: f.y, k: 'heart', e: '❤️', life: 10 })
    else if (r < 0.14) picks.push({ x: f.x, y: f.y, k: 'rapid', e: '⚡', life: 10 })
    else if (r < 0.5) picks.push({ x: f.x, y: f.y, k: 'coin', e: rng.pick(t.items), life: 9 })
  }

  const hurtPlayer = (fromX: number, fromY: number) => {
    if (P.inv > 0 || P.dash > 0 || C.over) return
    P.hp--
    P.inv = 1.2
    combo = 0
    const d = Math.hypot(P.x - fromX, P.y - fromY) || 1
    P.vx += ((P.x - fromX) / d) * 260
    P.vy += ((P.y - fromY) / d) * 260
    shake.kick(7)
    env.sfx('lose')
    fx.burst(P.x, P.y, t.danger, 18, 220, 3.5)
    hud()
    if (P.hp <= 0) {
      C.over = true
      env.end({ score: C.score, won: false, text: `Reached wave ${wave} of ${TOTAL}` })
    }
  }

  const choose = (u: Upgrade) => {
    S[u.id] = (S[u.id] ?? 0) + 1
    if (u.id === 'hp') { P.max++; P.hp = P.max } else P.hp = Math.min(P.max, P.hp + 1)
    choice = null
    env.sfx('power')
    pause = 0.8
    hud()
  }
  ptr.onDown((p) => {
    C.intro = Math.min(C.intro, 0)
    if (choice) {
      choice.forEach((u, i) => {
        const x = W / 2 + (i - 1) * 190
        if (Math.abs(p.x - x) < 85 && Math.abs(p.y - H / 2) < 90) choose(u)
      })
    }
  })
  k.onKey((e) => {
    if (C.intro > 0.2 && !e.repeat) C.intro = 0
    if (choice && /^Digit[123]$/.test(e.code)) {
      const u = choice[Number(e.code.slice(5)) - 1]
      if (u) choose(u)
    }
  })

  hud()
  const update = (dt: number) => {
    if (choice) return
    comboT -= dt
    if (comboT <= 0) combo = 0
    P.inv = Math.max(0, P.inv - dt)
    P.rapid = Math.max(0, P.rapid - dt)
    P.swing = Math.max(0, P.swing - dt)
    P.dashCd = Math.max(0, P.dashCd - dt)
    P.dash = Math.max(0, P.dash - dt)
    const ax = k.axis()
    const len = Math.hypot(ax.x, ax.y) || 1
    const sp = (tankM ? 150 : mode === 'melee' ? 205 : 190) * (1 + 0.12 * stat('speed')) * fast
    if (k.hit('b') && P.dashCd <= 0) {
      P.dash = 0.16
      P.dashCd = 1.6
      const d = ax.x || ax.y ? Math.atan2(ax.y, ax.x) : P.face
      P.vx = Math.cos(d) * 620
      P.vy = Math.sin(d) * 620
      env.sfx('move')
      fx.burst(P.x, P.y, t.accent, 8, 120, 3)
    }
    if (P.dash <= 0) {
      P.vx += ((ax.x / len) * sp - P.vx) * Math.min(1, dt * (vehicle ? 2.6 : 12))
      P.vy += ((ax.y / len) * sp - P.vy) * Math.min(1, dt * (vehicle ? 2.6 : 12))
    }
    P.x = clamp(P.x + P.vx * dt, 16, W - 16)
    P.y = clamp(P.y + P.vy * dt, 16, H - 16)
    pushOut(P, 14)
    P.beam = Math.max(0, P.beam - dt)
    if (Math.hypot(P.vx, P.vy) > 30) moveA = Math.atan2(-P.vy, -P.vx)
    if (ringOut) {
      if (/shrinking/.test(S0)) ring.r = Math.max(ring.min, ring.r - dt * 1.4)
      const rx = P.x - W / 2
      const ry = P.y - H / 2
      const rd = Math.hypot(rx, ry)
      if (rd > ring.r - 14) { P.x = W / 2 + (rx / rd) * (ring.r - 14); P.y = H / 2 + (ry / rd) * (ring.r - 14) }
    }
    for (const q of pits) if (Math.hypot(P.x - q.x, P.y - q.y) < q.r + 6) hurtPlayer(q.x, q.y)
    if (tankM && (ax.x || ax.y)) {
      let da = Math.atan2(ax.y, ax.x) - P.hull
      da = Math.atan2(Math.sin(da), Math.cos(da))
      P.hull += clamp(da, -6 * dt, 6 * dt)
    }
    P.face = aimAngle()
    // attacks
    P.cd -= dt
    const auto = touch || !ptr.active
    const want = !ramOnly && (ptr.down || k.down('a') || (auto && foes.length > 0))
    if (weapon === 'pull' && want && C.intro <= 0.15) {
      P.beam = 0.1
      for (const f of foes) {
        const fx0 = P.x - f.x
        const fy0 = P.y - f.y
        const fd = Math.hypot(fx0, fy0) || 1
        if (fd < 230 && f.kind !== 'boss') { f.kx += (fx0 / fd) * 620 * dt; f.ky += (fy0 / fd) * 620 * dt }
        if (fd < 46) hurtFoe(f, 2.2 * dt * (1 + 0.3 * stat('dmg')))
      }
    } else if (want && P.cd <= 0 && C.intro <= 0.15) {
      P.cd = cdBase()
      attack()
    }
    // spawn queue
    for (const q of queue) q.wait -= dt
    for (let i = queue.length - 1; i >= 0; i--)
      if (queue[i].wait <= 0) {
        const q = queue[i]
        foes.push(mkFoe(q.kind, q.x, q.y))
        queue.splice(i, 1)
        fx.burst(q.x, q.y, t.accent, 6, 80, 2.5)
      }
    // foes
    for (const f of foes) {
      f.t += dt
      f.flash = Math.max(0, f.flash - dt)
      const dx = P.x - f.x
      const dy = P.y - f.y
      const d = Math.hypot(dx, dy) || 1
      let mv = 1
      if (f.kind === 'shooter') mv = d > 190 ? 1 : d < 130 ? -0.7 : 0.15
      f.slow = Math.max(0, f.slow - dt)
      const sl = f.slow > 0 ? 0.35 : 1
      let mdx = dx
      let mdy = dy
      let md = d
      if (defend && d > 130) {
        mdx = W / 2 - f.x
        mdy = H / 2 - f.y
        md = Math.hypot(mdx, mdy) || 1
        if (md < f.r + 24) {
          f.hp = -1
          coreHp--
          shake.kick(8)
          env.sfx('hit')
          fx.burst(f.x, f.y, t.danger, 12, 160, 3)
          hud()
          if (coreHp <= 0 && !C.over) {
            C.over = true
            env.sfx('lose')
            env.end({ score: C.score, won: false, text: `The core fell on wave ${wave}` })
          }
          continue
        }
      }
      f.vx = ((mdx / md) * f.spd * mv + (-mdy / md) * f.spd * 0.25 * Math.sin(f.t + f.max)) * sl + f.kx
      f.vy = ((mdy / md) * f.spd * mv + (mdx / md) * f.spd * 0.25 * Math.sin(f.t + f.max)) * sl + f.ky
      f.kx *= Math.max(0, 1 - dt * 7)
      f.ky *= Math.max(0, 1 - dt * 7)
      f.x = clamp(f.x + f.vx * dt, 10, W - 10)
      f.y = clamp(f.y + f.vy * dt, 10, H - 10)
      pushOut(f, f.r * 0.8)
      if (ringOut && Math.hypot(f.x - W / 2, f.y - H / 2) > ring.r + 4 && f.hp > 0) { C.add(60); say('RING OUT!'); hurtFoe(f, 9999) }
      for (const q of pits) if (f.hp > 0 && Math.hypot(f.x - q.x, f.y - q.y) < q.r) { C.add(40); hurtFoe(f, 9999) }
      const pspd = Math.hypot(P.vx, P.vy)
      const rams = vehicle && pspd > 150
      if (rams && d < f.r + 18 && f.hp > 0) {
        hurtFoe(f, 2 + pspd / 160)
        f.kx += (-dx / d) * 380
        f.ky += (-dy / d) * 380
        P.vx *= 0.75
        P.vy *= 0.75
        shake.kick(3)
      }
      if (f.kind === 'shooter' || f.kind === 'boss') {
        f.fire -= dt
        if (f.fire <= 0) {
          const a = Math.atan2(dy, dx)
          if (f.kind === 'shooter') {
            f.fire = byDiff(env, 2.6, 2.1, 1.7)
            buls.push({ x: f.x, y: f.y, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, life: 3, dmg: 1, pierce: 0, r: 5, hostile: true, hit: null })
          } else {
            f.fire = byDiff(env, 2.2, 1.7, 1.3)
            const n = 10 + env.difficulty * 2
            const o = rng() * TAU
            for (let i = 0; i < n; i++) buls.push({ x: f.x, y: f.y, vx: Math.cos(o + (i / n) * TAU) * 130, vy: Math.sin(o + (i / n) * TAU) * 130, life: 4, dmg: 1, pierce: 0, r: 5, hostile: true, hit: null })
            if (foes.length < 10) foes.push(mkFoe('grunt', f.x, f.y))
            env.sfx('shoot')
          }
        }
      }
      if (d < f.r + 11 && !rams) hurtPlayer(f.x, f.y)
    }
    // bullets
    for (const b of buls) {
      b.x += b.vx * dt
      b.y += b.vy * dt
      b.life -= dt
      if (b.bounce) {
        if (b.x < 0 || b.x > W) { b.vx = -b.vx; b.x = clamp(b.x, 0, W); b.bounce-- }
        if (b.y < 0 || b.y > H) { b.vy = -b.vy; b.y = clamp(b.y, 0, H); b.bounce-- }
      }
      if (b.x < 0 || b.x > W || b.y < 0 || b.y > H) b.life = 0
      if (weapon === 'paint' && !b.hostile) {
        const ci = Math.floor(clamp(b.y / H, 0, 0.999) * PG) * PG + Math.floor(clamp(b.x / W, 0, 0.999) * PG)
        if (!paintCells[ci]) { paintCells[ci] = 1; paintN++; if (paintN % 20 === 0) hud() }
      }
      for (const q of pillars) if ((b.x - q.x) ** 2 + (b.y - q.y) ** 2 < (q.r + b.r) ** 2) { b.life = 0; fx.burst(b.x, b.y, '#fff', 3, 80, 2) }
      if (b.life <= 0) continue
      if (b.hostile && shieldOn) {
        const bd = Math.hypot(b.x - P.x, b.y - P.y)
        let da = Math.atan2(b.y - P.y, b.x - P.x) - P.face
        da = Math.atan2(Math.sin(da), Math.cos(da))
        if (bd < 36 && Math.abs(da) < 1.0) { b.life = 0; fx.burst(b.x, b.y, '#fff', 3, 90, 2); env.sfx('click'); continue }
      }
      if (b.hostile) {
        if ((b.x - P.x) ** 2 + (b.y - P.y) ** 2 < (11 + b.r) ** 2) {
          hurtPlayer(b.x, b.y)
          b.life = 0
        }
      } else {
        for (const f of foes) {
          if (f.hp <= 0 || b.hit!.has(f)) continue
          if ((b.x - f.x) ** 2 + (b.y - f.y) ** 2 < (f.r + b.r) ** 2) {
            b.hit!.add(f)
            hurtFoe(f, b.dmg)
            if (b.stun) f.slow = 3
            if (b.hit!.size > b.pierce) { b.life = 0; break }
          }
        }
      }
    }
    buls = buls.filter((b) => b.life > 0)
    foes = foes.filter((f) => f.hp > 0)
    for (const s of sweeps) s.life -= dt
    sweeps = sweeps.filter((s) => s.life > 0)
    // pickups
    const mr = 30 + stat('magnet') * 50
    for (const p of picks) {
      p.life -= dt
      const dx = P.x - p.x
      const dy = P.y - p.y
      const d = Math.hypot(dx, dy) || 1
      if (d < mr + (stat('magnet') ? 30 : 0)) { p.x += (dx / d) * 260 * dt; p.y += (dy / d) * 260 * dt }
      if (d < 20) {
        p.life = 0
        env.sfx('point')
        if (p.k === 'heart') { P.hp = Math.min(P.max, P.hp + 1); hud() }
        else if (p.k === 'rapid') { P.rapid = 6; say('RAPID FIRE') }
        else C.add(50)
        fx.burst(p.x, p.y, t.good, 8, 120, 3)
      }
    }
    picks = picks.filter((p) => p.life > 0)
    // waves
    if (!queue.length && !foes.length && !C.over) {
      pause -= dt
      if (pause <= 0) {
        if (wave >= TOTAL) {
          C.over = true
          env.sfx('win')
          C.add(P.hp * 300)
          env.end({ score: C.score, won: true, text: `Cleared all ${TOTAL} waves` })
        } else if (needUpgrade) {
          choice = pickUpgrades(rng, S)
          needUpgrade = false
          pause = 0.8
        } else {
          startWave()
          needUpgrade = true
        }
      }
    }
    bannerT -= dt
  }

  const draw = () => {
    background(ctx, W, H, t, 30, env.seed)
    ctx.strokeStyle = t.fg
    ctx.globalAlpha = 0.06
    for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    ctx.globalAlpha = 1
    ctx.save()
    shake.apply(ctx)
    ctx.strokeStyle = t.accent
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.5
    ctx.strokeRect(2, 2, W - 4, H - 4)
    ctx.globalAlpha = 1
    if (weapon === 'paint') {
      ctx.fillStyle = t.accent
      ctx.globalAlpha = 0.28
      for (let i = 0; i < PG * PG; i++) if (paintCells[i]) ctx.fillRect((i % PG) * (W / PG), Math.floor(i / PG) * (H / PG), W / PG + 1, H / PG + 1)
      ctx.globalAlpha = 1
    }
    if (ringOut) {
      ctx.fillStyle = 'rgba(0,0,0,.55)'
      ctx.beginPath()
      ctx.rect(0, 0, W, H)
      ctx.arc(W / 2, H / 2, ring.r, 0, TAU, true)
      ctx.fill('evenodd')
      ctx.strokeStyle = t.danger
      ctx.lineWidth = 5
      ctx.shadowColor = t.danger
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(W / 2, H / 2, ring.r, 0, TAU)
      ctx.stroke()
      ctx.shadowBlur = 0
    }
    for (const q of pits) {
      ctx.fillStyle = '#111'
      ctx.beginPath()
      ctx.arc(q.x, q.y, q.r, 0, TAU)
      ctx.fill()
      ctx.fillStyle = '#cbd5e1'
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU
        ctx.beginPath()
        ctx.moveTo(q.x + Math.cos(a - 0.2) * q.r * 0.8, q.y + Math.sin(a - 0.2) * q.r * 0.8)
        ctx.lineTo(q.x + Math.cos(a) * q.r * 0.2, q.y + Math.sin(a) * q.r * 0.2)
        ctx.lineTo(q.x + Math.cos(a + 0.2) * q.r * 0.8, q.y + Math.sin(a + 0.2) * q.r * 0.8)
        ctx.fill()
      }
    }
    if (defend) {
      ctx.strokeStyle = t.good
      ctx.lineWidth = 3
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.arc(W / 2, H / 2, 28, 0, TAU)
      ctx.stroke()
      ctx.globalAlpha = 1
      emoji(ctx, t.items[0], W / 2, H / 2, 34)
      roundRect(ctx, W / 2 - 24, H / 2 + 32, 48, 5, 2, 'rgba(0,0,0,.5)')
      roundRect(ctx, W / 2 - 24, H / 2 + 32, 48 * (coreHp / coreMax), 5, 2, t.good)
    }
    for (const q of pillars) {
      ctx.fillStyle = 'rgba(0,0,0,.3)'
      ctx.beginPath()
      ctx.ellipse(q.x + 3, q.y + 6, q.r, q.r * 0.9, 0, 0, TAU)
      ctx.fill()
      ctx.fillStyle = t.blocks[Math.floor(q.r) % t.blocks.length]
      ctx.strokeStyle = 'rgba(255,255,255,.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(q.x, q.y, q.r, 0, TAU)
      ctx.fill()
      ctx.stroke()
    }
    for (const q of queue) {
      if (q.wait > 0.8) continue
      ctx.strokeStyle = t.danger
      ctx.globalAlpha = 0.4 + 0.4 * Math.sin(C.time * 18)
      ctx.beginPath()
      ctx.arc(q.x, q.y, 14 + q.wait * 12, 0, TAU)
      ctx.stroke()
      ctx.globalAlpha = 1
    }
    for (const p of picks) {
      ctx.globalAlpha = p.life < 2 ? 0.4 + 0.6 * Math.abs(Math.sin(C.time * 12)) : 1
      emoji(ctx, p.e, p.x, p.y + Math.sin(C.time * 4 + p.x) * 2, 18)
      ctx.globalAlpha = 1
    }
    for (const f of foes) {
      ctx.fillStyle = 'rgba(0,0,0,.25)'
      ctx.beginPath()
      ctx.ellipse(f.x, f.y + f.r * 0.8, f.r * 0.8, f.r * 0.3, 0, 0, TAU)
      ctx.fill()
      ctx.strokeStyle = t.danger
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.arc(f.x, f.y, f.r + 2, 0, TAU)
      ctx.stroke()
      ctx.globalAlpha = f.flash > 0 ? 0.55 : 1
      emoji(ctx, f.e, f.x, f.y, f.r * 2.2)
      ctx.globalAlpha = 1
      if (f.max > 2 && f.hp < f.max) {
        roundRect(ctx, f.x - f.r, f.y - f.r - 8, f.r * 2, 4, 2, 'rgba(0,0,0,.5)')
        roundRect(ctx, f.x - f.r, f.y - f.r - 8, f.r * 2 * (f.hp / f.max), 4, 2, t.danger)
      }
    }
    for (const s of sweeps) {
      ctx.globalAlpha = s.life / 0.18
      ctx.fillStyle = t.accent2
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.arc(s.x, s.y, s.r, s.a - s.w, s.a + s.w)
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1
    }
    for (const b of buls) {
      ctx.fillStyle = b.hostile ? t.danger : tankM ? '#fff' : t.accent2
      ctx.shadowColor = ctx.fillStyle
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, TAU)
      ctx.fill()
    }
    ctx.shadowBlur = 0
    if (P.beam > 0 && weapon === 'beam') {
      ctx.strokeStyle = '#fff'
      ctx.shadowColor = t.accent2
      ctx.shadowBlur = 16
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(P.x, P.y)
      ctx.lineTo(P.x + Math.cos(P.face) * 520, P.y + Math.sin(P.face) * 520)
      ctx.stroke()
      ctx.shadowBlur = 0
    }
    if (P.beam > 0 && weapon === 'pull') {
      ctx.strokeStyle = t.accent2
      ctx.globalAlpha = 0.5
      ctx.lineWidth = 2
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.arc(P.x, P.y, 230 - ((C.time * 160 + i * 77) % 230), 0, TAU)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
    if (shieldOn) {
      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 6
      ctx.shadowColor = '#38bdf8'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(P.x, P.y, 30, P.face - 1, P.face + 1)
      ctx.stroke()
      ctx.shadowBlur = 0
    }
    if (weapon === 'orbit') {
      ctx.fillStyle = t.accent2
      ctx.beginPath()
      ctx.arc(P.x + Math.cos(P.face) * 28, P.y + Math.sin(P.face) * 28, 6, 0, TAU)
      ctx.fill()
    }
    // player
    if (P.inv <= 0 || Math.floor(C.time * 16) % 2) {
      ctx.save()
      ctx.translate(P.x, P.y)
      if (tankM) {
        ctx.rotate(P.hull)
        roundRect(ctx, -17, -12, 34, 24, 5, t.accent, '#fff', 1.5)
        ctx.fillStyle = 'rgba(0,0,0,.35)'
        ctx.fillRect(-17, -12, 34, 4)
        ctx.fillRect(-17, 8, 34, 4)
        ctx.rotate(P.face - P.hull)
        roundRect(ctx, 0, -3.5, 26, 7, 2, t.accent2, '#fff', 1)
        ctx.rotate(-P.face)
      } else if (mode === 'melee' && P.swing > 0) ctx.rotate(Math.sin(P.swing * 30) * 0.15)
      ctx.shadowColor = t.accent
      ctx.shadowBlur = 10
      emoji(ctx, t.hero, 0, tankM ? 0 : 0, tankM ? 22 : 32)
      ctx.restore()
      ctx.shadowBlur = 0
      if (mode === 'melee') {
        ctx.strokeStyle = t.fg
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        const a = P.face + (P.swing > 0 ? (0.18 - P.swing) * 11 - 1 : 0)
        ctx.beginPath()
        ctx.moveTo(P.x + Math.cos(a) * 16, P.y + Math.sin(a) * 16)
        ctx.lineTo(P.x + Math.cos(a) * 36, P.y + Math.sin(a) * 36)
        ctx.stroke()
        ctx.lineCap = 'butt'
      }
    }
    if (P.dashCd > 0) {
      roundRect(ctx, P.x - 14, P.y + 20, 28, 3, 1.5, 'rgba(0,0,0,.5)')
      roundRect(ctx, P.x - 14, P.y + 20, 28 * (1 - P.dashCd / 1.6), 3, 1.5, t.accent)
    }
    fx.draw(ctx)
    ctx.restore()
    if (dark) {
      const g = ctx.createRadialGradient(P.x, P.y, 50, P.x, P.y, 190)
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(1, 'rgba(0,0,0,.93)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
    }
    if (!touch && ptr.active) {
      ctx.strokeStyle = t.fg
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(ptr.x, ptr.y, 8, 0, TAU)
      ctx.moveTo(ptr.x - 13, ptr.y)
      ctx.lineTo(ptr.x - 4, ptr.y)
      ctx.moveTo(ptr.x + 13, ptr.y)
      ctx.lineTo(ptr.x + 4, ptr.y)
      ctx.stroke()
    }
    if (combo >= 3) text(ctx, `${combo} COMBO`, W - 70, H - 14, { size: 10, color: t.accent })
    if (bannerT > 0) {
      ctx.globalAlpha = Math.min(1, bannerT * 2)
      text(ctx, banner, W / 2, 64, { size: 22, color: t.fg, shadow: t.accent })
      ctx.globalAlpha = 1
    }
    if (choice) {
      ctx.fillStyle = 'rgba(0,0,0,.65)'
      ctx.fillRect(0, 0, W, H)
      text(ctx, 'CHOOSE AN UPGRADE', W / 2, 78, { size: 16, color: t.fg, shadow: t.accent })
      choice.forEach((u, i) => {
        const x = W / 2 + (i - 1) * 190
        roundRect(ctx, x - 80, H / 2 - 80, 160, 160, 12, t.bg2, t.accent, 3)
        emoji(ctx, u.icon, x, H / 2 - 30, 44)
        text(ctx, u.name.toUpperCase(), x, H / 2 + 22, { size: 12, color: t.fg })
        text(ctx, u.desc.length > 20 ? u.desc.slice(0, 18) + '…' : u.desc, x, H / 2 + 46, { size: 7, color: t.accent2 })
        text(ctx, String(i + 1), x, H / 2 + 68, { size: 10, color: t.accent })
      })
    }
  }
  return { update, draw }
}

// ---------------------------------------------------------------- io
function ioMode(C: Ctx): Mode {
  const { env, ctx, k, ptr, fx } = C
  const t = env.theme
  const rng = env.rng
  const WW = 1500
  const WH = 950
  const target = byDiff(env, 80, 100, 125)
  const me = { x: WW / 2, y: WH / 2, r: 16, alive: true }
  interface Dot { x: number; y: number; c: string }
  interface Blob { x: number; y: number; r: number; e: string; tx: number; ty: number; wander: number; spd: number }
  const dots: Dot[] = []
  const blobs: Blob[] = []
  const mkDot = (): Dot => ({ x: rng.range(20, WW - 20), y: rng.range(20, WH - 20), c: rng.pick(t.blocks) })
  for (let i = 0; i < 220; i++) dots.push(mkDot())
  const mkBlob = (far: boolean): Blob => {
    let x = rng.range(40, WW - 40)
    let y = rng.range(40, WH - 40)
    if (far) for (let i = 0; i < 10 && Math.hypot(x - me.x, y - me.y) < 400; i++) { x = rng.range(40, WW - 40); y = rng.range(40, WH - 40) }
    return { x, y, r: rng.range(10, 20 + env.difficulty * 10 + (me.r - 16) * 0.8), e: rng.pick([...t.foes, ...t.heroes]), tx: x, ty: y, wander: 0, spd: 1 }
  }
  for (let i = 0; i < byDiff(env, 9, 12, 15); i++) blobs.push(mkBlob(true))
  let eaten = 0
  const hud = () => env.status(`Size ${Math.round(me.r)}/${target}`)
  hud()
  C.ptr.onDown(() => { C.intro = Math.min(C.intro, 0) })
  k.onKey((e) => { if (C.intro > 0.2 && !e.repeat) C.intro = 0 })
  const zoom = () => clamp(1 - (me.r - 16) * 0.0065, 0.5, 1)
  const cam = () => {
    const z = zoom()
    return { z, x: clamp(me.x - W / 2 / z, 0, Math.max(0, WW - W / z)), y: clamp(me.y - H / 2 / z, 0, Math.max(0, WH - H / z)) }
  }
  const lost = () => {
    C.over = true
    env.sfx('lose')
    fx.burst(me.x, me.y, t.danger, 40, 260, 4)
    env.end({ score: C.score, won: false, text: `Grew to size ${Math.round(me.r)}` })
  }
  const update = (dt: number) => {
    if (!me.alive) return
    const ax = k.axis()
    let dx = 0
    let dy = 0
    const c = cam()
    if (ax.x || ax.y) { dx = ax.x; dy = ax.y }
    else if (ptr.active) {
      dx = ptr.x / c.z + c.x - me.x
      dy = ptr.y / c.z + c.y - me.y
      const d = Math.hypot(dx, dy)
      if (d < 8) { dx = 0; dy = 0 } else { dx /= d; dy /= d }
    }
    const speed = 210 * Math.pow(16 / me.r, 0.28) * (env.mods.has('fast') ? 1.2 : 1)
    me.x = clamp(me.x + dx * speed * dt, me.r, WW - me.r)
    me.y = clamp(me.y + dy * speed * dt, me.r, WH - me.r)
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i]
      if ((d.x - me.x) ** 2 + (d.y - me.y) ** 2 < (me.r + 3) ** 2) {
        me.r = grow(me.r, 3.2)
        dots[i] = mkDot()
        C.add(1)
        env.sfx('point')
      }
    }
    for (const b of blobs) {
      b.wander -= dt
      let fx2 = 0
      let fy2 = 0
      let best = 1e9
      let tx = b.tx
      let ty = b.ty
      const threats: { x: number; y: number; r: number }[] = [me, ...blobs.filter((o) => o !== b)]
      for (const o of threats) {
        const d = Math.hypot(o.x - b.x, o.y - b.y)
        if (o.r > b.r * 1.12 && d < 240 + o.r) { fx2 += (b.x - o.x) / d; fy2 += (b.y - o.y) / d }
        else if (b.r > o.r * 1.15 && d < 280 && d < best) { best = d; tx = o.x; ty = o.y }
      }
      if (fx2 || fy2) { tx = b.x + fx2 * 100; ty = b.y + fy2 * 100 }
      else if (best >= 1e9 && b.wander <= 0) {
        const dd = dots[rng.int(0, dots.length - 1)]
        b.tx = dd.x
        b.ty = dd.y
        b.wander = rng.range(1.5, 4)
        tx = b.tx
        ty = b.ty
      } else if (best >= 1e9) { tx = b.tx; ty = b.ty }
      const d = Math.hypot(tx - b.x, ty - b.y) || 1
      const sp = 190 * Math.pow(16 / b.r, 0.28) * byDiff(env, 0.8, 0.92, 1.02)
      b.x = clamp(b.x + ((tx - b.x) / d) * sp * dt, b.r, WW - b.r)
      b.y = clamp(b.y + ((ty - b.y) / d) * sp * dt, b.r, WH - b.r)
      for (let i = 0; i < dots.length; i++) if ((dots[i].x - b.x) ** 2 + (dots[i].y - b.y) ** 2 < b.r * b.r) { b.r = grow(b.r, 3); dots[i] = mkDot() }
    }
    // eating
    for (let i = blobs.length - 1; i >= 0; i--) {
      const b = blobs[i]
      const d = Math.hypot(b.x - me.x, b.y - me.y)
      if (d < Math.max(b.r, me.r) * 0.85) {
        if (me.r > b.r * 1.12) {
          me.r = grow(me.r, b.r)
          eaten++
          C.add(b.r * 5)
          fx.burst(b.x, b.y, t.good, 16, 200, 3.5)
          env.sfx('boom')
          blobs[i] = mkBlob(true)
        } else if (b.r > me.r * 1.12) {
          me.alive = false
          lost()
          return
        }
      }
    }
    for (let i = 0; i < blobs.length; i++)
      for (let j = i + 1; j < blobs.length; j++) {
        const a = blobs[i]
        const b = blobs[j]
        if (Math.hypot(a.x - b.x, a.y - b.y) < Math.max(a.r, b.r) * 0.85) {
          if (a.r > b.r * 1.12) { a.r = grow(a.r, b.r); blobs[j] = mkBlob(true) }
          else if (b.r > a.r * 1.12) { b.r = grow(b.r, a.r); blobs[i] = mkBlob(true) }
        }
      }
    for (const b of blobs) b.r = Math.min(b.r, 70 + env.difficulty * 15 + me.r * 0.35)
    C.score = Math.max(C.score, C.score)
    hud()
    if (me.r >= target) {
      C.over = true
      env.sfx('win')
      C.add(500)
      env.end({ score: C.score, won: true, text: `Reached size ${Math.round(me.r)}, ate ${eaten} blobs` })
    }
  }
  const draw = () => {
    background(ctx, W, H, t, 0)
    const c = cam()
    ctx.save()
    ctx.scale(c.z, c.z)
    ctx.translate(-c.x, -c.y)
    ctx.strokeStyle = t.fg
    ctx.globalAlpha = 0.07
    ctx.lineWidth = 1
    for (let x = 0; x <= WW; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WH); ctx.stroke() }
    for (let y = 0; y <= WH; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WW, y); ctx.stroke() }
    ctx.globalAlpha = 1
    ctx.strokeStyle = t.accent
    ctx.lineWidth = 6
    ctx.strokeRect(0, 0, WW, WH)
    for (const d of dots) {
      if (d.x < c.x - 10 || d.x > c.x + W / c.z + 10 || d.y < c.y - 10 || d.y > c.y + H / c.z + 10) continue
      ctx.fillStyle = d.c
      ctx.beginPath()
      ctx.arc(d.x, d.y, 4, 0, TAU)
      ctx.fill()
    }
    const blob = (x: number, y: number, r: number, col: string, e: string, mine: boolean) => {
      ctx.shadowColor = col
      ctx.shadowBlur = mine ? 20 : 8
      ctx.fillStyle = col
      ctx.globalAlpha = 0.35
      ctx.beginPath()
      ctx.arc(x, y, r, 0, TAU)
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.strokeStyle = col
      ctx.lineWidth = Math.max(2, r * 0.08)
      ctx.stroke()
      ctx.shadowBlur = 0
      emoji(ctx, e, x, y, r * 1.3)
    }
    for (const b of blobs) blob(b.x, b.y, b.r, b.r > me.r * 1.12 ? t.danger : b.r * 1.12 < me.r ? t.good : t.accent2, b.e, false)
    if (me.alive) blob(me.x, me.y, me.r, t.accent, t.hero, true)
    fx.draw(ctx)
    ctx.restore()
    // leaderboard
    const rows = [{ n: 'YOU', r: me.r }, ...blobs.map((b, i) => ({ n: `BOT ${i + 1}`, r: b.r }))].sort((a, b) => b.r - a.r).slice(0, 5)
    rows.forEach((r, i) => text(ctx, `${i + 1} ${r.n} ${Math.round(r.r)}`, W - 10, 14 + i * 13, { size: 8, color: r.n === 'YOU' ? t.accent : t.fg, align: 'right' }))
    roundRect(ctx, 10, H - 14, 160, 6, 3, 'rgba(0,0,0,.5)')
    roundRect(ctx, 10, H - 14, 160 * clamp((me.r - 16) / (target - 16), 0, 1), 6, 3, t.accent)
  }
  return { update, draw }
}

// ---------------------------------------------------------------- asteroids
function asteroids(C: Ctx): Mode {
  const { env, ctx, k, ptr, fx, shake } = C
  const t = env.theme
  const rng = env.rng
  const TOTAL = byDiff(env, 5, 7, 9)
  const touch = isTouch()
  const ship = { x: W / 2, y: H / 2, vx: 0, vy: 0, a: -Math.PI / 2, inv: 2, hp: byDiff(env, 5, 4, 3), cd: 0, jump: 0 }
  interface Rock { x: number; y: number; vx: number; vy: number; s: 1 | 2 | 3; r: number; rot: number; vr: number; shape: number[]; e: string }
  let rocks: Rock[] = []
  let bullets: { x: number; y: number; vx: number; vy: number; life: number; hostile: boolean }[] = []
  let ufo: { x: number; y: number; vx: number; t: number; fire: number } | null = null
  let wave = 0
  let pause = 1.2
  let banner = ''
  let bannerT = 0
  const hud = () => env.status(`Wave ${Math.min(wave, TOTAL)}/${TOTAL} · ${'❤️'.repeat(Math.max(0, ship.hp))}`)
  const mkRock = (x: number, y: number, s: 1 | 2 | 3, vx?: number, vy?: number): Rock => {
    const a = rng.range(0, TAU)
    const sp = rng.range(25, 55) * (4 - s) * 0.6 * (1 + wave * 0.05) * byDiff(env, 0.8, 1, 1.15)
    const r = s === 3 ? 38 : s === 2 ? 22 : 12
    return { x, y, vx: vx ?? Math.cos(a) * sp, vy: vy ?? Math.sin(a) * sp, s, r, rot: 0, vr: rng.range(-1, 1), shape: Array.from({ length: 11 }, () => rng.range(0.78, 1.15)), e: t.foes[s % t.foes.length] }
  }
  const startWave = () => {
    wave++
    const n = 2 + wave + env.difficulty
    for (let i = 0; i < n; i++) {
      let x = rng.range(0, W)
      let y = rng.range(0, H)
      for (let j = 0; j < 8 && Math.hypot(x - ship.x, y - ship.y) < 140; j++) { x = rng.range(0, W); y = rng.range(0, H) }
      rocks.push(mkRock(x, y, 3))
    }
    banner = wave >= TOTAL ? 'FINAL WAVE' : `WAVE ${wave}`
    bannerT = 1.6
    ufo = null
    env.sfx('power')
    hud()
  }
  const wrap = (o: { x: number; y: number }, m = 0) => {
    if (o.x < -m) o.x += W + 2 * m
    if (o.x > W + m) o.x -= W + 2 * m
    if (o.y < -m) o.y += H + 2 * m
    if (o.y > H + m) o.y -= H + 2 * m
  }
  const hit = () => {
    if (ship.inv > 0 || C.over) return
    ship.hp--
    ship.inv = 2.4
    ship.vx = ship.vy = 0
    ship.x = W / 2
    ship.y = H / 2
    shake.kick(10)
    env.sfx('lose')
    fx.burst(ship.x, ship.y, t.danger, 40, 260, 4)
    hud()
    if (ship.hp <= 0) {
      C.over = true
      env.end({ score: C.score, won: false, text: `Reached wave ${wave} of ${TOTAL}` })
    }
  }
  const shoot = () => {
    ship.cd = 0.22
    bullets.push({ x: ship.x + Math.cos(ship.a) * 16, y: ship.y + Math.sin(ship.a) * 16, vx: ship.vx + Math.cos(ship.a) * 460, vy: ship.vy + Math.sin(ship.a) * 460, life: 1.05, hostile: false })
    env.sfx('shoot')
  }
  ptr.onDown(() => { C.intro = Math.min(C.intro, 0) })
  k.onKey((e) => { if (C.intro > 0.2 && !e.repeat) C.intro = 0 })
  const split = (r: Rock) => {
    C.add(r.s === 3 ? 20 : r.s === 2 ? 50 : 100)
    fx.burst(r.x, r.y, t.accent2, 10 + r.s * 4, 160, 3)
    env.sfx('boom')
    shake.kick(r.s)
    if (r.s > 1) for (let i = 0; i < 2; i++) rocks.push(mkRock(r.x, r.y, (r.s - 1) as 1 | 2, r.vx + rng.range(-60, 60), r.vy + rng.range(-60, 60)))
  }
  hud()
  const update = (dt: number) => {
    ship.inv = Math.max(0, ship.inv - dt)
    ship.cd -= dt
    ship.jump -= dt
    const ax = k.axis()
    const mouse = !touch && ptr.active && !ax.x
    if (mouse) {
      const want = Math.atan2(ptr.y - ship.y, ptr.x - ship.x)
      let da = want - ship.a
      da = Math.atan2(Math.sin(da), Math.cos(da))
      ship.a += clamp(da, -6 * dt, 6 * dt)
    } else ship.a += ax.x * 4.2 * dt
    const thrust = ax.y < 0
    if (thrust) {
      ship.vx += Math.cos(ship.a) * 260 * dt
      ship.vy += Math.sin(ship.a) * 260 * dt
      if (Math.random() < 0.7) fx.burst(ship.x - Math.cos(ship.a) * 14, ship.y - Math.sin(ship.a) * 14, t.accent2, 1, 60, 2.5)
    }
    const f = Math.pow(0.6, dt)
    ship.vx *= f
    ship.vy *= f
    ship.x += ship.vx * dt
    ship.y += ship.vy * dt
    wrap(ship, 8)
    if ((k.down('a') || ptr.down) && ship.cd <= 0 && C.intro <= 0.15) shoot()
    if (k.hit('b') && ship.jump <= 0) {
      ship.jump = 3
      fx.burst(ship.x, ship.y, '#fff', 12, 160, 3)
      ship.x = rng.range(40, W - 40)
      ship.y = rng.range(40, H - 40)
      ship.vx = ship.vy = 0
      ship.inv = Math.max(ship.inv, 0.8)
      env.sfx('move')
    }
    for (const r of rocks) {
      r.x += r.vx * dt
      r.y += r.vy * dt
      r.rot += r.vr * dt
      wrap(r, r.r)
      if (ship.inv <= 0 && (r.x - ship.x) ** 2 + (r.y - ship.y) ** 2 < (r.r * 0.85 + 9) ** 2) hit()
    }
    for (const b of bullets) {
      b.x += b.vx * dt
      b.y += b.vy * dt
      b.life -= dt
      wrap(b)
      if (b.hostile) {
        if (ship.inv <= 0 && (b.x - ship.x) ** 2 + (b.y - ship.y) ** 2 < 14 * 14) { b.life = 0; hit() }
        continue
      }
      for (let i = 0; i < rocks.length; i++) {
        const r = rocks[i]
        if ((b.x - r.x) ** 2 + (b.y - r.y) ** 2 < r.r * r.r) {
          b.life = 0
          rocks.splice(i, 1)
          split(r)
          break
        }
      }
      if (ufo && b.life > 0 && (b.x - ufo.x) ** 2 + (b.y - ufo.y) ** 2 < 18 * 18) {
        b.life = 0
        C.add(300)
        fx.burst(ufo.x, ufo.y, t.accent, 24, 240, 4)
        env.sfx('boom')
        ufo = null
      }
    }
    bullets = bullets.filter((b) => b.life > 0)
    if (ufo) {
      ufo.t += dt
      ufo.x += ufo.vx * dt
      ufo.y += Math.sin(ufo.t * 2) * 40 * dt
      ufo.fire -= dt
      if (ufo.fire <= 0) {
        ufo.fire = byDiff(env, 2.4, 1.8, 1.3)
        const a = Math.atan2(ship.y - ufo.y, ship.x - ufo.x) + rng.range(-0.3, 0.3)
        bullets.push({ x: ufo.x, y: ufo.y, vx: Math.cos(a) * 190, vy: Math.sin(a) * 190, life: 2.5, hostile: true })
      }
      if (ufo.x < -40 || ufo.x > W + 40) ufo = null
      else if (ship.inv <= 0 && (ufo.x - ship.x) ** 2 + (ufo.y - ship.y) ** 2 < 24 * 24) hit()
    } else if (rocks.length && wave >= 2 && rng.chance(dt * 0.05)) {
      const left = rng() < 0.5
      ufo = { x: left ? -30 : W + 30, y: rng.range(60, H - 60), vx: left ? 90 : -90, t: 0, fire: 1 }
    }
    if (!rocks.length && !C.over) {
      pause -= dt
      if (pause <= 0) {
        if (wave >= TOTAL) {
          C.over = true
          env.sfx('win')
          C.add(ship.hp * 400)
          env.end({ score: C.score, won: true, text: `Cleared all ${TOTAL} waves` })
        } else {
          pause = 1.4
          startWave()
        }
      }
    }
    bannerT -= dt
  }
  const draw = () => {
    background(ctx, W, H, t, 60, env.seed)
    ctx.save()
    shake.apply(ctx)
    for (const r of rocks) {
      ctx.save()
      ctx.translate(r.x, r.y)
      ctx.rotate(r.rot)
      ctx.beginPath()
      r.shape.forEach((m, i) => {
        const a = (i / r.shape.length) * TAU
        if (i) ctx.lineTo(Math.cos(a) * r.r * m, Math.sin(a) * r.r * m)
        else ctx.moveTo(Math.cos(a) * r.r * m, Math.sin(a) * r.r * m)
      })
      ctx.closePath()
      ctx.fillStyle = t.blocks[r.s % t.blocks.length]
      ctx.globalAlpha = 0.28
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.strokeStyle = t.blocks[r.s % t.blocks.length]
      ctx.shadowColor = ctx.strokeStyle
      ctx.shadowBlur = 8
      ctx.lineWidth = 2.5
      ctx.stroke()
      ctx.restore()
      ctx.shadowBlur = 0
      if (r.s >= 2) emoji(ctx, r.e, r.x, r.y, r.r * 1.1)
    }
    if (ufo) emoji(ctx, '🛸', ufo.x, ufo.y, 34)
    ctx.shadowBlur = 8
    for (const b of bullets) {
      ctx.fillStyle = b.hostile ? t.danger : '#fff'
      ctx.shadowColor = ctx.fillStyle
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.hostile ? 4 : 3, 0, TAU)
      ctx.fill()
    }
    ctx.shadowBlur = 0
    if (!C.over && (ship.inv <= 0 || Math.floor(C.time * 14) % 2)) {
      ctx.save()
      ctx.translate(ship.x, ship.y)
      ctx.rotate(ship.a)
      ctx.strokeStyle = t.accent
      ctx.shadowColor = t.accent
      ctx.shadowBlur = 10
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(24, 0)
      ctx.lineTo(-12, -13)
      ctx.lineTo(-6, 0)
      ctx.lineTo(-12, 13)
      ctx.closePath()
      ctx.stroke()
      ctx.restore()
      ctx.shadowBlur = 0
      emoji(ctx, t.hero, ship.x, ship.y, 24)
    }
    fx.draw(ctx)
    ctx.restore()
    if (bannerT > 0) text(ctx, banner, W / 2, 60, { size: 22, color: t.fg, shadow: t.accent })
    if (ship.jump > 0) roundRect(ctx, 10, H - 14, 60 * (1 - ship.jump / 3), 5, 2, t.accent)
    if (C.intro > 0 || C.time < 6) text(ctx, '←→ ROTATE · ↑ THRUST · SPACE FIRE · B JUMP', W / 2, H - 16, { size: 8, color: t.fg })
  }
  return { update, draw }
}

const engine: Engine = {
  start(env) {
    const { theme: t, mods } = env
    const hr = env.host.getBoundingClientRect()
    const portrait = hr.height > hr.width * 1.1
    W = portrait ? 450 : 720
    H = portrait ? 720 : 450
    const st = createStage(env.host, W, H)
    const k = keys()
    const ptr = pointer(st)
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const io = mods.has('io') || IO_RE.test(env.name)
    const ast = /asteroid/i.test(env.name)
    const tank = mods.has('tank') || /\btank/i.test(env.name)
    const melee = mods.has('melee') || MELEE_RE.test(`${env.name} ${env.desc}`)
    const kind = ast ? 'asteroids' : io && !(tank && /battle/i.test(`${env.name} ${env.desc}`) || mods.has('battle') && tank) ? 'io' : tank ? 'tank' : melee ? 'melee' : 'shooter'
    bag.add(vpad(env.host, k, 'dpad', kind === 'io' ? [] : kind === 'asteroids' ? [{ action: 'a', label: '🔥' }, { action: 'b', label: '🌀' }] : [{ action: 'b', label: '💨' }]))
    const C: Ctx = {
      env, st, ctx: st.ctx, k, ptr, fx, shake, time: 0, intro: 2.6, over: false, score: 0,
      add(n) {
        C.score += Math.round(n)
        env.score(C.score)
      },
      card() {},
    }
    const mode = kind === 'asteroids' ? asteroids(C) : kind === 'io' ? ioMode(C) : combat(C, kind)
    env.score(0)
    const hint = { shooter: 'WASD MOVE · MOUSE AIM+CLICK · SHIFT DASH', melee: 'WASD MOVE · CLICK TO SWING · SHIFT DASH', tank: 'WASD DRIVE · MOUSE AIMS TURRET · CLICK FIRE', io: 'MOUSE / WASD · EAT SMALLER · AVOID BIGGER', asteroids: 'ARROWS / MOUSE · SPACE FIRE · WRAP-AROUND' }[kind]
    const update = (dt: number) => {
      C.time += dt
      fx.update(dt)
      shake.update(dt)
      if (C.intro > 0) C.intro -= dt
      if (C.over) return
      if (C.intro > 0.15) return
      mode.update(dt)
    }
    const draw = () => {
      mode.draw()
      const c = st.ctx
      if (C.intro > 0) {
        const a = Math.min(1, C.intro * 3)
        c.fillStyle = `rgba(0,0,0,${0.6 * a})`
        c.fillRect(0, 0, W, H)
        c.globalAlpha = a
        emoji(c, t.hero, W / 2, H / 2 - 82, 64 + Math.sin(C.time * 5) * 3)
        text(c, env.name.toUpperCase(), W / 2, H / 2 - 28, { size: env.name.length > 24 ? 15 : 22, color: t.fg, shadow: t.accent })
        text(c, env.desc.slice(0, 56), W / 2, H / 2 + 6, { size: 9, color: t.accent2 })
        text(c, hint, W / 2, H / 2 + 44, { size: 9, color: t.fg })
        c.globalAlpha = 1
      }
    }
    const lp = loop(update, draw)
    return {
      pause: (p) => lp.pause(p),
      destroy() {
        lp.stop()
        k.dispose()
        ptr.dispose()
        bag.dispose()
        st.dispose()
      },
    }
  },
}

export default engine
