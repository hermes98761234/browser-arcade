// Stack: classic slab stacker (perfect-drop bonus, rising camera) and a physics-flavoured balance mode where
// dropped shapes can topple (static centre-of-mass model from logic/stack.ts). Tap / click / Space to drop.
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, pointer, roundRect, Shake, text, type Engine, type GameEnv, type Stage } from '../kit'
import { bestSpot, canMove, canPull, hanoiPar, hanoiSolved, moveDisc, newHanoi, newTower, pullCollapses, pullZone, putOnTop, tiltOf, tips, MAX_TILT, type Layer, type Pegs, type Weight } from '../logic/stack-modes'
import { cutSlab, findToppling, groupOf, landingY, stabilityOf, topOf, type Blk, type Platform, type Slab } from '../logic/stack'

let W = 800
let H = 450

interface Scene {
  update(dt: number): void
  draw(): void
}
interface Ctx {
  env: GameEnv
  st: Stage
  c: CanvasRenderingContext2D
  k: ReturnType<typeof keys>
  bag: Bag
  fx: Particles
  shake: Shake
}

function intro(c: CanvasRenderingContext2D, env: GameEnv, hint: string, tt: number) {
  if (tt > 3) return
  c.globalAlpha = tt < 2.4 ? 1 : 1 - (tt - 2.4) / 0.6
  const y0 = 8
  roundRect(c, W / 2 - Math.min(300, W / 2 - 4), y0, Math.min(600, W - 8), 44, 10, 'rgba(0,0,0,.6)')
  text(c, env.name.length > 34 ? env.name.slice(0, 33) + '…' : env.name, W / 2, y0 + 14, { size: W < 600 ? 9 : 12, color: env.theme.accent })
  text(c, hint, W / 2, y0 + 32, { size: W < 600 ? 7 : 9, color: env.theme.fg })
  c.globalAlpha = 1
}

function sky(c: CanvasRenderingContext2D, env: GameEnv, alt: number) {
  const t = env.theme
  background(c, W, H, t, 0)
  // stars appear with altitude
  const a = clamp(alt / 1500, 0, 0.9)
  c.fillStyle = 'rgba(0,0,12,' + a * 0.6 + ')'
  c.fillRect(0, 0, W, H)
  c.fillStyle = t.fg
  for (let i = 0; i < 40; i++) {
    const x = (i * 97.3) % W
    const y = (((i * 53.7 + alt * 0.12 * (0.3 + (i % 5) * 0.2)) % H) + H) % H
    c.globalAlpha = (0.15 + (i % 4) * 0.1) * (0.4 + a)
    c.fillRect(x, y, 1.6, 1.6)
  }
  c.globalAlpha = 1
}

// ---------- classic ----------

