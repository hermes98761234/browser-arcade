// Maze & path games: generated mazes (keys, doors, dark, versus, foes), tilt-maze with inertia, and Flow-style path drawing.
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, pointer, roundRect, Shake, swipe, text, vpad, type Engine, type GameEnv, type Stage } from '../kit'
import { DIRS, distances, genFlow, genMaze, neighbors, placeLocks, solvePath, type Lock, type Maze } from '../logic/maze'

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
    const isTilt = mods.has('tilt') || mods.has('gravity') || /\b(tilt|gravity|ball|roll)\b/i.test(env.name)
    const isFlow = !isTilt && !mods.has('versus') && !/maze|labyrinth/i.test(env.name) && FLOW_RE.test(label)
    const dark = mods.has('dark') || /\b(dark|shadow|night|ghosts?)\b/i.test(env.name)
    const keysOn = mods.has('key') || /\b(keys?|vault|locks?|doors?)\b/i.test(env.name)
    let scene: Scene
    if (isFlow) scene = flowGame(G)
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
    const vp = vpad(env.host, k, isFlow ? 'none' : 'dpad')
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
