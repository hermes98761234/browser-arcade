// Words engine modes: word search and crossword.
import { byDiff } from '../kit'
import { DIRS_EASY, DIRS_HARD, DIRS_MED, genCrossword, genSearch, lineCells, TOPICS, TOPIC_NAMES, type Crossword, type CwEntry } from './words'
import { el, fmtTime, keyboard, keyName, topicFor, type WCtx } from './words-ui'

const SEARCH_CSS = `
.wd-ws{display:flex;gap:clamp(8px,2cqw,20px);width:100%;max-width:900px;flex:1 1 0;min-height:0;align-items:center;justify-content:center}
@container (max-aspect-ratio:1/1){.wd-ws{flex-direction:column;justify-content:flex-start}}
.wd-sg{display:grid;gap:2px;touch-action:none;flex:0 0 auto;padding:6px;border-radius:14px;background:color-mix(in srgb,var(--g-fg) 8%,transparent);border:2px solid color-mix(in srgb,var(--g-accent) 40%,transparent)}
.wd-sc{display:grid;place-items:center;border-radius:6px;font-weight:800;text-transform:uppercase;font-family:ui-monospace,Menlo,Consolas,monospace;cursor:pointer;position:relative;transition:background .1s}
.wd-sc.pick{background:var(--g-accent);color:#fff}
.wd-sc.anchor{outline:3px solid var(--g-accent2)}
.wd-sc.flash{animation:wd-flash 1.2s}
@keyframes wd-flash{0%,60%{background:var(--g-accent2);color:#fff}}
.wd-wl{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-content:flex-start;max-width:min(100%,320px)}
@container (max-aspect-ratio:1/1){.wd-wl{max-width:100%}}
.wd-wl span{padding:4px 10px;border-radius:99px;background:color-mix(in srgb,var(--g-fg) 12%,transparent);font-weight:800;font-size:clamp(11px,2cqh,15px);text-transform:uppercase}
.wd-wl span.done{text-decoration:line-through;opacity:.55;color:#fff}
`

