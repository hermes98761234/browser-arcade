// Code: Lightbot-style programming puzzles. Build a MAIN program (and P1 / repeat blocks later), run it on an isometric board.
import { Bag, byDiff, clamp, createDom, createStage, emoji, lerp, loop, Particles, Shake, text, type Engine } from '../kit'
import { genLevel, run, type Level, type Op, type Prog, type RunResult } from '../logic/code'

const LEVELS = 10
const W = 480
const H = 340

const BLOCK: Record<Op, { g: string; label: string; c: string; ink?: string; key: string }> = {
  F: { g: '↑', label: 'Go', c: '#38bdf8', key: 'ArrowUp' },
  L: { g: '↶', label: 'Left', c: '#a78bfa', key: 'ArrowLeft' },
  R: { g: '↷', label: 'Right', c: '#a78bfa', key: 'ArrowRight' },
  J: { g: '⤴', label: 'Jump', c: '#fb923c', key: 'ArrowDown' },
  A: { g: '✦', label: 'Light', c: '#facc15', ink: '#3b2f00', key: 'KeyE' },
  P: { g: 'P1', label: 'Call', c: '#34d399', ink: '#032b1c', key: 'KeyP' },
  X2: { g: '×2', label: 'Repeat', c: '#f472b6', key: 'Digit2' },
  X3: { g: '×3', label: 'Repeat', c: '#f472b6', key: 'Digit3' },
  X4: { g: '×4', label: 'Repeat', c: '#f472b6', key: 'Digit4' },
}

const STYLE = `
.cde{display:flex;gap:10px;padding:10px;box-sizing:border-box;font-family:system-ui,sans-serif;user-select:none;-webkit-user-select:none;overflow:hidden}
.cde-board{flex:1 1 0;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:14px;background:rgba(0,0,0,.18)}
.cde-panel{flex:0 0 360px;display:flex;flex-direction:column;gap:8px;min-height:0;overflow:auto}
@media (max-aspect-ratio:1/1){.cde{flex-direction:column}.cde-board{flex:1 1 38%}.cde-panel{flex:1 1 62%}.cde-b,.cde-slot{width:44px;height:44px}.cde-slot .cde-b{width:40px;height:40px}}
.cde-row{display:flex;flex-wrap:wrap;gap:6px}
.cde-lab{font-size:11px;font-weight:800;letter-spacing:.08em;opacity:.8;display:flex;justify-content:space-between;padding:2px 4px;border-radius:6px;cursor:pointer}
.cde-lab.sel{background:rgba(255,255,255,.14);opacity:1}
.cde-prog{background:rgba(0,0,0,.25);border-radius:12px;padding:6px}
.cde-b{width:50px;height:50px;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-weight:800;line-height:1;touch-action:none;cursor:grab;box-shadow:0 3px 0 rgba(0,0,0,.35);transition:transform .08s,filter .15s}
.cde-b .g{font-size:20px}.cde-b .l{font-size:8px;margin-top:2px;opacity:.85;text-transform:uppercase;letter-spacing:.04em}
.cde-b:hover{filter:brightness(1.12)}
.cde-slot{width:50px;height:50px;border-radius:10px;border:2px dashed rgba(255,255,255,.22);box-sizing:border-box;display:flex;align-items:center;justify-content:center;position:relative}
.cde-slot.over{border-color:#fff;background:rgba(255,255,255,.15)}
.cde-slot.on{outline:3px solid #fff;box-shadow:0 0 14px #fff;transform:scale(1.1);z-index:2}
.cde-slot .cde-b{box-shadow:0 2px 0 rgba(0,0,0,.35);width:46px;height:46px}
.cde-slot .n{position:absolute;top:-1px;left:3px;font-size:8px;opacity:.5}
.cde-ctl{display:flex;gap:6px;flex-wrap:wrap}
.cde-btn{flex:1;min-width:64px;padding:9px 6px;border-radius:10px;border:0;font-weight:800;font-size:14px;cursor:pointer;color:#fff;box-shadow:0 3px 0 rgba(0,0,0,.35)}
.cde-btn:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.35)}
.cde-ghost{position:fixed;z-index:99;pointer-events:none;opacity:.9;transform:translate(-50%,-50%) scale(1.15)}
.cde-flash{animation:cdeflash .35s}
@keyframes cdeflash{0%,100%{transform:none}30%{transform:translateX(-5px)}70%{transform:translateX(5px)}}
`

