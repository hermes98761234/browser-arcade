// Shared DOM helpers for the "words" engine modes: context, base CSS, on-screen keyboard, topic picking.
import type { Bag, GameEnv, Rng } from '../kit'
import { HANGMAN_TOPICS, type Mark } from './words'

export interface WCtx {
  env: GameEnv
  root: HTMLElement
  bag: Bag
  rng: Rng
  daily: boolean
  css(s: string): void
  /** Global keydown (letters, Enter, Backspace, arrows); ignored when a modifier is held. */
  onKey(fn: (e: KeyboardEvent) => void): void
  finish(score: number, won: boolean, text: string): void
}
export type WMode = (c: WCtx) => void

export function el<T extends HTMLElement = HTMLElement>(tag: string, cls = '', txt = ''): T {
  const e = document.createElement(tag) as T
  if (cls) e.className = cls
  if (txt) e.textContent = txt
  return e
}

export const BASE_CSS = `
.wd{position:absolute;inset:0;container-type:size;display:flex;flex-direction:column;align-items:center;gap:clamp(5px,1.2cqh,12px);padding:clamp(6px,1.4cqh,14px) clamp(8px,2.5cqw,24px);box-sizing:border-box;color:var(--g-fg);background:linear-gradient(160deg,var(--g-bg),var(--g-bg2));font-family:system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:manipulation}
.wd *{box-sizing:border-box}
.wd-top{display:flex;align-items:center;gap:10px;width:100%;max-width:760px;flex:0 0 auto}
.wd-hero{font-size:clamp(26px,5cqh,42px);line-height:1;filter:drop-shadow(0 3px 5px rgba(0,0,0,.35))}
.wd-title{flex:1;min-width:0;font-weight:900;font-size:clamp(13px,2.4cqh,19px);line-height:1.15}
.wd-title small{display:block;font-weight:700;opacity:.7;font-size:.8em}
.wd-chip{padding:4px 10px;border-radius:99px;font-weight:800;font-size:clamp(11px,1.9cqh,14px);background:color-mix(in srgb,var(--g-fg) 12%,transparent);white-space:nowrap}
.wd-msg{min-height:clamp(20px,3.4cqh,28px);font-weight:800;font-size:clamp(13px,2.3cqh,18px);text-align:center;flex:0 0 auto}
.wd-msg.ok{color:var(--g-good)}.wd-msg.no{color:var(--g-danger)}
.wd-main{flex:1 1 auto;min-height:0;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(6px,1.4cqh,14px)}
.wd-act{border:0;border-radius:12px;padding:0 16px;min-height:42px;font:inherit;font-weight:800;font-size:clamp(12px,2.2cqh,16px);cursor:pointer;color:#fff;background:var(--g-accent);text-shadow:0 1px 2px rgba(0,0,0,.35);transition:transform .1s,opacity .2s}
.wd-act:active:not(:disabled){transform:scale(.96)}
.wd-act.alt{background:var(--g-accent2)}.wd-act.dim{background:color-mix(in srgb,var(--g-fg) 25%,var(--g-bg2))}
.wd-act:disabled{opacity:.35;cursor:default}
.wd-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center}
.wd-kb{display:flex;flex-direction:column;gap:clamp(4px,.9cqh,8px);width:100%;max-width:560px;flex:0 0 auto}
.wd-kr{display:flex;gap:clamp(3px,.8cqw,6px);justify-content:center}
.wd-key{flex:1 1 0;max-width:52px;min-width:0;height:clamp(40px,6.4cqh,54px);border:0;border-radius:9px;font:inherit;font-weight:800;font-size:clamp(13px,2.4cqh,19px);cursor:pointer;color:var(--g-fg);background:color-mix(in srgb,var(--g-fg) 18%,transparent);padding:0;touch-action:manipulation}
.wd-key.wide{flex:1.6 1 0;max-width:84px;font-size:clamp(11px,1.9cqh,14px)}
.wd-key:active{transform:scale(.93)}
.wd-key.g{background:var(--g-good);color:#fff}.wd-key.y{background:#e0a800;color:#fff}.wd-key.x{background:color-mix(in srgb,var(--g-fg) 38%,var(--g-bg));opacity:.55}
`

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

export interface Keyboard {
  el: HTMLElement
  mark(letter: string, m: Mark): void
  reset(): void
}

