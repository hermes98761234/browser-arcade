import { background, emoji, roundRect } from '../engines/kit'
import { genFlow, genMaze, solvePath } from '../engines/logic/maze'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, g) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const label = `${g.name} ${g.desc}`
  const flow = !g.mods.includes('tilt') && !/maze/i.test(g.name) && /\b(lines?|paths?|connect|routes?|wires?|rails?|trails?|threads?|yarn|strings?|pipes?|link|dash)\b/i.test(label)
  if (flow) {
    const n = 6
    const f = genFlow(n, n, 4, r)
    const cs = 26
    const ox = (w - n * cs) / 2
    const oy = (h - n * cs) / 2
    roundRect(ctx, ox - 6, oy - 6, n * cs + 12, n * cs + 12, 8, 'rgba(0,0,0,.4)', t.accent2, 1.5)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = cs * 0.36
    f.solution.forEach((p, i) => {
      ctx.strokeStyle = t.blocks[i % t.blocks.length]
      ctx.shadowColor = ctx.strokeStyle
      ctx.shadowBlur = 8
      ctx.beginPath()
      p.forEach((c, j) => {
        const x = ox + (c % n + 0.5) * cs
        const y = oy + (((c / n) | 0) + 0.5) * cs
        if (j) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      })
      ctx.stroke()
    })
    ctx.shadowBlur = 0
    f.pairs.forEach((pr, i) => {
      for (const c of [pr.a, pr.b]) {
        ctx.fillStyle = t.blocks[i % t.blocks.length]
        ctx.beginPath()
        ctx.arc(ox + (c % n + 0.5) * cs, oy + (((c / n) | 0) + 0.5) * cs, cs * 0.34, 0, 7)
        ctx.fill()
      }
    })
    emoji(ctx, t.hero, ox + (f.pairs[0].a % n + 0.5) * cs, oy + (((f.pairs[0].a / n) | 0) + 0.5) * cs, 18)
    return
  }
  const mw = 16
  const mh = 9
  const m = genMaze(mw, mh, r)
  const cs = 17
  const ox = (w - mw * cs) / 2
  const oy = (h - mh * cs) / 2
  ctx.strokeStyle = t.accent
  ctx.shadowColor = t.accent
  ctx.shadowBlur = 6
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
    const v = m.walls[y * mw + x]
    const x0 = ox + x * cs
    const y0 = oy + y * cs
    if (y === 0 && v & 1) { ctx.moveTo(x0, y0); ctx.lineTo(x0 + cs, y0) }
    if (x === 0 && v & 8) { ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + cs) }
    if (v & 2) { ctx.moveTo(x0 + cs, y0); ctx.lineTo(x0 + cs, y0 + cs) }
    if (v & 4) { ctx.moveTo(x0, y0 + cs); ctx.lineTo(x0 + cs, y0 + cs) }
  }
  ctx.stroke()
  ctx.shadowBlur = 0
  const path = solvePath(m, 0, mw * mh - 1)
  ctx.strokeStyle = t.good
  ctx.globalAlpha = 0.35
  ctx.lineWidth = 4
  ctx.beginPath()
  const upto = Math.floor(path.length * 0.55)
  path.slice(0, upto).forEach((c, i) => {
    const x = ox + (c % mw + 0.5) * cs
    const y = oy + (((c / mw) | 0) + 0.5) * cs
    if (i) ctx.lineTo(x, y)
    else ctx.moveTo(x, y)
  })
  ctx.stroke()
  ctx.globalAlpha = 1
  const hc = path[upto]
  emoji(ctx, t.hero, ox + (hc % mw + 0.5) * cs, oy + (((hc / mw) | 0) + 0.5) * cs, 18)
  emoji(ctx, '🏁', ox + (mw - 0.5) * cs, oy + (mh - 0.5) * cs, 15)
  for (let i = 0; i < 3; i++) emoji(ctx, r.pick(t.items), ox + (r.int(1, mw - 1) + 0.5) * cs, oy + (r.int(0, mh - 1) + 0.5) * cs, 13)
  if (g.mods.includes('tilt')) emoji(ctx, t.foes[0], ox + (r.int(4, mw - 2) + 0.5) * cs, oy + (r.int(1, mh - 2) + 0.5) * cs, 14)
}
export default draw
