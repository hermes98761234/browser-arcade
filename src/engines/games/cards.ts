// Cards: card games in the DOM. Sub-mode from mods / name: solitaire (Klondike, with golf / pyramid variants), blackjack, poker (video poker),
// war, higher-lower, deck (deck-builder run) and battle (lane card battler). The fallback is golf solitaire or higher-lower.
import { Bag, byDiff, createDom, type Engine, type GameEnv } from '../kit'
import type { Theme } from '../../lib/themes'
import {
  autoStep, autoTarget, canAutoComplete, canMove, cardsAt, drawStock, evalPoker, golfDeal, golfDraw, golfPlay, golfStuck, golfWon, handValue, hasMoves, isBlackjack,
  isRed, klondikeDeal, klondikeWon, moveCards, PAYTABLE, pokerPay, pyramidDeal, pyramidFree, pyramidWon, RANKS, settleBlackjack, shuffled, suggestHold, SUITS, dealerHits,
  warRound, type Card, type GState, type KState, type Loc, type PokerHand, type PState,
} from '../logic/cards'
import {
  CARDS, CARD_BY_ID, endTurn, FLOORS, floorEnemies, livingEnemies, playCard, rewardChoices, startCombat, STARTER, type Combat, type Enemy, type Ev, type Intent,
} from '../logic/deckbuilder'
import { aiChoose, apply as bApply, BCARD_BY_ID, buildDeck, HERO_HP, LANES, legalActions, needsTarget, newGame, type BEv, type BState, type Minion, type Target } from '../logic/battler'
import { pickCardMode, type CardMode } from '../logic/cardmode'

interface X {
  env: GameEnv
  root: HTMLDivElement
  t: Theme
  bag: Bag
  /** emoji used on card backs */
  back: string
  onResize(fn: (w: number, h: number) => void): void
  size(): { w: number; h: number }
}

const CSS = `
.cg { --cw: 70px; position:absolute; inset:0; overflow:hidden; color:#fff; font-family: system-ui, "Segoe UI", sans-serif; user-select:none; -webkit-user-select:none; touch-action:manipulation; background: radial-gradient(ellipse at 50% 35%, color-mix(in srgb, var(--g-bg2) 70%, #000 30%), color-mix(in srgb, var(--g-bg) 55%, #000 45%)); }
.cg * { box-sizing: border-box; }
.cg-top { position:absolute; left:0; right:0; top:0; height:44px; display:flex; align-items:center; gap:6px; padding:0 8px; background:rgba(8,10,20,.55); z-index:50; flex-wrap:nowrap; overflow:hidden; }
.cg-top .stat { font-size:13px; font-weight:700; white-space:nowrap; padding:0 6px; opacity:.95 }
.cg-top .sp { flex:1 }
.cg-btn { appearance:none; border:2px solid rgba(255,255,255,.35); background:rgba(255,255,255,.12); color:#fff; font:700 14px system-ui, sans-serif; border-radius:10px; min-height:40px; min-width:40px; padding:0 12px; cursor:pointer; touch-action:manipulation; }
.cg-btn:hover:not(:disabled) { background:rgba(255,255,255,.25) }
.cg-btn:disabled { opacity:.4; cursor:default }
.cg-btn.pri { background: var(--g-accent); color:#0b0b14; border-color: transparent }
.cg-btn.big { min-height:52px; font-size:17px; padding:0 22px }
.cg-btn.danger { background: var(--g-danger); border-color:transparent }
.cg-board { position:absolute; left:0; right:0; top:44px; bottom:0; }
.cg-card { position:absolute; left:0; top:0; width:var(--cw); height:calc(var(--cw)*1.4); border-radius:calc(var(--cw)*.1); font-size:calc(var(--cw)*.27); transition: transform .22s cubic-bezier(.2,.8,.3,1); will-change:transform; touch-action:none; }
.cg-card.nt { transition:none }
.cg-card .f, .cg-card .b { position:absolute; inset:0; border-radius:inherit; box-shadow: 0 1px 3px rgba(0,0,0,.5), 0 0 0 1px rgba(0,0,0,.25); overflow:hidden }
.cg-card .f { background: linear-gradient(160deg,#fffef8,#ece9dd); color:#1b1b22; font-weight:800 }
.cg-card.red .f { color:#c1272d }
.cg-card .f .c1 { position:absolute; left:8%; top:3%; line-height:1; text-align:center; font-size:1em }
.cg-card .f .c1 i { display:block; font-style:normal; font-size:.85em }
.cg-card .f .c2 { position:absolute; right:8%; bottom:3%; line-height:1; text-align:center; transform:rotate(180deg); font-size:1em }
.cg-card .f .c2 i { display:block; font-style:normal; font-size:.85em }
.cg-card .f .big { position:absolute; left:0; right:0; top:50%; transform:translateY(-45%); text-align:center; font-size:2.1em; opacity:.92 }
.cg-card .b { background: repeating-linear-gradient(45deg, color-mix(in srgb, var(--g-accent) 85%, #000), color-mix(in srgb, var(--g-accent) 85%, #000) 6px, color-mix(in srgb, var(--g-accent2) 80%, #000) 6px, color-mix(in srgb, var(--g-accent2) 80%, #000) 12px); border:calc(var(--cw)*.05) solid #fffdf2; display:flex; align-items:center; justify-content:center; font-size:1.7em }
.cg-card .b span { filter: drop-shadow(0 1px 2px rgba(0,0,0,.6)); }
.cg-card.up .b { display:none }
.cg-card:not(.up) .f { display:none }
.cg-card.sel .f { box-shadow: 0 0 0 3px #ffe066, 0 0 14px #ffe066 }
.cg-card.hint .f { box-shadow: 0 0 0 3px #7CFC9A, 0 0 14px #7CFC9A }
.cg-card.drag { transition:none; z-index:999 !important; filter: drop-shadow(0 6px 8px rgba(0,0,0,.45)) }
.cg-slot { position:absolute; left:0; top:0; width:var(--cw); height:calc(var(--cw)*1.4); border-radius:calc(var(--cw)*.1); border:2px dashed rgba(255,255,255,.28); display:flex; align-items:center; justify-content:center; font-size:calc(var(--cw)*.4); color:rgba(255,255,255,.3); }
.cg-slot.tap { cursor:pointer; border-style:solid }
.cg-center { position:absolute; inset:44px 0 0 0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; z-index:60; background:rgba(5,6,14,.55); text-align:center; padding:16px }
.cg-center h2 { margin:0; font-size:clamp(20px,5vw,34px) }
.cg-toast { position:absolute; left:50%; top:56px; transform:translateX(-50%); background:rgba(10,12,22,.88); border:2px solid var(--g-accent); padding:6px 14px; border-radius:12px; font-weight:800; font-size:15px; z-index:70; pointer-events:none; animation: cgpop .25s ease-out; white-space:normal; text-align:center; max-width:92% }
@keyframes cgpop { from { transform: translateX(-50%) scale(.7); opacity:0 } to { transform: translateX(-50%) scale(1); opacity:1 } }
@keyframes cgdeal { from { transform: translate(-120px,-80px) rotate(-14deg) scale(.7); opacity:0 } to { transform:none; opacity:1 } }
@keyframes cgshake { 0%,100% { transform:translateX(0) } 25% { transform:translateX(-5px) } 75% { transform:translateX(5px) } }
@keyframes cgfloat { from { transform: translateY(0); opacity:1 } to { transform: translateY(-44px); opacity:0 } }
.cg-felt { position:absolute; inset:44px 0 0 0; display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:8px 8px 10px; gap:6px; overflow:auto }
.cg-row { display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:calc(var(--cw)*.12) }
.cg-row .cg-card { position:relative; transition: transform .2s, box-shadow .2s; }
.cg-row .cg-card.deal { animation: cgdeal .35s ease-out both }
.cg-chip { width:54px; height:54px; border-radius:50%; border:4px dashed rgba(255,255,255,.85); display:inline-flex; align-items:center; justify-content:center; font:800 14px system-ui; color:#fff; cursor:pointer; box-shadow:0 3px 0 rgba(0,0,0,.35); position:relative }
.cg-chip:active { transform:translateY(2px) }
.cg-chip.dis { opacity:.35; pointer-events:none }
.cg-label { font-size:12px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; opacity:.85 }
.cg-val { background:rgba(0,0,0,.45); border-radius:999px; padding:2px 10px; font-weight:800; font-size:14px }
.cg-avatar { font-size:34px; line-height:1 }
.cg-pay { display:grid; grid-template-columns: auto auto; gap:0 14px; font-size:12px; font-weight:700; background:rgba(0,0,0,.4); padding:6px 12px; border-radius:10px }
.cg-pay .hit { color:#ffe066; background:rgba(255,224,102,.15) }
.cg-hold { position:absolute; left:0; right:0; bottom:-22px; text-align:center; font-size:11px; font-weight:900; color:#ffe066; letter-spacing:.08em }
.cg-sub { font-size:12px; opacity:.8; font-weight:600 }

  .cg .en { display:flex; flex-direction:column; align-items:center; gap:3px; padding:4px 6px; border-radius:12px; cursor:pointer; position:relative; min-width:84px }
  .cg .en.target { outline:3px solid #ffe066; animation: cgpulse .7s infinite alternate }
  .cg .en.dead { opacity:0; transform:scale(.4) rotate(20deg); transition: all .5s }
  @keyframes cgpulse { from { transform:scale(1) } to { transform:scale(1.07) } }
  .cg .bar { width:100%; height:10px; border-radius:6px; background:rgba(0,0,0,.55); overflow:hidden; border:1px solid rgba(255,255,255,.4) }
  .cg .bar i { display:block; height:100%; background:linear-gradient(#ff7b7b,#d33) }
  .cg .bar.p i { background:linear-gradient(#7ee08a,#2b9a45) }
  .cg .cgbadge { font-size:11px; font-weight:800; background:rgba(0,0,0,.55); border-radius:8px; padding:1px 6px; white-space:nowrap }
  .cg .intent { font-size:14px; font-weight:900; background:rgba(0,0,0,.65); border:2px solid #ffb4b4; border-radius:10px; padding:1px 8px; white-space:nowrap }
  .cg .hand { display:flex; justify-content:center; align-items:flex-end; gap:4px; padding:6px 6px 8px; overflow-x:auto; min-height:calc(var(--hw)*1.5) }
  .cg .dc { width:var(--hw); min-width:var(--hw); height:calc(var(--hw)*1.5); border-radius:10px; background:linear-gradient(170deg,#fbf6ea,#e4dcc6); color:#1b1b22; border:3px solid var(--tc); position:relative; display:flex; flex-direction:column; align-items:center; padding:3px; cursor:pointer; transition: transform .15s; font-size:calc(var(--hw)*.115); box-shadow:0 3px 8px rgba(0,0,0,.5); touch-action:manipulation }
  .cg .dc:hover { transform: translateY(-10px) }
  .cg .dc.sel { transform: translateY(-16px); box-shadow:0 0 0 3px #ffe066, 0 0 16px #ffe066 }
  .cg .dc.dim { filter:grayscale(.7) brightness(.8) }
  .cg .dc .cost { position:absolute; left:-8px; top:-8px; width:calc(var(--hw)*.3); height:calc(var(--hw)*.3); border-radius:50%; background:#3b82f6; color:#fff; font-weight:900; display:flex; align-items:center; justify-content:center; font-size:calc(var(--hw)*.17); border:2px solid #fff }
  .cg .dc .nm { font-weight:900; font-size:1.05em; text-align:center; margin-top:2px; line-height:1.05 }
  .cg .dc .ic { font-size:calc(var(--hw)*.42); line-height:1.1; margin:2px 0 }
  .cg .dc .ty { font-size:.8em; text-transform:uppercase; opacity:.55; font-weight:800; letter-spacing:.05em }
  .cg .dc .ds { font-size:.92em; text-align:center; line-height:1.15; font-weight:600 }
  .cg .float { position:absolute; font-weight:900; font-size:20px; text-shadow:0 2px 4px #000; pointer-events:none; animation: cgfloat .9s ease-out forwards; z-index:90; left:50%; top:10%; transform:translateX(-50%) }
  .cg .orb { width:54px; height:54px; border-radius:50%; background:radial-gradient(circle at 35% 30%,#8fd0ff,#2a6fdb); border:3px solid #fff; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:20px; box-shadow:0 0 14px #4aa3ff }
  .cg .shake { animation: cgshake .3s }
  
@media (max-width: 520px) { .cg-top .stat { font-size:12px; padding:0 3px } .cg-btn { padding:0 9px; font-size:13px } }
`

