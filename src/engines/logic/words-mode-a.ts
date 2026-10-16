// Words engine modes: wordle and hangman.
import { byDiff } from '../kit'
import { ANSWERS, evalGuess, GUESSES, hangmanPool, type Mark } from './words'
import { el, keyboard, keyName, topicFor, type WCtx } from './words-ui'

const WORDLE_CSS = `
.wd-grid{display:grid;gap:clamp(4px,.9cqh,7px);flex:0 1 auto}
.wd-grow{display:grid;grid-template-columns:repeat(5,1fr);gap:clamp(4px,.9cqh,7px)}
.wd-tile{width:clamp(30px,min(8.4cqh,14cqw),60px);aspect-ratio:1;display:grid;place-items:center;border:2px solid color-mix(in srgb,var(--g-fg) 28%,transparent);border-radius:8px;font-weight:900;font-size:clamp(20px,4.6cqh,34px);text-transform:uppercase;transition:transform .08s}
.wd-tile.fill{border-color:color-mix(in srgb,var(--g-fg) 70%,transparent);transform:scale(1.07)}
.wd-tile.flip{animation:wd-flip .5s ease}
.wd-tile.g{background:var(--g-good);border-color:var(--g-good);color:#fff}
.wd-tile.y{background:#e0a800;border-color:#e0a800;color:#fff}
.wd-tile.x{background:color-mix(in srgb,var(--g-fg) 30%,var(--g-bg));border-color:transparent}
.wd-tile.hint{opacity:.45}
@keyframes wd-flip{0%{transform:rotateX(0)}50%{transform:rotateX(90deg)}100%{transform:rotateX(0)}}
.wd-grow.shake{animation:wd-shake .4s}
@keyframes wd-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
.wd-tile.pop{animation:wd-bounce .6s ease}
@keyframes wd-bounce{0%,100%{transform:translateY(0)}40%{transform:translateY(-14px)}}
`