function classic(G: Ctx): Scene {
  const { env, c, fx, shake } = G
  const t = env.theme
  const SH = 28
  const w0 = W < 600 ? 210 : 250
  const goal = byDiff(env, 25, 40, 60)
  const tol = byDiff(env, 7, 5, 3.5)
  const fast = env.mods.has('fast') ? 1.25 : 1
  const floorY = H - 70
  let tower: { x: number; w: number; color: string; item: string }[] = [{ x: (W - w0) / 2, w: w0, color: t.blocks[0], item: t.items[0] }]
  let cur: Slab = { x: 0, w: w0 }
  let dir = 1
  let cam = 0
  let camT = 0
  let score = 0
  let combo = 0
  let over = false
  let tt = 0
  let shownMsg = ''
  let msgT = 0
  const chops: { x: number; y: number; w: number; vy: number; vx: number; rot: number; vr: number; color: string }[] = []
  const speed = () => (byDiff(env, 150, 200, 250) + tower.length * 7) * fast
  const floors = () => tower.length - 1
  const colorOf = (n: number) => t.blocks[Math.floor(n / 2) % t.blocks.length]

  const hud = () => {
    env.score(score)
    env.status(`Level ${1 + Math.floor(floors() / 10)} · floor ${floors()}/${goal}${combo > 1 ? ` · perfect x${combo}` : ''}`)
  }
  const spawn = () => {
    const last = tower[tower.length - 1]
    cur = { x: dir > 0 ? 0 : W - last.w, w: last.w }
    dir = -dir
  }
  const yOf = (n: number) => floorY - n * SH + cam
  const finish = (won: boolean) => {
    if (over) return
    over = true
    env.sfx(won ? 'win' : 'lose')
    setTimeout(() => env.end({ score, won, text: won ? `Tower of ${goal} floors!` : `Built ${floors()} floors` }), won ? 900 : 1100)
  }
  const drop = () => {
    if (over) return
    const below = tower[tower.length - 1]
    const r = cutSlab({ x: below.x, w: below.w }, cur, tol)
    const y = yOf(tower.length)
    if (!r.slab) {
      chops.push({ x: cur.x, y, w: cur.w, vy: 0, vx: 0, rot: 0, vr: 0, color: colorOf(tower.length) })
      env.sfx('hit')
      shake.kick(6)
      cur = { x: -999, w: 0 }
      finish(false)
      return
    }
    if (r.chop) chops.push({ x: r.chop.x, y, w: r.chop.w, vy: 0, vx: (r.chop.x > r.slab.x ? 1 : -1) * 40, rot: 0, vr: (r.chop.x > r.slab.x ? 1 : -1) * 0.8, color: colorOf(tower.length) })
    if (r.perfect) {
      combo++
      score += 25 * combo
      env.sfx('power')
      fx.burst(r.slab.x + r.slab.w / 2, y + SH / 2, '#fff', 14, 220, 3)
      fx.burst(r.slab.x + r.slab.w / 2, y + SH / 2, t.accent, 16, 160, 3)
      shownMsg = combo > 2 ? `PERFECT x${combo}` : 'PERFECT!'
      msgT = 0.9
      if (combo >= 3 && r.slab.w < w0) r.slab.w = Math.min(w0, r.slab.w + 8)
    } else {
      combo = 0
      env.sfx('point')
      fx.burst(r.slab.x + r.slab.w / 2, y + SH / 2, t.blocks[0], 6, 100, 2)
    }
    score += 10 + Math.floor(floors() / 5)
    tower.push({ x: r.slab.x, w: r.slab.w, color: colorOf(tower.length), item: t.items[tower.length % t.items.length] })
    camT = Math.max(0, (tower.length - 1) * SH - (floorY - H * 0.52))
    hud()
    if (floors() >= goal) return finish(true)
    spawn()
  }
  G.k.onKey((e) => {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowDown' || e.code === 'KeyS') drop()
  })
  const ptr = pointer(G.st)
  G.bag.add(() => ptr.dispose())
  ptr.onDown((p) => {
    if (p.button !== 2) drop()
  })
  spawn()
  hud()

  return {
    update(dt) {
      tt += dt
      fx.update(dt, 300)
      shake.update(dt)
      msgT -= dt
      cam += (camT - cam) * Math.min(1, dt * 4)
      for (const ch of chops) {
        ch.vy += 900 * dt
        ch.y += ch.vy * dt
        ch.x += ch.vx * dt
        ch.rot += ch.vr * dt
      }
      for (let i = chops.length - 1; i >= 0; i--) if (chops[i].y > H + 200) chops.splice(i, 1)
      if (over) return
      cur.x += dir * -1 * speed() * dt
      if (cur.x < 0) {
        cur.x = 0
        dir = -dir
      } else if (cur.x + cur.w > W) {
        cur.x = W - cur.w
        dir = -dir
      }
    },
    draw() {
      c.save()
      sky(c, env, tower.length * SH)
      shake.apply(c)
      // ground
      c.fillStyle = 'rgba(0,0,0,.35)'
      c.fillRect(0, floorY + SH + cam, W, H)
      const slab = (x: number, y: number, w: number, color: string, item?: string, a = 1) => {
        c.globalAlpha = a
        roundRect(c, x, y, w, SH - 2, 5, color, 'rgba(0,0,0,.35)', 1.5)
        c.fillStyle = 'rgba(255,255,255,.25)'
        c.fillRect(x + 3, y + 3, w - 6, 5)
        c.fillStyle = 'rgba(0,0,0,.18)'
        c.fillRect(x + 3, y + SH - 9, w - 6, 5)
        if (item) emoji(c, item, x + w / 2, y + SH / 2 - 1, SH * 0.7)
        c.globalAlpha = 1
      }
      for (let i = 0; i < tower.length; i++) {
        const y = yOf(i)
        if (y > H + SH || y < -SH) continue
        slab(tower[i].x, y, tower[i].w, tower[i].color, i % 2 === 0 ? tower[i].item : undefined)
      }
      for (const ch of chops) {
        c.save()
        c.translate(ch.x + ch.w / 2, ch.y + SH / 2)
        c.rotate(ch.rot)
        slab(-ch.w / 2, -SH / 2, ch.w, ch.color, undefined, 0.85)
        c.restore()
      }
      if (!over && cur.w > 0) {
        const y = yOf(tower.length)
        slab(cur.x, y, cur.w, colorOf(tower.length), t.items[tower.length % t.items.length])
        // the hero rides the slab
        emoji(c, t.hero, cur.x + cur.w / 2, y - 22 + Math.sin(tt * 8) * 2, 38, Math.sin(tt * 5) * 0.12)
        // guide edge lines
        const b = tower[tower.length - 1]
        c.strokeStyle = 'rgba(255,255,255,.15)'
        c.setLineDash([4, 6])
        c.beginPath()
        c.moveTo(b.x, y + SH)
        c.lineTo(b.x, 0)
        c.moveTo(b.x + b.w, y + SH)
        c.lineTo(b.x + b.w, 0)
        c.stroke()
        c.setLineDash([])
      }
      fx.draw(c)
      c.restore()
      text(c, `${floors()}`, W / 2, 80, { size: W < 600 ? 40 : 54, color: t.fg, shadow: t.accent })
      if (msgT > 0) {
        c.globalAlpha = Math.min(1, msgT * 2)
        text(c, shownMsg, W / 2, 130, { size: 18, color: t.accent2, shadow: t.accent2 })
        c.globalAlpha = 1
      }
      intro(c, env, 'TAP / CLICK / SPACE to drop · line it up!', tt)
    },
  }
}

// ---------- balance (drop shapes, they can topple) ----------

interface B extends Blk {
  color: string
  item: string
  risk: number
  wob: number
}
interface Debris {
  x: number
  y: number
  w: number
  h: number
  vx: number
  vy: number
  rot: number
  vr: number
  color: string
  item: string
}