const h = (tag: string, cls = '', parent?: HTMLElement, text?: string): HTMLElement => {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text !== undefined) e.textContent = text
  parent?.appendChild(e)
  return e
}
const btn = (parent: HTMLElement, label: string, fn: () => void, cls = ''): HTMLButtonElement => {
  const b = h('button', `cg-btn ${cls}`, parent, label) as HTMLButtonElement
  b.type = 'button'
  b.addEventListener('click', fn)
  return b
}
const toast = (x: X, s: string, ms = 1100) => {
  const e = h('div', 'cg-toast', x.root, s)
  x.bag.timeout(() => e.remove(), ms)
}
const sizeOf = (x: X) => x.size()

/** DOM card: both faces exist, `.up` toggles which is visible. */
function cardEl(x: X, c: Card, parent?: HTMLElement): HTMLElement {
  const e = h('div', `cg-card ${isRed(c) ? 'red' : 'blk'}${c.up ? ' up' : ''}`, parent)
  const f = h('div', 'f', e)
  const r = RANKS[c.rank]
  const s = SUITS[c.suit]
  const c1 = h('div', 'c1', f)
  h('span', '', c1, r)
  h('i', '', c1, s)
  const c2 = h('div', 'c2', f)
  h('span', '', c2, r)
  h('i', '', c2, s)
  h('div', 'big', f, c.rank > 10 ? ['J', 'Q', 'K'][c.rank - 11] + s : s)
  const b = h('div', 'b', e)
  h('span', '', b, x.back)
  return e
}
const setUp = (e: HTMLElement, up: boolean) => e.classList.toggle('up', up)
const place = (e: HTMLElement, px: number, py: number, z = 1) => {
  e.style.transform = `translate(${px}px, ${py}px)`
  e.style.zIndex = String(z)
}
function confetti(x: X, n = 36) {
  const cols = [x.t.accent, x.t.accent2, x.t.good, '#ffe066', '#fff']
  const box = h('div', '', x.root)
  box.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:80'
  for (let i = 0; i < n; i++) {
    const p = h('div', '', box)
    const sz = 6 + Math.random() * 8
    p.style.cssText = `position:absolute;left:${Math.random() * 100}%;top:-12px;width:${sz}px;height:${sz * 1.6}px;background:${cols[i % cols.length]};transform:rotate(${Math.random() * 360}deg);transition:transform ${1.6 + Math.random()}s ease-in, top ${1.6 + Math.random()}s ease-in, opacity 2.4s;opacity:1`
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        p.style.top = '105%'
        p.style.transform = `translateX(${(Math.random() - 0.5) * 160}px) rotate(${Math.random() * 720}deg)`
        p.style.opacity = '0.2'
      }),
    )
  }
  x.bag.timeout(() => box.remove(), 3400)
}
const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

// ================================================================ shared top bar
interface Bar { stat(i: number, s: string): void; btn(label: string, fn: () => void, cls?: string): HTMLButtonElement; board: HTMLDivElement }
function topBar(x: X, stats: number, withBoard = true): Bar {
  const top = h('div', 'cg-top', x.root)
  const statEls: HTMLElement[] = []
  for (let i = 0; i < stats; i++) statEls.push(h('div', 'stat', top))
  h('div', 'sp', top)
  const board = (withBoard ? h('div', 'cg-board', x.root) : top) as HTMLDivElement
  return { stat: (i, s) => void (statEls[i].textContent = s), btn: (label, fn, cls = '') => btn(top, label, fn, cls), board }
}
function overlay(x: X, title: string, lines: string[], buttons: [string, () => void, string?][]): HTMLElement {
  const o = h('div', 'cg-center', x.root)
  h('h2', '', o, title)
  for (const l of lines) h('div', 'cg-sub', o, l)
  const row = h('div', 'cg-row', o)
  for (const [label, fn, cls] of buttons) btn(row, label, () => {
    o.remove()
    fn()
  }, cls ?? '')
  return o
}

// ================================================================ KLONDIKE
function klondike(x: X): () => void {
  const { env } = x
  const drawN: 1 | 3 = env.difficulty === 0 ? 1 : 3
  const redeals = env.difficulty === 2 ? 3 : 99
  let state: KState = klondikeDeal(env.rng, drawN, redeals)
  let hist: KState[] = []
  let t0 = 0
  let elapsed = 0
  let over = false
  let auto = 0
  const bar = topBar(x, 3)
  const board = bar.board
  const slots: HTMLElement[] = []
  const els = new Map<number, HTMLElement>()
  const pos = new Map<number, { x: number; y: number }>()
  const locOf = new Map<number, Loc>()
  let cw = 70
  let ch = 98
  let gap = 8
  let ty = 0
  const mk = () => {
    for (const e of els.values()) e.remove()
    els.clear()
    const all: Card[] = [...state.stock, ...state.waste, ...state.found.flat(), ...state.tab.flat()]
    for (const c of all) {
      const e = cardEl(x, c, board)
      e.dataset.id = String(c.id)
      els.set(c.id, e)
    }
  }
  const mkSlots = () => {
    for (const s of slots) s.remove()
    slots.length = 0
    const stock = h('div', 'cg-slot tap', board, '↻')
    stock.addEventListener('click', () => onStock())
    slots.push(stock)
    slots.push(h('div', 'cg-slot', board))
    for (let i = 0; i < 4; i++) slots.push(h('div', 'cg-slot', board, 'A'))
    for (let i = 0; i < 7; i++) slots.push(h('div', 'cg-slot', board, 'K'))
  }
  const metrics = () => {
    const { w, h: hh } = { w: board.clientWidth, h: board.clientHeight }
    cw = Math.max(36, Math.min(118, Math.floor((w - 12) / 7.5), Math.floor(hh / 4.2 / 1.4)))
    ch = cw * 1.4
    gap = Math.max(3, (w - cw * 7) / 8)
    x.root.style.setProperty('--cw', `${cw}px`)
    ty = ch + gap * 1.4
  }
  const colX = (i: number) => gap + i * (cw + gap)
  const layout = () => {
    metrics()
    const hh = board.clientHeight
    locOf.clear()
    const put = (c: Card, px: number, py: number, z: number, loc?: Loc) => {
      const e = els.get(c.id)!
      setUp(e, c.up)
      place(e, px, py, z)
      pos.set(c.id, { x: px, y: py })
      if (loc) locOf.set(c.id, loc)
    }
    const y0 = gap * 0.7
    // slots
    place(slots[0], colX(0), y0, 0)
    place(slots[1], colX(1), y0, 0)
    for (let i = 0; i < 4; i++) place(slots[2 + i], colX(3 + i), y0, 0)
    for (let i = 0; i < 7; i++) place(slots[6 + i], colX(i), ty, 0)
    slots[0].textContent = state.stock.length ? '' : state.waste.length && state.redeals > 0 ? '↻' : '✕'
    state.stock.forEach((c, k) => put(c, colX(0), y0, 1 + k))
    const wn = state.waste.length
    const fan = drawN === 3 ? Math.min(3, wn) : 1
    state.waste.forEach((c, k) => {
      const f = k - (wn - fan)
      put(c, colX(1) + (f > 0 ? f * cw * 0.28 : 0), y0, 2 + k, k === wn - 1 ? { kind: 'waste', i: 0, k } : undefined)
    })
    state.found.forEach((p, i) => p.forEach((c, k) => put(c, colX(3 + i), y0, 2 + k, k === p.length - 1 ? { kind: 'found', i, k } : undefined)))
    state.tab.forEach((p, i) => {
      const avail = hh - ty - ch - 6
      const down = ch * 0.13
      const up = ch * 0.3
      let total = 0
      p.forEach((c, k) => {
        if (k < p.length - 1) total += c.up ? up : down
      })
      const sc = total > avail ? Math.max(0.25, avail / total) : 1
      let yy = ty
      p.forEach((c, k) => {
        put(c, colX(i), yy, 10 + k, c.up ? { kind: 'tab', i, k } : undefined)
        yy += (c.up ? up : down) * sc
      })
    })
  }
  const hud = () => {
    bar.stat(0, `Score ${state.score}`)
    bar.stat(1, `Moves ${state.moves}`)
    bar.stat(2, fmtTime(elapsed))
    env.score(Math.max(0, state.score))
    env.status(`${drawN === 1 ? 'Draw 1' : 'Draw 3'} · ${state.moves} moves · ${fmtTime(elapsed)}`)
    undoB.disabled = !hist.length || over
    autoB.style.display = canAutoComplete(state) && !over ? '' : 'none'
  }
  const finishWin = () => {
    over = true
    const bonus = Math.max(0, 1500 - Math.floor(elapsed) * 3) + (env.difficulty + 1) * 300
    const sc = Math.max(0, state.score) + bonus
    env.score(sc)
    env.sfx('win')
    confetti(x, 60)
    x.bag.timeout(() => env.end({ score: sc, won: true, text: `Solved in ${fmtTime(elapsed)} with ${state.moves} moves` }), 1800)
  }
  const apply = (n: KState | null, sfx: 'move' | 'click' = 'move') => {
    if (!n || over) return false
    hist.push(state)
    if (hist.length > 200) hist.shift()
    state = n
    layout()
    env.sfx(sfx)
    hud()
    if (klondikeWon(state)) {
      finishWin()
      return true
    }
    if (canAutoComplete(state) && !auto) {
      x.bag.timeout(() => runAuto(), 700)
    } else if (!hasMoves(state) && !auto) {
      stuck()
    }
    return true
  }
  let stuckShown = false
  const stuck = () => {
    if (stuckShown) return
    stuckShown = true
    overlay(x, 'No more moves', [`Score ${state.score}`], [
      ['Undo', () => { stuckShown = false; undo() }],
      ['Finish', () => finishNow(), 'pri'],
      ['New deal', () => { stuckShown = false; newDeal() }],
    ])
  }
  const runAuto = () => {
    if (auto || over) return
    auto = window.setInterval(() => {
      const n = autoStep(state)
      if (!n) {
        clearInterval(auto)
        auto = 0
        return
      }
      hist.push(state)
      state = n
      layout()
      env.sfx('point')
      hud()
      if (klondikeWon(state)) {
        clearInterval(auto)
        auto = 0
        finishWin()
      }
    }, 90)
    x.bag.add(() => clearInterval(auto))
  }
  const finishNow = () => {
    if (over) return
    over = true
    env.end({ score: Math.max(0, state.score), won: false, text: `${state.moves} moves, ${state.found.flat().length} cards home` })
  }
  const undo = () => {
    if (!hist.length || over || auto) return
    state = hist.pop()!
    layout()
    hud()
    env.sfx('click')
  }
  const newDeal = () => {
    if (auto) {
      clearInterval(auto)
      auto = 0
    }
    state = klondikeDeal(env.rng, drawN, redeals)
    hist = []
    t0 = performance.now()
    elapsed = 0
    mk()
    layout()
    hud()
  }
  const onStock = () => {
    if (over || auto) return
    const n = drawStock(state)
    if (n) apply(n, 'click')
    else toast(x, 'No redeals left')
  }
  const undoB = bar.btn('↶ Undo', undo)
  const autoB = bar.btn('Auto ▶', () => runAuto(), 'pri')
  bar.btn('New', () => newDeal())
  bar.btn('Finish', () => finishNow())
  mkSlots()
  mk()
  t0 = performance.now()
  // ---- input (drag & drop and tap-to-move)
  let drag: { loc: Loc; ids: number[]; sx: number; sy: number; moved: boolean; t: number } | null = null
  const onDown = (e: PointerEvent) => {
    if (over || auto) return
    const el = (e.target as HTMLElement).closest('.cg-card') as HTMLElement | null
    if (!el) return
    const id = +el.dataset.id!
    // face-down stock card: draw
    if (state.stock.some((c) => c.id === id)) {
      onStock()
      return
    }
    const loc = locOf.get(id)
    if (!loc) return
    const cs = cardsAt(state, loc)
    if (!cs.length || !cs[0].up) return
    drag = { loc, ids: cs.map((c) => c.id), sx: e.clientX, sy: e.clientY, moved: false, t: performance.now() }
    board.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent) => {
    if (!drag) return
    const dx = e.clientX - drag.sx
    const dy = e.clientY - drag.sy
    if (!drag.moved && Math.hypot(dx, dy) < 6) return
    drag.moved = true
    drag.ids.forEach((id, i) => {
      const el = els.get(id)!
      el.classList.add('drag')
      const p = pos.get(id)!
      place(el, p.x + dx, p.y + dy, 999 + i)
    })
  }
  const onUp = (e: PointerEvent) => {
    if (!drag) return
    const d = drag
    drag = null
    for (const id of d.ids) els.get(id)!.classList.remove('drag')
    if (!d.moved) {
      const to = autoTarget(state, d.loc)
      if (to) apply(moveCards(state, d.loc, to))
      else {
        const el = els.get(d.ids[0])!
        el.style.animation = 'cgshake .25s'
        x.bag.timeout(() => (el.style.animation = ''), 300)
        env.sfx('click')
      }
      return
    }
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    const p0 = pos.get(d.ids[0])!
    const cx = p0.x + dx + cw / 2
    const cy = p0.y + dy + ch / 2
    let best: Loc | null = null
    let bestD = Infinity
    const consider = (to: Loc, tx: number, ty2: number) => {
      if (!canMove(state, d.loc, to)) return
      const dd = Math.hypot(cx - tx, cy - ty2)
      if (dd < bestD && dd < cw * 1.3) {
        bestD = dd
        best = to
      }
    }
    for (let i = 0; i < 4; i++) consider({ kind: 'found', i, k: 0 }, colX(3 + i) + cw / 2, gap * 0.7 + ch / 2)
    for (let i = 0; i < 7; i++) {
      const pile = state.tab[i]
      const last = pile.length ? pos.get(pile[pile.length - 1].id)! : { x: colX(i), y: ty }
      consider({ kind: 'tab', i, k: 0 }, last.x + cw / 2, last.y + ch / 2 + (pile.length ? ch * 0.15 : 0))
    }
    if (best) {
      if (!apply(moveCards(state, d.loc, best))) layout()
    } else {
      layout()
      env.sfx('click')
    }
  }
  board.addEventListener('pointerdown', onDown)
  board.addEventListener('pointermove', onMove)
  board.addEventListener('pointerup', onUp)
  board.addEventListener('pointercancel', onUp)
  x.onResize(() => layout())
  layout()
  hud()
  const timer = window.setInterval(() => {
    if (over) return
    elapsed = (performance.now() - t0) / 1000
    bar.stat(2, fmtTime(elapsed))
  }, 500)
  toast(x, drawN === 1 ? 'Draw 1 · tap a card to move it' : 'Draw 3 · drag cards or tap to move', 2200)
  return () => {
    clearInterval(timer)
    clearInterval(auto)
  }
}

