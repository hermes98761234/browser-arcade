// Interactive story: a visual-novel style reader for the hand-written stories in src/stories/<catalog id>.ts.
import { Bag, createDom, loop, type Engine, type GameEnv } from '../kit'
import { audio, isMuted } from '../sound'
import { GAMES } from '../../lib/data'
import type { Choice, Story } from '../../stories/types'
import {
  applyChoice, choiceView, emptyDelta, endingIds, enterNode, initialState, parseInline, statBounds, type Delta, type StoryState,
} from '../logic/story'
import { SceneView, type Mood } from '../logic/story-scene'

const files = import.meta.glob<{ default: Story }>('../../stories/[0-9]*.ts')

async function loadStory(env: GameEnv): Promise<Story | null> {
  const id = GAMES.find((g) => g.name === env.name)?.id
  const byId = id !== undefined ? files[`../../stories/${id}.ts`] : undefined
  if (byId) {
    const s = (await byId()).default
    if (s.title === env.name) return s
  }
  for (const f of Object.values(files)) {
    const s = (await f()).default
    if (s.title === env.name) return s
  }
  return null
}

interface Save {
  endings: string[]
  run: StoryState | null
}

const CSS = `
.sty{position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;font-family:Georgia,'Iowan Old Style','Palatino Linotype',Palatino,'Book Antiqua',serif;color:var(--g-fg);--paper:rgba(0,0,0,.34);--edge:rgba(255,255,255,.14)}
.sty.light{--paper:rgba(255,255,255,.55);--edge:rgba(0,0,0,.16)}
.sty *{box-sizing:border-box}
.sty-side{flex:0 0 auto;display:flex;flex-direction:column;position:relative}
.sty-scene{position:relative;height:clamp(84px,16vh,200px);overflow:hidden;border-bottom:1px solid var(--edge)}
.sty-scene canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.sty-bar{display:flex;gap:6px 12px;flex-wrap:wrap;align-items:center;padding:6px 10px;background:var(--paper);border-bottom:1px solid var(--edge);font-family:system-ui,sans-serif;font-size:12px}
.sty-stat{display:flex;align-items:center;gap:5px;position:relative;min-width:0}
.sty-stat i{font-style:normal;font-size:15px}
.sty-stat em{font-style:normal;opacity:.75;font-size:11px;letter-spacing:.04em;display:none}
.sty-meter{width:46px;height:7px;border-radius:5px;background:rgba(127,127,127,.3);overflow:hidden}
.sty-meter b{display:block;height:100%;border-radius:5px;background:var(--g-good);transition:width .6s ease,background .6s}
.sty-meter b.low{background:var(--g-danger)}
.sty-stat u{text-decoration:none;font-weight:700;font-variant-numeric:tabular-nums;min-width:1.2em}
.sty-d{position:absolute;left:8px;top:-4px;font-weight:800;font-size:13px;pointer-events:none;animation:sty-up 1.3s ease-out forwards}
.sty-d.up{color:var(--g-good)}.sty-d.dn{color:var(--g-danger)}
@keyframes sty-up{0%{opacity:0;transform:translateY(6px)}15%{opacity:1}100%{opacity:0;transform:translateY(-18px)}}
.sty-invb{margin-left:auto;background:transparent;color:inherit;border:1px solid var(--edge);border-radius:14px;padding:3px 9px;font:inherit;cursor:pointer}
.sty-inv{display:none;gap:6px;flex-wrap:wrap;padding:7px 10px;background:var(--paper);border-bottom:1px solid var(--edge);font-family:system-ui,sans-serif;font-size:12px}
.sty-inv.open{display:flex}
.sty-inv span{border:1px solid var(--edge);border-radius:12px;padding:2px 9px;background:rgba(127,127,127,.15);animation:sty-pop .5s ease}
.sty-inv .none{opacity:.55;border:0;background:none;padding:0}
@keyframes sty-pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
.sty-main{flex:1 1 auto;overflow-y:auto;overflow-x:hidden;position:relative;scroll-behavior:smooth;-webkit-overflow-scrolling:touch}
.sty-page{max-width:680px;margin:0 auto;padding:14px 18px 28px;animation:sty-in .55s ease both}
@keyframes sty-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.sty-cap{font-family:system-ui,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--g-accent);margin:0 0 8px;font-weight:700}
.sty-text{font-size:clamp(16px,2.3vw,19px);line-height:1.62;cursor:pointer}
.sty-text p{margin:0 0 .85em;text-wrap:pretty}
.sty-text p:first-child::first-letter{float:left;font-size:2.7em;line-height:.85;padding:.06em .09em 0 0;color:var(--g-accent);font-weight:700}
.sty-text em{font-style:italic;color:var(--g-accent2)}
.sty-text strong{color:var(--g-accent)}
.sty-skip{font-family:system-ui,sans-serif;font-size:11px;opacity:.5;text-align:right;margin-top:-4px}
.sty-choices{display:flex;flex-direction:column;gap:9px;margin-top:10px}
.sty-ch{min-height:46px;display:flex;gap:11px;align-items:flex-start;text-align:left;width:100%;padding:11px 14px;border-radius:10px;border:1px solid var(--edge);background:var(--paper);color:inherit;font:inherit;font-size:clamp(15px,2.1vw,17px);line-height:1.4;cursor:pointer;opacity:0;animation:sty-in .45s ease forwards;transition:border-color .15s,transform .15s,background .15s}
.sty-ch:hover:not(.lock),.sty-ch:focus-visible{border-color:var(--g-accent);transform:translateX(3px);background:rgba(127,127,127,.2);outline:none}
.sty-ch kbd{flex:0 0 auto;font:700 12px system-ui,sans-serif;width:22px;height:22px;border-radius:6px;border:1px solid var(--g-accent);color:var(--g-accent);display:grid;place-items:center;margin-top:1px}
.sty-ch.lock{opacity:.5!important;cursor:not-allowed;filter:grayscale(.7)}
.sty-ch.lock kbd{border-color:var(--edge);color:inherit}
.sty-ch small{display:block;font-family:system-ui,sans-serif;font-size:12px;opacity:.85;margin-top:3px;color:var(--g-accent2)}
.sty-end{text-align:center;margin-top:14px;padding:18px 14px;border:1px solid var(--g-accent);border-radius:14px;background:var(--paper);animation:sty-in .8s ease both}
.sty-end h2{margin:6px 0 4px;font-size:clamp(22px,4vw,30px);letter-spacing:.02em}
.sty-badge{display:inline-block;font:700 11px system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;padding:3px 12px;border-radius:12px;border:1px solid currentColor}
.sty-end p{margin:8px 0;font-family:system-ui,sans-serif;font-size:13px;opacity:.9}
.sty-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px}
.sty-btn{font:700 15px system-ui,sans-serif;padding:11px 22px;border-radius:24px;border:1px solid var(--g-accent);background:transparent;color:var(--g-accent);cursor:pointer;transition:background .15s,color .15s,transform .15s}
.sty-btn.main{background:var(--g-accent);color:var(--g-bg)}
.sty-btn:hover{transform:translateY(-2px)}
.sty-title{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:14px;background:linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.65))}
.sty.light .sty-title{background:linear-gradient(rgba(255,255,255,.2),rgba(255,255,255,.7))}
.sty-card{max-width:520px;max-height:100%;overflow:auto;text-align:center;padding:22px 24px;border-radius:16px;background:var(--paper);border:1px solid var(--edge);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:sty-in .9s ease both}
.sty-card h1{margin:4px 0 8px;font-size:clamp(24px,5vw,36px);line-height:1.15;color:var(--g-accent);letter-spacing:.01em}
.sty-card .sty-orn{letter-spacing:.5em;opacity:.7;font-size:14px}
.sty-card .sty-hero{font-size:44px;line-height:1.1;filter:drop-shadow(0 4px 10px rgba(0,0,0,.5))}
.sty-card p{margin:10px 0;font-size:clamp(14px,2.2vw,17px);line-height:1.55;font-style:italic}
.sty-card .sty-found{font:600 12px system-ui,sans-serif;letter-spacing:.08em;opacity:.8;margin:10px 0 2px}
.sty.wide{flex-direction:row}
.sty.wide .sty-side{flex:0 0 38%;max-width:420px;border-right:1px solid var(--edge);overflow:auto}
.sty.wide .sty-scene{height:clamp(150px,44vh,300px)}
.sty.wide .sty-bar{flex-direction:column;align-items:stretch;gap:7px;padding:10px 14px}
.sty.wide .sty-meter{flex:1;width:auto;height:8px}
.sty.wide .sty-stat em{display:inline;min-width:70px}
.sty.wide .sty-invb{display:none}
.sty.wide .sty-inv{display:flex}
.sty.wide .sty-page{padding:20px 26px 32px}
.sty-bar:empty{display:none}
.sty.titling .sty-side{position:absolute;inset:0;max-width:none;border:0;flex:none}
.sty.titling .sty-scene{height:100%;border:0}
.sty.titling .sty-bar,.sty.titling .sty-inv{display:none}
@media (max-width:480px){.sty-meter{width:34px}.sty-page{padding:12px 14px 24px}}
@media (prefers-reduced-motion:reduce){.sty *{animation-duration:.01s!important}}
`

