// Maze & path games: generated mazes (keys, doors, dark, versus, foes), tilt-maze with inertia, and Flow-style path drawing.
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, pointer, roundRect, Shake, swipe, text, vpad, type Engine, type GameEnv, type Stage } from '../kit'
import { DIRS, distances, genFlow, genMaze, neighbors, placeLocks, solvePath, type Lock, type Maze } from '../logic/maze'
import { bestTour, crossings, edgeIndex, genEuler, genTour, genTrace, genUntangle, tourLength, traceMoveOk, traceWon, type Euler, type Pt, type Tour, type Trace, type TraceKind, type Untangle } from '../logic/maze-modes'

let W = 800
let H = 450

interface Scene {
  update(dt: number): void
  draw(): void
  dispose?(): void
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

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

function banner(c: CanvasRenderingContext2D, env: GameEnv, hint: string, t: number) {
  if (t > 2.6) return
  const a = t < 2 ? 1 : 1 - (t - 2) / 0.6
  c.globalAlpha = a
  roundRect(c, W / 2 - Math.min(300, W / 2 - 6), 10, Math.min(600, W - 12), 50, 12, 'rgba(0,0,0,.55)')
  text(c, env.name.length > 34 ? env.name.slice(0, 33) + '…' : env.name, W / 2, 28, { size: W < 600 ? 10 : 14, color: env.theme.accent, shadow: env.theme.accent })
  text(c, hint, W / 2, 47, { size: W < 600 ? 6 : 9, color: env.theme.fg })
  c.globalAlpha = 1
}

function centerMsg(c: CanvasRenderingContext2D, env: GameEnv, big: string, small: string, a = 1) {
  c.globalAlpha = a
  c.fillStyle = 'rgba(0,0,0,.5)'
  c.fillRect(0, H / 2 - 50, W, 100)
  text(c, big, W / 2, H / 2 - 12, { size: 26, color: env.theme.accent, shadow: env.theme.accent })
  text(c, small, W / 2, H / 2 + 24, { size: 11, color: env.theme.fg })
  c.globalAlpha = 1
}

// ---------- baked walls ----------

function bakeWalls(m: Maze, cs: number, color: string, glow: string): HTMLCanvasElement {
  const sc = 2
  const pad = 6
  const cv = document.createElement('canvas')
  cv.width = (m.w * cs + pad * 2) * sc
  cv.height = (m.h * cs + pad * 2) * sc
  const g = cv.getContext('2d')!
  g.scale(sc, sc)
  g.translate(pad, pad)
  g.lineCap = 'round'
  g.strokeStyle = color
  g.shadowColor = glow
  g.shadowBlur = 8
  g.lineWidth = Math.max(3, cs * 0.13)
  g.beginPath()
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const w = m.walls[y * m.w + x]
    const x0 = x * cs
    const y0 = y * cs
    if (y === 0 && w & 1) { g.moveTo(x0, y0); g.lineTo(x0 + cs, y0) }
    if (x === 0 && w & 8) { g.moveTo(x0, y0); g.lineTo(x0, y0 + cs) }
    if (w & 2) { g.moveTo(x0 + cs, y0); g.lineTo(x0 + cs, y0 + cs) }
    if (w & 4) { g.moveTo(x0, y0 + cs); g.lineTo(x0 + cs, y0 + cs) }
  }
  g.stroke()
  return cv
}

const blit = (c: CanvasRenderingContext2D, cv: HTMLCanvasElement, ox: number, oy: number) => c.drawImage(cv, ox - 6, oy - 6, cv.width / 2, cv.height / 2)

// ---------- grid maze (classic, keys, dark, collect, versus) ----------

interface Walker {
  c: number
  px: number
  py: number
  cool: number
  emoji: string
  color: string
  rot: number
}

interface Opts {
  versus: boolean
  dark: boolean
  keysOn: boolean
  collect: boolean
  foesOn: boolean
  timed: boolean
}