// ================================================================ GOLF SOLITAIRE
function golfSolitaire(x: X): () => void {
  const { env } = x
  const wrap = env.difficulty === 0
  let state: GState = golfDeal(env.rng, wrap)
  let hist: GState[] = []
  let score = 0
  let scoreHist: number[] = []
  let over = false
  const bar = topBar(x, 3)
  const board = bar.board
  const els = new Map<number, HTMLElement>()
  const stockSlot = h('div', 'cg-slot tap', board, '↻')
  const wasteSlot = h('div', 'cg-slot', board)
  let cw = 70
  let ch = 98
  const mk = () => {
    for (const e of els.values()) e.remove()
    els.clear()
    for (const c of [...state.cols.flat(), ...state.stock, ...state.waste]) {
      const e = cardEl(x, { ...c, up: false }, board)
      e.dataset.id = String(c.id)
      els.set(c.id, e)
    }
  }
  const layout = () => {
    const w = board.clientWidth
    const hh = board.clientHeight
    cw = Math.max(36, Math.min(110, Math.floor((w - 12) / 7.4), Math.floor((hh - 20) / 5.6 / 1.4 * 1.1)))
    ch = cw * 1.4
    const gap = Math.max(3, (w - cw * 7) / 8)
    x.root.style.setProperty('--cw', `${cw}px`)
    const off = Math.min(ch * 0.3, (hh - ch * 2 - gap * 3) / 5)
    state.cols.forEach((p, i) => {
      p.forEach((c, k) => {
        const e = els.get(c.id)!
        setUp(e, true)
        place(e, gap + i * (cw + gap), gap + k * off, 10 + k)
      })
    })
    const by = Math.min(hh - ch - gap, gap * 2 + 4 * off + ch + 10)
    const sx = w / 2 - cw - gap
    place(stockSlot, sx, by, 0)
    place(wasteSlot, sx + cw + gap * 2, by, 0)
    stockSlot.textContent = state.stock.length ? '' : '✕'
    state.stock.forEach((c, k) => {
      const e = els.get(c.id)!
      setUp(e, false)
      place(e, sx, by, 1 + k)
    })
    state.waste.forEach((c, k) => {
      const e = els.get(c.id)!
      setUp(e, true)
      place(e, sx + cw + gap * 2, by, 2 + k)
    })
  }
  const left = () => state.cols.reduce((a, p) => a + p.length, 0)
  const hud = () => {
    bar.stat(0, `Score ${score}`)
    bar.stat(1, `Left ${left()}`)
    bar.stat(2, `Streak ${state.streak}`)
    env.score(score)
    env.status(`${left()} cards left · stock ${state.stock.length}${wrap ? ' · K-A wraps' : ''}`)
    undoB.disabled = !hist.length || over
  }
  const finish = (won: boolean) => {
    if (over) return
    over = true
    const bonus = won ? 500 + state.stock.length * 60 + (env.difficulty + 1) * 200 : 0
    const sc = score + bonus
    env.score(sc)
    if (won) {
      env.sfx('win')
      confetti(x, 60)
    }
    x.bag.timeout(() => env.end({ score: sc, won, text: won ? `Cleared the board, ${state.stock.length} cards to spare` : `${left()} cards left, best streak ${state.best}` }), won ? 1800 : 200)
  }
  const check = () => {
    hud()
    if (golfWon(state)) finish(true)
    else if (golfStuck(state)) {
      overlay(x, 'No more moves', [`${left()} cards left`], [['Undo', () => undo()], ['Finish', () => finish(false), 'pri']])
    }
  }
  const play = (n: GState | null, pts = 0) => {
    if (!n || over) return
    hist.push(state)
    scoreHist.push(score)
    state = n
    score += pts
    layout()
    check()
  }
  const undo = () => {
    if (!hist.length || over) return
    state = hist.pop()!
    score = scoreHist.pop()!
    layout()
    hud()
    env.sfx('click')
  }
  const newDeal = () => {
    state = golfDeal(env.rng, wrap)
    hist = []
    scoreHist = []
    score = 0
    mk()
    layout()
    hud()
  }
  board.addEventListener('click', (e) => {
    if (over) return
    const el = (e.target as HTMLElement).closest('.cg-card') as HTMLElement | null
    if (!el) return
    const id = +el.dataset.id!
    if (state.stock.some((c) => c.id === id)) {
      const n = golfDraw(state)
      if (n) {
        env.sfx('click')
        play(n)
      }
      return
    }
    const col = state.cols.findIndex((p) => p.length && p[p.length - 1].id === id)
    if (col >= 0) {
      const n = golfPlay(state, col)
      if (n) {
        env.sfx(n.streak >= 3 ? 'point' : 'move')
        play(n, 10 + n.streak * 5)
        if (n.streak >= 3) toast(x, `Streak x${n.streak}!`, 700)
      } else {
        el.style.animation = 'cgshake .25s'
        x.bag.timeout(() => (el.style.animation = ''), 300)
        env.sfx('click')
      }
    }
  })
  stockSlot.addEventListener('click', () => {
    const n = golfDraw(state)
    if (n) play(n)
  })
  const undoB = bar.btn('↶ Undo', undo)
  bar.btn('New', newDeal)
  bar.btn('Finish', () => finish(false))
  mk()
  x.onResize(layout)
  layout()
  hud()
  toast(x, 'Clear the board: play cards one rank higher or lower', 2600)
  return () => {}
}