const lum = (hex: string) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return 0
  const n = parseInt(m[1], 16)
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
}

const KIND: Record<string, [string, string]> = {
  good: ['A good ending', '#7be08f'],
  bad: ['A dark ending', '#ff6b6b'],
  neutral: ['A quiet ending', '#9fb4d8'],
  secret: ['A secret ending', '#ffd36b'],
}

const MOOD_NOTES: Record<Mood, number[]> = {
  calm: [1, 1.5, 2.002],
  eerie: [1, 1.189, 1.414],
  warm: [1, 1.26, 1.5],
  cold: [1, 1.5, 2.25],
}

/** Soft ambient pad: three detuned oscillators through a slow low-pass. Follows the platform mute flag. */
function makeDrone() {
  const a = audio()
  if (!a) return null
  const master = a.createGain()
  master.gain.value = 0
  const lp = a.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 520
  lp.Q.value = 0.7
  lp.connect(master).connect(a.destination)
  const lfo = a.createOscillator()
  const lfoG = a.createGain()
  lfo.frequency.value = 0.09
  lfoG.gain.value = 180
  lfo.connect(lfoG).connect(lp.frequency)
  lfo.start()
  const root = 55
  const oscs = [0, 1, 2].map((i) => {
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = i === 2 ? 'triangle' : 'sine'
    o.frequency.value = root * MOOD_NOTES.calm[i]
    o.detune.value = (i - 1) * 6
    g.gain.value = i === 0 ? 1 : 0.55
    o.connect(g).connect(lp)
    o.start()
    return o
  })
  let level = 0
  return {
    mood(m: Mood) {
      oscs.forEach((o, i) => o.frequency.setTargetAtTime(root * MOOD_NOTES[m][i] * (m === 'cold' && i === 2 ? 0.5 : 1), a.currentTime, 1.6))
    },
    level(v: number) {
      if (v === level) return
      level = v
      master.gain.setTargetAtTime(v, a.currentTime, 0.8)
    },
    stop() {
      try {
        master.gain.cancelScheduledValues(a.currentTime)
        master.gain.setValueAtTime(0, a.currentTime)
        oscs.forEach((o) => o.stop())
        lfo.stop()
        master.disconnect()
      } catch { /* already stopped */ }
    },
  }
}

