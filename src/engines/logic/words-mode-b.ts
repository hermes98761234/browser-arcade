// Words engine modes: hive (anagram / spelling bee) and cipher.
import { byDiff } from '../kit'
import { buildHive, makeCipher, MORSE, pickProverbs, wordScore, type CipherKind, type CipherPuzzle } from './words'
import { el, fmtTime, keyboard, keyName, type WCtx } from './words-ui'

const HIVE_CSS = `
.wd-cur{min-height:clamp(36px,6cqh,50px);font-weight:900;font-size:clamp(22px,4.6cqh,36px);letter-spacing:.12em;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:0}
.wd-cur i{font-style:normal;color:var(--g-accent)}
.wd-cur::after{content:"";width:3px;height:1em;background:var(--g-accent);margin-left:3px;animation:wd-blink 1s steps(2) infinite}
@keyframes wd-blink{50%{opacity:0}}
.wd-hive{position:relative;width:clamp(190px,min(34cqh,70cqw),300px);aspect-ratio:1;flex:0 0 auto}
.wd-hex{position:absolute;width:32%;aspect-ratio:1.1547;transform:translate(-50%,-50%);clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%);border:0;background:color-mix(in srgb,var(--g-fg) 20%,transparent);color:var(--g-fg);font:inherit;font-weight:900;font-size:clamp(20px,4.6cqh,34px);text-transform:uppercase;cursor:pointer;display:grid;place-items:center;padding:0;transition:transform .1s}
.wd-hex.c{background:var(--g-accent);color:#fff}
.wd-hex:active{transform:translate(-50%,-50%) scale(.9)}
.wd-bar{width:100%;max-width:520px;height:12px;border-radius:8px;background:color-mix(in srgb,var(--g-fg) 14%,transparent);position:relative;overflow:hidden;flex:0 0 auto}
.wd-bar i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,var(--g-accent),var(--g-accent2));border-radius:8px;transition:width .4s}
.wd-found{width:100%;max-width:560px;flex:1 1 0;min-height:36px;overflow:auto;display:flex;flex-wrap:wrap;gap:5px 8px;align-content:flex-start;justify-content:center;padding:4px}
.wd-found span{padding:3px 9px;border-radius:99px;background:color-mix(in srgb,var(--g-fg) 12%,transparent);font-weight:700;font-size:clamp(11px,1.9cqh,14px);text-transform:uppercase}
.wd-found span.pan{background:var(--g-accent2);color:#fff}
`

const RANKS: [string, number][] = [['Beginner', 0], ['Good Start', 0.08], ['Moving Up', 0.2], ['Good', 0.33], ['Solid', 0.45], ['Nice', 0.6], ['Great', 0.75], ['Genius', 0.9]]

