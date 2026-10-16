// Conquest: Galcon-style real-time strategy. Planets/castles produce troops; send fleets to capture everything. `hex` = hex-tile territory.
// 4X / empire games (logic pickConquest) run as turn-based: plan, End turn, a short resolution, with research / recruit / truce decrees and a turn limit.
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, roundRect, Shake, text, type Engine } from '../kit'
import { genHex, genPlanets, pickConquest, type MapNode } from '../logic/conquest'

const SANS = 'system-ui, sans-serif'
const GLYPHS: Record<string, string[]> = {
  space: ['🪐', '🌍', '🌕', '🌑', '🌎', '☄️'],
  cyberpunk: ['🏙️', '🏢', '📡', '🏭'],
  robot: ['🏭', '🛰️', '⚙️', '🏢'],
  ocean: ['🏝️', '🪸', '🐚', '⚓'],
  pirate: ['🏝️', '⚓', '🏴‍☠️', '🛖'],
  dino: ['🌋', '🌴', '🪨', '🥚'],
  jungle: ['🌴', '🛖', '🌳', '🪺'],
  nature: ['🌳', '🛖', '🪺', '🌲'],
  insects: ['🕳️', '🪺', '🌿', '🍄'],
  arctic: ['🏔️', '⛺', '🧊', '🛖'],
  wasteland: ['🏚️', '🏭', '⛽', '🛖'],
  western: ['🏜️', '🛖', '🌵', '🏚️'],
  ninja: ['🏯', '⛩️', '🛖', '🏮'],
  horror: ['🏚️', '⚰️', '🕯️', '🏰'],
  halloween: ['🏚️', '🎃', '🕯️', '🏰'],
  candy: ['🍭', '🍩', '🧁', '🍰'],
  fantasy: ['🏰', '🏯', '🛖', '⛺'],
  myth: ['🏛️', '🏰', '⛺', '🛖'],
}
const DEFAULT_GLYPH = ['🏰', '🏯', '🛖', '⛺', '🏛️']

interface Fleet { from: number; to: number; owner: number; n: number; x: number; y: number; tx: number; ty: number; speed: number }
interface Ai { owner: number; t: number; style: number }

