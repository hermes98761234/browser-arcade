// Tactics: turn-based grid tactics (squad, terrain, enemy AI), auto-battler (buy + place, fight automatically) and creature battles.
import { background, byDiff, clamp, createStage, emoji, keys, loop, Particles, pointer, roundRect, Shake, text, type Engine, type GameEnv, type Stage } from '../kit'
import { CLS, CLS_LIST, genCreature, genTerrain, manhattan, moveDamage, pathTo, reach, typeMult, TYPE_ICON, TYPES, type Cls, type Creature, type CType, type Terrain } from '../logic/tactics'

const SANS = 'system-ui, sans-serif'
const TOP = 34

interface Mode {
  update(dt: number): void
  draw(): void
  click(x: number, y: number): void
  key(code: string): void
}
interface Ctx {
  env: GameEnv
  st: Stage
  ctx: CanvasRenderingContext2D
  W: number
  H: number
  portrait: boolean
  fx: Particles
  shake: Shake
  T: (s: string, x: number, y: number, size?: number, color?: string, align?: CanvasTextAlign) => void
  btn: (x: number, y: number, w: number, h: number, label: string, o?: { on?: boolean; dis?: boolean; color?: string }) => void
  hp: (x: number, y: number, w: number, frac: number, h?: number) => void
  inR: (r: { x: number; y: number; w: number; h: number }, x: number, y: number) => boolean
  later: (fn: () => void, ms: number) => void
}

const heroSet = (env: GameEnv) => [env.theme.hero, ...env.theme.heroes.filter((h) => h !== env.theme.hero)]

// ======================================================= CLASSIC
interface U { id: number; team: 0 | 1; cls: Cls; e: string; hp: number; max: number; atk: number; t: number; moved: boolean; acted: boolean; x: number; y: number; path: number[]; flash: number; lunge: number; lx: number; ly: number; then?: () => void }

