// Chain: Boomshine-style chain reactions. One tap starts an explosion; drifting items that touch it explode too.
// Catch enough of them to clear the level. Mods: bomb (big-blast items), combo (growing multiplier), gravity (items drift inward).
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, pointer, roundRect, Shake, text, type Engine } from '../kit'
import { tone } from '../sound'
import { chainPoints, chainSpec } from '../logic/chain'
import { genGridLevel, remaining, tap, type Grid, type GridKind, type GridLevel } from '../logic/chain-grid'
import { faceAlong, nextSpots, simulate, type Domino, type Spot } from '../logic/chain-topple'
import type { GameEnv, GameHandle } from '../kit'

let W = 800
let H = 450

interface Dot {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  em: string
  color: string
  bomb: boolean
  ph: number
}
interface Blast {
  x: number
  y: number
  r: number
  t: number
  color: string
  em: string
  big: boolean
}

const SCALE = [0, 2, 4, 7, 9]

const size = (env: GameEnv) => {
  const hr = env.host.getBoundingClientRect()
  if (hr.height > hr.width * 1.15) {
    W = 450
    H = 800
  } else {
    W = 800
    H = 450
  }
}

// ---------- grid chain reactions (atoms / cross bombs) ----------

function startGrid(env: GameEnv, kind: GridKind): GameHandle {
  size(env)
  const t = env.theme
  const st = createStage(env.host, W, H)
  const c = st.ctx
  const k = keys()
  const bag = new Bag()
  const fx = new Particles()
  const shake = new Shake()
  const ptr = pointer(st)
  bag.add(() => ptr.dispose())
  const levels = byDiff(env, 6, 8, 10)
  let lives = byDiff(env, 4, 3, 2)
  let level = 1
  let score = 0
  let lv!: GridLevel
  let grid!: Grid
  let shown!: Grid
  let tapsLeft = 0
  let anim: { snaps: number[][]; waves: number[][]; i: number; t: number } | null = null
  let pause = 0
  let msg = ''
  let ok = false
  let over = false
  let tt = 0
  let cur = 0
  let cs = 60
  let ox = 0
  let oy = 0
  const pos = (i: number) => ({ x: ox + ((i % grid.w) + 0.5) * cs, y: oy + (((i / grid.w) | 0) + 0.5) * cs })
  const hud = () => {
    env.score(score)
    env.status(`Level ${level}/${levels} · ${tapsLeft} taps · ${'❤️'.repeat(lives)}`)
  }
  const build = (fresh: boolean) => {
    if (fresh) lv = genGridLevel(env.rng, kind, level, env.difficulty)
    grid = { w: lv.grid.w, h: lv.grid.h, g: lv.grid.g.slice() }
    shown = grid
    tapsLeft = lv.taps
    anim = null
    cs = Math.min(80, Math.floor((W - 24) / grid.w), Math.floor((H - (W < 600 ? 230 : 120)) / grid.h))
    ox = Math.round((W - grid.w * cs) / 2)
    oy = Math.round((H - grid.h * cs) / 2) + 18
    cur = 0
    hud()
  }
  const finish = () => {
    const done = remaining(grid) <= lv.goal
    if (done) {
      score += 200 * level + tapsLeft * 50
      ok = true
      msg = level >= levels ? 'CHAIN MASTER!' : 'CLEARED!'
      env.sfx('win')
      pause = 1.4
    } else if (tapsLeft <= 0) {
      lives--
      ok = false
      msg = lives > 0 ? 'OUT OF TAPS' : 'GAME OVER'
      env.sfx('lose')
      pause = 1.4
    }
    hud()
  }
  const press = (i: number) => {
    if (anim || pause > 0 || over || tapsLeft <= 0) return
    const r = tap(grid, kind, i)
    if (!r.ok) return
    tapsLeft--
    anim = { snaps: r.snaps, waves: r.waves, i: 0, t: 0 }
    grid = r.grid
    env.sfx('click')
    hud()
  }
  ptr.onDown((p) => {
    if (p.button === 2) return
    const x = Math.floor((p.x - ox) / cs)
    const y = Math.floor((p.y - oy) / cs)
    if (x >= 0 && y >= 0 && x < grid.w && y < grid.h) {
      cur = y * grid.w + x
      press(cur)
    }
  })
  k.onKey((e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') cur = Math.max(0, cur - 1)
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') cur = Math.min(grid.g.length - 1, cur + 1)
    else if (e.code === 'ArrowUp' || e.code === 'KeyW') cur = Math.max(0, cur - grid.w)
    else if (e.code === 'ArrowDown' || e.code === 'KeyS') cur = Math.min(grid.g.length - 1, cur + grid.w)
    else if (e.code === 'Space' || e.code === 'Enter') press(cur)
    else if (e.code === 'KeyR' && !anim && pause <= 0) build(false)
  })
  const orbSpots = (n: number) => (n <= 1 ? [[0, 0]] : n === 2 ? [[-0.2, 0], [0.2, 0]] : n === 3 ? [[0, -0.2], [-0.2, 0.15], [0.2, 0.15]] : [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]])
  build(true)
  const update = (dt: number) => {
    tt += dt
    fx.update(dt)
    shake.update(dt)
    if (anim) {
      anim.t += dt
      if (anim.t >= 0.17) {
        anim.t = 0
        const w = anim.waves[anim.i]
        shown = { w: grid.w, h: grid.h, g: anim.snaps[anim.i] }
        for (const ci of w) {
          const q = pos(ci)
          fx.burst(q.x, q.y, t.blocks[ci % t.blocks.length], 12, 160, 3)
          score += 10 * (anim.i + 1)
        }
        if (w.length) {
          tone(262 * Math.pow(2, (Math.min(anim.i, 12) * 2) / 12), 0.15, 'triangle', 0.1)
          shake.kick(Math.min(6, 1 + w.length))
        }
        anim.i++
        if (anim.i >= anim.snaps.length) {
          anim = null
          shown = grid
          hud()
          finish()
        }
      }
    }
    if (pause > 0) {
      pause -= dt
      if (pause <= 0 && !over) {
        if (ok) {
          if (level >= levels) {
            over = true
            env.end({ score, won: true, text: `Cleared all ${levels} levels` })
          } else {
            level++
            build(true)
          }
        } else if (lives <= 0) {
          over = true
          env.end({ score, won: false, text: `Reached level ${level}` })
        } else build(false)
      }
    }
  }
  const draw = () => {
    c.clearRect(0, 0, W, H)
    c.save()
    background(c, W, H, t, 60, env.seed)
    shake.apply(c)
    const g = shown.g
    for (let i = 0; i < g.length; i++) {
      const q = pos(i)
      const hot = i === cur && (ptr.active || tt > 0)
      roundRect(c, q.x - cs / 2 + 2, q.y - cs / 2 + 2, cs - 4, cs - 4, 8, hot ? t.accent + '33' : (t.fg + '12'), hot ? t.accent : (t.fg + '2e'), hot ? 2 : 1)
      if (kind === 'atoms') {
        const m = (i % grid.w > 0 ? 1 : 0) + (i % grid.w < grid.w - 1 ? 1 : 0) + (i >= grid.w ? 1 : 0) + (i < grid.g.length - grid.w ? 1 : 0)
        text(c, String(m), q.x + cs / 2 - 10, q.y - cs / 2 + 11, { size: 7, color: (t.fg + '66') })
        const n = g[i]
        for (const [dx, dy] of n ? orbSpots(n) : []) {
          const wob = Math.sin(tt * 5 + i + dx * 9) * 1.2
          c.fillStyle = t.blocks[(n + i) % t.blocks.length]
          c.shadowColor = c.fillStyle
          c.shadowBlur = 8
          c.beginPath()
          c.arc(q.x + dx * cs, q.y + dy * cs + wob, cs * (n === 1 ? 0.24 : 0.16), 0, 7)
          c.fill()
          c.shadowBlur = 0
          emoji(c, t.items[(i + n) % t.items.length], q.x + dx * cs, q.y + dy * cs + wob, cs * (n === 1 ? 0.32 : 0.22))
        }
      } else if (g[i]) {
        emoji(c, i % 5 === 0 ? '💣' : t.items[i % t.items.length], q.x, q.y + Math.sin(tt * 4 + i) * 1.5, cs * 0.6)
      }
    }
    fx.draw(c)
    c.restore()
    text(c, `ORBS ${remaining(shown)}   GOAL ≤ ${lv.goal}   TAPS ${tapsLeft}`.replace('ORBS', kind === 'atoms' ? 'ORBS' : 'BOMBS'), W / 2, 22, { size: W < 600 ? 9 : 12, color: t.fg })
    if (tt < 6 && !anim) text(c, kind === 'atoms' ? 'TAP a cell: it fills, then bursts into neighbours' : 'TAP a bomb: blast spreads along row and column', W / 2, H - 22, { size: W < 600 ? 7 : 10, color: t.accent })
    if (tt < 2.2) {
      c.globalAlpha = tt < 1.7 ? 1 : 1 - (tt - 1.7) / 0.5
      text(c, env.name, W / 2, 50, { size: W < 600 ? 13 : 20, color: t.accent, shadow: t.accent })
      c.globalAlpha = 1
    }
    if (pause > 0) {
      c.fillStyle = 'rgba(0,0,0,.5)'
      c.fillRect(0, H / 2 - 40, W, 80)
      text(c, msg, W / 2, H / 2, { size: W < 600 ? 18 : 26, color: ok ? t.good : t.danger, shadow: ok ? t.good : t.danger })
    }
  }
  const lp = loop(update, draw)
  return {
    pause: (p) => lp.pause(p),
    destroy() {
      lp.stop()
      k.dispose()
      bag.dispose()
      st.dispose()
    },
  }
}

