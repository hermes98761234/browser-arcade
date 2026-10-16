// Paint: creative toy. Sub-modes: free drawing (brushes, symmetry, stamps, fill), falling sand, generative art, pixel art.
import { Bag, clamp, createDom, emoji, lerp, loop, makeRng, text, type Engine, type GameEnv } from '../kit'
import { E, FIRE, floodFill, makeNoise, SAND, SandWorld, SMOKE, SYM_ORDER, spiro, spiroPeriod, symTransforms, WALL, WATER, WOOD, type SymMode } from '../logic/paint'

type Mode = 'draw' | 'sand' | 'gen' | 'pixel'
interface Handle {
  update(dt: number): void
  draw(): void
  destroy(): void
}
interface Shell {
  env: GameEnv
  bar: HTMLElement
  bar2: HTMLElement
  bag: Bag
  box(aspect: number): HTMLDivElement
  strokes(n?: number): void
  portrait: boolean
}

const STYLE = `
.pnt{display:flex;flex-direction:column;font-family:system-ui,sans-serif;user-select:none;-webkit-user-select:none;overflow:hidden}
.pnt-bar{display:flex;flex-wrap:wrap;gap:6px;padding:6px 8px;align-items:center;background:rgba(0,0,0,.38);flex:0 0 auto}
.pnt-area{flex:1 1 0;min-height:0;display:flex;align-items:center;justify-content:center;padding:8px;box-sizing:border-box;position:relative}
.pnt-box{position:relative;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.45),0 0 0 2px rgba(255,255,255,.12)}
.pnt-b{min-width:36px;height:34px;padding:0 9px;border-radius:9px;border:2px solid transparent;background:rgba(255,255,255,.12);color:#fff;font-size:17px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px;font-weight:700;touch-action:manipulation}
.pnt-b small{font-size:11px;font-weight:700}
.pnt-b:hover{background:rgba(255,255,255,.22)}
.pnt-b.on{background:var(--g-accent);color:#071018;border-color:#fff}
.pnt-sep{width:2px;height:24px;background:rgba(255,255,255,.18);margin:0 2px}
.pnt-sl{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:#fff}
.pnt-sl input{width:84px;accent-color:var(--g-accent)}
.pnt-sw{width:26px;height:26px;border-radius:50%;border:3px solid rgba(255,255,255,.25);cursor:pointer;padding:0;touch-action:manipulation}
.pnt-sw.on{border-color:#fff;transform:scale(1.18);box-shadow:0 0 10px rgba(255,255,255,.7)}
.pnt-stamp{font-size:20px;min-width:34px;padding:0 4px}
@media (pointer:coarse),(max-width:700px){.pnt-bar{flex-wrap:nowrap;overflow-x:auto;gap:5px;scrollbar-width:none}.pnt-bar>*{flex:0 0 auto}.pnt-b{min-width:42px;height:42px}.pnt-b small{display:none}.pnt-sw{width:32px;height:32px}.pnt-sl input{width:100px}.pnt-area{padding:4px}}
`

const EXTRAS = ['#ffffff', '#111827', '#94a3b8', '#f5c9a0', '#7c4a24', '#ec4899']
const RAINBOW = 'rainbow'