function gridMaze(G: Ctx, o: Opts): Scene {
  const { env, c, k, fx, shake } = G
  const t = env.theme
  const two = env.players === 2
  const levels = o.versus ? 3 : byDiff(env, 5, 6, 8)
  const moveTime = byDiff(env, 0.12, 0.105, 0.095)
  let level = 1
  let score = 0
  let lives = byDiff(env, 5, 3, 3)
  let wins = [0, 0]
  let round = 1
  let m!: Maze
  let cs = 40
  let ox = 0
  let oy = 0
  let goal = 0
  let walls!: HTMLCanvasElement
  let locks: Lock[] = []
  let open = new Set<number>()
  let got = new Set<number>()
  let items = new Map<number, string>()
  let totalItems = 0
  let seen = new Uint8Array(0)
  let foes: { c: number; px: number; py: number; prev: number; t: number; e: string }[] = []
  let heroes: Walker[] = []
  let elapsed = 0
  let limit = 0
  let par = 0
  let inv = 0
  let msg = ''
  let msgT = 0
  let pause = 0
  let after: (() => void) | null = null
  let over = false
  let path: number[] = []
  let aiStep = 0
  let aiT = 0
  const queue: number[][] = [[], []]
  const alt = t.heroes.find((h) => h !== t.hero) ?? t.foes[0]

  const cellXY = (i: number) => ({ x: ox + (i % m.w + 0.5) * cs, y: oy + (((i / m.w) | 0) + 0.5) * cs })
  const place = (wk: Walker, i: number) => {
    wk.c = i
    wk.px = i % m.w
    wk.py = (i / m.w) | 0
  }

  const build = () => {
    const grow = o.versus ? round - 1 : level - 1
    const w = clamp(8 + grow * 2 + byDiff(env, -2, 0, 2) + (o.versus ? 4 : 0), 8, 26)
    const h = Math.max(5, Math.round(w * 0.58))
    m = genMaze(w, h, env.rng)
    cs = Math.min(56, Math.floor(Math.min((W - 24) / w, (H - 24) / h)))
    ox = Math.round((W - w * cs) / 2)
    oy = Math.round((H - h * cs) / 2)
    const d = distances(m, 0)
    goal = 0
    for (let i = 0; i < d.length; i++) if (d[i] > d[goal]) goal = i
    path = solvePath(m, 0, goal)
    locks = o.keysOn && !o.versus ? placeLocks(m, 0, goal, Math.min(4, 1 + Math.floor(level / 2)), env.rng) : []
    open = new Set()
    got = new Set()
    items = new Map()
    if (o.collect && !o.versus) {
      const used = new Set<number>([0, goal, ...locks.map((l) => l.key)])
      const cells = env.rng.shuffle(Array.from({ length: w * h }, (_, i) => i)).filter((i) => !used.has(i))
      const n = Math.min(cells.length, 4 + level * 2)
      for (let i = 0; i < n; i++) items.set(cells[i], t.items[(i + level) % t.items.length])
    }
    totalItems = items.size
    seen = new Uint8Array(w * h)
    walls = bakeWalls(m, cs, t.accent, t.accent)
    const mk = (e: string, color: string): Walker => ({ c: 0, px: 0, py: 0, cool: 0, emoji: e, color, rot: 0 })
    heroes = o.versus ? [mk(t.hero, t.accent), mk(alt, t.accent2)] : [mk(t.hero, t.accent)]
    for (const hh of heroes) place(hh, 0)
    foes = []
    if (o.foesOn && !o.versus) {
      const n = Math.min(6, byDiff(env, 0, 1, 2) + Math.floor(level / 2))
      for (let i = 0; i < n; i++) {
        let f = env.rng.int(Math.floor(d.length / 3), d.length - 1)
        if (f === goal) f = (f + 7) % d.length
        foes.push({ c: f, px: f % w, py: (f / w) | 0, prev: -1, t: env.rng.range(0, 0.4), e: t.foes[i % t.foes.length] })
      }
    }
    par = path.length * 0.35 + 6
    limit = o.timed ? Math.round(w * h * byDiff(env, 0.19, 0.15, 0.115) + 12) : 0
    elapsed = 0
    inv = 0
    aiStep = 0
    aiT = 0
    queue[0].length = 0
    queue[1].length = 0
    hud()
  }

  const hud = () => {
    env.score(score)
    if (o.versus) {
      env.status(`Round ${round}/3 · P1 ${wins[0]} - ${wins[1]} ${two ? 'P2' : 'CPU'} · ${fmt(elapsed)}`)
      return
    }
    let s = `Level ${level}/${levels}`
    if (!o.versus && (foes.length || lives < 3 || o.timed)) s += ` · ${'❤️'.repeat(Math.max(0, lives))}`
    if (locks.length) s += ` · 🔑${got.size}/${locks.length}`
    if (totalItems) s += ` · ${totalItems - items.size}/${totalItems}`
    s += limit ? ` · ⏱ ${fmt(Math.max(0, limit - elapsed))}` : ` · ${fmt(elapsed)}`
    env.status(s)
  }

  const doorAt = (a: number, b: number) => locks.findIndex((l, i) => !open.has(i) && ((l.a === a && l.b === b) || (l.a === b && l.b === a)))

  const tryMove = (wk: Walker, di: number, idx: number): boolean => {
    const d = DIRS[di]
    if (m.walls[wk.c] & d.bit) return false
    const n = wk.c + d.dx + d.dy * m.w
    const dr = doorAt(wk.c, n)
    if (dr >= 0) {
      if (!got.has(dr)) {
        if (wk.cool <= 0) {
          env.sfx('hit')
          msg = 'Locked! Find the key'
          msgT = 1
        }
        wk.cool = 0.15
        return false
      }
      open.add(dr)
      env.sfx('power')
      const p = cellXY(n)
      fx.burst(p.x, p.y, t.blocks[dr % t.blocks.length], 18, 150)
    }
    wk.c = n
    wk.cool = moveTime
    wk.rot = d.dx * 0.25
    if (idx === 0 || o.versus) env.sfx('move')
    return true
  }

  const dirFor = (idx: number): number => {
    const acts = o.versus && two ? (idx === 0 ? ['KeyW', 'KeyD', 'KeyS', 'KeyA'] : ['p2up', 'p2right', 'p2down', 'p2left']) : ['up', 'right', 'down', 'left']
    for (let i = 0; i < 4; i++) if (k.hit(acts[i])) return i
    if (queue[idx].length) return queue[idx].shift()!
    for (let i = 0; i < 4; i++) if (k.down(acts[i])) return i
    return -1
  }
  const SW = { up: 0, right: 1, down: 2, left: 3 } as const
  G.bag.add(swipe(G.st.canvas, (d) => queue[0].push(SW[d])))

  const finishLevel = () => {
    const bonus = Math.max(0, Math.round((par - elapsed) * 5))
    score += 100 * level + bonus + (totalItems - items.size) * 10
    env.sfx('win')
    const p = cellXY(goal)
    fx.burst(p.x, p.y, t.good, 40, 260, 4)
    fx.burst(p.x, p.y, t.accent, 30, 200, 3)
    if (level >= levels) {
      over = true
      msg = 'You escaped!'
      msgT = 99
      pause = 1.4
      after = () => env.end({ score, won: true, text: `All ${levels} mazes cleared in style` })
    } else {
      msg = bonus ? `Level clear! +${bonus} time bonus` : 'Level clear!'
      msgT = 1.2
      pause = 1.3
      level++
      after = build
    }
    hud()
  }

  const loseLife = (why: string) => {
    lives--
    env.sfx('lose')
    shake.kick(8)
    const p = cellXY(heroes[0].c)
    fx.burst(p.x, p.y, t.danger, 30, 220)
    if (lives <= 0) {
      over = true
      msg = why
      msgT = 99
      pause = 1.2
      after = () => env.end({ score, won: false, text: `Caught on level ${level}` })
    } else {
      place(heroes[0], 0)
      inv = 1.5
      msg = why
      msgT = 1
      if (limit) elapsed = 0
    }
    hud()
  }

  const roundWon = (who: number) => {
    wins[who]++
    env.sfx(who === 0 ? 'win' : 'point')
    const p = cellXY(goal)
    fx.burst(p.x, p.y, heroes[who].color, 40, 260, 4)
    const name = who === 0 ? 'P1' : two ? 'P2' : 'CPU'
    score = wins[0] * 100 + Math.max(0, Math.round(par - elapsed))
    if (wins[who] >= 2) {
      over = true
      msg = `${name} wins!`
      msgT = 99
      pause = 1.6
      after = () => env.end({ score: wins[0] * 100 + (wins[0] > wins[1] ? 100 : 0), won: wins[0] > wins[1] || two, text: `${name} wins ${wins[0]}-${wins[1]}` })
    } else {
      msg = `${name} takes round ${round}`
      msgT = 1.2
      pause = 1.3
      round++
      after = build
    }
    hud()
  }

  build()
  let tt = 0
  let hudT = 0

  return {
    update(dt) {
      tt += dt
      fx.update(dt)
      shake.update(dt)
      msgT -= dt
      if (pause > 0) {
        pause -= dt
        if (pause <= 0 && after) {
          const f = after
          after = null
          f()
        }
        return
      }
      if (over) return
      elapsed += dt
      inv -= dt
      hudT += dt
      if (hudT > 0.25) {
        hudT = 0
        hud()
      }
      if (limit && elapsed >= limit) {
        loseLife('Time is up!')
        return
      }
      // walkers
      for (const [i, wk] of heroes.entries()) {
        wk.cool -= dt
        wk.px += (wk.c % m.w - wk.px) * Math.min(1, dt * 18)
        wk.py += (((wk.c / m.w) | 0) - wk.py) * Math.min(1, dt * 18)
        wk.rot *= 0.9
        const ai = o.versus && !two && i === 1
        if (ai) {
          aiT += dt
          const spd = byDiff(env, 0.26, 0.2, 0.15)
          if (aiT > spd && aiStep < path.length - 1) {
            aiT = 0
            aiStep++
            wk.c = path[aiStep]
            if (env.rng.chance(byDiff(env, 0.1, 0.06, 0.02))) aiT = -0.5
          }
        } else if (wk.cool <= 0) {
          const di = dirFor(i)
          if (di >= 0) tryMove(wk, di, i)
        }
        if (!o.versus || i === 0) {
          const L = locks.findIndex((l) => l.key === wk.c)
          if (L >= 0 && !got.has(L)) {
            got.add(L)
            score += 25
            env.sfx('power')
            const p = cellXY(wk.c)
            fx.burst(p.x, p.y, t.blocks[L % t.blocks.length], 20, 180)
            msg = 'Got the key!'
            msgT = 0.9
            hud()
          }
          const it = items.get(wk.c)
          if (it) {
            items.delete(wk.c)
            score += 10
            env.sfx('point')
            const p = cellXY(wk.c)
            fx.burst(p.x, p.y, t.good, 14, 140)
            hud()
          }
        }
        for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
          if (o.dark && i === 0 && Math.hypot(x - wk.px, y - wk.py) < 3.4) seen[y * m.w + x] = 1
        }
        if (wk.c === goal && (!totalItems || items.size === 0)) {
          if (o.versus) roundWon(i)
          else finishLevel()
          return
        }
        if (wk.c === goal && items.size && wk.cool <= 0) {
          msg = `Collect all ${t.items[0]} first`
          msgT = 1
        }
      }
      // foes patrol
      const hero = heroes[0]
      let dh: Int32Array | null = null
      for (const f of foes) {
        f.px += (f.c % m.w - f.px) * Math.min(1, dt * 10)
        f.py += (((f.c / m.w) | 0) - f.py) * Math.min(1, dt * 10)
        f.t -= dt
        if (f.t <= 0) {
          f.t = byDiff(env, 0.6, 0.5, 0.4)
          const nb = neighbors(m, f.c)
          let opts = nb.filter((n) => n !== f.prev)
          if (!opts.length) opts = nb
          if (env.rng.chance(0.3 + level * 0.03)) {
            dh ??= distances(m, hero.c)
            opts = [opts.reduce((a, b) => (dh![b] < dh![a] ? b : a))]
          }
          f.prev = f.c
          f.c = env.rng.pick(opts)
        }
        if (inv <= 0 && Math.hypot(f.px - hero.px, f.py - hero.py) < 0.55) {
          loseLife(`${f.e} got you!`)
          return
        }
      }
    },
    draw() {
      c.save()
      background(c, W, H, t, 40, env.seed)
      shake.apply(c)
      // floor
      roundRect(c, ox - 4, oy - 4, m.w * cs + 8, m.h * cs + 8, 8, 'rgba(0,0,0,.35)')
      c.fillStyle = 'rgba(255,255,255,.035)'
      for (let y = 0; y < m.h; y++) for (let x = (y & 1); x < m.w; x += 2) c.fillRect(ox + x * cs, oy + y * cs, cs, cs)
      blit(c, walls, ox, oy)
      // start & exit
      const s0 = cellXY(0)
      c.globalAlpha = 0.35
      c.fillStyle = t.accent
      c.beginPath()
      c.arc(s0.x, s0.y, cs * 0.36, 0, 7)
      c.fill()
      c.globalAlpha = 1
      const ex = cellXY(goal)
      const locked = items.size > 0
      const pulse = 1 + Math.sin(tt * 5) * 0.08
      c.save()
      c.shadowColor = locked ? t.danger : t.good
      c.shadowBlur = 16
      c.strokeStyle = locked ? t.danger : t.good
      c.lineWidth = 3
      c.beginPath()
      c.arc(ex.x, ex.y, cs * 0.38 * pulse, 0, 7)
      c.stroke()
      c.restore()
      emoji(c, locked ? '🔒' : '🏁', ex.x, ex.y, cs * 0.5)
      // doors
      for (const [i, l] of locks.entries()) {
        if (open.has(i)) continue
        const a = cellXY(l.a)
        const b = cellXY(l.b)
        const col = t.blocks[i % t.blocks.length]
        c.strokeStyle = col
        c.shadowColor = col
        c.shadowBlur = 10
        c.lineWidth = Math.max(5, cs * 0.2)
        c.lineCap = 'round'
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        const px = (b.y - a.y) / cs
        const py = -(b.x - a.x) / cs
        c.beginPath()
        c.moveTo(mx - px * cs * 0.42, my - py * cs * 0.42)
        c.lineTo(mx + px * cs * 0.42, my + py * cs * 0.42)
        c.stroke()
        c.shadowBlur = 0
        if (!got.has(i)) {
          const kp = cellXY(l.key)
          c.fillStyle = col
          c.globalAlpha = 0.28 + Math.sin(tt * 4 + i) * 0.08
          c.beginPath()
          c.arc(kp.x, kp.y, cs * 0.42, 0, 7)
          c.fill()
          c.globalAlpha = 1
          emoji(c, '🔑', kp.x, kp.y + Math.sin(tt * 4 + i) * 2, cs * 0.55)
        }
      }
      for (const [ci, e] of items) {
        const p = cellXY(ci)
        emoji(c, e, p.x, p.y + Math.sin(tt * 4 + ci) * 2, cs * 0.5)
      }
      for (const f of foes) emoji(c, f.e, ox + (f.px + 0.5) * cs, oy + (f.py + 0.5) * cs, cs * 0.7, Math.sin(tt * 8) * 0.12)
      for (const [i, wk] of heroes.entries()) {
        const x = ox + (wk.px + 0.5) * cs
        const y = oy + (wk.py + 0.5) * cs
        if (o.versus) {
          c.strokeStyle = wk.color
          c.lineWidth = 3
          c.shadowColor = wk.color
          c.shadowBlur = 10
          c.beginPath()
          c.arc(x, y, cs * 0.4, 0, 7)
          c.stroke()
          c.shadowBlur = 0
        }
        if (i === 0 && inv > 0 && Math.floor(tt * 14) % 2) c.globalAlpha = 0.4
        emoji(c, wk.emoji, x, y, cs * 0.72, wk.rot)
        c.globalAlpha = 1
      }
      fx.draw(c)
      if (o.dark) {
        const h0 = heroes[0]
        for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
          const d = Math.hypot(x - h0.px, y - h0.py)
          let a = clamp((d - 1.9) / 1.6, 0, 1)
          if (seen[y * m.w + x] && a > 0.78) a = 0.78
          if (a > 0.01) {
            c.fillStyle = `rgba(0,0,6,${a.toFixed(2)})`
            c.fillRect(ox + x * cs - 0.5, oy + y * cs - 0.5, cs + 1, cs + 1)
          }
        }
      }
      c.restore()
      banner(c, env, o.versus ? (two ? 'P1: WASD   P2: ARROWS   first to the exit wins' : 'ARROWS / WASD   race the CPU to the exit') : 'ARROWS / WASD / SWIPE   reach the exit', tt)
      if (msgT > 0 && !over) text(c, msg, W / 2, H - 14, { size: 12, color: t.fg, shadow: '#000' })
      if (pause > 0 || over) centerMsg(c, env, msg, level > levels ? '' : '', Math.min(1, msgT))
    },
  }
}