function classic(c: Ctx): Mode & { status(): string } {
  const { env, ctx, W, H, portrait, fx, shake, T } = c
  const th = env.theme
  const rng = env.rng
  const cols = portrait ? 7 : 14
  const rows = portrait ? 10 : 8
  const cell = portrait ? 50 : 48
  const ox = (W - cols * cell) / 2
  const oy = TOP + 4
  const B = byDiff(env, 2, 3, 3)
  const maxSquad = 5
  let battle = 0
  let terrain: Terrain[] = []
  let units: U[] = []
  let nextId = 1
  let phase: 'player' | 'enemy' | 'victory' | 'over' = 'player'
  let sel: U | null = null
  let info: U | null = null
  let turn = 1
  let kills = 0
  let timer = 0
  let enemyQ: U[] = []
  let flashMsg = ''
  let flashT = 0
  let reachMap = new Map<number, number>()
  let targets: U[] = []
  const floats: { x: number; y: number; s: string; life: number; color: string }[] = []
  let squad: { cls: Cls; e: string }[] = []
  const heroes = heroSet(env)
  const startCls: Cls[] = ['warrior', 'archer', 'healer', 'mage', 'knight']
  const nStart = byDiff(env, 5, 4, 4)
  for (let i = 0; i < nStart; i++) squad.push({ cls: startCls[i], e: heroes[i % heroes.length] })
  let intro = 4

  const tx = (i: number) => ox + (i % cols) * cell + cell / 2
  const ty = (i: number) => oy + Math.floor(i / cols) * cell + cell / 2
  const unitAt = (i: number) => units.find((u) => u.hp > 0 && u.t === i)
  const occupied = (except?: U) => new Set(units.filter((u) => u.hp > 0 && u !== except).map((u) => u.t))
  const msg = (s: string) => { flashMsg = s; flashT = 1.5 }
  const float = (x: number, y: number, s: string, color: string) => floats.push({ x, y, s, life: 1, color })
  const busy = () => units.some((u) => u.path.length || u.lunge > 0)

  const mk = (team: 0 | 1, cls: Cls, e: string, t: number, scale = 1): U => {
    const d = CLS[cls]
    const hp = Math.round(d.hp * scale)
    return { id: nextId++, team, cls, e, hp, max: hp, atk: Math.round(d.atk * (1 + (scale - 1) * 0.6)), t, moved: false, acted: false, x: tx(t), y: ty(t), path: [], flash: 0, lunge: 0, lx: 0, ly: 0 }
  }

  const startBattle = () => {
    battle++
    terrain = genTerrain(rng, cols, rows, 2)
    units = []
    const zoneA: number[] = []
    const zoneB: number[] = []
    for (let i = 0; i < cols * rows; i++) {
      if (terrain[i] >= 2) continue
      const a = portrait ? Math.floor(i / cols) : i % cols
      const long = portrait ? rows : cols
      if (a < 2) zoneA.push(i)
      else if (a >= long - 2) zoneB.push(i)
    }
    rng.shuffle(zoneA); rng.shuffle(zoneB)
    const mine = portrait ? zoneB : zoneA
    const theirs = portrait ? zoneA : zoneB
    squad.forEach((s, i) => units.push(mk(0, s.cls, s.e, mine[i])))
    const n = Math.min(6, byDiff(env, 3, 4, 4) + battle - 1 + (battle > 2 ? 0 : 0))
    const scale = 1 + 0.12 * (battle - 1) + byDiff(env, -0.1, 0, 0.12)
    const pool: Cls[] = ['warrior', 'warrior', 'archer', 'knight', 'mage', 'rogue', 'healer']
    for (let i = 0; i < n; i++) units.push(mk(1, i === 0 && battle === B ? 'knight' : rng.pick(pool), th.foes[i % th.foes.length], theirs[i], battle === B && i === 0 ? scale * 1.5 : scale))
    phase = 'player'
    turn = 1
    sel = null
    info = null
    reachMap = new Map()
    targets = []
    msg(battle === B ? 'Final battle!' : `Battle ${battle}`)
  }

  const coverMult = (u: U) => (terrain[u.t] === 1 ? 0.65 : 1)
  const dmgOf = (a: U, d: U) => Math.max(1, Math.round(a.atk * (a.cls === 'mage' ? 1 : coverMult(d)) * rng.range(0.9, 1.1)))
  const inRange = (a: U, fromTile: number, d: U) => {
    const dist = manhattan(fromTile, d.t, cols)
    return dist >= CLS[a.cls].rmin && dist <= CLS[a.cls].rmax
  }
  const computeTargets = (u: U, from: number) => {
    if (u.acted) return []
    const out: U[] = []
    for (const o of units) {
      if (o.hp <= 0 || o === u) continue
      if (u.cls === 'healer' && o.team === u.team && o.hp < o.max && inRange(u, from, o)) out.push(o)
      else if (o.team !== u.team && inRange(u, from, o)) out.push(o)
    }
    return out
  }
  const kill = (d: U) => {
    fx.burst(d.x, d.y, d.team ? th.danger : th.accent, 22, 200, 4)
    shake.kick(d.team ? 4 : 7)
    env.sfx('boom')
    if (d.team === 1) kills++
    if (sel === d) { sel = null; reachMap = new Map(); targets = [] }
  }
  const hit = (a: U, d: U, mult = 1) => {
    const dmg = Math.max(1, Math.round(dmgOf(a, d) * mult))
    d.hp -= dmg
    d.flash = 0.2
    float(d.x, d.y - 16, `-${dmg}`, '#fff')
    fx.burst(d.x, d.y, '#fff', 6, 100)
    if (d.hp <= 0) kill(d)
    else env.sfx('hit')
  }
  const attack = (a: U, d: U) => {
    a.acted = true
    a.moved = true
    a.lunge = 0.28
    a.lx = (d.x - a.x) * 0.35
    a.ly = (d.y - a.y) * 0.35
    if (a.cls === 'healer' && d.team === a.team) {
      const h = Math.min(d.max - d.hp, 9)
      d.hp += h
      float(d.x, d.y - 16, `+${h}`, '#86efac')
      fx.burst(d.x, d.y, '#86efac', 10, 90)
      env.sfx('power')
      return
    }
    env.sfx(CLS[a.cls].rmax > 1 ? 'shoot' : 'hit')
    hit(a, d)
    if (a.cls === 'mage') for (const o of units) if (o.hp > 0 && o.team === d.team && o !== d && manhattan(o.t, d.t, cols) === 1) hit(a, o, 0.6)
    if (d.hp <= 0 && a.cls === 'rogue') { /* rogue keeps momentum visually only */ }
  }
  const moveUnit = (u: U, to: number, then?: () => void) => {
    const p = pathTo(terrain, cols, rows, u.t, to, 99, occupied(u))
    u.t = to
    u.moved = true
    u.path = p.slice(1)
    u.then = then
    if (!u.path.length) { u.then = undefined; then?.() }
  }

  const select = (u: U | null) => {
    sel = u
    if (u) info = u
    if (!u || u.acted || u.team !== 0) { reachMap = new Map(); targets = []; return }
    reachMap = u.moved ? new Map() : reach(terrain, cols, rows, u.t, CLS[u.cls].move, occupied(u))
    targets = computeTargets(u, u.t)
  }
  const afterAction = (u: U) => {
    if (u.hp > 0 && !u.acted) { select(u); if (!targets.length && u.moved) { u.acted = true; select(null) } } else select(null)
    checkEnd()
    if (phase === 'player' && units.filter((x) => x.team === 0 && x.hp > 0).every((x) => x.acted)) endTurn()
  }
  const checkEnd = () => {
    if (phase === 'victory' || phase === 'over') return
    if (!units.some((u) => u.team === 1 && u.hp > 0)) {
      phase = 'victory'
      env.sfx('win')
      squad = units.filter((u) => u.team === 0 && u.hp > 0).map((u) => ({ cls: u.cls, e: u.e }))
      if (squad.length < maxSquad) squad.push({ cls: CLS_LIST[rng.int(0, 5)], e: heroes[squad.length % heroes.length] })
      if (battle >= B) finish(true)
    } else if (!units.some((u) => u.team === 0 && u.hp > 0)) {
      phase = 'over'
      finish(false)
    }
  }
  const score = () => kills * 50 + (battle - 1) * 200 + units.filter((u) => u.team === 0 && u.hp > 0).length * 30
  let ended = false
  const finish = (won: boolean) => {
    if (ended) return
    ended = true
    const sc = score() + (won ? 300 : 0)
    env.score(sc)
    env.sfx(won ? 'win' : 'lose')
    c.later(() => env.end({ score: sc, won, text: won ? `Won all ${B} battles` : `Fell in battle ${battle}` }), won ? 900 : 700)
  }

  const endTurn = () => {
    if (phase !== 'player') return
    phase = 'enemy'
    select(null)
    enemyQ = units.filter((u) => u.team === 1 && u.hp > 0)
    timer = 0.5
    for (const u of units) { u.acted = false; u.moved = false }
  }

  const aiAct = (u: U) => {
    const occ = occupied(u)
    const rm = reach(terrain, cols, rows, u.t, CLS[u.cls].move, occ)
    const foes = units.filter((o) => o.hp > 0 && o.team === 0)
    const allies = units.filter((o) => o.hp > 0 && o.team === 1)
    let best: { tile: number; tgt: U | null; sc: number } | null = null
    const dumb = rng.chance(byDiff(env, 0.3, 0.1, 0))
    for (const [tile] of rm) {
      const cover = terrain[tile] === 1 ? 2.5 : 0
      const cands = u.cls === 'healer' ? allies.filter((a) => a !== u && a.hp < a.max) : foes
      for (const o of cands) {
        const d = manhattan(tile, o.t, cols)
        if (d < CLS[u.cls].rmin || d > CLS[u.cls].rmax) continue
        let sc: number
        if (u.cls === 'healer') sc = (o.max - o.hp) * 1.2 + cover
        else {
          const dm = u.atk * (o.cls === 'mage' ? 1 : terrain[o.t] === 1 ? 0.65 : 1)
          sc = dm + (dm >= o.hp ? 25 : 0) + (o.hp / o.max < 0.5 ? 4 : 0) + (o.cls === 'healer' || o.cls === 'mage' ? 3 : 0) + cover
          if (CLS[u.cls].rmax > 1) sc += d === CLS[u.cls].rmax ? 2 : 0
        }
        if (dumb) sc = rng.range(0, 10)
        if (!best || sc > best.sc) best = { tile, tgt: o, sc }
      }
    }
    if (best) {
      const tgt = best.tgt!
      moveUnit(u, best.tile, () => attack(u, tgt))
      checkEnd()
      return
    }
    // advance toward the closest foe (or wounded ally for healers)
    const goals = u.cls === 'healer' ? allies.filter((a) => a !== u) : foes
    let bt = u.t
    let bd = 1e9
    for (const [tile] of rm) {
      const d = Math.min(...goals.map((o) => manhattan(tile, o.t, cols)), 99) - (terrain[tile] === 1 ? 0.6 : 0) + (CLS[u.cls].rmax > 1 ? 0 : 0)
      const want = CLS[u.cls].rmax > 1 ? Math.abs(d - CLS[u.cls].rmax) : d
      if (want < bd) { bd = want; bt = tile }
    }
    if (bt !== u.t) moveUnit(u, bt)
  }

  const click = (x: number, y: number) => {
    intro = 0
    if (phase === 'victory') {
      if (battle < B) startBattle()
      return
    }
    if (phase !== 'player' || busy()) return
    const bw = 96
    const by = H - 46
    if (x > W - bw - 8 && y > by) return endTurn()
    if (x > W - bw * 2 - 16 && x < W - bw - 12 && y > by) { if (sel && !sel.acted) { sel.acted = true; afterAction(sel) } return }
    const i = Math.floor((x - ox) / cell) + Math.floor((y - oy) / cell) * cols
    if (x < ox || x >= ox + cols * cell || y < oy || y >= oy + rows * cell) return
    const o = unitAt(i)
    if (sel && !sel.acted) {
      if (o && targets.includes(o)) { const s = sel; attack(s, o); c.later(() => afterAction(s), 350); return }
      if (!o && reachMap.has(i) && i !== sel.t) {
        const s = sel
        reachMap = new Map(); targets = []
        moveUnit(s, i, () => afterAction(s))
        return
      }
      if (o === sel) { sel.acted = true; afterAction(sel); return }
    }
    if (o) {
      info = o
      if (o.team === 0 && !o.acted) select(o)
      else if (o.team === 1 && !sel) select(null)
      env.sfx('click')
    } else select(null)
  }

  const key = (code: string) => {
    if (code === 'Space' || code === 'Enter') { if (phase === 'victory') click(0, 0); else endTurn() }
    else if (code === 'Escape') select(null)
  }

  const update = (dt: number) => {
    if (intro > 0) intro -= dt
    if (flashT > 0) flashT -= dt
    for (const f of floats) { f.life -= dt * 1.1; f.y -= 24 * dt }
    for (let i = floats.length - 1; i >= 0; i--) if (floats[i].life <= 0) floats.splice(i, 1)
    for (const u of units) {
      if (u.flash > 0) u.flash -= dt
      if (u.lunge > 0) u.lunge -= dt
      if (u.path.length) {
        const tp = u.path[0]
        const dx = tx(tp) - u.x
        const dy = ty(tp) - u.y
        const d = Math.hypot(dx, dy)
        const m = 260 * dt
        if (d <= m) { u.x = tx(tp); u.y = ty(tp); u.path.shift(); if (!u.path.length) { const f = u.then; u.then = undefined; f?.() } } else { u.x += (dx / d) * m; u.y += (dy / d) * m }
      } else if (u.hp > 0 && u.lunge <= 0) { u.x += (tx(u.t) - u.x) * Math.min(1, dt * 20); u.y += (ty(u.t) - u.y) * Math.min(1, dt * 20) }
    }
    units = units.filter((u) => u.hp > 0 || u.flash > 0 || u.lunge > 0)
    if (phase === 'enemy' && !busy()) {
      timer -= dt
      if (timer <= 0) {
        const u = enemyQ.shift()
        if (!u) {
          phase = 'player'
          turn++
          for (const q of units) { q.acted = false; q.moved = false }
          msg(`Turn ${turn}`)
        } else if (u.hp > 0) {
          aiAct(u)
          timer = 0.45
        }
      }
    }
    const p = units.filter((u) => u.team === 0 && u.hp > 0).length
    const e = units.filter((u) => u.team === 1 && u.hp > 0).length
    env.score(score())
    env.status(`Battle ${battle}/${B} · Turn ${turn} · ${p} vs ${e}`)
  }

  const drawUnit = (u: U) => {
    const jitter = u.flash > 0 ? Math.sin(u.flash * 90) * 3 : 0
    const lg = u.lunge > 0 ? Math.sin((u.lunge / 0.28) * Math.PI) : 0
    const x = u.x + jitter + (u.lx || 0) * lg * (u.lunge > 0 ? 1 : 0)
    const y = u.y + (u.ly || 0) * lg * (u.lunge > 0 ? 1 : 0)
    const col = u.team === 0 ? th.accent : th.danger
    ctx.globalAlpha = u.hp <= 0 ? Math.max(0, u.flash * 4) : u.team === 0 && u.acted && phase === 'player' ? 0.5 : 1
    ctx.fillStyle = 'rgba(0,0,0,.35)'
    ctx.beginPath(); ctx.ellipse(x, y + cell * 0.34, cell * 0.3, cell * 0.1, 0, 0, 7); ctx.fill()
    ctx.fillStyle = col
    ctx.globalAlpha *= 0.35
    ctx.beginPath(); ctx.arc(x, y, cell * 0.42, 0, 7); ctx.fill()
    ctx.globalAlpha = u.hp <= 0 ? Math.max(0, u.flash * 4) : u.team === 0 && u.acted && phase === 'player' ? 0.5 : 1
    ctx.strokeStyle = col; ctx.lineWidth = u === sel ? 4 : 2
    ctx.beginPath(); ctx.arc(x, y, cell * 0.42, 0, 7); ctx.stroke()
    emoji(ctx, u.e, x, y - 1, cell * 0.56)
    T(CLS[u.cls].icon, x + cell * 0.3, y + cell * 0.22, cell * 0.28, '#fff')
    c.hp(x - cell * 0.35, y - cell * 0.5, cell * 0.7, u.hp / u.max, 4)
    ctx.globalAlpha = 1
  }

  const draw = () => {
    background(ctx, W, H, th, 30, env.seed)
    ctx.save()
    shake.apply(ctx)
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      const i = r * cols + q
      const x = ox + q * cell
      const y = oy + r * cell
      const t = terrain[i]
      ctx.fillStyle = (q + r) % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.1)'
      ctx.fillRect(x, y, cell, cell)
      if (t === 1) { ctx.fillStyle = 'rgba(34,197,94,.22)'; ctx.fillRect(x, y, cell, cell); emoji(ctx, '🌲', x + cell / 2, y + cell / 2 + 2, cell * 0.62) }
      else if (t === 2) { ctx.fillStyle = 'rgba(56,189,248,.35)'; ctx.fillRect(x, y, cell, cell); ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.moveTo(x + 6, y + cell / 2); ctx.quadraticCurveTo(x + cell / 2, y + cell / 2 - 7, x + cell - 6, y + cell / 2); ctx.stroke() }
      else if (t === 3) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x, y, cell, cell); emoji(ctx, '⛰️', x + cell / 2, y + cell / 2, cell * 0.7) }
      if (reachMap.has(i) && i !== sel?.t) { ctx.fillStyle = 'rgba(96,165,250,.38)'; ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2) }
      ctx.strokeStyle = 'rgba(255,255,255,.06)'
      ctx.strokeRect(x, y, cell, cell)
    }
    for (const u of targets) {
      const x = ox + (u.t % cols) * cell
      const y = oy + Math.floor(u.t / cols) * cell
      const heal = sel?.cls === 'healer' && u.team === sel.team
      ctx.fillStyle = heal ? 'rgba(74,222,128,.4)' : 'rgba(248,113,113,.45)'
      ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2)
      ctx.strokeStyle = heal ? '#4ade80' : '#f87171'; ctx.lineWidth = 3; ctx.strokeRect(x + 2, y + 2, cell - 4, cell - 4)
    }
    for (const u of [...units].sort((a, b) => a.y - b.y)) drawUnit(u)
    fx.draw(ctx)
    for (const f of floats) { ctx.globalAlpha = clamp(f.life, 0, 1); T(f.s, f.x, f.y, 14, f.color); ctx.globalAlpha = 1 }
    ctx.restore()
    // bars
    ctx.fillStyle = 'rgba(0,0,0,.5)'
    ctx.fillRect(0, 0, W, TOP)
    T(phase === 'enemy' ? 'Enemy turn…' : phase === 'victory' ? 'Victory!' : `Your turn · ${turn}`, 10, 17, 14, phase === 'enemy' ? th.danger : th.accent, 'left')
    T(`Battle ${battle}/${B}`, W - 10, 17, 13, th.fg, 'right')
    const py = H - (portrait ? 100 : 56)
    ctx.fillStyle = 'rgba(0,0,0,.5)'
    ctx.fillRect(0, py + (portrait ? 0 : 0), W, H - py)
    const iu = info && info.hp > 0 ? info : null
    if (iu) {
      emoji(ctx, iu.e, 28, py + 26, 30)
      const d = CLS[iu.cls]
      T(`${d.label} ${iu.team ? '(enemy)' : ''}`, 54, py + 14, 13, iu.team ? th.danger : th.accent, 'left')
      T(`HP ${iu.hp}/${iu.max}  ATK ${iu.atk}  Move ${d.move}  Rng ${d.rmin === d.rmax ? d.rmax : `${d.rmin}-${d.rmax}`}`, 54, py + 32, 11, th.fg, 'left')
      T(iu.cls === 'healer' ? 'Heals allies' : iu.cls === 'mage' ? 'Splash, ignores cover' : iu.cls === 'archer' ? 'Cannot hit adjacent' : terrain[iu.t] === 1 ? 'In cover (-35% dmg)' : 'Forest gives cover', 54, py + 48, 10, '#a1a1aa', 'left')
    } else T('Tap a unit to select it', 12, py + 24, 12, '#a1a1aa', 'left')
    const bw = 96
    const by = H - 46
    c.btn(W - bw - 8, by, bw, 38, 'End turn', { color: th.good, dis: phase !== 'player' })
    c.btn(W - bw * 2 - 16, by, bw, 38, 'Wait', { dis: phase !== 'player' || !sel })
    if (flashT > 0) { ctx.globalAlpha = clamp(flashT, 0, 1); text(ctx, flashMsg, W / 2, oy + 30, { size: 16, color: '#fff', shadow: th.accent }); ctx.globalAlpha = 1 }
    if (phase === 'victory') {
      roundRect(ctx, W / 2 - 150, H / 2 - 70, 300, 130, 14, 'rgba(0,0,0,.82)', th.good)
      T(battle >= B ? 'Campaign won!' : 'Victory!', W / 2, H / 2 - 32, 20, th.good)
      T(battle >= B ? 'All foes defeated' : 'Tap to start the next battle', W / 2, H / 2 + 4, 13, th.fg)
      T(`Kills ${kills}`, W / 2, H / 2 + 32, 12, '#a1a1aa')
    }
    if (intro > 0 && phase === 'player') {
      ctx.globalAlpha = clamp(intro, 0, 1)
      roundRect(ctx, W / 2 - 160, oy + 60, 320, 96, 14, 'rgba(0,0,0,.78)', th.accent)
      text(ctx, env.name.slice(0, 26), W / 2, oy + 86, { size: portrait ? 10 : 13, color: th.accent })
      T('Tap a unit, a blue tile to move,', W / 2, oy + 112, 12, th.fg)
      T('then a red target to attack. Forests give cover.', W / 2, oy + 132, 12, '#a1a1aa')
      ctx.globalAlpha = 1
    }
  }
  startBattle()
  return { update, draw, click, key, status: () => '' }
}