export function hive(c: WCtx) {
  const { env, root } = c
  c.css(HIVE_CSS)
  const h = buildHive(c.rng, 12)
  const timed = env.mods.has('fast') || /blitz|bomb|speed/i.test(env.name)
  const total = byDiff(env, 150, 120, 90)
  let left = total
  let letters = [...h.letters.filter((l) => l !== h.center)]
  c.rng.shuffle(letters)
  let cur = ''
  let score = 0
  let over = false
  let hints = byDiff(env, 4, 3, 2)
  const found: string[] = []
  const valid = new Set(h.words)

  const top = el('div', 'wd-top')
  const info = el('div', 'wd-title')
  info.append(env.name, el('small', '', timed ? 'Beat the clock: find words with the centre letter' : 'Words of 4+ letters, always using the centre letter'))
  const chip = el('div', 'wd-chip')
  top.append(el('div', 'wd-hero', env.theme.hero), info, chip)
  const bar = el('div', 'wd-bar')
  const fill = el('i')
  bar.appendChild(fill)
  const rankEl = el('div', 'wd-chip')
  const foundEl = el('div', 'wd-found')
  const msg = el('div', 'wd-msg')
  const curEl = el('div', 'wd-cur')
  const hiveEl = el('div', 'wd-hive')
  const acts = el('div', 'wd-row')
  const mkBtn = (t: string, cls: string, f: () => void) => {
    const b = el<HTMLButtonElement>('button', `wd-act ${cls}`, t)
    b.type = 'button'
    b.onclick = f
    b.addEventListener('pointerdown', (e) => e.preventDefault())
    acts.appendChild(b)
    return b
  }
  const main = el('div', 'wd-main')
  const del = mkBtn('Delete', 'dim', () => press('Backspace'))
  void del
  mkBtn('Shuffle ↻', 'alt', () => shuffle())
  mkBtn('Enter', '', () => press('Enter'))
  const hintBtn = mkBtn('', 'alt', () => hint())
  mkBtn('Finish', 'dim', () => finish())
  main.append(rankEl, bar, curEl, hiveEl, msg, acts)
  root.append(top, main, foundEl)

  const POS = [[50, 50], [50, 17], [78.5, 33.5], [78.5, 66.5], [50, 83], [21.5, 66.5], [21.5, 33.5]]
  const drawHive = () => {
    hiveEl.textContent = ''
    const all = [h.center, ...letters]
    all.forEach((l, i) => {
      const b = el<HTMLButtonElement>('button', `wd-hex${i === 0 ? ' c' : ''}`, l)
      b.type = 'button'
      b.style.left = `${POS[i][0]}%`
      b.style.top = `${POS[i][1]}%`
      b.addEventListener('pointerdown', (e) => e.preventDefault())
      b.onclick = () => press(l)
      hiveEl.appendChild(b)
    })
  }
  const shuffle = () => {
    letters = c.rng.shuffle([...letters])
    drawHive()
  }
  const paintCur = () => {
    curEl.textContent = ''
    for (const ch of cur) curEl.append(ch === h.center ? Object.assign(el('i'), { textContent: ch }) : ch)
  }
  const say = (s: string, cls = '') => {
    msg.textContent = s
    msg.className = `wd-msg ${cls}`
  }
  const refresh = () => {
    const pct = h.maxScore ? score / h.maxScore : 0
    let rank = RANKS[0][0]
    for (const [n, t] of RANKS) if (pct >= t) rank = n
    rankEl.textContent = `${rank} · ${score} pts`
    fill.style.width = `${Math.min(100, pct * 100)}%`
    chip.textContent = timed ? `⏱ ${fmtTime(left)}` : `${found.length}/${h.words.length}`
    hintBtn.textContent = `Hint ×${hints}`
    hintBtn.disabled = hints <= 0 || over
    env.score(score)
    env.status(timed ? `${found.length} words · ${fmtTime(left)}` : `${found.length}/${h.words.length} words`)
    foundEl.textContent = ''
    for (const w of [...found].reverse()) foundEl.appendChild(el('span', h.pangrams.includes(w) ? 'pan' : '', w))
  }
  const submit = () => {
    const w = cur.toLowerCase()
    if (w.length < 4) return bad('Too short')
    if (!w.includes(h.center)) return bad('Missing centre letter')
    if (found.includes(w)) return bad('Already found')
    if (!valid.has(w)) return bad('Not in word list')
    const pan = h.pangrams.includes(w)
    const pts = wordScore(w, pan)
    score += pts
    found.push(w)
    cur = ''
    paintCur()
    say(pan ? `PANGRAM! +${pts}` : `Nice! +${pts}`, 'ok')
    env.sfx(pan ? 'win' : 'point')
    refresh()
    if (found.length >= h.words.length) finish()
  }
  const bad = (s: string) => {
    say(s, 'no')
    env.sfx('hit')
    curEl.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 250 })
    cur = ''
    c.bag.timeout(paintCur, 250)
  }
  function press(k: string) {
    if (over) return
    if (k === 'Enter') submit()
    else if (k === 'Backspace') {
      cur = cur.slice(0, -1)
      paintCur()
    } else if (/^[a-z]$/.test(k) && cur.length < 14) {
      if (!h.letters.includes(k)) {
        say('Not in the hive', 'no')
        return
      }
      cur += k
      paintCur()
      say('')
    }
  }
  function hint() {
    if (over || hints <= 0) return
    const rest = h.words.filter((w) => !found.includes(w))
    if (!rest.length) return
    const w = c.rng.pick(rest)
    hints--
    say(`Try: ${w.slice(0, 2).toUpperCase()}${'·'.repeat(w.length - 2)} (${w.length} letters)`)
    env.sfx('power')
    refresh()
  }
  function finish() {
    if (over) return
    over = true
    const pct = h.maxScore ? score / h.maxScore : 0
    c.finish(score, pct >= 0.33 || found.length >= 8, `${found.length}/${h.words.length} words · ${Math.round(pct * 100)}% of max`)
  }
  c.onKey((e) => {
    if (e.key === ' ') {
      e.preventDefault()
      shuffle()
      return
    }
    const k = keyName(e)
    if (!k) return
    if (e.target instanceof HTMLButtonElement && k === 'Enter') e.preventDefault()
    press(k)
  })
  if (timed) c.bag.interval(() => {
    if (over) return
    left--
    if (left <= 0) {
      left = 0
      refresh()
      finish()
    } else refresh()
  }, 1000)
  drawHive()
  refresh()
}

