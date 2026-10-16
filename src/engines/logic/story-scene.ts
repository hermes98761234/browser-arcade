// Illustrated scene header for the story engine: themed backdrop, parallax ridges, weather keyed off the scene emoji.
import { emoji } from '../kit'
import type { Theme } from '../../lib/themes'

const seg = new Intl.Segmenter('en', { granularity: 'grapheme' })
export const graphemes = (s: string): string[] => [...seg.segment(s)].map((x) => x.segment).filter((x) => x.trim())

export type Mood = 'calm' | 'eerie' | 'warm' | 'cold'
type Fx = 'rain' | 'snow' | 'embers' | 'fireflies' | 'dust' | 'sparkle' | 'leaves' | 'bubbles' | 'mist' | 'lightning'

interface Look {
  sky: [string, string]
  far: string
  mid: string
  near: string
  stars: boolean
  sea: boolean
  orb: 'moon' | 'sun' | null
  fx: Fx[]
  mood: Mood
  glow: string
}

const L = {
  rain: ['🌧', '⛈', '☔', '💧', '🌂'],
  storm: ['⛈', '🌩', '⚡'],
  snow: ['❄', '⛄', '🌨', '☃', '🏔', '🧊', '🎿'],
  fire: ['🔥', '🕯', '🏮', '🌋', '💥', '🧨', '🪔'],
  night: ['🌙', '🌑', '🌒', '🌓', '🌔', '🌕', '🌌', '🦉', '🦇', '⭐', '🌃', '🌠', '🌛', '🌜'],
  space: ['🚀', '🛸', '🪐', '🛰', '🌍', '🌎', '🌏', '👽', '🌠', '🌌', '☄', '🔭', '🧑‍🚀', '👩‍🚀'],
  sea: ['🌊', '⚓', '⛵', '🚢', '🏝', '🐚', '🦈', '🐙', '🐋', '🐬', '🐠', '🦀'],
  sun: ['☀', '🌅', '🌄', '🌞', '🏜', '🌻', '🏖'],
  forest: ['🌲', '🌳', '🌿', '🍃', '🌴', '🍄', '🦌', '🦊', '🍂', '🍁', '🌱'],
  ghost: ['👻', '💀', '🕸', '🩸', '🧟', '⚰', '🪦', '🕷', '☠', '🦴', '🎃', '🧛', '👁'],
  magic: ['✨', '🔮', '🧙', '🪄', '🧚', '🐉', '🐲', '💫', '🧝', '🪬'],
  books: ['📚', '📖', '📜', '🕮', '📕', '📘', '📗', '🗝', '🔑', '🕰'],
  mist: ['🌫', '👣'],
  city: ['🏙', '🌆', '🌃', '🏢', '🚬', '🕵', '🥃', '🚓', '🚕'],
  tech: ['🤖', '🔧', '⚙', '💻', '🔋', '📡', '🛠', '🚨', '🔬', '💡', '🧪'],
}

const norm = (s: string) => s.replace(/️/g, '')
const any = (s: string, list: string[]) => list.some((e) => s.includes(e))