function balance(G: Ctx): Scene {
  const { env, c, fx, shake } = G
  const t = env.theme
  const moon = env.mods.has('gravity') || /moon|lunar/i.test(env.name)
  const wind = env.mods.has('wind') || /wind|feather/i.test(env.name)
  const ice = env.mods.has('ice') || /\bice\b/i.test(env.name)
  const levels = byDiff(env, 4, 5, 6)
  const grip = ice ? 7 : byDiff(env, -6, 0, 3)
  const platW = byDiff(env, 280, 240, 200) * (W < 600 ? 0.85 : 1)
  const plat: Platform = { x0: -platW / 2, x1: platW / 2 }
  const groundY = H - 90
  let blocks: B[] = []
  const debris: Debris[] = []
  let lives = byDiff(env, 5, 4, 3)
  let level = 1
  let score = 0
  let cam = 0
  let camT = 0
  let tt = 0
  let over = false
  let nextShape = mkShape()
  let falling: (Debris & { drifting: number }) | null = null
  let swing = 0
  let msg = ''
  let msgT = 0
  let pause = 0
  let after: (() => void) | null = null
  let nid = 1
  const height = () => blocks.reduce((m, b) => Math.max(m, topOf(b)), 0)
  const goal = () => 120 + level * 90
  const ex = () => W / 2
  const amp = () => Math.min(W / 2 - 70, 210)

  function mkShape(): { w: number; h: number; color: string; item: string } {
    const kinds: [number, number][] = [[100, 22], [60, 60], [36, 76], [76, 34], [120, 26], [48, 44], [84, 48]]
    const [w0, h0] = env.rng.pick(kinds)
    const j = env.rng.range(0.9, 1.1)
    return { w: Math.round(w0 * j), h: Math.round(h0 * j), color: env.rng.pick(t.blocks), item: env.rng.pick(t.items) }
  }
  const hud = () => {
    env.score(score)
    env.status(`Level ${level}/${levels} · ${Math.round(height())}/${goal()} m · ${'❤️'.repeat(Math.max(0, lives))}`)
  }
  const loseLife = (why: string) => {
    lives--
    msg = why
    msgT = 1.2
    shake.kick(8)
    env.sfx('lose')
    if (lives <= 0) {
      over = true
      pause = 1.2
      after = () => env.end({ score, won: false, text: `Tower reached ${Math.round(height())} m (level ${level})` })
    }
    hud()
  }
  const refreshRisk = () => {
    for (const b of blocks) b.risk = stabilityOf(blocks, plat, b, grip).ratio
  }
  const settle = (d: Debris) => {
    const x = d.x
    const y = landingY(blocks, plat, x, d.w)
    const nb: B = { id: nid++, x, y, w: d.w, h: d.h, color: d.color, item: d.item, risk: 0, wob: 0.6 }
    blocks.push(nb)
    env.sfx('click')
    fx.burst(ex() + x + d.w / 2, groundY - y + cam, t.fg, 6, 90, 2)
    score += 10
    let guard = 0
    for (let tp = findToppling(blocks, plat, grip); tp && guard < 10; tp = findToppling(blocks, plat, grip), guard++) {
      const g = groupOf(blocks, plat, tp.block)
      const ids = new Set(g.map((q) => q.id))
      for (const q of g as B[]) debris.push({ x: q.x, y: q.y, w: q.w, h: q.h, vx: tp.dir * (50 + (q.y - tp.block.y) * 0.8), vy: 0, rot: 0, vr: tp.dir * (1.5 + Math.random()), color: q.color, item: q.item })
      blocks = blocks.filter((q) => !ids.has(q.id))
      loseLife(g.length > 1 ? 'Toppled!' : 'It fell off!')
      env.sfx('hit')
    }
    refreshRisk()
    camT = Math.max(0, height() - (groundY - H * 0.55))
    hud()
    if (!over && height() >= goal()) {
      score += 100 * level
      env.sfx('win')
      fx.burst(ex(), H / 2, t.good, 40, 260, 4)
      if (level >= levels) {
        over = true
        msg = 'Skyscraper!'
        msgT = 99
        pause = 1.5
        after = () => env.end({ score, won: true, text: `Balanced a ${Math.round(height())} m tower` })
      } else {
        level++
        msg = `Level ${level}!`
        msgT = 1.2
      }
      hud()
    }
  }
  const release = () => {
    if (over || pause > 0 || falling) return
    const x = Math.sin(swing) * amp() - nextShape.w / 2
    falling = { x, y: groundY + cam - 96 - nextShape.h, w: nextShape.w, h: nextShape.h, vx: 0, vy: 0, rot: 0, vr: 0, color: nextShape.color, item: nextShape.item, drifting: wind ? env.rng.range(-35, 35) : 0 }
    env.sfx('move')
  }
  G.k.onKey((e) => {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowDown' || e.code === 'KeyS') release()
  })
  const ptr = pointer(G.st)
  G.bag.add(() => ptr.dispose())
  ptr.onDown((p) => {
    if (p.button !== 2) release()
  })
  hud()

  // The falling shape's `y` is a world height measured upwards from the platform top.
  return {
    update(dt) {
      tt += dt
      fx.update(dt, 300)
      shake.update(dt)
      msgT -= dt
      cam += (camT - cam) * Math.min(1, dt * 3)
      swing += dt * (1.3 + level * 0.18 + byDiff(env, 0, 0.2, 0.45))
      for (const b of blocks) b.wob = Math.max(0, b.wob - dt)
      for (const d of debris) {
        d.vy += 1100 * dt
        d.y -= d.vy * dt
        d.x += d.vx * dt
        d.rot += d.vr * dt
      }
      for (let i = debris.length - 1; i >= 0; i--) if (debris[i].y < -700) debris.splice(i, 1)
      if (pause > 0) {
        pause -= dt
        if (pause <= 0 && after) {
          const f = after
          after = null
          f()
        }
      }
      if (over) return
      if (falling) {
        const f = falling
        f.vy += (moon ? 380 : 1000) * dt
        f.y -= f.vy * dt
        f.x += f.drifting * dt
        const ly = landingY(blocks, plat, f.x, f.w)
        if (f.y <= ly) {
          falling = null
          nextShape = mkShape()
          settle({ ...f, y: ly })
        } else if (f.y < -250) {
          falling = null
          nextShape = mkShape()
          fx.burst(ex() + f.x + f.w / 2, H - 20, t.danger, 10, 120, 3)
          loseLife('Missed!')
        }
      }
    },
    draw() {
      c.save()
      sky(c, env, height() * 3)
      shake.apply(c)
      const sx = (x: number) => ex() + x
      const sy = (y: number) => groundY - y + cam
      // platform
      c.fillStyle = t.bg2
      roundRect(c, sx(plat.x0), sy(0), plat.x1 - plat.x0, 16, 6, t.accent2, 'rgba(0,0,0,.4)', 2)
      c.fillStyle = 'rgba(0,0,0,.4)'
      c.fillRect(sx(-8), sy(0) + 16, 16, 500)
      // goal line
      c.strokeStyle = t.good
      c.setLineDash([8, 8])
      c.globalAlpha = 0.6
      c.beginPath()
      c.moveTo(0, sy(goal()))
      c.lineTo(W, sy(goal()))
      c.stroke()
      c.setLineDash([])
      c.globalAlpha = 1
      text(c, `${goal()} m`, W - 36, sy(goal()) - 10, { size: 9, color: t.good })
      const draw = (x: number, y: number, w: number, h: number, color: string, item: string, rot = 0, risk = 0) => {
        c.save()
        c.translate(x + w / 2, y + h / 2)
        c.rotate(rot)
        roundRect(c, -w / 2, -h / 2, w, h, 6, color, risk > 0.75 ? t.danger : 'rgba(0,0,0,.4)', risk > 0.75 ? 3 : 2)
        c.fillStyle = 'rgba(255,255,255,.22)'
        c.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, 4)
        emoji(c, item, 0, 0, Math.min(h * 0.75, w * 0.6, 40))
        c.restore()
      }
      for (const b of blocks) {
        const sway = b.risk > 0.55 ? Math.sin(tt * 9 + b.id) * 0.025 * b.risk : 0
        draw(sx(b.x), sy(b.y + b.h), b.w, b.h, b.color, b.item, sway + Math.sin(b.wob * 20) * b.wob * 0.05, b.risk)
      }
      for (const d of debris) draw(sx(d.x), sy(d.y + d.h), d.w, d.h, d.color, d.item, d.rot)
      if (falling) draw(sx(falling.x), sy(falling.y + falling.h), falling.w, falling.h, falling.color, falling.item)
      else if (!over) {
        // crane with the next shape
        const x = Math.sin(swing) * amp() - nextShape.w / 2
        c.strokeStyle = 'rgba(255,255,255,.5)'
        c.lineWidth = 2
        c.beginPath()
        c.moveTo(sx(x + nextShape.w / 2), 56)
        c.lineTo(sx(x + nextShape.w / 2), 96)
        c.stroke()
        draw(sx(x), 96, nextShape.w, nextShape.h, nextShape.color, nextShape.item)
      }
      const hx = ex() + Math.sin(swing) * amp()
      emoji(c, t.hero, hx, 46, 44, Math.cos(swing) * 0.15)
      fx.draw(c)
      c.restore()
      if (msgT > 0) {
        c.globalAlpha = Math.min(1, msgT * 2)
        text(c, msg, W / 2, H / 2 - 60, { size: 22, color: t.accent2, shadow: t.accent2 })
        c.globalAlpha = 1
      }
      intro(c, env, 'TAP / CLICK / SPACE to drop · keep the centre of mass over the base', tt)
    },
  }
}