// ---------- cipher ----------

const CIPHER_CSS = `
.wd-cipher{width:100%;max-width:760px;flex:1 1 0;min-height:0;overflow:auto;border-radius:16px;padding:clamp(8px,2cqh,16px);background:color-mix(in srgb,var(--g-fg) 8%,transparent);border:2px solid color-mix(in srgb,var(--g-accent) 40%,transparent);display:flex;flex-wrap:wrap;gap:clamp(8px,1.8cqh,16px) clamp(12px,2.6cqw,22px);align-content:flex-start;justify-content:center}
.wd-cw{display:flex;gap:clamp(2px,.5cqw,5px)}
.wd-cc{display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer}
.wd-cs{font-weight:800;font-size:clamp(11px,2.1cqh,16px);color:var(--g-accent2);min-height:1.1em;font-family:ui-monospace,Menlo,Consolas,monospace}
.wd-cs.morse{font-size:clamp(9px,1.6cqh,12px);letter-spacing:-.05em}
.wd-ck{font-size:9px;opacity:.55;min-height:11px;font-family:ui-monospace,monospace}
.wd-cb{width:clamp(22px,5.6cqw,34px);height:clamp(30px,5.6cqh,42px);display:grid;place-items:center;border-bottom:3px solid var(--g-fg);border-radius:4px 4px 0 0;font-weight:700;font-size:clamp(18px,3.6cqh,28px);text-transform:uppercase;font-family:"Segoe Script","Bradley Hand","Comic Sans MS","Marker Felt",cursive;color:var(--g-accent)}
.wd-cc.sel .wd-cb{background:color-mix(in srgb,var(--g-accent) 28%,transparent);border-bottom-color:var(--g-accent)}
.wd-cc.same .wd-cb{background:color-mix(in srgb,var(--g-accent2) 18%,transparent)}
.wd-cc.bad .wd-cb{color:var(--g-danger);border-bottom-color:var(--g-danger)}
.wd-cc.ok .wd-cb{color:var(--g-good)}
.wd-punc{align-self:flex-end;font-weight:900}
.wd-hand{font-family:"Segoe Script","Bradley Hand","Comic Sans MS","Marker Felt",cursive;font-size:clamp(18px,3.8cqh,30px);line-height:1.35;text-align:center;padding:clamp(10px,2cqh,20px);border-radius:14px;background:#f5ecd2;color:#3b2a14;box-shadow:0 6px 20px rgba(0,0,0,.3);transform:rotate(-1deg);max-width:100%;animation:wd-in .5s ease}
@keyframes wd-in{from{opacity:0;transform:scale(.9) rotate(-3deg)}}
.wd-ref{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:clamp(10px,1.7cqh,13px);line-height:1.5;text-align:center;opacity:.9;max-width:760px;word-spacing:.5em}
`

function detectKind(env: WCtx['env'], rng: WCtx['rng']): CipherKind {
  const s = `${env.name} ${env.desc}`.toLowerCase()
  if (/caesar|shift|rail|route/.test(s)) return 'caesar'
  if (/atbash|mirror|reverse alphabet/.test(s) || env.mods.has('mirror')) return 'atbash'
  if (/vigen|keyword|vault/.test(s)) return 'vigenere'
  if (/morse|beep|telegraph|signal|dots|tapper|operator/.test(s)) return 'morse'
  if (/cryptogram|substitution|crypt|quote|club|decode/.test(s)) return 'substitution'
  return rng.pick(['caesar', 'atbash', 'vigenere', 'morse', 'substitution'] as const)
}
const KIND_NAME: Record<CipherKind, string> = { caesar: 'Caesar shift', atbash: 'Atbash mirror', vigenere: 'Vigenère', morse: 'Morse code', substitution: 'Cryptogram' }