export function lookFor(scene: string, t: Theme): Look {
  const s = norm(scene)
  const night = any(s, L.night)
  const space = any(s, L.space) && t.id === 'space' ? true : any(s, ['🛸', '🪐', '🛰', '🌠', '👽', '🚀', '🧑‍🚀', '👩‍🚀', '🔭'])
  const rain = any(s, L.rain)
  const storm = any(s, L.storm)
  const snow = any(s, L.snow)
  const fire = any(s, L.fire)
  const sea = any(s, L.sea)
  const sun = any(s, L.sun)
  const forest = any(s, L.forest)
  const ghost = any(s, L.ghost)
  const magic = any(s, L.magic)
  const books = any(s, L.books)
  const city = any(s, L.city)
  const tech = any(s, L.tech)
  const fx: Fx[] = []
  let base: Pick<Look, 'sky' | 'far' | 'mid' | 'near'>
  let mood: Mood = 'calm'
  let glow = t.accent
  let orb: Look['orb'] = null
  let stars = false
  let seaOn = false

  if (space) {
    base = { sky: ['#02030f', '#1a0b3a'], far: '#10163a', mid: '#0a0f28', near: '#05071a' }
    stars = true
    mood = 'cold'
    glow = '#8ab4ff'
  } else if (rain || storm) {
    base = { sky: ['#161d27', '#3a4858'], far: '#2a3541', mid: '#1c252f', near: '#0f151b' }
    fx.push('rain', 'mist')
    if (storm) fx.push('lightning')
    mood = 'eerie'
    glow = '#9bb7d4'
  } else if (snow) {
    base = { sky: ['#6e92b0', '#dbe9f4'], far: '#b6cde0', mid: '#9db8cf', near: '#e6f0f8' }
    fx.push('snow')
    mood = 'cold'
    glow = '#e0f2ff'
  } else if (fire) {
    base = { sky: ['#240804', '#7a2a0a'], far: '#471507', mid: '#2d0d04', near: '#170702' }
    fx.push('embers')
    mood = 'warm'
    glow = '#ff9a3c'
  } else if (sea) {
    base = { sky: night ? ['#050a1f', '#16336a'] : ['#0d3b66', '#69b7d9'], far: '#12527f', mid: '#0d3f66', near: '#08294a' }
    seaOn = true
    fx.push('bubbles')
    glow = '#5fd0ff'
  } else if (ghost) {
    base = { sky: ['#0e0716', '#2f1b3f'], far: '#241532', mid: '#170d22', near: '#0a0612' }
    fx.push('mist', 'dust')
    mood = 'eerie'
    glow = '#a98be0'
  } else if (forest) {
    base = night ? { sky: ['#06120d', '#173a2c'], far: '#143426', mid: '#0d2418', near: '#06130c' } : { sky: ['#143d2a', '#6aa879'], far: '#24663f', mid: '#164b2c', near: '#0b2a18' }
    fx.push(night ? 'fireflies' : 'leaves')
    glow = '#b6f28a'
  } else if (sun) {
    base = { sky: ['#f08a4b', '#fbe3a6'], far: '#c97b4a', mid: '#8a5a3c', near: '#4d3324' }
    fx.push('dust')
    orb = 'sun'
    mood = 'warm'
    glow = '#ffd27a'
  } else if (books) {
    base = { sky: ['#24160d', '#6b4a2c'], far: '#47301c', mid: '#2f1f12', near: '#180f08' }
    fx.push('dust')
    mood = 'warm'
    glow = '#ffcf7a'
  } else if (city) {
    base = { sky: ['#0a0d16', '#2b3350'], far: '#1a2036', mid: '#10142a', near: '#080a16' }
    fx.push('rain')
    mood = 'eerie'
    glow = '#ffd37a'
  } else if (tech) {
    base = { sky: ['#06121c', '#14394f'], far: '#0f2d3f', mid: '#0a1f2c', near: '#06121a' }
    fx.push('dust')
    mood = 'cold'
    glow = '#4de1ff'
  } else if (night) {
    base = { sky: ['#050816', '#1b2550'], far: '#111a3c', mid: '#0a1126', near: '#05080f' }
    stars = true
    mood = 'eerie'
    glow = '#bcd0ff'
  } else {
    base = { sky: [t.bg, t.bg2], far: shade(t.bg2, 0.75), mid: shade(t.bg2, 0.5), near: shade(t.bg, 0.35) }
    fx.push('dust')
  }
  if (night && !space) {
    stars = stars || !rain
    if (s.match(/🌙|🌛|🌜|🌕|🌔/)) orb = 'moon'
  }
  if (magic) fx.push('sparkle')
  if (any(s, L.mist) && !fx.includes('mist')) fx.push('mist')
  if (any(s, L.ghost) && !ghost) fx.push('mist')
  return { ...base, stars, sea: seaOn, orb, fx, mood, glow }
}

