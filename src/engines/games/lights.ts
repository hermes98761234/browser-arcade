// Lights: toggle puzzles. Lights Out, Flood-It (`flood`), hue sort (`color` / hue names), laser mirrors (`laser`/beam names)
// and symmetry completion (`mirror`/symmetry names). All modes: levels, move counter, timer, hint button, touch friendly.
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, roundRect, Shake, text, type Engine, type GameEnv } from '../kit'
import {
  floodMove, genFlood, genLaser, genLights, genSymmetry, greedyFlood, hueGradient, isFlooded, lasersolved, minSwaps, partners, press, shuffleHue, symmetric, trace,
  type LaserLevel, type Sym,
} from '../logic/lights'

type Mode = 'lights' | 'flood' | 'hue' | 'laser' | 'symmetry'

function pickMode(env: GameEnv): Mode {
  const s = `${env.name} ${env.desc}`.toLowerCase()
  const m = env.mods
  if (m.has('flood') || /flood/.test(s)) return 'flood'
  if (m.has('laser') || /beam|mirrors|prism|refract|periscope|lens|solar|moonbeam|reflect sun|laser/.test(s)) return 'laser'
  if (/hue|gradient|spectrum|shade|tone tiles|rainbow|palette|swatch|chroma|tint|color wheel|opposite|dye|ink|stained/.test(s) || (m.has('color') && !m.has('mirror'))) return 'hue'
  if (m.has('mirror') || /symmetr|mirror|reflect|fold|axis|snowflake|kaleido|inkblot|tessellat|flip grid|twin|echo|paper/.test(s)) return 'symmetry'
  return 'lights'
}

let W = 640
let H = 400

interface Btn { label: string; color?: string; w: number; h: number; fn: () => void; on?: () => boolean; x: number; y: number }

