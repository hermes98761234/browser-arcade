// Memory: card pairs (board grows per level), spot-the-difference, simon / sequence recall (colours or grid) and hidden-object scenes.
import { background, Bag, byDiff, clamp, createStage, emoji, loop, makeRng, Particles, roundRect, Shake, text, type Engine, type GameEnv, type Stage } from '../kit'

let W = 640
let H = 400

type Mode = 'pairs' | 'spot' | 'simon' | 'hidden'

const EXTRA = ['🍎', '🍌', '🍇', '🍓', '🌻', '🌵', '🐶', '🐱', '🐭', '🐸', '🦋', '🐢', '🚗', '🚀', '⚽', '🎈', '🎸', '🔔', '🍕', '🍩', '🌈', '⭐', '🌙', '☂️', '🧸', '🎁', '🔑', '🍄', '🐙', '🦊']

function pickMode(env: GameEnv): Mode {
  const s = `${env.name} ${env.desc}`.toLowerCase()
  if (env.mods.has('spot') || /spot|difference|twin scenes|odd one|mismatch|glitch|detective|flicker|change blind|clock clues/.test(s)) return 'spot'
  if (/find|seek|hunt|search|hidden|lost|finder|critters|crowd|junk|market|bookcase|attic|sale|gazer|dust|magnif|lens|shadow|silhouette|camouflage|remote|sticker|zoom/.test(s)) return 'hidden'
  if (/card|pair|match|memory|socks|opposites|shape train|dress|face names/.test(s)) return 'pairs'
  if (/simon|sequence|recall|echo|tone|signal|span|n-back|path|trail|stroop|number/.test(s)) return 'simon'
  return 'pairs'
}

interface Banner { s: string; t: number }