const engine: Engine = {
  start(env) {
    const { theme: th, rng, mods } = env
    const hb = env.host.getBoundingClientRect()
    const portrait = hb.height > hb.width * 1.05
    const { hex, turn } = pickConquest(`${env.name} ${env.desc}`, mods)
    const tiny = mods.has('tiny')
    const W = portrait ? 360 : 800
    const H = portrait ? 640 : 480
    const TOP = 34
    const BOT = turn ? 76 : 40
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const k = keys()
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const nAi = clamp(byDiff(env, 1, 1, 2) + (mods.has('war') || mods.has('versus') ? 1 : 0), 1, 3)
    const nOwners = nAi + 1
    const aiMul = byDiff(env, 0.9, 1, 1.15)
    const glyphs = GLYPHS[th.id] ?? DEFAULT_GLYPH
    const ownerColor = [th.accent, th.danger, '#a78bfa', '#facc15']
    const foeEmoji = [th.hero, th.foes[0], th.foes[1 % th.foes.length], th.foes[2 % th.foes.length]]

    let nodes: MapNode[]
    let adj: number[][] = []
    let hexR = 0
    if (hex) {
      const R = tiny ? (portrait ? 40 : 42) : portrait ? 32 : 34
      const cols = portrait ? (tiny ? 4 : 6) : tiny ? 9 : 12
      const rows = portrait ? (tiny ? 6 : 9) : tiny ? 5 : 6
      const hh = Math.sqrt(3) * R
      const gw = (cols - 1) * 1.5 * R + 2 * R
      const gh = rows * hh + hh / 2
      const spec = genHex(rng, cols, rows, R, (W - gw) / 2 + R, TOP + (H - TOP - BOT - gh) / 2 + hh / 2, nOwners)
      nodes = spec.nodes; adj = spec.adj; hexR = R
    } else {
      const spec = genPlanets(rng, W, H - TOP - BOT, nOwners, (portrait ? 9 : 12) + nAi * 2 + (tiny ? -3 : 0))
      nodes = spec.nodes
      for (const n of nodes) n.y += TOP
    }
    const fleets: Fleet[] = []
    const sel = new Set<number>()
    let pct = 0.5
    let over = false
    let time = 0
    let intro = 5
    let hoverN = -1
    let flashMsg = ''
    let flashT = 0
    let captured = 0
    // turn mode
    let phase: 'plan' | 'run' = 'plan'
    let runLeft = 0
    let turnNo = 1
    const maxTurns = Number(/(\d+)-turn/.exec(env.name + ' ' + env.desc)?.[1]) || byDiff(env, 40, 30, 25)
    let science = 0
    let researchLv = 0
    let truce = 0
    const RUN = 3.5
    const researchCost = () => 6 + 4 * researchLv
    const ais: Ai[] = []
    for (let o = 1; o < nOwners; o++) ais.push({ owner: o, t: 1 + o * 0.7, style: (o + rng.int(0, 2)) % 3 })
    const msg = (s: string) => { flashMsg = s; flashT = 1.4 }
    const glyphOf = (n: MapNode) => glyphs[n.glyph % glyphs.length]
    const speed = hex ? 170 : 75

    const nodeAt = (x: number, y: number) => {
      let best = -1
      let bd = 1e9
      for (const n of nodes) {
        if (n.blocked) continue
        const d = Math.hypot(n.x - x, n.y - y)
        const lim = hex ? hexR * 0.95 : n.r + 14
        if (d < lim && d < bd) { bd = d; best = n.id }
      }
      return best
    }
    const canSend = (a: number, b: number) => a !== b && (!hex || adj[a].includes(b)) && !nodes[b].blocked
    const send = (a: number, b: number, frac: number, owner: number) => {
      const A = nodes[a]
      const B = nodes[b]
      const n = Math.floor(A.troops * frac)
      if (n < 1 || A.owner !== owner || !canSend(a, b)) return false
      A.troops -= n
      fleets.push({ from: a, to: b, owner, n, x: A.x, y: A.y, tx: B.x, ty: B.y, speed })
      return true
    }

    const hud = () => {
      const mine = nodes.filter((n) => n.owner === 0)
      const tot = nodes.filter((n) => !n.blocked).length
      env.score(score())
      env.status(`${turn ? `Turn ${Math.min(turnNo, maxTurns)}/${maxTurns} · ` : ''}${mine.length}/${tot} ${hex ? 'tiles' : 'bases'} · ${Math.floor(mine.reduce((s, n) => s + n.troops, 0))} troops${turn ? ` · 🔬${science}` : ''}`)
    }
    const score = () => captured * 40 + nodes.filter((n) => n.owner === 0).length * 25
    const finish = (won: boolean) => {
      if (over) return
      over = true
      const sc = score() + (won ? (turn ? Math.max(0, maxTurns - turnNo) * 20 : Math.max(0, 900 - Math.floor(time)) * 2) + 500 : 0)
      env.score(sc)
      env.sfx(won ? 'win' : 'lose')
      env.end({ score: sc, won, text: turn ? (won ? `Ruled the map after ${Math.min(turnNo, maxTurns)} turns` : turnNo > maxTurns ? `A rival out-ruled you after ${maxTurns} turns` : 'Your empire fell') : won ? `Conquered everything in ${Math.floor(time)}s` : 'Your empire fell' })
    }

    // ---- player input ----
    const btnRects = () => {
      const y = H - BOT + 5
      const o = [0.25, 0.5, 0.75, 1].map((p, i) => ({ x: 6 + i * 50, y, w: 46, h: 30, p }))
      const y2 = y + 34
      const dw = (W - 12 - 8) / 3
      return {
        pcts: o,
        all: { x: 6 + 4 * 50 + 4, y, w: portrait ? 70 : 96, h: 30 },
        end: { x: W - (portrait ? 92 : 130), y, w: portrait ? 86 : 124, h: 30 },
        decrees: [0, 1, 2].map((i) => ({ x: 6 + i * (dw + 4), y: y2, w: dw, h: 30 })),
      }
    }
    const inR = (r: { x: number; y: number; w: number; h: number }, x: number, y: number) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h
    let drag: { x0: number; y0: number; x1: number; y1: number; on: boolean } | null = null
    let shift = false
    const selectAll = () => { sel.clear(); nodes.forEach((n) => n.owner === 0 && sel.add(n.id)); env.sfx('click') }
    const clickAt = (x: number, y: number) => {
      if (over) return
      intro = 0
      if (y >= H - BOT) {
        const b = btnRects()
        for (const r of b.pcts) if (inR(r, x, y)) { pct = r.p; env.sfx('click'); return }
        if (inR(b.all, x, y)) selectAll()
        else if (turn && inR(b.end, x, y)) endTurn()
        else if (turn) b.decrees.forEach((r, i) => { if (inR(r, x, y)) decree(i) })
        return
      }
      const id = nodeAt(x, y)
      if (id < 0) { if (!shift) sel.clear(); return }
      const n = nodes[id]
      if (n.owner === 0 && (sel.size === 0 || shift)) {
        if (sel.has(id)) sel.delete(id); else sel.add(id)
        env.sfx('click')
        return
      }
      if (sel.size === 0) {
        if (hex) {
          // focus attack: every adjacent owned tile sends
          let any = false
          for (const a of adj[id]) if (nodes[a].owner === 0 && nodes[a].troops >= 2) any = send(a, id, Math.max(0.6, pct), 0) || any
          if (any) env.sfx('shoot'); else msg('Select one of your tiles first')
        }
        return
      }
      if (sel.size === 1 && sel.has(id)) { sel.clear(); return }
      let sent = false
      for (const a of sel) if (nodes[a].owner === 0 && a !== id) sent = send(a, id, pct, 0) || sent
      if (sent) { env.sfx('shoot'); if (!shift) sel.clear() } else msg(hex ? 'Only adjacent tiles' : 'Not enough troops')
    }
    bag.on(st.canvas, 'pointerdown', (e) => {
      st.canvas.focus({ preventScroll: true })
      const p = st.toLocal(e)
      shift = e.shiftKey
      drag = { x0: p.x, y0: p.y, x1: p.x, y1: p.y, on: false }
      try { st.canvas.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    })
    bag.on(st.canvas, 'pointermove', (e) => {
      const p = st.toLocal(e)
      hoverN = nodeAt(p.x, p.y)
      if (drag) {
        drag.x1 = p.x; drag.y1 = p.y
        if (Math.hypot(drag.x1 - drag.x0, drag.y1 - drag.y0) > 14 && nodeAt(drag.x0, drag.y0) < 0) drag.on = true
      }
    })
    bag.on(st.canvas, 'pointerup', (e) => {
      const p = st.toLocal(e)
      if (!drag) return
      if (drag.on) {
        const x0 = Math.min(drag.x0, p.x), x1 = Math.max(drag.x0, p.x), y0 = Math.min(drag.y0, p.y), y1 = Math.max(drag.y0, p.y)
        if (!e.shiftKey) sel.clear()
        for (const n of nodes) if (n.owner === 0 && n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1) sel.add(n.id)
        env.sfx('click')
      } else clickAt(p.x, p.y)
      drag = null
    })
    bag.on(st.canvas, 'contextmenu', (e) => e.preventDefault())
    k.onKey((e) => {
      if (e.code === 'Digit1') pct = 0.25
      else if (e.code === 'Digit2') pct = 0.5
      else if (e.code === 'Digit3') pct = 0.75
      else if (e.code === 'Digit4') pct = 1
      else if (e.code === 'KeyQ') selectAll()
      else if (e.code === 'Escape') sel.clear()
      else if (turn && (e.code === 'Space' || e.code === 'Enter')) endTurn()
    })

    // ---- AI ----
    const threat = (id: number, owner: number) => {
      let t = 0
      for (const f of fleets) if (f.to === id && f.owner !== owner) t += f.n
      return t
    }
    const committed = (id: number, owner: number) => {
      let t = 0
      for (const f of fleets) if (f.to === id && f.owner === owner) t += f.n
      return t
    }
    const think = (ai: Ai) => {
      const o = ai.owner
      const mine = nodes.filter((n) => n.owner === o)
      if (!mine.length) return
      mine.sort((a, b) => b.troops - a.troops)
      let acts = 0
      for (const s of mine) {
        if (acts >= 2) break
        const avail = s.troops - threat(s.id, o) * 1.1 - 3
        if (avail < 6) continue
        let best: MapNode | null = null
        let bs = 0
        let need = 0
        for (const t of nodes) {
          if (t.owner === o || !canSend(s.id, t.id)) continue
          if (truce > 0 && t.owner === 0) continue
          const d = Math.hypot(t.x - s.x, t.y - s.y)
          const eta = d / speed
          const arrive = t.troops + (t.owner >= 0 ? t.prod * eta * aiMul : 0)
          const nd = arrive - committed(t.id, o) * 0.9 + 2
          if (nd <= 0) continue
          if (nd * byDiff(env, 1.5, 1.2, 1.08) > avail) continue
          const worth = (hex ? (t.city ? 3 : 1.2) : t.r / 10 + 0.5) * (t.owner === 0 ? (ai.style === 0 ? 1.6 : 1.2) : t.owner >= 0 ? 0.9 : ai.style === 1 ? 1.5 : 1.1)
          const sc = worth / (nd + 8) / (d + 80)
          if (sc > bs) { bs = sc; best = t; need = nd }
        }
        if (best) {
          const frac = clamp((need * byDiff(env, 1.4, 1.2, 1.1) + 1) / s.troops, 0.1, 0.95)
          if (send(s.id, best.id, frac, o)) acts++
        } else if (s.troops > s.cap * 0.7) {
          // reinforce the owned node closest to an enemy
          let tgt: MapNode | null = null
          let td = 1e9
          for (const a of mine) {
            if (a === s || !canSend(s.id, a.id)) continue
            const dEnemy = Math.min(...nodes.filter((n) => n.owner !== o && !n.blocked).map((n) => Math.hypot(n.x - a.x, n.y - a.y)))
            if (dEnemy < td) { td = dEnemy; tgt = a }
          }
          if (tgt && send(s.id, tgt.id, 0.5, o)) acts++
        }
      }
    }

    // ---- turn mode ----
    const decree = (i: number) => {
      if (over || phase !== 'plan') return
      if (i === 0) {
        const c = researchCost()
        if (science < c) return msg(`Need ${c} 🔬`)
        science -= c
        researchLv++
        env.sfx('power')
        msg(`Research ${researchLv}: +12% production`)
      } else if (i === 1) {
        const id = [...sel].find((a) => nodes[a].owner === 0)
        if (science < 4) return msg('Need 4 🔬')
        if (id === undefined) return msg('Select one of your bases to recruit at')
        science -= 4
        nodes[id].troops += 10
        env.sfx('click')
        fx.burst(nodes[id].x, nodes[id].y, th.good, 12, 120)
      } else {
        if (truce > 0) return msg('A truce is already in force')
        if (science < 10) return msg('Need 10 🔬')
        science -= 10
        truce = 3
        env.sfx('power')
        msg('Truce: rivals will not attack you for 3 turns')
      }
    }
    const endTurn = () => {
      if (!turn || over || phase !== 'plan') return
      intro = 0
      phase = 'run'
      runLeft = RUN
      sel.clear()
      for (const ai of ais) { think(ai); think(ai) }
      env.sfx('move')
    }
    const closeTurn = () => {
      phase = 'plan'
      const mine = nodes.filter((n) => n.owner === 0).length
      science += Math.max(1, Math.round(mine * (mods.has('science') ? 1.5 : 1)))
      turnNo++
      if (truce > 0) truce--
      if (turnNo > maxTurns) {
        const cnt = (o: number) => nodes.filter((n) => n.owner === o).length
        finish(ais.every((a) => cnt(a.owner) < cnt(0)))
      }
    }

    // ---- simulation ----
    const arrive = (f: Fleet) => {
      const n = nodes[f.to]
      if (n.owner === f.owner) n.troops += f.n
      else {
        n.troops -= f.n
        fx.burst(n.x, n.y, ownerColor[f.owner] ?? '#fff', 8, 90)
        if (n.troops < 0) {
          const prev = n.owner
          n.owner = f.owner
          n.troops = -n.troops
          fx.burst(n.x, n.y, ownerColor[f.owner] ?? '#fff', 26, 200, 4)
          if (f.owner === 0) { captured++; env.sfx('power'); sel.delete(n.id) } else if (prev === 0) { shake.kick(5); env.sfx('hit'); sel.delete(n.id) }
        } else if (f.owner === 0) env.sfx('hit')
      }
    }
    const update = (dt: number) => {
      fx.update(dt)
      shake.update(dt)
      if (flashT > 0) flashT -= dt
      if (intro > 0) intro -= dt
      if (over) return
      if (turn) {
        if (phase === 'plan') return
        runLeft -= dt
        if (runLeft <= 0) closeTurn()
      }
      time += dt
      for (const n of nodes) {
        if (n.owner < 0 || n.blocked) continue
        const m = (n.owner > 0 ? aiMul : 1 + 0.12 * researchLv) * (turn ? 1.8 : 1)
        if (n.troops < n.cap) n.troops = Math.min(n.cap, n.troops + n.prod * m * dt)
        else n.troops -= (n.troops - n.cap) * 0.08 * dt
      }
      for (let i = fleets.length - 1; i >= 0; i--) {
        const f = fleets[i]
        const dx = f.tx - f.x
        const dy = f.ty - f.y
        const d = Math.hypot(dx, dy)
        const m = f.speed * dt
        if (d <= m) { arrive(f); fleets.splice(i, 1) } else { f.x += (dx / d) * m; f.y += (dy / d) * m }
      }
      if (!turn) for (const ai of ais) {
        ai.t -= dt
        if (ai.t <= 0) { ai.t = byDiff(env, 2.6, 1.7, 1.1) * rng.range(0.8, 1.2); think(ai) }
      }
      hud()
      const alive = (o: number) => nodes.some((n) => n.owner === o) || fleets.some((f) => f.owner === o)
      if (!alive(0)) finish(false)
      else if (ais.every((a) => !alive(a.owner)) ) finish(true)
    }

    // ---- drawing ----
    const T = (s: string, x: number, y: number, size: number, color = '#fff', align: CanvasTextAlign = 'center') => text(ctx, s, x, y, { size, color, align, font: SANS, weight: 800 })
    const hexPath = (x: number, y: number, R: number) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i
        const px = x + Math.cos(a) * R
        const py = y + Math.sin(a) * R
        if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py)
      }
      ctx.closePath()
    }
    const draw = () => {
      background(ctx, W, H, th, 40, env.seed)
      ctx.save()
      shake.apply(ctx)
      if (hex) {
        for (const n of nodes) {
          if (n.blocked) { hexPath(n.x, n.y, hexR - 2); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill(); emoji(ctx, '⛰️', n.x, n.y, hexR * 0.8); continue }
          hexPath(n.x, n.y, hexR - 2)
          const c = n.owner >= 0 ? ownerColor[n.owner] : '#94a3b8'
          ctx.globalAlpha = n.owner >= 0 ? 0.42 : 0.16
          ctx.fillStyle = c; ctx.fill()
          ctx.globalAlpha = 1
          ctx.strokeStyle = sel.has(n.id) ? '#fff' : c
          ctx.lineWidth = sel.has(n.id) ? 4 : 2
          ctx.stroke()
          if (n.city) emoji(ctx, glyphOf(n), n.x, n.y - hexR * 0.3, hexR * 0.6)
          if (n.owner === 0 && n.city && n.cap >= 90 && n.prod >= 0.7 && nodes.filter((q) => q.owner === 0).length && n === nodes.find((q) => q.owner === 0)) emoji(ctx, th.hero, n.x - hexR * 0.45, n.y + hexR * 0.45, hexR * 0.5)
          T(String(Math.floor(n.troops)), n.x, n.y + (n.city ? hexR * 0.32 : 0), hexR * 0.45, '#fff')
        }
      } else {
        for (const n of nodes) {
          const c = n.owner >= 0 ? ownerColor[n.owner] : '#94a3b8'
          const g = ctx.createRadialGradient(n.x - n.r * 0.3, n.y - n.r * 0.3, 2, n.x, n.y, n.r * 1.1)
          g.addColorStop(0, 'rgba(255,255,255,.35)')
          g.addColorStop(1, 'rgba(0,0,0,.35)')
          ctx.globalAlpha = n.owner >= 0 ? 0.9 : 0.5
          ctx.fillStyle = c
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 7); ctx.fill()
          ctx.fillStyle = g; ctx.fill()
          ctx.globalAlpha = 1
          ctx.lineWidth = 3
          ctx.strokeStyle = c
          if (n.owner >= 0) { ctx.shadowColor = c; ctx.shadowBlur = 12 }
          ctx.stroke()
          ctx.shadowBlur = 0
          emoji(ctx, glyphOf(n), n.x, n.y - 1, n.r * 1.15)
          if (n.owner === 0 && n === nodes.find((q) => q.owner === 0)) emoji(ctx, th.hero, n.x + n.r * 0.7, n.y - n.r * 0.7, 16)
          if (sel.has(n.id)) {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.lineDashOffset = -time * 20
            ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 7, 0, 7); ctx.stroke(); ctx.setLineDash([])
          }
          const cs = Math.floor(n.troops)
          ctx.fillStyle = 'rgba(0,0,0,.55)'
          roundRect(ctx, n.x - 16, n.y + n.r + 2, 32, 15, 6, 'rgba(0,0,0,.55)')
          T(String(cs), n.x, n.y + n.r + 10, 11, '#fff')
        }
      }
      // aim line
      if (sel.size && hoverN >= 0 && !over) {
        const h = nodes[hoverN]
        for (const a of sel) {
          const A = nodes[a]
          if (a === hoverN || !canSend(a, hoverN)) continue
          ctx.strokeStyle = h.owner === 0 ? th.good : th.danger
          ctx.globalAlpha = 0.7
          ctx.lineWidth = 2
          ctx.setLineDash([8, 6]); ctx.lineDashOffset = -time * 40
          ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(h.x, h.y); ctx.stroke()
          ctx.setLineDash([]); ctx.globalAlpha = 1
        }
      }
      // fleets
      for (const f of fleets) {
        const ang = Math.atan2(f.ty - f.y, f.tx - f.x)
        ctx.strokeStyle = ownerColor[f.owner]
        ctx.globalAlpha = 0.25
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x - Math.cos(ang) * 22, f.y - Math.sin(ang) * 22); ctx.stroke()
        ctx.globalAlpha = 1
        emoji(ctx, foeEmoji[f.owner], f.x, f.y, hex ? 16 : 18)
        T(String(f.n), f.x, f.y - 14, 10, ownerColor[f.owner])
      }
      fx.draw(ctx)
      if (drag?.on) {
        ctx.strokeStyle = th.accent; ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1.5
        ctx.fillRect(drag.x0, drag.y0, drag.x1 - drag.x0, drag.y1 - drag.y0)
        ctx.strokeRect(drag.x0, drag.y0, drag.x1 - drag.x0, drag.y1 - drag.y0)
      }
      ctx.restore()
      // top bar: faction shares
      ctx.fillStyle = 'rgba(0,0,0,.5)'
      ctx.fillRect(0, 0, W, TOP)
      const totalT = nodes.reduce((s, n) => s + (n.owner >= 0 ? n.troops : 0), 0) + fleets.reduce((s, f) => s + f.n, 0) || 1
      let x = 6
      const bw = W - 12
      for (let o = 0; o < nOwners; o++) {
        const t = nodes.filter((n) => n.owner === o).reduce((s, n) => s + n.troops, 0) + fleets.filter((f) => f.owner === o).reduce((s, f) => s + f.n, 0)
        const w = (t / totalT) * bw
        ctx.fillStyle = ownerColor[o]
        ctx.fillRect(x, TOP - 8, w, 4)
        x += w
      }
      ctx.globalAlpha = 1
      for (let o = 0; o < nOwners; o++) {
        const cnt = nodes.filter((n) => n.owner === o).length
        const px = 8 + o * (portrait ? 88 : 120)
        emoji(ctx, foeEmoji[o], px + 8, 15, 15)
        T(`${cnt}`, px + 22, 15, 13, ownerColor[o], 'left')
      }
      if (turn) T(`T${Math.min(turnNo, maxTurns)}/${maxTurns} 🔬${science}${truce ? ' 🤝' : ''}`, W - 8, 15, 12, '#fde68a', 'right')
      else T(`${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`, W - 8, 15, 12, '#a1a1aa', 'right')
      // bottom strip
      ctx.fillStyle = 'rgba(0,0,0,.5)'
      ctx.fillRect(0, H - BOT, W, BOT)
      const b = btnRects()
      for (const r of b.pcts) {
        roundRect(ctx, r.x, r.y, r.w, r.h, 8, pct === r.p ? th.accent : 'rgba(255,255,255,.14)')
        T(`${r.p * 100}%`, r.x + r.w / 2, r.y + r.h / 2, 12, pct === r.p ? '#111' : th.fg)
      }
      roundRect(ctx, b.all.x, b.all.y, b.all.w, b.all.h, 8, 'rgba(255,255,255,.14)')
      T(portrait ? 'All' : 'Select all', b.all.x + b.all.w / 2, b.all.y + b.all.h / 2, 12, th.fg)
      if (turn) {
        const pl = phase === 'plan'
        roundRect(ctx, b.end.x, b.end.y, b.end.w, b.end.h, 8, pl ? th.good : 'rgba(255,255,255,.14)')
        T(pl ? (portrait ? 'End turn ▶' : `End turn ${turnNo}/${maxTurns} ▶`) : 'Resolving…', b.end.x + b.end.w / 2, b.end.y + b.end.h / 2, 12, pl ? '#0b0b0b' : th.fg)
        const labels = [`🔬 Research ${researchCost()}`, '🪖 Recruit 4', truce ? `🤝 Truce (${truce})` : '🤝 Truce 10']
        const costs = [researchCost(), 4, truce ? 1e9 : 10]
        b.decrees.forEach((r, i) => {
          roundRect(ctx, r.x, r.y, r.w, r.h, 8, science >= costs[i] && pl ? 'rgba(250,204,21,.28)' : 'rgba(255,255,255,.08)')
          T(labels[i], r.x + r.w / 2, r.y + r.h / 2, portrait ? 10 : 12, science >= costs[i] && pl ? '#fde68a' : '#a1a1aa')
        })
      } else T(sel.size ? `${sel.size} selected` : portrait ? '' : (hex ? 'Tap a tile, then a neighbour' : 'Tap a base, then a target'), W - 8, H - BOT / 2, 11, '#a1a1aa', 'right')
      if (flashT > 0) { ctx.globalAlpha = clamp(flashT, 0, 1); T(flashMsg, W / 2, TOP + 24, 14, '#fff'); ctx.globalAlpha = 1 }
      if (intro > 0) {
        ctx.globalAlpha = clamp(intro, 0, 1)
        const bwid = portrait ? 330 : 480
        roundRect(ctx, W / 2 - bwid / 2, H / 2 - 62, bwid, 124, 14, 'rgba(0,0,0,.78)', th.accent)
        text(ctx, env.name.slice(0, portrait ? 22 : 40), W / 2, H / 2 - 32, { size: portrait ? 11 : 15, color: th.accent })
        T(turn ? 'Plan, then End turn (Space).' : hex ? 'Tap your tile, then a neighbour. Capture every tile.' : 'Tap your base, then a target: half the troops go.', W / 2, H / 2 - 2, portrait ? 11 : 13, th.fg)
        T(turn ? `Most bases after ${maxTurns} turns wins.` : 'Drag a box to select several. Capture everything!', W / 2, H / 2 + 22, portrait ? 11 : 13, '#a1a1aa')
        T(`${nAi} rival${nAi > 1 ? 's' : ''} on the map`, W / 2, H / 2 + 46, 12, th.danger)
        ctx.globalAlpha = 1
      }
    }

    const lp = loop(update, draw)
    return {
      destroy() { lp.stop(); k.dispose(); bag.dispose(); st.dispose() },
      pause(p) { lp.pause(p) },
    }
  },
}
export default engine