type Key = 'M' | 'P'

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const f = (v: number) => clamp(Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt)), 0, 255)
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`
}

const engine: Engine = {
  start(env) {
    const { theme: t, rng, mods } = env
    const bag = new Bag()
    const style = document.createElement('style')
    style.textContent = STYLE
    document.head.appendChild(style)
    const root = createDom(env.host, t, 'cde')
    const board = document.createElement('div')
    board.className = 'cde-board'
    const panel = document.createElement('div')
    panel.className = 'cde-panel'
    root.append(board, panel)
    const st = createStage(board, W, H)
    const ctx = st.ctx
    const fx = new Particles()
    const shake = new Shake()

    const nameLc = `${env.name} ${env.desc}`.toLowerCase()
    const genOpts = {
      slack: byDiff(env, 2, 1, 0),
      loopWords: /loop|repeat|lagoon|turtle/.test(nameLc) || mods.has('rotate'),
      funcWords: /function|recurs|factory|forest|subroutine|procedure/.test(nameLc),
    }
    const stepDur = byDiff(env, 0.5, 0.42, 0.34) * (mods.has('fast') ? 0.7 : mods.has('slow') ? 1.4 : 1)

    // ---- state ----
    let levelNo = 0
    let level: Level
    let main: Prog = []
    let p1: Prog = []
    let sel: Key = 'M'
    let score = 0
    let hinted = false
    let fails = 0
    let time = 0
    let over = false
    let msg = ''
    let msgT = 0
    let clearT = 0 // >0 while celebrating a solved level
    let fast = false

    // visual robot
    const rob = { x: 0, y: 0, z: 0, a: 0, hop: 0 }
    let tr: RunResult | null = null
    let ti = 0 // steps completed
    let stepT = 0 // progress in the current step
    let playing = false
    let finished = false
    let from = { x: 0, y: 0, z: 0, dir: 0 }
    const litSet = new Set<number>()
    const litGlow = new Map<number, number>()
    let activeEl: HTMLElement | null = null

    const setMsg = (s: string, d = 2.5) => {
      msg = s
      msgT = d
    }

    // ---- DOM ----
    const mkBlock = (op: Op, small = false) => {
      const d = BLOCK[op]
      const b = document.createElement('div')
      b.className = 'cde-b'
      b.style.background = `linear-gradient(${shade(d.c, 0.18)},${d.c})`
      b.style.color = d.ink ?? '#fff'
      if (small) b.style.fontSize = '12px'
      b.innerHTML = `<span class="g">${d.g}</span><span class="l">${d.label}</span>`
      b.dataset.op = op
      return b
    }
    const progOf = (k: Key) => (k === 'M' ? main : p1)

    const palEl = document.createElement('div')
    palEl.className = 'cde-row cde-prog'
    const mainLab = document.createElement('div')
    mainLab.className = 'cde-lab'
    const mainRow = document.createElement('div')
    mainRow.className = 'cde-row cde-prog'
    const p1Lab = document.createElement('div')
    p1Lab.className = 'cde-lab'
    const p1Row = document.createElement('div')
    p1Row.className = 'cde-row cde-prog'
    const ctl = document.createElement('div')
    ctl.className = 'cde-ctl'
    const mkBtn = (label: string, c: string, fn: () => void) => {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'cde-btn'
      b.style.background = c
      b.textContent = label
      b.addEventListener('click', fn)
      ctl.appendChild(b)
      return b
    }
    const runBtn = mkBtn('▶ Run', '#22c55e', () => startRun(false))
    mkBtn('⏭ Step', '#3b82f6', () => startRun(true))
    mkBtn('↺ Reset', '#64748b', () => resetRun(true))
    const fastBtn = mkBtn('»', '#8b5cf6', () => {
      fast = !fast
      fastBtn.style.outline = fast ? '3px solid #fff' : ''
    })
    fastBtn.style.flex = '0 0 44px'
    fastBtn.style.minWidth = '44px'
    const hintBtn = mkBtn('💡', '#f59e0b', () => hint())
    hintBtn.style.flex = '0 0 44px'
    hintBtn.style.minWidth = '44px'
    panel.append(palEl, mainLab, mainRow, p1Lab, p1Row, ctl)

    mainLab.addEventListener('click', () => select('M'))
    p1Lab.addEventListener('click', () => select('P'))
    const select = (k: Key) => {
      if (k === 'P' && level.p1Slots === 0) return
      sel = k
      mainLab.classList.toggle('sel', k === 'M')
      p1Lab.classList.toggle('sel', k === 'P')
    }

    const slotEls: Record<Key, HTMLElement[]> = { M: [], P: [] }

    const renderProgs = () => {
      for (const k of ['M', 'P'] as const) {
        const row = k === 'M' ? mainRow : p1Row
        row.textContent = ''
        slotEls[k] = []
        const prog = progOf(k)
        prog.forEach((op, i) => {
          const s = document.createElement('div')
          s.className = 'cde-slot'
          s.dataset.k = k
          s.dataset.i = String(i)
          const n = document.createElement('span')
          n.className = 'n'
          n.textContent = String(i + 1)
          s.appendChild(n)
          if (op) {
            const b = mkBlock(op)
            b.dataset.src = `${k}${i}`
            s.appendChild(b)
          }
          row.appendChild(s)
          slotEls[k].push(s)
        })
      }
      const used = main.filter(Boolean).length + p1.filter(Boolean).length
      mainLab.innerHTML = `<span>MAIN</span><span>${main.filter(Boolean).length}/${level.mainSlots}</span>`
      p1Lab.innerHTML = `<span>P1 · function</span><span>${p1.filter(Boolean).length}/${level.p1Slots}</span>`
      p1Lab.style.display = p1Row.style.display = level.p1Slots ? '' : 'none'
      env.status(`Level ${levelNo + 1}/${LEVELS} · Blocks ${used}/${level.mainSlots + level.p1Slots}`)
      activeEl = null
    }
    const renderPalette = () => {
      palEl.textContent = ''
      for (const op of level.ops) {
        const b = mkBlock(op)
        b.dataset.pal = op
        palEl.appendChild(b)
      }
    }

    // ---- drag & click ----
    let ghost: HTMLElement | null = null
    let overEl: HTMLElement | null = null
    const slotAt = (x: number, y: number): HTMLElement | null => {
      const e = document.elementFromPoint(x, y) as HTMLElement | null
      return (e?.closest('.cde-slot') as HTMLElement | null) ?? null
    }
    const place = (k: Key, i: number, op: Op | null): boolean => {
      if (k === 'P' && op === 'P') {
        setMsg('P1 cannot call itself')
        return false
      }
      progOf(k)[i] = op
      return true
    }
    const afterEdit = () => {
      resetRun(false)
      renderProgs()
    }
    const clickAdd = (op: Op) => {
      let k = sel
      let i = progOf(k).indexOf(null)
      if (i < 0 || (k === 'P' && op === 'P')) {
        const o: Key = k === 'M' ? 'P' : 'M'
        const j = level.p1Slots || o === 'M' ? progOf(o).indexOf(null) : -1
        if (j >= 0 && !(o === 'P' && op === 'P')) {
          k = o
          i = j
        } else {
          setMsg(i < 0 ? 'Program is full. Remove a block first.' : 'P1 cannot call itself')
          flash(k === 'M' ? mainRow : p1Row)
          env.sfx('hit')
          return
        }
      }
      place(k, i, op)
      env.sfx('click')
      afterEdit()
    }
    const flash = (el: HTMLElement) => {
      el.classList.remove('cde-flash')
      void el.offsetWidth
      el.classList.add('cde-flash')
    }
    const onDown = (e: PointerEvent) => {
      if (over || clearT > 0) return
      const target = (e.target as HTMLElement).closest('.cde-b') as HTMLElement | null
      if (!target) return
      e.preventDefault()
      const pal = target.dataset.pal as Op | undefined
      const src = target.dataset.src
      const op = (pal ?? target.dataset.op) as Op
      const sx = e.clientX
      const sy = e.clientY
      let dragging = false
      const move = (m: PointerEvent) => {
        if (!dragging && Math.hypot(m.clientX - sx, m.clientY - sy) > 6) {
          dragging = true
          ghost = mkBlock(op)
          ghost.classList.add('cde-ghost')
          document.body.appendChild(ghost)
        }
        if (dragging && ghost) {
          ghost.style.left = `${m.clientX}px`
          ghost.style.top = `${m.clientY}px`
          const s = slotAt(m.clientX, m.clientY)
          if (s !== overEl) {
            overEl?.classList.remove('over')
            overEl = s
            s?.classList.add('over')
          }
        }
      }
      const cleanup = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', up)
        ghost?.remove()
        ghost = null
        overEl?.classList.remove('over')
        overEl = null
      }
      const up = (u: PointerEvent) => {
        const s = dragging ? slotAt(u.clientX, u.clientY) : null
        cleanup()
        if (!dragging) {
          if (pal) clickAdd(pal)
          else if (src) {
            place(src[0] as Key, Number(src.slice(1)), null)
            env.sfx('move')
            afterEdit()
          }
          return
        }
        if (s) {
          const k = s.dataset.k as Key
          const i = Number(s.dataset.i)
          const prev = progOf(k)[i]
          if (place(k, i, op)) {
            if (src) place(src[0] as Key, Number(src.slice(1)), prev && !(src[0] === 'P' && prev === 'P') ? prev : null)
            env.sfx('click')
          }
          afterEdit()
        } else if (src) {
          place(src[0] as Key, Number(src.slice(1)), null)
          env.sfx('move')
          afterEdit()
        }
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', up)
      bag.add(cleanup)
    }
    panel.addEventListener('pointerdown', onDown)

    bag.on(window, 'keydown', (e) => {
      if (over) return
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault()
      if (e.code === 'Enter' || e.code === 'Space') return void startRun(false)
      if (e.code === 'KeyN') return void startRun(true)
      if (e.code === 'KeyR') return void resetRun(true)
      if (e.code === 'Backspace') {
        const prog = progOf(sel)
        for (let i = prog.length - 1; i >= 0; i--)
          if (prog[i]) {
            prog[i] = null
            break
          }
        return afterEdit()
      }
      if (e.code === 'Tab') {
        e.preventDefault()
        return select(sel === 'M' ? 'P' : 'M')
      }
      for (const op of level.ops) if (BLOCK[op].key === e.code) clickAdd(op)
    })

    // ---- level flow ----
    const loadLevel = () => {
      level = genLevel(levelNo, genOpts, rng)
      main = new Array<Op | null>(level.mainSlots).fill(null)
      p1 = new Array<Op | null>(level.p1Slots).fill(null)
      hinted = false
      fails = 0
      sel = 'M'
      select('M')
      renderPalette()
      renderProgs()
      resetRun(false)
      const msgs = ['Build a program, then press Run. Light every glowing tile.', '', '', 'New: Jump ⤴ climbs or drops one step.', '', 'New: Repeat blocks run the next block several times.', '', 'New: P1 is a function. Fill it, then call it from MAIN.']
      setMsg(msgs[levelNo] ?? '', 4)
    }

    const resetRun = (user: boolean) => {
      tr = null
      ti = 0
      stepT = 0
      playing = false
      finished = false
      litSet.clear()
      litGlow.clear()
      const s = level.start
      rob.x = s.x
      rob.y = s.y
      rob.z = level.heights[s.y * level.w + s.x]
      rob.a = s.dir
      rob.hop = 0
      from = { x: s.x, y: s.y, z: rob.z, dir: s.dir }
      activeEl?.classList.remove('on')
      activeEl = null
      if (user) {
        env.sfx('click')
        msg = ''
      }
    }

    const startRun = (stepOnly: boolean) => {
      if (over || clearT > 0) return
      if (!tr || finished) {
        resetRun(false)
        if (!main.some(Boolean)) {
          setMsg('Add some blocks first!')
          flash(mainRow)
          return
        }
        tr = run(level, main, p1)
        if (tr.truncated) setMsg('That program runs too long, stopping early.')
      }
      playing = !stepOnly
      if (stepOnly && stepT === 0) stepT = 0.0001
      if (!stepOnly) env.sfx('click')
    }

    const hint = () => {
      if (over || clearT > 0) return
      main = main.map((_, i) => level.solution.main[i] ?? null)
      p1 = p1.map((_, i) => level.solution.p1[i] ?? null)
      if (!hinted) score = Math.max(0, score - 20)
      hinted = true
      env.score(score)
      setMsg('Solution loaded (-20). Press Run!')
      env.sfx('power')
      afterEdit()
    }

    const completeLevel = () => {
      const used = main.filter(Boolean).length + p1.filter(Boolean).length
      const slots = level.mainSlots + level.p1Slots
      const gain = hinted ? 30 : 100 + (slots - used) * 15 + Math.max(0, 3 - fails) * 10
      score += gain
      env.score(score)
      env.sfx('win')
      clearT = 1.9
      setMsg(`Level clear! +${gain}`, 2)
      shake.kick(4)
      for (const g of level.goals) {
        const p = proj(g % level.w + 0.5, Math.floor(g / level.w) + 0.5, level.heights[g] + 0.2)
        fx.burst(p.x, p.y, '#fde047', 14, 180, 4)
      }
    }

    const finishRun = () => {
      finished = true
      playing = false
      activeEl?.classList.remove('on')
      activeEl = null
      if (tr && tr.solved) completeLevel()
      else {
        fails++
        const left = level.goals.length - litSet.size
        setMsg(left ? `${left} tile${left > 1 ? 's' : ''} still dark. Press Reset and adjust.` : 'Try again!', 3)
        env.sfx('hit')
        shake.kick(3)
      }
    }

    // ---- projection ----
    let tw = 60
    let th = 30
    let hh = 20
    let ox = W / 2
    let oy = 60
    const layout = () => {
      const { w, h } = level
      tw = Math.min(84, 840 / (w + h))
      th = tw / 2
      hh = th * 0.75
      const maxZ = Math.max(0, ...level.heights)
      const top = maxZ * hh
      const total = ((w + h) * th) / 2 + top + hh * 0.5
      ox = W / 2 + ((h - w) * tw) / 4
      oy = (H - 30 - total) / 2 + 20 + top
    }
    const proj = (gx: number, gy: number, z: number) => ({ x: ox + ((gx - gy) * tw) / 2, y: oy + ((gx + gy) * th) / 2 - z * hh })

    // ---- update ----
    const applyStepEnd = (i: number) => {
      const s = tr!.steps[i]
      from = { x: s.x, y: s.y, z: s.z, dir: s.dir }
      const p = proj(s.x + 0.5, s.y + 0.5, s.z)
      if (s.lit >= 0) {
        litSet.add(s.lit)
        litGlow.set(s.lit, 1)
        env.sfx('point')
        const q = proj((s.lit % level.w) + 0.5, Math.floor(s.lit / level.w) + 0.5, s.z)
        fx.burst(q.x, q.y, '#fde047', 18, 150, 3.5)
        fx.burst(q.x, q.y, t.accent, 8, 100, 3)
      } else if (s.bump) {
        env.sfx('hit')
        shake.kick(2)
        fx.burst(p.x, p.y, t.danger, 6, 80, 2.5)
      } else if (s.op === 'A') env.sfx('click')
    }

    const update = (dt: number) => {
      time += dt
      fx.update(dt)
      shake.update(dt)
      if (msgT > 0) msgT -= dt
      for (const [k, v] of litGlow) litGlow.set(k, Math.max(0, v - dt * 0.8))
      if (clearT > 0) {
        clearT -= dt
        if (clearT <= 0) {
          levelNo++
          if (levelNo >= LEVELS) {
            over = true
            env.sfx('win')
            env.end({ score, won: true, text: `All ${LEVELS} levels solved!` })
          } else loadLevel()
        }
        return
      }
      if (!tr || finished) {
        rob.hop *= 0.8
        return
      }
      if (stepT > 0 || playing) {
        if (ti >= tr.steps.length) {
          finishRun()
          return
        }
        const s = tr.steps[ti]
        if (stepT === 0) {
          // starting a step: sound + highlight
          activeEl?.classList.remove('on')
          activeEl = slotEls[s.fn === 'M' ? 'M' : 'P'][s.slot] ?? null
          activeEl?.classList.add('on')
          if (s.op === 'F') env.sfx('move')
          else if (s.op === 'J') env.sfx('jump')
          else if (s.op === 'L' || s.op === 'R') env.sfx('click')
          stepT = 0.0001
        }
        const dur = fast ? stepDur * 0.4 : stepDur
        stepT += dt / dur
        const k = clamp(stepT, 0, 1)
        const e = k * k * (3 - 2 * k)
        rob.x = lerp(from.x, s.x, e)
        rob.y = lerp(from.y, s.y, e)
        let da = (s.dir - from.dir + 4) % 4
        if (da === 3) da = -1
        rob.a = from.dir + da * e
        rob.z = lerp(from.z, s.z, e)
        rob.hop = s.op === 'J' && s.moved ? Math.sin(k * Math.PI) * 0.9 : s.moved ? Math.sin(k * Math.PI) * 0.18 : s.bump ? Math.sin(k * Math.PI * 3) * 0.1 : 0
        if (stepT >= 1) {
          applyStepEnd(ti)
          ti++
          stepT = 0
          rob.x = s.x
          rob.y = s.y
          rob.z = s.z
          rob.a = s.dir
          if (ti >= tr.steps.length) finishRun()
          else if (!playing) activeEl?.classList.add('on')
        }
      }
    }

    // ---- draw ----
    const diamond = (gx: number, gy: number, z: number, fill: string) => {
      const a = proj(gx, gy, z)
      const b = proj(gx + 1, gy, z)
      const c = proj(gx + 1, gy + 1, z)
      const d = proj(gx, gy + 1, z)
      ctx.fillStyle = fill
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.lineTo(c.x, c.y)
      ctx.lineTo(d.x, d.y)
      ctx.closePath()
      ctx.fill()
    }
    const side = (p: [number, number], q: [number, number], z1: number, z0: number, fill: string) => {
      const a = proj(p[0], p[1], z1)
      const b = proj(q[0], q[1], z1)
      const c = proj(q[0], q[1], z0)
      const d = proj(p[0], p[1], z0)
      ctx.fillStyle = fill
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.lineTo(c.x, c.y)
      ctx.lineTo(d.x, d.y)
      ctx.closePath()
      ctx.fill()
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const g = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W * 0.6)
      g.addColorStop(0, shade(t.bg2, 0.12))
      g.addColorStop(1, t.bg)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      layout()
      ctx.save()
      shake.apply(ctx)
      const { w, h } = level
      const goalSet = new Set(level.goals)
      for (let s = 0; s < w + h - 1; s++) {
        for (let x = 0; x < w; x++) {
          const y = s - x
          if (y < 0 || y >= h) continue
          const idx = y * w + x
          const z = level.heights[idx]
          const base = t.blocks[z % t.blocks.length]
          const chk = (x + y) % 2 ? 0.07 : -0.03
          const zb = -0.35
          side([x, y + 1], [x + 1, y + 1], z, zb, shade(base, -0.35))
          side([x + 1, y + 1], [x + 1, y], z, zb, shade(base, -0.5))
          diamond(x, y, z, shade(base, chk + (z ? 0.05 * z : 0)))
          if (goalSet.has(idx)) {
            const on = litSet.has(idx)
            const c = proj(x + 0.5, y + 0.5, z)
            const glow = litGlow.get(idx) ?? 0
            ctx.save()
            ctx.translate(c.x, c.y)
            ctx.scale(1, 0.5)
            ctx.beginPath()
            ctx.arc(0, 0, tw * 0.3, 0, Math.PI * 2)
            if (on) {
              ctx.shadowColor = '#fde047'
              ctx.shadowBlur = 14 + glow * 20
              ctx.fillStyle = '#fde047'
              ctx.fill()
            } else {
              ctx.fillStyle = 'rgba(0,0,0,.28)'
              ctx.fill()
              ctx.lineWidth = 3
              ctx.strokeStyle = t.accent2
              ctx.globalAlpha = 0.65 + 0.35 * Math.sin(time * 4 + idx)
              ctx.stroke()
            }
            ctx.restore()
            if (!on) emoji(ctx, t.items[level.goals.indexOf(idx) % t.items.length], c.x, c.y - tw * 0.2 + Math.sin(time * 3 + idx) * 2, tw * 0.42)
          } else if (idx === level.start.y * w + level.start.x) {
            const c = proj(x + 0.5, y + 0.5, z)
            ctx.save()
            ctx.translate(c.x, c.y)
            ctx.scale(1, 0.5)
            ctx.strokeStyle = 'rgba(255,255,255,.35)'
            ctx.setLineDash([5, 4])
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(0, 0, tw * 0.28, 0, Math.PI * 2)
            ctx.stroke()
            ctx.restore()
          }
        }
      }
      // robot
      const rp = proj(rob.x + 0.5, rob.y + 0.5, rob.z)
      ctx.fillStyle = 'rgba(0,0,0,.35)'
      ctx.beginPath()
      ctx.ellipse(rp.x, rp.y, tw * 0.22 * (1 - rob.hop * 0.25), tw * 0.1 * (1 - rob.hop * 0.25), 0, 0, Math.PI * 2)
      ctx.fill()
      // facing marker
      const ang = (rob.a * Math.PI) / 2
      const tp = proj(rob.x + 0.5 + Math.cos(ang) * 0.5, rob.y + 0.5 + Math.sin(ang) * 0.5, rob.z)
      const pl = proj(rob.x + 0.5 + Math.cos(ang) * 0.3 - Math.sin(ang) * 0.12, rob.y + 0.5 + Math.sin(ang) * 0.3 + Math.cos(ang) * 0.12, rob.z)
      const pr = proj(rob.x + 0.5 + Math.cos(ang) * 0.3 + Math.sin(ang) * 0.12, rob.y + 0.5 + Math.sin(ang) * 0.3 - Math.cos(ang) * 0.12, rob.z)
      ctx.fillStyle = t.accent
      ctx.shadowColor = t.accent
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.moveTo(tp.x, tp.y)
      ctx.lineTo(pl.x, pl.y)
      ctx.lineTo(pr.x, pr.y)
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 0
      const sz = tw * 0.6
      const lift = rob.hop * hh
      emoji(ctx, t.hero, rp.x, rp.y - sz * 0.38 - lift, sz * (1 + rob.hop * 0.06))
      fx.draw(ctx)
      ctx.restore()
      // overlays
      text(ctx, `LEVEL ${levelNo + 1}`, 12, 16, { size: 10, color: t.fg, align: 'left' })
      if (time < 2.4 && levelNo === 0) {
        ctx.globalAlpha = clamp(2.4 - time, 0, 1)
        text(ctx, env.name.toUpperCase(), W / 2, 36, { size: 14, color: t.accent, shadow: t.accent })
        ctx.globalAlpha = 1
      }
      if (msg && msgT > 0) {
        ctx.globalAlpha = clamp(msgT * 2, 0, 1)
        ctx.font = '700 13px system-ui, sans-serif'
        const tw2 = ctx.measureText(msg).width + 24
        ctx.fillStyle = 'rgba(0,0,0,.6)'
        ctx.beginPath()
        ctx.roundRect(W / 2 - tw2 / 2, H - 34, tw2, 26, 13)
        ctx.fill()
        text(ctx, msg, W / 2, H - 21, { size: 13, color: '#fff', font: 'system-ui, sans-serif' })
        ctx.globalAlpha = 1
      }
      if (clearT > 0) {
        const k = clamp((1.9 - clearT) * 4, 0, 1)
        text(ctx, 'LEVEL CLEAR!', W / 2, 44, { size: 20 * k, color: '#fde047', shadow: '#f59e0b' })
        emoji(ctx, '⭐', W / 2 - 130, 44, 26 * k, Math.sin(time * 6) * 0.3)
        emoji(ctx, '⭐', W / 2 + 130, 44, 26 * k, -Math.sin(time * 6) * 0.3)
      }
    }

    loadLevel()
    env.score(0)
    runBtn.focus({ preventScroll: true })
    const lp = loop(update, draw)
    return {
      pause: (p) => lp.pause(p),
      destroy() {
        lp.stop()
        bag.dispose()
        ghost?.remove()
        st.dispose()
        root.remove()
        style.remove()
      },
    }
  },
}

export default engine