// ================================================================ PYRAMID
function pyramid(x: X): () => void {
  const { env } = x
  let state: PState = pyramidDeal(env.rng)
  let hist: PState[] = []
  let sel: { kind: 'row' | 'waste'; r: number; j: number } | null = null
  let score = 0
  let over = false
  const bar = topBar(x, 3)
  const board = bar.board
  const els = new Map<number, HTMLElement>()
  const stockSlot = h('div', 'cg-slot tap', board, '↻')
  let cw = 70
  let ch = 98
  const all = () => [...state.rows.flat().filter(Boolean), ...state.stock, ...state.waste] as Card[]
  const mk = () => {
    for (const e of els.values()) e.remove()
    els.clear()
    for (const c of all()) {
      const e = cardEl(x, { ...c, up: false }, board)
      e.dataset.id = String(c.id)
      els.set(c.id, e)
    }
  }
  const layout = () => {
    const w = board.clientWidth
    const hh = board.clientHeight
    cw = Math.max(32, Math.min(96, Math.floor((w - 10) / 7.3), Math.floor((hh - 20) / 5.4 / 1.4)))
    ch = cw * 1.4
    x.root.style.setProperty('--cw', `${cw}px`)
    const present = new Set(all().map((c) => c.id))
    for (const [id, e] of els) e.style.display = present.has(id) ? '' : 'none'
    const step = cw * 1.04
    const ry = ch * 0.48
    const ox = w / 2 - cw / 2
    state.rows.forEach((row, r) =>
      row.forEach((c, j) => {
        if (!c) return
        const e = els.get(c.id)!
        setUp(e, true)
        place(e, ox + (j - r / 2) * step, 8 + r * ry, 10 + r)
        e.classList.toggle('sel', !!sel && sel.kind === 'row' && sel.r === r && sel.j === j)
        e.style.opacity = pyramidFree(state, r, j) ? '1' : '0.78'
      }),
    )
    const by = 8 + 6 * ry + ch + 12
    place(stockSlot, 10, Math.min(by, hh - ch - 6), 0)
    stockSlot.textContent = state.stock.length ? '' : state.redeals > 0 && state.waste.length ? '↻' : '✕'
    state.stock.forEach((c, k) => {
      const e = els.get(c.id)!
      setUp(e, false)
      place(e, 10, Math.min(by, hh - ch - 6), 1 + k)
    })
    state.waste.forEach((c, k) => {
      const e = els.get(c.id)!
      setUp(e, true)
      place(e, 10 + cw + 12, Math.min(by, hh - ch - 6), 2 + k)
      e.classList.toggle('sel', !!sel && sel.kind === 'waste' && k === state.waste.length - 1)
    })
  }
  const remaining = () => state.rows.flat().filter(Boolean).length
  const hud = () => {
    bar.stat(0, `Score ${score}`)
    bar.stat(1, `Left ${remaining()}`)
    bar.stat(2, `Stock ${state.stock.length}`)
    env.score(score)
    env.status(`${remaining()} cards left · pairs make 13`)
  }
  const finish = (won: boolean) => {
    if (over) return
    over = true
    const sc = score + (won ? 700 + (env.difficulty + 1) * 200 : 0)
    env.score(sc)
    if (won) {
      env.sfx('win')
      confetti(x, 60)
    }
    x.bag.timeout(() => env.end({ score: sc, won, text: won ? 'Pyramid cleared' : `${remaining()} cards left` }), won ? 1800 : 200)
  }
  const cardOf = (s: typeof sel): Card | null => (!s ? null : s.kind === 'row' ? state.rows[s.r][s.j] : state.waste[state.waste.length - 1] ?? null)
  const removeSel = (s: NonNullable<typeof sel>) => {
    if (s.kind === 'row') state.rows[s.r][s.j] = null
    else state.waste.pop()
  }
  const snapshot = () => {
    hist.push(structuredClone(state))
    if (hist.length > 100) hist.shift()
  }
  const stuckCheck = () => {
    if (pyramidWon(state)) return finish(true)
    // any possible pair or king, or stock to draw?
    if (state.stock.length || (state.waste.length && state.redeals > 0)) return
    const free: Card[] = []
    state.rows.forEach((row, r) => row.forEach((c, j) => c && pyramidFree(state, r, j) && free.push(c)))
    if (state.waste.length) free.push(state.waste[state.waste.length - 1])
    for (let i = 0; i < free.length; i++) {
      if (free[i].rank === 13) return
      for (let j = i + 1; j < free.length; j++) if (free[i].rank + free[j].rank === 13) return
    }
    overlay(x, 'No more moves', [`${remaining()} cards left`], [['Undo', () => undo()], ['Finish', () => finish(false), 'pri']])
  }
  const choose = (s: NonNullable<typeof sel>) => {
    if (over) return
    const c = cardOf(s)
    if (!c) return
    if (s.kind === 'row' && !pyramidFree(state, s.r, s.j)) return
    if (c.rank === 13) {
      snapshot()
      removeSel(s)
      score += 5
      sel = null
      env.sfx('point')
    } else if (!sel) {
      sel = s
      env.sfx('click')
    } else if (sel.kind === s.kind && sel.r === s.r && sel.j === s.j) sel = null
    else {
      const o = cardOf(sel)!
      if (o.rank + c.rank === 13) {
        snapshot()
        removeSel(sel)
        removeSel(s)
        score += 10
        sel = null
        env.sfx('point')
        confetti(x, 6)
      } else {
        sel = s
        env.sfx('click')
      }
    }
    layout()
    hud()
    stuckCheck()
  }
  board.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest('.cg-card') as HTMLElement | null
    if (!el || over) return
    const id = +el.dataset.id!
    if (state.stock.some((c) => c.id === id)) return drawCard()
    if (state.waste.length && state.waste[state.waste.length - 1].id === id) return choose({ kind: 'waste', r: 0, j: 0 })
    for (let r = 0; r < 7; r++) for (let j = 0; j <= r; j++) if (state.rows[r][j]?.id === id) return choose({ kind: 'row', r, j })
  })
  const drawCard = () => {
    if (over) return
    snapshot()
    sel = null
    if (state.stock.length) {
      const c = state.stock.shift()!
      state.waste.push(c)
    } else if (state.waste.length && state.redeals > 0) {
      state.stock = state.waste.reverse()
      state.waste = []
      state.redeals--
    } else {
      hist.pop()
      return
    }
    env.sfx('click')
    layout()
    hud()
    stuckCheck()
  }
  stockSlot.addEventListener('click', drawCard)
  const undo = () => {
    if (!hist.length || over) return
    state = hist.pop()!
    sel = null
    mk()
    layout()
    hud()
  }
  bar.btn('↶ Undo', undo)
  bar.btn('New', () => {
    state = pyramidDeal(env.rng)
    hist = []
    score = 0
    sel = null
    mk()
    layout()
    hud()
  })
  bar.btn('Finish', () => finish(false))
  mk()
  x.onResize(layout)
  layout()
  hud()
  toast(x, 'Match pairs that add up to 13. Kings go alone.', 2600)
  return () => {}
}

// ================================================================ BLACKJACK
function blackjack(x: X): () => void {
  const { env, t } = x
  const start = byDiff(env, 600, 500, 400)
  const goal = byDiff(env, 1200, 1500, 2000)
  const MIN = 10
  const hitSoft17 = env.difficulty >= 1
  let chips = start
  let bet = 50
  let lastBet = 50
  let shoe: Card[] = shuffled(env.rng, 6)
  let player: Card[] = []
  let dealer: Card[] = []
  let phase: 'bet' | 'play' | 'dealer' | 'done' = 'bet'
  let doubled = false
  let hands = 0
  let wins = 0
  let over = false
  const bar = topBar(x, 3, false)
  const felt = h('div', 'cg-felt', x.root)
  x.root.style.setProperty('--cw', '64px')
  felt.style.background = 'radial-gradient(ellipse at 50% 40%, #1c6b3c, #0d3a21 75%)'
  const dealerBox = h('div', '', felt)
  dealerBox.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px'
  const dHead = h('div', 'cg-row', dealerBox)
  h('span', 'cg-avatar', dHead, t.foes[0] ?? '🎩')
  h('span', 'cg-label', dHead, 'Dealer')
  const dVal = h('span', 'cg-val', dHead, '')
  const dRow = h('div', 'cg-row', dealerBox)
  dRow.style.minHeight = 'calc(var(--cw)*1.45)'
  const msg = h('div', '', felt)
  msg.style.cssText = 'font-size:clamp(18px,4.5vw,28px);font-weight:900;text-shadow:0 2px 6px #000;min-height:34px;text-align:center'
  const pBox = h('div', '', felt)
  pBox.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px'
  const pRow = h('div', 'cg-row', pBox)
  pRow.style.minHeight = 'calc(var(--cw)*1.45)'
  const pHead = h('div', 'cg-row', pBox)
  h('span', 'cg-avatar', pHead, t.hero)
  h('span', 'cg-label', pHead, 'You')
  const pVal = h('span', 'cg-val', pHead, '')
  const ctl = h('div', '', felt)
  ctl.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;width:100%'
  const info = h('div', 'cg-row', ctl)
  const chipsL = h('span', 'cg-val', info)
  const betL = h('span', 'cg-val', info)
  const chipRow = h('div', 'cg-row', ctl)
  const actRow = h('div', 'cg-row', ctl)
  const chipVals = [5, 25, 100, 500]
  const chipCols = ['#d94646', '#2f7de1', '#222', '#8a3fd1']
  const chipEls: HTMLElement[] = []
  chipVals.forEach((v, i) => {
    const c = h('div', 'cg-chip', chipRow, String(v))
    c.style.background = chipCols[i]
    c.addEventListener('click', () => {
      if (phase !== 'bet') return
      if (bet + v <= chips) {
        bet += v
        env.sfx('click')
        render()
      }
    })
    chipEls.push(c)
  })
  const clearB = btn(chipRow, 'Clear', () => {
    if (phase === 'bet') {
      bet = MIN
      render()
    }
  })
  const dealB = btn(actRow, 'Deal', () => deal(), 'pri big')
  const hitB = btn(actRow, 'Hit', () => hit(), 'big')
  const standB = btn(actRow, 'Stand', () => stand(), 'big')
  const dblB = btn(actRow, 'Double', () => dbl(), 'big')
  const cashB = bar.btn('Cash out', () => finish('cash'))
  void cashB
  const draw = (): Card => {
    if (shoe.length < 52) shoe = shuffled(env.rng, 6)
    const c = shoe.pop()!
    c.up = true
    return c
  }
  const shown = new WeakMap<HTMLElement, number>()
  const showCards = (row: HTMLElement, cards: Card[], hideSecond = false) => {
    const prev = cards.length >= (shown.get(row) ?? 0) ? (shown.get(row) ?? 0) : 0
    row.textContent = ''
    cards.forEach((c, i) => {
      const e = cardEl(x, { ...c, up: !(hideSecond && i === 1) }, row)
      if (i >= prev) {
        e.classList.add('deal')
        e.style.animationDelay = `${(i - prev) * 0.1}s`
      }
    })
    shown.set(row, cards.length)
  }
  const render = (hideDealer = phase === 'play') => {
    showCards(pRow, player)
    showCards(dRow, dealer, hideDealer && dealer.length > 1)
    pVal.textContent = player.length ? String(handValue(player).total) + (handValue(player).soft && handValue(player).total < 21 ? ' soft' : '') : ''
    dVal.textContent = dealer.length ? (hideDealer ? String(handValue([dealer[0]]).total) : String(handValue(dealer).total)) : ''
    chipsL.textContent = `Chips ${chips}`
    betL.textContent = `Bet ${bet}`
    const bet_ = phase === 'bet' || phase === 'done'
    chipEls.forEach((c, i) => c.classList.toggle('dis', phase !== 'bet' || bet + chipVals[i] > chips))
    clearB.style.display = phase === 'bet' ? '' : 'none'
    chipRow.style.display = bet_ ? '' : 'none'
    dealB.style.display = bet_ ? '' : 'none'
    dealB.textContent = phase === 'done' ? 'Next hand' : 'Deal'
    hitB.style.display = standB.style.display = dblB.style.display = phase === 'play' ? '' : 'none'
    dblB.disabled = player.length !== 2 || chips < bet * 2
    bar.stat(0, `Chips ${chips}`)
    bar.stat(1, `Hands ${hands}`)
    bar.stat(2, `Goal ${goal}`)
    env.score(chips)
    env.status(`Chips ${chips} · Bet ${bet} · Goal ${goal}`)
  }
  const finish = (why: 'goal' | 'broke' | 'cash') => {
    if (over) return
    over = true
    const won = why === 'goal' || (why === 'cash' && chips > start)
    env.sfx(won ? 'win' : 'lose')
    if (won) confetti(x, 50)
    x.bag.timeout(() => env.end({ score: chips + (won ? 300 * (1 + env.difficulty) : 0), won, text: why === 'goal' ? `Reached ${goal} chips in ${hands} hands` : why === 'broke' ? `Out of chips after ${hands} hands` : `Cashed out with ${chips} chips (${wins} wins)` }), 1500)
  }
  const settle = () => {
    phase = 'done'
    const b = doubled ? bet * 2 : bet
    const r = settleBlackjack(b, player, dealer)
    chips += r.delta
    hands++
    if (r.delta > 0) wins++
    msg.textContent = r.result === 'blackjack' ? `BLACKJACK! +${r.delta}` : r.result === 'win' ? `YOU WIN +${r.delta}` : r.result === 'push' ? 'PUSH' : r.result === 'bust' ? `BUST -${b}` : `DEALER WINS -${b}`
    msg.style.color = r.delta > 0 ? '#ffe066' : r.delta < 0 ? '#ff8a8a' : '#fff'
    env.sfx(r.delta > 0 ? 'point' : r.delta < 0 ? 'lose' : 'click')
    if (r.delta > 0 && b >= 100) confetti(x, 14)
    lastBet = bet
    if (bet > chips) bet = Math.max(MIN, chips)
    render(false)
    if (chips >= goal) x.bag.timeout(() => finish('goal'), 900)
    else if (chips < MIN) x.bag.timeout(() => finish('broke'), 900)
  }
  const dealerPlay = () => {
    phase = 'dealer'
    render(false)
    const step = () => {
      if (over) return
      if (handValue(player).total <= 21 && dealerHits(dealer, hitSoft17)) {
        dealer.push(draw())
        env.sfx('click')
        render(false)
        x.bag.timeout(step, 650)
      } else settle()
    }
    x.bag.timeout(step, 600)
  }
  const deal = () => {
    if (over) return
    if (phase === 'done') {
      phase = 'bet'
      player = []
      dealer = []
      msg.textContent = ''
      bet = Math.min(lastBet, chips)
      render()
      return
    }
    if (bet < MIN || bet > chips) return
    player = [draw(), draw()]
    dealer = [draw(), draw()]
    doubled = false
    msg.textContent = ''
    msg.style.color = '#fff'
    phase = 'play'
    env.sfx('move')
    render()
    if (isBlackjack(player) || isBlackjack(dealer)) {
      x.bag.timeout(() => {
        phase = 'dealer'
        render(false)
        x.bag.timeout(settle, 500)
      }, 500)
    }
  }
  const hit = () => {
    if (phase !== 'play') return
    player.push(draw())
    env.sfx('click')
    if (handValue(player).total > 21) {
      phase = 'dealer'
      render(false)
      x.bag.timeout(settle, 500)
    } else if (handValue(player).total === 21) stand()
    else render()
  }
  const stand = () => {
    if (phase !== 'play') return
    dealerPlay()
  }
  const dbl = () => {
    if (phase !== 'play' || player.length !== 2 || chips < bet * 2) return
    doubled = true
    player.push(draw())
    env.sfx('power')
    render()
    if (handValue(player).total > 21) {
      phase = 'dealer'
      render(false)
      x.bag.timeout(settle, 500)
    } else dealerPlay()
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.code === 'KeyH') hit()
    else if (e.code === 'KeyS') stand()
    else if (e.code === 'KeyD') dbl()
    else if (e.code === 'Enter' || e.code === 'Space') {
      if (phase === 'bet' || phase === 'done') deal()
    }
  }
  window.addEventListener('keydown', onKey)
  render()
  toast(x, `Beat the dealer · reach ${goal} chips`, 2200)
  return () => window.removeEventListener('keydown', onKey)
}

