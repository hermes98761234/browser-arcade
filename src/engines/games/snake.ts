// Snake: grid snake with themed food, golden bonus fruit, obstacles, portals, wrap, darkness and 2-player mode.
import { background, Bag, byDiff, createStage, emoji, keys, loop, Particles, roundRect, swipe, text, vpad, type Engine } from '../kit'

const CELL = 20

type P = { x: number; y: number }
interface Snake { body: P[]; dir: P; next: P[]; alive: boolean; color: string; grow: number; score: number }

const engine: Engine = {
  start(env) {
    const { theme: t, rng, mods } = env
    // Landscape board on wide screens, portrait board on phones.
    const r = env.host.getBoundingClientRect()
    const portrait = r.height > r.width * 0.9
    const COLS = portrait ? 18 : 32
    const ROWS = portrait ? 26 : 18
    const st = createStage(env.host, COLS * CELL, ROWS * CELL)
    const ctx = st.ctx
    const k = keys({ twoPlayer: env.players === 2 })
    const bag = new Bag()
    const fx = new Particles()
    const wrap = mods.has('wrap') || mods.has('zen')
    const dark = mods.has('dark')
    const portals = mods.has('portal')
    const two = env.players === 2
    let step = byDiff(env, 0.13, 0.1, 0.075) * (mods.has('fast') ? 0.8 : 1)
    const walls = new Set<string>()
    const key = (p: P) => `${p.x},${p.y}`

    // Obstacles: symmetric blocks so the board feels designed rather than random.
    const nWalls = byDiff(env, 0, 4, 8) + (mods.has('hard') ? 4 : 0)
    for (let i = 0; i < nWalls; i++) {
      const x = rng.int(3, Math.floor(COLS / 2) - 2)
      const y = rng.int(2, ROWS - 3)
      const len = rng.int(2, 4)
      const vert = rng.chance(0.5)
      for (let j = 0; j < len; j++) {
        const a = vert ? { x, y: y + j } : { x: x + j, y }
        if (a.y >= 0 && a.y < ROWS && Math.abs(a.y - ROWS / 2) > 1) {
          walls.add(key(a))
          walls.add(key({ x: COLS - 1 - a.x, y: ROWS - 1 - a.y }))
        }
      }
    }
    const portalPair: [P, P] | null = portals ? [{ x: 3, y: 3 }, { x: COLS - 4, y: ROWS - 4 }] : null

    const mk = (x: number, y: number, dx: number, color: string): Snake => ({
      body: [{ x, y }, { x: x - dx, y }, { x: x - 2 * dx, y }], dir: { x: dx, y: 0 }, next: [], alive: true, color, grow: 0, score: 0,
    })
    const snakes: Snake[] = two ? [mk(6, 5, 1, t.accent), mk(COLS - 7, ROWS - 6, -1, t.accent2)] : [mk(5, Math.floor(ROWS / 2), 1, t.accent)]

    const occupied = (p: P) => walls.has(key(p)) || snakes.some((s) => s.body.some((b) => b.x === p.x && b.y === p.y))
    const freeCell = (): P => {
      for (let i = 0; i < 500; i++) {
        const p = { x: rng.int(0, COLS - 1), y: rng.int(0, ROWS - 1) }
        if (!occupied(p) && !(portalPair && portalPair.some((q) => q.x === p.x && q.y === p.y))) return p
      }
      return { x: 1, y: 1 }
    }
    let food = { ...freeCell(), e: rng.pick(t.items) }
    let gold: (P & { ttl: number }) | null = null
    let eaten = 0
    let level = 1
    let acc = 0
    let time = 0
    let over = false
    // The snake waits for the first direction input, so nobody crashes while reading.
    let started = false

    const turn = (s: Snake, d: P) => {
      started = true
      const last = s.next.length ? s.next[s.next.length - 1] : s.dir
      if (last.x + d.x === 0 && last.y + d.y === 0) return
      if (last.x === d.x && last.y === d.y) return
      if (s.next.length < 3) s.next.push(d)
    }
    const D = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: 1 } }
    bag.add(swipe(st.canvas, (d) => turn(snakes[0], D[d])))
    if (!two) bag.add(vpad(env.host, k, 'dpad'))

    const hud = () => {
      env.score(two ? Math.max(...snakes.map((s) => s.score)) : snakes[0].score)
      env.status(two ? `P1 ${snakes[0].score} · P2 ${snakes[1].score}` : `Level ${level} · Length ${snakes[0].body.length}`)
    }
    hud()

    const finish = () => {
      if (over) return
      over = true
      if (two) {
        const [a, b] = snakes
        const winner = a.alive && !b.alive ? 'Player 1' : b.alive && !a.alive ? 'Player 2' : a.score >= b.score ? 'Player 1' : 'Player 2'
        env.sfx('win')
        env.end({ score: Math.max(a.score, b.score), won: true, text: `${winner} wins!` })
      } else {
        env.sfx('lose')
        env.end({ score: snakes[0].score, won: false, text: `Reached level ${level}, length ${snakes[0].body.length}` })
      }
    }

    const tick = () => {
      for (const s of snakes) {
        if (!s.alive) continue
        if (s.next.length) s.dir = s.next.shift()!
        let h = { x: s.body[0].x + s.dir.x, y: s.body[0].y + s.dir.y }
        if (wrap) h = { x: (h.x + COLS) % COLS, y: (h.y + ROWS) % ROWS }
        if (portalPair) {
          const i = portalPair.findIndex((p) => p.x === h.x && p.y === h.y)
          if (i >= 0) {
            const o = portalPair[1 - i]
            h = { x: o.x + s.dir.x, y: o.y + s.dir.y }
            env.sfx('power')
          }
        }
        const out = h.x < 0 || h.y < 0 || h.x >= COLS || h.y >= ROWS
        if (out || walls.has(key(h)) || snakes.some((o) => o.body.some((b, i) => b.x === h.x && b.y === h.y && !(o === s && i === o.body.length - 1 && !s.grow)))) {
          s.alive = false
          env.sfx('hit')
          fx.burst(s.body[0].x * CELL + CELL / 2, s.body[0].y * CELL + CELL / 2, s.color, 30, 220)
          continue
        }
        s.body.unshift(h)
        if (h.x === food.x && h.y === food.y) {
          s.grow += 2
          s.score += 10 * level
          eaten++
          env.sfx('point')
          fx.burst(h.x * CELL + CELL / 2, h.y * CELL + CELL / 2, t.good, 14)
          food = { ...freeCell(), e: rng.pick(t.items) }
          if (eaten % 5 === 0) {
            level++
            step = Math.max(0.045, step * 0.9)
            env.sfx('power')
          }
          if (!gold && rng.chance(0.3)) gold = { ...freeCell(), ttl: 6 }
        } else if (gold && h.x === gold.x && h.y === gold.y) {
          s.score += 50 * level
          s.grow += 4
          gold = null
          env.sfx('power')
          fx.burst(h.x * CELL + CELL / 2, h.y * CELL + CELL / 2, '#facc15', 24)
        }
        if (s.grow > 0) s.grow--
        else s.body.pop()
      }
      hud()
      if (two ? snakes.some((s) => !s.alive) : !snakes[0].alive) finish()
    }

    const update = (dt: number) => {
      time += dt
      fx.update(dt)
      if (over) return
      const p1 = two ? { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS' } : { left: 'left', right: 'right', up: 'up', down: 'down' }
      for (const d of ['left', 'right', 'up', 'down'] as const) {
        if (k.hit(p1[d])) turn(snakes[0], D[d])
        if (two && k.hit(`p2${d}`)) turn(snakes[1], D[d])
      }
      if (gold) {
        gold.ttl -= dt
        if (gold.ttl <= 0) gold = null
      }
      if (!started) return
      acc += dt
      while (acc >= step) {
        acc -= step
        tick()
        if (over) break
      }
    }

    const draw = () => {
      background(ctx, st.w, st.h, t, 40, env.seed)
      // grid
      ctx.strokeStyle = t.fg
      ctx.globalAlpha = 0.05
      ctx.lineWidth = 1
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath()
        ctx.moveTo(x * CELL, 0)
        ctx.lineTo(x * CELL, st.h)
        ctx.stroke()
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * CELL)
        ctx.lineTo(st.w, y * CELL)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      if (!wrap) {
        ctx.strokeStyle = t.accent
        ctx.lineWidth = 3
        ctx.strokeRect(1.5, 1.5, st.w - 3, st.h - 3)
      }
      for (const w of walls) {
        const [x, y] = w.split(',').map(Number)
        roundRect(ctx, x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2, 4, t.blocks[(x + y) % t.blocks.length])
        ctx.fillStyle = 'rgba(0,0,0,.25)'
        ctx.fillRect(x * CELL + 1, y * CELL + CELL - 5, CELL - 2, 4)
      }
      if (portalPair) for (const [i, p] of portalPair.entries()) {
        ctx.save()
        ctx.translate(p.x * CELL + CELL / 2, p.y * CELL + CELL / 2)
        ctx.rotate(time * 3 * (i ? -1 : 1))
        ctx.strokeStyle = i ? t.accent2 : t.accent
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(0, 0, CELL / 2 - 2, 0, Math.PI * 1.5)
        ctx.stroke()
        ctx.restore()
      }
      const bob = 1 + Math.sin(time * 6) * 0.08
      emoji(ctx, food.e, food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * 0.9 * bob)
      if (gold) {
        ctx.globalAlpha = gold.ttl < 2 ? 0.5 + 0.5 * Math.sin(time * 20) : 1
        emoji(ctx, '⭐', gold.x * CELL + CELL / 2, gold.y * CELL + CELL / 2, CELL * bob)
        ctx.globalAlpha = 1
      }
      for (const s of snakes) {
        const n = s.body.length
        ctx.shadowColor = s.color
        ctx.shadowBlur = 10
        for (let i = n - 1; i >= 0; i--) {
          const b = s.body[i]
          const pad = i === 0 ? 1 : 2 + (i / n) * 3
          ctx.globalAlpha = s.alive ? 1 - (i / n) * 0.45 : 0.35
          roundRect(ctx, b.x * CELL + pad, b.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, 6, s.color)
        }
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
        const h = s.body[0]
        const cx = h.x * CELL + CELL / 2
        const cy = h.y * CELL + CELL / 2
        // The game's own character rides the head (player 1); player 2 keeps classic eyes.
        if (s === snakes[0]) {
          emoji(ctx, t.hero, cx, cy, CELL * 1.05)
          continue
        }
        ctx.fillStyle = '#fff'
        for (const side of [-1, 1]) {
          const ex = cx + s.dir.x * 4 + s.dir.y * side * 4
          const ey = cy + s.dir.y * 4 + s.dir.x * side * 4
          ctx.beginPath()
          ctx.arc(ex, ey, 2.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      fx.draw(ctx)
      if (dark) {
        const h = snakes[0].body[0]
        const g = ctx.createRadialGradient(h.x * CELL + 10, h.y * CELL + 10, 40, h.x * CELL + 10, h.y * CELL + 10, 170)
        g.addColorStop(0, 'rgba(0,0,0,0)')
        g.addColorStop(1, 'rgba(0,0,0,0.92)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, st.w, st.h)
      }
      if (!started && !over) {
        ctx.fillStyle = 'rgba(0,0,0,.45)'
        ctx.fillRect(0, st.h / 2 - 34, st.w, 68)
        text(ctx, 'PRESS A DIRECTION', st.w / 2, st.h / 2 - 10, { size: 14, color: t.accent, shadow: t.accent })
        text(ctx, two ? 'P1: WASD   P2: ARROWS' : 'ARROWS / WASD / SWIPE', st.w / 2, st.h / 2 + 14, { size: 9, color: t.fg })
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
