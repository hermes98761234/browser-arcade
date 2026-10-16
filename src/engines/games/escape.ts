// Escape room: three procedurally assembled point-and-click rooms against a timer. Rules live in logic/escape.ts.
import { Bag, byDiff, createDom, type Engine } from '../kit'
import {
  COLORS, COLOR_NAMES, caesar, genRoom, genSlider, isSolved, newState, nextHint, pickFlavor, readItem, slide, solveSlider, tap, tryLock,
  type Action, type Clue, type Modal, type Room, type RoomState, type SourceKind,
} from '../logic/escape'

const CSS = `
.esc{position:absolute;inset:0;display:flex;flex-direction:column;color:var(--g-fg);font-family:system-ui,sans-serif;user-select:none;-webkit-user-select:none;overflow:hidden}
.esc *{box-sizing:border-box}
.esc-top{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(0,0,0,.35);border-bottom:1px solid rgba(255,255,255,.12);min-height:46px}
.esc-top .ttl{flex:1;min-width:0;font-weight:700;font-size:clamp(12px,3.4vw,15px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.esc-top .ttl small{display:block;font-weight:500;opacity:.7;font-size:11px}
.esc-time{font:700 clamp(15px,4.4vw,19px) ui-monospace,monospace;padding:3px 10px;border-radius:14px;background:rgba(0,0,0,.4)}
.esc-time.low{color:#ff6b6b;animation:esc-blink 1s steps(2) infinite}
@keyframes esc-blink{50%{opacity:.45}}
.esc-btn{font:700 13px system-ui,sans-serif;min-height:40px;min-width:40px;padding:6px 12px;border-radius:20px;border:1px solid var(--g-accent);background:rgba(0,0,0,.3);color:var(--g-accent);cursor:pointer}
.esc-btn:active{transform:scale(.96)}
.esc-btn.main{background:var(--g-accent);color:var(--g-bg)}
.esc-btn:disabled{opacity:.4}
.esc-room{position:relative;flex:1 1 auto;min-height:0;overflow:hidden;--u:40px;background:linear-gradient(180deg,color-mix(in srgb,var(--g-bg2) 80%,#fff 14%),var(--g-bg2) 64%)}
.esc-floor{position:absolute;left:0;right:0;top:64%;bottom:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,.16) 0 2px,transparent 2px 64px),linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.6));border-top:3px solid rgba(255,255,255,.16)}
.esc-wallband{position:absolute;left:0;right:0;top:56%;height:8%;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(0,0,0,.18))}
.esc-light{position:absolute;left:50%;top:-10%;width:90%;height:70%;transform:translateX(-50%);background:radial-gradient(ellipse at 50% 0,rgba(255,240,200,.22),transparent 70%);pointer-events:none}
.esc-hs{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:1px;background:none;border:0;padding:4px;cursor:pointer;color:inherit;font:inherit;border-radius:12px;-webkit-tap-highlight-color:transparent;min-width:44px;min-height:44px;justify-content:center}
.esc-hs .e{font-size:calc(var(--u)*var(--s)*.95);line-height:1;filter:drop-shadow(0 3px 4px rgba(0,0,0,.55));transition:transform .15s}
.esc-hs .n{font-size:clamp(9px,calc(var(--u)*.26),12px);font-weight:600;opacity:.8;text-shadow:0 1px 3px #000;white-space:nowrap}
.esc-hs:hover .e,.esc-hs:focus-visible .e{transform:scale(1.1)}
.esc-hs:focus-visible{outline:2px solid var(--g-accent)}
.esc-hs.done{opacity:.6}
.esc-hs .ok{position:absolute;top:-2px;right:-2px;font-size:calc(var(--u)*.4)}
.esc-room.armed .esc-hs:not(.done)::after{content:'';position:absolute;inset:0;border-radius:14px;border:2px dashed var(--g-accent);animation:esc-pulse 1.1s ease-in-out infinite}
@keyframes esc-pulse{50%{opacity:.25}}
.esc-hero{position:absolute;left:3%;bottom:2%;font-size:calc(var(--u)*1.1);animation:esc-bob 2.4s ease-in-out infinite;pointer-events:none;filter:drop-shadow(0 4px 6px rgba(0,0,0,.6))}
@keyframes esc-bob{50%{transform:translateY(-5px)}}
.esc-toast{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);max-width:min(92%,520px);background:rgba(0,0,0,.82);border:1px solid rgba(255,255,255,.2);padding:9px 14px;border-radius:12px;font-size:clamp(13px,3.6vw,15px);line-height:1.35;text-align:center;opacity:0;transition:opacity .25s;pointer-events:none;z-index:4}
.esc-toast.on{opacity:1}
.esc-toast.hint{border-color:var(--g-accent);color:var(--g-accent)}
.esc-water{position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(180deg,rgba(40,140,220,.55),rgba(10,60,120,.8));pointer-events:none;transition:height .5s linear;z-index:2}
.esc-dark::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--lx,50%) var(--ly,50%),transparent 0,rgba(0,0,0,.35) 90px,rgba(0,0,0,.86) 230px);pointer-events:none;z-index:3}
.esc-bag{flex:0 0 auto;display:flex;flex-direction:column;gap:4px;padding:6px 8px 8px;background:rgba(0,0,0,.45);border-top:1px solid rgba(255,255,255,.14);min-height:78px}
.esc-sel{font-size:12px;opacity:.85;min-height:16px;text-align:center}
.esc-slots{display:flex;gap:6px;overflow-x:auto;justify-content:center;flex-wrap:wrap}
.esc-slot{width:54px;height:54px;border-radius:12px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);font-size:28px;display:grid;place-items:center;cursor:pointer;flex:0 0 auto;animation:esc-pop .4s ease}
.esc-slot.sel{border-color:var(--g-accent);background:rgba(255,255,255,.2);box-shadow:0 0 12px var(--g-accent)}
@keyframes esc-pop{0%{transform:scale(.4)}70%{transform:scale(1.15)}}
.esc-empty{opacity:.5;font-size:12px;align-self:center}
.esc-modal{position:absolute;inset:0;z-index:10;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:10px}
.esc-box{width:min(100%,470px);max-height:100%;overflow:auto;background:linear-gradient(var(--g-bg2),var(--g-bg));border:2px solid var(--g-accent);border-radius:16px;padding:14px;text-align:center;position:relative;animation:esc-pop .3s ease}
.esc-box h3{margin:0 0 8px;font-size:clamp(15px,4.2vw,18px);color:var(--g-accent)}
.esc-box p{margin:6px 0;font-size:clamp(13px,3.6vw,15px);line-height:1.4}
.esc-x{position:absolute;top:6px;right:8px;width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.12);color:inherit;font-size:20px;cursor:pointer}
.esc-cnt{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:4px;margin:8px 0}
.esc-cnt button{font-size:30px;height:48px;background:rgba(255,255,255,.06);border:2px solid transparent;border-radius:10px;cursor:pointer;color:inherit}
.esc-cnt button.mark{border-color:var(--g-accent);background:rgba(255,255,255,.2)}
.esc-uv{background:#16002e;border-radius:12px;padding:20px;color:#d8a8ff;font:700 clamp(20px,6vw,30px) ui-monospace,monospace;text-shadow:0 0 14px #b44cff,0 0 30px #8a2be2;letter-spacing:.05em;animation:esc-glow 2s ease-in-out infinite}
@keyframes esc-glow{50%{text-shadow:0 0 6px #b44cff}}
.esc-letter{font:800 clamp(26px,8vw,38px) ui-monospace,monospace;letter-spacing:.2em;margin:8px 0;padding:12px;background:rgba(255,248,220,.92);color:#3a2a12;border-radius:6px}
.esc-wheel{display:grid;grid-template-columns:repeat(13,1fr);gap:2px;font:700 12px ui-monospace,monospace;margin:4px 0}
.esc-wheel span{padding:4px 0;background:rgba(255,255,255,.1);border-radius:4px}
.esc-wheel span.b{background:var(--g-accent);color:var(--g-bg)}
.esc-stack{display:flex;flex-direction:column;align-items:center;gap:3px;margin:10px 0}
.esc-stack div{width:130px;height:34px;border-radius:6px;border:2px solid rgba(0,0,0,.35)}
.esc-plate{font:800 80px ui-monospace,monospace;color:var(--g-accent);text-shadow:0 0 18px var(--g-accent)}
.esc-dials{display:flex;gap:8px;justify-content:center;margin:10px 0}
.esc-dial{display:flex;flex-direction:column;align-items:center;gap:4px}
.esc-dial button{width:48px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.1);color:inherit;font-size:16px;cursor:pointer}
.esc-dial output{width:48px;height:56px;display:grid;place-items:center;font:800 28px ui-monospace,monospace;background:#0b0b0b;border:2px solid var(--g-accent);border-radius:8px;color:#9cff9c}
.esc-box.shake{animation:esc-shake .4s}
@keyframes esc-shake{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
.esc-pal{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:8px 0}
.esc-pal button{width:46px;height:46px;border-radius:50%;border:3px solid rgba(255,255,255,.4);cursor:pointer}
.esc-slotrow{display:flex;gap:8px;justify-content:center;margin:8px 0}
.esc-slotrow div{width:46px;height:46px;border-radius:10px;border:2px dashed rgba(255,255,255,.5)}
.esc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:min(100%,280px);margin:8px auto}
.esc-grid button{aspect-ratio:1;border-radius:12px;border:2px solid rgba(255,255,255,.3);background:rgba(255,255,255,.12);font-size:clamp(30px,10vw,44px);cursor:pointer;color:inherit;position:relative}
.esc-grid button i{position:absolute;top:3px;left:6px;font:700 11px system-ui;opacity:.7;font-style:normal}
.esc-grid button.blank{background:transparent;border-style:dashed;cursor:default}
.esc-read{white-space:pre-line;text-align:left;background:rgba(255,248,220,.94);color:#3a2a12;border-radius:6px;padding:14px;font:500 clamp(14px,3.8vw,16px)/1.5 Georgia,serif}
.esc-big{font-size:60px}
.esc-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px}
`