// ================================================================ VIDEO POKER
function videoPoker(x: X): () => void {
  const { env } = x
  const start = 100
  const goal = byDiff(env, 100, 130, 170)
  const MAXH = 30
  let credits = start
  let bet = 5
  let deck: Card[] = []
  let hand: Card[] = []
  let held: boolean[] = [false, false, false, false, false]
  let phase: 'bet' | 'hold' = 'bet'
  let hands = 0
  let lastWin = 0
  let bestWin = 0
  let over = false
  let lastHand: PokerHand | null = null
  const bar = topBar(x, 3, false)
  const felt = h('div', 'cg-felt', x.root)
  x.root.style.setProperty('--cw', '66px')
  felt.style.background = 'radial-gradient(ellipse at 50% 30%, #1d3f8f, #0b1740 80%)'
  const pay = h('div', 'cg-pay', felt)
  const payRows = new Map<string, HTMLElement[]>()
  for (const [name] of PAYTABLE) {
    const a = h('span', '', pay, name)
    const b = h('span', '', pay, '')
    b.style.textAlign = 'right'
    payRows.set(name, [a, b])
  }
  const msg = h('div', '', felt)
  msg.style.cssText = 'font-size:clamp(16px,4vw,26px);font-weight:900;text-shadow:0 2px 6px #000;min-height:30px;text-align:center'
  const row = h('div', 'cg-row', felt)
  row.style.cssText += ';margin-bottom:22px'
  const slots: HTMLElement[] = []
  for (let i = 0; i < 5; i++) {
    const s = h('div', '', row)
    s.style.cssText = 'position:relative;cursor:pointer'
    s.addEventListener('click', () => toggle(i))
    slots.push(s)
  }
  const info = h('div', 'cg-row', felt)
  const credL = h('span', 'cg-val', info)
  const betL = h('span', 'cg-val', info)
  const winL = h('span', 'cg-val', info)
  const acts = h('div', 'cg-row', felt)
  const b1 = btn(acts, 'Bet 1', () => setBet(bet >= 5 ? 1 : bet + 1))
  const bmax = btn(acts, 'Bet max', () => {
    setBet(5)
    go()
  })
  const goB = btn(acts, 'Deal', () => go(), 'pri big')
  const hintB = btn(acts, '💡 Hint', () => hint())
  bar.btn('Cash out', () => finish(false))
  const render = () => {
    for (let i = 0; i < 5; i++) {
      slots[i].textContent = ''
      if (hand[i]) {
        const e = cardEl(x, { ...hand[i], up: true }, slots[i])
        e.classList.toggle('sel', held[i] && phase === 'hold')
        if (phase === 'hold' && held[i]) h('div', 'cg-hold', slots[i], 'HELD')
      } else {
        const c: Card = { id: 900 + i, suit: 0, rank: 1, up: false }
        cardEl(x, c, slots[i])
      }
    }
    credL.textContent = `Credits ${credits}`
    betL.textContent = `Bet ${bet}`
    winL.textContent = `Win ${lastWin}`
    for (const [name, [a, b]] of payRows) {
      const base = PAYTABLE.find(([n]) => n === name)![1]
      b.textContent = String(pokerPay(name as PokerHand, bet) || base * bet)
      const hit = lastHand === name && phase === 'bet'
      a.className = hit ? 'hit' : ''
      b.className = hit ? 'hit' : ''
    }
    goB.textContent = phase === 'bet' ? 'Deal' : 'Draw'
    b1.disabled = phase !== 'bet'
    bmax.disabled = phase !== 'bet'
    hintB.disabled = phase !== 'hold'
    bar.stat(0, `Credits ${credits}`)
    bar.stat(1, `Hand ${hands}/${MAXH}`)
    bar.stat(2, `Goal ${goal}`)
    env.score(Math.max(0, credits) * 10 + bestWin)
    env.status(`Credits ${credits} · Bet ${bet} · Hand ${hands}/${MAXH}`)
  }
  const setBet = (n: number) => {
    if (phase !== 'bet') return
    bet = Math.max(1, Math.min(5, n, credits))
    env.sfx('click')
    render()
  }
  const finish = (forced: boolean) => {
    if (over) return
    over = true
    const won = credits >= goal
    env.sfx(won ? 'win' : 'lose')
    if (won) confetti(x, 50)
    const sc = Math.max(0, credits) * 10 + bestWin + (won ? 300 * (1 + env.difficulty) : 0)
    env.score(sc)
    x.bag.timeout(() => env.end({ score: sc, won, text: `${credits} credits after ${hands} hands${forced ? '' : ''}` }), 1200)
  }
  const toggle = (i: number) => {
    if (phase !== 'hold') return
    held[i] = !held[i]
    env.sfx('click')
    render()
  }
  const hint = () => {
    const mask = suggestHold(hand, deck, env.rng)
    held = mask
    toast(x, 'Suggested holds', 900)
    render()
  }
  const go = () => {
    if (over) return
    if (phase === 'bet') {
      if (credits < bet) bet = Math.max(1, credits)
      if (credits < 1) return finish(true)
      credits -= bet
      deck = shuffled(env.rng)
      hand = deck.splice(0, 5).map((c) => ({ ...c, up: true }))
      held = [false, false, false, false, false]
      phase = 'hold'
      lastWin = 0
      lastHand = null
      msg.textContent = 'Tap cards to HOLD, then DRAW'
      msg.style.color = '#fff'
      env.sfx('move')
      render()
      return
    }
    for (let i = 0; i < 5; i++) if (!held[i]) hand[i] = { ...deck.pop()!, up: true }
    phase = 'bet'
    hands++
    const res = evalPoker(hand)
    const win = pokerPay(res, bet)
    lastHand = res
    lastWin = win
    credits += win
    bestWin = Math.max(bestWin, win * 10)
    msg.textContent = win ? `${res.toUpperCase()}! +${win}` : 'No win'
    msg.style.color = win ? '#ffe066' : '#c9d4ff'
    env.sfx(win ? 'point' : 'click')
    if (win >= bet * 6) confetti(x, 30)
    render()
    if (credits < 1) x.bag.timeout(() => finish(true), 900)
    else if (hands >= MAXH) x.bag.timeout(() => finish(true), 900)
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.code === 'Enter' || e.code === 'Space') go()
    else if (/^Digit[1-5]$/.test(e.code)) toggle(+e.code.slice(5) - 1)
  }
  window.addEventListener('keydown', onKey)
  render()
  toast(x, `Jacks or Better · finish ${MAXH} hands with ${goal}+ credits`, 2600)
  return () => window.removeEventListener('keydown', onKey)
}

// ================================================================ WAR
function war(x: X): () => void {
  const { env, t } = x
  const ROUNDS = 80
  const d = shuffled(env.rng)
  d.forEach((c) => (c.up = true))
  let a = d.slice(0, 26)
  let b = d.slice(26)
  let round = 0
  let streak = 0
  let best = 0
  let over = false
  let auto = false
  let busy = false
  const bar = topBar(x, 3, false)
  const felt = h('div', 'cg-felt', x.root)
  x.root.style.setProperty('--cw', '76px')
  felt.style.background = 'radial-gradient(ellipse at 50% 45%, #3a1d5c, #170b2c 80%)'
  const foeRow = h('div', 'cg-row', felt)
  h('span', 'cg-avatar', foeRow, t.foes[0] ?? '🤖')
  h('span', 'cg-label', foeRow, 'Rival')
  const bCount = h('span', 'cg-val', foeRow)
  const mid = h('div', 'cg-row', felt)
  mid.style.minHeight = 'calc(var(--cw)*1.5)'
  mid.style.gap = 'calc(var(--cw)*.5)'
  const msg = h('div', '', felt)
  msg.style.cssText = 'font-size:clamp(16px,4vw,26px);font-weight:900;text-shadow:0 2px 6px #000;min-height:32px;text-align:center'
  const meRow = h('div', 'cg-row', felt)
  h('span', 'cg-avatar', meRow, t.hero)
  h('span', 'cg-label', meRow, 'You')
  const aCount = h('span', 'cg-val', meRow)
  const acts = h('div', 'cg-row', felt)
  btn(acts, 'Flip!', () => flip(), 'pri big')
  const autoB = btn(acts, 'Auto', () => {
    auto = !auto
    autoB.classList.toggle('pri', auto)
    if (auto) flip()
  }, 'big')
  bar.btn('Finish', () => finish())
  const hud = () => {
    aCount.textContent = `${a.length} cards`
    bCount.textContent = `${b.length} cards`
    bar.stat(0, `You ${a.length}`)
    bar.stat(1, `Round ${round}/${ROUNDS}`)
    bar.stat(2, `Streak ${streak}`)
    env.score(a.length * 10 + best * 20)
    env.status(`${a.length} vs ${b.length} · round ${round}/${ROUNDS}`)
  }
  const finish = () => {
    if (over) return
    over = true
    const won = a.length > b.length
    const sc = a.length * 10 + best * 20 + (won ? 400 * (1 + env.difficulty) : 0)
    env.score(sc)
    env.sfx(won ? 'win' : 'lose')
    if (won) confetti(x, 50)
    x.bag.timeout(() => env.end({ score: sc, won, text: `${a.length} - ${b.length} cards after ${round} rounds` }), 1200)
  }
  const flip = () => {
    if (over || busy) return
    busy = true
    round++
    const r = warRound(a, b, env.rng)
    mid.textContent = ''
    const ca = cardEl(x, { ...r.played[0], up: true }, mid)
    const cb = cardEl(x, { ...r.played[1], up: true }, mid)
    ca.classList.add('deal')
    cb.classList.add('deal')
    env.sfx('move')
    x.bag.timeout(() => {
      a = r.a
      b = r.b
      if (r.winner === 0) {
        streak++
        best = Math.max(best, streak)
        ca.classList.add('sel')
        msg.textContent = r.war ? 'WAR! You win' : 'You win the round'
        env.sfx('point')
      } else if (r.winner === 1) {
        streak = 0
        cb.classList.add('sel')
        msg.textContent = r.war ? 'WAR! Rival wins' : 'Rival wins the round'
        env.sfx('hit')
      } else msg.textContent = 'Tie'
      if (r.war) {
        shakeNow()
      }
      hud()
      busy = false
      if (!a.length || !b.length || round >= ROUNDS) finish()
      else if (auto) x.bag.timeout(flip, 450)
    }, 450)
  }
  const shakeNow = () => {
    mid.style.animation = 'cgshake .3s'
    x.bag.timeout(() => (mid.style.animation = ''), 320)
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'Enter') flip()
  }
  window.addEventListener('keydown', onKey)
  hud()
  toast(x, 'Higher card wins both. Ties start a WAR!', 2400)
  return () => window.removeEventListener('keydown', onKey)
}

