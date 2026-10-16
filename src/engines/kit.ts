// Shared runtime for game engines: environment contract, stage, loop, input, drawing helpers.
import type { Theme } from '../lib/themes'

export type Sfx = 'hit' | 'point' | 'jump' | 'shoot' | 'boom' | 'win' | 'lose' | 'click' | 'power' | 'move'

export interface GameResult {
  score: number
  won?: boolean
  /** Optional short line shown under the result, e.g. "Reached level 7". English. */
  text?: string
}

/** Everything an engine gets from the player page. */
export interface GameEnv {
  /** Empty element to render into. It fills the play area; engines size themselves to it. */
  host: HTMLElement
  seed: number
  rng: Rng
  /** 0 easy, 1 normal, 2 hard. */
  difficulty: 0 | 1 | 2
  theme: Theme
  /** Variant flags from the catalog (e.g. 'gravity', 'boss', 'versus', 'chess'). */
  mods: Set<string>
  /** Game title and one-line pitch from the catalog. */
  name: string
  desc: string
  /** 2 when the player picked two-player mode on the page. */
  players: 1 | 2
  /** Report the live score (shown in the HUD). */
  score(n: number): void
  /** Short HUD status, e.g. "Level 3 · ❤️❤️". Use '' to clear. */
  status(text: string): void
  /** Game finished. The player page shows the result and a "Play again" button. Call once. */
  end(r: GameResult): void
  sfx(s: Sfx): void
}

export interface GameHandle {
  destroy(): void
  pause?(paused: boolean): void
}

export interface Engine {
  start(env: GameEnv): GameHandle
}

// ---------- math & random ----------

export interface Rng {
  /** [0, 1) */
  (): number
  int(lo: number, hi: number): number
  range(lo: number, hi: number): number
  pick<T>(a: readonly T[]): T
  chance(p: number): boolean
  shuffle<T>(a: T[]): T[]
}

export function makeRng(seed: number): Rng {
  let s = seed >>> 0 || 1
  const r = (() => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }) as Rng
  r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1))
  r.range = (lo, hi) => lo + r() * (hi - lo)
  r.pick = (a) => a[Math.floor(r() * a.length)]
  r.chance = (p) => r() < p
  r.shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return r
}

export const clamp = (x: number, lo: number, hi: number) => (x < lo ? lo : x > hi ? hi : x)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by)

// ---------- disposables ----------

/** Collects listeners/timers so destroy() can remove them all. */
export class Bag {
  private fns: (() => void)[] = []
  on<K extends keyof WindowEventMap>(t: Window, type: K, fn: (e: WindowEventMap[K]) => void, o?: AddEventListenerOptions): void
  on<K extends keyof HTMLElementEventMap>(t: HTMLElement, type: K, fn: (e: HTMLElementEventMap[K]) => void, o?: AddEventListenerOptions): void
  on(t: EventTarget, type: string, fn: (e: never) => void, o?: AddEventListenerOptions): void {
    t.addEventListener(type, fn as EventListener, o)
    this.fns.push(() => t.removeEventListener(type, fn as EventListener, o))
  }
  add(fn: () => void) {
    this.fns.push(fn)
  }
  timeout(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms)
    this.fns.push(() => clearTimeout(id))
  }
  interval(fn: () => void, ms: number) {
    const id = setInterval(fn, ms)
    this.fns.push(() => clearInterval(id))
  }
  dispose() {
    for (const f of this.fns.splice(0).reverse()) f()
  }
}

// ---------- stage ----------

export interface Stage {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  /** Logical size: draw in these coordinates. */
  w: number
  h: number
  /** Event client coordinates → logical coordinates. */
  toLocal(e: { clientX: number; clientY: number }): { x: number; y: number }
  dispose(): void
}