// ---------- domino toppling ----------

function startTopple(env: GameEnv): GameHandle {
  size(env)
  const t = env.theme
  const st = createStage(env.host, W, H)
  const c = st.ctx
  const k = keys()
  const bag = new Bag()
  const fx = new Particles()
  const shake = new Shake()
  const ptr = pointer(st)
  bag.add(() => ptr.dispose())
  const levels = byDiff(env, 6, 8, 10)
  const GAP = 26
  let level = 1
  let score = 0
  let lives = byDiff(env, 4, 3, 2)
  let start: Spot = { x: 0, y: 0 }
  let targets: Spot[] = []
  let rocks: { x: number; y: number; r: number }[] = []
  let line: Spot[] = []
  let maxDom = 0
  let phase: 'draw' | 'run' | 'result' = 'draw'
  let sim: { dom: number[]; tgt: number[] } = { dom: [], tgt: [] }
  let doms: Domino[] = []
  let clock = 0
  let pause = 0
  let ok = false
  let msg = ''
  let over = false
  let tt = 0
  let dragging = false
  const seen = { dom: new Set<number>(), tgt: new Set<number>() }
  const hud = () => {
    env.score(score)
    env.status(`Level ${level}/${levels} · ${maxDom - line.length} dominoes left · ${'❤️'.repeat(lives)}`)
  }
  const blocked = (p: Spot) => rocks.some((r) => Math.hypot(r.x - p.x, r.y - p.y) < r.r + 10) || p.x < 14 || p.y < 56 || p.x > W - 14 || p.y > H - 14
  const build = () => {
    const nT = Math.min(5, 1 + Math.floor((level + 1) / 2))
    start = { x: W < 600 ? 60 : 70, y: H - 70 }
    targets = []
    rocks = []
    for (let i = 0; i < nT; i++) {
      targets.push({ x: env.rng.range(W * 0.25, W - 40), y: env.rng.range(80, H * 0.55) })
    }
    if (W < 600) for (const q of targets) q.x = env.rng.range(50, W - 50)
    const nR = Math.min(5, Math.floor(level / 2))
    for (let i = 0; i < nR; i++) rocks.push({ x: env.rng.range(W * 0.3, W - 80), y: env.rng.range(120, H - 120), r: env.rng.range(18, 30) })
    rocks = rocks.filter((r) => !targets.some((q) => Math.hypot(r.x - q.x, r.y - q.y) < r.r + 40) && Math.hypot(r.x - start.x, r.y - start.y) > r.r + 50)
    const far = targets.reduce((a, q) => a + Math.hypot(q.x - start.x, q.y - start.y), 0)
    maxDom = Math.ceil((far / GAP) * (env.difficulty === 0 ? 0.95 : env.difficulty === 1 ? 0.8 : 0.68)) + 4
    line = [{ ...start }]
    phase = 'draw'
    sim = { dom: [], tgt: [] }
    seen.dom.clear()
    seen.tgt.clear()
    hud()
  }
  const tail = () => line[line.length - 1]
  const extend = (p: Spot) => {
    for (const s of nextSpots(tail(), p, GAP)) {
      if (line.length >= maxDom || blocked(s)) break
      line.push(s)
      tone(500 + line.length * 8, 0.04, 'square', 0.04)
    }
    hud()
  }
  const run = () => {
    if (phase !== 'draw' || line.length < 2) return
    doms = faceAlong(line)
    sim = simulate(doms, targets, 0)
    phase = 'run'
    clock = 0
    env.sfx('move')
  }
  const undo = () => {
    if (phase === 'draw' && line.length > 1) {
      line.pop()
      hud()
    }
  }
  k.onKey((e) => {
    if (e.code === 'Space' || e.code === 'Enter') run()
    else if (e.code === 'KeyZ' || e.code === 'Backspace') undo()
    else if (e.code === 'KeyR' && phase === 'draw') {
      line = [{ ...start }]
      hud()
    }
  })
  // on-screen buttons
  const btn = { run: { x: 0, y: 0, w: 96, h: 36 }, undo: { x: 0, y: 0, w: 96, h: 36 } }
  const layoutBtn = () => {
    btn.run.x = W - 106
    btn.run.y = 10
    btn.undo.x = W - 212
    btn.undo.y = 10
  }
  layoutBtn()
  const inb = (b: { x: number; y: number; w: number; h: number }, p: Spot) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h
  let prevDown = false
  build()
  const update = (dt: number) => {
    tt += dt
    fx.update(dt)
    shake.update(dt)
    // pointer drag (polled so touch drags work)
    const p = { x: ptr.x, y: ptr.y }
    if (ptr.down && !prevDown) {
      if (inb(btn.run, p)) run()
      else if (inb(btn.undo, p)) undo()
      else if (phase === 'draw' && Math.hypot(p.x - tail().x, p.y - tail().y) < 70) dragging = true
    }
    if (!ptr.down) dragging = false
    prevDown = ptr.down
    if (dragging && phase === 'draw') extend(p)
    if (phase === 'run') {
      clock += dt
      let caught = 0
      sim.dom.forEach((ft, i) => {
        if (ft >= 0 && clock >= ft && !seen.dom.has(i)) {
          seen.dom.add(i)
          fx.burst(doms[i].x, doms[i].y, t.accent2, 3, 60, 2)
          tone(300 + (i % 8) * 40, 0.05, 'square', 0.05)
        }
      })
      sim.tgt.forEach((ft, i) => {
        if (ft >= 0 && clock >= ft) {
          caught++
          if (!seen.tgt.has(i)) {
            seen.tgt.add(i)
            fx.burst(targets[i].x, targets[i].y, t.good, 24, 220, 3)
            shake.kick(4)
            env.sfx('point')
            score += 100 * level
            hud()
          }
        }
      })
      const end = Math.max(0, ...sim.dom, ...sim.tgt) + 0.6
      if (clock > end) {
        phase = 'result'
        ok = caught === targets.length
        pause = 1.5
        if (ok) {
          score += 200 * level + (maxDom - line.length) * 20
          msg = level >= levels ? 'DOMINO MASTER!' : 'ALL DOWN!'
          env.sfx('win')
        } else {
          lives--
          msg = lives > 0 ? `${caught}/${targets.length} KNOCKED - RETRY` : 'GAME OVER'
          env.sfx('lose')
        }
        hud()
      }
    }
    if (phase === 'result') {
      pause -= dt
      if (pause <= 0 && !over) {
        if (ok) {
          if (level >= levels) {
            over = true
            env.end({ score, won: true, text: `Cleared all ${levels} levels` })
          } else {
            level++
            build()
          }
        } else if (lives <= 0) {
          over = true
          env.end({ score, won: false, text: `Reached level ${level}` })
        } else {
          line = [{ ...start }]
          phase = 'draw'
          seen.dom.clear()
          seen.tgt.clear()
          hud()
        }
      }
    }
  }
  const drawDom = (d: Domino, ft: number) => {
    const prog = ft < 0 ? 0 : Math.min(1, Math.max(0, (clock - ft) / 0.25))
    c.save()
    c.translate(d.x, d.y)
    c.rotate(d.a)
    const len = 6 + prog * 14
    c.fillStyle = prog >= 1 ? t.accent2 : t.fg
    c.shadowColor = t.accent
    c.shadowBlur = 5
    c.fillRect(-2, -8, len, 16)
    c.restore()
    c.shadowBlur = 0
  }
  const draw = () => {
    c.clearRect(0, 0, W, H)
    c.save()
    background(c, W, H, t, 50, env.seed)
    shake.apply(c)
    for (const r of rocks) {
      c.fillStyle = (t.fg + '2e')
      c.beginPath()
      c.arc(r.x, r.y, r.r, 0, 7)
      c.fill()
      emoji(c, '🪨', r.x, r.y, r.r * 1.6)
    }
    targets.forEach((q, i) => {
      const fell = phase !== 'draw' && sim.tgt[i] >= 0 && clock >= sim.tgt[i]
      c.globalAlpha = fell ? 0.5 : 1
      emoji(c, t.items[(i + 2) % t.items.length], q.x, q.y + (fell ? 6 : Math.sin(tt * 3 + i) * 2), 34, fell ? 1.2 : 0)
      c.globalAlpha = 1
    })
    const shown = phase === 'draw' ? faceAlong(line) : doms
    shown.forEach((d, i) => drawDom(d, phase === 'draw' ? -1 : sim.dom[i]))
    if (phase === 'draw') {
      const q = tail()
      emoji(c, t.hero, line.length === 1 ? start.x - 22 : q.x, line.length === 1 ? start.y : q.y - 22, 26)
      c.strokeStyle = t.accent
      c.globalAlpha = 0.5
      c.setLineDash([5, 5])
      c.beginPath()
      c.arc(q.x, q.y, 70, 0, 7)
      c.stroke()
      c.setLineDash([])
      c.globalAlpha = 1
    }
    fx.draw(c)
    c.restore()
    for (const [b, label, on] of [[btn.run, '▶ PUSH', line.length > 1 && phase === 'draw'], [btn.undo, '↶ UNDO', line.length > 1 && phase === 'draw']] as const) {
      roundRect(c, b.x, b.y, b.w, b.h, 10, on ? t.accent + '55' : (t.fg + '14'), on ? t.accent : (t.fg + '33'), 2)
      text(c, label, b.x + b.w / 2, b.y + b.h / 2, { size: 9, color: on ? t.fg : (t.fg + '66') })
    }
    text(c, `TARGETS ${targets.length}`, 14, 28, { size: W < 600 ? 8 : 10, color: t.fg, align: 'left' })
    if (tt < 7 && phase === 'draw') text(c, 'DRAG from the last domino to lay a line, then PUSH', W / 2, H - 22, { size: W < 600 ? 7 : 10, color: t.accent })
    if (tt < 2.2) {
      c.globalAlpha = tt < 1.7 ? 1 : 1 - (tt - 1.7) / 0.5
      text(c, env.name, W / 2, H / 2, { size: W < 600 ? 13 : 20, color: t.accent, shadow: t.accent })
      c.globalAlpha = 1
    }
    if (phase === 'result') {
      c.fillStyle = 'rgba(0,0,0,.5)'
      c.fillRect(0, H / 2 - 40, W, 80)
      text(c, msg, W / 2, H / 2, { size: W < 600 ? 14 : 24, color: ok ? t.good : t.danger, shadow: ok ? t.good : t.danger })
    }
  }
  const lp = loop(update, draw)
  return {
    pause: (p) => lp.pause(p),
    destroy() {
      lp.stop()
      k.dispose()
      bag.dispose()
      st.dispose()
    },
  }
}