// ---------- tilt maze ----------

function tiltMaze(G: Ctx, keysOn: boolean): Scene {
  const { env, c, k, fx, shake } = G
  const t = env.theme
  const levels = byDiff(env, 5, 6, 7)
  let level = 1
  let score = 0
  let m!: Maze
  let cs = 40
  let ox = 0
  let oy = 0
  let goal = 0
  let rects: { x: number; y: number; w: number; h: number; door: number }[] = []
  let walls!: HTMLCanvasElement
  let locks: Lock[] = []
  let got = new Set<number>()
  let holes: number[] = []
  const ball = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, scale: 1 }
  const tilt = { x: 0, y: 0 }
  let dev: { x: number; y: number } | null = null
  let elapsed = 0
  let falls = 0
  let pause = 0
  let after: (() => void) | null = null
  let msg = ''
  let msgT = 0
  let over = false
  let tt = 0
  let fell = 0

  const cellC = (i: number) => ({ x: (i % m.w + 0.5) * cs, y: (((i / m.w) | 0) + 0.5) * cs })

  const build = () => {
    const w = clamp(7 + level * 1 + byDiff(env, -1, 0, 1), 7, 15)
    const h = Math.max(5, Math.round(w * 0.62))
    m = genMaze(w, h, env.rng)
    cs = Math.min(64, Math.floor(Math.min((W - 30) / w, (H - 30) / h)))
    ox = Math.round((W - w * cs) / 2)
    oy = Math.round((H - h * cs) / 2)
    const d = distances(m, 0)
    goal = 0
    for (let i = 0; i < d.length; i++) if (d[i] > d[goal]) goal = i
    locks = keysOn ? placeLocks(m, 0, goal, Math.min(3, 1 + Math.floor(level / 3)), env.rng) : []
    got = new Set()
    const path = new Set(solvePath(m, 0, goal))
    const used = new Set<number>([0, goal, ...locks.map((l) => l.key)])
    holes = []
    const want = level < 2 ? 0 : Math.min(7, level - 1 + byDiff(env, 0, 1, 2))
    const cand = env.rng.shuffle(Array.from({ length: w * h }, (_, i) => i)).filter((i) => !path.has(i) && !used.has(i) && neighbors(m, i).length <= 2)
    for (let i = 0; i < Math.min(want, cand.length); i++) holes.push(cand[i])
    const th = Math.max(4, cs * 0.14)
    rects = []
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const wl = m.walls[y * w + x]
      const x0 = x * cs
      const y0 = y * cs
      if (y === 0 && wl & 1) rects.push({ x: x0 - th / 2, y: y0 - th / 2, w: cs + th, h: th, door: -1 })
      if (x === 0 && wl & 8) rects.push({ x: x0 - th / 2, y: y0 - th / 2, w: th, h: cs + th, door: -1 })
      if (wl & 2) rects.push({ x: x0 + cs - th / 2, y: y0 - th / 2, w: th, h: cs + th, door: -1 })
      if (wl & 4) rects.push({ x: x0 - th / 2, y: y0 + cs - th / 2, w: cs + th, h: th, door: -1 })
    }
    for (const [i, l] of locks.entries()) {
      const a = cellC(l.a)
      const b = cellC(l.b)
      const mx = (a.x + b.x) / 2
      const my = (a.y + b.y) / 2
      if (a.x === b.x) rects.push({ x: mx - cs / 2, y: my - th / 2, w: cs, h: th, door: i })
      else rects.push({ x: mx - th / 2, y: my - cs / 2, w: th, h: cs, door: i })
    }
    walls = bakeWalls(m, cs, t.accent, t.accent)
    const s = cellC(0)
    ball.x = s.x
    ball.y = s.y
    ball.vx = ball.vy = 0
    ball.scale = 1
    elapsed = 0
    hud()
  }
  const hud = () => {
    env.score(score)
    env.status(`Level ${level}/${levels} · ${locks.length ? `🔑${got.size}/${locks.length} · ` : ''}${falls ? `🕳️${falls} · ` : ''}${fmt(elapsed)}`)
  }

  const onOri = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return
    dev = { x: clamp(e.gamma / 22, -1, 1), y: clamp((e.beta - 35) / 22, -1, 1) }
  }
  if (typeof DeviceOrientationEvent !== 'undefined') G.bag.on(window, 'deviceorientation', onOri)
  G.bag.on(G.st.canvas, 'pointerdown', () => {
    const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof D.requestPermission === 'function') D.requestPermission().catch(() => {})
  })

  build()

  return {
    update(dt) {
      tt += dt
      fx.update(dt)
      shake.update(dt)
      msgT -= dt
      if (pause > 0) {
        pause -= dt
        if (pause <= 0 && after) {
          const f = after
          after = null
          f()
        }
        return
      }
      if (over) return
      elapsed += dt
      const a = k.axis()
      let tx = a.x
      let ty = a.y
      if (dev && !tx && !ty) {
        tx = dev.x
        ty = dev.y
      }
      tilt.x += (tx - tilt.x) * Math.min(1, dt * 7)
      tilt.y += (ty - tilt.y) * Math.min(1, dt * 7)
      const g = cs * byDiff(env, 12, 14, 16)
      const r = cs * 0.27
      const sub = 4
      const h = dt / sub
      if (fell > 0) {
        fell -= dt
        ball.scale = Math.max(0, fell / 0.5)
        if (fell <= 0) {
          const s = cellC(0)
          ball.x = s.x
          ball.y = s.y
          ball.vx = ball.vy = 0
          ball.scale = 1
        }
        return
      }
      for (let s = 0; s < sub; s++) {
        ball.vx += tilt.x * g * h
        ball.vy += tilt.y * g * h
        const damp = Math.max(0, 1 - 0.7 * h)
        ball.vx *= damp
        ball.vy *= damp
        const sp = Math.hypot(ball.vx, ball.vy)
        const max = cs * 9
        if (sp > max) {
          ball.vx *= max / sp
          ball.vy *= max / sp
        }
        ball.x += ball.vx * h
        ball.y += ball.vy * h
        for (const rc of rects) {
          if (rc.door >= 0 && got.has(rc.door)) continue
          const nx = clamp(ball.x, rc.x, rc.x + rc.w)
          const ny = clamp(ball.y, rc.y, rc.y + rc.h)
          const dx = ball.x - nx
          const dy = ball.y - ny
          const d2 = dx * dx + dy * dy
          if (d2 >= r * r) continue
          let nxn: number
          let nyn: number
          let pen: number
          if (d2 > 1e-6) {
            const d = Math.sqrt(d2)
            nxn = dx / d
            nyn = dy / d
            pen = r - d
          } else {
            // centre inside the rect: push along the shortest axis
            const l = ball.x - rc.x
            const rr = rc.x + rc.w - ball.x
            const tp = ball.y - rc.y
            const bt = rc.y + rc.h - ball.y
            const mn = Math.min(l, rr, tp, bt)
            nxn = mn === l ? -1 : mn === rr ? 1 : 0
            nyn = mn === tp ? -1 : mn === bt ? 1 : 0
            pen = mn + r
          }
          ball.x += nxn * pen
          ball.y += nyn * pen
          const vn = ball.vx * nxn + ball.vy * nyn
          if (vn < 0) {
            ball.vx -= (1 + 0.35) * vn * nxn
            ball.vy -= (1 + 0.35) * vn * nyn
            if (-vn > cs * 3.2) {
              env.sfx('move')
              fx.burst(ox + ball.x - nxn * r, oy + ball.y - nyn * r, t.accent, 4, 60, 2)
            }
          }
        }
      }
      ball.rot += (ball.vx / r) * dt
      // pickups & hazards
      for (const [i, l] of locks.entries()) {
        if (!got.has(i)) {
          const p = cellC(l.key)
          if (Math.hypot(p.x - ball.x, p.y - ball.y) < cs * 0.45) {
            got.add(i)
            score += 25
            env.sfx('power')
            fx.burst(ox + p.x, oy + p.y, t.blocks[i % t.blocks.length], 22, 200)
            msg = 'Door unlocked!'
            msgT = 1
            hud()
          }
        }
      }
      for (const hc of holes) {
        const p = cellC(hc)
        if (Math.hypot(p.x - ball.x, p.y - ball.y) < cs * 0.3) {
          fell = 0.5
          falls++
          env.sfx('lose')
          shake.kick(5)
          ball.x = p.x
          ball.y = p.y
          ball.vx = ball.vy = 0
          msg = 'Fell in a hole!'
          msgT = 1
          hud()
        }
      }
      const gp = cellC(goal)
      if (Math.hypot(gp.x - ball.x, gp.y - ball.y) < cs * 0.34) {
        const bonus = Math.max(0, Math.round(60 - elapsed - falls * 5)) * 2
        score += 100 * level + bonus
        env.sfx('win')
        fx.burst(ox + gp.x, oy + gp.y, t.good, 40, 260, 4)
        if (level >= levels) {
          over = true
          msg = 'Perfect balance!'
          msgT = 99
          pause = 1.4
          after = () => env.end({ score, won: true, text: `Rolled through ${levels} mazes${falls ? `, ${falls} falls` : ' without falling'}` })
        } else {
          msg = 'Level clear!'
          msgT = 1.2
          pause = 1.2
          level++
          after = build
        }
        hud()
      }
    },
    draw() {
      c.save()
      background(c, W, H, t, 40, env.seed)
      shake.apply(c)
      // the whole board leans with the tilt
      c.translate(W / 2, H / 2)
      c.rotate(tilt.x * 0.035)
      c.transform(1, 0, 0, 1 - Math.abs(tilt.y) * 0.02, 0, tilt.y * 6)
      c.translate(-W / 2, -H / 2)
      roundRect(c, ox - 6, oy - 6, m.w * cs + 12, m.h * cs + 12, 10, 'rgba(0,0,0,.45)', t.accent2, 2)
      blit(c, walls, ox, oy)
      for (const hc of holes) {
        const p = cellC(hc)
        const g = c.createRadialGradient(ox + p.x, oy + p.y, 1, ox + p.x, oy + p.y, cs * 0.34)
        g.addColorStop(0, '#000')
        g.addColorStop(0.75, '#000')
        g.addColorStop(1, t.danger)
        c.fillStyle = g
        c.beginPath()
        c.arc(ox + p.x, oy + p.y, cs * 0.3, 0, 7)
        c.fill()
      }
      const gp = cellC(goal)
      c.save()
      c.shadowColor = t.good
      c.shadowBlur = 18
      c.strokeStyle = t.good
      c.lineWidth = 3
      c.beginPath()
      c.arc(ox + gp.x, oy + gp.y, cs * (0.34 + Math.sin(tt * 5) * 0.03), 0, 7)
      c.stroke()
      c.restore()
      emoji(c, '🏁', ox + gp.x, oy + gp.y, cs * 0.45)
      for (const [i, l] of locks.entries()) {
        const col = t.blocks[i % t.blocks.length]
        if (!got.has(i)) {
          const kp = cellC(l.key)
          c.fillStyle = col
          c.globalAlpha = 0.3
          c.beginPath()
          c.arc(ox + kp.x, oy + kp.y, cs * 0.4, 0, 7)
          c.fill()
          c.globalAlpha = 1
          emoji(c, '🔑', ox + kp.x, oy + kp.y, cs * 0.5)
          const a = cellC(l.a)
          const b = cellC(l.b)
          c.strokeStyle = col
          c.shadowColor = col
          c.shadowBlur = 10
          c.lineWidth = Math.max(5, cs * 0.18)
          c.lineCap = 'round'
          const mx = (a.x + b.x) / 2
          const my = (a.y + b.y) / 2
          const px = (b.y - a.y) / cs
          const py = -(b.x - a.x) / cs
          c.beginPath()
          c.moveTo(ox + mx - px * cs * 0.45, oy + my - py * cs * 0.45)
          c.lineTo(ox + mx + px * cs * 0.45, oy + my + py * cs * 0.45)
          c.stroke()
          c.shadowBlur = 0
        }
      }
      const r = cs * 0.27
      c.fillStyle = 'rgba(0,0,0,.35)'
      c.beginPath()
      c.ellipse(ox + ball.x + 3, oy + ball.y + 4, r * ball.scale, r * 0.8 * ball.scale, 0, 0, 7)
      c.fill()
      emoji(c, t.hero, ox + ball.x, oy + ball.y, r * 2.3 * ball.scale, ball.rot)
      fx.draw(c)
      c.restore()
      banner(c, env, 'ARROWS / WASD / TILT YOUR DEVICE   roll to the flag', tt)
      if (msgT > 0 && !over) text(c, msg, W / 2, H - 14, { size: 12, color: t.fg, shadow: '#000' })
      if (pause > 0) centerMsg(c, env, msg, '', Math.min(1, msgT))
    },
  }
}

