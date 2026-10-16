// Dodge & catch. Sub-modes picked from name/desc/mods (see logic/dodge.ts):
// catch (basket on the bottom lane), rain / sides / homing / zone / rings / laser (free 2D survival).
// Mods: swim (floaty), ice (slippery), tiny (small hitbox), wind (drift), dark (spotlight), bomb (shrapnel bombs), rotate (fall direction shifts).
import { background, Bag, byDiff, clamp, createStage, emoji, isTouch, keys, loop, Particles, pointer, roundRect, Shake, text, vpad, type Engine } from '../kit'
import { detectMode, inCone, segDist, spawnGap, speedAt } from '../logic/dodge'

let W = 640
let H = 400
const TAU = Math.PI * 2
let LANE_Y = 0

type Kind = 'bad' | 'good' | 'bomb' | 'star' | 'heart' | 'shrap'
interface Ent { x: number; y: number; vx: number; vy: number; ay: number; r: number; e: string; kind: Kind; fuse: number; t: number; warn: number; homing: boolean; spin: number; seen: boolean; bounce?: boolean }
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
    const counting = catching || mode === 'gather' || mode === 'sneak'
    const micro = /ten second/i.test(env.name)
    const goal = micro ? 10 : counting ? byDiff(env, 25, 35, 45) : byDiff(env, 45, 60, 80)
    const maxLives = byDiff(env, 6, 5, 4) - (counting ? 0 : 1) + (mods.has('zen') ? 2 : 0)
    bag.add(vpad(env.host, k, free ? 'dpad' : 'lr', free && (mode === 'rings' || mode === 'rain' || mode === 'strike') ? [{ action: 'a', label: '⤒' }] : []))

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
    let wallsA: { d: number; p: number; g0: number; g1: number }[] = []
    let blades: { cx: number; cy: number; a: number; w: number; len: number }[] = []
    let strikes: { x: number; y: number; warn: number; fire: number }[] = []
    let guards: { x: number; y: number; ax: number; ay: number; a: number; ph: number; sp: number; alert: number }[] = []
    let crossed = 0
    let sneakAdd: (i: number) => void = () => {}
    const laneYs = Array.from({ length: 6 }, (_, i) => H * (0.2 + i * 0.12))
    const pl = { x: W / 2, y: free ? H / 2 : LANE_Y, vx: 0, vy: 0 }
    const tg = { x: W / 2, y: free ? H / 2 : LANE_Y }
    const last = { x: 0, y: 0 }
    const zone = { x: W / 2, y: H / 2, r: 230 }
    const hit = tiny ? 6 : free ? 10 : 0
    const bubbles = Array.from({ length: 30 }, () => ({ x: rng() * W, y: rng() * H, s: 0.5 + rng() * 2 }))
    const bowlW = () => (boost > 0 ? 62 : 42)

    const status = () => env.status(`${counting ? `Caught ${caught}/${goal}` : `${Math.floor(time)}s/${goal}s`} · ${'❤️'.repeat(Math.max(0, lives))}`)
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
        env.end({ score, won: false, text: counting ? `Got ${caught} of ${goal}` : `Survived ${Math.floor(time)} seconds` })
      }
    }
    const win = () => {
      if (over) return
      over = true
      env.sfx('win')
      add(lives * 150)
      env.end({ score, won: true, text: counting ? `Got all ${goal}` : `Survived ${goal} seconds` })
    }

    const mk = (kind: Kind, x: number, y: number, vx: number, vy: number, e: string, r = 14): Ent => ({ x, y, vx, vy, ay: 0, r, e, kind, fuse: 0, t: 0, warn: 0, homing: false, spin: rng.range(-3, 3), seen: false })
    const dirs = [{ x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }, { x: 1, y: 0 }]
    const spd = () => speedAt(time, env.difficulty) * (mods.has('fast') ? 1.2 : 1) * (micro ? 1.5 : 1)
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
      spawnT = gap * (0.7 + rng() * 0.6) * (micro ? 0.4 : 1)
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
        case 'gather': {
          const good = rng() < 0.6
          const side = rng.int(0, 3)
          const x = side === 0 ? -20 : side === 1 ? W + 20 : rng.range(30, W - 30)
          const y = side === 2 ? -20 : side === 3 ? H + 20 : rng.range(30, H - 30)
          const a = Math.atan2(rng.range(H * 0.25, H * 0.75) - y, rng.range(W * 0.25, W * 0.75) - x)
          const v = rng.range(50, 95) * spd()
          const e = mk(good ? 'good' : 'bad', x, y, Math.cos(a) * v, Math.sin(a) * v, good ? rng.pick(t.items) : foe, good ? 13 : 14)
          if (!good) e.homing = false
          ents.push(e)
          spawnT *= 0.8
          break
        }
        case 'bounce': {
          spawnT = Math.max(2.2, 6 - time / 15)
          const a = rng.range(0, TAU)
          const v = rng.range(120, 170) * spd()
          const e = mk('bad', rng.range(40, W - 40), rng() < 0.5 ? 30 : H - 30, Math.cos(a) * v, Math.sin(a) * v, foe, 14)
          e.bounce = true
          ents.push(e)
          break
        }
        case 'walls': {
          spawnT = gap * 3.2
          const d = rng.int(0, 3)
          const span = d % 2 ? H : W
          const gw = Math.max(90, 150 - time * 0.8)
          const g0 = rng.range(30, span - gw - 30)
          wallsA.push({ d, p: -20, g0, g1: g0 + gw })
          break
        }
        case 'spin': {
          spawnT = 9999
          break
        }
        case 'strike': {
          spawnT = gap * 1.6
          const n = 1 + (time > 25 ? 1 : 0)
          for (let i = 0; i < n; i++) strikes.push({ x: clamp(pl.x + (i ? rng.range(-140, 140) : rng.range(-50, 50)), 40, W - 40), y: clamp(pl.y + (i ? rng.range(-140, 140) : rng.range(-50, 50)), 40, H - 40), warn: 1.0 - Math.min(0.35, time / 120), fire: 0.35 })
          break
        }
        case 'lanes': {
          const li = rng.int(0, laneYs.length - 1)
          const dir = li % 2 ? 1 : -1
          const v = (90 + li * 14 + rng.range(0, 40)) * spd()
          ents.push(mk('bad', dir > 0 ? -30 : W + 30, laneYs[li], dir * v, 0, foe, 15))
          spawnT = gap * 0.55
          break
        }
        case 'sneak': {
          spawnT = 3.5
          if (ents.filter((e) => e.kind === 'good').length < 4) {
            const e = mk('good', rng.range(40, W - 40), rng.range(60, H - 40), 0, 0, rng.pick(t.items), 13)
            ents.push(e)
          }
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

    if (mode === 'spin') blades.push({ cx: W / 2, cy: H / 2, a: 0, w: 1.1, len: Math.min(W, H) * 0.34 })
    if (mode === 'sneak') {
      const addGuard = (i: number) => guards.push({ x: 0, y: 0, ax: rng.range(120, W - 120), ay: rng.range(100, H - 100), a: 0, ph: rng() * TAU + i, sp: 0.5 + rng() * 0.4, alert: 0 })
      for (let i = 0; i < 3; i++) addGuard(i)
      sneakAdd = addGuard
    }
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
      if (!counting && time >= goal) { win(); return }
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
        if (e.bounce) {
          if (e.x < e.r || e.x > W - e.r) { e.vx = -e.vx; e.x = clamp(e.x, e.r, W - e.r); if (rng() < 0.06 && ents.length < 40) { const c = mk('bad', e.x, e.y, -e.vy, e.vx, e.e, e.r); c.bounce = true; ents.push(c) } }
          if (e.y < e.r || e.y > H - e.r) { e.vy = -e.vy; e.y = clamp(e.y, e.r, H - e.r) }
        }
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
          else if (e.kind === 'good' && counting) {
            e.y = 9999
            caught++
            combo++
            add(10 * (1 + Math.floor(combo / 5)))
            env.sfx('point')
            fx.burst(e.x, e.y, t.good, 10, 150, 3)
            status()
            if (caught >= goal) win()
          }
          else if (e.kind !== 'good' && inv <= 0) { hurt(e.x, e.y); if (e.kind === 'shrap') e.y = 9999 }
        } else if (e.kind === 'bad' && !e.seen && dd < e.r + hit + 16 && inv <= 0) {
          e.seen = true
          add(5)
        }
        if (!e.bounce && !(mode === 'sneak') && (e.x < -60 || e.x > W + 60 || e.y > H + 60 || e.y < -60)) e.y = 9999
        if (e.kind === 'good' && counting && mode === 'gather' && e.t > 14) e.y = 9999
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
      // closing walls
      for (const w of wallsA) {
        w.p += (120 + time * 1.2) * spd() * dt
        const along = [pl.y, W - pl.x, H - pl.y, pl.x][w.d]
        const cross = [pl.x, pl.y, W - pl.x, H - pl.y][w.d]
        if (Math.abs(along - w.p) < 12 + hit * 0.5 && (cross < w.g0 || cross > w.g1) && jump <= 0 && inv <= 0) hurt(pl.x, pl.y)
      }
      wallsA = wallsA.filter((w) => w.p < (w.d % 2 ? W : H) + 30)
      // spinning blades
      if (mode === 'spin') {
        const want = Math.min(3, 1 + Math.floor(time / 18))
        while (blades.length < want) blades.push({ cx: blades.length === 1 ? W * 0.25 : W * 0.75, cy: blades.length === 1 ? H * 0.3 : H * 0.7, a: 0, w: blades.length === 1 ? -1.4 : 1.7, len: Math.min(W, H) * 0.26 })
        for (const b of blades) {
          b.a += b.w * (1 + time / 90) * dt
          const x1 = b.cx + Math.cos(b.a) * b.len
          const y1 = b.cy + Math.sin(b.a) * b.len
          const x2 = b.cx - Math.cos(b.a) * b.len
          const y2 = b.cy - Math.sin(b.a) * b.len
          if (segDist(x1, y1, x2, y2, pl.x, pl.y) < 10 + hit * 0.5 && jump <= 0 && inv <= 0) hurt(pl.x, pl.y)
        }
      }
      // lightning strikes
      for (const sk of strikes) {
        if (sk.warn > 0) {
          sk.warn -= dt
          if (sk.warn <= 0) {
            shake.kick(6)
            env.sfx('boom')
            flash = Math.max(flash, 0.12)
            if (Math.hypot(pl.x - sk.x, pl.y - sk.y) < 40 + hit * 0.3 && jump <= 0 && inv <= 0) hurt(pl.x, pl.y)
          }
        } else sk.fire -= dt
      }
      strikes = strikes.filter((sk) => sk.warn > 0 || sk.fire > 0)
      // traffic lanes: cross the road for points
      if (mode === 'lanes' && pl.y < laneYs[0] - 40) {
        crossed++
        add(100)
        say(`CROSSED ${crossed}`)
        env.sfx('power')
        pl.y = H - 30
        tg.y = H - 30
      }
      // guards
      if (mode === 'sneak') {
        if (guards.length < Math.min(6, 3 + Math.floor(time / 25))) sneakAdd(guards.length)
        for (const g of guards) {
          const horiz = guards.indexOf(g) % 2 === 0
          const sw = Math.sin(time * g.sp + g.ph)
          g.x = horiz ? g.ax + sw * 120 : g.ax
          g.y = horiz ? g.ay : g.ay + sw * 90
          const base = horiz ? (Math.cos(time * g.sp + g.ph) > 0 ? 0 : Math.PI) + Math.PI / 2 * (g.ph > 3 ? 1 : -1) : (Math.cos(time * g.sp + g.ph) > 0 ? Math.PI / 2 : -Math.PI / 2)
          g.a = base + Math.sin(time * 1.9 + g.ph) * 0.5
          if (inCone(g.x, g.y, g.a, 0.4, 160, pl.x, pl.y) && jump <= 0) {
            g.alert += dt
            if (g.alert > 0.35 && inv <= 0) { hurt(pl.x, pl.y); g.alert = 0 }
          } else g.alert = Math.max(0, g.alert - dt * 2)
        }
      }
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
      if (!counting) {
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
      if (mode === 'lanes') {
        ctx.fillStyle = t.fg
        for (const y of laneYs) {
          ctx.globalAlpha = 0.08
          ctx.fillRect(0, y - 20, W, 40)
          ctx.globalAlpha = 0.25
          for (let x = (time * 20) % 40; x < W; x += 40) ctx.fillRect(x, y + 21, 18, 2)
        }
        ctx.globalAlpha = 0.5
        ctx.fillStyle = t.good
        ctx.fillRect(0, laneYs[0] - 52, W, 3)
        ctx.globalAlpha = 1
      }
      for (const w of wallsA) {
        const span = w.d % 2 ? H : W
        ctx.save()
        if (w.d === 1) { ctx.translate(W, 0); ctx.rotate(Math.PI / 2) }
        else if (w.d === 2) { ctx.translate(W, H); ctx.rotate(Math.PI) }
        else if (w.d === 3) { ctx.translate(0, H); ctx.rotate(-Math.PI / 2) }
        ctx.shadowColor = t.danger
        ctx.shadowBlur = 10
        ctx.fillStyle = t.danger
        ctx.fillRect(0, w.p - 10, w.g0, 20)
        ctx.fillRect(w.g1, w.p - 10, span - w.g1, 20)
        ctx.restore()
        ctx.shadowBlur = 0
      }
      for (const b of blades) {
        ctx.strokeStyle = t.danger
        ctx.shadowColor = t.danger
        ctx.shadowBlur = 10
        ctx.lineWidth = 8
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(b.cx - Math.cos(b.a) * b.len, b.cy - Math.sin(b.a) * b.len)
        ctx.lineTo(b.cx + Math.cos(b.a) * b.len, b.cy + Math.sin(b.a) * b.len)
        ctx.stroke()
        ctx.lineCap = 'butt'
        ctx.shadowBlur = 0
        emoji(ctx, t.foes[0], b.cx + Math.cos(b.a) * b.len, b.cy + Math.sin(b.a) * b.len, 26, b.a * 3)
        emoji(ctx, t.foes[0], b.cx - Math.cos(b.a) * b.len, b.cy - Math.sin(b.a) * b.len, 26, b.a * 3)
        ctx.fillStyle = t.fg
        ctx.beginPath()
        ctx.arc(b.cx, b.cy, 8, 0, TAU)
        ctx.fill()
      }
      for (const sk of strikes) {
        if (sk.warn > 0) {
          ctx.strokeStyle = t.danger
          ctx.lineWidth = 2
          ctx.globalAlpha = 0.5 + 0.4 * Math.sin(time * 28)
          ctx.beginPath()
          ctx.arc(sk.x, sk.y, 40, 0, TAU)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(sk.x, sk.y, 40 * Math.max(0, sk.warn), 0, TAU)
          ctx.stroke()
          ctx.globalAlpha = 1
        } else {
          ctx.fillStyle = '#fff'
          ctx.shadowColor = '#93c5fd'
          ctx.shadowBlur = 24
          ctx.globalAlpha = Math.min(1, sk.fire * 4)
          ctx.fillRect(sk.x - 9, 0, 18, sk.y)
          ctx.beginPath()
          ctx.arc(sk.x, sk.y, 42, 0, TAU)
          ctx.fill()
          ctx.globalAlpha = 1
          ctx.shadowBlur = 0
        }
      }
      for (const g of guards) {
        const al = Math.min(1, g.alert / 0.35)
        ctx.fillStyle = al > 0 ? t.danger : '#facc15'
        ctx.globalAlpha = 0.18 + al * 0.3
        ctx.beginPath()
        ctx.moveTo(g.x, g.y)
        ctx.arc(g.x, g.y, 160, g.a - 0.4, g.a + 0.4)
        ctx.closePath()
        ctx.fill()
        ctx.globalAlpha = 1
        emoji(ctx, t.foes[1 % t.foes.length], g.x, g.y, 28)
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
      const prog = clamp((counting ? caught : time) / goal, 0, 1)
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
        const how = catching ? 'MOUSE / ARROWS · CATCH GOOD · DODGE BAD' : mode === 'gather' ? 'MOVE · COLLECT THE GOOD · AVOID THE BAD' : mode === 'sneak' ? 'SNEAK PAST THE LIGHT · COLLECT · SPACE HIDES' : mode === 'walls' ? 'FIND THE GAP IN EACH WALL' : mode === 'spin' ? 'AVOID THE SPINNING BLADES' : mode === 'strike' ? 'LEAVE THE CIRCLE BEFORE IT STRIKES' : mode === 'lanes' ? 'CROSS THE ROAD · REACH THE TOP' : mode === 'bounce' ? 'DODGE THE BOUNCERS' : mode === 'zone' ? 'MOVE · STAY INSIDE THE CIRCLE' : mode === 'laser' ? 'MOVE · AVOID THE LASERS' : mode === 'rings' ? 'MOVE · SPACE TO JUMP RINGS' : 'MOVE WITH MOUSE / WASD · SURVIVE'
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
