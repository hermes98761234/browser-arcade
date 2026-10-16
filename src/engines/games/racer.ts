// Racer: OutRun-style pseudo-3D road racer (curves, hills, rivals, checkpoints, nitro) and a top-down drift kart mode.
// Mode is picked from the name/description: kart / top-down / drift / tabletop / formula / oval / lawn → top-down circuit.
// "highway / traffic / lanes / dodge / endless" → traffic dodging with no laps. Two players: local split-screen top-down kart race (WASD vs arrows).
import { background, Bag, byDiff, clamp, createStage, emoji, isTouch, keys, loop, Particles, pointer, Shake, text, vpad, type Engine } from '../kit'
import { buildRoad, buildTopTrack, SEG } from '../logic/racer'

const hex = (c: string): [number, number, number] => {
  const h = c.replace('#', '')
  const f = h.length === 3 ? h.split('').map((x) => x + x).join('') : h
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)]
}
const mix = (a: string, b: string, p: number) => {
  const x = hex(a)
  const y = hex(b)
  return `rgb(${Math.round(x[0] + (y[0] - x[0]) * p)},${Math.round(x[1] + (y[1] - x[1]) * p)},${Math.round(x[2] + (y[2] - x[2]) * p)})`
}
const ord = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`

interface Spr { e: string; off: number; size: number; coin: boolean; got: boolean }
interface Rival { z: number; off: number; speed: number; skill: number; color: string; passed: boolean; spin: number; tx: number; t: number }

const engine: Engine = {
  start(env) {
    const { theme: t, rng, mods } = env
    const r0 = env.host.getBoundingClientRect()
    const asp = r0.width / Math.max(1, r0.height)
    const H = 450
    const W = asp > 0 && r0.height > 50 ? clamp(Math.round(H * asp), 320, 800) : 800
    const narrow = W < 600
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const two = env.players === 2
    const k = keys({ twoPlayer: two })
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const ptr = pointer(st)
    const blurb = `${env.name} ${env.desc}`.toLowerCase()
    const sprintMode = mods.has('swim') || /swim|slurp|noodle|snail mail|tandem|pedal|sprint/.test(blurb)
    const topdown = two || /top-down|topdown|kart|drift|tabletop|micro machines|formula|oval|lawn|mower|ghost lap|ram racer|bike|bumper/.test(blurb)
    const traffic = !topdown && (mods.has('endless') || /highway|traffic|lanes|dodge|wrecks|warrior/.test(blurb))
    const dark = mods.has('dark') || /night|ghost|haunt/.test(blurb)
    const wind = mods.has('wind')
    const ram = mods.has('melee') || /ram|crash|derby|warrior|bumper|crush|monster truck|battle/.test(blurb)
    const zen = mods.has('zen')
    const auto = isTouch()
    const speedMul = mods.has('fast') ? 1.15 : mods.has('slow') ? 0.88 : 1
    const dispVpad = vpad(env.host, k, 'lr', topdown ? [{ action: 'b', label: '🌀' }, { action: 'down', label: '🛑' }] : [{ action: 'a', label: '⚡' }, { action: 'down', label: '🛑' }])
    const rivalColors = [...t.blocks, t.accent, t.accent2, t.danger]

    let time = 0
    let over = false
    let score = 0
    let countdown = 3.2
    let hint = 5

    const finish = (won: boolean, msg: string) => {
      if (over) return
      over = true
      env.sfx(won ? 'win' : 'lose')
      env.end({ score: Math.round(score), won, text: msg })
    }

    // ======================================================== pseudo-3D road
    const road = () => {
      const N = byDiff(env, 1500, 1800, 2000)
      const laps = traffic ? 999 : byDiff(env, 2, 3, 3)
      const R = buildRoad(rng, { segments: N, curvy: byDiff(env, 0.6, 1, 1.3), hilly: byDiff(env, 0.35, 0.55, 0.7) })
      const L = N * SEG
      const roadWidth = 2000
      const cameraHeight = 1000
      const cameraDepth = 1 / Math.tan((100 / 2) * (Math.PI / 180))
      const DRAW = 110
      const maxSpeed0 = 12000 * speedMul
      const horizon = H * 0.45
      const nRivals = traffic ? 16 : byDiff(env, 5, 7, 9)
      const cps = [Math.floor(N / 3), Math.floor((2 * N) / 3), 2]
      const cpBonus = byDiff(env, 24, 20, 17)
      let timeLeft = zen ? 999 : byDiff(env, 48, 42, 38)

      // roadside scenery and coin lines
      const sprites: Spr[][] = Array.from({ length: N }, () => [])
      for (let i = 8; i < N; i += 2) {
        if (rng.chance(0.5)) {
          const side = rng.chance(0.5) ? 1 : -1
          sprites[i].push({ e: rng.pick(t.items), off: side * rng.range(1.35, 3.4), size: rng.range(0.7, 1.4), coin: false, got: false })
        }
      }
      for (let i = 60; i < N - 20; i += rng.int(30, 55)) {
        const off = rng.range(-0.7, 0.7)
        const e = rng.pick(t.items)
        for (let j = 0; j < 5; j++) sprites[i + j * 2].push({ e, off, size: 0.5, coin: true, got: false })
      }
      // rivals
      const rivals: Rival[] = Array.from({ length: nRivals }, (_, i) => {
        const skill = traffic ? rng.range(0.22, 0.5) : byDiff(env, 0.5, 0.58, 0.66) + rng.range(0, 0.26)
        const lane = [-0.6, 0, 0.6][i % 3]
        return { z: traffic ? rng.range(2500, L * 0.9) : SEG * (8 + Math.floor(i / 3) * 7), off: lane, speed: maxSpeed0 * skill * 0.6, skill, color: rivalColors[i % rivalColors.length], passed: false, spin: 0, tx: lane, t: rng.range(0, 6) }
      })
      for (const rv of rivals) rv.passed = rv.z < 0

      let pos = 0
      let lap = 0
      let speed = 0
      let px = 0
      let nitro = 0.4
      let boostT = 0
      let banner = ''
      let bannerT = 0
      let nextCp = 0
      let passes = 0
      let bgOff = 0
      let finishT = 0
      let place = nRivals + 1
      const lay = [0, 1].map(() => ({ ph: rng.range(0, 6), f: rng.range(2, 5) }))
      const blds = Array.from({ length: 30 }, () => ({ w: rng.int(30, 80), h: rng.range(40, 150) }))
      const city = ['neon', 'cyberpunk', 'robot', 'steampunk', 'space', 'retro', 'hero', 'wasteland', 'gems', 'school'].includes(t.id)

      const grass0 = mix(t.bg2, t.good, 0.5)
      const GRASS = [mix(grass0, '#000000', 0.22), mix(grass0, '#000000', 0.38)]
      const ROAD = ['#4a4a56', '#41414c']
      const RUMBLE = [t.danger, '#f5f5f5']
      const fog = t.bg2

      const segAt = (z: number) => Math.floor(z / SEG) % N
      const yAt = (z: number) => {
        const i = segAt(z)
        const p = (z % SEG) / SEG
        return R.y[i] + (R.y[(i + 1) % N] - R.y[i]) * p
      }

      // preallocated projection buffers
      const A = { x1: new Float64Array(DRAW), y1: new Float64Array(DRAW), w1: new Float64Array(DRAW), s1: new Float64Array(DRAW), x2: new Float64Array(DRAW), y2: new Float64Array(DRAW), w2: new Float64Array(DRAW), s2: new Float64Array(DRAW), clip: new Float64Array(DRAW), vis: new Uint8Array(DRAW) }
      const poly = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, c: string) => {
        ctx.fillStyle = c
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.lineTo(x4, y4)
        ctx.closePath()
        ctx.fill()
      }

      const carBack = (cx: number, by: number, w: number, color: string, brake: boolean, hero: boolean, tilt = 0) => {
        if (w < 3) return
        const h = w * 0.62
        ctx.save()
        ctx.translate(cx, by)
        ctx.rotate(tilt)
        ctx.fillStyle = 'rgba(0,0,0,.35)'
        ctx.beginPath()
        ctx.ellipse(0, 0, w * 0.58, w * 0.1, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#111'
        ctx.fillRect(-w * 0.5, -h * 0.28, w * 0.16, h * 0.3)
        ctx.fillRect(w * 0.34, -h * 0.28, w * 0.16, h * 0.3)
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(-w * 0.46, -h * 0.85, w * 0.92, h * 0.65, w * 0.1)
        ctx.fill()
        ctx.fillStyle = 'rgba(0,0,0,.28)'
        ctx.beginPath()
        ctx.roundRect(-w * 0.34, -h * 1.05, w * 0.68, h * 0.4, w * 0.1)
        ctx.fill()
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(-w * 0.38, -h * 1.12, w * 0.76, h * 0.2, w * 0.08)
        ctx.fill()
        ctx.fillStyle = brake ? '#ff3030' : '#a01818'
        ctx.shadowColor = '#ff3030'
        ctx.shadowBlur = brake ? w * 0.25 : w * 0.08
        ctx.fillRect(-w * 0.44, -h * 0.55, w * 0.2, h * 0.14)
        ctx.fillRect(w * 0.24, -h * 0.55, w * 0.2, h * 0.14)
        ctx.shadowBlur = 0
        ctx.fillStyle = 'rgba(255,255,255,.18)'
        ctx.fillRect(-w * 0.44, -h * 0.82, w * 0.88, h * 0.05)
        if (hero) emoji(ctx, t.hero, 0, -h * 1.12, w * 0.4)
        ctx.restore()
      }

      const update = (dt: number) => {
        time += dt
        hint = Math.max(0, hint - dt)
        bannerT = Math.max(0, bannerT - dt)
        fx.update(dt, 300)
        shake.update(dt)
        if (over) return
        if (countdown > 0) {
          const prev = Math.ceil(countdown)
          countdown -= dt
          if (Math.ceil(countdown) !== prev) env.sfx(countdown <= 0 ? 'power' : 'click')
          return
        }
        if (finishT > 0) {
          finishT -= dt
          speed = Math.max(0, speed - maxSpeed0 * 0.25 * dt)
          pos += speed * dt
          if (finishT <= 0) {
            const won = place <= byDiff(env, 4, 3, 3)
            score += (nRivals + 1 - place) * 300
            finish(won, `Finished ${ord(place)} of ${nRivals + 1}`)
          }
          return
        }
        const maxSpeed = boostT > 0 ? maxSpeed0 * 1.28 : maxSpeed0
        const accel = (maxSpeed0 / 5) * (boostT > 0 ? 2.2 : 1)
        const speedPct = speed / maxSpeed0
        boostT = Math.max(0, boostT - dt)
        if (k.hit('a') && nitro > 0.25 && boostT <= 0) {
          boostT = 2.2
          nitro = Math.max(0, nitro - 0.5)
          env.sfx('power')
          shake.kick(4)
        }
        const left = k.down('left') || (ptr.down && ptr.x < W * 0.4 && !auto)
        const right = k.down('right') || (ptr.down && ptr.x > W * 0.6 && !auto)
        const gas = k.down('up') || auto
        const brake = k.down('down')
        const steer = (right ? 1 : 0) - (left ? 1 : 0)
        const dx = dt * 2.1 * speedPct
        const seg = segAt(pos + 800)
        px += steer * dx
        px -= dx * speedPct * R.curve[seg] * 0.32
        if (wind) px += Math.sin(time * 0.6) * 0.35 * dt * (0.3 + speedPct)
        if (brake) speed = Math.max(0, speed - maxSpeed0 * 1.0 * dt)
        else if (gas) speed = Math.min(maxSpeed, speed + accel * dt)
        else speed = Math.max(0, speed - (maxSpeed0 / 5) * dt)
        if (speed > maxSpeed) speed -= maxSpeed0 * 0.5 * dt
        if ((px < -1 || px > 1) && speed > maxSpeed0 / 4) {
          speed = Math.max(maxSpeed0 / 4, speed - (maxSpeed0 / 2) * dt)
          if (Math.random() < 0.5) fx.burst(W / 2 + (px > 0 ? 40 : -40), H - 50, GRASS[0], 1, 90, 3)
        }
        // scenery collision
        const sgi = segAt(pos + 840)
        for (const s of sprites[sgi]) {
          if (s.coin) {
            if (!s.got && Math.abs(px - s.off) < 0.3) {
              s.got = true
              score += 25
              nitro = Math.min(1, nitro + 0.04)
              env.sfx('point')
              fx.burst(W / 2 + (s.off - px) * 120, H - 120, t.accent2, 8, 150, 3)
            }
          } else if (Math.abs(px - s.off) < 0.26 * s.size + 0.15 && speed > maxSpeed0 * 0.2) {
            speed = maxSpeed0 * 0.12
            shake.kick(9)
            env.sfx('hit')
            fx.burst(W / 2, H - 100, t.fg, 22, 260, 4)
            px += px > s.off ? 0.35 : -0.35
          }
        }
        px = clamp(px, -2.4, 2.4)
        const prevPos = pos
        pos += speed * dt
        const dist = speed * dt
        score += dist / 600
        nitro = Math.min(1, nitro + dt * 0.02 * (speed > maxSpeed0 * 0.7 && Math.abs(px) < 1 ? 1 : 0))
        // rivals
        for (const rv of rivals) {
          rv.t += dt
          const total = lap * L + pos
          const rubber = clamp(1 + (total - rv.z) / (L * 0.9), 0.94, 1.1)
          const target = rv.skill * maxSpeed0 * (traffic ? 1 : rubber)
          rv.spin = Math.max(0, rv.spin - dt)
          const sp = rv.spin > 0 ? rv.speed * 0.4 : target
          rv.speed += (sp - rv.speed) * Math.min(1, dt * 1.5)
          rv.z += rv.speed * dt
          // lane keeping + avoidance of the nearest car ahead
          let want = rv.tx
          if (rv.t > 1.5 + (rv.skill * 10) % 2) {
            rv.t = 0
            rv.tx = clamp(rv.tx + rng.pick([-0.6, 0, 0.6]), -0.8, 0.8)
            want = rv.tx
          }
          const ahead = ((total - rv.z) % L + L) % L
          if (!traffic && ahead > L - SEG * 9 && Math.abs(px - rv.off) < 0.45) want = rv.off + (px < rv.off ? 0.6 : -0.6)
          for (const o of rivals) {
            if (o === rv) continue
            const d = o.z - rv.z
            if (d > 0 && d < SEG * 7 && Math.abs(o.off - rv.off) < 0.4) want = rv.off + (o.off > rv.off ? -0.6 : 0.6)
          }
          want = clamp(want, -0.85, 0.85)
          rv.off += clamp(want - rv.off, -dt * 0.7, dt * 0.7)
        }
        // car collisions & passing
        const total = lap * L + pos
        for (const rv of rivals) {
          const dz = rv.z - total
          // rivals live in unwrapped space; compare modulo the lap length for traffic mode
          const dzw = traffic ? ((dz % L) + L + L / 2) % L - L / 2 : dz
          if (Math.abs(dzw) < SEG * 1.1 && Math.abs(rv.off - px) < 0.34) {
            if (speed > rv.speed || ram) {
              if (ram && speed > rv.speed * 1.05 && rv.spin <= 0) {
                rv.spin = 2
                score += 150
                banner = 'RAMMED! +150'
                bannerT = 1
                fx.burst(W / 2 + (rv.off - px) * 180, H - 120, t.accent, 20, 260, 4)
              }
              speed = Math.max(0, Math.min(speed, rv.speed * (ram ? 0.8 : 0.55)))
              shake.kick(8)
              env.sfx('hit')
              px += px > rv.off ? 0.1 : -0.1
              rv.off += px > rv.off ? -0.1 : 0.1
            }
          }
          const was = rv.passed
          rv.passed = dzw < 0
          if (!was && rv.passed && Math.abs(dzw) < SEG * 20) {
            passes++
            score += 100
            env.sfx('move')
          } else if (was && !rv.passed && Math.abs(dzw) < SEG * 20) passes = Math.max(0, passes - 1)
        }
        place = 1 + rivals.filter((rv) => rv.z > total).length
        // checkpoints and laps
        if (pos < prevPos) {
          lap++
          nextCp = 0
          if (!traffic && lap >= laps) {
            finishT = 2.2
            banner = 'FINISH!'
            bannerT = 3
            env.sfx('win')
          } else if (!zen) {
            timeLeft += cpBonus
            banner = traffic ? `+${cpBonus}s` : `LAP ${lap + 1}/${laps}  +${cpBonus}s`
            bannerT = 2
            env.sfx('power')
          }
        } else if (nextCp < 2 && pos / SEG >= cps[nextCp]) {
          nextCp++
          if (!zen) {
            timeLeft += cpBonus
            banner = `CHECKPOINT +${cpBonus}s`
            bannerT = 1.8
            env.sfx('power')
          }
        }
        if (!zen) {
          timeLeft -= dt
          if (timeLeft <= 0 && finishT <= 0) {
            score += lap * 500
            finish(traffic && passes >= 20, traffic ? `${passes} cars passed, ${Math.round((lap * L + pos) / 1000)} km` : `Out of time on lap ${lap + 1}, ${ord(place)} place`)
          }
        }
        bgOff += R.curve[segAt(pos)] * speedPct * dt * 40
        env.score(Math.round(score))
        env.status(traffic ? `${Math.ceil(timeLeft)}s · passed ${passes}` : `Lap ${Math.min(lap + 1, laps)}/${laps} · ${ord(place)}/${nRivals + 1}${zen ? '' : ` · ${Math.ceil(timeLeft)}s`}`)
      }

      const drawSky = () => {
        background(ctx, W, horizon + 4, t, 30, env.seed)
        ctx.fillStyle = t.accent2
        ctx.globalAlpha = 0.25
        ctx.beginPath()
        ctx.arc(W * 0.7 - bgOff * 0.2, horizon - 70, 38, 0, Math.PI * 2)
        ctx.fill()
        for (const [i, l] of lay.entries()) {
          ctx.globalAlpha = 0.28 + i * 0.1
          ctx.fillStyle = i ? t.accent : t.accent2
          const off = bgOff * (i + 1) * 0.6
          if (city) {
            for (let x = -(((off % 900) + 900) % 900), j = i * 5; x < W; j++) {
              const b = blds[j % blds.length]
              ctx.fillRect(x, horizon - b.h * (1 - i * 0.35), b.w, b.h + 10)
              x += b.w + 4
            }
          } else {
            ctx.beginPath()
            ctx.moveTo(0, horizon + 2)
            for (let x = 0; x <= W; x += 16) ctx.lineTo(x, horizon - 30 - 34 * (0.6 + 0.4 * Math.sin(((x + off) / 120) * l.f * 0.5 + l.ph)) - i * 10)
            ctx.lineTo(W, horizon + 2)
            ctx.fill()
          }
        }
        ctx.globalAlpha = 1
      }

      const draw = () => {
        ctx.save()
        shake.apply(ctx)
        drawSky()
        const baseI = Math.floor(pos / SEG)
        const basePct = (pos % SEG) / SEG
        const pY = yAt(pos + 840)
        const camY = pY + cameraHeight + Math.sin(time * 40) * (speed / maxSpeed0) * 6
        let xAcc = 0
        let dxAcc = -(R.curve[baseI % N] * basePct)
        let maxy = H
        const camX = px * roadWidth
        const nVis = Math.min(DRAW, N - 1)
        ctx.fillStyle = GRASS[0]
        ctx.fillRect(0, horizon, W, H - horizon)
        for (let n = 0; n < nVis; n++) {
          const gi = baseI + n
          const i = gi % N
          const y1w = R.y[i]
          const y2w = R.y[(i + 1) % N]
          const z1 = gi * SEG - pos
          const z2 = (gi + 1) * SEG - pos
          const c1x = camX - xAcc
          const c2x = camX - xAcc - dxAcc
          xAcc += dxAcc
          dxAcc += R.curve[i]
          A.vis[n] = 0
          if (z1 <= cameraDepth) {
            A.clip[n] = maxy
            continue
          }
          const s1 = cameraDepth / z1
          const s2 = cameraDepth / z2
          const X1 = Math.round(W / 2 - s1 * c1x * (W / 2))
          const X2 = Math.round(W / 2 - s2 * c2x * (W / 2))
          const Y1 = Math.round(horizon - s1 * (y1w - camY) * (H / 2))
          const Y2 = Math.round(horizon - s2 * (y2w - camY) * (H / 2))
          const W1 = Math.round(s1 * roadWidth * (W / 2))
          const W2 = Math.round(s2 * roadWidth * (W / 2))
          A.x1[n] = X1; A.y1[n] = Y1; A.w1[n] = W1; A.s1[n] = s1
          A.x2[n] = X2; A.y2[n] = Y2; A.w2[n] = W2; A.s2[n] = s2
          A.clip[n] = maxy
          if (Y2 >= Y1 || Y2 >= maxy) continue
          A.vis[n] = 1
          const alt = Math.floor(gi / 3) % 2
          const startLine = i < 3
          const cpLine = i === cps[0] || i === cps[1]
          ctx.fillStyle = GRASS[alt]
          ctx.fillRect(0, Y2, W, Y1 - Y2)
          const r1 = W1 / 6
          const r2 = W2 / 6
          poly(X1 - W1 - r1, Y1, X1 - W1, Y1, X2 - W2, Y2, X2 - W2 - r2, Y2, RUMBLE[alt])
          poly(X1 + W1 + r1, Y1, X1 + W1, Y1, X2 + W2, Y2, X2 + W2 + r2, Y2, RUMBLE[alt])
          const rc = startLine ? (i % 2 ? '#111' : '#f5f5f5') : cpLine ? t.accent : ROAD[alt]
          poly(X1 - W1, Y1, X1 + W1, Y1, X2 + W2, Y2, X2 - W2, Y2, rc)
          if (!alt && !startLine) {
            const l1 = W1 / 32
            const l2 = W2 / 32
            for (let ln = 1; ln < 3; ln++) {
              const f = -1 + (ln * 2) / 3
              poly(X1 + W1 * f - l1 / 2, Y1, X1 + W1 * f + l1 / 2, Y1, X2 + W2 * f + l2 / 2, Y2, X2 + W2 * f - l2 / 2, Y2, 'rgba(255,255,255,.7)')
            }
          }
          maxy = Y1
        }
        // fog toward the horizon
        const fg = ctx.createLinearGradient(0, horizon, 0, horizon + (H - horizon) * 0.55)
        fg.addColorStop(0, fog)
        fg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.globalAlpha = 0.85
        ctx.fillStyle = fg
        ctx.fillRect(0, horizon - 1, W, (H - horizon) * 0.55 + 1)
        ctx.globalAlpha = 1
        // sprites back to front
        const byseg = new Map<number, Rival[]>()
        const total = lap * L + pos
        for (const rv of rivals) {
          const rel = traffic ? (((rv.z - total) % L) + L) % L : rv.z - total
          const gi = baseI + Math.floor((rel + basePct * SEG) / SEG)
          if (rel < 0 || gi - baseI >= nVis) continue
          const arr = byseg.get(gi - baseI)
          if (arr) arr.push(rv)
          else byseg.set(gi - baseI, [rv])
        }
        for (let n = nVis - 1; n >= 0; n--) {
          const i = (baseI + n) % N
          if (!A.s1[n]) continue
          const clipY = A.clip[n]
          for (const s of sprites[i]) {
            if (s.coin && s.got) continue
            const sc = A.s1[n]
            const sx = A.x1[n] + sc * s.off * roadWidth * (W / 2)
            const sy = A.y1[n]
            const size = Math.min(s.coin ? A.w1[n] * 0.16 : A.w1[n] * 0.3 * s.size, s.coin ? 40 : 110)
            if (size < 2 || sy < horizon - 2) continue
            ctx.save()
            if (sy > clipY) {
              ctx.beginPath()
              ctx.rect(0, 0, W, clipY)
              ctx.clip()
            }
            if (s.coin) {
              ctx.shadowColor = t.accent2
              ctx.shadowBlur = 8
              emoji(ctx, s.e, sx, sy - size * (1.2 + Math.sin(time * 6 + i) * 0.1), size)
              ctx.shadowBlur = 0
            } else emoji(ctx, s.e, sx, sy - size * 0.6, size * 1.2)
            ctx.restore()
          }
          const cs = byseg.get(n)
          if (cs) {
            for (const rv of cs) {
              const rel = traffic ? (((rv.z - total) % L) + L) % L : rv.z - total
              const pct = ((rel + basePct * SEG) % SEG) / SEG
              const sx0 = A.x1[n] + (A.x2[n] - A.x1[n]) * pct
              const sy = A.y1[n] + (A.y2[n] - A.y1[n]) * pct
              const w = A.w1[n] + (A.w2[n] - A.w1[n]) * pct
              const cx = sx0 + w * rv.off
              const cw = w * 0.2
              ctx.save()
              if (sy > clipY) {
                ctx.beginPath()
                ctx.rect(0, 0, W, clipY)
                ctx.clip()
              }
              carBack(cx, sy, cw, rv.color, rv.speed < rv.skill * maxSpeed0 * 0.8, false, rv.spin > 0 ? Math.sin(time * 18) * 0.5 : 0)
              ctx.restore()
            }
          }
        }
        // player car (scaled with the road width at the player's depth)
        const pw = (cameraDepth / (cameraHeight * cameraDepth)) * roadWidth * (W / 2)
        const bounce = (Math.random() - 0.5) * 2.4 * (speed / maxSpeed0)
        const steerTilt = ((k.down('right') ? 1 : 0) - (k.down('left') ? 1 : 0)) * 0.06 * Math.min(1, speed / maxSpeed0 * 2)
        carBack(W / 2, H - 14 + bounce, pw * 0.19, t.accent, k.down('down'), true, steerTilt)
        if (boostT > 0) {
          for (let i = 0; i < 2; i++) {
            ctx.fillStyle = i ? '#fde047' : '#fb923c'
            ctx.globalAlpha = 0.8
            ctx.beginPath()
            ctx.moveTo(W / 2 - pw * 0.075 + i * 6, H - 14)
            ctx.lineTo(W / 2 - pw * 0.05, H + 24 + Math.random() * 18)
            ctx.lineTo(W / 2 - pw * 0.025 - i * 6, H - 14)
            ctx.fill()
            ctx.beginPath()
            ctx.moveTo(W / 2 + pw * 0.025 + i * 6, H - 14)
            ctx.lineTo(W / 2 + pw * 0.05, H + 24 + Math.random() * 18)
            ctx.lineTo(W / 2 + pw * 0.075 - i * 6, H - 14)
            ctx.fill()
          }
          ctx.globalAlpha = 1
        }
        fx.draw(ctx)
        // speed lines
        if (speed > maxSpeed0 * 0.8 || boostT > 0) {
          ctx.strokeStyle = '#fff'
          ctx.globalAlpha = boostT > 0 ? 0.35 : 0.15
          ctx.lineWidth = 2
          for (let i = 0; i < 14; i++) {
            const a = (i / 14) * Math.PI * 2 + time
            const r1 = 120 + ((time * 600 + i * 97) % 320)
            ctx.beginPath()
            ctx.moveTo(W / 2 + Math.cos(a) * r1, horizon + 40 + Math.sin(a) * r1 * 0.5)
            ctx.lineTo(W / 2 + Math.cos(a) * (r1 + 40), horizon + 40 + Math.sin(a) * (r1 + 40) * 0.5)
            ctx.stroke()
          }
          ctx.globalAlpha = 1
        }
        ctx.restore()
        if (dark) {
          const g = ctx.createRadialGradient(W / 2, H * 0.78, 30, W / 2, H * 0.62, W * 0.6)
          g.addColorStop(0, 'rgba(0,0,0,0)')
          g.addColorStop(1, 'rgba(0,0,0,0.88)')
          ctx.fillStyle = g
          ctx.fillRect(0, 0, W, H)
        }
        // HUD
        const kmh = Math.round((speed / maxSpeed0) * 280)
        text(ctx, `${kmh}`, W - 14, H - 54, { size: narrow ? 20 : 26, color: boostT > 0 ? '#fde047' : t.fg, align: 'right', shadow: '#000' })
        text(ctx, 'KM/H', W - 14, H - 30, { size: 9, color: t.fg, align: 'right' })
        if (!zen) text(ctx, `${Math.max(0, Math.ceil(timeLeft))}`, W / 2, 28, { size: narrow ? 26 : 34, color: timeLeft < 10 ? t.danger : t.fg, shadow: '#000' })
        text(ctx, traffic ? `${passes} PASSED` : `${ord(place)}`, 14, 24, { size: narrow ? 14 : 20, color: t.accent2, align: 'left', shadow: '#000' })
        if (!traffic) text(ctx, `LAP ${Math.min(lap + 1, laps)}/${laps}`, 14, 50, { size: 10, color: t.fg, align: 'left' })
        // nitro bar
        ctx.fillStyle = 'rgba(0,0,0,.5)'
        ctx.fillRect(14, H - 28, 110, 10)
        ctx.fillStyle = nitro > 0.25 ? '#fb923c' : '#78716c'
        ctx.fillRect(14, H - 28, 110 * nitro, 10)
        text(ctx, auto ? '⚡' : 'SPACE', 130, H - 23, { size: 9, color: t.fg, align: 'left' })
        if (bannerT > 0) text(ctx, banner, W / 2, 90, { size: narrow ? 14 : 20, color: t.accent2, shadow: t.accent })
        if (countdown > 0) {
          const c = Math.ceil(countdown - 0.2)
          text(ctx, c > 0 ? `${c}` : 'GO!', W / 2, H * 0.35, { size: 64, color: c > 0 ? t.fg : t.good, shadow: t.accent })
        }
        if (hint > 0 && countdown <= 0.5) {
          ctx.globalAlpha = Math.min(1, hint)
          text(ctx, auto ? (narrow ? '◀ ▶ STEER · ⚡ NITRO' : 'HOLD ◀ ▶ TO STEER · ⚡ NITRO · 🛑 BRAKE') : '←/→ STEER · ↑ GAS · ↓ BRAKE · SPACE NITRO', W / 2, H * 0.58, { size: narrow ? 8 : 11, color: t.fg, shadow: '#000' })
          ctx.globalAlpha = 1
        }
      }
      return { update, draw }
    }

    // ======================================================== top-down kart circuit
    const top = () => {
      const hw = 64
      const track = buildTopTrack(rng, { radius: 700, wobble: byDiff(env, 0.28, 0.38, 0.46), hw })
      const P = track.pts
      const n = P.length
      const laps = byDiff(env, 2, 3, 3)
      // local two-player split-screen: fewer AI karts, two human karts (WASD vs arrows)
      const nH = two ? 2 : 1
      const nRivals = two ? byDiff(env, 2, 4, 4) : byDiff(env, 5, 6, 7)
      const maxV = 330 * speedMul
      const dir = (i: number) => {
        const a = P[(i + n) % n]
        const b = P[(i + 1 + n) % n]
        return Math.atan2(b.y - a.y, b.x - a.x)
      }
      interface Kart { x: number; y: number; vx: number; vy: number; a: number; idx: number; lap: number; color: string; ai: boolean; skill: number; lane: number; boost: number; drift: number; charge: number; steer: number; off: boolean; fin: number }
      interface Pl { kt: Kart; lapsDone: number; lapT: number; bestLap: number; zoom: number; place: number; score: number }
      const mk = (slot: number, ai: boolean, color: string): Kart => {
        const row = Math.floor(slot / 2)
        const i0 = -3 - row * 3
        const p = P[(i0 + n) % n]
        const a = dir(i0)
        const side = slot % 2 ? 1 : -1
        return { x: p.x - Math.sin(a) * side * 26, y: p.y + Math.cos(a) * side * 26, vx: 0, vy: 0, a, idx: (i0 + n) % n, lap: row ? 0 : 0, color, ai, skill: ai ? byDiff(env, 0.72, 0.8, 0.88) + rng.range(-0.05, 0.1) : 1, lane: rng.range(-0.45, 0.45), boost: 0, drift: 0, charge: 0, steer: 0, off: false, fin: 0 }
      }
      const karts: Kart[] = [mk(nRivals, false, t.accent), ...(two ? [mk(nRivals + 1, false, t.accent2)] : []), ...Array.from({ length: nRivals }, (_, i) => mk(i, true, rivalColors[i % rivalColors.length]))]
      for (const kk of karts) kk.lap = kk.idx > n / 2 ? -1 : 0
      const pls: Pl[] = karts.slice(0, nH).map((kt) => ({ kt, lapsDone: 0, lapT: 0, bestLap: 1e9, zoom: 1, place: karts.length, score: 0 }))
      // pickups and boost pads
      const pickups = Array.from({ length: 24 }, (_, i) => {
        const idx = Math.floor((i / 24) * n)
        const p = P[idx]
        const a = dir(idx)
        const o = rng.range(-0.55, 0.55) * hw
        return { x: p.x - Math.sin(a) * o, y: p.y + Math.cos(a) * o, e: rng.pick(t.items), got: 0 }
      })
      const pads = Array.from({ length: 6 }, (_, i) => ({ idx: Math.floor(((i + 0.5) / 6) * n) + 4 }))
      const totalProg = (kk: Kart) => kk.lap * n + kk.idx
      let banner = ''
      let bannerT = 0
      let finishT = 0
      let winner = 0
      // ghost: the fastest lap so far is replayed as a translucent kart (Ghost Lap, Ghost Race Daily)
      const ghostOn = !two && /ghost/.test(blurb)
      let rec: number[] = []
      let bestRec: number[] = []
      let recT = 0
      const sampleBg = Array.from({ length: 60 }, () => ({ x: rng.range(-1800, 1800), y: rng.range(-1400, 1400), e: rng.pick(t.items), s: rng.range(18, 34) }))
      // viewports: side by side on wide screens, stacked on portrait
      const views = two
        ? narrow
          ? [{ x: 0, y: 0, w: W, h: H / 2 }, { x: 0, y: H / 2, w: W, h: H / 2 }]
          : [{ x: 0, y: 0, w: W / 2, h: H }, { x: W / 2, y: 0, w: W / 2, h: H }]
        : [{ x: 0, y: 0, w: W, h: H }]

      const nearest = (kk: Kart) => {
        let best = kk.idx
        let bd = 1e12
        for (let d = -10; d <= 10; d++) {
          const i = (kk.idx + d + n) % n
          const dd = (P[i].x - kk.x) ** 2 + (P[i].y - kk.y) ** 2
          if (dd < bd) {
            bd = dd
            best = i
          }
        }
        return { i: best, d: Math.sqrt(bd) }
      }

      const stepKart = (kk: Kart, dt: number, throttle: number, steer: number, brake: boolean, driftKey: boolean) => {
        const fx_ = Math.cos(kk.a)
        const fy_ = Math.sin(kk.a)
        let vf = kk.vx * fx_ + kk.vy * fy_
        let vl = -kk.vx * fy_ + kk.vy * fx_
        const nr = nearest(kk)
        const prev = kk.idx
        kk.idx = nr.i
        if (prev > n * 0.75 && kk.idx < n * 0.25) kk.lap++
        else if (prev < n * 0.25 && kk.idx > n * 0.75) kk.lap--
        kk.off = nr.d > hw
        const cap = (kk.off ? maxV * 0.42 : maxV) * (kk.boost > 0 ? 1.4 : 1) * (kk.ai ? kk.skill : 1)
        const acc = kk.boost > 0 ? 700 : 300
        if (throttle > 0) vf += acc * throttle * dt
        if (brake) vf -= 560 * dt * (vf > 0 ? 1 : 0.5)
        vf *= 1 - (kk.off ? 1.1 : 0.22) * dt
        if (vf > cap) vf = Math.max(cap, vf - 500 * dt)
        const drifting = driftKey && Math.abs(vf) > 120 && Math.abs(steer) > 0.2
        kk.drift = drifting ? kk.drift + dt : 0
        if (!kk.ai) {
          if (drifting) kk.charge = Math.min(2, kk.charge + dt)
          else if (kk.charge > 0) {
            if (kk.charge > 0.8) {
              kk.boost = 0.6 + kk.charge * 0.4
              env.sfx('power')
              shake.kick(3)
            }
            kk.charge = 0
          }
        }
        kk.boost = Math.max(0, kk.boost - dt)
        const grip = drifting ? 2.0 : 9
        vl *= Math.exp(-grip * dt)
        const turn = steer * 2.7 * clamp(vf / 140, -1, 1) * (drifting ? 1.45 : 1) * (1 - Math.min(0.35, Math.abs(vf) / maxV * 0.3))
        kk.a += turn * dt
        kk.steer = steer
        kk.vx = fx_ * vf - fy_ * vl
        kk.vy = fy_ * vf + fx_ * vl
        // re-project after turning so heading change carries velocity (drift feel handled by lateral damping)
        kk.x += kk.vx * dt
        kk.y += kk.vy * dt
        // soft boundary beyond the grass
        if (nr.d > hw + 110) {
          const p = P[nr.i]
          const ang = Math.atan2(p.y - kk.y, p.x - kk.x)
          kk.vx = Math.cos(ang) * 120
          kk.vy = Math.sin(ang) * 120
          kk.x += Math.cos(ang) * 6
          kk.y += Math.sin(ang) * 6
          if (!kk.ai) shake.kick(5)
        }
        // pads
        for (const pd of pads) {
          const d = (nr.i - pd.idx + n) % n
          if (d < 3 || d > n - 3) if (kk.boost < 0.3 && nr.d < hw) kk.boost = 1
        }
      }

      const update = (dt: number) => {
        time += dt
        hint = Math.max(0, hint - dt)
        bannerT = Math.max(0, bannerT - dt)
        fx.update(dt, 0)
        shake.update(dt)
        if (over) return
        if (countdown > 0) {
          const prev = Math.ceil(countdown)
          countdown -= dt
          if (Math.ceil(countdown) !== prev) env.sfx(countdown <= 0 ? 'power' : 'click')
          return
        }
        for (const [i, pl] of pls.entries()) {
          const me = pl.kt
          pl.lapT += dt
          if (ghostOn && i === 0 && me.fin === 0) {
            recT += dt
            if (recT >= 0.05) {
              recT = 0
              rec.push(me.x, me.y, me.a)
            }
          }
          let gas: boolean, steer: number, brake: boolean, drift: boolean
          if (i === 0) {
            gas = k.down('up') || auto
            steer = (k.down('right') ? 1 : 0) - (k.down('left') ? 1 : 0) + (ptr.down && !auto && !two ? clamp((ptr.x - W / 2) / (W / 4), -1, 1) : 0)
            brake = k.down('down')
            // in 2P Enter/K are shared with player 2, so player 1 drifts only on Shift/Space (or the touch button)
            drift = two ? k.down('ShiftLeft') || k.down('Space') || (auto && (k.down('b') || k.down('a'))) : k.down('b') || k.down('a')
          } else {
            gas = k.down('p2up')
            steer = (k.down('p2right') ? 1 : 0) - (k.down('p2left') ? 1 : 0)
            brake = k.down('p2down')
            drift = k.down('Enter') || k.down('ShiftRight') || k.down('Slash')
          }
          const live = me.fin === 0
          stepKart(me, dt, live && gas ? 1 : 0, live ? clamp(steer, -1, 1) : 0, brake, live && drift)
          if (me.drift > 0.1 && Math.random() < 0.8) fx.burst(me.x - Math.cos(me.a) * 14, me.y - Math.sin(me.a) * 14, me.charge > 0.8 ? '#fb923c' : t.fg, 1, 60, 3)
          if (me.boost > 0) fx.burst(me.x - Math.cos(me.a) * 16, me.y - Math.sin(me.a) * 16, '#fde047', 1, 80, 4)
        }
        for (const kk of karts) {
          if (!kk.ai) continue
          const look = 5 + Math.round(Math.hypot(kk.vx, kk.vy) / 45)
          const ti = (kk.idx + look) % n
          const a2 = dir(ti)
          const tx = P[ti].x - Math.sin(a2) * kk.lane * hw
          const ty = P[ti].y + Math.cos(a2) * kk.lane * hw
          let diff = Math.atan2(ty - kk.y, tx - kk.x) - kk.a
          while (diff > Math.PI) diff -= Math.PI * 2
          while (diff < -Math.PI) diff += Math.PI * 2
          const curve = Math.abs(((dir(kk.idx + 8) - dir(kk.idx) + Math.PI * 3) % (Math.PI * 2)) - Math.PI)
          stepKart(kk, dt, Math.abs(diff) > 0.9 && Math.hypot(kk.vx, kk.vy) > 150 ? 0.2 : curve > 0.5 && Math.hypot(kk.vx, kk.vy) > 230 ? 0.5 : 1, clamp(diff * 2.2, -1, 1), false, false)
          if (kk.fin) {
            kk.vx *= 0.98
            kk.vy *= 0.98
          }
        }
        // kart-to-kart bumps
        for (let i = 0; i < karts.length; i++) {
          for (let j = i + 1; j < karts.length; j++) {
            const a = karts[i]
            const b = karts[j]
            const dx = b.x - a.x
            const dy = b.y - a.y
            const d = Math.hypot(dx, dy)
            if (d < 26 && d > 0.01) {
              const nx = dx / d
              const ny = dy / d
              const push = (26 - d) / 2
              a.x -= nx * push
              a.y -= ny * push
              b.x += nx * push
              b.y += ny * push
              const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
              if (rel < 0) {
                const imp = rel * (ram ? 1.1 : 0.7)
                a.vx += nx * imp
                a.vy += ny * imp
                b.vx -= nx * imp
                b.vy -= ny * imp
                if (i < nH) {
                  shake.kick(4)
                  env.sfx('hit')
                  fx.burst((a.x + b.x) / 2, (a.y + b.y) / 2, t.fg, 8, 160, 3)
                  if (ram) pls[i].score += 40
                }
              }
            }
          }
        }
        for (const p of pickups) {
          if (p.got > 0) {
            p.got -= dt
            continue
          }
          for (const pl of pls) {
            if (Math.hypot(p.x - pl.kt.x, p.y - pl.kt.y) < 26) {
              p.got = 12
              pl.score += 50
              pl.kt.boost = Math.max(pl.kt.boost, 0.5)
              env.sfx('point')
              fx.burst(p.x, p.y, t.accent2, 10, 160, 3)
              break
            }
          }
        }
        // laps / finish
        for (const pl of pls) {
          const me = pl.kt
          pl.place = 1 + karts.filter((o) => o !== me && (o.fin ? me.fin === 0 || o.fin < me.fin : me.fin === 0 && totalProg(o) > totalProg(me))).length
        }
        for (const [i, pl] of pls.entries()) {
          const me = pl.kt
          if (me.lap >= 1 && me.lap > pl.lapsDone) {
            const doneLaps = me.lap
            const lt = pl.lapT
            pl.lapsDone = doneLaps
            if (ghostOn && i === 0 && lt < pl.bestLap) bestRec = rec
            if (i === 0) {
              rec = []
              recT = 0
            }
            pl.bestLap = Math.min(pl.bestLap, lt)
            pl.lapT = 0
            const who = two ? `P${i + 1} ` : ''
            if (doneLaps >= laps) {
              me.fin = time
              if (finishT <= 0) {
                finishT = 2.4
                winner = i
              }
              banner = `${who}FINISH!`
              bannerT = 3
              env.sfx('win')
            } else {
              banner = `${who}LAP ${doneLaps + 1}/${laps}  ${lt.toFixed(1)}s`
              bannerT = 2
              env.sfx('power')
              pl.score += 200
            }
          }
        }
        for (const kk of karts) if (kk.ai && !kk.fin && kk.lap >= laps) kk.fin = time
        if (finishT > 0) {
          finishT -= dt
          if (finishT <= 0) {
            const w = pls[winner]
            if (two) {
              w.score += 500 + Math.max(0, Math.round(300 - w.bestLap * 3))
              score = w.score
              finish(true, `Player ${winner + 1} wins! Best lap ${w.bestLap.toFixed(1)}s`)
            } else {
              const won = w.place <= byDiff(env, 4, 3, 3)
              w.score += (nRivals + 1 - w.place) * 300 + Math.max(0, Math.round(300 - w.bestLap * 3))
              score = w.score
              finish(won, `Finished ${ord(w.place)} of ${nRivals + 1}, best lap ${w.bestLap.toFixed(1)}s`)
            }
          }
        }
        for (const pl of pls) pl.score += Math.hypot(pl.kt.vx, pl.kt.vy) * dt * 0.05
        score = Math.max(...pls.map((p) => p.score))
        env.score(Math.round(score))
        env.status(two ? pls.map((p, i) => `P${i + 1} lap ${Math.min(p.lapsDone + 1, laps)}/${laps}`).join(' · ') : `Lap ${Math.min(pls[0].lapsDone + 1, laps)}/${laps} · ${ord(pls[0].place)}/${nRivals + 1}`)
      }

      const kartShape = (kk: Kart) => {
        ctx.save()
        ctx.translate(kk.x, kk.y)
        ctx.rotate(kk.a)
        ctx.fillStyle = 'rgba(0,0,0,.3)'
        ctx.fillRect(-15, -9, 32, 20)
        ctx.fillStyle = '#111'
        ctx.fillRect(-14, -12, 8, 5)
        ctx.fillRect(-14, 8, 8, 5)
        ctx.fillRect(8, -12, 8, 5)
        ctx.fillRect(8, 8, 8, 5)
        ctx.fillStyle = kk.color
        ctx.beginPath()
        ctx.roundRect(-16, -8, 32, 16, 5)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,.35)'
        ctx.fillRect(-2, -8, 3, 16)
        ctx.fillStyle = 'rgba(0,0,0,.35)'
        ctx.beginPath()
        ctx.roundRect(1, -5, 9, 10, 3)
        ctx.fill()
        ctx.restore()
        const hi = karts.indexOf(kk)
        if (!kk.ai) {
          emoji(ctx, hi === 0 ? t.hero : t.foes[0], kk.x, kk.y - 2, 20)
          if (two) text(ctx, `P${hi + 1}`, kk.x, kk.y - 24, { size: 10, color: kk.color, shadow: '#000' })
        } else emoji(ctx, t.foes[Math.abs(Math.round(kk.lane * 100)) % t.foes.length], kk.x, kk.y - 2, 16)
      }

      const strokeTrack = (w: number, style: string, dash: number[] = []) => {
        ctx.setLineDash(dash)
        ctx.lineWidth = w
        ctx.strokeStyle = style
        ctx.beginPath()
        ctx.moveTo(P[0].x, P[0].y)
        for (let i = 1; i < n; i++) ctx.lineTo(P[i].x, P[i].y)
        ctx.closePath()
        ctx.stroke()
        ctx.setLineDash([])
      }

      const drawView = (pl: Pl, vx: number, vy: number, vw: number, vh: number) => {
        const me = pl.kt
        const vs = two ? vh / 450 : 1
        ctx.save()
        ctx.beginPath()
        ctx.rect(vx, vy, vw, vh)
        ctx.clip()
        const sp = Math.hypot(me.vx, me.vy)
        const base = two ? Math.min(vw, vh * 1.2) / 560 : narrow ? 0.62 : 0.88
        pl.zoom += (base - sp * 0.0004 - pl.zoom) * 0.05
        ctx.fillStyle = mix(t.bg2, t.good, 0.45)
        ctx.fillRect(vx, vy, vw, vh)
        ctx.save()
        ctx.translate(vx + vw / 2, vy + vh / 2)
        ctx.scale(pl.zoom, pl.zoom)
        ctx.translate(-me.x, -me.y)
        ctx.globalAlpha = 0.5
        for (const d of sampleBg) emoji(ctx, d.e, d.x, d.y, d.s)
        ctx.globalAlpha = 1
        ctx.lineJoin = 'round'
        ctx.lineCap = 'butt'
        strokeTrack(hw * 2 + 70, 'rgba(0,0,0,.18)')
        strokeTrack(hw * 2 + 22, t.danger)
        strokeTrack(hw * 2 + 22, '#f5f5f5', [28, 28])
        strokeTrack(hw * 2, '#4a4a56')
        strokeTrack(3, 'rgba(255,255,255,.55)', [22, 26])
        // start line
        {
          const a = dir(0)
          ctx.save()
          ctx.translate(P[0].x, P[0].y)
          ctx.rotate(a)
          for (let r = 0; r < 8; r++) for (let c = 0; c < 2; c++) {
            ctx.fillStyle = (r + c) % 2 ? '#111' : '#f5f5f5'
            ctx.fillRect(c * 8 - 8, -hw + r * (hw / 4), 8, hw / 4)
          }
          ctx.restore()
        }
        for (const pd of pads) {
          const p = P[pd.idx % n]
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(dir(pd.idx))
          ctx.fillStyle = t.accent
          ctx.globalAlpha = 0.8
          for (let c = 0; c < 3; c++) {
            ctx.beginPath()
            ctx.moveTo(-16 + c * 12, -22)
            ctx.lineTo(-6 + c * 12, 0)
            ctx.lineTo(-16 + c * 12, 22)
            ctx.lineTo(-10 + c * 12, 22)
            ctx.lineTo(0 + c * 12, 0)
            ctx.lineTo(-10 + c * 12, -22)
            ctx.fill()
          }
          ctx.restore()
        }
        ctx.globalAlpha = 1
        for (const p of pickups) {
          if (p.got > 0) continue
          ctx.shadowColor = t.accent2
          ctx.shadowBlur = 10
          emoji(ctx, p.e, p.x, p.y + Math.sin(time * 4 + p.x) * 2, 20)
          ctx.shadowBlur = 0
        }
        fx.draw(ctx)
        if (ghostOn && bestRec.length) {
          const gi = Math.min(Math.floor(pls[0].lapT / 0.05), bestRec.length / 3 - 1) * 3
          ctx.globalAlpha = 0.4
          kartShape({ ...pls[0].kt, x: bestRec[gi], y: bestRec[gi + 1], a: bestRec[gi + 2], color: '#e5e7eb', ai: true })
          ctx.globalAlpha = 1
        }
        for (const kk of karts) if (kk !== me) kartShape(kk)
        if (me.boost > 0) {
          ctx.shadowColor = '#fde047'
          ctx.shadowBlur = 20
        }
        kartShape(me)
        ctx.shadowBlur = 0
        ctx.restore()
        if (dark) {
          const g = ctx.createRadialGradient(vx + vw / 2, vy + vh / 2, 60 * vs, vx + vw / 2, vy + vh / 2, 300 * vs)
          g.addColorStop(0, 'rgba(0,0,0,0)')
          g.addColorStop(1, 'rgba(0,0,0,.9)')
          ctx.fillStyle = g
          ctx.fillRect(vx, vy, vw, vh)
        }
        // minimap
        const ms = 0.045
        ctx.save()
        const mmS = two ? 0.5 : narrow ? 0.62 : 1
        ctx.translate(vx + vw - 8 - 58 * mmS, vy + 8 + 58 * mmS)
        ctx.scale(mmS, mmS)
        ctx.fillStyle = 'rgba(0,0,0,.4)'
        ctx.beginPath()
        ctx.roundRect(-58, -58, 116, 116, 10)
        ctx.fill()
        ctx.scale(ms * 0.75, ms * 0.75)
        ctx.lineWidth = 60
        ctx.strokeStyle = 'rgba(255,255,255,.5)'
        ctx.beginPath()
        ctx.moveTo(P[0].x, P[0].y)
        for (let i = 1; i < n; i++) ctx.lineTo(P[i].x, P[i].y)
        ctx.closePath()
        ctx.stroke()
        for (const kk of karts) {
          ctx.fillStyle = kk === me ? '#fff' : kk.color
          ctx.beginPath()
          ctx.arc(kk.x, kk.y, kk === me ? 70 : 50, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
        const kmh = Math.round(sp * 0.9)
        text(ctx, `${kmh}`, vx + vw - 14, vy + vh - 54 * vs, { size: narrow || two ? 18 : 26, color: me.boost > 0 ? '#fde047' : t.fg, align: 'right', shadow: '#000' })
        text(ctx, 'KM/H', vx + vw - 14, vy + vh - 30 * vs, { size: 9, color: t.fg, align: 'right' })
        const pi = pls.indexOf(pl)
        text(ctx, `${two ? `P${pi + 1} ` : ''}${ord(pl.place)}`, vx + 14, vy + 24, { size: narrow || two ? 14 : 20, color: two ? me.color : t.accent2, align: 'left', shadow: '#000' })
        text(ctx, `LAP ${Math.min(pl.lapsDone + 1, laps)}/${laps}  ${pl.lapT.toFixed(1)}s`, vx + 14, vy + 50 * (two ? 0.8 : 1), { size: 10, color: t.fg, align: 'left' })
        if (me.charge > 0) {
          ctx.fillStyle = 'rgba(0,0,0,.5)'
          ctx.fillRect(vx + vw / 2 - 40, vy + vh - 40 * vs, 80, 8)
          ctx.fillStyle = me.charge > 0.8 ? '#fb923c' : t.fg
          ctx.fillRect(vx + vw / 2 - 40, vy + vh - 40 * vs, 80 * Math.min(1, me.charge / 2), 8)
        }
        ctx.restore()
      }

      const draw = () => {
        ctx.save()
        shake.apply(ctx)
        for (const [i, pl] of pls.entries()) drawView(pl, views[i].x, views[i].y, views[i].w, views[i].h)
        ctx.restore()
        if (two) {
          ctx.fillStyle = '#000'
          if (narrow) ctx.fillRect(0, H / 2 - 2, W, 4)
          else ctx.fillRect(W / 2 - 2, 0, 4, H)
        }
        if (bannerT > 0) text(ctx, banner, W / 2, 90, { size: narrow ? 14 : 20, color: t.accent2, shadow: t.accent })
        if (countdown > 0) {
          const c = Math.ceil(countdown - 0.2)
          text(ctx, c > 0 ? `${c}` : 'GO!', W / 2, H * 0.35, { size: 64, color: c > 0 ? t.fg : t.good, shadow: t.accent })
        }
        if (hint > 0 && countdown <= 0.5) {
          ctx.globalAlpha = Math.min(1, hint)
          if (two) {
            text(ctx, narrow ? 'P1 WASD+SPACE · P2 ARROWS+ENTER' : 'P1: WASD + SPACE DRIFT    P2: ARROWS + ENTER DRIFT', W / 2, H - 12, { size: narrow ? 8 : 11, color: t.fg, shadow: '#000' })
          } else text(ctx, auto ? (narrow ? 'HOLD 🌀 TO DRIFT' : '◀ ▶ STEER · HOLD 🌀 TO DRIFT, RELEASE FOR TURBO') : '←/→ STEER · ↑ GAS · ↓ BRAKE · SHIFT DRIFT', W / 2, H - 70, { size: narrow ? 8 : 11, color: t.fg, shadow: '#000' })
          ctx.globalAlpha = 1
        }
      }
      return { update, draw }
    }

    // ======================================================== side-view sprint (alternate-key mash race: swim / sprint / noodles / tandem)
    const sprint = () => {
      const heats = 3
      const total = 100
      const swim = mods.has('swim') || /swim|pool|water/.test(blurb)
      const nL = 4
      interface Run { x: number; v: number; stam: number; last: string; human: number; skill: number; phase: number; fin: number; e: string; name: string; tired: number }
      let heat = 0
      let heatT = 0
      let results: string[] = []
      let wins = [0, 0]
      let podium = 0
      let pause = 0
      const runs: Run[] = []
      const setup = () => {
        runs.length = 0
        for (let i = 0; i < nL; i++) {
          const human = i === 0 ? 1 : i === 1 && two ? 2 : 0
          runs.push({ x: 0, v: 0, stam: 1, last: '', human, skill: byDiff(env, 0.74, 0.86, 0.98) + heat * 0.05 + rng.range(-0.05, 0.07), phase: rng.range(0, 6), fin: 0, e: human === 1 ? t.hero : human === 2 ? t.foes[0] : t.foes[i % t.foes.length], name: human ? `P${human}` : '', tired: 0 })
        }
        heatT = 0
        countdown = 2.6
      }
      setup()
      const press = (r: Run, side: string) => {
        if (r.fin || countdown > 0) return
        if (side === r.last) {
          r.v += 0.12
        } else {
          r.v += (r.stam > 0.02 ? 0.95 : 0.35) * (1 + (heat === 0 ? 0.05 : 0))
          r.stam = Math.max(0, r.stam - 0.03)
          if (r.human === 1) env.sfx('click')
        }
        r.last = side
      }
      bag.on(st.canvas, 'pointerdown', (e) => {
        if (e.button === 2) return
        press(runs[0], st.toLocal(e).x < W / 2 ? 'left' : 'right')
      })
      const laneTop = 78
      const laneH = (H - laneTop - 46) / nL
      const xs = (m: number) => 60 + (m / total) * (W - 130)
      const update = (dt: number) => {
        time += dt
        hint = Math.max(0, hint - dt)
        fx.update(dt, 0)
        shake.update(dt)
        if (over) return
        if (pause > 0) {
          pause -= dt
          if (pause <= 0) {
            heat++
            setup()
          }
          return
        }
        if (countdown > 0) {
          const prev = Math.ceil(countdown)
          countdown -= dt
          if (Math.ceil(countdown) !== prev) env.sfx(countdown <= 0 ? 'power' : 'click')
          return
        }
        heatT += dt
        for (const r of runs) {
          if (r.human === 1) {
            if (k.hit('left')) press(r, 'left')
            if (k.hit('right')) press(r, 'right')
          } else if (r.human === 2) {
            if (k.hit('p2left')) press(r, 'left')
            if (k.hit('p2right')) press(r, 'right')
          } else if (!r.fin) {
            const target = r.skill * 9.4 * (1 + 0.14 * Math.sin(time * 2.4 + r.phase))
            r.v += (target - r.v) * Math.min(1, dt * 2)
          }
          if (r.human) {
            r.v *= Math.exp(-0.5 * dt)
            r.stam = Math.min(1, r.stam + 0.06 * dt)
            r.tired = r.stam < 0.05 ? 1 : 0
            r.v = Math.min(r.v, r.tired ? 6 : 12.5)
          }
          if (r.fin) r.v *= Math.exp(-2 * dt)
          r.x += r.v * dt
          if (!r.fin && r.x >= total) {
            r.fin = heatT
            if (r.human === 1) env.sfx('win')
          }
          if (r.human === 1 && r.v > 8 && Math.random() < 0.5) fx.burst(xs(r.x), laneTop + laneH * 0.7, swim ? '#bde0ff' : t.fg, 1, 60, 3)
        }
        if (runs.filter((r) => r.human).every((r) => r.fin)) {
          const order = [...runs].sort((a, b) => (a.fin || 999) - (b.fin || 999) || b.x - a.x)
          const winner = order[0]
          if (two) {
            wins[winner.human ? winner.human - 1 : 0] += winner.human ? 1 : 0
            results.push(winner.human ? `P${winner.human}` : 'AI')
            score += winner.human ? 200 : 0
          } else {
            const place = order.indexOf(runs[0]) + 1
            if (place <= 2) podium++
            score += (nL - place + 1) * 100 + Math.max(0, Math.round(300 - runs[0].fin * 20))
            results.push(ord(place))
          }
          banner = two ? `HEAT ${heat + 1}: ${results[heat]} WINS` : `HEAT ${heat + 1}: ${results[heat]}`
          bannerT = 2
          if (heat + 1 >= heats || (two && (wins[0] >= 2 || wins[1] >= 2))) {
            over = true
            env.sfx('win')
            env.score(Math.round(score))
            setTimeout(() => env.end({ score: Math.round(score), won: two ? true : podium >= 2, text: two ? `Player ${wins[0] > wins[1] ? 1 : 2} wins ${Math.max(...wins)}-${Math.min(...wins)}` : `Heats: ${results.join(', ')}` }), 1600)
          } else pause = 2
        }
        env.score(Math.round(score))
        env.status(`Heat ${Math.min(heat + 1, heats)}/${heats}${two ? ` · ${wins[0]}-${wins[1]}` : ''}`)
      }
      let banner = ''
      let bannerT = 0
      const draw = () => {
        bannerT = Math.max(0, bannerT - 1 / 60)
        ctx.save()
        shake.apply(ctx)
        ctx.fillStyle = swim ? mix(t.bg2, '#2563eb', 0.7) : mix(t.bg2, t.good, 0.35)
        ctx.fillRect(0, 0, W, H)
        for (let i = 0; i < nL; i++) {
          const y = laneTop + i * laneH
          ctx.fillStyle = swim ? (i % 2 ? '#3b82f6' : '#2f74e6') : i % 2 ? '#4a4a56' : '#42424d'
          ctx.fillRect(40, y, W - 80, laneH - 3)
          ctx.strokeStyle = swim ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.18)'
          ctx.lineWidth = 2
          ctx.setLineDash([14, 14])
          ctx.lineDashOffset = -(time * (runs[0]?.v ?? 0) * 12)
          ctx.beginPath()
          ctx.moveTo(40, y + laneH - 1.5)
          ctx.lineTo(W - 40, y + laneH - 1.5)
          ctx.stroke()
          ctx.setLineDash([])
          if (swim) {
            ctx.strokeStyle = 'rgba(255,255,255,.18)'
            ctx.beginPath()
            for (let x = 40; x < W - 40; x += 8) ctx.lineTo(x, y + laneH * 0.5 + Math.sin(x * 0.07 + time * 3 + i) * 4)
            ctx.stroke()
          }
        }
        // finish line
        const fx0 = xs(total) + 14
        for (let r = 0; r < nL * 4; r++) for (let c = 0; c < 2; c++) {
          ctx.fillStyle = (r + c) % 2 ? '#111' : '#f5f5f5'
          ctx.fillRect(fx0 + c * 7, laneTop + (r * laneH * nL) / (nL * 4), 7, (laneH * nL) / (nL * 4))
        }
        for (const [i, r] of runs.entries()) {
          const y = laneTop + i * laneH + laneH * 0.5
          const bob = Math.sin(time * (6 + r.v) + i) * Math.min(5, r.v * 0.5)
          if (swim) {
            ctx.fillStyle = 'rgba(255,255,255,.35)'
            ctx.beginPath()
            ctx.ellipse(xs(r.x) - 12, y + 12, 18 + r.v, 5, 0, 0, Math.PI * 2)
            ctx.fill()
          }
          emoji(ctx, r.e, xs(r.x), y + bob, Math.min(laneH * 0.9, 46))
          if (r.name) text(ctx, r.name, xs(r.x), y - laneH * 0.5 + 6, { size: 9, color: r.human === 2 ? t.accent2 : t.accent, shadow: '#000' })
        }
        fx.draw(ctx)
        ctx.restore()
        text(ctx, `HEAT ${Math.min(heat + 1, heats)}/${heats}`, W / 2, 24, { size: narrow ? 14 : 20, color: t.fg, shadow: '#000' })
        text(ctx, `${Math.round(Math.min(total, runs[0]?.x ?? 0))} / ${total} m`, W / 2, 50, { size: 11, color: t.accent2 })
        const bars = two ? runs.filter((r) => r.human) : [runs[0]]
        for (const [bi, r] of bars.entries()) {
          const bx = bi ? W - 170 : 14
          ctx.fillStyle = 'rgba(0,0,0,.5)'
          ctx.fillRect(bx, H - 30, 150, 10)
          ctx.fillStyle = r.stam > 0.25 ? t.good : t.danger
          ctx.fillRect(bx, H - 30, 150 * r.stam, 10)
          text(ctx, r.tired ? 'TIRED!' : `${two ? `P${r.human} ` : ''}STAMINA`, bx, H - 38, { size: 8, color: t.fg, align: 'left' })
        }
        if (bannerT > 0) text(ctx, banner, W / 2, H * 0.5, { size: narrow ? 14 : 22, color: t.accent2, shadow: t.accent })
        if (countdown > 0) {
          const c = Math.ceil(countdown - 0.2)
          text(ctx, c > 0 ? `${c}` : 'GO!', W / 2, H * 0.4, { size: 64, color: c > 0 ? t.fg : t.good, shadow: t.accent })
        }
        if (hint > 0 && countdown <= 0.5) {
          ctx.globalAlpha = Math.min(1, hint)
          text(ctx, two ? 'P1: A / D ALTERNATELY   P2: ← / → ALTERNATELY' : auto ? 'TAP LEFT / RIGHT ALTERNATELY' : 'ALTERNATE ← / → (OR A / D) AS FAST AS YOU CAN', W / 2, H * 0.62, { size: narrow ? 8 : 11, color: t.fg, shadow: '#000' })
          ctx.globalAlpha = 1
        }
      }
      return { update, draw }
    }

    const mode = sprintMode ? sprint() : topdown ? top() : road()
    const lp = loop(mode.update, mode.draw)
    return {
      pause: (p) => lp.pause(p),
      destroy() {
        lp.stop()
        k.dispose()
        bag.dispose()
        ptr.dispose()
        dispVpad()
        st.dispose()
      },
    }
  },
}

export default engine
