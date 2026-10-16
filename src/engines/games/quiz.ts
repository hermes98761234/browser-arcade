// Quiz: 12-question multiple-choice rounds with timer bonus, streaks and a 50:50 lifeline.
// Banks: math, geo, science, lang (vocabulary) and general trivia, picked from mods and keywords.
import { Bag, byDiff, createDom, makeRng, type Engine } from '../kit'
import { dailySeed } from '../logic/words'
import { buildQuiz, LANGS, pickBank, type Question } from '../logic/quiz'

const CSS = `
.qz{position:absolute;inset:0;container-type:size;display:flex;flex-direction:column;gap:clamp(6px,1.6cqh,14px);padding:clamp(8px,2cqh,18px) clamp(10px,3cqw,28px);box-sizing:border-box;color:var(--g-fg);background:linear-gradient(160deg,var(--g-bg),var(--g-bg2));font-family:system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden;user-select:none}
.qz *{box-sizing:border-box}
.qz-top{display:flex;align-items:center;gap:12px;flex:0 0 auto}
.qz-hero{font-size:clamp(30px,6cqh,52px);line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.35))}
.qz-hero.good{animation:qz-hop .6s ease}
.qz-hero.bad{animation:qz-shake .5s ease}
@keyframes qz-hop{0%,100%{transform:translateY(0)}35%{transform:translateY(-14px) scale(1.15)}}
@keyframes qz-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-9px) rotate(-8deg)}60%{transform:translateX(9px) rotate(8deg)}}
.qz-meta{flex:1;min-width:0}
.qz-dots{display:flex;gap:4px;margin-bottom:5px}
.qz-dot{flex:1;height:8px;border-radius:5px;background:color-mix(in srgb,var(--g-fg) 16%,transparent);transition:background .3s}
.qz-dot.on{background:var(--g-accent)}.qz-dot.ok{background:var(--g-good)}.qz-dot.no{background:var(--g-danger)}
.qz-stats{display:flex;gap:14px;font-weight:800;font-size:clamp(12px,2cqh,16px);align-items:center;flex-wrap:wrap}
.qz-stats b{color:var(--g-accent)}
.qz-streak{color:var(--g-accent2)}
.qz-time{height:10px;border-radius:6px;background:color-mix(in srgb,var(--g-fg) 14%,transparent);overflow:hidden;flex:0 0 auto}
.qz-time i{display:block;height:100%;width:100%;background:linear-gradient(90deg,var(--g-accent),var(--g-accent2));border-radius:6px;transition:width .1s linear}
.qz-time.low i{background:var(--g-danger)}
.qz-card{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(4px,1.2cqh,12px);text-align:center;padding:clamp(8px,2cqh,18px);border-radius:20px;background:color-mix(in srgb,var(--g-fg) 8%,transparent);border:2px solid color-mix(in srgb,var(--g-accent) 45%,transparent);box-shadow:0 10px 30px rgba(0,0,0,.18);animation:qz-in .35s ease}
@keyframes qz-in{from{opacity:0;transform:translateY(10px) scale(.98)}}
.qz-tag{font-size:clamp(10px,1.6cqh,13px);font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--g-accent2)}
.qz-q{font-size:clamp(16px,3.4cqh,28px);font-weight:700;line-height:1.25;max-width:900px}
.qz-big{font-size:clamp(34px,10cqh,88px);font-weight:900;line-height:1.1;color:var(--g-accent);word-break:break-word;font-family:system-ui,-apple-system,"Segoe UI","Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif}
.qz-big.txt{font-size:clamp(26px,7cqh,60px);color:var(--g-fg)}
.qz-ans{display:grid;grid-template-columns:1fr 1fr;gap:clamp(6px,1.6cqh,12px);flex:0 0 auto}
@container (max-width:560px){.qz-ans{grid-template-columns:1fr}}
.qz-btn{display:flex;align-items:center;gap:10px;min-height:clamp(46px,9cqh,76px);padding:8px 14px;border-radius:16px;border:2px solid color-mix(in srgb,var(--g-fg) 30%,transparent);background:color-mix(in srgb,var(--g-fg) 9%,transparent);color:var(--g-fg);font:inherit;font-size:clamp(14px,2.8cqh,24px);font-weight:700;text-align:left;cursor:pointer;transition:transform .12s,background .2s,border-color .2s,opacity .2s}
.qz-btn:hover:not(:disabled){transform:translateY(-2px);border-color:var(--g-accent);background:color-mix(in srgb,var(--g-accent) 18%,transparent)}
.qz-btn:active:not(:disabled){transform:scale(.98)}
.qz-btn .n{flex:0 0 auto;width:clamp(26px,4.6cqh,38px);height:clamp(26px,4.6cqh,38px);border-radius:10px;display:grid;place-items:center;font-weight:900;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.4);font-size:clamp(13px,2.4cqh,20px)}
.qz-btn .t{flex:1;min-width:0;overflow-wrap:anywhere;font-family:system-ui,-apple-system,"Segoe UI","Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif}
.qz-btn .t.flag{font-size:clamp(28px,6cqh,52px);text-align:center;line-height:1}
.qz-btn:disabled{cursor:default}
.qz-btn.ok{background:var(--g-good);border-color:var(--g-good);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.4);animation:qz-hop .5s ease}
.qz-btn.no{background:var(--g-danger);border-color:var(--g-danger);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.4);animation:qz-shake .4s ease}
.qz-btn.gone{opacity:.18}
.qz-foot{display:flex;align-items:center;gap:10px;flex:0 0 auto;min-height:clamp(34px,6cqh,46px)}
.qz-msg{flex:1;font-weight:800;font-size:clamp(13px,2.4cqh,19px)}
.qz-msg.ok{color:var(--g-good)}.qz-msg.no{color:var(--g-danger)}
.qz-act{border:0;border-radius:12px;padding:8px 16px;font:inherit;font-weight:800;font-size:clamp(12px,2.2cqh,16px);cursor:pointer;color:#fff;background:var(--g-accent);text-shadow:0 1px 2px rgba(0,0,0,.35)}
.qz-act.alt{background:var(--g-accent2)}
.qz-act:disabled{opacity:.35;cursor:default}
.qz-intro{justify-content:center;align-items:center;text-align:center}
.qz-intro h1{margin:0;font-size:clamp(22px,5cqh,42px);line-height:1.15}
.qz-intro p{margin:0;opacity:.85;font-size:clamp(13px,2.4cqh,18px);max-width:560px}
.qz-intro .qz-hero{font-size:clamp(54px,15cqh,110px)}
.qz-keys{font-size:clamp(11px,1.9cqh,14px);opacity:.7}
`