const engine: Engine = {
  start(env) {
    const { theme: t, rng } = env
    const r0 = env.host.getBoundingClientRect()
    const portrait = r0.height > r0.width * 1.05
    W = portrait ? 400 : 640
    H = portrait ? 640 : 400
    const BS = portrait ? 360 : 340
    const BX = portrait ? 20 : (W - BS) / 2
    const BY = portrait ? 104 : 30
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const bag = new Bag()
    const k = keys()
    const fx = new Particles()
    const shake = new Shake()
    const mode = pickMode(env)
    const LEVELS = mode === 'flood' ? 3 : 4

    let level = 1
    let total = 0
    let moves = 0
    let time = 0
    let timing = false
    let solved = false
    let ended = false
    let bannerT = 0
    let bannerS = ''
    let clock = 0
    let hero = 0
    let intro = 2.5
    let par = 0
    let goal = ''
    let limit = 0
    let cur = 0
    let btns: Btn[] = []
    let hintT = 0
    let hintCells: number[] = []
    let cursorOn = false

    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
    const hud = () => {
      env.score(total)
      env.status(`Level ${level}/${LEVELS} · ${limit ? `${moves}/${limit}` : `${moves} moves`} · ${fmt(time)}`)
    }
    const finish = (won: boolean, msg: string) => {
      if (ended) return
      ended = true
      env.sfx(won ? 'win' : 'lose')
      env.end({ score: total, won, text: msg })
    }
    const win = () => {
      if (solved) return
      solved = true
      timing = false
      const eff = par > 0 ? Math.min(1, par / Math.max(1, moves)) : 1
      const gain = Math.max(50, Math.round(150 * level + 250 * eff - time * 0.5))
      total += gain
      bannerS = `Solved! +${gain}`
      bannerT = 2.2
      env.sfx('win')
      for (let i = 0; i < 50; i++) fx.burst(W / 2, H / 2, t.blocks[i % t.blocks.length], 1, 360, 4)
      hud()
    }
    const touchMove = () => {
      moves++
      timing = true
      hero = 1
      hintT = 0
      hud()
    }

    interface M { init(): void; click(x: number, y: number): void; key(code: string): void; update(dt: number): void; draw(): void; hint?: () => void }
    const cell = (n: number) => BS / n
    const cellAt = (n: number, x: number, y: number) => {
      const cx = Math.floor((x - BX) / cell(n))
      const cy = Math.floor((y - BY) / cell(n))
      return cx >= 0 && cy >= 0 && cx < n && cy < n ? cy * n + cx : -1
    }
    const board = () => roundRect(ctx, BX - 6, BY - 6, BS + 12, BS + 12, 12, 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.2)', 2)
    const cursorRect = (n: number, i: number) => {
      if (!cursorOn) return
      const c = cell(n)
      roundRect(ctx, BX + (i % n) * c + 1, BY + Math.floor(i / n) * c + 1, c - 2, c - 2, 8, undefined, `rgba(255,255,255,${0.5 + Math.sin(clock * 6) * 0.25})`, 3)
    }
    const arrowMove = (n: number, code: string) => {
      const d = ({ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], KeyA: [-1, 0], KeyD: [1, 0], KeyW: [0, -1], KeyS: [0, 1] } as Record<string, [number, number]>)[code]
      if (!d) return false
      cursorOn = true
      cur = clamp((cur % n) + d[0], 0, n - 1) + clamp(Math.floor(cur / n) + d[1], 0, n - 1) * n
      return true
    }

    // =====================================================================
    // LIGHTS OUT
    // =====================================================================
    const lights = (): M => {
      let n = 4
      let grid: boolean[] = []
      let sol = new Set<number>()
      const pulse: number[] = []
      const doPress = (i: number) => {
        if (solved || i < 0) return
        press(grid, n, i)
        if (sol.has(i)) sol.delete(i)
        else sol.add(i)
        for (const j of [i, i - 1, i + 1, i - n, i + n]) if (j >= 0 && j < n * n) pulse[j] = 1
        env.sfx('click')
        touchMove()
        if (!grid.some(Boolean)) win()
      }
      return {
        init() {
          n = byDiff(env, [3, 4, 4, 5], [4, 5, 5, 6], [5, 5, 6, 7])[level - 1]
          const g = genLights(n, rng, n * n * 0.4 + level * 2 + 2)
          grid = g.grid
          sol = g.solution
          par = sol.size
          goal = 'Turn every light off'
          pulse.length = 0
          pulse.push(...new Array(n * n).fill(0))
          limit = 0
          cur = 0
        },
        click(x, y) {
          doPress(cellAt(n, x, y))
        },
        key(code) {
          if (arrowMove(n, code)) return
          if (code === 'Space' || code === 'Enter') doPress(cur)
        },
        update(dt) {
          for (let i = 0; i < pulse.length; i++) pulse[i] = Math.max(0, pulse[i] - dt * 4)
        },
        hint() {
          const c = [...sol][0]
          if (c !== undefined) {
            hintCells = [c]
            hintT = 3
          }
        },
        draw() {
          board()
          const c = cell(n)
          grid.forEach((on, i) => {
            const x = BX + (i % n) * c
            const y = BY + Math.floor(i / n) * c
            const sc = 1 + Math.sin(pulse[i] * Math.PI) * 0.12
            ctx.save()
            ctx.translate(x + c / 2, y + c / 2)
            ctx.scale(sc, sc)
            if (on) {
              ctx.shadowColor = t.accent2
              ctx.shadowBlur = 16
            }
            roundRect(ctx, -c / 2 + 3, -c / 2 + 3, c - 6, c - 6, 10, on ? t.accent2 : 'rgba(0,0,0,0.45)', on ? '#fff' : 'rgba(255,255,255,0.12)', 2)
            ctx.shadowBlur = 0
            if (on) emoji(ctx, t.items[i % t.items.length], 0, 1, c * 0.5)
            else {
              ctx.globalAlpha = 0.18
              emoji(ctx, t.items[i % t.items.length], 0, 1, c * 0.4)
              ctx.globalAlpha = 1
            }
            ctx.restore()
            if (hintT > 0 && hintCells.includes(i)) roundRect(ctx, x + 1, y + 1, c - 2, c - 2, 10, undefined, t.good, 3 + Math.sin(clock * 10))
          })
          cursorRect(n, cur)
        },
      }
    }

    // =====================================================================
    // FLOOD
    // =====================================================================
    const flood = (): M => {
      let n = 8
      let colors = 4
      let g: number[] = []
      let shown: number[] = []
      let pend: { i: number; c: number; at: number }[] = []
      let loseT = 0
      const move = (c: number) => {
        if (solved || loseT > 0 || c === g[0] || c >= colors) return
        const ch = floodMove(g, n, c)
        ch.forEach((i, j) => pend.push({ i, c, at: clock + j * 0.012 }))
        env.sfx('point')
        touchMove()
        for (let j = 0; j < Math.min(ch.length, 12); j++) {
          const i = ch[j]
          fx.burst(BX + ((i % n) + 0.5) * cell(n), BY + (Math.floor(i / n) + 0.5) * cell(n), t.blocks[c], 2, 100, 3)
        }
        if (isFlooded(g)) win()
        else if (moves >= limit) loseT = 1.2
      }
      return {
        init() {
          n = byDiff(env, [6, 8, 10], [8, 10, 12], [10, 12, 14])[level - 1]
          colors = byDiff(env, 4, 5, 6)
          g = genFlood(n, colors, rng)
          shown = g.slice()
          pend = []
          loseT = 0
          const greedy = greedyFlood(g, n, colors)
          limit = greedy + byDiff(env, 7, 4, 1)
          par = greedy
          goal = 'Flood from the corner'
          btns = Array.from({ length: colors }, (_, c) => ({ label: `${c + 1}`, color: t.blocks[c], w: 52, h: 48, fn: () => move(c), x: 0, y: 0 }))
        },
        click(x, y) {
          const i = cellAt(n, x, y)
          if (i >= 0) move(g[i])
        },
        key(code) {
          const c = Number(code.replace('Digit', '')) - 1
          if (c >= 0 && c < colors) move(c)
        },
        update(dt) {
          pend = pend.filter((p) => {
            if (clock >= p.at) {
              shown[p.i] = p.c
              return false
            }
            return true
          })
          if (loseT > 0) {
            loseT -= dt
            if (loseT <= 0) finish(false, `Out of moves on level ${level}`)
          }
        },
        hint() {
          // suggest the colour that grows the region most
          let best = -1
          let size = -1
          for (let c = 0; c < colors; c++) {
            if (c === g[0]) continue
            const tmp = g.slice()
            floodMove(tmp, n, c)
            const s = tmp.filter((v) => v === c).length
            if (s > size) {
              size = s
              best = c
            }
          }
          hintCells = [best]
          hintT = 3
        },
        draw() {
          board()
          const c = cell(n)
          for (let i = 0; i < n * n; i++) {
            const x = BX + (i % n) * c
            const y = BY + Math.floor(i / n) * c
            ctx.fillStyle = t.blocks[shown[i]]
            ctx.fillRect(x, y, c + 0.5, c + 0.5)
          }
          ctx.strokeStyle = 'rgba(0,0,0,0.12)'
          ctx.lineWidth = 1
          for (let i = 0; i <= n; i++) {
            ctx.beginPath()
            ctx.moveTo(BX + i * c, BY)
            ctx.lineTo(BX + i * c, BY + BS)
            ctx.moveTo(BX, BY + i * c)
            ctx.lineTo(BX + BS, BY + i * c)
            ctx.stroke()
          }
          emoji(ctx, t.hero, BX + c / 2, BY + c / 2 - Math.sin(hero * Math.PI) * 5, c * 0.85)
          if (hintT > 0 && hintCells[0] >= 0) {
            const b = btns[hintCells[0]]
            if (b) roundRect(ctx, b.x - 3, b.y - 3, b.w + 6, b.h + 6, 12, undefined, '#fff', 3)
          }
        },
      }
    }

    // =====================================================================
    // HUE SORT
    // =====================================================================
    const hue = (): M => {
      let n = 5
      let cols: [number, number, number][] = []
      let perm: number[] = []
      let locked = new Set<number>()
      let tx: number[] = []
      let ty: number[] = []
      let sel = -1
      let drag: { id: number; x: number; y: number; from: number; moved: boolean; sx: number; sy: number } | null = null
      const doSwap = (a: number, b: number) => {
        if (a === b || locked.has(a) || locked.has(b) || solved) return
        ;[perm[a], perm[b]] = [perm[b], perm[a]]
        env.sfx('move')
        touchMove()
        if (perm.every((v, i) => v === i)) win()
      }
      bag.on(st.canvas, 'pointermove', (e) => {
        if (!drag) return
        const l = st.toLocal(e)
        drag.x = l.x
        drag.y = l.y
        if (Math.hypot(l.x - drag.sx, l.y - drag.sy) > 8) drag.moved = true
      })
      bag.on(st.canvas, 'pointerup', (e) => {
        if (!drag) return
        const l = st.toLocal(e)
        const c = cellAt(n, l.x, l.y)
        if (drag.moved && c >= 0) {
          doSwap(drag.from, c)
          sel = -1
        }
        drag = null
      })
      return {
        init() {
          n = byDiff(env, [4, 5, 5, 6], [5, 6, 6, 7], [6, 7, 8, 8])[level - 1]
          cols = hueGradient(n, rng)
          locked = new Set([0, n - 1, n * (n - 1), n * n - 1])
          const extra = Math.floor(n * n * byDiff(env, 0.25, 0.08, 0))
          for (let i = 0; i < extra; i++) locked.add(rng.int(0, n * n - 1))
          perm = shuffleHue(n, locked, rng)
          tx = []
          ty = []
          perm.forEach((id, c) => {
            tx[id] = c % n
            ty[id] = Math.floor(c / n)
          })
          sel = -1
          par = minSwaps(perm)
          limit = 0
          goal = 'Sort tiles into a smooth gradient'
          cur = 0
        },
        click(x, y) {
          const c = cellAt(n, x, y)
          if (c < 0 || solved) return
          if (locked.has(c)) {
            env.sfx('hit')
            return
          }
          if (sel >= 0 && sel !== c) {
            doSwap(sel, c)
            sel = -1
            drag = null
            return
          }
          const id = perm[c]
          drag = { id, x, y, from: c, moved: false, sx: x, sy: y }
          sel = sel === c ? -1 : c
        },
        key(code) {
          if (arrowMove(n, code)) return
          if (code === 'Space' || code === 'Enter') {
            if (locked.has(cur)) return
            if (sel < 0) sel = cur
            else {
              doSwap(sel, cur)
              sel = -1
            }
          }
        },
        update(dt) {
          const e = Math.min(1, dt * 14)
          perm.forEach((id, c) => {
            if (drag && drag.id === id && drag.moved) return
            tx[id] += ((c % n) - tx[id]) * e
            ty[id] += (Math.floor(c / n) - ty[id]) * e
          })
        },
        hint() {
          const wrong = perm.map((v, i) => (v !== i ? i : -1)).filter((i) => i >= 0)
          if (wrong.length) {
            const c = wrong[0]
            hintCells = [c, perm.indexOf(c)]
            hintT = 3
          }
        },
        draw() {
          board()
          const c = cell(n)
          perm.forEach((id, i) => {
            if (drag && drag.moved && drag.id === id) return
            const x = BX + tx[id] * c
            const y = BY + ty[id] * c
            const col = cols[id]
            ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`
            ctx.beginPath()
            ctx.roundRect(x + 1, y + 1, c - 2, c - 2, 6)
            ctx.fill()
            if (locked.has(i)) {
              ctx.fillStyle = 'rgba(255,255,255,0.9)'
              ctx.beginPath()
              ctx.arc(x + c / 2, y + c / 2, c * 0.1, 0, 7)
              ctx.fill()
            } else if (env.difficulty === 0 && id === i) {
              ctx.fillStyle = 'rgba(255,255,255,0.7)'
              ctx.beginPath()
              ctx.arc(x + c / 2, y + c / 2, c * 0.06, 0, 7)
              ctx.fill()
            }
            if (i === sel) roundRect(ctx, x + 1, y + 1, c - 2, c - 2, 6, undefined, '#fff', 3)
            if (hintT > 0 && hintCells.includes(i)) roundRect(ctx, x + 1, y + 1, c - 2, c - 2, 6, undefined, '#000', 3 + Math.sin(clock * 10))
          })
          if (drag && drag.moved) {
            const col = cols[drag.id]
            ctx.save()
            ctx.shadowColor = '#000'
            ctx.shadowBlur = 14
            ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`
            ctx.beginPath()
            ctx.roundRect(drag.x - c / 2, drag.y - c / 2, c, c, 8)
            ctx.fill()
            ctx.restore()
          }
          cursorRect(n, cur)
        },
      }
    }

    // =====================================================================
    // LASER
    // =====================================================================
    const laser = (): M => {
      let lv: LaserLevel = { n: 6, src: 0, mirrors: [], solution: [], targets: [] }
      let mirrors: number[] = []
      let reveal = 0
      let path: { x: number; y: number }[] = []
      let lit = new Set<number>()
      const retrace = () => {
        const tr = trace(lv.n, lv.src, mirrors)
        lit = new Set(tr.cells)
        const c = cell(lv.n)
        const ctr = (i: number) => ({ x: BX + ((i % lv.n) + 0.5) * c, y: BY + (Math.floor(i / lv.n) + 0.5) * c })
        path = [ctr(lv.src), ...tr.cells.map(ctr)]
        const last = tr.cells.length ? tr.cells[tr.cells.length - 1] : lv.src
        const d = tr.dirs.length ? tr.dirs[tr.dirs.length - 1] : 0
        const lp = ctr(last)
        const dv = [[1, 0], [0, 1], [-1, 0], [0, -1]][d]
        path.push({ x: lp.x + (dv[0] * c) / 2, y: lp.y + (dv[1] * c) / 2 })
        reveal = 0
      }
      const rotate = (i: number) => {
        if (solved || !mirrors[i]) return
        mirrors[i] = 3 - mirrors[i]
        env.sfx('click')
        touchMove()
        retrace()
        reveal = 0.6
        if (lasersolved(lv, mirrors)) win()
      }
      return {
        init() {
          const n = byDiff(env, [5, 5, 6, 6], [6, 6, 7, 8], [7, 8, 8, 9])[level - 1]
          const mc = byDiff(env, [3, 4, 4, 5], [4, 5, 6, 7], [5, 6, 8, 9])[level - 1]
          const nt = Math.min(5, 2 + Math.floor((level + env.difficulty) / 2))
          lv = genLaser(n, mc, nt, byDiff(env, 0, 1, 3) + (level > 2 ? 1 : 0), rng)
          mirrors = lv.mirrors.slice()
          par = lv.mirrors.filter((m, i) => m !== lv.solution[i]).length
          limit = 0
          goal = 'Rotate mirrors to light every target'
          cur = 0
          retrace()
        },
        click(x, y) {
          rotate(cellAt(lv.n, x, y))
        },
        key(code) {
          if (arrowMove(lv.n, code)) return
          if (code === 'Space' || code === 'Enter') rotate(cur)
        },
        update(dt) {
          reveal += dt * 14
        },
        hint() {
          const w = mirrors.map((m, i) => (m && m !== lv.solution[i] ? i : -1)).filter((i) => i >= 0)
          if (w.length) {
            hintCells = [w[0]]
            hintT = 3
          }
        },
        draw() {
          board()
          const n = lv.n
          const c = cell(n)
          for (let i = 0; i < n * n; i++) {
            const x = BX + (i % n) * c
            const y = BY + Math.floor(i / n) * c
            roundRect(ctx, x + 2, y + 2, c - 4, c - 4, 6, 'rgba(255,255,255,0.05)')
          }
          // beam
          if (path.length > 1) {
            let remaining = reveal
            ctx.save()
            ctx.strokeStyle = t.danger
            ctx.lineWidth = 4
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.shadowColor = t.danger
            ctx.shadowBlur = 14
            ctx.beginPath()
            ctx.moveTo(path[0].x, path[0].y)
            for (let i = 1; i < path.length; i++) {
              const len = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y)
              const cells = len / c
              if (remaining >= cells) {
                ctx.lineTo(path[i].x, path[i].y)
                remaining -= cells
              } else {
                const f = remaining / cells
                ctx.lineTo(path[i - 1].x + (path[i].x - path[i - 1].x) * f, path[i - 1].y + (path[i].y - path[i - 1].y) * f)
                break
              }
            }
            ctx.stroke()
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 1.5
            ctx.stroke()
            ctx.restore()
          }
          // targets
          for (const ti of lv.targets) {
            const x = BX + ((ti % n) + 0.5) * c
            const y = BY + (Math.floor(ti / n) + 0.5) * c
            const on = lit.has(ti) && reveal > 2
            if (on) {
              ctx.strokeStyle = t.good
              ctx.lineWidth = 3
              ctx.shadowColor = t.good
              ctx.shadowBlur = 14
              ctx.beginPath()
              ctx.arc(x, y, c * 0.38 + Math.sin(clock * 6) * 1.5, 0, 7)
              ctx.stroke()
              ctx.shadowBlur = 0
            }
            ctx.globalAlpha = on ? 1 : 0.5
            emoji(ctx, t.items[ti % t.items.length], x, y, c * 0.5)
            ctx.globalAlpha = 1
          }
          // mirrors
          mirrors.forEach((m, i) => {
            if (!m) return
            const x = BX + (i % n) * c
            const y = BY + Math.floor(i / n) * c
            roundRect(ctx, x + 3, y + 3, c - 6, c - 6, 8, 'rgba(255,255,255,0.14)', 'rgba(255,255,255,0.35)', 1.5)
            ctx.strokeStyle = t.accent
            ctx.lineWidth = 5
            ctx.lineCap = 'round'
            ctx.shadowColor = t.accent
            ctx.shadowBlur = 8
            ctx.beginPath()
            const p = c * 0.22
            if (m === 1) {
              ctx.moveTo(x + p, y + c - p)
              ctx.lineTo(x + c - p, y + p)
            } else {
              ctx.moveTo(x + p, y + p)
              ctx.lineTo(x + c - p, y + c - p)
            }
            ctx.stroke()
            ctx.shadowBlur = 0
            if (hintT > 0 && hintCells.includes(i)) roundRect(ctx, x + 1, y + 1, c - 2, c - 2, 8, undefined, t.good, 3 + Math.sin(clock * 10))
          })
          // emitter
          const sx = BX + ((lv.src % n) + 0.5) * c
          const sy = BY + (Math.floor(lv.src / n) + 0.5) * c
          roundRect(ctx, sx - c / 2 + 3, sy - c / 2 + 3, c - 6, c - 6, 8, t.danger)
          emoji(ctx, t.hero, sx, sy, c * 0.55)
          cursorRect(n, cur)
        },
      }
    }

    // =====================================================================
    // SYMMETRY
    // =====================================================================
    const symmetry = (): M => {
      let n = 6
      let sym: Sym = 'v'
      let grid: number[] = []
      let target: number[] = []
      let given = new Set<number>()
      let colors = 2
      const pop: number[] = []
      const change = (i: number, v: number) => {
        grid[i] = v
        pop[i] = 1
      }
      const tap = (i: number) => {
        if (i < 0 || given.has(i) || solved) {
          if (i >= 0 && given.has(i)) env.sfx('hit')
          return
        }
        change(i, (grid[i] + 1) % colors)
        env.sfx('click')
        touchMove()
        if (symmetric(grid, n, sym)) win()
      }
      return {
        init() {
          const seq: Sym[] = ['v', 'h', 'both', 'point']
          sym = seq[level - 1]
          n = byDiff(env, [4, 6, 6, 6], [6, 6, 8, 8], [8, 8, 8, 8])[level - 1]
          colors = byDiff(env, 2, 3, 4)
          const g = genSymmetry(n, sym, colors, rng)
          grid = g.grid
          target = g.target
          given = g.given
          pop.length = 0
          pop.push(...new Array(n * n).fill(0))
          par = grid.filter((v, i) => v !== target[i]).length
          limit = 0
          goal = { v: 'Mirror left to right', h: 'Mirror top to bottom', both: 'Mirror in both directions', point: 'Rotate-mirror through the centre' }[sym]
          cur = n * (n - 1)
        },
        click(x, y) {
          tap(cellAt(n, x, y))
        },
        key(code) {
          if (arrowMove(n, code)) return
          if (code === 'Space' || code === 'Enter') tap(cur)
        },
        update(dt) {
          for (let i = 0; i < pop.length; i++) pop[i] = Math.max(0, pop[i] - dt * 5)
        },
        hint() {
          const bad = [...Array(n * n).keys()].filter((i) => !given.has(i) && grid[i] !== target[i])
          if (bad.length) {
            hintCells = [bad[0]]
            hintT = 3
          }
        },
        draw() {
          board()
          const c = cell(n)
          grid.forEach((v, i) => {
            const x = BX + (i % n) * c
            const y = BY + Math.floor(i / n) * c
            const sc = 1 + Math.sin(pop[i] * Math.PI) * 0.1
            ctx.save()
            ctx.translate(x + c / 2, y + c / 2)
            ctx.scale(sc, sc)
            const isG = given.has(i)
            roundRect(ctx, -c / 2 + 2, -c / 2 + 2, c - 4, c - 4, 7, t.blocks[v], isG ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.25)', isG ? 3 : 1.5)
            if (env.difficulty < 2) {
              const bad = !given.has(i) && partners(n, sym, i).some((p) => grid[p] !== v)
              if (bad) {
                ctx.fillStyle = 'rgba(0,0,0,0.5)'
                ctx.beginPath()
                ctx.arc(0, 0, c * 0.08, 0, 7)
                ctx.fill()
              }
            }
            ctx.restore()
            if (hintT > 0 && hintCells.includes(i)) roundRect(ctx, x + 1, y + 1, c - 2, c - 2, 8, undefined, '#fff', 3 + Math.sin(clock * 10))
          })
          // axes
          ctx.strokeStyle = '#fff'
          ctx.globalAlpha = 0.8
          ctx.lineWidth = 2
          ctx.setLineDash([6, 5])
          ctx.beginPath()
          if (sym === 'v' || sym === 'both') {
            ctx.moveTo(BX + BS / 2, BY - 4)
            ctx.lineTo(BX + BS / 2, BY + BS + 4)
          }
          if (sym === 'h' || sym === 'both') {
            ctx.moveTo(BX - 4, BY + BS / 2)
            ctx.lineTo(BX + BS + 4, BY + BS / 2)
          }
          ctx.stroke()
          ctx.setLineDash([])
          if (sym === 'point') {
            ctx.beginPath()
            ctx.arc(BX + BS / 2, BY + BS / 2, 7, 0, 7)
            ctx.fillStyle = '#fff'
            ctx.fill()
          }
          ctx.globalAlpha = 1
          cursorRect(n, cur)
        },
      }
    }

    const M: M = mode === 'lights' ? lights() : mode === 'flood' ? flood() : mode === 'hue' ? hue() : mode === 'laser' ? laser() : symmetry()

    // ----- buttons (laid out every frame so they follow the layout) -----
    const hintBtn = (): Btn => ({ label: 'HINT', w: 96, h: 44, fn: () => {
      if (M.hint && !solved) {
        M.hint()
        total = Math.max(0, total - 20)
        hud()
      }
    }, x: 0, y: 0 })
    const layoutButtons = (): Btn[] => {
      const all = [...btns, ...(M.hint ? [hintBtn()] : [])]
      const x0 = portrait ? 20 : 506
      const x1 = portrait ? 380 : 630
      let x = x0
      let y = portrait ? BY + BS + 22 : 140
      for (const b of all) {
        if (x + b.w > x1 + 1) {
          x = x0
          y += (b.h ?? 44) + 8
        }
        b.x = x
        b.y = y
        x += b.w + 8
      }
      return all
    }
    const levelStart = () => {
      moves = 0
      time = 0
      timing = false
      solved = false
      hintT = 0
      btns = []
      cursorOn = false
      M.init()
      hud()
    }

    // ----- input -----
    st.canvas.style.touchAction = 'none'
    bag.on(st.canvas, 'contextmenu', (e) => e.preventDefault())
    bag.on(st.canvas, 'pointerdown', (e) => {
      st.canvas.focus({ preventScroll: true })
      const l = st.toLocal(e)
      try { st.canvas.setPointerCapture(e.pointerId) } catch { /* ignore */ }
      if (bannerT > 0) return
      for (const b of layoutButtons()) {
        if (l.x >= b.x && l.x <= b.x + b.w && l.y >= b.y && l.y <= b.y + b.h) {
          b.fn()
          return
        }
      }
      M.click(l.x, l.y)
    })
    k.onKey((e) => {
      if (bannerT > 0) return
      if (e.code === 'KeyH' && M.hint) hintBtn().fn()
      else M.key(e.code)
    })

    const update = (dt: number) => {
      clock += dt
      intro = Math.max(0, intro - dt)
      hero = Math.max(0, hero - dt * 3)
      hintT = Math.max(0, hintT - dt)
      fx.update(dt, 260)
      shake.update(dt)
      if (timing && !solved) {
        const s0 = Math.floor(time)
        time += dt
        if (Math.floor(time) !== s0) hud()
      }
      M.update(dt)
      if (bannerT > 0) {
        bannerT -= dt
        if (bannerT <= 0) {
          if (level >= LEVELS) finish(true, `All ${LEVELS} levels solved`)
          else {
            level++
            levelStart()
          }
        }
      }
    }

    const draw = () => {
      background(ctx, W, H, t, 35, 5)
      ctx.save()
      shake.apply(ctx)
      M.draw()
      fx.draw(ctx)
      ctx.restore()
      // HUD
      const left = limit ? limit - moves : -1
      if (portrait) {
        text(ctx, `LEVEL ${level}/${LEVELS}`, 20, 22, { size: 10, color: t.accent, align: 'left' })
        text(ctx, `SCORE ${total}`, W - 20, 22, { size: 10, color: t.fg, align: 'right' })
        text(ctx, limit ? `MOVES LEFT ${left}` : `MOVES ${moves}`, 20, 52, { size: 10, color: left >= 0 && left <= 2 ? t.danger : t.fg, align: 'left' })
        text(ctx, fmt(time), W - 20, 52, { size: 10, color: t.fg, align: 'right' })
        text(ctx, goal, W / 2, 82, { size: 9, color: t.accent2 })
        emoji(ctx, t.hero, W / 2, 586 - Math.sin(hero * Math.PI) * 14, 48)
      } else {
        text(ctx, `LEVEL ${level}/${LEVELS}`, 78, 44, { size: 11, color: t.accent })
        text(ctx, limit ? 'LEFT' : 'MOVES', 78, 100, { size: 9, color: t.fg })
        text(ctx, limit ? `${left}` : `${moves}`, 78, 126, { size: 22, color: left >= 0 && left <= 2 ? t.danger : t.fg })
        text(ctx, 'TIME', 78, 176, { size: 9, color: t.fg })
        text(ctx, fmt(time), 78, 200, { size: 16, color: t.fg })
        text(ctx, 'PAR', 78, 248, { size: 9, color: t.fg })
        text(ctx, `${par}`, 78, 270, { size: 14, color: t.accent2 })
        text(ctx, 'SCORE', 562, 40, { size: 10, color: t.accent })
        text(ctx, `${total}`, 562, 66, { size: 16, color: t.fg })
        text(ctx, goal, W / 2, H - 12, { size: 8, color: t.accent2 })
        emoji(ctx, t.hero, 78, 336 - Math.sin(hero * Math.PI) * 14, 44)
      }
      for (const b of layoutButtons()) {
        const swatch = !!b.color
        roundRect(ctx, b.x, b.y, b.w, b.h, 10, b.color ?? t.accent, 'rgba(255,255,255,0.5)', 2)
        text(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2, { size: swatch ? 13 : 10, color: '#fff', shadow: '#000' })
      }
      if (bannerT > 0) {
        ctx.globalAlpha = Math.min(1, (2.2 - bannerT) * 4)
        roundRect(ctx, W / 2 - 150, H / 2 - 32, 300, 64, 16, 'rgba(0,0,0,0.78)', t.good, 2)
        text(ctx, bannerS, W / 2, H / 2, { size: 17, color: '#fff', shadow: t.good })
        ctx.globalAlpha = 1
      }
      if (intro > 0) {
        ctx.globalAlpha = Math.min(1, intro)
        roundRect(ctx, W / 2 - 170, H / 2 - 36, 340, 72, 14, 'rgba(0,0,0,0.78)', t.accent, 2)
        text(ctx, env.name, W / 2, H / 2 - 12, { size: 13, color: '#fff' })
        text(ctx, goal, W / 2, H / 2 + 14, { size: 8, color: t.fg })
        ctx.globalAlpha = 1
      }
    }

    const lp = loop(update, draw)
    levelStart()
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