// ---------- entry ----------

// ---------- shared level flow for the puzzle modes ----------

interface Flow {
  msg: string
  ok: boolean
  t: number
}

function banner(c: CanvasRenderingContext2D, env: GameEnv, f: Flow) {
  if (f.t <= 0) return
  c.fillStyle = 'rgba(0,0,0,.5)'
  c.fillRect(0, H / 2 - 40, W, 80)
  text(c, f.msg, W / 2, H / 2, { size: W < 600 ? 16 : 24, color: f.ok ? env.theme.good : env.theme.danger, shadow: f.ok ? env.theme.good : env.theme.danger })
}

// ---------- Tower of Hanoi ----------

function hanoi(G: Ctx, rush: boolean): Scene {
  const { env, c, fx, shake } = G
  const t = env.theme
  const ptr = pointer(G.st)
  G.bag.add(() => ptr.dispose())
  const levels = byDiff(env, 4, 5, 6)
  let level = 1
  let score = 0
  let n = 3
  let pegs: Pegs = []
  let moves = 0
  let sel = -1
  let limit = 0
  let clock = 0
  let tt = 0
  let over = false
  const flow: Flow = { msg: '', ok: true, t: 0 }
  let after: (() => void) | null = null
  const px = (i: number) => W * (0.2 + 0.3 * i)
  const baseY = () => H - (W < 600 ? 190 : 80)
  const dh = () => Math.min(34, (baseY() - 120) / (n + 1))
  const dw = (d: number) => 36 + (d / n) * (Math.min(W / 3 - 20, 260) - 36)
  const hud = () => {
    env.score(score)
    env.status(`Level ${level}/${levels} · ${moves}/${hanoiPar(n)} moves${rush ? ` · ${Math.max(0, Math.ceil(limit - clock))}s` : ''}`)
  }
  const build = () => {
    n = Math.min(8, 2 + level + (env.difficulty === 2 ? 1 : 0))
    pegs = newHanoi(n)
    moves = 0
    sel = -1
    clock = 0
    limit = rush ? hanoiPar(n) * 1.1 + 8 : 0
    hud()
  }
  const lose = (why: string) => {
    flow.msg = why
    flow.ok = false
    flow.t = 1.5
    env.sfx('lose')
    after = () => {
      over = true
      env.end({ score, won: false, text: `Reached level ${level}` })
    }
  }
  const tapPeg = (i: number) => {
    if (flow.t > 0 || over) return
    if (sel < 0) {
      if (pegs[i].length) {
        sel = i
        env.sfx('click')
      }
    } else if (sel === i) sel = -1
    else if (canMove(pegs, sel, i)) {
      pegs = moveDisc(pegs, sel, i)
      moves++
      env.sfx('move')
      fx.burst(px(i), baseY() - pegs[i].length * dh(), t.accent, 8, 100, 2)
      sel = -1
      hud()
      if (hanoiSolved(pegs, n)) {
        score += 100 * level + Math.max(0, hanoiPar(n) * 2 - moves) * 5 + (rush ? Math.round(limit - clock) * 3 : 0)
        env.sfx('win')
        shake.kick(4)
        flow.msg = level >= levels ? 'TOWER MOVED!' : 'SOLVED!'
        flow.ok = true
        flow.t = 1.3
        after = () => {
          if (level >= levels) {
            over = true
            env.end({ score, won: true, text: `Moved ${levels} towers` })
          } else {
            level++
            build()
          }
        }
        hud()
      }
    } else {
      env.sfx('hit')
      shake.kick(2)
      sel = pegs[i].length ? i : -1
    }
  }
  ptr.onDown((p) => {
    if (p.button === 2) return
    const i = Math.round((p.x / W - 0.2) / 0.3)
    if (i >= 0 && i < 3 && Math.abs(p.x - px(i)) < W * 0.15) tapPeg(i)
  })
  G.k.onKey((e) => {
    if (e.code === 'Digit1' || e.code === 'KeyA') tapPeg(0)
    else if (e.code === 'Digit2' || e.code === 'KeyS') tapPeg(1)
    else if (e.code === 'Digit3' || e.code === 'KeyD') tapPeg(2)
    else if (e.code === 'KeyR' && flow.t <= 0) build()
  })
  build()
  return {
    update(dt) {
      tt += dt
      fx.update(dt)
      shake.update(dt)
      if (rush && flow.t <= 0 && !over) {
        clock += dt
        if (clock >= limit) lose("TIME'S UP")
        else if (Math.floor(clock) !== Math.floor(clock - dt)) hud()
      }
      if (flow.t > 0) {
        flow.t -= dt
        if (flow.t <= 0 && after) {
          const f = after
          after = null
          f()
        }
      }
    },
    draw() {
      c.clearRect(0, 0, W, H)
      c.save()
      background(c, W, H, t, 40, env.seed)
      shake.apply(c)
      const by = baseY()
      c.fillStyle = (t.fg + '2e')
      c.fillRect(20, by, W - 40, 8)
      for (let i = 0; i < 3; i++) {
        c.fillStyle = sel === i ? t.accent : (t.fg + '4c')
        c.fillRect(px(i) - 4, by - (n + 1) * dh(), 8, (n + 1) * dh())
        pegs[i].forEach((d, j) => {
          const lift = sel === i && j === pegs[i].length - 1
          const y = lift ? by - (n + 1.6) * dh() + Math.sin(tt * 8) * 2 : by - (j + 0.5) * dh()
          const w = dw(d)
          roundRect(c, px(i) - w / 2, y - dh() / 2 + 1, w, dh() - 2, 6, t.blocks[d % t.blocks.length], 'rgba(0,0,0,.4)', 1.5)
          emoji(c, t.items[d % t.items.length], px(i) - w / 2 + 12, y, dh() * 0.6)
        })
        text(c, String(i + 1), px(i), by + 24, { size: 10, color: t.fg })
      }
      fx.draw(c)
      c.restore()
      emoji(c, t.hero, 34, 36, 38, Math.sin(tt * 4) * 0.12)
      text(c, `MOVES ${moves}  PAR ${hanoiPar(n)}`, W / 2, 70, { size: W < 600 ? 9 : 12, color: t.fg })
      if (rush) text(c, `${Math.max(0, Math.ceil(limit - clock))}s`, W - 50, 28, { size: 14, color: limit - clock < 10 ? t.danger : t.accent })
      intro(c, env, 'TAP a peg to lift its top disc, then TAP the target peg', tt)
      banner(c, env, flow)
    },
  }
}

