// Slide: sliding / rotating tile puzzles. Modes: 15-puzzle (numbers or picture), pipes (rotate tiles to power the network),
// jigsaw (swap tiles), twist (rotate 2x2 blocks) and roll (shift rows / columns).
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, makeRng, Particles, roundRect, text, type Engine, type GameEnv } from '../kit'
import { E_, genPipes, isSolved, N_, optimalPipeMoves, powered, rotMask, roll, S_, scramblePipes, shuffleRoll, shuffleSlide, shuffleSwap, shuffleTwist, slideTo, twist, W_, bitsOf, type Perm, type Pipes } from '../logic/slide'

let W = 640
let H = 400
const BS = 340
let BX = (W - BS) / 2
let BY = 32

type Mode = 'slide' | 'pipes' | 'jigsaw' | 'twist' | 'roll'

function pickMode(env: GameEnv): Mode {
  const s = `${env.name} ${env.desc}`.toLowerCase()
  const m = env.mods
  if (m.has('jigsaw') || /jigsaw|torn|puzzle relay/.test(s)) return 'jigsaw'
  if (/turnstile|swirl|quadrant|pivot|2x2/.test(s)) return 'twist'
  if (/roller|belt|torus|carousel|cyclic|\brows?\b/.test(s) || m.has('wrap')) return 'roll'
  if (m.has('rotate') || m.has('pipe') || /pipe|path|blackout|spinner|vine|rotor|ring|dial|plumber|rotate|pinwheel|gear/.test(s)) return 'pipes'
  return 'slide'
}

/** Procedural themed picture used for picture tiles. */
function makePicture(env: GameEnv, rng: ReturnType<typeof makeRng>, S: number): HTMLCanvasElement {
  const t = env.theme
  const c = document.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d')!
  const sky = g.createLinearGradient(0, 0, 0, S)
  sky.addColorStop(0, t.bg)
  sky.addColorStop(0.7, t.bg2)
  sky.addColorStop(1, t.accent)
  g.fillStyle = sky
  g.fillRect(0, 0, S, S)
  g.fillStyle = t.fg
  for (let i = 0; i < 40; i++) {
    g.globalAlpha = 0.1 + rng() * 0.4
    g.beginPath()
    g.arc(rng() * S, rng() * S * 0.6, 1 + rng() * 2.5, 0, 7)
    g.fill()
  }
  g.globalAlpha = 1
  const sx = rng.range(S * 0.2, S * 0.8)
  const glow = g.createRadialGradient(sx, S * 0.25, 4, sx, S * 0.25, S * 0.28)
  glow.addColorStop(0, t.accent2)
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = glow
  g.fillRect(0, 0, S, S)
  g.fillStyle = t.accent2
  g.beginPath()
  g.arc(sx, S * 0.25, S * 0.07, 0, 7)
  g.fill()
  for (let l = 0; l < 3; l++) {
    g.fillStyle = t.blocks[(l + rng.int(0, 3)) % t.blocks.length]
    g.globalAlpha = 0.45 + l * 0.2
    g.beginPath()
    g.moveTo(0, S)
    const base = S * (0.55 + l * 0.12)
    for (let x = 0; x <= S; x += S / 8) g.lineTo(x, base - rng() * S * 0.12)
    g.lineTo(S, S)
    g.fill()
  }
  g.globalAlpha = 1
  for (let i = 0; i < 16; i++) emoji(g, rng.pick(t.items), rng.range(S * 0.06, S * 0.94), rng.range(S * 0.08, S * 0.92), rng.range(S * 0.07, S * 0.14), rng.range(-0.4, 0.4))
  for (let i = 0; i < 3; i++) emoji(g, rng.pick(t.foes), rng.range(S * 0.1, S * 0.9), rng.range(S * 0.6, S * 0.9), S * 0.1)
  emoji(g, t.hero, S * 0.5, S * 0.62, S * 0.34)
  return c
}

