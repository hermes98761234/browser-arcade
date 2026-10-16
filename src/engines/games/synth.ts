// Synth: step sequencer / drum machine / piano / theremin music toy built on the shared Web Audio context.
import { Bag, clamp, createDom, createStage, emoji, lerp, loop, makeRng, Particles, roundRect, text, type Engine, type GameEnv, type Stage } from '../kit'
import { audio, isMuted, tone } from '../sound'

const STEPS = 16
const MAJ = [0, 2, 4, 7, 9]
const MIN = [0, 3, 5, 7, 10]
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const midiFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12)
const midiName = (m: number) => `${NOTE_NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`
const TIMBRES = ['Synth', 'Bell', 'Pluck'] as const
const TIMBRE_ICON = ['🎹', '🔔', '🪕']

const STYLE = `
.syn{display:flex;flex-direction:column;font-family:system-ui,sans-serif;user-select:none;-webkit-user-select:none;overflow:hidden}
.syn-bar{display:flex;flex-wrap:wrap;gap:6px;padding:6px 8px;align-items:center;background:rgba(0,0,0,.38);flex:0 0 auto}
.syn-cv{flex:1 1 0;min-height:0;display:flex;align-items:center;justify-content:center;padding:4px;box-sizing:border-box}
.syn-b{min-width:38px;height:36px;padding:0 10px;border-radius:9px;border:2px solid transparent;background:rgba(255,255,255,.12);color:#fff;font-size:16px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;font-weight:700;touch-action:manipulation}
.syn-b small{font-size:11px}
.syn-b:hover{background:rgba(255,255,255,.22)}
.syn-b.on{background:var(--g-accent);color:#071018;border-color:#fff}
.syn-sl{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#fff}
.syn-sl input{width:110px;accent-color:var(--g-accent)}
@media (pointer:coarse),(max-width:700px){.syn-bar{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;gap:5px}.syn-bar>*{flex:0 0 auto}.syn-b{min-width:42px;height:42px}.syn-b small{display:none}}
`

// ---------- drums ----------
let noiseBuf: AudioBuffer | null = null
function noiseSrc(a: AudioContext): AudioBufferSourceNode {
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = a.createBufferSource()
  s.buffer = noiseBuf
  return s
}
function noiseHit(a: AudioContext, t: number, dur: number, vol: number, type: BiquadFilterType, freq: number, q = 0.7) {
  const s = noiseSrc(a)
  const f = a.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  const g = a.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  s.connect(f).connect(g).connect(a.destination)
  s.start(t, Math.random() * 0.5)
  s.stop(t + dur + 0.02)
}
const DRUMS = ['Kick', 'Snare', 'Clap', 'Hat', 'Open', 'Tom', 'Tom hi', 'Bell']
/** Play a drum voice at absolute audio time t. */
function drum(kind: number, t: number) {
  if (isMuted()) return
  const a = audio()
  if (!a) return
  const w = Math.max(0, t - a.currentTime)
  switch (kind) {
    case 0: tone(160, 0.22, 'sine', 0.5, -115, w); tone(60, 0.18, 'sine', 0.3, 0, w); break
    case 1: noiseHit(a, t, 0.17, 0.3, 'highpass', 1400); tone(200, 0.1, 'triangle', 0.18, -60, w); break
    case 2: for (let i = 0; i < 3; i++) noiseHit(a, t + i * 0.012, 0.05 + (i === 2 ? 0.1 : 0), 0.22, 'bandpass', 1600, 1.2); break
    case 3: noiseHit(a, t, 0.045, 0.16, 'highpass', 7500); break
    case 4: noiseHit(a, t, 0.28, 0.14, 'highpass', 6500); break
    case 5: tone(130, 0.28, 'sine', 0.4, -70, w); break
    case 6: tone(220, 0.22, 'sine', 0.36, -110, w); break
    default: tone(560, 0.18, 'square', 0.05, 0, w); tone(845, 0.18, 'square', 0.05, 0, w)
  }
}

/** Pitched note at absolute audio time t. */
function note(freq: number, t: number, timbre: number, vol = 0.09, len = 0.22) {
  if (isMuted()) return
  const a = audio()
  if (!a) return
  const w = Math.max(0, t - a.currentTime)
  if (timbre === 0) {
    tone(freq, len * 1.6, 'sawtooth', vol * 0.55, 0, w)
    tone(freq * 1.006, len * 1.6, 'square', vol * 0.3, 0, w)
  } else if (timbre === 1) {
    tone(freq, len * 6, 'sine', vol * 1.2, 0, w)
    tone(freq * 2.76, len * 2, 'sine', vol * 0.35, 0, w)
    tone(freq * 5.4, 0.12, 'sine', vol * 0.18, 0, w)
  } else {
    tone(freq, len * 3, 'triangle', vol * 1.3, 0, w)
    tone(freq * 2, 0.07, 'square', vol * 0.35, 0, w)
  }
}