const engine: Engine = {
  start(env) {
    const bag = new Bag()
    const root = createDom(env.host, env.theme, 'sty-root')
    const style = document.createElement('style')
    style.textContent = CSS
    root.appendChild(style)
    bag.add(() => style.remove())
    const ui = document.createElement('div')
    ui.className = 'sty' + (lum(env.theme.bg) > 0.55 ? ' light' : '')
    root.appendChild(ui)
    ui.innerHTML = '<div class="sty-side"><div class="sty-scene"><canvas></canvas></div><div class="sty-bar"></div><div class="sty-inv"></div></div><div class="sty-main"></div>'
    const sceneBox = ui.querySelector<HTMLElement>('.sty-scene')!
    const canvas = ui.querySelector('canvas')!
    const bar = ui.querySelector<HTMLElement>('.sty-bar')!
    const invEl = ui.querySelector<HTMLElement>('.sty-inv')!
    const main = ui.querySelector<HTMLElement>('.sty-main')!

    let story: Story | null = null
    let sid = 0
    let state: StoryState
    let save: Save = { endings: [], run: null }
    let view: SceneView | null = null
    let sceneStr = '✨'
    let drone: ReturnType<typeof makeDrone> = null
    let paused = false
    let destroyed = false
    let started = false
    let over = false
    let titleEl: HTMLElement | null = null

    // typewriter state
    interface Seg { vis: Text; hid: HTMLElement; full: string; at: number }
    let segs: Seg[] = []
    let times = new Float32Array(0)
    let total = 0
    let shown = 0
    let elapsed = 0
    let typing = false
    let onTyped: (() => void) | null = null
    let curChoices: { ch: Choice; ok: boolean }[] = []
    let choiceBtns: HTMLButtonElement[] = []
    let skipEl: HTMLElement | null = null

    const storeKey = () => `arcade:story:${sid}`
    const persist = () => {
      try { localStorage.setItem(storeKey(), JSON.stringify(save)) } catch { /* ignore */ }
    }

    const resize = () => {
      const r = env.host.getBoundingClientRect()
      ui.classList.toggle('wide', r.width >= 760 && r.width / Math.max(1, r.height) > 1.15)
      const b = sceneBox.getBoundingClientRect()
      view?.resize(b.width, b.height)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(env.host)
    bag.add(() => ro.disconnect())

    const lp = loop(
      (dt) => view?.update(dt),
      () => view?.draw(),
    )
    bag.add(() => lp.stop())

    bag.on(sceneBox, 'pointermove', (e) => {
      const b = sceneBox.getBoundingClientRect()
      view?.look2(((e.clientX - b.left) / b.width) * 2 - 1, ((e.clientY - b.top) / b.height) * 2 - 1)
    })

    // ----- sound
    bag.interval(() => {
      drone?.level(paused || isMuted() ? 0 : 0.055)
    }, 350)

    // ----- helpers
    const el = (tag: string, cls = '', txt = ''): HTMLElement => {
      const e = document.createElement(tag)
      if (cls) e.className = cls
      if (txt) e.textContent = txt
      return e
    }

    const itemName = (id: string) => story?.items?.[id] ?? id

    // ----- stats & inventory UI
    const statEls = new Map<string, { fill: HTMLElement; val: HTMLElement; box: HTMLElement }>()
    function buildStats() {
      bar.innerHTML = ''
      statEls.clear()
      for (const [k, d] of Object.entries(story!.stats)) {
        const box = el('div', 'sty-stat')
        box.title = d.label
        const ic = el('i', '', d.emoji)
        const lb = el('em', '', d.label)
        const m = el('div', 'sty-meter')
        const fill = el('b')
        m.appendChild(fill)
        const val = el('u')
        box.append(ic, lb, m, val)
        bar.appendChild(box)
        statEls.set(k, { fill, val, box })
      }
      const ib = el('button', 'sty-invb', '🎒 0') as HTMLButtonElement
      ib.type = 'button'
      ib.setAttribute('aria-label', 'Inventory')
      ib.onclick = () => invEl.classList.toggle('open')
      bar.appendChild(ib)
    }
    function renderStats(delta?: Delta) {
      for (const [k, e] of statEls) {
        const [lo, hi] = statBounds(story!, k)
        const v = state.stats[k]
        e.fill.style.width = `${((v - lo) / Math.max(1, hi - lo)) * 100}%`
        e.fill.classList.toggle('low', (v - lo) / Math.max(1, hi - lo) <= 0.25)
        e.val.textContent = String(v)
        const d = delta?.stats[k]
        if (d) {
          const f = el('span', `sty-d ${d > 0 ? 'up' : 'dn'}`, d > 0 ? `+${d}` : `${d}`)
          e.box.appendChild(f)
          setTimeout(() => f.remove(), 1400)
        }
      }
    }
    function renderInv(delta?: Delta) {
      const items = state.inv.filter((i) => !i.startsWith('_'))
      invEl.innerHTML = ''
      if (!items.length) invEl.appendChild(el('span', 'none', 'Nothing carried yet.'))
      for (const i of items) {
        const s = el('span', '', itemName(i))
        if (delta?.gained.includes(i)) s.style.animationDuration = '.7s'
        else s.style.animation = 'none'
        invEl.appendChild(s)
      }
      const b = bar.querySelector('.sty-invb')
      if (b) b.textContent = `🎒 ${items.length}`
      if (delta && delta.gained.some((g) => !g.startsWith('_'))) {
        env.sfx('power')
        if (ui.classList.contains('wide')) {
          invEl.classList.add('open')
          bag.timeout(() => invEl.classList.remove('open'), 2600)
        }
      }
    }

    // ----- typewriter
    function stopTyping(finish = true) {
      if (!typing) return
      typing = false
      if (finish) {
        for (const s of segs) {
          s.vis.data = s.full
          s.hid.textContent = ''
        }
        shown = total
      }
      skipEl?.remove()
      skipEl = null
      const f = onTyped
      onTyped = null
      f?.()
    }

    function buildText(box: HTMLElement, text: string) {
      segs = []
      let n = 0
      const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
      for (const para of paras) {
        const p = el('p')
        for (const part of parseInline(para.replace(/\n/g, ' '))) {
          const e = el(part.k === 'i' ? 'em' : part.k === 'b' ? 'strong' : 'span')
          const vis = document.createTextNode('')
          const hid = el('span')
          hid.style.visibility = 'hidden'
          hid.textContent = part.t
          e.append(vis, hid)
          p.appendChild(e)
          segs.push({ vis, hid, full: part.t, at: n })
          n += part.t.length
        }
        box.appendChild(p)
      }
      total = n
      // per-character reveal times (seconds): punctuation pauses, capped total so long scenes stay snappy
      const all = segs.map((s) => s.full).join('')
      times = new Float32Array(total)
      let tm = 0
      const per = 1 / 95
      for (let i = 0; i < total; i++) {
        const c = all[i]
        times[i] = tm
        tm += per * (c === '.' || c === '!' || c === '?' ? 7 : c === ',' || c === ';' || c === ':' || c === '—' ? 3.5 : 1)
      }
      const cap = 13
      if (tm > cap) for (let i = 0; i < total; i++) times[i] *= cap / tm
    }

    function tick(dt: number) {
      if (!typing) return
      elapsed += dt
      let c = shown
      while (c < total && times[c] <= elapsed) c++
      if (c === shown) return
      shown = c
      for (const s of segs) {
        if (s.at >= shown) break
        const k = Math.min(s.full.length, shown - s.at)
        if (s.vis.data.length !== k) {
          s.vis.data = s.full.slice(0, k)
          s.hid.textContent = s.full.slice(k)
        }
      }
      if (shown >= total) stopTyping(true)
      else main.scrollTop = main.scrollHeight
    }
    const lp2 = loop(tick, () => {})
    bag.add(() => lp2.stop())

    // ----- rendering a node
    function showNode(delta?: Delta) {
      const n = story!.nodes[state.node]
      if (!n) {
        finishBroken()
        return
      }
      if (n.scene) sceneStr = n.scene
      if (view && n.scene) {
        view.setScene(sceneStr)
        drone?.mood(view.mood)
      }
      renderStats(delta)
      renderInv(delta)
      if (delta) {
        const lost = Object.entries(delta.stats).some(([, v]) => v < 0)
        const gain = Object.entries(delta.stats).some(([, v]) => v > 0)
        if (lost) {
          view?.pulse('#c0152a', 0.4)
          env.sfx('hit')
        } else if (gain) view?.pulse('#ffd36b', 0.22)
      }
      main.innerHTML = ''
      main.scrollTop = 0
      const page = el('div', 'sty-page')
      if (n.caption) page.appendChild(el('div', 'sty-cap', n.caption))
      const tbox = el('div', 'sty-text')
      page.appendChild(tbox)
      main.appendChild(page)
      buildText(tbox, n.text)
      elapsed = 0
      shown = 0
      typing = total > 0
      choiceBtns = []
      skipEl = null
      if (typing) {
        skipEl = el('div', 'sty-skip', 'click to skip')
        page.appendChild(skipEl)
      }
      tbox.onclick = () => stopTyping()
      onTyped = () => revealEnd(page, n)
      if (!typing) revealEnd(page, n)
      state.steps = state.visited.length
      env.status(`Page ${state.visited.length} · Endings ${save.endings.length}/${endingIds(story!).length}`)
    }

    function revealEnd(page: HTMLElement, n: Story['nodes'][string]) {
      if (destroyed) return
      if (n.ending) {
        showEnding(page, n)
        return
      }
      const box = el('div', 'sty-choices')
      curChoices = []
      let key = 0
      let any = false
      for (const ch of n.choices ?? []) {
        const v = choiceView(state, ch)
        if (v === 'hidden') continue
        key++
        const ok = v === 'enabled'
        any ||= ok
        curChoices.push({ ch, ok })
        const b = el('button', `sty-ch${ok ? '' : ' lock'}`) as HTMLButtonElement
        b.type = 'button'
        b.style.animationDelay = `${(key - 1) * 90}ms`
        const k = el('kbd', '', ok ? String(key) : '🔒')
        const body = el('span')
        body.textContent = ch.text
        if (!ok && ch.lockedHint) body.appendChild(el('small', '', ch.lockedHint))
        b.append(k, body)
        if (ok) b.onclick = () => choose(curChoices.findIndex((c) => c.ch === ch))
        else b.setAttribute('aria-disabled', 'true')
        box.appendChild(b)
        choiceBtns.push(b)
      }
      if (!any) {
        const b = el('button', 'sty-ch') as HTMLButtonElement
        b.type = 'button'
        b.append(el('kbd', '', '↺'), el('span', '', 'The thread is lost. Begin again.'))
        b.onclick = () => beginNew()
        box.appendChild(b)
      }
      page.appendChild(box)
      bag.timeout(() => {
        main.scrollTop = main.scrollHeight
      }, 60)
      env.sfx('move')
    }

    function showEnding(page: HTMLElement, n: Story['nodes'][string]) {
      const e = n.ending!
      const id = state.node
      const total = endingIds(story!).length
      const isNew = !save.endings.includes(id)
      if (isNew) save.endings.push(id)
      save.run = null
      persist()
      const [label, color] = KIND[e.kind] ?? KIND.neutral
      const box = el('div', 'sty-end')
      box.style.borderColor = color
      box.innerHTML = '<div class="sty-orn">❦</div>'
      box.appendChild(el('h2', '', e.title))
      const badge = el('span', 'sty-badge', label)
      badge.style.color = color
      box.appendChild(badge)
      box.appendChild(el('p', '', `${isNew ? 'New ending discovered!  ' : ''}Endings found: ${save.endings.length}/${total}`))
      const btns = el('div', 'sty-btns')
      const fin = el('button', 'sty-btn main', 'Finish') as HTMLButtonElement
      fin.type = 'button'
      fin.onclick = () => {
        fin.disabled = true
        end()
      }
      const again = el('button', 'sty-btn', 'Try another path') as HTMLButtonElement
      again.type = 'button'
      again.onclick = () => showTitle()
      btns.append(fin, again)
      box.appendChild(btns)
      page.appendChild(box)
      env.score(e.score)
      env.status(`Ending ${save.endings.length}/${total} · ${e.title}`)
      env.sfx(e.kind === 'bad' ? 'lose' : 'win')
      view?.pulse(color, 0.25)
      bag.timeout(() => {
        main.scrollTop = main.scrollHeight
      }, 80)
      choiceBtns = [fin, again]
    }

    function end() {
      if (over) return
      over = true
      const e = story!.nodes[state.node]?.ending
      env.end({ score: e?.score ?? 0, won: e ? e.kind !== 'bad' : false, text: e ? `${e.title} · endings found ${save.endings.length}/${endingIds(story!).length}` : undefined })
    }

    function finishBroken() {
      main.innerHTML = '<div class="sty-page"><p>This page of the book has been torn out.</p></div>'
    }

    // ----- flow
    function choose(i: number) {
      if (typing || !story) return
      const c = curChoices[i]
      if (!c || !c.ok) return
      env.sfx('click')
      const d = emptyDelta()
      applyChoice(story, state, c.ch, d)
      enterNode(story, state, c.ch.to, d)
      const n = story.nodes[state.node]
      if (n && !n.ending) {
        save.run = JSON.parse(JSON.stringify(state)) as StoryState
        persist()
      }
      showNode(d)
    }

    function beginNew() {
      if (!story) return
      state = initialState(story)
      const d = emptyDelta()
      enterNode(story, state, story.start, d)
      save.run = JSON.parse(JSON.stringify(state)) as StoryState
      persist()
      hideTitle()
      over = false
      env.score(0)
      showNode(d)
    }

    function resume() {
      if (!story || !save.run) return
      state = save.run
      if (!story.nodes[state.node]) return beginNew()
      hideTitle()
      showNode()
    }

    function hideTitle() {
      titleEl?.remove()
      titleEl = null
      ui.classList.remove('titling')
      resize()
    }

    function showTitle() {
      if (!story) return
      titleEl?.remove()
      const total = endingIds(story).length
      const ov = el('div', 'sty-title')
      const card = el('div', 'sty-card')
      card.innerHTML = '<div class="sty-orn">❦ ❦ ❦</div>'
      card.appendChild(el('div', 'sty-hero', env.theme.hero))
      card.appendChild(el('h1', '', story.title))
      card.appendChild(el('p', '', story.blurb))
      card.appendChild(el('div', 'sty-found', `Endings found: ${save.endings.length}/${total}`))
      const btns = el('div', 'sty-btns')
      choiceBtns = []
      const mkBtn = (label: string, main_: boolean, fn: () => void) => {
        const b = el('button', `sty-btn${main_ ? ' main' : ''}`, label) as HTMLButtonElement
        b.type = 'button'
        b.onclick = () => {
          startDrone()
          env.sfx('click')
          fn()
        }
        btns.appendChild(b)
        choiceBtns.push(b)
      }
      const hasSave = !!save.run && !!story.nodes[save.run.node]
      if (hasSave) {
        mkBtn('Continue', true, resume)
        mkBtn('New game', false, beginNew)
      } else mkBtn('Begin', true, beginNew)
      card.appendChild(btns)
      ov.appendChild(card)
      ui.appendChild(ov)
      ui.classList.add('titling')
      resize()
      titleEl = ov
      onTyped = null
      typing = false
      main.innerHTML = ''
      // backdrop: the opening scene
      const first = story.nodes[hasSave ? save.run!.node : story.start]
      sceneStr = first?.scene ?? sceneStr
      view?.setScene(sceneStr, true)
      env.status(`Endings ${save.endings.length}/${total}`)
      choiceBtns[0]?.focus({ preventScroll: true })
    }

    function startDrone() {
      if (drone || destroyed) return
      drone = makeDrone()
      if (drone && view) drone.mood(view.mood)
      drone?.level(isMuted() ? 0 : 0.055)
    }

    // ----- keys
    bag.on(window, 'keydown', (e) => {
      if (!started || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.code === 'Space' || e.code === 'Enter') {
        if (typing) {
          e.preventDefault()
          stopTyping()
          return
        }
        if (titleEl || over) return
        return
      }
      const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code)
      if (m) {
        const idx = Number(m[1]) - 1
        if (titleEl) {
          choiceBtns[idx]?.click()
          return
        }
        if (typing) {
          stopTyping()
          return
        }
        if (curChoices.length && !over) {
          const state_ = story?.nodes[state.node]
          if (state_?.ending) choiceBtns[idx]?.click()
          else choose(idx)
        } else choiceBtns[idx]?.click()
      }
    })

    // ----- boot
    void (async () => {
      const loading = el('div', 'sty-page', 'Opening the book…')
      main.appendChild(loading)
      const s = await loadStory(env)
      if (destroyed) return
      if (!s) {
        loading.textContent = 'This story could not be found.'
        return
      }
      story = s
      sid = s.id
      try {
        const raw = localStorage.getItem(storeKey())
        if (raw) {
          const p = JSON.parse(raw) as Partial<Save>
          save = { endings: Array.isArray(p.endings) ? p.endings.filter((x) => s.nodes[x]?.ending) : [], run: p.run && s.nodes[p.run.node] ? p.run : null }
        }
      } catch { /* corrupt save */ }
      state = initialState(s)
      buildStats()
      renderStats()
      renderInv()
      const b = sceneBox.getBoundingClientRect()
      view = new SceneView(canvas, env.theme, s.nodes[s.start]?.scene ?? '✨')
      view.resize(b.width, b.height)
      resize()
      started = true
      showTitle()
    })()

    return {
      destroy() {
        destroyed = true
        bag.dispose()
        drone?.stop()
        root.remove()
      },
      pause(p) {
        paused = p
        lp.pause(p)
        lp2.pause(p)
        drone?.level(p || isMuted() ? 0 : 0.055)
      },
    }
  },
}

export default engine
