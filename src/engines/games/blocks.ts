// Blocks: falling-block classic (7-bag, hold, ghost, wall kicks, levels), polyomino packing (drag, rotate, fill the shape),
// and block-blast (place 3 pieces on an 8x8 board, clear rows and columns).
import { background, Bag, byDiff, clamp, createStage, emoji, keys, loop, Particles, pointer, roundRect, Shake, swipe, text, vpad, type Engine, type GameEnv, type Stage } from '../kit'
import {
  anyFits, BLAST_SHAPES, canPlace, cellsOf, clearLines, clearRowsCols, collides, dealBlast, dropY, fallDelay, flipH, genPacking, lineScore, lockPiece, makeBag, newBoard, rotateCW,
  tryRotate, type Cell, type Packing,
} from '../logic/blocks'

let W = 800
let H = 450

interface Scene {
  update(dt: number): void
  draw(): void
}
interface Ctx {
  env: GameEnv
  st: Stage
  c: CanvasRenderingContext2D
  k: ReturnType<typeof keys>
  bag: Bag
  fx: Particles
  shake: Shake
}

function cell(c: CanvasRenderingContext2D, x: number, y: number, s: number, color: string, em?: string, alpha = 1) {
  c.globalAlpha = alpha
  roundRect(c, x + 1, y + 1, s - 2, s - 2, Math.max(2, s * 0.18), color)
  c.fillStyle = 'rgba(255,255,255,.28)'
  c.fillRect(x + 3, y + 3, s - 6, Math.max(2, s * 0.14))
  c.fillStyle = 'rgba(0,0,0,.22)'
  c.fillRect(x + 3, y + s - 3 - Math.max(2, s * 0.14), s - 6, Math.max(2, s * 0.14))
  if (em) {
    c.globalAlpha = alpha * 0.55
    emoji(c, em, x + s / 2, y + s / 2, s * 0.55)
  }
  c.globalAlpha = 1
}

function intro(c: CanvasRenderingContext2D, env: GameEnv, hint: string, tt: number) {
  if (tt > 2.8) return
  c.globalAlpha = tt < 2.2 ? 1 : 1 - (tt - 2.2) / 0.6
  const y0 = W < 600 ? 4 : H - 56
  roundRect(c, W / 2 - Math.min(300, W / 2 - 4), y0, Math.min(600, W - 8), 44, 10, 'rgba(0,0,0,.7)')
  text(c, env.name.length > 34 ? env.name.slice(0, 33) + '…' : env.name, W / 2, y0 + 14, { size: W < 600 ? 9 : 12, color: env.theme.accent })
  text(c, hint, W / 2, y0 + 32, { size: W < 600 ? 6 : 8, color: env.theme.fg })
  c.globalAlpha = 1
}

interface Float {
  s: string
  x: number
  y: number
  t: number
  color: string
}
const drawFloats = (c: CanvasRenderingContext2D, fl: Float[]) => {
  for (const f of fl) {
    c.globalAlpha = Math.min(1, f.t * 1.5)
    text(c, f.s, f.x, f.y - (1 - f.t) * 40, { size: 16, color: f.color, shadow: f.color })
  }
  c.globalAlpha = 1
}
const stepFloats = (fl: Float[], dt: number) => {
  for (const f of fl) f.t -= dt
  for (let i = fl.length - 1; i >= 0; i--) if (fl[i].t <= 0) fl.splice(i, 1)
}

// ---------- classic falling blocks ----------

