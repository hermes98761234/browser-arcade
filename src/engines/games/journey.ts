// Journey: Oregon-Trail-like travel across N legs. Pace and rations, party health, 60+ handwritten events, towns for trading.
import { byDiff, createDom, type Engine } from '../kit'
import { JFLAVORS, pickKind, type Ch, type D, type Ev } from '../logic/journeyEvents'

const CSS = `
.jny{font-family:system-ui,sans-serif;box-sizing:border-box;user-select:none;-webkit-user-select:none;overflow:hidden!important}
.jny *{box-sizing:border-box}
.jny .w{width:100%;max-width:640px;display:flex;flex-direction:column;gap:8px}
.jny .card{background:color-mix(in srgb,var(--g-fg) 8%,transparent);border-radius:14px;padding:8px 10px;border:1px solid color-mix(in srgb,var(--g-fg) 14%,transparent)}
.jny .top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-weight:700;font-size:clamp(13px,3.6vw,15px)}
.jny .sub{font-size:12px;opacity:.75;font-weight:600}
.jny .map{position:relative;height:46px;margin:4px 6px 0}
.jny .track{position:absolute;left:0;right:0;top:26px;height:8px;border-radius:5px;background:color-mix(in srgb,var(--g-fg) 18%,transparent)}
.jny .fill{position:absolute;left:0;top:0;bottom:0;border-radius:5px;background:linear-gradient(90deg,var(--g-accent),var(--g-accent2));transition:width .3s}
.jny .stop{position:absolute;top:18px;font-size:16px;transform:translateX(-50%);filter:grayscale(.6)}
.jny .stop.done{filter:none}
.jny .me{position:absolute;top:-2px;font-size:24px;transform:translateX(-50%);transition:left .3s;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))}
.jny .scene{height:70px;border-radius:12px;position:relative;overflow:hidden;display:flex;align-items:flex-end;justify-content:center;gap:10px;font-size:34px;padding-bottom:6px}
.jny .scene .bg{position:absolute;inset:0;background-size:80px 100%;opacity:.5}
.jny .scene.run .bg{animation:jnybg 1.2s linear infinite}
@keyframes jnybg{to{background-position:-80px 0}}
.jny .scene span{position:relative}
.jny .scene.run .v{animation:jnyb .35s ease-in-out infinite alternate}
@keyframes jnyb{to{transform:translateY(-3px)}}
.jny .party{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px}
.jny .mem{display:flex;gap:6px;align-items:center;padding:6px 8px;border-radius:10px;background:color-mix(in srgb,var(--g-fg) 8%,transparent);min-width:0}
.jny .mem.dead{opacity:.35;filter:grayscale(1)}
.jny .mem .e{font-size:26px}
.jny .mem .n{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.jny .hpb{height:6px;border-radius:4px;background:color-mix(in srgb,var(--g-fg) 18%,transparent);overflow:hidden;margin-top:3px}
.jny .hpb i{display:block;height:100%;background:var(--g-good)}
.jny .st{font-size:10px;opacity:.8}
.jny .res{display:flex;flex-wrap:wrap;gap:6px;justify-content:space-between}
.jny .r{flex:1;min-width:60px;text-align:center;font-weight:800;font-size:clamp(13px,3.8vw,16px);padding:4px 2px;border-radius:10px;background:color-mix(in srgb,var(--g-fg) 8%,transparent)}
.jny .r small{display:block;font-size:10px;opacity:.7;font-weight:600}
.jny .r.low{color:var(--g-danger);animation:jnyw .7s infinite alternate}
@keyframes jnyw{to{background:color-mix(in srgb,var(--g-danger) 25%,transparent)}}
.jny .row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.jny .lab{font-size:11px;font-weight:700;opacity:.7;min-width:48px}
.jny .b{flex:1;min-width:64px;min-height:42px;border-radius:10px;border:1px solid color-mix(in srgb,var(--g-fg) 25%,transparent);background:color-mix(in srgb,var(--g-fg) 10%,transparent);color:var(--g-fg);font:inherit;font-size:13px;font-weight:700;cursor:pointer;padding:6px 8px}
.jny .b:disabled{opacity:.4;cursor:default}
.jny .b.on{background:var(--g-accent);color:#111;border-color:transparent}
.jny .b.go{background:var(--g-good);color:#111;border-color:transparent;font-size:15px}
.jny .log{font-size:12px;line-height:1.4;min-height:58px;opacity:.85}
.jny .log div:first-child{font-weight:700;opacity:1}
.jny .log div{opacity:.75}
.jny .modal{position:absolute;inset:0;z-index:20}
.jny .sc{position:absolute;inset:0;overflow:auto;padding:8px 10px 14px;display:flex;flex-direction:column;align-items:center}
.jny .mb{position:absolute;inset:0;background:rgba(0,0,0,.62)}
.jny .mc{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92%,460px);max-height:92%;overflow:auto;background:var(--g-bg2);border:2px solid var(--g-accent);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:10px}
.jny .mc h3{margin:0;font-size:17px}
.jny .mc p{margin:0;font-size:15px;line-height:1.4}
.jny .chip{display:inline-block;padding:3px 8px;border-radius:8px;font-size:12px;font-weight:800;margin:2px;background:color-mix(in srgb,var(--g-fg) 14%,transparent)}
.jny .chip.up{color:var(--g-good)}.jny .chip.dn{color:var(--g-danger)}
.jny .shop{display:flex;align-items:center;gap:8px}
.jny .shop .grow{flex:1;font-weight:700;font-size:14px}
`