// ---------- flow / draw-path ----------

function flowGame(G: Ctx): Scene {
  const { env, c, fx, shake } = G
  const t = env.theme
  const levels = byDiff(env, 6, 8, 10)
  const ptr = pointer(G.st)
  G.bag.add(() => ptr.dispose())
  let level = 1
  let score = 0
  let f!: ReturnType<typeof genFlow>
  let cs = 50
  let ox = 0
  let oy = 0
  let paths: number[][] = []
  let owner: Int8Array = new Int8Array(0)
  let active = -1
  let elapsed = 0
  let moves = 0
  let pause = 0
  let after: (() => void) | null = null
  let msg = ''
  let msgT = 0
  let over = false
  let tt = 0
  let done = new Set<number>()
  let cursor = { x: 0, y: 0 }

  const endpoint = (cell: number): number => f.pairs.findIndex((p) => p.a === cell || p.b === cell)
  const complete = (i: number) => {
    const p = paths[i]
    if (p.length < 2) return false
    const last = p[p.length - 1]
    return (p[0] === f.pairs[i].a && last === f.pairs[i].b) || (p[0] === f.pairs[i].b && last === f.pairs[i].a)
  }
  const cellXY = (i: number) => ({ x: ox + (i % f.w + 0.5) * cs, y: oy + (((i / f.w) | 0) + 0.5) * cs })

  const build = () => {
    const size = Math.min(9, 5 + Math.floor((level - 1) / 2))
    const pairs = Math.min(8, 3 + Math.floor((level + 1) / 1.7) + byDiff(env, -1, 0, 0))
    f = genFlow(size, size, Math.min(pairs, Math.floor(size * 1.1)), env.rng)
    cs = Math.min(64, Math.floor((H - 40) / size))
    ox = Math.round((W - size * cs) / 2)
    oy = Math.round((H - size * cs) / 2) + 6
    paths = f.pairs.map(() => [])
    owner = new Int8Array(size * size).fill(-1)
    active = -1
    elapsed = 0
    moves = 0
    done = new Set()
    hud()
  }
  const hud = () => {
    env.score(score)
    env.status(`Level ${level}/${levels} · ${done.size}/${f.pairs.length} linked · ${moves} strokes`)
  }

  const cellAt = (x: number, y: number): number => {
    const cx = Math.floor((x - ox) / cs)
    const cy = Math.floor((y - oy) / cs)
    return cx < 0 || cy < 0 || cx >= f.w || cy >= f.h ? -1 : cy * f.w + cx
  }

  const checkDone = () => {
    const nd = new Set<number>()
    f.pairs.forEach((_, i) => complete(i) && nd.add(i))
    for (const i of nd) if (!done.has(i)) {
      const p = cellXY(paths[i][paths[i].length - 1])
      fx.burst(p.x, p.y, t.blocks[i % t.blocks.length], 18, 170)
      env.sfx('point')
    }
    done = nd
    hud()
    if (done.size === f.pairs.length) {
      const filled = owner.reduce((s, v) => s + (v >= 0 ? 1 : 0), 0)
      const bonus = Math.max(0, Math.round(40 - elapsed)) * 3 + (filled === f.w * f.h ? 150 : 0)
      score += 100 * level + bonus
      env.sfx('win')
      shake.kick(4)
      for (let i = 0; i < f.pairs.length; i++) for (const cell of paths[i]) {
        const p = cellXY(cell)
        fx.burst(p.x, p.y, t.blocks[i % t.blocks.length], 2, 90, 3)
      }
      if (level >= levels) {
        over = true
        msg = 'All linked!'
        msgT = 99
        pause = 1.4
        after = () => env.end({ score, won: true, text: `Solved all ${levels} boards` })
      } else {
        msg = filled === f.w * f.h ? 'Perfect fill! +150' : 'Linked!'
        msgT = 1.2
        pause = 1.2
        level++
        after = build
      }
      hud()
    }
  }

  const extendTo = (target: number) => {
    if (active < 0) return
    let guard = 0
    while (guard++ < 40) {
      const p = paths[active]
      if (!p.length) return
      const head = p[p.length - 1]
      if (head === target) return
      if (complete(active)) return
      const hx = head % f.w
      const hy = (head / f.w) | 0
      const dx = (target % f.w) - hx
      const dy = ((target / f.w) | 0) - hy
      const horiz = Math.abs(dx) >= Math.abs(dy) ? dx !== 0 : dy === 0
      const n = horiz ? head + Math.sign(dx) : head + Math.sign(dy) * f.w
      if (p.length > 1 && n === p[p.length - 2]) {
        p.pop()
        owner[head] = -1
        continue
      }
      const own = owner[n]
      if (own === active) {
        const idx = p.indexOf(n)
        for (const cell of p.splice(idx + 1)) owner[cell] = -1
        continue
      }
      const ep = endpoint(n)
      if (ep >= 0 && ep !== active) return
      if (own >= 0 && own !== active) {
        const q = paths[own]
        const idx = q.indexOf(n)
        for (const cell of q.splice(idx)) owner[cell] = -1
        env.sfx('hit')
      }
      p.push(n)
      owner[n] = active
      env.sfx('move')
    }
  }

  ptr.onDown((p) => {
    if (pause > 0 || over) return
    const cell = cellAt(p.x, p.y)
    if (cell < 0) return
    const ep = endpoint(cell)
    if (ep >= 0) {
      for (const x of paths[ep]) owner[x] = -1
      paths[ep] = [cell]
      owner[cell] = ep
      active = ep
      moves++
      env.sfx('click')
    } else if (owner[cell] >= 0) {
      active = owner[cell]
      const idx = paths[active].indexOf(cell)
      for (const x of paths[active].splice(idx + 1)) owner[x] = -1
      moves++
    }
    cursor = { x: p.x, y: p.y }
    checkDone()
  })
  ptr.onMove((p) => {
    cursor = { x: p.x, y: p.y }
    if (!p.down || active < 0) return
    const cell = cellAt(p.x, p.y)
    if (cell >= 0) {
      extendTo(cell)
      checkDone()
    }
  })
  ptr.onUp(() => {
    active = -1
  })
  G.k.onKey((e) => {
    if (e.code === 'KeyR' && !over) {
      paths = f.pairs.map(() => [])
      owner.fill(-1)
      done = new Set()
      hud()
    }
  })

  build()

  return {
    update(dt) {
      tt += dt
      fx.update(dt)
      shake.update(dt)
      msgT -= dt
      if (pause > 0) {
        pause -= dt
        if (pause <= 0 && after) {
          const fn = after
          after = null
          fn()
        }
        return
      }
      if (!over) elapsed += dt
    },
    draw() {
      c.save()
      background(c, W, H, t, 40, env.seed)
      shake.apply(c)
      roundRect(c, ox - 8, oy - 8, f.w * cs + 16, f.h * cs + 16, 12, 'rgba(0,0,0,.4)', t.accent2, 2)
      c.strokeStyle = t.fg
      c.globalAlpha = 0.12
      c.lineWidth = 1
      for (let i = 0; i <= f.w; i++) {
        c.beginPath(); c.moveTo(ox + i * cs, oy); c.lineTo(ox + i * cs, oy + f.h * cs); c.stroke()
        c.beginPath(); c.moveTo(ox, oy + i * cs); c.lineTo(ox + f.w * cs, oy + i * cs); c.stroke()
      }
      c.globalAlpha = 1
      for (const [i, p] of paths.entries()) {
        if (!p.length) continue
        const col = t.blocks[i % t.blocks.length]
        c.globalAlpha = 0.16
        c.fillStyle = col
        for (const cell of p) c.fillRect(ox + (cell % f.w) * cs + 1, oy + ((cell / f.w) | 0) * cs + 1, cs - 2, cs - 2)
        c.globalAlpha = 1
        c.strokeStyle = col
        c.lineWidth = cs * 0.36
        c.lineCap = 'round'
        c.lineJoin = 'round'
        c.shadowColor = col
        c.shadowBlur = done.has(i) ? 14 + Math.sin(tt * 6) * 4 : 6
        c.beginPath()
        p.forEach((cell, j) => {
          const q = cellXY(cell)
          if (j) c.lineTo(q.x, q.y)
          else c.moveTo(q.x, q.y)
        })
        if (p.length === 1) c.lineTo(cellXY(p[0]).x + 0.1, cellXY(p[0]).y)
        c.stroke()
        c.shadowBlur = 0
      }
      for (const [i, pr] of f.pairs.entries()) {
        const col = t.blocks[i % t.blocks.length]
        for (const cell of [pr.a, pr.b]) {
          const q = cellXY(cell)
          c.fillStyle = col
          c.shadowColor = col
          c.shadowBlur = 10
          c.beginPath()
          c.arc(q.x, q.y, cs * 0.34, 0, 7)
          c.fill()
          c.shadowBlur = 0
          emoji(c, t.items[i % t.items.length], q.x, q.y, cs * 0.42)
        }
      }
      if (active >= 0 && paths[active].length) {
        const h = cellXY(paths[active][paths[active].length - 1])
        emoji(c, t.hero, h.x, h.y - 2, cs * 0.6, Math.sin(tt * 10) * 0.15)
      } else if (cursor.x && !over) {
        c.globalAlpha = 0.5
        emoji(c, t.hero, cursor.x, cursor.y, cs * 0.45)
        c.globalAlpha = 1
      }
      fx.draw(c)
      c.restore()
      banner(c, env, 'DRAG FROM A DOT TO ITS TWIN   paths cannot cross   R = reset', tt)
      if (pause > 0) centerMsg(c, env, msg, '', Math.min(1, msgT))
    },
  }
}

