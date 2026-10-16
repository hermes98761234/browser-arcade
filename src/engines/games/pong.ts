// Pong: classic paddle pong (power-ups, spin), air hockey, juggler (multi-ball survival) and slime-style volleyball / tennis / badminton.
// First to 7. Portrait phones: pong and hockey rotate so the player's paddle sits at the bottom.
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, pointer, roundRect, Shake, text, vpad, type Engine } from '../kit'
import { bounceOffCircle, landingX, paddleBounce, predictY, type Circ } from '../logic/pong'

type Kind = 'classic' | 'hockey' | 'juggler' | 'slime'
type Sport = 'volley' | 'tennis' | 'badminton'

const GW = 960
const GH = 540
const TO = 7

function pickKind(name: string, desc: string, mods: Set<string>): { kind: Kind; sport: Sport; ball: string; table: boolean } {
  const k = `${name} ${desc}`.toLowerCase()
  let sport: Sport = 'volley'
  let ball = ''
  if (/juggler/.test(k)) return { kind: 'juggler', sport, ball, table: false }
  if (/hockey|ice rink|penalty|air hockey/.test(k) || (mods.has('ice') && !/tennis|volley/.test(k))) return { kind: 'hockey', sport, ball: /penalty/.test(k) ? '⚽' : '', table: false }
  if (/table tennis|ping/.test(k)) return { kind: 'classic', sport, ball: '', table: true }
  if (/volley/.test(k)) return { kind: 'slime', sport: 'volley', ball: '🏐', table: false }
  if (/badminton|shuttle/.test(k)) return { kind: 'slime', sport: 'badminton', ball: '🏸', table: false }
  if (/tennis/.test(k)) return { kind: 'slime', sport: 'tennis', ball: '🎾', table: false }
  return { kind: 'classic', sport, ball: '', table: false }
}

interface Paddle { y: number; vy: number; h: number; grow: number; freeze: number; target: number }
interface Ball extends Circ { trail: { x: number; y: number }[]; last: 0 | 1 }
interface Pickup { x: number; y: number; kind: 'grow' | 'multi' | 'freeze'; t: number }

