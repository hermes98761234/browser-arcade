// Launcher: Angry-Birds-style slingshot levels with a small rigid-body sim, plus artillery duels (turn-based vs AI with wind)
// and hoop / bin throwing. Pull back anywhere and release (mouse or touch). Sub-mode comes from the name/description.
import { background, Bag, byDiff, clamp, createStage, emoji, loop, Particles, pointer, roundRect, Shake, text, type Engine, type GameEnv } from '../kit'
import { addProjectile, foesAlive, genLevel, settled, stepWorldL, trajectory, type Body, type WorldL } from '../logic/launcher'
import { aiAim, carve, CANNON_R, genTerrain, GRAV, surfaceY, type Terrain } from '../logic/launcherart'

type Kind = 'sling' | 'arty' | 'hoop'

function pickKind(env: GameEnv): { kind: Kind; tank: boolean; bin: boolean } {
  const k = `${env.name} ${env.desc}`.toLowerCase()
  if (/artillery|cannon|tank|siege|broadside|barrage|battery|steam tank/.test(k) && !/bowling|cannonball bowling|bubble|clear|burpee/.test(k)) return { kind: 'arty', tank: /tank|snowplow|mech/.test(k), bin: false }
  if (/basket|hoop|toss|flick|\bbin\b|dunk|chimney|paper|throw into|horseshoe|ring toss|anchor|lasso/.test(k) && !/catapult|tower/.test(k)) return { kind: 'hoop', tank: false, bin: /paper|bin|chimney|hat|trash|horseshoe|ring|anchor/.test(k) }
  return { kind: 'sling', tank: false, bin: false }
}

