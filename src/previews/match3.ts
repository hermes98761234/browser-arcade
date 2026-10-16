import { background, emoji, roundRect } from '../engines/kit'
import { genBoard } from '../engines/logic/match3'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const n = 7
  const c = 23
  const bx = (w - n * c) / 2
  const by = (h - n * c) / 2
  roundRect(ctx, bx - 6, by - 6, n * c + 12, n * c + 12, 10, 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.2)', 1.5)
  const g = genBoard(r, 8, 5)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const cell = g[y * 8 + x]
      const px = bx + x * c
      const py = by + y * c
      roundRect(ctx, px + 1.5, py + 1.5, c - 3, c - 3, 5, t.blocks[cell.k % t.blocks.length])
      emoji(ctx, t.items[cell.k % t.items.length], px + c / 2, py + c / 2 + 0.5, 13)
    }
  }
  // a glowing special piece and the hero cheering
  const sx = bx + 3 * c
  const sy = by + 3 * c
  ctx.strokeStyle = '#fff'
  ctx.shadowColor = '#fff'
  ctx.shadowBlur = 8
  ctx.lineWidth = 2
  ctx.strokeRect(sx + 1, sy + 1, c - 2, c - 2)
  ctx.shadowBlur = 0
  emoji(ctx, '💥', sx + c - 4, sy + 4, 10)
  emoji(ctx, t.hero, 38, h - 38, 40)
  emoji(ctx, '✨', w - 36, 36, 24)
}
export default draw