/** A canvas with a fixed logical size, scaled to fit the host (letterboxed, crisp on HiDPI). */
export function createStage(host: HTMLElement, w: number, h: number): Stage {
  const canvas = document.createElement('canvas')
  canvas.className = 'ga-canvas'
  canvas.tabIndex = 0
  host.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  let scale = 1
  const fit = () => {
    const r = host.getBoundingClientRect()
    scale = Math.max(0.1, Math.min(r.width / w, r.height / h))
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.style.width = `${Math.floor(w * scale)}px`
    canvas.style.height = `${Math.floor(h * scale)}px`
    canvas.width = Math.round(w * scale * dpr)
    canvas.height = Math.round(h * scale * dpr)
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0)
  }
  fit()
  const ro = new ResizeObserver(fit)
  ro.observe(host)
  return {
    canvas, ctx, w, h,
    toLocal(e) {
      const r = canvas.getBoundingClientRect()
      return { x: ((e.clientX - r.left) / r.width) * w, y: ((e.clientY - r.top) / r.height) * h }
    },
    dispose() {
      ro.disconnect()
      canvas.remove()
    },
  }
}

/** A themed DOM root for DOM-based engines (cards, quiz, story…). Sets --g-* CSS variables. */
export function createDom(host: HTMLElement, theme: Theme, className = ''): HTMLDivElement {
  const el = document.createElement('div')
  el.className = `ga-dom ${className}`.trim()
  themeVars(el, theme)
  host.appendChild(el)
  return el
}

export function themeVars(el: HTMLElement, t: Theme) {
  const v: Record<string, string> = { bg: t.bg, bg2: t.bg2, fg: t.fg, accent: t.accent, accent2: t.accent2, danger: t.danger, good: t.good }
  for (const [k, c] of Object.entries(v)) el.style.setProperty(`--g-${k}`, c)
}

// ---------- loop ----------

export interface Loop {
  stop(): void
  pause(p: boolean): void
  readonly paused: boolean
}

/** requestAnimationFrame loop. update(dt) gets seconds (clamped to 1/20 s); draw() runs every frame, even while paused. */
export function loop(update: (dt: number) => void, draw: () => void): Loop {
  let last = performance.now()
  let raf = 0
  let paused = false
  let stopped = false
  const frame = (now: number) => {
    if (stopped) return
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!paused) update(dt)
    draw()
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)
  return {
    stop() {
      stopped = true
      cancelAnimationFrame(raf)
    },
    pause(p) {
      paused = p
      last = performance.now()
    },
    get paused() {
      return paused
    },
  }
}

// ---------- keyboard ----------

export type Action = 'left' | 'right' | 'up' | 'down' | 'a' | 'b' | 'p2left' | 'p2right' | 'p2up' | 'p2down' | 'p2a' | 'p2b'

/** Default bindings. Player 1 uses arrows OR WASD, A = Space/Enter/J, B = Shift/K/X. */
const BIND: Record<string, Action[]> = {
  ArrowLeft: ['left', 'p2left'], ArrowRight: ['right', 'p2right'], ArrowUp: ['up', 'p2up'], ArrowDown: ['down', 'p2down'],
  KeyA: ['left'], KeyD: ['right'], KeyW: ['up'], KeyS: ['down'],
  Space: ['a'], Enter: ['a', 'p2a'], KeyJ: ['a'], KeyZ: ['a'], ShiftLeft: ['b'], KeyK: ['b', 'p2a'], KeyX: ['b'], KeyL: ['p2b'],
  KeyF: ['a'], KeyG: ['b'],
}

export interface Keys {
  /** Is the action (or a raw KeyboardEvent.code) held? */
  down(a: Action | string): boolean
  /** Was it pressed since the last call (edge, consumed)? */
  hit(a: Action | string): boolean
  /** -1/0/1 horizontal and vertical from left/right/up/down. */
  axis(): { x: number; y: number }
  /** Inject a state (used by the on-screen pad). */
  set(a: Action, down: boolean): void
  /** Called on every keydown with the event (for typing games). */
  onKey(fn: (e: KeyboardEvent) => void): void
  dispose(): void
}