// ================================================================ HIGHER / LOWER
function higherLower(x: X): () => void {
  const { env } = x
  const deck = shuffled(env.rng)
  deck.forEach((c) => (c.up = true))
  let cur = deck.pop()!
  let lives = byDiff(env, 5, 4, 3)
  let streak = 0
  let best = 0
  let score = 0
  let over = false
  let busy = false
  const bar = topBar(x, 3, false)
  const felt = h('div', 'cg-felt', x.root)
  x.root.style.setProperty('--cw', '92px')
  felt.style.background = 'radial-gradient(ellipse at 50% 40%, #1b5a63, #0a2a31 80%)'
  const hearts = h('div', '', felt)
  hearts.style.cssText = 'font-size:24px;min-height:30px'
  const row = h('div', 'cg-row', felt)
  row.style.gap = 'calc(var(--cw)*.4)'
  row.style.minHeight = 'calc(var(--cw)*1.5)'
  const msg = h('div', '', felt)
  msg.style.cssText = 'font-size:clamp(16px,4vw,26px);font-weight:900;text-shadow:0 2px 6px #000;min-height:32px;text-align:center'
  const prob = h('div', 'cg-sub', felt)
  const acts = h('div', 'cg-row', felt)
  const hiB = btn(acts, '▲ Higher', () => guess(1), 'pri big')
  const loB = btn(acts, '▼ Lower', () => guess(-1), 'big')
  bar.btn('Finish', () => finish(false))
  const show = (next?: Card) => {
    row.textContent = ''
    const a = cardEl(x, cur, row)
    a.classList.add('deal')
    if (next) cardEl(x, next, row).classList.add('deal')
    else cardEl(x, { ...deck[deck.length - 1], up: false }, row)
  }
  const odds = () => {
    const hi = deck.filter((c) => c.rank > cur.rank).length
    const lo = deck.filter((c) => c.rank < cur.rank).length
    return { hi, lo, n: deck.length }
  }
  const hud = () => {
    hearts.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, byDiff(env, 5, 4, 3) - lives))
    bar.stat(0, `Score ${score}`)
    bar.stat(1, `Streak ${streak}`)
    bar.stat(2, `Deck ${deck.length}`)
    env.score(score)
    env.status(`Lives ${lives} · streak ${streak} · ${deck.length} cards left`)
    const o = odds()
    prob.textContent = env.difficulty === 0 && o.n ? `Higher ${Math.round((o.hi / o.n) * 100)}% · Lower ${Math.round((o.lo / o.n) * 100)}%` : ''
  }
  const finish = (won: boolean) => {
    if (over) return
    over = true
    const sc = score + (won ? 500 * (1 + env.difficulty) : 0)
    env.score(sc)
    env.sfx(won ? 'win' : 'lose')
    if (won) confetti(x, 50)
    x.bag.timeout(() => env.end({ score: sc, won, text: won ? `Cleared the deck, best streak ${best}` : `Best streak ${best}` }), 1000)
  }
  const guess = (dir: 1 | -1) => {
    if (over || busy || !deck.length) return
    busy = true
    const next = deck.pop()!
    show(next)
    const ok = next.rank === cur.rank ? null : dir === 1 ? next.rank > cur.rank : next.rank < cur.rank
    x.bag.timeout(() => {
      if (ok === null) {
        msg.textContent = 'Same rank: push'
        msg.style.color = '#fff'
        env.sfx('click')
      } else if (ok) {
        streak++
        best = Math.max(best, streak)
        const pts = 100 + (streak - 1) * 50
        score += pts
        msg.textContent = `Correct! +${pts}`
        msg.style.color = '#ffe066'
        env.sfx('point')
        if (streak % 5 === 0) confetti(x, 20)
      } else {
        lives--
        streak = 0
        msg.textContent = 'Wrong!'
        msg.style.color = '#ff8a8a'
        env.sfx('lose')
      }
      cur = next
      hud()
      busy = false
      if (lives <= 0) finish(false)
      else if (!deck.length) finish(true)
      else show()
    }, 650)
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') guess(1)
    else if (e.code === 'ArrowDown' || e.code === 'KeyS') guess(-1)
  }
  window.addEventListener('keydown', onKey)
  void hiB
  void loB
  show()
  hud()
  toast(x, 'Will the next card be higher or lower?', 2200)
  return () => window.removeEventListener('keydown', onKey)
}