// ---------- Jenga-style pulling ----------

function pull(G: Ctx): Scene {
  const { env, c, fx, shake } = G
  const t = env.theme
  const ptr = pointer(G.st)
  G.bag.add(() => ptr.dispose())
  const levels = byDiff(env, 4, 5, 6)
  let level = 1
  let score = 0
  let lives = byDiff(env, 4, 3, 2)
  let tower: Layer[] = []
  let need = 0
  let done = 0
  let target: { i: number; s: number } | null = null
  let marker = 0
  let dir = 1
  let zone = 0.3
  let zc = 0.5
  let tt = 0
  let collapse = 0
  let over = false
  let after: (() => void) | null = null
  const flow: Flow = { msg: '', ok: true, t: 0 }
  const BW = 74
  const sc = () => Math.min(1, (H - (W < 600 ? 300 : 150)) / (Math.max(8, tower.length + 1) * 28))
  const pos = (i: number, s: number) => {
    const k = sc()
    return { x: W / 2 + (s - 1) * (BW + 3) * k, y: H - (W < 600 ? 190 : 70) - (i + 0.5) * 28 * k, w: BW * k, h: 26 * k }
  }
  const hud = () => {
    env.score(score)
    env.status(`Level ${level}/${levels} · pulled ${done}/${need} · ${'❤️'.repeat(Math.max(0, lives))}`)
  }
  const build = () => {
    tower = newTower(7 + level + byDiff(env, 0, 1, 2))
    need = 5 + level * 2
    done = 0
    target = null
    collapse = 0
    hud()
  }
  const failLevel = (why: string) => {
    lives--
    flow.msg = why
    flow.ok = false
    flow.t = 1.6
    env.sfx('lose')
    shake.kick(10)
    after = () => {
      if (lives <= 0) {
        over = true
        env.end({ score, won: false, text: `Pulled ${done} blocks on level ${level}` })
      } else build()
    }
    hud()
  }
  const resolve = () => {
    if (!target) return
    const { i, s } = target
    const hit = Math.abs(marker - zc) <= zone / 2
    target = null
    if (!hit) {
      shake.kick(5)
      env.sfx('hit')
      lives--
      flow.msg = 'WOBBLE!'
      flow.ok = false
      flow.t = 0.6
      after = lives <= 0 ? () => {
        over = true
        env.end({ score, won: false, text: `Pulled ${done} blocks on level ${level}` })
      } : null
      hud()
      return
    }
    if (pullCollapses(tower, i, s)) {
      collapse = 1
      const q = pos(i, s)
      fx.burst(q.x, q.y, t.danger, 30, 280, 4)
      return failLevel('TOWER FELL!')
    }
    const q = pos(i, s)
    fx.burst(q.x, q.y, t.accent, 14, 160, 3)
    tower[i][s] = false
    tower = putOnTop(tower)
    done++
    score += 20 * (i + 1)
    env.sfx('point')
    hud()
    if (done >= need) {
      score += 150 * level
      env.sfx('win')
      flow.msg = level >= levels ? 'TOWER MASTER!' : 'STEADY HANDS!'
      flow.ok = true
      flow.t = 1.4
      after = () => {
        if (level >= levels) {
          over = true
          env.end({ score, won: true, text: `Survived ${levels} towers` })
        } else {
          level++
          build()
        }
      }
      hud()
    }
  }
  const choose = (x: number, y: number) => {
    for (let i = 0; i < tower.length - 1; i++) for (let s = 0; s < 3; s++) {
      if (!canPull(tower, i, s)) continue
      const q = pos(i, s)
      if (Math.abs(x - q.x) < q.w / 2 && Math.abs(y - q.y) < q.h / 2 + 2) {
        target = { i, s }
        zone = pullZone(tower.length - 1 - i, env.difficulty)
        zc = env.rng.range(0.25, 0.75)
        marker = 0
        dir = 1
        env.sfx('click')
        return
      }
    }
  }
  ptr.onDown((p) => {
    if (p.button === 2 || flow.t > 0 || over) return
    if (target) resolve()
    else choose(p.x, p.y)
  })
  G.k.onKey((e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && target && flow.t <= 0) resolve()
  })
  build()
  return {
    update(dt) {
      tt += dt
      fx.update(dt)
      shake.update(dt)
      if (collapse > 0) collapse += dt
      if (target) {
        marker += dir * dt * (0.9 + level * 0.12)
        if (marker > 1) {
          marker = 1
          dir = -1
        } else if (marker < 0) {
          marker = 0
          dir = 1
        }
      }
      if (flow.t > 0) {
        flow.t -= dt
        if (flow.t <= 0 && after) {
          const f = after
          after = null
          f()
        }
      }
    },
    draw() {
      c.clearRect(0, 0, W, H)
      c.save()
      background(c, W, H, t, 40, env.seed)
      shake.apply(c)
      c.fillStyle = (t.fg + '24')
      c.fillRect(W / 2 - 150, pos(0, 0).y + 16, 300, 10)
      for (let i = 0; i < tower.length; i++) for (let s = 0; s < 3; s++) {
        if (!tower[i][s]) continue
        const q = pos(i, s)
        const fall = collapse > 0 ? collapse * collapse * 120 * (1 + ((i * 3 + s) % 4) * 0.2) : 0
        const hot = target && target.i === i && target.s === s
        const pullable = canPull(tower, i, s)
        c.save()
        c.translate(q.x + (collapse > 0 ? Math.sin(i + s) * collapse * 40 : 0) + (hot ? Math.sin(tt * 40) * 1.5 : 0), q.y + fall)
        if (collapse > 0) c.rotate(Math.sin(i * 7 + s) * collapse * 0.8)
        roundRect(c, -q.w / 2, -q.h / 2, q.w, q.h, 4, t.blocks[(i + s) % t.blocks.length], hot ? t.accent : pullable ? 'rgba(0,0,0,.35)' : (t.fg + '4c'), hot ? 3 : 1.5)
        if (q.h > 14) emoji(c, t.items[(i * 3 + s) % t.items.length], 0, 0, q.h * 0.7)
        c.restore()
      }
      fx.draw(c)
      c.restore()
      if (target) {
        const bw = Math.min(360, W - 60)
        const bx = W / 2 - bw / 2
        const by = 60
        roundRect(c, bx, by, bw, 20, 10, 'rgba(0,0,0,.5)', t.fg, 2)
        c.fillStyle = t.good
        c.fillRect(bx + zc * bw - (zone * bw) / 2, by + 2, zone * bw, 16)
        c.fillStyle = t.accent
        c.fillRect(bx + marker * bw - 3, by - 4, 6, 28)
        text(c, 'TAP when the marker is in the green', W / 2, by + 42, { size: 9, color: t.fg })
      }
      emoji(c, t.hero, 34, 36, 38, Math.sin(tt * 4) * 0.12)
      intro(c, env, 'TAP a block to pull it, then TAP in the green zone', tt)
      banner(c, env, flow)
    },
  }
}