// ---------- path puzzles: trace / euler / untangle / tour ----------

interface Lvl {
  update(dt: number): void
  win(msg: string, bonus: number): void
  lose(msg: string): void
  busy(): boolean
  banner(): void
}

/** Shared level progression: score, next level, game end. */
function levelFlow(G: Ctx, levels: number, state: { level: number; score: number; lives: number }, build: () => void, hud: () => void): Lvl {
  const { env, c } = G
  let pause = 0
  let msg = ''
  let ok = true
  let after: (() => void) | null = null
  let over = false
  return {
    update(dt) {
      if (pause > 0) {
        pause -= dt
        if (pause <= 0 && after) {
          const f = after
          after = null
          f()
        }
      }
    },
    win(m, bonus) {
      if (pause > 0 || over) return
      state.score += 100 * state.level + bonus
      env.sfx('win')
      msg = state.level >= levels ? 'ALL SOLVED!' : m
      ok = true
      pause = 1.3
      after = () => {
        if (state.level >= levels) {
          over = true
          env.end({ score: state.score, won: true, text: `Solved all ${levels} levels` })
        } else {
          state.level++
          build()
          hud()
        }
      }
      hud()
    },
    lose(m) {
      if (pause > 0 || over) return
      state.lives--
      env.sfx('lose')
      msg = m
      ok = false
      pause = 1.3
      after = () => {
        if (state.lives <= 0) {
          over = true
          env.end({ score: state.score, won: false, text: `Reached level ${state.level}` })
        } else {
          build()
          hud()
        }
      }
      hud()
    },
    busy: () => pause > 0 || over,
    banner() {
      if (pause > 0) centerMsg(c, env, msg, '', 1)
      c.globalAlpha = 1
      void ok
    },
  }
}

const fit = (cols: number, rows: number, maxCs = 70) => {
  const por = W < 600
  const cs = Math.max(20, Math.min(maxCs, Math.floor((W - 24) / cols), Math.floor((H - (por ? 250 : 110)) / rows)))
  return { cs, ox: Math.round((W - cols * cs) / 2), oy: Math.round((H - (por ? 150 : 0) - rows * cs) / 2) + (por ? 40 : 28) }
}

function traceGame(G: Ctx, kind: TraceKind): Scene {
  const { env, c, k, fx, shake } = G
  const t = env.theme
  const ptr = pointer(G.st)
  G.bag.add(() => ptr.dispose())
  const levels = byDiff(env, 5, 6, 8)
  const S = { level: 1, score: 0, lives: byDiff(env, 4, 3, 2) }
  let tr!: Trace
  let path: number[] = []
  let cs = 50
  let ox = 0
  let oy = 0
  let tt = 0
  let lastCell = -1
  const hud = () => {
    env.score(S.score)
    const total = tr.wall.filter((x) => !x).length
    env.status(`Level ${S.level}/${levels} · ${kind === 'fill' || kind === 'knight' ? `${path.length}/${total} cells` : kind === 'visit' ? `${path.length}/${tr.limit} hose` : `${path.length} steps`} · ${'❤️'.repeat(Math.max(0, S.lives))}`)
  }
  const build = () => {
    tr = genTrace(env.rng, kind, S.level, env.difficulty)
    path = [tr.start]
    const f = fit(tr.w, tr.h)
    cs = f.cs
    ox = f.ox
    oy = f.oy
  }
  const flow = levelFlow(G, levels, S, build, () => hud())
  const xy = (i: number) => ({ x: ox + ((i % tr.w) + 0.5) * cs, y: oy + (((i / tr.w) | 0) + 0.5) * cs })
  const cellAt = (x: number, y: number) => {
    const cx = Math.floor((x - ox) / cs)
    const cy = Math.floor((y - oy) / cs)
    return cx < 0 || cy < 0 || cx >= tr.w || cy >= tr.h ? -1 : cy * tr.w + cx
  }
  const check = () => {
    hud()
    if (traceWon(tr, path)) {
      const q = xy(path[path.length - 1])
      fx.burst(q.x, q.y, t.accent, 30, 240, 3)
      flow.win(kind === 'right' ? 'EXIT!' : kind === 'visit' ? 'WATERED!' : 'FILLED!', Math.max(0, tr.solution.length - path.length) * 10 + 50)
    } else if (kind === 'visit' && path.length >= tr.limit) flow.lose('HOSE TOO SHORT')
    else if (!stuckCheck()) {
      /* has moves */
    }
  }
  const stuckCheck = () => {
    if (flow.busy()) return true
    const last = path[path.length - 1]
    const has = Array.from({ length: tr.w * tr.h }, (_, i) => i).some((i) => traceMoveOk(tr, path, i) && (i !== last))
    if (!has && !traceWon(tr, path)) {
      hintStuck = 2
      return false
    }
    return true
  }
  let hintStuck = 0
  const tryMove = (cell: number) => {
    if (flow.busy() || cell < 0) return
    if (path.length > 1 && cell === path[path.length - 2]) {
      path.pop()
      env.sfx('click')
      return check()
    }
    if (traceMoveOk(tr, path, cell)) {
      path.push(cell)
      const q = xy(cell)
      fx.burst(q.x, q.y, t.accent, 4, 70, 2)
      env.sfx('move')
      check()
    } else if (cell !== path[path.length - 1]) {
      shake.kick(1.5)
    }
  }
  const reset = () => {
    if (flow.busy()) return
    path = [tr.start]
    hud()
  }
  ptr.onDown((p) => {
    if (p.button !== 2) tryMove(cellAt(p.x, p.y))
  })
  k.onKey((e) => {
    const last = path[path.length - 1]
    const x = last % tr.w
    const y = (last / tr.w) | 0
    const mv = (dx: number, dy: number) => {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && ny >= 0 && nx < tr.w && ny < tr.h) tryMove(ny * tr.w + nx)
    }
    if (kind !== 'knight') {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') mv(0, -1)
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') mv(0, 1)
      else if (e.code === 'ArrowLeft' || e.code === 'KeyA') mv(-1, 0)
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') mv(1, 0)
    }
    if (e.code === 'KeyZ' || e.code === 'Backspace') {
      if (path.length > 1) {
        path.pop()
        hud()
      }
    } else if (e.code === 'KeyR') reset()
  })
  build()
  hud()
  return {
    update(dt) {
      tt += dt
      fx.update(dt)
      shake.update(dt)
      flow.update(dt)
      hintStuck = Math.max(0, hintStuck - dt)
      if (ptr.down && !flow.busy()) {
        const cell = cellAt(ptr.x, ptr.y)
        if (cell !== lastCell) {
          lastCell = cell
          if (cell >= 0 && cell !== path[path.length - 1]) tryMove(cell)
        }
      } else lastCell = -1
    },
    draw() {
      c.save()
      background(c, W, H, t, 40, env.seed)
      shake.apply(c)
      const set = new Set(path)
      const head = path[path.length - 1]
      for (let i = 0; i < tr.w * tr.h; i++) {
        const q = xy(i)
        if (tr.wall[i]) {
          roundRect(c, q.x - cs / 2 + 3, q.y - cs / 2 + 3, cs - 6, cs - 6, 6, t.fg + '55')
          continue
        }
        const on = set.has(i)
        const next = !on && traceMoveOk(tr, path, i)
        roundRect(c, q.x - cs / 2 + 2, q.y - cs / 2 + 2, cs - 4, cs - 4, 6, on ? t.accent + '44' : next ? (t.fg + '29') : (t.fg + '12'), next ? t.accent : (t.fg + '26'), next ? 2 : 1)
      }
      if (path.length > 1) {
        c.strokeStyle = t.accent
        c.lineWidth = Math.max(4, cs * 0.18)
        c.lineCap = 'round'
        c.lineJoin = 'round'
        c.shadowColor = t.accent
        c.shadowBlur = 10
        c.beginPath()
        path.forEach((cell, i) => {
          const q = xy(cell)
          if (i) c.lineTo(q.x, q.y)
          else c.moveTo(q.x, q.y)
        })
        c.stroke()
        c.shadowBlur = 0
      }
      const s0 = xy(tr.start)
      emoji(c, '🚩', s0.x, s0.y - cs * 0.28, cs * 0.34)
      if (tr.exit >= 0) {
        const q = xy(tr.exit)
        emoji(c, '🏁', q.x, q.y, cs * 0.6 + Math.sin(tt * 5) * 2)
      }
      for (const pl of tr.plants) {
        const q = xy(pl)
        const wet = [-1, 1, -tr.w, tr.w].some((d) => set.has(pl + d) && !(Math.abs(d) === 1 && ((pl + d) / tr.w | 0) !== ((pl / tr.w) | 0)))
        c.globalAlpha = wet ? 1 : 0.7
        emoji(c, wet ? t.items[0] : t.items[1], q.x, q.y, cs * 0.6)
        c.globalAlpha = 1
      }
      const hq = xy(head)
      emoji(c, t.hero, hq.x, hq.y, cs * 0.62, Math.sin(tt * 8) * 0.1)
      fx.draw(c)
      c.restore()
      const hint = kind === 'knight' ? 'TAP a knight-move square to visit every square once' : kind === 'right' ? 'DRAG / ARROWS: go straight or turn RIGHT only, reach the flag' : kind === 'visit' ? 'DRAG a hose past every plant before it runs out' : 'DRAG / ARROWS: visit every tile exactly once  Z = undo'
      banner(c, env, hint, tt)
      if (hintStuck > 0) text(c, 'DEAD END - tap the previous tile or press Z', W / 2, H - 24, { size: W < 600 ? 7 : 10, color: t.danger })
      text(c, 'R = reset', W - 60, H - 14, { size: 7, color: (t.fg + '66') })
      flow.banner()
    },
  }
}

