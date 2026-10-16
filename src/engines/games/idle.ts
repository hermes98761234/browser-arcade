// Idle / tycoon: classic clicker (producers, upgrades, goals, prestige) plus farm, trade and shop sub-modes.
import { byDiff, createDom, type Engine } from '../kit'
import { fmt, MENUS, CROPS, GOODS, pickFlavor, pickMode, pickTable, type Mode } from '../logic/idle'
import { Econ, type Upg } from '../logic/idleEcon'
import { Market } from '../logic/idleTrade'

const CSS = `
.idl{font-family:system-ui,sans-serif;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;user-select:none;-webkit-user-select:none}
.idl *{box-sizing:border-box}
.idl .hd{display:flex;align-items:center;gap:14px;padding:8px 14px;border-radius:12px;background:color-mix(in srgb,var(--g-fg) 13%,transparent);flex-wrap:wrap}
.idl .big{font-size:26px;font-weight:800;line-height:1.1}
.idl .sub{font-size:13px;opacity:.75}
.idl .bar{height:9px;border-radius:6px;background:color-mix(in srgb,var(--g-fg) 15%,transparent);overflow:hidden;min-width:60px}
.idl .bar>i{display:block;height:100%;background:var(--g-accent);transition:width .2s}
.idl .btn{border:1px solid color-mix(in srgb,var(--g-fg) 22%,transparent);background:color-mix(in srgb,var(--g-fg) 9%,transparent);color:var(--g-fg);border-radius:10px;padding:7px 11px;font:inherit;font-size:14px;cursor:pointer;text-align:left}
.idl .btn:hover:not(:disabled){background:color-mix(in srgb,var(--g-fg) 18%,transparent)}
.idl .btn:disabled{opacity:.42;cursor:default}
.idl .btn.on{background:var(--g-accent);color:#111;border-color:transparent}
.idl .btn.good{background:var(--g-good);color:#111;border-color:transparent;font-weight:700}
.idl .card{background:color-mix(in srgb,var(--g-fg) 10%,transparent);border-radius:12px;padding:10px;min-width:0}
.idl .cols{display:grid;grid-template-columns:minmax(190px,.8fr) 1.7fr;gap:8px;align-items:start}
@media (max-width:640px){.idl .cols{grid-template-columns:1fr}.idl .btn{min-height:40px}.idl .ttl{display:none}.idl .hd{gap:8px;padding:6px 10px}.idl .big{font-size:22px}.idl .gbx{min-width:100%}}
.idl .row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.idl .grow{flex:1;min-width:0}
.idl .tabs{display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap}
.idl .hero{width:130px;height:130px;border-radius:50%;border:3px solid var(--g-accent);background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--g-fg) 25%,transparent),color-mix(in srgb,var(--g-fg) 8%,transparent));font-size:70px;line-height:1;cursor:pointer;display:grid;place-items:center;margin:6px auto;box-shadow:0 0 28px color-mix(in srgb,var(--g-accent) 50%,transparent);transition:transform .07s;padding:0}
.idl .hero:active,.idl .hero.p{transform:scale(.92)}
.idl .fl{position:absolute;pointer-events:none;font-weight:800;color:var(--g-accent2);animation:idlfl .9s ease-out forwards;text-shadow:0 1px 3px #000;z-index:4}
@keyframes idlfl{to{transform:translateY(-60px);opacity:0}}
.idl .gold{position:absolute;z-index:6;font-size:44px;cursor:pointer;border:0;background:none;animation:idlg 1s ease-in-out infinite alternate;filter:drop-shadow(0 0 10px gold)}
@keyframes idlg{to{transform:scale(1.2) rotate(8deg)}}
.idl .toast{position:absolute;left:50%;top:70px;transform:translateX(-50%);background:var(--g-accent);color:#111;font-weight:800;padding:8px 16px;border-radius:12px;z-index:8;pointer-events:none;animation:idlt 2.6s forwards;white-space:nowrap}
@keyframes idlt{0%{opacity:0;top:50px}10%{opacity:1;top:70px}85%{opacity:1}100%{opacity:0}}
.idl .modal{position:absolute;inset:0;background:rgba(0,0,0,.65);display:grid;place-items:center;z-index:9}
.idl .modal>div{background:var(--g-bg2);border:2px solid var(--g-accent);border-radius:16px;padding:22px 26px;text-align:center;max-width:380px}
.idl .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}
.idl .plot{height:92px;border-radius:12px;border:2px solid color-mix(in srgb,var(--g-fg) 20%,transparent);background:rgba(120,80,40,.45);cursor:pointer;position:relative;display:grid;place-items:center;font-size:38px;padding:0;color:var(--g-fg)}
.idl .plot.rdy{border-color:var(--g-good);box-shadow:0 0 14px var(--g-good);animation:idlg 0.8s infinite alternate}
.idl .plot small{position:absolute;bottom:3px;left:0;right:0;text-align:center;font-size:11px}
.idl .cust{width:112px;min-height:150px;border-radius:12px;border:2px solid color-mix(in srgb,var(--g-fg) 20%,transparent);background:color-mix(in srgb,var(--g-fg) 10%,transparent);cursor:pointer;padding:6px;text-align:center;color:var(--g-fg);font:inherit}
.idl .cust.empty{opacity:.25;cursor:default;display:grid;place-items:center}
.idl .cust .face{font-size:38px}
.idl .cust .ord{font-size:26px;margin:4px 0}
.idl .tray{min-height:48px;border:2px dashed color-mix(in srgb,var(--g-fg) 30%,transparent);border-radius:12px;padding:6px 10px;font-size:30px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
`

