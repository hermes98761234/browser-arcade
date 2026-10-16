// Chain: Boomshine-style chain reactions. One tap starts an explosion; drifting items that touch it explode too.
// Catch enough of them to clear the level. Mods: bomb (big-blast items), combo (growing multiplier), gravity (items drift inward).
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, pointer, roundRect, Shake, text, type Engine } from '../kit'
import { tone } from '../sound'
import { chainPoints, chainSpec } from '../logic/chain'

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
