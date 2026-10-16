// Raycast: Wolfenstein-style first-person raycaster on Canvas 2D with generated mazes / dungeons.
// Find the exit, collect keys and loot, shoot or avoid billboard foes. Mods: dark (flashlight cone, fog, sanity + heartbeat),
// key (exit needs keys), stealth (no gun, sneak with Shift). M toggles the minimap. Touch: dpad + fire button, drag to look.
import { Bag, byDiff, clamp, createStage, isTouch, keys, loop, makeRng, Particles, pointer, Shake, text, vpad, type Engine } from '../kit'
import { bfs, EXIT, genRayLevel, type RayLevel } from '../logic/raycast'

const hex = (c: string): [number, number, number] => {
  const h = c.replace('#', '')
  const f = h.length === 3 ? h.split('').map((x) => x + x).join('') : h
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)]
}
const mix = (a: string, b: string, p: number) => {
  const x = hex(a)
  const y = hex(b)
  return `rgb(${Math.round(x[0] + (y[0] - x[0]) * p)},${Math.round(x[1] + (y[1] - x[1]) * p)},${Math.round(x[2] + (y[2] - x[2]) * p)})`
}

interface Foe { x: number; y: number; hp: number; e: string; tx: number; ty: number; dx: number; dy: number; state: 0 | 1; lost: number; hurt: number; speed: number; seen: number; alive: boolean; atk: number }
interface Item { x: number; y: number; kind: 'key' | 'loot' | 'health' | 'ammo'; e: string; got: boolean }
interface SpriteDraw { x: number; y: number; img: HTMLCanvasElement; scale: number; lift: number; alpha: number; flash: number; d: number }