export function keys(opts: { twoPlayer?: boolean } = {}): Keys {
  const held = new Set<string>()
  const edge = new Set<string>()
  const listeners: ((e: KeyboardEvent) => void)[] = []
  const bag = new Bag()
  const map = (code: string): string[] => {
    const acts = BIND[code] ?? []
    // In two-player mode arrows belong to player 2 only and WASD to player 1.
    const filtered = opts.twoPlayer && code.startsWith('Arrow') ? acts.filter((a) => a.startsWith('p2')) : acts
    return [code, ...filtered]
  }
  const isTyping = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null
    return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)
  }
  bag.on(window, 'keydown', (e) => {
    if (isTyping(e)) return
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault()
    for (const a of map(e.code)) {
      if (!held.has(a)) edge.add(a)
      held.add(a)
    }
    for (const f of listeners) f(e)
  })
  bag.on(window, 'keyup', (e) => {
    for (const a of map(e.code)) held.delete(a)
  })
  bag.on(window, 'blur', () => held.clear())
  const k: Keys = {
    down: (a) => held.has(a),
    hit(a) {
      const v = edge.has(a)
      edge.delete(a)
      return v
    },
    axis: () => ({ x: (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0), y: (held.has('down') ? 1 : 0) - (held.has('up') ? 1 : 0) }),
    set(a, d) {
      if (d) {
        if (!held.has(a)) edge.add(a)
        held.add(a)
      } else held.delete(a)
    },
    onKey: (fn) => listeners.push(fn),
    dispose: () => bag.dispose(),
  }
  return k
}

// ---------- pointer ----------

export interface PointerState {
  x: number
  y: number
  down: boolean
  /** Pointer has been seen over the canvas at least once. */
  active: boolean
}

export interface Pointer extends PointerState {
  onDown(fn: (p: { x: number; y: number; button: number }) => void): void
  onUp(fn: (p: { x: number; y: number; button: number }) => void): void
  onMove(fn: (p: { x: number; y: number; down: boolean }) => void): void
  dispose(): void
}

