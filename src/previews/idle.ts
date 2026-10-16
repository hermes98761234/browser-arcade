import { background, emoji, roundRect, text } from '../engines/kit'
import { fmt, pickFlavor } from '../engines/logic/idle'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 20, r.int(1, 1e6))
  const f = pickFlavor(`${game.name} ${game.desc}`)
  roundRect(ctx, 8, 8, w - 16, 30, 8, 'rgba(0,0,0,.4)')
  text(ctx, `${fmt(r.range(2e3, 9e6))} ${f.unit}`, 20, 24, { size: 11, color: t.accent, align: 'left' })
  roundRect(ctx, w - 110, 18, 90, 8, 4, 'rgba(255,255,255,.2)')
  roundRect(ctx, w - 110, 18, 30 + r.int(10, 50), 8, 4, t.accent)
  // big click button
  const cx = 78
  const cy = 108
  ctx.shadowColor = t.accent
  ctx.shadowBlur = 22
  ctx.fillStyle = 'rgba(255,255,255,.12)'
  ctx.beginPath(); ctx.arc(cx, cy, 52, 0, 7); ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = t.accent
  ctx.lineWidth = 3
  ctx.stroke()
  emoji(ctx, t.hero, cx, cy, 64)
  for (let i = 0; i < 5; i++) emoji(ctx, f.coin, cx + r.range(-50, 50), cy - 60 - r.range(0, 30), r.int(12, 18), r.range(-0.4, 0.4))
  // producers list
  f.prod.slice(0, 5).forEach(([, e], i) => {
    const y = 48 + i * 25
    roundRect(ctx, 150, y, w - 160, 21, 7, 'rgba(255,255,255,.1)')
    emoji(ctx, e, 164, y + 11, 15)
    roundRect(ctx, 182, y + 7, 60 + r.int(0, 60), 6, 3, i < 3 ? t.good : 'rgba(255,255,255,.25)')
    text(ctx, String(r.int(1, 30) * (5 - i)), w - 24, y + 11, { size: 9, color: t.fg, align: 'right' })
  })
}
export default draw