export function cipher(c: WCtx) {
  const { env, root } = c
  c.css(CIPHER_CSS)
  const kind = detectKind(env, c.rng)
  const rounds = 3
  const maxLen = byDiff(env, 30, 42, 60)
  const texts = pickProverbs(c.rng, rounds, kind === 'morse' ? Math.min(maxLen, 28) : maxLen)
  let round = 0
  let score = 0
  let solved = 0
  let puzzle!: CipherPuzzle
  let guess: string[] = []
  let sel = 0
  let hints = 0
  let t0 = Date.now()
  let over = false
  let bad = new Set<number>()
  const mapping = kind !== 'vigenere'

  const top = el('div', 'wd-top')
  const info = el('div', 'wd-title')
  const chip = el('div', 'wd-chip')
  top.append(el('div', 'wd-hero', env.theme.hero), info, chip)
  const ref = el('div', 'wd-ref')
  const area = el('div', 'wd-cipher')
  const msg = el('div', 'wd-msg')
  const acts = el('div', 'wd-row')
  const btn = (t: string, cls: string, f: () => void) => {
    const b = el<HTMLButtonElement>('button', `wd-act ${cls}`, t)
    b.type = 'button'
    b.onclick = f
    acts.appendChild(b)
    return b
  }
  const hintB = btn('Reveal letter', 'alt', () => reveal())
  const checkB = btn('Check', '', () => check())
  const nextB = btn('Next ▶', '', () => nextRound())
  nextB.style.display = 'none'
  const main = el('div', 'wd-main')
  main.style.justifyContent = 'flex-start'
  main.append(ref, area, msg, acts)
  root.append(top, main)
  const kb = keyboard(root, (k) => press(k), false)

  let cellEls: HTMLElement[] = []
  const hintLine = () => {
    const p = puzzle
    if (kind === 'caesar') return env.difficulty === 0 ? `Every letter is shifted by ${p.shift}. Shift back to decode.` : 'Each letter was moved the same number of steps along the alphabet.'
    if (kind === 'atbash') return 'A↔Z, B↔Y, C↔X… the alphabet is mirrored.'
    if (kind === 'vigenere') return env.difficulty === 2 ? 'Keyword unknown: the tiny letters show the key per position.' : `Keyword: ${p.key}. The tiny letters show the key per position (A=0, B=1…).`
    if (kind === 'morse') return 'Decode each Morse group into a letter.'
    return 'Every letter was swapped for another. Tap a symbol and type what it stands for.'
  }
  const morseRef = () => Object.entries(MORSE).map(([k, v]) => `${k}${v}`).join(' ')

  const build = () => {
    puzzle = makeCipher(kind, texts[round], c.rng)
    guess = Array(puzzle.cells.length).fill('')
    sel = 0
    hints = 0
    bad = new Set()
    over = false
    t0 = Date.now()
    area.textContent = ''
    cellEls = []
    for (const w of puzzle.words) {
      const we = el('div', 'wd-cw')
      for (const i of w) {
        const cell = puzzle.cells[i as number]
        const ce = el('div', 'wd-cc')
        ce.append(el('div', 'wd-ck', kind === 'vigenere' && env.difficulty < 2 ? cell.key ?? '' : kind === 'vigenere' ? cell.key ?? '' : ''), el('div', `wd-cs${kind === 'morse' ? ' morse' : ''}`, cell.sym), el('div', 'wd-cb'))
        ce.onclick = () => {
          sel = i as number
          paint()
        }
        cellEls[i as number] = ce
        we.appendChild(ce)
      }
      area.appendChild(we)
    }
    ref.textContent = kind === 'morse' ? morseRef() : hintLine()
    if (kind === 'morse') ref.title = hintLine()
    info.textContent = ''
    info.append(KIND_NAME[kind], el('small', '', kind === 'morse' ? hintLine() : env.name.toLowerCase() === KIND_NAME[kind].toLowerCase() ? 'Decode the hidden proverb' : env.name))
    chip.textContent = `${round + 1}/${rounds}`
    msg.textContent = ''
    msg.className = 'wd-msg'
    hintB.style.display = ''
    checkB.style.display = ''
    nextB.style.display = 'none'
    kb.reset()
    paint()
    status()
  }
  const status = () => {
    env.score(score)
    env.status(`Puzzle ${round + 1}/${rounds} · ${KIND_NAME[kind]}`)
  }
  const paint = () => {
    const selSym = puzzle.cells[sel]?.sym
    cellEls.forEach((ce, i) => {
      ce.querySelector('.wd-cb')!.textContent = guess[i]
      ce.classList.toggle('sel', i === sel && !over)
      ce.classList.toggle('same', mapping && i !== sel && puzzle.cells[i].sym === selSym && !over)
      ce.classList.toggle('bad', bad.has(i))
    })
  }
  const setGuess = (i: number, ch: string) => {
    if (mapping) {
      const sym = puzzle.cells[i].sym
      if (ch) puzzle.cells.forEach((cc, j) => { if (guess[j] === ch && cc.sym !== sym) guess[j] = '' })
      puzzle.cells.forEach((cc, j) => { if (cc.sym === sym) guess[j] = ch })
    } else guess[i] = ch
  }
  const nextEmpty = (from: number) => {
    const n = guess.length
    for (let d = 1; d <= n; d++) {
      const j = (from + d) % n
      if (!guess[j]) return j
    }
    return from
  }
  const solvedCheck = () => puzzle.cells.every((cc, i) => guess[i] === cc.plain.toLowerCase())
  function press(k: string) {
    if (over) return
    if (k === 'Backspace') {
      setGuess(sel, '')
      bad.delete(sel)
    } else if (/^[a-z]$/.test(k)) {
      setGuess(sel, k)
      bad = new Set()
      env.sfx('click')
      if (solvedCheck()) return win()
      sel = nextEmpty(sel)
    } else return
    paint()
  }
  const reveal = () => {
    if (over) return
    const cc = puzzle.cells[sel]
    setGuess(sel, cc.plain.toLowerCase())
    kb.mark(cc.plain.toLowerCase(), 'g')
    hints++
    env.sfx('power')
    if (solvedCheck()) return win()
    sel = nextEmpty(sel)
    paint()
  }
  const check = () => {
    if (over) return
    bad = new Set(guess.map((g, i) => (g && g !== puzzle.cells[i].plain.toLowerCase() ? i : -1)).filter((i) => i >= 0))
    msg.className = bad.size ? 'wd-msg no' : 'wd-msg ok'
    msg.textContent = bad.size ? `${bad.size} wrong ${bad.size === 1 ? 'letter' : 'letters'}` : 'All entered letters are right so far'
    env.sfx(bad.size ? 'hit' : 'point')
    paint()
  }
  const win = () => {
    over = true
    solved++
    const secs = (Date.now() - t0) / 1000
    const pts = Math.max(60, 200 + Math.max(0, Math.round(120 - secs)) - hints * 30)
    score += pts
    for (const ce of cellEls) ce.classList.add('ok')
    paint()
    area.textContent = ''
    const hand = el('div', 'wd-hand', puzzle.text.charAt(0) + puzzle.text.slice(1).toLowerCase() + '.')
    area.appendChild(hand)
    msg.className = 'wd-msg ok'
    msg.textContent = `Decoded! +${pts}`
    env.sfx('win')
    hintB.style.display = 'none'
    checkB.style.display = 'none'
    nextB.style.display = ''
    nextB.textContent = round + 1 >= rounds ? 'Finish ▶' : 'Next ▶'
    status()
  }
  function nextRound() {
    if (!over) return
    if (round + 1 >= rounds) {
      c.finish(score, solved >= 2, `${solved}/${rounds} messages decoded`)
      return
    }
    round++
    build()
  }
  c.onKey((e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      sel = (sel + guess.length - 1) % guess.length
      paint()
      e.preventDefault()
      return
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'Tab') {
      sel = (sel + 1) % guess.length
      paint()
      e.preventDefault()
      return
    }
    if (e.key === 'Enter') {
      if (over) nextRound()
      else check()
      return
    }
    const k = keyName(e)
    if (k) press(k)
  })
  build()
}