// ======================================================= AUTO BATTLER
interface AU { id: number; team: 0 | 1; cls: Cls; star: number; e: string; hp: number; max: number; atk: number; t: number; cd: number; step: number; x: number; y: number; flash: number; boss?: boolean }

function auto(c: Ctx): Mode {
  const { env, ctx, W, H, portrait, fx, shake, T } = c
  const th = env.theme
  const rng = env.rng
  const cols = portrait ? 6 : 12
  const rows = portrait ? 8 : 6
  const cell = portrait ? 58 : 52
  const ox = (W - cols * cell) / 2
  const oy = TOP + 4
  const total = byDiff(env, 8, 10, 10)
  let lives = byDiff(env, 4, 3, 3)
  let gold = 10
  let round = 1
  let units: AU[] = []
  let nid = 1
  let phase: 'prep' | 'fight' | 'result' | 'over' = 'prep'
  let offers: Cls[] = []
  let selOffer = -1
  let selUnit: AU | null = null
  let fightT = 0
  let resText = ''
  let won = 0
  let flashMsg = ''
  let flashT = 0
  const beams: { x1: number; y1: number; x2: number; y2: number; life: number; color: string }[] = []
  const floats: { x: number; y: number; s: string; life: number; color: string }[] = []
  const heroes = heroSet(env)
  const clsE = (cl: Cls, team: 0 | 1) => (team === 0 ? heroes[CLS_LIST.indexOf(cl) % heroes.length] : th.foes[CLS_LIST.indexOf(cl) % th.foes.length])
  const inZone = (i: number) => (portrait ? Math.floor(i / cols) >= rows / 2 : i % cols < cols / 2)
  const px = (i: number) => ox + (i % cols) * cell + cell / 2
  const py = (i: number) => oy + Math.floor(i / cols) * cell + cell / 2
  const starMul = (s: number) => (s === 1 ? 1 : s === 2 ? 1.9 : 3.6)
  const mk = (team: 0 | 1, cl: Cls, star: number, t: number, boss = false): AU => {
    const d = CLS[cl]
    const m = starMul(star) * (boss ? 2.2 : 1)
    return { id: nid++, team, cls: cl, star, e: clsE(cl, team), hp: Math.round(d.hp * m), max: Math.round(d.hp * m), atk: d.atk * m * (boss ? 0.8 : 1), t, cd: 0, step: 0, x: px(t), y: py(t), flash: 0, boss }
  }
  const cap = () => Math.min(9, 2 + round)
  const mine = () => units.filter((u) => u.team === 0)
  const msg = (s: string) => { flashMsg = s; flashT = 1.6 }

  const roll = () => {
    offers = Array.from({ length: 5 }, () => rng.pick(['warrior', 'warrior', 'archer', 'archer', 'knight', 'mage', 'healer', 'rogue'] as Cls[]))
    selOffer = -1
  }
  const genEnemy = () => {
    units = units.filter((u) => u.team === 0)
    const budget = (6 + round * 2.8) * byDiff(env, 0.8, 1, 1.15)
    let spent = 0
    const tiles: number[] = []
    for (let i = 0; i < cols * rows; i++) if (!inZone(i)) tiles.push(i)
    rng.shuffle(tiles)
    let k = 0
    while (spent < budget && k < 10) {
      const cl = rng.pick(['warrior', 'warrior', 'archer', 'knight', 'mage', 'rogue', 'healer'] as Cls[])
      const star = round >= 8 && rng.chance(0.25) ? 3 : round >= 4 && rng.chance(0.25) ? 2 : 1
      units.push(mk(1, cl, star, tiles[k++]))
      spent += CLS[cl].cost * (star === 1 ? 1 : star === 2 ? 2 : 3.5)
    }
    if (round === total) units.push(mk(1, 'knight', 1, tiles[k++], true))
  }
  const synergy = (team: 0 | 1) => {
    const m: Record<string, number> = {}
    for (const u of units) if (u.team === team && u.hp > 0) m[u.cls] = (m[u.cls] ?? 0) + 1
    return m
  }
  const synMult = (u: AU) => { const n = synergy(u.team)[u.cls] ?? 0; return n >= 3 ? 1.35 : n >= 2 ? 1.2 : 1 }
  const merge = (cl: Cls, star: number, preferTile: number) => {
    const same = mine().filter((u) => u.cls === cl && u.star === star)
    if (same.length < 3 || star >= 3) return
    same.sort((a, b) => (a.t === preferTile ? -1 : b.t === preferTile ? 1 : 0))
    const keep = same[0]
    const rm = new Set([same[1].id, same[2].id])
    units = units.filter((u) => !rm.has(u.id))
    const n = mk(0, cl, star + 1, keep.t)
    units[units.indexOf(keep)] = n
    fx.burst(px(n.t), py(n.t), '#fde68a', 24, 180, 4)
    env.sfx('power')
    msg(`${CLS[cl].label} ★${star + 1}!`)
    merge(cl, star + 1, keep.t)
  }
  const place = (cl: Cls, t: number) => {
    units.push(mk(0, cl, 1, t))
    merge(cl, 1, t)
  }
  const unitAt = (i: number) => units.find((u) => u.hp > 0 && u.t === i)

  const startPrep = () => {
    phase = 'prep'
    units = units.filter((u) => u.team === 0).map((u) => mk(0, u.cls, u.star, u.t))
    genEnemy()
    roll()
    selUnit = null
  }
  const score = () => won * 100 + gold + lives * 50
  let ended = false
  const finish = (w: boolean) => {
    if (ended) return
    ended = true
    phase = 'over'
    const sc = score() + (w ? 400 : 0)
    env.score(sc)
    env.sfx(w ? 'win' : 'lose')
    c.later(() => env.end({ score: sc, won: w, text: w ? `Survived all ${total} rounds` : `Eliminated in round ${round}` }), 900)
  }

  const startFight = () => {
    if (phase !== 'prep') return
    if (!mine().length) return msg('Place a unit first!')
    phase = 'fight'
    fightT = 0
    selOffer = -1
    selUnit = null
    env.sfx('power')
  }
  const endFight = (win: boolean) => {
    phase = 'result'
    if (win) won++
    else lives--
    const inc = 5 + round + (win ? 2 : 0) + Math.min(3, Math.floor(gold / 5))
    gold += inc
    resText = win ? `Round won! +${inc} gold` : `Round lost! -1 life (+${inc} gold)`
    env.sfx(win ? 'win' : 'lose')
    if (lives <= 0) finish(false)
    else if (win && round >= total) finish(true)
  }
  const nextRound = () => {
    round++
    startPrep()
  }

  // layout
  const shopY = oy + rows * cell + 6
  const cardRect = (i: number) => (portrait ? { x: 6 + i * 69, y: shopY, w: 65, h: 66 } : { x: 6 + i * 104, y: shopY, w: 98, h: 80 })
  const rollRect = portrait ? { x: 6, y: shopY + 74, w: 100, h: 44 } : { x: 534, y: shopY, w: 120, h: 38 }
  const fightRect = portrait ? { x: 200, y: shopY + 74, w: 154, h: 44 } : { x: 664, y: shopY, w: 130, h: 38 }
  const sellRect = portrait ? { x: 112, y: shopY + 74, w: 82, h: 44 } : { x: 534, y: shopY + 44, w: 120, h: 38 }

  const click = (x: number, y: number) => {
    if (phase === 'over') return
    if (phase === 'result') { if (lives > 0 && !(won >= total && round >= total)) nextRound(); return }
    if (phase !== 'prep') return
    if (c.inR(fightRect, x, y)) return startFight()
    if (c.inR(rollRect, x, y)) { if (gold >= 1) { gold--; roll(); env.sfx('click') } else msg('Need 1 gold'); return }
    if (selUnit && c.inR(sellRect, x, y)) {
      gold += Math.max(1, Math.floor(CLS[selUnit.cls].cost * (selUnit.star === 1 ? 1 : selUnit.star === 2 ? 2.5 : 5) - 1))
      units = units.filter((u) => u !== selUnit)
      selUnit = null
      env.sfx('click')
      return
    }
    for (let i = 0; i < 5; i++) if (c.inR(cardRect(i), x, y)) { selOffer = selOffer === i ? -1 : i; selUnit = null; env.sfx('click'); return }
    if (x < ox || x >= ox + cols * cell || y < oy || y >= oy + rows * cell) { selUnit = null; selOffer = -1; return }
    const i = Math.floor((x - ox) / cell) + Math.floor((y - oy) / cell) * cols
    const o = unitAt(i)
    if (!inZone(i)) { if (o) selUnit = o; return }
    if (selOffer >= 0) {
      if (o) { msg('Tile occupied'); return }
      const cl = offers[selOffer]
      if (mine().length >= cap() && mine().filter((u) => u.cls === cl && u.star === 1).length < 2) return msg(`Team full (${cap()})`)
      if (gold < CLS[cl].cost) return msg('Not enough gold')
      gold -= CLS[cl].cost
      place(cl, i)
      offers[selOffer] = 'none' as Cls
      selOffer = -1
      env.sfx('move')
      return
    }
    if (selUnit && selUnit.team === 0) {
      if (!o) { selUnit.t = i; selUnit.x = px(i); selUnit.y = py(i); selUnit = null; env.sfx('click'); return }
      if (o !== selUnit) { const a = selUnit.t; selUnit.t = o.t; o.t = a; selUnit.x = px(selUnit.t); selUnit.y = py(selUnit.t); o.x = px(o.t); o.y = py(o.t); selUnit = null; return }
    }
    selUnit = o && o.team === 0 ? o : null
    if (o) env.sfx('click')
  }

  // ---- combat ----
  const fightStep = (dt: number) => {
    fightT += dt
    const alive = units.filter((u) => u.hp > 0)
    const A = alive.filter((u) => u.team === 0)
    const E = alive.filter((u) => u.team === 1)
    if (!A.length || !E.length || fightT > 50) {
      let win = A.length > 0 && !E.length
      if (A.length && E.length) win = A.reduce((s, u) => s + u.hp, 0) >= E.reduce((s, u) => s + u.hp, 0)
      return endFight(win)
    }
    const occ = new Set(alive.map((u) => u.t))
    for (const u of alive) {
      u.cd -= dt
      u.step -= dt
      if (u.flash > 0) u.flash -= dt
      const foes = u.team === 0 ? E : A
      const friends = u.team === 0 ? A : E
      const d = CLS[u.cls]
      let tgt: AU | null = null
      if (u.cls === 'healer') {
        let bf = 1
        for (const f of friends) if (f.hp / f.max < bf && manhattan(f.t, u.t, cols) <= d.rmax) { bf = f.hp / f.max; tgt = f }
      }
      const heal = !!tgt
      if (!tgt) {
        let bd = 1e9
        for (const f of foes) if (f.hp > 0) { const m = manhattan(f.t, u.t, cols); if (m < bd) { bd = m; tgt = f } }
      }
      if (!tgt) continue
      const dist = manhattan(tgt.t, u.t, cols)
      if (dist <= d.rmax) {
        if (u.cd <= 0) {
          u.cd = d.cd * rng.range(0.95, 1.1)
          if (heal) {
            const h = Math.round(8 * starMul(u.star))
            tgt.hp = Math.min(tgt.max, tgt.hp + h)
            beams.push({ x1: u.x, y1: u.y, x2: tgt.x, y2: tgt.y, life: 0.2, color: '#86efac' })
            floats.push({ x: tgt.x, y: tgt.y - 14, s: `+${h}`, life: 1, color: '#86efac' })
          } else {
            const dmg = Math.max(1, Math.round(u.atk * synMult(u) * rng.range(0.9, 1.1)))
            const hurt = (v: AU, m: number) => {
              const dd = Math.max(1, Math.round(dmg * m))
              v.hp -= dd; v.flash = 0.15
              floats.push({ x: v.x, y: v.y - 14, s: `-${dd}`, life: 0.8, color: '#fff' })
              if (v.hp <= 0) { occ.delete(v.t); fx.burst(v.x, v.y, v.team ? th.danger : th.accent, 14, 150, 3); env.sfx('boom'); if (v.boss) shake.kick(8) }
            }
            hurt(tgt, 1)
            if (u.cls === 'mage') for (const o of foes) if (o !== tgt && o.hp > 0 && manhattan(o.t, tgt.t, cols) === 1) hurt(o, 0.5)
            if (d.rmax > 1) beams.push({ x1: u.x, y1: u.y, x2: tgt.x, y2: tgt.y, life: 0.12, color: u.team ? th.danger : th.accent })
            else { u.x += (tgt.x - u.x) * 0.3; u.y += (tgt.y - u.y) * 0.3 }
            env.sfx(d.rmax > 1 ? 'shoot' : 'hit')
          }
        }
      } else if (u.step <= 0) {
        u.step = u.cls === 'rogue' ? 0.3 : u.cls === 'knight' ? 0.55 : 0.4
        const cx = u.t % cols
        const cy = Math.floor(u.t / cols)
        const tx = tgt.t % cols
        const ty = Math.floor(tgt.t / cols)
        const opts: number[] = []
        const dx = Math.sign(tx - cx)
        const dy = Math.sign(ty - cy)
        const hFirst = Math.abs(tx - cx) >= Math.abs(ty - cy)
        const cand = hFirst ? [[dx, 0], [0, dy], [0, dy ? -dy : 1], [dx ? 0 : 0, 0]] : [[0, dy], [dx, 0], [dx ? -dx : 1, 0]]
        for (const [mx, my] of cand) {
          if (!mx && !my) continue
          const nx = cx + mx
          const ny = cy + my
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
          opts.push(ny * cols + nx)
        }
        const to = opts.find((i) => !occ.has(i))
        if (to !== undefined) { occ.delete(u.t); occ.add(to); u.t = to }
      }
    }
    for (const u of units) {
      if (u.hp > 0) { u.x += (px(u.t) - u.x) * Math.min(1, dt * 12); u.y += (py(u.t) - u.y) * Math.min(1, dt * 12) }
    }
    units = units.filter((u) => u.hp > 0 || u.flash > 0)
    for (const u of units) if (u.hp <= 0) u.flash -= dt
  }

  const update = (dt: number) => {
    if (flashT > 0) flashT -= dt
    for (const f of floats) { f.life -= dt * 1.2; f.y -= 20 * dt }
    for (let i = floats.length - 1; i >= 0; i--) if (floats[i].life <= 0) floats.splice(i, 1)
    for (const b of beams) b.life -= dt
    for (let i = beams.length - 1; i >= 0; i--) if (beams[i].life <= 0) beams.splice(i, 1)
    if (phase === 'fight') fightStep(dt)
    else for (const u of units) { u.x += (px(u.t) - u.x) * Math.min(1, dt * 14); u.y += (py(u.t) - u.y) * Math.min(1, dt * 14) }
    env.score(score())
    env.status(`Round ${round}/${total} · ❤️ ${lives} · 🪙 ${gold}`)
  }

  const drawU = (u: AU) => {
    const s = u.boss ? 1.35 : 1
    const col = u.team === 0 ? th.accent : th.danger
    const a = u.hp <= 0 ? clamp(u.flash * 6 + 0.5, 0, 1) * 0.5 : 1
    ctx.globalAlpha = a
    ctx.fillStyle = col
    ctx.globalAlpha = a * 0.35
    ctx.beginPath(); ctx.arc(u.x, u.y, cell * 0.42 * s, 0, 7); ctx.fill()
    ctx.globalAlpha = a
    ctx.strokeStyle = u === selUnit ? '#fff' : col
    ctx.lineWidth = u === selUnit ? 4 : 2
    ctx.stroke()
    emoji(ctx, u.e, u.x, u.y - 1, cell * 0.55 * s * (u.star === 1 ? 1 : u.star === 2 ? 1.12 : 1.25))
    T(CLS[u.cls].icon, u.x + cell * 0.3, u.y + cell * 0.25, cell * 0.26, '#fff')
    if (u.star > 1) T('★'.repeat(u.star), u.x, u.y - cell * 0.5, 11, '#fde68a')
    c.hp(u.x - cell * 0.34, u.y + cell * 0.42, cell * 0.68, u.hp / u.max, 4)
    ctx.globalAlpha = 1
  }

  const draw = () => {
    background(ctx, W, H, th, 30, env.seed)
    ctx.save()
    shake.apply(ctx)
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      const i = r * cols + q
      const x = ox + q * cell
      const y = oy + r * cell
      ctx.fillStyle = inZone(i) ? ((q + r) % 2 ? 'rgba(96,165,250,.16)' : 'rgba(96,165,250,.08)') : ((q + r) % 2 ? 'rgba(248,113,113,.16)' : 'rgba(248,113,113,.08)')
      ctx.fillRect(x, y, cell, cell)
      ctx.strokeStyle = 'rgba(255,255,255,.07)'
      ctx.strokeRect(x, y, cell, cell)
      if (phase === 'prep' && inZone(i) && (selOffer >= 0 || selUnit) && !unitAt(i)) { ctx.fillStyle = 'rgba(134,239,172,.2)'; ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4) }
    }
    for (const u of [...units].sort((a, b) => a.y - b.y)) drawU(u)
    for (const b of beams) { ctx.strokeStyle = b.color; ctx.globalAlpha = clamp(b.life * 6, 0, 1); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke(); ctx.globalAlpha = 1 }
    fx.draw(ctx)
    for (const f of floats) { ctx.globalAlpha = clamp(f.life, 0, 1); T(f.s, f.x, f.y, 13, f.color); ctx.globalAlpha = 1 }
    ctx.restore()
    ctx.fillStyle = 'rgba(0,0,0,.5)'
    ctx.fillRect(0, 0, W, TOP)
    T(`Round ${round}/${total}`, 10, 17, 13, th.accent, 'left')
    T(`❤️ ${lives}   🪙 ${gold}`, W - 10, 17, 14, '#fde68a', 'right')
    // synergy
    const sy = synergy(0)
    T(Object.entries(sy).filter(([, n]) => n >= 2).map(([k, n]) => `${CLS[k as Cls].icon}x${n}`).join(' ') || (portrait ? '' : 'Match 2+ of a class for a bonus'), W / 2, 17, 12, th.good)
    ctx.fillStyle = 'rgba(0,0,0,.5)'
    ctx.fillRect(0, shopY - 3, W, H - shopY + 3)
    if (phase === 'prep') {
      for (let i = 0; i < 5; i++) {
        const r = cardRect(i)
        const cl = offers[i]
        if (!CLS[cl]) { roundRect(ctx, r.x, r.y, r.w, r.h, 8, 'rgba(255,255,255,.04)'); continue }
        const d = CLS[cl]
        roundRect(ctx, r.x, r.y, r.w, r.h, 8, selOffer === i ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.1)', selOffer === i ? th.accent : undefined)
        emoji(ctx, clsE(cl, 0), r.x + r.w / 2, r.y + r.h * 0.3, portrait ? 26 : 34)
        T(`${d.icon} ${d.label}`, r.x + r.w / 2, r.y + r.h * 0.62, portrait ? 9 : 11, th.fg)
        T(`🪙${d.cost}`, r.x + r.w / 2, r.y + r.h * 0.84, 11, gold >= d.cost ? '#fde68a' : '#f87171')
      }
      c.btn(rollRect.x, rollRect.y, rollRect.w, rollRect.h, 'Reroll 🪙1', { dis: gold < 1 })
      c.btn(sellRect.x, sellRect.y, sellRect.w, sellRect.h, selUnit ? 'Sell' : '—', { dis: !selUnit })
      c.btn(fightRect.x, fightRect.y, fightRect.w, fightRect.h, 'FIGHT!', { color: th.good })
      if (!portrait) T(`Team ${mine().length}/${cap()} · pick a card, tap your half`, 534, shopY + 100, 11, '#a1a1aa', 'left')
      else T(`Team ${mine().length}/${cap()}  ·  pick a card, then a tile`, 8, shopY + 130, 10, '#a1a1aa', 'left')
    } else if (phase === 'fight') T('Fighting…', W / 2, shopY + 40, 16, th.accent)
    if (phase === 'result') {
      roundRect(ctx, W / 2 - 150, H / 2 - 70, 300, 120, 14, 'rgba(0,0,0,.85)', th.accent)
      T(resText, W / 2, H / 2 - 30, 14, th.fg)
      T(lives > 0 && !(round >= total) ? 'Tap to continue' : '', W / 2, H / 2 + 10, 12, '#a1a1aa')
    }
    if (flashT > 0) { ctx.globalAlpha = clamp(flashT, 0, 1); text(ctx, flashMsg, W / 2, oy + 28, { size: 14, color: '#fff', shadow: th.accent }); ctx.globalAlpha = 1 }
  }
  startPrep()
  return { update, draw, click, key: (code) => { if (code === 'Space' || code === 'Enter') { if (phase === 'prep') startFight(); else if (phase === 'result') click(0, 0) } } }
}

