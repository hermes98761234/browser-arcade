import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 30, r.int(1, 1e6))
  if (game.mods.includes('lander') || /lander|rocket burn/i.test(game.name)) {
    ctx.beginPath()
    ctx.moveTo(0, h)
    let y = h * 0.8
    const pad = r.int(10, 24)
    for (let i = 0; i <= 32; i++) {
      if (i < pad || i > pad + 6) y = Math.min(h - 14, Math.max(h * 0.6, y + r.range(-8, 8)))
      ctx.lineTo(i * 10, y)
    }
    ctx.lineTo(w, h)
    ctx.fillStyle = t.bg2
    ctx.fill()
    ctx.strokeStyle = t.fg
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = t.good
    ctx.fillRect(pad * 10, y - 3, 60, 4)
    ctx.save()
    ctx.translate(pad * 10 + 70, h * 0.4)
    ctx.rotate(0.3)
    emoji(ctx, t.hero, 0, 0, 30)
    ctx.restore()
    return
  }
  for (let i = 0; i < 3; i++) {
    const x = 80 + i * 90
    const gy = r.range(70, 110)
    const col = t.blocks[i % t.blocks.length]
    roundRect(ctx, x - 18, -10, 36, gy - 30 + 10, 6, col)
    roundRect(ctx, x - 18, gy + 30, 36, h - gy - 30, 6, col)
    emoji(ctx, t.foes[i % t.foes.length], x, gy - 38, 22, Math.PI)
    emoji(ctx, t.foes[i % t.foes.length], x, gy + 40, 22)
  }
  ctx.fillStyle = t.bg2
  ctx.fillRect(0, h - 14, w, 14)
  ctx.shadowColor = t.accent
  ctx.shadowBlur = 10
  emoji(ctx, t.hero, 50, h / 2 - 4, 32, -0.3)
  ctx.shadowBlur = 0
}
export default draw