const engine: Engine = {
  start(env) {
    const { theme: t, rng } = env
    const r0 = env.host.getBoundingClientRect()
    const portrait = r0.height > r0.width * 1.05
    W = portrait ? 400 : 640
    H = portrait ? 640 : 400
    const st: Stage = createStage(env.host, W, H)
    const ctx = st.ctx
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const mode = pickMode(env)
    const nm = `${env.name} ${env.desc}`.toLowerCase()
    const easy = env.difficulty === 0
    const dark = env.mods.has('dark')
    const mirror = env.mods.has('mirror')
    const tiny = env.mods.has('tiny')
    const pool = [...new Set([...t.items, ...t.foes, ...t.heroes, ...EXTRA])]

    let total = 0
    let level = 1
    let LEVELS = 3
    let time = 0
    let timing = false
    let limit = 0
    let ended = false
    let clock = 0
    let hero = 0
    let mx = W / 2
    let my = H / 2
    let banner: Banner | null = null
    let advance = -1
    let intro = 2.5
    const flashes: { x: number; y: number; s: string; t: number; c: string }[] = []

    const hud = (extra = '') => {
      env.score(total)
      env.status(`Level ${level}/${LEVELS}${extra ? ` · ${extra}` : ''}`)
    }
    const finish = (won: boolean, msg: string) => {
      if (ended) return
      ended = true
      env.sfx(won ? 'win' : 'lose')
      env.end({ score: total, won, text: msg })
    }
    const levelDone = (gain: number, msg: string) => {
      total += gain
      banner = { s: `${msg} +${gain}`, t: 0 }
      advance = 2
      timing = false
      env.sfx('win')
      for (let i = 0; i < 40; i++) fx.burst(W / 2, H / 2, t.blocks[i % t.blocks.length], 1, 340, 4)
      hud()
    }
    const flash = (x: number, y: number, s: string, c = '#fff') => flashes.push({ x, y, s, t: 0, c })
    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

    // ---- shared drawing ----
    const panel = (lv: string, lines: [string, string][]) => {
      if (portrait) {
        text(ctx, lv, 20, 22, { size: 10, color: t.accent, align: 'left' })
        const w = (W - 40) / lines.length
        lines.forEach(([a2, b2], i) => text(ctx, `${a2} ${b2}`, 20 + i * w, 54, { size: 9, color: t.fg, align: 'left' }))
        return
      }
      text(ctx, lv, 66, 36, { size: 10, color: t.accent })
      let y = 84
      for (const [a2, b2] of lines) {
        text(ctx, a2, 66, y, { size: 8, color: t.fg })
        text(ctx, b2, 66, y + 24, { size: 16, color: t.fg })
        y += 66
      }
    }
    const heroDraw = (x: number, y: number, sz = 52) => emoji(ctx, t.hero, x, y - Math.sin(hero * Math.PI) * 14, sz)

    interface M { update(dt: number): void; draw(): void; click(x: number, y: number, b: number): void; key(code: string): void; init(): void }

    // =====================================================================
    // PAIRS
    // =====================================================================
    const pairs = (): M => {
      interface Card { sym: string; flip: number; up: boolean; matched: boolean; pop: number }
      let cards: Card[] = []
      let cols = 4
      let rows = 3
      let sel: number[] = []
      let wait = 0
      let moves = 0
      let streak = 0
      let peek = 0
      let cur = 0
      const sizes: [number, number][][] = [
        [[2, 3], [2, 4], [3, 4], [4, 4], [4, 5]],
        [[3, 4], [4, 4], [4, 5], [4, 6], [5, 6]],
        [[4, 4], [4, 5], [4, 6], [5, 6], [6, 6]],
      ]
      LEVELS = 5
      const layout = () => {
        const gap = 8
        const aw = portrait ? 380 : 390
        const ah = portrait ? 490 : 350
        const cw = Math.min((aw - gap * (cols - 1)) / cols, (ah - gap * (rows - 1)) / rows, 92)
        const x0 = (portrait ? 10 : 135) + (aw - (cw * cols + gap * (cols - 1))) / 2
        const y0 = (portrait ? 80 : 25) + (ah - (cw * rows + gap * (rows - 1))) / 2
        return { gap, cw, x0, y0 }
      }
      const init = () => {
        ;[cols, rows] = sizes[env.difficulty][level - 1]
        if (portrait && cols > rows) [cols, rows] = [rows, cols]
        const n = (cols * rows) / 2
        const syms = rng.shuffle([...pool.slice(0, 40)].sort(() => rng() - 0.5)).slice(0, n)
        cards = rng.shuffle([...syms, ...syms]).map((sym) => ({ sym, flip: 1, up: true, matched: false, pop: 0 }))
        sel = []
        wait = 0
        moves = 0
        streak = 0
        time = 0
        timing = false
        peek = byDiff(env, 2.2, 1.4, 0.8) + (level > 3 ? 0.4 : 0)
        limit = env.mods.has('timer') || env.mods.has('fast') ? n * byDiff(env, 14, 9, 6) : 0
        cur = 0
        hud(`${n} pairs`)
      }
      const resolve = () => {
        if (sel.length < 2) return
        const [a, b] = sel
        sel = []
        if (cards[a].sym === cards[b].sym) {
          for (const i of [a, b]) {
            cards[i].matched = true
            cards[i].pop = 1
          }
          streak++
          const g = layout()
          for (const i of [a, b]) fx.burst(g.x0 + (i % cols) * (g.cw + g.gap) + g.cw / 2, g.y0 + Math.floor(i / cols) * (g.cw + g.gap) + g.cw / 2, t.accent2, 14, 160, 3)
          env.sfx('point')
          hero = 1
          if (streak > 1) flash(W / 2, 30, `Streak x${streak}`, t.accent2)
          if (cards.every((c) => c.matched)) {
            const n = cards.length / 2
            const gain = Math.max(50, n * 100 - moves * 6 - Math.floor(time) + streak * 10 + (limit ? Math.floor(limit - time) * 2 : 0))
            levelDone(gain, 'Cleared!')
          }
        } else {
          streak = 0
          wait = byDiff(env, 1.2, 0.8, 0.6)
          env.sfx('hit')
          shake.kick(2)
        }
      }
      const hide = () => {
        for (const i of [...cards.keys()]) if (!cards[i].matched && cards[i].up && !sel.includes(i)) cards[i].up = false
      }
      return {
        init,
        click(x, y) {
          if (peek > 0 || banner) return
          const g = layout()
          const cx = Math.floor((x - g.x0) / (g.cw + g.gap))
          const cy = Math.floor((y - g.y0) / (g.cw + g.gap))
          if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return
          flipCard(cy * cols + cx)
        },
        key(code) {
          if (code === 'ArrowLeft') cur = (cur + cards.length - 1) % cards.length
          else if (code === 'ArrowRight') cur = (cur + 1) % cards.length
          else if (code === 'ArrowUp') cur = (cur - cols + cards.length) % cards.length
          else if (code === 'ArrowDown') cur = (cur + cols) % cards.length
          else if (code === 'Space' || code === 'Enter') flipCard(cur)
        },
        update(dt) {
          if (peek > 0) {
            peek -= dt
            if (peek <= 0) for (const c of cards) c.up = false
          } else if (timing && !banner) {
            time += dt
            if (limit && time >= limit) finish(false, `Out of time on level ${level}`)
          }
          if (wait > 0) {
            wait -= dt
            if (wait <= 0) {
              hide()
              sel = []
            }
          }
          for (const c of cards) {
            c.flip += ((c.up || c.matched ? 1 : 0) - c.flip) * Math.min(1, dt * 14)
            c.pop = Math.max(0, c.pop - dt * 3)
          }
        },
        draw() {
          const g = layout()
          cards.forEach((c, i) => {
            const x = g.x0 + (i % cols) * (g.cw + g.gap)
            const y = g.y0 + Math.floor(i / cols) * (g.cw + g.gap)
            const sx = Math.max(0.04, Math.abs(Math.cos(c.flip * Math.PI)))
            const face = c.flip > 0.5
            ctx.save()
            ctx.translate(x + g.cw / 2, y + g.cw / 2)
            ctx.scale(sx * (1 + Math.sin(c.pop * Math.PI) * 0.15), 1 + Math.sin(c.pop * Math.PI) * 0.15)
            if (face) {
              roundRect(ctx, -g.cw / 2, -g.cw / 2, g.cw, g.cw, 10, c.matched ? `${t.good}` : '#fff', c.matched ? '#fff' : 'rgba(0,0,0,0.25)', 2)
              if (c.matched) {
                ctx.globalAlpha = 0.75
                roundRect(ctx, -g.cw / 2 + 2, -g.cw / 2 + 2, g.cw - 4, g.cw - 4, 8, '#fff')
                ctx.globalAlpha = 1
              }
              emoji(ctx, c.sym, 0, 2, g.cw * 0.6)
            } else {
              const gr = ctx.createLinearGradient(-g.cw / 2, -g.cw / 2, g.cw / 2, g.cw / 2)
              gr.addColorStop(0, t.blocks[(i * 3) % t.blocks.length])
              gr.addColorStop(1, t.accent)
              roundRect(ctx, -g.cw / 2, -g.cw / 2, g.cw, g.cw, 10, undefined)
              ctx.fillStyle = gr
              ctx.beginPath()
              ctx.roundRect(-g.cw / 2, -g.cw / 2, g.cw, g.cw, 10)
              ctx.fill()
              ctx.strokeStyle = 'rgba(255,255,255,0.5)'
              ctx.lineWidth = 2
              ctx.stroke()
              ctx.globalAlpha = 0.5
              emoji(ctx, t.hero, 0, 0, g.cw * 0.42)
              ctx.globalAlpha = 1
            }
            ctx.restore()
            if (i === cur && !banner && peek <= 0) roundRect(ctx, x - 2, y - 2, g.cw + 4, g.cw + 4, 12, undefined, `rgba(255,255,255,${0.4 + Math.sin(clock * 6) * 0.2})`, 2)
          })
          panel(`LEVEL ${level}/${LEVELS}`, [['MOVES', `${moves}`], ['TIME', limit ? fmt(Math.max(0, limit - time)) : fmt(time)], ['PAIRS', `${cards.filter((c) => c.matched).length / 2}/${cards.length / 2}`]])
          if (portrait) {
            heroDraw(W - 40, 604, 40)
            text(ctx, `SCORE ${total}`, 20, 604, { size: 10, color: t.fg, align: 'left' })
          } else {
            text(ctx, 'SCORE', 570, 36, { size: 9, color: t.accent })
            text(ctx, `${total}`, 570, 60, { size: 14, color: t.fg })
            heroDraw(570, 300)
          }
          const fy = portrait ? 626 : 390
          if (peek > 0) text(ctx, 'Memorise!', W / 2, fy, { size: 12, color: t.accent2 })
          else if (!timing && !banner) text(ctx, 'Tap two cards to find a pair', W / 2, fy, { size: 9, color: t.fg })
        },
      }
      function flipCard(i: number) {
        const c = cards[i]
        if (!c || c.up || c.matched) return
        if (wait > 0) {
          wait = 0
          hide()
          sel = []
        }
        c.up = true
        timing = true
        env.sfx('click')
        sel.push(i)
        if (sel.length === 2) {
          moves++
          hud(`${moves} moves`)
          resolve()
        }
      }
    }

    // =====================================================================
    // SPOT THE DIFFERENCE
    // =====================================================================
    const spot = (): M => {
      interface Obj { e: string; x: number; y: number; s: number }
      const PW = portrait ? 370 : 300
      const PH = portrait ? 250 : 270
      const PYs = portrait ? [78, 344] : [58, 58]
      const PX = portrait ? [15, 15] : [14, 326]
      const hintBtn = { x: W / 2 - 70, y: portrait ? 596 : 340, w: 140, h: 38 }
      let a: Obj[] = []
      let b: Obj[] = []
      let diffs: { x: number; y: number; r: number; found: boolean }[] = []
      let mistakes = 0
      let hints = byDiff(env, 4, 2, 1)
      LEVELS = 3
      const bgSeed = () => makeRng(env.seed + level * 31)
      const init = () => {
        const cnt = byDiff(env, [3, 4, 5], [5, 6, 7], [7, 8, 10])[level - 1]
        const r = rng
        const nObj = 16 + level * 3 + env.difficulty * 3
        a = []
        for (let i = 0; i < nObj; i++) {
          for (let tries = 0; tries < 30; tries++) {
            const s = r.range(24, 42)
            const o = { e: r.pick(pool), x: r.range(s, PW - s), y: r.range(s, PH - s), s }
            if (a.every((p) => Math.hypot(p.x - o.x, p.y - o.y) > (p.s + o.s) * 0.75)) {
              a.push(o)
              break
            }
          }
        }
        b = a.map((o) => ({ ...o }))
        const idx = r.shuffle([...a.keys()]).slice(0, cnt)
        diffs = []
        idx.forEach((oi, j) => {
          const kind = j % 4
          const o = b[oi]
          if (kind === 0) o.s = 0
          else if (kind === 1) {
            let e = r.pick(pool)
            while (e === o.e) e = r.pick(pool)
            o.e = e
          } else if (kind === 2) {
            o.x = clamp(o.x + (r.chance(0.5) ? 1 : -1) * o.s * 0.9, o.s, PW - o.s)
            o.y = clamp(o.y + (r.chance(0.5) ? 1 : -1) * o.s * 0.5, o.s, PH - o.s)
          } else o.s *= 0.55
          diffs.push({ x: a[oi].x, y: a[oi].y, r: a[oi].s * 0.75 + 6, found: false })
        })
        mistakes = 0
        time = 0
        timing = true
        limit = easy ? 0 : cnt * byDiff(env, 0, 22, 14)
        hud(`0/${cnt}`)
      }
      const scene = (x0: number, PY: number, objs: Obj[], flip: boolean) => {
        ctx.save()
        ctx.translate(x0, PY)
        ctx.beginPath()
        ctx.roundRect(0, 0, PW, PH, 12)
        ctx.clip()
        const g = ctx.createLinearGradient(0, 0, 0, PH)
        g.addColorStop(0, t.bg)
        g.addColorStop(1, t.bg2)
        ctx.fillStyle = g
        ctx.fillRect(0, 0, PW, PH)
        const rr = bgSeed()
        for (let i = 0; i < 24; i++) {
          ctx.fillStyle = t.blocks[i % t.blocks.length]
          ctx.globalAlpha = 0.12
          ctx.beginPath()
          ctx.arc(rr() * PW, rr() * PH, 8 + rr() * 26, 0, 7)
          ctx.fill()
        }
        ctx.globalAlpha = 1
        if (flip) {
          ctx.translate(PW, 0)
          ctx.scale(-1, 1)
        }
        for (const o of objs) if (o.s > 0) emoji(ctx, o.e, o.x, o.y, o.s)
        if (flip) ctx.setTransform(ctx.getTransform())
        ctx.restore()
        ctx.save()
        ctx.translate(x0, PY)
        for (const d of diffs) {
          if (!d.found) continue
          const dx = flip ? PW - d.x : d.x
          ctx.strokeStyle = t.good
          ctx.lineWidth = 3
          ctx.shadowColor = t.good
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(dx, d.y, d.r, 0, 7)
          ctx.stroke()
        }
        ctx.restore()
        roundRect(ctx, x0, PY, PW, PH, 12, undefined, 'rgba(255,255,255,0.35)', 2)
        if (dark) {
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(x0, PY, PW, PH, 12)
          ctx.clip()
          const lg = ctx.createRadialGradient(mx, my, 20, mx, my, 90)
          lg.addColorStop(0, 'rgba(0,0,0,0)')
          lg.addColorStop(1, 'rgba(0,0,0,0.93)')
          ctx.fillStyle = lg
          ctx.fillRect(x0, PY, PW, PH)
          ctx.restore()
        }
      }
      return {
        init,
        click(x, y) {
          if (banner) return
          if (x > hintBtn.x && x < hintBtn.x + hintBtn.w && y > hintBtn.y && y < hintBtn.y + hintBtn.h) return this.key('KeyH')
          for (let p = 0; p < 2; p++) {
            const lx = x - PX[p]
            const ly = y - PYs[p]
            if (lx < 0 || ly < 0 || lx > PW || ly > PH) continue
            const ox = p === 1 && mirror ? PW - lx : lx
            const d = diffs.find((q) => !q.found && Math.hypot(q.x - ox, q.y - ly) < q.r + 8)
            if (d) {
              d.found = true
              env.sfx('point')
              hero = 1
              fx.burst(x, y, t.good, 14, 170, 3)
              const left = diffs.filter((q) => !q.found).length
              hud(`${diffs.length - left}/${diffs.length}`)
              if (!left) {
                const gain = Math.max(60, diffs.length * 100 - mistakes * 40 - Math.floor(time) * 2)
                levelDone(gain, 'All found!')
              }
            } else {
              mistakes++
              time += 3
              env.sfx('hit')
              shake.kick(3)
              flash(x, y, 'x', t.danger)
            }
            return
          }
        },
        key(code) {
          if (code === 'KeyH' && hints > 0) {
            const d = diffs.find((q) => !q.found)
            if (d) {
              hints--
              d.found = true
              mistakes++
              env.sfx('power')
              hud(`${diffs.filter((q) => q.found).length}/${diffs.length}`)
              if (diffs.every((q) => q.found)) levelDone(60, 'Done!')
            }
          }
        },
        update(dt) {
          if (timing && !banner) {
            time += dt
            if (limit && time >= limit) finish(false, `Time up on level ${level}`)
          }
        },
        draw() {
          scene(PX[0], PYs[0], a, false)
          scene(PX[1], PYs[1], mirror ? a.map((o, i) => b[i] ?? o) : b, mirror)
          const found = diffs.filter((d) => d.found).length
          text(ctx, `LEVEL ${level}/${LEVELS}`, portrait ? 15 : 90, 24, { size: 10, color: t.accent, align: portrait ? 'left' : 'center' })
          if (!portrait) text(ctx, `FOUND ${found}/${diffs.length}`, W / 2, 24, { size: 11, color: t.fg })
          else text(ctx, `${found}/${diffs.length}`, W / 2 + 20, 24, { size: 11, color: t.fg })
          text(ctx, limit ? fmt(Math.max(0, limit - time)) : fmt(time), portrait ? W - 15 : 560, 24, { size: 11, color: limit && limit - time < 10 ? t.danger : t.fg, align: portrait ? 'right' : 'center' })
          for (let i = 0; i < diffs.length; i++) {
            ctx.fillStyle = diffs[i].found ? t.good : 'rgba(128,128,128,0.4)'
            ctx.beginPath()
            ctx.arc(W / 2 - (diffs.length * 14) / 2 + i * 14 + 7, portrait ? 52 : 44, 4, 0, 7)
            ctx.fill()
          }
          text(ctx, `${mirror ? 'Mirrored! ' : ''}Tap the differences`, W / 2, portrait ? 618 + 22 : 334, { size: 8, color: t.fg })
          roundRect(ctx, hintBtn.x, hintBtn.y, hintBtn.w, hintBtn.h, 10, hints ? t.accent : 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.3)', 1.5)
          text(ctx, `HINT (${hints})`, hintBtn.x + hintBtn.w / 2, hintBtn.y + hintBtn.h / 2, { size: 10, color: hints ? '#fff' : t.fg })
          text(ctx, `Misses ${mistakes}`, portrait ? 20 : 90, portrait ? 616 : 360, { size: 9, color: mistakes ? t.danger : t.fg, align: portrait ? 'left' : 'center' })
          heroDraw(portrait ? W - 40 : 570, portrait ? 612 : 378, 36)
        },
      }
    }

    // =====================================================================
    // SIMON / SEQUENCE
    // =====================================================================
    const simon = (): M => {
      const grid = /grid|spatial|path|trail|span|n-back|map/.test(nm)
      const pads = grid ? byDiff(env, 9, 9, 16) : byDiff(env, 4, 4, 6)
      const cols = grid ? Math.sqrt(pads) : pads === 6 ? 3 : 2
      const rows = pads / cols
      const goal = byDiff(env, 6, 9, 12)
      let seq: number[] = []
      let phase: 'wait' | 'show' | 'input' = 'wait'
      let idx = 0
      let tm = 1
      let lit = -1
      let litT = 0
      let lives = byDiff(env, 3, 2, 1)
      let round = 0
      let msg = ''
      LEVELS = goal
      let ac: AudioContext | null = null
      const tone = (i: number, dur = 0.25) => {
        try {
          ac ??= new AudioContext()
          const o = ac.createOscillator()
          const gn = ac.createGain()
          o.type = 'triangle'
          o.frequency.value = 220 * 2 ** ((i * 3) / 12 + (i % 2 ? 0.1 : 0))
          gn.gain.setValueAtTime(0.18, ac.currentTime)
          gn.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur)
          o.connect(gn).connect(ac.destination)
          o.start()
          o.stop(ac.currentTime + dur)
        } catch { /* no audio */ }
      }
      bag.add(() => {
        void ac?.close().catch(() => {})
      })
      const area = () => {
        const s = Math.min((portrait ? 372 : 330) / cols, (portrait ? 372 : 330) / rows, portrait ? 160 : 130)
        return { s, x0: W / 2 - (s * cols) / 2, y0: (portrait ? 340 : 200) - (s * rows) / 2 + 6 }
      }
      const light = (i: number, dur: number) => {
        lit = i
        litT = dur
        tone(i, dur)
      }
      const startShow = () => {
        seq.push(rng.int(0, pads - 1))
        round = seq.length
        phase = 'wait'
        tm = 0.9
        idx = 0
        msg = `Round ${round}`
        hud(`Round ${round}`)
      }
      const replay = () => {
        phase = 'wait'
        tm = 0.9
        idx = 0
      }
      const press = (i: number) => {
        if (phase !== 'input' || banner) return
        light(i, 0.22)
        if (i === seq[idx]) {
          idx++
          env.sfx('click')
          if (idx === seq.length) {
            total += round * 10 * (pads > 4 ? 2 : 1)
            hero = 1
            env.sfx('point')
            hud(`Round ${round}`)
            if (round >= goal) {
              levelDone(round * 20, 'Perfect memory!')
              advance = 99
              bag.timeout(() => finish(true, `Repeated a ${goal}-step sequence`), 2000)
              return
            }
            phase = 'wait'
            tm = 0.9
            idx = 0
            msg = 'Good!'
            pendingNext = true
          }
        } else {
          env.sfx('hit')
          shake.kick(5)
          lives--
          if (lives <= 0) {
            finish(false, `Remembered ${round - 1} steps`)
            return
          }
          msg = `Oops! ${lives} ${lives === 1 ? 'life' : 'lives'} left`
          replay()
        }
      }
      let pendingNext = false
      return {
        init() {
          seq = []
          startShow()
          timing = false
        },
        click(x, y) {
          const a = area()
          const cx = Math.floor((x - a.x0) / a.s)
          const cy = Math.floor((y - a.y0) / a.s)
          if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return
          press(cy * cols + cx)
        },
        key(code) {
          const map = grid ? ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9'] : ['KeyQ', 'KeyW', 'KeyA', 'KeyS', 'KeyE', 'KeyD']
          const i = map.indexOf(code)
          if (i >= 0 && i < pads) press(i)
          const i2 = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].indexOf(code)
          if (!grid && i2 >= 0 && i2 < pads) press(i2)
        },
        update(dt) {
          litT -= dt
          if (litT <= 0) lit = -1
          if (phase === 'wait') {
            tm -= dt
            if (tm <= 0) {
              if (pendingNext) {
                pendingNext = false
                startShow()
                return
              }
              phase = 'show'
              idx = 0
              tm = 0.1
            }
          } else if (phase === 'show') {
            tm -= dt
            if (tm <= 0) {
              if (idx >= seq.length) {
                phase = 'input'
                idx = 0
                msg = 'Your turn'
              } else {
                const step = Math.max(0.32, byDiff(env, 0.8, 0.62, 0.5) - round * 0.012)
                light(seq[idx], step * 0.7)
                idx++
                tm = step
              }
            }
          }
        },
        draw() {
          const a = area()
          for (let i = 0; i < pads; i++) {
            const x = a.x0 + (i % cols) * a.s
            const y = a.y0 + Math.floor(i / cols) * a.s
            const on = lit === i
            const col = grid ? t.accent : t.blocks[i % t.blocks.length]
            ctx.save()
            if (on) {
              ctx.shadowColor = col
              ctx.shadowBlur = 26
            }
            ctx.globalAlpha = on ? 1 : grid ? 0.28 : 0.5
            roundRect(ctx, x + 5, y + 5, a.s - 10, a.s - 10, 14, col, on ? '#fff' : 'rgba(255,255,255,0.3)', on ? 4 : 2)
            ctx.restore()
            if (!grid) emoji(ctx, t.items[i % t.items.length], x + a.s / 2, y + a.s / 2, a.s * (on ? 0.55 : 0.42))
            else if (on) emoji(ctx, t.hero, x + a.s / 2, y + a.s / 2, a.s * 0.5)
          }
          panel(`ROUND ${round}/${goal}`, [['SCORE', `${total}`], ['LIVES', '❤'.repeat(lives)]])
          text(ctx, phase === 'input' ? 'Repeat it!' : phase === 'show' ? 'Watch…' : msg, W / 2, portrait ? 100 : 28, { size: 12, color: phase === 'input' ? t.accent2 : t.fg })
          text(ctx, grid ? 'Tap the squares in order' : 'Tap the pads in order', W / 2, portrait ? 626 : 386, { size: 8, color: t.fg })
          heroDraw(portrait ? 60 : 570, portrait ? 590 : 200, 60)
        },
      }
    }

    // =====================================================================
    // HIDDEN OBJECT
    // =====================================================================
    const hidden = (): M => {
      interface Obj { e: string; x: number; y: number; s: number; rot: number }
      const SX = 10
      const SY = portrait ? 62 : 28
      const SW = portrait ? 380 : 440
      const SH = portrait ? 400 : 350
      const hintBtn = portrait ? { x: W / 2 - 70, y: 590, w: 140, h: 38 } : { x: 485, y: 344, w: 120, h: 34 }
      let clutter: Obj[] = []
      let targets: (Obj & { found: boolean; ghost: number })[] = []
      let mistakes = 0
      let hints = byDiff(env, 4, 3, 2)
      let hintT = 0
      let hintI = -1
      LEVELS = 3
      const timed = !easy && (env.mods.has('timer') || env.mods.has('fast') || /before|closing|rush/.test(nm) || env.difficulty === 2)
      const init = () => {
        const nT = byDiff(env, [4, 5, 6], [6, 7, 8], [8, 9, 10])[level - 1]
        const nC = byDiff(env, 40, 60, 80) + level * 8
        const picks = rng.shuffle([...pool])
        const tg = picks.slice(0, nT)
        const rest = picks.slice(nT)
        const sz = () => rng.range(tiny ? 18 : 28, tiny ? 30 : 44)
        clutter = []
        for (let i = 0; i < nC; i++) clutter.push({ e: rest[i % rest.length], x: rng.range(20, SW - 20), y: rng.range(20, SH - 20), s: sz(), rot: rng.range(-0.7, 0.7) })
        targets = tg.map((e) => ({ e, x: rng.range(24, SW - 24), y: rng.range(24, SH - 24), s: sz(), rot: rng.range(-0.5, 0.5), found: false, ghost: 0 }))
        mistakes = 0
        time = 0
        timing = true
        limit = timed ? nT * byDiff(env, 0, 16, 12) : 0
        hint0()
        hud(`0/${nT}`)
      }
      const hint0 = () => {
        hintT = 0
        hintI = -1
      }
      return {
        init,
        click(x, y) {
          if (banner) return
          if (x > hintBtn.x && x < hintBtn.x + hintBtn.w && y > hintBtn.y && y < hintBtn.y + hintBtn.h) return this.key('KeyH')
          const lx = x - SX
          const ly = y - SY
          if (lx < 0 || ly < 0 || lx > SW || ly > SH) return
          const tg = targets.find((q) => !q.found && Math.hypot(q.x - lx, q.y - ly) < q.s * 0.6 + 4)
          if (tg) {
            tg.found = true
            tg.ghost = 1
            env.sfx('point')
            hero = 1
            fx.burst(x, y, t.good, 16, 180, 3)
            const left = targets.filter((q) => !q.found).length
            hud(`${targets.length - left}/${targets.length}`)
            if (!left) levelDone(Math.max(60, targets.length * 80 - mistakes * 25 - Math.floor(time)), 'Found them all!')
          } else {
            mistakes++
            time += 2
            env.sfx('hit')
            flash(x, y, 'x', t.danger)
          }
        },
        key(code) {
          if (code === 'KeyH' && hints > 0) {
            const i = targets.findIndex((q) => !q.found)
            if (i >= 0) {
              hints--
              hintI = i
              hintT = 2.5
              mistakes++
              env.sfx('power')
            }
          }
        },
        update(dt) {
          hintT = Math.max(0, hintT - dt)
          for (const q of targets) q.ghost = Math.max(0, q.ghost - dt * 2)
          if (timing && !banner) {
            time += dt
            if (limit && time >= limit) finish(false, `Time up on level ${level}`)
          }
        },
        draw() {
          ctx.save()
          ctx.translate(SX, SY)
          ctx.beginPath()
          ctx.roundRect(0, 0, SW, SH, 12)
          ctx.clip()
          const g = ctx.createLinearGradient(0, 0, SW, SH)
          g.addColorStop(0, t.bg)
          g.addColorStop(1, t.bg2)
          ctx.fillStyle = g
          ctx.fillRect(0, 0, SW, SH)
          const rr = makeRng(env.seed + level)
          for (let i = 0; i < 18; i++) {
            ctx.globalAlpha = 0.1
            ctx.fillStyle = t.blocks[i % t.blocks.length]
            ctx.beginPath()
            ctx.arc(rr() * SW, rr() * SH, 20 + rr() * 50, 0, 7)
            ctx.fill()
          }
          ctx.globalAlpha = 1
          for (const o of clutter) emoji(ctx, o.e, o.x, o.y, o.s, o.rot)
          for (const q of targets) {
            emoji(ctx, q.e, q.x, q.y, q.s, q.rot)
            if (q.found) {
              ctx.strokeStyle = t.good
              ctx.lineWidth = 3
              ctx.shadowColor = t.good
              ctx.shadowBlur = 10
              ctx.beginPath()
              ctx.arc(q.x, q.y, q.s * 0.65 + q.ghost * 14, 0, 7)
              ctx.stroke()
              ctx.shadowBlur = 0
            }
          }
          if (hintT > 0 && hintI >= 0) {
            const q = targets[hintI]
            ctx.strokeStyle = t.accent2
            ctx.lineWidth = 3
            ctx.globalAlpha = Math.min(1, hintT)
            ctx.beginPath()
            ctx.arc(q.x, q.y, 36 + Math.sin(clock * 8) * 5, 0, 7)
            ctx.stroke()
            ctx.globalAlpha = 1
          }
          if (dark) {
            const lg = ctx.createRadialGradient(mx - SX, my - SY, 24, mx - SX, my - SY, 100)
            lg.addColorStop(0, 'rgba(0,0,0,0)')
            lg.addColorStop(1, 'rgba(0,0,0,0.95)')
            ctx.fillStyle = lg
            ctx.fillRect(0, 0, SW, SH)
          }
          ctx.restore()
          roundRect(ctx, SX, SY, SW, SH, 12, undefined, 'rgba(255,255,255,0.35)', 2)
          // list
          const low = limit && limit - time < 10
          const tm = limit ? fmt(Math.max(0, limit - time)) : fmt(time)
          if (portrait) {
            text(ctx, `LEVEL ${level}/${LEVELS}`, 15, 24, { size: 10, color: t.accent, align: 'left' })
            text(ctx, tm, W - 15, 24, { size: 12, color: low ? t.danger : t.fg, align: 'right' })
            text(ctx, 'FIND', 15, 48, { size: 9, color: t.fg, align: 'left' })
          } else {
            text(ctx, `LEVEL ${level}/${LEVELS}`, 545, 22, { size: 9, color: t.accent })
            text(ctx, tm, 545, 46, { size: 12, color: low ? t.danger : t.fg })
            text(ctx, 'FIND', 545, 74, { size: 9, color: t.fg })
          }
          const per = portrait ? 6 : 2
          targets.forEach((q, i) => {
            const x = portrait ? 38 + (i % per) * 64.5 : 505 + (i % per) * 62
            const y = portrait ? 500 + Math.floor(i / per) * 46 : 108 + Math.floor(i / per) * 46
            roundRect(ctx, x - 26, y - 21, 52, 42, 8, q.found ? 'rgba(80,200,120,0.35)' : 'rgba(0,0,0,0.25)')
            ctx.globalAlpha = q.found ? 0.35 : 1
            emoji(ctx, q.e, x, y, 28)
            ctx.globalAlpha = 1
            if (q.found) text(ctx, '✓', x, y, { size: 16, color: t.good })
          })
          roundRect(ctx, hintBtn.x, hintBtn.y, hintBtn.w, hintBtn.h, 10, hints ? t.accent : 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.3)', 1.5)
          text(ctx, `HINT (${hints})`, hintBtn.x + hintBtn.w / 2, hintBtn.y + hintBtn.h / 2, { size: 10, color: hints ? '#fff' : t.fg })
          if (portrait) heroDraw(50, 610, 44)
        },
      }
    }

    const M: M = mode === 'pairs' ? pairs() : mode === 'spot' ? spot() : mode === 'simon' ? simon() : hidden()
    st.canvas.style.touchAction = 'none'
    bag.on(st.canvas, 'contextmenu', (e) => e.preventDefault())
    bag.on(st.canvas, 'pointerdown', (e) => {
      st.canvas.focus({ preventScroll: true })
      const l = st.toLocal(e)
      mx = l.x
      my = l.y
      M.click(l.x, l.y, e.button)
    })
    bag.on(st.canvas, 'pointermove', (e) => {
      const l = st.toLocal(e)
      mx = l.x
      my = l.y
    })
    bag.on(window, 'keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault()
      M.key(e.code)
    })

    const update = (dt: number) => {
      clock += dt
      intro = Math.max(0, intro - dt)
      hero = Math.max(0, hero - dt * 3)
      fx.update(dt, 260)
      shake.update(dt)
      for (let i = flashes.length - 1; i >= 0; i--) {
        flashes[i].t += dt
        if (flashes[i].t > 0.9) flashes.splice(i, 1)
      }
      if (banner) {
        banner.t += dt
        if (advance > 0 && advance < 90) {
          advance -= dt
          if (advance <= 0) {
            banner = null
            advance = -1
            if (level >= LEVELS) finish(true, `All ${LEVELS} levels complete`)
            else {
              level++
              M.init()
            }
          }
        }
      }
      M.update(dt)
    }

    const draw = () => {
      background(ctx, W, H, t, 35, 3)
      ctx.save()
      shake.apply(ctx)
      M.draw()
      fx.draw(ctx)
      for (const f of flashes) text(ctx, f.s, f.x, f.y - f.t * 30, { size: 14, color: f.c, shadow: '#000' })
      ctx.restore()
      if (banner) {
        ctx.globalAlpha = Math.min(1, banner.t * 4)
        roundRect(ctx, W / 2 - 190, H / 2 - 34, 380, 68, 16, 'rgba(0,0,0,0.78)', t.good, 2)
        text(ctx, banner.s, W / 2, H / 2, { size: 16, color: '#fff', shadow: t.good })
        ctx.globalAlpha = 1
      }
      if (intro > 0) {
        ctx.globalAlpha = Math.min(1, intro)
        roundRect(ctx, W / 2 - 180, 160, 360, 62, 14, 'rgba(0,0,0,0.78)', t.accent, 2)
        text(ctx, env.name, W / 2, 182, { size: 13, color: '#fff' })
        text(ctx, env.desc.slice(0, 46), W / 2, 205, { size: 8, color: t.fg })
        ctx.globalAlpha = 1
      }
    }

    const lp = loop(update, draw)
    M.init()
    return {
      destroy() {
        lp.stop()
        bag.dispose()
        st.dispose()
      },
      pause(p) {
        lp.pause(p)
      },
    }
  },
}
export default engine
