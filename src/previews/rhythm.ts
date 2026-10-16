import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  background(ctx, w, h, t, 20, r.int(1, 1e6))
  const lw = 52
  const x0 = (w - lw * 4) / 2
  for (let l = 0; l < 4; l++) {
    ctx.fillStyle = l % 2 ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.09)'
    ctx.fillRect(x0 + l * lw, 0, lw, h)
  }
  const hy = h - 34
  ctx.shadowColor = t.accent
  ctx.shadowBlur = 10
  ctx.fillStyle = t.accent
  ctx.fillRect(x0, hy - 2, lw * 4, 4)
  ctx.shadowBlur = 0
  for (let i = 0; i < 9; i++) {
    const l = r.int(0, 3)
    const y = 14 + i * 16 + r.int(0, 6)
    if (y > hy - 12) continue
    ctx.shadowColor = t.blocks[l]
    ctx.shadowBlur = 8
    roundRect(ctx, x0 + l * lw + 5, y, lw - 10, 14, 5, t.blocks[l])
    ctx.shadowBlur = 0
  }
  for (let l = 0; l < 4; l++) {
    ctx.strokeStyle = t.blocks[l]
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(x0 + l * lw + lw / 2, hy + 18, 11, 0, 7)
    ctx.stroke()
  }
  emoji(ctx, t.hero, 46, h - 60, 54)
  ctx.fillStyle = '#fff'
  ctx.font = '700 22px system-ui'
  ctx.textAlign = 'center'
  ctx.fillText(`${r.int(5, 40)}x`, w - 36, 36)
}
export default draw
