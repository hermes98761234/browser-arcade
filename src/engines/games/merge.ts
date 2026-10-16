// Merge: 2048 (slide + merge to a goal tile) and an emoji tier-chain variant (alchemy / craft / merge in the name).
// Swipe or arrows, animated tiles, a limited undo.
import { background, Bag, byDiff, createStage, emoji, keys, loop, Particles, roundRect, Shake, swipe, text, type Engine } from '../kit'
import { addTile, canMove, moveGrid, type Dir } from '../logic/merge'

let W = 640
let H = 400
const BS = 340
let BX = (W - BS) / 2
let BY = 30

interface Tile { v: number; x: number; y: number; tx: number; ty: number; scale: number; delay: number; dead: number }

const engine: Engine = {
  start(env) {
    const { theme: t, rng } = env
    const r0 = env.host.getBoundingClientRect()
    const portrait = r0.height > r0.width * 1.05
    W = portrait ? 400 : 640
    H = portrait ? 640 : 400
    BX = (W - BS) / 2
    BY = portrait ? 104 : 30
    const st = createStage(env.host, W, H)
    const ctx = st.ctx
    const bag = new Bag()
    const k = keys()
    const fx = new Particles()
    const shake = new Shake()
    const label = `${env.name} ${env.desc}`.toLowerCase()
    const chainMode = /alchemy|craft|merge|fusion|fluff|moon|evolv|hybrid/.test(label) && !/2048|number/.test(label)
    const n = byDiff(env, 5, 4, 4)
    const chain = [...t.items.slice(0, 6), t.hero, '👑', '🌟', '💫', '🏆']
    const goal = chainMode ? byDiff(env, 7, 8, 9) : byDiff(env, 10, 11, 11)
    const p2 = byDiff(env, 0.05, 0.1, 0.2)
    const tierName = (v: number) => (chainMode ? '' : `${2 ** v}`)
    const tierCol = (v: number) => t.blocks[(v - 1) % t.blocks.length]
    const gainFor = (v: number) => (chainMode ? v * 20 : 2 ** v)

    let grid: number[] = new Array(n * n).fill(0)
    let tiles: (Tile | null)[] = new Array(n * n).fill(null)
    let ghosts: Tile[] = []
    let score = 0
    let best = 0
    let movesN = 0
    let undos = byDiff(env, 3, 1, 1)
    let prev: { grid: number[]; score: number; movesN: number } | null = null
    let over = false
    let wonT = 0
    let overT = 0
    let t0 = 0
    let msg = ''
    let msgT = 0
    let intro = 2.5
    let hero = 0
    const pops: { x: number; y: number; s: string; t: number }[] = []

    const pos = (i: number) => ({ x: BX + (i % n) * (BS / n), y: BY + Math.floor(i / n) * (BS / n) })
    const cell = () => BS / n

    const hud = () => {
      env.score(score)
      env.status(`Best ${tierName(best) || `T${best}`} · Goal ${chainMode ? `T${goal}` : 2 ** goal} · ${movesN} moves`)
    }
    const mkTile = (v: number, i: number, scale = 0): Tile => ({ v, x: i % n, y: Math.floor(i / n), tx: i % n, ty: Math.floor(i / n), scale, delay: 0, dead: 0 })
    const spawn = () => {
      const i = addTile(grid, rng, p2)
      if (i >= 0) {
        tiles[i] = mkTile(grid[i], i, 0)
        tiles[i]!.delay = 0.08
      }
    }
    spawn()
    spawn()
    hud()

    const finish = (won: boolean) => {
      if (over) return
      over = true
      env.sfx(won ? 'win' : 'lose')
      env.end({ score, won, text: won ? `Reached ${chainMode ? `tier ${goal}` : 2 ** goal}!` : `Best tile ${chainMode ? `tier ${best}` : 2 ** best}` })
    }

    const doMove = (dir: Dir) => {
      if (over || wonT > 0) return
      const r = moveGrid(grid, n, dir, gainFor)
      if (!r.moved) {
        env.sfx('hit')
        return
      }
      prev = { grid: grid.slice(), score, movesN }
      const nt: (Tile | null)[] = new Array(n * n).fill(null)
      const merged = new Set<number>()
      for (const tr of r.trans) {
        const tile = tiles[tr.from]!
        tile.tx = tr.to % n
        tile.ty = Math.floor(tr.to / n)
        if (tr.merged) {
          merged.add(tr.to)
          tile.dead = 0.14
          ghosts.push(tile)
        } else nt[tr.to] = tile
      }
      for (const to of merged) {
        const nv = r.grid[to]
        const tile = mkTile(nv, to, 0)
        tile.delay = 0.1
        nt[to] = tile
        const p = pos(to)
        const c = cell()
        fx.burst(p.x + c / 2, p.y + c / 2, tierCol(nv), 10 + nv, 140, 3)
        pops.push({ x: p.x + c / 2, y: p.y + c / 2, s: `+${gainFor(nv)}`, t: 0 })
        if (nv >= 6) shake.kick(nv / 3)
      }
      tiles = nt
      grid = r.grid
      score += r.gained
      movesN++
      hero = 1
      for (const v of grid) best = Math.max(best, v)
      env.sfx(r.maxMerged ? (r.maxMerged >= 6 ? 'boom' : 'point') : 'move')
      spawn()
      hud()
      if (best >= goal) {
        wonT = 1.8
        msg = chainMode ? 'Masterpiece!' : `${2 ** goal}!`
        msgT = 1.8
        for (let i = 0; i < 60; i++) fx.burst(W / 2, H / 2, t.blocks[i % t.blocks.length], 1, 380, 4)
      } else if (!canMove(grid, n)) {
        overT = 1.2
        msg = 'No moves left'
        msgT = 1.2
      }
    }

    const undo = () => {
      if (!prev || undos <= 0 || over || wonT > 0 || overT > 0) return
      undos--
      grid = prev.grid
      score = prev.score
      movesN = prev.movesN
      prev = null
      tiles = grid.map((v, i) => (v ? mkTile(v, i, 1) : null))
      ghosts = []
      env.sfx('power')
      hud()
    }

    bag.add(swipe(st.canvas, doMove))
    st.canvas.style.touchAction = 'none'
    const undoBox = portrait ? { x: W / 2 - 60, y: BY + BS + 24, w: 120, h: 44 } : { x: 506, y: 200, w: 112, h: 40 }
    bag.on(st.canvas, 'pointerdown', (e) => {
      const l = st.toLocal(e)
      if (l.x > undoBox.x && l.x < undoBox.x + undoBox.w && l.y > undoBox.y && l.y < undoBox.y + undoBox.h) undo()
    })
    k.onKey((e) => {
      const d = ({ ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', KeyA: 'left', KeyD: 'right', KeyW: 'up', KeyS: 'down' } as Record<string, Dir>)[e.code]
      if (d) doMove(d)
      else if (e.code === 'KeyU' || e.code === 'Backspace' || (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey))) undo()
    })

    const update = (dt: number) => {
      t0 += dt
      intro = Math.max(0, intro - dt)
      msgT = Math.max(0, msgT - dt)
      hero = Math.max(0, hero - dt * 3)
      fx.update(dt, 260)
      shake.update(dt)
      const e = Math.min(1, dt * 22)
      const step = (tl: Tile) => {
        tl.x += (tl.tx - tl.x) * e
        tl.y += (tl.ty - tl.y) * e
        if (tl.delay > 0) tl.delay -= dt
        else tl.scale += (1 - tl.scale) * Math.min(1, dt * 14)
      }
      for (const tl of tiles) if (tl) step(tl)
      for (const gh of ghosts) {
        step(gh)
        gh.dead -= dt
      }
      ghosts = ghosts.filter((gh) => gh.dead > 0)
      for (let i = pops.length - 1; i >= 0; i--) {
        pops[i].t += dt
        if (pops[i].t > 0.9) pops.splice(i, 1)
      }
      if (wonT > 0) {
        wonT -= dt
        if (wonT <= 0) finish(true)
      }
      if (overT > 0) {
        overT -= dt
        if (overT <= 0) finish(false)
      }
    }

    const drawTile = (tl: Tile, ghost = false) => {
      const c = cell()
      const px = BX + tl.x * c
      const py = BY + tl.y * c
      let sc = tl.scale
      if (!ghost && sc > 0.99) sc = 1
      if (tl.delay > 0 && !ghost) return
      const s = (c - 8) * sc
      if (s <= 1) return
      ctx.save()
      ctx.translate(px + c / 2, py + c / 2)
      if (tl.v >= 5) {
        ctx.shadowColor = tierCol(tl.v)
        ctx.shadowBlur = 6 + tl.v
      }
      roundRect(ctx, -s / 2, -s / 2, s, s, 10, tierCol(tl.v), 'rgba(255,255,255,0.45)', 2)
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.beginPath()
      ctx.roundRect(-s / 2 + 3, -s / 2 + 3, s - 6, s * 0.34, 7)
      ctx.fill()
      if (chainMode) {
        emoji(ctx, chain[(tl.v - 1) % chain.length], 0, 2, s * 0.62)
        text(ctx, `${tl.v}`, -s / 2 + 8, -s / 2 + 8, { size: 8, color: '#fff', shadow: '#000' })
      } else {
        const label2 = `${2 ** tl.v}`
        const size = label2.length >= 4 ? s * 0.26 : label2.length === 3 ? s * 0.32 : s * 0.4
        if (tl.v >= goal) emoji(ctx, t.hero, 0, -s * 0.12, s * 0.44)
        text(ctx, label2, 0, tl.v >= goal ? s * 0.28 : 2, { size, color: '#fff', shadow: 'rgba(0,0,0,0.7)' })
        if (tl.v >= 3 && tl.v < goal) emoji(ctx, t.items[(tl.v - 3) % t.items.length], s / 2 - 9, s / 2 - 9, s * 0.2)
      }
      ctx.restore()
    }

    const draw = () => {
      background(ctx, W, H, t, 35, 21)
      ctx.save()
      shake.apply(ctx)
      roundRect(ctx, BX - 8, BY - 8, BS + 16, BS + 16, 14, 'rgba(0,0,0,0.35)', 'rgba(255,255,255,0.2)', 2)
      const c = cell()
      for (let i = 0; i < n * n; i++) {
        const p = pos(i)
        roundRect(ctx, p.x + 4, p.y + 4, c - 8, c - 8, 9, 'rgba(255,255,255,0.08)')
      }
      for (const gh of ghosts) drawTile(gh, true)
      for (const tl of tiles) if (tl) drawTile(tl)
      fx.draw(ctx)
      for (const p of pops) text(ctx, p.s, p.x, p.y - p.t * 36, { size: 11, color: '#fff', shadow: '#000' })
      ctx.restore()
      if (portrait) {
        text(ctx, `SCORE ${score}`, 20, 26, { size: 12, color: t.fg, align: 'left' })
        text(ctx, `${movesN} moves`, W - 20, 26, { size: 9, color: t.fg, align: 'right' })
        text(ctx, 'BEST', 20, 66, { size: 9, color: t.accent, align: 'left' })
        if (best > 0) {
          if (chainMode) emoji(ctx, chain[(best - 1) % chain.length], 90, 66, 28)
          else text(ctx, `${2 ** best}`, 70, 66, { size: 12, color: t.fg, align: 'left' })
        }
        text(ctx, 'GOAL', W - 100, 66, { size: 9, color: t.accent, align: 'right' })
        if (chainMode) emoji(ctx, chain[(goal - 1) % chain.length], W - 60, 66, 28)
        else text(ctx, `${2 ** goal}`, W - 20, 66, { size: 12, color: t.accent2, align: 'right' })
      } else {
        text(ctx, 'SCORE', 78, 52, { size: 10, color: t.accent })
        text(ctx, `${score}`, 78, 82, { size: 18, color: t.fg })
        text(ctx, 'BEST', 78, 140, { size: 10, color: t.accent })
        if (best > 0) {
          if (chainMode) emoji(ctx, chain[(best - 1) % chain.length], 78, 176, 34)
          else text(ctx, `${2 ** best}`, 78, 172, { size: 18, color: t.fg })
        }
        text(ctx, 'GOAL', 78, 232, { size: 10, color: t.accent })
        if (chainMode) emoji(ctx, chain[(goal - 1) % chain.length], 78, 268, 34)
        else text(ctx, `${2 ** goal}`, 78, 266, { size: 18, color: t.accent2 })
        text(ctx, `${movesN} moves`, 78, 330, { size: 9, color: t.fg })
      }
      const can = !!prev && undos > 0
      roundRect(ctx, undoBox.x, undoBox.y, undoBox.w, undoBox.h, 10, can ? t.accent : 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.3)', 1.5)
      text(ctx, `UNDO x${undos}`, undoBox.x + undoBox.w / 2, undoBox.y + 20, { size: 10, color: can ? '#fff' : t.fg })
      emoji(ctx, t.hero, portrait ? W / 2 : 562, (portrait ? 540 : 300) - Math.sin(hero * Math.PI) * 18, 56)
      text(ctx, 'Swipe / arrows', portrait ? W / 2 : 562, portrait ? 600 : 352, { size: 8, color: t.fg })
      if (msgT > 0) {
        ctx.globalAlpha = Math.min(1, msgT * 2)
        text(ctx, msg, W / 2, H / 2, { size: 28, color: '#fff', shadow: t.accent })
        ctx.globalAlpha = 1
      }
      if (intro > 0) {
        ctx.globalAlpha = Math.min(1, intro)
        roundRect(ctx, W / 2 - 170, portrait ? 4 : 14, 340, 40, 12, 'rgba(0,0,0,0.78)', t.accent, 2)
        text(ctx, env.name, W / 2, portrait ? 24 : 34, { size: 12, color: '#fff' })
        ctx.globalAlpha = 1
      }
      void t0
    }

    const lp = loop(update, draw)
    return {
      destroy() {
        lp.stop()
        bag.dispose()
        k.dispose()
        st.dispose()
      },
      pause(p) {
        lp.pause(p)
      },
    }
  },
}
export default engine