function eulerGame(G: Ctx): Scene {
  const { env, c, k, fx, shake } = G
  const t = env.theme
  const ptr = pointer(G.st)
  G.bag.add(() => ptr.dispose())
  const levels = byDiff(env, 5, 6, 8)
  const S = { level: 1, score: 0, lives: 3 }
  let g!: Euler
  let trail: number[] = []
  let usedE = new Set<number>()
  let cs = 80
  let ox = 0
  let oy = 0
  let tt = 0
  let lastNode = -1
  const hud = () => {
    env.score(S.score)
    env.status(`Level ${S.level}/${levels} · ${usedE.size}/${g.edges.length} streets`)
  }
  const build = () => {
    g = genEuler(env.rng, S.level)
    trail = []
    usedE = new Set()
    const mx = Math.max(...g.nodes.map((n) => n.x))
    const my = Math.max(...g.nodes.map((n) => n.y))
    const f = fit(mx + 1.2, my + 1.2, 110)
    cs = f.cs
    ox = f.ox + cs * 0.1
    oy = f.oy + cs * 0.1
  }
  const flow = levelFlow(G, levels, S, build, () => hud())
  const xy = (i: number) => ({ x: ox + (g.nodes[i].x + 0.5) * cs, y: oy + (g.nodes[i].y + 0.5) * cs })
  const nodeAt = (x: number, y: number) => g.nodes.findIndex((_, i) => Math.hypot(xy(i).x - x, xy(i).y - y) < Math.max(22, cs * 0.3))
  const go = (n: number) => {
    if (n < 0 || flow.busy()) return
    if (!trail.length) {
      trail = [n]
      env.sfx('click')
      return
    }
    const cur = trail[trail.length - 1]
    if (n === cur) return
    if (trail.length > 1 && n === trail[trail.length - 2]) {
      usedE.delete(edgeIndex(g, cur, n))
      trail.pop()
      env.sfx('click')
      return hud()
    }
    const e = edgeIndex(g, cur, n)
    if (e < 0 || usedE.has(e)) {
      shake.kick(1.5)
      return
    }
    usedE.add(e)
    trail.push(n)
    const q = xy(n)
    fx.burst(q.x, q.y, t.accent, 6, 90, 2)
    env.sfx('move')
    hud()
    if (usedE.size === g.edges.length) flow.win('ONE STROKE!', 60)
  }
  ptr.onDown((p) => {
    if (p.button !== 2) go(nodeAt(p.x, p.y))
  })
  k.onKey((e) => {
    if ((e.code === 'KeyZ' || e.code === 'Backspace') && trail.length) {
      if (trail.length > 1) usedE.delete(edgeIndex(g, trail[trail.length - 1], trail[trail.length - 2]))
      trail.pop()
      hud()
    } else if (e.code === 'KeyR' && !flow.busy()) {
      trail = []
      usedE = new Set()
      hud()
    }
  })
  build()
  hud()
  return {
    update(dt) {
      tt += dt
      fx.update(dt)
      shake.update(dt)
      flow.update(dt)
      if (ptr.down && !flow.busy()) {
        const n = nodeAt(ptr.x, ptr.y)
        if (n !== lastNode) {
          lastNode = n
          if (n >= 0 && trail.length) go(n)
        }
      } else lastNode = -1
    },
    draw() {
      c.save()
      background(c, W, H, t, 40, env.seed)
      shake.apply(c)
      g.edges.forEach(([a, b], i) => {
        const p = xy(a)
        const q = xy(b)
        c.strokeStyle = usedE.has(i) ? t.accent : (t.fg + '59')
        c.lineWidth = usedE.has(i) ? 8 : 5
        c.lineCap = 'round'
        c.shadowColor = t.accent
        c.shadowBlur = usedE.has(i) ? 10 : 0
        c.beginPath()
        c.moveTo(p.x, p.y)
        c.lineTo(q.x, q.y)
        c.stroke()
        c.shadowBlur = 0
      })
      g.nodes.forEach((_, i) => {
        const p = xy(i)
        c.fillStyle = trail.includes(i) ? t.accent : '#222'
        c.strokeStyle = t.fg
        c.lineWidth = 2
        c.beginPath()
        c.arc(p.x, p.y, 11, 0, 7)
        c.fill()
        c.stroke()
      })
      const cur = trail.length ? xy(trail[trail.length - 1]) : null
      if (cur) emoji(c, t.hero, cur.x, cur.y - 4, 34, Math.sin(tt * 8) * 0.1)
      else text(c, 'TAP any junction to start', W / 2, H - 28, { size: W < 600 ? 8 : 11, color: t.accent })
      fx.draw(c)
      c.restore()
      banner(c, env, 'DRAG along every street exactly once · Z = undo', tt)
      flow.banner()
    },
  }
}

function untangleGame(G: Ctx): Scene {
  const { env, c, k, fx, shake } = G
  const t = env.theme
  const ptr = pointer(G.st)
  G.bag.add(() => ptr.dispose())
  const levels = byDiff(env, 5, 6, 8)
  const S = { level: 1, score: 0, lives: 3 }
  let u!: Untangle
  let pts: Pt[] = []
  let bad: [number, number][] = []
  let held = -1
  let moves = 0
  let tt = 0
  let cooldown = 0
  const area = () => ({ x: 30, y: W < 600 ? 90 : 70, w: W - 60, h: H - (W < 600 ? 230 : 110) })
  const toXY = (p: Pt) => {
    const a = area()
    return { x: a.x + p.x * a.w, y: a.y + p.y * a.h }
  }
  const hud = () => {
    env.score(S.score)
    env.status(`Level ${S.level}/${levels} · ${bad.length} crossings · ${moves} moves`)
  }
  const build = () => {
    u = genUntangle(env.rng, S.level)
    pts = u.pts.map((p) => ({ ...p }))
    bad = crossings(pts, u.edges)
    moves = 0
    held = -1
    cooldown = 0
  }
  const flow = levelFlow(G, levels, S, build, () => hud())
  const recount = () => {
    bad = crossings(pts, u.edges)
    hud()
    if (!bad.length && moves > 0) {
      for (const p of pts) {
        const q = toXY(p)
        fx.burst(q.x, q.y, t.good, 6, 130, 2)
      }
      flow.win('UNTANGLED!', Math.max(0, 30 - moves) * 5)
    }
  }
  k.onKey((e) => {
    if (e.code === 'KeyR' && !flow.busy()) {
      pts = u.pts.map((p) => ({ ...p }))
      recount()
    }
  })
  build()
  hud()
  return {
    update(dt) {
      tt += dt
      fx.update(dt)
      shake.update(dt)
      flow.update(dt)
      cooldown -= dt
      if (flow.busy()) return
      if (ptr.down) {
        if (held < 0) {
          let bd = 34
          pts.forEach((p, i) => {
            const q = toXY(p)
            const d = Math.hypot(q.x - ptr.x, q.y - ptr.y)
            if (d < bd) {
              bd = d
              held = i
            }
          })
          if (held >= 0) env.sfx('click')
        } else {
          const a = area()
          pts[held] = { x: clamp((ptr.x - a.x) / a.w, 0, 1), y: clamp((ptr.y - a.y) / a.h, 0, 1) }
          bad = crossings(pts, u.edges)
          hud()
        }
      } else if (held >= 0) {
        held = -1
        moves++
        env.sfx('move')
        recount()
      }
    },
    draw() {
      c.save()
      background(c, W, H, t, 40, env.seed)
      shake.apply(c)
      const badE = new Set(bad.flat())
      u.edges.forEach(([a, b], i) => {
        const p = toXY(pts[a])
        const q = toXY(pts[b])
        c.strokeStyle = badE.has(i) ? t.danger : t.good
        c.lineWidth = 4
        c.lineCap = 'round'
        c.globalAlpha = 0.9
        c.beginPath()
        c.moveTo(p.x, p.y)
        c.lineTo(q.x, q.y)
        c.stroke()
        c.globalAlpha = 1
      })
      pts.forEach((p, i) => {
        const q = toXY(p)
        c.fillStyle = '#1a1a2a'
        c.strokeStyle = held === i ? t.accent : t.fg
        c.lineWidth = held === i ? 4 : 2
        c.beginPath()
        c.arc(q.x, q.y, 18, 0, 7)
        c.fill()
        c.stroke()
        emoji(c, i === 0 ? t.hero : t.items[i % t.items.length], q.x, q.y, 24)
      })
      fx.draw(c)
      c.restore()
      text(c, `CROSSINGS ${bad.length}`, W / 2, H - (W < 600 ? 170 : 28), { size: W < 600 ? 11 : 13, color: bad.length ? t.danger : t.good })
      banner(c, env, 'DRAG the nodes until no lines cross · R = reset', tt)
      flow.banner()
    },
  }
}