type Sub = 'seq' | 'drum' | 'piano' | 'theremin'

const engine: Engine = {
  start(env) {
    const nm = `${env.name} ${env.desc}`.toLowerCase()
    const sub: Sub = /theremin|hover/.test(nm) ? 'theremin' : /drum|beat/.test(nm) ? 'drum' : /piano|keys|kalimba|xylophone|keyboard/.test(nm) || env.mods.has('key') ? 'piano' : 'seq'
    const bag = new Bag()
    const style = document.createElement('style')
    style.textContent = STYLE
    document.head.appendChild(style)
    const root = createDom(env.host, env.theme, 'syn')
    root.style.overflow = 'hidden'
    const bar = document.createElement('div')
    bar.className = 'syn-bar'
    const cvHost = document.createElement('div')
    cvHost.className = 'syn-cv'
    root.append(bar, cvHost)
    const hr = env.host.getBoundingClientRect()
    const portrait = hr.height > hr.width * 1.05
    const st = createStage(cvHost, portrait ? 540 : 960, portrait ? 760 : 540)
    audio()
    const m = sub === 'piano' ? pianoMode(env, st, bar, bag, nm, portrait) : sub === 'theremin' ? thereminMode(env, st, bar, bag, nm) : seqMode(env, st, bar, bag, nm, sub === 'drum')
    const lp = loop(m.update, m.draw)
    return {
      pause: (p) => {
        lp.pause(p)
        m.pause?.(p)
      },
      destroy() {
        lp.stop()
        m.destroy()
        bag.dispose()
        st.dispose()
        root.remove()
        style.remove()
      },
    }
  },
}
export default engine

interface Mode {
  update(dt: number): void
  draw(): void
  destroy(): void
  pause?(p: boolean): void
}

function mkBtn(bar: HTMLElement, label: string, title: string, fn: () => void, small = ''): HTMLButtonElement {
  const b = document.createElement('button')
  b.type = 'button'
  b.className = 'syn-b'
  b.innerHTML = small ? `${label}<small>${small}</small>` : label
  b.title = title
  b.addEventListener('click', fn)
  bar.appendChild(b)
  return b
}
function mkSlider(bar: HTMLElement, label: string, min: number, max: number, val: number, fn: (v: number) => void): HTMLInputElement {
  const w = document.createElement('label')
  w.className = 'syn-sl'
  const s = document.createElement('span')
  s.textContent = label
  const i = document.createElement('input')
  i.type = 'range'
  i.min = String(min)
  i.max = String(max)
  i.value = String(val)
  i.addEventListener('input', () => fn(Number(i.value)))
  w.append(s, i)
  bar.appendChild(w)
  return i
}
function timbreFor(nm: string): number {
  return /kalimba|chime|bell|glass|xylophone|music box|marimba|raindrop/.test(nm) ? 1 : /harp|string|pluck|guitar|banjo/.test(nm) ? 2 : 0
}
function bgFill(ctx: CanvasRenderingContext2D, w: number, h: number, env: GameEnv) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, env.theme.bg)
  g.addColorStop(1, env.theme.bg2)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