function shade(hex: string, k: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return hex
  const n = parseInt(m[1], 16)
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v * k)))
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`
}

interface P { x: number; y: number; vx: number; vy: number; s: number; a: number; ph: number }

export class SceneView {
  private ctx: CanvasRenderingContext2D
  private w = 300
  private h = 150
  private look: Look
  private emojis: string[] = []
  private parts: P[] = []
  private stars: P[] = []
  private t = 0
  private px = 0
  private pxT = 0
  private py = 0
  private pyT = 0
  private fade = 1
  private flash = 0
  private tint = ''
  private tintA = 0
  private bolt = 2 + Math.random() * 4
  private skyG: CanvasGradient | null = null

  private canvas: HTMLCanvasElement
  private theme: Theme

  constructor(canvas: HTMLCanvasElement, theme: Theme, scene: string) {
    this.canvas = canvas
    this.theme = theme
    this.ctx = canvas.getContext('2d')!
    this.look = lookFor(scene, theme)
    this.emojis = graphemes(scene).slice(0, 4)
    this.seedStars()
    this.seedParts()
  }

  get mood(): Mood {
    return this.look.mood
  }

  resize(w: number, h: number) {
    this.w = Math.max(40, w)
    this.h = Math.max(40, h)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = Math.round(this.w * dpr)
    this.canvas.height = Math.round(this.h * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.skyG = null
    this.seedStars()
    this.seedParts()
  }

  setScene(scene: string, instant = false) {
    this.look = lookFor(scene, this.theme)
    this.emojis = graphemes(scene).slice(0, 4)
    this.skyG = null
    this.seedStars()
    this.seedParts()
    if (!instant) this.fade = 1
  }

  /** Colour pulse over the scene: red for harm, gold for gain. */
  pulse(color: string, a = 0.35) {
    this.tint = color
    this.tintA = a
  }

  look2(nx: number, ny: number) {
    this.pxT = nx
    this.pyT = ny
  }

  private seedStars() {
    const r = this.look.stars ? 70 : 0
    this.stars = Array.from({ length: r }, () => ({ x: Math.random() * this.w, y: Math.random() * this.h * 0.7, vx: 0, vy: 0, s: 0.5 + Math.random() * 1.4, a: Math.random(), ph: Math.random() * 6.28 }))
  }

  private seedParts() {
    const n = (k: Fx) => ({ rain: 90, snow: 70, embers: 45, fireflies: 22, dust: 28, sparkle: 26, leaves: 18, bubbles: 24, mist: 5, lightning: 0 })[k]
    this.parts = []
    for (const k of this.look.fx) for (let i = 0; i < n(k); i++) this.parts.push(this.spawn(k, true))
    this.kinds = []
    for (const k of this.look.fx) for (let i = 0; i < n(k); i++) this.kinds.push(k)
  }
  private kinds: Fx[] = []

  private spawn(k: Fx, init = false): P {
    const { w, h } = this
    const r = Math.random
    const x = r() * w
    const y = init ? r() * h : -10
    switch (k) {
      case 'rain': return { x: r() * (w + 60), y: init ? r() * h : -20, vx: -60, vy: 520 + r() * 260, s: 8 + r() * 10, a: 0.25 + r() * 0.35, ph: 0 }
      case 'snow': return { x, y, vx: 0, vy: 22 + r() * 36, s: 1 + r() * 2.4, a: 0.5 + r() * 0.5, ph: r() * 6.28 }
      case 'embers': return { x, y: init ? r() * h : h + 8, vx: (r() - 0.5) * 20, vy: -(20 + r() * 50), s: 1 + r() * 2.2, a: 0.5 + r() * 0.5, ph: r() * 6.28 }
      case 'fireflies': return { x, y: h * (0.3 + r() * 0.6), vx: 0, vy: 0, s: 1.5 + r() * 1.5, a: 0, ph: r() * 6.28 }
      case 'dust': return { x, y: init ? r() * h : h + 4, vx: (r() - 0.5) * 8, vy: -(3 + r() * 9), s: 0.8 + r() * 1.8, a: 0.15 + r() * 0.3, ph: r() * 6.28 }
      case 'sparkle': return { x, y: r() * h * 0.9, vx: 0, vy: -4, s: 1 + r() * 2.5, a: 0, ph: r() * 6.28 }
      case 'leaves': return { x: init ? x : -10, y: init ? r() * h : r() * h * 0.5, vx: 25 + r() * 25, vy: 18 + r() * 20, s: 2 + r() * 2.5, a: 0.7, ph: r() * 6.28 }
      case 'bubbles': return { x, y: init ? r() * h : h + 6, vx: 0, vy: -(14 + r() * 24), s: 1.5 + r() * 3, a: 0.4, ph: r() * 6.28 }
      case 'mist': return { x: r() * w, y: h * (0.55 + r() * 0.35), vx: 6 + r() * 8, vy: 0, s: 90 + r() * 120, a: 0.05 + r() * 0.07, ph: r() * 6.28 }
      default: return { x, y, vx: 0, vy: 0, s: 1, a: 0, ph: 0 }
    }
  }

  update(dt: number) {
    this.t += dt
    this.px += (this.pxT - this.px) * Math.min(1, dt * 3)
    this.py += (this.pyT - this.py) * Math.min(1, dt * 3)
    this.fade = Math.max(0, this.fade - dt * 1.6)
    this.tintA = Math.max(0, this.tintA - dt * 0.9)
    this.flash = Math.max(0, this.flash - dt * 2.5)
    if (this.look.fx.includes('lightning')) {
      this.bolt -= dt
      if (this.bolt <= 0) {
        this.flash = 0.8
        this.bolt = 3 + Math.random() * 6
      }
    }
    const { w, h } = this
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i]
      const k = this.kinds[i]
      p.ph += dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (k === 'snow') p.x += Math.sin(p.ph * 1.3) * 12 * dt
      if (k === 'dust' || k === 'embers' || k === 'bubbles') p.x += Math.sin(p.ph * 1.7) * 10 * dt
      if (k === 'fireflies') {
        p.x += Math.sin(p.ph * 0.7) * 14 * dt
        p.y += Math.cos(p.ph * 0.9) * 10 * dt
      }
      if (k === 'sparkle') {
        p.vy = -4
        if (p.ph > 4) {
          Object.assign(p, this.spawn('sparkle'), { y: Math.random() * h * 0.9 })
          p.ph = 0
        }
      }
      if (k === 'mist' && p.x > w + p.s) p.x = -p.s
      const off = p.y > h + 20 || p.y < -30 || p.x > w + 30 || p.x < -80
      if (off && k !== 'mist' && k !== 'fireflies' && k !== 'sparkle') this.parts[i] = this.spawn(k)
    }
  }

  draw() {
    const { ctx, w, h, look } = this
    const t = this.t
    if (!this.skyG) {
      this.skyG = ctx.createLinearGradient(0, 0, 0, h)
      this.skyG.addColorStop(0, look.sky[0])
      this.skyG.addColorStop(1, look.sky[1])
    }
    ctx.fillStyle = this.skyG
    ctx.fillRect(0, 0, w, h)
    // stars
    for (const s of this.stars) {
      ctx.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(t * (0.6 + s.a) + s.ph))
      ctx.fillStyle = '#fff'
      ctx.fillRect(s.x - this.px * 3 * s.s, s.y, s.s, s.s)
    }
    ctx.globalAlpha = 1
    // orb
    if (look.orb) {
      const ox = w * 0.78 - this.px * 8
      const oy = h * 0.26 - this.py * 4
      const g = ctx.createRadialGradient(ox, oy, 4, ox, oy, h * 0.5)
      g.addColorStop(0, look.orb === 'moon' ? 'rgba(220,230,255,0.55)' : 'rgba(255,230,160,0.7)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = look.orb === 'moon' ? '#eef3ff' : '#fff2c4'
      ctx.beginPath()
      ctx.arc(ox, oy, h * 0.09, 0, 6.3)
      ctx.fill()
    }
    // ridges (parallax)
    const base = h * 0.74
    if (look.sea) {
      this.waves(base, [look.far, look.mid, look.near])
    } else {
      this.ridge(base - h * 0.1, h * 0.09, 0.011, 0.6, look.far, 6, t * 2)
      this.ridge(base, h * 0.07, 0.017, 1.7, look.mid, 14, t * 4)
    }
    // glow behind the actors
    const gx = w / 2 - this.px * 10
    const gg = ctx.createRadialGradient(gx, base - h * 0.15, 2, gx, base - h * 0.15, Math.max(w, h) * 0.45)
    gg.addColorStop(0, look.glow + '55')
    gg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gg
    ctx.fillRect(0, 0, w, h)
    // mist behind actors
    this.drawParts(true)
    // actors
    const n = this.emojis.length
    const unit = Math.min(h * 0.46, (w / Math.max(1, n)) * 0.7)
    for (let i = 0; i < n; i++) {
      const lead = i === 0 && n > 1
      const size = unit * (n === 1 ? 1.15 : lead ? 1.15 : 0.85 - i * 0.06)
      const depth = lead ? 1.4 : 0.8 + (i % 2) * 0.5
      const x = w * ((i + 1) / (n + 1)) + (lead && n > 2 ? 0 : 0) - this.px * 9 * depth
      const bob = Math.sin(t * 1.1 + i * 1.7) * 3
      const y = base - size * 0.35 + bob - this.py * 3 * depth - (i % 2 ? size * 0.06 : 0)
      ctx.fillStyle = 'rgba(0,0,0,0.28)'
      ctx.beginPath()
      ctx.ellipse(x, base + size * 0.14, size * 0.42, size * 0.07, 0, 0, 6.3)
      ctx.fill()
      ctx.shadowColor = look.glow
      ctx.shadowBlur = 16
      emoji(ctx, this.emojis[i], x, y, size, Math.sin(t * 0.8 + i) * 0.03)
      ctx.shadowBlur = 0
    }
    // foreground ridge
    if (!look.sea) this.ridge(h - h * 0.08, h * 0.05, 0.025, 3.1, look.near, 26, t * 7)
    this.drawParts(false)
    // vignette
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75)
    vg.addColorStop(0, 'rgba(0,0,0,0)')
    vg.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.fillStyle = vg
    ctx.fillRect(0, 0, w, h)
    if (this.tintA > 0.01) {
      ctx.globalAlpha = this.tintA
      ctx.fillStyle = this.tint
      ctx.fillRect(0, 0, w, h)
      ctx.globalAlpha = 1
    }
    if (this.flash > 0.01) {
      ctx.globalAlpha = this.flash * 0.6
      ctx.fillStyle = '#e8f0ff'
      ctx.fillRect(0, 0, w, h)
      ctx.globalAlpha = 1
    }
    if (this.fade > 0.01) {
      ctx.globalAlpha = this.fade
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)
      ctx.globalAlpha = 1
    }
  }

  private ridge(y0: number, amp: number, f: number, phase: number, color: string, drift: number, tm: number) {
    const { ctx, w, h } = this
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(0, h)
    const off = this.px * drift + Math.sin(tm * 0.05) * 3
    for (let x = 0; x <= w + 8; x += 8) {
      const xx = x + off
      ctx.lineTo(x, y0 + Math.sin(xx * f + phase) * amp + Math.sin(xx * f * 2.3 + phase * 1.7) * amp * 0.45)
    }
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()
  }

  private waves(base: number, cols: string[]) {
    const { ctx, w, h, t } = this
    for (let l = 0; l < 3; l++) {
      ctx.fillStyle = cols[l]
      ctx.beginPath()
      ctx.moveTo(0, h)
      const y0 = base - h * 0.08 + l * h * 0.07
      for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, y0 + Math.sin(x * 0.02 + t * (0.8 + l * 0.3) + l * 2 + this.px * 2) * (3 + l * 2))
      ctx.lineTo(w, h)
      ctx.closePath()
      ctx.fill()
    }
  }

  private drawParts(back: boolean) {
    const { ctx, t, h } = this
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i]
      const k = this.kinds[i]
      if ((k === 'mist') !== back) continue
      switch (k) {
        case 'rain':
          ctx.strokeStyle = `rgba(200,220,255,${p.a})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.vx * 0.02, p.y - p.s)
          ctx.stroke()
          break
        case 'snow':
          ctx.fillStyle = `rgba(255,255,255,${p.a})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.s, 0, 6.3)
          ctx.fill()
          break
        case 'embers': {
          const a = Math.max(0, p.a * (1 - Math.max(0, (h - p.y) / h) * 0.2)) * (0.6 + 0.4 * Math.sin(p.ph * 6))
          ctx.fillStyle = `rgba(255,${140 + Math.round(60 * Math.sin(p.ph))},60,${a})`
          ctx.fillRect(p.x, p.y, p.s, p.s)
          break
        }
        case 'fireflies': {
          const a = Math.max(0, Math.sin(p.ph * 1.4)) ** 2
          ctx.fillStyle = `rgba(210,255,140,${a})`
          ctx.shadowColor = '#d6ff8a'
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.s, 0, 6.3)
          ctx.fill()
          ctx.shadowBlur = 0
          break
        }
        case 'dust':
          ctx.fillStyle = `rgba(255,236,200,${p.a * (0.6 + 0.4 * Math.sin(p.ph * 2))})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.s, 0, 6.3)
          ctx.fill()
          break
        case 'sparkle': {
          const a = Math.sin((p.ph / 4) * Math.PI)
          if (a > 0) {
            ctx.fillStyle = `rgba(255,255,255,${a})`
            ctx.fillRect(p.x - p.s * 2, p.y - 0.5, p.s * 4, 1)
            ctx.fillRect(p.x - 0.5, p.y - p.s * 2, 1, p.s * 4)
          }
          break
        }
        case 'leaves':
          ctx.fillStyle = `rgba(150,210,110,${p.a})`
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.ph * 2)
          ctx.fillRect(-p.s, -p.s / 2, p.s * 2, p.s)
          ctx.restore()
          break
        case 'bubbles':
          ctx.strokeStyle = `rgba(220,245,255,${p.a})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.s, 0, 6.3)
          ctx.stroke()
          break
        case 'mist': {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s)
          g.addColorStop(0, `rgba(210,220,235,${p.a})`)
          g.addColorStop(1, 'rgba(210,220,235,0)')
          ctx.fillStyle = g
          ctx.fillRect(p.x - p.s, p.y - p.s, p.s * 2, p.s * 2)
          break
        }
      }
    }
    void t
  }
}
