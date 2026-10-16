import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  background(ctx, w, h, t, 20, r.int(1, 1e6))
  const rows = 8
  const cols = 16
  const cw = (w - 40) / cols
  const rh = (h - 44) / rows
  const play = r.int(3, 12)
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const on = r.chance(0.2)
      const col = t.blocks[y % t.blocks.length]
      if (on) {
        ctx.shadowColor = col
        ctx.shadowBlur = x === play ? 12 : 5
      }
      roundRect(ctx, 20 + x * cw + 1.5, 30 + y * rh + 1.5, cw - 3, rh - 3, 3, on ? col : 'rgba(255,255,255,.08)')
      ctx.shadowBlur = 0
    }
  ctx.fillStyle = 'rgba(255,255,255,.22)'
  ctx.fillRect(20 + play * cw, 24, cw, h - 30)
  emoji(ctx, t.hero, 34, 14, 22)
}
export default draw
