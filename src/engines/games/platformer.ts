// Platformer: procedurally generated, solvable levels with patrolling enemies, stars, a goal flag and lives.
// Mods: climb (vertical tower + wall-jump + rising lava), grapple (hook to anchors), ice, gravity (flip switches),
// dark (light radius), key (key + locked door), timer, wind, fast, swim / "moon" (low gravity), "cloud/sky" (one-way islands).
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, pointer, Shake, text, vpad, type Engine } from '../kit'
import { genLevel, T, tileAt, type Level } from '../logic/platformer'

const H = 450
const TS = 32
const HW = 10
const HH = 14
const STEP = 1 / 120
const CITY = new Set(['neon', 'cyberpunk', 'robot', 'steampunk', 'space', 'retro', 'hero', 'wasteland', 'gems', 'school'])

interface Foe { x: number; y: number; by: number; kind: 'walk' | 'fly' | 'spiky'; dir: number; x0: number; x1: number; e: string; dead: number; t: number }
interface Star { x: number; y: number; got: boolean }

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
    const blurb = `${env.name} ${env.desc}`.toLowerCase()
    // keyword routing so games without the catalog mod still get the right sub-mode
    const climb = mods.has('climb') || (!mods.has('grapple') && /climb|ascent|scramble|ladder|summit|stairs|cliff|bouldering|ascend|chimney/.test(blurb))
    const grapple = mods.has('grapple') || (!climb && /swing|grapple|hook|vine|whip|tether|zipline|pendulum/.test(blurb) && !/fish|ship|pirate/.test(blurb))
    const ice = mods.has('ice') || /\bice\b|glacier|frozen/.test(blurb)
    const flipMod = mods.has('gravity') && !/moon|low-gravity/.test(blurb)
    const dark = mods.has('dark') || /cave|abyss|lantern|night|firefly|echo|sonar|hollow/.test(blurb)
    const needKey = mods.has('key') || /metroid|unlock|abilit|powers|upgrade|regains|gains|salvage|possess|spells|restore|reveal|explor|map fits|rooms|shrine/.test(blurb)
    const timed = mods.has('timer')
    const wind = mods.has('wind')
    const endless = mods.has('endless')
    const sky = /cloud|sky|float|island/.test(blurb)
    const lowG = (mods.has('gravity') && /moon|low-gravity/.test(blurb)) || mods.has('swim') || /moon|low-gravity/.test(blurb)
    const gscale = lowG ? 0.55 : 1
    const runMax = 200 * (mods.has('fast') ? 1.2 : 1) * (mods.has('slow') ? 0.85 : 1)
    const totalLevels = endless ? 999 : byDiff(env, 4, 5, 6)
    const city = CITY.has(t.id)
    const dispVpad = vpad(env.host, k, 'lr', grapple ? [{ action: 'b', label: '⚓' }, { action: 'a', label: '⤒' }] : [{ action: 'a', label: '⤒' }])

    // ---------- state ----------
    let level = 1
    let lv: Level
    let foes: Foe[] = []
    let stars: Star[] = []
    let keyPos: { x: number; y: number } | null = null
    let hasKey = false
    let cpIdx = 0
    let lives = byDiff(env, 5, 4, 3)
    let score = 0
    let starsGot = 0
    let time = 0
    let timeLeft = 0
    let over = false
    let phase: 'play' | 'dead' | 'clear' | 'intro' = 'intro'
    let phaseT = 0
    let invuln = 0
    let chain = 0
    let flash = 0
    let hint = 4
    let lavaY = 99999
    let lavaDelay = 0
    let camX = 0
    let camY = 0
    let accum = 0
    let flipCd = 0
    let ropeKey = false

    const hero = { x: 0, y: 0, vx: 0, vy: 0, gd: 1, ground: false, face: 1, coyote: 0, buf: 0, cut: false, wall: 0, wallT: 0, lock: 0, drop: 0, sq: 1, rope: null as null | { x: number; y: number; len: number }, ropeLen: 0, airJump: false }

    // background silhouettes
    const hills = [0, 1].map(() => ({ ph: rng.range(0, 6), f: rng.range(1.5, 3.5), a: rng.range(0.6, 1) }))
    const blds = Array.from({ length: 40 }, () => ({ w: rng.int(40, 100), h: rng.range(50, 190) }))
    const clouds = Array.from({ length: 8 }, () => ({ x: rng.range(0, 1600), y: rng.range(20, 210), e: rng.pick(t.items), s: rng.range(18, 32) }))

    // ---------- level setup ----------
    const startLevel = () => {
      lv = genLevel(rng, { level, diff: env.difficulty, climb, grapple, gravity: flipMod, key: needKey, sky })
      foes = lv.walkers.map((w) => ({ x: w.x * TS, y: w.y * TS + TS / 2, by: w.y * TS + TS / 2, kind: w.kind, dir: rng() < 0.5 ? -1 : 1, x0: w.x0 * TS, x1: w.x1 * TS, e: rng.pick(t.foes), dead: 0, t: rng.range(0, 6) }))
      stars = lv.stars.map((s) => ({ x: s.x * TS + TS / 2, y: s.y * TS + TS / 2, got: false }))
      keyPos = lv.key ? { x: lv.key.x * TS + TS / 2, y: lv.key.y * TS + TS / 2 } : null
      hasKey = false
      cpIdx = 0
      starsGot = 0
      chain = 0
      timeLeft = timed ? Math.round(lv.w * (climb ? 1.6 : 0.55) * byDiff(env, 1.5, 1.2, 1)) + 20 : 0
      lavaY = climb ? (lv.spawn.y + 1) * TS + 8 * TS : 99999
      lavaDelay = 5
      respawn(true)
      phase = 'intro'
      phaseT = 0
    }

    const respawn = (first = false) => {
      const cp = lv.checkpoints[cpIdx]
      hero.x = cp.x * TS + TS / 2
      hero.y = cp.y * TS + TS - HH
      hero.vx = hero.vy = 0
      hero.gd = 1
      hero.rope = null
      hero.sq = 1
      hero.ground = false
      invuln = first ? 0.6 : 1.8
      if (climb) lavaY = Math.max(lavaY, cp.y * TS + TS + 7 * TS)
      camX = hero.x - W / 2
      camY = hero.y - 290
    }

    const finish = (won: boolean) => {
      if (over) return
      over = true
      env.sfx(won ? 'win' : 'lose')
      env.end({ score, won, text: won ? `All ${totalLevels} levels cleared!` : `Reached level ${level}, ${starsGot} stars on the last one` })
    }

    const hud = () => {
      env.score(score)
      env.status(`Level ${level}${endless ? '' : `/${totalLevels}`} · ${'❤️'.repeat(Math.max(0, lives))} · ⭐ ${starsGot}/${stars.length}${hasKey ? ' · 🔑' : ''}${timed ? ` · ${Math.ceil(timeLeft)}s` : ''}`)
    }

    const die = (why: 'hit' | 'pit' | 'lava' | 'time') => {
      if (phase !== 'play') return
      lives--
      chain = 0
      env.sfx('hit')
      shake.kick(why === 'pit' ? 4 : 9)
      fx.burst(hero.x, hero.y, t.danger, 26, 280, 4)
      hero.rope = null
      flash = 0.3
      phase = 'dead'
      phaseT = 0
      if (why === 'time') timeLeft = Math.round(timeLeft + 25)
      if (lives <= 0) finish(false)
      hud()
    }

    // ---------- tiles & collision ----------
    const tile = (tx: number, ty: number) => tileAt(lv, tx, ty)
    const solidT = (v: number) => v === T.SOLID || (v === T.DOOR && !hasKey)
    const setTile = (tx: number, ty: number, v: number) => {
      if (tx >= 0 && tx < lv.w && ty >= 0 && ty < lv.h) lv.tiles[ty * lv.w + tx] = v
    }

    const moveX = (dx: number) => {
      if (dx === 0) return
      hero.x += dx
      const ty0 = Math.floor((hero.y - HH + 0.01) / TS)
      const ty1 = Math.floor((hero.y + HH - 0.01) / TS)
      const tx = Math.floor((hero.x + (dx > 0 ? HW : -HW)) / TS)
      for (let ty = ty0; ty <= ty1; ty++) {
        const v = tile(tx, ty)
        if (solidT(v)) {
          hero.x = dx > 0 ? tx * TS - HW - 0.001 : (tx + 1) * TS + HW + 0.001
          hero.vx = 0
          hero.wall = dx > 0 ? 1 : -1
          hero.wallT = 0.1
          return
        }
        if (v === T.DOOR && hasKey) {
          for (let yy = 0; yy < lv.h; yy++) if (tile(tx, yy) === T.DOOR) setTile(tx, yy, T.AIR)
        }
      }
    }
    const moveY = (dy: number) => {
      if (dy === 0) return
      const prevY = hero.y
      hero.y += dy
      const tx0 = Math.floor((hero.x - HW + 0.01) / TS)
      const tx1 = Math.floor((hero.x + HW - 0.01) / TS)
      if (dy > 0) {
        const ty = Math.floor((hero.y + HH) / TS)
        for (let tx = tx0; tx <= tx1; tx++) {
          const v = tile(tx, ty)
          const oneway = v === T.ONEWAY && hero.gd === 1 && hero.drop <= 0 && prevY + HH <= ty * TS + 1.2
          if (solidT(v) || oneway) {
            hero.y = ty * TS - HH - 0.001
            if (hero.gd === 1) hero.ground = true
            hero.vy = Math.min(hero.vy, 0)
            return
          }
        }
      } else {
        const ty = Math.floor((hero.y - HH) / TS)
        for (let tx = tx0; tx <= tx1; tx++) {
          if (solidT(tile(tx, ty))) {
            hero.y = (ty + 1) * TS + HH + 0.001
            if (hero.gd === -1) hero.ground = true
            hero.vy = Math.max(hero.vy, 0)
            return
          }
        }
      }
    }

    // ---------- grapple ----------
    const nearestAnchor = (px: number, py: number, range: number, bias = 0) => {
      let best: { x: number; y: number } | null = null
      let bd = 1e9
      for (const a of lv.anchors) {
        const ax = a.x * TS
        const ay = a.y * TS
        const d = Math.hypot(ax - hero.x, ay - hero.y)
        if (d > range) continue
        const score2 = Math.hypot(ax - px, ay - py) - (ax - hero.x) * hero.face * bias * 0.15
        if (score2 < bd) {
          bd = score2
          best = { x: ax, y: ay }
        }
      }
      return best
    }
    const attach = (px?: number, py?: number) => {
      if (!grapple || hero.rope || phase !== 'play') return
      const a = nearestAnchor(px ?? hero.x + hero.face * 90, py ?? hero.y - 130, 320, px === undefined ? 1 : 0)
      if (!a) return
      hero.rope = { x: a.x, y: a.y, len: Math.max(70, Math.hypot(a.x - hero.x, a.y - hero.y)) }
      if (Math.abs(hero.vx) < 140) hero.vx = hero.face * 160
      env.sfx('shoot')
      fx.burst(a.x, a.y, t.accent, 10, 160, 3)
    }
    const detach = (boost = false) => {
      if (!hero.rope) return
      hero.rope = null
      if (boost) hero.vy -= 160 * hero.gd
    }
    if (grapple) {
      ptr.onDown((p) => {
        if (p.button === 2) return
        attach(p.x + camX - (climb ? (W - lv.w * TS) / 2 : 0), p.y + camY)
      })
      ptr.onUp(() => detach())
    }

    // ---------- physics step ----------
    const stepHero = (dt: number) => {
      const ax = k.axis().x
      if (ax !== 0) hero.face = ax
      const jumpDown = k.down('a') || k.down('up')
      const grounded = hero.ground
      hero.coyote = grounded ? 0.1 : hero.coyote - dt
      hero.buf -= dt
      hero.wallT -= dt
      hero.lock -= dt
      hero.drop -= dt
      flipCd -= dt
      if (k.down('down') && grounded) hero.drop = 0.18
      if (!jumpDown && hero.vy * hero.gd < 0 && !hero.cut && !hero.rope) {
        hero.cut = true
        hero.vy *= 0.5
      }
      if (grounded) hero.cut = false
      // horizontal
      const accel = hero.lock > 0 ? 500 : grounded ? (ice ? 240 : 2200) : ice ? 320 : 1200
      const target = ax * runMax
      const turning = ax !== 0 && Math.sign(hero.vx) === -ax
      const rate = (ax === 0 ? (grounded ? (ice ? 90 : 2400) : 260) : accel) * (turning && !ice ? 1.8 : 1)
      if (hero.lock <= 0 || ax !== 0) {
        if (hero.vx < target) hero.vx = Math.min(target, hero.vx + rate * dt)
        else if (hero.vx > target) hero.vx = Math.max(target, hero.vx - rate * dt)
      }
      if (wind) hero.vx += Math.sin(time * 0.5) * 140 * dt
      if (hero.rope && !grounded) hero.vx += ax * 520 * dt
      // jump
      if (k.hit('a') || k.hit('up')) hero.buf = 0.12
      if (hero.buf > 0) {
        if (hero.rope) {
          detach(true)
          hero.buf = 0
          env.sfx('jump')
        } else if (hero.coyote > 0) {
          hero.vy = -520 * hero.gd * (lowG ? 0.85 : 1)
          hero.buf = 0
          hero.coyote = 0
          hero.ground = false
          hero.sq = 1.35
          hero.cut = false
          env.sfx('jump')
          fx.burst(hero.x, hero.y + HH * hero.gd, t.fg, 6, 100, 2)
        } else if (climb && hero.wallT > 0 && !grounded) {
          hero.vx = -hero.wall * 250
          hero.vy = -500 * hero.gd
          hero.lock = 0.16
          hero.face = -hero.wall
          hero.buf = 0
          hero.cut = false
          hero.sq = 1.3
          env.sfx('jump')
          fx.burst(hero.x + hero.wall * HW, hero.y, t.fg, 6, 100, 2)
        }
      }
      // gravity (apex hang for a floaty, precise feel)
      let g = 1500 * gscale * hero.gd
      if (Math.abs(hero.vy) < 90 && jumpDown) g *= 0.65
      if (hero.vy * hero.gd < 0 && !jumpDown) g *= 1.25
      hero.vy += g * dt
      const maxFall = (mods.has('swim') ? 240 : 720) * hero.gd
      if (hero.gd > 0 ? hero.vy > maxFall : hero.vy < maxFall) hero.vy = maxFall
      // wall slide
      if (climb && !grounded && hero.wallT > 0 && hero.vy * hero.gd > 0 && ax === hero.wall) {
        if (hero.gd > 0 ? hero.vy > 80 : hero.vy < -80) hero.vy = 80 * hero.gd
        if (Math.random() < 0.2) fx.burst(hero.x + hero.wall * HW, hero.y, t.fg, 1, 40, 2)
      }
      // rope constraint (velocity level)
      if (hero.rope) {
        const r = hero.rope
        const nx = hero.x + hero.vx * dt
        const ny = hero.y + hero.vy * dt
        const d = Math.hypot(nx - r.x, ny - r.y)
        if (d > r.len) {
          const px = r.x + ((nx - r.x) / d) * r.len
          const py = r.y + ((ny - r.y) / d) * r.len
          hero.vx = (px - hero.x) / dt
          hero.vy = (py - hero.y) / dt
        }
      }
      hero.wall = 0
      const wasGround = grounded
      hero.ground = false
      const vyBefore = hero.vy
      moveX(hero.vx * dt)
      moveY(hero.vy * dt)
      if (hero.ground && !wasGround) {
        hero.sq = 0.62
        chain = 0
        if (Math.abs(vyBefore) > 380) {
          fx.burst(hero.x, hero.y + HH * hero.gd, t.fg, 7, 120, 2)
          if (Math.abs(vyBefore) > 650) shake.kick(2)
        }
        if (hero.rope && Math.abs(hero.vx) < 30) detach()
      }
      if (hero.ground && Math.abs(hero.vx) > 60 && Math.random() < 0.18) fx.burst(hero.x - hero.face * 6, hero.y + HH * hero.gd, ice ? t.accent2 : t.fg, 1, 50, 2)
    }

    const hurtTiles = () => {
      const tx0 = Math.floor((hero.x - HW) / TS)
      const tx1 = Math.floor((hero.x + HW) / TS)
      const ty0 = Math.floor((hero.y - HH) / TS)
      const ty1 = Math.floor((hero.y + HH) / TS)
      for (let ty = ty0; ty <= ty1; ty++) {
        for (let tx = tx0; tx <= tx1; tx++) {
          const v = tile(tx, ty)
          if (v === T.SPIKE) {
            const sx = tx * TS + 7
            const sy = ty * TS + 16
            if (hero.x + HW > sx && hero.x - HW < sx + 18 && hero.y + HH > sy && hero.y - HH < sy + 16 && invuln <= 0) die('hit')
          } else if (v === T.FLIP && flipCd <= 0) {
            const cx = tx * TS + 16
            const cy = ty * TS + 16
            if (Math.hypot(hero.x - cx, hero.y - cy) < 22) {
              hero.gd = -hero.gd
              hero.vy = 60 * hero.gd
              hero.ground = false
              flipCd = 0.6
              flash = 0.2
              shake.kick(3)
              env.sfx('power')
              fx.burst(cx, cy, t.accent, 24, 220, 3)
            }
          } else if (v === T.SPRING) {
            const cx = tx * TS + 16
            if (Math.abs(hero.x - cx) < 18 && hero.vy * hero.gd >= 0 && Math.abs(hero.y + HH * hero.gd - (ty * TS + 32)) < 12) {
              hero.vy = -780 * hero.gd
              hero.ground = false
              hero.sq = 1.5
              env.sfx('power')
              fx.burst(cx, ty * TS + 28, t.good, 10, 160, 3)
            }
          }
        }
      }
    }

    // ---------- foes ----------
    const updateFoes = (dt: number) => {
      const sp = 45 + Math.min(level, 6) * 6 + env.difficulty * 8
      for (const f of foes) {
        if (f.dead > 0) {
          f.dead -= dt
          continue
        }
        f.t += dt
        if (Math.abs(f.x - hero.x) > W * 0.9) continue
        if (f.kind === 'fly') {
          f.x += f.dir * (sp + 10) * dt
          if (f.x < f.x0 || f.x > f.x1) f.dir = -f.dir
          f.y = f.by + Math.sin(f.t * 2.4) * 20
        } else {
          const nx = f.x + f.dir * sp * dt
          const ahead = tile(Math.floor((nx + f.dir * 12) / TS), Math.floor((f.y + 16) / TS))
          const wall = solidT(tile(Math.floor((nx + f.dir * 12) / TS), Math.floor(f.y / TS)))
          if (nx < f.x0 + 8 || nx > f.x1 - 8 || wall || (ahead !== T.SOLID && ahead !== T.ONEWAY)) f.dir = -f.dir
          else f.x = nx
        }
      }
    }

    const collideFoes = () => {
      for (const f of foes) {
        if (f.dead > 0 || Math.abs(f.x - hero.x) > 40) continue
        if (Math.abs(f.y - hero.y) > 40) continue
        const overlap = Math.abs(f.x - hero.x) < HW + 11 && Math.abs(f.y - hero.y) < HH + 11
        if (!overlap) continue
        const falling = hero.vy * hero.gd > 40
        const above = (hero.y - f.y) * hero.gd < 4
        if (f.kind !== 'spiky' && falling && above) {
          f.dead = 0.35
          chain++
          score += 100 * Math.min(chain, 5)
          hero.vy = -(k.down('a') || k.down('up') ? 480 : 320) * hero.gd
          hero.cut = false
          hero.sq = 1.3
          env.sfx('point')
          shake.kick(3)
          fx.burst(f.x, f.y, t.good, 14, 200, 3)
          hud()
        } else if (invuln <= 0) die('hit')
      }
    }

    // ---------- main update ----------
    const update = (dt: number) => {
      time += dt
      hint = Math.max(0, hint - dt)
      fx.update(dt, 500)
      shake.update(dt)
      flash = Math.max(0, flash - dt)
      hero.sq += (1 - hero.sq) * Math.min(1, dt * 12)
      phaseT += dt
      if (over) return
      if (phase === 'intro') {
        if (phaseT > 1.4 || k.hit('a')) phase = 'play'
      } else if (phase === 'dead') {
        if (phaseT > 0.7) {
          respawn()
          phase = 'play'
        }
      } else if (phase === 'clear') {
        if (phaseT > 2.2 || (phaseT > 0.7 && k.hit('a'))) {
          if (level >= totalLevels) finish(true)
          else {
            level++
            if (level % 2 === 1 && lives < 6) lives++
            startLevel()
            hud()
          }
        }
      } else {
        invuln = Math.max(0, invuln - dt)
        if (grapple) {
          if (k.hit('b')) {
            attach()
            ropeKey = !!hero.rope
          }
          if (ropeKey && !k.down('b')) {
            detach()
            ropeKey = false
          }
          if (!hero.rope) ropeKey = false
        }
        if (timed) {
          timeLeft -= dt
          if (timeLeft <= 0) die('time')
        }
        accum += dt
        while (accum >= STEP && phase === 'play') {
          accum -= STEP
          stepHero(STEP)
          hurtTiles()
        }
        updateFoes(dt)
        if (phase === 'play') collideFoes()
        // pickups
        for (const s of stars) {
          if (!s.got && Math.hypot(s.x - hero.x, s.y - hero.y) < 22) {
            s.got = true
            starsGot++
            score += 50
            env.sfx('point')
            fx.burst(s.x, s.y, '#facc15', 10, 150, 3)
            hud()
          }
        }
        if (keyPos && Math.hypot(keyPos.x - hero.x, keyPos.y - hero.y) < 26) {
          keyPos = null
          hasKey = true
          env.sfx('power')
          fx.burst(hero.x, hero.y, '#facc15', 24, 220, 3)
          hud()
        }
        // checkpoints
        for (let i = cpIdx + 1; i < lv.checkpoints.length; i++) {
          const c = lv.checkpoints[i]
          if (Math.abs(hero.x - (c.x * TS + 16)) < 28 && Math.abs(hero.y - (c.y * TS + 16)) < 44) {
            cpIdx = i
            env.sfx('click')
            fx.burst(c.x * TS + 16, c.y * TS, t.good, 14, 160, 3)
          }
        }
        // lava
        if (climb) {
          lavaDelay -= dt
          if (lavaDelay <= 0) lavaY -= (byDiff(env, 9, 14, 20) + level * 1.6) * dt
          if (hero.y + HH > lavaY && phase === 'play') die('lava')
        }
        // pit
        if (phase === 'play' && (hero.y > (lv.h + 2) * TS || hero.y < -3 * TS)) die('pit')
        // goal
        const gx = lv.goal.x * TS + 16
        const gy = lv.goal.y * TS + 16
        if (phase === 'play' && Math.abs(hero.x - gx) < 26 && Math.abs(hero.y - gy) < 56) {
          phase = 'clear'
          phaseT = 0
          const all = starsGot === stars.length
          score += 300 * level + (all ? 500 : 0) + (timed ? Math.max(0, Math.floor(timeLeft)) * 10 : 0)
          env.sfx('win')
          fx.burst(gx, gy - 20, t.accent2, 40, 300, 4)
          fx.burst(gx, gy - 20, '#facc15', 30, 240, 4)
          hud()
        }
      }
      // camera
      const lookX = hero.face * 70
      if (climb) {
        camX = 0
        const ty = hero.y - 270
        camY += (ty - camY) * Math.min(1, dt * 5)
        camY = clamp(camY, 0, lv.h * TS - H + 10)
      } else {
        const tx = hero.x - W / 2 + lookX
        camX += (tx - camX) * Math.min(1, dt * 5)
        camX = clamp(camX, 0, lv.w * TS - W)
        camY = (lv.h * TS - H) / 2
      }
      env.score(score)
      if (Math.floor(time * 4) !== Math.floor((time - dt) * 4)) hud()
    }

    // ---------- drawing ----------
    const drawBg = () => {
      background(ctx, W, H, t, 30, env.seed)
      ctx.fillStyle = t.accent2
      ctx.globalAlpha = 0.18
      ctx.beginPath()
      ctx.arc(W * 0.72, 110, 56, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 0.14
      for (const c of clouds) {
        const x = (((c.x - camX * 0.1 - time * 6) % 1700) + 1700) % 1700 - 100
        emoji(ctx, c.e, x, c.y - camY * 0.05, c.s)
      }
      const baseY = climb ? 520 : 400
      for (const [i, hl] of hills.entries()) {
        const f = i === 0 ? 0.2 : 0.4
        const off = climb ? camY * f * 0.4 : 0
        ctx.globalAlpha = i === 0 ? 0.2 : 0.26
        ctx.fillStyle = i === 0 ? t.accent2 : t.accent
        if (city) {
          let x = -((camX * f) % 3000)
          for (let j = 0; x < W && j < 200; j++) {
            const b = blds[(j + i * 7) % blds.length]
            const bh = b.h * (i === 0 ? 1.15 : 0.8)
            ctx.fillRect(x, baseY - bh - off, b.w, bh + 200)
            x += b.w + 6
          }
        } else {
          ctx.beginPath()
          ctx.moveTo(0, H + 100)
          for (let x = 0; x <= W + 20; x += 20) ctx.lineTo(x, baseY - off - 40 - 70 * hl.a * (0.6 + 0.4 * Math.sin(((x + camX * f) / 140) * hl.f + hl.ph)) - i * 12)
          ctx.lineTo(W + 20, H + 100)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }

    const drawTiles = (ox: number) => {
      const tx0 = Math.max(0, Math.floor((camX - ox) / TS))
      const tx1 = Math.min(lv.w - 1, Math.ceil((camX - ox + W) / TS))
      const ty0 = Math.max(0, Math.floor(camY / TS))
      const ty1 = Math.min(lv.h - 1, Math.ceil((camY + H) / TS))
      const main = t.blocks[(level + (sky ? 1 : 0)) % t.blocks.length]
      for (let ty = ty0; ty <= ty1; ty++) {
        for (let tx = tx0; tx <= tx1; tx++) {
          const v = lv.tiles[ty * lv.w + tx]
          if (!v) continue
          const x = tx * TS
          const y = ty * TS
          if (v === T.SOLID) {
            ctx.fillStyle = main
            ctx.fillRect(x, y, TS + 0.5, TS + 0.5)
            ctx.fillStyle = 'rgba(0,0,0,.22)'
            ctx.fillRect(x, y, TS + 0.5, TS + 0.5)
            if ((tx + ty) % 2 === 0) {
              ctx.fillStyle = 'rgba(255,255,255,.05)'
              ctx.fillRect(x, y, TS, TS)
            }
            const above = tile(tx, ty - 1)
            const below = tile(tx, ty + 1)
            if (above !== T.SOLID && above !== T.DOOR) {
              ctx.fillStyle = main
              ctx.fillRect(x, y, TS + 0.5, 9)
              ctx.fillStyle = 'rgba(255,255,255,.28)'
              ctx.fillRect(x, y, TS + 0.5, 3)
            }
            if (below !== T.SOLID && below !== T.DOOR && ty < lv.h - 1) {
              ctx.fillStyle = main
              ctx.fillRect(x, y + TS - 8, TS + 0.5, 8)
              ctx.fillStyle = 'rgba(0,0,0,.2)'
              ctx.fillRect(x, y + TS - 2, TS + 0.5, 2)
            }
            if (tile(tx - 1, ty) === T.AIR) {
              ctx.fillStyle = 'rgba(255,255,255,.12)'
              ctx.fillRect(x, y, 2, TS)
            }
          } else if (v === T.ONEWAY) {
            if (sky) {
              ctx.fillStyle = 'rgba(255,255,255,.9)'
              ctx.beginPath()
              ctx.roundRect(x, y + 2, TS + 0.5, 14, 7)
              ctx.fill()
              ctx.fillStyle = 'rgba(160,180,220,.55)'
              ctx.fillRect(x + 2, y + 12, TS - 4, 4)
            } else {
              ctx.fillStyle = t.accent2
              ctx.shadowColor = t.accent2
              ctx.shadowBlur = 6
              ctx.beginPath()
              ctx.roundRect(x, y, TS + 0.5, 10, 4)
              ctx.fill()
              ctx.shadowBlur = 0
              ctx.fillStyle = 'rgba(0,0,0,.25)'
              ctx.fillRect(x + 2, y + 6, TS - 4, 4)
            }
          } else if (v === T.DOOR) {
            ctx.fillStyle = t.accent
            ctx.fillRect(x + 4, y, TS - 8, TS)
            ctx.fillStyle = 'rgba(0,0,0,.3)'
            ctx.fillRect(x + 4, y + TS - 3, TS - 8, 3)
            if (tile(tx, ty - 1) !== T.DOOR) emoji(ctx, '🔒', x + 16, y + 16, 22)
          } else if (v === T.SPIKE) {
            ctx.fillStyle = t.danger
            ctx.shadowColor = t.danger
            ctx.shadowBlur = 6
            for (let i = 0; i < 3; i++) {
              ctx.beginPath()
              ctx.moveTo(x + i * 10.7 + 1, y + TS)
              ctx.lineTo(x + i * 10.7 + 5.3, y + 14)
              ctx.lineTo(x + i * 10.7 + 9.7, y + TS)
              ctx.fill()
            }
            ctx.shadowBlur = 0
          } else if (v === T.FLIP) {
            const pulse = 1 + Math.sin(time * 6) * 0.1
            ctx.strokeStyle = t.accent
            ctx.shadowColor = t.accent
            ctx.shadowBlur = 12
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.arc(x + 16, y + 16, 12 * pulse, 0, Math.PI * 2)
            ctx.stroke()
            ctx.shadowBlur = 0
            text(ctx, '⇅', x + 16, y + 16, { size: 14, color: t.fg })
          } else if (v === T.SPRING) {
            ctx.fillStyle = t.good
            ctx.fillRect(x + 6, y + 26, 20, 6)
            ctx.strokeStyle = t.fg
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(x + 8, y + 26)
            for (let i = 0; i < 4; i++) ctx.lineTo(x + (i % 2 ? 8 : 24), y + 26 - (i + 1) * 4)
            ctx.stroke()
          }
        }
      }
    }

    const drawWorld = (ox: number) => {
      drawTiles(ox)
      // goal flag
      const gx = lv.goal.x * TS + 16
      const gy = (lv.goal.y + 1) * TS
      ctx.fillStyle = t.fg
      ctx.fillRect(gx - 2, gy - 84, 4, 84)
      ctx.fillStyle = t.accent
      ctx.shadowColor = t.accent
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.moveTo(gx + 2, gy - 84)
      for (let i = 0; i <= 10; i++) ctx.lineTo(gx + 2 + i * 3.4, gy - 84 + Math.sin(time * 5 + i * 0.6) * 3 + i * 0.3)
      for (let i = 10; i >= 0; i--) ctx.lineTo(gx + 2 + i * 3.4, gy - 58 + Math.sin(time * 5 + i * 0.6) * 3 - i * 0.3)
      ctx.fill()
      ctx.shadowBlur = 0
      // checkpoints
      for (let i = 1; i < lv.checkpoints.length; i++) {
        const c = lv.checkpoints[i]
        const x = c.x * TS + 16
        const y = (c.y + 1) * TS
        ctx.fillStyle = 'rgba(255,255,255,.5)'
        ctx.fillRect(x - 1, y - 40, 2, 40)
        ctx.fillStyle = i <= cpIdx ? t.good : 'rgba(255,255,255,.4)'
        ctx.beginPath()
        ctx.moveTo(x + 1, y - 40)
        ctx.lineTo(x + 18, y - 33)
        ctx.lineTo(x + 1, y - 26)
        ctx.fill()
      }
      // anchors
      for (const a of lv.anchors) {
        const x = a.x * TS
        const y = a.y * TS
        ctx.strokeStyle = t.accent
        ctx.shadowColor = t.accent
        ctx.shadowBlur = 12
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, 9 + Math.sin(time * 4) * 1.5, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = t.fg
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
      if (grapple && phase === 'play' && !hero.rope) {
        const a = nearestAnchor(hero.x + hero.face * 90, hero.y - 130, 320, 1)
        if (a) {
          ctx.strokeStyle = t.fg
          ctx.globalAlpha = 0.35
          ctx.setLineDash([4, 6])
          ctx.beginPath()
          ctx.moveTo(hero.x, hero.y)
          ctx.lineTo(a.x, a.y)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.globalAlpha = 1
        }
      }
      for (const s of stars) {
        if (s.got) continue
        const sc = 1 + Math.sin(time * 6 + s.x * 0.1) * 0.12
        ctx.shadowColor = '#facc15'
        ctx.shadowBlur = 10
        emoji(ctx, '⭐', s.x, s.y + Math.sin(time * 3 + s.x) * 2, 20 * sc)
        ctx.shadowBlur = 0
      }
      if (keyPos) {
        ctx.shadowColor = '#facc15'
        ctx.shadowBlur = 14
        emoji(ctx, '🔑', keyPos.x, keyPos.y + Math.sin(time * 4) * 3, 26)
        ctx.shadowBlur = 0
      }
      for (const f of foes) {
        if (Math.abs(f.x - hero.x) > W) continue
        ctx.save()
        ctx.translate(f.x, f.y)
        if (f.dead > 0) {
          ctx.scale(1.3, 0.3)
          ctx.globalAlpha = f.dead / 0.35
          emoji(ctx, f.e, 0, 12, 26)
        } else {
          ctx.scale(f.dir > 0 ? -1 : 1, 1)
          const bob = f.kind === 'fly' ? 0 : Math.abs(Math.sin(f.t * 8)) * -3
          if (f.kind === 'spiky') {
            ctx.strokeStyle = t.danger
            ctx.shadowColor = t.danger
            ctx.shadowBlur = 12
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.arc(0, 0, 16, 0, Math.PI * 2)
            ctx.stroke()
            ctx.fillStyle = t.danger
            for (let i = 0; i < 8; i++) {
              const a = (i / 8) * Math.PI * 2 + f.t
              ctx.beginPath()
              ctx.moveTo(Math.cos(a - 0.2) * 15, Math.sin(a - 0.2) * 15)
              ctx.lineTo(Math.cos(a) * 22, Math.sin(a) * 22)
              ctx.lineTo(Math.cos(a + 0.2) * 15, Math.sin(a + 0.2) * 15)
              ctx.fill()
            }
          }
          emoji(ctx, f.e, 0, bob, 28)
        }
        ctx.restore()
      }
      // rope
      if (hero.rope) {
        ctx.strokeStyle = t.fg
        ctx.lineWidth = 2.5
        ctx.shadowColor = t.accent
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.moveTo(hero.x, hero.y)
        ctx.lineTo(hero.rope.x, hero.rope.y)
        ctx.stroke()
        ctx.shadowBlur = 0
      }
      // hero
      if (phase !== 'dead' && (invuln <= 0 || Math.floor(time * 18) % 2 === 0)) {
        ctx.save()
        ctx.translate(hero.x, hero.y + HH)
        if (hero.gd < 0) ctx.scale(1, -1)
        const s = hero.sq
        ctx.scale((1 / Math.sqrt(s)) * (hero.face < 0 ? -1 : 1), s)
        const run = hero.ground ? Math.sin(time * 18) * clamp(Math.abs(hero.vx) / runMax, 0, 1) * 0.12 : clamp(hero.vx / 900, -0.2, 0.2)
        ctx.rotate(run)
        emoji(ctx, t.hero, 0, -20, 38)
        ctx.restore()
      }
      if (climb) {
        // lava
        const g = ctx.createLinearGradient(0, lavaY, 0, lavaY + 160)
        g.addColorStop(0, '#fde047')
        g.addColorStop(0.15, t.danger)
        g.addColorStop(1, '#450a0a')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(0, lavaY + 500)
        for (let x = 0; x <= lv.w * TS; x += 16) ctx.lineTo(x, lavaY + Math.sin(time * 3 + x * 0.05) * 4)
        ctx.lineTo(lv.w * TS, lavaY + 500)
        ctx.fill()
      }
      fx.draw(ctx)
    }

    const draw = () => {
      ctx.save()
      shake.apply(ctx)
      drawBg()
      const ox = climb ? (W - lv.w * TS) / 2 : 0
      ctx.translate(-camX + ox, -camY)
      if (climb) {
        ctx.fillStyle = 'rgba(0,0,0,.28)'
        ctx.fillRect(0, camY, lv.w * TS, H)
      }
      drawWorld(ox)
      ctx.restore()
      if (dark) {
        const sx = hero.x - camX + ox
        const sy = hero.y - camY
        const r = Math.max(110, 190 - level * 6)
        const gr = ctx.createRadialGradient(sx, sy, r * 0.25, sx, sy, r)
        gr.addColorStop(0, 'rgba(0,0,0,0)')
        gr.addColorStop(1, 'rgba(0,0,0,0.96)')
        ctx.fillStyle = gr
        ctx.fillRect(0, 0, W, H)
      }
      if (flash > 0) {
        ctx.fillStyle = hero.gd < 0 || phase !== 'dead' ? t.accent : t.danger
        ctx.globalAlpha = flash * 0.9
        ctx.fillRect(0, 0, W, H)
        ctx.globalAlpha = 1
      }
      // HUD
      text(ctx, '❤️'.repeat(Math.max(0, lives)), 14, 22, { size: 16, align: 'left' })
      text(ctx, `⭐ ${starsGot}/${stars.length}`, W / 2, 22, { size: 14, color: t.fg, shadow: t.bg })
      text(ctx, `LV ${level}`, W - 14, 22, { size: 14, color: t.fg, align: 'right', shadow: t.bg })
      if (timed) text(ctx, `${Math.max(0, Math.ceil(timeLeft))}s`, W - 14, 46, { size: 14, color: timeLeft < 15 ? t.danger : t.fg, align: 'right' })
      if (hasKey) emoji(ctx, '🔑', 24, 50, 22)
      if (phase === 'intro' || (level === 1 && hint > 0 && phase === 'play')) {
        ctx.globalAlpha = phase === 'intro' ? Math.min(1, 2.2 - phaseT * 1.2) : Math.min(1, hint)
        if (phase === 'intro') {
          ctx.fillStyle = 'rgba(0,0,0,.45)'
          ctx.fillRect(0, 140, W, 120)
          text(ctx, env.name.toUpperCase(), W / 2, 178, { size: narrow ? 12 : 20, color: t.fg, shadow: t.accent })
          text(ctx, `LEVEL ${level}`, W / 2, 214, { size: 14, color: t.accent2 })
        }
        text(ctx, narrow ? `◀ ▶ MOVE   ⤒ JUMP${grapple ? '   ⚓ HOOK' : ''}` : `ARROWS: MOVE   SPACE: JUMP${grapple ? '   B / CLICK: GRAPPLE' : ''}${climb ? '   WALL-JUMP' : ''}`, W / 2, H - 70, { size: 10, color: t.fg, shadow: t.bg })
        ctx.globalAlpha = 1
      }
      if (phase === 'clear') {
        ctx.fillStyle = 'rgba(0,0,0,.5)'
        ctx.fillRect(0, 130, W, 160)
        text(ctx, 'LEVEL CLEAR!', W / 2, 175, { size: narrow ? 18 : 26, color: t.accent2, shadow: t.accent })
        text(ctx, `⭐ ${starsGot}/${stars.length}${starsGot === stars.length ? '  PERFECT +500' : ''}`, W / 2, 222, { size: 14, color: t.fg })
        text(ctx, `SCORE ${score}`, W / 2, 252, { size: 12, color: t.fg })
      }
    }

    startLevel()
    hud()
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
