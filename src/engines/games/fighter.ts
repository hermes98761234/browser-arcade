// Fighter: 1v1 side-view fighting. Best of 3 rounds with a timer, health + energy bars, punch / kick / block / jump / fireball special,
// combos, hit-stop and particles. Sub-modes: brawl (default), boxing (gloves only), sumo (shove out of the ring), duel (quick-draw reflex).
import { background, Bag, byDiff, clamp, createStage, emoji, isTouch, keys, loop, Particles, pointer, roundRect, Shake, text, type Engine, type GameEnv } from '../kit'
import { aiInput, isAttack, mkAi, mkWorld, MOVES, NO_INPUT, phase, step, SPECIAL_COST, type Config, type Fighter, type Input } from '../logic/fighter'

type Kind = 'brawl' | 'boxing' | 'sumo' | 'duel'

function pickKind(env: GameEnv): Kind {
  const k = `${env.name} ${env.desc}`.toLowerCase()
  if (/sumo|push out|shove|ring-out/.test(k)) return 'sumo'
  if (/draw|showdown|standoff|iaido|quick|bullet|one-hit|sword stance|fencing/.test(k)) return 'duel'
  if (/box|punch|fist|glove|pillow|slap/.test(k) && !/kick/.test(k)) return 'boxing'
  return 'brawl'
}