const rand = (a: number, b: number) => a + Math.random() * (b - a)

interface Mode_ {
  root: HTMLElement
  tick(dt: number): void
  money(): number
  /** Value compared with the goal. */
  progress(): number
  rate(): string
  head: string
  refresh?(): void
}

const engine: Engine = {
  start(env) {
    const { theme: th } = env
    const info = `${env.name} ${env.desc}`
    const mode: Mode = pickMode(info, env.mods)
    const flavor = pickFlavor(info)
    const root = createDom(env.host, th, 'idl')
    const style = document.createElement('style')
    style.textContent = CSS
    document.head.appendChild(style)
    root.classList.add('idl')
    root.style.position = 'absolute'
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const later = (fn: () => void, ms: number) => {
      const id = setTimeout(() => { timers.delete(id); fn() }, ms)
      timers.add(id)
    }
    const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = '', parent?: HTMLElement): HTMLElementTagNameMap[K] => {
      const e = document.createElement(tag)
      if (cls) e.className = cls
      if (text) e.textContent = text
      parent?.appendChild(e)
      return e
    }
    const btn = (text: string, parent: HTMLElement, fn: () => void, cls = 'btn') => {
      const b = el('button', cls, text, parent)
      b.type = 'button'
      b.addEventListener('click', fn)
      return b
    }

    const goal = byDiff(env, ...({ idle: [3e5, 2e6, 1e7], farm: [3000, 8000, 20000], trade: [2500, 4500, 8000], shop: [700, 1200, 2000] }[mode] as [number, number, number]))
    const toast = (s: string) => {
      const t = el('div', 'toast', s, root)
      later(() => t.remove(), 2700)
    }

    // ---------- header ----------
    const hd = el('div', 'hd', '', root)
    const moneyBox = el('div', '', '', hd)
    const moneyEl = el('div', 'big', '', moneyBox)
    const rateEl = el('div', 'sub', '', moneyBox)
    const gbox = el('div', 'grow gbx', '', hd)
    const goalLbl = el('div', 'sub', '', gbox)
    const goalBar = el('div', 'bar', '', gbox)
    const goalFill = el('i', '', '', goalBar)
    const finishBtn = btn('🏆 Finish', hd, () => finish(), 'btn good')
    finishBtn.style.display = 'none'
    const body = el('div', '', '', root)

    let reached = false
    let finishing = false
    const goalNow = goal
    const finish = () => {
      if (finishing) return
      finishing = true
      const sc = Math.floor(m.progress())
      env.score(sc)
      env.sfx('win')
      env.end({ score: sc, won: true, text: `Reached the goal of ${fmt(goal)}` })
    }
    const goalModal = () => {
      const md = el('div', 'modal', '', root)
      const box = el('div', '', '', md)
      el('div', 'big', '🏆 Goal reached!', box)
      el('p', '', `You hit ${fmt(goal)}. Claim the win now, or keep building.`, box)
      const r = el('div', 'row', '', box)
      r.style.justifyContent = 'center'
      btn('Claim win', r, () => { md.remove(); finish() }, 'btn good')
      btn('Keep playing', r, () => { md.remove(); finishBtn.style.display = '' })
    }

    // ---------- classic ----------
    const classic = (): Mode_ => {
      const names = flavor.prod.map((p) => p[0])
      const ec = new Econ(names, flavor.unit)
      const r = el('div', 'cols')
      const left = el('div', 'card', '', r)
      left.style.position = 'relative'
      left.style.textAlign = 'center'
      const heroB = el('button', 'hero', th.hero, left)
      heroB.type = 'button'
      const perClick = el('div', 'sub', '', left)
      el('div', 'sub', `Tap ${th.hero} to earn ${flavor.unit}`, left).style.marginTop = '6px'
      const clickFx = (x: number, y: number, v: number) => {
        const f = el('div', 'fl', `+${fmt(v)}`, left)
        f.style.left = `${x}px`
        f.style.top = `${y}px`
        later(() => f.remove(), 900)
      }
      heroB.addEventListener('pointerdown', (e) => {
        const v = ec.click()
        env.sfx('click')
        const b = left.getBoundingClientRect()
        clickFx(e.clientX - b.left - 12, e.clientY - b.top - 20, v)
        heroB.classList.add('p')
        later(() => heroB.classList.remove('p'), 70)
        refreshTop()
      })
      heroB.addEventListener('keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); const v = ec.click(); env.sfx('click'); clickFx(60, 40, v) } })

      const right = el('div', 'card', '', r)
      const tabs = el('div', 'tabs', '', right)
      const panes: Record<string, HTMLElement> = {}
      let tab = 'prod'
      for (const [id, label] of [['prod', 'Producers'], ['upg', 'Upgrades'], ['goals', 'Goals'], ['pres', 'Prestige']]) {
        const b = btn(label, tabs, () => { tab = id; showTab() })
        b.dataset.tab = id
        panes[id] = el('div', '', '', right)
      }
      const showTab = () => {
        for (const [id, p] of Object.entries(panes)) p.style.display = id === tab ? '' : 'none'
        for (const b of tabs.children as unknown as HTMLElement[]) b.classList.toggle('on', b.dataset.tab === tab)
      }
      showTab()
      // producers
      let bulk = 1
      const bulkRow = el('div', 'row', '', panes.prod)
      const bulkBtns = [1, 10, 100, 0].map((n) => btn(n === 0 ? 'Max' : `x${n}`, bulkRow, () => { bulk = n; refreshProd() }))
      const prodRows = flavor.prod.map(([nm, em], i) => {
        const row = el('button', 'btn', '', panes.prod)
        row.type = 'button'
        row.style.cssText = 'display:flex;width:100%;gap:10px;align-items:center;margin-bottom:6px'
        el('span', '', em, row).style.fontSize = '28px'
        const mid = el('span', 'grow', '', row)
        const t1 = el('div', '', '', mid)
        t1.style.fontWeight = '700'
        const t2 = el('div', 'sub', '', mid)
        const cost = el('span', '', '', row)
        cost.style.fontWeight = '700'
        row.addEventListener('click', () => {
          const n = bulk === 0 ? ec.maxBuy(i) : bulk
          if (ec.buy(i, n)) { env.sfx('point'); refreshAll() }
        })
        return { row, t1, t2, cost, nm }
      })
      const refreshProd = () => {
        bulkBtns.forEach((b, j) => b.classList.toggle('on', [1, 10, 100, 0][j] === bulk))
        prodRows.forEach((p, i) => {
          const n = bulk === 0 ? Math.max(1, ec.maxBuy(i)) : bulk
          const c = ec.costOf(i, n)
          const unlocked = i === 0 || ec.earned >= ec.costOf(i, 1) * 0.3 || ec.count[i] > 0
          p.row.style.display = unlocked ? 'flex' : 'none'
          p.row.disabled = ec.money < c
          p.t1.textContent = `${p.nm}  ·  ${ec.count[i]}`
          p.t2.textContent = `+${fmt(ec.rateOf(i) / Math.max(1, ec.count[i]) || 0.4)}/s each · total ${fmt(ec.rateOf(i))}/s`
          p.cost.textContent = `${bulk === 0 ? `x${n} · ` : bulk > 1 ? `x${bulk} · ` : ''}${flavor.coin} ${fmt(c)}`
        })
      }
      // upgrades
      let upgKey = ''
      const refreshUpg = () => {
        const av = ec.available().slice(0, 10)
        const key = av.map((u) => u.id).join()
        if (key !== upgKey) {
          upgKey = key
          panes.upg.textContent = ''
          if (!av.length) el('div', 'sub', 'No upgrades yet. Buy more producers and keep earning!', panes.upg)
          for (const u of av) {
            const b = el('button', 'btn', '', panes.upg)
            b.type = 'button'
            b.dataset.id = u.id
            b.style.cssText = 'display:flex;width:100%;gap:10px;align-items:center;margin-bottom:6px'
            const mid = el('span', 'grow', '', b)
            el('div', '', u.name, mid).style.fontWeight = '700'
            el('div', 'sub', u.desc, mid)
            el('span', '', `${flavor.coin} ${fmt(u.cost)}`, b).style.fontWeight = '700'
            b.addEventListener('click', () => buyUpg(u))
          }
        }
        for (const b of panes.upg.querySelectorAll<HTMLButtonElement>('button')) {
          const u = av.find((x) => x.id === b.dataset.id)
          if (u) b.disabled = ec.money < u.cost
        }
      }
      const buyUpg = (u: Upg) => {
        if (ec.buyUpgrade(u)) { env.sfx('power'); refreshAll() }
      }
      // goals
      const goalRows = ec.goals.map(() => el('div', 'row', '', panes.goals))
      const refreshGoals = () => {
        ec.goals.forEach((g, i) => {
          const d = ec.goalsDone.has(g.id)
          goalRows[i].textContent = `${d ? '✅' : '⬜'} ${g.name}${d ? '  (+3% income)' : ''}`
          goalRows[i].style.opacity = d ? '1' : '.65'
        })
      }
      // prestige
      el('p', 'sub', 'Prestige resets money, producers and upgrades, but each Legacy point gives +30% income forever. Goals are kept.', panes.pres)
      const presInfo = el('div', 'big', '', panes.pres)
      const presBtn = btn('Prestige', panes.pres, () => {
        const g = ec.prestige()
        if (g) { env.sfx('win'); toast(`Prestige! +${g} legacy`); refreshAll() }
      }, 'btn good')
      presBtn.style.marginTop = '10px'
      const refreshPres = () => {
        const g = ec.prestigeGain()
        presInfo.textContent = `Legacy ${ec.pp}  ·  +${g} available`
        presBtn.disabled = g < 1
        presBtn.textContent = g < 1 ? `Earn ${fmt(1e5)} this run to prestige` : `Prestige for +${g} legacy`
      }

      const refreshTop = () => {
        perClick.textContent = `${fmt(ec.clickValue())} per tap`
      }
      const refreshAll = () => {
        refreshTop(); refreshProd(); refreshUpg(); refreshGoals(); refreshPres()
        for (const g of ec.checkGoals()) { toast(`🎯 ${g.name}`); env.sfx('power') }
      }
      refreshAll()
      let acc = 0
      let goldT = rand(40, 70)
      return {
        root: r,
        head: flavor.coin,
        tick(dt) {
          ec.tick(dt)
          acc += dt
          goldT -= dt
          if (goldT <= 0) {
            goldT = rand(50, 90)
            const g = el('button', 'gold', '🌟', root)
            g.style.left = `${rand(10, 80)}%`
            g.style.top = `${rand(30, 80)}%`
            g.addEventListener('click', () => {
              const v = Math.max(ec.cps() * 60, ec.clickValue() * 40, 10)
              ec.gain(v)
              toast(`🌟 Lucky! +${fmt(v)}`)
              env.sfx('power')
              g.remove()
            })
            later(() => g.remove(), 12000)
          }
          if (acc > 0.25) { acc = 0; refreshAll() }
        },
        money: () => ec.money,
        progress: () => ec.earned,
        rate: () => `${fmt(ec.cps())} ${flavor.unit}/s`,
        refresh: refreshAll,
      }
    }

    // ---------- farm ----------
    const farm = (): Mode_ => {
      const crops = pickTable(CROPS, info)
      const GROW = [8, 15, 26, 42, 65]
      const SEED = [2, 6, 16, 42, 105]
      const SELL = [5, 14, 37, 95, 240]
      const UNLOCK = [0, 40, 180, 700, 2500]
      let money = 30
      let earned = 0
      let sel = 0
      let ferts = 0
      let sellLv = 0
      let auto = 0
      let autoT = 0
      const price = SELL.map(() => 1)
      const inv = SELL.map(() => 0)
      const plots: { c: number; t: number }[] = Array.from({ length: 4 }, () => ({ c: -1, t: 0 }))
      let priceT = 12
      const growT = (c: number) => GROW[c] * 0.85 ** ferts
      const r = el('div', 'cols')
      const left = el('div', 'card', '', r)
      el('div', 'sub', 'SEEDS (pick, then tap a plot)', left)
      const seedBtns = crops.map(([nm, em], i) => {
        const b = btn('', left, () => { if (earned >= UNLOCK[i]) { sel = i; env.sfx('click'); refresh() } })
        b.style.cssText += ';display:block;width:100%;margin-top:6px'
        return { b, nm, em }
      })
      el('div', 'sub', 'BARN', left).style.marginTop = '12px'
      const barn = el('div', '', '', left)
      barn.style.fontSize = '14px'
      const sellAll = btn('Sell all', left, () => doSell(), 'btn good')
      sellAll.style.cssText += ';margin-top:8px;width:100%'
      const right = el('div', 'card', '', r)
      const grid = el('div', 'grid', '', right)
      let plotEls: HTMLButtonElement[] = []
      const buildPlots = () => {
        grid.textContent = ''
        plotEls = plots.map((_p, i) => {
          const b = el('button', 'plot', '', grid)
          b.type = 'button'
          el('span', '', '', b)
          el('small', '', '', b)
          b.addEventListener('click', () => poke(i))
          return b
        })
      }
      buildPlots()
      el('div', 'sub', 'UPGRADES', right).style.margin = '12px 0 4px'
      const upBox = el('div', '', '', right)
      const mkUp = (label: () => string, cost: () => number, buy: () => void, show: () => boolean = () => true) => {
        const b = btn('', upBox, () => { if (money >= cost()) { money -= cost(); buy(); env.sfx('power'); refresh() } })
        b.style.cssText += ';display:block;width:100%;margin-bottom:6px'
        return { b, label, cost, show }
      }
      const ups = [
        mkUp(() => `🌱 Fertilizer (grow -15%) lv${ferts}`, () => Math.round(80 * 2.8 ** ferts), () => ferts++, () => ferts < 5),
        mkUp(() => `🟫 New plot (${plots.length}/12)`, () => Math.round(40 * 1.55 ** (plots.length - 4)), () => { plots.push({ c: -1, t: 0 }); buildPlots() }, () => plots.length < 12),
        mkUp(() => `🪣 Better stall (sell +15%) lv${sellLv}`, () => Math.round(120 * 2.6 ** sellLv), () => sellLv++, () => sellLv < 5),
        mkUp(() => `🤖 Farmhand lv${auto} (harvest + replant)`, () => 350 * 3 ** auto, () => auto++, () => auto < 3),
      ]
      // orders
      el('div', 'sub', 'ORDERS (x2 pay)', right).style.margin = '12px 0 4px'
      const ordBox = el('div', '', '', right)
      interface Ord { c: number; n: number; t: number }
      const orders: Ord[] = []
      const newOrder = () => {
        const un = crops.map((_, i) => i).filter((i) => earned >= UNLOCK[i])
        const c = un[Math.floor(Math.random() * un.length)]
        orders.push({ c, n: 3 + Math.floor(Math.random() * 5), t: 120 })
      }
      const ordBtns: HTMLButtonElement[] = []
      for (let i = 0; i < 3; i++) {
        const b = btn('', ordBox, () => {
          const o = orders[i]
          if (!o || inv[o.c] < o.n) return
          inv[o.c] -= o.n
          const pay = Math.round(o.n * SELL[o.c] * 2)
          money += pay; earned += pay
          toast(`📦 Order filled +${fmt(pay)}`)
          env.sfx('point')
          orders.splice(i, 1)
          refresh()
        })
        b.style.cssText += ';display:block;width:100%;margin-bottom:6px'
        ordBtns.push(b)
      }
      const sellPrice = (c: number) => Math.round(SELL[c] * price[c] * (1 + 0.15 * sellLv))
      const doSell = () => {
        let tot = 0
        inv.forEach((n, c) => { tot += n * sellPrice(c); inv[c] = 0 })
        if (tot > 0) { money += tot; earned += tot; env.sfx('point'); toast(`+${fmt(tot)}`) }
        refresh()
      }
      const poke = (i: number) => {
        const p = plots[i]
        if (p.c >= 0 && p.t >= growT(p.c)) { inv[p.c]++; p.c = -1; p.t = 0; env.sfx('jump') } else if (p.c < 0) {
          if (earned < UNLOCK[sel] || money < SEED[sel]) { env.sfx('hit'); return }
          money -= SEED[sel]; p.c = sel; p.t = 0; env.sfx('click')
        }
        refresh()
      }
      const refresh = () => {
        seedBtns.forEach((s, i) => {
          const lock = earned < UNLOCK[i]
          s.b.classList.toggle('on', sel === i)
          s.b.disabled = lock
          s.b.textContent = lock ? `🔒 Earn ${fmt(UNLOCK[i])}` : `${s.em} ${s.nm}  ·  🪙${SEED[i]} → ${sellPrice(i)}  ·  ${growT(i).toFixed(0)}s`
        })
        barn.textContent = ''
        inv.forEach((n, c) => { if (n) el('div', '', `${crops[c][1]} ${crops[c][0]} x${n}  (${price[c] > 1.03 ? '▲' : price[c] < 0.97 ? '▼' : '•'} ${sellPrice(c)} each)`, barn) })
        if (!inv.some((n) => n)) barn.textContent = 'Empty'
        sellAll.disabled = !inv.some((n) => n)
        plots.forEach((p, i) => {
          const b = plotEls[i]
          const rdy = p.c >= 0 && p.t >= growT(p.c)
          b.classList.toggle('rdy', rdy)
          const sm = b.querySelector('small')!
          if (p.c < 0) { b.firstChild!.textContent = '＋'; sm.textContent = '' } else {
            const g = p.t / growT(p.c)
            b.firstChild!.textContent = rdy ? crops[p.c][1] : g < 0.34 ? '🌱' : g < 0.67 ? '🌿' : '🪴'
            sm.textContent = rdy ? 'Harvest!' : `${Math.ceil(growT(p.c) - p.t)}s`
          }
        })
        for (const u of ups) { u.b.style.display = u.show() ? '' : 'none'; u.b.textContent = `${u.label()}  ·  🪙${fmt(u.cost())}`; u.b.disabled = money < u.cost() }
        ordBtns.forEach((b, i) => {
          const o = orders[i]
          b.style.display = o ? '' : 'none'
          if (o) { b.textContent = `${crops[o.c][1]} x${o.n}  →  🪙${fmt(o.n * SELL[o.c] * 2)}   (have ${inv[o.c]})  ${Math.ceil(o.t)}s`; b.disabled = inv[o.c] < o.n }
        })
      }
      refresh()
      let acc = 0
      let ordT = 5
      return {
        root: r,
        head: '🪙',
        tick(dt) {
          for (const p of plots) if (p.c >= 0 && p.t < growT(p.c)) { p.t += dt; if (p.t >= growT(p.c)) env.sfx('move') }
          priceT -= dt
          if (priceT <= 0) {
            priceT = 12
            for (let i = 0; i < price.length; i++) price[i] = Math.min(1.45, Math.max(0.7, price[i] + (Math.random() - 0.5) * 0.35 + (1 - price[i]) * 0.2))
          }
          if (auto > 0) {
            autoT += dt
            if (autoT > 3 / auto) {
              autoT = 0
              const p = plots.find((q) => q.c >= 0 && q.t >= growT(q.c))
              if (p) { const c = p.c; inv[c]++; p.t = 0; if (money >= SEED[c]) money -= SEED[c]; else p.c = -1 }
            }
          }
          ordT -= dt
          for (const o of orders) o.t -= dt
          for (let i = orders.length - 1; i >= 0; i--) if (orders[i].t <= 0) orders.splice(i, 1)
          if (ordT <= 0) { ordT = 45; if (orders.length < 3) newOrder() }
          acc += dt
          if (acc > 0.25) { acc = 0; refresh() }
        },
        money: () => money,
        progress: () => earned,
        rate: () => `${plots.filter((p) => p.c >= 0).length}/${plots.length} plots growing`,
        refresh,
      }
    }

    // ---------- trade ----------
    const trade = (): Mode_ => {
      const gl = pickTable(GOODS, info)
      const goods = gl.map(([name, emoji, base]) => ({ name, emoji, base }))
      const mk = new Market(goods, env.rng)
      const maxDays = byDiff(env, 80, 70, 60)
      let cash = 300
      let cap = 20
      let capLv = 0
      let dayT = 0
      const dayLen = 5
      const held = goods.map(() => ({ n: 0, cost: 0 }))
      const used = () => held.reduce((a, h) => a + h.n, 0)
      const net = () => cash + held.reduce((a, h, i) => a + h.n * mk.price[i], 0)
      const r = el('div', 'card')
      const info1 = el('div', 'row', '', r)
      const dayEl = el('div', 'grow', '', info1)
      dayEl.style.fontWeight = '700'
      const capEl = el('div', 'sub', '', info1)
      btn('Next day ⏭', info1, () => advance())
      const news = el('div', 'sub', 'Markets open. Buy low, sell high!', r)
      news.style.margin = '4px 0 8px'
      const rows = goods.map((g, i) => {
        const row = el('div', 'row', '', r)
        row.style.flexWrap = 'wrap'
        el('span', '', g.emoji, row).style.fontSize = '28px'
        const nm = el('div', 'grow', '', row)
        nm.style.minWidth = '110px'
        const t1 = el('div', '', '', nm)
        t1.style.fontWeight = '700'
        const t2 = el('div', 'sub', '', nm)
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('width', '70')
        svg.setAttribute('height', '28')
        svg.style.background = 'rgba(0,0,0,.25)'
        svg.style.borderRadius = '6px'
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
        line.setAttribute('fill', 'none')
        line.setAttribute('stroke-width', '2')
        svg.appendChild(line)
        row.appendChild(svg)
        const bs = [1, 10, 0].map((n) => btn(n ? `+${n}` : 'Max', row, () => buy(i, n)))
        const ss = [1, 10, 0].map((n) => btn(n ? `-${n}` : 'All', row, () => sell(i, n)))
        for (const b of [...bs, ...ss]) b.style.padding = '5px 8px'
        return { t1, t2, line, bs, ss }
      })
      const buy = (i: number, n: number) => {
        const p = mk.price[i]
        const q = Math.min(n || 1e9, cap - used(), Math.floor(cash / p))
        if (q < 1) { env.sfx('hit'); return }
        cash -= q * p; held[i].n += q; held[i].cost += q * p
        env.sfx('click'); refresh()
      }
      const sell = (i: number, n: number) => {
        const h = held[i]
        const q = Math.min(n || 1e9, h.n)
        if (q < 1) return
        const avg = h.cost / h.n
        const gain = q * (mk.price[i] - avg)
        cash += q * mk.price[i]; h.cost -= avg * q; h.n -= q
        if (h.n === 0) h.cost = 0
        env.sfx(gain >= 0 ? 'point' : 'hit'); toast(gain >= 0 ? `+${fmt(gain)} profit` : `${fmt(gain)} loss`); refresh()
      }
      const capBtn = btn('', r, () => {
        const c = 250 * 1.8 ** capLv
        if (cash >= c) { cash -= c; capLv++; cap += 10; env.sfx('power'); refresh() }
      })
      capBtn.style.marginTop = '6px'
      const advance = () => {
        if (mk.day >= maxDays) return
        dayT = 0
        const n = mk.nextDay()
        if (n) { news.textContent = '📰 ' + n; env.sfx('power') }
        refresh()
        if (mk.day >= maxDays && !reached && !finishing) {
          finishing = true
          const sc = Math.floor(net())
          env.score(sc)
          env.sfx('lose')
          env.end({ score: sc, won: false, text: `Out of days: ${fmt(net())} of ${fmt(goal)}` })
        }
      }
      const refresh = () => {
        dayEl.textContent = `Day ${mk.day}/${maxDays}   ·   💵 ${fmt(cash)}`
        capEl.textContent = `Cargo ${used()}/${cap}`
        const full = used() >= cap
        goods.forEach((g, i) => {
          const rw = rows[i]
          const h = mk.hist[i]
          const prev = h.length > 1 ? h[h.length - 2] : h[0]
          const p = mk.price[i]
          rw.t1.textContent = `${g.name}  ${fmt(p)} ${p > prev ? '▲' : p < prev ? '▼' : '•'}`
          rw.t1.style.color = p < g.base * 0.85 ? 'var(--g-good)' : p > g.base * 1.2 ? 'var(--g-danger)' : ''
          const hv = held[i]
          rw.t2.textContent = hv.n ? `Hold ${hv.n} @ avg ${fmt(hv.cost / hv.n)}` : `Normal ~${g.base}`
          const lo = Math.min(...h, g.base * 0.5)
          const hi = Math.max(...h, g.base * 1.5)
          rw.line.setAttribute('points', h.map((v, k) => `${(k / 13) * 76 + 2},${26 - ((v - lo) / (hi - lo)) * 24}`).join(' '))
          rw.line.setAttribute('stroke', p <= g.base ? '#4ade80' : '#f87171')
          rw.bs.forEach((b) => (b.disabled = full || cash < p))
          rw.ss.forEach((b) => (b.disabled = !hv.n))
        })
        const c = 250 * 1.8 ** capLv
        capBtn.textContent = `📦 Bigger wagon +10 cargo  ·  💵${fmt(c)}`
        capBtn.disabled = cash < c
      }
      refresh()
      return {
        root: r,
        head: '💵',
        tick(dt) {
          dayT += dt
          if (dayT >= dayLen) advance()
        },
        money: () => cash,
        progress: () => net(),
        rate: () => `Net worth ${fmt(net())}`,
        refresh,
      }
    }

    // ---------- shop ----------
    const shop = (): Mode_ => {
      const menu = pickTable(MENUS, info)
      const UNLOCK = [0, 0, 0, 80, 220, 450]
      let money = 0
      let earned = 0
      let rep = 70
      let slots = 3
      let comfy = 0
      let price = 0
      let ads = 0
      let helper = 0
      let helperT = 0
      let served = 0
      const faces = [...th.heroes, ...th.foes, ...th.items].filter((e) => e !== th.hero)
      interface Cust { face: string; ord: number[]; pat: number; max: number }
      const cs: (Cust | null)[] = Array(6).fill(null)
      let tray: number[] = []
      const r = el('div', 'cols')
      const left = el('div', 'card', '', r)
      el('div', 'sub', `${th.hero} Your counter - tap items to prepare, then tap the customer (Enter = serve)`, left)
      const mbtns = menu.map(([nm, em, p], i) => {
        const b = btn('', left, () => addItem(i))
        b.style.cssText += ';display:block;width:100%;margin-top:6px'
        return { b, nm, em, p }
      })
      const trayEl = el('div', 'tray', '', left)
      trayEl.style.marginTop = '10px'
      const trayRow = el('div', 'row', '', left)
      trayRow.style.marginTop = '6px'
      btn('Clear', trayRow, () => { tray = []; refresh() })
      btn('Serve ⏎', trayRow, () => serveMatch(), 'btn good')
      const repEl = el('div', 'sub', '', left)
      repEl.style.marginTop = '8px'
      const repBar = el('div', 'bar', '', left)
      const repFill = el('i', '', '', repBar)
      const right = el('div', 'card', '', r)
      const crow = el('div', '', '', right)
      crow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap'
      const cbtns = cs.map((_, i) => {
        const b = el('button', 'cust', '', crow)
        b.type = 'button'
        b.addEventListener('click', () => serve(i))
        return b
      })
      el('div', 'sub', 'UPGRADES', right).style.margin = '12px 0 4px'
      const upBox = el('div', '', '', right)
      const mkUp = (label: () => string, cost: () => number, buy: () => void, show: () => boolean = () => true) => {
        const b = btn('', upBox, () => { if (money >= cost()) { money -= cost(); buy(); env.sfx('power'); refresh() } })
        b.style.cssText += ';display:block;width:100%;margin-bottom:6px'
        return { b, label, cost, show }
      }
      const ups = [
        mkUp(() => `🪑 Comfy seats (patience +20%) lv${comfy}`, () => Math.round(60 * 2.2 ** comfy), () => comfy++, () => comfy < 5),
        mkUp(() => `🏷️ Fancy menu (prices +15%) lv${price}`, () => Math.round(90 * 2.4 ** price), () => price++, () => price < 5),
        mkUp(() => `🪟 Extra counter (${slots}/6 seats)`, () => 120 * 2 ** (slots - 3), () => slots++, () => slots < 6),
        mkUp(() => `📣 Advertising (more customers) lv${ads}`, () => Math.round(100 * 2.5 ** ads), () => ads++, () => ads < 4),
        mkUp(() => `🧑‍🍳 Hire helper lv${helper} (serves easy orders)`, () => 260 * 2.8 ** helper, () => helper++, () => helper < 3),
      ]
      const mult = () => 1 + 0.15 * price
      const addItem = (i: number) => {
        if (earned < UNLOCK[i]) return
        if (tray.length >= 3) return
        tray.push(i)
        env.sfx('click')
        refresh()
      }
      const same = (a: number[], b: number[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join()
      const serve = (i: number) => {
        const c = cs[i]
        if (!c || !tray.length) return
        if (same(tray, c.ord)) {
          const base = c.ord.reduce((a, k) => a + menu[k][2], 0) * mult()
          const tip = Math.floor(base * 0.6 * (c.pat / c.max))
          const pay = Math.round(base + tip)
          money += pay; earned += pay; served++
          rep = Math.min(100, rep + 3 + (c.pat / c.max > 0.5 ? 2 : 0))
          toast(`${c.face} +${pay}${tip ? ` (tip ${tip})` : ''}`)
          env.sfx('point')
          cs[i] = null
        } else {
          c.pat -= c.max * 0.25
          toast('❌ Wrong order!')
          env.sfx('hit')
        }
        tray = []
        refresh()
      }
      const serveMatch = () => {
        const i = cs.findIndex((c) => c && same(tray, c.ord))
        if (i >= 0) serve(i)
        else if (tray.length) { tray = []; env.sfx('hit'); toast('Nobody ordered that'); refresh() }
      }
      const onKey = (e: KeyboardEvent) => {
        if (e.code >= 'Digit1' && e.code <= 'Digit6') addItem(Number(e.code.slice(5)) - 1)
        else if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); serveMatch() }
        else if (e.code === 'Backspace' || e.code === 'KeyC') { tray = []; refresh() }
      }
      window.addEventListener('keydown', onKey)
      const spawn = () => {
        const free = cs.map((c, i) => (!c && i < slots ? i : -1)).filter((i) => i >= 0)
        if (!free.length) return
        const un = menu.map((_, i) => i).filter((i) => earned >= UNLOCK[i])
        const n = Math.random() < 0.45 + Math.min(0.3, earned / 3000) ? (Math.random() < 0.25 ? 3 : 2) : 1
        const ord = Array.from({ length: n }, () => un[Math.floor(Math.random() * un.length)])
        const pat = byDiff(env, 32, 26, 20) * (1 + 0.2 * comfy) + n * 4
        cs[free[Math.floor(Math.random() * free.length)]] = { face: faces[Math.floor(Math.random() * faces.length)], ord, pat, max: pat }
        env.sfx('move')
      }
      const refresh = () => {
        mbtns.forEach((m, i) => {
          const lock = earned < UNLOCK[i]
          m.b.disabled = lock
          m.b.textContent = lock ? `🔒 Earn ${UNLOCK[i]}` : `${i + 1}  ${m.em} ${m.nm}  ·  🪙${Math.round(m.p * mult() * 10) / 10}`
        })
        trayEl.textContent = tray.length ? tray.map((i) => menu[i][1]).join(' ') : 'Tray is empty'
        trayEl.style.fontSize = tray.length ? '30px' : '13px'
        repEl.textContent = `Reputation ${Math.round(rep)}%  ·  served ${served}`
        repFill.style.width = `${rep}%`
        repFill.style.background = rep < 30 ? 'var(--g-danger)' : 'var(--g-accent)'
        cs.forEach((c, i) => {
          const b = cbtns[i]
          b.className = 'cust' + (c ? '' : ' empty')
          if (i >= slots) { b.style.display = 'none'; return }
          b.style.display = ''
          if (!c) { b.textContent = '🪑'; return }
          const f = c.pat / c.max
          b.textContent = ''
          el('div', 'face', f > 0.5 ? c.face : f > 0.25 ? c.face : c.face, b)
          el('div', 'ord', c.ord.map((k) => menu[k][1]).join(' '), b)
          const bar = el('div', 'bar', '', b)
          const fill = el('i', '', '', bar)
          fill.style.width = `${f * 100}%`
          fill.style.background = f > 0.5 ? 'var(--g-good)' : f > 0.25 ? '#facc15' : 'var(--g-danger)'
          el('div', 'sub', f < 0.3 ? '😠' : f < 0.6 ? '😐' : '🙂', b)
        })
        for (const u of ups) { u.b.style.display = u.show() ? '' : 'none'; u.b.textContent = `${u.label()}  ·  🪙${fmt(u.cost())}`; u.b.disabled = money < u.cost() }
      }
      refresh()
      let spawnT = 0.5
      let acc = 0
      return {
        root: r,
        head: '🪙',
        tick(dt) {
          spawnT -= dt
          if (spawnT <= 0) { spawn(); spawnT = Math.max(1.8, byDiff(env, 6, 5, 4) * 0.82 ** ads * (rep < 40 ? 1.3 : 1) + Math.random() * 2) }
          let changed = false
          cs.forEach((c, i) => {
            if (!c) return
            c.pat -= dt
            if (c.pat <= 0) {
              cs[i] = null; rep -= 14; changed = true
              toast(`${c.face} left angry!`); env.sfx('lose')
            }
          })
          if (helper > 0) {
            helperT += dt
            if (helperT > 9 / helper) {
              helperT = 0
              const i = cs.findIndex((c) => c && c.ord.length === 1)
              if (i >= 0) { const c = cs[i]!; const pay = Math.round(menu[c.ord[0]][2] * mult()); money += pay; earned += pay; served++; cs[i] = null; changed = true }
            }
          }
          if (rep <= 0 && !finishing) {
            finishing = true
            env.score(Math.floor(earned))
            env.sfx('lose')
            env.end({ score: Math.floor(earned), won: false, text: `Shut down after earning ${fmt(earned)}` })
          }
          acc += dt
          if (acc > 0.2 || changed) { acc = 0; refresh() }
        },
        money: () => money,
        progress: () => earned,
        rate: () => `${served} served`,
        refresh,
        destroyExtra: () => window.removeEventListener('keydown', onKey),
      } as Mode_ & { destroyExtra: () => void }
    }

    const m = (mode === 'farm' ? farm : mode === 'trade' ? trade : mode === 'shop' ? shop : classic)()
    body.appendChild(m.root)
    const title = el('div', 'sub', `${env.name}`, hd)
    title.className = 'sub ttl'
    title.style.cssText = 'margin-left:auto;font-weight:700;opacity:.6'

    let last = performance.now()
    let paused = false
    let hudT = 0
    let raf = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      if (paused || finishing) return
      m.tick(dt)
      hudT += dt
      if (hudT > 0.1) {
        hudT = 0
        moneyEl.textContent = `${m.head} ${fmt(m.money())}`
        rateEl.textContent = m.rate()
        const pr = m.progress()
        goalLbl.textContent = reached ? `Goal reached! (${fmt(pr)})` : `Goal ${fmt(pr)} / ${fmt(goalNow)}`
        goalFill.style.width = `${Math.min(100, (pr / goalNow) * 100)}%`
        env.score(Math.floor(pr))
        env.status(rateEl.textContent)
        if (!reached && pr >= goal) { reached = true; env.sfx('win'); goalModal() }
      }
    }
    raf = requestAnimationFrame(frame)
    const extra = m as Mode_ & { destroyExtra?: () => void }
    return {
      destroy() {
        cancelAnimationFrame(raf)
        for (const t of timers) clearTimeout(t)
        extra.destroyExtra?.()
        style.remove()
        root.remove()
      },
      pause(p) { paused = p; last = performance.now() },
    }
  },
}
export default engine