export function wordle(c: WCtx) {
  const { env, root, rng } = c
  c.css(WORDLE_CSS)
  const rounds = c.daily ? 1 : 3
  const hardRule = env.difficulty === 2 || env.mods.has('hard')
  const maxRows = 6
  const easy = env.difficulty === 0
  let round = 0
  let solved = 0
  let score = 0
  let answer = ''
  let row = 0
  let cur = ''
  let busy = false
  let over = false
  const guesses: string[] = []
  const marks: Mark[][] = []

  const top = el('div', 'wd-top')
  const info = el('div', 'wd-title')
  top.append(el('div', 'wd-hero', env.theme.hero), info)
  const chip = el('div', 'wd-chip')
  top.appendChild(chip)
  const main = el('div', 'wd-main')
  const msg = el('div', 'wd-msg')
  const grid = el('div', 'wd-grid')
  const nextBtn = el<HTMLButtonElement>('button', 'wd-act', 'Next word ▶')
  nextBtn.style.display = 'none'
  main.append(grid, msg, nextBtn)
  root.append(top, main)
  const kb = keyboard(root, (k) => press(k))

  const tiles: HTMLElement[][] = []
  const rows: HTMLElement[] = []
  const build = () => {
    grid.textContent = ''
    tiles.length = 0
    rows.length = 0
    for (let r = 0; r < maxRows; r++) {
      const rw = el('div', 'wd-grow')
      const ts: HTMLElement[] = []
      for (let i = 0; i < 5; i++) ts.push(rw.appendChild(el('div', 'wd-tile')))
      tiles.push(ts)
      rows.push(rw)
      grid.appendChild(rw)
    }
  }
  const status = () => {
    env.score(score)
    env.status(c.daily ? 'Daily word' : `Word ${round + 1}/${rounds} · solved ${solved}`)
    chip.textContent = c.daily ? 'Daily' : `${round + 1}/${rounds}`
  }
  const startRound = () => {
    answer = rng.pick(ANSWERS)
    row = 0
    cur = ''
    busy = false
    guesses.length = 0
    marks.length = 0
    nextBtn.style.display = 'none'
    msg.className = 'wd-msg'
    msg.textContent = ''
    kb.reset()
    build()
    info.innerHTML = ''
    info.append(env.name, el('small', '', `Guess the 5-letter word in ${maxRows} tries${hardRule ? ' · hard rules' : ''}`))
    if (easy) {
      const t = tiles[0][0]
      t.textContent = answer[0]
      t.classList.add('hint')
    }
    status()
  }
  const paint = () => {
    for (let i = 0; i < 5; i++) {
      const t = tiles[row][i]
      t.textContent = cur[i] ?? (easy && row === 0 && i === 0 ? answer[0] : '')
      t.classList.toggle('fill', !!cur[i])
      t.classList.toggle('hint', !cur[i] && easy && row === 0 && i === 0)
    }
  }
  const say = (s: string, cls = '') => {
    msg.textContent = s
    msg.className = `wd-msg ${cls}`
  }
  const reject = (s: string) => {
    say(s, 'no')
    rows[row].classList.remove('shake')
    void rows[row].offsetWidth
    rows[row].classList.add('shake')
    env.sfx('hit')
  }
  const hardCheck = (g: string): string | null => {
    for (let r = 0; r < guesses.length; r++) {
      for (let i = 0; i < 5; i++) {
        if (marks[r][i] === 'g' && g[i] !== guesses[r][i]) return `Letter ${i + 1} must be ${guesses[r][i].toUpperCase()}`
        if (marks[r][i] === 'y' && !g.includes(guesses[r][i])) return `Guess must contain ${guesses[r][i].toUpperCase()}`
      }
    }
    return null
  }
  const submit = () => {
    if (cur.length < 5) return reject('Not enough letters')
    if (!GUESSES.has(cur) && !ANSWERS.includes(cur) && !(easy && /^[a-z]{5}$/.test(cur))) return reject('Not in word list')
    if (hardRule) {
      const h = hardCheck(cur)
      if (h) return reject(h)
    }
    busy = true
    const m = evalGuess(cur, answer)
    const g = cur
    const r = row
    guesses.push(g)
    marks.push(m)
    for (let i = 0; i < 5; i++) {
      c.bag.timeout(() => tiles[r][i].classList.add('flip'), i * 240)
      c.bag.timeout(() => {
        tiles[r][i].classList.remove('fill', 'hint')
        tiles[r][i].classList.add(m[i])
        kb.mark(g[i], m[i])
      }, i * 240 + 250)
    }
    c.bag.timeout(() => {
      busy = false
      const win = m.every((x) => x === 'g')
      if (win) {
        for (let i = 0; i < 5; i++) c.bag.timeout(() => tiles[r][i].classList.add('pop'), i * 90)
        solved++
        const pts = 100 + (maxRows - r) * 50
        score += pts
        say(['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'][r] + ` +${pts}`, 'ok')
        env.sfx('win')
        endRound()
      } else if (r === maxRows - 1) {
        say(`The word was ${answer.toUpperCase()}`, 'no')
        env.sfx('lose')
        endRound()
      } else {
        row++
        cur = ''
        paint()
        env.sfx('point')
      }
      status()
    }, 5 * 240 + 300)
  }
  const endRound = () => {
    over = true
    if (round + 1 >= rounds) {
      nextBtn.style.display = ''
      nextBtn.textContent = 'Finish ▶'
    } else nextBtn.style.display = ''
    nextBtn.focus({ preventScroll: true })
  }
  nextBtn.onclick = () => {
    if (!over) return
    over = false
    if (round + 1 >= rounds) {
      const won = c.daily ? solved > 0 : solved >= 2
      c.finish(score, won, `${solved}/${rounds} words solved`)
      over = true
      return
    }
    round++
    startRound()
  }
  function press(k: string) {
    if (busy || over) return
    if (k === 'Enter') submit()
    else if (k === 'Backspace') {
      cur = cur.slice(0, -1)
      paint()
    } else if (/^[a-z]$/.test(k) && cur.length < 5) {
      cur += k
      paint()
      env.sfx('click')
    }
    if (k !== 'Enter') say('')
  }
  c.onKey((e) => {
    const k = keyName(e)
    if (!k) return
    if (e.target instanceof HTMLButtonElement && k === 'Enter') return
    press(k)
  })
  startRound()
}

// ---------- hangman ----------

const HANG_CSS = `
.wd-hang{display:flex;gap:clamp(10px,3cqw,30px);align-items:center;justify-content:center;flex-wrap:wrap;width:100%}
.wd-hang svg{width:clamp(110px,26cqh,200px);height:auto;flex:0 0 auto}
.wd-hang svg .p{stroke:var(--g-fg);stroke-width:5;stroke-linecap:round;fill:none}
.wd-hang svg .g{stroke:var(--g-accent2);stroke-width:7;stroke-linecap:round;fill:none}
.wd-hang svg .part{opacity:0;transition:opacity .3s}
.wd-hang svg .part.on{opacity:1}
.wd-hang svg .e{font-size:40px}
.wd-slots{display:flex;gap:clamp(4px,1cqw,10px);flex-wrap:wrap;justify-content:center;max-width:min(92cqw,520px)}
.wd-slot{width:clamp(24px,7cqw,44px);height:clamp(34px,6.5cqh,52px);border-bottom:4px solid var(--g-fg);display:grid;place-items:center;font-weight:900;font-size:clamp(20px,4.6cqh,34px);text-transform:uppercase}
.wd-slot.miss{color:var(--g-danger)}
.wd-lives{font-weight:800;font-size:clamp(12px,2.2cqh,16px)}
`

