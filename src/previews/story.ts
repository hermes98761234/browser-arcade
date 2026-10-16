import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  background(ctx, w, h, t, 40, r.int(1, 1e6))
  // glow
  const g = ctx.createRadialGradient(w / 2, h * 0.55, 10, w / 2, h * 0.55, w * 0.6)
  g.addColorStop(0, t.accent + '55')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  // open book
  const bx = w * 0.12
  const by = h * 0.3
  const bw = w * 0.76
  const bh = h * 0.62
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 14
  roundRect(ctx, bx, by, bw, bh, 8, '#f3e7c9')
  ctx.restore()
  ctx.fillStyle = '#e4d3a8'
  ctx.fillRect(w / 2 - 1.5, by, 3, bh)
  ctx.fillStyle = '#7a6440'
  for (let p = 0; p < 2; p++) {
    for (let i = 0; i < 7; i++) {
      const lw = bw / 2 - 28 - (i === 6 ? r.int(20, 50) : 0)
      ctx.globalAlpha = 0.55
      ctx.fillRect(bx + 14 + p * (bw / 2), by + 40 + i * 11, lw, 2.5)
    }
  }
  ctx.globalAlpha = 1
  // illustration on left page
  roundRect(ctx, bx + 12, by + 10, bw / 2 - 24, 22, 4, t.bg2)
  emoji(ctx, r.pick(t.items), bx + bw / 4, by + 21, 20)
  // hero stepping out of the book
  emoji(ctx, t.hero, w / 2, by - 6, 54)
  emoji(ctx, r.pick(t.foes), w * 0.86, h * 0.2, 26, 0.2)
  emoji(ctx, r.pick(t.items), w * 0.13, h * 0.2, 24, -0.2)
  // choice chip
  roundRect(ctx, bx + bw / 2 + 14, by + bh - 34, bw / 2 - 28, 12, 6, t.accent + 'cc')
}
export default draw