const engine: Engine = {
  start(env) {
    const hr = env.host.getBoundingClientRect()
    const portrait = hr.height > hr.width * 1.1
    const info = pickKind(env.name, env.desc, env.mods)
    const kind = info.kind
    const rotate = portrait && kind !== 'slime'
    const SW = portrait ? 540 : GW
    const SH = portrait ? (kind === 'slime' ? 800 : 960) : GH
    const CW = kind === 'slime' ? (portrait ? 540 : GW) : GW
    const CH = kind === 'slime' ? (portrait ? 800 : GH) : GH
    const st = createStage(env.host, SW, SH)
    const ctx = st.ctx
    const bag = new Bag()
    const two = env.players === 2
    const k = keys({ twoPlayer: two })
    const ptr = pointer(st)
    const fx = new Particles()
    const shake = new Shake()
    const t = env.theme
    const foeEmoji = t.heroes.find((f) => f !== t.hero) ?? t.foes[0] ?? '👾'
    const power = env.mods.has('power') || env.mods.has('combo') || env.mods.has('hard') || env.mods.has('boss') || /power|party|pack|chaos/i.test(env.name)
    const fast = env.mods.has('fast') ? 1.2 : env.mods.has('slow') ? 0.85 : 1
    const tiny = env.mods.has('tiny')
    const giant = env.mods.has('giant')
    const ice = env.mods.has('ice') || t.id === 'arctic'
    let time = 0
    const pts: [number, number] = [0, 0]
    let rally = 0
    let bestRally = 0
    let ended = false
    let endAt = 0
    let banner = ''
    let bannerT = 0
    let serveT = 1.1
    let serveTo: 0 | 1 = env.rng.chance(0.5) ? 0 : 1
    let lives = 3
    const unvpad = vpad(env.host, k, kind === 'slime' ? 'lr' : 'none', kind === 'slime' ? [{ action: 'up', label: '⤒' }] : [])

    const toGame = (p: { x: number; y: number }) => (rotate ? { x: GW - p.y, y: p.x } : { x: p.x, y: p.y })

    // ---------------------------------------------------------------- shared
    const say = (s: string, d = 1.1) => {
      banner = s
      bannerT = d
    }
    const report = () => {
      env.score(pts[0] * 100 + bestRally * 5)
      env.status(kind === 'juggler' ? `Lives ${'❤️'.repeat(Math.max(0, lives))} · Time ${Math.floor(time)}s` : `${pts[0]} - ${pts[1]} · first to ${TO}`)
    }
    const finishGame = (won: boolean, txt: string) => {
      if (ended) return
      ended = true
      endAt = time + 1.4
      env.sfx(won ? 'win' : 'lose')
      pendingEnd = { won, txt }
    }
    let pendingEnd: { won: boolean; txt: string } | null = null
    const point = (who: 0 | 1, x: number, y: number) => {
      pts[who]++
      rally = 0
      serveTo = who === 0 ? 1 : 0
      serveT = 1.1
      fx.burst(x, y, who === 0 ? t.accent : t.accent2, 26, 260, 4)
      shake.kick(6)
      env.sfx(who === 0 ? 'point' : 'hit')
      say(two ? (who === 0 ? 'P1 SCORES' : 'P2 SCORES') : who === 0 ? 'POINT!' : 'MISSED')
      report()
      if (pts[who] >= TO) {
        const won = two ? true : who === 0
        finishGame(won, two ? `Player ${who + 1} wins ${pts[0]}-${pts[1]}` : won ? `You won ${pts[0]}-${pts[1]}` : `You lost ${pts[0]}-${pts[1]}`)
      }
    }

    // ---------------------------------------------------------------- classic / juggler
    const PH = byDiff(env, 120, 100, 84) * (tiny ? 0.8 : giant ? 1.3 : 1)
    const PW = 14
    const MARGIN = 34
    const paddles: Paddle[] = [0, 1].map(() => ({ y: GH / 2, vy: 0, h: PH, grow: 0, freeze: 0, target: GH / 2 }))
    let balls: Ball[] = []
    let pickups: Pickup[] = []
    let pickupT = 6
    let aiT = 0
    let aiTarget = GH / 2
    const speed0 = 400 * fast * byDiff(env, 0.85, 1, 1.15)
    const newBall = (dir: 1 | -1, y = GH / 2 + env.rng.range(-60, 60)): Ball => {
      const a = env.rng.range(-0.45, 0.45)
      return { x: GW / 2, y, vx: Math.cos(a) * speed0 * dir, vy: Math.sin(a) * speed0, r: 9, trail: [], last: dir === 1 ? 0 : 1 }
    }
    const paddleX = (i: number) => (i === 0 ? MARGIN : GW - MARGIN)
    const ph = (i: number) => paddles[i].h * (paddles[i].grow > 0 ? 1.5 : 1)

    const movePaddle = (i: number, dt: number, up: boolean, down: boolean, vmax: number) => {
      const p = paddles[i]
      const slow = p.freeze > 0 ? 0.4 : 1
      const prev = p.y
      if (up || down) p.y += ((down ? 1 : 0) - (up ? 1 : 0)) * vmax * slow * dt
      else if (p.target >= 0) {
        const d = p.target - p.y
        const step = vmax * 2.6 * slow * dt
        p.y += Math.abs(d) < step ? d : Math.sign(d) * step
      }
      p.y = clamp(p.y, ph(i) / 2, GH - ph(i) / 2)
      p.vy = (p.y - prev) / Math.max(dt, 1e-4)
    }

    const classicInit = () => {
      balls = []
      pickups = []
      for (const p of paddles) {
        p.y = GH / 2
        p.target = GH / 2
        p.grow = 0
        p.freeze = 0
      }
    }

    // pointer / touch targets
    const ptrMove = (p: { x: number; y: number }) => {
      const g = toGame(p)
      if (kind === 'slime') return
      if (kind === 'hockey') return
      if (two) paddles[g.x < GW / 2 ? 0 : 1].target = g.y
      else paddles[0].target = g.y
    }
    ptr.onMove((p) => ptrMove(p))
    ptr.onDown((p) => ptrMove(p))

    const classicUpdate = (dt: number) => {
      const juggler = kind === 'juggler'
      const kb = (i: 0 | 1) => {
        if (two) return i === 0 ? { u: k.down('KeyW'), d: k.down('KeyS') } : { u: k.down('p2up'), d: k.down('p2down') }
        return { u: k.down('up'), d: k.down('down') }
      }
      const vmax = 620
      for (const i of [0, 1] as const) {
        const p = paddles[i]
        p.grow = Math.max(0, p.grow - dt)
        p.freeze = Math.max(0, p.freeze - dt)
        if (i === 1 && !two && !juggler) continue
        if (i === 1 && juggler) continue
        const c = kb(i)
        if (c.u || c.d) p.target = -1
        movePaddle(i, dt, c.u, c.d, vmax)
        if (p.target < 0 && !c.u && !c.d) p.target = p.y
      }
      // AI paddle
      if (!two && !juggler) {
        const p = paddles[1]
        aiT -= dt
        const b = balls.reduce<Ball | null>((m, x) => (!m || x.vx > 0 && (m.vx <= 0 || x.x > m.x) ? x : m), null)
        if (aiT <= 0 && b) {
          aiT = byDiff(env, 0.24, 0.13, 0.05)
          if (b.vx > 0) {
            const err = byDiff(env, 80, 38, 10)
            aiTarget = predictY(b.x, b.y, b.vx, b.vy, paddleX(1) - PW, b.r, GH - b.r) + env.rng.range(-err, err)
          } else aiTarget = GH / 2 + (b.y - GH / 2) * 0.35
        }
        const slow = p.freeze > 0 ? 0.4 : 1
        const vm = byDiff(env, 300, 430, 580) * slow * fast
        const d = aiTarget - p.y
        const prev = p.y
        p.y += Math.abs(d) < 6 ? 0 : Math.sign(d) * Math.min(Math.abs(d) * 6, vm) * dt
        p.y = clamp(p.y, ph(1) / 2, GH - ph(1) / 2)
        p.vy = (p.y - prev) / dt
      }
      // serve
      if (serveT > 0) {
        serveT -= dt
        if (serveT <= 0 && !balls.length) {
          balls.push(newBall(serveTo === 1 ? 1 : -1))
          if (juggler) balls[0].vx = Math.abs(balls[0].vx) * -1
        }
      }
      // power-ups
      if (power && !juggler && balls.length) {
        pickupT -= dt
        if (pickupT <= 0 && pickups.length < 2) {
          pickupT = 8
          pickups.push({ x: env.rng.range(GW * 0.35, GW * 0.65), y: env.rng.range(90, GH - 90), kind: env.rng.pick(['grow', 'multi', 'freeze'] as const), t: 0 })
        }
      }
      if (juggler) {
        if (balls.length && time % 8 < dt && balls.length < 3 + env.difficulty * 2 + 1) {
          const b = newBall(1)
          b.x = GW - 60
          b.vx = -Math.abs(b.vx)
          balls.push(b)
          say('NEW BALL', 0.8)
        }
      }
      const steps = 2
      for (let s = 0; s < steps; s++) {
        const h = dt / steps
        for (let bi = balls.length - 1; bi >= 0; bi--) {
          const b = balls[bi]
          b.x += b.vx * h
          b.y += b.vy * h
          if (s === 0) {
            b.trail.push({ x: b.x, y: b.y })
            if (b.trail.length > 9) b.trail.shift()
          }
          if (b.y < b.r) {
            b.y = b.r
            b.vy = Math.abs(b.vy)
            env.sfx('click')
          } else if (b.y > GH - b.r) {
            b.y = GH - b.r
            b.vy = -Math.abs(b.vy)
            env.sfx('click')
          }
          if (juggler && b.x > GW - b.r) {
            b.x = GW - b.r
            b.vx = -Math.abs(b.vx)
          }
          // paddles
          for (const i of [0, 1] as const) {
            if (i === 1 && juggler) continue
            const p = paddles[i]
            const px = paddleX(i)
            const hh = ph(i) / 2
            const within = i === 0 ? b.x - b.r < px + PW / 2 && b.x > px - PW && b.vx < 0 : b.x + b.r > px - PW / 2 && b.x < px + PW && b.vx > 0
            if (within && Math.abs(b.y - p.y) < hh + b.r * 0.6) {
              const sp = Math.min(Math.hypot(b.vx, b.vy) * 1.045 + 6, 1000 * fast)
              const v = paddleBounce(sp, (b.y - p.y) / (hh + b.r), i === 0 ? 1 : -1, p.vy)
              b.vx = v.vx
              b.vy = v.vy
              b.x = i === 0 ? px + PW / 2 + b.r : px - PW / 2 - b.r
              b.last = i
              rally++
              bestRally = Math.max(bestRally, rally)
              fx.burst(b.x, b.y, i === 0 ? t.accent : t.accent2, 8, 140, 3)
              shake.kick(2)
              env.sfx('hit')
              if (juggler) env.score(rally * 10)
            }
          }
          // pickups
          for (let pi = pickups.length - 1; pi >= 0; pi--) {
            const pu = pickups[pi]
            if (Math.hypot(b.x - pu.x, b.y - pu.y) < b.r + 20) {
              pickups.splice(pi, 1)
              env.sfx('power')
              fx.burst(pu.x, pu.y, t.good, 18, 200, 4)
              const me = b.last
              if (pu.kind === 'grow') paddles[me].grow = 8
              else if (pu.kind === 'freeze') paddles[me === 0 ? 1 : 0].freeze = 4
              else if (balls.length < 3) {
                const c = { ...b, trail: [], vy: -b.vy * 0.8 + 40 }
                balls.push(c)
              }
              say(pu.kind === 'grow' ? 'BIG PADDLE' : pu.kind === 'freeze' ? 'FREEZE' : 'MULTI BALL', 0.9)
            }
          }
          // goals
          if (b.x < -20) {
            balls.splice(bi, 1)
            if (juggler) {
              lives--
              env.sfx('lose')
              shake.kick(8)
              say('LOST A BALL', 0.9)
              report()
              if (lives <= 0) finishGame(time >= 60, `Survived ${Math.floor(time)}s, best rally ${bestRally}`)
              else if (!balls.length) serveT = 0.9
            } else {
              point(1, 30, b.y)
            }
          } else if (b.x > GW + 20 && !juggler) {
            balls.splice(bi, 1)
            point(0, GW - 30, b.y)
          }
        }
      }
      for (const pu of pickups) pu.t += dt
      if (ended) balls.length = 0
    }

    // ---------------------------------------------------------------- hockey
    const PR = 34 * (tiny ? 0.8 : giant ? 1.25 : 1)
    const PUCK = 16
    const GOAL = 84 // half gap
    const mallets = [{ x: 140, y: GH / 2, vx: 0, vy: 0, tx: 140, ty: GH / 2 }, { x: GW - 140, y: GH / 2, vx: 0, vy: 0, tx: GW - 140, ty: GH / 2 }]
    const puck = { x: GW / 2, y: GH / 2, vx: 0, vy: 0, r: PUCK }
    let puckLive = false
    const hockeyServe = () => {
      puck.x = serveTo === 0 ? GW * 0.32 : GW * 0.68
      puck.y = GH / 2
      puck.vx = 0
      puck.vy = 0
      puckLive = false
      mallets[0].x = 140
      mallets[1].x = GW - 140
      mallets[0].y = mallets[1].y = GH / 2
      mallets[0].tx = 140
      mallets[1].tx = GW - 140
      mallets[0].ty = mallets[1].ty = GH / 2
    }
    const hockeyPtr = (p: { x: number; y: number }) => {
      const g = toGame(p)
      const i = two && g.x >= GW / 2 ? 1 : 0
      mallets[i].tx = g.x
      mallets[i].ty = g.y
    }
    ptr.onMove(hockeyPtr)
    ptr.onDown(hockeyPtr)
    const hockeyUpdate = (dt: number) => {
      const lim = (i: 0 | 1, m: { x: number; y: number }) => {
        m.x = clamp(m.x, i === 0 ? PR : GW / 2 + PR, i === 0 ? GW / 2 - PR : GW - PR)
        m.y = clamp(m.y, PR, GH - PR)
      }
      for (const i of [0, 1] as const) {
        const m = mallets[i]
        const px = m.x
        const py = m.y
        if (i === 1 && !two) {
          // AI
          const home = { x: GW - 110, y: GH / 2 }
          let tx = home.x
          let ty = home.y + (puck.y - GH / 2) * 0.35
          if (puck.x > GW / 2 - 20 && puckLive || (!puckLive && serveTo === 1)) {
            const spd = Math.hypot(puck.vx, puck.vy)
            if (puck.x > m.x + 12 && spd < 160) {
              // puck behind us: swing around
              tx = puck.x + 50
              ty = puck.y + (puck.y > GH / 2 ? -60 : 60)
            } else {
              // line up behind the puck relative to the human goal and strike
              const aim = Math.atan2(GH / 2 - puck.y + env.rng.range(-40, 40), 0 - puck.x)
              tx = puck.x - Math.cos(aim) * (PR + PUCK - 2) * 0.9
              ty = puck.y - Math.sin(aim) * (PR + PUCK - 2) * 0.9
              if (spd > 380 && puck.vx > 0) {
                const py2 = predictY(puck.x, puck.y, puck.vx, puck.vy, GW - 110, PUCK, GH - PUCK)
                tx = GW - 110
                ty = py2
              }
            }
          }
          const vm = byDiff(env, 250, 360, 520) * fast
          const dx = tx - m.x
          const dy = ty - m.y
          const d = Math.hypot(dx, dy)
          if (d > 3) {
            const s = Math.min(d * 7, vm)
            m.x += (dx / d) * s * dt
            m.y += (dy / d) * s * dt
          }
        } else {
          const keyDir = i === 0 && !two ? { x: (k.down('right') ? 1 : 0) - (k.down('left') ? 1 : 0), y: (k.down('down') ? 1 : 0) - (k.down('up') ? 1 : 0) } : i === 0 ? { x: (k.down('KeyD') ? 1 : 0) - (k.down('KeyA') ? 1 : 0), y: (k.down('KeyS') ? 1 : 0) - (k.down('KeyW') ? 1 : 0) } : { x: (k.down('p2right') ? 1 : 0) - (k.down('p2left') ? 1 : 0), y: (k.down('p2down') ? 1 : 0) - (k.down('p2up') ? 1 : 0) }
          if (keyDir.x || keyDir.y) {
            m.x += keyDir.x * 520 * dt
            m.y += keyDir.y * 520 * dt
            m.tx = m.x
            m.ty = m.y
          } else {
            const dx = m.tx - m.x
            const dy = m.ty - m.y
            const d = Math.hypot(dx, dy)
            const step = 1700 * dt
            if (d <= step) {
              m.x = m.tx
              m.y = m.ty
            } else {
              m.x += (dx / d) * step
              m.y += (dy / d) * step
            }
          }
        }
        lim(i, m)
        m.vx = (m.x - px) / Math.max(dt, 1e-4)
        m.vy = (m.y - py) / Math.max(dt, 1e-4)
      }
      if (serveT > 0) {
        serveT -= dt
        if (serveT <= 0) puckLive = true
        return
      }
      if (!puckLive) return
      const steps = 3
      for (let s = 0; s < steps; s++) {
        const h = dt / steps
        puck.x += puck.vx * h
        puck.y += puck.vy * h
        const fr = Math.pow(ice ? 0.9985 : 0.996, h * 60)
        puck.vx *= fr
        puck.vy *= fr
        if (puck.y < puck.r) {
          puck.y = puck.r
          puck.vy = Math.abs(puck.vy)
          env.sfx('click')
        } else if (puck.y > GH - puck.r) {
          puck.y = GH - puck.r
          puck.vy = -Math.abs(puck.vy)
          env.sfx('click')
        }
        const inGap = Math.abs(puck.y - GH / 2) < GOAL
        if (puck.x < puck.r && !inGap) {
          puck.x = puck.r
          puck.vx = Math.abs(puck.vx)
          env.sfx('click')
        } else if (puck.x > GW - puck.r && !inGap) {
          puck.x = GW - puck.r
          puck.vx = -Math.abs(puck.vx)
          env.sfx('click')
        }
        for (const i of [0, 1] as const) {
          const m = mallets[i]
          if (bounceOffCircle(puck, m.x, m.y, m.vx, m.vy, PR, 0.9, 1.6)) {
            rally++
            bestRally = Math.max(bestRally, rally)
            fx.burst(puck.x, puck.y, i === 0 ? t.accent : t.accent2, 7, 140, 3)
            env.sfx('hit')
            shake.kick(2)
          }
        }
        const sp = Math.hypot(puck.vx, puck.vy)
        const cap = 1250 * fast
        if (sp > cap) {
          puck.vx *= cap / sp
          puck.vy *= cap / sp
        }
        if (puck.x < -puck.r - 4) {
          point(1, 30, puck.y)
          hockeyServe()
          return
        }
        if (puck.x > GW + puck.r + 4) {
          point(0, GW - 30, puck.y)
          hockeyServe()
          return
        }
      }
    }

    // ---------------------------------------------------------------- slime sports
    const sport = info.sport
    const FLOOR = CH - 70
    const NET_H = sport === 'tennis' ? 80 : sport === 'badminton' ? 150 : 115
    const SR = (portrait ? 46 : 54) * (tiny ? 0.75 : giant ? 1.3 : 1)
    const BR = sport === 'volley' ? 17 : sport === 'tennis' ? 12 : 14
    const G = sport === 'volley' ? 1500 : sport === 'tennis' ? 1350 : 650
    const DRAG = sport === 'badminton' ? 0.55 : 0
    const slimes = [0, 1].map((i) => ({ x: i === 0 ? CW * 0.25 : CW * 0.75, y: FLOOR, vx: 0, vy: 0, jump: false, tx: -1 }))
    const sball: Circ & { live: boolean; touches: [number, number]; lastSide: 0 | 1 } = { x: CW * 0.25, y: FLOOR - 260, vx: 0, vy: 0, r: BR, live: false, touches: [0, 0], lastSide: 0 }
    const sSpeed = 400 * fast
    const jumpV = 800
    const sGrav = 2400
    let lag: { x: number; y: number; vx: number; vy: number }[] = []
    let aiX = CW * 0.75
    let aiJumpCool = 0
    const slimeServe = () => {
      sball.x = serveTo === 0 ? CW * 0.25 : CW * 0.75
      sball.y = FLOOR - 300
      sball.vx = 0
      sball.vy = 0
      sball.live = false
      sball.touches = [0, 0]
      slimes[0].x = CW * 0.25
      slimes[1].x = CW * 0.75
      for (const s of slimes) {
        s.y = FLOOR
        s.vy = 0
        s.vx = 0
      }
    }
    const slimePtr = (p: { x: number; y: number }, down: boolean) => {
      if (kind !== 'slime') return
      const g = toGame(p)
      const i = two && g.x >= CW / 2 ? 1 : 0
      slimes[i].tx = g.x
      if (down && g.y < FLOOR - 40) slimes[i].jump = true
    }
    ptr.onMove((p) => slimePtr(p, false))
    ptr.onDown((p) => slimePtr(p, true))
    const slimeUpdate = (dt: number) => {
      for (const i of [0, 1] as const) {
        const s = slimes[i]
        const px = s.x
        let dir = 0
        let jump = s.jump
        s.jump = false
        if (i === 1 && !two) {
          // AI
          lag.push({ x: sball.x, y: sball.y, vx: sball.vx, vy: sball.vy })
          const delay = Math.round(byDiff(env, 14, 8, 2))
          if (lag.length > delay) lag.shift()
          const b = lag[0]
          aiJumpCool -= dt
          const nearHome = CW * 0.75
          let target = nearHome
          const comingToMe = b.vx > -40 || b.x > CW / 2
          if (sball.live || b.y < FLOOR - 120) {
            const lx = landingX(b.x, b.y, b.vx, b.vy, G, FLOOR - SR * 0.85)
            const side = lx > CW / 2 - 4
            if (side && comingToMe) {
              const err = byDiff(env, 50, 22, 6)
              target = clamp(lx + 20 + env.rng.range(-err, err) * 0.2, CW / 2 + SR + 8, CW - SR)
            }
          }
          aiX = target
          const d = aiX - s.x
          if (Math.abs(d) > 6) dir = Math.sign(d)
          const bx = sball.x - s.x
          const by = s.y - sball.y
          if (aiJumpCool <= 0 && Math.abs(bx) < SR * 0.8 && by > SR * 0.5 && by < SR * 2.6 && sball.vy > -200 && s.y >= FLOOR - 1 && (sball.x > CW / 2 || sball.live === false)) {
            jump = true
            aiJumpCool = 0.45
          }
          if (!sball.live) {
            dir = Math.abs(CW * 0.75 - s.x) > 8 ? Math.sign(CW * 0.75 - s.x) : 0
          }
          s.x += dir * sSpeed * 0.95 * dt
        } else {
          const l = i === 0 ? (two ? k.down('KeyA') : k.down('left')) : k.down('p2left')
          const r = i === 0 ? (two ? k.down('KeyD') : k.down('right')) : k.down('p2right')
          const u = i === 0 ? (two ? k.down('KeyW') || k.hit('a') : k.down('up') || k.down('a')) : k.down('p2up') || k.down('p2a')
          if (u) jump = true
          if (l || r) {
            dir = (r ? 1 : 0) - (l ? 1 : 0)
            s.tx = -1
            s.x += dir * sSpeed * dt
          } else if (s.tx >= 0) {
            const d = s.tx - s.x
            const stp = sSpeed * 1.25 * dt
            s.x += Math.abs(d) < stp ? d : Math.sign(d) * stp
          }
        }
        if (jump && s.y >= FLOOR - 0.5) {
          s.vy = -jumpV
          env.sfx('jump')
        }
        s.vy += sGrav * dt
        s.y += s.vy * dt
        if (s.y > FLOOR) {
          s.y = FLOOR
          s.vy = 0
        }
        s.x = i === 0 ? clamp(s.x, SR, CW / 2 - SR - 5) : clamp(s.x, CW / 2 + SR + 5, CW - SR)
        s.vx = (s.x - px) / Math.max(dt, 1e-4)
      }
      if (serveT > 0) {
        serveT -= dt
        if (serveT <= 0) sball.live = true
        return
      }
      if (!sball.live) return
      const sub = 3
      for (let q = 0; q < sub; q++) {
        const h = dt / sub
        sball.vy += G * h
        if (DRAG) {
          sball.vx *= 1 - DRAG * h
          sball.vy *= 1 - DRAG * h * 0.5
        }
        sball.x += sball.vx * h
        sball.y += sball.vy * h
        if (sball.x < sball.r) {
          sball.x = sball.r
          sball.vx = Math.abs(sball.vx) * 0.9
        } else if (sball.x > CW - sball.r) {
          sball.x = CW - sball.r
          sball.vx = -Math.abs(sball.vx) * 0.9
        }
        if (sball.y < sball.r) {
          sball.y = sball.r
          sball.vy = Math.abs(sball.vy) * 0.6
        }
        // net
        const nx = CW / 2
        const netTop = FLOOR - NET_H
        if (sball.y > netTop) {
          if (Math.abs(sball.x - nx) < sball.r + 4) {
            sball.vx = (sball.x < nx ? -1 : 1) * Math.max(Math.abs(sball.vx) * 0.6, 60)
            sball.x = nx + (sball.x < nx ? -1 : 1) * (sball.r + 4)
            env.sfx('click')
          }
        } else bounceOffCircle(sball, nx, netTop, 0, 0, 4, 0.8, 0)
        for (const i of [0, 1] as const) {
          const s = slimes[i]
          if (sball.y <= s.y + 4 && bounceOffCircle(sball, s.x, s.y, s.vx, s.vy, SR, 1.0, 1.0)) {
            const sp = Math.hypot(sball.vx, sball.vy)
            const cap = (sport === 'badminton' ? 900 : 1000) * fast
            if (sp > cap) {
              sball.vx *= cap / sp
              sball.vy *= cap / sp
            }
            if (sball.vy > -250) sball.vy = -250 - Math.abs(sball.vx) * 0.1
            sball.touches[i]++
            sball.lastSide = i
            rally++
            bestRally = Math.max(bestRally, rally)
            fx.burst(sball.x, sball.y, i === 0 ? t.accent : t.accent2, 8, 150, 3)
            env.sfx('hit')
          }
        }
        if (sball.y > FLOOR - sball.r) {
          const side: 0 | 1 = sball.x < CW / 2 ? 0 : 1
          sball.live = false
          fx.burst(sball.x, FLOOR, '#fff', 20, 220, 3)
          const winner: 0 | 1 = side === 0 ? 1 : 0
          point(winner, sball.x, FLOOR - 20)
          slimeServe()
          return
        }
      }
    }

    // ---------------------------------------------------------------- init
    if (kind === 'slime') slimeServe()
    else if (kind === 'hockey') hockeyServe()
    else classicInit()
    report()
    say(kind === 'juggler' ? 'KEEP THEM ALIVE' : two ? 'P1 W/S  -  P2 ARROWS' : 'MOVE: MOUSE / TOUCH / KEYS', 2)

    const update = (dt: number) => {
      time += dt
      fx.update(dt, kind === 'slime' ? 200 : 0)
      shake.update(dt)
      bannerT = Math.max(0, bannerT - dt)
      if (ended) {
        if (time > endAt && pendingEnd) {
          const e = pendingEnd
          pendingEnd = null
          const score = pts[0] * 100 + bestRally * 5 + (e.won && !two ? 500 * (1 + env.difficulty) : 0) + (kind === 'juggler' ? Math.floor(time) * 10 : 0)
          env.score(score)
          env.end({ score, won: e.won, text: e.txt })
        }
        if (kind === 'slime') slimeUpdate(dt * 0.3)
        return
      }
      if (kind === 'slime') slimeUpdate(dt)
      else if (kind === 'hockey') hockeyUpdate(dt)
      else classicUpdate(dt)
    }

    // ---------------------------------------------------------------- drawing
    const drawPaddle = (i: number) => {
      const p = paddles[i]
      const x = paddleX(i)
      const h = ph(i)
      const col = i === 0 ? t.accent : t.accent2
      ctx.shadowColor = col
      ctx.shadowBlur = 16
      roundRect(ctx, x - PW / 2, p.y - h / 2, PW, h, 7, col)
      ctx.shadowBlur = 0
      if (p.freeze > 0) roundRect(ctx, x - PW / 2 - 2, p.y - h / 2 - 2, PW + 4, h + 4, 8, undefined, '#9be7ff', 3)
      emoji(ctx, i === 0 ? t.hero : foeEmoji, i === 0 ? x + 34 : x - 34, p.y, 26)
    }
    const drawBall = (b: { x: number; y: number; r: number }, trail?: { x: number; y: number }[]) => {
      if (trail) {
        for (let i = 0; i < trail.length; i++) {
          ctx.globalAlpha = (i / trail.length) * 0.35
          ctx.fillStyle = t.fg
          ctx.beginPath()
          ctx.arc(trail[i].x, trail[i].y, b.r * (i / trail.length), 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }
      ctx.shadowColor = '#fff'
      ctx.shadowBlur = 14
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }

    const drawClassic = () => {
      const juggler = kind === 'juggler'
      if (info.table) {
        roundRect(ctx, 20, 20, GW - 40, GH - 40, 14, '#1d6b45')
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 4
        ctx.strokeRect(24, 24, GW - 48, GH - 48)
      }
      ctx.strokeStyle = t.fg
      ctx.globalAlpha = 0.25
      ctx.lineWidth = 4
      ctx.setLineDash([16, 14])
      ctx.beginPath()
      ctx.moveTo(GW / 2, 10)
      ctx.lineTo(GW / 2, GH - 10)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
      if (juggler) {
        ctx.fillStyle = t.accent2
        ctx.fillRect(GW - 8, 0, 8, GH)
      }
      drawPaddle(0)
      if (!juggler) drawPaddle(1)
      for (const pu of pickups) {
        const bob = Math.sin(pu.t * 5) * 4
        ctx.shadowColor = t.good
        ctx.shadowBlur = 16
        ctx.fillStyle = t.good
        ctx.beginPath()
        ctx.arc(pu.x, pu.y + bob, 19, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        text(ctx, pu.kind === 'grow' ? '⬍' : pu.kind === 'multi' ? '●●' : '❄', pu.x, pu.y + bob, { size: 13, color: '#000', font: 'sans-serif' })
      }
      for (const b of balls) drawBall(b, b.trail)
      if (!balls.length && serveT > 0 && !ended) drawBall({ x: GW / 2, y: GH / 2, r: 9 })
    }

    const drawHockey = () => {
      const rink = ice ? '#dff3fb' : '#12344d'
      roundRect(ctx, 14, 14, GW - 28, GH - 28, 50, rink, t.accent, 4)
      ctx.strokeStyle = ice ? '#7cc4e4' : 'rgba(255,255,255,0.35)'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(GW / 2, 14)
      ctx.lineTo(GW / 2, GH - 14)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(GW / 2, GH / 2, 70, 0, Math.PI * 2)
      ctx.stroke()
      for (const i of [0, 1]) {
        ctx.fillStyle = i === 0 ? t.accent : t.accent2
        ctx.globalAlpha = 0.5
        ctx.fillRect(i === 0 ? 0 : GW - 14, GH / 2 - GOAL, 14, GOAL * 2)
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.arc(i === 0 ? 14 : GW - 14, GH / 2, 120, i === 0 ? -Math.PI / 2 : Math.PI / 2, i === 0 ? Math.PI / 2 : Math.PI * 1.5)
        ctx.stroke()
      }
      for (const i of [0, 1] as const) {
        const m = mallets[i]
        ctx.shadowColor = i === 0 ? t.accent : t.accent2
        ctx.shadowBlur = 14
        ctx.fillStyle = i === 0 ? t.accent : t.accent2
        ctx.beginPath()
        ctx.arc(m.x, m.y, PR, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = 'rgba(0,0,0,0.25)'
        ctx.beginPath()
        ctx.arc(m.x, m.y, PR * 0.62, 0, Math.PI * 2)
        ctx.fill()
        emoji(ctx, i === 0 ? t.hero : foeEmoji, m.x, m.y, PR * 0.9)
      }
      if (info.ball) emoji(ctx, info.ball, puck.x, puck.y, PUCK * 2.3, puck.x * 0.05)
      else {
        ctx.shadowColor = '#000'
        ctx.shadowBlur = 8
        ctx.fillStyle = ice ? '#222' : '#f4f4f4'
        ctx.beginPath()
        ctx.arc(puck.x, puck.y, PUCK, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.strokeStyle = t.accent
        ctx.lineWidth = 3
        ctx.stroke()
      }
    }

    const drawSlime = () => {
      // ground
      ctx.fillStyle = sport === 'tennis' ? '#2f7d4f' : sport === 'badminton' ? '#a86a3c' : '#e2c27a'
      ctx.fillRect(0, FLOOR, CW, CH - FLOOR)
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.fillRect(0, FLOOR, CW, 4)
      // net
      const nx = CW / 2
      ctx.fillStyle = '#fff'
      ctx.fillRect(nx - 4, FLOOR - NET_H, 8, NET_H)
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'
      ctx.lineWidth = 1.5
      for (let y = FLOOR - NET_H + 12; y < FLOOR; y += 14) {
        ctx.beginPath()
        ctx.moveTo(nx - 14, y)
        ctx.lineTo(nx + 14, y)
        ctx.stroke()
      }
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(nx, FLOOR - NET_H, 6, 0, Math.PI * 2)
      ctx.fill()
      for (const i of [0, 1] as const) {
        const s = slimes[i]
        const col = i === 0 ? t.accent : t.accent2
        ctx.shadowColor = col
        ctx.shadowBlur = 12
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.arc(s.x, s.y, SR, Math.PI, 0)
        ctx.closePath()
        ctx.fill()
        ctx.shadowBlur = 0
        const g = ctx.createRadialGradient(s.x - SR * 0.3, s.y - SR * 0.6, 4, s.x, s.y - SR * 0.3, SR)
        g.addColorStop(0, 'rgba(255,255,255,0.45)')
        g.addColorStop(1, 'rgba(0,0,0,0.25)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(s.x, s.y, SR, Math.PI, 0)
        ctx.fill()
        emoji(ctx, i === 0 ? t.hero : foeEmoji, s.x + (i === 0 ? 8 : -8), s.y - SR * 0.5, SR * 0.7)
      }
      // ball shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.beginPath()
      ctx.ellipse(sball.x, FLOOR + 6, sball.r * (1 - Math.min(0.6, (FLOOR - sball.y) / 900)), 4, 0, 0, Math.PI * 2)
      ctx.fill()
      emoji(ctx, info.ball || '🏐', sball.x, sball.y, sball.r * 2.3, sball.x * 0.03)
    }

    const draw = () => {
      background(ctx, SW, SH, t, 40, env.seed)
      ctx.save()
      if (rotate) {
        ctx.translate(0, SH)
        ctx.rotate(-Math.PI / 2)
      }
      shake.apply(ctx)
      if (kind === 'slime') {
        const g = ctx.createLinearGradient(0, 0, 0, CH)
        g.addColorStop(0, t.bg)
        g.addColorStop(1, t.bg2)
        ctx.fillStyle = g
        ctx.fillRect(0, 0, CW, CH)
        drawSlime()
      } else if (kind === 'hockey') drawHockey()
      else drawClassic()
      fx.draw(ctx)
      // serve countdown
      ctx.restore()
      // HUD in screen space
      const hudTxt = kind === 'juggler' ? `${'❤️'.repeat(Math.max(0, lives))}  ${Math.floor(time)}s` : `${two ? 'P1' : 'YOU'} ${pts[0]}  :  ${pts[1]} ${two ? 'P2' : 'CPU'}`
      const hy = rotate ? SH / 2 - 16 : 8
      roundRect(ctx, SW / 2 - 110, hy, 220, 32, 10, 'rgba(10,12,22,0.7)')
      text(ctx, hudTxt, SW / 2, hy + 17, { size: 13, color: '#fff' })
      if (bannerT > 0) text(ctx, banner, SW / 2, SH * 0.5 - 40, { size: portrait ? 14 : 20, color: t.accent, shadow: t.accent })
      if (serveT > 0 && !ended && time > 0.1) text(ctx, String(Math.ceil(serveT)), SW / 2, SH / 2, { size: 40, color: 'rgba(255,255,255,0.5)' })
    }

    const lp = loop(update, draw)
    return {
      pause: (p) => lp.pause(p),
      destroy() {
        lp.stop()
        k.dispose()
        ptr.dispose()
        unvpad()
        bag.dispose()
        st.dispose()
      },
    }
  },
}
export default engine
