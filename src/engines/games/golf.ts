// Golf: drag-to-shoot physics. Mini golf (9 generated holes), pool (8-ball vs AI / 9-ball against the clock), bowling and curling.
// All modes use the same "pull back anywhere and release" slingshot, which works for mouse and touch.
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, pointer, roundRect, Shake, text, type Engine, type GameEnv } from '../kit'
import { BALL_R, genHole, moverRect, stepGolf, type GBall, type Hole } from '../logic/golf'
import { bowlingScore, mkBall, moving, planShot, rollDistance, speedForDistance, stepBalls, type Arena, type PBall, type PEvents } from '../logic/golfpool'

type Kind = 'golf' | 'pool' | 'bowling' | 'curling'
const GW = 960
const GH = 540

function pickKind(env: GameEnv): { kind: Kind; nine: boolean; pin: string } {
  const k = `${env.name} ${env.desc}`.toLowerCase()
  if (/pool|billiard|snooker|8-ball|9-ball/.test(k)) return { kind: 'pool', nine: /9-ball|nine|snooker|clock/.test(k) || env.mods.has('timer'), pin: '' }
  if (/bowling|bowl\b/.test(k)) return { kind: 'bowling', nine: false, pin: /cannon|barrel/.test(k) ? '🛢️' : /pumpkin|skull/.test(k) ? '💀' : '' }
  if (/curling/.test(k)) return { kind: 'curling', nine: false, pin: '' }
  return { kind: 'golf', nine: false, pin: '' }
}

class Sling {
  active = false
  ax = 0
  ay = 0
  cx = 0
  cy = 0
  start(x: number, y: number) {
    this.active = true
    this.ax = this.cx = x
    this.ay = this.cy = y
  }
  move(x: number, y: number) {
    this.cx = x
    this.cy = y
  }
  /** Shot vector (pull back = shoot the opposite way), power fraction 0..1 */
  get(maxPull: number) {
    const dx = this.ax - this.cx
    const dy = this.ay - this.cy
    const d = Math.hypot(dx, dy)
    const pull = Math.min(d, maxPull)
    return { ux: d > 0 ? dx / d : 1, uy: d > 0 ? dy / d : 0, pull, power: pull / maxPull }
  }
}