const DOMINO_RE = /\bdomino(es)?\b/i
const CROSS_RE = /fuse box|kaboom|firecracker|spark circuit/i
const ATOMS_RE = /pop spread|critical|glow burst|nova|virus|seed|neural|lantern/i

const engine: Engine = {
  start(env) {
    if (DOMINO_RE.test(env.name)) return startTopple(env)
    if (CROSS_RE.test(env.name)) return startGrid(env, 'cross')
    if (ATOMS_RE.test(env.name)) return startGrid(env, 'atoms')
    const hr = env.host.getBoundingClientRect()
    if (hr.height > hr.width * 1.15) {
      W = 450
      H = 800
    } else {
      W = 800
      H = 450
    }
    const { theme: t, mods } = env
    const st = createStage(env.host, W, H)
    const c = st.ctx
    const k = keys()
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const ptr = pointer(st)
    const bombs = mods.has('bomb') || /bomb|kaboom|boom/i.test(env.name)
    const combo = mods.has('combo')
    const gravity = mods.has('gravity')
    const levels = byDiff(env, 8, 10, 12)
    let lives = byDiff(env, 5, 4, 3)
    let level = 1
    let score = 0
    let spec = chainSpec(1, env.difficulty)
    let dots: Dot[] = []
    let blasts: Blast[] = []
    let phase: 'aim' | 'run' | 'result' = 'aim'
    let caught = 0
    let chainN = 0
    let resultT = 0
    let resultMsg = ''
    let resultOk = false
    let tt = 0
    let cx = W / 2
    let cy = H / 2
    let over = false
    const floats: { s: string; x: number; y: number; t: number; color: string }[] = []

    const R = () => spec.radius * (W < 600 ? 1.05 : 1.2)
    const build = () => {
      spec = chainSpec(level, env.difficulty)
      dots = []
      blasts = []
      caught = 0
      chainN = 0
      phase = 'aim'
      for (let i = 0; i < spec.total; i++) {
        const a = env.rng.range(0, Math.PI * 2)
        const sp = spec.speed * env.rng.range(0.6, 1.2)
        const bomb = bombs && env.rng.chance(spec.bombs * 1.5)
        dots.push({
          x: env.rng.range(30, W - 30), y: env.rng.range(30, H - 30), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          r: bomb ? 17 : 13, em: bomb ? '💣' : t.items[i % t.items.length], color: t.blocks[i % t.blocks.length], bomb, ph: env.rng.range(0, 6),
        })
      }
      hud()
    }
    const hud = () => {
      env.score(score)
      env.status(`Level ${level}/${levels} · ${caught}/${spec.need} needed · ${'❤️'.repeat(lives)}`)
    }
    const note = (n: number) => {
      const semis = SCALE[n % 5] + 12 * Math.floor(n / 5)
      tone(Math.min(1800, 262 * Math.pow(2, semis / 12)), 0.22, n % 2 ? 'triangle' : 'sine', 0.12)
    }
    const addBlast = (x: number, y: number, color: string, em: string, big: boolean) => {
      blasts.push({ x, y, r: 0, t: 0, color, em, big })
    }
    const place = (x: number, y: number) => {
      if (phase !== 'aim' || over) return
      phase = 'run'
      addBlast(x, y, t.accent, t.hero, false)
      env.sfx('boom')
      shake.kick(3)
      fx.burst(x, y, t.accent, 24, 220, 3)
    }
    ptr.onMove((p) => {
      cx = p.x
      cy = p.y
    })
    ptr.onDown((p) => {
      cx = p.x
      cy = p.y
      if (p.button !== 2) place(p.x, p.y)
    })
    k.onKey((e) => {
      if (e.code === 'Space' || e.code === 'Enter') place(cx, cy)
    })
    bag.add(() => ptr.dispose())

    const finishRound = () => {
      const ok = caught >= spec.need
      resultOk = ok
      phase = 'result'
      resultT = 1.7
      if (ok) {
        const bonus = Math.max(0, caught - spec.need) * 60
        score += 300 * level + bonus
        env.sfx('win')
        resultMsg = level >= levels ? 'CHAIN MASTER!' : `CLEARED! +${300 * level + bonus}`
      } else {
        lives--
        env.sfx('lose')
        resultMsg = lives > 0 ? `${caught}/${spec.need} - TRY AGAIN` : 'OUT OF TRIES'
      }
      hud()
    }

    build()

    const update = (dt: number) => {
      tt += dt
      fx.update(dt)
      shake.update(dt)
      for (const f of floats) f.t -= dt
      for (let i = floats.length - 1; i >= 0; i--) if (floats[i].t <= 0) floats.splice(i, 1)
      const a = k.axis()
      if (a.x || a.y) {
        cx = clamp(cx + a.x * 380 * dt, 0, W)
        cy = clamp(cy + a.y * 380 * dt, 0, H)
      }
      if (phase === 'result') {
        resultT -= dt
        if (resultT <= 0 && !over) {
          if (resultOk) {
            if (level >= levels) {
              over = true
              env.end({ score, won: true, text: `Cleared all ${levels} levels` })
            } else {
              level++
              build()
            }
          } else if (lives <= 0) {
            over = true
            env.end({ score, won: false, text: `Reached level ${level}` })
          } else build()
        }
      }
      for (const d of dots) {
        if (gravity) {
          d.vx += (W / 2 - d.x) * 0.05 * dt
          d.vy += (H / 2 - d.y) * 0.05 * dt
        }
        d.x += d.vx * dt
        d.y += d.vy * dt
        if (d.x < d.r) {
          d.x = d.r
          d.vx = Math.abs(d.vx)
        } else if (d.x > W - d.r) {
          d.x = W - d.r
          d.vx = -Math.abs(d.vx)
        }
        if (d.y < d.r) {
          d.y = d.r
          d.vy = Math.abs(d.vy)
        } else if (d.y > H - d.r) {
          d.y = H - d.r
          d.vy = -Math.abs(d.vy)
        }
      }
      for (const b of blasts) {
        b.t += dt
        const R0 = (b.big ? 1.9 : b.em === t.hero ? 1.15 : 0.95) * R()
        const grow = 0.35
        const hold = 1.35
        const shrink = 0.45
        b.r = b.t < grow ? R0 * (1 - Math.pow(1 - b.t / grow, 3)) : b.t < grow + hold ? R0 * (1 + Math.sin(b.t * 9) * 0.03) : R0 * Math.max(0, 1 - (b.t - grow - hold) / shrink)
      }
      blasts = blasts.filter((b) => b.t < 2.15)
      // chain
      for (const b of blasts) {
        if (b.r < 4) continue
        for (let i = dots.length - 1; i >= 0; i--) {
          const d = dots[i]
          if (Math.hypot(d.x - b.x, d.y - b.y) < d.r + b.r) {
            dots.splice(i, 1)
            caught++
            chainN++
            const pts = chainPoints(chainN, combo)
            score += pts
            note(chainN - 1)
            addBlast(d.x, d.y, d.color, d.em, d.bomb)
            fx.burst(d.x, d.y, d.color, d.bomb ? 40 : 16, d.bomb ? 340 : 210, d.bomb ? 4 : 3)
            fx.burst(d.x, d.y, '#fff', 4, 120, 2)
            if (d.bomb) {
              shake.kick(7)
              env.sfx('boom')
            }
            floats.push({ s: `+${pts}`, x: d.x, y: d.y, t: 0.9, color: d.color })
            hud()
          }
        }
      }
      if (phase === 'run' && !blasts.length) finishRound()
      if (phase === 'run' && caught >= spec.need) hud()
    }

    const draw = () => {
      c.clearRect(0, 0, W, H)
      c.save()
      background(c, W, H, t, 70, env.seed)
      shake.apply(c)
      // blasts
      for (const b of blasts) {
        const g = c.createRadialGradient(b.x, b.y, b.r * 0.1, b.x, b.y, Math.max(1, b.r))
        g.addColorStop(0, '#ffffffcc')
        g.addColorStop(0.35, b.color + 'aa')
        g.addColorStop(1, b.color + '22')
        c.fillStyle = g
        c.beginPath()
        c.arc(b.x, b.y, b.r, 0, 7)
        c.fill()
        c.strokeStyle = b.color
        c.lineWidth = 3
        c.shadowColor = b.color
        c.shadowBlur = 16
        c.beginPath()
        c.arc(b.x, b.y, b.r, 0, 7)
        c.stroke()
        c.shadowBlur = 0
        emoji(c, b.em, b.x, b.y, Math.min(60, b.r * 0.9))
      }
      for (const d of dots) {
        const pulse = 1 + Math.sin(tt * 4 + d.ph) * 0.06
        c.fillStyle = d.color
        c.globalAlpha = 0.28
        c.beginPath()
        c.arc(d.x, d.y, d.r * 1.5 * pulse, 0, 7)
        c.fill()
        c.globalAlpha = 1
        if (d.bomb) {
          c.strokeStyle = t.danger
          c.lineWidth = 2
          c.beginPath()
          c.arc(d.x, d.y, d.r * 1.3 + Math.sin(tt * 8) * 2, 0, 7)
          c.stroke()
        }
        emoji(c, d.em, d.x, d.y, d.r * 2 * pulse)
      }
      fx.draw(c)
      // cursor
      if (phase === 'aim' && (ptr.active || k.axis().x || k.axis().y)) {
        c.strokeStyle = t.accent
        c.globalAlpha = 0.6
        c.setLineDash([6, 6])
        c.lineWidth = 2
        c.beginPath()
        c.arc(cx, cy, R() * 1.15, 0, 7)
        c.stroke()
        c.setLineDash([])
        c.globalAlpha = 1
        emoji(c, t.hero, cx, cy, 34)
      }
      c.restore()
      for (const f of floats) {
        c.globalAlpha = Math.min(1, f.t * 2)
        text(c, f.s, f.x, f.y - (0.9 - f.t) * 40, { size: 12, color: f.color, shadow: f.color })
      }
      c.globalAlpha = 1
      // target bar
      const bw = Math.min(360, W - 60)
      roundRect(c, W / 2 - bw / 2, 10, bw, 14, 7, 'rgba(0,0,0,.4)', 'rgba(255,255,255,.2)', 1)
      c.fillStyle = caught >= spec.need ? t.good : t.accent
      c.fillRect(W / 2 - bw / 2 + 2, 12, (bw - 4) * Math.min(1, caught / spec.need), 10)
      text(c, `${caught} / ${spec.need}`, W / 2, 42, { size: 11, color: t.fg })
      if (combo && chainN > 3) text(c, `COMBO x${1 + Math.floor(chainN / 4)}`, W / 2, 62, { size: 11, color: t.accent2, shadow: t.accent2 })
      if (phase === 'aim') {
        text(c, `CATCH ${spec.need} OF ${spec.total}`, W / 2, H - 28, { size: W < 600 ? 10 : 13, color: t.fg, shadow: '#000' })
        if (tt < 6) text(c, 'TAP ONCE to start a chain reaction', W / 2, H - 52, { size: W < 600 ? 8 : 10, color: t.accent })
      }
      if (tt < 2.5) {
        c.globalAlpha = tt < 2 ? 1 : 1 - (tt - 2) / 0.5
        text(c, env.name, W / 2, H / 2 - 50, { size: W < 600 ? 14 : 22, color: t.accent, shadow: t.accent })
        c.globalAlpha = 1
      }
      if (phase === 'result') {
        c.fillStyle = 'rgba(0,0,0,.45)'
        c.fillRect(0, H / 2 - 40, W, 80)
        text(c, resultMsg, W / 2, H / 2, { size: W < 600 ? 18 : 26, color: resultOk ? t.good : t.danger, shadow: resultOk ? t.good : t.danger })
      }
    }

    const lp = loop(update, draw)
    return {
      pause: (p) => lp.pause(p),
      destroy() {
        lp.stop()
        k.dispose()
        bag.dispose()
        st.dispose()
      },
    }
  },
}

export default engine