// ---------- seesaw / scales ----------

interface Drop {
  p: number
  w: number
  y: number
}

function beam(G: Ctx): Scene {
  const { env, c, fx, shake } = G
  const t = env.theme
  const ptr = pointer(G.st)
  G.bag.add(() => ptr.dispose())
  const levels = byDiff(env, 5, 6, 7)
  let level = 1
  let score = 0
  let lives = byDiff(env, 4, 3, 2)
  let placed: Weight[] = []
  let queue: number[] = []
  let aim = 0
  let angle = 0
  let drop: Drop | null = null
  let fallen = 0
  let tt = 0
  let over = false
  let after: (() => void) | null = null
  const flow: Flow = { msg: '', ok: true, t: 0 }
  const L = () => Math.min(W * 0.42, 330)
  const pivot = () => ({ x: W / 2, y: H * (W < 600 ? 0.6 : 0.64) })
  const surf = (p: number, a: number) => {
    const pv = pivot()
    return { x: pv.x + Math.cos(a) * p * L(), y: pv.y + Math.sin(a) * p * L() }
  }
  const hud = () => {
    env.score(score)
    env.status(`Level ${level}/${levels} · ${queue.length} to place · ${'❤️'.repeat(Math.max(0, lives))}`)
  }
  const build = () => {
    placed = []
    const pre = 1 + Math.min(3, Math.floor(level / 2))
    for (let i = 0; i < pre; i++) {
      const p = env.rng.pick([-1, 1]) * env.rng.range(0.3, 0.95)
      placed.push({ p, w: Math.max(1, Math.min(env.rng.int(1, 4), Math.floor(0.7 / Math.abs(p)))) })
    }
    while (placed.length > 1 && Math.abs(tiltOf(placed)) > 0.18) placed.pop()
    queue = Array.from({ length: 4 + level * 2 }, () => env.rng.int(1, Math.min(6, 3 + Math.ceil(level / 2))))
    angle = tiltOf(placed)
    drop = null
    fallen = 0
    hud()
  }
  const lose = () => {
    lives--
    fallen = angle >= 0 ? 1 : -1
    flow.msg = 'IT TIPPED!'
    flow.ok = false
    flow.t = 1.6
    env.sfx('lose')
    shake.kick(8)
    after = () => {
      if (lives <= 0) {
        over = true
        env.end({ score, won: false, text: `Reached level ${level}` })
      } else build()
    }
    hud()
  }
  const release = () => {
    if (drop || flow.t > 0 || over || !queue.length) return
    const w = queue.shift()!
    const j = (env.rng() - 0.5) * (0.04 + level * 0.025)
    drop = { p: clamp(aim + j, -1, 1), w, y: 0 }
    env.sfx('click')
    hud()
  }
  ptr.onDown((p) => {
    if (p.button === 2) return
    aim = clamp((p.x - pivot().x) / L(), -1, 1)
    release()
  })
  G.k.onKey((e) => {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowDown') release()
  })
  build()
  return {
    update(dt) {
      tt += dt
      fx.update(dt)
      shake.update(dt)
      const a = G.k.axis()
      if (a.x) aim = clamp(aim + a.x * dt * 1.4, -1, 1)
      else if (ptr.active && ptr.down) aim = clamp((ptr.x - pivot().x) / L(), -1, 1)
      else if (ptr.active) aim = clamp((ptr.x - pivot().x) / L(), -1, 1)
      if (fallen) angle += (fallen * 1.1 - angle) * Math.min(1, dt * 4)
      else angle += (tiltOf(placed) - angle) * Math.min(1, dt * 5)
      if (drop) {
        drop.y += dt * 900
        const s = surf(drop.p, angle)
        if (drop.y >= s.y - 30 - 20) {
          const d = drop
          drop = null
          placed.push({ p: d.p, w: d.w })
          fx.burst(s.x, s.y, t.accent, 8, 120, 2)
          shake.kick(2 + d.w * 0.5)
          env.sfx('hit')
          score += 10 * d.w
          if (tips(placed)) lose()
          else if (!queue.length) {
            score += 150 * level
            env.sfx('win')
            flow.msg = level >= levels ? 'PERFECT BALANCE!' : 'BALANCED!'
            flow.ok = true
            flow.t = 1.4
            after = () => {
              if (level >= levels) {
                over = true
                env.end({ score, won: true, text: `Balanced ${levels} loads` })
              } else {
                level++
                build()
              }
            }
          }
          hud()
        }
      }
      if (flow.t > 0) {
        flow.t -= dt
        if (flow.t <= 0 && after) {
          const f = after
          after = null
          f()
        }
      }
    },
    draw() {
      c.clearRect(0, 0, W, H)
      c.save()
      background(c, W, H, t, 40, env.seed)
      shake.apply(c)
      const pv = pivot()
      // fulcrum
      c.fillStyle = (t.fg + '40')
      c.beginPath()
      c.moveTo(pv.x, pv.y)
      c.lineTo(pv.x - 40, H - 40)
      c.lineTo(pv.x + 40, H - 40)
      c.fill()
      // beam
      c.save()
      c.translate(pv.x, pv.y)
      c.rotate(angle)
      roundRect(c, -L() - 10, -8, L() * 2 + 20, 16, 6, t.accent2, 'rgba(0,0,0,.4)', 2)
      c.fillStyle = t.good
      c.fillRect(-2, -8, 4, 16)
      c.restore()
      // tilt-limit marks
      c.strokeStyle = t.danger
      c.globalAlpha = 0.35
      c.setLineDash([4, 6])
      for (const sg of [-1, 1]) {
        c.beginPath()
        c.moveTo(pv.x, pv.y)
        c.lineTo(pv.x + Math.cos(sg * MAX_TILT) * (L() + 20), pv.y + Math.sin(sg * MAX_TILT) * (L() + 20))
        c.stroke()
      }
      c.setLineDash([])
      c.globalAlpha = 1
      // weights
      for (const w of placed) {
        const s = surf(w.p, angle)
        const sz = 22 + w.w * 7
        roundRect(c, s.x - sz / 2, s.y - 8 - sz, sz, sz, 6, t.blocks[w.w % t.blocks.length], 'rgba(0,0,0,.4)', 1.5)
        emoji(c, t.items[w.w % t.items.length], s.x, s.y - 8 - sz / 2 - 3, sz * 0.6)
        text(c, String(w.w), s.x, s.y - 14, { size: 8, color: '#fff' })
      }
      if (drop) {
        const sz = 22 + drop.w * 7
        const x = surf(drop.p, angle).x
        roundRect(c, x - sz / 2, drop.y - sz, sz, sz, 6, t.accent, 'rgba(0,0,0,.4)', 1.5)
        text(c, String(drop.w), x, drop.y - sz / 2, { size: 9, color: '#fff' })
      }
      fx.draw(c)
      c.restore()
      // next weight in hand + preview
      if (!drop && queue.length && flow.t <= 0) {
        const w = queue[0]
        const sz = 22 + w * 7
        const x = pv.x + aim * L()
        roundRect(c, x - sz / 2, 90, sz, sz, 6, t.accent, 'rgba(0,0,0,.4)', 1.5)
        emoji(c, t.hero, x, 90 + sz / 2, sz * 0.6)
        text(c, String(w), x, 90 + sz + 12, { size: 10, color: t.fg })
        const pv2 = tiltOf([...placed, { p: aim, w }])
        const ok = Math.abs(pv2) <= MAX_TILT
        c.strokeStyle = ok ? t.good : t.danger
        c.globalAlpha = 0.6
        c.setLineDash([3, 5])
        c.beginPath()
        c.moveTo(pv.x - Math.cos(pv2) * L(), pv.y - Math.sin(pv2) * L())
        c.lineTo(pv.x + Math.cos(pv2) * L(), pv.y + Math.sin(pv2) * L())
        c.stroke()
        c.setLineDash([])
        c.globalAlpha = 1
        const best = bestSpot(placed, w)
        c.fillStyle = t.good
        c.globalAlpha = 0.5
        c.fillRect(pv.x + best * L() - 2, pv.y + 14, 4, 10)
        c.globalAlpha = 1
      }
      emoji(c, t.hero, 34, 36, 38, Math.sin(tt * 4) * 0.12)
      text(c, `NEXT: ${queue.slice(0, 5).join(' ')}`, W / 2, 66, { size: W < 600 ? 9 : 12, color: t.fg })
      intro(c, env, 'AIM with mouse / finger / arrows, TAP to drop · keep the beam level', tt)
      banner(c, env, flow)
    },
  }
}