function el<K extends keyof HTMLElementTagNameMap>(tag: K, parent?: HTMLElement, cls = '', css = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (css) e.style.cssText = css
  parent?.appendChild(e)
  return e
}
function btn(parent: HTMLElement, label: string, title: string, fn: () => void, small = ''): HTMLButtonElement {
  const b = el('button', parent, 'pnt-b')
  b.type = 'button'
  b.innerHTML = small ? `${label}<small>${small}</small>` : label
  b.title = title
  b.addEventListener('click', fn)
  return b
}
function slider(parent: HTMLElement, label: string, min: number, max: number, val: number, onInput: (v: number) => void, onChange?: (v: number) => void, step = 1) {
  const w = el('label', parent, 'pnt-sl')
  const s = el('span', w)
  s.textContent = label
  const i = el('input', w)
  i.type = 'range'
  i.min = String(min)
  i.max = String(max)
  i.step = String(step)
  i.value = String(val)
  i.addEventListener('input', () => onInput(Number(i.value)))
  if (onChange) i.addEventListener('change', () => onChange(Number(i.value)))
  return i
}
const sep = (p: HTMLElement) => el('span', p, 'pnt-sep')
function hexRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const rgbStr = (c: number[]) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`
function mix(a: string, b: string, k: number) {
  const x = hexRgb(a)
  const y = hexRgb(b)
  return rgbStr([lerp(x[0], y[0], k), lerp(x[1], y[1], k), lerp(x[2], y[2], k)])
}
function download(c: HTMLCanvasElement, name: string) {
  const a = document.createElement('a')
  a.href = c.toDataURL('image/png')
  a.download = `${name}.png`
  document.body.appendChild(a)
  a.click()
  a.remove()
}

const engine: Engine = {
  start(env) {
    const { theme: t } = env
    const nm = `${env.name} ${env.desc}`.toLowerCase()
    const mode: Mode = /\bsand\b/.test(nm) ? 'sand' : /generative|fractal|spirograph|flow|l-system|attractor|aurora|dreamscape|recursion tree/.test(nm) ? 'gen' : /pixel/.test(nm) ? 'pixel' : 'draw'
    const bag = new Bag()
    const style = document.createElement('style')
    style.textContent = STYLE
    document.head.appendChild(style)
    const root = createDom(env.host, t, 'pnt')
    root.style.overflow = 'hidden'
    const bar = el('div', root, 'pnt-bar')
    const bar2 = el('div', root, 'pnt-bar')
    const area = el('div', root, 'pnt-area')
    let strokes = 0
    const hr = env.host.getBoundingClientRect()
    const shell: Shell = {
      env, bar, bar2, bag, portrait: hr.height > hr.width * 1.05,
      strokes(n = 1) {
        strokes += n
        env.score(strokes)
        env.status(`Strokes ${strokes}`)
      },
      box(aspect) {
        const b = el('div', area, 'pnt-box')
        const fit = () => {
          const r = area.getBoundingClientRect()
          const aw = r.width - 16
          const ah = r.height - 16
          const w = Math.max(40, Math.min(aw, ah * aspect))
          b.style.width = `${Math.floor(w)}px`
          b.style.height = `${Math.floor(w / aspect)}px`
        }
        fit()
        const ro = new ResizeObserver(fit)
        ro.observe(area)
        bag.add(() => ro.disconnect())
        return b
      },
    }
    env.score(0)
    env.status('Strokes 0')
    const m = mode === 'sand' ? sandMode(shell, nm) : mode === 'gen' ? genMode(shell, nm) : mode === 'pixel' ? pixelMode(shell) : drawMode(shell, nm)
    const lp = loop(m.update, m.draw)
    return {
      pause: (p) => lp.pause(p),
      destroy() {
        lp.stop()
        m.destroy()
        bag.dispose()
        root.remove()
        style.remove()
      },
    }
  },
}
export default engine

// ======================================================================
// Free drawing
// ======================================================================
type Tool = 'pen' | 'ink' | 'glow' | 'chalk' | 'water' | 'spray' | 'stamp' | 'fill' | 'erase'
const TOOLS: [Tool, string, string][] = [
  ['pen', '🖊️', 'Pen'], ['ink', '🖌️', 'Ink brush (speed changes width)'], ['glow', '💡', 'Neon glow'], ['chalk', '🖍️', 'Chalk'],
  ['water', '💧', 'Watercolor'], ['spray', '🎨', 'Spray'], ['stamp', '⭐', 'Stamp'], ['fill', '🪣', 'Fill'], ['erase', '🧽', 'Eraser'],
]
const SYM_LABEL: Record<SymMode, string> = { off: '▢', mirror: '⇋', quad: '✣', kaleido: '❋', mandala: '✺' }
const SYM_NAME: Record<SymMode, string> = { off: 'No symmetry', mirror: 'Mirror', quad: '4-way', kaleido: 'Kaleidoscope x6', mandala: 'Mandala x8 mirrored' }

function drawMode(sh: Shell, nm: string): Handle {
  const { env, bag } = sh
  const t = env.theme
  const CW = sh.portrait ? 540 : 960
  const CH = sh.portrait ? 720 : 540
  const box = sh.box(CW / CH)
  const mkc = () => {
    const c = el('canvas', box, '', 'position:absolute;inset:0;width:100%;height:100%;touch-action:none')
    c.width = CW
    c.height = CH
    return c
  }
  const papers = [t.bg2, '#f8f5ee', '#0d1017']
  let paper = /chalk|sidewalk/.test(nm) ? 2 : /watercolor|spread|collage|comic|calligraphy|blot|quilt|sketch/.test(nm) ? 1 : 0
  const applyPaper = () => (box.style.background = papers[paper])
  applyPaper()
  const dc = mkc()
  const sc = mkc()
  const oc = mkc()
  const dctx = dc.getContext('2d', { willReadFrequently: true })!
  const sctx = sc.getContext('2d')!
  const octx = oc.getContext('2d')!

  let tool: Tool = /neon|glow|sign|glitch|constellation/.test(nm) ? 'glow' : /chalk/.test(nm) ? 'chalk' : /watercolor|bloom|aurora/.test(nm) ? 'water'
    : /calligraphy|brush|ink|zen/.test(nm) ? 'ink' : /spray|graffiti|stencil/.test(nm) ? 'spray' : /stamp|linocut|collage|cupcake|decorator|mosaic|sticker/.test(nm) ? 'stamp' : 'pen'
  let sym: SymMode = env.mods.has('mirror') || /mirror|symmetr|butterfly|half picture|ink blot/.test(nm) ? 'mirror' : /mandala|rangoli/.test(nm) || env.mods.has('rotate') ? 'mandala' : /kaleido/.test(nm) ? 'kaleido' : 'off'
  let syms = symTransforms(sym)
  let color = t.accent
  let size = tool === 'stamp' ? 12 : tool === 'spray' ? 14 : 8
  let alpha = tool === 'water' ? 0.8 : 1
  let hue = 0
  const stamps = [t.hero, ...t.items.slice(0, 7)]
  let stamp = t.hero
  let down = false
  let last = { x: 0, y: 0 }
  let lastMid = { x: 0, y: 0 }
  let hover: { x: number; y: number } | null = null
  let inkW = 8
  let stampAcc = 0
  let started = false
  let time = 0
  const undo: ImageData[] = []
  let strokeAlpha = 1

  const curColor = () => (color === RAINBOW ? `hsl(${hue % 360} 92% 60%)` : color)
  const eachSym = (c: CanvasRenderingContext2D, fn: () => void) => {
    for (const s of syms) {
      c.save()
      c.translate(CW / 2, CH / 2)
      c.rotate(s.rot)
      if (s.flip) c.scale(-1, 1)
      c.translate(-CW / 2, -CH / 2)
      fn()
      c.restore()
    }
  }
  const pushUndo = () => {
    undo.push(dctx.getImageData(0, 0, CW, CH))
    if (undo.length > 18) undo.shift()
  }
  const along = (a: { x: number; y: number }, b: { x: number; y: number }, step: number, fn: (x: number, y: number) => void) => {
    const d = Math.hypot(b.x - a.x, b.y - a.y)
    const n = Math.max(1, Math.floor(d / step))
    for (let i = 1; i <= n; i++) fn(lerp(a.x, b.x, i / n), lerp(a.y, b.y, i / n))
  }
  const dot = (c: CanvasRenderingContext2D, x: number, y: number, r: number, col: string) => {
    c.fillStyle = col
    c.beginPath()
    c.arc(x, y, r, 0, Math.PI * 2)
    c.fill()
  }

  const strokeSeg = (a: { x: number; y: number }, b: { x: number; y: number }, mid: { x: number; y: number }) => {
    const col = curColor()
    if (tool === 'pen' || tool === 'glow' || tool === 'ink') {
      let w = size
      if (tool === 'ink') {
        const sp = Math.hypot(b.x - a.x, b.y - a.y)
        inkW = lerp(inkW, size * clamp(2 - sp / 12, 0.35, 2), 0.25)
        w = inkW
      }
      eachSym(sctx, () => {
        sctx.lineCap = sctx.lineJoin = 'round'
        sctx.lineWidth = w
        sctx.strokeStyle = col
        if (tool === 'glow') {
          sctx.shadowColor = col
          sctx.shadowBlur = size * 1.3 + 6
        }
        sctx.beginPath()
        sctx.moveTo(lastMid.x, lastMid.y)
        sctx.quadraticCurveTo(a.x, a.y, mid.x, mid.y)
        sctx.stroke()
        sctx.shadowBlur = 0
      })
    } else if (tool === 'chalk') {
      eachSym(sctx, () => {
        along(a, b, 2, (x, y) => {
          sctx.fillStyle = col
          for (let i = 0; i < Math.max(3, size * 0.9); i++) {
            const ang = Math.random() * 6.283
            const r = Math.sqrt(Math.random()) * size * 0.55
            sctx.globalAlpha = 0.35 + Math.random() * 0.65
            sctx.fillRect(x + Math.cos(ang) * r, y + Math.sin(ang) * r, 1 + Math.random() * 1.3, 1 + Math.random() * 1.3)
          }
        })
        sctx.globalAlpha = 1
      })
    } else if (tool === 'water') {
      eachSym(dctx, () => {
        along(a, b, Math.max(2, size * 0.35), (x, y) => {
          const g = dctx.createRadialGradient(x, y, 0, x, y, size * 1.4)
          g.addColorStop(0, col)
          g.addColorStop(1, 'rgba(0,0,0,0)')
          dctx.globalAlpha = alpha * 0.13
          dctx.fillStyle = g
          dctx.beginPath()
          dctx.arc(x, y, size * 1.4, 0, 6.283)
          dctx.fill()
        })
        dctx.globalAlpha = 1
      })
    } else if (tool === 'erase') {
      eachSym(dctx, () => {
        dctx.globalCompositeOperation = 'destination-out'
        dctx.globalAlpha = alpha
        dctx.lineCap = 'round'
        dctx.lineWidth = size * 1.6
        dctx.beginPath()
        dctx.moveTo(a.x, a.y)
        dctx.lineTo(b.x, b.y)
        dctx.stroke()
        dctx.globalCompositeOperation = 'source-over'
        dctx.globalAlpha = 1
      })
    } else if (tool === 'stamp') {
      stampAcc += Math.hypot(b.x - a.x, b.y - a.y)
      const sp = size * 2.4 + 20
      if (stampAcc >= sp) {
        stampAcc = 0
        stampAt(b.x, b.y)
      }
    }
  }
  const stampAt = (x: number, y: number) => {
    const sz = size * 2.2 + 18
    const rot = (Math.random() - 0.5) * 0.5
    eachSym(dctx, () => {
      dctx.globalAlpha = alpha
      emoji(dctx, stamp, x, y, sz * (0.9 + Math.random() * 0.2), rot)
      dctx.globalAlpha = 1
    })
    env.sfx('click')
  }
  const spray = () => {
    const col = curColor()
    const n = Math.round(size * 1.6)
    eachSym(dctx, () => {
      dctx.fillStyle = col
      dctx.globalAlpha = alpha * 0.7
      for (let i = 0; i < n; i++) {
        const a = Math.random() * 6.283
        const r = Math.pow(Math.random(), 0.7) * size * 2.2
        dctx.fillRect(last.x + Math.cos(a) * r, last.y + Math.sin(a) * r, 1.6, 1.6)
      }
      dctx.globalAlpha = 1
    })
  }
  const doFill = (x: number, y: number) => {
    const img = dctx.getImageData(0, 0, CW, CH)
    const c = hexRgb(color === RAINBOW ? '#ec4899' : color)
    const rgb = color === RAINBOW ? hslToRgb(hue % 360) : c
    const pts = new Set<string>()
    for (const s of syms) {
      const dx = x - CW / 2
      const dy = y - CH / 2
      const fx = s.flip ? -dx : dx
      const px = CW / 2 + fx * Math.cos(s.rot) - dy * Math.sin(s.rot)
      const py = CH / 2 + fx * Math.sin(s.rot) + dy * Math.cos(s.rot)
      pts.add(`${Math.round(px)},${Math.round(py)}`)
    }
    for (const p of pts) {
      const [px, py] = p.split(',').map(Number)
      floodFill(img.data, CW, CH, px, py, [rgb[0], rgb[1], rgb[2], Math.round(255 * Math.max(0.2, alpha))], 48)
    }
    dctx.putImageData(img, 0, 0)
  }

  const pos = (e: PointerEvent) => {
    const r = oc.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * CW, y: ((e.clientY - r.top) / r.height) * CH }
  }
  const usesLayer = () => tool === 'pen' || tool === 'ink' || tool === 'glow' || tool === 'chalk'
  const onDown = (e: PointerEvent) => {
    if (e.button > 0 && e.pointerType === 'mouse') return
    e.preventDefault()
    try { oc.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    const p = pos(e)
    started = true
    pushUndo()
    if (tool === 'fill') {
      doFill(p.x, p.y)
      env.sfx('power')
      sh.strokes()
      return
    }
    down = true
    last = p
    lastMid = p
    inkW = size
    stampAcc = 0
    strokeAlpha = alpha
    sc.style.opacity = String(usesLayer() ? alpha : 1)
    if (usesLayer()) {
      const col = curColor()
      eachSym(sctx, () => {
        if (tool === 'glow') {
          sctx.shadowColor = col
          sctx.shadowBlur = size * 1.3 + 6
        }
        if (tool !== 'chalk') dot(sctx, p.x, p.y, size / 2, col)
        sctx.shadowBlur = 0
      })
      if (tool === 'chalk') strokeSeg(p, { x: p.x + 0.1, y: p.y }, p)
    } else if (tool === 'stamp') stampAt(p.x, p.y)
    else if (tool === 'spray') spray()
    else if (tool === 'water' || tool === 'erase') strokeSeg(p, { x: p.x + 0.1, y: p.y }, p)
  }
  const onMove = (e: PointerEvent) => {
    const p = pos(e)
    hover = p
    if (!down) return
    hue += 3
    const mid = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 }
    if (tool === 'spray') {
      last = p
      return
    }
    strokeSeg(last, p, mid)
    last = p
    lastMid = mid
  }
  const onUp = () => {
    if (!down) return
    down = false
    if (usesLayer()) {
      dctx.globalAlpha = strokeAlpha
      dctx.drawImage(sc, 0, 0)
      dctx.globalAlpha = 1
      sctx.clearRect(0, 0, CW, CH)
      sc.style.opacity = '1'
    }
    sh.strokes()
  }
  bag.on(oc, 'pointerdown', onDown)
  bag.on(oc, 'pointermove', onMove)
  bag.on(oc, 'pointerup', onUp)
  bag.on(oc, 'pointercancel', onUp)
  bag.on(oc, 'pointerleave', () => (hover = null))

  // ---- toolbar ----
  const toolBtns = new Map<Tool, HTMLButtonElement>()
  const setTool = (k: Tool) => {
    tool = k
    for (const [kk, b] of toolBtns) b.classList.toggle('on', kk === k)
    stampRow.style.display = k === 'stamp' ? 'flex' : 'none'
  }
  for (const [k, ic, title] of TOOLS) toolBtns.set(k, btn(sh.bar, ic, title, () => setTool(k)))
  sep(sh.bar)
  const symBtn = btn(sh.bar, SYM_LABEL[sym], SYM_NAME[sym], () => {
    sym = SYM_ORDER[(SYM_ORDER.indexOf(sym) + 1) % SYM_ORDER.length]
    syms = symTransforms(sym)
    symBtn.innerHTML = `${SYM_LABEL[sym]}<small>${SYM_NAME[sym]}</small>`
    env.sfx('click')
  })
  symBtn.innerHTML = `${SYM_LABEL[sym]}<small>${SYM_NAME[sym]}</small>`
  sep(sh.bar)
  btn(sh.bar, '↶', 'Undo (Ctrl+Z)', () => doUndo(), 'Undo')
  btn(sh.bar, '🗑️', 'Clear', () => {
    pushUndo()
    dctx.clearRect(0, 0, CW, CH)
    env.sfx('hit')
  })
  btn(sh.bar, '◐', 'Paper colour', () => {
    paper = (paper + 1) % papers.length
    applyPaper()
  })
  btn(sh.bar, '💾', 'Save PNG', () => save(), 'Save')
  const doUndo = () => {
    const s = undo.pop()
    if (s) {
      dctx.putImageData(s, 0, 0)
      env.sfx('move')
    }
  }
  const save = () => {
    const out = document.createElement('canvas')
    out.width = CW
    out.height = CH
    const c = out.getContext('2d')!
    c.fillStyle = papers[paper]
    c.fillRect(0, 0, CW, CH)
    c.drawImage(dc, 0, 0)
    download(out, 'my-painting')
    env.sfx('power')
  }
  slider(sh.bar2, 'Size', 1, 60, size, (v) => (size = v))
  slider(sh.bar2, 'Opacity', 5, 100, alpha * 100, (v) => (alpha = v / 100))
  sep(sh.bar2)
  const sws: HTMLButtonElement[] = []
  const cols = [...t.blocks, ...EXTRAS, RAINBOW]
  const pick = (i: number) => {
    color = cols[i]
    sws.forEach((s, j) => s.classList.toggle('on', i === j))
  }
  cols.forEach((c, i) => {
    const b = el('button', sh.bar2, 'pnt-sw')
    b.type = 'button'
    b.title = c === RAINBOW ? 'Rainbow' : c
    b.style.background = c === RAINBOW ? 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' : c
    b.addEventListener('click', () => pick(i))
    sws.push(b)
  })
  const stampRow = el('div', sh.bar2, '', 'display:none;gap:4px;align-items:center')
  for (const s of stamps) {
    const b = btn(stampRow, s, 'Stamp', () => {
      stamp = s
      stampRow.querySelectorAll('.pnt-b').forEach((x) => x.classList.toggle('on', x === b))
    })
    b.classList.add('pnt-stamp')
    if (s === stamp) b.classList.add('on')
  }
  pick(cols.indexOf(color) >= 0 ? cols.indexOf(color) : 0)
  setTool(tool)

  bag.on(window, 'keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
      e.preventDefault()
      doUndo()
    } else if (e.code === 'BracketLeft') size = clamp(size - 2, 1, 60)
    else if (e.code === 'BracketRight') size = clamp(size + 2, 1, 60)
  })

  return {
    update(dt) {
      time += dt
      if (down && tool === 'spray') spray()
    },
    draw() {
      octx.clearRect(0, 0, CW, CH)
      // symmetry guides
      if (sym !== 'off') {
        octx.strokeStyle = 'rgba(255,255,255,.14)'
        octx.lineWidth = 1.5
        octx.setLineDash([6, 8])
        octx.beginPath()
        const lines = sym === 'mirror' ? 1 : sym === 'quad' ? 2 : sym === 'kaleido' ? 3 : 4
        for (let i = 0; i < lines; i++) {
          const a = (i * Math.PI) / lines + (sym === 'kaleido' ? Math.PI / 2 : 0)
          const dx = Math.cos(a - Math.PI / 2) * 700
          const dy = Math.sin(a - Math.PI / 2) * 700
          octx.moveTo(CW / 2 - dx, CH / 2 - dy)
          octx.lineTo(CW / 2 + dx, CH / 2 + dy)
        }
        octx.stroke()
        octx.setLineDash([])
      }
      if (hover && tool !== 'fill') {
        octx.strokeStyle = 'rgba(255,255,255,.75)'
        octx.lineWidth = 1.5
        eachSym(octx, () => {
          octx.beginPath()
          const r = tool === 'spray' ? size * 2.2 : tool === 'erase' ? size * 0.8 : tool === 'stamp' ? (size * 2.2 + 18) / 2 : size / 2
          octx.arc(hover!.x, hover!.y, Math.max(2, r), 0, 6.283)
          octx.stroke()
        })
      }
      if (!started) {
        const k = 1 + Math.sin(time * 3) * 0.06
        emoji(octx, t.hero, CW / 2, CH / 2 - 20, 110 * k)
        text(octx, 'DRAW SOMETHING!', CW / 2, CH / 2 + 70, { size: 20, color: '#fff', shadow: t.accent })
        if (sym !== 'off') text(octx, SYM_NAME[sym].toUpperCase(), CW / 2, CH / 2 + 105, { size: 12, color: t.accent })
      }
    },
    destroy() {
      /* canvases are removed with the root */
    },
  }
}

function hslToRgb(h: number): [number, number, number] {
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return Math.round(255 * (0.6 - 0.4 * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
  }
  return [f(0), f(8), f(4)]
}

// ======================================================================
// Falling sand
// ======================================================================
function sandMode(sh: Shell, nm: string): Handle {
  const { env, bag } = sh
  const t = env.theme
  const GW = sh.portrait ? 135 : 240
  const GH = sh.portrait ? 180 : 135
  const OW = GW * 4
  const OH = GH * 4
  const KX = GW / 240
  const KY = GH / 135
  const rng = makeRng(env.seed)
  const world = new SandWorld(GW, GH)
  const box = sh.box(GW / GH)
  box.style.background = `linear-gradient(${t.bg},${t.bg2})`
  const cv = el('canvas', box, '', 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;touch-action:none')
  cv.width = GW
  cv.height = GH
  const ctx = cv.getContext('2d')!
  const oc = el('canvas', box, '', 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none')
  oc.width = OW
  oc.height = OH
  const octx = oc.getContext('2d')!
  const img = ctx.createImageData(GW, GH)
  const pal = [...t.blocks, ...EXTRAS.slice(0, 5)].map(hexRgb)
  const palHex = [...t.blocks, ...EXTRAS.slice(0, 5)]
  let mat = SAND
  let col = 0
  let rainbow = env.mods.has('color') || /mandala|color/.test(nm)
  let brush = 4
  let mirror = env.mods.has('mirror') || /mandala|mirror|kaleido/.test(nm)
  let down = false
  let last = { x: 0, y: 0 }
  let hover: { x: number; y: number } | null = null
  let started = false
  let time = 0
  let rbCount = 0
  const undo: { t: Uint8Array; c: Uint8Array; l: Uint8Array }[] = []

  // starter scene: ledges, a sand pile and a pool (coordinates in a 240x135 design space)
  const wallC = pal.length - 4
  const X = (v: number) => Math.round(v * KX)
  const Y = (v: number) => Math.round(v * KY)
  const box2 = (x0: number, x1: number, y0: number, y1: number, ty: number, c: number, f: (x: number, y: number) => number = () => 0) => {
    for (let x = X(x0); x < X(x1); x++) for (let y = Y(y0); y < Y(y1); y++) world.set(x, y + f(x, y), ty, c, rng)
  }
  for (let x = X(8); x < X(100); x++) for (let k = 0; k < 3; k++) world.set(x, Y(80) + k + Math.floor((x - X(8)) / 14), WALL, wallC, rng)
  for (let x = X(120); x < X(228); x++) for (let k = 0; k < 3; k++) world.set(x, Y(60) + k - Math.floor((x - X(120)) / 16), WALL, wallC, rng)
  box2(0, 240, 131, 135, WALL, wallC)
  box2(2, 10, 105, 131, WALL, wallC)
  box2(230, 238, 105, 131, WALL, wallC)
  for (let i = 0; i < 700 * KX * KY; i++) world.set(rng.int(X(20), X(80)), rng.int(Y(40), Y(78)), SAND, rng.int(0, Math.min(6, pal.length - 1)), rng)
  for (let i = 0; i < 900 * KX * KY; i++) world.set(rng.int(X(14), X(226)), rng.int(Y(107), Y(129)), WATER, 0, rng)
  for (let i = 0; i < 500 * KX * KY; i++) world.set(rng.int(X(130), X(200)), rng.int(Y(20), Y(55)), SAND, rng.int(0, 3), rng)

  const snap = () => {
    undo.push({ t: world.t.slice(), c: world.c.slice(), l: world.l.slice() })
    if (undo.length > 20) undo.shift()
  }
  const cell = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * GW, y: ((e.clientY - r.top) / r.height) * GH }
  }
  const putBrush = (cx: number, cy: number) => {
    const r = brush
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r + 1) continue
        const dens = mat === SAND ? 0.32 : mat === WATER ? 0.4 : mat === FIRE ? 0.25 : 1
        if (Math.random() > dens) continue
        const c = rainbow ? rbCount++ % pal.length : col
        for (const x of mirror ? [Math.round(cx + dx), GW - 1 - Math.round(cx + dx)] : [Math.round(cx + dx)]) {
          const y = Math.round(cy + dy)
          if (mat === E) {
            if (x >= 0 && y >= 0 && x < GW && y < GH) world.t[y * GW + x] = E
          } else world.set(x, y, mat, c, Math.random)
        }
      }
  }
  const paintLine = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / Math.max(1, brush * 0.6)))
    for (let i = 1; i <= n; i++) putBrush(lerp(a.x, b.x, i / n), lerp(a.y, b.y, i / n))
  }
  bag.on(cv, 'pointerdown', (e) => {
    e.preventDefault()
    try { cv.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    snap()
    down = true
    started = true
    last = cell(e)
    putBrush(last.x, last.y)
  })
  bag.on(cv, 'pointermove', (e) => {
    hover = cell(e)
    if (down) {
      const p = hover
      paintLine(last, p)
      last = p
    }
  })
  const up = () => {
    if (down) sh.strokes()
    down = false
  }
  bag.on(cv, 'pointerup', up)
  bag.on(cv, 'pointercancel', up)
  bag.on(cv, 'pointerleave', () => (hover = null))

  // toolbar
  const mats: [number, string, string][] = [[SAND, '⏳', 'Sand'], [WATER, '💧', 'Water'], [WALL, '🧱', 'Wall'], [WOOD, '🪵', 'Wood (burns)'], [FIRE, '🔥', 'Fire'], [E, '🧽', 'Eraser']]
  const mbs = new Map<number, HTMLButtonElement>()
  const setMat = (m: number) => {
    mat = m
    for (const [k, b] of mbs) b.classList.toggle('on', k === m)
  }
  for (const [m, ic, title] of mats) mbs.set(m, btn(sh.bar, ic, title, () => setMat(m), title.split(' ')[0]))
  sep(sh.bar)
  const mb = btn(sh.bar, '⇋', 'Mirror pouring', () => {
    mirror = !mirror
    mb.classList.toggle('on', mirror)
  }, 'Mirror')
  mb.classList.toggle('on', mirror)
  btn(sh.bar, '↶', 'Undo', () => {
    const s = undo.pop()
    if (s) {
      world.t.set(s.t)
      world.c.set(s.c)
      world.l.set(s.l)
      env.sfx('move')
    }
  }, 'Undo')
  btn(sh.bar, '🗑️', 'Clear', () => {
    snap()
    world.clear()
    env.sfx('hit')
  })
  btn(sh.bar, '💾', 'Save PNG', () => {
    const out = document.createElement('canvas')
    out.width = OW
    out.height = OH
    const c = out.getContext('2d')!
    const g = c.createLinearGradient(0, 0, 0, OH)
    g.addColorStop(0, t.bg)
    g.addColorStop(1, t.bg2)
    c.fillStyle = g
    c.fillRect(0, 0, OW, OH)
    c.imageSmoothingEnabled = false
    c.drawImage(cv, 0, 0, OW, OH)
    download(out, 'my-sand')
    env.sfx('power')
  }, 'Save')
  slider(sh.bar2, 'Brush', 1, 12, brush, (v) => (brush = v))
  sep(sh.bar2)
  const sws: HTMLButtonElement[] = []
  palHex.forEach((c, i) => {
    const b = el('button', sh.bar2, 'pnt-sw')
    b.type = 'button'
    b.style.background = c
    b.addEventListener('click', () => {
      col = i
      rainbow = false
      rb.classList.remove('on')
      sws.forEach((s, j) => s.classList.toggle('on', j === i))
    })
    sws.push(b)
  })
  const rb = el('button', sh.bar2, 'pnt-sw')
  rb.type = 'button'
  rb.title = 'Rainbow sand'
  rb.style.background = 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)'
  rb.addEventListener('click', () => {
    rainbow = !rainbow
    rb.classList.toggle('on', rainbow)
    if (rainbow) sws.forEach((s) => s.classList.remove('on'))
  })
  if (rainbow) rb.classList.add('on')
  else sws[0].classList.add('on')
  setMat(mat)

  // colour lookup per type
  const wood = [120, 78, 40]
  const render = () => {
    const d = img.data
    const { t: T, c: C, l: L } = world
    for (let i = 0; i < T.length; i++) {
      const k = T[i]
      const o = i * 4
      if (k === E) {
        d[o + 3] = 0
        continue
      }
      let r = 0
      let g = 0
      let b = 0
      const v = L[i]
      if (k === SAND || k === WALL) {
        const p = pal[C[i] % pal.length]
        const sh2 = k === SAND ? 1 + (v - 1.5) * 0.07 : 1 - (v & 1) * 0.06
        r = p[0] * sh2
        g = p[1] * sh2
        b = p[2] * sh2
      } else if (k === WATER) {
        const ws = ((i % GW) + (i / GW | 0) + (time * 8 | 0)) & 7
        r = 40 + ws * 3
        g = 130 + ws * 4
        b = 235
      } else if (k === WOOD) {
        r = wood[0] + v * 6
        g = wood[1] + v * 4
        b = wood[2]
      } else if (k === FIRE) {
        const f = clamp(v / 40, 0, 1)
        r = 255
        g = 70 + f * 170 + Math.random() * 25
        b = 20 + f * 40
      } else if (k === SMOKE) {
        const s = 90 + v * 3
        r = g = b = s
        d[o + 3] = clamp(v * 7, 30, 170)
        d[o] = r
        d[o + 1] = g
        d[o + 2] = b
        continue
      }
      d[o] = r
      d[o + 1] = g
      d[o + 2] = b
      d[o + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
  }

  return {
    update(dt) {
      time += dt
      if (down) {
        const p = last
        putBrush(p.x, p.y)
      }
      world.step(Math.random)
      world.step(Math.random)
    },
    draw() {
      render()
      octx.clearRect(0, 0, OW, OH)
      if (hover) {
        octx.strokeStyle = 'rgba(255,255,255,.7)'
        octx.lineWidth = 1.5
        for (const hx of mirror ? [hover.x, GW - 1 - hover.x] : [hover.x]) {
          octx.beginPath()
          octx.arc(hx * 4, hover.y * 4, (brush + 0.5) * 4, 0, 6.283)
          octx.stroke()
        }
      }
      if (!started && time < 6) {
        octx.globalAlpha = clamp(6 - time, 0, 1)
        text(octx, env.name.toUpperCase(), OW / 2, 40, { size: 20, color: '#fff', shadow: t.accent })
        text(octx, 'POUR SAND, WATER AND FIRE', OW / 2, 76, { size: 12, color: t.accent })
        octx.globalAlpha = 1
      }
    },
    destroy() {
      /* nothing */
    },
  }
}

// ======================================================================
// Generative art
// ======================================================================
type GStyle = 'spiro' | 'flow' | 'tree'
const GPARAMS: Record<GStyle, { label: string; min: number; max: number }[]> = {
  spiro: [{ label: 'Gear', min: 20, max: 150 }, { label: 'Pen', min: 20, max: 180 }, { label: 'Speed', min: 1, max: 12 }, { label: 'Copies', min: 1, max: 6 }],
  flow: [{ label: 'Scale', min: 1, max: 20 }, { label: 'Swirl', min: 1, max: 12 }, { label: 'Fade', min: 1, max: 20 }, { label: 'Count', min: 200, max: 3000 }],
  tree: [{ label: 'Depth', min: 3, max: 11 }, { label: 'Angle', min: 10, max: 70 }, { label: 'Shrink', min: 55, max: 85 }, { label: 'Wind', min: 0, max: 10 }],
}

function genMode(sh: Shell, nm: string): Handle {
  const { env, bag } = sh
  const t = env.theme
  const CW = sh.portrait ? 540 : 960
  const CH = sh.portrait ? 720 : 540
  const box = sh.box(CW / CH)
  box.style.background = t.bg
  const cv = el('canvas', box, '', 'position:absolute;inset:0;width:100%;height:100%;touch-action:none')
  cv.width = CW
  cv.height = CH
  const ctx = cv.getContext('2d')!
  let gs: GStyle = /flow|aurora|dreamscape|attractor/.test(nm) ? 'flow' : /fractal|l-system|tree|recursion/.test(nm) ? 'tree' : 'spiro'
  let seed = env.seed
  let rng = makeRng(seed)
  let noise = makeNoise(seed)
  let palette: string[] = []
  const vals: Record<GStyle, number[]> = { spiro: [60, 90, 6, 3], flow: [8, 6, 8, 1400], tree: [9, 28, 74, 4] }
  let time = 0
  let paused = false
  let pointer: { x: number; y: number; down: boolean } | null = null

  // spirograph state
  let spT = 0
  let spLayer = 0
  let spPrev: [number, number] | null = null
  // flow state
  let px: Float32Array = new Float32Array(0)
  let py: Float32Array = new Float32Array(0)
  let pc: Uint8Array = new Uint8Array(0)

  const sliders: HTMLInputElement[] = []
  const labels: HTMLSpanElement[] = []

  const reseed = (newSeed: number, randomize: boolean) => {
    seed = newSeed
    rng = makeRng(seed)
    noise = makeNoise(seed)
    palette = rng.shuffle([...t.blocks]).slice(0, 4)
    if (randomize) {
      const v = vals[gs]
      if (gs === 'spiro') {
        v[0] = rng.int(25, 140)
        v[1] = rng.int(30, 170)
        v[3] = rng.int(1, 6)
      } else if (gs === 'flow') {
        v[0] = rng.int(3, 14)
        v[1] = rng.int(2, 10)
      } else {
        v[0] = rng.int(7, 11)
        v[1] = rng.int(15, 50)
        v[2] = rng.int(64, 80)
      }
      syncSliders()
    }
    restart()
  }
  const restart = () => {
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = t.bg
    ctx.fillRect(0, 0, CW, CH)
    spT = 0
    spLayer = 0
    spPrev = null
    if (gs === 'flow') {
      const n = vals.flow[3]
      px = new Float32Array(n)
      py = new Float32Array(n)
      pc = new Uint8Array(n)
      for (let i = 0; i < n; i++) {
        px[i] = rng() * CW
        py[i] = rng() * CH
        pc[i] = rng.int(0, 3)
      }
    }
  }
  const syncSliders = () => {
    const defs = GPARAMS[gs]
    sliders.forEach((s, i) => {
      s.min = String(defs[i].min)
      s.max = String(defs[i].max)
      s.value = String(vals[gs][i])
      labels[i].textContent = defs[i].label
    })
  }

  // toolbar
  const gbtns = new Map<GStyle, HTMLButtonElement>()
  const setStyle = (g: GStyle) => {
    gs = g
    for (const [k, b] of gbtns) b.classList.toggle('on', k === g)
    syncSliders()
    restart()
  }
  for (const [g, ic, title] of [['spiro', '🌀', 'Spirograph'], ['flow', '🌊', 'Flow field'], ['tree', '🌳', 'Fractal tree']] as const) gbtns.set(g, btn(sh.bar, ic, title, () => setStyle(g), title))
  sep(sh.bar)
  btn(sh.bar, '🎲', 'New seed', () => {
    reseed(Math.floor(Math.random() * 1e9) + 1, true)
    sh.strokes()
    env.sfx('power')
  }, 'New seed')
  const pb = btn(sh.bar, '⏸', 'Pause', () => {
    paused = !paused
    pb.innerHTML = paused ? '▶' : '⏸'
  })
  btn(sh.bar, '💾', 'Save PNG', () => {
    download(cv, 'my-art')
    env.sfx('power')
  }, 'Save')
  for (let i = 0; i < 4; i++) {
    const w = el('label', sh.bar2, 'pnt-sl')
    const s = el('span', w, '', 'min-width:44px')
    labels.push(s)
    const inp = el('input', w)
    inp.type = 'range'
    inp.style.width = '110px'
    inp.addEventListener('input', () => {
      vals[gs][i] = Number(inp.value)
      if (gs !== 'tree' && !(gs === 'flow' && i !== 3) && i !== 2 || (gs === 'spiro' && i === 2)) {
        if (!(gs === 'spiro' && i === 2)) restart()
      }
    })
    inp.addEventListener('change', () => sh.strokes())
    sliders.push(inp)
  }
  reseed(seed, false)
  setStyle(gs)

  bag.on(cv, 'pointerdown', (e) => {
    try { cv.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    const r = cv.getBoundingClientRect()
    pointer = { x: ((e.clientX - r.left) / r.width) * CW, y: ((e.clientY - r.top) / r.height) * CH, down: true }
  })
  bag.on(cv, 'pointermove', (e) => {
    const r = cv.getBoundingClientRect()
    pointer = { x: ((e.clientX - r.left) / r.width) * CW, y: ((e.clientY - r.top) / r.height) * CH, down: pointer?.down ?? false }
  })
  const up = () => {
    if (pointer?.down) sh.strokes()
    if (pointer) pointer.down = false
  }
  bag.on(cv, 'pointerup', up)
  bag.on(cv, 'pointercancel', up)
  bag.on(cv, 'pointerleave', () => (pointer = null))

  const colorAt = (k: number) => {
    const n = palette.length
    const f = ((k % n) + n) % n
    const i = Math.floor(f)
    return mix(palette[i], palette[(i + 1) % n], f - i)
  }

  const stepSpiro = () => {
    const [r, d, spd, copies] = vals.spiro
    const R = 200
    const period = spiroPeriod(R, r)
    for (let s = 0; s < 8; s++) {
      if (spT > period) {
        spLayer++
        spT = 0
        spPrev = null
        if (spLayer >= 4) return
        vals.spiro[1] = clamp(vals.spiro[1] + 22, 20, 180)
        syncSliders()
      }
      const inc = 0.012 * spd
      const [x, y] = spiro(R, r, vals.spiro[1], spT)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineWidth = 1.6
      ctx.lineCap = 'round'
      ctx.shadowBlur = 6
      const c = colorAt(spT * 0.25 / Math.PI + spLayer)
      ctx.strokeStyle = c
      ctx.shadowColor = c
      const sc = 1.1
      if (spPrev) {
        for (let k = 0; k < copies; k++) {
          ctx.save()
          ctx.translate(CW / 2, CH / 2)
          ctx.rotate((k * Math.PI * 2) / copies)
          ctx.beginPath()
          ctx.moveTo(spPrev[0] * sc, spPrev[1] * sc)
          ctx.lineTo(x * sc, y * sc)
          ctx.stroke()
          ctx.restore()
        }
      }
      ctx.shadowBlur = 0
      spPrev = [x, y]
      spT += inc
      void d
    }
  }
  const stepFlow = (dt: number) => {
    const [scale, swirl, fade] = vals.flow
    const n = px.length
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = mix(t.bg, t.bg, 0).replace('rgb', 'rgba').replace(')', `,${0.02 + fade * 0.004})`)
    ctx.fillRect(0, 0, CW, CH)
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineWidth = 1.3
    const sc = scale * 0.0012
    const z = time * 0.05
    for (let c = 0; c < 4; c++) {
      ctx.strokeStyle = colorAt(c)
      ctx.globalAlpha = 0.55
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        if (pc[i] !== c) continue
        const a = noise(px[i] * sc + z, py[i] * sc) * Math.PI * 2 * (swirl / 3)
        let vx = Math.cos(a) * 90 * dt * 1.5
        let vy = Math.sin(a) * 90 * dt * 1.5
        if (pointer) {
          const dx = px[i] - pointer.x
          const dy = py[i] - pointer.y
          const dd = Math.hypot(dx, dy)
          if (dd < 130 && dd > 1) {
            const f = ((130 - dd) / 130) * (pointer.down ? -4 : 1.5) * 60 * dt
            vx += (dx / dd) * f
            vy += (dy / dd) * f
          }
        }
        ctx.moveTo(px[i], py[i])
        px[i] += vx
        py[i] += vy
        ctx.lineTo(px[i], py[i])
        if (px[i] < 0 || px[i] > CW || py[i] < 0 || py[i] > CH || Math.random() < 0.004) {
          px[i] = Math.random() * CW
          py[i] = Math.random() * CH
        }
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }
  const drawTree = () => {
    const [depth, ang, shrink, wind] = vals.tree
    ctx.globalCompositeOperation = 'source-over'
    const g = ctx.createLinearGradient(0, 0, 0, CH)
    g.addColorStop(0, t.bg)
    g.addColorStop(1, t.bg2)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, CW, CH)
    ctx.fillStyle = mix(t.bg2, '#000000', 0.3)
    ctx.beginPath()
    ctx.ellipse(CW / 2, CH + 20, 380, 70, 0, 0, 7)
    ctx.fill()
    const a0 = (ang * Math.PI) / 180
    const ratio = shrink / 100
    const rec = (x: number, y: number, len: number, a: number, d: number, id: number) => {
      const sway = Math.sin(time * 1.4 + d * 0.6 + id) * wind * 0.012 * (d + 1) * 0.4
      const ja = (((id * 2654435761 + seed) >>> 0) % 1000) / 1000 - 0.5
      const aa = a + sway + ja * 0.12
      const x2 = x + Math.sin(aa) * len
      const y2 = y - Math.cos(aa) * len
      const k = d / depth
      ctx.strokeStyle = k < 0.45 ? mix('#5b3a1e', palette[0], k / 0.45 * 0.5) : mix(palette[0], palette[1], (k - 0.45) / 0.55)
      ctx.lineWidth = Math.max(1, (depth - d) * 1.7)
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      if (d >= depth) {
        if (id % 3 === 0) {
          ctx.fillStyle = palette[2]
          ctx.shadowColor = palette[2]
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(x2, y2, 3.2, 0, 7)
          ctx.fill()
          ctx.shadowBlur = 0
        }
        return
      }
      rec(x2, y2, len * ratio, aa - a0, d + 1, id * 2)
      rec(x2, y2, len * ratio, aa + a0, d + 1, id * 2 + 1)
    }
    rec(CW / 2, CH - 10, 105, 0, 0, 1)
    emoji(ctx, t.hero, CW / 2 + 90, CH - 28, 44 + Math.sin(time * 2) * 2)
    emoji(ctx, t.items[0], CW / 2 - 100, CH - 26, 34)
  }

  return {
    update(dt) {
      if (paused) return
      time += dt
      if (gs === 'spiro') stepSpiro()
      else if (gs === 'flow') stepFlow(dt)
    },
    draw() {
      if (gs === 'tree') drawTree()
      ctx.globalCompositeOperation = 'source-over'
      if (time < 3) {
        ctx.globalAlpha = clamp(3 - time, 0, 1)
        text(ctx, env.name.toUpperCase(), CW / 2, 30, { size: 16, color: '#fff', shadow: t.accent })
        ctx.globalAlpha = 1
      }
    },
    destroy() {
      /* nothing */
    },
  }
}

// ======================================================================
// Pixel art
// ======================================================================
function pixelMode(sh: Shell): Handle {
  const { env, bag } = sh
  const t = env.theme
  const N = env.mods.has('tiny') ? 16 : 32
  const S = 640
  const box = sh.box(1)
  const cv = el('canvas', box, '', 'position:absolute;inset:0;width:100%;height:100%;touch-action:none;image-rendering:pixelated')
  cv.width = S
  cv.height = S
  const ctx = cv.getContext('2d')!
  const data = document.createElement('canvas')
  data.width = data.height = N
  const dctx = data.getContext('2d', { willReadFrequently: true })!
  const pix = new Uint8ClampedArray(N * N * 4)
  const colors = [...t.blocks, ...EXTRAS.slice(0, 5), '#000000'].map(hexRgb)
  const hexes = [...t.blocks, ...EXTRAS.slice(0, 5), '#000000']
  let ci = 0
  type PT = 'pencil' | 'erase' | 'fill' | 'pick'
  let tool: PT = 'pencil'
  let grid = true
  let mirror = false
  let down = false
  let lastC: { x: number; y: number } | null = null
  let started = false
  let time = 0
  const undo: Uint8ClampedArray[] = []
  const preview = el('canvas', sh.bar2, '', 'width:64px;height:64px;image-rendering:pixelated;border-radius:6px;background:rgba(255,255,255,.1)')
  preview.width = preview.height = N
  const pctx = preview.getContext('2d')!

  const snap = () => {
    undo.push(pix.slice())
    if (undo.length > 60) undo.shift()
  }
  const setPx = (x: number, y: number, c: number[] | null) => {
    for (const xx of mirror ? [x, N - 1 - x] : [x]) {
      if (xx < 0 || y < 0 || xx >= N || y >= N) continue
      const i = (y * N + xx) * 4
      if (c) {
        pix[i] = c[0]
        pix[i + 1] = c[1]
        pix[i + 2] = c[2]
        pix[i + 3] = 255
      } else pix[i + 3] = 0
    }
  }
  const cellAt = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect()
    return { x: Math.floor(((e.clientX - r.left) / r.width) * N), y: Math.floor(((e.clientY - r.top) / r.height) * N) }
  }
  const apply = (c: { x: number; y: number }) => {
    if (tool === 'pencil') setPx(c.x, c.y, colors[ci])
    else if (tool === 'erase') setPx(c.x, c.y, null)
  }
  const line = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const n = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y), 1)
    for (let i = 0; i <= n; i++) apply({ x: Math.round(lerp(a.x, b.x, i / n)), y: Math.round(lerp(a.y, b.y, i / n)) })
  }
  bag.on(cv, 'pointerdown', (e) => {
    e.preventDefault()
    try { cv.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    const c = cellAt(e)
    started = true
    snap()
    if (tool === 'fill') {
      for (const x of mirror ? [c.x, N - 1 - c.x] : [c.x]) floodFill(pix, N, N, x, c.y, [...colors[ci], 255] as [number, number, number, number], 0)
      env.sfx('power')
      sh.strokes()
      return
    }
    if (tool === 'pick') {
      if (c.x >= 0 && c.y >= 0 && c.x < N && c.y < N) {
        const i = (c.y * N + c.x) * 4
        if (pix[i + 3]) {
          let best = 0
          let bd = 1e9
          colors.forEach((k, j) => {
            const d = Math.abs(k[0] - pix[i]) + Math.abs(k[1] - pix[i + 1]) + Math.abs(k[2] - pix[i + 2])
            if (d < bd) {
              bd = d
              best = j
            }
          })
          pickColor(best)
          tool = 'pencil'
          syncTools()
        }
      }
      return
    }
    down = true
    lastC = c
    apply(c)
    env.sfx('click')
  })
  bag.on(cv, 'pointermove', (e) => {
    if (!down || !lastC) return
    const c = cellAt(e)
    line(lastC, c)
    lastC = c
  })
  const up = () => {
    if (down) sh.strokes()
    down = false
    lastC = null
  }
  bag.on(cv, 'pointerup', up)
  bag.on(cv, 'pointercancel', up)

  const tbs = new Map<PT, HTMLButtonElement>()
  const syncTools = () => {
    for (const [k, b] of tbs) b.classList.toggle('on', k === tool)
  }
  for (const [k, ic, title] of [['pencil', '✏️', 'Pencil'], ['erase', '🧽', 'Eraser'], ['fill', '🪣', 'Fill'], ['pick', '💉', 'Pick colour']] as const) tbs.set(k, btn(sh.bar, ic, title, () => { tool = k; syncTools() }))
  sep(sh.bar)
  const mb = btn(sh.bar, '⇋', 'Mirror horizontally', () => {
    mirror = !mirror
    mb.classList.toggle('on', mirror)
  }, 'Mirror')
  const gb = btn(sh.bar, '▦', 'Grid', () => {
    grid = !grid
    gb.classList.toggle('on', grid)
  }, 'Grid')
  gb.classList.add('on')
  btn(sh.bar, t.hero, 'Stamp the hero as a starting sprite', () => {
    snap()
    dctx.clearRect(0, 0, N, N)
    dctx.font = `${Math.floor(N * 0.86)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`
    dctx.textAlign = 'center'
    dctx.textBaseline = 'middle'
    dctx.fillText(t.hero, N / 2, N / 2 + N * 0.05)
    const im = dctx.getImageData(0, 0, N, N).data
    for (let i = 0; i < N * N; i++) {
      const a = im[i * 4 + 3] > 120
      pix[i * 4] = im[i * 4]
      pix[i * 4 + 1] = im[i * 4 + 1]
      pix[i * 4 + 2] = im[i * 4 + 2]
      pix[i * 4 + 3] = a ? 255 : 0
    }
    sh.strokes()
    env.sfx('power')
  }, 'Hero')
  sep(sh.bar)
  btn(sh.bar, '↶', 'Undo', () => {
    const s = undo.pop()
    if (s) {
      pix.set(s)
      env.sfx('move')
    }
  }, 'Undo')
  btn(sh.bar, '🗑️', 'Clear', () => {
    snap()
    pix.fill(0)
    env.sfx('hit')
  })
  btn(sh.bar, '💾', 'Save PNG', () => {
    const out = document.createElement('canvas')
    out.width = out.height = N * 16
    const c = out.getContext('2d')!
    c.imageSmoothingEnabled = false
    c.drawImage(data, 0, 0, N * 16, N * 16)
    download(out, 'my-pixel-art')
    env.sfx('power')
  }, 'Save')
  const sws: HTMLButtonElement[] = []
  const pickColor = (i: number) => {
    ci = i
    sws.forEach((s, j) => s.classList.toggle('on', j === i))
  }
  hexes.forEach((c, i) => {
    const b = el('button', sh.bar2, 'pnt-sw')
    b.type = 'button'
    b.style.background = c
    b.addEventListener('click', () => pickColor(i))
    sws.push(b)
  })
  pickColor(0)
  syncTools()

  const checkA = mix(t.bg, '#ffffff', 0.1)
  const checkB = mix(t.bg2, '#ffffff', 0.04)
  const cs = S / N
  return {
    update(dt) {
      time += dt
    },
    draw() {
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          ctx.fillStyle = (x + y) % 2 ? checkA : checkB
          ctx.fillRect(x * cs, y * cs, cs, cs)
        }
      dctx.putImageData(new ImageData(pix, N, N), 0, 0)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(data, 0, 0, S, S)
      pctx.clearRect(0, 0, N, N)
      pctx.drawImage(data, 0, 0)
      if (grid) {
        ctx.strokeStyle = 'rgba(255,255,255,.1)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let i = 0; i <= N; i++) {
          ctx.moveTo(i * cs, 0)
          ctx.lineTo(i * cs, S)
          ctx.moveTo(0, i * cs)
          ctx.lineTo(S, i * cs)
        }
        ctx.stroke()
      }
      if (mirror) {
        ctx.strokeStyle = t.accent
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.moveTo(S / 2, 0)
        ctx.lineTo(S / 2, S)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      if (!started) {
        const k = 1 + Math.sin(time * 3) * 0.05
        emoji(ctx, t.hero, S / 2, S / 2 - 20, 130 * k)
        text(ctx, `${N}x${N} PIXEL ART`, S / 2, S / 2 + 70, { size: 22, color: '#fff', shadow: t.accent })
        text(ctx, 'CLICK TO PAINT', S / 2, S / 2 + 110, { size: 14, color: t.accent })
      }
    },
    destroy() {
      /* nothing */
    },
  }
}