// ================================================================ DECK-BUILDER RUN
const TYPE_COL: Record<string, string> = { attack: '#d9534f', skill: '#3b82d6', power: '#9b59d0' }
function deckBuilder(x: X): () => void {
  const { env, t } = x
  const rng = env.rng
  const maxHp = byDiff(env, 90, 75, 60)
  const run = { floor: 1, hp: maxHp, maxHp, deck: STARTER.slice(), score: 0, kills: 0 }
  let combat: Combat
  let busy = false
  let over = false
  let selected = -1
  let view: Combat | null = null
  const bar = topBar(x, 3, false)
  const root = h('div', 'cg-db', x.root)
  root.style.cssText = 'position:absolute;left:0;right:0;top:44px;bottom:0;display:flex;flex-direction:column;overflow:hidden'
  const st = root
  void st
  const enemyRow = h('div', '', root)
  enemyRow.style.cssText = 'flex:1;display:flex;justify-content:center;align-items:flex-end;gap:10px;padding:8px;min-height:0'
  const midRow = h('div', '', root)
  midRow.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 8px;padding:4px 10px'
  const handRow = h('div', 'hand', root)
  const setHW = () => {
    const w = root.clientWidth || 360
    root.style.setProperty('--hw', `${Math.max(74, Math.min(124, Math.floor((w - 24) / 5.1)))}px`)
  }
  x.onResize(() => {
    setHW()
    render()
  })
  const icon = (id: string) => {
    let hsh = 0
    for (const ch of id) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0
    return t.items[hsh % t.items.length]
  }
  const intentText = (e: Enemy, c: Combat): string => {
    const it: Intent = e.intent
    if (it.k === 'attack') {
      const n = Math.max(0, Math.floor((it.n + e.str) * (e.weak > 0 ? 0.75 : 1) * (c.player.vuln > 0 ? 1.5 : 1)))
      return `⚔️ ${n}${it.times ? `×${it.times}` : ''}`
    }
    if (it.k === 'block') return `🛡️ ${it.n}`
    if (it.k === 'buff') return '💪 Buff'
    if (it.k === 'weak') return '🥀 Curse'
    if (it.k === 'vuln') return '💢 Expose'
    return `💚 ${it.n}`
  }
  const status = (e: { str: number; vuln: number; weak: number }, parent: HTMLElement) => {
    if (e.str) h('span', 'cgbadge', parent, `💪${e.str}`)
    if (e.vuln > 0) h('span', 'cgbadge', parent, `💢${e.vuln}`)
    if (e.weak > 0) h('span', 'cgbadge', parent, `🥀${e.weak}`)
  }
  let enemyEls: HTMLElement[] = []
  let playerEl: HTMLElement | null = null
  const render = (c: Combat = view ?? combat) => {
    enemyRow.textContent = ''
    enemyEls = []
    const targeting = selected >= 0 && c.hand[selected] && CARD_BY_ID.get(c.hand[selected])!.target === 'enemy' && livingEnemies(c).length > 1
    c.enemies.forEach((e, i) => {
      const box = h('div', `en${e.dead ? ' dead' : ''}${targeting && !e.dead ? ' target' : ''}`, enemyRow)
      const it = h('div', 'intent', box, e.dead ? '' : intentText(e, c))
      if (e.dead) it.style.visibility = 'hidden'
      const face = h('div', '', box)
      face.style.cssText = `font-size:${e.def.boss ? 86 : 62}px;line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.5))`
      face.textContent = t.foes[e.skin % t.foes.length] ?? '👾'
      if (e.def.boss) {
        const crown = h('div', '', box, '👑')
        crown.style.cssText = 'position:absolute;top:18px;font-size:28px'
      }
      const hp = h('div', 'bar', box)
      h('i', '', hp).style.width = `${Math.max(0, (e.hp / e.maxHp) * 100)}%`
      const row = h('div', '', box)
      row.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:center'
      h('span', 'cgbadge', row, `${e.hp}/${e.maxHp}`)
      if (e.block) h('span', 'cgbadge', row, `🛡️${e.block}`)
      status(e, row)
      h('span', 'cg-sub', box, e.def.name)
      box.addEventListener('click', () => onEnemy(i))
      enemyEls.push(box)
    })
    midRow.textContent = ''
    const left = h('div', '', midRow)
    left.style.cssText = 'display:flex;align-items:center;gap:8px'
    playerEl = h('div', '', left)
    playerEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px;position:relative;min-width:80px'
    h('div', '', playerEl, t.hero).style.cssText = 'font-size:50px;line-height:1'
    const pb = h('div', 'bar p', playerEl)
    h('i', '', pb).style.width = `${Math.max(0, (c.player.hp / c.player.maxHp) * 100)}%`
    const prow = h('div', '', playerEl)
    prow.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:center'
    h('span', 'cgbadge', prow, `❤️${c.player.hp}/${c.player.maxHp}`)
    if (c.player.block) h('span', 'cgbadge', prow, `🛡️${c.player.block}`)
    status(c.player, prow)
    const orb = h('div', 'orb', left, `${c.player.energy}/${c.player.maxEnergy}`)
    orb.title = 'Energy'
    const piles = h('div', '', midRow)
    piles.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap'
    btn(piles, `Draw ${c.draw.length}`, () => showPile('Draw pile', c.draw), '')
    btn(piles, `Discard ${c.discard.length}`, () => showPile('Discard pile', c.discard), '')
    btn(piles, 'End turn', () => doEnd(), 'pri big')
    handRow.textContent = ''
    c.hand.forEach((id, i) => {
      const d = CARD_BY_ID.get(id)!
      const el = h('div', `dc${i === selected ? ' sel' : ''}${d.cost > c.player.energy ? ' dim' : ''}`, handRow)
      el.style.setProperty('--tc', TYPE_COL[d.type])
      h('div', 'cost', el, String(d.cost))
      h('div', 'nm', el, d.name)
      h('div', 'ic', el, icon(d.id))
      h('div', 'ty', el, d.type)
      h('div', 'ds', el, d.desc)
      el.addEventListener('click', () => onCard(i))
    })
    bar.stat(0, `Floor ${run.floor}/${FLOORS}`)
    bar.stat(1, `HP ${c.player.hp}/${c.player.maxHp}`)
    bar.stat(2, `Deck ${run.deck.length}`)
    env.score(run.score)
    env.status(`Floor ${run.floor}/${FLOORS} · HP ${c.player.hp} · turn ${c.turn}`)
  }
  const showPile = (title: string, ids: string[]) => {
    const counts = new Map<string, number>()
    for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1)
    overlay(x, title, [...counts].map(([id, n]) => `${n}× ${CARD_BY_ID.get(id)!.name} (${CARD_BY_ID.get(id)!.cost})`), [['Close', () => {}]])
  }
  const floatAt = (el: HTMLElement | null | undefined, s: string, color: string) => {
    if (!el) return
    const f = h('div', 'float', el, s)
    f.style.color = color
    x.bag.timeout(() => f.remove(), 950)
  }
  const shakeEl = (el: HTMLElement | null | undefined) => {
    if (!el) return
    el.classList.add('shake')
    x.bag.timeout(() => el.classList.remove('shake'), 320)
  }
  const showEv = (ev: Ev[], stagger = 0) => {
    ev.forEach((e, i) => {
      x.bag.timeout(() => {
        const el = e.k === 'draw' ? null : e.to === 'p' ? playerEl : enemyEls[e.to]
        if (e.k === 'dmg') {
          floatAt(el, e.n ? `-${e.n}` : 'Blocked', e.n ? '#ff6b6b' : '#9be7ff')
          shakeEl(el)
          env.sfx(e.to === 'p' ? 'hit' : 'point')
        } else if (e.k === 'block') floatAt(el, `+${e.n}🛡️`, '#9be7ff')
        else if (e.k === 'heal') floatAt(el, `+${e.n}`, '#7cfc9a')
        else if (e.k === 'buff') floatAt(el, e.what, '#ffe066')
        else if (e.k === 'die') env.sfx('boom')
      }, i * stagger)
    })
  }
  const onCard = (i: number) => {
    if (busy || over || combat.over) return
    const d = CARD_BY_ID.get(combat.hand[i])
    if (!d) return
    if (d.cost > combat.player.energy) {
      toast(x, 'Not enough energy', 700)
      return
    }
    const alive = livingEnemies(combat)
    if (d.target === 'enemy' && alive.length > 1) {
      selected = selected === i ? -1 : i
      env.sfx('click')
      render()
      if (selected >= 0) toast(x, 'Choose a target', 900)
      return
    }
    play(i, d.target === 'enemy' ? alive[0].id : 0)
  }
  const onEnemy = (i: number) => {
    if (busy || over || selected < 0 || combat.enemies[i].dead) return
    play(selected, i)
  }
  const play = (hi: number, target: number) => {
    const ev = playCard(combat, hi, target, rng)
    selected = -1
    if (!ev) return
    env.sfx('click')
    render()
    showEv(ev, 60)
    if (combat.over === 'win') x.bag.timeout(onWin, 800)
  }
  const doEnd = () => {
    if (busy || over || combat.over) return
    busy = true
    selected = -1
    const before = structuredClone(combat)
    // enemies about to act: render the pre-action state, then animate
    view = before
    render(before)
    const ev = endTurn(combat, rng)
    showEv(ev, 380)
    const total = ev.length * 380 + 300
    x.bag.timeout(() => {
      view = null
      busy = false
      render()
      if (combat.over === 'lose') onLose()
    }, total)
  }
  const onLose = () => {
    if (over) return
    over = true
    env.sfx('lose')
    const sc = run.score
    x.bag.timeout(() => env.end({ score: sc, won: false, text: `Fell on floor ${run.floor} of ${FLOORS}` }), 900)
  }
  const onWin = () => {
    run.hp = combat.player.hp
    run.kills += combat.enemies.length
    run.score += 300 * run.floor + combat.player.hp * 5
    env.sfx('win')
    env.score(run.score)
    if (run.floor >= FLOORS) {
      over = true
      confetti(x, 70)
      const sc = run.score + 1500 + run.hp * 10 + (env.difficulty + 1) * 300
      env.score(sc)
      x.bag.timeout(() => env.end({ score: sc, won: true, text: `Defeated the boss with ${run.hp} HP and a ${run.deck.length}-card deck` }), 1800)
      return
    }
    reward()
  }
  const reward = () => {
    const picks = rewardChoices(rng, run.floor, run.deck)
    const o = h('div', 'cg-center', x.root)
    h('h2', '', o, `Floor ${run.floor} cleared!`)
    h('div', 'cg-sub', o, 'Add a card to your deck')
    const cont = h('div', 'cg-row', o)
    cont.style.alignItems = 'flex-start'
    cont.style.setProperty('--hw', `${Math.min(120, Math.max(86, Math.floor((root.clientWidth - 40) / 3.3)))}px`)
    for (const d of picks) {
      const el = h('div', 'dc', cont)
      el.style.setProperty('--tc', TYPE_COL[d.type])
      h('div', 'cost', el, String(d.cost))
      h('div', 'nm', el, d.name)
      h('div', 'ic', el, icon(d.id))
      h('div', 'ty', el, d.type)
      h('div', 'ds', el, d.desc)
      el.addEventListener('click', () => {
        run.deck.push(d.id)
        o.remove()
        rest()
      })
    }
    btn(o, 'Skip (+10 HP)', () => {
      run.hp = Math.min(run.maxHp, run.hp + 10)
      o.remove()
      rest()
    })
  }
  const rest = () => {
    const heal = Math.round(run.maxHp * 0.3)
    run.hp = Math.min(run.maxHp, run.hp + heal)
    run.floor++
    toast(x, `Rested +${heal} HP`, 1300)
    startFloor()
  }
  const startFloor = () => {
    combat = startCombat(run.deck, run.hp, run.maxHp, floorEnemies(run.floor, rng, env.difficulty), rng, run.floor)
    selected = -1
    view = null
    busy = false
    render()
    toast(x, run.floor === FLOORS ? 'BOSS FLOOR' : `Floor ${run.floor}`, 1400)
  }
  const onKey = (e: KeyboardEvent) => {
    if (/^Digit[1-9]$/.test(e.code)) onCard(+e.code.slice(5) - 1)
    else if (e.code === 'KeyE' || e.code === 'Enter') doEnd()
  }
  window.addEventListener('keydown', onKey)
  setHW()
  startFloor()
  return () => window.removeEventListener('keydown', onKey)
}
void CARDS

