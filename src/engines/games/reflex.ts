// Reflex & timing micro-games picked by keywords (see logic/reflex.ts):
// whack (moles), bar (stop the marker in the zone; circular dial with rotate/dial), aim (targets, scope sway for sniper),
// react (tap when green, with decoys), pulse (tap on the rhythm). Rounds speed up; combo and lives.
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, pointer, roundRect, Shake, text, type Engine } from '../kit'
import { detectReflex, judge, lifetime, reactionPoints, zoneWidth } from '../logic/reflex'

const TAU = Math.PI * 2

const engine: Engine = {
  start(env) {
    const { theme: t, rng, mods } = env
    const hr = env.host.getBoundingClientRect()
    const portrait = hr.height > hr.width * 1.1
    const W = portrait ? 360 : 640
    const H = portrait ? 600 : 360
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const k = keys()
    const ptr = pointer(st)
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const mode = detectReflex(env.name, env.desc)
    const fast = mods.has('fast') ? 1.25 : 1
    const circular = mods.has('rotate') || /dial|needle|spin|wheel/i.test(env.name)
    const sniper = /sniper|scope/i.test(`${env.name} ${env.desc}`)
    const multi = /multi|simultaneous/i.test(`${env.name} ${env.desc}`)
    const R = byDiff(env, 10, 12, 15)
    const goal = mode === 'whack' ? byDiff(env, 25, 35, 45) : mode === 'aim' ? byDiff(env, 20, 28, 36) : mode === 'pulse' ? R * 8 : R
    let lives = byDiff(env, 5, 4, 3) + (mods.has('zen') ? 2 : 0)
    let score = 0
    let time = 0
    let over = false
    let intro = 2.6
    let done = 0
    let combo = 0
    let best = 0
    let flash = 0
    let flashC = '#fff'
    let pops: { x: number; y: number; s: string; c: string; t: number }[] = []
    const round = () => (mode === 'pulse' ? Math.floor(done / 8) : mode === 'whack' || mode === 'aim' ? Math.floor(done / 4) : done)

    const status = () => env.status(`${mode === 'whack' || mode === 'aim' ? `Hits ${done}/${goal}` : `Round ${Math.min(done + 1, goal)}/${goal}`} · ${'❤️'.repeat(Math.max(0, lives))}`)
    const popup = (x: number, y: number, s: string, c: string) => pops.push({ x, y, s, c, t: 0.9 })
    const win = () => {
      if (over) return
      over = true
      env.sfx('win')
      score += lives * 100
      env.score(score)
      env.end({ score, won: true, text: `Best combo ${best}` })
    }
    const ok = (pts: number, x: number, y: number, label: string, col = t.good) => {
      combo++
      best = Math.max(best, combo)
      score += Math.round(pts * (1 + Math.min(combo, 20) * 0.1))
      env.score(score)
      popup(x, y, label, col)
      fx.burst(x, y, col, 12, 170, 3.5)
      env.sfx(label === 'PERFECT' ? 'power' : 'point')
      flash = 0.12
      flashC = col
    }
    const miss = (x: number, y: number, label: string, cost = true) => {
      combo = 0
      popup(x, y, label, t.danger)
      fx.burst(x, y, t.danger, 12, 170, 3.5)
      env.sfx('hit')
      shake.kick(5)
      flash = 0.2
      flashC = t.danger
      if (!cost) return
      lives--
      status()
      if (lives <= 0 && !over) {
        over = true
        env.sfx('lose')
        env.end({ score, won: false, text: `${done} of ${goal} complete` })
      }
    }
    const progress = (n = 1) => {
      done += n
      status()
      if (done >= goal) win()
    }

    interface M { update(dt: number): void; draw(): void; tap(x: number, y: number): void; how: string }

    // ---------------------------------------------------------- whack
    const whack = (): M => {
      const cols = 3
      const rows = 3
      const cw = Math.min(W / (cols + 0.4), (H - 90) / (rows + 0.2) * 1.15)
      const holes: { x: number; y: number }[] = []
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) holes.push({ x: W / 2 + (c - 1) * cw * 1.05, y: H / 2 + 20 + (r - 1) * cw * 0.95 })
      interface Mole { h: number; t: number; dur: number; kind: 'mole' | 'bomb' | 'gold'; hit: boolean; e: string }
      let moles: Mole[] = []
      let spawn = 0.8
      let swing = { x: 0, y: 0, t: 0 }
      const free = () => holes.map((_, i) => i).filter((i) => !moles.some((m) => m.h === i))
      const hit = (m: Mole) => {
        m.hit = true
        m.t = Math.max(m.t, m.dur - 0.25)
        const p = holes[m.h]
        if (m.kind === 'bomb') { miss(p.x, p.y - 20, 'BOMB!'); return }
        ok(m.kind === 'gold' ? 50 : 10, p.x, p.y - 30, m.kind === 'gold' ? 'GOLD' : combo >= 4 ? `${combo + 1} COMBO` : 'WHACK', m.kind === 'gold' ? '#facc15' : t.good)
        progress()
      }
      return {
        how: 'TAP THE MOLES · AVOID BOMBS',
        tap(x, y) {
          swing = { x, y, t: 0.18 }
          let any = false
          for (const m of moles) {
            if (m.hit) continue
            const p = holes[m.h]
            if (Math.hypot(x - p.x, y - (p.y - 14)) < cw * 0.5) { hit(m); any = true; break }
          }
          if (!any) { combo = 0; env.sfx('click') }
        },
        update(dt) {
          swing.t -= dt
          const rd = round()
          spawn -= dt
          if (spawn <= 0 && moles.length < (multi ? 4 : 1 + Math.min(2, Math.floor(rd / 3)))) {
            const f = free()
            if (f.length) {
              const r = rng()
              const bomb = rd >= 2 && r < 0.14 + rd * 0.01
              const gold = !bomb && r > 0.93
              moles.push({ h: rng.pick(f), t: 0, dur: lifetime(rd, env.difficulty) / fast, kind: bomb ? 'bomb' : gold ? 'gold' : 'mole', hit: false, e: bomb ? '💣' : gold ? '⭐' : t.foes[rng.int(0, t.foes.length - 1)] })
            }
            spawn = Math.max(0.3, [1.0, 0.8, 0.65][env.difficulty] - rd * 0.04) / fast * (multi ? 0.6 : 1)
          }
          for (const m of moles) {
            m.t += dt
            if (m.t >= m.dur && !m.hit) {
              m.hit = true
              if (m.kind === 'mole') miss(holes[m.h].x, holes[m.h].y - 30, 'ESCAPED')
              else if (m.kind === 'gold') combo = 0
            }
          }
          moles = moles.filter((m) => m.t < m.dur + 0.1)
        },
        draw() {
          for (const [i, p] of holes.entries()) {
            ctx.fillStyle = 'rgba(0,0,0,.45)'
            ctx.beginPath()
            ctx.ellipse(p.x, p.y + 8, cw * 0.38, cw * 0.16, 0, 0, TAU)
            ctx.fill()
            const m = moles.find((q) => q.h === i)
            if (m) {
              const u = m.hit ? 0.3 : Math.sin(clamp(m.t / m.dur, 0, 1) * Math.PI) ** 0.5
              ctx.save()
              ctx.beginPath()
              ctx.rect(p.x - cw / 2, p.y - cw, cw, cw + 8)
              ctx.clip()
              emoji(ctx, m.e, p.x, p.y + 30 - u * 62, cw * 0.62, m.hit && m.kind !== 'bomb' ? 0.4 : 0)
              ctx.restore()
            }
            ctx.strokeStyle = t.accent2
            ctx.lineWidth = 4
            ctx.beginPath()
            ctx.ellipse(p.x, p.y + 8, cw * 0.38, cw * 0.16, 0, 0, Math.PI)
            ctx.stroke()
          }
          emoji(ctx, t.hero, W - 28, H - 28, 32)
          if (swing.t > 0) {
            emoji(ctx, '🔨', swing.x + 10, swing.y - 10, 44, -1 + (0.18 - swing.t) * 9)
          }
        },
      }
    }

    // ---------------------------------------------------------- bar
    const bar = (): M => {
      const bw = W - 60
      const bx = 30
      const by = H / 2
      let pos = 0
      let dir = 1
      let zone = 0.5
      let zw = zoneWidth(0, env.difficulty)
      let lock = 0
      let lockPos = 0
      let msgOk = true
      const newRound = () => {
        zw = zoneWidth(done, env.difficulty)
        zone = rng.range(0.15 + zw / 2, 0.85 - zw / 2)
        pos = rng() < 0.5 ? 0 : 1
        dir = pos === 0 ? 1 : -1
      }
      newRound()
      const spd = () => (0.75 + done * 0.09) * [0.85, 1, 1.15][env.difficulty] * fast
      return {
        how: circular ? 'TAP TO STOP THE NEEDLE IN THE ARC' : 'TAP TO STOP IN THE ZONE',
        tap() {
          if (lock > 0) return
          lock = 0.9
          lockPos = pos
          const d = Math.abs(pos - zone)
          const x = circular ? W / 2 : bx + pos * bw
          const y = circular ? H / 2 - 90 : by - 40
          if (d < zw * 0.12) { msgOk = true; ok(100, x, y, 'PERFECT', '#facc15'); progress() }
          else if (d < zw / 2) { msgOk = true; ok(50, x, y, 'GOOD'); progress() }
          else { msgOk = false; miss(x, y, d < zw ? 'CLOSE' : 'MISS'); if (!over) progress(0) }
        },
        update(dt) {
          if (lock > 0) {
            lock -= dt
            if (lock <= 0 && !over) { if (!msgOk) done++ ; status(); if (done >= goal) win(); else newRound() }
            return
          }
          if (circular) { pos = (pos + dir * spd() * 0.55 * dt + 1) % 1; return }
          pos += dir * spd() * dt
          if (pos > 1) { pos = 1; dir = -1 }
          if (pos < 0) { pos = 0; dir = 1 }
        },
        draw() {
          const p = lock > 0 ? lockPos : pos
          if (circular) {
            const cx = W / 2
            const cy = H / 2
            const rad = Math.min(W, H) * 0.32
            ctx.strokeStyle = 'rgba(255,255,255,.15)'
            ctx.lineWidth = 22
            ctx.beginPath()
            ctx.arc(cx, cy, rad, 0, TAU)
            ctx.stroke()
            ctx.strokeStyle = t.good
            ctx.shadowColor = t.good
            ctx.shadowBlur = 12
            ctx.beginPath()
            ctx.arc(cx, cy, rad, zone * TAU - zw * TAU / 2 - Math.PI / 2, zone * TAU + zw * TAU / 2 - Math.PI / 2)
            ctx.stroke()
            ctx.shadowBlur = 0
            const a = p * TAU - Math.PI / 2
            ctx.strokeStyle = t.fg
            ctx.lineWidth = 4
            ctx.beginPath()
            ctx.moveTo(cx, cy)
            ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad)
            ctx.stroke()
            emoji(ctx, t.hero, cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, 34)
            emoji(ctx, t.items[done % t.items.length], cx, cy, 36)
            return
          }
          roundRect(ctx, bx, by - 18, bw, 36, 18, 'rgba(0,0,0,.4)', t.accent, 3)
          ctx.fillStyle = t.good
          ctx.shadowColor = t.good
          ctx.shadowBlur = 14
          roundRect(ctx, bx + (zone - zw / 2) * bw, by - 18, zw * bw, 36, 10, t.good)
          ctx.shadowBlur = 0
          ctx.fillStyle = '#fff'
          ctx.fillRect(bx + zone * bw - 1, by - 22, 2, 44)
          emoji(ctx, t.hero, bx + p * bw, by - 2, 40, lock > 0 ? 0 : Math.sin(time * 12) * 0.1)
          if (lock > 0) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(bx + p * bw - 1.5, by - 24, 3, 48) }
        },
      }
    }

    // ---------------------------------------------------------- aim
    const aim = (): M => {
      interface Tg { x: number; y: number; t: number; dur: number; r: number; e: string; decoy: boolean }
      let tgs: Tg[] = []
      let spawn = 0.5
      const sw = { x: 0, y: 0 }
      const margin = 50
      return {
        how: sniper ? 'AIM THROUGH THE SCOPE · SWAY!' : 'TAP THE TARGETS BEFORE THEY VANISH',
        tap(x, y) {
          if (sniper) { x = sw.x; y = sw.y }
          let hitOne = false
          for (const g of tgs) {
            const rr = g.r * (1 - 0.45 * (g.t / g.dur))
            if (Math.hypot(x - g.x, y - g.y) < rr + 6) {
              hitOne = true
              g.t = 99
              if (g.decoy) { miss(g.x, g.y, 'DECOY'); break }
              const centre = Math.hypot(x - g.x, y - g.y) < rr * 0.3
              ok(centre ? 25 : 12, g.x, g.y - 20, centre ? 'BULLSEYE' : 'HIT', centre ? '#facc15' : t.good)
              progress()
              break
            }
          }
          if (!hitOne) { combo = 0; env.sfx('click'); popup(x, y, 'MISS', t.danger) }
        },
        update(dt) {
          const rd = round()
          if (sniper) {
            const a = time * 1.3
            sw.x = clamp(ptr.x + Math.sin(a * 1.7) * 22 + Math.cos(a * 0.9) * 10, 0, W)
            sw.y = clamp(ptr.y + Math.cos(a * 1.3) * 22, 0, H)
          }
          spawn -= dt
          const maxN = 1 + Math.min(3, Math.floor(rd / 3)) + (multi ? 1 : 0)
          if (spawn <= 0 && tgs.length < maxN) {
            const decoy = rd >= 3 && rng() < 0.18
            tgs.push({ x: rng.range(margin, W - margin), y: rng.range(margin + 20, H - margin), t: 0, dur: lifetime(rd, env.difficulty) * 1.2 / fast, r: Math.max(16, 34 - rd * 1.4), e: decoy ? t.foes[0] : rng.pick(t.items), decoy })
            spawn = Math.max(0.25, [0.9, 0.7, 0.55][env.difficulty] - rd * 0.03) / fast
          }
          for (const g of tgs) {
            g.t += dt
            if (g.t >= g.dur && g.t < 90) {
              g.t = 99
              if (!g.decoy) miss(g.x, g.y, 'TOO SLOW')
            }
          }
          tgs = tgs.filter((g) => g.t < 90)
        },
        draw() {
          for (const g of tgs) {
            const rr = g.r * (1 - 0.45 * (g.t / g.dur))
            ctx.strokeStyle = g.decoy ? t.danger : t.accent
            ctx.lineWidth = 3
            ctx.shadowColor = ctx.strokeStyle
            ctx.shadowBlur = 8
            ctx.beginPath()
            ctx.arc(g.x, g.y, rr + 5, 0, TAU)
            ctx.stroke()
            ctx.shadowBlur = 0
            ctx.globalAlpha = 0.3 + 0.7 * (1 - g.t / g.dur)
            ctx.fillStyle = g.decoy ? t.danger : t.accent2
            ctx.beginPath()
            ctx.arc(g.x, g.y, rr, 0, TAU)
            ctx.fill()
            ctx.globalAlpha = 1
            emoji(ctx, g.e, g.x, g.y, rr * 1.4)
          }
          if (sniper) {
            ctx.fillStyle = 'rgba(0,0,0,.55)'
            ctx.beginPath()
            ctx.rect(0, 0, W, H)
            ctx.arc(sw.x, sw.y, 70, 0, TAU, true)
            ctx.fill('evenodd')
            ctx.strokeStyle = t.danger
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(sw.x - 70, sw.y); ctx.lineTo(sw.x + 70, sw.y)
            ctx.moveTo(sw.x, sw.y - 70); ctx.lineTo(sw.x, sw.y + 70)
            ctx.arc(sw.x, sw.y, 70, 0, TAU)
            ctx.stroke()
          }
          emoji(ctx, t.hero, W - 28, H - 28, 32)
        },
      }
    }

    // ---------------------------------------------------------- react
    const react = (): M => {
      let state: 'wait' | 'go' | 'decoy' | 'result' = 'wait'
      let tm = rng.range(1, 2.6)
      let ms = 0
      let text1 = 'WAIT...'
      const limit = () => Math.max(0.5, 1.0 - done * 0.04) / fast
      const next = () => {
        state = 'wait'
        tm = rng.range(1, 2.8)
        text1 = 'WAIT...'
      }
      return {
        how: 'TAP WHEN THE SCREEN TURNS GREEN',
        tap() {
          const cx = W / 2
          const cy = H / 2
          if (state === 'wait') { miss(cx, cy - 80, 'TOO EARLY'); if (!over) { progress(0); next() } }
          else if (state === 'decoy') { miss(cx, cy - 80, 'DECOY'); if (!over) next() }
          else if (state === 'go') {
            const m = Math.round(ms * 1000)
            ok(reactionPoints(m), cx, cy - 80, `${m} MS`, m < 250 ? '#facc15' : t.good)
            state = 'result'
            text1 = `${m} MS`
            tm = 0.9
            progress()
          }
        },
        update(dt) {
          tm -= dt
          if (state === 'wait' && tm <= 0) {
            if (done >= 3 && rng() < 0.3) { state = 'decoy'; tm = 0.7 }
            else { state = 'go'; ms = 0; env.sfx('click') }
          } else if (state === 'decoy' && tm <= 0) { next(); popup(W / 2, H / 2 - 80, 'GOOD HOLD', t.good) }
          else if (state === 'go') {
            ms += dt
            if (ms > limit()) { miss(W / 2, H / 2 - 80, 'TOO SLOW'); if (!over) { progress(0); done++; status(); if (done >= goal) win(); else next() } }
          } else if (state === 'result' && tm <= 0 && !over) next()
        },
        draw() {
          const col = state === 'go' ? '#22c55e' : state === 'decoy' ? '#eab308' : state === 'result' ? t.accent : '#7f1d1d'
          ctx.fillStyle = col
          ctx.globalAlpha = state === 'wait' ? 0.55 : 0.85
          ctx.fillRect(0, 0, W, H)
          ctx.globalAlpha = 1
          emoji(ctx, t.hero, W / 2, H / 2 - 10, 90 + (state === 'go' ? 14 : 0))
          text(ctx, state === 'go' ? 'TAP!' : state === 'decoy' ? 'NOT YET...' : text1, W / 2, H / 2 + 70, { size: 26, color: '#fff', shadow: '#000' })
        },
      }
    }

    // ---------------------------------------------------------- pulse
    const pulse = (): M => {
      const LEAD = 1.1
      let bpm = 80
      let notes: number[] = []
      let nextT = 1.4
      let clock = 0
      let flashN = 0
      const gen = () => {
        const beat = 60 / bpm
        let tt = nextT
        for (let i = 0; i < 8; i++) {
          notes.push(tt)
          tt += beat * (rng() < 0.25 + round() * 0.03 ? 0.5 : 1)
        }
        nextT = tt + beat
      }
      return {
        how: 'TAP WHEN THE RING HITS THE CENTRE',
        tap() {
          // nearest unresolved note
          let bi = -1
          let bd = 9
          notes.forEach((n, i) => { const d = Math.abs(n - clock); if (d < bd) { bd = d; bi = i } })
          if (bi < 0 || bd > 0.28) { combo = 0; env.sfx('click'); popup(W / 2, H / 2 - 100, 'EARLY', t.danger); return }
          const j = judge(notes[bi] - clock, round(), env.difficulty)
          notes.splice(bi, 1)
          flashN = 0.15
          if (j === 'miss') { miss(W / 2, H / 2 - 100, 'OFF BEAT'); if (!over) progress() }
          else { ok(j === 'perfect' ? 30 : 15, W / 2, H / 2 - 100, j === 'perfect' ? 'PERFECT' : 'GOOD', j === 'perfect' ? '#facc15' : t.good); progress() }
        },
        update(dt) {
          clock += dt
          bpm = Math.min(150, (72 + round() * 7) * [0.9, 1, 1.1][env.difficulty] * fast)
          if (notes.length < 6 && done + notes.length < goal + 8) gen()
          flashN -= dt
          for (let i = notes.length - 1; i >= 0; i--)
            if (clock - notes[i] > 0.2) {
              notes.splice(i, 1)
              miss(W / 2, H / 2 - 100, 'MISSED')
              if (!over) progress()
            }
        },
        draw() {
          const cx = W / 2
          const cy = H / 2
          const rr = 46
          ctx.strokeStyle = t.fg
          ctx.lineWidth = 4
          ctx.shadowColor = t.accent
          ctx.shadowBlur = flashN > 0 ? 24 : 8
          ctx.beginPath()
          ctx.arc(cx, cy, rr, 0, TAU)
          ctx.stroke()
          ctx.shadowBlur = 0
          for (const n of notes) {
            const u = (n - clock) / LEAD
            if (u > 1) continue
            const r = rr + Math.max(0, u) * Math.min(W, H) * 0.4
            ctx.strokeStyle = t.accent2
            ctx.globalAlpha = 1 - Math.max(0, u) * 0.7
            ctx.lineWidth = 5
            ctx.beginPath()
            ctx.arc(cx, cy, r, 0, TAU)
            ctx.stroke()
          }
          ctx.globalAlpha = 1
          const beat = 60 / bpm
          const sc = 1 + 0.18 * Math.max(0, 1 - ((clock % beat) / beat) * 3)
          emoji(ctx, t.hero, cx, cy, 52 * sc)
        },
      }
    }

    const M: M = { whack, bar, aim, react, pulse }[mode]()
    const tap = (x: number, y: number) => {
      if (intro > 0.15) { intro = 0; return }
      if (over) return
      M.tap(x, y)
    }
    ptr.onDown((p) => tap(p.x, p.y))
    k.onKey((e) => {
      if (e.repeat) return
      if (e.code === 'Space' || e.code === 'Enter') tap(ptr.active ? ptr.x : W / 2, ptr.active ? ptr.y : H / 2)
    })
    status()
    env.score(0)

    const update = (dt: number) => {
      fx.update(dt)
      shake.update(dt)
      flash = Math.max(0, flash - dt)
      for (const p of pops) p.t -= dt
      pops = pops.filter((p) => p.t > 0)
      if (intro > 0) { intro -= dt; return }
      time += dt
      if (!over) M.update(dt)
    }
    const draw = () => {
      if (mode !== 'react') background(ctx, W, H, t, 40, env.seed)
      else { ctx.fillStyle = t.bg; ctx.fillRect(0, 0, W, H) }
      ctx.save()
      shake.apply(ctx)
      M.draw()
      fx.draw(ctx)
      for (const p of pops) {
        ctx.globalAlpha = Math.min(1, p.t * 2)
        text(ctx, p.s, p.x, p.y - (0.9 - p.t) * 30, { size: 14, color: p.c, shadow: '#000' })
        ctx.globalAlpha = 1
      }
      ctx.restore()
      if (flash > 0) {
        ctx.globalAlpha = flash * 1.5
        ctx.fillStyle = flashC
        ctx.fillRect(0, 0, W, H)
        ctx.globalAlpha = 1
      }
      roundRect(ctx, 0, 0, W, 4, 0, 'rgba(0,0,0,.4)')
      roundRect(ctx, 0, 0, W * clamp(done / goal, 0, 1), 4, 0, t.accent)
      if (combo >= 2) text(ctx, `x${combo}`, 12, H - 14, { size: 12, color: t.accent, align: 'left' })
      if (intro > 0) {
        const a = Math.min(1, intro * 3)
        ctx.fillStyle = `rgba(0,0,0,${0.65 * a})`
        ctx.fillRect(0, 0, W, H)
        ctx.globalAlpha = a
        emoji(ctx, t.hero, W / 2, H / 2 - 82, 64 + Math.sin(time * 5 + intro * 5) * 3)
        text(ctx, env.name.toUpperCase(), W / 2, H / 2 - 28, { size: env.name.length > (portrait ? 14 : 24) ? 12 : 18, color: t.fg, shadow: t.accent })
        text(ctx, env.desc.slice(0, portrait ? 30 : 56), W / 2, H / 2 + 6, { size: 8, color: t.accent2 })
        text(ctx, M.how, W / 2, H / 2 + 44, { size: 8, color: t.fg })
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