const engine: Engine = {
  start(env) {
    const info = pickKind(env)
    const kind = info.kind
    const hr = env.host.getBoundingClientRect()
    const portrait = hr.height > hr.width * 1.1
    const LW = portrait ? 480 : 800
    const LH = portrait ? 600 : 450
    const GROUND = LH - 52
    const st = createStage(env.host, LW, LH)
    const ctx = st.ctx
    const bag = new Bag()
    const ptr = pointer(st)
    const fx = new Particles()
    const shake = new Shake()
    const t = env.theme
    const rng = env.rng
    const foeList = t.foes.length ? t.foes : ['👾']
    let time = 0
    let ended = false
    let endAt = -1
    let pendingEnd: { score: number; won: boolean; text: string } | null = null
    let banner = ''
    let bannerT = 0
    let score = 0
    const say = (s: string, d = 1.5) => {
      banner = s
      bannerT = d
    }
    const addScore = (n: number) => {
      score += n
      env.score(score)
    }
    const finish = (won: boolean, txt: string) => {
      if (ended) return
      ended = true
      endAt = time + 1.5
      pendingEnd = { score, won, text: txt }
      env.sfx(won ? 'win' : 'lose')
    }
    // slingshot-style input (anywhere): edge detection by polling so touch works
    const sl = { active: false, ax: 0, ay: 0, cx: 0, cy: 0 }
    let wasDown = false
    let tapped = false
    let modeUpdate: (dt: number) => void = () => {}
    let modeDraw: () => void = () => {}
    let onRelease: (pull: { dx: number; dy: number; len: number }) => void = () => {}
    let canAim: () => boolean = () => false
    const MAXPULL = 105
    const pull = () => {
      const dx = sl.ax - sl.cx
      const dy = sl.ay - sl.cy
      const l = Math.hypot(dx, dy)
      const k = l > MAXPULL ? MAXPULL / l : 1
      return { dx: dx * k, dy: dy * k, len: Math.min(l, MAXPULL) }
    }
    const poll = () => {
      const d = ptr.down
      if (d && !wasDown) {
        tapped = true
        if (canAim()) {
          sl.active = true
          sl.ax = sl.cx = ptr.x
          sl.ay = sl.cy = ptr.y
        }
      } else if (d && sl.active) {
        sl.cx = ptr.x
        sl.cy = ptr.y
      } else if (!d && wasDown && sl.active) {
        sl.cx = ptr.x
        sl.cy = ptr.y
        sl.active = false
        const p = pull()
        if (p.len > 10) onRelease(p)
      }
      wasDown = d
    }
    const dots = (pts: { x: number; y: number }[]) => {
      ctx.fillStyle = '#fff'
      pts.forEach((p, i) => {
        ctx.globalAlpha = 0.9 * (1 - i / (pts.length + 3))
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3.4 - (i / pts.length) * 1.5, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
    }
    const drawGround = (col = '#4b8a3f') => {
      ctx.fillStyle = '#5a3d27'
      ctx.fillRect(0, GROUND, LW, LH - GROUND)
      ctx.fillStyle = col
      ctx.fillRect(0, GROUND, LW, 12)
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.fillRect(0, GROUND, LW, 3)
    }
    const hud = (parts: string[]) => {
      roundRect(ctx, 8, 6, LW - 16, 26, 9, 'rgba(10,12,22,0.7)')
      parts.forEach((s, i) => text(ctx, s, 8 + ((LW - 16) * (i + 0.5)) / parts.length, 20, { size: portrait ? 8 : 10, color: '#fff' }))
    }

    // ================================================================ SLINGSHOT
    const setupSling = () => {
      const LEVELS = 5
      let level = 1
      let lv = genLevel(rng, level, LW, GROUND, env.difficulty)
      let world: WorldL = lv.world
      let shots = lv.info.shots
      let proj: Body | null = null
      let shotT = 0
      let boosted = false
      let state: 'aim' | 'fly' | 'between' | 'done' = 'aim'
      let nextAt = 0
      const SLX = portrait ? 62 : 84
      const SLY = GROUND - 92
      const preview = byDiff(env, 30, 18, 9)
      const foeCount0 = () => foesAlive(world)
      let startFoes = foeCount0()
      let trail: { x: number; y: number; t: number }[] = []
      const status = () => env.status(`Level ${level}/${LEVELS} · Shots ${shots} · Targets ${foesAlive(world)}`)
      const newLevel = () => {
        lv = genLevel(rng, level, LW, GROUND, env.difficulty)
        world = lv.world
        shots = lv.info.shots
        proj = null
        state = 'aim'
        startFoes = foeCount0()
        trail = []
        status()
        say(`LEVEL ${level}`, 1.4)
      }
      canAim = () => state === 'aim' && !ended
      onRelease = (p) => {
        if (state !== 'aim') return
        const k = 7.4
        proj = addProjectile(world, SLX + 0, SLY + 0, 13, p.dx * k, p.dy * k, 4)
        proj.x = SLX - p.dx * 0.25
        proj.y = SLY - p.dy * 0.25
        shots--
        shotT = 0
        boosted = false
        state = 'fly'
        trail = []
        env.sfx('shoot')
        status()
      }
      status()
      say('LEVEL 1 · PULL BACK AND RELEASE', 2.2)
      const killFoes = () => {
        for (const b of world.bodies) {
          if (b.dead && !('counted' in b)) {
            ;(b as Body & { counted?: boolean }).counted = true
            if (b.foe) {
              addScore(500)
              fx.burst(b.x, b.y, t.accent, 22, 240, 4)
              fx.burst(b.x, b.y, '#fff', 8, 160, 3)
              env.sfx('point')
              shake.kick(4)
              status()
            } else {
              addScore(60)
              fx.burst(b.x, b.y, b.mat === 'glass' ? '#bfeaff' : b.mat === 'stone' ? '#9aa3ad' : '#c88a50', 10, 180, 3)
              env.sfx('hit')
            }
          }
        }
      }
      modeUpdate = (dt) => {
        if (state === 'between') {
          if (time >= nextAt) {
            if (foesAlive(world) === 0) {
              if (level >= LEVELS) {
                finish(true, `Cleared all ${LEVELS} levels`)
                state = 'done'
              } else {
                level++
                newLevel()
              }
            }
          }
        }
        if (state !== 'aim' && state !== 'done') {
          // fixed small steps for stable stacking
          let rem = dt
          while (rem > 0) {
            const h = Math.min(rem, 1 / 60)
            stepWorldL(world, h)
            rem -= h
          }
          for (const im of world.impacts) {
            if (im.power > 300 && Math.random() < 0.4) env.sfx('click')
          }
          killFoes()
          world.bodies = world.bodies.filter((b) => !b.dead)
        }
        if (state === 'fly') {
          shotT += dt
          if (tapped && !boosted && proj && !proj.dead && shotT > 0.15) {
            boosted = true
            proj.vx *= 1.5
            proj.vy *= 1.3
            fx.burst(proj.x, proj.y, '#fff', 12, 200, 3)
            env.sfx('power')
          }
          if (proj) {
            trail.push({ x: proj.x, y: proj.y, t: 0.5 })
            if (trail.length > 40) trail.shift()
          }
          const gone = !proj || proj.x > LW + 60 || proj.x < -60 || proj.y > LH + 80
          const still = proj ? Math.hypot(proj.vx, proj.vy) < 14 && proj.grounded : true
          if (shotT > 9 || gone || (shotT > 1.2 && still && settled(world))) {
            if (proj) {
              const i = world.bodies.indexOf(proj)
              if (i >= 0) world.bodies.splice(i, 1)
              proj = null
            }
            state = 'between'
            nextAt = time + 0.9
            if (foesAlive(world) === 0) {
              const bonus = shots * 1000
              if (bonus) addScore(bonus)
              say(shots > 0 ? `CLEARED! +${bonus}` : 'CLEARED!', 1.8)
              env.sfx('win')
              nextAt = time + 2
            } else if (shots <= 0) {
              // wait for things to settle then fail
              finish(false, `Level ${level}: ${foesAlive(world)} of ${startFoes} targets left`)
              state = 'done'
            } else {
              state = 'aim'
              status()
            }
          }
        }
        for (const q of trail) q.t -= dt
        trail = trail.filter((q) => q.t > 0)
      }
      modeDraw = () => {
        // distant hills
        ctx.fillStyle = 'rgba(0,0,0,0.12)'
        ctx.beginPath()
        ctx.moveTo(0, GROUND)
        for (let x = 0; x <= LW; x += 20) ctx.lineTo(x, GROUND - 40 - Math.sin(x * 0.012 + 1) * 26 - Math.sin(x * 0.03) * 10)
        ctx.lineTo(LW, GROUND)
        ctx.fill()
        drawGround()
        // blocks
        for (const b of world.bodies) {
          if (b.foe || b.mat === 'proj') continue
          const col = b.mat === 'wood' ? '#c28a52' : b.mat === 'stone' ? '#8c94a1' : 'rgba(176,232,255,0.6)'
          const dmg = 1 - b.hp / b.maxHp
          ctx.save()
          ctx.translate(b.x, b.y)
          if (b.flash > 0) ctx.globalAlpha = 0.7
          roundRect(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 3, col, 'rgba(0,0,0,0.45)', 1.5)
          ctx.fillStyle = 'rgba(255,255,255,0.22)'
          ctx.fillRect(-b.w / 2 + 2, -b.h / 2 + 2, b.w - 4, Math.min(3, b.h))
          if (b.mat === 'wood') {
            ctx.strokeStyle = 'rgba(80,45,15,0.35)'
            ctx.lineWidth = 1
            ctx.beginPath()
            if (b.w > b.h) {
              ctx.moveTo(-b.w / 2 + 4, 0)
              ctx.lineTo(b.w / 2 - 4, 0)
            } else {
              ctx.moveTo(0, -b.h / 2 + 4)
              ctx.lineTo(0, b.h / 2 - 4)
            }
            ctx.stroke()
          }
          if (dmg > 0.4) {
            ctx.strokeStyle = 'rgba(0,0,0,0.55)'
            ctx.beginPath()
            ctx.moveTo(-b.w * 0.3, -b.h * 0.3)
            ctx.lineTo(0, 0)
            ctx.lineTo(b.w * 0.25, b.h * 0.3)
            ctx.stroke()
          }
          ctx.restore()
        }
        for (const b of world.bodies) {
          if (!b.foe) continue
          if (b.flash > 0) ctx.globalAlpha = 0.6
          emoji(ctx, foeList[b.skin % foeList.length], b.x, b.y, b.r * 2.5)
          ctx.globalAlpha = 1
          if (b.hp < b.maxHp) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)'
            ctx.fillRect(b.x - 14, b.y - b.r - 10, 28, 4)
            ctx.fillStyle = t.danger
            ctx.fillRect(b.x - 14, b.y - b.r - 10, 28 * Math.max(0, b.hp / b.maxHp), 4)
          }
        }
        // slingshot
        const pl = sl.active ? pull() : null
        const bx = pl ? SLX - pl.dx * 0.55 : SLX
        const by = pl ? SLY - pl.dy * 0.55 : SLY
        ctx.strokeStyle = '#5b3a1f'
        ctx.lineWidth = 9
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(SLX, GROUND)
        ctx.lineTo(SLX, SLY + 30)
        ctx.moveTo(SLX, SLY + 30)
        ctx.lineTo(SLX - 14, SLY - 6)
        ctx.moveTo(SLX, SLY + 30)
        ctx.lineTo(SLX + 14, SLY - 6)
        ctx.stroke()
        if (pl && state === 'aim') {
          ctx.strokeStyle = '#2b1a0c'
          ctx.lineWidth = 5
          ctx.beginPath()
          ctx.moveTo(SLX - 14, SLY - 6)
          ctx.lineTo(bx, by)
          ctx.lineTo(SLX + 14, SLY - 6)
          ctx.stroke()
          const k = 7.4
          dots(trajectory(bx, by, pl.dx * k, pl.dy * k, world.gravity, GROUND, preview))
        }
        for (const q of trail) {
          ctx.globalAlpha = Math.max(0, q.t)
          ctx.fillStyle = '#fff'
          ctx.beginPath()
          ctx.arc(q.x, q.y, 3, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
        if (state === 'aim' && shots > 0) emoji(ctx, t.hero, bx, by, 34)
        if (proj) emoji(ctx, t.hero, proj.x, proj.y, 34, time * 6)
        // queue of waiting shots
        for (let i = 0; i < shots - (state === 'aim' ? 1 : 0); i++) emoji(ctx, t.hero, 24 + i * 26, GROUND + 28, 24)
        hud([`LEVEL ${level}/${LEVELS}`, `SHOTS ${shots}`, `SCORE ${score}`])
        if (state === 'fly' && !boosted) text(ctx, 'TAP TO BOOST', LW / 2, GROUND + 30, { size: 9, color: 'rgba(255,255,255,0.7)' })
      }
    }

    // ================================================================ ARTILLERY
    const setupArty = () => {
      const terrain: Terrain = genTerrain(rng, LW, LH, [portrait ? 52 : 70, LW - (portrait ? 52 : 70)])
      const px = [portrait ? 52 : 70, LW - (portrait ? 52 : 70)]
      const cannons = px.map((x, i) => ({ x, y: surfaceY(terrain, x) - 12, hp: 100, ang: i === 0 ? 0.8 : 0.8, rec: 0, vy: 0 }))
      let turn: 0 | 1 = 0
      let phase: 'aim' | 'fly' | 'boom' | 'ai' | 'over' = 'aim'
      let shell: { x: number; y: number; vx: number; vy: number; from: 0 | 1; t: number } | null = null
      let wind = rng.range(-50, 50)
      let aiPlan: { angle: number; speed: number; t: number } | null = null
      let wait = 0
      let turns = 0
      let boom: { x: number; y: number; t: number } | null = null
      const maxTurns = 16
      let dmgDealt = 0
      const muzzle = (i: number) => ({ x: cannons[i].x, y: cannons[i].y - 14 })
      const status = () => env.status(`Turn ${Math.floor(turns / 2) + 1} · You ${Math.ceil(cannons[0].hp)} - ${Math.ceil(cannons[1].hp)} Foe`)
      const fire = (i: 0 | 1, ang: number, speed: number) => {
        const m = muzzle(i)
        const dir = i === 0 ? 1 : -1
        shell = { x: m.x + Math.cos(ang) * 24 * dir, y: m.y - Math.sin(ang) * 24, vx: Math.cos(ang) * speed * dir, vy: -Math.sin(ang) * speed, from: i, t: 0 }
        cannons[i].rec = 1
        cannons[i].ang = ang
        phase = 'fly'
        env.sfx('shoot')
        shake.kick(3)
        fx.burst(m.x + Math.cos(ang) * 26 * dir, m.y - Math.sin(ang) * 26, '#ffd28a', 10, 140, 3)
      }
      canAim = () => phase === 'aim' && !ended && turn === 0
      onRelease = (p) => {
        if (phase !== 'aim' || turn !== 0) return
        const ang = clamp(Math.atan2(-p.dy, Math.abs(p.dx) < 4 ? 4 : Math.abs(p.dx)), 0.1, 1.5)
        fire(0, ang, 140 + (p.len / MAXPULL) * 760)
      }
      const explode = (x: number, y: number, direct: number) => {
        const R = 36
        carve(terrain, x, y, R)
        boom = { x, y, t: 0 }
        fx.burst(x, y, '#ffb347', 34, 280, 5)
        fx.burst(x, y, '#555', 18, 180, 5)
        shake.kick(8)
        env.sfx('boom')
        for (const [i, c] of cannons.entries()) {
          const d = Math.hypot(c.x - x, c.y - y)
          let dmg = 0
          if (d < R + CANNON_R) dmg = 34 * (1 - d / (R + CANNON_R)) + 6
          if (direct === i) dmg = Math.max(dmg, 38)
          if (dmg > 0) {
            c.hp = Math.max(0, c.hp - dmg)
            if (i === 1) {
              dmgDealt += dmg
              addScore(Math.round(dmg * 10))
            }
            fx.burst(c.x, c.y - 10, t.danger, 12, 160, 3)
          }
        }
        phase = 'boom'
        wait = 1
        status()
      }
      const settleCannons = (dt: number) => {
        for (const c of cannons) {
          const sy = surfaceY(terrain, c.x) - 12
          if (c.y < sy - 0.5) {
            c.vy += 600 * dt
            c.y = Math.min(sy, c.y + c.vy * dt)
          } else {
            c.y = sy
            c.vy = 0
          }
        }
      }
      status()
      say(info.tank ? 'TANK DUEL · PULL BACK TO FIRE' : 'ARTILLERY DUEL · PULL BACK TO FIRE', 2.2)
      modeUpdate = (dt) => {
        settleCannons(dt)
        for (const c of cannons) c.rec = Math.max(0, c.rec - dt * 3)
        if (boom) {
          boom.t += dt
          if (boom.t > 0.6) boom = null
        }
        if (phase === 'fly' && shell) {
          let rem = dt
          while (rem > 0 && shell) {
            const h = Math.min(rem, 1 / 120)
            rem -= h
            shell.vx += wind * h
            shell.vy += GRAV * h
            shell.x += shell.vx * h
            shell.y += shell.vy * h
            shell.t += h
            if (shell.x < -30 || shell.x > LW + 30 || shell.y > LH + 40) {
              shell = null
              phase = 'boom'
              wait = 0.6
              say('MISS', 0.8)
              break
            }
            let hit = -1
            for (const [i, c] of cannons.entries()) {
              if (i === shell.from && shell.t < 0.3) continue
              if (Math.hypot(shell.x - c.x, shell.y - c.y) < CANNON_R) hit = i
            }
            if (hit >= 0 || (shell.x >= 0 && shell.y >= surfaceY(terrain, shell.x))) {
              const s = shell
              shell = null
              explode(s.x, hit >= 0 ? s.y : Math.min(s.y, surfaceY(terrain, s.x)), hit)
            }
          }
        } else if (phase === 'boom') {
          wait -= dt
          if (wait <= 0) {
            if (cannons[0].hp <= 0 || cannons[1].hp <= 0 || turns >= maxTurns) {
              phase = 'over'
              const won = cannons[1].hp < cannons[0].hp
              const sc = score + (won ? 600 * (1 + env.difficulty) : 0)
              score = sc
              env.score(sc)
              finish(won, cannons[1].hp <= 0 ? 'Enemy destroyed' : cannons[0].hp <= 0 ? 'Your cannon was destroyed' : won ? 'Won on health' : 'Out of turns')
              return
            }
            turns++
            turn = turn === 0 ? 1 : 0
            wind = clamp(wind + rng.range(-25, 25), -90, 90)
            if (turn === 1) {
              phase = 'ai'
              wait = 1
              aiPlan = null
            } else phase = 'aim'
            status()
          }
        } else if (phase === 'ai') {
          wait -= dt
          if (wait <= 0 && !aiPlan) {
            const a = aiAim(terrain, cannons, 1, wind, env.difficulty, rng)
            aiPlan = { angle: a.angle, speed: a.speed, t: 0 }
          }
          if (aiPlan) {
            aiPlan.t += dt
            cannons[1].ang = aiPlan.angle * Math.min(1, aiPlan.t / 0.7) + 0.8 * (1 - Math.min(1, aiPlan.t / 0.7))
            if (aiPlan.t > 0.9) {
              const p = aiPlan
              aiPlan = null
              fire(1, p.angle, p.speed)
            }
          }
        }
      }
      modeDraw = () => {
        // terrain polygon
        const earth = ctx.createLinearGradient(0, LH * 0.5, 0, LH)
        earth.addColorStop(0, '#7a5a3a')
        earth.addColorStop(1, '#3d2a1a')
        ctx.fillStyle = earth
        ctx.beginPath()
        ctx.moveTo(0, LH)
        for (let i = 0; i < terrain.y.length; i++) ctx.lineTo(i * terrain.col, terrain.y[i])
        ctx.lineTo(LW, LH)
        ctx.fill()
        ctx.strokeStyle = '#59a34a'
        ctx.lineWidth = 5
        ctx.lineJoin = 'round'
        ctx.beginPath()
        for (let i = 0; i < terrain.y.length; i++) {
          if (i === 0) ctx.moveTo(0, terrain.y[0])
          else ctx.lineTo(i * terrain.col, terrain.y[i])
        }
        ctx.stroke()
        // cannons
        for (const [i, c] of cannons.entries()) {
          if (c.hp <= 0 && !(boom && boom.t < 0.5)) {
            emoji(ctx, '💥', c.x, c.y - 6, 40)
            continue
          }
          const dir = i === 0 ? 1 : -1
          let ang = c.ang
          if (i === 0 && sl.active && phase === 'aim') {
            const p = pull()
            ang = clamp(Math.atan2(-p.dy, Math.abs(p.dx) < 4 ? 4 : Math.abs(p.dx)), 0.1, 1.5)
            c.ang = ang
          }
          const m = muzzle(i)
          const col = i === 0 ? t.accent : t.accent2
          // barrel
          ctx.save()
          ctx.translate(m.x, m.y)
          const a2 = dir > 0 ? -ang : -Math.PI + ang
          ctx.rotate(a2)
          ctx.fillStyle = '#2b2f3a'
          ctx.fillRect(-4 - c.rec * 6, -5, 30 - c.rec * 4, 10)
          ctx.fillStyle = col
          ctx.fillRect(22 - c.rec * 4, -6, 6, 12)
          ctx.restore()
          // body
          if (info.tank) {
            roundRect(ctx, c.x - 22, c.y - 6, 44, 14, 6, '#3a3f4b')
            roundRect(ctx, c.x - 17, c.y - 14, 34, 12, 6, col)
            ctx.fillStyle = '#222'
            for (let k = -1; k <= 1; k++) {
              ctx.beginPath()
              ctx.arc(c.x + k * 13, c.y + 5, 5, 0, Math.PI * 2)
              ctx.fill()
            }
          } else {
            roundRect(ctx, c.x - 16, c.y - 10, 32, 14, 6, col)
            ctx.fillStyle = '#2b2f3a'
            ctx.beginPath()
            ctx.arc(c.x, c.y + 6, 10, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#9aa3ad'
            ctx.beginPath()
            ctx.arc(c.x, c.y + 6, 4, 0, Math.PI * 2)
            ctx.fill()
          }
          emoji(ctx, i === 0 ? t.hero : foeList[0], c.x, c.y - 26, 30)
          // hp bar
          roundRect(ctx, c.x - 24, c.y - 52, 48, 7, 3, 'rgba(0,0,0,0.6)')
          roundRect(ctx, c.x - 24, c.y - 52, 48 * (c.hp / 100), 7, 3, c.hp > 35 ? t.good : t.danger)
        }
        // aim preview
        if (sl.active && phase === 'aim') {
          const p = pull()
          const ang = clamp(Math.atan2(-p.dy, Math.abs(p.dx) < 4 ? 4 : Math.abs(p.dx)), 0.1, 1.5)
          const sp = 140 + (p.len / MAXPULL) * 760
          const m = muzzle(0)
          const maxT = byDiff(env, 1.3, 0.7, 0.25)
          const pts: { x: number; y: number }[] = []
          let sx = m.x + Math.cos(ang) * 24
          let sy = m.y - Math.sin(ang) * 24
          let vx = Math.cos(ang) * sp
          let vy = -Math.sin(ang) * sp
          for (let tt = 0; tt < maxT; tt += 1 / 30) {
            vx += wind / 30
            vy += GRAV / 30
            sx += vx / 30
            sy += vy / 30
            pts.push({ x: sx, y: sy })
          }
          dots(pts)
          // power bar
          roundRect(ctx, m.x - 30, m.y + 40, 60, 8, 3, 'rgba(0,0,0,0.5)')
          roundRect(ctx, m.x - 30, m.y + 40, 60 * (p.len / MAXPULL), 8, 3, `hsl(${120 - (p.len / MAXPULL) * 120} 85% 55%)`)
        }
        if (shell) {
          ctx.fillStyle = '#222'
          ctx.beginPath()
          ctx.arc(shell.x, shell.y, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#ffd28a'
          ctx.beginPath()
          ctx.arc(shell.x - shell.vx * 0.012, shell.y - shell.vy * 0.012, 3, 0, Math.PI * 2)
          ctx.fill()
        }
        if (boom) {
          ctx.globalAlpha = Math.max(0, 1 - boom.t / 0.5)
          ctx.fillStyle = '#ffcf5a'
          ctx.beginPath()
          ctx.arc(boom.x, boom.y, 16 + boom.t * 90, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        }
        // wind indicator
        roundRect(ctx, LW / 2 - 70, 38, 140, 24, 8, 'rgba(10,12,22,0.7)')
        text(ctx, `WIND ${wind > 0 ? '>' : '<'} ${Math.abs(Math.round(wind))}`, LW / 2, 51, { size: 9, color: '#fff' })
        const ax = LW / 2 + (wind / 90) * 60
        ctx.strokeStyle = t.accent
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(LW / 2, 62)
        ctx.lineTo(ax, 62)
        ctx.stroke()
        hud([`YOU ${Math.ceil(cannons[0].hp)}`, turn === 0 ? 'YOUR SHOT' : 'ENEMY SHOT', `FOE ${Math.ceil(cannons[1].hp)}`])
        void dmgDealt
      }
    }

    // ================================================================ HOOP
    const setupHoop = () => {
      const bin = info.bin
      const goal = byDiff(env, 6, 8, 10)
      let timeLeft = byDiff(env, 80, 60, 45)
      let baskets = 0
      let streak = 0
      let best = 0
      let ball: { x: number; y: number; vx: number; vy: number; r: number; rot: number; live: boolean; rimTouch: boolean; t: number; scored: boolean } | null = null
      const startX = portrait ? 64 : 96
      const startY = GROUND - 70
      let hoop = { x: LW * 0.72, y: GROUND - 190, hw: 36, phase: 0, move: 0 }
      let wall: { x: number; y: number; w: number; h: number } | null = null
      const place = () => {
        const n = baskets
        hoop.x = LW * rng.range(0.58, 0.88)
        hoop.y = GROUND - rng.range(130, portrait ? 230 : 250)
        hoop.move = n >= 4 ? Math.min(60, 15 + n * 5) : 0
        hoop.phase = rng.range(0, 6)
        wall = n >= 7 ? { x: (startX + hoop.x) / 2, y: 0, w: 14, h: rng.range(70, 120) } : null
      }
      place()
      const MAXV = 1000
      canAim = () => !ended && !ball
      const status = () => env.status(`Baskets ${baskets}/${goal} · ${Math.ceil(timeLeft)}s · streak ${streak}`)
      onRelease = (p) => {
        if (ball) return
        const k = MAXV / MAXPULL
        ball = { x: startX, y: startY, vx: p.dx * k, vy: p.dy * k, r: 13, rot: 0, live: true, rimTouch: false, t: 0, scored: false }
        env.sfx('shoot')
      }
      status()
      say(bin ? 'TOSS IT IN THE BIN · PULL BACK' : 'SINK THE HOOP · PULL BACK AND RELEASE', 2.2)
      const rimBounce = (b: NonNullable<typeof ball>, rx: number, ry: number) => {
        const dx = b.x - rx
        const dy = b.y - ry
        const d = Math.hypot(dx, dy)
        const min = b.r + 4
        if (d >= min || d === 0) return
        const nx = dx / d
        const ny = dy / d
        b.x = rx + nx * min
        b.y = ry + ny * min
        const vn = b.vx * nx + b.vy * ny
        if (vn < 0) {
          b.vx -= 1.55 * vn * nx
          b.vy -= 1.55 * vn * ny
          b.rimTouch = true
          env.sfx('click')
        }
      }
      modeUpdate = (dt) => {
        if (!ended) {
          timeLeft -= dt
          if (Math.ceil(timeLeft) !== Math.ceil(timeLeft + dt)) status()
          if (timeLeft <= 0) {
            timeLeft = 0
            const won = baskets >= goal
            const sc = score + (won ? 400 * (1 + env.difficulty) : 0)
            score = sc
            env.score(sc)
            finish(won, `${baskets} baskets (goal ${goal}), best streak ${best}`)
          }
        }
        if (hoop.move) hoop.y += Math.cos(time * 1.3 + hoop.phase) * hoop.move * dt
        if (ball) {
          const b = ball
          b.t += dt
          let rem = dt
          while (rem > 0) {
            const h = Math.min(rem, 1 / 120)
            rem -= h
            const prevY = b.y
            b.vy += 1000 * h
            b.x += b.vx * h
            b.y += b.vy * h
            b.rot += b.vx * h * 0.02
            if (b.y > GROUND - b.r) {
              b.y = GROUND - b.r
              b.vy = -b.vy * 0.55
              b.vx *= 0.85
              if (Math.abs(b.vy) > 80) env.sfx('click')
              else b.vy = 0
            }
            if (b.x < b.r) {
              b.x = b.r
              b.vx = Math.abs(b.vx) * 0.6
            }
            if (!bin) {
              // backboard on the right of the hoop
              const bx = hoop.x + hoop.hw + 6
              if (b.x + b.r > bx && b.x - b.r < bx + 8 && b.y > hoop.y - 78 && b.y < hoop.y + 12) {
                b.x = bx - b.r
                b.vx = -Math.abs(b.vx) * 0.55
                env.sfx('click')
              }
              rimBounce(b, hoop.x - hoop.hw, hoop.y)
              rimBounce(b, hoop.x + hoop.hw, hoop.y)
            } else {
              // bin walls
              for (const sx of [hoop.x - hoop.hw, hoop.x + hoop.hw]) {
                if (Math.abs(b.x - sx) < b.r + 4 && b.y > hoop.y && b.y < hoop.y + 70) {
                  b.x = sx + Math.sign(b.x - sx || 1) * (b.r + 4)
                  b.vx = -b.vx * 0.4
                }
              }
              if (b.y > hoop.y + 52 && b.x > hoop.x - hoop.hw && b.x < hoop.x + hoop.hw) {
                b.y = hoop.y + 52
                b.vy = -Math.abs(b.vy) * 0.3
              }
              rimBounce(b, hoop.x - hoop.hw, hoop.y)
              rimBounce(b, hoop.x + hoop.hw, hoop.y)
            }
            if (wall) {
              const w = wall
              if (b.x + b.r > w.x - w.w / 2 && b.x - b.r < w.x + w.w / 2 && b.y + b.r > GROUND - w.h) {
                if (b.y < GROUND - w.h + b.r && b.vy > 0) {
                  b.y = GROUND - w.h - b.r
                  b.vy = -b.vy * 0.4
                } else {
                  b.x = b.x < w.x ? w.x - w.w / 2 - b.r : w.x + w.w / 2 + b.r
                  b.vx = -b.vx * 0.5
                }
                env.sfx('click')
              }
            }
            // scoring: passes down through the rim opening
            if (!b.scored && prevY < hoop.y && b.y >= hoop.y && b.vy > 0 && Math.abs(b.x - hoop.x) < hoop.hw - 5) {
              b.scored = true
              baskets++
              streak++
              best = Math.max(best, streak)
              const swish = !b.rimTouch
              const pts = 100 + (streak - 1) * 50 + (swish ? 50 : 0)
              addScore(pts)
              timeLeft += 3
              fx.burst(hoop.x, hoop.y + 10, t.good, 24, 240, 4)
              fx.burst(hoop.x, hoop.y + 10, '#fff', 10, 160, 3)
              say(swish ? `SWISH! +${pts}` : `+${pts}`, 1)
              env.sfx('point')
              shake.kick(3)
              status()
            }
          }
          const out = b.x > LW + 40 || b.t > 6 || (b.t > 1 && Math.abs(b.vx) < 6 && b.y >= GROUND - b.r - 1)
          if (out) {
            if (!b.scored) {
              streak = 0
              status()
            }
            ball = null
            if (b.scored || baskets >= 0) place()
          }
        }
      }
      modeDraw = () => {
        // court floor
        drawGround('#c98f4f')
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.fillRect(startX - 36, GROUND, 72, 4)
        if (wall) {
          roundRect(ctx, wall.x - wall.w / 2, GROUND - wall.h + 0, wall.w, wall.h, 4, '#7d8a99', 'rgba(0,0,0,0.4)', 2)
        }
        // hoop / bin
        if (!bin) {
          // pole + backboard
          ctx.fillStyle = '#9aa3ad'
          ctx.fillRect(hoop.x + hoop.hw + 18, hoop.y - 70, 6, GROUND - hoop.y + 70)
          roundRect(ctx, hoop.x + hoop.hw + 6, hoop.y - 78, 10, 90, 3, '#f4f4f4', '#999', 2)
          ctx.strokeStyle = 'rgba(255,255,255,0.65)'
          ctx.lineWidth = 2
          for (let i = 0; i <= 5; i++) {
            ctx.beginPath()
            ctx.moveTo(hoop.x - hoop.hw + (i * 2 * hoop.hw) / 5, hoop.y + 2)
            ctx.lineTo(hoop.x - hoop.hw * 0.6 + (i * 1.2 * hoop.hw) / 5, hoop.y + 40)
            ctx.stroke()
          }
          ctx.strokeStyle = t.danger
          ctx.lineWidth = 6
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(hoop.x - hoop.hw, hoop.y)
          ctx.lineTo(hoop.x + hoop.hw, hoop.y)
          ctx.stroke()
        } else {
          ctx.fillStyle = '#6b7685'
          ctx.beginPath()
          ctx.moveTo(hoop.x - hoop.hw, hoop.y)
          ctx.lineTo(hoop.x + hoop.hw, hoop.y)
          ctx.lineTo(hoop.x + hoop.hw - 8, hoop.y + 56)
          ctx.lineTo(hoop.x - hoop.hw + 8, hoop.y + 56)
          ctx.fill()
          ctx.strokeStyle = t.accent
          ctx.lineWidth = 5
          ctx.beginPath()
          ctx.moveTo(hoop.x - hoop.hw, hoop.y)
          ctx.lineTo(hoop.x + hoop.hw, hoop.y)
          ctx.stroke()
          ctx.fillStyle = 'rgba(0,0,0,0.3)'
          for (let i = 0; i < 4; i++) ctx.fillRect(hoop.x - hoop.hw + 14 + i * 14, hoop.y + 8, 3, 40)
        }
        // aim preview
        if (sl.active && !ball) {
          const p = pull()
          const k = MAXV / MAXPULL
          dots(trajectory(startX, startY, p.dx * k, p.dy * k, 1000, GROUND, byDiff(env, 26, 14, 7), 1 / 30))
          roundRect(ctx, startX - 30, GROUND + 14, 60, 8, 3, 'rgba(0,0,0,0.5)')
          roundRect(ctx, startX - 30, GROUND + 14, 60 * (p.len / MAXPULL), 8, 3, `hsl(${120 - (p.len / MAXPULL) * 120} 85% 55%)`)
        }
        if (ball) {
          ctx.fillStyle = 'rgba(0,0,0,0.25)'
          ctx.beginPath()
          ctx.ellipse(ball.x, GROUND + 4, ball.r, 4, 0, 0, Math.PI * 2)
          ctx.fill()
          emoji(ctx, t.hero, ball.x, ball.y, ball.r * 2.5, ball.rot)
        } else emoji(ctx, t.hero, startX, startY, 34)
        hud([`${baskets}/${goal} BASKETS`, `${Math.ceil(timeLeft)}s`, `SCORE ${score}`])
        if (streak >= 2) text(ctx, `STREAK x${streak}`, LW / 2, 56, { size: 10, color: '#ffe066', shadow: '#000' })
      }
    }

    if (kind === 'sling') setupSling()
    else if (kind === 'arty') setupArty()
    else setupHoop()

    const update = (dt: number) => {
      time += dt
      fx.update(dt, 500)
      shake.update(dt)
      bannerT = Math.max(0, bannerT - dt)
      poll()
      if (ended && time > endAt && pendingEnd) {
        const e = pendingEnd
        pendingEnd = null
        env.end(e)
      }
      modeUpdate(dt)
      tapped = false
    }
    const draw = () => {
      background(ctx, LW, LH, t, 25, env.seed)
      ctx.save()
      shake.apply(ctx)
      modeDraw()
      fx.draw(ctx)
      ctx.restore()
      if (bannerT > 0) text(ctx, banner, LW / 2, LH * 0.3, { size: portrait ? 12 : 18, color: '#fff', shadow: t.accent })
    }
    const lp = loop(update, draw)
    return {
      pause: (p) => lp.pause(p),
      destroy() {
        lp.stop()
        ptr.dispose()
        bag.dispose()
        st.dispose()
      },
    }
  },
}
export default engine