function tourGame(G: Ctx, ordered: boolean): Scene {
  const { env, c, k, fx, shake } = G
  const t = env.theme
  const ptr = pointer(G.st)
  G.bag.add(() => ptr.dispose())
  const levels = byDiff(env, 5, 6, 8)
  const S = { level: 1, score: 0, lives: byDiff(env, 4, 3, 2) }
  let tour!: Tour
  let route: number[] = []
  let seq: number[] = []
  let tt = 0
  const area = () => ({ x: 30, y: W < 600 ? 90 : 70, w: W - 60, h: H - (W < 600 ? 250 : 110) })
  const toXY = (p: Pt) => {
    const a = area()
    return { x: a.x + p.x * a.w, y: a.y + p.y * a.h }
  }
  const len = () => tourLength(tour.pts, route, false) * 1
  const closed = () => tourLength(tour.pts, route, true)
  const budget = () => (ordered ? tour.budget * 1.6 : tour.budget)
  const hud = () => {
    env.score(S.score)
    env.status(`Level ${S.level}/${levels} · ${route.length}/${tour.pts.length} stops · ${Math.round((closed() / tour.best) * 100)}% of best`)
  }
  const build = () => {
    tour = genTour(env.rng, S.level, env.difficulty)
    route = [tour.depot]
    seq = ordered ? bestTour(tour.pts, tour.depot).order : []
  }
  const flow = levelFlow(G, levels, S, build, () => hud())
  const nodeAt = (x: number, y: number) => tour.pts.findIndex((p) => Math.hypot(toXY(p).x - x, toXY(p).y - y) < 28)
  const check = () => {
    hud()
    if (route.length === tour.pts.length) {
      const l = closed()
      if (l <= budget()) {
        flow.win(l <= tour.best * 1.02 ? 'PERFECT ROUTE!' : 'ROUTE DONE!', Math.round(Math.max(0, budget() - l) * 400))
      } else flow.lose('ROUTE TOO LONG')
    }
  }
  const visit = (n: number) => {
    if (n < 0 || flow.busy()) return
    const last = route[route.length - 1]
    if (route.length > 1 && n === last) {
      route.pop()
      env.sfx('click')
      return hud()
    }
    if (route.includes(n)) return
    if (ordered && n !== seq[route.length]) {
      shake.kick(2)
      env.sfx('hit')
      return
    }
    route.push(n)
    const q = toXY(tour.pts[n])
    fx.burst(q.x, q.y, t.accent, 8, 110, 2)
    env.sfx('move')
    check()
  }
  ptr.onDown((p) => {
    if (p.button !== 2) visit(nodeAt(p.x, p.y))
  })
  k.onKey((e) => {
    if ((e.code === 'KeyZ' || e.code === 'Backspace') && route.length > 1) {
      route.pop()
      hud()
    } else if (e.code === 'KeyR' && !flow.busy()) {
      route = [tour.depot]
      hud()
    }
  })
  let lastNode = -1
  build()
  hud()
  return {
    update(dt) {
      tt += dt
      fx.update(dt)
      shake.update(dt)
      flow.update(dt)
      if (ptr.down && !flow.busy()) {
        const n = nodeAt(ptr.x, ptr.y)
        if (n !== lastNode) {
          lastNode = n
          if (n >= 0 && !route.includes(n)) visit(n)
        }
      } else lastNode = -1
    },
    draw() {
      c.save()
      background(c, W, H, t, 40, env.seed)
      shake.apply(c)
      c.strokeStyle = t.accent
      c.lineWidth = 4
      c.lineJoin = 'round'
      c.shadowColor = t.accent
      c.shadowBlur = 8
      c.beginPath()
      route.forEach((n, i) => {
        const q = toXY(tour.pts[n])
        if (i) c.lineTo(q.x, q.y)
        else c.moveTo(q.x, q.y)
      })
      c.stroke()
      c.shadowBlur = 0
      tour.pts.forEach((p, i) => {
        const q = toXY(p)
        const on = route.includes(i)
        const next = ordered && i === seq[route.length]
        c.fillStyle = on ? t.accent + '55' : (t.fg + '1a')
        c.strokeStyle = next ? t.accent2 : on ? t.accent : (t.fg + '66')
        c.lineWidth = next ? 4 : 2
        c.beginPath()
        c.arc(q.x, q.y, 22 + (next ? Math.sin(tt * 6) * 2 : 0), 0, 7)
        c.fill()
        c.stroke()
        emoji(c, i === tour.depot ? t.hero : t.items[i % t.items.length], q.x, q.y, 26)
        if (ordered) text(c, String(seq.indexOf(i) + 1), q.x + 18, q.y - 18, { size: 9, color: t.fg })
      })
      fx.draw(c)
      c.restore()
      // length gauge
      const bw = Math.min(360, W - 60)
      const by = H - (W < 600 ? 160 : 28)
      roundRect(c, W / 2 - bw / 2, by, bw, 14, 7, 'rgba(0,0,0,.45)', (t.fg + '33'), 1)
      const frac = Math.min(1, closed() / budget())
      c.fillStyle = frac > 0.95 ? t.danger : t.good
      c.fillRect(W / 2 - bw / 2 + 2, by + 2, (bw - 4) * frac, 10)
      text(c, `ROUTE ${(len() * 100).toFixed(0)}  BUDGET ${(budget() * 100).toFixed(0)}`, W / 2, by - 10, { size: 8, color: t.fg })
      banner(c, env, ordered ? 'TAP the stops in numbered order' : 'TAP stops to visit them all and return home within the budget', tt)
      flow.banner()
    },
  }
}

// ---------- draw-a-path-for-the-ball (limited ink) ----------

interface Seg {
  x1: number
  y1: number
  x2: number
  y2: number
}