const engine: Engine = {
  start(env) {
    const hr = env.host.getBoundingClientRect()
    const portrait = hr.height > hr.width * 1.1
    const LW = portrait ? 440 : 640
    const LH = portrait ? 420 : 360
    const FLOOR = LH - 56
    const st = createStage(env.host, LW, LH)
    const ctx = st.ctx
    const bag = new Bag()
    const k = keys({ twoPlayer: env.players === 2 })
    const ptr = pointer(st)
    const fx = new Particles()
    const shake = new Shake()
    const t = env.theme
    const two = env.players === 2
    const rng = env.rng
    const kind = pickKind(env)
    const mods = env.mods
    const heroE = t.hero
    const foePool = t.foes.filter((f) => f !== heroE)
    const foeE = mods.has('mirror') || /mirror/i.test(env.name) ? heroE : foePool.length ? rng.pick(foePool) : '👾'
    const scaleBase = (mods.has('giant') ? 1.3 : mods.has('tiny') ? 0.75 : 1) * (portrait ? 0.95 : 1)
    const cfg: Config = {
      width: LW, speed: (mods.has('fast') ? 1.25 : 1) * byDiff(env, 0.95, 1, 1.05), dmgMul: mods.has('combo') ? 1.15 : 1,
      boxing: kind === 'boxing', sumo: kind === 'sumo', ring: LW * 0.36,
    }
    const hp0 = kind === 'sumo' ? 100 : 100
    const w = mkWorld(cfg, hp0, scaleBase, scaleBase)
    const ai = mkAi()
    const dim = mods.has('dark')
    const names: [string, string] = two ? ['P1', 'P2'] : ['YOU', 'CPU']
    let time = 0
    let round = 1
    const wins: [number, number] = [0, 0]
    let phaseName: 'intro' | 'fight' | 'ko' | 'over' = 'intro'
    let phaseT = 0
    const roundLen = byDiff(env, 70, 60, 50)
    let roundClock = roundLen
    let slow = 1
    let damageDealt = 0
    let maxCombo = 0
    let banner = ''
    let bannerT = 0
    let pop: { x: number; y: number; s: string; t: number; c: string }[] = []
    let ended = false
    let comboShow: { who: 0 | 1; n: number; t: number } | null = null
    const say = (s: string, d = 1.2) => {
      banner = s
      bannerT = d
    }
    // duel state
    const duel = { wait: 0, signal: false, t: 0, fault: -1 as -1 | 0 | 1, winner: -1 as -1 | 0 | 1, aiReact: 0, humanReact: 0, resolved: false, slash: 0 }
    const startDuelRound = () => {
      duel.wait = 1.3 + rng.range(0, 2.6)
      duel.signal = false
      duel.t = 0
      duel.fault = -1
      duel.winner = -1
      duel.resolved = false
      duel.slash = 0
      duel.aiReact = byDiff(env, 0.52, 0.36, 0.24) + rng.range(-0.04, 0.06)
      duel.humanReact = 0
    }

    // ---------------------------------------------------------------- touch pad
    const touch = { left: false, right: false, jump: false, block: false, punch: false, kick: false, special: false }
    const prevT = { punch: false, kick: false, special: false, jump: false }
    let padEl: HTMLDivElement | null = null
    if (isTouch()) {
      const el = document.createElement('div')
      padEl = el
      el.style.cssText = 'position:absolute;inset:auto 0 8px 0;display:flex;justify-content:space-between;align-items:flex-end;padding:0 10px;pointer-events:none;z-index:3;touch-action:none;'
      const mkBtn = (label: string, key: keyof typeof touch, big = false) => {
        const b = document.createElement('button')
        b.type = 'button'
        b.textContent = label
        b.style.cssText = `pointer-events:auto;touch-action:none;user-select:none;width:${big ? 62 : 56}px;height:${big ? 62 : 56}px;border-radius:${big ? 31 : 14}px;border:2px solid rgba(255,255,255,.35);background:rgba(20,22,40,.55);color:#fff;font-size:24px;line-height:1;`
        const on = (e: Event) => {
          e.preventDefault()
          touch[key] = true
          b.style.background = 'rgba(255,255,255,.35)'
        }
        const off = (e: Event) => {
          e.preventDefault()
          touch[key] = false
          b.style.background = 'rgba(20,22,40,.55)'
        }
        b.addEventListener('pointerdown', on)
        b.addEventListener('pointerup', off)
        b.addEventListener('pointerleave', off)
        b.addEventListener('pointercancel', off)
        return b
      }
      const left = document.createElement('div')
      left.style.cssText = 'display:flex;gap:6px;pointer-events:none;'
      left.append(mkBtn('◀', 'left'), mkBtn('▶', 'right'), mkBtn('⤒', 'jump'))
      const right = document.createElement('div')
      right.style.cssText = 'display:grid;grid-template-columns:repeat(2,auto);gap:6px;pointer-events:none;'
      if (kind === 'duel') right.append(mkBtn('⚔️', 'punch', true))
      else right.append(mkBtn('👊', 'punch', true), mkBtn(kind === 'boxing' || kind === 'sumo' ? '💥' : '🦵', 'kick', true), mkBtn('🛡️', 'block'), mkBtn('✨', 'special'))
      if (kind === 'duel') el.append(right)
      else el.append(left, right)
      env.host.appendChild(el)
    }

    const inputFor = (i: 0 | 1): Input => {
      const inp: Input = { dir: 0, jump: false, block: false, punch: false, kick: false, special: false }
      if (i === 0) {
        const l = two ? k.down('KeyA') : k.down('KeyA') || k.down('ArrowLeft')
        const r = two ? k.down('KeyD') : k.down('KeyD') || k.down('ArrowRight')
        inp.dir = ((r || touch.right ? 1 : 0) - (l || touch.left ? 1 : 0)) as -1 | 0 | 1
        inp.jump = (two ? k.down('KeyW') : k.down('KeyW') || k.down('ArrowUp')) || touch.jump
        inp.block = (two ? k.down('KeyS') : k.down('KeyS') || k.down('ArrowDown')) || touch.block
        const pk = two ? ['KeyF'] : ['KeyJ', 'KeyZ', 'Space', 'KeyF']
        const kk = two ? ['KeyG'] : ['KeyK', 'KeyX', 'ShiftLeft', 'KeyG']
        const sk = two ? ['KeyH'] : ['KeyL', 'KeyC', 'KeyH']
        inp.punch = pk.some((c) => k.hit(c)) || (touch.punch && !prevT.punch)
        inp.kick = kk.some((c) => k.hit(c)) || (touch.kick && !prevT.kick)
        inp.special = sk.some((c) => k.hit(c)) || (touch.special && !prevT.special)
      } else if (two) {
        inp.dir = ((k.down('ArrowRight') ? 1 : 0) - (k.down('ArrowLeft') ? 1 : 0)) as -1 | 0 | 1
        inp.jump = k.down('ArrowUp')
        inp.block = k.down('ArrowDown')
        inp.punch = k.hit('Comma')
        inp.kick = k.hit('Period')
        inp.special = k.hit('Slash')
      }
      return inp
    }

    // ---------------------------------------------------------------- flow
    const resetRound = () => {
      const a = w.f[0]
      const b = w.f[1]
      for (const f of [a, b]) {
        f.hp = hp0
        f.act = 'idle'
        f.t = 0
        f.y = 0
        f.vx = f.vy = 0
        f.stun = 0
        f.chain = 0
        f.hitDone = false
        f.energy = kind === 'duel' ? 0 : f.energy * 0.3
      }
      a.x = kind === 'duel' ? LW * 0.2 : LW * 0.3
      b.x = kind === 'duel' ? LW * 0.8 : LW * 0.7
      a.face = 1
      b.face = -1
      w.proj.length = 0
      w.hitstop = 0
      roundClock = roundLen
      phaseName = 'intro'
      phaseT = 0
      slow = 1
      ai.plan = 'wait'
      ai.planT = 0.5
      if (kind === 'duel') startDuelRound()
      say(`ROUND ${round}`, 1.2)
      report()
    }
    const report = () => {
      env.score(Math.round(damageDealt * 2 + wins[0] * 300 + maxCombo * 50))
      env.status(`Round ${round} · ${wins[0]}-${wins[1]}${kind === 'duel' ? '' : ` · ${Math.ceil(roundClock)}s`}`)
    }
    const endRound = (winner: -1 | 0 | 1) => {
      if (phaseName !== 'fight' && kind !== 'duel') return
      phaseName = 'ko'
      phaseT = 0
      if (winner !== -1) wins[winner]++
      else {
        wins[0]++
        wins[1]++
      }
      slow = 0.4
      say(winner === -1 ? 'DRAW' : `${names[winner]} WINS THE ROUND`, 2)
      env.sfx(winner !== 1 ? 'win' : 'lose')
      report()
    }
    const finishMatch = () => {
      ended = true
      phaseName = 'over'
      const winner: -1 | 0 | 1 = wins[0] > wins[1] ? 0 : wins[1] > wins[0] ? 1 : -1
      const won = two ? winner !== -1 : winner === 0
      const score = Math.round(damageDealt * 2 + wins[0] * 300 + maxCombo * 50 + (won && !two ? 500 * (1 + env.difficulty) : 0))
      env.score(score)
      env.sfx(won ? 'win' : 'lose')
      env.end({ score, won, text: `${wins[0]}-${wins[1]} in rounds${winner < 0 ? ' (draw)' : ''}${two && winner !== -1 ? `, ${names[winner]} wins` : ''}` })
    }

    // ---------------------------------------------------------------- update
    const handleEvents = () => {
      for (const e of w.events) {
        const x = e.x
        const y = FLOOR - e.y
        if (e.k === 'hit') {
          fx.burst(x, y, '#fff', 10, 220, 3)
          fx.burst(x, y, t.accent2, 8, 160, 3)
          shake.kick(3 + Math.min(5, (e.dmg ?? 0) / 3))
          env.sfx('hit')
          if (kind !== 'sumo') {
            pop.push({ x, y: y - 30, s: String(e.dmg ?? ''), t: 0.7, c: e.who === 0 ? t.danger : '#ffe066' })
            const attacker = (e.who === 0 ? 1 : 0) as 0 | 1
            if (attacker === 0) damageDealt += e.dmg ?? 0
            if ((e.chain ?? 0) >= 2) {
              comboShow = { who: attacker, n: e.chain ?? 2, t: 1 }
              maxCombo = Math.max(maxCombo, e.chain ?? 0)
            }
          }
          report()
        } else if (e.k === 'block') {
          fx.burst(x, y, '#9be7ff', 8, 120, 3)
          env.sfx('click')
        } else if (e.k === 'special') {
          env.sfx('power')
        } else if (e.k === 'ko') {
          fx.burst(x, y, t.danger, 30, 300, 4)
          shake.kick(10)
          env.sfx('boom')
        } else if (e.k === 'ringout') {
          fx.burst(x, FLOOR, t.accent, 20, 260, 4)
          shake.kick(8)
          env.sfx('boom')
        }
      }
    }

    const duelUpdate = (dt: number) => {
      if (phaseName === 'intro') {
        phaseT += dt
        if (phaseT > 1.2) {
          phaseName = 'fight'
          phaseT = 0
          say('', 0)
        }
        return
      }
      if (phaseName !== 'fight' || duel.resolved) return
      duel.t += dt
      const press = inputFor(0)
      const pressed = press.punch || press.kick || press.special || ptr.down
      const p2press = two ? inputFor(1) : NO_INPUT
      const pressed2 = p2press.punch || p2press.kick || p2press.special
      if (!duel.signal) {
        duel.wait -= dt
        if (pressed || pressed2) {
          duel.resolved = true
          duel.fault = pressed ? 0 : 1
          duel.winner = pressed ? 1 : 0
          say('TOO EARLY!', 1.4)
          env.sfx('lose')
          duelFinish()
          return
        }
        if (duel.wait <= 0) {
          duel.signal = true
          duel.t = 0
          env.sfx('power')
          shake.kick(4)
        }
      } else {
        const aiFire = !two && duel.t >= duel.aiReact
        if ((pressed || pressed2 || aiFire) && !duel.resolved) {
          duel.resolved = true
          let who: 0 | 1
          if (pressed && (aiFire ? duel.t < duel.aiReact : true)) who = 0
          else if (pressed2) who = 1
          else who = 1
          if (!two && who === 1 && pressed) who = 0
          duel.winner = who
          duel.humanReact = duel.t
          say(who === 0 ? `${Math.round(duel.t * 1000)} ms` : two ? `${names[1]} FIRST` : 'TOO SLOW', 1.4)
          duelFinish()
        }
      }
    }
    const duelFinish = () => {
      const win = duel.winner as 0 | 1
      const lose = (win === 0 ? 1 : 0) as 0 | 1
      const a = w.f[win]
      const b = w.f[lose]
      duel.slash = 0.001
      a.act = 'punch'
      a.t = 0.02
      b.act = 'ko'
      b.t = 0
      b.vx = (win === 0 ? 1 : -1) * 120
      b.vy = 260
      b.y = 0.01
      b.hp = 0
      fx.burst(b.x, FLOOR - 60, '#fff', 24, 300, 3)
      shake.kick(9)
      env.sfx('boom')
      if (win === 0) damageDealt += 40
      endRound(win)
    }

    const update = (dt: number) => {
      time += dt
      const sdt = dt * slow
      fx.update(dt, 400)
      shake.update(dt)
      bannerT = Math.max(0, bannerT - dt)
      for (const p of pop) {
        p.t -= dt
        p.y -= 40 * dt
      }
      pop = pop.filter((p) => p.t > 0)
      if (comboShow) {
        comboShow.t -= dt
        if (comboShow.t <= 0) comboShow = null
      }
      if (ended) return
      if (kind === 'duel') {
        duelUpdate(dt)
        if (phaseName === 'ko') {
          phaseT += dt
          const a = w.f[0]
          const b = w.f[1]
          for (const f of [a, b]) {
            f.t += sdt
            f.vy -= 1700 * sdt
            f.y = Math.max(0, f.y + f.vy * sdt)
            if (f.y === 0) f.vy = 0
            f.x += f.vx * sdt
            f.vx *= 0.96
          }
          if (phaseT > 2.1) afterRound()
        }
        touchEdges()
        return
      }
      if (phaseName === 'intro') {
        phaseT += dt
        if (phaseT > 1.3) {
          phaseName = 'fight'
          phaseT = 0
          say('FIGHT!', 0.8)
          env.sfx('shoot')
        }
        for (const f of w.f) f.face = f === w.f[0] ? 1 : -1
        touchEdges()
        return
      }
      if (phaseName === 'fight') {
        roundClock -= sdt
        const i0 = inputFor(0)
        const i1 = two ? inputFor(1) : aiInput(w, 1, ai, sdt, env.difficulty, rng)
        step(w, [i0, i1], sdt)
        handleEvents()
        if (Math.ceil(roundClock) !== Math.ceil(roundClock + sdt)) report()
        const [a, b] = w.f
        if (a.act === 'ko' || b.act === 'ko') {
          endRound(a.act === 'ko' && b.act === 'ko' ? -1 : a.act === 'ko' ? 1 : 0)
        } else if (roundClock <= 0) {
          roundClock = 0
          const wi = kind === 'sumo' ? -1 : a.hp > b.hp ? 0 : b.hp > a.hp ? 1 : -1
          say('TIME!', 1)
          endRound(wi)
        }
      } else if (phaseName === 'ko') {
        phaseT += dt
        step(w, [NO_INPUT, NO_INPUT], sdt)
        handleEvents()
        slow = Math.min(1, slow + dt * 0.4)
        if (phaseT > 2.3) afterRound()
      }
      touchEdges()
    }
    const touchEdges = () => {
      prevT.punch = touch.punch
      prevT.kick = touch.kick
      prevT.special = touch.special
      prevT.jump = touch.jump
    }
    const afterRound = () => {
      if (wins[0] >= 2 || wins[1] >= 2 || round >= 3) {
        finishMatch()
        return
      }
      round++
      resetRound()
    }

    // ---------------------------------------------------------------- drawing
    const bodyCol = (i: number) => (i === 0 ? t.accent : t.accent2)
    const limb = (x1: number, y1: number, x2: number, y2: number, wd: number, col: string) => {
      ctx.strokeStyle = col
      ctx.lineWidth = wd
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
    const drawFighter = (f: Fighter, i: 0 | 1) => {
      const s = f.scale
      const col = f.flash > 0 ? '#ffffff' : bodyCol(i)
      const dark2 = f.flash > 0 ? '#ffffff' : 'rgba(0,0,0,0.35)'
      ctx.save()
      ctx.translate(f.x, FLOOR - f.y)
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.beginPath()
      ctx.ellipse(0, f.y + 3, 26 * s * (1 - Math.min(0.5, f.y / 300)), 6 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.scale(f.face * s, s)
      const ko = f.act === 'ko'
      if (ko) {
        ctx.translate(0, -8)
        ctx.rotate(Math.min(1, f.t * 4) * -1.45 + (f.vy > 0 ? 0 : 0))
      }
      const walk = f.act === 'idle' && Math.abs(f.vx) > 20 && f.y <= 0 ? Math.sin(f.walk) * 12 : 0
      const bob = f.act === 'idle' && Math.abs(f.vx) < 20 ? Math.sin(time * 5 + i) * 1.5 : 0
      const hitLean = f.act === 'hit' ? -8 : 0
      const air = f.y > 0
      // legs
      let kickExt = 0
      if (f.act === 'kick') {
        const ph = phase('kick', f.t)
        kickExt = ph === 'startup' ? f.t / MOVES.kick.startup : ph === 'active' ? 1 : Math.max(0, 1 - (f.t - MOVES.kick.startup - MOVES.kick.active) / MOVES.kick.recovery)
      }
      const backLegX = air ? -8 : -10 - walk * 0.6
      limb(-2, -40 + bob, backLegX, -2, 9, dark2)
      limb(-2, -40 + bob, 4, -2, 9, f.flash > 0 ? '#fff' : 'rgba(0,0,0,0.5)')
      if (kickExt > 0) limb(2, -40, 2 + kickExt * 52, -44 + kickExt * 12 - 4, 10, col)
      else limb(4, -40 + bob, 10 + walk * 0.6 + (air ? 12 : 0), air ? -22 : -2, 9, col)
      // torso
      ctx.fillStyle = col
      ctx.beginPath()
      ctx.roundRect(-14 + hitLean * 0.3, -82 + bob, 28, 44, 10)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.22)'
      ctx.fillRect(-9 + hitLean * 0.3, -78 + bob, 6, 34)
      // belt
      ctx.fillStyle = dark2
      ctx.fillRect(-14, -46 + bob, 28, 5)
      // arms
      let punchExt = 0
      if (f.act === 'punch') {
        const ph = phase('punch', f.t)
        punchExt = ph === 'startup' ? f.t / MOVES.punch.startup : ph === 'active' ? 1 : Math.max(0, 1 - (f.t - MOVES.punch.startup - MOVES.punch.active) / MOVES.punch.recovery)
      }
      const fist = kind === 'boxing' ? t.danger : col
      if (f.act === 'special') {
        const ch = Math.min(1, f.t / MOVES.special.startup)
        limb(0, -70, 20 - ch * 6, -62, 8, col)
        ctx.fillStyle = t.items[0] ? 'rgba(255,255,255,0.5)' : '#fff'
        ctx.beginPath()
        ctx.arc(30 + ch * 8, -62, 6 + ch * 8, 0, Math.PI * 2)
        ctx.fill()
      } else if (f.act === 'block') {
        limb(0, -70, 22, -86, 9, col)
        limb(0, -64, 24, -74, 9, col)
        ctx.strokeStyle = 'rgba(155,231,255,0.8)'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(8, -66, 36, -Math.PI / 2.2, Math.PI / 2.2)
        ctx.stroke()
      } else if (punchExt > 0) {
        const alt = f.alt ? -6 : 0
        limb(0, -72, 8 + punchExt * 44, -72 + alt, 9, col)
        ctx.fillStyle = fist
        ctx.beginPath()
        ctx.arc(8 + punchExt * 44 + 4, -72 + alt, kind === 'boxing' ? 10 : 7, 0, Math.PI * 2)
        ctx.fill()
        limb(0, -66, -10, -52, 9, dark2)
      } else {
        limb(0, -72 + bob, 14 + walk * 0.4, -54 + bob, 9, col)
        limb(0, -68 + bob, -12 - walk * 0.4, -52 + bob, 9, dark2)
        if (kind === 'boxing') {
          ctx.fillStyle = t.danger
          ctx.beginPath()
          ctx.arc(16 + walk * 0.4, -52 + bob, 7, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.restore()
      // head (emoji, not mirrored so it stays readable)
      ctx.save()
      ctx.translate(f.x, FLOOR - f.y)
      let hx = 0
      let hy = -102 * s
      if (ko) {
        hx = -f.face * Math.min(1, f.t * 4) * 70 * s
        hy = -22 * s
      }
      if (f.act === 'hit') hx -= f.face * 6
      const head = mods.has('big') || /head/i.test(env.name) ? 74 : 46
      emoji(ctx, i === 0 ? heroE : foeE, hx, hy + (f.act === 'idle' ? Math.sin(time * 5 + i) * 1.5 : 0), head * s)
      ctx.restore()
    }

    const bar = (x: number, y: number, wd: number, h: number, frac: number, col: string, flip: boolean) => {
      roundRect(ctx, x, y, wd, h, 4, 'rgba(0,0,0,0.55)')
      const fw = Math.max(0, wd * clamp(frac, 0, 1))
      if (fw > 0) roundRect(ctx, flip ? x + wd - fw : x, y, fw, h, 4, col)
      roundRect(ctx, x, y, wd, h, 4, undefined, 'rgba(255,255,255,0.7)', 1.5)
    }

    const drawHud = () => {
      const barW = portrait ? 150 : 232
      const top = 12
      for (const i of [0, 1] as const) {
        const f = w.f[i]
        const x = i === 0 ? 46 : LW - 46 - barW
        const frac = kind === 'sumo' ? 1 - Math.min(1, Math.abs(f.x - LW / 2) / (cfg.ring + 20)) : f.hp / f.maxHp
        bar(x, top, barW, 16, frac, frac < 0.3 ? t.danger : t.good, i === 1)
        if (kind !== 'duel' && kind !== 'sumo') bar(x, top + 20, barW * 0.6, 6, f.energy / 100, f.energy >= SPECIAL_COST ? '#ffe066' : '#6aa7ff', i === 1)
        text(ctx, names[i], i === 0 ? x : x + barW, top + (portrait ? 38 : 38), { size: 8, color: '#fff', align: i === 0 ? 'left' : 'right' })
        emoji(ctx, i === 0 ? heroE : foeE, i === 0 ? 24 : LW - 24, top + 14, 26)
        for (let r = 0; r < 2; r++) {
          const cx = i === 0 ? x + 6 + r * 16 : x + barW - 6 - r * 16
          ctx.fillStyle = r < wins[i] ? '#ffe066' : 'rgba(255,255,255,0.25)'
          ctx.beginPath()
          ctx.arc(cx, top + 52, 5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      roundRect(ctx, LW / 2 - 28, 8, 56, 30, 8, 'rgba(0,0,0,0.6)')
      text(ctx, kind === 'duel' ? `R${round}` : String(Math.ceil(roundClock)), LW / 2, 24, { size: 14, color: roundClock < 10 && kind !== 'duel' ? t.danger : '#fff' })
    }

    const draw = () => {
      background(ctx, LW, LH, t, 30, env.seed)
      ctx.save()
      shake.apply(ctx)
      // backdrop silhouettes
      ctx.globalAlpha = 0.25
      for (let i = 0; i < 6; i++) emoji(ctx, t.items[i % t.items.length], 50 + i * (LW / 6), FLOOR - 90 - ((i * 37) % 40), 36)
      ctx.globalAlpha = 1
      const g = ctx.createLinearGradient(0, FLOOR, 0, LH)
      g.addColorStop(0, 'rgba(0,0,0,0.15)')
      g.addColorStop(1, 'rgba(0,0,0,0.55)')
      ctx.fillStyle = g
      ctx.fillRect(0, FLOOR, LW, LH - FLOOR)
      ctx.fillStyle = t.accent
      ctx.globalAlpha = 0.5
      ctx.fillRect(0, FLOOR, LW, 3)
      ctx.globalAlpha = 1
      if (kind === 'sumo') {
        ctx.fillStyle = 'rgba(255,255,255,0.12)'
        ctx.fillRect(LW / 2 - cfg.ring, FLOOR - 2, cfg.ring * 2, 10)
        ctx.strokeStyle = t.danger
        ctx.lineWidth = 4
        for (const sx of [LW / 2 - cfg.ring, LW / 2 + cfg.ring]) {
          ctx.beginPath()
          ctx.moveTo(sx, FLOOR - 8)
          ctx.lineTo(sx, FLOOR + 12)
          ctx.stroke()
        }
      }
      if (dim) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)'
        ctx.fillRect(0, 0, LW, LH)
      }
      // order: the one attacking draws on top
      const order: (0 | 1)[] = isAttack(w.f[0].act) ? [1, 0] : [0, 1]
      for (const i of order) drawFighter(w.f[i], i)
      for (const p of w.proj) {
        ctx.shadowColor = t.accent
        ctx.shadowBlur = 18
        emoji(ctx, t.items[0] ?? '✨', p.x, FLOOR - p.y, 32, time * 8)
        ctx.shadowBlur = 0
        ctx.globalAlpha = 0.3
        emoji(ctx, t.items[0] ?? '✨', p.x - Math.sign(p.vx) * 22, FLOOR - p.y, 24)
        ctx.globalAlpha = 1
      }
      fx.draw(ctx)
      for (const p of pop) text(ctx, p.s, p.x, p.y, { size: 12, color: p.c, shadow: '#000' })
      ctx.restore()
      drawHud()
      if (kind === 'duel' && phaseName === 'fight' && !duel.resolved) {
        if (duel.signal) {
          const pulse = 1 + Math.sin(time * 30) * 0.1
          emoji(ctx, '❗', LW / 2, LH * 0.35, 80 * pulse)
          text(ctx, 'DRAW!', LW / 2, LH * 0.52, { size: 22, color: '#ffe066', shadow: t.danger })
        } else text(ctx, 'WAIT FOR IT...', LW / 2, LH * 0.38, { size: 12, color: 'rgba(255,255,255,0.8)' })
      }
      if (comboShow) text(ctx, `${comboShow.n} HITS!`, comboShow.who === 0 ? 90 : LW - 90, 120, { size: 14, color: '#ffe066', shadow: '#000' })
      if (bannerT > 0 && banner) text(ctx, banner, LW / 2, LH * 0.28, { size: portrait ? 14 : 20, color: '#fff', shadow: t.accent })
      if (time < 3 && phaseName !== 'over') {
        const help = kind === 'duel' ? 'TAP / ANY ATTACK KEY AFTER THE SIGNAL' : isTouch() ? '' : two ? 'P1: WASD + F G H   P2: ARROWS + , . /' : 'ARROWS/WASD  J PUNCH  K KICK  L SPECIAL  DOWN BLOCK'
        if (help) text(ctx, help, LW / 2, LH - 14, { size: portrait ? 7 : 8, color: 'rgba(255,255,255,0.75)' })
      }
    }

    resetRound()
    const lp = loop(update, draw)
    return {
      pause: (p) => lp.pause(p),
      destroy() {
        lp.stop()
        k.dispose()
        ptr.dispose()
        bag.dispose()
        padEl?.remove()
        st.dispose()
      },
    }
  },
}
export default engine
