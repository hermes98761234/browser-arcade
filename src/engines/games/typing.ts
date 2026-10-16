// Typing: falling-words typing shooter. Type a word's letters to lock on and blast it; waves, combo, WPM and accuracy.
import { background, Bag, byDiff, createStage, emoji, isTouch, loop, Particles, roundRect, Shake, text, type Engine } from '../kit'
import { TOPICS } from '../logic/words'

const FONT = (s: number) => `700 ${s}px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`

type Special = '' | 'freeze' | 'nuke' | 'heal'
interface Word {
  s: string
  x: number
  y: number
  w: number
  vy: number
  drift: number
  ph: number
  icon: string
  special: Special
  typed: number
  hit: number
  born: number
}
interface Bolt { x0: number; y0: number; w: Word; t: number }
interface Pop { x: number; y: number; s: string; c: string; t: number }

const POOL = [...new Set(Object.values(TOPICS).flat())].filter((w) => w.length >= 3 && w.length <= 10)

const engine: Engine = {
  start(env) {
    const { theme: t, rng, mods } = env
    const hr = env.host.getBoundingClientRect()
    const portrait = hr.width > 0 && hr.height > 0 ? hr.height > hr.width * 1.1 : window.innerHeight > window.innerWidth
    const W = portrait ? 420 : 800
    const H = portrait ? 720 : 450
    const FLOOR = H - 92
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const kids = /kid|spell|learn/i.test(env.name)
    const slash = t.id === 'ninja' || /ninja|slice|slash/i.test(env.name)
    const endless = mods.has('endless') || mods.has('zen')
    const totalWaves = byDiff(env, 6, 8, 10)
    const fontSize = mods.has('giant') ? 30 : mods.has('tiny') ? 17 : kids ? 26 : 22
    let [minLen, maxLen] = kids ? [3, 5] : byDiff(env, [3, 5], [4, 7], [5, 10])
    const speedMul = (mods.has('fast') ? 1.3 : 1) * (mods.has('slow') ? 0.75 : 1) * (mods.has('hard') ? 1.2 : 1)
    const maxLives = mods.has('zen') ? 99 : byDiff(env, 7, 5, 3)

    let lives = maxLives
    let score = 0
    let wave = 0
    let spawnedInWave = 0
    let quota = 0
    let spawnT = 1
    let waveBanner = 2.2
    let intermission = 0
    let freeze = 0
    let time = 0
    let typingTime = 0
    let started = false
    let over = false
    let combo = 0
    let bestCombo = 0
    let correctKeys = 0
    let totalKeys = 0
    let wordsKilled = 0
    let target: Word | null = null
    let aim = 0
    let flash = 0
    let beam: { x: number; y: number; t: number } | null = null
    const words: Word[] = []
    const bolts: Bolt[] = []
    const pops: Pop[] = []
    const recent: string[] = []
    const stars = Array.from({ length: 50 }, () => ({ x: rng() * W, y: rng() * H, s: 0.4 + rng() * 1.4, v: 6 + rng() * 22 }))
    const TX = W / 2
    const TY = H - 44

    const wpm = () => (typingTime > 3 ? Math.round(correctKeys / 5 / (typingTime / 60)) : 0)
    const acc = () => (totalKeys ? Math.round((correctKeys / totalKeys) * 100) : 100)
    const mult = () => Math.min(5, 1 + Math.floor(combo / 4))

    const hud = () => {
      env.score(score)
      const hearts = lives > 9 ? `❤️×${lives}` : '❤️'.repeat(Math.max(0, lives))
      env.status(`Wave ${Math.max(1, wave)}${endless ? '' : `/${totalWaves}`} · ${hearts} · ${wpm()} WPM`)
    }

    const startWave = () => {
      wave++
      spawnedInWave = 0
      quota = 7 + wave * 2 + byDiff(env, 0, 2, 4)
      spawnT = 0.6
      waveBanner = 2
      intermission = 0
      const grow = Math.floor((wave - 1) / 3)
      minLen = Math.min(8, (kids ? 3 : byDiff(env, 3, 4, 5)) + Math.floor(grow / 2))
      maxLen = Math.min(10, (kids ? 5 : byDiff(env, 5, 7, 10)) + grow)
      if (wave > 1) env.sfx('power')
      hud()
    }

    const measure = (s: string) => {
      ctx.font = FONT(fontSize)
      return ctx.measureText(s).width + fontSize * 2.4
    }

    const pickWord = () => {
      const used = new Set(words.map((w) => w.s[0]))
      const ok = POOL.filter((w) => w.length >= minLen && w.length <= maxLen && !recent.includes(w))
      const free = ok.filter((w) => !used.has(w[0]))
      const s = rng.pick(free.length ? free : ok.length ? ok : POOL)
      recent.push(s)
      if (recent.length > 24) recent.shift()
      return s
    }

    const spawn = () => {
      const s = pickWord()
      const w = measure(s)
      let x = W / 2
      for (let i = 0; i < 12; i++) {
        x = rng.range(w / 2 + 12, W - w / 2 - 12)
        if (!words.some((o) => o.y < 90 && Math.abs(o.x - x) < (o.w + w) / 2 + 8)) break
      }
      const special: Special = wave >= 2 && rng.chance(0.09) ? rng.pick(['freeze', 'nuke', 'heal'] as const) : ''
      const base = byDiff(env, 24, 32, 42) + wave * 3.2 + (kids ? -6 : 0)
      words.push({
        s, x, y: 34, w, vy: base * speedMul * (1.15 - s.length * 0.025), drift: mods.has('wind') ? rng.range(-24, 24) : 0, ph: rng() * 6,
        icon: special === 'freeze' ? '❄️' : special === 'nuke' ? '💣' : special === 'heal' ? '❤️' : rng.pick(t.foes), special, typed: 0, hit: 0, born: time,
      })
      spawnedInWave++
    }

    const pop = (x: number, y: number, s: string, c: string) => pops.push({ x, y, s, c, t: 0.9 })

    const destroy = (w: Word, byBlast = false) => {
      const i = words.indexOf(w)
      if (i >= 0) words.splice(i, 1)
      if (target === w) target = null
      const col = w.special ? '#facc15' : t.accent
      fx.burst(w.x, w.y, col, 22, 240, 4)
      fx.burst(w.x, w.y, t.accent2, 10, 150, 3)
      if (!byBlast) {
        wordsKilled++
        combo++
        bestCombo = Math.max(bestCombo, combo)
        const pts = w.s.length * 10 * mult() + (w.special ? 50 : 0)
        score += pts
        pop(w.x, w.y - 18, `+${pts}`, mult() > 1 ? '#facc15' : t.fg)
        if (combo > 0 && combo % 4 === 0) pop(w.x, w.y + 6, `COMBO x${mult()}`, t.accent2)
        shake.kick(2)
      }
      env.sfx(w.special ? 'power' : 'boom')
      if (w.special === 'freeze') {
        freeze = 4
        pop(w.x, w.y - 40, 'FREEZE', '#7dd3fc')
      } else if (w.special === 'heal') {
        lives = Math.min(maxLives, lives + 1)
        pop(w.x, w.y - 40, '+1 LIFE', '#f87171')
      } else if (w.special === 'nuke') {
        pop(w.x, w.y - 40, 'BOOM!', '#fb923c')
        shake.kick(8)
        flash = 0.4
        for (const o of [...words]) {
          score += o.s.length * 5
          destroy(o, true)
        }
      }
      hud()
    }

    const breach = (w: Word) => {
      const i = words.indexOf(w)
      if (i >= 0) words.splice(i, 1)
      if (target === w) target = null
      if (!w.special) {
        lives--
        combo = 0
        shake.kick(9)
        flash = 0.25
        env.sfx('hit')
        pop(w.x, FLOOR - 6, '💥', t.danger)
      }
      fx.burst(w.x, FLOOR, t.danger, 22, 200, 4)
      hud()
      if (lives <= 0) finish(false)
    }

    const finish = (won: boolean) => {
      if (over) return
      over = true
      env.sfx(won ? 'win' : 'lose')
      env.end({ score, won, text: `${wordsKilled} words · wave ${wave} · ${wpm()} WPM · ${acc()}% accuracy · best combo ${bestCombo}` })
    }

    const key = (ch: string) => {
      if (over) return
      started = true
      totalKeys++
      const c = ch.toLowerCase()
      if (target && !words.includes(target)) target = null
      if (target) {
        if (target.s[target.typed] === c) {
          correctKeys++
          target.typed++
          target.hit = 0.15
          bolts.push({ x0: TX, y0: TY - 10, w: target, t: 0 })
          env.sfx('shoot')
          if (target.typed >= target.s.length) {
            beam = { x: target.x, y: target.y, t: 0.14 }
            destroy(target)
          }
        } else {
          combo = 0
          if (!kids) shake.kick(3)
          flash = 0.12
          env.sfx('click')
          pop(target.x, target.y + 22, '✕', t.danger)
          hud()
        }
        return
      }
      // Lock onto the lowest word that starts with this letter.
      let best: Word | null = null
      for (const w of words) if (w.s[0] === c && (!best || w.y > best.y)) best = w
      if (best) {
        correctKeys++
        target = best
        best.typed = 1
        best.hit = 0.15
        bolts.push({ x0: TX, y0: TY - 10, w: best, t: 0 })
        env.sfx('shoot')
        if (best.s.length === 1) destroy(best)
      } else {
        combo = 0
        flash = 0.1
        env.sfx('click')
      }
    }

    const unlock = () => {
      if (target) {
        target.typed = 0
        target = null
      }
    }

    let input: HTMLInputElement | null = null
    bag.on(window, 'keydown', (e) => {
      const el = e.target as HTMLElement | null
      if (el === input) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Escape' || e.key === 'Tab' || e.key === 'Backspace') {
        if (e.key !== 'Escape') e.preventDefault()
        unlock()
        return
      }
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        if (e.key === ' ') e.preventDefault()
        key(e.key)
      }
    })

    // Touch devices: tap the playfield to bring up the on-screen keyboard.

    if (isTouch()) {
      input = document.createElement('input')
      input.type = 'text'
      input.autocapitalize = 'off'
      input.autocomplete = 'off'
      input.spellcheck = false
      input.setAttribute('aria-label', 'type here')
      Object.assign(input.style, { position: 'absolute', left: '0', bottom: '0', width: '60%', height: '36px', opacity: '0.02', fontSize: '16px' })
      env.host.appendChild(input)
      input.addEventListener('input', () => {
        for (const ch of input!.value) if (/[a-zA-Z]/.test(ch)) key(ch)
        input!.value = ''
      })
      bag.on(st.canvas, 'pointerdown', () => input?.focus())
      bag.add(() => input?.remove())
    }
    st.canvas.focus({ preventScroll: true })

    startWave()
    hud()

    const update = (dt: number) => {
      time += dt
      fx.update(dt)
      shake.update(dt)
      for (const s of stars) {
        s.y += s.v * dt
        if (s.y > H) s.y = 0
      }
      for (const p of pops) {
        p.t -= dt
        p.y -= 26 * dt
      }
      while (pops.length && pops[0].t <= 0) pops.shift()
      for (const b of bolts) b.t += dt / 0.1
      while (bolts.length && bolts[0].t >= 1) bolts.shift()
      if (beam) {
        beam.t -= dt
        if (beam.t <= 0) beam = null
      }
      flash = Math.max(0, flash - dt)
      if (over) return
      if (started) typingTime += dt
      if (target) aim += (Math.atan2(target.x - TX, TY - target.y) - aim) * Math.min(1, dt * 14)
      else aim *= 1 - Math.min(1, dt * 6)
      waveBanner = Math.max(0, waveBanner - dt)
      freeze = Math.max(0, freeze - dt)
      for (const w of words) w.hit = Math.max(0, w.hit - dt)

      if (intermission > 0) {
        intermission -= dt
        if (intermission <= 0) startWave()
        return
      }
      if (spawnedInWave < quota && waveBanner < 1.2) {
        spawnT -= dt
        if (spawnT <= 0 && words.length < 9) {
          spawn()
          spawnT = Math.max(0.65, byDiff(env, 2.7, 2.1, 1.6) - wave * 0.12) / speedMul * rng.range(0.8, 1.2)
        }
      }
      const slow = freeze > 0 ? 0.25 : 1
      for (const w of [...words]) {
        w.y += w.vy * dt * slow
        if (w.drift) w.x = Math.max(w.w / 2 + 4, Math.min(W - w.w / 2 - 4, w.x + Math.sin(time * 1.4 + w.ph) * w.drift * dt))
        if (w.y >= FLOOR - 10) breach(w)
        if (over) return
      }
      if (spawnedInWave >= quota && words.length === 0 && !over) {
        const bonus = wave * 50 + Math.max(0, lives) * 10
        score += bonus
        pop(W / 2, H / 2, `WAVE CLEAR +${bonus}`, t.good)
        env.sfx('win')
        if (!endless && wave >= totalWaves) {
          hud()
          finish(true)
          return
        }
        intermission = 1.6
        hud()
      }
    }

    const heart = (x: number, y: number, full: boolean) => {
      ctx.globalAlpha = full ? 1 : 0.25
      emoji(ctx, '❤️', x, y, 15)
      ctx.globalAlpha = 1
    }

    const draw = () => {
      ctx.save()
      shake.apply(ctx)
      background(ctx, W, H, t, 0)
      ctx.fillStyle = t.fg
      for (const s of stars) {
        ctx.globalAlpha = 0.12 + s.s * 0.15
        ctx.fillRect(s.x, s.y, s.s, s.s * 1.6)
      }
      ctx.globalAlpha = 1
      // Ground and danger line.
      const g = ctx.createLinearGradient(0, FLOOR, 0, H)
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(1, 'rgba(0,0,0,0.45)')
      ctx.fillStyle = g
      ctx.fillRect(0, FLOOR - 20, W, H - FLOOR + 20)
      ctx.strokeStyle = t.danger
      ctx.globalAlpha = 0.5 + Math.sin(time * 4) * 0.15
      ctx.setLineDash([10, 8])
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, FLOOR)
      ctx.lineTo(W, FLOOR)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
      for (let i = 0; i < W / 40; i++) roundRect(ctx, i * 40 + 2, H - 22, 36, 18, 5, t.blocks[i % t.blocks.length])
      if (freeze > 0) {
        ctx.fillStyle = 'rgba(125,211,252,0.12)'
        ctx.fillRect(0, 0, W, H)
      }

      // Words.
      ctx.font = FONT(fontSize)
      for (const w of words) {
        const h = fontSize + 18
        const x = w.x - w.w / 2
        const y = w.y - h / 2 + Math.sin(time * 3 + w.ph) * 1.5
        const locked = w === target
        ctx.shadowColor = locked ? t.accent : w.special ? '#facc15' : 'rgba(0,0,0,0.5)'
        ctx.shadowBlur = locked ? 18 : 8
        roundRect(ctx, x, y, w.w, h, h / 2, 'rgba(8,10,24,0.82)', locked ? t.accent : w.special ? '#facc15' : t.accent2, locked ? 3 : 1.5)
        ctx.shadowBlur = 0
        emoji(ctx, w.icon, x + fontSize * 0.95, y + h / 2 + 1, fontSize * 0.95)
        ctx.font = FONT(fontSize)
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        const tx = x + fontSize * 1.75
        const typed = w.s.slice(0, w.typed)
        ctx.fillStyle = '#facc15'
        ctx.fillText(typed, tx, y + h / 2 + 1)
        ctx.fillStyle = w.hit > 0 ? '#fff' : '#f1f5f9'
        ctx.fillText(w.s.slice(w.typed), tx + ctx.measureText(typed).width, y + h / 2 + 1)
        if (locked) {
          ctx.strokeStyle = t.accent
          ctx.lineWidth = 1.5
          ctx.globalAlpha = 0.5
          ctx.beginPath()
          ctx.moveTo(TX, TY - 20)
          ctx.lineTo(w.x, w.y + h / 2)
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      }

      // Bolts and beam.
      for (const b of bolts) {
        const k = Math.min(1, b.t)
        const bx = b.x0 + (b.w.x - b.x0) * k
        const by = b.y0 + (b.w.y - b.y0) * k
        ctx.fillStyle = t.accent
        ctx.shadowColor = t.accent
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(bx, by, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
      if (beam) {
        ctx.strokeStyle = slash ? '#fff' : t.accent
        ctx.lineWidth = slash ? 3 : 6
        ctx.shadowColor = t.accent
        ctx.shadowBlur = 20
        ctx.globalAlpha = Math.min(1, beam.t / 0.1)
        ctx.beginPath()
        if (slash) {
          ctx.moveTo(beam.x - 60, beam.y - 40)
          ctx.lineTo(beam.x + 60, beam.y + 40)
        } else {
          ctx.moveTo(TX, TY - 18)
          ctx.lineTo(beam.x, beam.y)
        }
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }

      // Turret.
      ctx.shadowColor = t.accent
      ctx.shadowBlur = 16
      roundRect(ctx, TX - 40, TY + 10, 80, 18, 8, t.bg2, t.accent, 2)
      ctx.shadowBlur = 0
      emoji(ctx, t.hero, TX, TY - 2, 46, aim * 0.5)
      fx.draw(ctx)
      for (const p of pops) {
        ctx.globalAlpha = Math.min(1, p.t * 2)
        text(ctx, p.s, p.x, p.y, { size: 14, color: p.c, shadow: 'rgba(0,0,0,.7)' })
      }
      ctx.globalAlpha = 1

      // HUD.
      ctx.fillStyle = 'rgba(0,0,0,0.38)'
      ctx.fillRect(0, 0, W, 26)
      text(ctx, `SCORE ${score}`, 10, 13, { size: portrait ? 9 : 11, align: 'left', color: t.fg })
      text(ctx, `${wpm()} WPM`, portrait ? 130 : 200, 13, { size: 11, align: 'left', color: t.accent })
      text(ctx, `${acc()}%`, portrait ? 215 : 320, 13, { size: 11, align: 'left', color: t.good })
      text(ctx, mult() > 1 ? `COMBO x${mult()}  (${combo})` : combo ? `COMBO ${combo}` : '', portrait ? 10 : 410, portrait ? 40 : 13, { size: 11, align: 'left', color: '#facc15' })
      const shown = Math.min(maxLives, portrait ? 6 : 10)
      for (let i = 0; i < shown; i++) heart(W - 14 - i * 18, 13, i < lives)
      if (waveBanner > 0 && !over) {
        ctx.globalAlpha = Math.min(1, waveBanner)
        text(ctx, endless ? `WAVE ${wave}` : `WAVE ${wave} / ${totalWaves}`, W / 2, H / 2 - 40, { size: 30, color: t.fg, shadow: t.accent })
        if (wave === 1) text(ctx, kids ? 'TYPE THE WORDS TO POP THEM' : 'TYPE THE WORDS BEFORE THEY LAND', W / 2, H / 2, { size: 12, color: t.fg })
        ctx.globalAlpha = 1
      }
      if (!started && time > 2.4 && !over) text(ctx, isTouch() ? 'TAP TO TYPE' : 'START TYPING', W / 2, FLOOR - 36, { size: 13, color: t.accent })
      if (flash > 0) {
        ctx.fillStyle = `rgba(255,60,60,${flash})`
        ctx.fillRect(0, 0, W, H)
      }
      ctx.restore()
    }

    const lp = loop(update, draw)
    return {
      pause: (p) => lp.pause(p),
      destroy() {
        lp.stop()
        bag.dispose()
        st.dispose()
      },
    }
  },
}

export default engine