function classic(G: Ctx, endless: boolean): Scene {
  const { env, c, k, fx, shake } = G
  const t = env.theme
  const BW = 10
  const BH = 20
  const por = W < 600
  const CS = por ? Math.min(30, Math.floor((W - 130) / 10), Math.floor((H - 200) / 20)) : 21
  const BX = por ? 10 : Math.round(W / 2 - (BW * CS) / 2)
  const BY = por ? 56 : 15
  const board = newBoard(BW, BH)
  const next = makeBag(env.rng)
  const queue = [next(), next(), next(), next(), next()]
  const goal = endless ? 0 : byDiff(env, 30, 40, 50)
  let cur = { t: 0, rot: 0, x: 3, y: 0 }
  let hold = -1
  let canHold = true
  let lines = 0
  let score = 0
  let level = 1 + byDiff(env, 0, 1, 3)
  let acc = 0
  let lockT = 0
  let lockMoves = 0
  let das = 0
  let dasDir = 0
  let clearing: { rows: number[]; t: number } | null = null
  let over = false
  let tt = 0
  let hero = 0
  let combo = 0
  const floats: Float[] = []
  const col = (ty: number) => t.blocks[ty % t.blocks.length]
  const em = (ty: number) => t.items[ty % t.items.length]

  const hud = () => {
    env.score(score)
    env.status(`Level ${level} · ${goal ? `${lines}/${goal}` : lines} lines`)
  }
  const spawn = (ty: number) => {
    const n = ty === 0 ? 4 : ty === 1 ? 2 : 3
    cur = { t: ty, rot: 0, x: Math.floor((BW - n) / 2), y: ty === 0 ? -1 : 0 }
    canHold = true
    acc = 0
    lockT = 0
    lockMoves = 0
    if (collides(board, cur.t, cur.rot, cur.x, cur.y)) finish(false)
  }
  const finish = (won: boolean) => {
    if (over) return
    over = true
    env.sfx(won ? 'win' : 'lose')
    shake.kick(8)
    env.end({ score, won, text: won ? `${goal} lines cleared at level ${level}!` : `Reached level ${level} with ${lines} lines` })
  }
  const grounded = () => collides(board, cur.t, cur.rot, cur.x, cur.y + 1)
  const tryMove = (dx: number) => {
    if (collides(board, cur.t, cur.rot, cur.x + dx, cur.y)) return false
    cur.x += dx
    if (grounded() && lockMoves < 12) {
      lockT = 0
      lockMoves++
    }
    env.sfx('move')
    return true
  }
  const rotate = (dir: 1 | -1) => {
    const r = tryRotate(board, cur.t, cur.rot, cur.x, cur.y, dir)
    if (!r) return
    cur.rot = r.rot
    cur.x = r.x
    cur.y = r.y
    if (grounded() && lockMoves < 12) {
      lockT = 0
      lockMoves++
    }
    env.sfx('click')
  }
  const doHold = () => {
    if (!canHold) return
    const old = hold
    hold = cur.t
    env.sfx('power')
    if (old < 0) {
      spawn(queue.shift()!)
      queue.push(next())
    } else spawn(old)
    canHold = false
  }
  const lock = () => {
    const above = lockPiece(board, cur.t, cur.rot, cur.x, cur.y)
    env.sfx('hit')
    if (above) return finish(false)
    const full: number[] = []
    for (let y = 0; y < BH; y++) {
      let f = true
      for (let x = 0; x < BW; x++) if (!board.g[y * BW + x]) f = false
      if (f) full.push(y)
    }
    if (full.length) {
      clearing = { rows: full, t: 0.34 }
      combo++
      const pts = lineScore(full.length, level) + (combo > 1 ? 50 * combo * level : 0)
      score += pts
      lines += full.length
      level = Math.max(level, 1 + byDiff(env, 0, 1, 3) + Math.floor(lines / 10))
      const names = ['', 'SINGLE', 'DOUBLE', 'TRIPLE', 'TETRIS!']
      floats.push({ s: names[Math.min(4, full.length)] + (combo > 1 ? ` x${combo}` : ''), x: BX + (BW * CS) / 2, y: BY + full[0] * CS, t: 1, color: full.length >= 4 ? t.accent2 : t.accent })
      env.sfx(full.length >= 4 ? 'win' : 'point')
      shake.kick(full.length * 2)
      hero = 1
      for (const y of full) for (let x = 0; x < BW; x++) fx.burst(BX + x * CS + CS / 2, BY + y * CS + CS / 2, col(board.g[y * BW + x] - 1), 3, 160, 3)
      hud()
      if (goal && lines >= goal) {
        setTimeout(() => finish(true), 500)
        over = false
      }
    } else {
      combo = 0
      spawn(queue.shift()!)
      queue.push(next())
    }
  }
  const hardDrop = () => {
    const y = dropY(board, cur.t, cur.rot, cur.x, cur.y)
    score += 2 * (y - cur.y)
    for (const [cx, cy] of cellsOf(cur.t, cur.rot)) fx.burst(BX + (cur.x + cx) * CS + CS / 2, BY + (cur.y + cy) * CS + CS / 2, col(cur.t), 1, 90, 2)
    cur.y = y
    lock()
    hud()
  }

  spawn(queue.shift()!)
  queue.push(next())
  hud()
  G.k.onKey((e) => {
    if (over || clearing) return
    if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyX') rotate(1)
    else if (e.code === 'KeyZ') rotate(-1)
    else if (e.code === 'Space') hardDrop()
    else if (e.code === 'KeyC' || e.code === 'ShiftLeft') doHold()
  })
  G.bag.add(swipe(G.st.canvas, (d) => {
    if (over || clearing) return
    if (d === 'left') tryMove(-1)
    else if (d === 'right') tryMove(1)
    else if (d === 'up') rotate(1)
    else hardDrop()
  }))

  return {
    update(dt) {
      tt += dt
      fx.update(dt, 120)
      shake.update(dt)
      stepFloats(floats, dt)
      hero = Math.max(0, hero - dt * 1.6)
      if (over) return
      if (clearing) {
        clearing.t -= dt
        if (clearing.t <= 0) {
          clearLines(board)
          clearing = null
          if (goal && lines >= goal) return
          spawn(queue.shift()!)
          queue.push(next())
        }
        return
      }
      if (k.hit('p2a')) hardDrop()
      if (k.hit('p2b')) doHold()
      if (over || clearing) return
      if (k.hit('up')) rotate(1)
      const dir = (k.down('left') ? -1 : 0) + (k.down('right') ? 1 : 0)
      if (dir !== dasDir) {
        dasDir = dir
        das = 0.16
        if (dir) tryMove(dir)
      } else if (dir) {
        das -= dt
        if (das <= 0) {
          das = 0.045
          tryMove(dir)
        }
      }
      const soft = k.down('down')
      const delay = soft ? Math.min(0.04, fallDelay(level) / 12) : fallDelay(level, byDiff(env, 0.85, 1, 1.2))
      if (!grounded()) {
        acc += dt
        while (acc >= delay && !grounded()) {
          acc -= delay
          cur.y++
          if (soft) score++
        }
        if (soft) env.score(score)
      } else {
        lockT += dt
        if (lockT > (soft ? 0.12 : 0.5)) {
          lock()
          hud()
        }
      }
    },
    draw() {
      c.save()
      background(c, W, H, t, 40, env.seed)
      shake.apply(c)
      // board
      roundRect(c, BX - 6, BY - 6, BW * CS + 12, BH * CS + 12, 8, 'rgba(0,0,0,.5)', t.accent, 2)
      c.strokeStyle = 'rgba(255,255,255,.05)'
      c.lineWidth = 1
      for (let x = 1; x < BW; x++) {
        c.beginPath()
        c.moveTo(BX + x * CS, BY)
        c.lineTo(BX + x * CS, BY + BH * CS)
        c.stroke()
      }
      for (let y = 1; y < BH; y++) {
        c.beginPath()
        c.moveTo(BX, BY + y * CS)
        c.lineTo(BX + BW * CS, BY + y * CS)
        c.stroke()
      }
      const flash = clearing ? Math.floor(clearing.t * 24) % 2 === 0 : false
      for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
        const v = board.g[y * BW + x]
        if (!v) continue
        if (clearing?.rows.includes(y)) {
          c.fillStyle = flash ? '#fff' : col(v - 1)
          c.globalAlpha = 0.5 + clearing.t
          c.fillRect(BX + x * CS + 1, BY + y * CS + 1, CS - 2, CS - 2)
          c.globalAlpha = 1
        } else cell(c, BX + x * CS, BY + y * CS, CS, col(v - 1), em(v - 1))
      }
      if (!over && !clearing) {
        const gy = dropY(board, cur.t, cur.rot, cur.x, cur.y)
        for (const [cx, cy] of cellsOf(cur.t, cur.rot)) {
          const X = BX + (cur.x + cx) * CS
          if (gy + cy >= 0) {
            c.strokeStyle = col(cur.t)
            c.globalAlpha = 0.55
            c.lineWidth = 2
            c.strokeRect(X + 2, BY + (gy + cy) * CS + 2, CS - 4, CS - 4)
            c.globalAlpha = 1
          }
        }
        for (const [cx, cy] of cellsOf(cur.t, cur.rot)) if (cur.y + cy >= 0) cell(c, BX + (cur.x + cx) * CS, BY + (cur.y + cy) * CS, CS, col(cur.t), em(cur.t))
      }
      // side panels
      const mini = (ty: number, x: number, y: number, s: number, a = 1) => {
        const cs = cellsOf(ty, 0)
        const xs = cs.map((q) => q[0])
        const ys = cs.map((q) => q[1])
        const w = Math.max(...xs) - Math.min(...xs) + 1
        const h = Math.max(...ys) - Math.min(...ys) + 1
        for (const [cx, cy] of cs) cell(c, x - (w * s) / 2 + (cx - Math.min(...xs)) * s, y - (h * s) / 2 + (cy - Math.min(...ys)) * s, s, col(ty), undefined, a)
      }
      const px = por ? BX + BW * CS + 14 : BX + BW * CS + 40
      const pw = por ? W - px - 8 : 120
      const mc = px + pw / 2
      const ms = por ? 12 : 14
      roundRect(c, px, BY, pw, por ? 190 : 270, 10, 'rgba(0,0,0,.35)', t.accent2, 1.5)
      text(c, 'NEXT', mc, BY + 16, { size: por ? 8 : 10, color: t.accent2 })
      for (let i = 0; i < (por ? 3 : 4); i++) mini(queue[i], mc, BY + (por ? 48 : 56) + i * (por ? 50 : 56), i ? ms : ms + 4)
      const hx = por ? px : BX - 40 - 120
      const hy = por ? BY + 204 : BY
      roundRect(c, hx, hy, pw, 100, 10, 'rgba(0,0,0,.35)', canHold ? t.accent : 'rgba(255,255,255,.2)', 1.5)
      text(c, 'HOLD', mc - (por ? px - hx : 0) + (por ? 0 : 0), hy + 16, { size: por ? 8 : 10, color: t.accent })
      if (hold >= 0) mini(hold, hx + pw / 2, hy + 58, 18, canHold ? 1 : 0.4)
      const sy = por ? hy + 120 : BY + 140
      text(c, `SCORE`, hx + pw / 2, sy, { size: 8, color: t.fg })
      text(c, String(score), hx + pw / 2, sy + 20, { size: por ? 10 : 13, color: t.accent })
      text(c, `LEVEL ${level}`, hx + pw / 2, sy + 52, { size: por ? 8 : 10, color: t.fg })
      text(c, goal ? `${lines}/${goal}` : `${lines} LINES`, hx + pw / 2, sy + 74, { size: por ? 8 : 10, color: t.good })
      // hero cheers on clears
      emoji(c, t.hero, hx + pw / 2, (por ? sy + 130 : BY + 330) - Math.sin(hero * Math.PI) * 40, 44 + hero * 10, Math.sin(tt * 9) * hero * 0.3)
      c.restore()
      drawFloats(c, floats)
      fx.draw(c)
      intro(c, G.env, 'ARROWS move · UP/X rotate · Z ccw · SPACE drop · C hold', tt)
    },
  }
}