export function search(c: WCtx) {
  const { env, root, rng } = c
  c.css(SEARCH_CSS)
  const topic = topicFor(env, rng, TOPIC_NAMES.filter((t) => TOPICS[t].length >= 12))
  const size = byDiff(env, 9, 11, 12)
  const count = byDiff(env, 6, 8, 10)
  const dirs = byDiff(env, DIRS_EASY, DIRS_MED, DIRS_HARD)
  const wl = rng.shuffle(TOPICS[topic].filter((w) => w.length >= 4 && w.length <= size)).slice(0, count)
  const g = genSearch(rng, wl, size, dirs)
  const colors = env.theme.blocks
  const foundSet = new Set<string>()
  let score = 0
  let secs = 0
  let hints = 3
  let over = false
  let anchor: [number, number] | null = null
  let drag: { from: [number, number]; to: [number, number]; moved: boolean } | null = null

  const top = el('div', 'wd-top')
  const info = el('div', 'wd-title')
  info.append(env.name, el('small', '', `Theme: ${topic}${dirs === DIRS_HARD ? ' · words run in all directions' : ''}`))
  const chip = el('div', 'wd-chip')
  top.append(el('div', 'wd-hero', env.theme.hero), info, chip)
  const main = el('div', 'wd-main')
  const ws = el('div', 'wd-ws')
  const grid = el('div', 'wd-sg')
  const cellPx = `clamp(18px, min(${Math.floor(68 / size)}cqh, ${Math.floor(86 / size)}cqw), 44px)`
  grid.style.gridTemplateColumns = `repeat(${size}, ${cellPx})`
  const list = el('div', 'wd-wl')
  const msg = el('div', 'wd-msg')
  const hintB = el<HTMLButtonElement>('button', 'wd-act alt')
  const cells: HTMLElement[][] = []
  for (let r = 0; r < size; r++) {
    cells.push([])
    for (let col = 0; col < size; col++) {
      const ce = el('div', 'wd-sc', g.grid[r][col])
      ce.dataset.r = String(r)
      ce.dataset.c = String(col)
      ce.style.width = cellPx
      ce.style.height = cellPx
      ce.style.fontSize = `calc(${cellPx} * .56)`
      cells[r].push(ce)
      grid.appendChild(ce)
    }
  }
  const tags = new Map<string, HTMLElement>()
  for (const p of g.placed) {
    const s = el('span', '', p.word)
    tags.set(p.word, s)
    list.appendChild(s)
  }
  ws.append(grid, list)
  main.append(ws, msg, hintB)
  root.append(top, main)

  const status = () => {
    env.score(score)
    chip.textContent = `${foundSet.size}/${g.placed.length} · ${fmtTime(secs)}`
    env.status(`${foundSet.size}/${g.placed.length} found · ${fmtTime(secs)}`)
    hintB.textContent = `Hint ×${hints}`
    hintB.disabled = hints <= 0 || over
  }
  const at = (e: PointerEvent): [number, number] | null => {
    const t = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    if (!t || t.dataset.r === undefined) return null
    return [Number(t.dataset.r), Number(t.dataset.c)]
  }
  const clearPick = () => {
    for (const row of cells) for (const ce of row) ce.classList.remove('pick', 'anchor')
  }
  const showPick = (a: [number, number], b: [number, number]) => {
    clearPick()
    const line = lineCells(a, b) ?? [a]
    for (const [r, col] of line) cells[r][col].classList.add('pick')
  }
  const tryWord = (a: [number, number], b: [number, number]) => {
    const line = lineCells(a, b)
    if (!line || line.length < 2) return
    const str = line.map(([r, col]) => g.grid[r][col]).join('')
    const rev = [...str].reverse().join('')
    const hit = g.placed.find((p) => !foundSet.has(p.word) && (p.word === str || p.word === rev))
    if (!hit) {
      msg.className = 'wd-msg no'
      msg.textContent = ''
      env.sfx('click')
      return
    }
    foundSet.add(hit.word)
    const color = colors[foundSet.size % colors.length]
    for (const [r, col] of line) {
      cells[r][col].style.background = color
      cells[r][col].style.color = '#fff'
    }
    tags.get(hit.word)!.classList.add('done')
    tags.get(hit.word)!.style.background = color
    score += 100
    msg.className = 'wd-msg ok'
    msg.textContent = `${hit.word.toUpperCase()}! +100`
    env.sfx('point')
    status()
    if (foundSet.size >= g.placed.length) {
      over = true
      const bonus = Math.max(0, 300 - secs)
      score += bonus
      env.sfx('win')
      status()
      c.bag.timeout(() => c.finish(score, true, `All ${g.placed.length} words in ${fmtTime(secs)}`), 900)
    }
  }
  grid.addEventListener('pointerdown', (e) => {
    if (over) return
    const p = at(e)
    if (!p) return
    e.preventDefault()
    if (anchor) {
      const a = anchor
      anchor = null
      clearPick()
      if (a[0] !== p[0] || a[1] !== p[1]) tryWord(a, p)
      return
    }
    drag = { from: p, to: p, moved: false }
    showPick(p, p)
  })
  grid.addEventListener('pointermove', (e) => {
    if (!drag) return
    const p = at(e)
    if (!p || (p[0] === drag.to[0] && p[1] === drag.to[1])) return
    drag.to = p
    drag.moved = true
    showPick(drag.from, p)
  })
  const up = () => {
    if (!drag) return
    const d = drag
    drag = null
    clearPick()
    if (d.moved && (d.from[0] !== d.to[0] || d.from[1] !== d.to[1])) tryWord(d.from, d.to)
    else {
      anchor = d.from
      cells[d.from[0]][d.from[1]].classList.add('anchor')
    }
  }
  c.bag.on(window, 'pointerup', up)
  c.bag.on(window, 'pointercancel', up)
  hintB.onclick = () => {
    if (over || hints <= 0) return
    const p = g.placed.find((x) => !foundSet.has(x.word))
    if (!p) return
    hints--
    score = Math.max(0, score - 20)
    const ce = cells[p.r][p.c]
    ce.classList.remove('flash')
    void ce.offsetWidth
    ce.classList.add('flash')
    msg.className = 'wd-msg'
    msg.textContent = `Starts with ${p.word[0].toUpperCase()} · ${p.word.length} letters`
    env.sfx('power')
    status()
  }
  c.bag.interval(() => {
    if (!over) {
      secs++
      status()
    }
  }, 1000)
  status()
}