// ======================================================= CREATURE BATTLE
type Ev = { d: number; fn: () => void }

function creature(c: Ctx): Mode {
  const { env, ctx, W, H, portrait, fx, shake, T } = c
  const th = env.theme
  const rng = env.rng
  const trainers = byDiff(env, 3, 4, 5)
  const pool = [...th.heroes, ...th.foes].filter((e, i, a) => a.indexOf(e) === i)
  const used = new Set<string>()
  const pickE = (first?: string) => {
    if (first) { used.add(first); return first }
    const free = pool.filter((e) => !used.has(e))
    const e = free.length ? rng.pick(free) : rng.pick(pool)
    used.add(e)
    return e
  }
  let team: Creature[] = [genCreature(rng, pickE(th.hero), 5), genCreature(rng, pickE(), 5), genCreature(rng, pickE(), 5)]
  let foes: Creature[] = []
  let trainer = 0
  let pi = 0
  let ei = 0
  let queue: Ev[] = []
  let wait = 0
  let log = ''
  let phase: 'choose' | 'busy' | 'forced' | 'next' | 'over' = 'busy'
  let overlay: 'none' | 'team' | 'types' = 'none'
  let defeated = 0
  const ppLeft = new WeakMap<Creature, number[]>()
  const disp = new WeakMap<Creature, number>()
  const pp = (cr: Creature) => { let a = ppLeft.get(cr); if (!a) { a = cr.moves.map((m) => m.pp); ppLeft.set(cr, a) } return a }
  const shown = (cr: Creature) => disp.get(cr) ?? cr.hp
  let animP = 0
  let animE = 0
  let shakeP = 0
  let shakeE = 0
  const floats: { x: number; y: number; s: string; life: number; color: string }[] = []

  const sceneH = portrait ? 320 : 300
  const ePos = { x: W * (portrait ? 0.68 : 0.7), y: TOP + (portrait ? 100 : 100) }
  const pPos = { x: W * (portrait ? 0.3 : 0.27), y: TOP + (portrait ? 215 : 200) }
  const moveRect = (i: number) => (portrait ? { x: 8 + (i % 2) * 174, y: sceneH + 70 + Math.floor(i / 2) * 62, w: 170, h: 58 } : { x: 404 + (i % 2) * 196, y: sceneH + 12 + Math.floor(i / 2) * 82, w: 190, h: 76 })
  const teamRect = portrait ? { x: 8, y: sceneH + 200, w: 170, h: 48 } : { x: 12, y: sceneH + 118, w: 120, h: 50 }
  const typesRect = portrait ? { x: 182, y: sceneH + 200, w: 170, h: 48 } : { x: 140, y: sceneH + 118, w: 120, h: 50 }

  const me = () => team[pi]
  const foe = () => foes[ei]
  const say = (s: string) => { log = s }
  const after = (d: number, fn: () => void) => queue.push({ d, fn })
  const startTrainer = () => {
    const lvl = 5 + trainer * 1.5 + byDiff(env, -1, 0, 1)
    const n = Math.min(3, 2 + (trainer >= 2 ? 1 : 0))
    foes = Array.from({ length: n }, (_, i) => genCreature(rng, pickE(), Math.round(lvl) + (trainer === trainers - 1 && i === n - 1 ? 2 : 0)))
    ei = 0
    phase = 'busy'
    const nm = trainer === trainers - 1 ? 'Champion' : `Trainer ${trainer + 1}`
    say(`${nm} wants to battle!`)
    after(1.0, () => say(`${nm} sends out ${foe().name}!`))
    after(1.0, () => { phase = 'choose'; say(`What will ${me().name} do?`) })
  }
  const levelUp = (cr: Creature) => {
    cr.lvl++; cr.maxHp += 7; cr.atk += 2; cr.def += 1.6; cr.spd += 1; cr.hp = cr.maxHp
    ppLeft.delete(cr)
  }
  const effText = (m: number) => (m > 1 ? "It's super effective!" : m < 1 ? "It's not very effective…" : '')
  const doMove = (a: Creature, d: Creature, mi: number, isPlayer: boolean) => {
    if (a.hp <= 0) return
    const p = pp(a)
    if (p[mi] <= 0) mi = 0
    const mv = a.moves[mi]
    p[mi]--
    say(`${a.name} used ${mv.name}!`)
    if (isPlayer) animP = 0.3; else animE = 0.3
    if (mv.heal) {
      const h = Math.floor(a.maxHp * mv.heal)
      a.hp = Math.min(a.maxHp, a.hp + h)
      floats.push({ x: isPlayer ? pPos.x : ePos.x, y: (isPlayer ? pPos.y : ePos.y) - 50, s: `+${h}`, life: 1.2, color: '#86efac' })
      env.sfx('power')
      return
    }
    if (rng() * 100 > mv.acc) { after(0, () => say(`${a.name}'s attack missed!`)); return }
    const mult = mv.type === 'normal' ? 1 : typeMult(mv.type, d.type)
    const dmg = moveDamage(a, d, mv, rng())
    d.hp = Math.max(0, d.hp - dmg)
    if (isPlayer) shakeE = 0.3; else shakeP = 0.3
    fx.burst(isPlayer ? ePos.x : pPos.x, isPlayer ? ePos.y : pPos.y, mv.type === 'normal' ? '#fff' : '#facc15', 14, 160, 3)
    floats.push({ x: isPlayer ? ePos.x : pPos.x, y: (isPlayer ? ePos.y : pPos.y) - 50, s: `-${dmg}`, life: 1.2, color: mult > 1 ? '#fca5a5' : '#fff' })
    env.sfx(mult > 1 ? 'boom' : 'hit')
    if (mult !== 1) after(0.0, () => say(effText(mult)))
  }
  const faintCheck = () => {
    if (foe().hp <= 0) {
      after(0.9, () => { say(`${foe().name} fainted!`); defeated++; env.sfx('point') })
      const nextI = foes.findIndex((f) => f.hp > 0)
      if (nextI >= 0) { after(1.1, () => { ei = nextI; say(`Foe sends out ${foe().name}!`) }); after(0.9, () => { phase = 'choose'; say(`What will ${me().name} do?`) }) }
      else after(1.0, () => trainerWon())
      return true
    }
    if (me().hp <= 0) {
      after(0.9, () => { say(`${me().name} fainted!`); env.sfx('lose') })
      if (team.some((t) => t.hp > 0)) after(0.9, () => { phase = 'forced'; overlay = 'team'; say('Choose your next creature') })
      else after(1.0, () => finish(false))
      return true
    }
    return false
  }
  const trainerWon = () => {
    trainer++
    if (trainer >= trainers) { finish(true); return }
    for (const t of team) levelUp(t)
    say(`Victory! Your team healed and grew to Lv ${team[0].lvl}.`)
    phase = 'next'
  }
  let ended = false
  const score = () => defeated * 100 + trainer * 300 + team.filter((t) => t.hp > 0).length * 50
  const finish = (won: boolean) => {
    if (ended) return
    ended = true
    phase = 'over'
    const sc = score() + (won ? 500 : 0)
    env.score(sc)
    env.sfx(won ? 'win' : 'lose')
    env.end({ score: sc, won, text: won ? `Beat all ${trainers} trainers` : `Defeated by trainer ${trainer + 1}` })
  }
  const enemyPick = () => {
    const f = foe()
    const p = pp(f)
    const ok = f.moves.map((m, i) => ({ m, i })).filter((x) => p[x.i] > 0)
    if (f.hp < f.maxHp * 0.3 && ok.some((x) => x.m.heal) && rng.chance(0.55)) return ok.find((x) => x.m.heal)!.i
    if (rng.chance(byDiff(env, 0.4, 0.2, 0.05))) return rng.pick(ok.filter((x) => !x.m.heal)).i
    let best = ok[0].i
    let bs = -1
    for (const x of ok) {
      if (x.m.heal) continue
      const mult = x.m.type === 'normal' ? 1 : typeMult(x.m.type, me().type)
      const s = x.m.power * mult * (x.m.type === f.type ? 1.2 : 1) * (x.m.acc / 100)
      if (s > bs) { bs = s; best = x.i }
    }
    return best
  }
  const playerMove = (mi: number) => {
    if (phase !== 'choose') return
    if (pp(me())[mi] <= 0) { say('No PP left!'); return }
    phase = 'busy'
    const ei2 = enemyPick()
    const meFirst = me().spd >= foe().spd
    const seq: (() => void)[] = []
    const A = me()
    const B = foe()
    const run = (first: boolean) => () => {
      if (first) { if (A.hp > 0 && B.hp > 0) doMove(A, B, mi, true) } else if (A.hp > 0 && B.hp > 0) doMove(B, A, ei2, false)
    }
    seq.push(run(meFirst), run(!meFirst))
    after(0, seq[0])
    after(1.1, () => { if (!faintCheck()) { seq[1](); after(1.1, () => { if (!faintCheck()) { phase = 'choose'; say(`What will ${me().name} do?`) } }) } })
  }
  const switchTo = (i: number, forced: boolean) => {
    if (team[i].hp <= 0 || (i === pi && !forced)) return
    overlay = 'none'
    pi = i
    env.sfx('move')
    say(`Go, ${me().name}!`)
    if (forced) { phase = 'choose'; return }
    phase = 'busy'
    after(0.9, () => {
      const f = foe()
      doMove(f, me(), enemyPick(), false)
      after(1.0, () => { if (!faintCheck()) { phase = 'choose'; say(`What will ${me().name} do?`) } })
    })
  }

  const click = (x: number, y: number) => {
    if (phase === 'over') return
    if (phase === 'next') { startTrainer(); return }
    if (overlay === 'types') { overlay = 'none'; return }
    if (overlay === 'team') {
      for (let i = 0; i < 3; i++) {
        const r = { x: W / 2 - 150, y: H / 2 - 110 + i * 70, w: 300, h: 62 }
        if (c.inR(r, x, y)) { switchTo(i, phase === 'forced'); return }
      }
      if (phase !== 'forced') overlay = 'none'
      return
    }
    if (phase !== 'choose') return
    for (let i = 0; i < 4; i++) if (c.inR(moveRect(i), x, y)) { playerMove(i); return }
    if (c.inR(teamRect, x, y)) { overlay = 'team'; return }
    if (c.inR(typesRect, x, y)) overlay = 'types'
  }
  const key = (code: string) => {
    if (code >= 'Digit1' && code <= 'Digit4') playerMove(Number(code.slice(5)) - 1)
  }

  const update = (dt: number) => {
    if (animP > 0) animP -= dt
    if (animE > 0) animE -= dt
    if (shakeP > 0) shakeP -= dt
    if (shakeE > 0) shakeE -= dt
    for (const f of floats) { f.life -= dt; f.y -= 18 * dt }
    for (let i = floats.length - 1; i >= 0; i--) if (floats[i].life <= 0) floats.splice(i, 1)
    for (const cr of [...team, ...foes]) {
      const v = shown(cr)
      disp.set(cr, v + (cr.hp - v) * Math.min(1, dt * 6))
    }
    if (queue.length) {
      wait -= dt
      if (wait <= 0) { const e = queue.shift()!; e.fn(); wait = e.d }
    }
    env.score(score())
    env.status(`Trainer ${trainer + 1}/${trainers} · ${team.filter((t) => t.hp > 0).length} left`)
  }

  const plate = (cr: Creature, x: number, y: number, w: number, you: boolean) => {
    roundRect(ctx, x, y, w, 46, 10, 'rgba(0,0,0,.6)', you ? th.accent : th.danger)
    T(`${cr.name}`, x + 8, y + 13, 12, th.fg, 'left')
    T(`${TYPE_ICON[cr.type]} Lv${cr.lvl}`, x + w - 8, y + 13, 11, '#fde68a', 'right')
    c.hp(x + 8, y + 26, w - 16, shown(cr) / cr.maxHp, 8)
    if (you) T(`${Math.ceil(shown(cr))}/${cr.maxHp}`, x + w - 8, y + 41, 9, '#a1a1aa', 'right')
  }

  const draw = () => {
    background(ctx, W, H, th, 30, env.seed)
    ctx.save()
    shake.apply(ctx)
    // ground
    ctx.fillStyle = 'rgba(0,0,0,.25)'
    ctx.beginPath(); ctx.ellipse(ePos.x, ePos.y + 44, 70, 16, 0, 0, 7); ctx.fill()
    ctx.beginPath(); ctx.ellipse(pPos.x, pPos.y + 50, 90, 20, 0, 0, 7); ctx.fill()
    if (foes.length && foe()) {
      const f = foe()
      const off = shakeE > 0 ? Math.sin(shakeE * 70) * 6 : 0
      const lunge = animE > 0 ? -Math.sin((animE / 0.3) * Math.PI) * 30 : 0
      ctx.globalAlpha = f.hp <= 0 ? 0.25 : 1
      emoji(ctx, f.emoji, ePos.x + off + lunge, ePos.y + Math.sin(performance.now() / 400) * 3, portrait ? 80 : 92)
      ctx.globalAlpha = 1
      plate(f, portrait ? 8 : 24, TOP + 12, portrait ? 190 : 250, false)
    }
    const m = me()
    if (m) {
      const off = shakeP > 0 ? Math.sin(shakeP * 70) * 6 : 0
      const lunge = animP > 0 ? Math.sin((animP / 0.3) * Math.PI) * 30 : 0
      ctx.globalAlpha = m.hp <= 0 ? 0.25 : 1
      emoji(ctx, m.emoji, pPos.x + off + lunge, pPos.y + Math.sin(performance.now() / 450) * 3, portrait ? 110 : 120)
      ctx.globalAlpha = 1
      plate(m, W - (portrait ? 198 : 274), sceneH - 56, portrait ? 190 : 250, true)
    }
    fx.draw(ctx)
    for (const f of floats) { ctx.globalAlpha = clamp(f.life, 0, 1); T(f.s, f.x, f.y, 18, f.color); ctx.globalAlpha = 1 }
    ctx.restore()
    ctx.fillStyle = 'rgba(0,0,0,.5)'
    ctx.fillRect(0, 0, W, TOP)
    T(`Trainer ${trainer + 1}/${trainers}`, 10, 17, 13, th.accent, 'left')
    T(team.map((t) => (t.hp > 0 ? '●' : '○')).join(' '), W - 10, 17, 14, th.good, 'right')
    // panel
    ctx.fillStyle = 'rgba(0,0,0,.55)'
    ctx.fillRect(0, sceneH, W, H - sceneH)
    const lw = portrait ? W - 16 : 380
    roundRect(ctx, 8, sceneH + 8, lw, portrait ? 54 : 100, 10, 'rgba(255,255,255,.08)')
    const words = log.split(' ')
    let line = ''
    let ly = sceneH + (portrait ? 24 : 28)
    const maxChars = portrait ? 38 : 42
    for (const w of words) {
      if ((line + ' ' + w).length > maxChars) { T(line, 18, ly, 12, th.fg, 'left'); ly += 18; line = w } else line = line ? `${line} ${w}` : w
    }
    T(line, 18, ly, 12, th.fg, 'left')
    const foeT = foes.length ? foe().type : null
    for (let i = 0; i < 4; i++) {
      const r = moveRect(i)
      const mv = me().moves[i]
      const left = pp(me())[i]
      let col = 'rgba(255,255,255,.12)'
      let eff = ''
      if (foeT && mv.type !== 'normal') { const mu = typeMult(mv.type, foeT); if (mu > 1) { col = 'rgba(74,222,128,.28)'; eff = '▲' } else if (mu < 1) { col = 'rgba(248,113,113,.25)'; eff = '▼' } }
      roundRect(ctx, r.x, r.y, r.w, r.h, 10, phase === 'choose' && left > 0 ? col : 'rgba(255,255,255,.05)')
      T(`${i + 1} ${mv.name} ${eff}`, r.x + 10, r.y + r.h * 0.32, 12, th.fg, 'left')
      T(`${mv.type === 'normal' ? '✚' : TYPE_ICON[mv.type]} ${mv.power ? `Pow ${mv.power}` : 'Heal 40%'}`, r.x + 10, r.y + r.h * 0.62, 10, '#a1a1aa', 'left')
      T(`PP ${left}/${mv.pp}`, r.x + r.w - 10, r.y + r.h * 0.62, 10, left ? '#a1a1aa' : '#f87171', 'right')
    }
    c.btn(teamRect.x, teamRect.y, teamRect.w, teamRect.h, 'Team', { dis: phase !== 'choose' })
    c.btn(typesRect.x, typesRect.y, typesRect.w, typesRect.h, 'Type chart', { dis: false })
    if (phase === 'next') { roundRect(ctx, W / 2 - 150, TOP + 120, 300, 80, 14, 'rgba(0,0,0,.85)', th.good); T('Tap for the next trainer', W / 2, TOP + 160, 14, th.fg) }
    if (overlay === 'team') {
      ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillRect(0, 0, W, H)
      T(phase === 'forced' ? 'Choose next creature' : 'Switch creature', W / 2, H / 2 - 135, 14, th.accent)
      team.forEach((cr, i) => {
        const r = { x: W / 2 - 150, y: H / 2 - 110 + i * 70, w: 300, h: 62 }
        roundRect(ctx, r.x, r.y, r.w, r.h, 10, i === pi ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.1)', cr.hp <= 0 ? '#555' : th.accent)
        ctx.globalAlpha = cr.hp > 0 ? 1 : 0.35
        emoji(ctx, cr.emoji, r.x + 30, r.y + 31, 36)
        T(`${cr.name} Lv${cr.lvl} ${TYPE_ICON[cr.type]}`, r.x + 60, r.y + 20, 12, th.fg, 'left')
        c.hp(r.x + 60, r.y + 36, 220, cr.hp / cr.maxHp, 8)
        ctx.globalAlpha = 1
      })
    }
    if (overlay === 'types') {
      ctx.fillStyle = 'rgba(0,0,0,.85)'; ctx.fillRect(0, 0, W, H)
      T('Type chart (tap to close)', W / 2, TOP + 20, 14, th.accent)
      const S: Record<CType, string> = { fire: 'plant', water: 'fire, earth', plant: 'water, earth', electric: 'water, air', earth: 'fire, electric', air: 'plant' }
      TYPES.forEach((t, i) => {
        const strong = TYPES.filter((o) => typeMult(t, o) > 1).map((o) => TYPE_ICON[o]).join('')
        T(`${TYPE_ICON[t]} ${t}`, W / 2 - 140, TOP + 70 + i * 40, 13, th.fg, 'left')
        T(`strong vs ${strong}`, W / 2 + 10, TOP + 70 + i * 40, 12, th.good, 'left')
        void S
      })
      T('▲ in a move button = super effective', W / 2, TOP + 330, 11, '#a1a1aa')
    }
  }
  startTrainer()
  return { update, draw, click, key }
}