// ---------- polyomino packing ----------

interface Piece {
  cells: Cell[]
  color: string
  item: string
  at: { x: number; y: number } | null
}

function packing(G: Ctx, size: number): Scene {
  const { env, c, k, fx, shake } = G
  const t = env.theme
  const ptr = pointer(G.st)
  G.bag.add(() => ptr.dispose())
  const levels = byDiff(env, 6, 8, 10)
  let level = 1
  let score = 0
  let pk!: Packing
  let pieces: Piece[] = []
  let occ: Int8Array = new Int8Array(0)
  let cs = 36
  let ox = 0
  let oy = 0
  let holding = -1
  let moved = 0
  let from: { x: number; y: number } | null = null
  let trayPos: { x: number; y: number; s: number }[] = []
  const por = W < 600
  let tray = { x: 548, y: 40, w: 244, h: 396 }
  let moves = 0
  let pause = 0
  let after: (() => void) | null = null
  let over = false
  let tt = 0
  let elapsed = 0

  const dims = (): [number, number] => {
    const T = Math.min(56, 12 + 4 * level)
    let best: [number, number] = [4, 4]
    let bd = 1e9
    for (let w = 3; w <= 10; w++) for (let h = 3; h <= w; h++) {
      if (w - h > 4 || (size && (w * h) % size)) continue
      const d = Math.abs(w * h - T) + (w - h) * 0.2
      if (d < bd) {
        bd = d
        best = [w, h]
      }
    }
    return best
  }

  const build = () => {
    const [a, b] = dims()
    const flip = env.rng.chance(0.5)
    const w = flip ? b : a
    const h = flip ? a : b
    const sz = size || 0
    pk = genPacking(env.rng, { w, h, size: sz, carve: sz ? 0 : level > 2 ? env.rng.int(0, 3) : 0 })
    if (por) {
      cs = Math.min(46, Math.floor((W - 30) / pk.w), Math.floor((H * 0.38) / pk.h))
      ox = Math.round((W - pk.w * cs) / 2)
      oy = 60
      const ty = oy + pk.h * cs + 34
      tray = { x: 8, y: ty, w: W - 16, h: H - ty - 140 }
    } else {
      cs = Math.min(46, Math.floor(430 / pk.w), Math.floor(360 / pk.h))
      ox = Math.round(30 + (500 - pk.w * cs) / 2)
      oy = Math.round((H - pk.h * cs) / 2)
    }
    occ = new Int8Array(pk.w * pk.h).fill(-1)
    pieces = pk.pieces.map((cells, i) => ({ cells, color: t.blocks[i % t.blocks.length], item: t.items[i % t.items.length], at: null }))
    holding = -1
    moves = 0
    elapsed = 0
    layout()
    hud()
  }
  const hud = () => {
    env.score(score)
    const left = pieces.filter((p) => !p.at).length
    env.status(`Level ${level}/${levels} · ${left} pieces left · ${moves} moves`)
  }
  const bbox = (cells: Cell[]) => ({ w: Math.max(...cells.map((q) => q[0])) + 1, h: Math.max(...cells.map((q) => q[1])) + 1 })

  const layout = () => {
    const TX = tray.x + 12
    const TY = tray.y + 16
    const TW = tray.w - 24
    const TH = tray.h - 28
    const idx = pieces.map((_, i) => i).filter((i) => !pieces[i].at)
    for (let s = 26; s >= 8; s--) {
      const pos: typeof trayPos = []
      let x = 0
      let y = 0
      let rowH = 0
      let ok = true
      for (const i of idx) {
        const bb = bbox(pieces[i].cells)
        const pw = bb.w * s
        if (x + pw > TW) {
          x = 0
          y += rowH + 10
          rowH = 0
        }
        pos[i] = { x: TX + x, y: TY + y, s }
        x += pw + 12
        rowH = Math.max(rowH, bb.h * s)
        if (y + rowH > TH) ok = false
      }
      if (ok || s === 8) {
        trayPos = pos
        return
      }
    }
  }

  const anchorOf = (px: number, py: number, cells: Cell[]) => {
    const bb = bbox(cells)
    return { x: Math.round((px - ox) / cs - bb.w / 2), y: Math.round((py - oy) / cs - bb.h / 2) }
  }
  const validAt = (cells: Cell[], ax: number, ay: number) =>
    cells.every(([cx, cy]) => {
      const x = ax + cx
      const y = ay + cy
      return x >= 0 && y >= 0 && x < pk.w && y < pk.h && pk.shape[y * pk.w + x] === 1 && occ[y * pk.w + x] < 0
    })

  const complete = () => {
    if (!pieces.every((p) => p.at)) return
    const bonus = Math.max(0, Math.round(90 - elapsed)) * 2
    score += 100 * level + bonus
    env.sfx('win')
    shake.kick(5)
    for (const p of pieces) for (const [cx, cy] of p.cells) fx.burst(ox + (p.at!.x + cx + 0.5) * cs, oy + (p.at!.y + cy + 0.5) * cs, p.color, 3, 170, 3)
    if (level >= levels) {
      over = true
      pause = 1.5
      after = () => env.end({ score, won: true, text: `Packed all ${levels} puzzles` })
    } else {
      level++
      pause = 1.3
      after = build
    }
    hud()
  }

  const dropHeld = (px: number, py: number) => {
    if (holding < 0) return
    const p = pieces[holding]
    const a = anchorOf(px, py, p.cells)
    if (validAt(p.cells, a.x, a.y)) {
      p.at = a
      for (const [cx, cy] of p.cells) occ[(a.y + cy) * pk.w + a.x + cx] = holding
      moves++
      env.sfx('point')
      for (const [cx, cy] of p.cells) fx.burst(ox + (a.x + cx + 0.5) * cs, oy + (a.y + cy + 0.5) * cs, p.color, 2, 90, 2)
    } else if (from && moved < 8) {
      p.cells = rotateCW(p.cells)
      env.sfx('click')
    } else env.sfx('hit')
    holding = -1
    layout()
    hud()
    complete()
  }
  const rotateHeld = (flip = false) => {
    if (holding < 0) return
    const p = pieces[holding]
    p.cells = flip ? flipH(p.cells) : rotateCW(p.cells)
    env.sfx('click')
  }

  ptr.onDown((p) => {
    if (pause > 0 || over) return
    if (p.button === 2) return rotateHeld()
    if (holding >= 0) return
    from = null
    moved = 0
    for (let i = 0; i < pieces.length; i++) {
      const pc = pieces[i]
      if (pc.at) continue
      const tp = trayPos[i]
      if (!tp) continue
      if (pc.cells.some(([cx, cy]) => p.x >= tp.x + cx * tp.s && p.x < tp.x + (cx + 1) * tp.s && p.y >= tp.y + cy * tp.s && p.y < tp.y + (cy + 1) * tp.s)) {
        holding = i
        from = { x: p.x, y: p.y }
        env.sfx('click')
        return
      }
    }
    const bx = Math.floor((p.x - ox) / cs)
    const by = Math.floor((p.y - oy) / cs)
    if (bx >= 0 && by >= 0 && bx < pk.w && by < pk.h && occ[by * pk.w + bx] >= 0) {
      const i = occ[by * pk.w + bx]
      const pc = pieces[i]
      for (const [cx, cy] of pc.cells) occ[(pc.at!.y + cy) * pk.w + pc.at!.x + cx] = -1
      pc.at = null
      holding = i
      env.sfx('click')
      layout()
      hud()
    }
  })
  ptr.onMove((p) => {
    if (from) moved = Math.max(moved, Math.hypot(p.x - from.x, p.y - from.y))
  })
  ptr.onUp((p) => {
    if (p.button === 2) return
    dropHeld(p.x, p.y)
    from = null
  })
  G.k.onKey((e) => {
    if (e.code === 'KeyR' || e.code === 'Space' || e.code === 'ArrowUp') {
      if (holding >= 0) rotateHeld()
    } else if (e.code === 'KeyF') rotateHeld(true)
    else if (e.code === 'KeyC' && holding < 0) {
      for (const p of pieces) p.at = null
      occ.fill(-1)
      layout()
      hud()
    }
  })

  build()

  return {
    update(dt) {
      tt += dt
      fx.update(dt)
      shake.update(dt)
      if (pause > 0) {
        pause -= dt
        if (pause <= 0 && after) {
          const f = after
          after = null
          f()
        }
        return
      }
      if (!over) elapsed += dt
      if (k.hit('a')) rotateHeld()
      if (k.hit('b')) rotateHeld(true)
    },
    draw() {
      c.save()
      background(c, W, H, t, 40, env.seed)
      shake.apply(c)
      roundRect(c, ox - 10, oy - 10, pk.w * cs + 20, pk.h * cs + 20, 12, 'rgba(0,0,0,.35)')
      for (let y = 0; y < pk.h; y++) for (let x = 0; x < pk.w; x++) {
        if (pk.shape[y * pk.w + x] !== 1) continue
        c.fillStyle = (x + y) & 1 ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.07)'
        c.fillRect(ox + x * cs, oy + y * cs, cs, cs)
      }
      c.strokeStyle = t.accent
      c.lineWidth = 2.5
      c.shadowColor = t.accent
      c.shadowBlur = 8
      c.beginPath()
      for (let y = 0; y < pk.h; y++) for (let x = 0; x < pk.w; x++) {
        if (pk.shape[y * pk.w + x] !== 1) continue
        const X = ox + x * cs
        const Y = oy + y * cs
        const has = (xx: number, yy: number) => xx >= 0 && yy >= 0 && xx < pk.w && yy < pk.h && pk.shape[yy * pk.w + xx] === 1
        if (!has(x, y - 1)) { c.moveTo(X, Y); c.lineTo(X + cs, Y) }
        if (!has(x, y + 1)) { c.moveTo(X, Y + cs); c.lineTo(X + cs, Y + cs) }
        if (!has(x - 1, y)) { c.moveTo(X, Y); c.lineTo(X, Y + cs) }
        if (!has(x + 1, y)) { c.moveTo(X + cs, Y); c.lineTo(X + cs, Y + cs) }
      }
      c.stroke()
      c.shadowBlur = 0
      for (const [i, p] of pieces.entries()) {
        if (!p.at || i === holding) continue
        p.cells.forEach(([cx, cy], j) => cell(c, ox + (p.at!.x + cx) * cs, oy + (p.at!.y + cy) * cs, cs, p.color, j === 0 ? p.item : undefined))
      }
      // tray
      roundRect(c, tray.x, tray.y, tray.w, tray.h, 12, 'rgba(0,0,0,.3)', t.accent2, 1.5)
      text(c, 'PIECES', tray.x + tray.w / 2, tray.y - 12, { size: 10, color: t.accent2 })
      for (const [i, p] of pieces.entries()) {
        if (p.at || i === holding) continue
        const tp = trayPos[i]
        if (!tp) continue
        p.cells.forEach(([cx, cy], j) => cell(c, tp.x + cx * tp.s, tp.y + cy * tp.s, tp.s, p.color, j === 0 ? p.item : undefined))
      }
      // held piece
      if (holding >= 0) {
        const p = pieces[holding]
        const a = anchorOf(ptr.x, ptr.y, p.cells)
        const ok = validAt(p.cells, a.x, a.y)
        for (const [cx, cy] of p.cells) {
          c.fillStyle = ok ? 'rgba(120,255,160,.35)' : 'rgba(255,90,90,.3)'
          if (a.x + cx >= 0 && a.y + cy >= 0 && a.x + cx < pk.w && a.y + cy < pk.h) c.fillRect(ox + (a.x + cx) * cs, oy + (a.y + cy) * cs, cs, cs)
        }
        const bb = bbox(p.cells)
        p.cells.forEach(([cx, cy], j) => cell(c, ptr.x - (bb.w * cs) / 2 + cx * cs, ptr.y - (bb.h * cs) / 2 + cy * cs - 8, cs, p.color, j === 0 ? p.item : undefined, 0.85))
      } else if (ptr.active) {
        emoji(c, t.hero, ptr.x + 14, ptr.y + 14, 24)
      }
      fx.draw(c)
      c.restore()
      text(c, por ? 'TAP piece = rotate' : 'R / right-click rotate · F flip · C reset', W < 600 ? W / 2 : 280, por ? oy - 14 : 18, { size: 8, color: t.fg })
      intro(c, env, 'DRAG pieces into the outline · TAP or R to rotate', tt)
      if (pause > 0) {
        c.fillStyle = 'rgba(0,0,0,.45)'
        c.fillRect(0, H / 2 - 40, W, 80)
        text(c, over ? 'All packed!' : 'Perfect fit!', W / 2, H / 2, { size: 26, color: t.good, shadow: t.good })
      }
    },
  }
}