function drawGame(G: Ctx): Scene {
  const { env, c, k, fx, shake } = G
  const t = env.theme
  const ptr = pointer(G.st)
  G.bag.add(() => ptr.dispose())
  const levels = byDiff(env, 5, 6, 8)
  const S = { level: 1, score: 0, lives: byDiff(env, 5, 4, 3) }
  let obstacles: Seg[] = []
  let lines: Seg[][] = []
  let spawn = { x: 0, y: 0 }
  let goal = { x: 0, y: 0 }
  let ink = 0
  let inkMax = 0
  let ball: { x: number; y: number; vx: number; vy: number } | null = null
  let stroke: Seg[] | null = null
  let strokeFrom: { x: number; y: number } | null = null
  let tt = 0
  let ballT = 0
  const R = 11
  const bar = () => (W < 600 ? { y: H - 120 } : { y: H - 58 })
  const btns = () => {
    const y = bar().y
    const w = W < 600 ? 120 : 130
    const gap = (W - 3 * w) / 4
    return [
      { x: gap, y, w, h: 40, label: '▶ DROP', fn: drop },
      { x: gap * 2 + w, y, w, h: 40, label: '↶ UNDO', fn: undo },
      { x: gap * 3 + w * 2, y, w, h: 40, label: '✕ CLEAR', fn: clear },
    ]
  }
  const inkUsed = () => lines.reduce((a, l) => a + l.reduce((b, s) => b + Math.hypot(s.x2 - s.x1, s.y2 - s.y1), 0), 0)
  const hud = () => {
    env.score(S.score)
    env.status(`Level ${S.level}/${levels} · ink ${Math.max(0, Math.round(ink))}/${Math.round(inkMax)} · ${'❤️'.repeat(Math.max(0, S.lives))}`)
  }
  const build = () => {
    const floorY = bar().y - 30
    spawn = { x: env.rng.range(W * 0.12, W * 0.35), y: 70 }
    goal = { x: env.rng.range(W * 0.5, W * 0.88), y: floorY - 6 }
    obstacles = []
    const n = Math.min(4, 1 + Math.floor(S.level / 2))
    for (let i = 0; i < n; i++) {
      const cx = env.rng.range(W * 0.2, W * 0.85)
      const cy = env.rng.range(150, floorY - 100)
      const len = env.rng.range(70, 150)
      const a = env.rng.range(-0.4, 0.4)
      const s = { x1: cx - Math.cos(a) * len / 2, y1: cy - Math.sin(a) * len / 2, x2: cx + Math.cos(a) * len / 2, y2: cy + Math.sin(a) * len / 2 }
      if (Math.hypot(cx - goal.x, cy - goal.y) > 90 && Math.hypot(cx - spawn.x, cy - spawn.y) > 90) obstacles.push(s)
    }
    lines = []
    ball = null
    stroke = null
    inkMax = Math.hypot(goal.x - spawn.x, goal.y - spawn.y) * byDiff(env, 2.6, 2.1, 1.7) + 80
    ink = inkMax
    hud()
  }
  const flow = levelFlow(G, levels, S, build, () => hud())
  function drop() {
    if (ball || flow.busy()) return
    ball = { x: spawn.x, y: spawn.y, vx: 0, vy: 0 }
    ballT = 0
    env.sfx('click')
  }
  function undo() {
    if (ball || flow.busy()) return
    lines.pop()
    ink = inkMax - inkUsed()
    hud()
  }
  function clear() {
    if (ball || flow.busy()) return
    lines = []
    ink = inkMax
    hud()
  }
  ptr.onDown((p) => {
    if (p.button === 2) return
    for (const b of btns()) if (p.x >= b.x && p.x < b.x + b.w && p.y >= b.y && p.y < b.y + b.h) b.fn()
  })
  k.onKey((e) => {
    if (e.code === 'Space' || e.code === 'Enter') drop()
    else if (e.code === 'KeyZ' || e.code === 'Backspace') undo()
    else if (e.code === 'KeyC') clear()
    else if (e.code === 'KeyR') ball = null
  })
  const collide = (b: NonNullable<typeof ball>, s: Seg) => {
    const dx = s.x2 - s.x1
    const dy = s.y2 - s.y1
    const l2 = dx * dx + dy * dy || 1
    const u = clamp(((b.x - s.x1) * dx + (b.y - s.y1) * dy) / l2, 0, 1)
    const px = s.x1 + dx * u
    const py = s.y1 + dy * u
    const d = Math.hypot(b.x - px, b.y - py)
    if (d < R + 2 && d > 0.0001) {
      const nx = (b.x - px) / d
      const ny = (b.y - py) / d
      b.x = px + nx * (R + 2)
      b.y = py + ny * (R + 2)
      const vn = b.vx * nx + b.vy * ny
      if (vn < 0) {
        b.vx -= 1.3 * vn * nx
        b.vy -= 1.3 * vn * ny
        b.vx *= 0.995
        b.vy *= 0.995
      }
    }
  }
  build()
  return {
    update(dt) {
      tt += dt
      fx.update(dt)
      shake.update(dt)
      flow.update(dt)
      const lim = bar().y - 8
      if (!ball && !flow.busy()) {
        if (ptr.down && ptr.y < lim - 4) {
          if (!stroke) {
            stroke = []
            lines.push(stroke)
          }
          if (!strokeFrom) strokeFrom = { x: ptr.x, y: ptr.y }
          const from = stroke.length ? { x: stroke[stroke.length - 1].x2, y: stroke[stroke.length - 1].y2 } : strokeFrom
          const d = Math.hypot(ptr.x - from.x, ptr.y - from.y)
          if (d > 7 && ink - d >= 0) {
            stroke.push({ x1: from.x, y1: from.y, x2: ptr.x, y2: ptr.y })
            ink -= d
            hud()
          }
        } else if (stroke) {
          if (!stroke.length) lines.pop()
          stroke = null
          strokeFrom = null
        }
      } else {
        stroke = null
        strokeFrom = null
      }
      if (ball) {
        ballT += dt
        const b = ball
        for (let i = 0; i < 4; i++) {
          b.vy += 900 * (dt / 4)
          b.x += b.vx * (dt / 4)
          b.y += b.vy * (dt / 4)
          if (b.x < R) {
            b.x = R
            b.vx = Math.abs(b.vx) * 0.5
          } else if (b.x > W - R) {
            b.x = W - R
            b.vx = -Math.abs(b.vx) * 0.5
          }
          for (const s of obstacles) collide(b, s)
          for (const l of lines) for (const s of l) collide(b, s)
        }
        if (Math.hypot(b.x - goal.x, b.y - goal.y) < 34) {
          fx.burst(goal.x, goal.y, t.good, 30, 240, 3)
          shake.kick(4)
          flow.win('IN THE GOAL!', Math.round(ink))
          ball = null
        } else if (b.y > bar().y - 10 || ballT > 14) {
          fx.burst(b.x, Math.min(b.y, bar().y - 12), t.danger, 14, 160, 3)
          env.sfx('hit')
          ball = null
          if (--S.lives <= 0) flow.lose('OUT OF TRIES')
          hud()
        }
      }
    },
    draw() {
      c.save()
      background(c, W, H, t, 40, env.seed)
      shake.apply(c)
      c.lineCap = 'round'
      c.strokeStyle = t.fg + '88'
      c.lineWidth = 7
      for (const s of obstacles) {
        c.beginPath()
        c.moveTo(s.x1, s.y1)
        c.lineTo(s.x2, s.y2)
        c.stroke()
      }
      c.strokeStyle = t.accent
      c.lineWidth = 5
      c.shadowColor = t.accent
      c.shadowBlur = 8
      for (const l of lines) {
        c.beginPath()
        l.forEach((s, i) => {
          if (!i) c.moveTo(s.x1, s.y1)
          c.lineTo(s.x2, s.y2)
        })
        c.stroke()
      }
      c.shadowBlur = 0
      emoji(c, '🥅', goal.x, goal.y - 8, 58)
      c.strokeStyle = t.good
      c.globalAlpha = 0.5
      c.beginPath()
      c.arc(goal.x, goal.y, 34, 0, 7)
      c.stroke()
      c.globalAlpha = 1
      const bx = ball ? ball.x : spawn.x
      const by = ball ? ball.y : spawn.y + Math.sin(tt * 4) * 2
      emoji(c, t.hero, bx, by, R * 2.4)
      fx.draw(c)
      c.restore()
      const bw = Math.min(300, W - 60)
      roundRect(c, W / 2 - bw / 2, bar().y - 24, bw, 10, 5, 'rgba(0,0,0,.4)', t.fg + '33', 1)
      c.fillStyle = ink / inkMax < 0.2 ? t.danger : t.accent2
      c.fillRect(W / 2 - bw / 2 + 2, bar().y - 22, Math.max(0, (bw - 4) * (ink / inkMax)), 6)
      for (const b of btns()) {
        roundRect(c, b.x, b.y, b.w, b.h, 12, 'rgba(0,0,0,.4)', t.accent2, 2)
        text(c, b.label, b.x + b.w / 2, b.y + b.h / 2, { size: 10, color: '#fff' })
      }
      banner(c, env, 'DRAG to draw a path (limited ink), then DROP the ball into the goal', tt)
      flow.banner()
    },
  }
}

// ---------- entry ----------

const FLOW_RE = /\b(lines?|paths?|connect|routes?|wires?|rails?|trails?|threads?|yarn|strings?|pipes?|hose|dash|links?|stroke|planner|weaver|sketch)\b/i

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
    const mods = env.mods
    const label = `${env.name} ${env.desc}`
    const k = keys({ twoPlayer: env.players === 2 })
    const bag = new Bag()
    const G: Ctx = { env, st, c: st.ctx, k, bag, fx: new Particles(), shake: new Shake() }
    const isTilt = mods.has('tilt') || mods.has('gravity') || /\b(tilt|gravity|ball|roll|magnet|rotate|slime)\b/i.test(env.name)
    const isFlow = !isTilt && !mods.has('versus') && !/maze|labyrinth/i.test(env.name) && FLOW_RE.test(label)
    const dark = mods.has('dark') || /\b(dark|shadow|night|ghosts?)\b/i.test(env.name)
    const keysOn = mods.has('key') || /\b(keys?|vault|locks?|doors?)\b/i.test(env.name)
    const nm = env.name
    const traceKind: TraceKind | null = /dot dash|snail trail|light trail/i.test(nm) ? 'fill' : /knight/i.test(nm) ? 'knight' : /zigzag/i.test(nm) ? 'right' : /garden hose/i.test(nm) ? 'visit' : null
    const isEuler = /one stroke|postman/i.test(nm)
    const isUntangle = /untangle|kite strings|yarn path/i.test(nm)
    const isDraw = /ink flow|thread the needle/i.test(nm)
    const isTour = /starlane|trick or treat|north pole|last mile|bus route|snowplow|garbage route|mailman|crow courier|train dispatcher|snowshoe|firefly/i.test(nm)
    let scene: Scene
    if (isDraw) scene = drawGame(G)
    else if (traceKind) scene = traceGame(G, traceKind)
    else if (isEuler) scene = eulerGame(G)
    else if (isUntangle) scene = untangleGame(G)
    else if (isTour) scene = tourGame(G, /firefly/i.test(nm))
    else if (isFlow) scene = flowGame(G)
    else if (isTilt) scene = tiltMaze(G, keysOn)
    else {
      scene = gridMaze(G, {
        versus: mods.has('versus') || env.players === 2,
        dark,
        keysOn,
        collect: /\b(dot|dots|muncher|eater|treat|candy|coin|loot|collect|eat)\b/i.test(label),
        foesOn: env.difficulty === 2 || mods.has('hard') || mods.has('hell') || /\b(patrols?|guards?|ghosts?|sharks?)\b/i.test(label),
        timed: mods.has('timer') || mods.has('fast') || env.difficulty === 2,
      })
    }
    const pointerOnly = isDraw || !!traceKind || isEuler || isUntangle || isTour || isFlow
    const vp = vpad(env.host, k, pointerOnly ? 'none' : 'dpad')
    const lp = loop((dt) => scene.update(dt), () => {
      G.c.clearRect(0, 0, W, H)
      scene.draw()
    })
    return {
      pause: (p) => lp.pause(p),
      destroy() {
        lp.stop()
        scene.dispose?.()
        vp()
        k.dispose()
        bag.dispose()
        st.dispose()
      },
    }
  },
}

export default engine