// ======================================================================
// Step sequencer + drum machine
// ======================================================================
function seqMode(env: GameEnv, st: Stage, bar: HTMLElement, bag: Bag, nm: string, drumOnly: boolean): Mode {
  const { ctx, w: W, h: H } = st
  const t = env.theme
  const rng = makeRng(env.seed)
  const minor = ['horror', 'cyberpunk', 'wasteland', 'halloween', 'myth', 'ninja'].includes(t.id) || /whale|dark|haunt/.test(nm)
  const scale = minor ? MIN : MAJ
  const root = rng.pick([45, 48, 50, 52, 53, 55]) + 12
  const NR = drumOnly ? 0 : 8
  const ND = drumOnly ? 8 : 3
  const noteMidi = (r: number) => root + 12 * Math.floor(r / 5) + scale[r % 5]
  const notes: boolean[][] = Array.from({ length: NR }, () => new Array<boolean>(STEPS).fill(false))
  const drums: boolean[][] = Array.from({ length: ND }, () => new Array<boolean>(STEPS).fill(false))
  const pulse: number[][] = Array.from({ length: NR + ND }, () => new Array<number>(STEPS).fill(0))
  const fx = new Particles()
  let bpm = Math.round(clamp(rng.int(96, 124) + (env.mods.has('fast') ? 24 : 0) - (env.mods.has('slow') || env.mods.has('zen') ? 24 : 0), 60, 200))
  let timbre = timbreFor(nm)
  let playing = true
  let step = 0
  let nextTime = 0
  let started = false
  let cur = -1
  let time = 0
  let played = 0
  const queue: { step: number; t: number }[] = []
  const bounce = { v: 0 }

  const seedPattern = () => {
    for (const r of notes) r.fill(false)
    for (const r of drums) r.fill(false)
    if (drumOnly) {
      const kicks = rng.pick([[0, 4, 8, 12], [0, 3, 8, 10], [0, 6, 8, 14], [0, 4, 7, 8, 12]])
      for (const s of kicks) drums[0][s] = true
      for (const s of [4, 12]) drums[1][s] = true
      for (let s = 2; s < 16; s += 4) drums[3][s] = true
      for (let s = 0; s < 16; s += 2) if (rng.chance(0.7)) drums[3][s] = true
      drums[4][14] = true
      for (const s of [7, 15]) if (rng.chance(0.6)) drums[2][s] = true
      for (const s of [3, 11]) if (rng.chance(0.6)) drums[5][s] = true
      for (let s = 0; s < 16; s++) if (rng.chance(0.07)) drums[6][s] = true
      for (const s of [2, 10]) if (rng.chance(0.5)) drums[7][s] = true
      return
    }
    // melody: a random walk over the scale on rhythmic positions; bass on strong beats
    let r = rng.int(3, 5)
    const pos = rng.pick([[0, 3, 6, 8, 11, 14], [0, 2, 4, 6, 8, 10, 12, 14], [0, 3, 4, 8, 11, 12], [0, 2, 3, 6, 8, 10, 11, 14]])
    for (const s of pos) {
      r = clamp(r + rng.pick([-2, -1, -1, 0, 1, 1, 2]), 2, NR - 1)
      notes[r][s] = true
    }
    for (const s of [0, 8]) notes[0][s] = true
    if (rng.chance(0.7)) notes[rng.int(0, 2)][rng.pick([4, 12])] = true
    for (const s of [0, 4, 8, 12]) if (rng.chance(0.85)) drums[0][s] = true
    for (const s of [4, 12]) drums[1][s] = true
    for (let s = 2; s < 16; s += 4) drums[2][s] = true
    for (let s = 0; s < 16; s += 2) if (rng.chance(0.5)) drums[2][s] = true
  }
  seedPattern()

  // ---- scheduler ----
  const clock = () => {
    const a = audio()
    return a && a.state === 'running' ? a.currentTime : performance.now() / 1000
  }
  nextTime = clock() + 0.12
  const triggerStep = (s: number, when: number) => {
    const spd = 60 / bpm / 4
    for (let r = 0; r < NR; r++)
      if (notes[r][s]) {
        note(midiFreq(noteMidi(r)), when, timbre, 0.085, spd * 2.2)
        played++
      }
    for (let r = 0; r < ND; r++)
      if (drums[r][s]) {
        drum(drumOnly ? r : [0, 1, 3][r], when)
        played++
      }
  }
  const schedule = () => {
    if (!playing) return
    const now = clock()
    if (nextTime < now - 0.3) nextTime = now + 0.05
    while (nextTime < now + 0.14) {
      queue.push({ step, t: nextTime })
      triggerStep(step, nextTime)
      nextTime += 60 / bpm / 4
      step = (step + 1) % STEPS
    }
  }
  bag.interval(schedule, 25)
  schedule()

  // ---- layout ----
  const portrait = H > W
  const mL = portrait ? 46 : 80
  const top = portrait ? 74 : 64
  const gx = 12
  const cw = (W - mL - gx) / STEPS
  const gap = NR && ND ? 14 : 0
  const rows = NR + ND
  const rh = (H - top - 14 - gap) / rows
  const rowY = (r: number) => top + r * rh + (NR && r >= NR ? gap : 0)
  const rowCol = (r: number) => (drumOnly ? t.blocks[r % t.blocks.length] : r < NR ? t.blocks[r % t.blocks.length] : [t.danger, t.accent2, t.accent][r - NR])
  const cellAt = (x: number, y: number) => {
    const c = Math.floor((x - mL) / cw)
    if (c < 0 || c >= STEPS) return null
    for (let r = 0; r < rows; r++) if (y >= rowY(r) && y < rowY(r) + rh) return { r, c }
    return null
  }
  const get = (r: number, c: number) => (r < NR ? notes[r][c] : drums[r - NR][c])
  const setCell = (r: number, c: number, v: boolean) => {
    if (r < NR) notes[r][c] = v
    else drums[r - NR][c] = v
  }
  const audition = (r: number) => {
    const a = audio()
    if (!a) return
    if (r < NR) note(midiFreq(noteMidi(r)), a.currentTime, timbre, 0.09, 0.2)
    else drum(drumOnly ? r - NR : [0, 1, 3][r - NR], a.currentTime)
  }
  let paint: boolean | null = null
  let lastCell = ''
  const press = (e: PointerEvent) => {
    const p = st.toLocal(e)
    started = true
    if (p.x < mL && p.x >= 0) {
      for (let r = 0; r < rows; r++) if (p.y >= rowY(r) && p.y < rowY(r) + rh) audition(r)
      return
    }
    const c = cellAt(p.x, p.y)
    if (!c) return
    paint = !get(c.r, c.c)
    setCell(c.r, c.c, paint)
    lastCell = `${c.r},${c.c}`
    if (paint) {
      audition(c.r)
      const { x, y } = cellXY(c.r, c.c)
      fx.burst(x, y, rowCol(c.r), 10, 120, 3)
      pulse[c.r][c.c] = 1
    }
    try { st.canvas.setPointerCapture(e.pointerId) } catch { /* ignore */ }
  }
  const cellXY = (r: number, c: number) => ({ x: mL + c * cw + cw / 2, y: rowY(r) + rh / 2 })
  bag.on(st.canvas, 'pointerdown', (e) => {
    e.preventDefault()
    press(e)
  })
  bag.on(st.canvas, 'pointermove', (e) => {
    if (paint === null) return
    const p = st.toLocal(e)
    const c = cellAt(p.x, p.y)
    if (!c || `${c.r},${c.c}` === lastCell) return
    lastCell = `${c.r},${c.c}`
    if (get(c.r, c.c) !== paint) {
      setCell(c.r, c.c, paint)
      if (paint) {
        audition(c.r)
        pulse[c.r][c.c] = 1
      }
    }
  })
  const up = () => (paint = null)
  bag.on(st.canvas, 'pointerup', up)
  bag.on(st.canvas, 'pointercancel', up)

  // ---- toolbar ----
  const playBtn = mkBtn(bar, '⏸', 'Play / stop (Space)', () => togglePlay())
  const togglePlay = () => {
    playing = !playing
    playBtn.innerHTML = playing ? '⏸' : '▶'
    if (playing) {
      nextTime = clock() + 0.08
      step = 0
    } else queue.length = 0
  }
  const tempo = mkSlider(bar, 'Tempo', 60, 200, bpm, (v) => (bpm = v))
  if (!drumOnly) {
    const tb: HTMLButtonElement[] = []
    TIMBRES.forEach((n, i) => tb.push(mkBtn(bar, TIMBRE_ICON[i], n, () => {
      timbre = i
      tb.forEach((b, j) => b.classList.toggle('on', i === j))
      note(midiFreq(noteMidi(4)), clock(), timbre, 0.09, 0.25)
    }, n)))
    tb[timbre].classList.add('on')
  }
  mkBtn(bar, '🎲', 'New pattern', () => {
    seedPattern()
    env.sfx('click')
  }, 'Random')
  mkBtn(bar, '🗑️', 'Clear', () => {
    for (const r of notes) r.fill(false)
    for (const r of drums) r.fill(false)
  })
  bag.on(window, 'keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault()
      togglePlay()
    } else if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      e.preventDefault()
      bpm = clamp(bpm + (e.code === 'ArrowUp' ? 4 : -4), 60, 200)
      tempo.value = String(bpm)
    } else if (!drumOnly && ['Digit1', 'Digit2', 'Digit3'].includes(e.code)) timbre = Number(e.code.slice(5)) - 1
  })
  env.status(`♩ ${bpm} BPM`)

  return {
    update(dt) {
      time += dt
      fx.update(dt, 200)
      // playhead from the audio clock
      const now = clock()
      while (queue.length && queue[0].t <= now) {
        const q = queue.shift()!
        cur = q.step
        bounce.v = 1
        env.score(played)
        for (let r = 0; r < rows; r++)
          if (get(r, cur)) {
            pulse[r][cur] = 1
            const { x, y } = cellXY(r, cur)
            fx.burst(x, y, rowCol(r), 6, 110, 2.5)
          }
      }
      bounce.v *= 0.88
      for (const row of pulse) for (let i = 0; i < STEPS; i++) row[i] *= 0.9
      env.status(`♩ ${bpm} BPM · ${timbre === 0 && !drumOnly ? 'Synth' : drumOnly ? 'Drums' : TIMBRES[timbre]}`)
    },
    draw() {
      bgFill(ctx, W, H, env)
      // header
      emoji(ctx, t.hero, mL + 24, 30 - bounce.v * 8, 34 + bounce.v * 8, Math.sin(time * 8) * 0.05 * bounce.v)
      text(ctx, env.name.toUpperCase().slice(0, portrait ? 20 : 34), mL + 56, 30, { size: portrait ? 11 : 14, color: t.fg, align: 'left' })
      if (!started && time < 8) text(ctx, 'TAP THE GRID TO ADD NOTES', W / 2, top - 14, { size: 10, color: t.accent })
      // grid
      for (let r = 0; r < rows; r++) {
        const y = rowY(r)
        const col = rowCol(r)
        const label = drumOnly ? DRUMS[r] : r < NR ? midiName(noteMidi(r)) : DRUMS[[0, 1, 3][r - NR]]
        text(ctx, label, mL - 8, y + rh / 2, { size: portrait ? 8 : 10, color: col, align: 'right' })
        for (let c = 0; c < STEPS; c++) {
          const x = mL + c * cw
          const on = get(r, c)
          const p = pulse[r][c]
          const pad = 2 - p * 2
          ctx.globalAlpha = 1
          if (on) {
            ctx.shadowColor = col
            ctx.shadowBlur = 8 + p * 16
            roundRect(ctx, x + pad, y + pad, cw - pad * 2, rh - pad * 2, 6, col)
            ctx.shadowBlur = 0
            ctx.fillStyle = `rgba(255,255,255,${0.15 + p * 0.5})`
            ctx.fillRect(x + pad + 3, y + pad + 2, cw - pad * 2 - 6, 3)
          } else roundRect(ctx, x + 2, y + 2, cw - 4, rh - 4, 6, c % 4 === 0 ? 'rgba(255,255,255,.13)' : 'rgba(255,255,255,.07)')
        }
      }
      // playhead
      if (playing && cur >= 0) {
        const x = mL + cur * cw
        const g = ctx.createLinearGradient(x, 0, x + cw, 0)
        g.addColorStop(0, 'rgba(255,255,255,.0)')
        g.addColorStop(0.5, 'rgba(255,255,255,.25)')
        g.addColorStop(1, 'rgba(255,255,255,.0)')
        ctx.fillStyle = g
        ctx.fillRect(x - 4, top - 4, cw + 8, H - top)
        ctx.fillStyle = t.accent
        ctx.fillRect(x + 2, top - 8, cw - 4, 4)
      }
      fx.draw(ctx)
    },
    destroy() {
      /* intervals disposed by the bag */
    },
  }
}