const PACE = [{ n: 'Slow', d: 12, h: 0.6, w: 0.8, m: 0.3 }, { n: 'Steady', d: 18, h: 0, w: 1, m: 0 }, { n: 'Grueling', d: 26, h: -1.4, w: 1.3, m: -0.6 }]
const RATION = [{ n: 'Meager', f: 0.6, h: -0.5, m: -0.4 }, { n: 'Normal', f: 1, h: 0, m: 0 }, { n: 'Hearty', f: 1.5, h: 0.5, m: 0.5 }]
const BG: Record<string, string> = {
  trail: 'linear-gradient(#7dd3fc,#bbf7d0 60%,#86a860 61%)',
  desert: 'linear-gradient(#fdba74,#fde68a 60%,#d9a441 61%)',
  sea: 'linear-gradient(#7dd3fc,#38bdf8 55%,#0369a1 56%)',
  space: 'linear-gradient(#020617,#1e1b4b)',
  waste: 'linear-gradient(#a8a29e,#d6b88a 60%,#78716c 61%)',
  arctic: 'linear-gradient(#bae6fd,#f0f9ff 60%,#e0f2fe 61%)',
}

const engine: Engine = {
  start(env) {
    const { theme: th, rng } = env
    const kind = pickKind(`${env.name} ${env.desc}`, th.id)
    const fl = JFLAVORS[kind]
    const harsh = byDiff(env, 0.8, 1, 1.25)
    const legs = byDiff(env, 8, 10, 12)
    const evChance = 0.2 * Math.sqrt(harsh)

    const root = createDom(env.host, th, 'jny')
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
    const btn = (label: string, parent: HTMLElement, fn: () => void, cls = 'b') => {
      const b = el('button', cls, label, parent)
      b.type = 'button'
      b.addEventListener('click', fn)
      return b
    }

    // ---- state ----
    const heroes = [th.hero, ...th.heroes.filter((h) => h !== th.hero)]
    const nameBag = rng.shuffle([...fl.names])
    interface Mem { name: string; e: string; hp: number; sick: boolean; alive: boolean }
    const party: Mem[] = Array.from({ length: 4 }, (_, i) => ({ name: nameBag[i], e: i === 0 ? th.hero : heroes[(i * 2) % heroes.length], hp: 100, sick: false, alive: true }))
    let food = byDiff(env, 210, 180, 150)
    let water = byDiff(env, 170, 145, 125)
    let money = byDiff(env, 200, 150, 110)
    let meds = 2
    let morale = 70
    let day = 1
    let leg = 0
    let prog = 0
    let pace = 1
    let ration = 1
    let running = false
    let over = false
    let paused = false
    let modalOpen = false
    let acc = 0
    const seen: string[] = []
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const later = (fn: () => void, ms: number) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id) }
    const logs: string[] = [`${fl.intro} ${legs} legs to ${fl.to}.`]

    // ---- UI ----
    const sc = el('div', 'sc', '', root)
    const w = el('div', 'w', '', sc)
    const head = el('div', 'card', '', w)
    const top = el('div', 'top', '', head)
    const topL = el('span', '', '', top)
    const topR = el('span', 'sub', '', top)
    const map = el('div', 'map', '', head)
    const track = el('div', 'track', '', map)
    const fill = el('div', 'fill', '', track)
    for (let i = 1; i <= legs; i++) {
      const s = el('div', 'stop', i === legs ? '🏁' : '🏘️', map)
      s.style.left = `${(i / legs) * 100}%`
      s.dataset.i = String(i)
    }
    const me = el('div', 'me', fl.vEmoji, map)
    const scene = el('div', 'scene', '', w)
    scene.style.background = BG[kind]
    const bg = el('div', 'bg', '', scene)
    bg.style.backgroundImage = kind === 'space'
      ? 'radial-gradient(circle,#fff 1px,transparent 1.5px),radial-gradient(circle,#fff 1px,transparent 1.5px)'
      : 'repeating-linear-gradient(90deg,transparent 0 30px,rgba(0,0,0,.12) 30px 34px)'
    bg.style.backgroundPosition = '0 0,40px 30px'
    el('span', '', th.hero, scene)
    el('span', 'v', fl.vEmoji, scene)
    el('span', '', kind === 'sea' ? '🌊' : kind === 'space' ? '✨' : kind === 'desert' ? '🌵' : kind === 'waste' ? '☢️' : kind === 'arctic' ? '❄️' : '🌲', scene)
    const partyBox = el('div', 'party', '', w)
    const memUi = party.map((m) => {
      const c = el('div', 'mem', '', partyBox)
      el('div', 'e', m.e, c)
      const mid = el('div', '', '', c)
      mid.style.minWidth = '0'
      mid.style.flex = '1'
      const n = el('div', 'n', m.name, mid)
      const hb = el('div', 'hpb', '', mid)
      const hi = el('i', '', '', hb)
      const st = el('div', 'st', '', mid)
      const med = el('button', '', '💊', c)
      med.type = 'button'
      med.style.cssText = 'display:none;border:0;background:var(--g-accent);border-radius:8px;min-width:34px;min-height:34px;cursor:pointer'
      med.addEventListener('click', () => useMed(m))
      return { c, n, hi, st, med }
    })
    const resBox = el('div', 'res', '', w)
    const mk = (label: string) => { const r = el('div', 'r', '', resBox); const num = el('span', '', '', r); const s = el('small', '', label, r); return { r, s, num } }
    const rFood = mk(fl.F)
    const rWater = mk(fl.W)
    const rMoney = mk(fl.$)
    const rMeds = mk('medicine')
    const rMorale = mk('morale')
    const ctl = el('div', 'card', '', w)
    const rowP = el('div', 'row', '', ctl)
    el('span', 'lab', 'Pace', rowP)
    const pBtns = PACE.map((p, i) => btn(p.n, rowP, () => { pace = i; render() }))
    const rowR = el('div', 'row', '', ctl)
    rowR.style.marginTop = '6px'
    el('span', 'lab', 'Rations', rowR)
    const rBtns = RATION.map((p, i) => btn(p.n, rowR, () => { ration = i; render() }))
    const rowA = el('div', 'row', '', ctl)
    rowA.style.marginTop = '6px'
    const goBtn = btn('▶ Travel', rowA, () => toggleRun(), 'b go')
    btn('🛏 Rest day', rowA, () => dayAction('rest'))
    btn('🧺 Forage', rowA, () => dayAction('forage'))
    const logBox = el('div', 'card log', '', w)

    const fmtN = (n: number) => String(Math.floor(n))
    const alive = () => party.filter((m) => m.alive)
    const total = () => (leg * 100 + prog) / (legs * 100)

    const render = () => {
      const town = leg < legs ? fl.towns[leg % fl.towns.length] : fl.to
      topL.textContent = `Leg ${Math.min(leg + 1, legs)}/${legs} → ${town}`
      topR.textContent = `Day ${day} · ${Math.floor(prog)}%`
      const pct = Math.min(100, total() * 100)
      fill.style.width = `${pct}%`
      me.style.left = `${pct}%`
      map.querySelectorAll<HTMLElement>('.stop').forEach((s) => s.classList.toggle('done', Number(s.dataset.i) <= leg))
      scene.classList.toggle('run', running)
      party.forEach((m, i) => {
        const u = memUi[i]
        u.c.classList.toggle('dead', !m.alive)
        u.hi.style.width = `${Math.max(0, m.hp)}%`
        u.hi.style.background = m.hp > 55 ? 'var(--g-good)' : m.hp > 25 ? '#facc15' : 'var(--g-danger)'
        u.st.textContent = !m.alive ? 'Lost' : m.sick ? `Sick (${fl.disease})` : m.hp < 40 ? 'Weak' : 'Healthy'
        u.med.style.display = m.alive && m.sick && meds > 0 ? '' : 'none'
      })
      const n = Math.max(1, alive().length)
      rFood.num.textContent = `${fmtN(food)}`
      rWater.num.textContent = `${fmtN(water)}`
      rMoney.num.textContent = `${fmtN(money)}`
      rMeds.num.textContent = `${meds}`
      rMorale.num.textContent = `${fmtN(morale)}`
      rFood.s.textContent = `${fl.fIcon} ${fl.F} (${fmtN(food / (n * RATION[ration].f))}d)`
      rWater.s.textContent = `${fl.wIcon} ${fl.W} (${fmtN(water / (n * 0.8 * PACE[pace].w))}d)`
      rMoney.s.textContent = `🪙 ${fl.$}`
      rMeds.s.textContent = '💊 medicine'
      rMorale.s.textContent = '😊 morale'
      rFood.r.classList.toggle('low', food < n * 3)
      rWater.r.classList.toggle('low', water < n * 3)
      rMorale.r.classList.toggle('low', morale < 20)
      pBtns.forEach((b, i) => b.classList.toggle('on', i === pace))
      rBtns.forEach((b, i) => b.classList.toggle('on', i === ration))
      goBtn.textContent = running ? '⏸ Stop' : '▶ Travel'
      logBox.textContent = ''
      logs.slice(-4).reverse().forEach((l) => el('div', '', l, logBox))
      env.score(score())
      env.status(`Day ${day} · Leg ${Math.min(leg + 1, legs)}/${legs} · ${alive().length} alive`)
    }
    const score = () => Math.floor(total() * 1000) + alive().length * 100
    const say = (s: string) => { logs.push(s); if (logs.length > 30) logs.shift() }

    // ---- modal ----
    let modalEl: HTMLElement | null = null
    const openModal = (build: (box: HTMLElement) => void) => {
      closeModal()
      modalOpen = true
      running = false
      const m = el('div', 'modal', '', root)
      el('div', 'mb', '', m)
      const box = el('div', 'mc', '', m)
      build(box)
      modalEl = m
      render()
    }
    const closeModal = () => { modalEl?.remove(); modalEl = null; modalOpen = false }

    // ---- rules ----
    const die = (m: Mem, why: string) => {
      m.alive = false
      m.hp = 0
      morale = Math.max(0, morale - 15)
      say(`${m.name} has died of ${why}.`)
      env.sfx('lose')
    }
    const useMed = (m: Mem) => {
      if (meds <= 0 || !m.sick || !m.alive) return
      meds--
      m.sick = false
      m.hp = Math.min(100, m.hp + 15)
      say(`${m.name} takes medicine and feels better.`)
      env.sfx('power')
      render()
    }

    const checkEnd = () => {
      if (over) return true
      if (!alive().length) {
        over = true
        running = false
        const sc = score()
        env.sfx('lose')
        closeModal()
        openModal((b) => { el('h3', '', '💀 The journey ends', b); el('p', '', `The whole party was lost on day ${day}, ${Math.floor(total() * 100)}% of the way to ${fl.to}.`, b) })
        env.score(sc)
        later(() => env.end({ score: sc, won: false, text: `Lost everyone after ${day} days (${Math.floor(total() * 100)}% of the way)` }), 1800)
        return true
      }
      return false
    }

    /** One day of consumption. travel: also moves. returns nothing. */
    const dayStep = (mode: 'travel' | 'rest' | 'idle') => {
      day++
      const al = alive()
      const n = al.length
      const p = PACE[pace]
      const r = RATION[ration]
      const wMul = mode === 'travel' ? p.w : 0.8
      const fUse = n * r.f * Math.sqrt(harsh)
      const wUse = n * 0.8 * wMul * Math.sqrt(harsh)
      let hungry = false
      let thirsty = false
      if (food >= fUse) food -= fUse; else { food = 0; hungry = true }
      if (water >= wUse) water -= wUse; else { water = 0; thirsty = true }
      let dm = r.m + (mode === 'travel' ? p.m : mode === 'rest' ? 2 : 0)
      if (hungry) dm -= 2
      if (thirsty) dm -= 2.5
      morale = Math.max(0, Math.min(100, morale + dm))
      for (const m of al) {
        let dh = r.h + (mode === 'travel' ? p.h : mode === 'rest' ? 3.5 : 0.4)
        if (m.sick) dh -= 2.6 * Math.sqrt(harsh)
        if (hungry) dh -= 5
        if (thirsty) dh -= 7
        if (morale < 15) dh -= 0.5
        m.hp = Math.min(100, m.hp + dh)
        if (m.sick && mode === 'rest' && rng.chance(0.3)) { m.sick = false; say(`${m.name} shakes off the ${fl.disease}.`) }
        if (!m.sick && rng.chance(0.011 * harsh * (pace === 2 && mode === 'travel' ? 1.6 : 1) * (thirsty ? 3 : 1))) { m.sick = true; say(`${m.name} comes down with ${fl.disease}.`); env.sfx('hit') }
        if (m.hp <= 0) die(m, hungry ? 'hunger' : thirsty ? 'thirst' : m.sick ? fl.disease : 'exhaustion')
      }
      if (hungry) say(`Out of ${fl.F}! Everyone is going hungry.`)
      if (thirsty) say(`Out of ${fl.W}! Everyone is suffering.`)
      if (morale < 15 && alive().length > 1 && rng.chance(0.04)) {
        const m = rng.pick(alive())
        m.alive = false
        m.hp = 0
        say(`${m.name} has had enough and left the ${fl.V}.`)
        morale += 8
      }
      if (mode === 'travel') prog += p.d
    }

    const arrive = () => {
      while (prog >= 100) {
        prog -= 100
        leg++
        if (leg >= legs) { win(); return }
        say(`Arrived at ${fl.towns[(leg - 1) % fl.towns.length]}.`)
        env.sfx('point')
        town(leg - 1)
        prog = 0
        return
      }
    }
    const win = () => {
      over = true
      running = false
      const sc = score() + Math.max(0, 80 - day) * 8 + Math.floor((food + water) / 4) + Math.floor(money / 2)
      env.score(sc)
      env.sfx('win')
      openModal((b) => {
        el('h3', '', `🏁 You reached ${fl.to}!`, b)
        el('p', '', `${alive().length} of ${party.length} survived the trip in ${day} days.`, b)
      })
      render()
      later(() => env.end({ score: sc, won: true, text: `Reached ${fl.to} in ${day} days with ${alive().length} survivors` }), 1800)
    }

    // ---- towns ----
    const town = (i: number) => {
      const tn = fl.towns[i % fl.towns.length]
      const pf = rng.range(0.85, 1.5)
      const pw = rng.range(0.7, 1.3)
      const pm = Math.round(rng.range(12, 22))
      openModal((b) => {
        el('h3', '', `🏘️ ${tn}`, b)
        const info = el('p', 'sub', '', b)
        const rows: (() => void)[] = []
        const shop = (label: string, price: number, qty: number, give: () => void, avail = () => true) => {
          const r = el('div', 'shop', '', b)
          const t = el('div', 'grow', '', r)
          const buy = btn('Buy', r, () => {
            const cost = Math.ceil(price * qty)
            if (money < cost || !avail()) return
            money -= cost
            give()
            env.sfx('point')
            refresh()
          })
          const sell = btn('Sell', r, () => {
            const g = label.startsWith('Food') ? food : water
            if (label.startsWith('Med') || g < qty) return
            if (label.startsWith('Food')) food -= qty; else water -= qty
            money += Math.floor(price * qty * 0.45)
            env.sfx('click')
            refresh()
          })
          sell.style.flex = '0 0 auto'
          buy.style.flex = '0 0 auto'
          if (label.startsWith('Med')) sell.style.display = 'none'
          rows.push(() => {
            t.textContent = `${label} x${qty} · ${Math.ceil(price * qty)}🪙`
            buy.disabled = money < Math.ceil(price * qty)
          })
        }
        shop(`Food (${fl.F})`, pf, 10, () => { food += 10 })
        shop(`${fl.W[0].toUpperCase()}${fl.W.slice(1)}`, pw, 10, () => { water += 10 })
        shop('Medicine', pm, 1, () => { meds++ })
        const act = el('div', 'row', '', b)
        btn('🛏 Rest 2 days', act, () => { for (let k = 0; k < 2; k++) dayStep('rest'); say(`Rested two days in ${tn}.`); if (!checkEnd()) refresh() })
        btn('🔨 Work a day (+12)', act, () => { dayStep('idle'); const g = Math.round(rng.range(9, 16)); money += g; say(`Odd jobs in ${tn}: +${g} ${fl.$}.`); if (!checkEnd()) refresh() })
        btn('Leave town ▶', b, () => { closeModal(); say(`Leaving ${tn}.`); render() }, 'b go')
        const refresh = () => {
          info.textContent = `${fl.$}: ${fmtN(money)} · ${fl.F}: ${fmtN(food)} · ${fl.W}: ${fmtN(water)} · medicine: ${meds} · Day ${day}`
          rows.forEach((f) => f())
          render()
        }
        refresh()
      })
    }

    // ---- events ----
    const fill_ = (s: string, M: string, M2: string) => s.replace(/\{M2\}/g, M2).replace(/\{M\}/g, M).replace(/\{V\}/g, fl.V).replace(/\{F\}/g, fl.F).replace(/\{W\}/g, fl.W).replace(/\{\$\}/g, fl.$)
    const applyDelta = (d: D, M: Mem): string[] => {
      const chips: string[] = []
      const chip = (s: string, good: boolean) => chips.push(`${good ? '▲' : '▼'} ${s}`)
      const neg = (x: number) => (x < 0 ? x * harsh : x)
      if (d.f) { const v = Math.round(neg(d.f)); food = Math.max(0, food + v); chip(`${Math.abs(v)} ${fl.F}`, v > 0) }
      if (d.w) { const v = Math.round(neg(d.w)); water = Math.max(0, water + v); chip(`${Math.abs(v)} ${fl.W}`, v > 0) }
      if (d.$) { const v = Math.round(neg(d.$)); money = Math.max(0, money + v); chip(`${Math.abs(v)} ${fl.$}`, v > 0) }
      if (d.m) { morale = Math.max(0, Math.min(100, morale + d.m)); chip(`${Math.abs(d.m)} morale`, d.m > 0) }
      if (d.h) { const v = Math.round(neg(d.h)); for (const m of alive()) m.hp = Math.min(100, m.hp + v); chip(`${Math.abs(v)} party health`, v > 0) }
      if (d.hit && M.alive) { const v = Math.round(d.hit * harsh); M.hp -= v; chip(`${M.name} -${v} hp`, false) }
      if (d.sick && M.alive && !M.sick) { M.sick = true; chip(`${M.name} is sick`, false) }
      if (d.med) { meds += d.med; chip(`${d.med} medicine`, true) }
      if (d.dist) { prog = Math.max(0, prog + d.dist); chip(`${Math.abs(d.dist)} progress`, d.dist > 0) }
      if (d.day) { chip(`${d.day} day${d.day > 1 ? 's' : ''} lost`, false); for (let k = 0; k < d.day; k++) dayStep('idle') }
      for (const m of alive()) if (m.hp <= 0) die(m, 'injuries')
      return chips
    }
    const showEvent = (e: Ev) => {
      const al = alive()
      const M = rng.pick(al)
      const M2 = al.length > 1 ? rng.pick(al.filter((x) => x !== M)) : M
      openModal((b) => {
        el('h3', '', `${M.e} ${M.name}`, b)
        el('p', '', fill_(e.text, M.name, M2.name), b)
        for (const c of e.ch) {
          const cost = c.need ?? 0
          const bt = btn(`${fill_(c.label, M.name, M2.name)}${cost ? ` (${cost}🪙)` : ''}`, b, () => resolve(c, M, M2))
          bt.disabled = money < cost
        }
      })
    }
    const resolve = (c: Ch, M: Mem, M2: Mem) => {
      let r = rng() * c.outs.reduce((s, o) => s + o[0], 0)
      let out = c.outs[0]
      for (const o of c.outs) { r -= o[0]; if (r <= 0) { out = o; break } }
      const chips = applyDelta(out[2], M)
      const msg = fill_(out[1], M.name, M2.name)
      say(msg)
      const bad = chips.filter((x) => x.startsWith('▼')).length
      env.sfx(bad > chips.length / 2 ? 'hit' : 'point')
      openModal((b) => {
        el('p', '', msg, b)
        const cc = el('div', '', '', b)
        for (const ch of chips) el('span', `chip ${ch.startsWith('▲') ? 'up' : 'dn'}`, ch, cc)
        btn('Continue', b, () => {
          closeModal()
          if (checkEnd()) return
          if (prog >= 100) arrive()
          render()
        }, 'b go')
      })
    }
    const nextEvent = (): Ev => {
      const pool = fl.events.filter((e) => !seen.includes(e.id))
      const e = pool.length ? rng.pick(pool) : rng.pick(fl.events)
      seen.push(e.id)
      if (seen.length > fl.events.length - 6) seen.shift()
      return e
    }

    // ---- actions ----
    const dayAction = (kind: 'rest' | 'forage') => {
      if (modalOpen || over) return
      running = false
      if (kind === 'rest') { dayStep('rest'); say('A day of rest. Everyone feels a little better.') } else {
        dayStep('idle')
        const gain = Math.round(rng.range(4, 16) * (1 / Math.sqrt(harsh)))
        if (rng.chance(0.15)) { const M = rng.pick(alive()); M.hp -= 8; say(`${M.name} gets scratched while foraging, but finds ${gain} ${fl.F}.`) } else say(`Foraged ${gain} ${fl.F}.`)
        food += gain
        env.sfx('jump')
      }
      if (!checkEnd()) render()
    }
    const toggleRun = () => {
      if (modalOpen || over) return
      running = !running
      render()
    }
    const travelDay = () => {
      dayStep('travel')
      if (checkEnd()) return
      if (prog >= 100) { arrive(); render(); return }
      if (rng.chance(evChance)) showEvent(nextEvent())
      render()
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); toggleRun() }
      else if (e.code === 'Digit1') { pace = 0; render() } else if (e.code === 'Digit2') { pace = 1; render() } else if (e.code === 'Digit3') { pace = 2; render() }
      else if (e.code === 'KeyR') dayAction('rest')
    }
    window.addEventListener('keydown', onKey)

    let raf = 0
    let last = performance.now()
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      if (!running || paused || modalOpen || over) return
      acc += dt
      if (acc >= 0.45) { acc = 0; travelDay() }
    }
    raf = requestAnimationFrame(frame)
    render()
    return {
      destroy() {
        cancelAnimationFrame(raf)
        for (const t of timers) clearTimeout(t)
        window.removeEventListener('keydown', onKey)
        style.remove()
        root.remove()
      },
      pause(p) { paused = p; last = performance.now() },
    }
  },
}
export default engine
