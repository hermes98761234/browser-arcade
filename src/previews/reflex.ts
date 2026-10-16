import { background, emoji, roundRect } from '../engines/kit'
import { detectReflex } from '../engines/logic/reflex'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const mode = detectReflex(game.name, game.desc)
  const cx = w / 2
  const cy = h / 2
  if (mode === 'whack') {
    for (let row = 0; row < 2; row++)
      for (let c = 0; c < 4; c++) {
        const x = 55 + c * 70
        const y = 80 + row * 60
        ctx.fillStyle = 'rgba(0,0,0,.45)'
        ctx.beginPath()
        ctx.ellipse(x, y + 6, 26, 10, 0, 0, 7)
        ctx.fill()
        if (r.chance(0.55)) emoji(ctx, r.pick(t.foes), x, y - 8, 34)
      }
    emoji(ctx, '🔨', cx + 30, cy - 10, 40, -0.8)
  } else if (mode === 'bar') {
    roundRect(ctx, 30, cy - 14, w - 60, 28, 14, 'rgba(0,0,0,.4)', t.accent, 3)
    roundRect(ctx, cx - 28, cy - 14, 56, 28, 8, t.good)
    emoji(ctx, t.hero, r.range(70, w - 70), cy, 36)
  } else if (mode === 'aim') {
    for (let i = 0; i < 6; i++) {
      const x = r.range(30, w - 30)
      const y = r.range(30, h - 30)
      ctx.strokeStyle = t.accent
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, 18, 0, 7)
      ctx.stroke()
      ctx.fillStyle = t.accent2
      ctx.globalAlpha = 0.4
      ctx.fill()
      ctx.globalAlpha = 1
      emoji(ctx, r.pick(t.items), x, y, 22)
    }
  } else if (mode === 'react') {
    ctx.fillStyle = '#22c55e'
    ctx.globalAlpha = 0.8
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = 1
    emoji(ctx, t.hero, cx, cy, 70)
  } else {
    ctx.shadowColor = t.accent
    ctx.shadowBlur = 10
    ctx.strokeStyle = t.fg
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(cx, cy, 34, 0, 7)
    ctx.stroke()
    ctx.strokeStyle = t.accent2
    for (const rr of [56, 78, 100]) {
      ctx.globalAlpha = 1 - (rr - 34) / 90
      ctx.beginPath()
      ctx.arc(cx, cy, rr, 0, 7)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
    emoji(ctx, t.hero, cx, cy, 40)
  }
}
export default draw