// =======================================================
const engine: Engine = {
  start(env) {
    const hb = env.host.getBoundingClientRect()
    const portrait = hb.height > hb.width * 1.05
    const W = portrait ? 360 : 800
    const H = portrait ? 640 : 480
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const ptr = pointer(st)
    const k = keys()
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const fx = new Particles()
    const shake = new Shake()
    const th = env.theme
    const T: Ctx['T'] = (s, x, y, size = 12, color = th.fg, align = 'center') => text(ctx, s, x, y, { size, color, align, font: SANS, weight: 700 })
    const c: Ctx = {
      env, st, ctx, W, H, portrait, fx, shake, T,
      btn(x, y, w, h, label, o = {}) {
        roundRect(ctx, x, y, w, h, 9, o.dis ? 'rgba(255,255,255,.06)' : o.on ? th.accent : o.color ?? 'rgba(255,255,255,.16)')
        T(label, x + w / 2, y + h / 2, 12, o.dis ? '#777' : o.color ? '#0b0b0b' : th.fg)
      },
      hp(x, y, w, frac, h = 5) {
        ctx.fillStyle = 'rgba(0,0,0,.6)'
        ctx.fillRect(x - 1, y - 1, w + 2, h + 2)
        const f = clamp(frac, 0, 1)
        ctx.fillStyle = f > 0.5 ? th.good : f > 0.25 ? '#facc15' : th.danger
        ctx.fillRect(x, y, w * f, h)
      },
      inR: (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h,
      later(fn, ms) { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id) },
    }
    const info = `${env.name} ${env.desc}`
    const isCreature = /creature|monster|critter|cryptid|\bpets?\b|\bpals\b|kaiju|slime|wisps?|spirit|hatchery|fossil|coral kin|glitch|beast/i.test(info)
    const isAuto = !isCreature && (env.mods.has('auto') || /\bauto\b|autom|draft|lineup|bench|brawl|arena|roster|synergy|\bshop\b|league|melee/i.test(info))
    const mode: Mode = isCreature ? creature(c) : isAuto ? auto(c) : classic(c)
    ptr.onDown((p) => { if (p.button !== 2) mode.click(p.x, p.y) })
    k.onKey((e) => mode.key(e.code))
    const lp = loop((dt) => { fx.update(dt); shake.update(dt); mode.update(dt) }, () => mode.draw())
    return {
      destroy() { lp.stop(); for (const t of timers) clearTimeout(t); ptr.dispose(); k.dispose(); st.dispose() },
      pause(p) { lp.pause(p) },
    }
  },
}
export default engine
