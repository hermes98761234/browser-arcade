// Rhythm: 4-lane falling-note game. Each song is composed from the run's seed; the chart is derived from the same sequence.
import { Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, roundRect, Shake, text, type Engine } from '../kit'
import { audio } from '../sound'
import { compose, grade, judge, STEPS_PER_BAR, WINDOWS, type Song } from '../logic/rhythm'
import * as au from '../logic/rhythmAudio'

const LANE_KEYS = ['KeyD', 'KeyF', 'KeyJ', 'KeyK']
const ALT_KEYS = ['ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight']
const KEY_LABEL = ['D', 'F', 'J', 'K']
const SONGS = 3

interface Note {
  step: number
  lane: number
  t: number
  state: 0 | 1 | 2
}
interface Pop {
  text: string
  color: string
  t: number
}

const engine: Engine = {
  start(env) {
    const { theme: t } = env
    const hr = env.host.getBoundingClientRect()
    const portrait = hr.height > hr.width * 1.05
    const W = portrait ? 540 : 960
    const H = portrait ? 800 : 540
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const bag = new Bag()
    const k = keys()
    const fx = new Particles()
    const shake = new Shake()
    const diff = env.difficulty
    const winG = WINDOWS[diff][1]
    const approach = byDiff(env, 1.8, 1.45, 1.15)
    const baseBpm = byDiff(env, 96, 108, 120) * (env.mods.has('fast') ? 1.12 : env.mods.has('slow') ? 0.88 : 1)
    const minor = ['horror', 'cyberpunk', 'wasteland', 'halloween', 'myth', 'ninja', 'space'].includes(t.id) ? true : undefined
    const leadStyle: 'square' | 'soft' = ['retro', 'neon', 'robot', 'cyberpunk', 'space'].includes(t.id) ? 'square' : 'soft'
    const laneCols = [t.blocks[0], t.blocks[1], t.blocks[2], t.blocks[3]]

    // layout
    const laneW = portrait ? 118 : 112
    const laneX0 = (W - laneW * 4) / 2 + (portrait ? 0 : 60)
    const hitY = H * (portrait ? 0.84 : 0.8)
    const topY = portrait ? 120 : 70

    // ---- state ----
    type Phase = 'wait' | 'count' | 'play' | 'between' | 'results'
    let phase: Phase = 'wait'
    let songIdx = 0
    let song: Song
    let notes: Note[] = []
    let T0 = 0
    let nextStep = 0
    let health = 100
    let combo = 0
    let maxCombo = 0
    let score = 0
    const tot = { perfect: 0, good: 0, notes: 0 }
    let sc = { perfect: 0, good: 0, miss: 0 }
    let time = 0
    let waitT = 0
    let betweenT = 0
    let resultsT = 0
    let failed = false
    let ended = false
    let paused = false
    let frozen = 0
    let useAudio = false
    const pops: Pop[] = []
    const press = [0, 0, 0, 0]
    const heroKick = { v: 0, x: 0 }
    let lastBeat = -1

    /** Raw clock used for scheduling: AudioContext time (or wall time when audio is unavailable). */
    const clock = () => {
      if (paused) return frozen
      const a = audio()
      return useAudio && a ? a.currentTime : performance.now() / 1000
    }
    /** Clock used for visuals and judging: compensates the audio output latency so what you hear matches what you see. */
    const vnow = () => {
      const a = audio()
      return clock() - (useAudio && a ? clamp(a.outputLatency || 0, 0, 0.12) : 0)
    }
    const beatDur = () => (song ? 60 / song.bpm : 0.5)

    const startSong = () => {
      const bpm = baseBpm * (1 + songIdx * 0.1)
      song = compose({ seed: env.seed, index: songIdx, diff, bpm: Math.round(bpm), minor, bars: byDiff(env, 10, 12, 12) })
      notes = song.chart.map((c) => ({ step: c.step, lane: c.lane, t: 0, state: 0 }))
      sc = { perfect: 0, good: 0, miss: 0 }
      phase = 'count'
      const now = clock()
      T0 = now + 4 * beatDur() + 0.3
      for (const n of notes) n.t = T0 + n.step * song.stepDur
      nextStep = 0
      for (let i = 0; i < 4; i++) au.tick(T0 - (4 - i) * beatDur(), i === 3)
      lastBeat = -1
      hud()
    }

    const hud = () => {
      env.score(score)
      env.status(`Song ${songIdx + 1}/${SONGS} · ♥ ${Math.max(0, Math.round(health))}% · Combo ${combo}`)
    }

    // music lookahead scheduler
    const schedule = () => {
      if (paused || phase === 'wait' || phase === 'results' || phase === 'between' || failed) return
      const now = clock()
      const sd = song.stepDur
      while (nextStep < song.steps && T0 + nextStep * sd < now + 0.16) {
        const s = nextStep
        const when = T0 + s * sd
        if (song.kick[s]) au.kick(when)
        if (song.snare[s]) au.snare(when)
        if (song.hat[s]) au.hat(when, song.hat[s] === 2)
        const b = song.bass[s]
        if (b !== null) au.bass(b, when, sd * 3)
        const l = song.lead[s]
        if (l !== null) au.lead(l, when, sd * 2, leadStyle)
        if (s % STEPS_PER_BAR === 0) au.pad(song.chords[s / STEPS_PER_BAR], when, sd * 14)
        nextStep++
      }
    }
    bag.interval(schedule, 25)

    // ---- judging ----
    const popup = (txt: string, color: string) => pops.push({ text: txt, color, t: time })
    const laneCx = (l: number) => laneX0 + l * laneW + laneW / 2
    const hitNote = (lane: number) => {
      if (phase !== 'play' || failed) return
      const now = vnow()
      let best: Note | null = null
      for (const n of notes) {
        if (n.lane !== lane || n.state !== 0) continue
        const dt = now - n.t
        if (dt < -winG) break
        if (Math.abs(dt) <= winG) {
          best = n
          break
        }
      }
      press[lane] = 1
      if (!best) return
      const dt = now - best.t
      const j = judge(dt, diff)
      if (!j) return
      best.state = 1
      combo++
      maxCombo = Math.max(maxCombo, combo)
      const mult = 1 + Math.min(combo, 50) / 50
      score += Math.round((j === 'perfect' ? 300 : 150) * mult)
      if (j === 'perfect') {
        sc.perfect++
        health = Math.min(100, health + 1.5)
        popup('PERFECT', t.accent2)
        fx.burst(laneCx(lane), hitY, laneCols[lane], 22, 260, 4)
        heroKick.v = 1
        env.sfx('point')
      } else {
        sc.good++
        health = Math.min(100, health + 0.5)
        popup('GOOD', t.good)
        fx.burst(laneCx(lane), hitY, laneCols[lane], 10, 160, 3)
      }
      au.hitFx(lane, j === 'perfect')
      if (combo > 0 && combo % 10 === 0) {
        popup(`${combo} COMBO!`, '#fde047')
        env.sfx('power')
      }
      hud()
    }
    const missNote = (n: Note) => {
      n.state = 2
      sc.miss++
      combo = 0
      health -= byDiff(env, 5, 7, 10)
      popup('MISS', t.danger)
      au.missFx()
      shake.kick(3)
      heroKick.v = -1
      hud()
      if (health <= 0 && !failed) {
        failed = true
        env.sfx('lose')
        finishSong()
      }
    }

    const finishSong = () => {
      const notesDone = notes.length
      tot.perfect += sc.perfect
      tot.good += sc.good
            tot.notes += notesDone
      if (failed || songIdx >= SONGS - 1) {
        phase = 'results'
        resultsT = 0
        if (!failed) env.sfx('win')
      } else {
        phase = 'between'
        betweenT = 0
        env.sfx('power')
      }
    }

    // ---- input ----
    for (let i = 0; i < 4; i++) {
      bag.on(window, 'keydown', (e) => {
        if (e.repeat) return
        if (e.code === LANE_KEYS[i] || e.code === ALT_KEYS[i]) {
          if (ALT_KEYS.includes(e.code)) e.preventDefault()
          hitNote(i)
        }
      })
    }
    bag.on(st.canvas, 'pointerdown', (e) => {
      e.preventDefault()
      if (phase === 'results' && resultsT > 0.8) return void finishRun()
      const p = st.toLocal(e)
      const lane = Math.floor((p.x - laneX0) / laneW)
      if (lane >= 0 && lane < 4) hitNote(lane)
      else if (p.x < laneX0) hitNote(clamp(Math.floor(((p.x - 0) / Math.max(1, laneX0)) * 2), 0, 1))
      else hitNote(clamp(2 + Math.floor((p.x - (laneX0 + laneW * 4)) / Math.max(1, W - laneX0 - laneW * 4) * 2), 2, 3))
    })
    bag.on(window, 'keydown', (e) => {
      if ((e.code === 'Enter' || e.code === 'Space') && phase === 'results' && resultsT > 0.8) finishRun()
    })

    const finishRun = () => {
      if (ended) return
      ended = true
      const g = grade(tot.perfect, tot.good, tot.notes)
      env.end({ score, won: !failed, text: `${failed ? 'Failed' : 'Cleared'} · Grade ${g} · Max combo ${maxCombo}` })
    }

    // ---- update ----
    const update = (dt: number) => {
      time += dt
      fx.update(dt, 300)
      shake.update(dt)
      for (let i = 0; i < 4; i++) press[i] *= 0.82
      heroKick.v *= 0.9
      for (let i = pops.length - 1; i >= 0; i--) if (time - pops[i].t > 0.7) pops.splice(i, 1)
      if (phase === 'wait') {
        waitT += dt
        const a = audio()
        if (a && a.state === 'running') {
          useAudio = true
          startSong()
        } else if (waitT > 0.7) {
          useAudio = false
          startSong()
        }
        return
      }
      if (phase === 'between') {
        betweenT += dt
        if (betweenT > 3) {
          songIdx++
          startSong()
        }
        return
      }
      if (phase === 'results') {
        resultsT += dt
        if (resultsT > 6) finishRun()
        return
      }
      const now = vnow()
      if (phase === 'count' && now >= T0) phase = 'play'
      // misses
      for (const n of notes) {
        if (n.state === 0 && now - n.t > winG) {
          if (phase === 'play') missNote(n)
          else n.state = 2
        }
        if (n.t - now > approach + 1) break
      }
      if (phase === 'play' && now - T0 > song.steps * song.stepDur + 0.6) finishSong()
      // beat tracking for hero pulse
      const beat = Math.floor((now - T0) / beatDur())
      if (beat !== lastBeat) {
        lastBeat = beat
        heroKick.x = (heroKick.x + 1) % 2
      }
    }

    // ---- draw ----
    const draw = () => {
      const now = phase === 'wait' ? 0 : vnow()
      const beatPhase = phase === 'wait' ? 0 : (((now - T0) / beatDur()) % 1 + 1) % 1
      const pulse = Math.exp(-beatPhase * 4)
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, t.bg)
      g.addColorStop(1, t.bg2)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      ctx.save()
      shake.apply(ctx)
      // pulsing backdrop rings
      ctx.globalAlpha = 0.1 + pulse * 0.1
      ctx.strokeStyle = t.accent
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(laneX0 + laneW * 2, hitY, 90 + pulse * 40, 0, 7)
      ctx.stroke()
      ctx.globalAlpha = 1
      // lanes
      for (let l = 0; l < 4; l++) {
        const x = laneX0 + l * laneW
        ctx.fillStyle = l % 2 ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.08)'
        ctx.fillRect(x, topY, laneW, hitY + 60 - topY)
        if (press[l] > 0.05) {
          const gr = ctx.createLinearGradient(0, hitY - 220, 0, hitY)
          gr.addColorStop(0, 'rgba(255,255,255,0)')
          gr.addColorStop(1, laneCols[l])
          ctx.globalAlpha = press[l] * 0.5
          ctx.fillStyle = gr
          ctx.fillRect(x, hitY - 220, laneW, 220)
          ctx.globalAlpha = 1
        }
        ctx.strokeStyle = 'rgba(255,255,255,.12)'
        ctx.lineWidth = 1.5
        ctx.strokeRect(x, topY, laneW, hitY + 60 - topY)
      }
      // hit line
      ctx.shadowColor = t.accent
      ctx.shadowBlur = 10 + pulse * 14
      ctx.fillStyle = t.accent
      ctx.fillRect(laneX0, hitY - 2, laneW * 4, 4)
      ctx.shadowBlur = 0
      // notes
      if (phase !== 'wait') {
        for (const n of notes) {
          if (n.state === 1) continue
          const dtn = n.t - now
          if (dtn > approach) break
          if (dtn < -0.5) continue
          const y = hitY - (dtn / approach) * (hitY - topY)
          const x = laneX0 + n.lane * laneW
          const col = laneCols[n.lane]
          ctx.globalAlpha = n.state === 2 ? 0.3 : clamp((approach - dtn) * 3, 0, 1)
          ctx.shadowColor = col
          ctx.shadowBlur = n.state === 2 ? 0 : 14
          roundRect(ctx, x + 8, y - 16, laneW - 16, 32, 10, col)
          ctx.shadowBlur = 0
          ctx.fillStyle = 'rgba(255,255,255,.35)'
          ctx.fillRect(x + 16, y - 11, laneW - 32, 5)
          ctx.globalAlpha = 1
        }
      }
      // key pads
      for (let l = 0; l < 4; l++) {
        const cx = laneCx(l)
        const cy = hitY + 34
        const pr = press[l]
        ctx.shadowColor = laneCols[l]
        ctx.shadowBlur = pr * 20
        ctx.fillStyle = pr > 0.1 ? laneCols[l] : 'rgba(255,255,255,.1)'
        ctx.beginPath()
        ctx.arc(cx, cy, 24 + pr * 4, 0, 7)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.lineWidth = 3
        ctx.strokeStyle = laneCols[l]
        ctx.stroke()
        text(ctx, KEY_LABEL[l], cx, cy + 1, { size: 16, color: pr > 0.1 ? '#0b0b12' : '#fff' })
      }
      fx.draw(ctx)
      ctx.restore()

      // HUD
      const barX = laneX0
      const barW = laneW * 4
      roundRect(ctx, barX, portrait ? 78 : 34, barW, 12, 6, 'rgba(255,255,255,.14)')
      roundRect(ctx, barX, portrait ? 78 : 34, Math.max(0, barW * clamp(health / 100, 0, 1)), 12, 6, health > 35 ? t.good : t.danger)
      text(ctx, `SONG ${songIdx + 1}/${SONGS}`, barX, portrait ? 52 : 14, { size: 11, color: t.fg, align: 'left' })
      text(ctx, String(score), barX + barW, portrait ? 52 : 14, { size: 14, color: t.accent, align: 'right' })
      if (phase !== 'wait' && song) {
        const prog = clamp((now - T0) / (song.steps * song.stepDur), 0, 1)
        ctx.fillStyle = t.accent
        ctx.fillRect(barX, (portrait ? 78 : 34) + 16, barW * prog, 3)
        text(ctx, `${song.bpm} BPM`, barX + barW / 2, portrait ? 52 : 14, { size: 10, color: t.fg })
      }
      // hero
      const hx = portrait ? W - 50 : 130
      const hy = portrait ? 56 : hitY - 120
      const hs = (portrait ? 46 : 110) * (1 + pulse * 0.08 + Math.max(0, heroKick.v) * 0.2)
      emoji(ctx, t.hero, hx + Math.sin(time * 3) * 6 * (portrait ? 0.3 : 1), hy - Math.max(0, heroKick.v) * 24 + (heroKick.v < 0 ? Math.sin(time * 40) * 4 : 0), hs, Math.sin(now * Math.PI / beatDur() * 0.5) * 0.12)
      // combo
      if (combo >= 3) {
        const cx = laneX0 + laneW * 2
        text(ctx, String(combo), cx, portrait ? 190 : 150, { size: 46 + Math.max(0, heroKick.v) * 8, color: '#fff', shadow: t.accent })
        text(ctx, 'COMBO', cx, portrait ? 226 : 188, { size: 12, color: t.accent })
      }
      // judgement pops
      for (const p of pops) {
        const a = (time - p.t) / 0.7
        ctx.globalAlpha = 1 - a
        text(ctx, p.text, laneX0 + laneW * 2, hitY - 90 - a * 30, { size: 22 * (1 + (1 - a) * 0.3), color: p.color, shadow: p.color })
      }
      ctx.globalAlpha = 1

      // overlays
      if (phase === 'wait') text(ctx, 'GET READY', W / 2, H / 2, { size: 22, color: t.fg })
      if (phase === 'count') {
        const left = T0 - now
        const n = Math.ceil(left / beatDur())
        if (n >= 1 && n <= 4) {
          const f = (left / beatDur()) % 1
          text(ctx, n > 3 ? env.name.toUpperCase() : String(n), laneX0 + laneW * 2, H * 0.42, { size: n > 3 ? 14 : 70 * (0.8 + f * 0.4), color: '#fff', shadow: t.accent })
          if (songIdx === 0 && n > 3) text(ctx, portrait ? 'TAP THE LANES' : 'D  F  J  K  OR TAP', laneX0 + laneW * 2, H * 0.42 + 40, { size: 12, color: t.accent })
        }
      }
      if (phase === 'between') {
        ctx.fillStyle = 'rgba(0,0,0,.6)'
        ctx.fillRect(0, 0, W, H)
        text(ctx, `SONG ${songIdx + 1} CLEAR`, W / 2, H * 0.36, { size: 26, color: '#fde047', shadow: '#f59e0b' })
        text(ctx, `PERFECT ${sc.perfect}   GOOD ${sc.good}   MISS ${sc.miss}`, W / 2, H * 0.46, { size: portrait ? 11 : 14, color: '#fff' })
        text(ctx, `NEXT: FASTER (${Math.round(baseBpm * (1 + (songIdx + 1) * 0.1))} BPM)`, W / 2, H * 0.56, { size: 16, color: t.accent })
      }
      if (phase === 'results') {
        ctx.fillStyle = 'rgba(0,0,0,.78)'
        ctx.fillRect(0, 0, W, H)
        const gr = grade(tot.perfect, tot.good, tot.notes)
        const k2 = clamp(resultsT * 3, 0, 1)
        const col = gr === 'S' ? '#fde047' : gr === 'A' ? t.good : gr === 'B' ? t.accent : t.danger
        text(ctx, failed ? 'SONG FAILED' : 'RESULTS', W / 2, H * 0.14, { size: 24, color: failed ? t.danger : '#fff' })
        text(ctx, gr, W / 2, H * 0.36, { size: 150 * k2, color: col, shadow: col })
        const lines = [`SCORE ${score}`, `PERFECT ${tot.perfect}  GOOD ${tot.good}`, `MISS ${Math.max(0, tot.notes - tot.perfect - tot.good)}`, `MAX COMBO ${maxCombo}`]
        lines.forEach((s, i) => text(ctx, s, W / 2, H * 0.58 + i * 34, { size: portrait ? 13 : 16, color: '#fff' }))
        if (resultsT > 0.8) text(ctx, 'TAP TO CONTINUE', W / 2, H * 0.9, { size: 12, color: t.accent })
        emoji(ctx, t.hero, portrait ? W / 2 : W * 0.2, portrait ? H * 0.72 : H * 0.5, 80 + Math.sin(time * 6) * 6)
      }
    }

    env.score(0)
    // unlock audio inside the user gesture that started the game, if possible
    audio()
    const lp = loop(update, draw)
    return {
      pause(p) {
        if (p) {
          frozen = clock()
          paused = true
          void audio()?.suspend()
        } else {
          paused = false
          void audio()?.resume()
        }
        lp.pause(p)
      },
      destroy() {
        lp.stop()
        k.dispose()
        bag.dispose()
        st.dispose()
      },
    }
  },
}

export default engine