/** Pointer (mouse / touch / pen) in logical stage coordinates. Right button = 2; a 450 ms touch hold also reports button 2. */
export function pointer(stage: Stage): Pointer {
  const bag = new Bag()
  const downs: ((p: { x: number; y: number; button: number }) => void)[] = []
  const ups: ((p: { x: number; y: number; button: number }) => void)[] = []
  const moves: ((p: { x: number; y: number; down: boolean }) => void)[] = []
  const p: Pointer = {
    x: stage.w / 2, y: stage.h / 2, down: false, active: false,
    onDown: (f) => downs.push(f), onUp: (f) => ups.push(f), onMove: (f) => moves.push(f),
    dispose: () => bag.dispose(),
  }
  const c = stage.canvas
  c.style.touchAction = 'none'
  let hold: ReturnType<typeof setTimeout> | undefined
  let held = false
  bag.on(c, 'pointerdown', (e) => {
    c.focus({ preventScroll: true })
    const l = stage.toLocal(e)
    Object.assign(p, l, { down: true, active: true })
    try { c.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    held = false
    if (e.pointerType === 'touch') {
      clearTimeout(hold)
      hold = setTimeout(() => {
        held = true
        for (const f of downs) f({ ...l, button: 2 })
      }, 450)
      return
    }
    for (const f of downs) f({ ...l, button: e.button })
  })
  bag.on(c, 'pointermove', (e) => {
    const l = stage.toLocal(e)
    Object.assign(p, l, { active: true })
    for (const f of moves) f({ ...l, down: p.down })
  })
  const up = (e: PointerEvent) => {
    const l = stage.toLocal(e)
    Object.assign(p, l, { down: false })
    if (e.pointerType === 'touch') {
      clearTimeout(hold)
      if (held) return
      for (const f of downs) f({ ...l, button: 0 })
    }
    for (const f of ups) f({ ...l, button: e.button })
  }
  bag.on(c, 'pointerup', up)
  bag.on(c, 'pointercancel', up)
  bag.on(c, 'contextmenu', (e) => e.preventDefault())
  bag.add(() => clearTimeout(hold))
  return p
}

/** Swipe gestures on an element: calls fn with a direction. */
export function swipe(el: HTMLElement, fn: (dir: 'left' | 'right' | 'up' | 'down') => void): () => void {
  let sx = 0
  let sy = 0
  let on = false
  const d = (e: PointerEvent) => {
    sx = e.clientX
    sy = e.clientY
    on = true
  }
  const u = (e: PointerEvent) => {
    if (!on) return
    on = false
    const dx = e.clientX - sx
    const dy = e.clientY - sy
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
    fn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
  }
  el.addEventListener('pointerdown', d)
  el.addEventListener('pointerup', u)
  return () => {
    el.removeEventListener('pointerdown', d)
    el.removeEventListener('pointerup', u)
  }
}

export const isTouch = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

/**
 * On-screen gamepad for touch devices (no-op on desktop unless force=true).
 * layout: 'dpad' (4 arrows + buttons), 'lr' (left/right + buttons), 'none' (buttons only).
 */
export function vpad(host: HTMLElement, k: Keys, layout: 'dpad' | 'lr' | 'none', buttons: { action: Action; label: string }[] = [], force = false): () => void {
  if (!force && !isTouch()) return () => {}
  const el = document.createElement('div')
  el.className = 'ga-vpad'
  const mk = (action: Action, label: string, cls: string) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = `ga-vbtn ${cls}`
    b.textContent = label
    const on = (e: Event) => {
      e.preventDefault()
      k.set(action, true)
    }
    const off = (e: Event) => {
      e.preventDefault()
      k.set(action, false)
    }
    b.addEventListener('pointerdown', on)
    b.addEventListener('pointerup', off)
    b.addEventListener('pointerleave', off)
    b.addEventListener('pointercancel', off)
    return b
  }
  const left = document.createElement('div')
  left.className = `ga-vpad-l ${layout}`
  if (layout === 'dpad') for (const [a, l] of [['up', '▲'], ['left', '◀'], ['right', '▶'], ['down', '▼']] as const) left.appendChild(mk(a, l, a))
  if (layout === 'lr') for (const [a, l] of [['left', '◀'], ['right', '▶']] as const) left.appendChild(mk(a, l, a))
  const right = document.createElement('div')
  right.className = 'ga-vpad-r'
  for (const b of buttons) right.appendChild(mk(b.action, b.label, 'act'))
  el.append(left, right)
  host.appendChild(el)
  return () => el.remove()
}

// ---------- drawing ----------

const emojiCache = new Map<string, HTMLCanvasElement>()

