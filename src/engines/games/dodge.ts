// Dodge & catch. Sub-modes picked from name/desc/mods (see logic/dodge.ts):
// catch (basket on the bottom lane), rain / sides / homing / zone / rings / laser (free 2D survival).
// Mods: swim (floaty), ice (slippery), tiny (small hitbox), wind (drift), dark (spotlight), bomb (shrapnel bombs), rotate (fall direction shifts).
import { background, Bag, byDiff, clamp, createStage, emoji, isTouch, keys, loop, Particles, pointer, roundRect, Shake, text, vpad, type Engine } from '../kit'
import { detectMode, spawnGap, speedAt } from '../logic/dodge'

let W = 640
let H = 400
const TAU = Math.PI * 2
let LANE_Y = 0

type Kind = 'bad' | 'good' | 'bomb' | 'star' | 'heart' | 'shrap'
interface Ent { x: number; y: number; vx: number; vy: number; ay: number; r: number; e: string; kind: Kind; fuse: number; t: number; warn: number; homing: boolean; spin: number; seen: boolean }
interface Beam { horiz: boolean; pos: number; warn: number; fire: number }
interface Ring { x: number; y: number; R: number; warn: number }

const engine: Engine = {
  start(env) {
    const { theme: t, rng, mods } = env
    const hr = env.host.getBoundingClientRect()
    const portrait = hr.height > hr.width * 1.1
    W = portrait ? 400 : 640
    H = portrait ? 640 : 400
    LANE_Y = H - 46
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const k = keys()
    const ptr = pointer(st)
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const { mode, free } = detectMode(env.name, env.desc, mods)
    const swim = mods.has('swim')
    const ice = mods.has('ice')
    const tiny = mods.has('tiny')
    const wind = mods.has('wind')
    const dark = mods.has('dark')
    const bombs = mods.has('bomb')
    const rotate = mods.has('rotate') && free
    const touch = isTouch()
    const catching = mode === 'catch'
    const goal = catching ? byDiff(env, 25, 35, 45) : byDiff(env, 45, 60, 80)
    const maxLives = byDiff(env, 6, 5, 4) - (catching ? 0 : 1) + (mods.has('zen') ? 2 : 0)
    bag.add(vpad(env.host, k, free ? 'dpad' : 'lr', free && (mode === 'rings' || mode === 'rain') ? [{ action: 'a', label: '⤒' }] : []))

    let lives = maxLives
    let score = 0
    let time = 0
    let over = false
    let intro = 2.6
    let caught = 0
    let combo = 0
    let inv = 0
    let spawnT = 1
    let ents: Ent[] = []
    let beams: Beam[] = []
    let rings: Ring[] = []
    let flash = 0
    let jump = 0
    let jumpCd = 0
    let boost = 0
    let msg = ''
    let msgT = 0
    let level = 1
    let fall = 0 // fall direction index for rotate mod
    let outT = 0
    const pl = { x: W / 2, y: free ? H / 2 : LANE_Y, vx: 0, vy: 0 }
    const tg = { x: W / 2, y: free ? H / 2 : LANE_Y }
    const last = { x: 0, y: 0 }
    const zone = { x: W / 2, y: H / 2, r: 230 }
    const hit = tiny ? 6 : free ? 10 : 0
    const bubbles = Array.from({ length: 30 }, () => ({ x: rng() * W, y: rng() * H, s: 0.5 + rng() * 2 }))
    const bowlW = () => (boost > 0 ? 62 : 42)

    const status = () => env.status(`${catching ? `Caught ${caught}/${goal}` : `${Math.floor(time)}s/${goal}s`} · ${'❤️'.repeat(Math.max(0, lives))}`)
    const add = (n: number) => {
      score += Math.round(n)
      env.score(score)
    }
    const say = (s: string) => {
      msg = s
      msgT = 1.3
    }
    const hurt = (x: number, y: number) => {
      if (inv > 0 || over) return
      lives--
      inv = 1.3
      combo = 0
      flash = 0.25
      shake.kick(7)
      env.sfx('hit')
      fx.burst(x, y, t.danger, 22, 230, 4)
      status()
      if (lives <= 0) {
        over = true
        env.sfx('lose')
        env.end({ score, won: false, text: catching ? `Caught ${caught} of ${goal}` : `Survived ${Math.floor(time)} seconds` })
      }
    }
    const win = () => {
      if (over) return
      over = true
      env.sfx('win')
      add(lives * 150)
      env.end({ score, won: true, text: catching ? `Caught all ${goal}` : `Survived ${goal} seconds` })
    }

    const mk = (kind: Kind, x: number, y: number, vx: number, vy: number, e: string, r = 14): Ent => ({ x, y, vx, vy, ay: 0, r, e, kind, fuse: 0, t: 0, warn: 0, homing: false, spin: rng.range(-3, 3), seen: false })
    const dirs = [{ x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }, { x: 1, y: 0 }]
    const spd = () => speedAt(time, env.difficulty) * (mods.has('fast') ? 1.2 : 1)
    const rainSpawn = (kind: Kind, e: string) => {
      const d = dirs[free ? fall % 4 : 0]
      let x: number
      let y: number
      if (d.y) { x = rng.range(20, W - 20); y = d.y > 0 ? -20 : H + 20 }
      else { y = rng.range(20, H - 20); x = d.x > 0 ? -20 : W + 20 }
      const v = rng.range(110, 170) * spd()
      const en = mk(kind, x, y, d.x * v, d.y * v, e, kind === 'bad' ? 13 : 12)
      if (kind === 'bad' && !catching && /arrow|hail|rain|spear|dart/i.test(env.name + env.desc)) {
        en.ay = 180
        en.vx = d.y ? rng.range(-80, 80) : en.vx
      }
      ents.push(en)
      return en
    }

    const spawn = () => {
      const gap = spawnGap(time, byDiff(env, 0.9, 0.7, 0.55), 0.18) * (mode === 'sides' ? 1.2 : mode === 'homing' ? 6 : 1)
      spawnT = gap * (0.7 + rng() * 0.6)
      const foe = rng.pick(t.foes)
      if (catching) {
        const r = rng()
        if (r < 0.66) rainSpawn('good', rng.pick(t.items)).x = rng.range(30, W - 30)
        else if (r < 0.96 || time < 8) rainSpawn('bad', foe)
        else if (r < 0.98) rainSpawn('star', '⭐')
        else rainSpawn('heart', '❤️')
        return
      }
      if (rng() < 0.05 && time > 6) { rainSpawn(rng() < 0.3 ? 'heart' : 'star', rng() < 0.3 ? '❤️' : '⭐'); return }
      switch (mode) {
        case 'rain':
          if (bombs && rng() < 0.22) {
            const b = rainSpawn('bomb', '💣')
            b.fuse = rng.range(1.2, 2)
            b.vy *= 0.6
            b.vx *= 0.6
          } else rainSpawn('bad', foe)
          break
        case 'sides': {
          const side = rng.int(0, 3)
          const x = side === 0 ? -20 : side === 1 ? W + 20 : rng.range(30, W - 30)
          const y = side === 2 ? -20 : side === 3 ? H + 20 : rng.range(30, H - 30)
          const e = mk('bad', x, y, 0, 0, foe, 13)
          const a = Math.atan2(pl.y - y, pl.x - x) + rng.range(-0.25, 0.25)
          const v = rng.range(190, 260) * spd()
          e.vx = Math.cos(a) * v
          e.vy = Math.sin(a) * v
          e.warn = 0.7
          e.x = clamp(x, 14, W - 14)
          e.y = clamp(y, 14, H - 14)
          ents.push(e)
          break
        }
        case 'homing': {
          const side = rng.int(0, 3)
          const e = mk('bad', side === 0 ? -20 : side === 1 ? W + 20 : rng.range(0, W), side === 2 ? -20 : side === 3 ? H + 20 : rng.range(0, H), 0, 0, foe, 15)
          e.homing = true
          e.t = 0
          ents.push(e)
          break
        }
        case 'zone': rainSpawn('bad', foe); spawnT *= 1.8; break
        case 'rings': spawnT = gap * 2.4; rings.push({ x: rng.range(100, W - 100), y: rng.range(80, H - 80), R: 0, warn: 0.9 }); break
        case 'laser': {
          spawnT = gap * 2.2
          const horiz = rng() < 0.5
          beams.push({ horiz, pos: horiz ? clamp(pl.y + rng.range(-70, 70), 20, H - 20) : clamp(pl.x + rng.range(-90, 90), 20, W - 20), warn: 1.1 - Math.min(0.4, time / 120), fire: 0.45 })
          if (time > 20 && rng() < 0.5) beams.push({ horiz: !horiz, pos: horiz ? rng.range(20, W - 20) : rng.range(20, H - 20), warn: 1.2, fire: 0.4 })
          break
        }
      }
    }

    ptr.onDown((p) => {
      intro = Math.min(intro, 0)
      last.x = p.x
      last.y = p.y
      if (!touch) { tg.x = p.x; if (free) tg.y = p.y }
    })
    ptr.onMove((p) => {
      if (touch) {
        if (p.down) {
          tg.x += p.x - last.x
          if (free) tg.y += p.y - last.y
        }
      } else {
        tg.x = p.x
        if (free) tg.y = p.y
      }
      last.x = p.x
      last.y = p.y
    })
    k.onKey((e) => { if (intro > 0.2 && !e.repeat) intro = 0 })

    status()
    env.score(0)

    const update = (dt: number) => {
      time += dt
      fx.update(dt)
      shake.update(dt)
      msgT -= dt
      flash = Math.max(0, flash - dt)
      if (intro > 0) intro -= dt
      for (const b of bubbles) {
        b.y -= b.s * 14 * dt
        if (b.y < -5) { b.y = H + 5; b.x = rng() * W }
      }
      if (over || intro > 0.15) {
        if (intro > 0.15) time = 0
        return
      }
      inv = Math.max(0, inv - dt)
      boost = Math.max(0, boost - dt)
      jump = Math.max(0, jump - dt)
      jumpCd = Math.max(0, jumpCd - dt)
      const lv = 1 + Math.floor(time / 12)
      if (lv > level) { level = lv; say(`LEVEL ${lv}`); env.sfx('power') }
      if (!catching && time >= goal) { win(); return }
      if (rotate && Math.floor(time / 10) !== fall) { fall = Math.floor(time / 10); say('GRAVITY SHIFT') }

      // movement
      const ax = k.axis()
      const sp = (free ? 270 : 400) * (swim ? 0.8 : 1)
      if (ax.x || ax.y) {
        tg.x = pl.x + ax.x * 90
        if (free) tg.y = pl.y + ax.y * 90
      }
      tg.x = clamp(tg.x, 14, W - 14)
      tg.y = free ? clamp(tg.y, 14, H - 14) : LANE_Y
      const dx = tg.x - pl.x
      const dy = tg.y - pl.y
      if (ice || swim) {
        const acc = swim ? 5 : 3.5
        pl.vx += clamp(dx * acc, -sp, sp) * dt * (swim ? 1.5 : 2.2)
        pl.vy += clamp(dy * acc, -sp, sp) * dt * (swim ? 1.5 : 2.2)
        const fr = Math.pow(swim ? 0.12 : 0.35, dt)
        pl.vx *= fr
        pl.vy *= fr
        pl.x += pl.vx * dt * 2.2
        pl.y += pl.vy * dt * 2.2
      } else {
        const m = (ax.x || ax.y ? sp : 640) * dt
        pl.x += clamp(dx, -m, m)
        pl.y += clamp(dy, -m, m)
      }
      pl.x = clamp(pl.x, 14, W - 14)
      pl.y = free ? clamp(pl.y, 14, H - 14) : LANE_Y
      if ((k.hit('a') || k.hit('b')) && free && jumpCd <= 0) {
        jump = 0.45
        jumpCd = 1
        inv = Math.max(inv, 0.45)
        env.sfx('jump')
        fx.burst(pl.x, pl.y, t.accent, 8, 120, 3)
      }

      spawnT -= dt
      if (spawnT <= 0 && ents.length < 90) spawn()
      const windX = wind ? Math.sin(time * 0.7) * 60 : 0

      for (const e of ents) {
        e.t += dt
        if (e.warn > 0) { e.warn -= dt; continue }
        if (e.homing) {
          const a = Math.atan2(pl.y - e.y, pl.x - e.x)
          const v = (45 + Math.min(40, time * 0.8)) * byDiff(env, 0.85, 1, 1.15)
          e.vx += (Math.cos(a) * v - e.vx) * dt * 1.5
          e.vy += (Math.sin(a) * v - e.vy) * dt * 1.5
          if (e.t > 18) e.kind = 'shrap'
        }
        e.vy += e.ay * dt
        e.x += (e.vx + (e.kind === 'shrap' ? 0 : windX)) * dt
        e.y += e.vy * dt
        if (e.kind === 'bomb') {
          e.fuse -= dt
          if (e.fuse <= 0) {
            const n = 8
            for (let i = 0; i < n; i++) {
              const a = (i / n) * TAU + e.t
              const s = mk('shrap', e.x, e.y, Math.cos(a) * 150, Math.sin(a) * 150, '', 5)
              ents.push(s)
            }
            fx.burst(e.x, e.y, '#fb923c', 16, 200, 4)
            env.sfx('boom')
            e.y = 9999
          }
        }
        const dd = Math.hypot(e.x - pl.x, e.y - pl.y)
        if (catching) {
          // basket catch
          const inBowl = Math.abs(e.x - pl.x) < bowlW() + e.r * 0.5 && e.y > pl.y - 24 && e.y < pl.y + 18
          if (inBowl && e.vy > 0) {
            e.y = 9999
            if (e.kind === 'good') {
              caught++
              combo++
              add(10 * (1 + Math.floor(combo / 5)))
              env.sfx('point')
              fx.burst(e.x, pl.y - 20, t.good, 10, 150, 3)
              if (caught >= goal) win()
              status()
            } else if (e.kind === 'star') { boost = 8; add(100); say('WIDE BASKET'); env.sfx('power') }
            else if (e.kind === 'heart') { lives = Math.min(9, lives + 1); say('EXTRA LIFE'); env.sfx('power'); status() }
            else hurt(e.x, pl.y)
          } else if (e.y > H + 10 && e.kind === 'good' && !e.seen) {
            e.seen = true
            combo = 0
            lives--
            shake.kick(4)
            env.sfx('hit')
            status()
            if (lives <= 0) {
              over = true
              env.sfx('lose')
              env.end({ score, won: false, text: `Caught ${caught} of ${goal}` })
            }
          }
        } else if (dd < e.r + hit) {
          if (e.kind === 'star') { add(100); e.y = 9999; env.sfx('power'); fx.burst(e.x, e.y, '#facc15', 12, 160, 3) }
          else if (e.kind === 'heart') { lives = Math.min(9, lives + 1); e.y = 9999; env.sfx('power'); say('EXTRA LIFE'); status() }
          else if (e.kind !== 'good' && inv <= 0) { hurt(e.x, e.y); if (e.kind === 'shrap') e.y = 9999 }
        } else if (e.kind === 'bad' && !e.seen && dd < e.r + hit + 16 && inv <= 0) {
          e.seen = true
          add(5)
        }
        if (e.x < -60 || e.x > W + 60 || e.y > H + 60 || e.y < -60) e.y = 9999
      }
      ents = ents.filter((e) => e.y < 9000)

      // beams
      for (const b of beams) {
        if (b.warn > 0) b.warn -= dt
        else {
          b.fire -= dt
          const d = b.horiz ? Math.abs(pl.y - b.pos) : Math.abs(pl.x - b.pos)
          if (b.fire > 0 && d < 9 + hit) hurt(pl.x, pl.y)
        }
      }
      beams = beams.filter((b) => b.fire > 0)
      // rings
      for (const r of rings) {
        if (r.warn > 0) { r.warn -= dt; continue }
        r.R += (130 + time * 1.5) * dt
        const d = Math.hypot(pl.x - r.x, pl.y - r.y)
        if (Math.abs(d - r.R) < 9 + hit * 0.5 && inv <= 0) hurt(pl.x, pl.y)
      }
      rings = rings.filter((r) => r.R < 700)
      // zone
      if (mode === 'zone') {
        zone.r = Math.max(70, 240 - time * 2.6)
        zone.x = W / 2 + Math.sin(time * 0.4) * 80
        zone.y = H / 2 + Math.cos(time * 0.31) * 50
        if (Math.hypot(pl.x - zone.x, pl.y - zone.y) > zone.r) {
          outT += dt
          if (outT > 0.6) { outT = 0; hurt(pl.x, pl.y) }
        } else outT = 0
      }
      if (!catching) {
        add(dt * 10)
        if (Math.floor(time) !== Math.floor(time - dt)) status()
      }
    }

    const draw = () => {
      background(ctx, W, H, t, 40, env.seed)
      ctx.save()
      shake.apply(ctx)
      if (swim) {
        ctx.strokeStyle = t.fg
        ctx.lineWidth = 1
        for (const b of bubbles) {
          ctx.globalAlpha = 0.18
          ctx.beginPath()
          ctx.arc(b.x, b.y, b.s * 2.2, 0, TAU)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }
      if (mode === 'zone') {
        ctx.fillStyle = 'rgba(0,0,0,.45)'
        ctx.beginPath()
        ctx.rect(0, 0, W, H)
        ctx.arc(zone.x, zone.y, zone.r, 0, TAU, true)
        ctx.fill('evenodd')
        ctx.strokeStyle = t.accent
        ctx.lineWidth = 3
        ctx.shadowColor = t.accent
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(zone.x, zone.y, zone.r, 0, TAU)
        ctx.stroke()
        ctx.shadowBlur = 0
      }
      if (!free) {
        ctx.fillStyle = t.accent
        ctx.globalAlpha = 0.12
        ctx.fillRect(0, LANE_Y + 22, W, H)
        ctx.globalAlpha = 1
      }
      for (const r of rings) {
        ctx.strokeStyle = t.danger
        ctx.shadowColor = t.danger
        ctx.shadowBlur = 10
        if (r.warn > 0) {
          ctx.globalAlpha = 0.4 + 0.4 * Math.sin(time * 25)
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(r.x, r.y, 16, 0, TAU)
          ctx.stroke()
        } else {
          ctx.lineWidth = 12
          ctx.beginPath()
          ctx.arc(r.x, r.y, r.R, 0, TAU)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }
      for (const b of beams) {
        if (b.warn > 0) {
          ctx.strokeStyle = t.danger
          ctx.globalAlpha = 0.25 + 0.3 * Math.sin(time * 30)
          ctx.lineWidth = 2
          ctx.setLineDash([10, 8])
        } else {
          ctx.strokeStyle = '#fff'
          ctx.shadowColor = t.danger
          ctx.shadowBlur = 18
          ctx.lineWidth = 14
        }
        ctx.beginPath()
        if (b.horiz) { ctx.moveTo(0, b.pos); ctx.lineTo(W, b.pos) }
        else { ctx.moveTo(b.pos, 0); ctx.lineTo(b.pos, H) }
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }
      for (const e of ents) {
        if (e.kind === 'shrap') {
          ctx.fillStyle = '#fb923c'
          ctx.shadowColor = '#fb923c'
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(e.x, e.y, 5, 0, TAU)
          ctx.fill()
          ctx.shadowBlur = 0
          continue
        }
        if (e.warn > 0) {
          ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time * 30)
          text(ctx, '!', e.x, e.y, { size: 16, color: t.danger })
          ctx.globalAlpha = 1
          continue
        }
        const glow = e.kind === 'good' ? t.good : e.kind === 'bad' ? t.danger : '#facc15'
        ctx.shadowColor = glow
        ctx.shadowBlur = 8
        const flicker = e.kind === 'bomb' && e.fuse < 0.6 && Math.floor(time * 20) % 2 ? 0.5 : 1
        ctx.globalAlpha = flicker
        emoji(ctx, e.e, e.x, e.y, e.r * 2.1, e.ay ? Math.atan2(e.vy, e.vx) - Math.PI / 2 : e.kind === 'bad' && free ? e.t * e.spin : 0)
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }
      fx.draw(ctx)
      // player
      const blink = inv > 0 && Math.floor(time * 16) % 2
      if (!over && !blink) {
        const py = pl.y - (jump > 0 ? Math.sin((jump / 0.45) * Math.PI) * 24 : 0)
        ctx.shadowColor = t.accent
        ctx.shadowBlur = 12
        if (!free) {
          ctx.strokeStyle = t.accent2
          ctx.lineWidth = 5
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.arc(pl.x, pl.y - 8, bowlW(), 0.15 * Math.PI, 0.85 * Math.PI)
          ctx.stroke()
          ctx.lineCap = 'butt'
          emoji(ctx, t.hero, pl.x, pl.y - 6, 30)
        } else {
          emoji(ctx, t.hero, pl.x, py, tiny ? 20 : 30)
          ctx.shadowBlur = 0
          if (tiny) {
            ctx.fillStyle = '#fff'
            ctx.beginPath()
            ctx.arc(pl.x, py, 2.5, 0, TAU)
            ctx.fill()
          }
        }
        ctx.shadowBlur = 0
      }
      ctx.restore()
      if (dark) {
        const g = ctx.createRadialGradient(pl.x, pl.y, 40, pl.x, pl.y, 200)
        g.addColorStop(0, 'rgba(0,0,0,0)')
        g.addColorStop(1, 'rgba(0,0,0,.92)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
      }
      if (flash > 0) {
        ctx.fillStyle = `rgba(255,60,60,${flash * 1.2})`
        ctx.fillRect(0, 0, W, H)
      }
      if (wind) text(ctx, Math.sin(time * 0.7) > 0 ? 'WIND >>' : '<< WIND', W - 60, 16, { size: 8, color: t.fg })
      if (jumpCd > 0 && free && (mode === 'rings' || mode === 'rain')) roundRect(ctx, 10, H - 14, 50 * (1 - jumpCd), 5, 2, t.accent)
      if (combo >= 3) text(ctx, `${combo} COMBO`, W - 70, H - 14, { size: 9, color: t.accent })
      if (msgT > 0 && intro <= 0) text(ctx, msg, W / 2, 56, { size: 18, color: t.fg, shadow: t.accent })
      // goal bar
      const prog = clamp((catching ? caught : time) / goal, 0, 1)
      roundRect(ctx, 0, 0, W, 4, 0, 'rgba(0,0,0,.4)')
      roundRect(ctx, 0, 0, W * prog, 4, 0, t.accent)
      if (intro > 0) {
        const a = Math.min(1, intro * 3)
        ctx.fillStyle = `rgba(0,0,0,${0.6 * a})`
        ctx.fillRect(0, 0, W, H)
        ctx.globalAlpha = a
        emoji(ctx, t.hero, W / 2, H / 2 - 82, 64 + Math.sin(time * 5) * 3)
        text(ctx, env.name.toUpperCase(), W / 2, H / 2 - 28, { size: env.name.length > 24 ? 15 : 22, color: t.fg, shadow: t.accent })
        text(ctx, env.desc.slice(0, 56), W / 2, H / 2 + 6, { size: 9, color: t.accent2 })
        const how = catching ? 'MOUSE / ARROWS · CATCH GOOD · DODGE BAD' : mode === 'zone' ? 'MOVE · STAY INSIDE THE CIRCLE' : mode === 'laser' ? 'MOVE · AVOID THE LASERS' : mode === 'rings' ? 'MOVE · SPACE TO JUMP RINGS' : 'MOVE WITH MOUSE / WASD · SURVIVE'
        text(ctx, how, W / 2, H / 2 + 44, { size: 9, color: t.fg })
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
