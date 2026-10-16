// Tower defense: generated winding path, 4 tower types with upgrades/sell, waves with a preview, boss wave, dungeon traps.
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, pointer, roundRect, Shake, text, type Engine } from '../kit'
import { genPath, hpScale, waveSpec, type FoeKind } from '../logic/towerdef'

const CELL = 40
const GY = 40
const DECOR = ['🪨', '🌲', '🌳', '🌿', '🍄']
const SANS = 'system-ui, sans-serif'

interface KindDef { name: string; cost: number; dmg: number; range: number; rate: number; color: string; splash?: number; slow?: number; blurb: string }
const KINDS: KindDef[] = [
  { name: 'Fast', cost: 50, dmg: 7, range: 2.7, rate: 0.32, color: '#facc15', blurb: 'rapid fire' },
  { name: 'Splash', cost: 95, dmg: 22, range: 2.5, rate: 1.25, color: '#fb923c', splash: 1.15, blurb: 'area damage' },
  { name: 'Slow', cost: 70, dmg: 3, range: 2.5, rate: 0.8, color: '#38bdf8', slow: 0.5, blurb: 'chills foes' },
  { name: 'Sniper', cost: 140, dmg: 75, range: 6, rate: 2.2, color: '#c084fc', blurb: 'huge range' },
]
const TRAP_COST = 35

interface FoeDef { hp: number; speed: number; size: number; bounty: number; foe: number }
const FOES: Record<FoeKind, FoeDef> = {
  grunt: { hp: 22, speed: 1.4, size: 24, bounty: 1, foe: 0 },
  runner: { hp: 13, speed: 2.4, size: 21, bounty: 1, foe: 1 },
  tank: { hp: 70, speed: 0.95, size: 30, bounty: 2.5, foe: 2 },
  swarm: { hp: 8, speed: 1.8, size: 17, bounty: 0.5, foe: 3 },
  boss: { hp: 22 * 14, speed: 0.8, size: 50, bounty: 12, foe: 2 },
}

interface Foe { kind: FoeKind; s: number; hp: number; max: number; speed: number; slowT: number; slowF: number; size: number; bounty: number; e: string; flash: number; boss: boolean; x: number; y: number; dead?: boolean }
interface Tower { c: number; r: number; kind: number; lvl: number; cd: number; spent: number; ang: number }
interface Proj { x: number; y: number; t: Foe; dmg: number; kind: number; speed: number }
interface Trap { c: number; r: number; charges: number; cd: number; spent: number }
interface Float { x: number; y: number; s: string; life: number; color: string }