// ---------- crossword ----------

const CW_CSS = `
.wd-cwb{display:flex;gap:clamp(8px,2cqw,20px);width:100%;max-width:980px;flex:1 1 0;min-height:0;align-items:center;justify-content:center}
@container (max-aspect-ratio:1/1){.wd-cwb{flex-direction:column;justify-content:flex-start}}
.wd-xg{display:grid;gap:2px;flex:0 0 auto}
.wd-xc{position:relative;display:grid;place-items:center;border-radius:5px;background:color-mix(in srgb,var(--g-fg) 90%,var(--g-bg));color:var(--g-bg);font-weight:900;text-transform:uppercase;cursor:pointer}
.wd-xc.blank{background:transparent;cursor:default}
.wd-xc.word{background:color-mix(in srgb,var(--g-accent) 30%,var(--g-bg2));color:var(--g-fg)}
.wd-xc.cur{background:var(--g-accent);color:#fff}
.wd-xc.bad{background:var(--g-danger);color:#fff}
.wd-xc.done{background:var(--g-good);color:#fff}
.wd-xc b{position:absolute;left:3px;top:1px;font-size:.36em;font-weight:800;opacity:.75}
.wd-xcl{display:flex;flex-direction:column;gap:6px;min-width:0;max-width:340px;width:100%;overflow:auto;max-height:100%}
@container (max-aspect-ratio:1/1){.wd-xcl{flex-direction:row;gap:8px;max-width:100%;max-height:26cqh}}
.wd-xcl>div{flex:1;min-width:0}
.wd-xcl h4{margin:0 0 3px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.7}
.wd-xcl p{margin:0;padding:3px 6px;border-radius:7px;font-size:clamp(11px,1.9cqh,14px);line-height:1.25;cursor:pointer;font-weight:600}
.wd-xcl p.on{background:color-mix(in srgb,var(--g-accent) 30%,transparent)}
.wd-xcl p.ok{text-decoration:line-through;opacity:.5}
.wd-clue{width:100%;max-width:760px;padding:8px 12px;border-radius:12px;background:color-mix(in srgb,var(--g-accent) 22%,transparent);font-weight:800;font-size:clamp(13px,2.3cqh,18px);text-align:center;flex:0 0 auto;min-height:clamp(34px,6cqh,48px);display:flex;align-items:center;justify-content:center}
`

