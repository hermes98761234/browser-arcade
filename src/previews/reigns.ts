import { background, emoji, roundRect, text } from '../engines/kit'
import { pickFlavor } from '../engines/logic/reignsDeck'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const f = pickFlavor(`${game.name} ${game.desc}`, t.id)
  f.meters.forEach(([, icon], i) => {
    const x = 70 + i * 60
    roundRect(ctx, x - 20, 8, 40, 40, 10, 'rgba(255,255,255,.1)', 'rgba(255,255,255,.35)')
    const lv = r.range(0.25, 0.85)
    ctx.fillStyle = t.accent
    ctx.globalAlpha = 0.5
    ctx.fillRect(x - 18, 46 - 36 * lv, 36, 36 * lv)
    ctx.globalAlpha = 1
    emoji(ctx, icon, x, 28, 22)
  })
  // ghost card + tilted main card
  ctx.save()
  ctx.translate(w / 2 + 6, 112)
  ctx.rotate(0.05)
  roundRect(ctx, -70, -50, 140, 112, 12, 'rgba(255,255,255,.12)')
  ctx.restore()
  ctx.save()
  ctx.translate(w / 2 - 6, 110)
  ctx.rotate(-0.1)
  roundRect(ctx, -72, -56, 144, 116, 12, t.bg2, t.accent, 2.5)
  emoji(ctx, r.pick(t.heroes), 0, -22, 44)
  ctx.fillStyle = 'rgba(255,255,255,.5)'
  ctx.fillRect(-48, 12, 96, 4)
  ctx.fillRect(-40, 22, 80, 4)
  ctx.fillRect(-34, 32, 68, 4)
  roundRect(ctx, -68, -52, 56, 18, 6, t.accent)
  ctx.restore()
  text(ctx, '◀', 22, 120, { size: 18, color: t.fg })
  text(ctx, '▶', w - 22, 120, { size: 18, color: t.fg })
  emoji(ctx, t.hero, 24, 160, 18)
  text(ctx, 'Year 12', 52, 160, { size: 9, color: t.fg, align: 'left' })
}
export default draw
