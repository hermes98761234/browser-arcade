// Reigns: swipe decision cards. Drag the card (or arrows / buttons), keep four meters in balance, survive the years.
import { byDiff, createDom, type Engine } from '../kit'
import { FIRST_CARD, LEADER_DECK, LIFE_DECK, pickFlavor, type Card, type Flavor, type Opt } from '../logic/reignsDeck'

const CSS = `
.rgn{font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;padding:8px 10px;box-sizing:border-box;user-select:none;-webkit-user-select:none;touch-action:none;overflow:hidden}
.rgn *{box-sizing:border-box}
.rgn .meters{display:flex;gap:clamp(8px,3vw,22px);justify-content:center;width:100%;max-width:440px;margin-top:2px}
.rgn .m{display:flex;flex-direction:column;align-items:center;gap:2px;width:22%;position:relative}
.rgn .mi{width:clamp(46px,14vw,62px);height:clamp(46px,14vw,62px);border-radius:14px;border:2px solid color-mix(in srgb,var(--g-fg) 35%,transparent);position:relative;overflow:hidden;display:grid;place-items:center;font-size:clamp(22px,7vw,30px);background:color-mix(in srgb,var(--g-fg) 8%,transparent)}
.rgn .mf{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(var(--g-accent),var(--g-accent2));opacity:.55;transition:height .35s}
.rgn .mi span{position:relative}
.rgn .m.warn .mi{border-color:var(--g-danger);animation:rgnw .6s infinite alternate}
@keyframes rgnw{to{box-shadow:0 0 14px var(--g-danger)}}
.rgn .mn{font-size:11px;opacity:.8;font-weight:600;white-space:nowrap}
.rgn .dot{position:absolute;top:-6px;right:12%;border-radius:50%;background:var(--g-fg);opacity:0;transition:opacity .15s,transform .15s;transform:scale(.4)}
.rgn .dot.on{opacity:1;transform:scale(1)}
.rgn .stage{flex:1;min-height:240px;width:100%;max-width:440px;position:relative;display:flex;align-items:center;justify-content:center}
.rgn .card{position:absolute;width:min(92%,340px);height:min(96%,360px);min-height:220px;border-radius:20px;background:linear-gradient(160deg,var(--g-bg2),var(--g-bg));border:2px solid var(--g-accent);box-shadow:0 12px 34px rgba(0,0,0,.45);display:flex;flex-direction:column;align-items:center;padding:14px 16px 16px;touch-action:none;cursor:grab;color:var(--g-fg);will-change:transform}
.rgn .card.ghost{transform:scale(.94) translateY(10px);opacity:.5;z-index:0;pointer-events:none}
.rgn .lbl{position:absolute;top:10px;font-weight:800;font-size:15px;padding:5px 12px;border-radius:10px;background:var(--g-accent);color:#111;opacity:0;max-width:46%;text-align:center}
.rgn .lbl.l{left:10px}.rgn .lbl.r{right:10px}
.rgn .face{font-size:clamp(54px,18vw,78px);line-height:1.1;margin-top:14px;filter:drop-shadow(0 4px 6px rgba(0,0,0,.4))}
.rgn .who{font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.75;font-weight:700;margin:4px 0 10px}
.rgn .txt{font-size:clamp(15px,4.3vw,18px);line-height:1.35;text-align:center;font-weight:600}
.rgn .res{min-height:34px;font-size:13px;text-align:center;opacity:.85;max-width:380px;font-style:italic;margin:6px 0 2px}
.rgn .btns{display:flex;gap:10px;width:100%;max-width:440px}
.rgn .b{flex:1;min-height:46px;border-radius:12px;border:1px solid color-mix(in srgb,var(--g-fg) 25%,transparent);background:color-mix(in srgb,var(--g-fg) 10%,transparent);color:var(--g-fg);font:inherit;font-size:14px;font-weight:700;cursor:pointer;padding:6px}
.rgn .b:active{background:var(--g-accent);color:#111}
.rgn .foot{display:flex;align-items:center;gap:10px;width:100%;max-width:440px;margin:6px 0;font-weight:700;font-size:14px}
.rgn .bar{flex:1;height:8px;border-radius:5px;background:color-mix(in srgb,var(--g-fg) 15%,transparent);overflow:hidden}
.rgn .bar i{display:block;height:100%;background:var(--g-accent);transition:width .3s}
.rgn .flash{animation:rgnf .5s}
@keyframes rgnf{0%{transform:scale(1.18)}100%{transform:scale(1)}}
`