/** On-screen QWERTY keyboard. onKey receives 'a'..'z', 'Enter' or 'Backspace'. */
export function keyboard(parent: HTMLElement, onKey: (k: string) => void, enter = true): Keyboard {
  const root = el('div', 'wd-kb')
  const keys = new Map<string, HTMLButtonElement>()
  const mk = (label: string, k: string, cls = '') => {
    const b = el<HTMLButtonElement>('button', `wd-key ${cls}`, label)
    b.type = 'button'
    b.onclick = () => onKey(k)
    b.addEventListener('pointerdown', (e) => e.preventDefault())
    return b
  }
  ROWS.forEach((r, i) => {
    const row = el('div', 'wd-kr')
    if (i === 2) row.append(enter ? mk('ENTER', 'Enter', 'wide') : Object.assign(mk('', '', 'wide'), { style: 'visibility:hidden' }))
    for (const c of r) {
      const b = mk(c.toUpperCase(), c)
      keys.set(c, b)
      row.appendChild(b)
    }
    if (i === 2) row.append(mk('⌫', 'Backspace', 'wide'))
    root.appendChild(row)
  })
  parent.appendChild(root)
  const rank = { x: 1, y: 2, g: 3 }
  return {
    el: root,
    mark(letter, m) {
      const b = keys.get(letter.toLowerCase())
      if (!b) return
      const cur = (['g', 'y', 'x'] as const).find((c) => b.classList.contains(c))
      if (cur && rank[cur] >= rank[m]) return
      b.classList.remove('g', 'y', 'x')
      b.classList.add(m)
    },
    reset() {
      for (const b of keys.values()) b.classList.remove('g', 'y', 'x')
    },
  }
}

/** Map a keydown event to our key vocabulary, or null. */
export function keyName(e: KeyboardEvent): string | null {
  if (e.key === 'Enter') return 'Enter'
  if (e.key === 'Backspace' || e.key === 'Delete') return 'Backspace'
  if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) return e.key.toLowerCase()
  return null
}

const NAME_TOPICS: [RegExp, string][] = [
  [/animal|safari|zoo|pet|bird|parrot|dino|insect|bug/, 'animals'],
  [/food|cook|candy|sweet|bake|menu|fruit|pizza/, 'food'],
  [/nature|forest|garden|flower|tree|ocean|sea\b|river/, 'nature'],
  [/space|science|robot|atom|lab|planet/, 'science'],
  [/sport|game|ball|race|olymp/, 'sports'],
  [/travel|trip|journey|map|ship|train|pirate/, 'travel'],
  [/home|house|kitchen|room/, 'home'],
  [/music|song|band/, 'music'],
  [/color|colour|paint|rainbow/, 'colours'],
  [/cloth|fashion|wear/, 'clothes'],
]
const THEME_TOPICS: Record<string, string> = {
  space: 'science', robot: 'science', ocean: 'animals', jungle: 'animals', dino: 'animals', insects: 'animals', arctic: 'animals', nature: 'nature',
  candy: 'food', cozy: 'home', sports: 'sports', pirate: 'travel', western: 'animals', steampunk: 'science', cyberpunk: 'science',
}

export function topicFor(env: GameEnv, rng: Rng, pool: string[] = HANGMAN_TOPICS): string {
  const s = `${env.name} ${env.desc}`.toLowerCase()
  for (const [re, t] of NAME_TOPICS) if (re.test(s) && pool.includes(t)) return t
  const th = THEME_TOPICS[env.theme.id]
  if (th && pool.includes(th) && rng.chance(0.6)) return th
  return rng.pick(pool)
}

export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export type Sub = 'wordle' | 'hangman' | 'hive' | 'cipher' | 'crossword' | 'search'

export function pickSub(mods: Set<string>, text: string): Sub {
  const s = text.toLowerCase()
  if (mods.has('wordle') || /wordle|pentad|five-letter|5-letter/.test(s)) return 'wordle'
  if (mods.has('crossword') || /crossword/.test(s)) return 'crossword'
  if (mods.has('hangman') || /hangman/.test(s)) return 'hangman'
  if (mods.has('cipher') || /cipher|cryptogram|crypt|caesar|morse|atbash|vigen|decod|telegraph|codeword|polybius|pigpen|playfair|rail fence/.test(s)) return 'cipher'
  if (mods.has('anagram') || /anagram|hive|spelling|boggle|bubbles|scrabble|bomb|make words|unscramble/.test(s)) return 'hive'
  return 'search'
}
