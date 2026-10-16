// Breakout: seeded brick layouts, multi-hit and indestructible bricks, power-ups, lives, levels.
// Mods: gravity (ball curves), rotate / name "orbit"|"circular" (polar variant), boss (moving boss brick).
import { background, Bag, byDiff, clamp, createStage, emoji, hitRectCircle, keys, loop, Particles, pointer, roundRect, Shake, text, vpad, type Engine } from '../kit'
import { genLevel, type Cell } from '../logic/breakout'

let W = 600
let H = 420
let COLS = 12
let BW = 44
const BH = 18
const GAP = 4
let OX = 0
const BR = 6
let PY = 0
// polar geometry
let CX = 0
let CY = 0
const R0 = 62
const RH = 20
const RP = 196
const SEGS = 20
const TAU = Math.PI * 2

type PowerKind = 'wide' | 'multi' | 'laser' | 'slow' | 'sticky' | 'life'
const PU: Record<PowerKind, { e: string; c: string }> = {
  wide: { e: '↔️', c: '#38bdf8' }, multi: { e: '✨', c: '#f472b6' }, laser: { e: '⚡', c: '#facc15' },
  slow: { e: '🐢', c: '#4ade80' }, sticky: { e: '🧲', c: '#fb923c' }, life: { e: '❤️', c: '#f87171' },
}
interface Brick { hp: number; max: number; ind: boolean; x: number; y: number; r: number; s: number; flash: number }
interface Ball { x: number; y: number; vx: number; vy: number; stuck: boolean; off: number; trail: number[] }