const engine: Engine = {
  start(env) {
    const info = pickKind(env)
    const kind = info.kind
    const hr = env.host.getBoundingClientRect()
    const portrait = hr.height > hr.width * 1.1
    const rotate = portrait && kind !== 'golf'
    const SW = portrait ? 540 : GW
    const SH = portrait ? 960 : GH
    const CW = kind === 'golf' ? SW : GW
    const TOPPAD = kind === 'golf' ? 44 : 0
    const CH = kind === 'golf' ? SH - TOPPAD : GH
    const st = createStage(env.host, SW, SH)
    const ctx = st.ctx
    const bag = new Bag()
    const k = keys()
    const ptr = pointer(st)
    const fx = new Particles()
    const shake = new Shake()
    const t = env.theme
    const two = env.players === 2
    const rng = env.rng
    const foe = t.foes[0] ?? '👾'
    const foe2 = t.heroes.find((h) => h !== t.hero) ?? foe
    let time = 0
    let ended = false
    let endAt = -1
    let pendingEnd: { score: number; won: boolean; text: string } | null = null
    let banner = ''
    let bannerT = 0
    const say = (s: string, d = 1.4) => {
      banner = s
      bannerT = d
    }
    const toGame = (p: { x: number; y: number }) => (rotate ? { x: SH - p.y, y: p.x } : { x: p.x, y: p.y - TOPPAD })
    const sling = new Sling()
    const bshare = { rolls: [] as number[], frame: 0 }
    let wasDown = false
    let lastG = { x: 0, y: 0 }
    const finish = (score: number, won: boolean, txt: string) => {
      if (ended) return
      ended = true
      endAt = time + 1.6
      pendingEnd = { score, won, text: txt }
      env.sfx(won ? 'win' : 'lose')
    }
    let hud: string[] = []
    // game-mode objects expose these
    let modeUpdate: (dt: number) => void = () => {}
    let modeDraw: () => void = () => {}
    let onPress: (p: { x: number; y: number }) => void = () => {}
    let onRelease: (p: { x: number; y: number }) => void = () => {}
    const heroBall = (x: number, y: number, r: number, rot = 0, shadow = true) => {
      if (shadow) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)'
        ctx.beginPath()
        ctx.ellipse(x + 2, y + r * 0.8, r * 0.95, r * 0.45, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      emoji(ctx, t.hero, x, y, r * 2.2, rot)
    }
    const dotted = (pts: { x: number; y: number }[], alpha = 0.9) => {
      ctx.fillStyle = '#fff'
      pts.forEach((p, i) => {
        ctx.globalAlpha = alpha * (1 - i / (pts.length + 4))
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3.2 - (i / pts.length) * 1.4, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
    }

    // ================================================================ MINI GOLF
    const setupGolf = () => {
      const HOLES = 9
      let level = 1
      let hole: Hole = genHole(rng, level, CW, CH, env.difficulty)
      const ball: GBall = { x: hole.tee.x, y: hole.tee.y, vx: 0, vy: 0, r: BALL_R, sunk: false, tele: 0 }
      let last = { x: ball.x, y: ball.y }
      let strokes = 0
      let rolling = false
      let rot = 0
      let points = 0
      let totalStrokes = 0
      let parTotal = 0
      let nextAt = -1
      const MAXPULL = 120
      const maxStrokes = 9
      const results: number[] = []
      let sinkAnim = 0
      const previewSteps = byDiff(env, 110, 64, 26)
      const status = () => {
        env.status(`Hole ${level}/${HOLES} · Par ${hole.par} · Strokes ${strokes}`)
        hud = [`HOLE ${level}/${HOLES}`, `PAR ${hole.par}`, `STROKES ${strokes}`]
      }
      const newHole = () => {
        hole = genHole(rng, level, CW, CH, env.difficulty)
        ball.x = hole.tee.x
        ball.y = hole.tee.y
        ball.vx = ball.vy = 0
        ball.sunk = false
        last = { x: ball.x, y: ball.y }
        strokes = 0
        rolling = false
        sinkAnim = 0
        status()
        say(`HOLE ${level}  PAR ${hole.par}`, 1.6)
      }
      const holeDone = (s: number) => {
        results.push(s)
        totalStrokes += s
        parTotal += hole.par
        const pts = s >= maxStrokes ? 0 : Math.max(0, hole.par + 3 - s) * 100 + (s === 1 ? 500 : 0)
        points += pts
        env.score(points)
        const d = s - hole.par
        say(s === 1 ? 'HOLE IN ONE!' : d <= -2 ? 'EAGLE!' : d === -1 ? 'BIRDIE!' : d === 0 ? 'PAR' : d === 1 ? 'BOGEY' : `+${d}`, 1.5)
        nextAt = time + 1.6
        if (level >= HOLES) {
          const allow = byDiff(env, 9, 5, 2)
          const won = totalStrokes <= parTotal + allow
          nextAt = -1
          finish(points, won, `${totalStrokes} strokes, par ${parTotal} (${totalStrokes - parTotal >= 0 ? '+' : ''}${totalStrokes - parTotal})`)
        }
      }
      onPress = (p) => {
        if (rolling || ball.sunk || ended) return
        sling.start(p.x, p.y)
      }
      onRelease = () => {
        if (!sling.active) return
        sling.active = false
        if (rolling || ball.sunk || ended) return
        const s = sling.get(MAXPULL)
        if (s.pull < 10) return
        const speed = 90 + s.power * 980
        ball.vx = s.ux * speed
        ball.vy = s.uy * speed
        last = { x: ball.x, y: ball.y }
        strokes++
        rolling = true
        env.sfx('shoot')
        shake.kick(1.5)
        status()
      }
      status()
      say(`HOLE 1  PAR ${hole.par}`, 2)
      modeUpdate = (dt) => {
        if (nextAt > 0 && time >= nextAt) {
          nextAt = -1
          level++
          newHole()
        }
        if (ball.sunk) {
          sinkAnim = Math.min(1, sinkAnim + dt * 3)
          return
        }
        if (rolling) {
          const ev = stepGolf(hole, ball, dt, time)
          const sp = Math.hypot(ball.vx, ball.vy)
          rot += (sp * dt) / ball.r
          for (const e of ev) {
            if (e === 'wall' && sp > 60) env.sfx('click')
            else if (e === 'bumper') {
              env.sfx('hit')
              fx.burst(ball.x, ball.y, t.accent, 8, 140, 3)
              shake.kick(2)
            } else if (e === 'tele') {
              env.sfx('power')
              fx.burst(ball.x, ball.y, t.accent2, 14, 160, 3)
            } else if (e === 'water') {
              env.sfx('lose')
              fx.burst(ball.x, ball.y, '#7dd3fc', 22, 200, 4)
              ball.x = last.x
              ball.y = last.y
              ball.vx = ball.vy = 0
              strokes++
              say('SPLASH! +1', 1.2)
              status()
              rolling = false
            } else if (e === 'sink') {
              env.sfx('win')
              fx.burst(hole.cup.x, hole.cup.y, t.good, 30, 260, 4)
              rolling = false
              holeDone(strokes)
            }
          }
          if (rolling && ball.vx === 0 && ball.vy === 0) {
            rolling = false
            if (strokes >= maxStrokes) {
              say('PICK UP', 1)
              holeDone(maxStrokes)
              ball.sunk = true
            }
          }
        }
        if (sling.active) {
          if (!ptr.down) sling.active = false
        }
      }
      modeDraw = () => {
        // course
        const bd = hole.bounds
        const pad = 14
        ctx.fillStyle = 'rgba(0,0,0,0.35)'
        roundRect(ctx, bd.x - pad, bd.y - pad, bd.w + pad * 2, bd.h + pad * 2, 16, t.blocks[0])
        ctx.fillStyle = '#2e9a52'
        ctx.fillRect(bd.x, bd.y, bd.w, bd.h)
        ctx.fillStyle = 'rgba(0,0,0,0.18)'
        ctx.fillRect(bd.x, bd.y, bd.w, bd.h)
        // mow stripes
        ctx.fillStyle = 'rgba(255,255,255,0.045)'
        for (let x = bd.x; x < bd.x + bd.w; x += 80) ctx.fillRect(x, bd.y, 40, bd.h)
        for (const s of hole.sand) {
          roundRect(ctx, s.x, s.y, s.w, s.h, 18, '#e2c98a')
          ctx.fillStyle = 'rgba(120,90,40,0.35)'
          for (let i = 0; i < 18; i++) ctx.fillRect(s.x + ((i * 37) % s.w), s.y + ((i * 53) % s.h), 2, 2)
        }
        for (const w of hole.water) {
          roundRect(ctx, w.x, w.y, w.w, w.h, 12, '#2b79c9')
          ctx.strokeStyle = 'rgba(255,255,255,0.45)'
          ctx.lineWidth = 2
          for (let i = 0; i < 4; i++) {
            const yy = w.y + 14 + i * ((w.h - 20) / 4)
            ctx.beginPath()
            for (let x = 0; x <= w.w - 16; x += 6) ctx.lineTo(w.x + 8 + x, yy + Math.sin(time * 3 + x * 0.2 + i) * 2.5)
            ctx.stroke()
          }
        }
        for (const r of hole.ramps) {
          roundRect(ctx, r.x, r.y, r.w, r.h, 8, 'rgba(255,220,80,0.25)', 'rgba(255,220,80,0.7)', 2)
          const cxr = r.x + r.w / 2
          const cyr = r.y + r.h / 2
          ctx.strokeStyle = '#ffe36b'
          ctx.lineWidth = 3
          for (let i = -1; i <= 1; i++) {
            const o = i * 18 + ((time * 40) % 18)
            const px = cxr + r.dx * o - r.dx * 9
            const py = cyr + r.dy * o - r.dy * 9
            ctx.beginPath()
            ctx.moveTo(px - r.dx * 7 + r.dy * 9, py - r.dy * 7 + r.dx * 9)
            ctx.lineTo(px + r.dx * 7, py + r.dy * 7)
            ctx.lineTo(px - r.dx * 7 - r.dy * 9, py - r.dy * 7 - r.dx * 9)
            ctx.stroke()
          }
        }
        if (hole.tele) {
          for (const [i, p] of [hole.tele.a, hole.tele.b].entries()) {
            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate(time * (i ? -3 : 3))
            ctx.strokeStyle = i ? t.accent2 : t.accent
            ctx.lineWidth = 4
            ctx.shadowColor = ctx.strokeStyle
            ctx.shadowBlur = 12
            ctx.beginPath()
            ctx.arc(0, 0, 14, 0, Math.PI * 1.6)
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(0, 0, 7, Math.PI, Math.PI * 2.6)
            ctx.stroke()
            ctx.restore()
          }
        }
        // tee
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.beginPath()
        ctx.arc(hole.tee.x, hole.tee.y, 14, 0, Math.PI * 2)
        ctx.fill()
        // cup
        ctx.fillStyle = '#0b0b10'
        ctx.beginPath()
        ctx.arc(hole.cup.x, hole.cup.y, hole.cup.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        ctx.lineWidth = 2
        ctx.stroke()
        // walls
        const wall = (r: { x: number; y: number; w: number; h: number }, col: string) => {
          ctx.fillStyle = 'rgba(0,0,0,0.35)'
          ctx.fillRect(r.x + 3, r.y + 5, r.w, r.h)
          roundRect(ctx, r.x, r.y, r.w, r.h, 5, col)
          ctx.fillStyle = 'rgba(255,255,255,0.28)'
          ctx.fillRect(r.x + 2, r.y + 2, Math.max(0, r.w - 4), 3)
        }
        for (const w of hole.walls) wall(w, t.blocks[0])
        for (const m of hole.movers) wall(moverRect(m, time), t.accent2)
        for (const [i, b] of hole.bumpers.entries()) {
          ctx.shadowColor = t.accent
          ctx.shadowBlur = 10
          ctx.fillStyle = t.blocks[(i + 1) % t.blocks.length]
          ctx.beginPath()
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
          ctx.lineWidth = 3
          ctx.strokeStyle = 'rgba(255,255,255,0.6)'
          ctx.stroke()
          emoji(ctx, t.foes[i % t.foes.length] ?? foe, b.x, b.y, b.r * 1.3)
        }
        // flag
        const cx = hole.cup.x
        const cy = hole.cup.y
        ctx.strokeStyle = '#eee'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx, cy - 44)
        ctx.stroke()
        ctx.fillStyle = t.danger
        ctx.beginPath()
        ctx.moveTo(cx, cy - 44)
        ctx.lineTo(cx + 24, cy - 36 + Math.sin(time * 4) * 2)
        ctx.lineTo(cx, cy - 28)
        ctx.fill()
        // aim preview
        if (sling.active && !rolling) {
          const s = sling.get(MAXPULL)
          if (s.pull >= 10) {
            const speed = 90 + s.power * 980
            const pts: { x: number; y: number }[] = []
            const b: GBall = { x: ball.x, y: ball.y, vx: s.ux * speed, vy: s.uy * speed, r: BALL_R, sunk: false, tele: 0 }
            for (let i = 0; i < previewSteps; i++) {
              const ev = stepGolf(hole, b, 1 / 60, time + i / 60)
              if (i % 4 === 3) pts.push({ x: b.x, y: b.y })
              if (b.sunk || ev.includes('water') || (b.vx === 0 && b.vy === 0)) break
            }
            dotted(pts)
            // power arrow
            ctx.strokeStyle = `hsl(${120 - s.power * 120} 90% 55%)`
            ctx.lineWidth = 5
            ctx.lineCap = 'round'
            ctx.beginPath()
            ctx.moveTo(ball.x, ball.y)
            ctx.lineTo(ball.x - s.ux * s.pull * 0.45, ball.y - s.uy * s.pull * 0.45)
            ctx.stroke()
          }
        }
        // ball
        if (ball.sunk) {
          const sc = 1 - sinkAnim
          if (sc > 0.02) emoji(ctx, t.hero, hole.cup.x, hole.cup.y, ball.r * 2.2 * sc)
        } else heroBall(ball.x, ball.y, ball.r, rot)
      }
    }

    // ================================================================ POOL
    const setupPool = () => {
      const nine = info.nine
      const TB = { x: 120, y: 100, w: 720, h: 360 }
      const R = 10.5
      const pockets = [
        { x: TB.x - 4, y: TB.y - 4, r: 23 }, { x: TB.x + TB.w + 4, y: TB.y - 4, r: 23 },
        { x: TB.x - 4, y: TB.y + TB.h + 4, r: 23 }, { x: TB.x + TB.w + 4, y: TB.y + TB.h + 4, r: 23 },
        { x: TB.x + TB.w / 2, y: TB.y - 8, r: 20 }, { x: TB.x + TB.w / 2, y: TB.y + TB.h + 8, r: 20 },
      ]
      const arena: Arena = { ...TB, pockets, wall: 0.78, e: 0.95, k: 0.22, c: 90, walls: true }
      const COLORS = ['#f5d90a', '#1d4ed8', '#dc2626', '#7c3aed', '#f97316', '#16a34a', '#7f1d1d', '#111111']
      const balls: PBall[] = []
      const cue = mkBall(0, TB.x + TB.w * 0.25, TB.y + TB.h / 2, R, 'cue')
      const rack = () => {
        balls.length = 0
        balls.push(cue)
        cue.out = false
        cue.x = TB.x + TB.w * 0.25
        cue.y = TB.y + TB.h / 2
        cue.vx = cue.vy = 0
        const fx0 = TB.x + TB.w * 0.7
        const gap = R * 2 + 0.6
        if (nine) {
          const order = [1, 2, 3, 4, 9, 5, 6, 7, 8]
          const rows = [1, 2, 3, 2, 1]
          let i = 0
          rows.forEach((n, r) => {
            for (let j = 0; j < n; j++) {
              const num = order[i++]
              balls.push(mkBall(num, fx0 + r * gap * 0.87, TB.y + TB.h / 2 + (j - (n - 1) / 2) * gap, R, num === 9 ? 'nine' : 'solid', num))
            }
          })
        } else {
          const nums = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15])
          let i = 0
          for (let r = 0; r < 5; r++) {
            for (let j = 0; j <= r; j++) {
              const mid = r === 2 && j === 1
              const num = mid ? 8 : nums[i++]
              balls.push(mkBall(num, fx0 + r * gap * 0.87, TB.y + TB.h / 2 + (j - r / 2) * gap, R, num === 8 ? 'eight' : num < 8 ? 'solid' : 'stripe', num))
            }
          }
        }
      }
      rack()
      type Phase = 'aim' | 'roll' | 'place' | 'ai' | 'over'
      let phase: Phase = 'aim'
      let turn: 0 | 1 = 0
      let inHand = false
      let firstHit = -1
      let potted: PBall[] = []
      const ev: PEvents = { hits: [], cushions: 0, pocketed: [] }
      let aiPlan: { angle: number; speed: number; t: number } | null = null
      let aiWait = 0
      let timeLeft = byDiff(env, 240, 170, 120)
      let pottedCount = 0
      let shotAngle = 0
      let pull = 0
      let foulText = ''
      const MAXPULL = 150
      const vmax = 1500
      const own = (who: 0 | 1) => (who === 0 ? 'solid' : 'stripe')
      const remaining = (kindName: string) => balls.filter((b) => !b.out && b.kind === kindName)
      const lowest = () => Math.min(...balls.filter((b) => !b.out && b.id !== 0).map((b) => b.num))
      const turnName = () => (two ? (turn === 0 ? 'P1' : 'P2') : turn === 0 ? 'YOU' : 'CPU')
      const updateHud = () => {
        if (nine) {
          env.status(`9-ball · ${Math.ceil(timeLeft)}s · potted ${pottedCount}`)
          hud = ['9-BALL', `TIME ${Math.ceil(timeLeft)}`, `NEXT ${lowest()}`]
        } else {
          const me = remaining('solid').length + (remaining('eight').length ? 0 : 0)
          const op = remaining('stripe').length
          env.status(`8-ball · ${turnName()} · solids ${me} · stripes ${op}`)
          hud = [turn === 0 ? 'SOLIDS' : 'STRIPES', `${turnName()} TO SHOOT`, `LEFT ${me}-${op}`]
        }
      }
      const placeCue = (x: number, y: number) => {
        const px = clamp(x, TB.x + R, TB.x + TB.w - R)
        const py = clamp(y, TB.y + R, TB.y + TB.h - R)
        if (balls.some((b) => !b.out && b.id !== 0 && Math.hypot(b.x - px, b.y - py) < R * 2 + 1)) return false
        cue.x = px
        cue.y = py
        cue.out = false
        cue.vx = cue.vy = 0
        return true
      }
      const freeSpot = () => {
        for (let i = 0; i < 200; i++) {
          const x = TB.x + TB.w * 0.25 + (i % 10) * 6
          const y = TB.y + TB.h / 2 + ((i / 10) | 0) * 14 * (i % 2 ? 1 : -1)
          if (placeCue(x, y)) return
        }
      }
      const shoot = (angle: number, speed: number) => {
        cue.vx = Math.cos(angle) * speed
        cue.vy = Math.sin(angle) * speed
        ev.hits.length = 0
        ev.pocketed.length = 0
        ev.cushions = 0
        firstHit = -1
        phase = 'roll'
        env.sfx('hit')
        shake.kick(1 + speed / 600)
      }
      const nextTurn = (w: 0 | 1, hand: boolean) => {
        turn = w
        inHand = hand
        phase = !two && turn === 1 ? 'ai' : hand ? 'place' : 'aim'
        aiWait = 0.9
        if (hand) {
          cue.out = true
          freeSpot()
          cue.out = false
        }
        if (phase === 'place' || (hand && phase === 'ai')) say(phase === 'ai' ? 'FOUL' : 'FOUL: PLACE THE CUE BALL', 1.6)
        updateHud()
      }
      const resolve = () => {
        const pot = ev.pocketed.slice()
        const scratch = pot.some((b) => b.id === 0)
        const numbered = pot.filter((b) => b.id !== 0)
        const fb = firstHit >= 0 ? balls.find((b) => b.id === firstHit) : undefined
        pottedCount += numbered.length
        if (turn === 0 || two) env.score(pottedCount * 100)
        if (nine) {
          // lowest ball at the start of the shot = lowest among (alive + just potted)
          const lowestBefore = Math.min(...balls.filter((b) => b.id !== 0 && (!b.out || numbered.includes(b))).map((b) => b.num))
          const foul = scratch || !fb || fb.num !== lowestBefore
          const nineIn = numbered.find((b) => b.num === 9)
          if (nineIn && !foul) {
            const score = pottedCount * 100 + 500 + Math.floor(timeLeft) * 5
            env.score(score)
            phase = 'over'
            finish(score, true, `Cleared the table with ${Math.ceil(timeLeft)}s left`)
            return
          }
          if (nineIn && foul) {
            nineIn.out = false
            nineIn.x = TB.x + TB.w * 0.7
            nineIn.y = TB.y + TB.h / 2
            nineIn.vx = nineIn.vy = 0
            pottedCount--
          }
          if (foul) {
            foulText = scratch ? 'SCRATCH' : !fb ? 'MISSED' : `HIT ${lowestBefore} FIRST`
            say(foulText, 1.4)
            env.sfx('lose')
            timeLeft = Math.max(0, timeLeft - 5)
            nextTurn(0, true)
            return
          }
          nextTurn(0, false)
          return
        }
        // 8-ball
        const mine = own(turn)
        const pottedMine = numbered.filter((b) => b.kind === mine).length
        const clearBefore = balls.filter((b) => b.kind === mine && !b.out).length + pottedMine === 0
        const legalFirst = !!fb && (fb.kind === mine || (fb.kind === 'eight' && clearBefore))
        const foul = scratch || !legalFirst
        const eightIn = numbered.some((b) => b.kind === 'eight')
        if (eightIn) {
          const iWin = !foul && clearBefore
          const winner: 0 | 1 = iWin ? turn : turn === 0 ? 1 : 0
          phase = 'over'
          const won = two ? true : winner === 0
          const score = pottedCount * 100 + (won && !two ? 600 * (1 + env.difficulty) : 0)
          env.score(score)
          finish(score, won, iWin ? 'Sank the 8-ball' : 'The 8-ball went in too early')
          return
        }
        if (foul) {
          say(scratch ? 'SCRATCH' : !fb ? 'MISSED' : 'WRONG BALL', 1.4)
          env.sfx('lose')
          nextTurn(turn === 0 ? 1 : 0, true)
          return
        }
        const gotOwn = numbered.some((b) => b.kind === mine)
        if (gotOwn) {
          say('NICE!', 0.8)
          env.sfx('point')
          nextTurn(turn, false)
        } else nextTurn(turn === 0 ? 1 : 0, false)
      }
      const aiChoose = () => {
        const targets = nine ? [balls.filter((b) => !b.out && b.id !== 0).sort((a, b) => a.num - b.num)[0].id] : (() => {
          const mine = balls.filter((b) => !b.out && b.kind === own(1))
          return mine.length ? mine.map((b) => b.id) : balls.filter((b) => b.kind === 'eight' && !b.out).map((b) => b.id)
        })()
        let plan = planShot(balls, arena, 0, targets, vmax)
        if (!plan) {
          // no clean pot: tap the nearest legal ball
          const tb = balls.find((b) => b.id === targets[0])!
          const nearest = targets.map((id) => balls.find((b) => b.id === id)!).sort((a, b) => Math.hypot(a.x - cue.x, a.y - cue.y) - Math.hypot(b.x - cue.x, b.y - cue.y))[0] ?? tb
          const ang = Math.atan2(nearest.y - cue.y, nearest.x - cue.x)
          plan = { angle: ang, speed: 300 + rng.range(0, 250), target: nearest.id, pocket: 0, score: 0 }
        }
        const err = byDiff(env, 0.05, 0.02, 0.006)
        const g = () => (rng() + rng() + rng() - 1.5) * 0.8
        aiPlan = { angle: plan.angle + g() * err * 3, speed: clamp(plan.speed * (1 + g() * err * 2), 120, vmax), t: 0 }
      }
      onPress = (p) => {
        if (ended || phase === 'roll' || phase === 'over') return
        if (!two && turn === 1) return
        if (phase === 'place') {
          if (p.x >= TB.x && p.x <= TB.x + TB.w && p.y >= TB.y && p.y <= TB.y + TB.h && placeCue(p.x, p.y)) {
            phase = 'aim'
            inHand = false
            env.sfx('click')
          }
          return
        }
        if (phase === 'aim') sling.start(p.x, p.y)
      }
      onRelease = () => {
        if (!sling.active) return
        sling.active = false
        if (phase !== 'aim') return
        const s = sling.get(MAXPULL)
        if (s.pull < 8) return
        shoot(Math.atan2(s.uy, s.ux), 120 + s.power * (vmax - 120))
      }
      updateHud()
      say(nine ? 'POT THE 9 BEFORE TIME RUNS OUT' : two ? 'P1 SOLIDS  P2 STRIPES' : 'YOU: SOLIDS  CPU: STRIPES', 2.2)
      modeUpdate = (dt) => {
        if (phase === 'over') {
          if (moving(balls)) stepBalls(balls, arena, dt, ev)
          return
        }
        if (nine) {
          timeLeft -= dt
          if (Math.floor(timeLeft) !== Math.floor(timeLeft + dt)) updateHud()
          if (timeLeft <= 0) {
            phase = 'over'
            const score = pottedCount * 100
            env.score(score)
            finish(score, false, `Time up with ${pottedCount} balls potted`)
            return
          }
        }
        if (phase === 'roll') {
          const before = ev.hits.length
          const pbefore = ev.pocketed.length
          stepBalls(balls, arena, dt, ev)
          for (let i = before; i < ev.hits.length; i++) {
            const h = ev.hits[i]
            if (firstHit < 0 && (h.a === 0 || h.b === 0)) firstHit = h.a === 0 ? h.b : h.a
            env.sfx(h.speed > 200 ? 'hit' : 'click')
          }
          if (ev.pocketed.length > pbefore) {
            for (let i = pbefore; i < ev.pocketed.length; i++) {
              const b = ev.pocketed[i]
              fx.burst(b.x, b.y, b.id === 0 ? '#fff' : COLORS[(b.num - 1) % 8], 16, 160, 3)
              env.sfx(b.id === 0 ? 'lose' : 'point')
            }
            shake.kick(3)
          }
          if (!moving(balls, 6)) {
            for (const b of balls) b.vx = b.vy = 0
            potted = ev.pocketed.slice()
            void potted
            resolve()
          }
        } else if (phase === 'ai') {
          aiWait -= dt
          if (aiWait <= 0 && !aiPlan) {
            if (inHand) {
              // pick the spot giving the best plan out of a few candidates
              let bestSpot = { x: TB.x + TB.w * 0.25, y: TB.y + TB.h / 2 }
              let bestScore = -1e9
              for (let i = 0; i < 8; i++) {
                const x = TB.x + 60 + rng() * TB.w * 0.5
                const y = TB.y + 30 + rng() * (TB.h - 60)
                if (!placeCue(x, y)) continue
                const mine = balls.filter((b) => !b.out && b.kind === own(1)).map((b) => b.id)
                const pl = planShot(balls, arena, 0, nine ? [lowest()] : mine.length ? mine : balls.filter((b) => b.kind === 'eight').map((b) => b.id), vmax)
                if (pl && pl.score > bestScore) {
                  bestScore = pl.score
                  bestSpot = { x, y }
                }
              }
              placeCue(bestSpot.x, bestSpot.y)
              inHand = false
            }
            aiChoose()
          }
          if (aiPlan) {
            aiPlan.t += dt
            pull = Math.min(1, aiPlan.t / 0.7) * Math.min(1, aiPlan.speed / vmax) * MAXPULL
            shotAngle = aiPlan.angle
            if (aiPlan.t > 0.9) {
              const pl = aiPlan
              aiPlan = null
              pull = 0
              shoot(pl.angle, pl.speed)
            }
          }
        }
      }
      const drawBall = (b: PBall) => {
        if (b.out) return
        const col = b.id === 0 ? '#fdfdf5' : COLORS[(b.num - 1) % 8]
        ctx.fillStyle = 'rgba(0,0,0,0.3)'
        ctx.beginPath()
        ctx.arc(b.x + 2, b.y + 3, b.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.save()
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.clip()
        ctx.fillStyle = b.num > 8 && b.id !== 0 ? '#f4f4ec' : col
        ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2)
        if (b.num > 8 && b.id !== 0) {
          ctx.fillStyle = col
          ctx.fillRect(b.x - b.r, b.y - b.r * 0.55, b.r * 2, b.r * 1.1)
        }
        ctx.restore()
        if (b.id !== 0) {
          ctx.fillStyle = '#fff'
          ctx.beginPath()
          ctx.arc(b.x, b.y, b.r * 0.48, 0, Math.PI * 2)
          ctx.fill()
          text(ctx, String(b.num), b.x, b.y + 0.5, { size: 7, color: '#111', font: 'sans-serif', weight: 800 })
        }
        const g = ctx.createRadialGradient(b.x - b.r * 0.4, b.y - b.r * 0.4, 1, b.x, b.y, b.r)
        g.addColorStop(0, 'rgba(255,255,255,0.65)')
        g.addColorStop(0.4, 'rgba(255,255,255,0)')
        g.addColorStop(1, 'rgba(0,0,0,0.3)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
        if (b.id === 0) emoji(ctx, t.hero, b.x, b.y, b.r * 1.5)
      }
      modeDraw = () => {
        // rails + cloth
        roundRect(ctx, TB.x - 40, TB.y - 40, TB.w + 80, TB.h + 80, 24, '#5a3a1e', '#2d1b0c', 4)
        ctx.fillStyle = '#1f8a4c'
        ctx.fillRect(TB.x, TB.y, TB.w, TB.h)
        ctx.fillStyle = 'rgba(0,0,0,0.18)'
        ctx.fillRect(TB.x, TB.y, TB.w, TB.h)
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(TB.x + TB.w * 0.25, TB.y)
        ctx.lineTo(TB.x + TB.w * 0.25, TB.y + TB.h)
        ctx.stroke()
        for (const p of pockets) {
          ctx.fillStyle = '#050508'
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
        }
        for (const b of balls) if (b.id !== 0) drawBall(b)
        if (!cue.out) drawBall(cue)
        // aiming
        const aimingHuman = sling.active && phase === 'aim'
        if (aimingHuman || aiPlan) {
          let ux: number
          let uy: number
          let pw: number
          if (aimingHuman) {
            const s = sling.get(MAXPULL)
            ux = s.ux
            uy = s.uy
            pw = s.pull
            pull = s.pull
            shotAngle = Math.atan2(uy, ux)
          } else {
            ux = Math.cos(shotAngle)
            uy = Math.sin(shotAngle)
            pw = pull
          }
          if (pw > 4) {
            // ray cast: first ball or cushion
            let best = 2000
            let hitBall: PBall | null = null
            for (const b of balls) {
              if (b.out || b.id === 0) continue
              const dx = b.x - cue.x
              const dy = b.y - cue.y
              const proj = dx * ux + dy * uy
              if (proj <= 0) continue
              const perp2 = dx * dx + dy * dy - proj * proj
              const rr = (b.r + cue.r) ** 2
              if (perp2 >= rr) continue
              const d = proj - Math.sqrt(rr - perp2)
              if (d < best) {
                best = d
                hitBall = b
              }
            }
            for (const [d] of [[ux > 0 ? (TB.x + TB.w - R - cue.x) / ux : ux < 0 ? (TB.x + R - cue.x) / ux : 1e9], [uy > 0 ? (TB.y + TB.h - R - cue.y) / uy : uy < 0 ? (TB.y + R - cue.y) / uy : 1e9]]) if (d < best && d > 0) {
              best = d
              hitBall = null
            }
            const ex = cue.x + ux * best
            const ey = cue.y + uy * best
            ctx.setLineDash([6, 6])
            ctx.strokeStyle = 'rgba(255,255,255,0.8)'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(cue.x, cue.y)
            ctx.lineTo(ex, ey)
            ctx.stroke()
            ctx.setLineDash([])
            ctx.beginPath()
            ctx.arc(ex, ey, R, 0, Math.PI * 2)
            ctx.stroke()
            if (hitBall) {
              const nx = hitBall.x - ex
              const ny = hitBall.y - ey
              const nl = Math.hypot(nx, ny) || 1
              ctx.strokeStyle = 'rgba(255,230,120,0.9)'
              ctx.beginPath()
              ctx.moveTo(hitBall.x, hitBall.y)
              ctx.lineTo(hitBall.x + (nx / nl) * 50, hitBall.y + (ny / nl) * 50)
              ctx.stroke()
            }
            // cue stick
            const back = 16 + pw * 0.9
            ctx.save()
            ctx.translate(cue.x - ux * back, cue.y - uy * back)
            ctx.rotate(Math.atan2(uy, ux))
            const g = ctx.createLinearGradient(-230, 0, 0, 0)
            g.addColorStop(0, '#3a2412')
            g.addColorStop(0.6, '#d9b27c')
            g.addColorStop(1, '#f4ead5')
            ctx.fillStyle = g
            ctx.fillRect(-230, -3.5, 230, 7)
            ctx.restore()
            // power bar
            const frac = Math.min(1, pw / MAXPULL)
            ctx.fillStyle = 'rgba(0,0,0,0.5)'
            ctx.fillRect(TB.x, TB.y + TB.h + 22, 140, 10)
            ctx.fillStyle = `hsl(${120 - frac * 120} 85% 55%)`
            ctx.fillRect(TB.x, TB.y + TB.h + 22, 140 * frac, 10)
          }
        }
        if (phase === 'place' && ptr.active) {
          const gp = toGame(ptr)
          if (gp.x > TB.x && gp.x < TB.x + TB.w && gp.y > TB.y && gp.y < TB.y + TB.h) {
            ctx.globalAlpha = 0.55
            emoji(ctx, t.hero, gp.x, gp.y, R * 2.2)
            ctx.globalAlpha = 1
          }
          text(ctx, 'TAP TO PLACE THE CUE BALL', TB.x + TB.w / 2, TB.y + TB.h + 36, { size: 10, color: '#fff' })
        }
      }
    }

    // ================================================================ BOWLING
    const setupBowling = () => {
      const LY = 270
      const LANE = 100 // half width of the lane
      const arena: Arena = { x: 90, y: LY - 138, w: 830, h: 276, pockets: [], wall: 0.5, e: 0.72, k: 0.01, c: 3, walls: true }
      const FOUL = 170
      const R = 15
      const PR = 9.5
      const pinsHome: { x: number; y: number }[] = []
      for (let r = 0; r < 4; r++) for (let j = 0; j <= r; j++) pinsHome.push({ x: 770 + r * 22, y: LY + (j - r / 2) * 25 })
      const bowl = mkBall(100, 130, LY, R, 'ball', 0, 8)
      bowl.fr = [0.03, 2]
      let pins: PBall[] = []
      const resetPins = () => {
        pins = pinsHome.map((p, i) => {
          const b = mkBall(i + 1, p.x, p.y, PR, 'pin', i + 1, 1)
          b.fr = [2.6, 70]
          return b
        })
      }
      resetPins()
      const rolls = bshare.rolls
      let frame = 0
      let rollNo = 0
      let phase: 'aim' | 'roll' | 'settle' | 'over' = 'aim'
      let settleT = 0
      let rollT = 0
      let standingBefore = 10
      const ev: PEvents = { hits: [], cushions: 0, pocketed: [] }
      const MAXPULL = 140
      const target = byDiff(env, 90, 130, 170)
      const home = (id: number) => pinsHome[id - 1]
      const knocked = (p: PBall) => p.down || p.out || Math.hypot(p.x - home(p.id).x, p.y - home(p.id).y) > 15
      const status = () => {
        bshare.frame = frame
        const sc = bowlingScore(rolls)
        env.status(`Frame ${Math.min(10, frame + 1)}/10 · Roll ${rollNo + 1} · ${sc.total}`)
        hud = [`FRAME ${Math.min(10, frame + 1)}/10`, `ROLL ${rollNo + 1}`, `SCORE ${sc.total}`]
        env.score(sc.total)
      }
      const resetBall = () => {
        bowl.x = 130
        bowl.y = LY
        bowl.vx = bowl.vy = 0
        bowl.out = false
        bowl.kind = 'ball'
      }
      const afterRoll = () => {
        const standing = pins.filter((p) => !knocked(p))
        const k = standingBefore - standing.length
        rolls.push(k)
        const clearAll = () => resetPins()
        const removeDown = () => {
          pins = pins.filter((p) => !knocked(p))
          for (const p of pins) {
            const h = home(p.id)
            p.x = h.x
            p.y = h.y
            p.vx = p.vy = 0
          }
        }
        let fresh = false
        if (frame < 9) {
          if (rollNo === 0 && k === 10) {
            frame++
            fresh = true
          } else if (rollNo === 0) {
            rollNo = 1
            removeDown()
          } else {
            frame++
            rollNo = 0
            fresh = true
          }
          if (rollNo === 0 && frame <= 9 && fresh) {
            clearAll()
            standingBefore = 10
          } else standingBefore = pins.length
          if (k === 10 && rollNo === 0) say('STRIKE!', 1.3)
          else if (frame > 0 && rollNo === 0 && rolls.length >= 2 && rolls[rolls.length - 2] + k === 10 && rolls[rolls.length - 2] !== 10) say('SPARE!', 1.2)
        } else {
          const first = rolls[rolls.length - rollNo - 1] ?? 0
          if (rollNo === 0) {
            rollNo = 1
            if (k === 10) {
              clearAll()
              standingBefore = 10
              say('STRIKE!', 1.3)
            } else {
              removeDown()
              standingBefore = pins.length
            }
          } else if (rollNo === 1) {
            if (first === 10) {
              rollNo = 2
              if (k === 10) {
                clearAll()
                standingBefore = 10
                say('STRIKE!', 1.3)
              } else {
                removeDown()
                standingBefore = pins.length
              }
            } else if (first + k === 10) {
              rollNo = 2
              clearAll()
              standingBefore = 10
              say('SPARE!', 1.2)
            } else {
              frame = 10
            }
          } else frame = 10
        }
        status()
        if (frame >= 10) {
          phase = 'over'
          const total = bowlingScore(rolls).total
          const won = total >= target
          const score = total * 10 + (won ? 300 * (1 + env.difficulty) : 0)
          env.score(score)
          finish(score, won, `Bowled ${total} (goal ${target})`)
        } else {
          phase = 'aim'
          resetBall()
        }
      }
      const gutter = (b: PBall) => Math.abs(b.y - LY) > LANE
      onPress = (p) => {
        if (ended || phase !== 'aim') return
        // touching the approach (left of the foul line) slides the ball sideways
        if (p.x < FOUL - 20 && Math.abs(p.y - bowl.y) > R * 1.6) {
          bowl.y = clamp(p.y, LY - LANE + R, LY + LANE - R)
          return
        }
        sling.start(p.x, p.y)
      }
      onRelease = () => {
        if (!sling.active) return
        sling.active = false
        if (phase !== 'aim') return
        const s = sling.get(MAXPULL)
        if (s.pull < 10) return
        // always roll forward (+x)
        const ang = clamp(Math.atan2(s.uy, Math.abs(s.ux) < 0.2 ? 0.2 : s.ux), -0.45, 0.45)
        const sp = 330 + s.power * 560
        bowl.vx = Math.cos(ang) * sp
        bowl.vy = Math.sin(ang) * sp
        ev.hits.length = 0
        phase = 'roll'
        rollT = 0
        standingBefore = pins.filter((p) => !knocked(p)).length
        env.sfx('shoot')
      }
      status()
      say('DRAG BACK AND RELEASE · TAP LEFT TO SLIDE', 2.2)
      modeUpdate = (dt) => {
        // pins that were hit while rolling fade
        if (phase === 'roll' || phase === 'settle') {
          rollT += dt
          const before = ev.hits.length
          const all = [bowl, ...pins]
          stepBalls(all, arena, dt, ev, (b) => b.down && b.kind === 'pin' && Math.hypot(b.vx, b.vy) < 1, (a, b) => (a.kind === 'ball' && gutter(a)) || (b.kind === 'ball' && gutter(b)) || a.down || b.down)
          for (let i = before; i < ev.hits.length; i++) {
            const h = ev.hits[i]
            if (h.speed > 70) {
              const hitPins = [h.a, h.b].filter((id) => id !== 100)
              for (const id of hitPins) {
                const p = pins.find((q) => q.id === id)
                if (p) p.down = true
              }
              env.sfx(h.speed > 250 ? 'hit' : 'click')
              if (h.speed > 250) shake.kick(2)
            }
          }
          for (const p of pins) {
            if (!p.down && gutter(p)) p.down = true
          }
          if (gutter(bowl) && bowl.kind === 'ball') {
            bowl.y = LY + Math.sign(bowl.y - LY) * (LANE + 20)
            bowl.vy = 0
            bowl.kind = 'gutter'
          }
          // ball gone past the deck
          if (bowl.x > 905) bowl.vx = 0
          if (phase === 'roll' && (bowl.x > 700 || rollT > 3.5)) phase = 'settle'
          if (phase === 'settle') {
            settleT += dt
            if ((!moving(all, 8) && settleT > 0.6) || settleT > 3.5) {
              settleT = 0
              for (const b of all) b.vx = b.vy = 0
              afterRoll()
            }
          }
        }
      }
      modeDraw = () => {
        // lane
        const g = ctx.createLinearGradient(0, LY - LANE, 0, LY + LANE)
        g.addColorStop(0, '#d8a860')
        g.addColorStop(0.5, '#e8c07a')
        g.addColorStop(1, '#d8a860')
        roundRect(ctx, 60, LY - 140, 880, 280, 10, '#1b1020')
        ctx.fillStyle = '#2b1a2f'
        ctx.fillRect(90, LY - 138, 830, 276)
        ctx.fillStyle = g
        ctx.fillRect(90, LY - LANE, 830, LANE * 2)
        ctx.strokeStyle = 'rgba(80,40,10,0.35)'
        ctx.lineWidth = 1
        for (let i = 1; i < 10; i++) {
          ctx.beginPath()
          ctx.moveTo(90, LY - LANE + i * (LANE / 5))
          ctx.lineTo(920, LY - LANE + i * (LANE / 5))
          ctx.stroke()
        }
        ctx.fillStyle = 'rgba(120,50,20,0.55)'
        for (let i = 0; i < 7; i++) {
          ctx.beginPath()
          ctx.moveTo(340 + i * 14, LY + (i - 3) * 22 - 7)
          ctx.lineTo(354 + i * 14, LY + (i - 3) * 22)
          ctx.lineTo(340 + i * 14, LY + (i - 3) * 22 + 7)
          ctx.fill()
        }
        ctx.fillStyle = t.accent
        ctx.fillRect(FOUL, LY - LANE, 4, LANE * 2)
        // pins
        for (const p of pins) {
          const away = p.down
          ctx.globalAlpha = away ? 0.55 : 1
          if (info.pin) emoji(ctx, info.pin, p.x, p.y - 2, 26, away ? p.x * 0.07 : 0)
          else {
            ctx.save()
            ctx.translate(p.x, p.y)
            if (away) ctx.rotate(p.x * 0.05 + p.id)
            ctx.fillStyle = 'rgba(0,0,0,0.25)'
            ctx.beginPath()
            ctx.ellipse(2, 3, 9, 9, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#fafafa'
            ctx.beginPath()
            ctx.arc(0, 0, 9, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = t.danger
            ctx.beginPath()
            ctx.arc(0, 0, 5.5, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#fafafa'
            ctx.beginPath()
            ctx.arc(0, 0, 2.6, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
          }
          ctx.globalAlpha = 1
        }
        // aim
        if (sling.active && phase === 'aim') {
          const s = sling.get(MAXPULL)
          if (s.pull >= 10) {
            const ang = clamp(Math.atan2(s.uy, Math.abs(s.ux) < 0.2 ? 0.2 : s.ux), -0.45, 0.45)
            const pts: { x: number; y: number }[] = []
            for (let i = 1; i < 14; i++) pts.push({ x: bowl.x + Math.cos(ang) * i * 42, y: bowl.y + Math.sin(ang) * i * 42 })
            dotted(pts)
            ctx.fillStyle = 'rgba(0,0,0,0.5)'
            ctx.fillRect(100, LY + 124, 140, 8)
            ctx.fillStyle = `hsl(${120 - s.power * 120} 85% 55%)`
            ctx.fillRect(100, LY + 124, 140 * s.power, 8)
          }
        }
        if (phase !== 'over') {
          const rotB = bowl.x * 0.05
          // black ball with hero face
          ctx.fillStyle = 'rgba(0,0,0,0.3)'
          ctx.beginPath()
          ctx.ellipse(bowl.x + 3, bowl.y + 5, R, R * 0.7, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#16161e'
          ctx.beginPath()
          ctx.arc(bowl.x, bowl.y, R, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = 'rgba(255,255,255,0.25)'
          ctx.beginPath()
          ctx.arc(bowl.x - 5, bowl.y - 5, 4, 0, Math.PI * 2)
          ctx.fill()
          emoji(ctx, t.hero, bowl.x, bowl.y, R * 1.4, rotB)
        }
      }
    }

    // ================================================================ CURLING
    const setupCurling = () => {
      const LY = 270
      const BUTTON = { x: 740, y: LY }
      const RINGS = [70, 48, 26, 9]
      const SR = 14
      const arena: Arena = { x: 60, y: LY - 100, w: 860, h: 200, pockets: [], wall: 1, e: 0.92, k: 0.4, c: 18, walls: false }
      const stones: PBall[] = []
      const ENDS = 3
      const PER = 4
      let end = 1
      let thrown = 0 // stones thrown this end (both teams)
      let score: [number, number] = [0, 0]
      let phase: 'aim' | 'slide' | 'wait' | 'over' = 'aim'
      let turn: 0 | 1 = 0
      let cur: PBall | null = null
      let aiPlan: { angle: number; speed: number; t: number } | null = null
      let aiWait = 0.9
      let nextAt = 0
      const ev: PEvents = { hits: [], cushions: 0, pocketed: [] }
      const MAXPULL = 140
      const startX = 120
      const hog = 380
      const stoneEmoji = (team: 0 | 1) => (team === 0 ? t.hero : foe2)
      const status = () => {
        env.status(`End ${end}/${ENDS} · ${score[0]}-${score[1]} · ${PER * 2 - thrown} stones left`)
        hud = [`END ${end}/${ENDS}`, `${two ? 'P1' : 'YOU'} ${score[0]} - ${score[1]} ${two ? 'P2' : 'CPU'}`, `LEFT ${PER * 2 - thrown}`]
        env.score(score[0] * 150)
      }
      const throwStone = (angle: number, speed: number) => {
        const s = mkBall(stones.length + 1, startX, LY, SR, 'stone', 0, 1, turn)
        s.vx = Math.cos(angle) * speed
        s.vy = Math.sin(angle) * speed
        s.fr = [0.4, 18]
        stones.push(s)
        cur = s
        phase = 'slide'
        thrown++
        env.sfx('shoot')
      }
      const scoreEnd = () => {
        const inHouse = stones.filter((s) => !s.out).map((s) => ({ team: s.team, d: Math.hypot(s.x - BUTTON.x, s.y - BUTTON.y) })).filter((s) => s.d < RINGS[0] + SR).sort((a, b) => a.d - b.d)
        if (!inHouse.length) {
          say('BLANK END', 1.5)
          return
        }
        const w = inHouse[0].team
        const oppBest = inHouse.find((s) => s.team !== w)?.d ?? Infinity
        const pts = inHouse.filter((s) => s.team === w && s.d < oppBest).length
        score[w] += pts
        say(`${w === 0 ? (two ? 'P1' : 'YOU') : two ? 'P2' : 'CPU'} +${pts}`, 1.6)
        env.sfx(w === 0 ? 'point' : 'hit')
      }
      const planAI = () => {
        const mine = stones.filter((s) => !s.out && s.team === 1)
        const theirs = stones.filter((s) => !s.out && s.team === 0 && Math.hypot(s.x - BUTTON.x, s.y - BUTTON.y) < RINGS[0] + SR)
        const err = byDiff(env, 0.05, 0.025, 0.01)
        const g = () => (rng() + rng() + rng() - 1.5) * 0.8
        const myBest = Math.min(...mine.map((s) => Math.hypot(s.x - BUTTON.x, s.y - BUTTON.y)), 999)
        const theirBest = Math.min(...theirs.map((s) => Math.hypot(s.x - BUTTON.x, s.y - BUTTON.y)), 999)
        let tx = BUTTON.x
        let ty = BUTTON.y
        let hitIt = false
        if (theirs.length && theirBest < myBest) {
          const tgt = theirs.sort((a, b) => Math.hypot(a.x - BUTTON.x, a.y - BUTTON.y) - Math.hypot(b.x - BUTTON.x, b.y - BUTTON.y))[0]
          tx = tgt.x
          ty = tgt.y
          hitIt = true
        } else if (rng() < 0.25 && !mine.length) {
          tx = BUTTON.x - 120
          ty = LY + rng.range(-30, 30)
        } else ty = LY + rng.range(-18, 18) - (myBest < 40 ? 24 : 0)
        const ang = Math.atan2(ty - LY, tx - startX)
        const dist = Math.hypot(tx - startX, ty - LY)
        const sp = hitIt ? Math.min(900, speedForDistance(dist + 120, 0.4, 18) * 1.05) : speedForDistance(dist + 6, 0.4, 18)
        aiPlan = { angle: ang + g() * err * 2, speed: sp * (1 + g() * err * 2), t: 0 }
      }
      onPress = (p) => {
        if (ended || phase !== 'aim' || (!two && turn === 1)) return
        sling.start(p.x, p.y)
      }
      onRelease = () => {
        if (!sling.active) return
        sling.active = false
        if (phase !== 'aim') return
        const s = sling.get(MAXPULL)
        if (s.pull < 10) return
        const ang = clamp(Math.atan2(s.uy, Math.max(0.15, s.ux)), -0.3, 0.3)
        throwStone(ang, 220 + s.power * 520)
      }
      status()
      say(two ? 'P1 vs P2 · DRAG BACK TO THROW · HOLD TO SWEEP' : 'DRAG BACK TO THROW · HOLD TO SWEEP', 2.4)
      modeUpdate = (dt) => {
        if (phase === 'over') return
        if (phase === 'aim' && !two && turn === 1) {
          aiWait -= dt
          if (aiWait <= 0 && !aiPlan) planAI()
          if (aiPlan) {
            aiPlan.t += dt
            if (aiPlan.t > 0.8) {
              const pl = aiPlan
              aiPlan = null
              throwStone(pl.angle, pl.speed)
            }
          }
        }
        if (phase === 'slide' || phase === 'wait') {
          const sweeping = (ptr.down || k.down('a') || k.down('b')) && cur && (turn === 0 || two) && cur.x < BUTTON.x + 30
          if (cur) cur.fr = sweeping ? [0.28, 8] : [0.4, 18]
          if (sweeping && cur && Math.random() < 0.6) fx.burst(cur.x - 10, cur.y + (Math.random() - 0.5) * 20, '#cdefff', 1, 60, 2)
          const before = ev.hits.length
          stepBalls(stones, arena, dt, ev)
          for (let i = before; i < ev.hits.length; i++) env.sfx(ev.hits[i].speed > 120 ? 'hit' : 'click')
          if (ev.hits.length > before) shake.kick(2)
          for (const s of stones) {
            if (s.out) continue
            if (Math.abs(s.y - LY) > 100 || s.x > 900 || s.x < 60 || (s.x > hog && s === cur && Math.hypot(s.vx, s.vy) < 6 && false)) {
              s.out = true
              fx.burst(s.x, s.y, '#fff', 8, 100, 2)
            }
          }
          if (cur && !cur.out && Math.hypot(cur.vx, cur.vy) < 6 && cur.x < hog) {
            cur.out = true
            say('HOG LINE', 0.9)
          }
          if (!moving(stones, 6)) {
            for (const s of stones) s.vx = s.vy = 0
            if (phase === 'slide') {
              phase = 'wait'
              nextAt = time + 0.5
            } else if (time >= nextAt) {
              cur = null
              if (thrown >= PER * 2) {
                scoreEnd()
                status()
                if (end >= ENDS) {
                  phase = 'over'
                  const won = score[0] > score[1]
                  const draw = score[0] === score[1]
                  const sc = score[0] * 150 + (won && !two ? 400 * (1 + env.difficulty) : 0)
                  env.score(sc)
                  finish(sc, two ? !draw : won, `${score[0]} - ${score[1]}${draw ? ' (tie)' : ''}`)
                } else {
                  phase = 'wait'
                  nextAt = time + 1.8
                  end++
                  thrown = 0
                  turn = end % 2 === 0 ? 1 : 0
                  const mark = nextAt
                  bag.timeout(() => {
                    if (ended || nextAt !== mark) return
                    stones.length = 0
                    phase = 'aim'
                    aiWait = 0.9
                    status()
                  }, 1800)
                }
              } else {
                turn = turn === 0 ? 1 : 0
                phase = 'aim'
                aiWait = 0.8
                status()
              }
            }
          }
        }
      }
      modeDraw = () => {
        roundRect(ctx, 40, LY - 120, 880, 240, 14, '#9fc8e8', '#365f85', 4)
        const g = ctx.createLinearGradient(0, LY - 100, 0, LY + 100)
        g.addColorStop(0, '#f2fbff')
        g.addColorStop(1, '#d4ecfb')
        ctx.fillStyle = g
        ctx.fillRect(60, LY - 100, 860, 200)
        ctx.strokeStyle = '#8fb7d6'
        ctx.lineWidth = 3
        for (const x of [startX - 40, hog, 900]) {
          ctx.beginPath()
          ctx.moveTo(x, LY - 100)
          ctx.lineTo(x, LY + 100)
          ctx.stroke()
        }
        ctx.beginPath()
        ctx.moveTo(60, LY)
        ctx.lineTo(920, LY)
        ctx.lineWidth = 1.5
        ctx.stroke()
        const cols = [t.accent2, '#f4f4f4', t.accent, '#f4f4f4']
        RINGS.forEach((r, i) => {
          ctx.fillStyle = cols[i]
          ctx.globalAlpha = 0.8
          ctx.beginPath()
          ctx.arc(BUTTON.x, BUTTON.y, r, 0, Math.PI * 2)
          ctx.fill()
        })
        ctx.globalAlpha = 1
        for (const s of stones) {
          if (s.out && !(s === cur)) continue
          const col = s.team === 0 ? t.accent : t.accent2
          ctx.fillStyle = 'rgba(0,0,0,0.25)'
          ctx.beginPath()
          ctx.arc(s.x + 2, s.y + 4, SR, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#9aa3ad'
          ctx.beginPath()
          ctx.arc(s.x, s.y, SR, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = col
          ctx.beginPath()
          ctx.arc(s.x, s.y, SR * 0.72, 0, Math.PI * 2)
          ctx.fill()
          emoji(ctx, stoneEmoji(s.team), s.x, s.y, SR * 1.1)
        }
        if (phase === 'aim' && (two || turn === 0)) {
          // stone in the hack
          ctx.fillStyle = '#9aa3ad'
          ctx.beginPath()
          ctx.arc(startX, LY, SR, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = turn === 0 ? t.accent : t.accent2
          ctx.beginPath()
          ctx.arc(startX, LY, SR * 0.72, 0, Math.PI * 2)
          ctx.fill()
          emoji(ctx, stoneEmoji(turn), startX, LY, SR * 1.1)
        }
        if (sling.active && phase === 'aim') {
          const s = sling.get(MAXPULL)
          if (s.pull >= 10) {
            const ang = clamp(Math.atan2(s.uy, Math.max(0.15, s.ux)), -0.3, 0.3)
            const sp = 220 + s.power * 520
            const pts: { x: number; y: number }[] = []
            const d = rollDistance(sp, 0.4, 18)
            for (let i = 1; i <= 16; i++) pts.push({ x: startX + Math.cos(ang) * (d * i) / 16, y: LY + Math.sin(ang) * (d * i) / 16 })
            dotted(pts)
          }
        }
        if (aiPlan) {
          const stoneX = startX
          ctx.fillStyle = t.accent2
          ctx.beginPath()
          ctx.arc(stoneX, LY, SR * 0.72, 0, Math.PI * 2)
          ctx.fill()
          emoji(ctx, foe2, stoneX, LY, SR * 1.1)
        }
        if ((phase === 'slide') && cur && (ptr.down || k.down('a'))) text(ctx, 'SWEEP!', cur.x, cur.y - 30, { size: 10, color: '#1e5a8a' })
      }
    }

    if (kind === 'golf') setupGolf()
    else if (kind === 'pool') setupPool()
    else if (kind === 'bowling') setupBowling()
    else setupCurling()

    const poll = () => {
      const d = ptr.down
      const g = toGame(ptr)
      if (d && !wasDown) onPress(g)
      else if (d && sling.active) sling.move(g.x, g.y)
      else if (!d && wasDown) {
        sling.move(lastG.x, lastG.y)
        onRelease(g)
      }
      if (d) lastG = g
      wasDown = d
    }

    const update = (dt: number) => {
      time += dt
      fx.update(dt, kind === 'golf' ? 0 : 0)
      shake.update(dt)
      bannerT = Math.max(0, bannerT - dt)
      poll()
      if (ended) {
        if (time > endAt && pendingEnd) {
          const e = pendingEnd
          pendingEnd = null
          env.end(e)
        }
      }
      modeUpdate(dt)
    }

    const draw = () => {
      background(ctx, SW, SH, t, 40, env.seed)
      ctx.save()
      if (rotate) {
        ctx.translate(0, SH)
        ctx.rotate(-Math.PI / 2)
      }
      if (TOPPAD) ctx.translate(0, TOPPAD)
      shake.apply(ctx)
      modeDraw()
      fx.draw(ctx)
      ctx.restore()
      // HUD
      if (hud.length) {
        const w = SW - 24
        roundRect(ctx, 12, 8, w, 28, 10, 'rgba(10,12,22,0.72)')
        const n = hud.length
        hud.forEach((s, i) => text(ctx, s, 12 + (w * (i + 0.5)) / n, 23, { size: portrait ? 9 : 11, color: '#fff' }))
      }
      if (kind === 'bowling') {
        const sc = bowlingScore(bowlingRolls())
        const bw = (SW - 24) / 10
        for (let i = 0; i < 10; i++) {
          const x = 12 + i * bw
          roundRect(ctx, x + 1, 42, bw - 2, 34, 4, 'rgba(10,12,22,0.72)', i === Math.min(9, frameNow()) ? t.accent : undefined, 2)
          text(ctx, sc.frames[i] === undefined || sc.frames[i] === null ? '' : String(sc.frames[i]), x + bw / 2, 66, { size: 9, color: '#fff' })
          text(ctx, rollMarks(i), x + bw / 2, 52, { size: 8, color: t.accent })
        }
      }
      if (bannerT > 0) text(ctx, banner, SW / 2, rotate ? SH / 2 - 20 : SH * 0.5, { size: portrait ? 13 : 18, color: t.accent, shadow: '#000' })
    }
    // helper accessors used by the bowling scoreboard
    const bowlingRolls = (): number[] => (kind === 'bowling' ? bshare.rolls : [])
    const frameNow = () => (kind === 'bowling' ? bshare.frame : 0)
    const rollMarks = (i: number) => {
      const r = bowlingRolls()
      let idx = 0
      for (let f = 0; f < i; f++) idx += r[idx] === 10 ? 1 : 2
      if (r[idx] === undefined) return ''
      if (i < 9) {
        if (r[idx] === 10) return 'X'
        if (r[idx + 1] === undefined) return String(r[idx])
        return r[idx] + r[idx + 1] === 10 ? `${r[idx]}/` : `${r[idx]}${r[idx + 1]}`
      }
      return r.slice(idx).map((x, j, a) => (x === 10 ? 'X' : j > 0 && a[j - 1] + x === 10 && a[j - 1] !== 10 ? '/' : String(x))).join('')
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