const engine: Engine = {
  start(env) {
    const { theme: t, rng } = env
    const r0 = env.host.getBoundingClientRect()
    const portrait = r0.height > r0.width * 1.05
    W = portrait ? 400 : 640
    H = portrait ? 640 : 400
    BX = (W - BS) / 2
    BY = portrait ? 96 : 32
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const bag = new Bag()
    const k = keys()
    const fx = new Particles()
    const mode = pickMode(env)
    const nm = env.name.toLowerCase()
    const picture = mode === 'jigsaw' || mode === 'roll' || /snapshot|photo|picture|image|mosaic|map|rotor|cube|garage|relay/.test(nm)
    const LEVELS = mode === 'pipes' ? 4 : 3

    let level = 1
    let n = 3
    let moves = 0
    let time = 0
    let started = false
    let solved = false
    let solvedT = 0
    let total = 0
    let ended = false
    let intro = 3
    let clock = 0
    let hero = 0
    let flash = ''
    let flashT = 0
    let par = 0
    let pic: HTMLCanvasElement | null = null
    let cx = 0
    let cy = 0

    // tile-grid state
    let perm: Perm = []
    let tx: number[] = []
    let ty: number[] = []
    let selected = -1
    let drag: { id: number; ox: number; oy: number; x: number; y: number; moved: boolean; from: number } | null = null
    // pipes state
    let pipes: Pipes = { n: 0, masks: [], src: 0 }
    let masks: number[] = []
    let ang: number[] = []
    let dist: number[] = []
    let pwrT = 0

    const cs = () => BS / n
    const blankId = () => n * n - 1

    const hud = () => {
      env.score(total)
      env.status(`Level ${level}/${LEVELS} · ${moves} moves · ${Math.floor(time)}s`)
    }

    const newLevel = () => {
      moves = 0
      time = 0
      started = false
      solved = false
      selected = -1
      cx = cy = 0
      pic = picture ? makePicture(env, makeRng(env.seed + level * 977), 480) : null
      const lv = level
      if (mode === 'pipes') {
        n = byDiff(env, 4, 5, 6) + (lv >= 3 ? 1 : 0)
        pipes = genPipes(n, rng)
        masks = scramblePipes(pipes, rng)
        ang = masks.map(() => 0)
        par = optimalPipeMoves(pipes.masks, masks)
        dist = powered(masks, n, pipes.src)
        pwrT = 99
        cx = cy = Math.floor(n / 2)
      } else {
        if (mode === 'slide') n = byDiff(env, 3, 4, 5) + (lv >= 3 ? 1 : 0)
        else if (mode === 'jigsaw') n = byDiff(env, 3, 4, 5) + (lv >= 3 ? 1 : 0)
        else n = byDiff(env, 3, 4, 4) + (lv >= 3 && env.difficulty > 0 ? 1 : 0)
        const steps = byDiff(env, 6, 10, 14) + lv * 3
        perm =
          mode === 'slide' ? shuffleSlide(n, rng, n * n * byDiff(env, 6, 10, 14) + lv * 10)
          : mode === 'jigsaw' ? shuffleSwap(n, rng)
          : mode === 'twist' ? shuffleTwist(n, rng, steps)
          : shuffleRoll(n, rng, steps)
        tx = []
        ty = []
        perm.forEach((id, cell) => {
          tx[id] = (cell % n) + (Math.random() - 0.5) * 2
          ty[id] = Math.floor(cell / n) - 6 - Math.random() * 3
        })
      }
      intro = Math.max(intro, 0)
      hud()
    }

    const cellOf = (id: number) => perm.indexOf(id)

    // ----- progress -----
    const checkWin = () => {
      const ok = mode === 'pipes' ? dist.every((d) => d >= 0) : isSolved(perm)
      if (!ok || solved) return
      solved = true
      solvedT = 0
      const gain = Math.max(100 * level, n * n * 60 + (mode === 'pipes' ? 200 : 0) - moves * 3 - Math.floor(time))
      total += gain
      flash = `Solved! +${gain}`
      flashT = 2
      env.sfx('win')
      for (let i = 0; i < 50; i++) fx.burst(W / 2, H / 2, t.blocks[i % t.blocks.length], 1, 360, 4)
      hud()
    }

    const finish = () => {
      if (ended) return
      ended = true
      env.end({ score: total, won: true, text: `All ${LEVELS} levels solved` })
    }

    const countMove = () => {
      moves++
      started = true
      hero = 1
      hud()
    }

    // ----- actions -----
    const doSlide = (cell: number) => {
      if (solved) return
      const moved = slideTo(perm, n, cell)
      if (!moved.length) {
        env.sfx('hit')
        return
      }
      env.sfx('move')
      countMove()
      checkWin()
    }
    const doSwap = (a: number, b: number) => {
      if (a === b || solved) return
      ;[perm[a], perm[b]] = [perm[b], perm[a]]
      env.sfx('move')
      countMove()
      checkWin()
    }
    const doTwist = (x: number, y: number, cw: boolean) => {
      if (solved) return
      twist(perm, n, clamp(x, 0, n - 2), clamp(y, 0, n - 2), cw)
      env.sfx('move')
      countMove()
      checkWin()
    }
    const doRoll = (row: boolean, idx: number, dir: 1 | -1) => {
      if (solved) return
      roll(perm, n, row, idx, dir)
      // wrap-around tile enters from the opposite side
      for (let i = 0; i < n; i++) {
        const cell = row ? idx * n + i : i * n + idx
        const id = perm[cell]
        if (row) {
          if (dir === 1 && i === 0) tx[id] = -1
          if (dir === -1 && i === n - 1) tx[id] = n
        } else {
          if (dir === 1 && i === 0) ty[id] = -1
          if (dir === -1 && i === n - 1) ty[id] = n
        }
      }
      env.sfx('move')
      countMove()
      checkWin()
    }
    const doRotate = (cell: number, cw: boolean) => {
      if (solved) return
      masks[cell] = cw ? rotMask(masks[cell]) : rotMask(rotMask(rotMask(masks[cell])))
      ang[cell] = cw ? -Math.PI / 2 : Math.PI / 2
      dist = powered(masks, n, pipes.src)
      pwrT = 0
      env.sfx('click')
      countMove()
      checkWin()
    }

    // ----- input -----
    const toCell = (l: { x: number; y: number }) => {
      const fx2 = (l.x - BX) / cs()
      const fy2 = (l.y - BY) / cs()
      return { fx: fx2, fy: fy2, x: Math.floor(fx2), y: Math.floor(fy2) }
    }
    const inBoard = (c: { x: number; y: number }) => c.x >= 0 && c.y >= 0 && c.x < n && c.y < n
    let down: { l: { x: number; y: number }; cell: number } | null = null
    st.canvas.style.touchAction = 'none'
    bag.on(st.canvas, 'contextmenu', (e) => e.preventDefault())
    bag.on(st.canvas, 'pointerdown', (e) => {
      st.canvas.focus({ preventScroll: true })
      if (solved) return
      const l = st.toLocal(e)
      const c = toCell(l)
      try { st.canvas.setPointerCapture(e.pointerId) } catch { /* ignore */ }
      const right = e.button === 2
      if (mode === 'roll') {
        // arrow buttons around the board
        if (c.y >= 0 && c.y < n && (c.x === -1 || c.x === n)) return void doRoll(true, c.y, c.x === -1 ? -1 : 1)
        if (c.x >= 0 && c.x < n && ((l.y < BY && l.y > BY - 30) || (l.y > BY + BS && l.y < BY + BS + 30))) return void doRoll(false, c.x, l.y < BY ? -1 : 1)
      }
      if (!inBoard(c)) return
      const cell = c.y * n + c.x
      down = { l, cell }
      if (mode === 'slide') doSlide(cell)
      else if (mode === 'pipes') doRotate(cell, !right)
      else if (mode === 'twist') doTwist(Math.round(c.fx) - 1, Math.round(c.fy) - 1, !right)
      else if (mode === 'jigsaw') {
        if (selected >= 0 && selected !== cell) {
          doSwap(selected, cell)
          selected = -1
          down = null
        } else {
          const id = perm[cell]
          drag = { id, ox: l.x - (BX + tx[id] * cs()), oy: l.y - (BY + ty[id] * cs()), x: l.x, y: l.y, moved: false, from: cell }
        }
      }
    })
    bag.on(st.canvas, 'pointermove', (e) => {
      const l = st.toLocal(e)
      if (drag) {
        if (Math.hypot(l.x - down!.l.x, l.y - down!.l.y) > 6) drag.moved = true
        drag.x = l.x
        drag.y = l.y
      }
    })
    const up = (e: PointerEvent) => {
      const l = st.toLocal(e)
      if (drag) {
        const c = toCell(l)
        if (drag.moved && inBoard(c)) doSwap(drag.from, c.y * n + c.x)
        else if (!drag.moved) selected = selected === drag.from ? -1 : drag.from
        drag = null
      } else if (mode === 'roll' && down) {
        const dx = l.x - down.l.x
        const dy = l.y - down.l.y
        if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) {
          const x = down.cell % n
          const y = Math.floor(down.cell / n)
          if (Math.abs(dx) > Math.abs(dy)) doRoll(true, y, dx > 0 ? 1 : -1)
          else doRoll(false, x, dy > 0 ? 1 : -1)
        }
      }
      down = null
    }
    bag.on(st.canvas, 'pointerup', up)
    bag.on(st.canvas, 'pointercancel', up)

    k.onKey((e) => {
      if (solved) return
      const dirs: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], KeyA: [-1, 0], KeyD: [1, 0], KeyW: [0, -1], KeyS: [0, 1] }
      const d = dirs[e.code]
      const act = e.code === 'Space' || e.code === 'Enter'
      const act2 = e.code === 'ShiftLeft' || e.code === 'KeyZ' || e.code === 'KeyX'
      if (mode === 'slide' && d) {
        // the tile on the far side of the blank slides in the arrow direction
        const b = cellOf(blankId())
        const bx = b % n - d[0]
        const by = Math.floor(b / n) - d[1]
        if (bx >= 0 && by >= 0 && bx < n && by < n) doSlide(by * n + bx)
        return
      }
      const lim = mode === 'twist' ? n - 2 : n - 1
      if (d) {
        if (mode === 'roll' && e.shiftKey) {
          if (d[0]) doRoll(true, cy, d[0] as 1 | -1)
          else doRoll(false, cx, d[1] as 1 | -1)
        } else {
          cx = clamp(cx + d[0], 0, lim)
          cy = clamp(cy + d[1], 0, lim)
        }
      } else if (act || act2) {
        if (mode === 'pipes') doRotate(cy * n + cx, !act2)
        else if (mode === 'twist') doTwist(cx, cy, !act2)
        else if (mode === 'jigsaw') {
          const cell = cy * n + cx
          if (selected < 0) selected = cell
          else {
            doSwap(selected, cell)
            selected = -1
          }
        }
      }
    })

    // ----- update -----
    const update = (dt: number) => {
      clock += dt
      intro = Math.max(0, intro - dt)
      flashT = Math.max(0, flashT - dt)
      hero = Math.max(0, hero - dt * 3)
      fx.update(dt, 280)
      if (started && !solved) {
        const s0 = Math.floor(time)
        time += dt
        if (Math.floor(time) !== s0) hud()
      }
      if (mode === 'pipes') {
        pwrT += dt
        for (let i = 0; i < ang.length; i++) ang[i] += (0 - ang[i]) * Math.min(1, dt * 16)
      } else {
        const e = Math.min(1, dt * 14)
        perm.forEach((id, cell) => {
          if (drag && drag.id === id) return
          tx[id] += ((cell % n) - tx[id]) * e
          ty[id] += (Math.floor(cell / n) - ty[id]) * e
        })
      }
      if (solved) {
        solvedT += dt
        if (solvedT > 2.4) {
          if (level >= LEVELS) finish()
          else {
            level++
            newLevel()
          }
        }
      }
    }

    // ----- draw -----
    const tileFill = (id: number) => {
      const hx = id % n
      const hy = Math.floor(id / n)
      return t.blocks[(hx + hy) % t.blocks.length]
    }
    const drawTile = (id: number, x: number, y: number, cell: number, lift = 0) => {
      const c = cs()
      const px = BX + x * c
      const py = BY + y * c
      const hx = id % n
      const hy = Math.floor(id / n)
      const home = cell === id
      ctx.save()
      if (lift) {
        ctx.shadowColor = '#000'
        ctx.shadowBlur = 14
      }
      const inset = 2 + lift
      ctx.beginPath()
      ctx.roundRect(px + inset, py + inset, c - inset * 2, c - inset * 2, Math.min(10, c * 0.15))
      if (picture && pic) {
        ctx.clip()
        const ps = pic.width / n
        ctx.drawImage(pic, hx * ps, hy * ps, ps, ps, px + inset - 1, py + inset - 1, c - inset * 2 + 2, c - inset * 2 + 2)
        ctx.restore()
        ctx.save()
      } else {
        const gr = ctx.createLinearGradient(px, py, px + c, py + c)
        gr.addColorStop(0, tileFill(id))
        gr.addColorStop(1, t.bg2)
        ctx.fillStyle = gr
        ctx.fill()
      }
      ctx.restore()
      roundRect(ctx, px + inset, py + inset, c - inset * 2, c - inset * 2, Math.min(10, c * 0.15), undefined, home && mode !== 'slide' ? t.good : 'rgba(255,255,255,0.35)', home && mode !== 'slide' ? 3 : 1.5)
      if (!picture || (mode === 'slide' && env.difficulty < 2 && picture)) {
        text(ctx, `${id + 1}`, picture ? px + 12 : px + c / 2, picture ? py + 12 : py + c / 2, { size: picture ? 9 : Math.max(12, c * 0.34), color: '#fff', shadow: '#000' })
      }
      if (!picture) emoji(ctx, t.items[id % t.items.length], px + c - c * 0.2, py + c - c * 0.2, c * 0.2)
      if (cell === selected) roundRect(ctx, px + 1, py + 1, c - 2, c - 2, 10, undefined, '#fff', 3)
    }

    const drawPipes = () => {
      const c = cs()
      for (let i = 0; i < n * n; i++) {
        const x = i % n
        const y = Math.floor(i / n)
        const px = BX + x * c
        const py = BY + y * c
        roundRect(ctx, px + 1.5, py + 1.5, c - 3, c - 3, 8, 'rgba(0,0,0,0.35)', 'rgba(255,255,255,0.1)', 1)
        const lit = dist[i] >= 0 && pwrT >= dist[i] * 0.045
        ctx.save()
        ctx.translate(px + c / 2, py + c / 2)
        ctx.rotate(ang[i])
        const m = masks[i]
        const hw = c * 0.13
        const draw = (col: string, w: number) => {
          ctx.strokeStyle = col
          ctx.lineWidth = w
          ctx.lineCap = 'round'
          ctx.beginPath()
          for (const [bit, dx, dy] of [[N_, 0, -1], [E_, 1, 0], [S_, 0, 1], [W_, -1, 0]] as const) {
            if (m & bit) {
              ctx.moveTo(0, 0)
              ctx.lineTo(dx * c / 2, dy * c / 2)
            }
          }
          ctx.stroke()
        }
        draw('rgba(0,0,0,0.6)', hw * 2 + 5)
        if (lit) {
          ctx.shadowColor = t.accent
          ctx.shadowBlur = 12
        }
        draw(lit ? t.accent : '#7b8794', hw * 2)
        ctx.shadowBlur = 0
        draw(lit ? '#fff' : '#a8b3bf', hw * 0.7)
        ctx.restore()
        if (i === pipes.src) {
          ctx.fillStyle = t.accent2
          ctx.beginPath()
          ctx.arc(px + c / 2, py + c / 2, c * 0.32, 0, 7)
          ctx.fill()
          emoji(ctx, t.hero, px + c / 2, py + c / 2, c * 0.46)
        } else if (bitsOf(m) === 1) {
          ctx.globalAlpha = lit ? 1 : 0.4
          if (lit) {
            ctx.fillStyle = `${t.accent2}66`
            ctx.beginPath()
            ctx.arc(px + c / 2, py + c / 2, c * 0.36 + Math.sin(clock * 5 + i) * 2, 0, 7)
            ctx.fill()
          }
          emoji(ctx, t.items[i % t.items.length], px + c / 2, py + c / 2, c * 0.46)
          ctx.globalAlpha = 1
        }
      }
      const cc = { x: BX + cx * c, y: BY + cy * c }
      roundRect(ctx, cc.x + 1, cc.y + 1, c - 2, c - 2, 8, undefined, `rgba(255,255,255,${0.35 + Math.sin(clock * 6) * 0.15})`, 2)
    }

    const drawTiles = () => {
      const c = cs()
      roundRect(ctx, BX - 4, BY - 4, BS + 8, BS + 8, 12, 'rgba(0,0,0,0.35)', 'rgba(255,255,255,0.2)', 2)
      ctx.save()
      ctx.beginPath()
      ctx.rect(BX - 2, BY - 2, BS + 4, BS + 4)
      ctx.clip()
      const b = mode === 'slide' ? blankId() : -1
      // slots
      for (let i = 0; i < n * n; i++) roundRect(ctx, BX + (i % n) * c + 2, BY + Math.floor(i / n) * c + 2, c - 4, c - 4, 8, 'rgba(255,255,255,0.05)')
      perm.forEach((id, cell) => {
        if (id === b && !solved) return
        if (drag && drag.id === id) return
        drawTile(id, tx[id], ty[id], cell)
      })
      if (mode === 'slide' && !solved) {
        emoji(ctx, t.hero, BX + (tx[b] + 0.5) * c, BY + (ty[b] + 0.5) * c - hero * 6, c * 0.5)
      }
      if (drag) drawTile(drag.id, (drag.x - drag.ox - BX) / c, (drag.y - drag.oy - BY) / c, -1, 4)
      ctx.restore()
      if (mode === 'roll') {
        ctx.fillStyle = t.accent
        for (let i = 0; i < n; i++) {
          const m = BS / n
          const yy = BY + i * m + m / 2
          const xx = BX + i * m + m / 2
          for (const [x, y, a] of [[BX - 12, yy, Math.PI], [BX + BS + 12, yy, 0], [xx, BY - 12, -Math.PI / 2], [xx, BY + BS + 12, Math.PI / 2]] as const) {
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(a)
            ctx.globalAlpha = 0.8
            ctx.beginPath()
            ctx.moveTo(6, 0)
            ctx.lineTo(-5, -7)
            ctx.lineTo(-5, 7)
            ctx.fill()
            ctx.restore()
          }
        }
        ctx.globalAlpha = 1
      }
      if (mode === 'twist' || mode === 'jigsaw' || mode === 'roll') {
        const cc = mode === 'twist' ? { x: BX + (cx + 1) * c, y: BY + (cy + 1) * c, r: c * 0.2 } : null
        if (cc) {
          ctx.strokeStyle = '#fff'
          ctx.globalAlpha = 0.5 + Math.sin(clock * 5) * 0.2
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(cc.x, cc.y, cc.r, 0, 7)
          ctx.stroke()
          ctx.globalAlpha = 1
        } else if (mode === 'jigsaw') roundRect(ctx, BX + cx * c + 1, BY + cy * c + 1, c - 2, c - 2, 8, undefined, `rgba(255,255,255,${0.2 + Math.sin(clock * 6) * 0.1})`, 2)
      }
    }

    const draw = () => {
      background(ctx, W, H, t, 35, 11)
      if (mode === 'pipes') drawPipes()
      else drawTiles()
      fx.draw(ctx)
      // panels
      const showPic = picture && pic && mode !== 'pipes'
      const left = dist.filter((d) => d < 0).length
      if (portrait) {
        text(ctx, `LEVEL ${level}/${LEVELS}`, 20, 22, { size: 10, color: t.accent, align: 'left' })
        text(ctx, `SCORE ${total}`, W - 20, 22, { size: 10, color: t.fg, align: 'right' })
        text(ctx, `MOVES ${moves}`, 20, 54, { size: 11, color: t.fg, align: 'left' })
        text(ctx, `${Math.floor(time)}s`, W - 20, 54, { size: 11, color: t.fg, align: 'right' })
        if (mode === 'pipes') text(ctx, `PAR ${par} · DARK ${left}`, W / 2, 78, { size: 9, color: t.accent2 })
        const py = BY + BS + 50
        if (showPic) {
          roundRect(ctx, W / 2 - 60, py, 120, 120, 8, 'rgba(0,0,0,0.4)', 'rgba(255,255,255,0.3)', 1.5)
          ctx.drawImage(pic!, W / 2 - 56, py + 4, 112, 112)
          text(ctx, 'GOAL', W / 2 - 100, py + 60, { size: 8, color: t.fg })
          emoji(ctx, t.hero, W / 2 + 104, py + 60 - Math.sin(hero * Math.PI) * 14, 44)
        } else emoji(ctx, t.hero, W / 2, py + 50 - Math.sin(hero * Math.PI) * 14, 54)
      } else {
        text(ctx, `LEVEL ${level}/${LEVELS}`, 78, 44, { size: 11, color: t.accent })
        text(ctx, 'MOVES', 78, 100, { size: 9, color: t.fg })
        text(ctx, `${moves}`, 78, 126, { size: 22, color: t.fg })
        text(ctx, 'TIME', 78, 176, { size: 9, color: t.fg })
        text(ctx, `${Math.floor(time)}s`, 78, 200, { size: 16, color: t.fg })
        if (mode === 'pipes') {
          text(ctx, 'PAR', 78, 248, { size: 9, color: t.fg })
          text(ctx, `${par}`, 78, 270, { size: 14, color: t.accent2 })
        }
        text(ctx, 'SCORE', 562, 44, { size: 10, color: t.accent })
        text(ctx, `${total}`, 562, 70, { size: 16, color: t.fg })
        if (showPic) {
          roundRect(ctx, 506, 120, 112, 112, 8, 'rgba(0,0,0,0.4)', 'rgba(255,255,255,0.3)', 1.5)
          ctx.drawImage(pic!, 510, 124, 104, 104)
          text(ctx, 'GOAL', 562, 250, { size: 9, color: t.fg })
        } else if (mode === 'pipes') {
          text(ctx, 'DARK', 562, 140, { size: 9, color: t.fg })
          text(ctx, `${left}`, 562, 170, { size: 22, color: left ? t.danger : t.good })
        }
        emoji(ctx, t.hero, 562, 320 - Math.sin(hero * Math.PI) * 14, 48)
      }
      const hints: Record<Mode, string> = {
        slide: 'Click tiles or use arrows · order 1..n',
        pipes: 'Tap to rotate (right-click: back) · light all',
        jigsaw: 'Click two tiles (or drag) to swap',
        twist: 'Click a corner point to rotate 2x2',
        roll: 'Drag or use arrows to shift rows & columns',
      }
      text(ctx, hints[mode], W / 2, H - 14, { size: portrait ? 7 : 8, color: t.fg })
      if (flashT > 0) {
        ctx.globalAlpha = Math.min(1, flashT * 2)
        roundRect(ctx, W / 2 - 150, H / 2 - 30, 300, 60, 14, 'rgba(0,0,0,0.7)', t.good, 2)
        text(ctx, flash, W / 2, H / 2, { size: 20, color: '#fff', shadow: t.good })
        ctx.globalAlpha = 1
      }
      if (intro > 0) {
        ctx.globalAlpha = Math.min(1, intro)
        roundRect(ctx, W / 2 - 170, H / 2 - 30, 340, 60, 14, 'rgba(0,0,0,0.78)', t.accent, 2)
        text(ctx, env.name, W / 2, H / 2 - 8, { size: 13, color: '#fff' })
        text(ctx, env.desc.slice(0, 44), W / 2, H / 2 + 14, { size: 8, color: t.fg })
        ctx.globalAlpha = 1
      }
    }

    const lp = loop(update, draw)
    newLevel()
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