// ================================================================ CARD BATTLER
const KW_ICON: Record<string, string> = { swift: '⚡', venom: '☠️', charge: '🏇', shield: '🛡️', regen: '💚', thorns: '🌵', splash: '💥' }
function cardBattler(x: X): () => void {
  const { env, t } = x
  const rng = env.rng
  const { s: s0 } = newGame(buildDeck(rng), buildDeck(rng), rng)
  let s: BState = s0
  s.sides[1].hp = byDiff(env, 24, 30, 34)
  s.sides[1].maxMana = 0
  let selected = -1
  let busy = false
  let over = false
  let dealt = 0
  const bar = topBar(x, 3, false)
  const root = h('div', 'cg-bt', x.root)
  root.style.cssText = 'position:absolute;left:0;right:0;top:44px;bottom:0;display:flex;flex-direction:column;overflow:hidden;gap:2px'
  const foeBar = h('div', '', root)
  const lanesBox = h('div', '', root)
  lanesBox.style.cssText = 'flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:2px 10px;min-height:0'
  const meBar = h('div', '', root)
  const handRow = h('div', 'hand', root)
  handRow.style.cssText = 'display:flex;justify-content:center;align-items:flex-end;gap:4px;padding:6px 6px 8px;overflow-x:auto'
  const setHW = () => {
    const w = root.clientWidth || 360
    const hh = root.clientHeight || 600
    root.style.setProperty('--hw', `${Math.max(80, Math.min(108, Math.floor(w / 6), Math.floor(hh / 6)))}px`)
  }
  const pool = [...t.foes, ...t.heroes.filter((e) => e !== t.hero)]
  const art = (id: string) => {
    let hs = 0
    for (const ch of id) hs = (hs * 31 + ch.charCodeAt(0)) >>> 0
    const c = BCARD_BY_ID.get(id)!
    return c.kind === 'minion' ? pool[hs % pool.length] : t.items[hs % t.items.length]
  }
  const laneEls: HTMLElement[][] = [[], []]
  const heroEls: HTMLElement[] = []
  const handCard = (id: string, parent: HTMLElement, i: number, cur: BState) => {
    const c = BCARD_BY_ID.get(id)!
    const me = cur.sides[0]
    const el = h('div', `dc${i === selected ? ' sel' : ''}${c.cost > me.mana || cur.turn !== 0 ? ' dim' : ''}`, parent)
    el.style.setProperty('--tc', c.kind === 'minion' ? '#c98a2e' : '#8a5cd6')
    h('div', 'cost', el, String(c.cost))
    h('div', 'nm', el, c.name)
    h('div', 'ic', el, art(id))
    if (c.kind === 'minion') {
      const kws = (c.kw ?? []).map((k) => KW_ICON[k]).join('')
      h('div', 'ty', el, kws || 'minion')
    } else h('div', 'ty', el, 'spell')
    h('div', 'ds', el, c.desc)
    if (c.kind === 'minion') {
      const a = h('span', '', el, String(c.atk))
      a.style.cssText = 'position:absolute;left:-6px;bottom:-6px;background:#e0a21b;color:#111;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-weight:900;border:2px solid #fff'
      const hp = h('span', '', el, String(c.hp))
      hp.style.cssText = 'position:absolute;right:-6px;bottom:-6px;background:#d33;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-weight:900;border:2px solid #fff'
    }
    return el
  }
  const minionEl = (m: Minion, parent: HTMLElement, side: 0 | 1) => {
    const el = h('div', 'dc', parent)
    el.style.setProperty('--tc', side === 0 ? t.accent : t.accent2)
    el.style.height = 'calc(var(--hw)*1.25)'
    const c = BCARD_BY_ID.get(m.card)!
    h('div', 'nm', el, c.name)
    h('div', 'ic', el, art(m.card))
    const kws = m.kw.map((k) => KW_ICON[k]).join('') + (m.shield ? '🛡️' : '') + (m.stunned ? '❄️' : '') + (m.sick && side === 0 && !m.kw.includes('charge') ? '💤' : '')
    h('div', 'ty', el, kws || ' ')
    const a = h('span', '', el, String(m.atk))
    a.style.cssText = 'position:absolute;left:-6px;bottom:-6px;background:#e0a21b;color:#111;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-weight:900;border:2px solid #fff'
    const hp = h('span', '', el, String(m.hp))
    hp.style.cssText = `position:absolute;right:-6px;bottom:-6px;background:${m.hp < m.maxHp ? '#e26a2c' : '#d33'};color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-weight:900;border:2px solid #fff`
    return el
  }
  const heroBar = (parent: HTMLElement, side: 0 | 1, cur: BState) => {
    parent.textContent = ''
    parent.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;padding:2px 12px'
    const sd = cur.sides[side]
    const left = h('div', '', parent)
    left.style.cssText = 'display:flex;align-items:center;gap:8px;position:relative'
    const av = h('div', 'cg-avatar', left, side === 0 ? t.hero : t.foes[0] ?? '🎩')
    heroEls[side] = av
    const hp = h('span', 'cg-val', left, `❤️ ${Math.max(0, sd.hp)}`)
    hp.style.color = sd.hp <= 10 ? '#ff8a8a' : '#fff'
    const mid = h('div', '', parent)
    if (side === 1) {
      h('span', 'cg-sub', mid, `Hand ${sd.hand.length} · Deck ${sd.deck.length}`)
    } else {
      h('span', 'cg-sub', mid, `Deck ${sd.deck.length}`)
    }
    const mana = h('div', '', parent)
    mana.style.cssText = 'font-weight:900;font-size:16px;color:#8fd0ff'
    mana.textContent = '◆'.repeat(Math.min(10, sd.mana)) + '◇'.repeat(Math.max(0, Math.min(10, sd.maxMana) - sd.mana))
    if (!mana.textContent) mana.textContent = '◇'
    return av
  }
  const targetsFor = (cur: BState): Set<string> => {
    const out = new Set<string>()
    if (selected < 0) return out
    for (const a of legalActions(cur)) {
      if (a.t === 'play' && a.hand === selected) {
        if (a.target) out.add(`${a.target.side}:${a.target.lane}`)
        else if (a.lane !== undefined) out.add(`lane:${a.lane}`)
      }
    }
    return out
  }
  const render = (cur: BState = s) => {
    setHW()
    const tg = targetsFor(cur)
    heroBar(foeBar, 1, cur)
    heroBar(meBar, 0, cur)
    lanesBox.textContent = ''
    laneEls[0] = []
    laneEls[1] = []
    // each lane is a column: enemy on top, player below
    for (let lane = 0; lane < LANES; lane++) {
      const col = h('div', '', lanesBox)
      col.style.cssText = 'display:flex;flex-direction:column;justify-content:space-around;align-items:center;gap:6px;background:rgba(255,255,255,.05);border-radius:14px;padding:6px 4px'
      for (const side of [1, 0] as const) {
        const slot = h('div', 'cg-slot', col)
        slot.style.position = 'relative'
        slot.style.width = 'var(--hw)'
        slot.style.height = 'calc(var(--hw)*1.25)'
        slot.style.fontSize = '12px'
        laneEls[side][lane] = slot
        const m = cur.sides[side].board[lane]
        const ok = tg.has(`${side}:${lane}`) || (side === 0 && tg.has(`lane:${lane}`))
        if (ok) {
          slot.style.borderColor = '#ffe066'
          slot.style.boxShadow = '0 0 12px #ffe066'
          slot.style.cursor = 'pointer'
        }
        if (m) {
          slot.textContent = ''
          slot.style.border = 'none'
          const e = minionEl(m, slot, side)
          if (tg.has(`${side}:${lane}`)) e.style.boxShadow = '0 0 0 3px #ffe066, 0 0 14px #ffe066'
          if (side === 0 && cur.turn === 0 && !m.sick) e.style.opacity = '1'
        } else slot.textContent = side === 0 ? '+' : ''
        slot.addEventListener('click', () => onSlot(side, lane))
        if (side === 1) {
          const vs = h('div', '', col, '⚔')
          vs.style.cssText = 'opacity:.45;font-size:14px'
        }
      }
    }
    // hero targets
    for (const side of [0, 1] as const) {
      const av = heroEls[side]
      if (tg.has(`${side}:-1`)) {
        av.style.outline = '3px solid #ffe066'
        av.style.borderRadius = '50%'
        av.style.cursor = 'pointer'
      }
      av.addEventListener('click', () => onSlot(side, -1))
    }
    handRow.textContent = ''
    cur.sides[0].hand.forEach((id, i) => {
      const el = handCard(id, handRow, i, cur)
      el.addEventListener('click', () => onHand(i))
    })
    const eb = h('button', 'cg-btn pri big', handRow, cur.turn === 0 ? 'Battle ▶' : '...') as HTMLButtonElement
    eb.disabled = cur.turn !== 0 || busy
    eb.style.cssText += ';min-width:84px;align-self:center'
    eb.addEventListener('click', () => endMyTurn())
    bar.stat(0, `Turn ${Math.ceil(cur.n / 2)}`)
    bar.stat(1, `Mana ${cur.sides[0].mana}/${cur.sides[0].maxMana}`)
    bar.stat(2, `Foe ❤️${Math.max(0, cur.sides[1].hp)}`)
    env.score(dealt * 10)
    env.status(`You ${Math.max(0, cur.sides[0].hp)} - ${Math.max(0, cur.sides[1].hp)} Foe · mana ${cur.sides[0].mana}`)
  }
  const floatAt = (el: HTMLElement | null | undefined, text: string, color: string) => {
    if (!el) return
    const f = h('div', 'float', el, text)
    f.style.color = color
    el.style.position = el.style.position || 'relative'
    x.bag.timeout(() => f.remove(), 950)
  }
  const animate = (before: BState, ev: BEv[], after: BState, done: () => void, gap = 420) => {
    render(before)
    ev.forEach((e, i) => {
      x.bag.timeout(() => {
        if (e.k === 'attack') {
          const el = laneEls[e.side][e.lane]?.firstElementChild as HTMLElement | null
          if (el) {
            el.style.transition = 'transform .15s'
            el.style.transform = `translateY(${e.side === 0 ? -34 : 34}px) scale(1.1)`
            x.bag.timeout(() => (el.style.transform = ''), 160)
          }
          env.sfx('shoot')
        } else if (e.k === 'dmg') {
          const el = e.lane === -1 ? heroEls[e.side] : laneEls[e.side][e.lane]
          floatAt(el, e.n ? `-${e.n}` : 'Shield!', e.n ? '#ff6b6b' : '#9be7ff')
          if (e.side === 1 && e.lane === -1) dealt += e.n
          if (el) {
            el.style.animation = 'cgshake .3s'
            x.bag.timeout(() => (el.style.animation = ''), 320)
          }
          env.sfx('hit')
        } else if (e.k === 'heal') floatAt(e.lane === -1 ? heroEls[e.side] : laneEls[e.side][e.lane], `+${e.n}`, '#7cfc9a')
        else if (e.k === 'die') {
          const el = laneEls[e.side][e.lane]
          if (el) el.style.opacity = '0.25'
          env.sfx('boom')
        } else if (e.k === 'summon') env.sfx('move')
        else if (e.k === 'buff') floatAt(laneEls[e.side][e.lane], '✨', '#ffe066')
      }, i * gap)
    })
    x.bag.timeout(() => {
      render(after)
      done()
    }, ev.length * gap + 250)
  }
  const check = (): boolean => {
    if (s.over === null || over) return false
    over = true
    const won = s.over === 0
    env.sfx(won ? 'win' : 'lose')
    if (won) confetti(x, 60)
    const sc = dealt * 10 + (won ? 1000 * (1 + env.difficulty) + s.sides[0].hp * 20 : 0)
    env.score(sc)
    x.bag.timeout(() => env.end({ score: sc, won, text: won ? `Victory with ${s.sides[0].hp} HP left` : 'Your hero fell' }), 1400)
    return true
  }
  const doAction = (a: Parameters<typeof bApply>[1]) => {
    const before = structuredClone(s)
    const ev = bApply(s, a, rng)
    if (!ev) return false
    selected = -1
    if (a.t === 'play') {
      busy = true
      animate(before, ev, s, () => {
        busy = false
        render()
        check()
      }, 260)
    }
    return true
  }
  const onHand = (i: number) => {
    if (busy || over || s.turn !== 0) return
    const id = s.sides[0].hand[i]
    const c = BCARD_BY_ID.get(id)!
    if (c.cost > s.sides[0].mana) {
      toast(x, 'Not enough mana', 700)
      return
    }
    if (selected === i) {
      selected = -1
      render()
      return
    }
    // spells without a target cast straight away
    if (c.kind === 'spell' && !needsTarget(c)) {
      doAction({ t: 'play', hand: i })
      return
    }
    selected = i
    env.sfx('click')
    render()
    const tg = targetsFor(s)
    if (!tg.size) {
      toast(x, c.kind === 'minion' ? 'No free lane' : 'No valid target', 800)
      selected = -1
      render()
    }
  }
  const onSlot = (side: 0 | 1, lane: number) => {
    if (busy || over || s.turn !== 0 || selected < 0) return
    const c = BCARD_BY_ID.get(s.sides[0].hand[selected])!
    if (c.kind === 'minion') {
      if (side === 0 && lane >= 0) doAction({ t: 'play', hand: selected, lane })
      return
    }
    const target: Target = { side, lane }
    doAction({ t: 'play', hand: selected, target })
  }
  const aiLoop = () => {
    if (over) return
    const a = aiChoose(s, env.difficulty, rng)
    const before = structuredClone(s)
    const ev = bApply(s, a, rng)
    if (!ev) {
      endAi()
      return
    }
    if (a.t === 'end') {
      animate(before, ev, s, () => {
        busy = false
        selected = -1
        render()
        check()
      }, 420)
      return
    }
    animate(before, ev, s, () => {
      if (!check()) x.bag.timeout(aiLoop, 350)
    }, 300)
  }
  const endAi = () => {
    const before = structuredClone(s)
    const ev = bApply(s, { t: 'end' }, rng) ?? []
    animate(before, ev, s, () => {
      busy = false
      render()
      check()
    }, 420)
  }
  const endMyTurn = () => {
    if (busy || over || s.turn !== 0) return
    busy = true
    selected = -1
    const before = structuredClone(s)
    const ev = bApply(s, { t: 'end' }, rng)!
    animate(before, ev, s, () => {
      if (check()) return
      busy = true
      render()
      x.bag.timeout(aiLoop, 500)
    }, 420)
  }
  const onKey = (e: KeyboardEvent) => {
    if (/^Digit[1-8]$/.test(e.code)) onHand(+e.code.slice(5) - 1)
    else if (e.code === 'KeyE' || e.code === 'Enter') endMyTurn()
  }
  window.addEventListener('keydown', onKey)
  x.onResize(() => render())
  render()
  toast(x, 'Play cards into lanes, then Battle. Each lane fights head-on.', 2800)
  return () => window.removeEventListener('keydown', onKey)
}
void LANES
void HERO_HP

// ================================================================ engine
const engine: Engine = {
  start(env) {
    const root = createDom(env.host, env.theme, 'cg')
    const style = document.createElement('style')
    style.textContent = CSS
    root.appendChild(style)
    const bag = new Bag()
    const cbs: ((w: number, h: number) => void)[] = []
    const ro = new ResizeObserver(() => {
      const w = root.clientWidth
      const hh = root.clientHeight
      for (const f of cbs) f(w, hh)
    })
    ro.observe(root)
    const items = env.theme.items
    const x: X = {
      env, root, t: env.theme, bag, back: items[env.seed % items.length] ?? '★',
      onResize: (fn) => void cbs.push(fn),
      size: () => ({ w: root.clientWidth, h: root.clientHeight }),
    }
    const mode: CardMode = pickCardMode(env.name, env.desc, env.mods, env.seed)
    let stop: () => void = () => {}
    switch (mode) {
      case 'solitaire': stop = klondike(x); break
      case 'golf': stop = golfSolitaire(x); break
      case 'pyramid': stop = pyramid(x); break
      case 'blackjack': stop = blackjack(x); break
      case 'poker': stop = videoPoker(x); break
      case 'war': stop = war(x); break
      case 'higher': stop = higherLower(x); break
      case 'deck': stop = deckBuilder(x); break
      case 'battle': stop = cardBattler(x); break
    }
    return {
      destroy() {
        stop()
        ro.disconnect()
        bag.dispose()
        root.remove()
      },
    }
  },
}
export default engine
void sizeOf
