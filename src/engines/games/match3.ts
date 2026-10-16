// Match-3: swap neighbours to line up three or more. Cascades, line/bomb/colour-bomb specials,
// score targets with move limits (or a countdown with the `timer` mod), jelly goals, hints and levels.
import { background, Bag, byDiff, createStage, emoji, keys, loop, Particles, roundRect, Shake, text, type Engine } from '../kit'
import { drop, findMoves, genBoard, planAfterSwap, planClear, reshuffle, SP, WILD, type Cell, type Grid, type Plan } from '../logic/match3'

let W = 640
let H = 400
const N = 8
const CS = 44
let BX = (W - N * CS) / 2
let BY = 22
const LEVELS = 6

interface Piece extends Cell { x: number; y: number; vy: number; dead: number; pop: number; seed: number }
type Phase = 'idle' | 'swap' | 'back' | 'clear' | 'fall' | 'win' | 'over'

const engine: Engine = {
  start(env) {
    const { theme: t, rng, mods } = env
    const r0 = env.host.getBoundingClientRect()
    const portrait = r0.height > r0.width * 1.05
    W = portrait ? 400 : 640
    H = portrait ? 640 : 400
    BX = (W - N * CS) / 2
    BY = portrait ? 118 : 22
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const k = keys()
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const kinds = byDiff(env, 5, 6, 6)
    const timerMode = mods.has('timer')
    const nameL = env.name.toLowerCase()
    const jellyMode = mods.has('ice') || /jelly|frost|coral|mosaic|cage/.test(nameL)
    const comboBoost = mods.has('combo') ? 1.5 : 1
    const tileCol = (kk: number) => t.blocks[kk % t.blocks.length]
    const sym = (kk: number) => t.items[kk % t.items.length]

    let g: Grid<Piece> = []
    let jelly: number[] = new Array(N * N).fill(0)
    let level = 1
    let total = 0
    let lvlScore = 0
    let target = 0
    let moves = 0
    let time = 0
    let phase: Phase = 'idle'
    let sel = -1
    let cur = 27
    let cascade = 0
    let idleT = 0
    let introT = 2.6
    let t0 = 0
    let msgT = 0
    let msg = ''
    let heroBounce = 0
    let phaseT = 0
    let pending: Plan | null = null
    let hint: [number, number] | undefined
    let lastSec = -1
    let last: [number, number] = [0, 0]
    const pops: { x: number; y: number; s: string; t: number; c: string }[] = []

    const mkPiece = (c: Cell, x: number, y: number): Piece => ({ k: c.k, s: c.s, x, y, vy: 0, dead: 0, pop: 0, seed: Math.random() * 6 })
    const randCell = (): Piece => mkPiece({ k: rng.int(0, kinds - 1), s: 0 }, 0, 0)
    const gx = (i: number) => i % N
    const gy = (i: number) => Math.floor(i / N)
    const cellPos = (i: number) => ({ x: BX + gx(i) * CS + CS / 2, y: BY + gy(i) * CS + CS / 2 })

    const say = (s: string) => {
      msg = s
      msgT = 1.3
    }
    const hud = () => {
      env.score(total)
      env.status(`Level ${level}/${LEVELS} · ${timerMode ? `${Math.ceil(time)}s` : `${moves} moves`}`)
    }
    const jellyLeft = () => jelly.reduce((a, b) => a + b, 0)

    const startLevel = () => {
      const base = genBoard(rng, N, kinds)
      g = base.map((c, i) => mkPiece(c, gx(i), -3 - gy(i) * 0.6 - Math.random() * 1.5))
      jelly = new Array(N * N).fill(0)
      if (jellyMode) {
        const cnt = Math.min(44, 14 + level * 5)
        const cells = rng.shuffle([...Array(N * N).keys()]).slice(0, cnt)
        for (const c of cells) jelly[c] = mods.has('ice') && level > 2 && rng.chance(0.3) ? 2 : 1
      }
      lvlScore = 0
      const dm = byDiff(env, 0.8, 1, 1.25)
      target = Math.round((900 + 450 * (level - 1)) * dm / 50) * 50
      moves = byDiff(env, 30, 26, 22) + Math.min(level - 1, 4)
      time = byDiff(env, 80, 65, 55) + Math.min(level - 1, 4) * 5
      if (jellyMode) moves += 6
      phase = 'fall'
      phaseT = 0
      sel = -1
      idleT = 0
      hint = undefined
      say(`Level ${level}`)
      hud()
    }

    const isSettled = () => {
      for (let i = 0; i < g.length; i++) {
        const p = g[i]
        if (!p) continue
        if (Math.abs(p.x - gx(i)) > 0.02 || Math.abs(p.y - gy(i)) > 0.02 || p.dead > 0) return false
      }
      return true
    }

    const finishGame = (won: boolean) => {
      if (phase === 'over') return
      phase = 'over'
      env.sfx(won ? 'win' : 'lose')
      env.end({ score: total, won, text: won ? `All ${LEVELS} levels cleared!` : `Reached level ${level}` })
    }

    const goalReached = () => (jellyMode ? jellyLeft() === 0 : lvlScore >= target)

    const endTurn = () => {
      cascade = 0
      if (goalReached()) {
        const bonus = timerMode ? Math.ceil(time) * 10 : moves * 40
        total += bonus
        lvlScore += bonus
        env.sfx('win')
        phase = 'win'
        phaseT = 0
        say(`Cleared! +${bonus}`)
        for (let i = 0; i < 40; i++) fx.burst(W / 2, H / 2, tileCol(i), 1, 320, 4)
        hud()
        return
      }
      if (!timerMode && moves <= 0) return finishGame(false)
      if (!findMoves(g, N).length) {
        reshuffle(g, N, rng, kinds)
        for (const p of g) if (p) p.pop = 1
        say('No moves: shuffle!')
        env.sfx('power')
      }
      phase = 'idle'
      idleT = 0
      hint = undefined
    }

    const startClear = (plan: Plan) => {
      cascade++
      const mult = cascade * comboBoost
      const gain = Math.round((plan.clear.length * 10 + plan.fired * 30 + plan.spawn.length * 20) * mult)
      total += gain
      lvlScore += gain
      if (timerMode && cascade > 1) time += 1
      let cx = 0
      let cy = 0
      for (const i of plan.clear) {
        const p = g[i]
        if (!p) continue
        p.dead = 0.001
        const pos = cellPos(i)
        cx += pos.x
        cy += pos.y
        fx.burst(pos.x, pos.y, p.s ? '#ffffff' : tileCol(p.k), p.s ? 14 : 7, 150, 3)
        if (jelly[i] > 0) {
          jelly[i]--
          if (jelly[i] === 0) fx.burst(pos.x, pos.y, t.accent2, 10, 120, 4)
        }
      }
      for (const sp of plan.spawn) {
        const p = g[sp.idx]!
        p.s = sp.s
        p.k = sp.s === SP.color ? WILD : p.k
        p.pop = 1
        const pos = cellPos(sp.idx)
        fx.burst(pos.x, pos.y, '#fff', 16, 200, 3)
      }
      const n = Math.max(1, plan.clear.length)
      pops.push({ x: cx / n, y: cy / n, s: `+${gain}${cascade > 1 ? ` x${cascade}` : ''}`, t: 0, c: cascade > 1 ? t.accent2 : '#fff' })
      if (plan.fired || plan.spawn.length) {
        env.sfx('boom')
        shake.kick(plan.fired ? 5 : 2)
        heroBounce = 1
      } else env.sfx(cascade > 1 ? 'power' : 'point')
      if (cascade >= 3) {
        heroBounce = 1
        say(['', '', '', 'Sweet!', 'Great!', 'Amazing!', 'Incredible!'][Math.min(cascade, 6)])
      }
      phase = 'clear'
      phaseT = 0
      hud()
    }

    const trySwap = (a: number, b: number) => {
      if (phase !== 'idle') return
      if (Math.abs(gx(a) - gx(b)) + Math.abs(gy(a) - gy(b)) !== 1) return
      const t0p = g[a]
      g[a] = g[b]
      g[b] = t0p
      last = [a, b]
      sel = -1
      idleT = 0
      hint = undefined
      phase = 'swap'
      phaseT = 0
      env.sfx('move')
      pending = planAfterSwap(g, N, a, b)
    }

    const afterSwap = () => {
      if (!pending) {
        const [a, b] = last
        const tmp = g[a]
        g[a] = g[b]
        g[b] = tmp
        phase = 'back'
        phaseT = 0
        env.sfx('hit')
        return
      }
      if (!timerMode) moves--
      cascade = 0
      const plan = pending
      pending = null
      startClear(plan)
    }

    const doFall = () => {
      drop(g, N, randCell, (idx, p, depth) => {
        p.x = gx(idx)
        p.y = -depth - Math.random() * 0.3
        p.vy = 2
      })
      phase = 'fall'
      phaseT = 0
    }

    // ----- input -----
    const cellAt = (e: PointerEvent) => {
      const l = st.toLocal(e)
      const cx = Math.floor((l.x - BX) / CS)
      const cy = Math.floor((l.y - BY) / CS)
      return { l, c: cx >= 0 && cy >= 0 && cx < N && cy < N ? cy * N + cx : -1 }
    }
    let startCell = -1
    let sx = 0
    let sy = 0
    let consumed = false
    st.canvas.style.touchAction = 'none'
    bag.on(st.canvas, 'pointerdown', (e) => {
      st.canvas.focus({ preventScroll: true })
      const { l, c } = cellAt(e)
      startCell = c
      sx = l.x
      sy = l.y
      consumed = false
      try { st.canvas.setPointerCapture(e.pointerId) } catch { /* ignore */ }
      if (c >= 0 && sel >= 0 && sel !== c && phase === 'idle') {
        if (Math.abs(gx(sel) - gx(c)) + Math.abs(gy(sel) - gy(c)) === 1) {
          trySwap(sel, c)
          consumed = true
        }
      }
    })
    bag.on(st.canvas, 'pointermove', (e) => {
      if (startCell < 0 || consumed || !(e.buttons & 1 || e.pointerType === 'touch')) return
      const l = st.toLocal(e)
      const dx = l.x - sx
      const dy = l.y - sy
      if (Math.max(Math.abs(dx), Math.abs(dy)) < CS * 0.45) return
      const nb = Math.abs(dx) > Math.abs(dy) ? startCell + (dx > 0 ? 1 : -1) : startCell + (dy > 0 ? N : -N)
      const horizOk = Math.abs(dx) > Math.abs(dy) ? Math.floor(nb / N) === gy(startCell) : nb >= 0 && nb < N * N
      consumed = true
      if (horizOk) trySwap(startCell, nb)
    })
    const up = () => {
      if (startCell >= 0 && !consumed && phase === 'idle') sel = sel === startCell ? -1 : startCell
      startCell = -1
    }
    bag.on(st.canvas, 'pointerup', up)
    bag.on(st.canvas, 'pointercancel', up)
    bag.on(st.canvas, 'contextmenu', (e) => e.preventDefault())
    k.onKey((e) => {
      if (phase !== 'idle') return
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], KeyA: [-1, 0], KeyD: [1, 0], KeyW: [0, -1], KeyS: [0, 1] }[e.code as string]
      if (d) {
        const nx = gx(cur) + d[0]
        const ny = gy(cur) + d[1]
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) return
        const nxt = ny * N + nx
        if (sel >= 0) {
          trySwap(sel, nxt === sel ? cur : nxt)
          cur = nxt
        } else cur = nxt
      } else if (e.code === 'Space' || e.code === 'Enter') sel = sel === cur ? -1 : cur
    })

    // ----- update -----
    const update = (dt: number) => {
      introT = Math.max(0, introT - dt)
      msgT = Math.max(0, msgT - dt)
      heroBounce = Math.max(0, heroBounce - dt * 2.5)
      t0 += dt
      fx.update(dt, 300)
      shake.update(dt)
      for (let i = pops.length - 1; i >= 0; i--) {
        pops[i].t += dt
        if (pops[i].t > 1) pops.splice(i, 1)
      }
      for (let i = 0; i < g.length; i++) {
        const p = g[i]
        if (!p) continue
        p.pop = Math.max(0, p.pop - dt * 4)
        if (p.dead > 0) {
          p.dead += dt * 5
          continue
        }
        const tx = gx(i)
        const ty = gy(i)
        p.x += (tx - p.x) * Math.min(1, dt * 18)
        if (p.y < ty - 0.001) {
          p.vy += 60 * dt
          p.y = Math.min(ty, p.y + p.vy * dt)
          if (p.y >= ty) {
            p.vy = 0
            p.pop = Math.max(p.pop, 0.25)
          }
        } else p.y += (ty - p.y) * Math.min(1, dt * 18)
      }
      phaseT += dt
      if (phase === 'swap' && isSettled() && phaseT > 0.1) afterSwap()
      else if (phase === 'back' && isSettled() && phaseT > 0.1) phase = 'idle'
      else if (phase === 'clear' && phaseT > 0.22) {
        g.forEach((p, i) => {
          if (p && p.dead >= 1) g[i] = null
        })
        doFall()
      } else if (phase === 'fall' && isSettled() && phaseT > 0.1) {
        const plan = planClear(g, N)
        if (plan) startClear(plan)
        else endTurn()
      } else if (phase === 'win' && phaseT > 2) {
        if (level >= LEVELS) finishGame(true)
        else {
          level++
          startLevel()
        }
      } else if (phase === 'idle') {
        idleT += dt
        if (idleT > 5 && !hint) hint = findMoves(g, N)[0]
        if (timerMode && time <= 0) finishGame(false)
      }
      if (timerMode && phase !== 'win' && phase !== 'over') {
        time = Math.max(phase === 'idle' ? 0 : 0.01, time - dt)
        if (Math.ceil(time) !== lastSec) {
          lastSec = Math.ceil(time)
          hud()
        }
      }
    }

    // ----- draw -----

    const drawPiece = (p: Piece, i: number) => {
      const px = BX + p.x * CS + CS / 2
      const py = BY + p.y * CS + CS / 2
      let sc = 1 + Math.sin(p.pop * Math.PI) * 0.25
      let alpha = 1
      if (p.dead > 0) {
        sc = Math.max(0, 1 - p.dead) * (1 + p.dead * 0.3)
        alpha = Math.max(0, 1 - p.dead)
      }
      if (hint && (i === hint[0] || i === hint[1])) sc += Math.sin(t0 * 9) * 0.1
      if (i === sel) sc += 0.12 + Math.sin(t0 * 8) * 0.04
      if (sc <= 0.01) return
      const s = (CS - 6) * sc
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(px, py)
      if (p.s === SP.color) {
        const g2 = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2)
        for (let c = 0; c <= 4; c++) g2.addColorStop(c / 4, `hsl(${(t0 * 120 + c * 70) % 360} 90% 60%)`)
        roundRect(ctx, -s / 2, -s / 2, s, s, 12, undefined)
        ctx.fillStyle = g2
        ctx.shadowColor = '#fff'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(0, 0, s / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        emoji(ctx, '✨', 0, 0, s * 0.55)
      } else {
        roundRect(ctx, -s / 2, -s / 2, s, s, 10, tileCol(p.k), 'rgba(255,255,255,0.35)', 1.5)
        ctx.fillStyle = 'rgba(255,255,255,0.18)'
        ctx.beginPath()
        ctx.roundRect(-s / 2 + 3, -s / 2 + 3, s - 6, s * 0.35, 6)
        ctx.fill()
        emoji(ctx, sym(p.k), 0, 1, s * 0.58)
        if (p.s) {
          ctx.shadowColor = '#fff'
          ctx.shadowBlur = 8 + Math.sin(t0 * 6) * 4
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2.5
          ctx.beginPath()
          ctx.roundRect(-s / 2 - 1, -s / 2 - 1, s + 2, s + 2, 11)
          ctx.stroke()
          ctx.shadowBlur = 0
          ctx.fillStyle = '#fff'
          if (p.s === SP.row || p.s === SP.col) {
            const v = p.s === SP.col
            for (const sgn of [-1, 1]) {
              ctx.beginPath()
              if (v) { ctx.moveTo(0, sgn * (s / 2 - 1)); ctx.lineTo(-6, sgn * (s / 2 - 8)); ctx.lineTo(6, sgn * (s / 2 - 8)) }
              else { ctx.moveTo(sgn * (s / 2 - 1), 0); ctx.lineTo(sgn * (s / 2 - 8), -6); ctx.lineTo(sgn * (s / 2 - 8), 6) }
              ctx.fill()
            }
          } else {
            emoji(ctx, '💥', s / 2 - 6, -s / 2 + 6, 14)
          }
        }
      }
      ctx.restore()
    }

    const draw = () => {
      background(ctx, W, H, t, 40, 7)
      ctx.save()
      shake.apply(ctx)
      // board backdrop
      roundRect(ctx, BX - 8, BY - 8, N * CS + 16, N * CS + 16, 14, 'rgba(0,0,0,0.28)', 'rgba(255,255,255,0.15)', 2)
      for (let i = 0; i < N * N; i++) {
        const c = cellPos(i)
        ctx.fillStyle = (gx(i) + gy(i)) % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'
        ctx.fillRect(c.x - CS / 2, c.y - CS / 2, CS, CS)
        if (jelly[i] > 0) {
          ctx.fillStyle = jelly[i] > 1 ? 'rgba(200,240,255,0.55)' : `${t.accent2}88`
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.roundRect(c.x - CS / 2 + 2, c.y - CS / 2 + 2, CS - 4, CS - 4, 8)
          ctx.fill()
          ctx.stroke()
        }
      }
      g.forEach((p, i) => p && drawPiece(p, i))
      // keyboard cursor
      if (phase === 'idle') {
        const c = cellPos(cur)
        ctx.strokeStyle = sel === cur ? '#fff' : t.accent
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.5 + Math.sin(t0 * 6) * 0.2
        ctx.strokeRect(c.x - CS / 2 + 1, c.y - CS / 2 + 1, CS - 2, CS - 2)
        ctx.globalAlpha = 1
      }
      fx.draw(ctx)
      for (const p of pops) text(ctx, p.s, p.x, p.y - p.t * 40, { size: 12, color: p.c, shadow: '#000' })
      ctx.restore()

      const low = timerMode ? time < 10 : moves <= 4
      const moveTxt = timerMode ? `${Math.max(0, Math.ceil(time))}` : `${moves}`
      const heroY = (portrait ? 560 : 290) - Math.sin(heroBounce * Math.PI) * 26
      if (portrait) {
        text(ctx, `LEVEL ${level}`, 24, 24, { size: 11, color: t.accent, align: 'left' })
        text(ctx, `SCORE ${total}`, W - 24, 24, { size: 11, color: t.fg, align: 'right' })
        text(ctx, timerMode ? 'TIME' : 'MOVES', W / 2, 52, { size: 9, color: t.accent })
        text(ctx, moveTxt, W / 2, 82, { size: 28, color: low ? t.danger : t.fg })
        if (jellyMode) text(ctx, `JELLY ${jellyLeft()}`, W - 24, 70, { size: 11, color: t.accent2, align: 'right' })
        else {
          text(ctx, `${Math.min(lvlScore, target)}/${target}`, 24, 62, { size: 10, color: t.accent2, align: 'left' })
          roundRect(ctx, 24, 78, 100, 12, 6, 'rgba(0,0,0,0.4)')
          roundRect(ctx, 24, 78, 100 * Math.min(1, lvlScore / target), 12, 6, t.accent)
        }
        emoji(ctx, t.hero, W / 2, heroY, 62)
        text(ctx, jellyMode ? 'Clear the jelly' : 'Match 3+ to hit the target', W / 2, 610, { size: 9, color: t.fg })
      } else {
        text(ctx, `LEVEL ${level}`, 78, 40, { size: 12, color: t.accent })
        if (jellyMode) {
          text(ctx, 'JELLY', 78, 90, { size: 10, color: t.fg })
          text(ctx, `${jellyLeft()}`, 78, 118, { size: 24, color: t.accent2 })
        } else {
          text(ctx, 'TARGET', 78, 90, { size: 10, color: t.fg })
          text(ctx, `${Math.min(lvlScore, target)}/${target}`, 78, 112, { size: 11, color: t.accent2 })
          roundRect(ctx, 22, 128, 112, 12, 6, 'rgba(0,0,0,0.4)')
          roundRect(ctx, 22, 128, 112 * Math.min(1, lvlScore / target), 12, 6, t.accent)
        }
        text(ctx, 'SCORE', 78, 190, { size: 10, color: t.fg })
        text(ctx, `${total}`, 78, 214, { size: 16, color: t.fg })
        text(ctx, timerMode ? 'TIME' : 'MOVES', 562, 40, { size: 12, color: t.accent })
        text(ctx, moveTxt, 562, 84, { size: 36, color: low ? t.danger : t.fg })
        emoji(ctx, t.hero, 562, heroY, 62)
        text(ctx, jellyMode ? 'Clear the jelly' : 'Match 3+', 562, 352, { size: 8, color: t.fg })
      }
      if (introT > 0) {
        ctx.globalAlpha = Math.min(1, introT)
        roundRect(ctx, W / 2 - 170, H / 2 - 50, 340, 90, 14, 'rgba(0,0,0,0.75)', t.accent, 2)
        text(ctx, env.name, W / 2, H / 2 - 20, { size: 14, color: '#fff' })
        text(ctx, 'Swap neighbours · match 3+', W / 2, H / 2 + 4, { size: 9, color: t.fg })
        text(ctx, '4 = line · 5 = rainbow · L/T = bomb', W / 2, H / 2 + 24, { size: 8, color: t.accent2 })
        ctx.globalAlpha = 1
      }
      if (msgT > 0 && introT <= 0) {
        ctx.globalAlpha = Math.min(1, msgT * 2)
        text(ctx, msg, W / 2, H / 2, { size: 20, color: '#fff', shadow: t.accent })
        ctx.globalAlpha = 1
      }
    }

    const lp = loop(update, draw)
    startLevel()
    return {
      destroy() {
        lp.stop()
        bag.dispose()
        k.dispose()
        st.dispose()
      },
      pause(p) {
        lp.pause(p)
      },
    }
  },
}
export default engine