const BANK_ICON: Record<string, string> = { math: '🧮', geo: '🌍', science: '🔬', lang: '🗣️', trivia: '🧠' }
const BANK_LABEL: Record<string, string> = { math: 'Math', geo: 'Geography', science: 'Science', lang: 'Languages', trivia: 'Trivia' }
const isFlagOnly = (s: string) => /^[\u{1F1E6}-\u{1F1FF}]{2}$/u.test(s)

const engine: Engine = {
  start(env) {
    const { theme: t, mods } = env
    const bag = new Bag()
    const root = createDom(env.host, t, 'qz')
    const style = document.createElement('style')
    style.textContent = CSS
    root.appendChild(style)
    bag.add(() => root.remove())

    const sel = pickBank(mods, `${env.name} ${env.desc}`)
    const seedRng = mods.has('daily') ? makeRng(dailySeed()) : env.rng
    const lang = sel.lang ?? (sel.bank === 'lang' ? seedRng.pick(LANGS).id : undefined)
    const N = 12
    const questions: Question[] = buildQuiz(seedRng, { bank: sel.bank, difficulty: env.difficulty, category: sel.category, lang, count: N })
    const noTimer = mods.has('zen')
    const limit = byDiff(env, 20, 15, 10) * (mods.has('fast') ? 0.7 : 1) * (sel.bank === 'math' ? 0.9 : 1)
    const streakMul = mods.has('combo') ? 2 : 1
    let lifelines = byDiff(env, 2, 1, 1)

    let idx = -1
    let phase: 'intro' | 'ask' | 'reveal' | 'done' = 'intro'
    let elapsed = 0
    let adv = 0
    let score = 0
    let streak = 0
    let best = 0
    let correct = 0
    let paused = false
    let removed = new Set<number>()
    const results: ('ok' | 'no' | '')[] = Array(N).fill('')

    const el = (tag: string, cls = '', txt = ''): HTMLElement => {
      const e = document.createElement(tag)
      if (cls) e.className = cls
      if (txt) e.textContent = txt
      return e
    }
    const clear = () => {
      for (const c of [...root.children]) if (c !== style) c.remove()
    }

    const status = () => env.status(phase === 'intro' ? '' : `Q ${Math.min(idx + 1, N)}/${N} · 🔥 ${streak}`)

    // ----- intro -----
    const intro = () => {
      clear()
      phase = 'intro'
      const card = el('div', 'qz-card qz-intro')
      card.style.flex = '1'
      const hero = el('div', 'qz-hero', t.hero)
      const title = el('h1', '', env.name)
      const sub = el('p', '', env.desc)
      const lg = LANGS.find((l) => l.id === lang)
      const tag = el('div', 'qz-tag', `${BANK_ICON[sel.bank]} ${sel.category ? sel.category : lg ? `English → ${lg.name} ${lg.flag}` : BANK_LABEL[sel.bank]} · ${N} questions${mods.has('daily') ? ' · daily' : ''}`)
      const go = el('button', 'qz-act', 'Start ▶') as HTMLButtonElement
      go.onclick = () => next()
      const keys = el('div', 'qz-keys', 'Press 1-4 to answer · Enter to continue · faster answers earn more points')
      card.append(hero, tag, title, sub, go, keys)
      root.appendChild(card)
      status()
    }

    // ----- question screen -----
    let timeFill: HTMLElement
    let timeBar: HTMLElement
    let timeText: HTMLElement
    let scoreEl: HTMLElement
    let streakEl: HTMLElement
    let heroEl: HTMLElement
    let btns: HTMLButtonElement[] = []
    let msg: HTMLElement
    let nextBtn: HTMLButtonElement
    let hintBtn: HTMLButtonElement
    let dots: HTMLElement[] = []

    const refreshStats = () => {
      scoreEl.textContent = String(score)
      streakEl.textContent = streak > 1 ? `🔥 ${streak}` : ''
      dots.forEach((d, i) => {
        d.className = `qz-dot ${results[i] || (i === idx ? 'on' : '')}`
      })
    }

    const render = () => {
      clear()
      const q = questions[idx]
      const top = el('div', 'qz-top')
      heroEl = el('div', 'qz-hero', t.hero)
      const meta = el('div', 'qz-meta')
      const dwrap = el('div', 'qz-dots')
      dots = Array.from({ length: N }, () => dwrap.appendChild(el('span', 'qz-dot')))
      const stats = el('div', 'qz-stats')
      scoreEl = el('b')
      streakEl = el('span', 'qz-streak')
      timeText = el('span')
      stats.append(el('span', '', `Q ${idx + 1}/${N}`), el('span', '', 'Score '), scoreEl, streakEl, timeText)
      stats.children[2].before(scoreEl)
      meta.append(dwrap, stats)
      top.append(heroEl, meta)
      timeBar = el('div', 'qz-time')
      timeFill = el('i')
      timeBar.appendChild(timeFill)
      if (noTimer) timeBar.style.visibility = 'hidden'
      const card = el('div', 'qz-card')
      card.append(el('div', 'qz-tag', q.tag), el('div', 'qz-q', q.q))
      if (q.big) {
        const big = el('div', `qz-big${isFlagOnly(q.big) || /^[^\p{L}\p{N}]+$/u.test(q.big) ? '' : ' txt'}`, q.big)
        card.appendChild(big)
      }
      const ans = el('div', 'qz-ans')
      btns = q.options.map((o, i) => {
        const b = el('button', 'qz-btn') as HTMLButtonElement
        b.type = 'button'
        const n = el('span', 'n', String(i + 1))
        n.style.background = t.blocks[i % t.blocks.length]
        const tx = el('span', isFlagOnly(o) ? 't flag' : 't', o)
        b.append(n, tx)
        b.onclick = () => answer(i)
        ans.appendChild(b)
        return b
      })
      const foot = el('div', 'qz-foot')
      msg = el('div', 'qz-msg')
      hintBtn = el('button', 'qz-act alt', `50:50 ×${lifelines}`) as HTMLButtonElement
      hintBtn.title = 'Remove two wrong answers (key 5)'
      hintBtn.disabled = lifelines <= 0
      hintBtn.onclick = () => half()
      nextBtn = el('button', 'qz-act', 'Next ▶') as HTMLButtonElement
      nextBtn.style.display = 'none'
      nextBtn.onclick = () => next()
      foot.append(msg, hintBtn, nextBtn)
      root.append(top, timeBar, card, ans, foot)
      refreshStats()
      tick(0)
    }

    const next = () => {
      if (phase === 'done') return
      idx++
      if (idx >= N) {
        finish()
        return
      }
      phase = 'ask'
      elapsed = 0
      removed = new Set()
      render()
      status()
    }

    const half = () => {
      if (phase !== 'ask' || lifelines <= 0) return
      const q = questions[idx]
      const wrong = q.options.map((_, i) => i).filter((i) => i !== q.answer && !removed.has(i))
      if (wrong.length < 2) return
      lifelines--
      for (const i of env.rng.shuffle(wrong).slice(0, 2)) {
        removed.add(i)
        btns[i].disabled = true
        btns[i].classList.add('gone')
      }
      hintBtn.textContent = `50:50 ×${lifelines}`
      hintBtn.disabled = lifelines <= 0
      env.sfx('power')
    }

    const answer = (i: number) => {
      if (phase !== 'ask' || removed.has(i)) return
      phase = 'reveal'
      const q = questions[idx]
      const ok = i === q.answer
      for (const [j, b] of btns.entries()) {
        b.disabled = true
        if (j === q.answer) b.classList.add('ok')
        else if (j === i) b.classList.add('no')
        else b.classList.add('gone')
      }
      hintBtn.style.display = 'none'
      if (ok) {
        const left = noTimer ? 0.5 : Math.max(0, 1 - elapsed / limit)
        const bonus = Math.round(100 * left)
        const sbonus = Math.min(streak, 6) * 20 * streakMul
        const gain = 100 + bonus + sbonus
        streak++
        best = Math.max(best, streak)
        correct++
        score += gain
        results[idx] = 'ok'
        msg.className = 'qz-msg ok'
        msg.textContent = `Correct! +${gain}${bonus >= 80 ? ' · lightning!' : ''}${streak >= 3 ? ` · streak ${streak}` : ''}`
        heroEl.classList.add('good')
        env.sfx(streak >= 3 ? 'power' : 'point')
        adv = 1.5
      } else {
        streak = 0
        results[idx] = 'no'
        msg.className = 'qz-msg no'
        msg.textContent = i < 0 ? `Time's up! Answer: ${q.options[q.answer]}` : `Not quite. Answer: ${q.options[q.answer]}`
        heroEl.classList.add('bad')
        env.sfx('hit')
        adv = 2.8
      }
      nextBtn.style.display = ''
      nextBtn.textContent = idx === N - 1 ? 'Finish ▶' : 'Next ▶'
      env.score(score)
      refreshStats()
      status()
    }

    const finish = () => {
      phase = 'done'
      const won = correct >= Math.ceil(N * 0.6)
      env.sfx(won ? 'win' : 'lose')
      env.score(score)
      env.end({ score, won, text: `${correct}/${N} correct · best streak ${best}` })
    }

    const tick = (dt: number) => {
      if (phase === 'ask' && !noTimer) {
        elapsed += dt
        const left = Math.max(0, limit - elapsed)
        timeFill.style.width = `${(left / limit) * 100}%`
        timeBar.classList.toggle('low', left < limit * 0.3)
        timeText.textContent = `⏱ ${Math.ceil(left)}s`
        if (left <= 0) answer(-1)
      } else if (phase === 'ask' && noTimer) timeText.textContent = ''
      else if (phase === 'reveal') {
        adv -= dt
        if (adv <= 0) next()
      }
    }
    bag.interval(() => {
      if (!paused) tick(0.05)
    }, 50)

    bag.on(window, 'keydown', (e) => {
      const tg = e.target as HTMLElement | null
      if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA')) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (phase === 'intro' && (e.key === 'Enter' || e.key === ' ' || /^[1-4]$/.test(e.key))) {
        e.preventDefault()
        next()
      } else if (phase === 'ask') {
        if (/^[1-4]$/.test(e.key)) answer(Number(e.key) - 1)
        else if (e.key === '5' || e.key.toLowerCase() === 'h') half()
      } else if (phase === 'reveal' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        next()
      }
    })

    intro()
    return {
      pause(p) {
        paused = p
      },
      destroy() {
        bag.dispose()
      },
    }
  },
}

export default engine