// ---------- block blast ----------

function blast(G: Ctx): Scene {
  const { env, c, k, fx, shake } = G
  const t = env.theme
  const ptr = pointer(G.st)
  G.bag.add(() => ptr.dispose())
  const N = 8
  const por = W < 600
  const CS = por ? Math.floor((W - 24) / N) : 44
  const BX = por ? Math.round((W - N * CS) / 2) : 150
  const BY = por ? 70 : Math.round((H - N * CS) / 2)
  const board = newBoard(N, N)
  const goal = byDiff(env, 1500, 2500, 4000)
  let level = 1
  let score = 0
  let combo = 0
  let hand: (number | null)[] = []
  let handColor: number[] = []
  let holding = -1
  let cur = { x: 3, y: 3 }
  let sel = 0
  let over = false
  let tt = 0
  let moves = 0
  const fading: { x: number; y: number; c: string; t: number }[] = []
  const floats: Float[] = []
  const col = (v: number) => t.blocks[(v - 1) % t.blocks.length]

  const deal = () => {
    hand = dealBlast(env.rng, board, 3)
    handColor = hand.map(() => env.rng.int(1, t.blocks.length))
    sel = 0
  }
  const hud = () => {
    env.score(score)
    env.status(`Level ${level} · goal ${goal} · ${combo > 1 ? `combo x${combo}` : `${moves} moves`}`)
  }
  const slotRect = (i: number) => (por ? { x: 6 + i * ((W - 12) / 3), y: BY + N * CS + 28, w: (W - 12) / 3 - 6, h: 120 } : { x: 540, y: 40 + i * 128, w: 230, h: 116 })
  const handCells = (i: number) => (hand[i] === null ? null : BLAST_SHAPES[hand[i]!].cells)
  const shapeBox = (cells: Cell[]) => ({ w: Math.max(...cells.map((q) => q[0])) + 1, h: Math.max(...cells.map((q) => q[1])) + 1 })
  const finish = (won: boolean) => {
    if (over) return
    over = true
    env.sfx(won ? 'win' : 'lose')
    shake.kick(6)
    setTimeout(() => env.end({ score, won, text: won ? `Reached ${goal} points!` : `No more moves at level ${level}` }), 700)
  }

  const place = (i: number, ax: number, ay: number): boolean => {
    const cells = handCells(i)
    if (!cells || !canPlace(board, cells, ax, ay)) return false
    for (const [cx, cy] of cells) board.g[(ay + cy) * N + ax + cx] = handColor[i]
    moves++
    let pts = cells.length
    for (const [cx, cy] of cells) fx.burst(BX + (ax + cx + 0.5) * CS, BY + (ay + cy + 0.5) * CS, col(handColor[i]), 2, 80, 2)
    const snapshot = Array.from(board.g)
    const r = clearRowsCols(board)
    const n = r.rows.length + r.cols.length
    if (n) {
      combo++
      pts += (n * n * 10 + n * 10) * Math.max(1, combo)
      const seen = new Set<number>()
      const addFade = (x: number, y: number) => {
        if (seen.has(y * N + x)) return
        seen.add(y * N + x)
        const v = snapshot[y * N + x]
        fading.push({ x, y, c: col(v), t: 0.45 })
        fx.burst(BX + (x + 0.5) * CS, BY + (y + 0.5) * CS, col(v), 4, 190, 3)
      }
      for (const y of r.rows) for (let x = 0; x < N; x++) addFade(x, y)
      for (const x of r.cols) for (let y = 0; y < N; y++) addFade(x, y)
      env.sfx(n > 1 ? 'win' : 'point')
      shake.kick(2 + n * 2)
      floats.push({ s: (n > 1 ? `${n} LINES ` : 'CLEAR ') + (combo > 1 ? `x${combo}` : ''), x: BX + (N * CS) / 2, y: BY + (N * CS) / 2, t: 1, color: t.accent2 })
    } else {
      combo = 0
      env.sfx('click')
    }
    score += pts
    level = 1 + Math.floor(score / 600)
    hand[i] = null
    holding = -1
    if (hand.every((h) => h === null)) deal()
    hud()
    if (score >= goal) finish(true)
    else if (!hand.some((h, j) => h !== null && anyFits(board, BLAST_SHAPES[hand[j]!].cells))) {
      floats.push({ s: 'NO MOVES', x: BX + (N * CS) / 2, y: BY + 20, t: 1.2, color: t.danger })
      finish(false)
    }
    return true
  }
  const anchorFor = (px: number, py: number, cells: Cell[]) => {
    const bb = shapeBox(cells)
    return { x: Math.round((px - BX) / CS - bb.w / 2), y: Math.round((py - 28 - BY) / CS - bb.h / 2) }
  }

  ptr.onDown((p) => {
    if (over) return
    for (let i = 0; i < 3; i++) {
      const r = slotRect(i)
      if (hand[i] !== null && p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h) {
        holding = i
        sel = i
        env.sfx('click')
        return
      }
    }
  })
  ptr.onUp((p) => {
    if (holding < 0) return
    const cells = handCells(holding)!
    const a = anchorFor(p.x, p.y, cells)
    if (!place(holding, a.x, a.y)) {
      env.sfx('hit')
      holding = -1
    }
  })
  G.k.onKey((e) => {
    if (over) return
    if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3') sel = Number(e.code.slice(5)) - 1
    else if (e.code === 'Tab') {
      e.preventDefault()
      for (let i = 1; i <= 3; i++) if (hand[(sel + i) % 3] !== null) return void (sel = (sel + i) % 3)
    } else if (e.code === 'Space' || e.code === 'Enter') {
      if (hand[sel] !== null) {
        const bb = shapeBox(handCells(sel)!)
        place(sel, clamp(cur.x, 0, N - bb.w), clamp(cur.y, 0, N - bb.h))
      }
    } else if (e.code === 'ArrowLeft') cur.x = Math.max(0, cur.x - 1)
    else if (e.code === 'ArrowRight') cur.x = Math.min(N - 1, cur.x + 1)
    else if (e.code === 'ArrowUp') cur.y = Math.max(0, cur.y - 1)
    else if (e.code === 'ArrowDown') cur.y = Math.min(N - 1, cur.y + 1)
  })

  deal()
  hud()

  return {
    update(dt) {
      tt += dt
      fx.update(dt)
      shake.update(dt)
      stepFloats(floats, dt)
      for (const f of fading) f.t -= dt
      for (let i = fading.length - 1; i >= 0; i--) if (fading[i].t <= 0) fading.splice(i, 1)
      void k
    },
    draw() {
      c.save()
      background(c, W, H, t, 40, env.seed)
      shake.apply(c)
      roundRect(c, BX - 8, BY - 8, N * CS + 16, N * CS + 16, 12, 'rgba(0,0,0,.45)', t.accent, 2)
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const v = board.g[y * N + x]
        c.fillStyle = ((x >> 1) + (y >> 1)) & 1 ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.04)'
        c.fillRect(BX + x * CS + 1, BY + y * CS + 1, CS - 2, CS - 2)
        if (v) cell(c, BX + x * CS, BY + y * CS, CS, col(v), t.items[(v - 1) % t.items.length])
      }
      for (const f of fading) {
        c.globalAlpha = f.t / 0.45
        const s = CS * (1 + (0.45 - f.t) * 0.6)
        c.fillStyle = '#fff'
        c.fillRect(BX + (f.x + 0.5) * CS - s / 2, BY + (f.y + 0.5) * CS - s / 2, s, s)
      }
      c.globalAlpha = 1
      // preview
      const active = holding >= 0 ? holding : hand[sel] !== null ? sel : -1
      const cells = active >= 0 ? handCells(active) : null
      if (cells) {
        const a = holding >= 0 ? anchorFor(ptr.x, ptr.y, cells) : cur
        const ok = canPlace(board, cells, a.x, a.y)
        for (const [cx, cy] of cells) {
          const X = BX + (a.x + cx) * CS
          const Y = BY + (a.y + cy) * CS
          if (holding < 0 && !ptr.active) {
            c.strokeStyle = t.accent
            c.lineWidth = 2
            c.strokeRect(X + 2, Y + 2, CS - 4, CS - 4)
          } else if (ok && a.x + cx >= 0 && a.y + cy >= 0 && a.x + cx < N && a.y + cy < N) cell(c, X, Y, CS, col(handColor[active]), undefined, 0.45)
        }
      }
      // slots
      for (let i = 0; i < 3; i++) {
        const r = slotRect(i)
        roundRect(c, r.x, r.y, r.w, r.h, 12, 'rgba(0,0,0,.3)', sel === i ? t.accent : 'rgba(255,255,255,.12)', sel === i ? 2.5 : 1.5)
        const cs2 = handCells(i)
        if (!cs2 || holding === i) continue
        const bb = shapeBox(cs2)
        const s = Math.min(26, (r.w - 16) / bb.w, 92 / bb.h)
        const fits = anyFits(board, cs2)
        cs2.forEach(([cx, cy]) => cell(c, r.x + r.w / 2 - (bb.w * s) / 2 + cx * s, r.y + r.h / 2 - (bb.h * s) / 2 + cy * s, s, col(handColor[i]), undefined, fits ? 1 : 0.35))
      }
      if (holding >= 0) {
        const cs2 = handCells(holding)!
        const bb = shapeBox(cs2)
        cs2.forEach(([cx, cy]) => cell(c, ptr.x - (bb.w * CS) / 2 + cx * CS, ptr.y - 28 - (bb.h * CS) / 2 + cy * CS, CS, col(handColor[holding]), t.items[0], 0.92))
      }
      const ix = por ? 40 : 70
      const iy = por ? 36 : 90
      emoji(c, t.hero, ix, iy - (combo > 1 ? Math.abs(Math.sin(tt * 8)) * 10 : 0), por ? 40 : 56)
      if (por) {
        text(c, `LV ${level}  ${score}`, W / 2 + 20, 30, { size: 11, color: t.accent })
        c.fillStyle = 'rgba(255,255,255,.12)'
        c.fillRect(W / 2 - 100, 48, 240, 8)
        c.fillStyle = t.good
        c.fillRect(W / 2 - 100, 48, 240 * Math.min(1, score / goal), 8)
      } else {
        text(c, `LV ${level}`, 70, 150, { size: 11, color: t.accent })
        text(c, `${score}`, 70, 172, { size: 12, color: t.fg })
        c.fillStyle = 'rgba(255,255,255,.12)'
        c.fillRect(30, 190, 80, 8)
        c.fillStyle = t.good
        c.fillRect(30, 190, 80 * Math.min(1, score / goal), 8)
        text(c, `GOAL ${goal}`, 70, 212, { size: 8, color: t.fg })
      }
      c.restore()
      drawFloats(c, floats)
      fx.draw(c)
      intro(c, env, 'DRAG pieces onto the board · fill rows or columns to clear', tt)
    },
  }
}