const engine: Engine = {
  start(env) {
    const { theme: t, rng, mods } = env
    const hr = env.host.getBoundingClientRect()
    const portrait = hr.height > hr.width * 1.1
    W = portrait ? 450 : 600
    H = portrait ? 640 : 420
    COLS = portrait ? 9 : 12
    BW = Math.floor((W - 24) / COLS) - GAP
    OX = (W - COLS * (BW + GAP) + GAP) / 2
    PY = H - 40
    CX = W / 2
    CY = H / 2
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const k = keys()
    const ptr = pointer(st)
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const polar = mods.has('rotate') || /orbit|circular/i.test(env.name)
    const curve = mods.has('gravity')
    const boss = mods.has('boss') && !polar
    const TOTAL = byDiff(env, 4, 5, 6)
    const baseSpeed = byDiff(env, 290, 330, 370) * (mods.has('fast') ? 1.2 : 1) * (mods.has('slow') ? 0.85 : 1)
    const bag2 = vpad(env.host, k, 'lr', [{ action: 'a', label: '●' }])
    bag.add(bag2)

    let level = 1
    let lives = byDiff(env, 5, 4, 3) + (mods.has('zen') ? 3 : 0)
    let score = 0
    let combo = 0
    let time = 0
    let over = false
    let intro = 2.4
    let bricks: Brick[] = []
    let balls: Ball[] = []
    let drops: { x: number; y: number; k: PowerKind }[] = []
    let shots: { x: number; y: number }[] = []
    let bossShots: { x: number; y: number; vx: number; vy: number }[] = []
    let eff: Record<'wide' | 'laser' | 'slow' | 'sticky', number> = { wide: 0, laser: 0, slow: 0, sticky: 0 }
    let px = W / 2
    let pa = -Math.PI / 2 // polar paddle angle
    let laserT = 0
    let msg = ''
    let msgT = 0
    let bossB: { x: number; y: number; w: number; h: number; hp: number; max: number; t: number; shot: number; flash: number } | null = null
    let curveDir = 1
    let curveT = 0

    const pw = () => (eff.wide > 0 ? 1.55 : 1) * (polar ? 0.3 : 46)
    const status = () => env.status(`Level ${level}/${TOTAL} · ${'❤️'.repeat(Math.max(0, lives))}`)
    const addScore = (n: number) => {
      score += Math.round(n)
      env.score(score)
    }
    const say = (s: string) => {
      msg = s
      msgT = 1.4
    }

    const build = () => {
      const rows = polar ? Math.min(6, 3 + Math.ceil(level / 2)) : Math.min(boss ? 6 : 9, 4 + Math.floor(level / 2) + env.difficulty)
      const cols = polar ? SEGS : COLS
      const g: Cell[][] = genLevel(rng, { cols, rows, level, diff: env.difficulty, indestructible: true })
      bricks = []
      const oy = boss ? 120 : 50
      g.forEach((row, r) =>
        row.forEach((v, c) => {
          if (!v) return
          bricks.push({ hp: v < 0 ? 1 : v, max: v < 0 ? 1 : v, ind: v < 0, x: OX + c * (BW + GAP), y: oy + r * (BH + GAP), r, s: c, flash: 0 })
        }),
      )
      bossB = boss ? { x: W / 2, y: 62, w: 96, h: 46, hp: 14 + level * 8 + env.difficulty * 6, max: 14 + level * 8 + env.difficulty * 6, t: 0, shot: 2.5, flash: 0 } : null
      drops = []
      shots = []
      bossShots = []
    }
    const lookup = new Map<string, Brick>()
    const idx = () => {
      lookup.clear()
      for (const b of bricks) lookup.set(`${b.r},${b.s}`, b)
    }
    const prepare = () => {
      build()
      idx()
      serve()
    }
    const speed = () => Math.min(baseSpeed * (1 + 0.06 * (level - 1)), baseSpeed * 1.6) * (eff.slow > 0 ? 0.65 : 1)
    const serve = () => {
      balls = [{ x: 0, y: 0, vx: 0, vy: 0, stuck: true, off: 0, trail: [] }]
      eff = { wide: 0, laser: 0, slow: 0, sticky: 0 }
      placeStuck()
    }
    const placeStuck = () => {
      for (const b of balls)
        if (b.stuck) {
          if (polar) {
            const a = pa + b.off
            b.x = CX + Math.cos(a) * (RP - 24)
            b.y = CY + Math.sin(a) * (RP - 24)
          } else {
            b.x = px + b.off
            b.y = PY - BR - 18
          }
        }
    }
    const launch = () => {
      for (const b of balls)
        if (b.stuck) {
          b.stuck = false
          const s = speed()
          if (polar) {
            const a = pa + b.off + Math.PI + rng.range(-0.25, 0.25)
            b.vx = Math.cos(a) * s
            b.vy = Math.sin(a) * s
          } else {
            const a = -Math.PI / 2 + clamp(b.off / 46, -1, 1) * 0.9 + rng.range(-0.1, 0.1)
            b.vx = Math.cos(a) * s
            b.vy = Math.sin(a) * s
          }
          env.sfx('click')
        }
    }
    const act = () => {
      if (intro > 0) intro = 0
      if (balls.some((b) => b.stuck)) launch()
    }
    ptr.onDown(act)
    ptr.onMove((p) => {
      if (polar) pa = Math.atan2(p.y - CY, p.x - CX)
      else px = clamp(p.x, pw() + 4, W - pw() - 4)
    })
    k.onKey((e) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowUp') act()
      else if (intro > 0.2 && !e.repeat) intro = 0
    })

    const brickAt = (x: number, y: number): Brick | null => {
      if (polar) {
        const dx = x - CX
        const dy = y - CY
        const r = Math.hypot(dx, dy)
        const ring = Math.floor((r - R0) / RH)
        if (ring < 0) return null
        let a = Math.atan2(dy, dx)
        if (a < 0) a += TAU
        return lookup.get(`${ring},${Math.floor(a / (TAU / SEGS)) % SEGS}`) ?? null
      }
      const c = Math.floor((x - OX) / (BW + GAP))
      const oy = boss ? 120 : 50
      const r = Math.floor((y - oy) / (BH + GAP))
      return lookup.get(`${r},${c}`) ?? null
    }
    const center = (b: Brick) => {
      if (!polar) return { x: b.x + BW / 2, y: b.y + BH / 2 }
      const a = (b.s + 0.5) * (TAU / SEGS)
      const r = R0 + (b.r + 0.5) * RH
      return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r }
    }

    const dropChance = () => byDiff(env, 0.22, 0.17, 0.13)
    const hurt = (b: Brick, dmg = 1) => {
      const c = center(b)
      if (b.ind) {
        fx.burst(c.x, c.y, '#cbd5e1', 3, 70, 2)
        env.sfx('click')
        return
      }
      b.hp -= dmg
      b.flash = 0.12
      if (b.hp > 0) {
        env.sfx('hit')
        addScore(5 * (1 + combo * 0.1))
        return
      }
      lookup.delete(`${b.r},${b.s}`)
      bricks.splice(bricks.indexOf(b), 1)
      combo++
      const col = t.blocks[b.r % t.blocks.length]
      fx.burst(c.x, c.y, col, 14, 190, 3.5)
      env.sfx('point')
      if (b.max > 1) shake.kick(2)
      addScore(10 * b.max * Math.min(4, 1 + Math.floor(combo / 6)))
      if (rng.chance(dropChance())) {
        const kinds: PowerKind[] = ['wide', 'wide', 'multi', 'multi', 'laser', 'slow', 'sticky', 'sticky', 'life']
        drops.push({ x: c.x, y: c.y, k: lives < 6 && rng.chance(0.1) ? 'life' : rng.pick(kinds) })
      }
    }

    const loseLife = () => {
      lives--
      combo = 0
      shake.kick(8)
      env.sfx('boom')
      fx.burst(polar ? CX : px, polar ? CY : PY, t.danger, 30, 240, 4)
      status()
      if (lives <= 0) {
        over = true
        env.sfx('lose')
        env.end({ score, won: false, text: `Reached level ${level} of ${TOTAL}` })
      } else {
        balls = [{ x: 0, y: 0, vx: 0, vy: 0, stuck: true, off: 0, trail: [] }]
        eff = { wide: 0, laser: 0, slow: 0, sticky: 0 }
        bossShots = []
        drops = []
        say('Get ready')
      }
    }

    const collect = (kd: PowerKind) => {
      env.sfx('power')
      addScore(50)
      say({ wide: 'Wide paddle', multi: 'Multiball', laser: 'Laser', slow: 'Slow ball', sticky: 'Sticky paddle', life: 'Extra life' }[kd])
      if (kd === 'multi') {
        const src = balls.find((b) => !b.stuck) ?? balls[0]
        for (const d of [-0.5, 0.5]) {
          if (balls.length >= 12) break
          const a = Math.atan2(src.vy || -1, src.vx || 0) + d
          const s = speed()
          balls.push({ x: src.x, y: src.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, stuck: false, off: 0, trail: [] })
        }
      } else if (kd === 'life') {
        lives = Math.min(9, lives + 1)
        status()
      } else eff[kd] = 12
    }

    const nextLevel = () => {
      addScore(100 * level)
      if (level >= TOTAL) {
        over = true
        env.sfx('win')
        env.end({ score: score + lives * 200, won: true, text: `Cleared all ${TOTAL} levels` })
        addScore(lives * 200)
        return
      }
      level++
      env.sfx('win')
      say(`Level ${level}`)
      prepare()
      status()
    }

    const stepBall = (b: Ball, dt: number) => {
      const s = Math.hypot(b.vx, b.vy) || 1
      const target = speed()
      // ease speed toward target (slow / level ramp)
      const f = 1 + (target / s - 1) * Math.min(1, dt * 4)
      b.vx *= f
      b.vy *= f
      if (curve) {
        const w = (polar ? 1.1 : 0.9) * curveDir
        const c = Math.cos(w * dt)
        const sn = Math.sin(w * dt)
        const nx = b.vx * c - b.vy * sn
        b.vy = b.vx * sn + b.vy * c
        b.vx = nx
      }
      const sp = Math.hypot(b.vx, b.vy)
      const n = Math.max(1, Math.ceil((sp * dt) / 4))
      const h = dt / n
      for (let i = 0; i < n; i++) {
        const ox = b.x
        const oy = b.y
        b.x += b.vx * h
        b.y += b.vy * h
        if (polar) polarStep(b, ox, oy)
        else linearStep(b)
        if (b.stuck) return
      }
      b.trail.push(b.x, b.y)
      if (b.trail.length > 16) b.trail.splice(0, 2)
    }

    const linearStep = (b: Ball) => {
      if (b.x < BR) { b.x = BR; b.vx = Math.abs(b.vx); env.sfx('click') }
      if (b.x > W - BR) { b.x = W - BR; b.vx = -Math.abs(b.vx); env.sfx('click') }
      if (b.y < BR) { b.y = BR; b.vy = Math.abs(b.vy); env.sfx('click') }
      // bricks
      const oy = boss ? 120 : 50
      const c0 = Math.floor((b.x - BR - OX) / (BW + GAP))
      const r0 = Math.floor((b.y - BR - oy) / (BH + GAP))
      for (let r = r0; r <= r0 + 1; r++)
        for (let c = c0; c <= c0 + 1; c++) {
          const br = lookup.get(`${r},${c}`)
          if (!br || !hitRectCircle(br.x, br.y, BW, BH, b.x, b.y, BR)) continue
          const dx = (BW / 2 + BR) - Math.abs(b.x - (br.x + BW / 2))
          const dy = (BH / 2 + BR) - Math.abs(b.y - (br.y + BH / 2))
          if (dx < dy) {
            b.vx = (b.x < br.x + BW / 2 ? -1 : 1) * Math.abs(b.vx)
            b.x += b.vx > 0 ? dx : -dx
          } else {
            b.vy = (b.y < br.y + BH / 2 ? -1 : 1) * Math.abs(b.vy)
            b.y += b.vy > 0 ? dy : -dy
          }
          hurt(br)
          return
        }
      if (bossB && hitRectCircle(bossB.x - bossB.w / 2, bossB.y - bossB.h / 2, bossB.w, bossB.h, b.x, b.y, BR)) {
        const dx = bossB.w / 2 + BR - Math.abs(b.x - bossB.x)
        const dy = bossB.h / 2 + BR - Math.abs(b.y - bossB.y)
        if (dx < dy) b.vx = (b.x < bossB.x ? -1 : 1) * Math.abs(b.vx)
        else {
          b.vy = (b.y < bossB.y ? -1 : 1) * Math.abs(b.vy)
          b.y += b.vy > 0 ? dy : -dy
        }
        hitBoss(1)
      }
      // paddle
      if (b.vy > 0 && b.y + BR >= PY && b.y + BR <= PY + 14 && Math.abs(b.x - px) <= pw() + BR) {
        const off = clamp((b.x - px) / pw(), -1, 1)
        if (eff.sticky > 0) {
          b.stuck = true
          b.off = clamp(b.x - px, -pw(), pw())
          b.vx = b.vy = 0
          placeStuck()
        } else {
          const s = Math.hypot(b.vx, b.vy)
          const a = -Math.PI / 2 + off * 1.05
          b.vx = Math.cos(a) * s
          b.vy = Math.sin(a) * s
          b.y = PY - BR
        }
        combo = 0
        env.sfx('move')
        fx.burst(b.x, PY, t.accent, 5, 90, 2)
      }
      if (b.y > H + 20) b.x = -999
    }

    const polarStep = (b: Ball, ox: number, oy: number) => {
      const dx = b.x - CX
      const dy = b.y - CY
      const r = Math.hypot(dx, dy)
      const nx = dx / r
      const ny = dy / r
      const reflect = (ax: number, ay: number) => {
        const d = b.vx * ax + b.vy * ay
        b.vx -= 2 * d * ax
        b.vy -= 2 * d * ay
      }
      if (r < 40) { // core
        reflect(nx, ny)
        if (b.vx * nx + b.vy * ny < 0) { b.vx = -b.vx; b.vy = -b.vy }
        b.x = CX + nx * 41
        b.y = CY + ny * 41
        return
      }
      const sp = Math.hypot(b.vx, b.vy) || 1
      const px2 = b.x + (b.vx / sp) * BR
      const py2 = b.y + (b.vy / sp) * BR
      const br = brickAt(px2, py2)
      if (br) {
        const prev = brickAt(ox + (b.vx / sp) * BR, oy + (b.vy / sp) * BR)
        const pr = Math.hypot(ox - CX, oy - CY)
        const radial = !prev || prev.r !== br.r || Math.floor((pr - R0) / RH) !== br.r
        if (radial) reflect(nx, ny)
        else reflect(-ny, nx)
        b.x = ox
        b.y = oy
        hurt(br)
        return
      }
      // paddle arc
      if (r + BR >= RP - 4 && b.vx * nx + b.vy * ny > 0) {
        let da = Math.atan2(dy, dx) - pa
        da = Math.atan2(Math.sin(da), Math.cos(da))
        if (Math.abs(da) <= pw() + 0.06) {
          const off = clamp(da / pw(), -1, 1)
          const s = Math.hypot(b.vx, b.vy)
          if (eff.sticky > 0) {
            b.stuck = true
            b.off = da
            b.vx = b.vy = 0
            placeStuck()
          } else {
            const a = Math.atan2(-ny, -nx) + off * 0.9
            b.vx = Math.cos(a) * s
            b.vy = Math.sin(a) * s
            b.x = CX + nx * (RP - BR - 5)
            b.y = CY + ny * (RP - BR - 5)
          }
          combo = 0
          env.sfx('move')
          fx.burst(b.x, b.y, t.accent, 5, 90, 2)
        }
      }
      if (r > RP + 34) b.x = -999
    }

    const hitBoss = (dmg: number) => {
      if (!bossB) return
      bossB.hp -= dmg
      bossB.flash = 0.1
      env.sfx('hit')
      addScore(25)
      fx.burst(bossB.x, bossB.y, t.danger, 8, 160, 3)
      shake.kick(3)
      if (bossB.hp <= 0) {
        fx.burst(bossB.x, bossB.y, t.accent2, 60, 320, 5)
        shake.kick(12)
        env.sfx('boom')
        addScore(500 * level)
        bossB = null
        bossShots = []
        say('Boss down')
      }
    }

    const update = (dt: number) => {
      time += dt
      fx.update(dt)
      shake.update(dt)
      msgT -= dt
      if (intro > 0) intro -= dt
      if (over) return
      const ax = k.axis().x
      if (ax) {
        if (polar) pa += ax * 3.2 * dt
        else px = clamp(px + ax * 520 * dt, pw() + 4, W - pw() - 4)
      }
      if (!polar) px = clamp(px, pw() + 4, W - pw() - 4)
      for (const key of ['wide', 'laser', 'slow', 'sticky'] as const) {
        const was = eff[key]
        eff[key] = Math.max(0, was - dt)
        if (key === 'sticky' && was > 0 && eff.sticky <= 0) launch()
      }
      curveT += dt
      if (curveT > 4) {
        curveT = 0
        curveDir = -curveDir
      }
      placeStuck()
      if (intro > 0.15) return
      if (k.hit('a')) act()
      for (const b of balls) if (!b.stuck) stepBall(b, dt)
      balls = balls.filter((b) => b.x > -900)
      if (balls.length === 0 && !over) loseLife()
      for (const b of bricks) b.flash = Math.max(0, b.flash - dt)
      // power-ups
      for (const d of drops) {
        let hit: boolean
        if (polar) {
          const a = Math.atan2(d.y - CY, d.x - CX)
          d.x += Math.cos(a) * 110 * dt
          d.y += Math.sin(a) * 110 * dt
          const da = Math.atan2(Math.sin(a - pa), Math.cos(a - pa))
          hit = Math.hypot(d.x - CX, d.y - CY) > RP - 8 && Math.abs(da) < pw() + 0.1
        } else {
          d.y += 120 * dt
          hit = d.y > PY - 8 && d.y < PY + 16 && Math.abs(d.x - px) < pw() + 14
        }
        if (hit) {
          collect(d.k)
          d.y = 9999
        }
      }
      drops = drops.filter((d) => (polar ? Math.hypot(d.x - CX, d.y - CY) < RP + 40 && d.y < 9000 : d.y < H + 20))
      // lasers
      if (eff.laser > 0) {
        laserT -= dt
        if (laserT <= 0) {
          laserT = 0.28
          env.sfx('shoot')
          const w = polar ? 0 : pw()
          if (polar) shots.push({ x: CX + Math.cos(pa) * (RP - 8), y: CY + Math.sin(pa) * (RP - 8) })
          else {
            shots.push({ x: px - w + 4, y: PY - 6 })
            shots.push({ x: px + w - 4, y: PY - 6 })
          }
        }
      }
      for (const s of shots) {
        if (polar) {
          const a = Math.atan2(s.y - CY, s.x - CX)
          s.x -= Math.cos(a) * 560 * dt
          s.y -= Math.sin(a) * 560 * dt
        } else s.y -= 560 * dt
        const br = brickAt(s.x, s.y)
        if (br) {
          hurt(br)
          s.y = polar ? -9999 : -999
          s.x = polar ? -9999 : s.x
        } else if (bossB && Math.abs(s.x - bossB.x) < bossB.w / 2 && Math.abs(s.y - bossB.y) < bossB.h / 2) {
          hitBoss(1)
          s.y = -999
        } else if (polar && Math.hypot(s.x - CX, s.y - CY) < 40) s.y = -9999
      }
      shots = shots.filter((s) => s.y > -50)
      // boss
      if (bossB) {
        bossB.t += dt
        bossB.flash = Math.max(0, bossB.flash - dt)
        bossB.x = W / 2 + Math.sin(bossB.t * (0.9 + level * 0.12)) * (W / 2 - bossB.w / 2 - 20)
        bossB.y = 62 + Math.sin(bossB.t * 1.7) * 8
        bossB.shot -= dt
        if (bossB.shot <= 0) {
          bossB.shot = byDiff(env, 3.2, 2.5, 1.9) - level * 0.1
          for (const dx of [-60, 0, 60]) bossShots.push({ x: bossB.x, y: bossB.y + 20, vx: dx, vy: 150 })
          env.sfx('shoot')
        }
      }
      for (const s of bossShots) {
        s.x += s.vx * dt * 0.4
        s.y += s.vy * dt
        if (s.y > PY - 6 && s.y < PY + 14 && Math.abs(s.x - px) < pw() + 6) {
          s.y = 9999
          loseLife()
          break
        }
      }
      bossShots = bossShots.filter((s) => s.y < H)
      if (!over && !bossB && !bricks.some((b) => !b.ind)) nextLevel()
    }

    prepare()
    status()
    env.score(0)

    const brickColor = (b: Brick) => (b.ind ? '#64748b' : t.blocks[b.r % t.blocks.length])
    const drawBrick = (b: Brick) => {
      const col = brickColor(b)
      if (!polar) {
        roundRect(ctx, b.x, b.y, BW, BH, 4, col)
        ctx.fillStyle = 'rgba(255,255,255,.22)'
        ctx.fillRect(b.x + 3, b.y + 2, BW - 6, 3)
        ctx.fillStyle = 'rgba(0,0,0,.25)'
        ctx.fillRect(b.x + 2, b.y + BH - 5, BW - 4, 4)
        if (b.ind) {
          ctx.strokeStyle = '#e2e8f0'
          ctx.lineWidth = 2
          ctx.strokeRect(b.x + 3, b.y + 3, BW - 6, BH - 6)
        } else if (b.max > 1) {
          text(ctx, String(b.hp), b.x + BW / 2, b.y + BH / 2 + 1, { size: 9, color: '#fff', shadow: '#000' })
        }
        if (b.flash > 0) {
          ctx.fillStyle = `rgba(255,255,255,${b.flash * 6})`
          ctx.fillRect(b.x, b.y, BW, BH)
        }
      } else {
        const a0 = b.s * (TAU / SEGS) + 0.012
        const a1 = (b.s + 1) * (TAU / SEGS) - 0.012
        const r0 = R0 + b.r * RH + 1
        const r1 = R0 + (b.r + 1) * RH - 1
        ctx.beginPath()
        ctx.arc(CX, CY, r1, a0, a1)
        ctx.arc(CX, CY, r0, a1, a0, true)
        ctx.closePath()
        ctx.fillStyle = b.flash > 0 ? '#fff' : col
        ctx.fill()
        if (b.ind) {
          ctx.strokeStyle = '#e2e8f0'
          ctx.lineWidth = 2
          ctx.stroke()
        } else if (b.max > 1) {
          ctx.strokeStyle = 'rgba(0,0,0,.45)'
          ctx.lineWidth = 3 - Math.min(2, b.hp - 1) * 0.5
          ctx.stroke()
        }
      }
    }

    const draw = () => {
      background(ctx, W, H, t, 50, env.seed)
      ctx.save()
      shake.apply(ctx)
      if (polar) {
        ctx.strokeStyle = t.fg
        ctx.globalAlpha = 0.08
        ctx.lineWidth = 1
        for (let r = R0; r < RP; r += RH) {
          ctx.beginPath()
          ctx.arc(CX, CY, r, 0, TAU)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        const g = ctx.createRadialGradient(CX, CY, 4, CX, CY, 48)
        g.addColorStop(0, t.accent2)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(CX, CY, 48, 0, TAU)
        ctx.fill()
        ctx.strokeStyle = t.accent
        ctx.globalAlpha = 0.25
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(CX, CY, RP, 0, TAU)
        ctx.stroke()
        ctx.globalAlpha = 1
      } else {
        ctx.strokeStyle = t.accent
        ctx.globalAlpha = 0.4
        ctx.lineWidth = 2
        ctx.strokeRect(1, 1, W - 2, H - 2)
        ctx.globalAlpha = 1
      }
      for (const b of bricks) drawBrick(b)
      if (bossB) {
        const bb = bossB
        ctx.shadowColor = t.danger
        ctx.shadowBlur = 18
        roundRect(ctx, bb.x - bb.w / 2, bb.y - bb.h / 2, bb.w, bb.h, 12, bb.flash > 0 ? '#fff' : '#1e293b', t.danger, 3)
        ctx.shadowBlur = 0
        emoji(ctx, t.foes[0], bb.x, bb.y - 2, 36)
        roundRect(ctx, bb.x - 40, bb.y + bb.h / 2 + 3, 80, 6, 3, 'rgba(0,0,0,.5)')
        roundRect(ctx, bb.x - 40, bb.y + bb.h / 2 + 3, 80 * (bb.hp / bb.max), 6, 3, t.danger)
      }
      // power-ups
      for (const d of drops) {
        const p = PU[d.k]
        roundRect(ctx, d.x - 15, d.y - 10, 30, 20, 10, p.c, '#fff', 2)
        emoji(ctx, p.e, d.x, d.y, 14)
      }
      ctx.fillStyle = '#fff'
      ctx.shadowColor = t.accent
      ctx.shadowBlur = 8
      for (const s of shots) ctx.fillRect(s.x - 1.5, s.y - 7, 3, 12)
      ctx.shadowBlur = 0
      for (const s of bossShots) {
        ctx.fillStyle = t.danger
        ctx.beginPath()
        ctx.arc(s.x, s.y, 5, 0, TAU)
        ctx.fill()
      }
      // paddle + hero
      const pc = eff.laser > 0 ? '#facc15' : t.accent
      ctx.shadowColor = pc
      ctx.shadowBlur = 14
      if (polar) {
        ctx.strokeStyle = pc
        ctx.lineWidth = 9
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.arc(CX, CY, RP, pa - pw(), pa + pw())
        ctx.stroke()
        ctx.lineCap = 'butt'
        ctx.shadowBlur = 0
        emoji(ctx, t.hero, CX + Math.cos(pa) * (RP - 18 + Math.sin(time * 6) * 1.5), CY + Math.sin(pa) * (RP - 18), 26, pa + Math.PI / 2)
      } else {
        roundRect(ctx, px - pw(), PY, pw() * 2, 10, 5, pc)
        ctx.shadowBlur = 0
        if (eff.sticky > 0) {
          ctx.fillStyle = '#fb923c'
          ctx.fillRect(px - pw() + 4, PY - 2, pw() * 2 - 8, 3)
        }
        emoji(ctx, t.hero, px, PY - 11 + Math.sin(time * 8) * 1.2, 28)
      }
      // balls
      for (const b of balls) {
        for (let i = 0; i < b.trail.length; i += 2) {
          ctx.globalAlpha = (i / b.trail.length) * 0.4
          ctx.fillStyle = t.accent2
          ctx.beginPath()
          ctx.arc(b.trail[i], b.trail[i + 1], BR * (i / b.trail.length), 0, TAU)
          ctx.fill()
        }
        ctx.globalAlpha = 1
        ctx.shadowColor = '#fff'
        ctx.shadowBlur = 12
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(b.x, b.y, BR, 0, TAU)
        ctx.fill()
        ctx.shadowBlur = 0
      }
      fx.draw(ctx)
      ctx.restore()
      // HUD
      let ex = 8
      for (const key of ['wide', 'laser', 'slow', 'sticky'] as const)
        if (eff[key] > 0) {
          const p = PU[key]
          roundRect(ctx, ex, H - 16, 40, 8, 4, 'rgba(0,0,0,.4)')
          roundRect(ctx, ex, H - 16, 40 * Math.min(1, eff[key] / 12), 8, 4, p.c)
          emoji(ctx, p.e, ex + 8, H - 24, 12)
          ex += 48
        }
      if (combo >= 4) text(ctx, `x${Math.min(4, 1 + Math.floor(combo / 6))} combo ${combo}`, W - 90, H - 12, { size: 9, color: t.accent2 })
      if (msgT > 0 && intro <= 0) text(ctx, msg, W / 2, polar ? 26 : H - 90, { size: 14, color: t.fg, shadow: t.accent })
      if (balls.some((b) => b.stuck) && intro <= 0 && !over) text(ctx, 'CLICK / SPACE TO LAUNCH', W / 2, polar ? CY + 4 : H - 96 + (msgT > 0 ? 24 : 0), { size: 10, color: t.fg })
      if (intro > 0) {
        const a = Math.min(1, intro * 3)
        ctx.fillStyle = `rgba(0,0,0,${0.55 * a})`
        ctx.fillRect(0, 0, W, H)
        ctx.globalAlpha = a
        emoji(ctx, t.hero, W / 2, H / 2 - 74, 60 + Math.sin(time * 5) * 3)
        text(ctx, env.name.toUpperCase(), W / 2, H / 2 - 20, { size: env.name.length > 22 ? 16 : 22, color: t.fg, shadow: t.accent })
        text(ctx, env.desc, W / 2, H / 2 + 14, { size: 9, color: t.accent2 })
        text(ctx, polar ? 'MOUSE / ARROWS ROTATE THE PADDLE' : 'MOUSE / TOUCH / ARROWS MOVE THE PADDLE', W / 2, H / 2 + 52, { size: 9, color: t.fg })
        ctx.globalAlpha = 1
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
