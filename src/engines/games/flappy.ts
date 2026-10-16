// Flappy: one-button flyer. Modes: flap (default), swim (floaty), gravity (tap flips gravity), hold (hold to rise),
// lander (lunar lander: thrust, rotate, land gently on pads, fuel). Mods: wind gusts, dark, mines.
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, pointer, roundRect, Shake, text, vpad, type Engine } from '../kit'
import { gapSize, genTerrain, landingOk, nextGapY, terrainY, type Terrain } from '../logic/flappy'

const TAU = Math.PI * 2

interface Obs { x: number; gy: number; gap: number; passed: boolean; item: boolean; mine: number; ph: number; e: number }

const engine: Engine = {
  start(env) {
    const { theme: t, rng, mods } = env
    const hr = env.host.getBoundingClientRect()
    const portrait = hr.height > hr.width * 1.1
    const W = portrait ? 360 : 640
    const H = portrait ? 600 : 360
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const k = keys()
    const ptr = pointer(st)
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const s = `${env.name} ${env.desc}`.toLowerCase()
    const lander = mods.has('lander') || /lander|rocket burn/.test(s)
    const swim = mods.has('swim')
    const flip = mods.has('gravity') && !lander
    const hold = !lander && !flip && /hold to|hold and|thrust/.test(s)
    const wind = mods.has('wind')
    const dark = mods.has('dark')
    const mines = mods.has('mines')
    const sc = mods.has('giant') ? 1.35 : 1
    const size = 30 * sc
    const hbox = 11 * sc
    let time = 0
    let over = false
    let intro = 2.6
    let score = 0
    let lives = lander ? byDiff(env, 4, 3, 3) : byDiff(env, 3, 3, 2)
    let flash = 0
    let inv = 0
    let tapped = false
    let held = false
    const goal = lander ? byDiff(env, 3, 4, 5) : byDiff(env, 25, 35, 50)
    let progress = 0
    bag.add(vpad(env.host, k, lander ? 'lr' : 'none', lander ? [{ action: 'a', label: '🔥' }] : []))

    const hud = () => env.status(`${lander ? `Landing ${Math.min(progress + 1, goal)}/${goal}` : `Gates ${progress}/${goal}`} · ${'❤️'.repeat(Math.max(0, lives))}`)
    const add = (n: number) => {
      score += Math.round(n)
      env.score(score)
    }
    const lose = () => {
      over = true
      env.sfx('lose')
      env.end({ score, won: false, text: lander ? `Landed ${progress} of ${goal}` : `Passed ${progress} gates` })
    }
    const win = () => {
      over = true
      env.sfx('win')
      add(lives * 100)
      env.end({ score, won: true, text: lander ? `All ${goal} landings complete` : `Cleared ${goal} gates` })
    }
    const press = () => {
      intro = Math.min(intro, 0)
      tapped = true
      held = true
    }
    ptr.onDown(press)
    ptr.onUp(() => { held = false })
    k.onKey((e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Enter') press()
      else if (intro > 0.2 && !e.repeat) intro = 0
    })
    bag.on(window, 'keyup', (e) => { if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') held = false })

    // ------------------------------------------------------------ flap world
    const pl = { x: W * 0.28, y: H / 2, vy: 0, rot: 0 }
    let gdir = 1
    let obs: Obs[] = []
    let dist = 0
    let lastGy = H / 2
    let nObs = 0
    const GRAV = swim ? 520 : flip ? 1000 : hold ? 800 : 1050
    const FLAP = swim ? 215 : 330
    const base = byDiff(env, 200, 172, 150) * (flip ? 1.08 : 1) * (swim ? 1.1 : 1) * (sc > 1 ? 1.2 : 1)
    const gap0 = () => gapSize(nObs, base, flip ? 140 * sc : 112 * sc)
    const scroll = () => (byDiff(env, 105, 125, 145) + Math.min(70, nObs * 2)) * (swim ? 0.85 : 1) * (mods.has('fast') ? 1.2 : 1)
    const spawnObs = (x: number) => {
      const g = gap0()
      const gy = nextGapY(rng, lastGy, g, 50, H - 50, flip ? 220 : swim ? 140 : 130)
      lastGy = gy
      obs.push({ x, gy, gap: g, passed: false, item: rng.chance(0.5), mine: mines && nObs > 2 && rng.chance(0.5) ? rng.range(1, 2) : 0, ph: rng() * TAU, e: rng.int(0, 5) })
      nObs++
    }
    for (let i = 0; i < 4; i++) spawnObs(W + 120 + i * 230)
    const crash = (x: number, y: number) => {
      if (inv > 0 || over) return
      lives--
      inv = 1.6
      flash = 0.25
      shake.kick(8)
      env.sfx('hit')
      fx.burst(x, y, t.danger, 22, 230, 4)
      hud()
      if (lives <= 0) { lose(); return }
      pl.y = clamp(pl.y, 70, H - 70)
      pl.vy = -150 * gdir
      // recentre on the next gap so the player can recover
      const nx = obs.find((o) => o.x + 34 > pl.x - 10)
      if (nx) pl.y = nx.gy
    }
    const gust = () => (wind ? Math.sin(time * 0.9) * 140 : 0)

    const updateFlap = (dt: number) => {
      dist += scroll() * dt
      if (flip) {
        if (tapped) { gdir = -gdir; env.sfx('jump'); fx.burst(pl.x, pl.y, t.accent, 8, 120, 3) }
        pl.vy += GRAV * gdir * dt
        pl.vy = clamp(pl.vy, -520, 520)
      } else if (hold) {
        pl.vy += (held ? -1500 : 800) * dt
        pl.vy = clamp(pl.vy, -260, 380)
        if (held && Math.random() < 0.5) fx.burst(pl.x - 10, pl.y + 10, t.accent2, 1, 60, 2.5)
      } else {
        if (tapped) { pl.vy = -FLAP; env.sfx('jump'); fx.burst(pl.x - 8, pl.y + 8, t.fg, 4, 80, 2.5) }
        pl.vy += GRAV * dt
        if (swim) pl.vy *= Math.pow(0.5, dt)
        pl.vy = Math.min(pl.vy, 560)
      }
      pl.vy += gust() * dt * 0.6
      pl.y += pl.vy * dt
      pl.rot = clamp(pl.vy / 600, -0.5, 0.7) * (flip ? gdir : 1)
      if (pl.y < hbox) { pl.y = hbox; if (flip) crash(pl.x, pl.y); else pl.vy = Math.max(0, pl.vy) }
      if (pl.y > H - 24 - hbox) { pl.y = H - 24 - hbox; crash(pl.x, pl.y); if (!flip) pl.vy = -260 }
      const sp = scroll()
      for (const o of obs) {
        o.x -= sp * dt
        const near = Math.abs(o.x - pl.x) < 28 + hbox * 0.6
        if (near) {
          const top = o.gy - o.gap / 2
          const bot = o.gy + o.gap / 2
          if (pl.y - hbox * 0.8 < top || pl.y + hbox * 0.8 > bot) crash(pl.x, pl.y)
        }
        if (o.mine) {
          const my = o.gy + Math.sin(time * o.mine * 2 + o.ph) * (o.gap / 2 - 18)
          if (Math.hypot(o.x - pl.x, my - pl.y) < 14 + hbox) crash(pl.x, pl.y)
        }
        if (o.item && Math.hypot(o.x + 60 - pl.x, o.gy - pl.y) < 22 + hbox && o.x + 60 > 0) {
          o.item = false
          add(25)
          env.sfx('point')
          fx.burst(o.x + 60, o.gy, t.good, 8, 140, 3)
        }
        if (!o.passed && o.x + 30 < pl.x) {
          o.passed = true
          progress++
          add(10 + Math.min(40, progress * 2))
          env.sfx('point')
          hud()
          if (progress >= goal) { win(); return }
        }
      }
      obs = obs.filter((o) => o.x > -80)
      const lastX = obs.length ? obs[obs.length - 1].x : W
      if (lastX < W + 40) spawnObs(lastX + 230 + (swim ? 20 : 0))
    }

    // ------------------------------------------------------------ lander world
    let terr: Terrain = genTerrain(rng, W, H, 1)
    const ship = { x: W * 0.15, y: 50, vx: 20, vy: 0, a: 0, fuel: 100, state: 'fly' as 'fly' | 'landed' | 'crashed', t: 0, msg: '' }
    const newPad = () => {
      terr = genTerrain(rng, W, H, 1 + progress)
      Object.assign(ship, { x: rng.range(W * 0.1, W * 0.3), y: 50, vx: rng.range(10, 30) * (rng() < 0.5 ? -1 : 1), vy: 0, a: 0, fuel: byDiff(env, 120, 100, 85) - progress * 3, state: 'fly', t: 0, msg: '' })
    }
    if (lander) newPad()
    const updateLander = (dt: number) => {
      if (ship.state !== 'fly') {
        ship.t += dt
        if (ship.t > 1.6) {
          if (ship.state === 'landed') {
            progress++
            if (progress >= goal) { win(); return }
            hud()
            newPad()
          } else {
            lives--
            hud()
            if (lives <= 0) { lose(); return }
            newPad()
          }
        }
        return
      }
      const ax = k.axis().x
      ship.a += ax * 2.4 * dt
      // touch: drag horizontally to rotate
      if (ptr.down && ptr.active && ax === 0 && (ptr.x < W * 0.28 || ptr.x > W * 0.72)) ship.a += (ptr.x < W / 2 ? -1 : 1) * 2.4 * dt
      ship.a = clamp(ship.a, -1.4, 1.4)
      const thrusting = (held || k.down('a') || k.down('up')) && ship.fuel > 0 && !(ptr.down && (ptr.x < W * 0.28 || ptr.x > W * 0.72))
      const g = swim ? 30 : 42
      ship.vy += g * dt
      ship.vx += gust() * dt * 0.15
      if (thrusting) {
        ship.vx += Math.sin(ship.a) * 125 * dt
        ship.vy -= Math.cos(ship.a) * 125 * dt
        ship.fuel = Math.max(0, ship.fuel - 14 * dt)
        fx.burst(ship.x - Math.sin(ship.a) * 12, ship.y + Math.cos(ship.a) * 12, t.accent2, 1, 90, 3)
        if (Math.floor(time * 12) !== Math.floor((time - dt) * 12)) env.sfx('move')
      }
      ship.x += ship.vx * dt
      ship.y += ship.vy * dt
      if (ship.x < 8 || ship.x > W - 8) { ship.x = clamp(ship.x, 8, W - 8); ship.vx *= -0.4 }
      if (ship.y < 8) { ship.y = 8; ship.vy = Math.max(0, ship.vy) }
      const ty = terrainY(terr, ship.x)
      if (ship.y + 12 >= ty) {
        const pad = terr.pads.find((p) => ship.x >= p.x0 && ship.x <= p.x1)
        if (pad && landingOk(ship.vx, ship.vy, ship.a, env.difficulty)) {
          ship.state = 'landed'
          ship.y = ty - 12
          ship.msg = `LANDED x${pad.mult}`
          add(100 * pad.mult + Math.round(ship.fuel))
          env.sfx('win')
          fx.burst(ship.x, ty, t.good, 20, 160, 3)
        } else {
          ship.state = 'crashed'
          ship.msg = pad ? 'TOO FAST' : 'MISSED THE PAD'
          shake.kick(10)
          env.sfx('boom')
          fx.burst(ship.x, ty, t.danger, 40, 260, 4)
        }
        ship.t = 0
      }
    }

    hud()
    env.score(0)
    const update = (dt: number) => {
      time += dt
      fx.update(dt)
      shake.update(dt)
      flash = Math.max(0, flash - dt)
      if (intro > 0) intro -= dt
      if (over) { tapped = false; return }
      if (intro > 0.15) { tapped = false; return }
      inv = Math.max(0, inv - dt)
      if (lander) updateLander(dt)
      else updateFlap(dt)
      tapped = false
    }

    const drawBar = (x: number, y: number, w: number, v: number, col: string) => {
      roundRect(ctx, x, y, w, 7, 3, 'rgba(0,0,0,.5)')
      roundRect(ctx, x, y, Math.max(0, w * v), 7, 3, col)
    }
    const draw = () => {
      background(ctx, W, H, t, 45, env.seed)
      ctx.save()
      shake.apply(ctx)
      if (swim) {
        ctx.strokeStyle = t.fg
        ctx.globalAlpha = 0.12
        for (let i = 0; i < 14; i++) {
          ctx.beginPath()
          ctx.arc(((i * 97 - dist * 0.3) % W + W) % W, (H - ((time * 20 + i * 61) % H)), 3 + (i % 3) * 2, 0, TAU)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }
      if (lander) {
        ctx.beginPath()
        ctx.moveTo(0, H)
        terr.ys.forEach((y, i) => ctx.lineTo(i * terr.step, y))
        ctx.lineTo(W, H)
        ctx.closePath()
        ctx.fillStyle = t.bg2
        ctx.fill()
        ctx.strokeStyle = t.fg
        ctx.lineWidth = 2.5
        ctx.stroke()
        for (const p of terr.pads) {
          const y = terrainY(terr, p.x0 + 1)
          ctx.fillStyle = t.good
          ctx.shadowColor = t.good
          ctx.shadowBlur = 10
          ctx.fillRect(p.x0, y - 3, p.x1 - p.x0, 5)
          ctx.shadowBlur = 0
          text(ctx, `x${p.mult}`, (p.x0 + p.x1) / 2, y + 14, { size: 9, color: t.good })
        }
        if (ship.state !== 'crashed') {
          ctx.save()
          ctx.translate(ship.x, ship.y)
          ctx.rotate(ship.a)
          ctx.shadowColor = t.accent
          ctx.shadowBlur = 10
          emoji(ctx, t.hero, 0, 0, 26)
          ctx.shadowBlur = 0
          ctx.strokeStyle = t.fg
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(-10, 14)
          ctx.lineTo(-14, 20)
          ctx.moveTo(10, 14)
          ctx.lineTo(14, 20)
          ctx.stroke()
          if ((held || k.down('a') || k.down('up')) && ship.fuel > 0 && ship.state === 'fly') {
            ctx.fillStyle = t.accent2
            ctx.beginPath()
            ctx.moveTo(-5, 14)
            ctx.lineTo(0, 24 + Math.random() * 10)
            ctx.lineTo(5, 14)
            ctx.fill()
          }
          ctx.restore()
        }
        // telemetry
        const okv = landingOk(ship.vx, ship.vy, ship.a, env.difficulty)
        text(ctx, 'FUEL', 10, 14, { size: 8, color: t.fg, align: 'left' })
        drawBar(46, 10, 80, ship.fuel / 100, ship.fuel < 20 ? t.danger : t.accent)
        text(ctx, `SPD ${Math.round(Math.hypot(ship.vx, ship.vy))}`, W - 10, 14, { size: 8, color: okv ? t.good : t.danger, align: 'right' })
        if (ship.msg) text(ctx, ship.msg, W / 2, H / 3, { size: 20, color: ship.state === 'landed' ? t.good : t.danger, shadow: '#000' })
        if (time < 8 && intro <= 0) text(ctx, portrait ? 'HOLD CENTRE = THRUST · EDGES = ROTATE' : 'SPACE THRUST · ←→ ROTATE', W / 2, H - 12, { size: 8, color: t.fg })
      } else {
        // obstacles
        for (const o of obs) {
          const top = o.gy - o.gap / 2
          const bot = o.gy + o.gap / 2
          const col = t.blocks[o.e % t.blocks.length]
          const w = 56
          const kelp = swim
          for (const [y0, y1, up] of [[-10, top, true], [bot, H, false]] as const) {
            if (kelp) {
              ctx.fillStyle = col
              ctx.globalAlpha = 0.85
              ctx.beginPath()
              const steps = 8
              const ya = up ? y1 : y0
              const yb = up ? y0 : y1
              ctx.moveTo(o.x - w / 2, yb)
              for (let i = 0; i <= steps; i++) {
                const yy = yb + ((ya - yb) * i) / steps
                ctx.lineTo(o.x - w / 2 + 6 + Math.sin(time * 2 + i * 0.8 + o.ph) * 5, yy)
              }
              for (let i = steps; i >= 0; i--) {
                const yy = yb + ((ya - yb) * i) / steps
                ctx.lineTo(o.x + w / 2 - 6 + Math.sin(time * 2 + i * 0.8 + o.ph) * 5, yy)
              }
              ctx.closePath()
              ctx.fill()
              ctx.globalAlpha = 1
            } else {
              roundRect(ctx, o.x - w / 2, y0, w, y1 - y0, 8, col, 'rgba(255,255,255,.35)', 2)
              ctx.fillStyle = 'rgba(0,0,0,.2)'
              ctx.fillRect(o.x - w / 2 + w * 0.65, y0, w * 0.35, y1 - y0)
            }
            emoji(ctx, t.foes[o.e % t.foes.length], o.x, up ? y1 - 14 : y0 + 14, 30, up ? Math.PI : 0)
          }
          if (o.item) emoji(ctx, t.items[o.e % t.items.length], o.x + 60, o.gy + Math.sin(time * 4 + o.ph) * 4, 22)
          if (o.mine) {
            const my = o.gy + Math.sin(time * o.mine * 2 + o.ph) * (o.gap / 2 - 18)
            emoji(ctx, '💣', o.x, my, 24)
          }
        }
        // ground
        ctx.fillStyle = t.bg2
        ctx.fillRect(0, H - 24, W, 24)
        ctx.fillStyle = t.accent
        ctx.fillRect(0, H - 24, W, 3)
        if (!over && (inv <= 0 || Math.floor(time * 16) % 2)) {
          ctx.shadowColor = t.accent
          ctx.shadowBlur = 12
          emoji(ctx, t.hero, pl.x, pl.y, size, pl.rot)
          ctx.shadowBlur = 0
        }
        if (flip) text(ctx, gdir > 0 ? '▼' : '▲', 20, 24, { size: 16, color: t.accent })
        if (wind) text(ctx, Math.sin(time * 0.9) > 0 ? 'GUST ↓' : 'GUST ↑', W - 46, 18, { size: 8, color: t.fg })
        if (time < 8 && intro <= 0) text(ctx, hold ? 'HOLD TO RISE' : flip ? 'TAP TO FLIP GRAVITY' : 'TAP / SPACE TO FLAP', W / 2, H - 8, { size: 8, color: t.fg })
      }
      fx.draw(ctx)
      ctx.restore()
      if (dark) {
        const cx = lander ? ship.x : pl.x
        const cy = lander ? ship.y : pl.y
        const g = ctx.createRadialGradient(cx, cy, 50, cx, cy, 190)
        g.addColorStop(0, 'rgba(0,0,0,0)')
        g.addColorStop(1, 'rgba(0,0,0,.93)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
      }
      if (flash > 0) {
        ctx.fillStyle = `rgba(255,60,60,${flash * 1.2})`
        ctx.fillRect(0, 0, W, H)
      }
      if (intro > 0) {
        const a = Math.min(1, intro * 3)
        ctx.fillStyle = `rgba(0,0,0,${0.6 * a})`
        ctx.fillRect(0, 0, W, H)
        ctx.globalAlpha = a
        emoji(ctx, t.hero, W / 2, H / 2 - 82, 64 + Math.sin(time * 5) * 3)
        text(ctx, env.name.toUpperCase(), W / 2, H / 2 - 28, { size: env.name.length > (portrait ? 14 : 24) ? 12 : 18, color: t.fg, shadow: t.accent })
        text(ctx, env.desc.slice(0, portrait ? 30 : 56), W / 2, H / 2 + 6, { size: 8, color: t.accent2 })
        text(ctx, lander ? 'THRUST · ROTATE · LAND SOFTLY' : 'TAP TO FLY', W / 2, H / 2 + 44, { size: 9, color: t.fg })
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
