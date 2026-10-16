// Logic: grid logic puzzles. Minesweeper (default, square or hex), Nonogram, Sudoku, Akari (light up) and Binairo (takuzu).
// Sub-mode comes from mods / keywords in the name. Levels, timer, error highlighting, touch + mouse + keyboard.
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, roundRect, Shake, text, type Engine, type GameEnv } from '../kit'
import {
  akariCheck, binairoErrors, binairoSolved, genAkari, genBinairo, genNonogram, genSudoku, lineClue, mineCounts, neighbors, nonogramClues, placeMines, revealFrom,
  rowOf, colOf, SUDOKU6, SUDOKU9, sudokuConflicts, type Akari, type SudokuSpec, type Topo,
} from '../logic/logic'

type Mode = 'mines' | 'nonogram' | 'sudoku' | 'akari' | 'binairo'

function pickMode(env: GameEnv): Mode {
  const s = `${env.name} ${env.desc}`.toLowerCase()
  const m = env.mods
  if (m.has('sudoku') || /sudoku|kenken|kakuro|futoshiki|suguru|kropki|hidato|fillomino|latin|thermo/.test(s)) return 'sudoku'
  if (m.has('nonogram') || /nonogram|picross|billboard|picture-logic|pixel/.test(s)) return 'nonogram'
  if (m.has('mines') || m.has('hex') || /mine|sweep|sonar|dig/.test(s)) return 'mines'
  if (/binairo|binary|takuzu|bloom|balance|black and white|light and shadow/.test(s)) return 'binairo'
  if (/akari|lamp|glow|light|heyawake|nurikabe|hitori|kurodoko|yajilin|tapa|lits|norinori|corral|slither|masyu|shikaku|galaxy|aquarium|tents|stars|fleet|loop|twin/.test(s)) return env.seed % 2 ? 'akari' : 'binairo'
  return 'mines'
}

let W = 640
let H = 400

interface Btn { label: string; color?: string; w: number; h: number; fn: () => void; active?: () => boolean; x: number; y: number }

const NUMCOL = ['', '#60a5fa', '#4ade80', '#f87171', '#c084fc', '#fbbf24', '#22d3ee', '#f472b6', '#e5e7eb']