const engine: Engine = {
  start(env) {
    const { theme: th, rng } = env
    const fl: Flavor = pickFlavor(`${env.name} ${env.desc}`, th.id)
    const life = fl.id === 'life'
    const sub = (s: string) => s
      .replace(/\{K\}/g, fl.K).replace(/\{R\}/g, fl.R).replace(/\{Cn\}/g, fl.Cn)
      .replace(/\{P\}/g, fl.roles.P[1].replace(/^The /, '')).replace(/\{G\}/g, fl.roles.G[1].replace(/^The /, '')).replace(/\{T\}/g, fl.roles.T[1].replace(/^The /, ''))
    const deck: Card[] = fl.deck ?? (life ? LIFE_DECK : LEADER_DECK)
    const byId = new Map(deck.map((c) => [c.id, c]))
    const goal = byDiff(env, 45, 60, 75)
    const negMul = byDiff(env, 0.8, 1, 1.2)

    const root = createDom(env.host, th, 'rgn')
    const style = document.createElement('style')
    style.textContent = CSS
    document.head.appendChild(style)
    root.style.position = 'absolute'
    const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = '', parent?: HTMLElement) => {
      const e = document.createElement(tag)
      if (cls) e.className = cls
      if (text) e.textContent = text
      parent?.appendChild(e)
      return e
    }

    const meters = [50, 50, 50, 50].map((v, i) => v + (i % 2 ? 4 : -4))
    const mEls = fl.meters.map(([name, icon]) => ({ name, icon }))
    const mbox = el('div', 'meters', '', root)
    const mui = mEls.map((m) => {
      const w = el('div', 'm', '', mbox)
      const dot = el('div', 'dot', '', w)
      const box = el('div', 'mi', '', w)
      const fill = el('div', 'mf', '', box)
      el('span', '', m.icon, box)
      el('div', 'mn', m.name, w)
      return { w, dot, fill, box }
    })
    const stage = el('div', 'stage', '', root)
    const res = el('div', 'res', '', root)
    const btns = el('div', 'btns', '', root)
    const bl = el('button', 'b', '', btns)
    const br = el('button', 'b', '', btns)
    const foot = el('div', 'foot', '', root)
    const heroE = el('span', '', th.hero, foot)
    heroE.style.fontSize = '22px'
    const yearE = el('span', '', '', foot)
    const bar = el('div', 'bar', '', foot)
    const barI = el('i', '', '', bar)
    const goalE = el('span', '', `${goal}`, foot)
    goalE.style.opacity = '.7'

    let years = 0
    let cur: Card = FIRST_CARD(fl)
    let cardEl: HTMLElement | null = null
    let over = false
    let busy = false
    let paused = false
    const pending: { id: string; in: number }[] = []
    const flags = new Set<string>()
    const recent: string[] = []

    const setMeters = (preview?: Opt | null) => {
      meters.forEach((v, i) => {
        mui[i].fill.style.height = `${Math.max(0, Math.min(100, v))}%`
        mui[i].w.classList.toggle('warn', v <= 18 || v >= 82)
        const d = preview ? preview.fx[i] : 0
        const dot = mui[i].dot
        dot.classList.toggle('on', !!preview && d !== 0)
        const s = Math.abs(d) >= 11 ? 12 : Math.abs(d) >= 6 ? 9 : 6
        dot.style.width = dot.style.height = `${s}px`
      })
    }
    const hud = () => {
      env.score(years)
      env.status(`Year ${years} / ${goal}`)
      yearE.textContent = `Year ${years}`
      barI.style.width = `${Math.min(100, (years / goal) * 100)}%`
    }

    const makeCard = (c: Card, ghost = false) => {
      const [em, nm] = fl.roles[c.who] ?? ['🕴️', 'Someone']
      const e = el('div', ghost ? 'card ghost' : 'card')
      el('div', 'lbl l', '', e)
      el('div', 'lbl r', '', e)
      el('div', 'face', em, e)
      el('div', 'who', nm, e)
      el('div', 'txt', sub(c.text), e)
      return e
    }

    const pick = (): Card => {
      // due chained cards first
      for (const p of pending) p.in--
      const due = pending.findIndex((p) => p.in <= 0)
      if (due >= 0) {
        const p = pending.splice(due, 1)[0]
        const c = byId.get(p.id)
        if (c) return c
      }
      const pool = deck.filter((c) => !c.chain && !recent.includes(c.id))
      const ext = meters.map((v) => (v < 25 ? 1 : v > 75 ? -1 : 0))
      const score = (c: Card) => {
        let w = 1
        for (const o of [c.L, c.R]) {
          let h = 0
          o.fx.forEach((d, i) => { if (ext[i] && Math.sign(d) === ext[i]) h += Math.abs(d) })
          if (h >= 6) w += 1.6
          let bad = 0
          o.fx.forEach((d, i) => { if (ext[i] && Math.sign(d) === -ext[i]) bad += Math.abs(d) })
          if (bad >= 10 && byDiff(env, 1, 0, 0) === 1) w *= 0.7
        }
        return w
      }
      const total = pool.reduce((s, c) => s + score(c), 0)
      let r = rng() * total
      for (const c of pool) { r -= score(c); if (r <= 0) return c }
      return pool[0] ?? deck[0]
    }

    const show = (c: Card, first = false) => {
      cur = c
      if (cardEl) cardEl.remove()
      cardEl = makeCard(c)
      stage.querySelectorAll('.ghost').forEach((g) => g.remove())
      const gh = makeCard(deck[0], true)
      gh.innerHTML = ''
      stage.appendChild(gh)
      stage.appendChild(cardEl)
      bl.textContent = `◀ ${sub(c.L.label)}`
      br.textContent = `${sub(c.R.label)} ▶`
      if (!first) cardEl.animate([{ transform: 'scale(.85) translateY(20px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'ease-out' })
      attach(cardEl)
      busy = false
      setMeters(null)
    }

    // ---- swipe handling ----
    let dragX = 0
    const attach = (card: HTMLElement) => {
      let sx = 0
      let on = false
      const lab = { _l: card.querySelector<HTMLElement>('.lbl.l')!, _r: card.querySelector<HTMLElement>('.lbl.r')! }
      const upd = () => {
        card.style.transform = `translateX(${dragX}px) rotate(${dragX / 18}deg)`
        const side = dragX < -25 ? cur.L : dragX > 25 ? cur.R : null
        const k = Math.min(1, Math.abs(dragX) / 90)
        lab._l.style.opacity = dragX < 0 ? String(k) : '0'
        lab._r.style.opacity = dragX > 0 ? String(k) : '0'
        lab._l.textContent = sub(cur.L.label)
        lab._r.textContent = sub(cur.R.label)
        setMeters(side)
      }
      card.addEventListener('pointerdown', (e) => {
        if (busy || over || paused) return
        on = true
        sx = e.clientX
        dragX = 0
        card.setPointerCapture(e.pointerId)
        card.style.transition = 'none'
      })
      card.addEventListener('pointermove', (e) => {
        if (!on) return
        dragX = e.clientX - sx
        upd()
      })
      const up = () => {
        if (!on) return
        on = false
        card.style.transition = 'transform .2s'
        if (Math.abs(dragX) > 90) choose(dragX < 0 ? 'L' : 'R')
        else { dragX = 0; card.style.transform = ''; lab._l.style.opacity = lab._r.style.opacity = '0'; setMeters(null) }
      }
      card.addEventListener('pointerup', up)
      card.addEventListener('pointercancel', up)
    }

    const endGame = (won: boolean, text: string) => {
      if (over) return
      over = true
      env.score(years)
      env.sfx(won ? 'win' : 'lose')
      if (cardEl) {
        cardEl.innerHTML = ''
        el('div', 'face', won ? '👑' : '💀', cardEl)
        el('div', 'who', won ? 'A legendary reign' : 'The reign ends', cardEl)
        el('div', 'txt', text, cardEl)
        cardEl.style.transform = ''
      }
      res.textContent = `Reign length: ${years} years`
      later(() => env.end({ score: years, won, text }), won ? 1600 : 2600)
    }
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const later = (fn: () => void, ms: number) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id) }

    const choose = (side: 'L' | 'R') => {
      if (busy || over || paused) return
      busy = true
      const o = side === 'L' ? cur.L : cur.R
      const card = cardEl!
      card.style.transition = 'transform .25s, opacity .25s'
      card.style.transform = `translateX(${side === 'L' ? -420 : 420}px) rotate(${side === 'L' ? -25 : 25}deg)`
      card.style.opacity = '0'
      env.sfx('click')
      o.fx.forEach((d, i) => {
        const v = d < 0 ? d * negMul : d
        meters[i] += Math.round(v)
        if (d !== 0) { mui[i].box.classList.remove('flash'); void mui[i].box.offsetWidth; mui[i].box.classList.add('flash') }
      })
      if (o.set) flags.add(o.set)
      if (o.next) pending.push({ id: o.next[0], in: o.next[1] })
      res.textContent = sub(o.res)
      setMeters(null)
      years++
      if (cur.id !== 'intro') { recent.push(cur.id); if (recent.length > Math.min(14, deck.length - 8)) recent.shift() }
      hud()
      dragX = 0
      const dead = meters.findIndex((v) => v <= 0 || v >= 100)
      if (dead >= 0) {
        const hi = meters[dead] >= 100
        later(() => endGame(false, sub(fl.end[(hi ? 4 : 0) + dead])), 400)
        return
      }
      if (years >= goal) { later(() => endGame(true, `You ruled for ${years} years and stepped down in glory.`), 400); return }
      env.sfx(o.fx.reduce((s, d) => s + d, 0) >= 0 ? 'point' : 'hit')
      later(() => show(pick()), 330)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); choose('L') }
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); choose('R') }
    }
    window.addEventListener('keydown', onKey)
    bl.addEventListener('click', () => choose('L'))
    br.addEventListener('click', () => choose('R'))
    // hover preview for buttons (desktop)
    bl.addEventListener('pointerenter', () => setMeters(cur.L))
    br.addEventListener('pointerenter', () => setMeters(cur.R))
    bl.addEventListener('pointerleave', () => setMeters(null))
    br.addEventListener('pointerleave', () => setMeters(null))

    hud()
    show(cur, true)
    res.textContent = 'Drag the card left or right, or use ← →.'
    return {
      destroy() {
        window.removeEventListener('keydown', onKey)
        for (const t of timers) clearTimeout(t)
        style.remove()
        root.remove()
      },
      pause(p) { paused = p },
    }
  },
}
export default engine