const mmss = (s: number) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, '0')}`

const engine: Engine = {
  start(env) {
    const bag = new Bag()
    const root = createDom(env.host, env.theme, 'esc-root')
    const style = document.createElement('style')
    style.textContent = CSS
    root.appendChild(style)
    const ui = document.createElement('div')
    ui.className = 'esc'
    root.appendChild(ui)
    const el = <T extends HTMLElement = HTMLElement>(tag: string, cls = '', txt = ''): T => {
      const e = document.createElement(tag) as T
      if (cls) e.className = cls
      if (txt) e.textContent = txt
      return e
    }

    // ---- setup
    const flavor = pickFlavor(env.name, env.mods)
    const pool = [...new Set(env.theme.items)].slice(0, 8)
    while (pool.length < 6) pool.push(['🍎', '🔔', '⭐', '🍋', '🔷', '🌙'][pool.length])
    const rooms: Room[] = []
    const used: SourceKind[] = []
    for (let i = 0; i < 3; i++) {
      const r = genRoom(env.rng, { index: i, diff: env.difficulty, flavor, pool, used })
      used.push(...r.sources)
      rooms.push(r)
    }
    const total = byDiff(env, 840, 600, 420) * (env.mods.has('timer') ? 0.85 : 1)
    const hintCost = byDiff(env, 20, 30, 45)
    const roomBonus = byDiff(env, 60, 45, 30)
    const flood = env.mods.has('flood') || /submarine|flood/i.test(env.name)
    const dark = env.mods.has('dark')
    let left = total
    let hints = 0
    let cleared = 0
    let ri = 0
    let started = false
    let paused = false
    let over = false
    let room = rooms[0]
    let st: RoomState = newState()
    let selected: string | null = null
    const sliders = new Map<string, number[]>()
    let modalEl: HTMLElement | null = null
    let modalKey: (e: KeyboardEvent) => boolean = () => false
    let toastTimer = 0

    // ---- skeleton
    const top = el('div', 'esc-top')
    const ttl = el('div', 'ttl')
    const timeEl = el('div', 'esc-time')
    const hintBtn = el<HTMLButtonElement>('button', 'esc-btn', '💡 Hint')
    hintBtn.type = 'button'
    top.append(ttl, timeEl, hintBtn)
    const view = el('div', 'esc-room')
    if (dark) view.classList.add('esc-dark')
    const bagEl = el('div', 'esc-bag')
    const selEl = el('div', 'esc-sel')
    const slotsEl = el('div', 'esc-slots')
    bagEl.append(selEl, slotsEl)
    ui.append(top, view, bagEl)

    const fit = () => {
      const r = view.getBoundingClientRect()
      view.style.setProperty('--u', `${Math.max(28, Math.min(r.width / 11, r.height / 6.4))}px`)
    }
    const ro = new ResizeObserver(fit)
    ro.observe(view)
    bag.add(() => ro.disconnect())
    if (dark) {
      bag.on(view, 'pointermove', (e) => {
        const r = view.getBoundingClientRect()
        view.style.setProperty('--lx', `${e.clientX - r.left}px`)
        view.style.setProperty('--ly', `${e.clientY - r.top}px`)
      })
    }

    // ---- toasts
    const toast = el('div', 'esc-toast')
    function say(text: string, ms = 3200, hint = false) {
      if (!text) return
      toast.textContent = text
      toast.classList.toggle('hint', hint)
      toast.classList.add('on')
      clearTimeout(toastTimer)
      toastTimer = window.setTimeout(() => toast.classList.remove('on'), ms)
    }
    bag.add(() => clearTimeout(toastTimer))

    // ---- HUD
    function hud() {
      timeEl.textContent = `⏱ ${mmss(left)}`
      timeEl.classList.toggle('low', left < 60)
      env.status(`Room ${ri + 1}/3 · ${mmss(left)} · 💡${hints}`)
      const w = view.querySelector<HTMLElement>('.esc-water')
      if (w) w.style.height = `${Math.min(100, (1 - left / total) * 100)}%`
    }

    // ---- room rendering
    function renderRoom() {
      view.innerHTML = ''
      view.classList.remove('armed')
      view.append(el('div', 'esc-wallband'), el('div', 'esc-floor'), el('div', 'esc-light'))
      for (const h of room.hotspots) {
        const b = el<HTMLButtonElement>('button', 'esc-hs')
        b.type = 'button'
        b.style.left = `${h.x}%`
        b.style.top = `${h.y}%`
        b.style.setProperty('--s', String(h.size))
        b.dataset.id = h.id
        b.setAttribute('aria-label', h.name)
        b.append(el('span', 'e', h.emoji), el('span', 'n', h.name))
        const done = (h.kind === 'container' && st.opened.has(h.id)) || (h.kind === 'search' && st.searched.has(h.id)) || (h.kind === 'slider' && st.solved.has(h.id) && h.reward?.t === 'item')
        if (done) {
          b.classList.add('done')
          b.append(el('span', 'ok', '✅'))
        }
        b.onclick = (ev) => {
          ev.stopPropagation()
          if (!started || over || modalEl) return
          handle(tap(room, st, h.id, selected))
        }
        view.appendChild(b)
      }
      if (flood) view.appendChild(el('div', 'esc-water'))
      view.appendChild(toast)
      view.onclick = () => {
        if (selected) {
          selected = null
          renderBag()
        }
      }
      ttl.innerHTML = ''
      ttl.append(`${env.theme.hero} ${room.name}`, el('small', '', `Room ${ri + 1} of 3 · ${env.name}`))
      renderBag()
      fit()
      hud()
    }

    function renderBag() {
      slotsEl.innerHTML = ''
      view.classList.toggle('armed', !!selected)
      if (!st.inv.length) slotsEl.appendChild(el('div', 'esc-empty', 'Your bag is empty. Search the room.'))
      for (const id of st.inv) {
        const it = room.items[id]
        const b = el<HTMLButtonElement>('button', `esc-slot${selected === id ? ' sel' : ''}`, it.emoji)
        b.type = 'button'
        b.title = it.name
        b.setAttribute('aria-label', it.name)
        b.onclick = () => {
          if (!started || over || modalEl) return
          env.sfx('click')
          if (selected === id && it.read) {
            const m = readItem(room, st, id)
            if (m) openModal(m)
            return
          }
          selected = selected === id ? null : id
          renderBag()
        }
        slotsEl.appendChild(b)
      }
      const it = selected ? room.items[selected] : null
      selEl.textContent = it ? (it.read ? `${it.emoji} ${it.name} selected. Tap it again to read it, or tap an object to use it.` : `${it.emoji} ${it.name} selected. Tap an object to use it.`) : st.inv.length ? 'Tap an item to select it, then tap something in the room.' : ''
    }

    // ---- actions
    function handle(a: Action) {
      switch (a.t) {
        case 'msg':
          env.sfx('move')
          say(a.text)
          break
        case 'got': {
          env.sfx('power')
          const names = a.items.map((i) => `${room.items[i]?.emoji ?? ''} ${room.items[i]?.name ?? i}`).join(', ')
          say(`${a.text}${names ? `\nGot: ${names}` : ''}`, 4200)
          selected = null
          renderRoom()
          break
        }
        case 'modal':
          env.sfx('click')
          openModal(a.modal)
          renderBag()
          break
        case 'exit':
          roomCleared()
          break
      }
    }

    // ---- modals
    function closeModal() {
      modalEl?.remove()
      modalEl = null
      modalKey = () => false
    }
    function openModal(m: Modal) {
      closeModal()
      const ov = el('div', 'esc-modal')
      const box = el('div', 'esc-box')
      const x = el<HTMLButtonElement>('button', 'esc-x', '✕')
      x.type = 'button'
      x.setAttribute('aria-label', 'Close')
      x.onclick = () => {
        closeModal()
        renderBag()
      }
      ov.onclick = (e) => {
        if (e.target === ov) x.click()
      }
      box.appendChild(x)
      if (m.t === 'clue') clueView(box, m.clue, m.title)
      else if (m.t === 'read') {
        box.append(el('div', 'esc-big', m.item.emoji), el('h3', '', m.item.name), el('div', 'esc-read', m.item.read ?? ''))
        if (m.item.id === 'codenote') say('Note read. Now find each clue it mentions.', 3500, true)
      } else if (m.t === 'lock') lockView(box, m)
      else sliderView(box, m)
      ov.appendChild(box)
      view.appendChild(ov)
      modalEl = ov
    }

    function clueView(box: HTMLElement, c: Clue, title: string) {
      box.appendChild(el('h3', '', title))
      if (c.t === 'clock') {
        const hA = ((c.h % 12) + c.m / 60) * 30
        const mA = c.m * 6
        let ticks = ''
        for (let i = 0; i < 12; i++) {
          const a = (i * 30 * Math.PI) / 180
          ticks += `<text x="${100 + Math.sin(a) * 76}" y="${100 - Math.cos(a) * 76 + 6}" text-anchor="middle" font-size="17" font-weight="700" fill="#3a2a12">${i === 0 ? 12 : i}</text>`
        }
        const svg = `<svg viewBox="0 0 200 200" width="230" height="230"><circle cx="100" cy="100" r="94" fill="#fbf3dc" stroke="#7a5a2a" stroke-width="8"/>${ticks}<g transform="rotate(${hA} 100 100)"><rect x="95" y="46" width="10" height="58" rx="5" fill="#2a1d0c"/></g><g transform="rotate(${mA} 100 100)"><rect x="97.5" y="22" width="5" height="82" rx="2.5" fill="#6a1b1b"/></g><circle cx="100" cy="100" r="7" fill="#2a1d0c"/></svg>`
        const d = el('div')
        d.innerHTML = svg
        box.append(d, el('p', '', 'The short, thick hand is the hour hand.'))
      } else if (c.t === 'count') {
        box.appendChild(el('p', '', `Count the ${c.target} on the shelf. Tap items to mark them as you count.`))
        const g = el('div', 'esc-cnt')
        for (const e of c.grid) {
          const b = el<HTMLButtonElement>('button', '', e)
          b.type = 'button'
          b.onclick = () => b.classList.toggle('mark')
          g.appendChild(b)
        }
        box.appendChild(g)
      } else if (c.t === 'uv') {
        box.append(el('p', '', 'Under the purple light, hidden ink glows:'), el('div', 'esc-uv', c.text))
      } else if (c.t === 'plate') {
        box.append(el('p', '', 'A number is scratched into the wall:'), el('div', 'esc-plate', String(c.digit)))
      } else if (c.t === 'colors') {
        box.appendChild(el('p', '', 'A tower of toy blocks. Remember the colours from the top down.'))
        const s = el('div', 'esc-stack')
        for (const ci of c.seq) {
          const d = el('div')
          d.style.background = COLORS[ci]
          d.title = COLOR_NAMES[ci]
          s.appendChild(d)
        }
        box.appendChild(s)
      } else if (c.t === 'cipher') {
        box.append(el('p', '', `A letter in code. Every letter was moved ${c.shift} places forward. Use the wheel to move it back.`), el('div', 'esc-letter', c.cipher))
        const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const shifted = caesar(alpha, c.shift)
        for (let part = 0; part < 2; part++) {
          const w = el('div', 'esc-wheel')
          const sl = (s: string) => s.slice(part * 13, part * 13 + 13)
          for (const ch of sl(shifted)) w.appendChild(el('span', 'b', ch))
          for (const ch of sl(alpha)) w.appendChild(el('span', '', ch))
          box.appendChild(w)
        }
        box.appendChild(el('p', '', 'Find a coded letter in the coloured row; the letter below it is the real one.'))
      }
    }

    function lockView(box: HTMLElement, m: Extract<Modal, { t: 'lock' }>) {
      const l = m.lock
      box.appendChild(el('h3', '', m.title))
      const tryBtn = el<HTMLButtonElement>('button', 'esc-btn main', 'Unlock')
      tryBtn.type = 'button'
      const fail = () => {
        env.sfx('hit')
        box.classList.remove('shake')
        void box.offsetWidth
        box.classList.add('shake')
        say('Wrong combination.')
      }
      const success = (items: string[]) => {
        env.sfx('power')
        closeModal()
        const names = items.map((i) => `${room.items[i]?.emoji ?? ''} ${room.items[i]?.name ?? i}`).join(', ')
        say(`Click! It opens.${names ? `\nGot: ${names}` : ''}`, 4200)
        selected = null
        renderRoom()
      }
      if (l.t === 'digits' || l.t === 'word') {
        const isNum = l.t === 'digits'
        const n = l.code.length
        const vals: number[] = Array.from({ length: n }, () => 0)
        const outs: HTMLOutputElement[] = []
        const show = (i: number) => {
          outs[i].textContent = isNum ? String(vals[i]) : String.fromCharCode(65 + vals[i])
        }
        const mod = isNum ? 10 : 26
        box.appendChild(el('p', '', isNum ? `Enter the ${n}-digit code.` : 'Enter the four-letter word.'))
        const row = el('div', 'esc-dials')
        for (let i = 0; i < n; i++) {
          const d = el('div', 'esc-dial')
          const up = el<HTMLButtonElement>('button', '', '▲')
          const dn = el<HTMLButtonElement>('button', '', '▼')
          const out = el<HTMLOutputElement>('output')
          up.type = dn.type = 'button'
          up.onclick = () => {
            vals[i] = (vals[i] + 1) % mod
            show(i)
            env.sfx('move')
          }
          dn.onclick = () => {
            vals[i] = (vals[i] + mod - 1) % mod
            show(i)
            env.sfx('move')
          }
          outs.push(out)
          d.append(up, out, dn)
          row.appendChild(d)
          show(i)
        }
        box.append(row, tryBtn)
        let cursor = 0
        const attempt = () => {
          const s = isNum ? vals.join('') : vals.map((v) => String.fromCharCode(65 + v)).join('')
          const r = tryLock(room, st, m.id, s)
          if (r.ok) success(r.items)
          else fail()
        }
        tryBtn.onclick = attempt
        modalKey = (e) => {
          if (e.key === 'Enter') {
            attempt()
            return true
          }
          const k = e.key
          const ok = isNum ? /^[0-9]$/.test(k) : /^[a-zA-Z]$/.test(k)
          if (ok) {
            vals[cursor] = isNum ? Number(k) : k.toUpperCase().charCodeAt(0) - 65
            show(cursor)
            cursor = (cursor + 1) % n
            return true
          }
          if (k === 'Backspace') {
            cursor = (cursor + n - 1) % n
            return true
          }
          return false
        }
      } else if (l.t === 'colors') {
        box.appendChild(el('p', '', 'Press the coloured buttons in order. Match the tower, top to bottom.'))
        const picked: number[] = []
        const slotRow = el('div', 'esc-slotrow')
        const slots = l.code.map(() => el('div'))
        slots.forEach((s) => slotRow.appendChild(s))
        const paint = () => {
          slots.forEach((s, i) => {
            s.style.background = picked[i] !== undefined ? COLORS[picked[i]] : 'transparent'
            s.style.borderStyle = picked[i] !== undefined ? 'solid' : 'dashed'
          })
        }
        const pal = el('div', 'esc-pal')
        COLORS.forEach((c, ci) => {
          const b = el<HTMLButtonElement>('button')
          b.type = 'button'
          b.style.background = c
          b.setAttribute('aria-label', COLOR_NAMES[ci])
          b.onclick = () => {
            if (picked.length >= l.code.length) return
            picked.push(ci)
            env.sfx('move')
            paint()
            if (picked.length === l.code.length) {
              const r = tryLock(room, st, m.id, picked)
              if (r.ok) success(r.items)
              else {
                fail()
                picked.length = 0
                paint()
              }
            }
          }
          pal.appendChild(b)
        })
        const clear = el<HTMLButtonElement>('button', 'esc-btn', 'Clear')
        clear.type = 'button'
        clear.onclick = () => {
          picked.length = 0
          paint()
        }
        box.append(slotRow, pal, clear)
        paint()
      }
    }

    function sliderView(box: HTMLElement, m: Extract<Modal, { t: 'slider' }>) {
      box.appendChild(el('h3', '', m.title))
      box.appendChild(el('p', '', 'Slide the tiles into order, 1 to 8, with the gap in the corner.'))
      let tiles = sliders.get(m.id)
      if (!tiles) {
        tiles = genSlider(env.rng)
        sliders.set(m.id, tiles)
      }
      const t = tiles
      const faces = [...pool, '⭐', '🌙'].slice(0, 8)
      const g = el('div', 'esc-grid')
      const moves = el('p', '', 'Moves: 0')
      let n = 0
      const paint = () => {
        g.innerHTML = ''
        t.forEach((v, i) => {
          const b = el<HTMLButtonElement>('button', v === 0 ? 'blank' : '')
          b.type = 'button'
          if (v) {
            b.textContent = faces[v - 1]
            b.appendChild(el('i', '', String(v)))
          }
          b.onclick = () => {
            if (v === 0) return
            if (slide(t, i)) {
              n++
              moves.textContent = `Moves: ${n}`
              env.sfx('move')
              paint()
              if (isSolved(t)) {
                env.sfx('point')
                bag.timeout(() => {
                  closeModal()
                  const a = solveSlider(room, st, m.id)
                  selected = null
                  renderRoom()
                  handle(a)
                }, 350)
              }
            }
          }
          g.appendChild(b)
        })
      }
      paint()
      box.append(g, moves)
    }

    // ---- keyboard
    bag.on(window, 'keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (!started) {
        if (e.code === 'Enter' || e.code === 'Space') startBtn?.click()
        return
      }
      if (modalEl) {
        if (e.key === 'Escape') {
          closeModal()
          renderBag()
          e.preventDefault()
        } else if (modalKey(e)) e.preventDefault()
      }
    })

    // ---- hints & timer
    hintBtn.onclick = () => {
      if (!started || over || modalEl) return
      if (left <= hintCost + 5) {
        say('Not enough time left for a hint.')
        return
      }
      left -= hintCost
      hints++
      env.sfx('power')
      say(`${nextHint(room, st)}\n(−${hintCost}s)`, 7000, true)
      hud()
    }
    let last = performance.now()
    bag.interval(() => {
      const now = performance.now()
      const dt = (now - last) / 1000
      last = now
      if (!started || paused || over) return
      left -= dt
      if (left <= 0) {
        left = 0
        hud()
        lose()
        return
      }
      hud()
    }, 250)

    function score() {
      return Math.max(0, cleared * 1000 + Math.floor(left) * 2 - hints * 100)
    }

    function lose() {
      if (over) return
      over = true
      closeModal()
      env.sfx('lose')
      const ov = el('div', 'esc-modal')
      const box = el('div', 'esc-box')
      box.append(el('div', 'esc-big', flood ? '🌊' : '⌛'), el('h3', '', flood ? 'The water won.' : 'Time is up!'), el('p', '', `You cleared ${cleared} of 3 rooms.`))
      ov.appendChild(box)
      view.appendChild(ov)
      env.score(score())
      bag.timeout(() => env.end({ score: score(), won: false, text: `Cleared ${cleared} of 3 rooms` }), 1600)
    }

    function roomCleared() {
      cleared++
      left += roomBonus
      env.sfx('win')
      env.score(score())
      if (cleared >= 3) {
        over = true
        const ov = el('div', 'esc-modal')
        const box = el('div', 'esc-box')
        box.append(el('div', 'esc-big', '🎉'), el('h3', '', 'You escaped!'), el('p', '', `Time left ${mmss(left)} · hints used ${hints}`))
        ov.appendChild(box)
        view.appendChild(ov)
        env.score(score())
        bag.timeout(() => env.end({ score: score(), won: true, text: `Escaped with ${mmss(left)} left and ${hints} hints` }), 1800)
        return
      }
      const ov = el('div', 'esc-modal')
      const box = el('div', 'esc-box')
      box.append(el('div', 'esc-big', '🔓'), el('h3', '', `Room ${ri + 1} cleared!`), el('p', '', `+${roomBonus}s bonus. On to the next room.`))
      const go = el<HTMLButtonElement>('button', 'esc-btn main', 'Next room ▶')
      go.type = 'button'
      go.onclick = () => {
        ri++
        room = rooms[ri]
        st = newState()
        selected = null
        renderRoom()
        say(room.blurb, 3500)
      }
      box.appendChild(go)
      ov.appendChild(box)
      view.appendChild(ov)
      modalEl = ov
      modalKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          go.click()
          return true
        }
        return false
      }
      const prev = go.onclick
      go.onclick = (ev) => {
        closeModal()
        prev?.call(go, ev)
      }
    }

    // ---- intro
    renderRoom()
    let startBtn: HTMLButtonElement | null = null
    {
      const ov = el('div', 'esc-modal')
      const box = el('div', 'esc-box')
      box.append(
        el('div', 'esc-big', env.theme.hero),
        el('h3', '', env.name),
        el('p', '', flavor.intro),
        el('p', '', `3 rooms · ⏱ ${mmss(total)} · hints cost ${hintCost}s`),
        el('p', '', 'Tap objects to search them. Select an item in your bag, then tap an object to use it.'),
      )
      startBtn = el<HTMLButtonElement>('button', 'esc-btn main', 'Start escaping')
      startBtn.type = 'button'
      startBtn.onclick = () => {
        ov.remove()
        started = true
        last = performance.now()
        env.sfx('click')
        say(room.blurb, 3000)
        hud()
      }
      box.appendChild(startBtn)
      ov.appendChild(box)
      view.appendChild(ov)
    }
    env.score(0)
    hud()

    return {
      destroy() {
        bag.dispose()
        root.remove()
      },
      pause(p) {
        paused = p
        last = performance.now()
      },
    }
  },
}

export default engine