// ======================================================================
// Piano
// ======================================================================
const KEYMAP: Record<string, number> = { KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7, KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11, KeyK: 12 }

function pianoMode(env: GameEnv, st: Stage, bar: HTMLElement, bag: Bag, nm: string, portrait: boolean): Mode {
  const { ctx, w: W, h: H } = st
  const t = env.theme
  const fx = new Particles()
  const nWhite = portrait || env.mods.has('giant') ? 8 : 15
  const WHITE = [0, 2, 4, 5, 7, 9, 11]
  const whiteMidi = (i: number) => 60 + 12 * Math.floor(i / 7) + WHITE[i % 7]
  const keyTop = H * (portrait ? 0.5 : 0.44)
  const kw = (W - 24) / nWhite
  const kx0 = 12
  const kh = H - keyTop - 12
  interface K { midi: number; x: number; w: number; h: number; black: boolean; label: string }
  const keys: K[] = []
  for (let i = 0; i < nWhite; i++) keys.push({ midi: whiteMidi(i), x: kx0 + i * kw, w: kw, h: kh, black: false, label: '' })
  for (let i = 0; i < nWhite - 1; i++) if ([0, 1, 3, 4, 5].includes(i % 7)) keys.push({ midi: whiteMidi(i) + 1, x: kx0 + (i + 1) * kw - kw * 0.3, w: kw * 0.6, h: kh * 0.6, black: true, label: '' })
  const letterOf: Record<number, string> = {}
  for (const [code, off] of Object.entries(KEYMAP)) letterOf[60 + off] = code.slice(3)
  for (const k of keys) k.label = letterOf[k.midi] ?? ''
  let timbre = timbreFor(nm)
  const held = new Map<number, number>() // midi -> press time
  const ptrKey = new Map<number, number>()
  const bars: { midi: number; x: number; w: number; t0: number; t1: number; col: string }[] = []
  const open = new Map<number, (typeof bars)[number]>()
  let time = 0
  let played = 0
  let started = false
  let lastX = W / 2
  const bounce = { v: 0 }

  const keyOf = (midi: number) => keys.find((k) => k.midi === midi)
  const colOf = (midi: number) => t.blocks[((midi % 12) + 12) % 12 % t.blocks.length]
  const down = (midi: number) => {
    if (held.has(midi)) return
    const k = keyOf(midi)
    if (!k) return
    started = true
    held.set(midi, time)
    const a = audio()
    note(midiFreq(midi), a ? a.currentTime : 0, timbre, 0.14, 0.5)
    played++
    env.score(played)
    fx.burst(k.x + k.w / 2, keyTop, colOf(midi), 12, 160, 3.5)
    const b = { midi, x: k.x + k.w * (k.black ? 0.1 : 0.15), w: k.w * (k.black ? 0.8 : 0.7), t0: time, t1: Infinity, col: colOf(midi) }
    bars.push(b)
    open.set(midi, b)
    lastX = k.x + k.w / 2
    bounce.v = 1
  }
  const releaseKey = (midi: number) => {
    held.delete(midi)
    const b = open.get(midi)
    if (b) b.t1 = time
    open.delete(midi)
  }
  const hit = (x: number, y: number): number | null => {
    if (y < keyTop) return null
    for (const k of keys) if (k.black && x >= k.x && x < k.x + k.w && y < keyTop + k.h) return k.midi
    for (const k of keys) if (!k.black && x >= k.x && x < k.x + k.w) return k.midi
    return null
  }
  bag.on(st.canvas, 'pointerdown', (e) => {
    e.preventDefault()
    try { st.canvas.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    const p = st.toLocal(e)
    const m = hit(p.x, p.y)
    if (m !== null) {
      ptrKey.set(e.pointerId, m)
      down(m)
    }
  })
  bag.on(st.canvas, 'pointermove', (e) => {
    if (!ptrKey.has(e.pointerId)) return
    const p = st.toLocal(e)
    const m = hit(p.x, p.y)
    const old = ptrKey.get(e.pointerId)!
    if (m !== null && m !== old) {
      releaseKey(old)
      ptrKey.set(e.pointerId, m)
      down(m)
    }
  })
  const up = (e: PointerEvent) => {
    const old = ptrKey.get(e.pointerId)
    if (old !== undefined) releaseKey(old)
    ptrKey.delete(e.pointerId)
  }
  bag.on(st.canvas, 'pointerup', up)
  bag.on(st.canvas, 'pointercancel', up)
  bag.on(window, 'keydown', (e) => {
    const off = KEYMAP[e.code]
    if (off === undefined || e.repeat || e.ctrlKey || e.metaKey) return
    down(60 + off)
  })
  bag.on(window, 'keyup', (e) => {
    const off = KEYMAP[e.code]
    if (off !== undefined) releaseKey(60 + off)
  })
  const tb: HTMLButtonElement[] = []
  TIMBRES.forEach((n, i) => tb.push(mkBtn(bar, TIMBRE_ICON[i], n, () => {
    timbre = i
    tb.forEach((b, j) => b.classList.toggle('on', i === j))
    note(midiFreq(64), audio()?.currentTime ?? 0, timbre, 0.12, 0.4)
  }, n)))
  tb[timbre].classList.add('on')
  env.status('Play with A-K / W-U keys or tap')

  return {
    update(dt) {
      time += dt
      fx.update(dt, 120)
      bounce.v *= 0.9
      for (let i = bars.length - 1; i >= 0; i--) if (time - Math.min(bars[i].t1, time) > 5 || (bars[i].t1 !== Infinity && (time - bars[i].t1) * 140 > keyTop + 40)) bars.splice(i, 1)
    },
    draw() {
      bgFill(ctx, W, H, env)
      // rolling note bars
      for (const b of bars) {
        const top = keyTop - (time - b.t0) * 140
        const bottom = b.t1 === Infinity ? keyTop : keyTop - (time - b.t1) * 140
        ctx.shadowColor = b.col
        ctx.shadowBlur = 12
        roundRect(ctx, b.x, top, b.w, Math.max(8, bottom - top), 6, b.col)
        ctx.shadowBlur = 0
      }
      // keys
      for (const pass of [false, true])
        for (const k of keys) {
          if (k.black !== pass) continue
          const isDown = held.has(k.midi)
          const dy = isDown ? 3 : 0
          const col = colOf(k.midi)
          if (!k.black) {
            roundRect(ctx, k.x + 1.5, keyTop + dy, k.w - 3, k.h - dy, 8, isDown ? col : '#f4f4f5')
            if (!isDown) {
              ctx.fillStyle = 'rgba(0,0,0,.08)'
              ctx.fillRect(k.x + 2, keyTop + k.h - 14, k.w - 4, 10)
            }
            if (k.label) text(ctx, k.label, k.x + k.w / 2, keyTop + k.h - 26, { size: Math.min(14, k.w * 0.3), color: isDown ? '#fff' : '#334155' })
            if (k.midi % 12 === 0) text(ctx, midiName(k.midi), k.x + k.w / 2, keyTop + k.h - 8, { size: 8, color: '#64748b' })
          } else {
            roundRect(ctx, k.x, keyTop + dy, k.w, k.h - dy, 6, isDown ? col : '#18181b')
            if (k.label) text(ctx, k.label, k.x + k.w / 2, keyTop + k.h - 14, { size: Math.min(12, k.w * 0.4), color: '#a1a1aa' })
          }
        }
      fx.draw(ctx)
      emoji(ctx, t.hero, lastX, keyTop - 26 - bounce.v * 22, 38 + bounce.v * 6)
      if (!started && time < 10) text(ctx, portrait ? 'TAP THE KEYS' : 'TAP KEYS OR PRESS A-K / W-U', W / 2, 36, { size: portrait ? 12 : 16, color: t.fg, shadow: t.accent })
    },
    destroy() {
      held.clear()
    },
  }
}

// ======================================================================
// Theremin
// ======================================================================
function thereminMode(env: GameEnv, st: Stage, bar: HTMLElement, bag: Bag, nm: string): Mode {
  const { ctx, w: W, h: H } = st
  const t = env.theme
  const fx = new Particles()
  const LO = 130.81
  const HI = 1046.5
  const waves: OscillatorType[] = ['sine', 'sawtooth', 'square']
  let wave = 0
  let snap = /harp|chime|glass/.test(nm)
  let ptr: { x: number; y: number } | null = null
  let down = false
  let time = 0
  let sec = 0
  let lastRipple = 0
  let voice: { osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode; stop(): void } | null = null
  const ripples: { x: number; y: number; t: number; col: string }[] = []
  const trail: { x: number; y: number; t: number }[] = []
  let freq = 440

  const pitchOf = (x: number) => {
    const f = LO * Math.pow(HI / LO, clamp(x / W, 0, 1))
    if (!snap) return f
    const m = Math.round(69 + 12 * Math.log2(f / 440))
    // snap to C major pentatonic
    let best = m
    for (let d = 0; d < 6; d++) {
      if ([0, 2, 4, 7, 9].includes((((m + d) % 12) + 12) % 12)) { best = m + d; break }
      if ([0, 2, 4, 7, 9].includes((((m - d) % 12) + 12) % 12)) { best = m - d; break }
    }
    return midiFreq(best)
  }
  const volOf = (y: number) => clamp(1 - y / H, 0.02, 1)
  const startVoice = () => {
    if (isMuted()) return
    const a = audio()
    if (!a) return
    const osc = a.createOscillator()
    const gain = a.createGain()
    const lfo = a.createOscillator()
    const lg = a.createGain()
    const delay = a.createDelay(1)
    const fb = a.createGain()
    const wet = a.createGain()
    osc.type = waves[wave]
    lfo.frequency.value = 5.5
    lg.gain.value = 4
    lfo.connect(lg).connect(osc.frequency)
    delay.delayTime.value = 0.26
    fb.gain.value = 0.38
    wet.gain.value = 0.35
    gain.gain.value = 0
    osc.connect(gain)
    gain.connect(a.destination)
    gain.connect(delay)
    delay.connect(fb).connect(delay)
    delay.connect(wet).connect(a.destination)
    osc.start()
    lfo.start()
    voice = {
      osc, gain, lfo,
      stop() {
        const n = a.currentTime
        gain.gain.cancelScheduledValues(n)
        gain.gain.setTargetAtTime(0, n, 0.06)
        osc.stop(n + 0.5)
        lfo.stop(n + 0.5)
        setTimeout(() => {
          try { delay.disconnect(); fb.disconnect(); wet.disconnect() } catch { /* ignore */ }
        }, 2500)
      },
    }
  }
  const apply = () => {
    if (!ptr) return
    freq = pitchOf(ptr.x)
    const v = volOf(ptr.y)
    if (voice) {
      const a = audio()!
      voice.osc.frequency.setTargetAtTime(freq, a.currentTime, 0.03)
      voice.gain.gain.setTargetAtTime(v * 0.28, a.currentTime, 0.04)
    }
  }
  const stopVoice = () => {
    voice?.stop()
    voice = null
  }
  bag.add(stopVoice)
  bag.on(st.canvas, 'pointerdown', (e) => {
    e.preventDefault()
    try { st.canvas.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    ptr = st.toLocal(e)
    down = true
    sec++
    env.score(sec)
    startVoice()
    apply()
  })
  bag.on(st.canvas, 'pointermove', (e) => {
    ptr = st.toLocal(e)
    if (down) apply()
  })
  const up = () => {
    down = false
    stopVoice()
  }
  bag.on(st.canvas, 'pointerup', up)
  bag.on(st.canvas, 'pointercancel', up)

  const wb: HTMLButtonElement[] = []
  const wn = ['Sine', 'Saw', 'Square']
  ;['〰️', '📈', '🔲'].forEach((ic, i) => wb.push(mkBtn(bar, ic, wn[i], () => {
    wave = i
    wb.forEach((b, j) => b.classList.toggle('on', i === j))
    if (voice) voice.osc.type = waves[i]
  }, wn[i])))
  wb[0].classList.add('on')
  const sb = mkBtn(bar, '🎯', 'Snap to scale', () => {
    snap = !snap
    sb.classList.toggle('on', snap)
  }, 'Snap')
  sb.classList.toggle('on', snap)
  env.status('Hold and move: left/right pitch, up/down volume')

  return {
    update(dt) {
      time += dt
      fx.update(dt, 40)
      if (down && ptr) {
        apply()
        trail.push({ x: ptr.x, y: ptr.y, t: time })
        if (time - lastRipple > 0.16) {
          lastRipple = time
          ripples.push({ x: ptr.x, y: ptr.y, t: time, col: `hsl(${lerp(200, 340, ptr.x / W)} 90% 62%)` })
        }
        fx.burst(ptr.x, ptr.y, `hsl(${lerp(200, 340, ptr.x / W)} 90% 65%)`, 1, 60, 3)
      }
      while (trail.length && time - trail[0].t > 0.7) trail.shift()
      while (ripples.length && time - ripples[0].t > 1.4) ripples.shift()
    },
    draw() {
      bgFill(ctx, W, H, env)
      // pitch lines
      for (let m = 48; m <= 84; m++) {
        const f = midiFreq(m)
        if (f < LO || f > HI) continue
        const x = (Math.log(f / LO) / Math.log(HI / LO)) * W
        const pent = [0, 2, 4, 7, 9].includes(m % 12)
        ctx.strokeStyle = pent ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.04)'
        ctx.lineWidth = m % 12 === 0 ? 2 : 1
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
        if (m % 12 === 0) text(ctx, midiName(m), Math.max(16, x), H - 14, { size: 9, color: t.accent })
      }
      for (const r of ripples) {
        const k = (time - r.t) / 1.4
        ctx.strokeStyle = r.col
        ctx.globalAlpha = 1 - k
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(r.x, r.y, 20 + k * 160, 0, 7)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      if (trail.length > 1) {
        ctx.lineWidth = 6
        ctx.lineCap = 'round'
        for (let i = 1; i < trail.length; i++) {
          ctx.strokeStyle = `hsla(${lerp(200, 340, trail[i].x / W)},90%,65%,${(1 - (time - trail[i].t) / 0.7) * 0.8})`
          ctx.beginPath()
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y)
          ctx.lineTo(trail[i].x, trail[i].y)
          ctx.stroke()
        }
      }
      fx.draw(ctx)
      const p = ptr ?? { x: W / 2, y: H / 2 + Math.sin(time * 1.5) * 30 }
      const v = down ? volOf(p.y) : 0.3
      ctx.shadowColor = t.accent
      ctx.shadowBlur = 20 + v * 30
      emoji(ctx, t.hero, p.x, p.y, 44 + v * 40 + Math.sin(time * 12) * (down ? 3 : 0))
      ctx.shadowBlur = 0
      if (down) text(ctx, `${Math.round(freq)} Hz`, clamp(p.x, 50, W - 50), clamp(p.y - 60, 20, H - 20), { size: 12, color: '#fff' })
      else text(ctx, 'HOLD AND MOVE', W / 2, 34, { size: W < 700 ? 12 : 16, color: t.fg, shadow: t.accent })
    },
    destroy() {
      stopVoice()
    },
  }
}
