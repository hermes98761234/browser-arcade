// Runner: side-scrolling endless runner (jump / double jump / duck), gravity-flip, dark and vertical "climb" variants.
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, pointer, roundRect, Shake, text, vpad, type Engine } from '../kit'

const H = 450
const GY = 370 // floor line
const CY = 78 // ceiling line (gravity mode)
const HX = 150 // hero x
const CITY = new Set(['neon', 'cyberpunk', 'robot', 'steampunk', 'space', 'retro', 'hero', 'wasteland', 'gems', 'school'])

type Kind = 'foe' | 'block' | 'fly' | 'pit' | 'spike'
interface Obs { kind: Kind; x: number; w: number; h: number; y: number; e: string; c: string; ceil: boolean; hit: boolean }
interface Coin { x: number; y: number; e: string; got: boolean }
interface Layer { f: number; shapes: [number, number, number][]; period: number; style: 'city' | 'hills'; color: string; alpha: number }

const engine: Engine = {
  start(env) {
    const { theme: t, rng, mods } = env
    const r0 = env.host.getBoundingClientRect()
    const asp = r0.width / Math.max(1, r0.height)
    const W = asp < 1.4 && r0.height > 50 ? clamp(Math.round(450 * asp), 300, 640) : 800
    const narrow = W < 700
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const k = keys()
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const ptr = pointer(st)
    const gravityMode = mods.has('gravity')
    const dark = mods.has('dark')
    const climb = mods.has('climb') || /balloon|vertical|float upward/.test(`${env.name} ${env.desc}`.toLowerCase())
    const endless = mods.has('endless')
    const wind = mods.has('wind')
    const text_ = `${env.name} ${env.desc}`.toLowerCase()
    const pitty = /roof|pier|lava|crust|train|ice|sand|volcano|bridge|glacier|hop/.test(text_)
    const baseSpeed = byDiff(env, 300, 345, 390) * (mods.has('fast') ? 1.22 : mods.has('slow') ? 0.85 : 1)
    const maxSpeed = baseSpeed * 2.1
    const goal = endless || climb ? 0 : byDiff(env, 1200, 2000, 3000)
    const maxLives = byDiff(env, 4, 3, 2)
    const dispVpad = vpad(env.host, k, 'none', gravityMode || climb ? [{ action: 'a', label: '⇅' }] : [{ action: 'down', label: '⤓' }, { action: 'a', label: '⤒' }])

    // ---------- state ----------
    let time = 0
    let speed = baseSpeed
    let dist = 0 // px
    let coinsGot = 0
    let combo = 0
    let comboT = 0
    let lives = maxLives
    let invuln = 0
    let over = false
    let score = 0
    let bonus = 0
    let nextX = 700 // next spawn x in world px
    let flash = 0
    let hint = 3.2
    const obs: Obs[] = []
    const coins: Coin[] = []

    // hero
    const hero = { y: GY, vy: 0, jumps: 0, ground: true, duck: false, sq: 1, coyote: 0, buf: 0, held: false, g: 1, rot: 0 }

    // parallax layers
    const style = CITY.has(t.id) ? 'city' : 'hills'
    const layers: Layer[] = [
      { f: 0.12, color: t.accent2, alpha: 0.2, h: 150 },
      { f: 0.3, color: t.accent, alpha: 0.2, h: 110 },
      { f: 0.55, color: '#000', alpha: 0.32, h: 70 },
    ].map((l) => {
      const shapes: [number, number, number][] = []
      const period = 1600
      if (style === 'city') {
        let x = 0
        while (x < period) {
          const w = rng.int(40, 110)
          shapes.push([x, w, rng.range(0.3, 1) * l.h * 1.5])
          x += w + rng.int(0, 14)
        }
      } else {
        const a = rng.range(0.5, 1.5)
        const b = rng.range(1, 3)
        for (let x = 0; x <= period; x += 40) shapes.push([x, 0, (0.55 + 0.25 * Math.sin((x / period) * Math.PI * 2 * Math.round(a * 2)) + 0.2 * Math.sin((x / period) * Math.PI * 2 * Math.round(b * 2) + 1)) * l.h * 1.6])
      }
      return { f: l.f, shapes, period, style, color: l.color, alpha: l.alpha }
    })
    const clouds = Array.from({ length: 7 }, () => ({ x: rng.range(0, W), y: rng.range(20, 200), e: rng.pick(t.items), s: rng.range(18, 34) }))

    // ---------- climb-mode state ----------
    const WL = W / 2 - 130
    const WR = W / 2 + 130
    const cl = { side: 0, x: WL + 36, tx: WL + 36, tr: 0, y: 330 }
    const cobs: { y: number; side: 0 | 1 | 2; e: string; hit: boolean }[] = []
    let cnextY = -300
    let cscroll = 0

    // ---------- helpers ----------
    const spawnCoins = (x: number, y: number, n: number, arc: number) => {
      const e = rng.pick(t.items)
      for (let i = 0; i < n; i++) {
        const u = n === 1 ? 0.5 : i / (n - 1)
        coins.push({ x: x + i * 38, y: y - Math.sin(u * Math.PI) * arc, e, got: false })
      }
    }
    const gapFor = () => {
      const base = clamp(speed * (0.95 + rng() * 0.8), 260, 1000)
      return base * byDiff(env, 1.25, 1, 0.88)
    }

    const spawn = () => {
      const lvl = clamp(dist / 3000, 0, 1) // 0..1 difficulty ramp
      if (gravityMode) {
        const ceil = rng.chance(0.5)
        const tall = rng.chance(0.3 + lvl * 0.3)
        const o: Obs = { kind: tall ? 'block' : 'spike', x: nextX, w: 44, h: tall ? rng.int(60, 110) : 40, y: ceil ? CY : GY, e: rng.pick(t.foes), c: rng.pick(t.blocks), ceil, hit: false }
        obs.push(o)
        if (rng.chance(0.25 + lvl * 0.3)) obs.push({ ...o, x: nextX + 56, ceil: !ceil, y: ceil ? GY : CY, e: rng.pick(t.foes), hit: false })
        spawnCoins(nextX - 60, (CY + GY) / 2, 3, 0)
        nextX += gapFor() * 0.85 + 90
        return
      }
      const r = rng()
      const pitP = pitty ? 0.3 : 0.1 + lvl * 0.08
      if (r < pitP) {
        const w = clamp(speed * 0.38 * rng.range(0.55, 0.95), 90, 230)
        obs.push({ kind: 'pit', x: nextX, w, h: 0, y: GY, e: '🔥', c: t.danger, ceil: false, hit: false })
        spawnCoins(nextX + 10, GY - 100, 4, 70)
        nextX += w + gapFor()
      } else if (r < pitP + 0.3) {
        const n = rng.int(1, lvl > 0.3 ? 3 : 2)
        const hh = rng.pick([40, 40, 80, ...(lvl > 0.25 ? [120] : [])])
        const x0 = nextX
        for (let i = 0; i < n; i++) obs.push({ kind: 'block', x: x0 + i * 44, w: 44, h: hh, y: GY, e: '', c: t.blocks[(i + Math.round(x0 / 100)) % t.blocks.length], ceil: false, hit: false })
        spawnCoins(x0 - 30, GY - hh - 40, 4 + n, 40 + hh * 0.3)
        nextX += n * 44 + gapFor()
      } else if (r < pitP + 0.58) {
        const n = rng.chance(0.25 + lvl * 0.35) ? 2 : 1
        for (let i = 0; i < n; i++) obs.push({ kind: 'foe', x: nextX + i * 70, w: 40, h: 42, y: GY, e: rng.pick(t.foes), c: '', ceil: false, hit: false })
        spawnCoins(nextX - 10, GY - 80, 3, 80)
        nextX += (n - 1) * 70 + gapFor()
      } else if (r < pitP + 0.8 || lvl < 0.05) {
        // flyer at head height: duck under it
        obs.push({ kind: 'fly', x: nextX, w: 46, h: 40, y: GY - 34, e: rng.pick(t.foes), c: '', ceil: false, hit: false })
        spawnCoins(nextX - 20, GY - 24, 4, 0)
        nextX += gapFor()
      } else {
        // combo: foe then flyer
        obs.push({ kind: 'foe', x: nextX, w: 40, h: 42, y: GY, e: rng.pick(t.foes), c: '', ceil: false, hit: false })
        obs.push({ kind: 'fly', x: nextX + clamp(speed * 0.75, 260, 520), w: 46, h: 40, y: GY - 34, e: rng.pick(t.foes), c: '', ceil: false, hit: false })
        nextX += clamp(speed * 0.75, 260, 520) + gapFor()
      }
    }

    const hurt = () => {
      if (invuln > 0 || over) return
      lives--
      combo = 0
      invuln = 1.6
      flash = 0.35
      speed = Math.max(baseSpeed, speed * 0.78)
      shake.kick(9)
      env.sfx('hit')
      fx.burst(HX, hero.y - 24, t.danger, 22, 260, 4)
      if (lives <= 0) finish(false)
    }

    const finish = (won: boolean) => {
      if (over) return
      over = true
      env.sfx(won ? 'win' : 'lose')
      env.end({ score, won, text: won ? `Goal reached! ${Math.floor(dist / 40)} m, ${coinsGot} pickups` : `Ran ${Math.floor(dist / 40)} m, ${coinsGot} pickups` })
    }

    const getCoin = (x: number, y: number) => {
      coinsGot++
      combo = comboT > 0 ? combo + 1 : 1
      comboT = 1.4
      bonus += 10 * Math.min(combo, 8)
      env.sfx('point')
      fx.burst(x, y, t.accent2, 8, 150, 3)
    }

    // ---------- input ----------
    const pressJump = () => {
      hero.buf = 0.13
      hero.held = true
    }
    let sy = 0
    bag.on(st.canvas, 'pointerdown', (e) => {
      if (e.button === 2) return
      sy = st.toLocal(e).y
      k.set('a', true)
    })
    bag.on(st.canvas, 'pointermove', (e) => {
      if (!ptr.down || gravityMode || climb) return
      if (st.toLocal(e).y - sy > 45) k.set('down', true)
    })
    const rel = () => {
      k.set('a', false)
      k.set('down', false)
    }
    bag.on(st.canvas, 'pointerup', rel)
    bag.on(st.canvas, 'pointercancel', rel)

    // ---------- update: horizontal ----------
    const updateRun = (dt: number) => {
      const jumpKey = k.down('a') || k.down('up')
      if (k.hit('a') || k.hit('up')) pressJump()
      if (!jumpKey) hero.held = false
      hero.buf -= dt
      hero.coyote -= dt

      if (gravityMode) {
        if (hero.buf > 0 && hero.ground) {
          hero.g = -hero.g
          hero.vy = hero.g * 120
          hero.ground = false
          hero.buf = 0
          env.sfx('jump')
          fx.burst(HX, hero.y, t.accent, 10, 150)
        }
        hero.vy += hero.g * 3300 * dt
        hero.y += hero.vy * dt
        const floorY = GY
        const ceilY = CY
        if (hero.g > 0 && hero.y >= floorY) {
          if (!hero.ground) { hero.sq = 0.6; shake.kick(2); fx.burst(HX, floorY, t.fg, 6, 120, 2) }
          hero.y = floorY; hero.vy = 0; hero.ground = true
        } else if (hero.g < 0 && hero.y <= ceilY) {
          if (!hero.ground) { hero.sq = 0.6; shake.kick(2); fx.burst(HX, ceilY, t.fg, 6, 120, 2) }
          hero.y = ceilY; hero.vy = 0; hero.ground = true
        } else hero.ground = false
        return
      }

      hero.duck = (k.down('down') || k.down('KeyS')) && hero.ground
      // variable-height jump
      if (hero.buf > 0 && (hero.ground || hero.coyote > 0)) {
        hero.vy = -745
        hero.ground = false
        hero.coyote = 0
        hero.jumps = 1
        hero.buf = 0
        hero.sq = 1.35
        env.sfx('jump')
        fx.burst(HX, hero.y, t.fg, 6, 110, 2)
      } else if (hero.buf > 0 && !hero.ground && hero.jumps < 2) {
        hero.vy = -690
        hero.jumps = 2
        hero.buf = 0
        hero.sq = 1.3
        env.sfx('power')
        fx.burst(HX, hero.y - 10, t.accent, 12, 160, 3)
      }
      if (!hero.ground && (k.down('down') || k.down('KeyS'))) hero.vy += 3400 * dt // fast fall
      const g = hero.vy < 0 && hero.held ? 1500 : hero.vy < 0 ? 3200 : 2300
      hero.vy += g * dt
      const prevB = hero.y
      hero.y += hero.vy * dt
      // landing on blocks
      let support = GY
      let supported = false
      const hw = 15
      for (const o of obs) {
        if (o.kind !== 'block' || o.x > HX + hw || o.x + o.w < HX - hw) continue
        const top = o.y - o.h
        if (hero.vy >= 0 && prevB <= top + 8 && hero.y >= top) {
          support = Math.min(support, top)
          supported = true
        }
      }
      // pits: no floor beneath
      let overPit = false
      for (const o of obs) if (o.kind === 'pit' && HX + 8 > o.x + 4 && HX - 8 < o.x + o.w - 4) overPit = true
      const floor = supported ? support : overPit ? 99999 : GY
      if (hero.y >= floor) {
        if (!hero.ground) {
          hero.sq = 0.62
          fx.burst(HX, floor, t.fg, 7, 130, 2)
          if (hero.vy > 600) shake.kick(2)
        }
        hero.y = floor
        hero.vy = 0
        hero.ground = true
        hero.jumps = 0
        hero.coyote = 0.09
      } else {
        if (hero.ground) hero.coyote = 0.09
        hero.ground = false
      }
      if (overPit && hero.y > GY + 60) {
        // fell into a pit: lose a life, respawn on solid ground
        hurt()
        if (!over) {
          const next = obs.filter((o) => o.kind === 'pit' && o.x + o.w > HX - 10).sort((a, b) => a.x - b.x)[0]
          const shift = next ? next.x + next.w + 40 - HX : 100
          for (const o of obs) o.x -= shift
          for (const c of coins) c.x -= shift
          nextX -= shift
          hero.y = GY
          hero.vy = 0
          hero.ground = true
        }
      }
    }

    const heroBox = () => {
      if (gravityMode) {
        return hero.g > 0 ? { x: HX - 14, y: hero.y - 46, w: 28, h: 44 } : { x: HX - 14, y: hero.y + 2, w: 28, h: 44 }
      }
      const hh = hero.duck ? 22 : 44
      return { x: HX - 14, y: hero.y - hh - 2, w: 28, h: hh }
    }

    const collide = () => {
      const b = heroBox()
      for (const o of obs) {
        if (o.hit || o.kind === 'pit') continue
        const top = o.ceil ? o.y : o.y - o.h
        const ox = o.x + 5
        const ow = o.w - 10
        const oy = top + (o.kind === 'block' ? 0 : 5)
        const oh = o.h - (o.kind === 'block' ? 0 : 9)
        if (b.x < ox + ow && b.x + b.w > ox && b.y < oy + oh && b.y + b.h > oy) {
          // standing on top of a block is safe
          if (o.kind === 'block' && hero.ground && Math.abs(b.y + b.h - oy) < 10) continue
          hurt()
          o.hit = true
        }
      }
      for (const c of coins) {
        if (c.got) continue
        if (Math.abs(c.x - HX) < 28 && Math.abs(c.y - (b.y + b.h / 2)) < 36) {
          c.got = true
          getCoin(c.x, c.y)
        }
      }
    }

    // ---------- update: climb ----------
    const updateClimb = (dt: number) => {
      let want = cl.side
      if (k.hit('left')) want = 0
      if (k.hit('right')) want = 1
      if (k.hit('a') || k.hit('up')) want = 1 - cl.side
      if (want !== cl.side) {
        cl.side = want
        cl.tx = want === 0 ? WL + 36 : WR - 36
        env.sfx('jump')
        fx.burst(cl.x, cl.y, t.fg, 8, 140, 2)
      }
      cl.x += (cl.tx - cl.x) * Math.min(1, dt * 16)
      cscroll += speed * dt
      while (cnextY > -cscroll - 700) {
        const side = rng.pick([0, 1, 2, 0, 1] as const)
        cobs.push({ y: cnextY, side, e: rng.pick(t.foes), hit: false })
        if (rng.chance(0.7)) {
          const cs = side === 2 ? rng.pick([0, 1]) : 1 - side
          for (let i = 0; i < 3; i++) coins.push({ x: cs === 0 ? WL + 36 : WR - 36, y: cnextY - 40 - i * 36, e: rng.pick(t.items), got: false })
        }
        cnextY -= clamp(speed * rng.range(0.6, 1.0), 200, 520) * byDiff(env, 1.3, 1.05, 0.9)
      }
    }

    // ---------- main update ----------
    const update = (dt: number) => {
      time += dt
      hint = Math.max(0, hint - dt)
      fx.update(dt, 400)
      shake.update(dt)
      flash = Math.max(0, flash - dt)
      hero.sq += (1 - hero.sq) * Math.min(1, dt * 12)
      if (over) return
      invuln = Math.max(0, invuln - dt)
      comboT -= dt
      if (comboT <= 0) combo = 0
      speed = Math.min(maxSpeed, speed + (gravityMode ? 5 : 7) * dt * byDiff(env, 0.8, 1, 1.15))
      if (wind) speed += Math.sin(time * 0.7) * 0.8
      if (climb) {
        updateClimb(dt)
        dist += speed * dt
        doClimbCollisions()
      } else {
        updateRun(dt)
        dist += speed * dt
        for (const o of obs) o.x -= speed * dt
        for (const c of coins) c.x -= speed * dt
        nextX -= speed * dt
        while (nextX < W + 300) spawn()
        while (obs.length && obs[0].x + obs[0].w < -80) obs.shift()
        while (coins.length && coins[0].x < -50) coins.shift()
        collide()
      }
      if (!climb && !gravityMode && hero.ground && time % 0.1 < dt && !hero.duck) fx.burst(HX - 10, hero.y, t.fg, 1, 60, 2)
      if (hero.duck && hero.ground && Math.random() < 0.5) fx.burst(HX - 14, hero.y, t.accent2, 1, 80, 2)
      score = Math.floor(dist / 40) + bonus
      env.score(score)
      env.status(`${'❤️'.repeat(Math.max(0, lives))} · ${Math.floor(dist / 40)} m${goal ? ` / ${goal}` : ''}${combo > 2 ? ` · x${combo}` : ''}`)
      if (goal && dist / 40 >= goal) finish(true)
    }

    // ---------- draw ----------
    const drawBackground = () => {
      background(ctx, W, H, t, 36, env.seed)
      // sun / moon
      ctx.globalAlpha = 0.22
      ctx.fillStyle = t.accent2
      ctx.beginPath()
      ctx.arc(W * 0.75, 130, 62, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 0.14
      for (const c of clouds) {
        const x = (((c.x - dist * 0.04) % (W + 80)) + W + 80) % (W + 80) - 40
        emoji(ctx, c.e, x, c.y, c.s)
      }
      ctx.globalAlpha = 1
      for (const l of layers) {
        const off = (dist * l.f) % l.period
        ctx.fillStyle = l.color
        ctx.globalAlpha = l.alpha
        for (let rep = -1; rep < Math.ceil(W / l.period) + 1; rep++) {
          const bx = rep * l.period - off
          if (l.style === 'city') {
            for (const [x, w, h] of l.shapes) {
              const px = bx + x
              if (px > W || px + w < 0) continue
              ctx.fillRect(px, GY - h, w, h + 4)
            }
          } else {
            ctx.beginPath()
            ctx.moveTo(bx, GY + 4)
            for (const [x, , h] of l.shapes) ctx.lineTo(bx + x, GY - h)
            ctx.lineTo(bx + l.period, GY + 4)
            ctx.closePath()
            ctx.fill()
          }
        }
      }
      ctx.globalAlpha = 1
    }

    const drawHero = (x: number, y: number, flip: boolean, duck: boolean, rot = 0) => {
      const s = hero.sq
      const size = 52
      ctx.save()
      ctx.translate(x, y)
      if (flip) ctx.scale(1, -1)
      ctx.scale(duck ? 1.25 : 1 / Math.sqrt(s), duck ? 0.55 : s)
      const bob = hero.ground && !duck && !climb ? Math.abs(Math.sin(time * 14)) * -4 : 0
      ctx.translate(0, bob)
      if (rot) ctx.rotate(rot)
      emoji(ctx, t.hero, 0, -size / 2 + 4, size)
      ctx.restore()
    }

    const drawRun = () => {
      // floor
      const topY = GY + 2
      const g = ctx.createLinearGradient(0, topY, 0, H)
      g.addColorStop(0, t.blocks[0])
      g.addColorStop(1, t.bg2)
      ctx.fillStyle = g
      // floor with pits cut out
      ctx.fillRect(0, topY, W, H - topY)
      ctx.fillStyle = 'rgba(0,0,0,.28)'
      ctx.fillRect(0, topY, W, 5)
      const st0 = (dist % 80)
      ctx.fillStyle = 'rgba(255,255,255,.1)'
      for (let x = -st0; x < W; x += 80) ctx.fillRect(x, topY + 22, 40, 4)
      for (let x = -((dist * 1.3) % 160); x < W; x += 160) ctx.fillRect(x, topY + 52, 70, 3)
      if (gravityMode) {
        const cg = ctx.createLinearGradient(0, 0, 0, CY)
        cg.addColorStop(0, t.bg2)
        cg.addColorStop(1, t.blocks[0])
        ctx.fillStyle = cg
        ctx.fillRect(0, 0, W, CY)
        ctx.fillStyle = 'rgba(0,0,0,.28)'
        ctx.fillRect(0, CY - 5, W, 5)
      }
      for (const o of obs) {
        if (o.x > W + 60) continue
        if (o.kind === 'pit') {
          const pg = ctx.createLinearGradient(0, GY, 0, H)
          pg.addColorStop(0, '#000')
          pg.addColorStop(1, t.danger)
          ctx.fillStyle = pg
          ctx.fillRect(o.x, GY, o.w, H - GY)
          ctx.globalAlpha = 0.8
          for (let i = 0; i < o.w / 30; i++) emoji(ctx, o.e, o.x + 15 + i * 30, H - 28 + Math.sin(time * 6 + i) * 4, 22)
          ctx.globalAlpha = 1
        } else if (o.kind === 'block') {
          const top = o.ceil ? o.y : o.y - o.h
          ctx.shadowColor = o.c
          ctx.shadowBlur = 6
          roundRect(ctx, o.x + 1, top, o.w - 2, o.h, 6, o.c)
          ctx.shadowBlur = 0
          ctx.fillStyle = 'rgba(255,255,255,.22)'
          ctx.fillRect(o.x + 4, top + 3, o.w - 8, 4)
          ctx.strokeStyle = 'rgba(0,0,0,.3)'
          ctx.lineWidth = 2
          ctx.strokeRect(o.x + 3, top + 3, o.w - 6, o.h - 6)
        } else {
          const bobY = o.kind === 'fly' ? Math.sin(time * 5 + o.x * 0.02) * 5 : 0
          const cy = o.ceil ? o.y + o.h / 2 : o.y - o.h / 2 + bobY
          ctx.save()
          ctx.translate(o.x + o.w / 2, cy)
          if (o.ceil) ctx.scale(1, -1)
          ctx.shadowColor = t.danger
          ctx.shadowBlur = 8
          emoji(ctx, o.e, 0, 0, o.kind === 'fly' ? 46 : 44)
          ctx.shadowBlur = 0
          ctx.restore()
        }
      }
      for (const c of coins) {
        if (c.got || c.x > W + 30) continue
        const sc = 1 + Math.sin(time * 8 + c.x * 0.05) * 0.1
        ctx.shadowColor = t.accent2
        ctx.shadowBlur = 8
        emoji(ctx, c.e, c.x, c.y, 26 * sc)
        ctx.shadowBlur = 0
      }
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,.3)'
      const sh = clamp(1 - (GY - hero.y) / 260, 0.3, 1)
      if (!gravityMode) {
        ctx.beginPath()
        ctx.ellipse(HX, GY + 3, 20 * sh, 5 * sh, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      if (invuln <= 0 || Math.floor(time * 18) % 2 === 0) drawHero(HX, hero.y, hero.g < 0, hero.duck)
    }

    // climb drawing & collision (screen space: height h -> y = cl.y + cscroll + h; obstacles have negative h)
    const climbScreenY = (h: number) => cl.y + cscroll + h
    const doClimbCollisions = () => {
      for (const o of cobs) {
        if (o.hit) continue
        const y = climbScreenY(o.y)
        if (Math.abs(y - (cl.y - 24)) > 34) continue
        const onWall = o.side === 2 ? false : o.side === cl.side && Math.abs(cl.x - cl.tx) < 30
        const centerHit = o.side === 2 && Math.abs(cl.x - (WL + WR) / 2) < 70
        const wallHitWhileMoving = o.side !== 2 && o.side === cl.side && Math.abs(cl.x - cl.tx) < 70
        if (onWall || centerHit || wallHitWhileMoving) {
          o.hit = true
          hurt()
        }
      }
      for (const c of coins) {
        if (c.got) continue
        const y = climbScreenY(c.y)
        if (Math.abs(y - (cl.y - 24)) < 32 && Math.abs(c.x - cl.x) < 40) {
          c.got = true
          getCoin(c.x, y)
        }
      }
      while (cobs.length && climbScreenY(cobs[0].y) > H + 80) cobs.shift()
      while (coins.length && climbScreenY(coins[0].y) > H + 60) coins.shift()
    }

    const drawClimb = () => {
      // shaft
      ctx.fillStyle = 'rgba(0,0,0,.35)'
      ctx.fillRect(WL, 0, WR - WL, H)
      for (const [x, w] of [[WL - 60, 60], [WR, 60]]) {
        ctx.fillStyle = t.blocks[0]
        ctx.globalAlpha = 0.55
        ctx.fillRect(x, 0, w, H)
        ctx.globalAlpha = 1
        ctx.fillStyle = 'rgba(255,255,255,.12)'
        for (let y = -((cscroll) % 70); y < H; y += 70) ctx.fillRect(x, y, w, 4)
      }
      ctx.strokeStyle = t.accent
      ctx.globalAlpha = 0.4
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(WL, 0); ctx.lineTo(WL, H); ctx.moveTo(WR, 0); ctx.lineTo(WR, H)
      ctx.stroke()
      ctx.globalAlpha = 1
      for (const o of cobs) {
        const y = climbScreenY(o.y)
        if (y < -60 || y > H + 60) continue
        const x = o.side === 0 ? WL + 22 : o.side === 1 ? WR - 22 : (WL + WR) / 2
        ctx.shadowColor = t.danger
        ctx.shadowBlur = 10
        emoji(ctx, o.e, x, y, o.side === 2 ? 58 : 46)
        ctx.shadowBlur = 0
      }
      for (const c of coins) {
        if (c.got) continue
        const y = climbScreenY(c.y)
        if (y < -30 || y > H + 30) continue
        ctx.shadowColor = t.accent2
        ctx.shadowBlur = 8
        emoji(ctx, c.e, c.x, y, 26)
        ctx.shadowBlur = 0
      }
      ctx.save()
      ctx.translate(cl.x, cl.y)
      if (invuln <= 0 || Math.floor(time * 18) % 2 === 0) {
        ctx.scale(cl.side === 0 ? -1 : 1, 1)
        ctx.rotate(Math.max(-0.3, Math.min(0.3, (cl.tx - cl.x) * 0.004)))
        emoji(ctx, t.hero, 0, -26, 52)
      }
      ctx.restore()
    }

    const draw = () => {
      ctx.save()
      shake.apply(ctx)
      if (climb) {
        background(ctx, W, H, t, 40, env.seed)
        // parallax shaft backdrop
        ctx.globalAlpha = 0.2
        ctx.fillStyle = t.accent2
        for (let i = 0; i < 6; i++) ctx.fillRect(40 + i * 8, ((i * 97 + cscroll * 0.2) % (H + 60)) - 30, 3, 60)
        for (let i = 0; i < 6; i++) ctx.fillRect(W - 90 + i * 12, ((i * 61 + cscroll * 0.3) % (H + 60)) - 30, 3, 60)
        ctx.globalAlpha = 1
        drawClimb()
      } else {
        drawBackground()
        drawRun()
      }
      fx.draw(ctx)
      // speed lines
      if (speed > baseSpeed * 1.25 && !climb) {
        ctx.strokeStyle = t.fg
        ctx.globalAlpha = clamp((speed / baseSpeed - 1.2) * 0.2, 0, 0.3)
        ctx.lineWidth = 2
        for (let i = 0; i < 9; i++) {
          const y = ((i * 53 + time * 400) % (GY - 20)) + 10
          const x = ((i * 211 - dist * 1.8) % (W + 200) + W + 200) % (W + 200) - 100
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + 60 + speed * 0.1, y)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }
      if (wind) {
        ctx.strokeStyle = t.fg
        ctx.globalAlpha = 0.15
        for (let i = 0; i < 6; i++) {
          const x = (((i * 170 - time * 700) % (W + 100)) + W + 100) % (W + 100) - 50
          const y = 30 + ((i * 71) % 300)
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.quadraticCurveTo(x + 30, y - 8, x + 60, y)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }
      if (dark) {
        const hx = climb ? cl.x : HX + 40
        const hy = climb ? cl.y - 40 : hero.y - 30
        const gr = ctx.createRadialGradient(hx, hy, 110, hx + 40, hy, 430)
        gr.addColorStop(0, 'rgba(0,0,0,0)')
        gr.addColorStop(1, 'rgba(0,0,0,0.95)')
        ctx.fillStyle = gr
        ctx.fillRect(-20, -20, W + 40, H + 40)
      }
      ctx.restore()
      if (flash > 0) {
        ctx.fillStyle = t.danger
        ctx.globalAlpha = flash * 0.7
        ctx.fillRect(0, 0, W, H)
        ctx.globalAlpha = 1
      }
      // HUD
      text(ctx, `${score}`, W - 16, 24, { size: 20, color: t.fg, align: 'right', shadow: t.bg })
      text(ctx, '❤️'.repeat(Math.max(0, lives)), 16, 24, { size: 18, align: 'left' })
      if (goal) {
        const p = clamp(dist / 40 / goal, 0, 1)
        ctx.fillStyle = 'rgba(0,0,0,.35)'
        ctx.fillRect(16, 44, 200, 6)
        ctx.fillStyle = t.good
        ctx.fillRect(16, 44, 200 * p, 6)
        emoji(ctx, '🏁', 16 + 200 * p, 47, 16)
      }
      if (combo > 2) text(ctx, `x${combo}`, W - 16, 52, { size: 16, color: t.accent2, align: 'right' })
      if (hint > 0 && !over) {
        ctx.globalAlpha = Math.min(1, hint)
        text(ctx, env.name.toUpperCase(), W / 2, 150, { size: narrow ? 14 : 22, color: t.fg, shadow: t.accent })
        const hs = gravityMode ? ['TAP / SPACE: FLIP GRAVITY'] : climb ? ['TAP / SPACE: SWITCH WALL'] : narrow ? ['TAP: JUMP (HOLD = HIGHER)', 'TWICE = DOUBLE  SWIPE DOWN: DUCK'] : ['SPACE / TAP: JUMP (HOLD = HIGHER, TWICE = DOUBLE)   DOWN: DUCK']
        hs.forEach((l, i) => text(ctx, l, W / 2, 190 + i * 20, { size: narrow ? 9 : 11, color: t.fg }))
        ctx.globalAlpha = 1
      }
    }

    const lp = loop(update, draw)
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