// ---------- entry ----------

const engine: Engine = {
  start(env) {
    const hr = env.host.getBoundingClientRect()
    if (hr.height > hr.width * 1.15) {
      W = 450
      H = 800
    } else {
      W = 800
      H = 450
    }
    const st = createStage(env.host, W, H)
    const k = keys()
    const G: Ctx = { env, st, c: st.ctx, k, bag: new Bag(), fx: new Particles(), shake: new Shake() }
    const label = `${env.name} ${env.desc}`
    let scene: Scene
    let pad: 'dpad' | 'none' = 'none'
    let btns: { action: 'a' | 'b' | 'p2a' | 'p2b'; label: string }[] = []
    const isBlast = /blast|grid|place/i.test(label) && !/polyomino|pentomino/i.test(label)
    const isClassic = !isBlast && /tetris|falling|pile|terminal|body/i.test(env.name) && !/pack|polyomino|pentomino/i.test(env.name)
    if (isBlast) scene = blast(G)
    else if (isClassic) {
      scene = classic(G, env.mods.has('zen') || env.mods.has('endless'))
      pad = 'dpad'
      btns = [{ action: 'p2a', label: '⤓' }, { action: 'p2b', label: '⇆' }]
    } else {
      const size = /pentomino/i.test(label) ? 5 : /tetromino|tetris/i.test(label) ? 4 : /trimino/i.test(label) ? 3 : /domino/i.test(label) && !/polyomino/i.test(label) ? 2 : 0
      scene = packing(G, size)
      pad = 'none'
      btns = [{ action: 'a', label: '⟳' }, { action: 'b', label: '⇋' }]
    }
    const vp = vpad(env.host, k, pad, btns)
    const lp = loop((dt) => scene.update(dt), () => {
      G.c.clearRect(0, 0, W, H)
      scene.draw()
    })
    return {
      pause: (p) => lp.pause(p),
      destroy() {
        lp.stop()
        vp()
        k.dispose()
        G.bag.dispose()
        st.dispose()
      },
    }
  },
}

export default engine
