import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const polar = /orbit|circular/i.test(game.name) || game.mods.includes('rotate')
  if (polar) {
    const cx = w / 2
    const cy = h / 2
    for (let ring = 0; ring < 4; ring++)
      for (let s = 0; s < 18; s++) {
        if (r.chance(0.2)) continue
        const a0 = (s / 18) * Math.PI * 2 + 0.03
        const a1 = ((s + 1) / 18) * Math.PI * 2 - 0.03
        ctx.beginPath()
        ctx.arc(cx, cy, 36 + ring * 13 + 11, a0, a1)
        ctx.arc(cx, cy, 36 + ring * 13, a1, a0, true)
        ctx.fillStyle = t.blocks[ring % t.blocks.length]
        ctx.fill()
      }
    ctx.strokeStyle = t.accent
    ctx.lineWidth = 6
    ctx.shadowColor = t.accent
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.arc(cx, cy, 86, 0.9, 1.7)
    ctx.stroke()
    ctx.shadowBlur = 0
    emoji(ctx, t.hero, cx + Math.cos(1.3) * 72, cy + Math.sin(1.3) * 72, 22)
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(cx + 14, cy + 22, 4, 0, 7)
    ctx.fill()
    return
  }
  const bw = 24
  for (let row = 0; row < 5; row++)
    for (let c = 0; c < 12; c++) {
      if (r.chance(0.12)) continue
      roundRect(ctx, 10 + c * (bw + 2), 14 + row * 12, bw, 10, 3, t.blocks[row % t.blocks.length])
    }
  const px = r.range(100, 220)
  ctx.shadowColor = t.accent
  ctx.shadowBlur = 10
  roundRect(ctx, px - 30, h - 24, 60, 8, 4, t.accent)
  ctx.shadowBlur = 0
  emoji(ctx, t.hero, px, h - 36, 24)
  ctx.fillStyle = '#fff'
  ctx.shadowColor = '#fff'
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.arc(r.range(60, 260), r.range(90, 120), 4, 0, 7)
  ctx.fill()
  ctx.shadowBlur = 0
}
export default draw
