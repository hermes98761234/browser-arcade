// Shmup: vertical shoot 'em up. Waves/formations, power-ups, bombs, bosses.
// Mods: hell|tiny (dense bullets, tiny hitbox, graze), boss (boss rush), laser (piercing beam), wind (bullets drift).
// Name keyword "swarm"|"invader" -> Space-Invaders style stepping grid.
import { background, Bag, byDiff, clamp, createStage, emoji, isTouch, keys, loop, Particles, pointer, roundRect, Shake, text, vpad, type Engine } from '../kit'
import { BOSS_KINDS, bossVolley, waveSpec, type Formation, type Group } from '../logic/shmup'

const W = 420
const H = 600
const TAU = Math.PI * 2

type PowerKind = 'P' | 'S' | 'B' | 'H' | 'X'
const PU: Record<PowerKind, { e: string; c: string }> = { P: { e: '🔺', c: '#f97316' }, S: { e: '🛡️', c: '#38bdf8' }, B: { e: '💣', c: '#a78bfa' }, H: { e: '❤️', c: '#f87171' }, X: { e: '⭐', c: '#facc15' } }
interface Enemy { x: number; y: number; hp: number; max: number; kind: Formation; t: number; wait: number; ox: number; ph: number; fire: number; foe: number; r: number; flash: number; idx: number; tx: number; hx: number; hy: number }
interface Bullet { x: number; y: number; vx: number; vy: number; r: number; grazed: boolean; c: number }
interface Shot { x: number; y: number; vx: number; vy: number; dmg: number; pierce: boolean }
interface Boss { x: number; y: number; hp: number; max: number; t: number; fire: number; k: number; flash: number; foe: number; kinds: typeof BOSS_KINDS; enter: number }