export function crossword(c: WCtx) {
  const { env, root, rng } = c
  c.css(CW_CSS)
  const count = byDiff(env, 6, 8, 10) - (env.mods.has('tiny') ? 1 : 0)
  const cw: Crossword = genCrossword(rng, count, 11)
  const { rows, cols } = cw
  const guess: string[][] = Array.from({ length: rows }, () => Array(cols).fill(''))
  const lock: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false))
  let across = true
  let cr = cw.entries[0].r
  let cc = cw.entries[0].c
  let score = 0
  let hints = byDiff(env, 5, 3, 2)
  let secs = 0
  let over = false
  let bad = new Set<string>()

  const top = el('div', 'wd-top')
  const info = el('div', 'wd-title')
  info.append(env.name, el('small', '', 'Tap a square, type letters. Tap again to switch direction.'))
  const chip = el('div', 'wd-chip')
  top.append(el('div', 'wd-hero', env.theme.hero), info, chip)
  const clueBar = el('div', 'wd-clue')
  const main = el('div', 'wd-main')
  const body = el('div', 'wd-cwb')
  const grid = el('div', 'wd-xg')
  const px = `clamp(24px, min(${Math.floor(46 / rows)}cqh, ${Math.floor(86 / cols)}cqw), 52px)`
  grid.style.gridTemplateColumns = `repeat(${cols}, ${px})`
  const lists = el('div', 'wd-xcl')
  const msg = el('div', 'wd-msg')
  const acts = el('div', 'wd-row')
  const checkB = el<HTMLButtonElement>('button', 'wd-act', 'Check')
  const hintB = el<HTMLButtonElement>('button', 'wd-act alt')
  const doneB = el<HTMLButtonElement>('button', 'wd-act dim', 'Give up')
  acts.append(checkB, hintB, doneB)
  const cellEl: HTMLElement[][] = []
  for (let r = 0; r < rows; r++) {
    cellEl.push([])
    for (let col = 0; col < cols; col++) {
      const ce = el('div', `wd-xc${cw.grid[r][col] ? '' : ' blank'}`)
      ce.style.width = px
      ce.style.height = px
      ce.style.fontSize = `calc(${px} * .58)`
      if (cw.grid[r][col]) ce.onclick = () => select(r, col)
      cellEl[r].push(ce)
      grid.appendChild(ce)
    }
  }
  for (const e of cw.entries) {
    const num = el('b', '', String(e.num))
    cellEl[e.r][e.c].appendChild(num)
  }
  const clueEls = new Map<CwEntry, HTMLElement>()
  for (const dir of [true, false]) {
    const col = el('div')
    col.appendChild(el('h4', '', dir ? 'Across' : 'Down'))
    for (const e of cw.entries.filter((x) => x.across === dir)) {
      const p = el('p', '', `${e.num}. ${e.clue} (${e.word.length})`)
      p.onclick = () => {
        across = e.across
        cr = e.r
        cc = e.c
        for (let i = 0; i < e.word.length; i++) {
          const rr = e.r + (e.across ? 0 : i)
          const c2 = e.c + (e.across ? i : 0)
          if (!guess[rr][c2]) {
            cr = rr
            cc = c2
            break
          }
        }
        paint()
      }
      clueEls.set(e, p)
      col.appendChild(p)
    }
    lists.appendChild(col)
  }
  body.append(grid, lists)
  main.append(clueBar, body, msg, acts)
  root.append(top, main)
  const kb = keyboard(root, (k) => press(k), false)
  void kb

  const covers = (e: CwEntry, r: number, col: number) => (e.across ? r === e.r && col >= e.c && col < e.c + e.word.length : col === e.c && r >= e.r && r < e.r + e.word.length)
  const active = (): CwEntry | undefined => cw.entries.find((e) => e.across === across && covers(e, cr, cc)) ?? cw.entries.find((e) => covers(e, cr, cc))
  const entryDone = (e: CwEntry) => [...e.word].every((ch, i) => guess[e.r + (e.across ? 0 : i)][e.c + (e.across ? i : 0)] === ch.toLowerCase())

  function select(r: number, col: number) {
    if (over) return
    if (r === cr && col === cc) {
      const other = cw.entries.some((e) => e.across !== across && covers(e, r, col))
      if (other) across = !across
    } else {
      cr = r
      cc = col
      if (!cw.entries.some((e) => e.across === across && covers(e, r, col))) across = !across
    }
    paint()
  }
  const status = () => {
    const done = cw.entries.filter(entryDone).length
    chip.textContent = `${done}/${cw.entries.length} · ${fmtTime(secs)}`
    env.score(score)
    env.status(`${done}/${cw.entries.length} words · ${fmtTime(secs)}`)
    hintB.textContent = `Reveal ×${hints}`
    hintB.disabled = hints <= 0 || over
  }
  const paint = () => {
    const a = active()
    for (let r = 0; r < rows; r++) for (let col = 0; col < cols; col++) {
      if (!cw.grid[r][col]) continue
      const ce = cellEl[r][col]
      const num = ce.querySelector('b')
      ce.textContent = guess[r][col]
      if (num) ce.appendChild(num)
      ce.classList.toggle('word', !!a && covers(a, r, col))
      ce.classList.toggle('cur', r === cr && col === cc && !over)
      ce.classList.toggle('bad', bad.has(`${r},${col}`))
      ce.classList.toggle('done', lock[r][col])
    }
    for (const [e, p] of clueEls) {
      p.classList.toggle('on', e === a)
      p.classList.toggle('ok', entryDone(e))
    }
    clueBar.textContent = a ? `${a.num} ${a.across ? 'Across' : 'Down'}: ${a.clue} (${a.word.length})` : ''
    status()
  }
  const step = (dr: number, dc: number) => {
    let r = cr + dr
    let col = cc + dc
    while (r >= 0 && col >= 0 && r < rows && col < cols) {
      if (cw.grid[r][col]) {
        cr = r
        cc = col
        return
      }
      r += dr
      col += dc
    }
  }
  const advance = () => {
    const r = cr + (across ? 0 : 1)
    const col = cc + (across ? 1 : 0)
    if (r < rows && col < cols && cw.grid[r][col]) {
      cr = r
      cc = col
    }
  }
  const retreat = () => {
    const r = cr - (across ? 0 : 1)
    const col = cc - (across ? 1 : 0)
    if (r >= 0 && col >= 0 && cw.grid[r][col]) {
      cr = r
      cc = col
    }
  }
  function press(k: string) {
    if (over) return
    if (k === 'Backspace') {
      if (!guess[cr][cc]) retreat()
      if (!lock[cr][cc]) guess[cr][cc] = ''
      bad.delete(`${cr},${cc}`)
    } else if (/^[a-z]$/.test(k)) {
      if (!lock[cr][cc]) guess[cr][cc] = k
      bad.delete(`${cr},${cc}`)
      env.sfx('click')
      advance()
    } else return
    for (const e of cw.entries) {
      if (entryDone(e)) for (let i = 0; i < e.word.length; i++) lock[e.r + (e.across ? 0 : i)][e.c + (e.across ? i : 0)] = true
    }
    paint()
    if (cw.entries.every(entryDone)) win()
  }
  const win = () => {
    over = true
    const bonus = Math.max(0, 200 - secs)
    score += cw.entries.length * 100 + bonus
    msg.className = 'wd-msg ok'
    msg.textContent = 'Crossword complete!'
    env.sfx('win')
    paint()
    c.bag.timeout(() => c.finish(score, true, `${cw.entries.length} words in ${fmtTime(secs)}`), 1000)
  }
  checkB.onclick = () => {
    if (over) return
    bad = new Set()
    for (let r = 0; r < rows; r++) for (let col = 0; col < cols; col++) {
      if (guess[r][col] && guess[r][col] !== cw.grid[r][col].toLowerCase()) bad.add(`${r},${col}`)
    }
    msg.className = bad.size ? 'wd-msg no' : 'wd-msg ok'
    msg.textContent = bad.size ? `${bad.size} wrong ${bad.size === 1 ? 'letter' : 'letters'}` : 'Looking good so far!'
    env.sfx(bad.size ? 'hit' : 'point')
    paint()
  }
  hintB.onclick = () => {
    if (over || hints <= 0) return
    hints--
    guess[cr][cc] = cw.grid[cr][cc].toLowerCase()
    lock[cr][cc] = true
    bad.delete(`${cr},${cc}`)
    env.sfx('power')
    advance()
    paint()
    if (cw.entries.every(entryDone)) win()
  }
  doneB.onclick = () => {
    if (over) return
    over = true
    const done = cw.entries.filter(entryDone).length
    c.finish(score + done * 100, done === cw.entries.length, `${done}/${cw.entries.length} words solved`)
  }
  c.onKey((e) => {
    if (e.key === 'ArrowLeft') step(0, -1)
    else if (e.key === 'ArrowRight') step(0, 1)
    else if (e.key === 'ArrowUp') step(-1, 0)
    else if (e.key === 'ArrowDown') step(1, 0)
    else if (e.key === ' ' || e.key === 'Tab') {
      across = !across
      e.preventDefault()
    } else {
      const k = keyName(e)
      if (k && k !== 'Enter') press(k)
      return
    }
    e.preventDefault()
    paint()
  })
  c.bag.interval(() => {
    if (!over) {
      secs++
      status()
    }
  }, 1000)
  paint()
}
