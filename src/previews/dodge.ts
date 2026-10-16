import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'
import { detectMode } from '../engines/logic/dodge'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 30, r.int(1, 1e6))
  const { mode, free } = detectMode(game.name, game.desc, new Set(game.mods))
  if (mode === 'zone' || mode === 'rings') {
    ctx.strokeStyle = mode === 'zone' ? t.accent : t.danger
    ctx.lineWidth = mode === 'zone' ? 3 : 8
    ctx.shadowColor = ctx.strokeStyle
    ctx.shadowBlur = 10
    for (const rad of mode === 'zone' ? [62] : [30, 62, 96]) {
      ctx.globalAlpha = mode === 'zone' ? 1 : 1 - rad / 130
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, rad, 0, 7)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  }
  if (mode === 'laser') {
    ctx.strokeStyle = '#fff'
    ctx.shadowColor = t.danger
    ctx.shadowBlur = 14
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(0, r.range(40, 140))
    ctx.lineTo(w, r.range(40, 140) )
    ctx.stroke()
    ctx.shadowBlur = 0
  }
  const good = mode === 'catch'
  for (let i = 0; i < 12; i++) emoji(ctx, good && i % 3 ? r.pick(t.items) : r.pick(t.foes), r.range(15, w - 15), r.range(15, h - 60), r.range(16, 24), r.range(-0.6, 0.6))
  const px = r.range(100, 220)
  if (!free) {
    ctx.strokeStyle = t.accent2
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(px, h - 34, 32, 0.15 * Math.PI, 0.85 * Math.PI)
    ctx.stroke()
    roundRect(ctx, 0, h - 16, w, 16, 0, 'rgba(255,255,255,.08)')
    emoji(ctx, t.hero, px, h - 40, 30)
  } else emoji(ctx, t.hero, w / 2, h / 2 + 8, 34)
}
export default draw