const engine: Engine = {
  start(env) {
    const { theme: t, rng } = env
    const r0 = env.host.getBoundingClientRect()
    const portrait = r0.height > r0.width * 1.05
    W = portrait ? 400 : 640
    H = portrait ? 640 : 400
    const BS = portrait ? 360 : 340
    const BX = portrait ? 20 : (W - BS) / 2
    const BY = portrait ? 100 : 30
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const bag = new Bag()
    const k = keys()
    const fx = new Particles()
    const shake = new Shake()
    const mode = pickMode(env)
    const LEVELS = 3

    let level = 1
    let total = 0
    let mistakes = 0
    let time = 0
    let timing = false
    let solved = false
    let lost = false
    let ended = false
    let bannerT = 0
    let bannerS = ''
    let clock = 0
    let hero = 0
    let intro = 2.5
    let goal = ''
    let statLabel = ''
    let statValue = ''
    let btns: Btn[] = []
    let flashCells: { i: number; t: number }[] = []

    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
    const hud = () => {
      env.score(total)
      env.status(`Level ${level}/${LEVELS} · ${statLabel} ${statValue} · ${fmt(time)}`)
    }
    const finish = (won: boolean, msg: string) => {
      if (ended) return
      ended = true
      env.sfx(won ? 'win' : 'lose')
      env.end({ score: total, won, text: msg })
    }
    const win = (gain: number) => {
      if (solved || lost) return
      solved = true
      timing = false
      gain = Math.max(60, Math.round(gain - time * 0.6 - mistakes * 30))
      total += gain
      bannerS = `Solved! +${gain}`
      bannerT = 2.2
      env.sfx('win')
      for (let i = 0; i < 50; i++) fx.burst(W / 2, H / 2, t.blocks[i % t.blocks.length], 1, 360, 4)
      hud()
    }
    const setStat = (label: string, value: string) => {
      statLabel = label
      statValue = value
      hud()
    }

    interface M {
      init(): void
      down?(x: number, y: number, sec: boolean): void
      drag?(x: number, y: number): void
      release?(): void
      primary?(x: number, y: number): void
      secondary?(x: number, y: number): void
      key(code: string): void
      update(dt: number): void
      draw(): void
      immediate?: boolean
    }
    const board = () => roundRect(ctx, BX - 6, BY - 6, BS + 12, BS + 12, 12, 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.2)', 2)
    const sqCell = (n: number, x: number, y: number) => {
      const c = BS / n
      const cx = Math.floor((x - BX) / c)
      const cy = Math.floor((y - BY) / c)
      return cx >= 0 && cy >= 0 && cx < n && cy < n ? cy * n + cx : -1
    }
    const flash = (i: number) => flashCells.push({ i, t: 0.5 })
    const toggleBtn = (label: string, get: () => boolean, set: (v: boolean) => void, w = 112): Btn => ({ label, w, h: 44, fn: () => set(!get()), active: get, x: 0, y: 0 })

    // =====================================================================
    // MINESWEEPER
    // =====================================================================
    const mines = (): M => {
      const topo: Topo = env.mods.has('hex') ? 'hex' : 'sq'
      let cols = 9
      let rows = 9
      let count = 10
      let mine: boolean[] = []
      let counts: number[] = []
      let revealed: boolean[] = []
      let flagged: boolean[] = []
      let started = false
      let flagMode = false
      let boom = -1
      let loseT = 0
      const appear: number[] = []
      const mineEmoji = t.foes[0] ?? '💣'
      // geometry
      const geo = () => {
        if (topo === 'sq') {
          const c = Math.min(BS / cols, BS / rows)
          return { w: c, h: c, ox: BX + (BS - c * cols) / 2, oy: BY + (BS - c * rows) / 2 }
        }
        const w = Math.min(BS / (cols + 0.5), BS / ((rows * 0.75 + 0.25) * 1.1547))
        const h = w * 1.1547
        return { w, h, ox: BX + (BS - w * (cols + 0.5)) / 2, oy: BY + (BS - h * (rows * 0.75 + 0.25)) / 2 }
      }
      const center = (i: number) => {
        const g = geo()
        const x = i % cols
        const y = Math.floor(i / cols)
        return topo === 'sq' ? { x: g.ox + (x + 0.5) * g.w, y: g.oy + (y + 0.5) * g.h } : { x: g.ox + (x + 0.5 + (y % 2) * 0.5) * g.w, y: g.oy + (y * 0.75 + 0.5) * g.h }
      }
      const hit = (px: number, py: number) => {
        const g = geo()
        if (topo === 'sq') {
          const x = Math.floor((px - g.ox) / g.w)
          const y = Math.floor((py - g.oy) / g.h)
          return x >= 0 && y >= 0 && x < cols && y < rows ? y * cols + x : -1
        }
        let best = -1
        let bd = (g.w * 0.62) ** 2
        for (let i = 0; i < cols * rows; i++) {
          const c = center(i)
          const d = (c.x - px) ** 2 + (c.y - py) ** 2
          if (d < bd) {
            bd = d
            best = i
          }
        }
        return best
      }
      const left = () => count - flagged.filter(Boolean).length
      const nb = (i: number) => neighbors(topo, cols, rows, i)
      const lose = (i: number) => {
        lost = true
        timing = false
        boom = i
        loseT = 1.6
        env.sfx('boom')
        shake.kick(10)
        const c = center(i)
        fx.burst(c.x, c.y, t.danger, 40, 300, 4)
        for (let j = 0; j < mine.length; j++) if (mine[j]) revealed[j] = true
        hud()
      }
      const open = (i: number) => {
        if (i < 0 || revealed[i] || flagged[i] || solved || lost) return
        if (!started) {
          started = true
          timing = true
          mine = placeMines(topo, cols, rows, count, i, rng)
          counts = mineCounts(topo, cols, rows, mine)
        }
        if (mine[i]) return lose(i)
        const got = revealFrom(topo, cols, rows, counts, mine, revealed, flagged, i)
        got.forEach((j, n) => (appear[j] = -n * 0.012))
        env.sfx(got.length > 4 ? 'power' : 'click')
        hero = 1
        check()
      }
      const check = () => {
        if (revealed.every((r, i) => r || mine[i])) {
          for (let i = 0; i < mine.length; i++) if (mine[i]) flagged[i] = true
          setStat('Mines', '0')
          win(count * 40 + cols * rows * 3)
        }
      }
      const chord = (i: number) => {
        if (!revealed[i] || counts[i] === 0) return
        const around = nb(i)
        if (around.filter((j) => flagged[j]).length !== counts[i]) return
        for (const j of around) if (!flagged[j] && !revealed[j]) open(j)
      }
      const flag = (i: number) => {
        if (i < 0 || revealed[i] || solved || lost) return
        flagged[i] = !flagged[i]
        env.sfx('click')
        timing = started
        setStat('Mines', `${left()}`)
      }
      return {
        init() {
          const sizes = byDiff(env, [[8, 8, 8], [9, 9, 12], [10, 10, 15]], [[9, 9, 10], [12, 12, 24], [14, 14, 38]], [[12, 12, 24], [14, 14, 40], [16, 14, 52]])[level - 1]
          ;[cols, rows, count] = sizes
          if (topo === 'hex') {
            cols = Math.min(cols, 12)
            rows = Math.min(rows, 12)
            count = Math.round(count * ((cols * rows) / (sizes[0] * sizes[1])))
          }
          mine = new Array(cols * rows).fill(false)
          counts = new Array(cols * rows).fill(0)
          revealed = new Array(cols * rows).fill(false)
          flagged = new Array(cols * rows).fill(false)
          appear.length = 0
          started = false
          boom = -1
          loseT = 0
          goal = 'First tap is safe. Reveal every safe cell'
          btns = [toggleBtn('FLAG MODE', () => flagMode, (v) => (flagMode = v))]
          setStat('Mines', `${count}`)
        },
        primary(x, y) {
          const i = hit(x, y)
          if (i < 0) return
          if (flagMode) return flag(i)
          if (revealed[i]) chord(i)
          else open(i)
        },
        secondary(x, y) {
          const i = hit(x, y)
          if (revealed[i]) chord(i)
          else flag(i)
        },
        key() {},
        update(dt) {
          if (loseT > 0) {
            loseT -= dt
            if (loseT <= 0) finish(false, `Hit a mine on level ${level}`)
          }
        },
        draw() {
          board()
          const g = geo()
          for (let i = 0; i < cols * rows; i++) {
            const c = center(i)
            const rv = revealed[i]
            const a = Math.min(1, Math.max(0, (appear[i] ?? 1) + 0.0))
            if (appear[i] !== undefined && appear[i] < 1) appear[i] += 0.12
            ctx.save()
            ctx.translate(c.x, c.y)
            const s = rv ? 1 : 1
            ctx.scale(s * (rv ? 0.94 + 0.06 * a : 1), s * (rv ? 0.94 + 0.06 * a : 1))
            const fill = rv ? (i === boom ? t.danger : 'rgba(15,15,25,0.62)') : t.blocks[(i + Math.floor(i / cols)) % 2 ? 0 : 3]
            ctx.fillStyle = fill
            ctx.strokeStyle = rv ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.45)'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            if (topo === 'sq') ctx.roundRect(-g.w / 2 + 1, -g.h / 2 + 1, g.w - 2, g.h - 2, g.w * 0.16)
            else {
              const r = g.h / 2 - 1.5
              for (let k2 = 0; k2 < 6; k2++) {
                const ang = Math.PI / 6 + (k2 * Math.PI) / 3
                const px = Math.cos(ang) * r
                const py = Math.sin(ang) * r
                if (k2) ctx.lineTo(px, py)
                else ctx.moveTo(px, py)
              }
              ctx.closePath()
            }
            ctx.fill()
            ctx.stroke()
            if (!rv) {
              ctx.fillStyle = 'rgba(255,255,255,0.2)'
              ctx.beginPath()
              ctx.ellipse(0, -g.h * 0.2, g.w * 0.32, g.h * 0.12, 0, 0, 7)
              ctx.fill()
            }
            if (rv && mine[i]) emoji(ctx, mineEmoji, 0, 1, g.w * 0.62)
            else if (rv && counts[i] > 0) text(ctx, `${counts[i]}`, 0, 1, { size: Math.max(9, g.w * 0.5), color: NUMCOL[counts[i]], shadow: 'rgba(0,0,0,0.5)' })
            if (flagged[i]) {
              emoji(ctx, '🚩', 0, 0, g.w * 0.6)
              if (lost && !mine[i]) text(ctx, 'x', 0, 0, { size: g.w * 0.7, color: t.danger })
            }
            ctx.restore()
          }
          if (lost || solved) emoji(ctx, lost ? '😵' : '😎', BX + BS - 18, BY + 18, 30)
        },
      }
    }

    // =====================================================================
    // SUDOKU
    // =====================================================================
    const sudoku = (): M => {
      let sp: SudokuSpec = SUDOKU9
      let given: number[] = []
      let solution: number[] = []
      let grid: number[] = []
      let notes: number[] = []
      let sel = 0
      let pencil = false
      const n = () => sp.n
      const cellSz = () => BS / sp.n
      const place = (v: number) => {
        if (solved || given[sel]) return
        if (pencil && v) {
          notes[sel] ^= 1 << v
          env.sfx('click')
          return
        }
        grid[sel] = v
        notes[sel] = 0
        if (v) {
          // clear the number from peers' notes
          const x = sel % sp.n
          const y = Math.floor(sel / sp.n)
          for (let i = 0; i < sp.n * sp.n; i++) {
            const ix = i % sp.n
            const iy = Math.floor(i / sp.n)
            const sameBox = Math.floor(ix / sp.bw) === Math.floor(x / sp.bw) && Math.floor(iy / sp.bh) === Math.floor(y / sp.bh)
            if (ix === x || iy === y || sameBox) notes[i] &= ~(1 << v)
          }
          if (v !== solution[sel]) {
            if (env.difficulty === 0) {
              mistakes++
              shake.kick(2)
              env.sfx('hit')
            } else env.sfx('click')
          } else env.sfx('point')
        } else env.sfx('click')
        timing = true
        hero = 1
        setStat('Mistakes', `${mistakes}`)
        if (grid.every((c) => c) && !sudokuConflicts(grid, sp).some(Boolean)) win(sp.n * sp.n * 14 + (9 - level) * 20)
      }
      return {
        init() {
          sp = env.difficulty === 0 ? SUDOKU6 : SUDOKU9
          const givens = sp.n === 6 ? [22, 20, 18][level - 1] : byDiff(env, [38, 34, 32], [36, 32, 30], [30, 27, 25])[level - 1]
          const g = genSudoku(sp, givens, rng, env.mods.has('mirror'))
          given = g.puzzle
          solution = g.solution
          grid = g.puzzle.slice()
          notes = new Array(sp.n * sp.n).fill(0)
          sel = grid.findIndex((v) => !v)
          pencil = false
          goal = env.mods.has('mirror') ? 'Symmetric Sudoku: fill 1-' + sp.n : `Fill every row, column and box with 1-${sp.n}`
          const digits: Btn[] = Array.from({ length: sp.n }, (_, i) => ({ label: `${i + 1}`, w: portrait ? 36 : 38, h: 40, fn: () => place(i + 1), x: 0, y: 0 }))
          btns = [
            ...digits,
            toggleBtn('NOTES', () => pencil, (v) => (pencil = v), portrait ? 84 : 58),
            { label: 'DEL', w: portrait ? 84 : 58, h: 40, fn: () => place(0), x: 0, y: 0 },
            {
              label: 'HINT', w: portrait ? 84 : 58, h: 40, x: 0, y: 0, fn: () => {
                if (given[sel] || grid[sel] === solution[sel] || solved) return
                grid[sel] = solution[sel]
                notes[sel] = 0
                mistakes++
                env.sfx('power')
                setStat('Mistakes', `${mistakes}`)
                if (grid.every((c) => c) && !sudokuConflicts(grid, sp).some(Boolean)) win(sp.n * sp.n * 10)
              },
            },
          ]
          setStat('Mistakes', '0')
        },
        primary(x, y) {
          const i = sqCell(n(), x, y)
          if (i >= 0) {
            sel = i
            env.sfx('click')
          }
        },
        key(code) {
          const d = ({ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] } as Record<string, [number, number]>)[code]
          if (d) sel = clamp((sel % sp.n) + d[0], 0, sp.n - 1) + clamp(Math.floor(sel / sp.n) + d[1], 0, sp.n - 1) * sp.n
          const m = /^(?:Digit|Numpad)(\d)$/.exec(code)
          if (m && Number(m[1]) >= 1 && Number(m[1]) <= sp.n) place(Number(m[1]))
          else if (code === 'Backspace' || code === 'Delete' || code === 'Digit0') place(0)
          else if (code === 'KeyN') pencil = !pencil
        },
        update() {},
        draw() {
          board()
          const c = cellSz()
          const bad = sudokuConflicts(grid, sp)
          const selV = grid[sel]
          for (let i = 0; i < sp.n * sp.n; i++) {
            const x = BX + (i % sp.n) * c
            const y = BY + Math.floor(i / sp.n) * c
            const sx = sel % sp.n
            const sy = Math.floor(sel / sp.n)
            const rel = (i % sp.n === sx || Math.floor(i / sp.n) === sy || (Math.floor((i % sp.n) / sp.bw) === Math.floor(sx / sp.bw) && Math.floor(Math.floor(i / sp.n) / sp.bh) === Math.floor(sy / sp.bh)))
            ctx.fillStyle = i === sel ? t.accent : given[i] ? 'rgba(255,255,255,0.28)' : rel ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)'
            if (selV && grid[i] === selV && i !== sel) ctx.fillStyle = `${t.accent2}88`
            ctx.fillRect(x, y, c, c)
            const v = grid[i]
            if (v) {
              const wrong = bad[i] || (env.difficulty === 0 && !given[i] && v !== solution[i])
              text(ctx, `${v}`, x + c / 2, y + c / 2 + 1, { size: c * 0.5, color: wrong ? t.danger : given[i] ? t.fg : i === sel ? '#fff' : t.accent2, weight: given[i] ? 900 : 700 })
              if (wrong) {
                ctx.strokeStyle = t.danger
                ctx.lineWidth = 2
                ctx.strokeRect(x + 2, y + 2, c - 4, c - 4)
              }
            } else if (notes[i]) {
              for (let d = 1; d <= sp.n; d++) {
                if (notes[i] & (1 << d)) {
                  const px = x + ((d - 1) % 3 + 0.5) * (c / 3)
                  const py = y + (Math.floor((d - 1) / 3) + 0.5) * (c / (sp.n > 6 ? 3 : 2))
                  text(ctx, `${d}`, px, py, { size: c * 0.2, color: t.fg })
                }
              }
            }
          }
          ctx.strokeStyle = 'rgba(255,255,255,0.25)'
          ctx.lineWidth = 1
          for (let i = 0; i <= sp.n; i++) {
            ctx.beginPath()
            ctx.moveTo(BX + i * c, BY)
            ctx.lineTo(BX + i * c, BY + BS)
            ctx.moveTo(BX, BY + i * c)
            ctx.lineTo(BX + BS, BY + i * c)
            ctx.stroke()
          }
          ctx.strokeStyle = t.fg
          ctx.lineWidth = 3
          for (let i = 0; i <= sp.n; i += sp.bw) {
            ctx.beginPath()
            ctx.moveTo(BX + i * c, BY)
            ctx.lineTo(BX + i * c, BY + BS)
            ctx.stroke()
          }
          for (let i = 0; i <= sp.n; i += sp.bh) {
            ctx.beginPath()
            ctx.moveTo(BX, BY + i * c)
            ctx.lineTo(BX + BS, BY + i * c)
            ctx.stroke()
          }
          if (pencil) text(ctx, 'NOTES ON', BX + BS - 40, BY - 14, { size: 8, color: t.accent2 })
        },
      }
    }

    // =====================================================================
    // NONOGRAM
    // =====================================================================
    const nonogram = (): M => {
      let n = 5
      let pic: boolean[] = []
      let rowC: number[][] = []
      let colC: number[][] = []
      let cells: number[] = []
      let xMode = false
      let paint = -1
      let paintVal = 0
      let showErr = 0
      const lay = () => {
        const maxClue = Math.max(...rowC.map((c) => c.length), ...colC.map((c) => c.length))
        const cs = BS / (n + maxClue * 0.7)
        const ext = maxClue * 0.7 * cs
        return { cs, ext, ox: BX + ext, oy: BY + ext }
      }
      const at = (x: number, y: number) => {
        const l = lay()
        const cx = Math.floor((x - l.ox) / l.cs)
        const cy = Math.floor((y - l.oy) / l.cs)
        return cx >= 0 && cy >= 0 && cx < n && cy < n ? cy * n + cx : -1
      }
      const rowOk = (y: number) => lineClue(rowOf(cells.map((v) => v === 1), n, y)).join() === rowC[y].join()
      const colOk = (x: number) => lineClue(colOf(cells.map((v) => v === 1), n, x)).join() === colC[x].join()
      const done = () => Array.from({ length: n }, (_, i) => i).every((i) => rowOk(i) && colOk(i))
      const apply = (i: number, v: number) => {
        if (i < 0 || solved) return
        if (cells[i] === v) return
        // never overwrite a different mark while painting on empty
        if (paintVal !== 0 && v !== 0 && cells[i] !== 0) return
        cells[i] = v
        timing = true
        env.sfx('click')
        if (v === 1 && !pic[i] && env.difficulty === 0) {
          mistakes++
          flash(i)
          setStat('Mistakes', `${mistakes}`)
        }
        if (done()) win(n * n * 12)
      }
      return {
        immediate: true,
        init() {
          n = byDiff(env, [5, 5, 7], [7, 10, 10], [10, 12, 15])[level - 1]
          const g = genNonogram(n, rng, 0.55)
          pic = g.pic
          const c = nonogramClues(pic, n)
          rowC = c.rows
          colC = c.cols
          cells = new Array(n * n).fill(0)
          paint = -1
          goal = 'Fill cells to match the clues'
          btns = [
            toggleBtn('MARK X', () => xMode, (v) => (xMode = v)),
            {
              label: 'CHECK', w: 112, h: 44, x: 0, y: 0, fn: () => {
                showErr = 1.6
                mistakes++
                env.sfx('power')
                setStat('Mistakes', `${mistakes}`)
              },
            },
          ]
          setStat('Mistakes', '0')
        },
        down(x, y, sec) {
          const i = at(x, y)
          if (i < 0) return
          const useX = sec || xMode
          const want = useX ? 2 : 1
          paintVal = cells[i] === want ? 0 : want
          paint = i
          apply(i, paintVal)
        },
        drag(x, y) {
          if (paint < 0) return
          const i = at(x, y)
          if (i >= 0) apply(i, paintVal)
        },
        release() {
          paint = -1
        },
        key() {},
        update(dt) {
          showErr = Math.max(0, showErr - dt)
        },
        draw() {
          const l = lay()
          board()
          const fs = Math.max(7, l.cs * 0.4)
          for (let y = 0; y < n; y++) {
            const ok = rowOk(y)
            const cl = rowC[y]
            cl.forEach((v, j) => text(ctx, `${v}`, l.ox - 4 - (cl.length - 1 - j) * fs * 1.6, l.oy + (y + 0.5) * l.cs, { size: fs, color: ok ? 'rgba(128,128,128,0.6)' : t.fg, align: 'right' }))
          }
          for (let x = 0; x < n; x++) {
            const ok = colOk(x)
            const cl = colC[x]
            cl.forEach((v, j) => text(ctx, `${v}`, l.ox + (x + 0.5) * l.cs, l.oy - 4 - (cl.length - 1 - j) * fs * 1.6, { size: fs, color: ok ? 'rgba(128,128,128,0.6)' : t.fg, base: 'bottom' }))
          }
          for (let i = 0; i < n * n; i++) {
            const x = l.ox + (i % n) * l.cs
            const y = l.oy + Math.floor(i / n) * l.cs
            const v = cells[i]
            ctx.fillStyle = (Math.floor(i / n) + (i % n)) % 2 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.14)'
            ctx.fillRect(x, y, l.cs, l.cs)
            if (v === 1) {
              const wrong = (showErr > 0 || env.difficulty === 0) && !pic[i]
              roundRect(ctx, x + 1.5, y + 1.5, l.cs - 3, l.cs - 3, 4, wrong ? t.danger : solved ? t.blocks[(i * 7) % t.blocks.length] : t.accent, 'rgba(255,255,255,0.4)', 1)
            } else if (v === 2) text(ctx, '×', x + l.cs / 2, y + l.cs / 2, { size: l.cs * 0.7, color: t.fg, weight: 400 })
          }
          ctx.strokeStyle = 'rgba(255,255,255,0.3)'
          ctx.lineWidth = 1
          for (let i = 0; i <= n; i++) {
            const heavy = i % 5 === 0
            ctx.lineWidth = heavy ? 2 : 1
            ctx.beginPath()
            ctx.moveTo(l.ox + i * l.cs, l.oy)
            ctx.lineTo(l.ox + i * l.cs, l.oy + n * l.cs)
            ctx.moveTo(l.ox, l.oy + i * l.cs)
            ctx.lineTo(l.ox + n * l.cs, l.oy + i * l.cs)
            ctx.stroke()
          }
          if (solved) emoji(ctx, t.hero, BX + BS - 16, BY + 16, 30)
        },
      }
    }

    // =====================================================================
    // AKARI
    // =====================================================================
    const akari = (): M => {
      let a: Akari = { n: 7, black: [], num: [], solution: [] }
      let lamps: boolean[] = []
      let dots: boolean[] = []
      let markMode = false
      let state = akariCheck({ n: 1, black: [false], num: [-1], solution: [false] }, [false])
      const refresh = () => {
        state = akariCheck(a, lamps)
        setStat('Lit', `${state.lit.filter((v, i) => v && !a.black[i]).length}/${a.black.filter((b) => !b).length}`)
        if (state.solved) win(a.n * a.n * 14)
      }
      const toggle = (i: number, dot: boolean) => {
        if (i < 0 || a.black[i] || solved) return
        timing = true
        if (dot) {
          if (!lamps[i]) dots[i] = !dots[i]
        } else {
          lamps[i] = !lamps[i]
          dots[i] = false
          env.sfx(lamps[i] ? 'power' : 'click')
          hero = 1
        }
        refresh()
      }
      return {
        init() {
          const n = byDiff(env, [5, 6, 7], [7, 8, 10], [10, 11, 12])[level - 1]
          a = genAkari(n, rng, 0.2, byDiff(env, 0.95, 0.75, 0.55))
          lamps = new Array(n * n).fill(false)
          dots = new Array(n * n).fill(false)
          goal = 'Light every cell, no lamp sees another'
          btns = [toggleBtn('MARK DOT', () => markMode, (v) => (markMode = v))]
          refresh()
        },
        primary(x, y) {
          toggle(sqCell(a.n, x, y), markMode)
        },
        secondary(x, y) {
          toggle(sqCell(a.n, x, y), true)
        },
        key() {},
        update() {},
        draw() {
          board()
          const c = BS / a.n
          for (let i = 0; i < a.n * a.n; i++) {
            const x = BX + (i % a.n) * c
            const y = BY + Math.floor(i / a.n) * c
            if (a.black[i]) {
              roundRect(ctx, x + 1, y + 1, c - 2, c - 2, 4, '#15151f', 'rgba(255,255,255,0.25)', 1)
              const v = a.num[i]
              if (v >= 0) text(ctx, `${v}`, x + c / 2, y + c / 2 + 1, { size: c * 0.5, color: state.numOk[i] === 1 ? t.good : state.numOk[i] === 2 ? t.danger : '#fff' })
            } else {
              const lit = state.lit[i]
              ctx.fillStyle = lit ? `${t.accent2}` : 'rgba(255,255,255,0.1)'
              ctx.globalAlpha = lit ? 0.55 : 1
              ctx.fillRect(x + 1, y + 1, c - 2, c - 2)
              ctx.globalAlpha = 1
              if (dots[i]) {
                ctx.fillStyle = t.fg
                ctx.beginPath()
                ctx.arc(x + c / 2, y + c / 2, c * 0.08, 0, 7)
                ctx.fill()
              }
              if (lamps[i]) {
                if (state.bad[i]) roundRect(ctx, x + 2, y + 2, c - 4, c - 4, 6, 'rgba(239,68,68,0.55)', t.danger, 2)
                emoji(ctx, '💡', x + c / 2, y + c / 2, c * 0.68)
              }
            }
          }
          if (solved) emoji(ctx, t.hero, BX + BS - 16, BY + 16, 30)
        },
      }
    }

    // =====================================================================
    // BINAIRO
    // =====================================================================
    const binairo = (): M => {
      let n = 6
      let given: number[] = []
      let solution: number[] = []
      let grid: number[] = []
      let hintCell = -1
      let hintT = 0
      const sym = (v: number) => t.items[v] ?? (v ? '⚫' : '⚪')
      const tap = (i: number, back: boolean) => {
        if (i < 0 || solved || given[i] >= 0) return
        grid[i] = back ? (grid[i] < 0 ? 1 : grid[i] - 1) : grid[i] >= 1 ? -1 : grid[i] + 1
        timing = true
        env.sfx('click')
        hero = 1
        setStat('Filled', `${grid.filter((v) => v >= 0).length}/${n * n}`)
        if (binairoSolved(grid, n)) win(n * n * 16)
      }
      return {
        init() {
          n = byDiff(env, [4, 6, 6], [6, 8, 8], [8, 10, 10])[level - 1]
          const g = genBinairo(n, rng, Math.round(n * n * byDiff(env, 0.5, 0.42, 0.36)))
          given = g.puzzle
          solution = g.solution
          grid = g.puzzle.slice()
          goal = 'No three alike in a row; equal counts; unique lines'
          btns = [
            {
              label: 'HINT', w: 112, h: 44, x: 0, y: 0, fn: () => {
                const wrong = grid.map((v, i) => (v !== solution[i] ? i : -1)).filter((i) => i >= 0)
                if (!wrong.length || solved) return
                const i = rng.pick(wrong)
                grid[i] = solution[i]
                given[i] = solution[i]
                hintCell = i
                hintT = 1
                mistakes++
                env.sfx('power')
                setStat('Filled', `${grid.filter((v) => v >= 0).length}/${n * n}`)
                if (binairoSolved(grid, n)) win(n * n * 10)
              },
            },
          ]
          setStat('Filled', `${grid.filter((v) => v >= 0).length}/${n * n}`)
        },
        primary(x, y) {
          tap(sqCell(n, x, y), false)
        },
        secondary(x, y) {
          tap(sqCell(n, x, y), true)
        },
        key() {},
        update(dt) {
          hintT = Math.max(0, hintT - dt)
        },
        draw() {
          board()
          const c = BS / n
          const bad = binairoErrors(grid, n)
          for (let i = 0; i < n * n; i++) {
            const x = BX + (i % n) * c
            const y = BY + Math.floor(i / n) * c
            const v = grid[i]
            const locked = given[i] >= 0
            roundRect(ctx, x + 2, y + 2, c - 4, c - 4, 8, v < 0 ? 'rgba(255,255,255,0.08)' : t.blocks[v === 0 ? 0 : 2], locked ? '#fff' : 'rgba(255,255,255,0.25)', locked ? 2.5 : 1.5)
            if (v >= 0) emoji(ctx, sym(v), x + c / 2, y + c / 2 + 1, c * 0.55)
            if (bad[i]) roundRect(ctx, x + 2, y + 2, c - 4, c - 4, 8, 'rgba(239,68,68,0.25)', t.danger, 3)
            if (hintT > 0 && i === hintCell) roundRect(ctx, x, y, c, c, 8, undefined, '#fff', 4)
          }
          if (solved) emoji(ctx, t.hero, BX + BS - 16, BY + 16, 30)
        },
      }
    }

    const M: M = mode === 'mines' ? mines() : mode === 'sudoku' ? sudoku() : mode === 'nonogram' ? nonogram() : mode === 'akari' ? akari() : binairo()

    // ----- layout of buttons -----
    const layoutButtons = () => {
      const x0 = portrait ? 20 : 504
      const x1 = portrait ? 380 : 632
      let x = x0
      let y = portrait ? BY + BS + 14 : 120
      let rowH = 0
      for (const b of btns) {
        if (x + b.w > x1 + 1) {
          x = x0
          y += rowH + 6
          rowH = 0
        }
        b.x = x
        b.y = y
        rowH = Math.max(rowH, b.h)
        x += b.w + 6
      }
    }
    const levelStart = () => {
      mistakes = 0
      time = 0
      timing = false
      solved = false
      lost = false
      btns = []
      flashCells = []
      M.init()
      layoutButtons()
      hud()
    }

    // ----- input -----
    st.canvas.style.touchAction = 'none'
    bag.on(st.canvas, 'contextmenu', (e) => e.preventDefault())
    let press: { x: number; y: number; held: boolean; moved: boolean; touch: boolean } | null = null
    let holdTimer: ReturnType<typeof setTimeout> | undefined
    bag.add(() => clearTimeout(holdTimer))
    bag.on(st.canvas, 'pointerdown', (e) => {
      st.canvas.focus({ preventScroll: true })
      const l = st.toLocal(e)
      try { st.canvas.setPointerCapture(e.pointerId) } catch { /* ignore */ }
      if (bannerT > 0 || lost) return
      for (const b of btns) {
        if (l.x >= b.x && l.x <= b.x + b.w && l.y >= b.y && l.y <= b.y + b.h) {
          b.fn()
          return
        }
      }
      const touch = e.pointerType !== 'mouse'
      press = { x: l.x, y: l.y, held: false, moved: false, touch }
      if (M.immediate) {
        M.down?.(l.x, l.y, e.button === 2)
        return
      }
      if (e.button === 2) {
        press.held = true
        M.secondary?.(l.x, l.y)
      } else if (touch) {
        holdTimer = setTimeout(() => {
          if (press && !press.moved) {
            press.held = true
            M.secondary?.(press.x, press.y)
            navigator.vibrate?.(20)
          }
        }, 420)
      }
    })
    bag.on(st.canvas, 'pointermove', (e) => {
      if (!press) return
      const l = st.toLocal(e)
      if (Math.hypot(l.x - press.x, l.y - press.y) > 10) press.moved = true
      if (M.immediate) M.drag?.(l.x, l.y)
    })
    const up = () => {
      clearTimeout(holdTimer)
      if (!press) return
      if (M.immediate) M.release?.()
      else if (!press.held && !press.moved && bannerT <= 0) M.primary?.(press.x, press.y)
      press = null
    }
    bag.on(st.canvas, 'pointerup', up)
    bag.on(st.canvas, 'pointercancel', up)
    k.onKey((e) => {
      if (bannerT > 0 || lost) return
      M.key(e.code)
    })

    const update = (dt: number) => {
      clock += dt
      intro = Math.max(0, intro - dt)
      hero = Math.max(0, hero - dt * 3)
      fx.update(dt, 260)
      shake.update(dt)
      flashCells = flashCells.filter((f) => (f.t -= dt) > 0)
      if (timing && !solved && !lost) {
        const s0 = Math.floor(time)
        time += dt
        if (Math.floor(time) !== s0) hud()
      }
      M.update(dt)
      if (bannerT > 0) {
        bannerT -= dt
        if (bannerT <= 0) {
          if (level >= LEVELS) finish(true, `All ${LEVELS} puzzles solved`)
          else {
            level++
            levelStart()
          }
        }
      }
    }

    const draw = () => {
      background(ctx, W, H, t, 35, 9)
      ctx.save()
      shake.apply(ctx)
      M.draw()
      fx.draw(ctx)
      ctx.restore()
      if (portrait) {
        text(ctx, `LEVEL ${level}/${LEVELS}`, 20, 22, { size: 10, color: t.accent, align: 'left' })
        text(ctx, `SCORE ${total}`, W - 20, 22, { size: 10, color: t.fg, align: 'right' })
        text(ctx, `${statLabel.toUpperCase()} ${statValue}`, 20, 52, { size: 10, color: t.fg, align: 'left' })
        text(ctx, fmt(time), W - 20, 52, { size: 10, color: t.fg, align: 'right' })
        text(ctx, goal.slice(0, 48), W / 2, 80, { size: 7, color: t.accent2 })
        emoji(ctx, t.hero, W / 2, 606 - Math.sin(hero * Math.PI) * 12, 40)
      } else {
        text(ctx, `LEVEL ${level}/${LEVELS}`, 78, 44, { size: 11, color: t.accent })
        text(ctx, statLabel.toUpperCase(), 78, 100, { size: 9, color: t.fg })
        text(ctx, statValue, 78, 126, { size: 20, color: t.fg })
        text(ctx, 'TIME', 78, 176, { size: 9, color: t.fg })
        text(ctx, fmt(time), 78, 200, { size: 16, color: t.fg })
        text(ctx, 'SCORE', 562, 40, { size: 10, color: t.accent })
        text(ctx, `${total}`, 562, 66, { size: 16, color: t.fg })
        text(ctx, goal.slice(0, 70), W / 2, H - 12, { size: 8, color: t.accent2 })
        emoji(ctx, t.hero, 78, 320 - Math.sin(hero * Math.PI) * 12, 44)
      }
      for (const b of btns) {
        const on = b.active?.() ?? false
        roundRect(ctx, b.x, b.y, b.w, b.h, 9, on ? t.accent2 : t.accent, on ? '#fff' : 'rgba(255,255,255,0.45)', on ? 3 : 2)
        text(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2, { size: b.label.length > 3 ? 8 : 12, color: '#fff', shadow: '#000' })
      }
      if (bannerT > 0) {
        ctx.globalAlpha = Math.min(1, (2.2 - bannerT) * 4)
        roundRect(ctx, W / 2 - 150, H / 2 - 32, 300, 64, 16, 'rgba(0,0,0,0.78)', t.good, 2)
        text(ctx, bannerS, W / 2, H / 2, { size: 17, color: '#fff', shadow: t.good })
        ctx.globalAlpha = 1
      }
      if (lost) {
        roundRect(ctx, W / 2 - 150, H / 2 - 32, 300, 64, 16, 'rgba(0,0,0,0.78)', t.danger, 2)
        text(ctx, 'BOOM!', W / 2, H / 2, { size: 20, color: '#fff', shadow: t.danger })
      }
      if (intro > 0) {
        ctx.globalAlpha = Math.min(1, intro)
        roundRect(ctx, W / 2 - 170, H / 2 - 36, 340, 72, 14, 'rgba(0,0,0,0.78)', t.accent, 2)
        text(ctx, env.name, W / 2, H / 2 - 12, { size: 13, color: '#fff' })
        text(ctx, goal.slice(0, 44), W / 2, H / 2 + 14, { size: 8, color: t.fg })
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