const engine: Engine = {
  start(env) {
    const hr = env.host.getBoundingClientRect()
    if (hr.height > hr.width * 1.15) {
      W = 450
      H = 800
    } else {
      W = 800
      H = 450
    }
    const st = createStage(env.host, W, H)
    const k = keys()
    const G: Ctx = { env, st, c: st.ctx, k, bag: new Bag(), fx: new Particles(), shake: new Shake() }
    const label = `${env.name} ${env.desc}`
    const phys = /balanc|jenga|\bpile\b|cairn|tipping|pull|seesaw|jelly|totem|plank/i.test(label)
    const name = env.name
    const scene = /hanoi/i.test(name)
      ? hanoi(G, env.mods.has('fast') || /rush|timed/i.test(label))
      : /jenga|block pull|tipping point/i.test(name)
        ? pull(G)
        : /seesaw|scales|balance beam|counterweight|bridge balance|mobile maker|cannon balance|bubble balance/i.test(name)
          ? beam(G)
          : phys
            ? balance(G)
            : classic(G)
    const lp = loop((dt) => scene.update(dt), () => {
      G.c.clearRect(0, 0, W, H)
      scene.draw()
    })
    return {
      pause: (p) => lp.pause(p),
      destroy() {
        lp.stop()
        k.dispose()
        G.bag.dispose()
        st.dispose()
      },
    }
  },
}

export default engine