const engine: Engine = {
  start(env) {
    const { theme: t, rng, mods } = env
    const r0 = env.host.getBoundingClientRect()
    const asp = r0.width / Math.max(1, r0.height)
    const H = 450
    const W = asp > 0 && r0.height > 50 ? clamp(Math.round(H * asp), 320, 800) : 800
    const narrow = W < 600
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const k = keys()
    const bag = new Bag()
    const fx = new Particles()
    const shake = new Shake()
    const ptr = pointer(st)
    const touch = isTouch()
    const blurb = `${env.name} ${env.desc}`.toLowerCase()
    const dark = mods.has('dark') || t.id === 'horror' || /horror|dark|flashlight|haunt|asylum|crypt|dread|night|shadow/.test(blurb)
    const stealth = mods.has('stealth') || /sneak|silent|stealth|heist|infiltrat|assassin|quiet|creak/.test(blurb)
    const needKeys = mods.has('key') || /asylum|locked|heist|escape/.test(blurb)
    const style: 'maze' | 'dungeon' = /maze|labyrinth|bamboo|netrunner|hedge|spin/.test(blurb) ? 'maze' : /dungeon|crypt|asylum|castle|house|fps|keep|museum|carnival/.test(blurb) ? 'dungeon' : rng.chance(0.5) ? 'maze' : 'dungeon'
    const totalLevels = byDiff(env, 3, 4, 5)
    const dispVpad = vpad(env.host, k, 'dpad', stealth ? [{ action: 'b', label: '🤫' }] : [{ action: 'a', label: '💥' }])
    const COLW = 2
    const COLS = Math.floor(W / COLW)
    const planeLen = (W / H) * 0.37
    const zbuf = new Float32Array(COLS)
    ctx.imageSmoothingEnabled = false

    // ---------- textures & sprites ----------
    const trng = makeRng(env.seed ^ 0x9e3779b9)
    const makeTex = (type: number) => {
      const c = document.createElement('canvas')
      c.width = c.height = 64
      const g = c.getContext('2d')!
      const base = t.blocks[(type - 1) % t.blocks.length]
      const dark1 = mix(base, '#000000', 0.45)
      g.fillStyle = dark1
      g.fillRect(0, 0, 64, 64)
      if (type === 1) {
        for (let row = 0; row < 4; row++) {
          const off = row % 2 ? 16 : 0
          for (let bx = -1; bx < 3; bx++) {
            g.fillStyle = mix(base, '#000000', 0.25 + trng() * 0.3)
            g.fillRect(bx * 32 + off + 1, row * 16 + 1, 30, 14)
            g.fillStyle = 'rgba(255,255,255,.08)'
            g.fillRect(bx * 32 + off + 1, row * 16 + 1, 30, 2)
          }
        }
      } else if (type === 2) {
        for (let r = 0; r < 2; r++)
          for (let q = 0; q < 2; q++) {
            g.fillStyle = mix(base, '#000000', 0.2 + trng() * 0.25)
            g.fillRect(q * 32 + 1, r * 32 + 1, 30, 30)
            g.fillStyle = 'rgba(255,255,255,.12)'
            g.fillRect(q * 32 + 1, r * 32 + 1, 30, 2)
            g.fillRect(q * 32 + 1, r * 32 + 1, 2, 30)
            g.fillStyle = 'rgba(0,0,0,.3)'
            g.fillRect(q * 32 + 29, r * 32 + 1, 2, 30)
          }
      } else if (type === 3) {
        g.fillStyle = mix(base, '#000000', 0.3)
        g.fillRect(2, 2, 60, 60)
        g.strokeStyle = t.accent
        g.lineWidth = 2
        g.globalAlpha = 0.8
        g.strokeRect(6, 6, 52, 52)
        g.beginPath()
        g.moveTo(6, 32)
        g.lineTo(58, 32)
        g.stroke()
        g.globalAlpha = 1
        g.fillStyle = t.accent2
        for (const [x, y] of [[10, 10], [54, 10], [10, 54], [54, 54]]) g.fillRect(x - 1, y - 1, 3, 3)
      } else {
        for (let b = 0; b < 8; b++) {
          g.fillStyle = mix(base, '#000000', 0.2 + trng() * 0.3)
          g.fillRect(b * 8 + 1, 0, 6, 64)
          g.fillStyle = 'rgba(0,0,0,.25)'
          g.fillRect(b * 8 + 3, trng() * 50, 1, 10 + trng() * 12)
        }
      }
      return c
    }
    const wallTex: HTMLCanvasElement[] = [document.createElement('canvas'), makeTex(1), makeTex(2), makeTex(3), makeTex(4)]
    const exitTex = (() => {
      const c = document.createElement('canvas')
      c.width = c.height = 64
      const g = c.getContext('2d')!
      g.fillStyle = '#05050a'
      g.fillRect(0, 0, 64, 64)
      const gr = g.createRadialGradient(32, 36, 4, 32, 36, 34)
      gr.addColorStop(0, '#ffffff')
      gr.addColorStop(0.35, t.accent2)
      gr.addColorStop(1, t.accent)
      g.fillStyle = gr
      g.beginPath()
      g.roundRect(8, 6, 48, 58, [24, 24, 0, 0])
      g.fill()
      g.strokeStyle = t.fg
      g.lineWidth = 3
      g.stroke()
      return c
    })()
    const sprCache = new Map<string, HTMLCanvasElement>()
    const spr = (e: string) => {
      let c = sprCache.get(e)
      if (!c) {
        c = document.createElement('canvas')
        c.width = c.height = 96
        const g = c.getContext('2d')!
        g.font = '72px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
        g.textAlign = 'center'
        g.textBaseline = 'middle'
        g.fillText(e, 48, 52)
        sprCache.set(e, c)
      }
      return c
    }

    // ---------- state ----------
    let level = 1
    let lv: RayLevel
    let tiles: Uint8Array
    let visited: Uint8Array
    let field: Int32Array
    let fieldT = 0
    let foes: Foe[] = []
    let items: Item[] = []
    let keysHave = 0
    let keysNeed = 0
    let score = 0
    let time = 0
    let levelT = 0
    let over = false
    let phase: 'play' | 'clear' = 'play'
    let phaseT = 0
    let msg = ''
    let msgT = 0
    let flash = 0
    let flashCol = '#f00'
    let showMap = !touch
    let locked = false
    let sanity = 100
    let beat = 0
    let walkT = 0
    let gunKick = 0
    let cool = 0
    let hint = 6
    let kills = 0
    let faceHurt = 0
    const P = { x: 1.5, y: 1.5, a: 0, hp: 100, ammo: byDiff(env, 24, 16, 12) }
    const say = (s: string, secs = 1.5) => {
      msg = s
      msgT = secs
    }

    const startLevel = () => {
      const size = style === 'maze' ? Math.min(7 + level * 2, 15) : Math.min(22 + level * 4, 40)
      keysNeed = needKeys ? Math.min(1 + level, 3) : 0
      lv = genRayLevel(rng, { style, size, keys: keysNeed, foes: byDiff(env, 3, 4, 6) + level * 2 + (dark ? 2 : 0), loot: 5 + level * 2 })
      tiles = Uint8Array.from(lv.tiles)
      visited = new Uint8Array(lv.w * lv.h)
      keysHave = 0
      P.x = lv.start.x + 0.5
      P.y = lv.start.y + 0.5
      // face an open direction
      P.a = 0
      for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
        if (tiles[lv.start.y * lv.w + lv.start.x + Math.round(Math.cos(a))] === 0 && Math.round(Math.cos(a)) !== 0) { P.a = a; break }
        if (tiles[(lv.start.y + Math.round(Math.sin(a))) * lv.w + lv.start.x] === 0 && Math.round(Math.sin(a)) !== 0) { P.a = a; break }
      }
      P.hp = Math.min(100, P.hp + 25)
      P.ammo += 6
      sanity = Math.min(100, sanity + 30)
      const fs = byDiff(env, 0.9, 1.15, 1.4) + level * 0.07
      foes = lv.foes.map((c) => ({ x: c.x + 0.5, y: c.y + 0.5, hp: byDiff(env, 2, 2, 3), e: rng.pick(t.foes), tx: c.x + 0.5, ty: c.y + 0.5, dx: 0, dy: 0, state: 0, lost: 0, hurt: 0, speed: fs * rng.range(0.85, 1.15), seen: 0, alive: true, atk: 0 }))
      items = [
        ...lv.keys.map((c): Item => ({ x: c.x + 0.5, y: c.y + 0.5, kind: 'key', e: '🔑', got: false })),
        ...lv.treasures.map((c): Item => ({ x: c.x + 0.5, y: c.y + 0.5, kind: 'loot', e: rng.pick(t.items), got: false })),
        ...lv.health.map((c): Item => ({ x: c.x + 0.5, y: c.y + 0.5, kind: 'health', e: dark ? '🕯️' : '❤️', got: false })),
        ...lv.ammo.map((c): Item => ({ x: c.x + 0.5, y: c.y + 0.5, kind: 'ammo', e: '🔋', got: false })),
      ]
      field = bfs(tiles, lv.w, lv.h, { x: lv.start.x, y: lv.start.y })
      levelT = 0
      phase = 'play'
      say(`LEVEL ${level}: FIND THE EXIT${keysNeed ? ` (${keysNeed} 🔑)` : ''}`, 3)
    }

    const finish = (won: boolean) => {
      if (over) return
      over = true
      env.sfx(won ? 'win' : 'lose')
      env.end({ score: Math.round(score), won, text: won ? `Escaped all ${totalLevels} levels!` : `Fell on level ${level} with ${kills} kills` })
    }
    const hud = () => {
      env.score(Math.round(score))
      env.status(`Level ${level}/${totalLevels} · HP ${Math.ceil(P.hp)}${keysNeed ? ` · 🔑 ${keysHave}/${keysNeed}` : ''}${stealth ? '' : ` · 🎯 ${P.ammo}`}`)
    }

    // ---------- geometry helpers ----------
    const free = (x: number, y: number) => {
      const tx = Math.floor(x)
      const ty = Math.floor(y)
      return tx >= 0 && ty >= 0 && tx < lv.w && ty < lv.h && tiles[ty * lv.w + tx] === 0
    }
    const hit = { d: 0, side: 0, tile: 0, wx: 0 }
    const cast = (px: number, py: number, rx: number, ry: number) => {
      let mx = Math.floor(px)
      let my = Math.floor(py)
      const ddx = Math.abs(1 / (rx || 1e-9))
      const ddy = Math.abs(1 / (ry || 1e-9))
      const sx = rx < 0 ? -1 : 1
      const sy = ry < 0 ? -1 : 1
      let sdx = rx < 0 ? (px - mx) * ddx : (mx + 1 - px) * ddx
      let sdy = ry < 0 ? (py - my) * ddy : (my + 1 - py) * ddy
      let side = 0
      for (let i = 0; i < 80; i++) {
        if (sdx < sdy) {
          sdx += ddx
          mx += sx
          side = 0
        } else {
          sdy += ddy
          my += sy
          side = 1
        }
        if (mx < 0 || my < 0 || mx >= lv.w || my >= lv.h) break
        const tl = tiles[my * lv.w + mx]
        if (tl) {
          hit.tile = tl
          hit.side = side
          hit.d = side === 0 ? sdx - ddx : sdy - ddy
          const wx = side === 0 ? py + hit.d * ry : px + hit.d * rx
          hit.wx = wx - Math.floor(wx)
          if ((side === 0 && rx > 0) || (side === 1 && ry < 0)) hit.wx = 1 - hit.wx
          return hit
        }
      }
      hit.d = 40
      hit.tile = 0
      hit.side = 0
      hit.wx = 0
      return hit
    }
    const los = (ax: number, ay: number, bx: number, by: number) => {
      const d = Math.hypot(bx - ax, by - ay)
      const n = Math.ceil(d / 0.25)
      for (let i = 1; i < n; i++) {
        const f = i / n
        if (!free(ax + (bx - ax) * f, ay + (by - ay) * f)) return false
      }
      return true
    }
    const tryMove = (nx: number, ny: number) => {
      const r = 0.22
      if (free(nx - r, P.y - r) && free(nx + r, P.y - r) && free(nx - r, P.y + r) && free(nx + r, P.y + r)) P.x = nx
      if (free(P.x - r, ny - r) && free(P.x + r, ny - r) && free(P.x - r, ny + r) && free(P.x + r, ny + r)) P.y = ny
    }

    // ---------- input ----------
    const lockEl = st.canvas
    const onLock = () => {
      locked = document.pointerLockElement === lockEl
    }
    document.addEventListener('pointerlockchange', onLock)
    bag.add(() => document.removeEventListener('pointerlockchange', onLock))
    bag.on(window, 'mousemove', (e) => {
      if (locked) P.a += e.movementX * 0.0026
    })
    let dragX = 0
    let dragging = false
    let moved = 0
    ptr.onDown((p) => {
      if (over) return
      if (touch && showMap && p.x > W - 110 && p.y < 110) {
        showMap = false
        return
      }
      if (touch && !showMap && p.x > W - 60 && p.y < 60) {
        showMap = true
        return
      }
      dragging = true
      dragX = p.x
      moved = 0
    })
    ptr.onMove((p) => {
      if (!dragging || locked) return
      const dx = p.x - dragX
      dragX = p.x
      moved += Math.abs(dx)
      P.a += dx * (touch ? 0.006 : 0.004)
    })
    ptr.onUp((p) => {
      if (!dragging) return
      dragging = false
      if (p.button === 0 && !touch) {
        if (!locked && moved < 6) {
          try {
            try { Promise.resolve(lockEl.requestPointerLock?.()).catch(() => {}) } catch { /* pointer lock unavailable (iframe, headless) */ }
          } catch { /* ignore */ }
        }
      }
    })
    bag.on(st.canvas, 'pointerdown', (e) => {
      if (locked && e.button === 0 && !touch) fire()
    })
    k.onKey((e) => {
      if (e.code === 'KeyM') showMap = !showMap
    })

    // ---------- combat ----------
    const fire = () => {
      if (over || phase !== 'play' || stealth || cool > 0) return
      if (P.ammo <= 0) {
        say('NO AMMO!', 1)
        env.sfx('click')
        cool = 0.3
        return
      }
      P.ammo--
      cool = 0.32
      gunKick = 1
      env.sfx('shoot')
      shake.kick(2)
      const wall = cast(P.x, P.y, Math.cos(P.a), Math.sin(P.a)).d
      let best: Foe | null = null
      let bd = 1e9
      for (const f of foes) {
        if (!f.alive) continue
        const dx = f.x - P.x
        const dy = f.y - P.y
        const d = Math.hypot(dx, dy)
        let da = Math.atan2(dy, dx) - P.a
        while (da > Math.PI) da -= Math.PI * 2
        while (da < -Math.PI) da += Math.PI * 2
        if (d < wall && d < bd && Math.abs(Math.sin(da)) * d < 0.42 && Math.abs(da) < 1.2) {
          best = f
          bd = d
        }
      }
      if (best) {
        best.hp--
        best.hurt = 0.2
        best.state = 1
        best.lost = 4
        fx.burst(W / 2, H / 2, t.danger, 12, 200, 3)
        if (best.hp <= 0) {
          best.alive = false
          kills++
          score += 150
          env.sfx('boom')
          if (rng.chance(0.35)) items.push({ x: best.x, y: best.y, kind: rng.chance(0.5) ? 'ammo' : 'health', e: rng.chance(0.5) ? '🔋' : dark ? '🕯️' : '❤️', got: false })
          hud()
        } else env.sfx('hit')
      }
    }

    const updateFoes = (dt: number) => {
      fieldT -= dt
      if (fieldT <= 0) {
        fieldT = 0.3
        field = bfs(tiles, lv.w, lv.h, { x: Math.floor(P.x), y: Math.floor(P.y) })
      }
      const sneaking = stealth && k.down('b')
      const sight = (stealth ? (sneaking ? 2.6 : 5) : dark ? 6 : 8) * (dark ? 1 : 1)
      let nearest = 99
      for (const f of foes) {
        if (!f.alive) continue
        f.hurt = Math.max(0, f.hurt - dt)
        f.atk = Math.max(0, f.atk - dt)
        const d = Math.hypot(P.x - f.x, P.y - f.y)
        nearest = Math.min(nearest, los(f.x, f.y, P.x, P.y) ? d : 99)
        f.seen -= dt
        if (f.seen <= 0) {
          f.seen = 0.2
          if (d < sight && los(f.x, f.y, P.x, P.y)) {
            if (f.state === 0) env.sfx('move')
            f.state = 1
            f.lost = 4
          } else if (f.state === 1) {
            f.lost -= 0.2
            if (f.lost <= 0) f.state = 0
          }
        }
        // movement between tile centres
        const atTarget = Math.hypot(f.tx - f.x, f.ty - f.y) < 0.06
        if (atTarget) {
          f.x = f.tx
          f.y = f.ty
          const cx = Math.floor(f.x)
          const cy = Math.floor(f.y)
          const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
          if (f.state === 1 && field[cy * lv.w + cx] >= 0) {
            let bestD = field[cy * lv.w + cx]
            let bx = 0
            let by = 0
            for (const [dx, dy] of dirs) {
              const v = field[(cy + dy) * lv.w + cx + dx]
              if (v >= 0 && v < bestD && tiles[(cy + dy) * lv.w + cx + dx] === 0) {
                bestD = v
                bx = dx
                by = dy
              }
            }
            if (bx || by) {
              f.dx = bx
              f.dy = by
            }
          } else {
            const opts = dirs.filter(([dx, dy]) => tiles[(cy + dy) * lv.w + cx + dx] === 0 && !(dx === -f.dx && dy === -f.dy))
            const pickd = opts.length ? opts[Math.floor(Math.random() * opts.length)] : [-f.dx, -f.dy]
            f.dx = pickd[0]
            f.dy = pickd[1]
          }
          f.tx = cx + 0.5 + f.dx
          f.ty = cy + 0.5 + f.dy
          if (tiles[Math.floor(f.ty) * lv.w + Math.floor(f.tx)] !== 0) {
            f.tx = f.x
            f.ty = f.y
          }
        }
        const sp = f.speed * (f.state === 1 ? 1.25 : 0.6) * dt
        const mdx = f.tx - f.x
        const mdy = f.ty - f.y
        const md = Math.hypot(mdx, mdy)
        if (md > 0.0001) {
          const s2 = Math.min(sp, md)
          f.x += (mdx / md) * s2
          f.y += (mdy / md) * s2
        }
        // attack
        if (d < 0.62 && phase === 'play') {
          if (f.atk <= 0) {
            f.atk = 0.55
            P.hp -= 7 + env.difficulty * 3
            faceHurt = 0.4
            flash = 0.3
            flashCol = '#b91c1c'
            shake.kick(6)
            env.sfx('hit')
            hud()
            if (P.hp <= 0) finish(false)
          }
        }
      }
      // sanity and heartbeat
      if (dark) {
        sanity = clamp(sanity - dt * (0.7 + (nearest < 8 ? (8 - nearest) * 0.9 : 0)), 0, 100)
        if (sanity <= 0 && phase === 'play') {
          P.hp -= 3 * dt
          if (P.hp <= 0) finish(false)
        }
        beat -= dt
        const rate = 1.2 - (1 - sanity / 100) * 0.7 - (nearest < 6 ? (6 - nearest) * 0.06 : 0)
        if (beat <= 0) {
          beat = Math.max(0.35, rate)
          env.sfx('click')
          flash = Math.max(flash, 0.08 + (1 - sanity / 100) * 0.12)
          flashCol = '#7f1d1d'
        }
      }
    }

    // ---------- update ----------
    const update = (dt: number) => {
      time += dt
      hint = Math.max(0, hint - dt)
      msgT = Math.max(0, msgT - dt)
      flash = Math.max(0, flash - dt)
      faceHurt = Math.max(0, faceHurt - dt)
      gunKick = Math.max(0, gunKick - dt * 5)
      cool = Math.max(0, cool - dt)
      fx.update(dt, 300)
      shake.update(dt)
      if (over) return
      if (phase === 'clear') {
        phaseT += dt
        if (phaseT > 2.2 || (phaseT > 0.8 && k.hit('a'))) {
          if (level >= totalLevels) finish(true)
          else {
            level++
            startLevel()
            hud()
          }
        }
        return
      }
      levelT += dt
      // movement
      const sneak = stealth && k.down('b')
      const sprint = !stealth && (k.down('ShiftLeft') || k.down('ShiftRight'))
      const strafeKeys = locked
      const turnL = k.down('ArrowLeft') || (k.down('left') && !(strafeKeys && k.down('KeyA')))
      const turnR = k.down('ArrowRight') || (k.down('right') && !(strafeKeys && k.down('KeyD')))
      P.a += ((turnR ? 1 : 0) - (turnL ? 1 : 0)) * 2.5 * dt
      const fwd = (k.down('up') || k.down('KeyW') ? 1 : 0) - (k.down('down') || k.down('KeyS') ? 1 : 0)
      const side = (k.down('KeyE') || (strafeKeys && k.down('KeyD')) ? 1 : 0) - (k.down('KeyQ') || (strafeKeys && k.down('KeyA')) ? 1 : 0)
      const speed = (sprint ? 4.6 : sneak ? 1.5 : 3.1) * (dark ? 0.9 : 1)
      let mx = Math.cos(P.a) * fwd + Math.cos(P.a + Math.PI / 2) * side
      let my = Math.sin(P.a) * fwd + Math.sin(P.a + Math.PI / 2) * side
      const ml = Math.hypot(mx, my)
      if (ml > 0) {
        mx /= ml
        my /= ml
        tryMove(P.x + mx * speed * dt, P.y + my * speed * dt)
        walkT += dt * speed
      }
      if (k.hit('a') && !touch) fire()
      else if (k.down('a') && touch) fire()
      // discover
      const cx = Math.floor(P.x)
      const cy = Math.floor(P.y)
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const x = cx + dx
        const y = cy + dy
        if (x >= 0 && y >= 0 && x < lv.w && y < lv.h && dx * dx + dy * dy <= 10 && los(P.x, P.y, x + 0.5, y + 0.5)) visited[y * lv.w + x] = 1
      }
      // pickups
      for (const it of items) {
        if (it.got || Math.hypot(it.x - P.x, it.y - P.y) > 0.55) continue
        it.got = true
        env.sfx(it.kind === 'key' ? 'power' : 'point')
        fx.burst(W / 2, H * 0.7, t.accent2, 10, 180, 3)
        if (it.kind === 'key') {
          keysHave++
          score += 100
          say(`KEY ${keysHave}/${keysNeed || keysHave}`)
        } else if (it.kind === 'loot') {
          score += 100
          say('+100')
        } else if (it.kind === 'health') {
          P.hp = Math.min(100, P.hp + 25)
          sanity = Math.min(100, sanity + 35)
          say(dark ? 'SANITY RESTORED' : '+25 HP')
        } else {
          P.ammo += 8
          say('+8 AMMO')
        }
        hud()
      }
      updateFoes(dt)
      // exit
      const ex = lv.exit.x + 0.5
      const ey = lv.exit.y + 0.5
      if (Math.hypot(P.x - ex, P.y - ey) < 0.95 && phase === 'play') {
        if (keysHave >= keysNeed) {
          phase = 'clear'
          phaseT = 0
          score += 500 * level + Math.max(0, Math.round(400 - levelT * 2))
          env.sfx('win')
          hud()
        } else if (msgT <= 0) {
          say(`NEED ${keysNeed - keysHave} MORE 🔑`, 1.5)
          env.sfx('click')
        }
      }
    }

    // ---------- draw ----------
    const draw = () => {
      ctx.save()
      shake.apply(ctx)
      const maxView = dark ? 7.5 : 18
      const bob = Math.sin(walkT * 3.2) * 3
      const horizon = H / 2 + bob
      // floor & ceiling
      const cg = ctx.createLinearGradient(0, 0, 0, horizon)
      cg.addColorStop(0, dark ? '#000' : mix(t.bg, '#000000', 0.3))
      cg.addColorStop(1, dark ? '#0a0608' : t.bg2)
      ctx.fillStyle = cg
      ctx.fillRect(0, 0, W, horizon)
      const fg = ctx.createLinearGradient(0, horizon, 0, H)
      fg.addColorStop(0, dark ? '#0a0608' : mix(t.bg2, '#000000', 0.2))
      fg.addColorStop(1, dark ? '#000' : mix(t.bg, '#000000', 0.55))
      ctx.fillStyle = fg
      ctx.fillRect(0, horizon, W, H - horizon)
      const dx = Math.cos(P.a)
      const dy = Math.sin(P.a)
      const px = -dy * planeLen
      const py = dx * planeLen
      const flick = dark ? 0.9 + Math.random() * 0.1 - (Math.random() < 0.02 ? 0.4 : 0) : 1
      for (let c = 0; c < COLS; c++) {
        const cam = (2 * c) / COLS - 1
        const r = cast(P.x, P.y, dx + px * cam, dy + py * cam)
        const d = Math.max(0.05, r.d)
        zbuf[c] = d
        const lh = H / d
        const top = horizon - lh / 2
        const tex = r.tile === EXIT ? exitTex : wallTex[r.tile] ?? wallTex[1]
        ctx.drawImage(tex, Math.min(63, Math.floor(r.wx * 64)), 0, 1, 64, c * COLW, top, COLW, lh)
        let light = clamp(1 - d / maxView, 0, 1)
        light = light * light * 0.9 + 0.08
        if (dark) light = clamp(light * 0.35 + Math.max(0, 1 - Math.abs(cam) * 2.2) * clamp(1 - d / 11, 0, 1) * 0.85, 0, 1) * flick
        if (r.side === 1) light *= 0.78
        if (r.tile === EXIT) light = Math.max(light, 0.75 + Math.sin(time * 4) * 0.1)
        ctx.fillStyle = `rgba(0,0,0,${(1 - clamp(light, 0, 1)).toFixed(3)})`
        ctx.fillRect(c * COLW, top - 0.5, COLW, lh + 1)
      }
      // sprites
      const list: SpriteDraw[] = []
      for (const it of items) {
        if (it.got) continue
        list.push({ x: it.x, y: it.y, img: spr(it.e), scale: it.kind === 'key' ? 0.5 : 0.42, lift: 0.15 + Math.sin(time * 3 + it.x) * 0.04, alpha: 1, flash: 0, d: 0 })
      }
      for (const f of foes) if (f.alive) list.push({ x: f.x, y: f.y, img: spr(f.e), scale: 0.85, lift: 0, alpha: 1, flash: f.hurt, d: 0 })
      for (const s of list) s.d = (s.x - P.x) ** 2 + (s.y - P.y) ** 2
      list.sort((a, b) => b.d - a.d)
      const invDet = 1 / (px * dy - dx * py)
      for (const s of list) {
        const sx = s.x - P.x
        const sy = s.y - P.y
        const tx = invDet * (dy * sx - dx * sy)
        const ty = invDet * (-py * sx + px * sy)
        if (ty < 0.15) continue
        const size = (H / ty) * s.scale * (1 + s.flash * 0.6)
        const screenX = (W / 2) * (1 + tx / ty)
        const bottom = horizon + H / ty / 2 - (H / ty) * s.lift
        const x0 = Math.floor(screenX - size / 2)
        const x1 = Math.floor(screenX + size / 2)
        if (x1 < 0 || x0 > W) continue
        let light = clamp(1 - ty / maxView, 0, 1)
        light = light * light * 0.9 + 0.1
        if (dark) light = clamp(light * 0.35 + Math.max(0, 1 - Math.abs(tx / ty / planeLen) * 2.2) * clamp(1 - ty / 11, 0, 1) * 0.85, 0, 1) * flick
        const alpha = clamp(light * 1.3, 0.1, 1)
        ctx.globalAlpha = alpha
        // draw visible slices
        let runStart = -1
        const flush = (endX: number) => {
          if (runStart < 0) return
          const sw = (endX - runStart) / size
          const srcX = ((runStart - x0) / size) * 96
          ctx.drawImage(s.img, srcX, 0, sw * 96, 96, runStart, bottom - size, endX - runStart, size)
          runStart = -1
        }
        for (let xx = Math.max(0, x0); xx <= Math.min(W - 1, x1); xx += COLW) {
          const vis = zbuf[Math.floor(xx / COLW)] > ty
          if (vis && runStart < 0) runStart = xx
          else if (!vis) flush(xx)
        }
        flush(Math.min(W, x1))
        ctx.globalAlpha = 1
      }
      fx.draw(ctx)
      ctx.restore()
      // vignette / sanity effects
      if (dark) {
        const ins = 1 - sanity / 100
        const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * (0.95 - ins * 0.25))
        vg.addColorStop(0, 'rgba(0,0,0,0)')
        vg.addColorStop(1, `rgba(${Math.round(60 * ins)},0,0,${0.7 + ins * 0.25})`)
        ctx.fillStyle = vg
        ctx.fillRect(0, 0, W, H)
      }
      if (flash > 0) {
        ctx.fillStyle = flashCol
        ctx.globalAlpha = clamp(flash * 1.6, 0, 0.5)
        ctx.fillRect(0, 0, W, H)
        ctx.globalAlpha = 1
      }
      // weapon
      if (!stealth) {
        const gy = H - 70 + gunKick * 14 + Math.sin(walkT * 3.2) * 3
        const gx = W / 2 + 40
        ctx.fillStyle = '#2b2b33'
        ctx.beginPath()
        ctx.moveTo(gx - 22, H)
        ctx.lineTo(gx - 12, gy + 10)
        ctx.lineTo(gx + 12, gy + 10)
        ctx.lineTo(gx + 22, H)
        ctx.fill()
        ctx.fillStyle = '#555563'
        ctx.fillRect(gx - 7, gy - 22, 14, 36)
        ctx.fillStyle = t.accent
        ctx.fillRect(gx - 3, gy - 20, 6, 6)
        if (gunKick > 0.5) {
          ctx.fillStyle = '#fde047'
          ctx.shadowColor = '#fb923c'
          ctx.shadowBlur = 20
          ctx.beginPath()
          ctx.arc(gx, gy - 28, 14 * gunKick, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
        ctx.strokeStyle = '#fff'
        ctx.globalAlpha = 0.8
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(W / 2 - 8, H / 2)
        ctx.lineTo(W / 2 - 3, H / 2)
        ctx.moveTo(W / 2 + 3, H / 2)
        ctx.lineTo(W / 2 + 8, H / 2)
        ctx.moveTo(W / 2, H / 2 - 8)
        ctx.lineTo(W / 2, H / 2 - 3)
        ctx.moveTo(W / 2, H / 2 + 3)
        ctx.lineTo(W / 2, H / 2 + 8)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      // portrait + bars
      const pxp = 14
      const pyp = H - 62
      ctx.fillStyle = 'rgba(0,0,0,.55)'
      ctx.beginPath()
      ctx.roundRect(pxp - 6, pyp - 8, narrow ? 150 : 200, 62, 10)
      ctx.fill()
      ctx.save()
      ctx.translate(pxp + 22 + (faceHurt > 0 ? (Math.random() - 0.5) * 6 : 0), pyp + 22)
      ctx.font = '38px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(t.hero, 0, 2)
      ctx.restore()
      const bx = pxp + 52
      ctx.fillStyle = 'rgba(255,255,255,.15)'
      ctx.fillRect(bx, pyp + 2, narrow ? 80 : 120, 10)
      ctx.fillStyle = P.hp > 35 ? t.good : t.danger
      ctx.fillRect(bx, pyp + 2, (narrow ? 80 : 120) * clamp(P.hp / 100, 0, 1), 10)
      if (dark) {
        ctx.fillStyle = 'rgba(255,255,255,.15)'
        ctx.fillRect(bx, pyp + 18, narrow ? 80 : 120, 6)
        ctx.fillStyle = '#a78bfa'
        ctx.fillRect(bx, pyp + 18, (narrow ? 80 : 120) * clamp(sanity / 100, 0, 1), 6)
      }
      text(ctx, `${stealth ? '🤫' : `🎯${P.ammo}`}${keysNeed ? `  🔑${keysHave}/${keysNeed}` : ''}`, bx, pyp + 40, { size: 10, color: t.fg, align: 'left' })
      text(ctx, `LV ${level}/${totalLevels}`, W / 2, 16, { size: 10, color: t.fg, shadow: '#000' })
      text(ctx, `${Math.round(score)}`, W - 14, H - 20, { size: 14, color: t.fg, align: 'right', shadow: '#000' })
      // minimap
      if (showMap) {
        const cs = Math.min(5, Math.floor(100 / Math.max(lv.w, lv.h) + 3))
        const mw = lv.w * cs
        const mh = lv.h * cs
        const mx0 = W - mw - 10
        const my0 = 10
        ctx.fillStyle = 'rgba(0,0,0,.55)'
        ctx.fillRect(mx0 - 4, my0 - 4, mw + 8, mh + 8)
        for (let y = 0; y < lv.h; y++)
          for (let x = 0; x < lv.w; x++) {
            const v = visited[y * lv.w + x]
            let near = v
            if (!near) for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (visited[(y + ay) * lv.w + x + ax]) near = 1
            if (!near) continue
            const tl = tiles[y * lv.w + x]
            ctx.fillStyle = tl === EXIT ? t.accent2 : tl ? 'rgba(255,255,255,.55)' : v ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,0)'
            ctx.fillRect(mx0 + x * cs, my0 + y * cs, cs, cs)
          }
        for (const it of items) if (!it.got && it.kind === 'key' && visited[Math.floor(it.y) * lv.w + Math.floor(it.x)]) {
          ctx.fillStyle = '#facc15'
          ctx.fillRect(mx0 + it.x * cs - 1.5, my0 + it.y * cs - 1.5, 3, 3)
        }
        ctx.fillStyle = t.accent
        ctx.beginPath()
        ctx.arc(mx0 + P.x * cs, my0 + P.y * cs, cs * 0.7, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = t.accent
        ctx.beginPath()
        ctx.moveTo(mx0 + P.x * cs, my0 + P.y * cs)
        ctx.lineTo(mx0 + (P.x + dx * 2) * cs, my0 + (P.y + dy * 2) * cs)
        ctx.stroke()
      } else if (touch) text(ctx, '🗺', W - 24, 24, { size: 16 })
      if (msgT > 0) {
        ctx.globalAlpha = Math.min(1, msgT * 2)
        text(ctx, msg, W / 2, H * 0.28, { size: narrow ? 10 : 14, color: t.accent2, shadow: '#000' })
        ctx.globalAlpha = 1
      }
      if (hint > 0 && phase === 'play') {
        ctx.globalAlpha = Math.min(1, hint)
        text(ctx, touch ? 'DPAD MOVE/TURN · DRAG TO LOOK · 💥 FIRE' : 'W/S MOVE · ←/→ TURN · Q/E STRAFE · SPACE FIRE · M MAP · CLICK = MOUSE LOOK', W / 2, H - 84, { size: narrow ? 7 : 9, color: t.fg, shadow: '#000' })
        ctx.globalAlpha = 1
      }
      if (phase === 'clear') {
        ctx.fillStyle = 'rgba(0,0,0,.55)'
        ctx.fillRect(0, H * 0.32, W, 120)
        text(ctx, level >= totalLevels ? 'YOU ESCAPED!' : 'LEVEL CLEAR!', W / 2, H * 0.32 + 40, { size: narrow ? 16 : 24, color: t.accent2, shadow: t.accent })
        text(ctx, `SCORE ${Math.round(score)}`, W / 2, H * 0.32 + 84, { size: 12, color: t.fg })
      }
    }

    startLevel()
    hud()
    const lp = loop(update, draw)
    return {
      pause: (p) => lp.pause(p),
      destroy() {
        lp.stop()
        if (document.pointerLockElement === lockEl) document.exitPointerLock?.()
        k.dispose()
        bag.dispose()
        ptr.dispose()
        dispVpad()
        st.dispose()
      },
    }
  },
}

export default engine