export function hangman(c: WCtx) {
  const { env, root, rng } = c
  c.css(HANG_CSS)
  const topic = topicFor(env, rng)
  const rounds = 5
  const maxWrong = byDiff(env, 8, 6, 5)
  const pool = rng.shuffle([...hangmanPool(topic)]).filter((w) => w.length <= byDiff(env, 7, 9, 10))
  const words = pool.slice(0, rounds)
  let round = 0
  let score = 0
  let solved = 0
  let wrong = 0
  let hints = byDiff(env, 3, 2, 1)
  let over = false
  let busy = false
  const guessed = new Set<string>()
  let word = ''

  const top = el('div', 'wd-top')
  const info = el('div', 'wd-title')
  info.append(env.name, el('small', '', `Category: ${topic}`))
  top.append(el('div', 'wd-hero', env.theme.hero), info)
  const chip = el('div', 'wd-chip')
  top.appendChild(chip)
  const main = el('div', 'wd-main')
  const hang = el('div', 'wd-hang')
  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('viewBox', '0 0 200 220')
  svg.innerHTML = `
    <path class="g" d="M20 205H110M65 205V15H140V40"/>
    <g class="part"><text class="e" x="140" y="76" text-anchor="middle"></text></g>
    <path class="p part" d="M140 90V140"/>
    <path class="p part" d="M140 102L115 126"/>
    <path class="p part" d="M140 102L165 126"/>
    <path class="p part" d="M140 140L120 175"/>
    <path class="p part" d="M140 140L160 175"/>`
  hang.appendChild(svg)
  const slotsEl = el('div', 'wd-slots')
  const side = el('div', '')
  side.style.cssText = 'display:flex;flex-direction:column;gap:8px;align-items:center'
  const lives = el('div', 'wd-lives')
  const hintBtn = el<HTMLButtonElement>('button', 'wd-act alt')
  const nextBtn = el<HTMLButtonElement>('button', 'wd-act', 'Next ▶')
  nextBtn.style.display = 'none'
  side.append(lives, slotsEl)
  hang.appendChild(side)
  const msg = el('div', 'wd-msg')
  const act = el('div', 'wd-row')
  act.append(hintBtn, nextBtn)
  main.append(hang, msg, act)
  root.append(top, main)
  const kb = keyboard(root, (k) => press(k), false)
  const parts = [...svg.querySelectorAll('.part')]
  ;(svg.querySelector('.e') as SVGTextElement).textContent = env.theme.hero

  const status = () => {
    env.score(score)
    env.status(`Word ${round + 1}/${words.length} · ${'❤️'.repeat(Math.max(0, maxWrong - wrong))}`)
    chip.textContent = `${round + 1}/${words.length}`
    lives.textContent = `Misses left: ${maxWrong - wrong}`
    hintBtn.textContent = `Hint ×${hints}`
    hintBtn.disabled = hints <= 0 || over
  }
  const render = () => {
    slotsEl.textContent = ''
    for (const ch of word) {
      const s = el('div', 'wd-slot', guessed.has(ch) ? ch : over && !guessed.has(ch) ? ch : '')
      if (over && !guessed.has(ch)) s.classList.add('miss')
      slotsEl.appendChild(s)
    }
    const shown = wrong === 0 ? 0 : Math.ceil((wrong / maxWrong) * parts.length)
    parts.forEach((p, i) => p.classList.toggle('on', i < shown))
    status()
  }
  const start = () => {
    word = words[round]
    guessed.clear()
    wrong = 0
    over = false
    busy = false
    kb.reset()
    nextBtn.style.display = 'none'
    msg.className = 'wd-msg'
    msg.textContent = `${word.length} letters`
    render()
  }
  const complete = () => word.split('').every((ch) => guessed.has(ch))
  const end = (win: boolean) => {
    over = true
    if (win) {
      solved++
      const pts = 100 + (maxWrong - wrong) * 20
      score += pts
      msg.className = 'wd-msg ok'
      msg.textContent = `Saved! +${pts}`
      env.sfx('win')
    } else {
      msg.className = 'wd-msg no'
      msg.textContent = `It was "${word.toUpperCase()}"`
      env.sfx('lose')
    }
    nextBtn.style.display = ''
    nextBtn.textContent = round + 1 >= words.length ? 'Finish ▶' : 'Next ▶'
    render()
  }
  function press(k: string) {
    if (over || busy) return
    if (k === 'Enter') return
    if (!/^[a-z]$/.test(k) || guessed.has(k)) return
    guessed.add(k)
    if (word.includes(k)) {
      kb.mark(k, 'g')
      env.sfx('point')
    } else {
      kb.mark(k, 'x')
      wrong++
      env.sfx('hit')
    }
    msg.textContent = ''
    render()
    if (complete()) end(true)
    else if (wrong >= maxWrong) end(false)
  }
  hintBtn.onclick = () => {
    if (over || hints <= 0) return
    const left = [...new Set(word)].filter((ch) => !guessed.has(ch))
    if (left.length <= 1) return
    hints--
    score = Math.max(0, score - 20)
    const ch = rng.pick(left)
    guessed.add(ch)
    kb.mark(ch, 'g')
    env.sfx('power')
    render()
    if (complete()) end(true)
  }
  nextBtn.onclick = () => {
    if (!over) return
    if (round + 1 >= words.length) {
      c.finish(score, solved >= 3, `${solved}/${words.length} words saved · ${topic}`)
      return
    }
    round++
    start()
  }
  c.onKey((e) => {
    if (e.key === 'Enter' && over) {
      nextBtn.click()
      return
    }
    const k = keyName(e)
    if (k) press(k)
  })
  start()
}