/** Draw an emoji centred at (x, y) with the given size (cached bitmap; fast enough for hundreds per frame). */
export function emoji(ctx: CanvasRenderingContext2D, ch: string, x: number, y: number, size: number, rot = 0) {
  const px = Math.max(8, Math.min(256, Math.ceil(size * 2 / 8) * 8))
  const key = `${ch}|${px}`
  let c = emojiCache.get(key)
  if (!c) {
    c = document.createElement('canvas')
    c.width = c.height = Math.ceil(px * 1.25)
    const g = c.getContext('2d')!
    g.font = `${px}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(ch, c.width / 2, c.height / 2 + px * 0.06)
    emojiCache.set(key, c)
  }
  const s = (size * 1.25)
  if (rot) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    ctx.drawImage(c, -s / 2, -s / 2, s, s)
    ctx.restore()
  } else ctx.drawImage(c, x - s / 2, y - s / 2, s, s)
}

export function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, o: { size?: number; color?: string; align?: CanvasTextAlign; weight?: number; base?: CanvasTextBaseline; font?: string; shadow?: string } = {}) {
  ctx.font = `${o.weight ?? 700} ${o.size ?? 16}px ${o.font ?? '"Press Start 2P", ui-monospace, system-ui, sans-serif'}`
  ctx.fillStyle = o.color ?? '#fff'
  ctx.textAlign = o.align ?? 'center'
  ctx.textBaseline = o.base ?? 'middle'
  if (o.shadow) {
    ctx.shadowColor = o.shadow
    ctx.shadowBlur = 8
  }
  ctx.fillText(s, x, y)
  ctx.shadowBlur = 0
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string, lw = 2) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2))
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.lineWidth = lw
    ctx.strokeStyle = stroke
    ctx.stroke()
  }
}

/** Vertical theme gradient background, with optional soft stars/dots for depth. */
export function background(ctx: CanvasRenderingContext2D, w: number, h: number, t: Theme, dots = 0, seed = 1) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, t.bg)
  g.addColorStop(1, t.bg2)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  if (dots) {
    const r = makeRng(seed)
    ctx.fillStyle = t.fg
    for (let i = 0; i < dots; i++) {
      ctx.globalAlpha = 0.05 + r() * 0.2
      ctx.beginPath()
      ctx.arc(r() * w, r() * h, 0.5 + r() * 1.6, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }
}

/** Tiny particle system for hits, pickups and explosions. */
export class Particles {
  private p: { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; s: number }[] = []
  burst(x: number, y: number, color: string, n = 12, speed = 160, size = 3) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const v = speed * (0.3 + Math.random() * 0.7)
      const life = 0.35 + Math.random() * 0.45
      this.p.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life, c: color, s: size * (0.6 + Math.random() * 0.8) })
    }
    if (this.p.length > 600) this.p.splice(0, this.p.length - 600)
  }
  update(dt: number, gravity = 0) {
    for (const q of this.p) {
      q.x += q.vx * dt
      q.y += q.vy * dt
      q.vy += gravity * dt
      q.vx *= 0.98
      q.life -= dt
    }
    this.p = this.p.filter((q) => q.life > 0)
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (const q of this.p) {
      ctx.globalAlpha = Math.max(0, q.life / q.max)
      ctx.fillStyle = q.c
      ctx.fillRect(q.x - q.s / 2, q.y - q.s / 2, q.s, q.s)
    }
    ctx.globalAlpha = 1
  }
  get count() {
    return this.p.length
  }
}

/** Screen shake helper: call kick(n), then apply(ctx) inside save/restore before drawing the world. */
export class Shake {
  private t = 0
  private m = 0
  kick(m = 6) {
    this.m = Math.max(this.m, m)
    this.t = 0.25
  }
  update(dt: number) {
    this.t = Math.max(0, this.t - dt)
  }
  apply(ctx: CanvasRenderingContext2D) {
    if (this.t > 0) ctx.translate((Math.random() - 0.5) * this.m * 2 * (this.t / 0.25), (Math.random() - 0.5) * this.m * 2 * (this.t / 0.25))
  }
}

/** Circle–rectangle and circle–circle overlap tests. */
export const hitCircle = (ax: number, ay: number, ar: number, bx: number, by: number, br: number) => (ax - bx) ** 2 + (ay - by) ** 2 < (ar + br) ** 2
export function hitRectCircle(rx: number, ry: number, rw: number, rh: number, cx: number, cy: number, cr: number) {
  const nx = clamp(cx, rx, rx + rw)
  const ny = clamp(cy, ry, ry + rh)
  return (cx - nx) ** 2 + (cy - ny) ** 2 < cr * cr
}
export const hitRect = (ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by

/** Difficulty multiplier helper: pick a value per difficulty. */
export const byDiff = <T>(env: GameEnv, easy: T, normal: T, hard: T): T => (env.difficulty === 0 ? easy : env.difficulty === 1 ? normal : hard)