const engine: Engine = {
  start(env) {
    const { theme: t, rng, mods } = env
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const k = keys()
    const ptr = pointer(st)
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const hell = mods.has('hell') || mods.has('tiny') || /danmaku|bullet (hell|curtain)/i.test(env.name)
    const tiny = mods.has('tiny')
    const rush = mods.has('boss') || /boss rush/i.test(env.name)
    const laser = mods.has('laser')
    const wind = mods.has('wind')
    const invaders = /swarm|invader/i.test(env.name)
    const hb = tiny ? 2.5 : hell ? 3 : 7
    const size = tiny ? 24 : 38
    const TOTAL = rush ? byDiff(env, 3, 4, 5) : byDiff(env, 6, 8, 10)
    const bossEvery = 3
    const dens = hell ? 1.7 : 1
    const bspd = byDiff(env, 120, 140, 160) * (hell ? 0.85 : 1)
    const hasFocus = hell
    bag.add(vpad(env.host, k, 'none', [{ action: 'b', label: '💣' }, ...(hasFocus ? [{ action: 'a' as const, label: '◎' }] : [])]))

    let lives = byDiff(env, 5, 4, 3) + (mods.has('zen') ? 3 : 0)
    let bombs = byDiff(env, 3, 2, 2)
    let score = 0
    let weapon = rush ? 3 : 1
    let time = 0
    let over = false
    let intro = 2.4
    let wave = 0
    let waveT = 0
    let pause = 1.6
    let banner = ''
    let bannerT = 0
    let combo = 0
    let comboT = 0
    let graze = 0
    let bi = 0
    let inv = 0
    let shield = 0
    let fireT = 0
    let flash = 0
    let bombR = -1
    let enemies: Enemy[] = []
    let bullets: Bullet[] = []
    let shots: Shot[] = []
    let drops: { x: number; y: number; k: PowerKind }[] = []
    let queue: Group[] = []
    let boss: Boss | null = null
    let grid = { x: 0, y: 0, dir: 1 }
    const px = { x: W / 2, y: H - 90 }
    const target = { x: W / 2, y: H - 90 }
    const last = { x: 0, y: 0 }
    const stars = Array.from({ length: 70 }, () => ({ x: rng() * W, y: rng() * H, s: 0.3 + rng() * 1.2 }))

    const hud = () => env.status(`Wave ${Math.min(wave, TOTAL)}/${TOTAL} · ${'❤️'.repeat(Math.max(0, lives))} ${'💣'.repeat(bombs)}`)
    const add = (n: number) => {
      score += Math.round(n * (1 + Math.min(3, Math.floor(combo / 5)) * 0.25))
      env.score(score)
    }
    const say = (s: string, d = 1.8) => {
      banner = s
      bannerT = d
    }

    const bossPick = () => {
      const o = (bi * 2) % BOSS_KINDS.length
      return [BOSS_KINDS[o], BOSS_KINDS[(o + 1) % 5], BOSS_KINDS[(o + 3) % 5]] as typeof BOSS_KINDS
    }
    const startWave = () => {
      wave++
      waveT = 0
      const isBoss = rush || wave % bossEvery === 0 || wave === TOTAL
      const spec = waveSpec(wave, rng, env.difficulty, isBoss, invaders)
      queue = spec.groups.slice()
      if (isBoss) {
        const hp = (rush ? 150 : 110) + bi * 70 + env.difficulty * 40
        boss = { x: W / 2, y: -80, hp, max: hp, t: 0, fire: 2, k: 0, flash: 0, foe: bi % t.foes.length, kinds: bossPick(), enter: 0 }
        say(rush ? `BOSS ${bi + 1}` : 'WARNING', 2.4)
        env.sfx('power')
      } else say(`WAVE ${wave}`)
      hud()
    }

    const spawn = (g: Group) => {
      const hp = g.hp
      const mk = (x: number, y: number, wait: number, idx: number): Enemy => ({
        x, y, hp, max: hp, kind: g.kind, t: 0, wait, ox: x, ph: rng() * TAU, fire: byDiff(env, 2.8, 2.2, 1.7) * (0.5 + rng()), foe: g.foe % t.foes.length,
        r: (g.kind === 'hover' ? 20 : 15) * (tiny ? 0.7 : 1), flash: 0, idx, tx: 0, hx: 0, hy: 0,
      })
      const n = g.n
      if (g.kind === 'grid') {
        const cols = 8
        const rows = 3 + Math.min(2, Math.floor(wave / 3))
        grid = { x: 0, y: 0, dir: 1 }
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++) {
            const e = mk(0, 0, 0, r * cols + c)
            e.hx = 50 + c * 46
            e.hy = 40 + r * 38
            e.foe = r % t.foes.length
            e.fire = 99
            enemies.push(e)
          }
        return
      }
      for (let i = 0; i < n; i++) {
        const mid = (n - 1) / 2
        if (g.kind === 'line') enemies.push(mk(W * (0.1 + (0.8 * i) / Math.max(1, n - 1)), -20, 0, i))
        else if (g.kind === 'vee') enemies.push(mk(W * g.x + (i - mid) * 36, -20 - Math.abs(i - mid) * 30, 0, i))
        else if (g.kind === 'hover') enemies.push(mk(W * (0.2 + (0.6 * (i + 0.5)) / n), -30, i * 0.7, i))
        else if (g.kind === 'swarm') enemies.push(mk(g.x < 0.5 ? -20 : W + 20, 40, i * 0.35, i))
        else enemies.push(mk(g.kind === 'diver' ? rng.range(40, W - 40) : W * g.x, -20, i * (g.kind === 'diver' ? 0.7 : 0.4), i))
      }
    }

    const fireBullet = (x: number, y: number, a: number, sp: number, c = 0) => {
      if (bullets.length > 900) return
      bullets.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: hell ? 3.8 : 5, grazed: false, c })
    }
    const aim = (x: number, y: number) => Math.atan2(px.y - y, px.x - x)
    const sp = () => bspd + wave * 6

    const killEnemy = (e: Enemy) => {
      fx.burst(e.x, e.y, t.accent2, 14, 200, 3.5)
      fx.burst(e.x, e.y, '#fff', 5, 120, 2)
      env.sfx('boom')
      combo++
      comboT = 1.6
      add(100 * e.max)
      shake.kick(2)
      if (rng.chance(byDiff(env, 0.16, 0.12, 0.1))) {
        const r = rng()
        drops.push({ x: e.x, y: e.y, k: r < 0.4 ? 'P' : r < 0.6 ? 'S' : r < 0.78 ? 'B' : r < 0.84 ? 'H' : 'X' })
      }
    }

    const hitPlayer = () => {
      if (inv > 0 || over) return
      if (shield > 0) {
        shield = 0
        inv = 1.2
        env.sfx('hit')
        fx.burst(px.x, px.y, '#38bdf8', 20, 220, 3)
        bullets = bullets.filter((b) => (b.x - px.x) ** 2 + (b.y - px.y) ** 2 > 140 ** 2)
        return
      }
      lives--
      weapon = Math.max(1, weapon - 1)
      combo = 0
      inv = 2.4
      shake.kick(9)
      flash = 0.3
      env.sfx('lose')
      fx.burst(px.x, px.y, t.danger, 36, 280, 4)
      bullets = []
      hud()
      if (lives <= 0) {
        over = true
        env.end({ score, won: false, text: `Reached wave ${wave} of ${TOTAL}` })
      }
    }

    const fireBomb = () => {
      if (bombs <= 0 || bombR >= 0 || over) return
      bombs--
      bombR = 0
      inv = Math.max(inv, 1.2)
      shake.kick(10)
      env.sfx('boom')
      for (const e of enemies) {
        e.hp -= 14
        e.flash = 0.2
      }
      if (boss) {
        boss.hp -= 30
        boss.flash = 0.2
      }
      hud()
    }

    const collect = (kd: PowerKind) => {
      env.sfx('power')
      add(100)
      if (kd === 'P') {
        if (weapon >= 5) add(500)
        weapon = Math.min(5, weapon + 1)
        say(weapon >= 5 ? 'MAX POWER' : 'POWER UP', 1)
      } else if (kd === 'S') {
        shield = 1
        say('SHIELD', 1)
      } else if (kd === 'B') {
        bombs = Math.min(5, bombs + 1)
        say('BOMB +1', 1)
      } else if (kd === 'H') {
        lives = Math.min(9, lives + 1)
        say('1UP', 1)
      } else add(500)
      hud()
    }

    ptr.onDown((p) => {
      intro = Math.min(intro, 0)
      last.x = p.x
      last.y = p.y
      if (!isTouch()) {
        target.x = p.x
        target.y = p.y - 0
      }
    })
    ptr.onMove((p) => {
      if (isTouch()) {
        if (p.down) {
          target.x += p.x - last.x
          target.y += p.y - last.y
        }
      } else {
        target.x = p.x
        target.y = p.y
      }
      last.x = p.x
      last.y = p.y
    })
    k.onKey((e) => {
      if (intro > 0.2 && !e.repeat) intro = 0
    })

    const bossRadius = 44
    const update = (dt: number) => {
      time += dt
      fx.update(dt)
      shake.update(dt)
      bannerT -= dt
      flash = Math.max(0, flash - dt)
      if (intro > 0) intro -= dt
      for (const s of stars) {
        s.y += s.s * 40 * dt
        if (s.y > H) { s.y = 0; s.x = rng() * W }
      }
      if (over) return
      if (intro > 0.15) return
      waveT += dt
      comboT -= dt
      if (comboT <= 0) combo = 0
      inv = Math.max(0, inv - dt)
      const windX = wind ? Math.sin(time * 0.35) * 45 : 0

      // movement
      const ax = k.axis()
      const focus = hasFocus && k.down('a')
      const spd = (focus ? 170 : 330)
      if (ax.x || ax.y) {
        target.x = px.x + ax.x * spd
        target.y = px.y + ax.y * spd
      }
      target.x = clamp(target.x, 16, W - 16)
      target.y = clamp(target.y, 60, H - 24)
      const m = (ax.x || ax.y ? spd : focus ? 260 : 760) * dt
      px.x += clamp(target.x - px.x, -m, m) + windX * 0.15 * dt
      px.y += clamp(target.y - px.y, -m, m)
      px.x = clamp(px.x, 16, W - 16)

      // firing
      fireT -= dt
      if (fireT <= 0) {
        fireT = laser ? 0.07 : 0.13
        env.sfx('shoot')
        const lv = weapon
        const mk = (dx: number, ang: number, dmg = 1) => shots.push({ x: px.x + dx, y: px.y - 14, vx: Math.sin(ang) * 640, vy: -Math.cos(ang) * 640, dmg: laser ? 0.4 : dmg, pierce: laser })
        if (laser) {
          for (const dx of lv >= 3 ? [-10, 0, 10] : lv >= 2 ? [-6, 6] : [0]) mk(dx, 0)
          if (lv >= 4) { mk(-14, -0.2); mk(14, 0.2) }
        } else if (lv === 1) mk(0, 0)
        else if (lv === 2) { mk(-7, 0); mk(7, 0) }
        else if (lv === 3) { mk(-9, -0.05); mk(0, 0); mk(9, 0.05) }
        else if (lv === 4) { mk(-11, -0.1); mk(-4, 0); mk(4, 0); mk(11, 0.1) }
        else { mk(-12, -0.16); mk(-6, -0.05); mk(0, 0); mk(6, 0.05); mk(12, 0.16) }
      }
      if (k.hit('b') || k.hit('KeyB')) fireBomb()
      if (bombR >= 0) {
        bombR += dt * 900
        bullets = bullets.filter((b) => Math.hypot(b.x - px.x, b.y - px.y) > bombR)
        if (bombR > 800) bombR = -1
      }

      // waves
      if (queue.length && waveT >= queue[0].delay) spawn(queue.shift()!)
      if (!queue.length && enemies.length === 0 && !boss) {
        if (wave > 0 && wave >= TOTAL) finish(true)
        else {
          pause -= dt
          if (pause <= 0) {
            pause = 1.6
            startWave()
          }
        }
      }
      // grid movement
      if (enemies.some((e) => e.kind === 'grid')) {
        const gs = enemies.filter((e) => e.kind === 'grid')
        const fast = 1 + (1 - gs.length / 24) * 2
        grid.x += grid.dir * (35 + wave * 4) * fast * dt
        const xs = gs.map((e) => e.hx + grid.x)
        if (Math.max(...xs) > W - 24 || Math.min(...xs) < 24) {
          grid.dir = -grid.dir
          grid.x += grid.dir * 4
          grid.y += 16
        }
        if (rng.chance(dt * (1.2 + wave * 0.15) * dens)) {
          const low = gs[rng.int(0, gs.length - 1)]
          fireBullet(low.x, low.y + 10, Math.PI / 2, sp(), 0)
        }
      }

      // enemies
      for (const e of enemies) {
        if (e.wait > 0) { e.wait -= dt; continue }
        e.t += dt
        e.flash = Math.max(0, e.flash - dt)
        const T = e.t
        const v = 70 + wave * 4
        switch (e.kind) {
          case 'line': case 'vee': e.y += v * dt; e.x = e.ox + Math.sin(T * 1.5 + e.ph) * 14; break
          case 'sine': e.y += (80 + wave * 3) * dt; e.x = clamp(e.ox + Math.sin(T * 2.2) * 100, 20, W - 20); break
          case 'swarm': e.x += (e.ox < W / 2 ? 1 : -1) * 150 * dt; e.y = 40 + Math.sin(T * 2.6) * 40 + T * 30; break
          case 'diver':
            if (T < 0.9) e.y += 100 * dt
            else {
              if (!e.tx) e.tx = px.x
              e.y += 300 * dt
              e.x += (e.tx - e.x) * 2 * dt
            }
            break
          case 'hover': {
            const ty = 80 + (e.idx % 2) * 55
            if (T < 6) e.y += (ty - e.y) * Math.min(1, dt * 2)
            else e.y -= 140 * dt
            e.x = e.ox + Math.sin(T * 0.8 + e.ph) * 40
            break
          }
          case 'grid': e.x = e.hx + grid.x; e.y = e.hy + grid.y; break
        }
        if (e.kind !== 'grid') {
          e.fire -= dt
          if (e.fire <= 0 && e.y > 10 && e.y < H - 140 && e.kind !== 'diver') {
            e.fire = (byDiff(env, 2.8, 2.2, 1.7) / (1 + wave * 0.07) / (hell ? 1.2 : 1)) * (0.7 + rng() * 0.6)
            if (e.kind === 'hover') {
              const n = Math.round((3 + Math.floor(wave / 3)) * dens)
              const a0 = aim(e.x, e.y)
              if (rng.chance(0.5)) for (let i = 0; i < n; i++) fireBullet(e.x, e.y, a0 + (i - (n - 1) / 2) * 0.22, sp(), 1)
              else for (let i = 0; i < n * 2; i++) fireBullet(e.x, e.y, (i / (n * 2)) * TAU + T, sp() * 0.8, 2)
            } else {
              fireBullet(e.x, e.y, aim(e.x, e.y), sp(), 0)
              if (hell) { fireBullet(e.x, e.y, aim(e.x, e.y) + 0.25, sp(), 0); fireBullet(e.x, e.y, aim(e.x, e.y) - 0.25, sp(), 0) }
            }
          }
        }
        if (e.kind === 'grid' && e.y > H - 120) hitPlayer()
        if (T > 1 && (e.y > H + 40 || e.y < -60 || e.x < -60 || e.x > W + 60)) e.hp = -999
      }

      // boss
      if (boss) {
        const b = boss
        b.t += dt
        b.flash = Math.max(0, b.flash - dt)
        b.enter = Math.min(1, b.enter + dt / 2)
        b.x = W / 2 + Math.sin(b.t * 0.75) * 130 * b.enter
        b.y = -80 + (120 + Math.sin(b.t * 1.3) * 12 + 80) * b.enter
        if (b.enter >= 1) {
          b.fire -= dt
          const frac = b.hp / b.max
          const ph = frac > 0.66 ? 0 : frac > 0.33 ? 1 : 2
          if (b.fire <= 0) {
            const kind = b.kinds[ph]
            const base = kind === 'spiral' ? 0.11 : kind === 'rain' ? 0.18 : 0.9
            b.fire = (base / (hell ? 1.3 : 1)) * byDiff(env, 1.3, 1, 0.85) * (1 - ph * 0.1)
            const n = Math.round(byDiff(env, 10, 13, 16) * dens)
            for (const s of bossVolley(kind, n, b.k++, aim(b.x, b.y))) {
              const o = kind === 'rain' ? Math.sin(b.k * 3.7) * 160 : 0
              fireBullet(b.x + o, b.y + (kind === 'rain' ? -20 : 10), s.a, sp() * s.spd, b.k % 3)
            }
          }
        }
      }

      // player shots
      for (const s of shots) {
        s.x += s.vx * dt
        s.y += s.vy * dt
        let used = false
        for (const e of enemies) {
          if (e.wait > 0 || e.hp <= 0) continue
          if (Math.abs(s.x - e.x) < e.r + 4 && Math.abs(s.y - e.y) < e.r + 6) {
            e.hp -= s.dmg
            e.flash = 0.08
            env.sfx('hit')
            if (!s.pierce) used = true
            if (!used || !s.pierce) fx.burst(s.x, s.y, '#fff', 2, 80, 2)
            if (used) break
          }
        }
        if (!used && boss && boss.enter >= 0.7 && Math.abs(s.x - boss.x) < bossRadius && Math.abs(s.y - boss.y) < bossRadius * 0.8) {
          boss.hp -= s.dmg
          boss.flash = 0.06
          add(s.dmg * 10)
          if (!s.pierce) used = true
          fx.burst(s.x, s.y, t.danger, 1, 80, 2)
        }
        if (used) s.y = -999
      }
      shots = shots.filter((s) => s.y > -40 && s.x > -20 && s.x < W + 20)
      for (const e of enemies) if (e.hp <= 0 && e.hp > -900) killEnemy(e)
      enemies = enemies.filter((e) => e.hp > 0)
      if (boss && boss.hp <= 0) {
        const b = boss
        for (let i = 0; i < 6; i++) fx.burst(b.x + rng.range(-40, 40), b.y + rng.range(-30, 30), i % 2 ? t.accent2 : '#fff', 24, 340, 5)
        shake.kick(14)
        flash = 0.4
        env.sfx('win')
        add(3000 + bi * 1000)
        bullets = []
        for (let i = 0; i < 3; i++) drops.push({ x: b.x + (i - 1) * 40, y: b.y, k: i === 0 ? 'P' : i === 1 ? 'B' : 'X' })
        boss = null
        bi++
        say('BOSS DOWN', 1.6)
      }

      // enemy bullets
      const gr = hell ? 16 : 14
      for (const b of bullets) {
        b.x += (b.vx + windX) * dt
        b.y += b.vy * dt
        const d2 = (b.x - px.x) ** 2 + (b.y - px.y) ** 2
        if (d2 < (hb + b.r) ** 2) {
          hitPlayer()
          b.y = 9999
        } else if (!b.grazed && d2 < (gr + b.r) ** 2 && inv <= 0) {
          b.grazed = true
          graze++
          add(hell ? 20 : 8)
          if (graze % 50 === 0 && bombs < 5) { bombs++; say('GRAZE BOMB', 1); hud() }
          fx.burst(px.x, px.y, '#fff', 1, 60, 2)
        }
      }
      bullets = bullets.filter((b) => b.y > -20 && b.y < H + 20 && b.x > -20 && b.x < W + 20)
      // enemy body contact
      for (const e of enemies) if (e.wait <= 0 && (e.x - px.x) ** 2 + (e.y - px.y) ** 2 < (e.r * 0.8 + hb + 2) ** 2) hitPlayer()
      if (boss && boss.enter > 0.8 && Math.abs(boss.x - px.x) < bossRadius * 0.8 && Math.abs(boss.y - px.y) < bossRadius * 0.7) hitPlayer()
      // drops
      for (const d of drops) {
        const dx = px.x - d.x
        const dy = px.y - d.y
        const dd = Math.hypot(dx, dy)
        if (dd < 90) { d.x += (dx / dd) * 160 * dt; d.y += (dy / dd) * 160 * dt }
        d.y += 80 * dt
        if (dd < 24) { collect(d.k); d.y = 9999 }
      }
      drops = drops.filter((d) => d.y < H + 20)
    }

    const finish = (won: boolean) => {
      if (over) return
      over = true
      env.sfx('win')
      add(lives * 500)
      env.end({ score, won, text: rush ? `Beat all ${TOTAL} bosses` : `Cleared all ${TOTAL} waves` })
    }

    hud()
    env.score(0)

    const bulletColors = [t.danger, t.accent2, t.accent, ...t.blocks]
    const draw = () => {
      background(ctx, W, H, t, 0)
      ctx.fillStyle = t.fg
      for (const s of stars) {
        ctx.globalAlpha = 0.25 + s.s * 0.3
        ctx.fillRect(s.x, s.y, s.s * 1.5, s.s * 2.5)
      }
      ctx.globalAlpha = 1
      ctx.save()
      shake.apply(ctx)
      for (const d of drops) {
        const p = PU[d.k]
        ctx.shadowColor = p.c
        ctx.shadowBlur = 12
        roundRect(ctx, d.x - 13, d.y - 13, 26, 26, 8, p.c, '#fff', 2)
        ctx.shadowBlur = 0
        emoji(ctx, p.e, d.x, d.y, 16)
      }
      for (const e of enemies) {
        if (e.wait > 0) continue
        ctx.globalAlpha = e.flash > 0 ? 0.6 : 1
        emoji(ctx, t.foes[e.foe], e.x, e.y + Math.sin(time * 5 + e.ph) * 1.5, e.r * 2.1, e.kind === 'diver' && e.t > 0.9 ? Math.PI : 0)
        ctx.globalAlpha = 1
        if (e.max > 2 && e.hp < e.max) {
          roundRect(ctx, e.x - 14, e.y + e.r + 2, 28, 3, 1.5, 'rgba(0,0,0,.5)')
          roundRect(ctx, e.x - 14, e.y + e.r + 2, 28 * (e.hp / e.max), 3, 1.5, t.good)
        }
      }
      if (boss) {
        const b = boss
        const sc = 1 + Math.sin(b.t * 3) * 0.03
        ctx.shadowColor = t.danger
        ctx.shadowBlur = 24
        ctx.globalAlpha = b.flash > 0 ? 0.6 : 1
        emoji(ctx, t.foes[b.foe], b.x, b.y, 96 * sc)
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
        roundRect(ctx, 40, 14, W - 80, 8, 4, 'rgba(0,0,0,.55)')
        roundRect(ctx, 40, 14, (W - 80) * Math.max(0, b.hp / b.max), 8, 4, t.danger)
      }
      ctx.shadowColor = t.accent2
      ctx.shadowBlur = 8
      ctx.fillStyle = laser ? '#fff' : t.accent2
      for (const s of shots) {
        if (laser) ctx.fillRect(s.x - 1.5, s.y - 14, 3, 28)
        else roundRect(ctx, s.x - 2, s.y - 8, 4, 16, 2, t.accent2)
      }
      ctx.shadowBlur = 0
      for (const b of bullets) {
        const c = bulletColors[b.c % bulletColors.length]
        ctx.fillStyle = c
        ctx.shadowColor = c
        ctx.shadowBlur = hell ? 4 : 8
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r + 1.5, 0, TAU)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r * 0.55, 0, TAU)
        ctx.fill()
      }
      ctx.shadowBlur = 0
      // player
      if (!over && (inv <= 0 || Math.floor(time * 14) % 2)) {
        ctx.shadowColor = t.accent
        ctx.shadowBlur = 14
        emoji(ctx, t.hero, px.x, px.y, size)
        ctx.shadowBlur = 0
        // engine flame
        ctx.fillStyle = t.accent2
        ctx.globalAlpha = 0.6 + Math.sin(time * 40) * 0.3
        ctx.fillRect(px.x - 2, px.y + size * 0.42, 4, 6 + Math.sin(time * 30) * 3)
        ctx.globalAlpha = 1
      }
      if (shield > 0) {
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 2.5
        ctx.globalAlpha = 0.7
        ctx.beginPath()
        ctx.arc(px.x, px.y, size * 0.7, 0, TAU)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      if (hb <= 3.5 && !over) {
        ctx.fillStyle = '#fff'
        ctx.strokeStyle = t.danger
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(px.x, px.y, hb + 1, 0, TAU)
        ctx.fill()
        ctx.stroke()
      }
      if (bombR >= 0) {
        ctx.strokeStyle = '#fff'
        ctx.globalAlpha = Math.max(0, 1 - bombR / 800)
        ctx.lineWidth = 8
        ctx.beginPath()
        ctx.arc(px.x, px.y, bombR, 0, TAU)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      fx.draw(ctx)
      ctx.restore()
      if (flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${flash})`
        ctx.fillRect(0, 0, W, H)
      }
      // HUD
      for (let i = 0; i < 5; i++) roundRect(ctx, 10 + i * 12, H - 16, 9, 6, 2, i < weapon ? t.accent2 : 'rgba(255,255,255,.18)')
      if (combo >= 3) text(ctx, `${combo} CHAIN`, W - 56, H - 14, { size: 9, color: t.accent })
      if (hell) text(ctx, `GRAZE ${graze}`, W / 2, H - 14, { size: 9, color: t.fg })
      if (wind) text(ctx, windDir(), W - 34, 30, { size: 12, color: t.fg })
      if (bannerT > 0 && intro <= 0) {
        ctx.globalAlpha = Math.min(1, bannerT * 2)
        text(ctx, banner, W / 2, H / 3, { size: banner === 'WARNING' ? 28 : 20, color: banner === 'WARNING' ? t.danger : t.fg, shadow: t.accent })
        ctx.globalAlpha = 1
      }
      if (intro > 0) {
        const a = Math.min(1, intro * 3)
        ctx.fillStyle = `rgba(0,0,0,${0.6 * a})`
        ctx.fillRect(0, 0, W, H)
        ctx.globalAlpha = a
        emoji(ctx, t.hero, W / 2, H / 2 - 100, 70 + Math.sin(time * 5) * 3)
        text(ctx, env.name.toUpperCase(), W / 2, H / 2 - 36, { size: env.name.length > 18 ? 15 : 20, color: t.fg, shadow: t.accent })
        text(ctx, env.desc.slice(0, 40), W / 2, H / 2 - 4, { size: 9, color: t.accent2 })
        text(ctx, 'DRAG / ARROWS · AUTO-FIRE', W / 2, H / 2 + 40, { size: 9, color: t.fg })
        text(ctx, hell ? 'B = BOMB · SPACE = FOCUS' : 'B = BOMB', W / 2, H / 2 + 60, { size: 9, color: t.fg })
        ctx.globalAlpha = 1
      }
    }
    const windDir = () => (Math.sin(time * 0.35) > 0 ? '>>' : '<<')

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