const engine: Engine = {
  start(env) {
    const { theme: th, rng, mods } = env
    const hb = env.host.getBoundingClientRect()
    const portrait = hb.height > hb.width * 1.05
    const COLS = portrait ? 9 : 16
    const ROWS = portrait ? 13 : 11
    const W = portrait ? COLS * CELL : 800
    const H = portrait ? GY + ROWS * CELL + 130 : 480
    const PX = COLS * CELL // panel x (landscape)
    const PY = GY + ROWS * CELL // panel y (portrait)
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const ptr = pointer(st)
    const k = keys()
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const dungeon = /dungeon/i.test(env.name + ' ' + env.desc)
    const hardMod = mods.has('hard')
    const bossMod = mods.has('boss')
    const total = byDiff(env, 10, 14, 17)
    const hpMul = byDiff(env, 0.8, 1, 1.25) * (hardMod ? 1.25 : 1)
    const spdMul = byDiff(env, 0.9, 1, 1.1) * (mods.has('fast') ? 1.2 : mods.has('slow') ? 0.85 : 1)
    let lives = byDiff(env, 25, 18, 12) - (hardMod ? 4 : 0)
    let gold = byDiff(env, 220, 170, 140)
    const gapT = byDiff(env, 36, 30, 24)

    const path = portrait ? genPath(rng, ROWS, COLS).map((c) => ({ x: c.y, y: c.x })) : genPath(rng, COLS, ROWS)
    const onPath = new Set(path.map((c) => c.y * COLS + c.x))
    const decor = new Map<number, string>()
    for (let i = 0; i < 12; i++) {
      const c = rng.int(0, COLS - 1)
      const r = rng.int(0, ROWS - 1)
      const id = r * COLS + c
      if (!onPath.has(id) && !decor.has(id)) decor.set(id, rng.pick(DECOR))
    }
    const px = (i: number) => path[i].x * CELL + CELL / 2
    const py = (i: number) => GY + path[i].y * CELL + CELL / 2
    const plen = path.length - 1

    const towers: Tower[] = []
    const traps: Trap[] = []
    const foes: Foe[] = []
    const projs: Proj[] = []
    const floats: Float[] = []
    const queue: { kind: FoeKind; gap: number; wave: number }[] = []
    let spawnT = 0
    let wave = 0
    let countdown = 45
    let speed = 1
    let build = -1
    let selT: Tower | null = null
    let selTrap: Trap | null = null
    let hover = { c: -1, r: -1 }
    let over = false
    let time = 0
    let kills = 0
    let intro = 4
    let flashMsg = ''
    let flashT = 0
    const types = dungeon ? 5 : 4

    const score = () => kills * 10 + Math.max(0, wave - 1) * 100
    const hud = () => {
      env.score(score())
      env.status(`Wave ${Math.min(wave, total)}/${total} · ❤️ ${lives} · 🪙 ${gold}`)
    }
    hud()
    const msg = (s: string) => { flashMsg = s; flashT = 1.6 }
    const say = (x: number, y: number, s: string, color = '#fde68a') => floats.push({ x, y, s, life: 1, color })

    const stat = (t: Tower) => {
      const d = KINDS[t.kind]
      return { dmg: d.dmg * (1 + 0.6 * t.lvl), range: (d.range * (1 + 0.08 * t.lvl)) * CELL, rate: d.rate * (1 - 0.08 * t.lvl) }
    }
    const upCost = (t: Tower) => Math.floor(KINDS[t.kind].cost * 0.7 * (t.lvl + 1))

    const end = (won: boolean) => {
      if (over) return
      over = true
      const sc = score() + (won ? lives * 50 + 500 : 0)
      env.score(sc)
      env.sfx(won ? 'win' : 'lose')
      env.end({ score: sc, won, text: won ? `Held all ${total} waves with ${lives} lives left` : `Fell on wave ${wave} of ${total}` })
    }

    const sendWave = (early: boolean) => {
      if (over || wave >= total) return
      if (early && countdown > 0) {
        const b = Math.floor(countdown / 3)
        if (b > 0) { gold += b; say(W / 2, 60, `+${b} early bonus`, '#86efac') }
      }
      wave++
      for (const g of waveSpec(wave, total, bossMod)) {
        for (let i = 0; i < g.count; i++) queue.push({ kind: g.kind, gap: g.kind === 'swarm' ? 0.35 : g.kind === 'runner' ? 0.5 : g.kind === 'boss' ? 2.5 : 0.75, wave })
      }
      countdown = wave >= total ? 0 : gapT
      env.sfx('power')
      if (wave === total) msg('FINAL WAVE!')
      else if (bossMod && wave % 5 === 0) msg('BOSS WAVE!')
      hud()
    }

    const spawn = (kind: FoeKind, w: number) => {
      const d = FOES[kind]
      let hp = d.hp * hpScale(w) * hpMul
      if (kind === 'boss') hp = d.hp * hpScale(w) * hpMul * (w === total ? 1.15 : 0.5)
      const bounty = Math.round((3 + w * 0.7) * d.bounty * (kind === 'boss' ? 1 : 1))
      foes.push({ kind, s: 0, hp, max: hp, speed: d.speed * spdMul, slowT: 0, slowF: 1, size: d.size, bounty, e: th.foes[d.foe % th.foes.length], flash: 0, boss: kind === 'boss', x: px(0), y: py(0) })
    }

    const canBuild = (c: number, r: number) => c >= 0 && r >= 0 && c < COLS && r < ROWS && !onPath.has(r * COLS + c) && !decor.has(r * COLS + c) && !towers.some((t) => t.c === c && t.r === r)

    const place = (c: number, r: number) => {
      if (build === 4) {
        if (!onPath.has(r * COLS + c) || traps.some((t) => t.c === c && t.r === r)) return msg('Traps go on the path')
        if (gold < TRAP_COST) return msg('Not enough gold')
        gold -= TRAP_COST
        traps.push({ c, r, charges: 6, cd: 0, spent: TRAP_COST })
        env.sfx('click')
        fx.burst(c * CELL + 20, GY + r * CELL + 20, '#a8a29e', 8, 80)
        hud()
        return
      }
      if (!canBuild(c, r)) return msg('Cannot build there')
      const d = KINDS[build]
      if (gold < d.cost) return msg('Not enough gold')
      gold -= d.cost
      const t: Tower = { c, r, kind: build, lvl: 0, cd: 0.3, spent: d.cost, ang: -Math.PI / 2 }
      towers.push(t)
      selT = t
      selTrap = null
      env.sfx('move')
      fx.burst(c * CELL + 20, GY + r * CELL + 20, d.color, 12, 120)
      hud()
    }
    const upgrade = () => {
      if (!selT || selT.lvl >= 3) return
      const c = upCost(selT)
      if (gold < c) return msg('Not enough gold')
      gold -= c
      selT.spent += c
      selT.lvl++
      env.sfx('power')
      fx.burst(selT.c * CELL + 20, GY + selT.r * CELL + 20, '#fde68a', 16, 140)
      hud()
    }
    const sell = () => {
      if (selT) {
        const v = Math.floor(selT.spent * 0.7)
        gold += v
        say(selT.c * CELL + 20, GY + selT.r * CELL, `+${v}`)
        fx.burst(selT.c * CELL + 20, GY + selT.r * CELL + 20, '#fde68a', 10, 100)
        towers.splice(towers.indexOf(selT), 1)
        selT = null
        env.sfx('click')
      } else if (selTrap) {
        const v = Math.floor(selTrap.spent * 0.5)
        gold += v
        traps.splice(traps.indexOf(selTrap), 1)
        selTrap = null
        env.sfx('click')
      }
      hud()
    }

    // ---- UI geometry ----
    const btnRect = (i: number) => (portrait ? { x: 4 + i * 71, y: PY + 6, w: 67, h: 56 } : { x: PX + 8, y: 62 + i * 50, w: 144, h: 45 })
    const upRect = portrait ? { x: 8, y: PY + 84, w: 170, h: 42 } : { x: PX + 8, y: 400, w: 144, h: 32 }
    const sellRect = portrait ? { x: 186, y: PY + 84, w: 166, h: 42 } : { x: PX + 8, y: 438, w: 144, h: 34 }
    const speedRect = portrait ? { x: 238, y: 5, w: 42, h: 30 } : { x: PX + 8, y: 6, w: 52, h: 28 }
    const sendRect = portrait ? { x: 284, y: 5, w: 72, h: 30 } : { x: PX + 66, y: 6, w: 86, h: 28 }
    const inR = (r: { x: number; y: number; w: number; h: number }, x: number, y: number) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h

    const click = (x: number, y: number) => {
      if (over) return
      intro = 0
      if (inR(speedRect, x, y)) { speed = speed === 1 ? 2 : 1; env.sfx('click'); return }
      if (inR(sendRect, x, y)) { sendWave(true); return }
      if (portrait ? y >= PY : x >= PX) {
        for (let i = 0; i < types; i++) if (inR(btnRect(i), x, y)) { build = build === i ? -1 : i; selT = null; selTrap = null; env.sfx('click'); return }
        if ((selT || selTrap) && inR(sellRect, x, y)) return sell()
        if (selT && inR(upRect, x, y)) return upgrade()
        return
      }
      if (y < GY || y >= GY + ROWS * CELL) return
      const c = Math.floor(x / CELL)
      const r = Math.floor((y - GY) / CELL)
      const tw = towers.find((t) => t.c === c && t.r === r)
      const tr = traps.find((t) => t.c === c && t.r === r)
      if (tw && (build < 0 || build !== 4)) { selT = tw; selTrap = null; build = -1; env.sfx('click'); return }
      if (build >= 0) return place(c, r)
      if (tr) { selTrap = tr; selT = null; env.sfx('click'); return }
      selT = null
      selTrap = null
    }
    ptr.onDown((p) => {
      if (p.button === 2) { build = -1; selT = null; selTrap = null; return }
      click(p.x, p.y)
    })
    ptr.onMove((p) => {
      hover = { c: Math.floor(p.x / CELL), r: Math.floor((p.y - GY) / CELL) }
    })
    k.onKey((e) => {
      if (over) return
      if (e.code >= 'Digit1' && e.code <= 'Digit5') {
        const i = Number(e.code.slice(5)) - 1
        if (i < types) { build = build === i ? -1 : i; selT = null; selTrap = null }
      } else if (e.code === 'KeyU') upgrade()
      else if (e.code === 'KeyE' || e.code === 'Delete') sell()
      else if (e.code === 'KeyF') speed = speed === 1 ? 2 : 1
      else if (e.code === 'Space' || e.code === 'Enter') sendWave(true)
      else if (e.code === 'Escape') { build = -1; selT = null; selTrap = null }
    })

    // ---- simulation ----
    const damage = (f: Foe, d: number) => {
      f.hp -= d
      f.flash = 0.1
      if (f.hp <= 0 && !f.dead) {
        f.dead = true
        gold += f.bounty
        kills++
        say(f.x, f.y - 12, `+${f.bounty}`)
        fx.burst(f.x, f.y, f.boss ? '#fde68a' : th.accent2, f.boss ? 40 : 10, f.boss ? 260 : 120, f.boss ? 5 : 3)
        if (f.boss) { shake.kick(10); env.sfx('boom') } else env.sfx('hit')
        hud()
      }
    }
    const foePos = (f: Foe) => {
      const i = Math.min(plen - 1, Math.floor(f.s))
      const u = f.s - i
      f.x = px(i) + (px(i + 1) - px(i)) * u
      f.y = py(i) + (py(i + 1) - py(i)) * u
    }

    const step = (dt: number) => {
      time += dt
      // waves
      if (wave < total) {
        countdown -= dt
        if (countdown <= 0) sendWave(false)
      }
      spawnT -= dt
      if (queue.length && spawnT <= 0) {
        const q = queue.shift()!
        spawn(q.kind, q.wave)
        spawnT = q.gap
      }
      // foes
      for (const f of foes) {
        if (f.slowT > 0) f.slowT -= dt
        else f.slowF = 1
        if (f.flash > 0) f.flash -= dt
        f.s += f.speed * f.slowF * dt
        foePos(f)
        if (f.s >= plen) {
          f.dead = true
          const dmg = f.boss ? 5 : 1
          lives -= dmg
          shake.kick(6)
          env.sfx('lose')
          fx.burst(f.x, f.y, th.danger, 14, 160)
          hud()
          if (lives <= 0) end(false)
        }
      }
      for (let i = foes.length - 1; i >= 0; i--) if (foes[i].dead) foes.splice(i, 1)
      // traps
      for (const tr of traps) {
        tr.cd -= dt
        if (tr.cd > 0) continue
        const cx = tr.c * CELL + CELL / 2
        const cy = GY + tr.r * CELL + CELL / 2
        let hit = false
        for (const f of foes) {
          if (Math.abs(f.x - cx) < 17 && Math.abs(f.y - cy) < 17) {
            damage(f, 28 + wave * 8)
            f.slowT = 0.6
            f.slowF = 0.5
            hit = true
          }
        }
        if (hit) {
          tr.cd = 1.2
          tr.charges--
          env.sfx('hit')
          fx.burst(cx, cy, '#e7e5e4', 10, 130)
        }
      }
      for (let i = traps.length - 1; i >= 0; i--) if (traps[i].charges <= 0) { if (selTrap === traps[i]) selTrap = null; traps.splice(i, 1) }
      // towers
      for (const t of towers) {
        t.cd -= dt
        const s = stat(t)
        const cx = t.c * CELL + CELL / 2
        const cy = GY + t.r * CELL + CELL / 2
        let best: Foe | null = null
        for (const f of foes) {
          if ((Math.hypot(f.x - cx, f.y - cy)) <= s.range && (!best || f.s > best.s)) best = f
        }
        if (best) t.ang = Math.atan2(best.y - cy, best.x - cx)
        if (best && t.cd <= 0) {
          t.cd = s.rate
          if (t.kind === 3) {
            damage(best, s.dmg)
            fx.burst(best.x, best.y, KINDS[3].color, 8, 120)
            beams.push({ x1: cx, y1: cy, x2: best.x, y2: best.y, life: 0.12 })
            env.sfx('shoot')
          } else {
            projs.push({ x: cx + Math.cos(t.ang) * 14, y: cy + Math.sin(t.ang) * 14, t: best, dmg: s.dmg, kind: t.kind, speed: t.kind === 1 ? 300 : 460 })
            if (t.kind !== 0) env.sfx('shoot')
          }
        }
      }
      for (const p of projs) {
        const d = Math.hypot(p.t.x - p.x, p.t.y - p.y)
        const m = p.speed * dt
        if (d <= m + 4) {
          const def = KINDS[p.kind]
          if (def.splash) {
            for (const f of foes) if (Math.hypot(f.x - p.t.x, f.y - p.t.y) <= def.splash * CELL) damage(f, p.dmg)
            fx.burst(p.t.x, p.t.y, def.color, 16, 170, 4)
            env.sfx('boom')
          } else {
            damage(p.t, p.dmg)
            if (def.slow) { p.t.slowT = 1.8; p.t.slowF = 1 - def.slow }
            fx.burst(p.t.x, p.t.y, def.color, 4, 70, 2)
          }
          p.dmg = -1
        } else {
          p.x += ((p.t.x - p.x) / d) * m
          p.y += ((p.t.y - p.y) / d) * m
        }
      }
      for (let i = projs.length - 1; i >= 0; i--) if (projs[i].dmg < 0) projs.splice(i, 1)
      // remove killed (damage() may have flagged)
      for (let i = foes.length - 1; i >= 0; i--) if (foes[i].dead) foes.splice(i, 1)
      // victory
      if (!over && wave >= total && !queue.length && !foes.length) end(true)
    }
    const beams: { x1: number; y1: number; x2: number; y2: number; life: number }[] = []

    const update = (dt: number) => {
      fx.update(dt)
      shake.update(dt)
      if (intro > 0) intro -= dt
      if (flashT > 0) flashT -= dt
      for (const f of floats) { f.life -= dt * 1.2; f.y -= 22 * dt }
      for (let i = floats.length - 1; i >= 0; i--) if (floats[i].life <= 0) floats.splice(i, 1)
      for (const b of beams) b.life -= dt
      for (let i = beams.length - 1; i >= 0; i--) if (beams[i].life <= 0) beams.splice(i, 1)
      if (over) return
      for (let i = 0; i < speed; i++) step(dt)
    }

    // ---- drawing ----
    const T = (s: string, x: number, y: number, size: number, color = th.fg, align: CanvasTextAlign = 'left') => text(ctx, s, x, y, { size, color, align, font: SANS, weight: 700 })

    const drawTower = (t: Tower, ghost = false) => {
      const d = KINDS[t.kind]
      const cx = t.c * CELL + CELL / 2
      const cy = GY + t.r * CELL + CELL / 2
      ctx.globalAlpha = ghost ? 0.6 : 1
      ctx.fillStyle = 'rgba(0,0,0,.35)'
      ctx.beginPath(); ctx.ellipse(cx, cy + 12, 15, 6, 0, 0, 7); ctx.fill()
      ctx.fillStyle = '#1f2937'
      ctx.beginPath(); ctx.arc(cx, cy, 17, 0, 7); ctx.fill()
      ctx.fillStyle = d.color
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,.5)'
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(t.ang) * 19, cy + Math.sin(t.ang) * 19); ctx.stroke()
      emoji(ctx, th.items[t.kind % th.items.length], cx, cy, 17)
      for (let i = 0; i < t.lvl; i++) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx - 9 + i * 9, cy + 18, 2.6, 0, 7); ctx.fill() }
      ctx.globalAlpha = 1
    }

    const draw = () => {
      background(ctx, W, H, th, 30, env.seed)
      ctx.save()
      shake.apply(ctx)
      // board
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        ctx.fillStyle = (r + c) % 2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.08)'
        ctx.fillRect(c * CELL, GY + r * CELL, CELL, CELL)
      }
      // path
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      const trace = () => { ctx.beginPath(); path.forEach((_, i) => (i ? ctx.lineTo(px(i), py(i)) : ctx.moveTo(px(i), py(i)))); ctx.stroke() }
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = CELL - 2; trace()
      ctx.strokeStyle = dungeon ? '#57534e' : th.blocks[2 % th.blocks.length]; ctx.globalAlpha = dungeon ? 1 : 0.55; ctx.lineWidth = CELL - 8; trace()
      ctx.globalAlpha = 0.18; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([6, 10]); trace(); ctx.setLineDash([])
      ctx.globalAlpha = 1
      for (const [id, e] of decor) emoji(ctx, e, (id % COLS) * CELL + 20, GY + Math.floor(id / COLS) * CELL + 20, 24)
      // gate + base
      emoji(ctx, '🕳️', px(0), py(0), 26)
      const bx = px(plen)
      const by = py(plen)
      ctx.fillStyle = th.good; ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(bx, by, 22, 0, 7); ctx.fill(); ctx.globalAlpha = 1
      emoji(ctx, th.hero, bx, by + Math.sin(time * 3) * 1.5, 30)
      // traps
      for (const tr of traps) {
        const cx = tr.c * CELL + 20
        const cy = GY + tr.r * CELL + 20
        ctx.strokeStyle = tr.cd > 0 ? '#ef4444' : '#e7e5e4'
        ctx.lineWidth = 2
        for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(cx + i * 6, cy + 7); ctx.lineTo(cx + i * 6, cy - (tr.cd > 0 ? 8 : 3)); ctx.stroke() }
        if (selTrap === tr) { ctx.strokeStyle = '#fff'; ctx.strokeRect(tr.c * CELL + 2, GY + tr.r * CELL + 2, CELL - 4, CELL - 4) }
      }
      // hover
      const showR = selT ?? (build >= 0 && build < 4 && hover.c >= 0 && hover.c < COLS ? { c: hover.c, r: hover.r, kind: build, lvl: 0, ang: 0, cd: 0, spent: 0 } as Tower : null)
      if (build >= 0 && hover.c >= 0 && hover.c < COLS && hover.r >= 0 && hover.r < ROWS) {
        const ok = build === 4 ? onPath.has(hover.r * COLS + hover.c) : canBuild(hover.c, hover.r)
        ctx.fillStyle = ok ? 'rgba(134,239,172,.3)' : 'rgba(248,113,113,.3)'
        ctx.fillRect(hover.c * CELL, GY + hover.r * CELL, CELL, CELL)
        if (ok && build < 4) drawTower({ c: hover.c, r: hover.r, kind: build, lvl: 0, ang: -0.6, cd: 0, spent: 0 }, true)
      }
      if (showR) {
        const rg = stat(showR).range
        ctx.strokeStyle = 'rgba(255,255,255,.7)'
        ctx.fillStyle = 'rgba(255,255,255,.07)'
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(showR.c * CELL + 20, GY + showR.r * CELL + 20, rg, 0, 7); ctx.fill(); ctx.stroke()
      }
      for (const t of towers) drawTower(t)
      if (selT) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(selT.c * CELL + 2, GY + selT.r * CELL + 2, CELL - 4, CELL - 4) }
      // foes
      const sorted = [...foes].sort((a, b) => a.y - b.y)
      for (const f of sorted) {
        const bob = Math.sin(time * 8 + f.s * 3) * 1.5
        if (f.boss) {
          ctx.shadowColor = th.danger; ctx.shadowBlur = 18
        }
        if (f.slowT > 0) { ctx.fillStyle = 'rgba(56,189,248,.35)'; ctx.beginPath(); ctx.arc(f.x, f.y, f.size * 0.6, 0, 7); ctx.fill() }
        emoji(ctx, f.e, f.x, f.y + bob, f.size)
        ctx.shadowBlur = 0
        if (f.flash > 0) { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(f.x, f.y, f.size * 0.5, 0, 7); ctx.fill() }
        if (f.boss) emoji(ctx, '👑', f.x, f.y - f.size * 0.62, 18)
        const bw = Math.max(20, f.size)
        ctx.fillStyle = 'rgba(0,0,0,.6)'
        ctx.fillRect(f.x - bw / 2 - 1, f.y - f.size * 0.7 - 6, bw + 2, 5)
        const fr = clamp(f.hp / f.max, 0, 1)
        ctx.fillStyle = fr > 0.5 ? th.good : fr > 0.25 ? '#facc15' : th.danger
        ctx.fillRect(f.x - bw / 2, f.y - f.size * 0.7 - 5, bw * fr, 3)
      }
      for (const p of projs) {
        ctx.fillStyle = KINDS[p.kind].color
        ctx.shadowColor = KINDS[p.kind].color; ctx.shadowBlur = 8
        ctx.beginPath(); ctx.arc(p.x, p.y, p.kind === 1 ? 5 : 3, 0, 7); ctx.fill()
        ctx.shadowBlur = 0
      }
      for (const b of beams) {
        ctx.strokeStyle = KINDS[3].color; ctx.globalAlpha = b.life / 0.12; ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke(); ctx.globalAlpha = 1
      }
      fx.draw(ctx)
      for (const f of floats) { ctx.globalAlpha = clamp(f.life, 0, 1); T(f.s, f.x, f.y, 13, f.color, 'center') }
      ctx.globalAlpha = 1
      ctx.restore()

      // top bar
      ctx.fillStyle = 'rgba(0,0,0,.55)'
      ctx.fillRect(0, 0, W, GY)
      const nextPrev = (x0: number, y0: number) => {
        let x = x0
        for (const g of waveSpec(wave + 1, total, bossMod)) {
          const d = FOES[g.kind]
          emoji(ctx, th.foes[d.foe % th.foes.length], x + 8, y0, g.kind === 'boss' ? 22 : 16)
          T(`×${g.count}`, x + 20, y0, 12, g.kind === 'boss' ? th.danger : th.fg)
          x += 56
        }
      }
      const wl = wave >= total ? 'Final wave' : `Wave ${wave}/${total}`
      if (portrait) {
        T(`🪙 ${gold}`, 6, 20, 14, '#fde68a')
        T(`❤️ ${lives}`, 78, 20, 14, th.fg)
        T(wl, 124, 20, 12, th.accent)
      } else {
        T(`🪙 ${gold}`, 10, 20, 16, '#fde68a')
        T(`❤️ ${lives}`, 100, 20, 16, th.fg)
        T(wl, 175, 20, 14, th.accent)
        if (wave < total) {
          T('Next:', 285, 20, 11, '#a1a1aa')
          nextPrev(325, 20)
        } else T(foes.length + queue.length ? `${foes.length + queue.length} foes left` : '', 285, 20, 12, '#a1a1aa')
      }
      roundRect(ctx, speedRect.x, speedRect.y, speedRect.w, speedRect.h, 8, speed === 2 ? th.accent : 'rgba(255,255,255,.14)')
      T('×' + speed, speedRect.x + speedRect.w / 2, speedRect.y + 15, 14, speed === 2 ? '#111' : th.fg, 'center')
      const sendOk = wave < total
      roundRect(ctx, sendRect.x, sendRect.y, sendRect.w, sendRect.h, 8, sendOk ? th.good : 'rgba(255,255,255,.08)')
      T(sendOk ? (wave === 0 ? `GO ${Math.ceil(countdown)}s` : `SEND ${Math.max(0, Math.ceil(countdown))}`) : 'DONE', sendRect.x + sendRect.w / 2, sendRect.y + 15, 12, sendOk ? '#0b0b0b' : '#777', 'center')

      // build panel
      ctx.fillStyle = 'rgba(8,6,20,.82)'
      if (portrait) ctx.fillRect(0, PY, W, H - PY)
      else ctx.fillRect(PX, GY, W - PX, H - GY)
      if (!portrait) T('BUILD', PX + 8, 52, 11, '#a1a1aa')
      for (let i = 0; i < types; i++) {
        const r = btnRect(i)
        const trap = i === 4
        const d = trap ? { name: 'Trap', cost: TRAP_COST, color: '#a8a29e', blurb: 'on the path' } : KINDS[i]
        const can = gold >= d.cost
        roundRect(ctx, r.x, r.y, r.w, r.h, 8, build === i ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.08)', build === i ? d.color : undefined)
        const ic = trap ? '🪤' : th.items[i % th.items.length]
        if (portrait) {
          ctx.fillStyle = d.color; ctx.beginPath(); ctx.arc(r.x + r.w / 2, r.y + 19, 14, 0, 7); ctx.fill()
          emoji(ctx, ic, r.x + r.w / 2, r.y + 19, 17)
          T(d.name, r.x + r.w / 2, r.y + 38, 10, th.fg, 'center')
          T(`🪙${d.cost}`, r.x + r.w / 2, r.y + 50, 10, can ? '#fde68a' : '#f87171', 'center')
        } else {
          ctx.fillStyle = d.color; ctx.beginPath(); ctx.arc(r.x + 22, r.y + r.h / 2, 15, 0, 7); ctx.fill()
          emoji(ctx, ic, r.x + 22, r.y + r.h / 2, 17)
          T(`${i + 1} ${d.name}`, r.x + 44, r.y + 16, 13, th.fg)
          T(`🪙${d.cost}`, r.x + 44, r.y + 33, 12, can ? '#fde68a' : '#f87171')
        }
      }
      const ix = portrait ? 8 : PX + 8
      const iy = portrait ? PY + 76 : 330
      const dy = portrait ? 0 : 19
      if (selT) {
        const d = KINDS[selT.kind]
        const s = stat(selT)
        if (portrait) {
          T(`${d.name} L${selT.lvl + 1}  Dmg ${s.dmg.toFixed(0)}  Rng ${(s.range / CELL).toFixed(1)}  ${(1 / s.rate).toFixed(1)}/s`, ix, iy, 11, d.color)
        } else {
          T(`${d.name} L${selT.lvl + 1}`, ix, iy, 13, d.color)
          T(`Dmg ${s.dmg.toFixed(0)}${d.splash ? ' (area)' : ''}  Rng ${(s.range / CELL).toFixed(1)}`, ix, iy + dy, 10.5, th.fg)
          T(`Rate ${(1 / s.rate).toFixed(1)}/s`, ix, iy + dy * 2 - 3, 10.5, th.fg)
          T(d.blurb, ix, iy + dy * 3 - 6, 10.5, '#a1a1aa')
        }
        const uc = upCost(selT)
        const maxed = selT.lvl >= 3
        roundRect(ctx, upRect.x, upRect.y, upRect.w, upRect.h, 8, maxed ? 'rgba(255,255,255,.08)' : gold >= uc ? th.accent : 'rgba(255,255,255,.14)')
        T(maxed ? 'MAX' : `Upgrade 🪙${uc}`, upRect.x + upRect.w / 2, upRect.y + upRect.h / 2, 12, maxed ? '#888' : gold >= uc ? '#111' : '#aaa', 'center')
        roundRect(ctx, sellRect.x, sellRect.y, sellRect.w, sellRect.h, 8, 'rgba(239,68,68,.35)')
        T(`Sell +${Math.floor(selT.spent * 0.7)}`, sellRect.x + sellRect.w / 2, sellRect.y + sellRect.h / 2, 12, '#fff', 'center')
      } else if (selTrap) {
        T(`Spike trap  Dmg ${28 + wave * 8}  Charges ${selTrap.charges}`, ix, iy, 11, '#e7e5e4')
        roundRect(ctx, sellRect.x, sellRect.y, sellRect.w, sellRect.h, 8, 'rgba(239,68,68,.35)')
        T('Sell', sellRect.x + sellRect.w / 2, sellRect.y + sellRect.h / 2, 12, '#fff', 'center')
      } else if (portrait) {
        if (wave < total) { T('Next:', 8, PY + 78, 11, '#a1a1aa'); nextPrev(56, PY + 78) }
        T(build >= 0 ? 'Tap a tile to place it' : 'Tap a tower, then a free tile', 8, PY + 106, 11, '#a1a1aa')
      } else {
        T(build >= 0 ? 'Click the board' : 'Pick a tower, then', ix, 336, 10.5, '#a1a1aa')
        T(build >= 0 ? 'to place it' : 'click a free tile.', ix, 352, 10.5, '#a1a1aa')
        T('Space: send wave', ix, 380, 10.5, '#71717a')
        T('F: speed  U: upgrade', ix, 396, 10.5, '#71717a')
      }
      if (flashT > 0) {
        ctx.globalAlpha = clamp(flashT, 0, 1)
        text(ctx, flashMsg, (portrait ? W : PX) / 2, GY + 30, { size: 14, color: '#fff', shadow: th.danger })
        ctx.globalAlpha = 1
      }
      if (intro > 0) {
        ctx.globalAlpha = clamp(intro, 0, 1)
        const cx = (portrait ? W : PX) / 2
        const bw = portrait ? 340 : 440
        roundRect(ctx, cx - bw / 2, 150, bw, 120, 14, 'rgba(0,0,0,.75)', th.accent)
        text(ctx, env.name.length > 22 && portrait ? env.name.slice(0, 22) : env.name, cx, 185, { size: portrait ? 12 : 16, color: th.accent })
        T(dungeon ? 'Build towers beside the path, set traps on it.' : 'Build towers beside the path to stop foes.', cx, 220, portrait ? 11 : 13, th.fg, 'center')
        T(`Protect ${th.hero} for ${total} waves.`, cx, 242, 12, '#a1a1aa', 'center')
        ctx.globalAlpha = 1
      }
    }

    const lp = loop(update, draw)
    return {
      destroy() {
        lp.stop(); ptr.dispose(); k.dispose(); bag.dispose(); st.dispose()
      },
      pause(p) { lp.pause(p) },
    }
  },
}
export default engine
