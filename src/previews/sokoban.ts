import { background, emoji, roundRect } from '../engines/kit'
import { genSokoban } from '../engines/logic/sokoban'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const lv = genSokoban(r, { w: 11, h: 8, boxes: 4 })
  const cs = 19
  const ox = (w - lv.w * cs) / 2
  const oy = (h - lv.h * cs) / 2
  for (let y = 0; y < lv.h; y++) for (let x = 0; x < lv.w; x++) {
    const i = y * lv.w + x
    if (lv.wall[i]) roundRect(ctx, ox + x * cs + 1, oy + y * cs + 1, cs - 2, cs - 2, 3, t.blocks[0], 'rgba(255,255,255,.15)', 1)
    else {
      ctx.fillStyle = (x + y) & 1 ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.03)'
      ctx.fillRect(ox + x * cs, oy + y * cs, cs, cs)
    }
  }
  for (const g of lv.goals) {
    ctx.strokeStyle = t.accent2
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(ox + (g % lv.w + 0.5) * cs, oy + (((g / lv.w) | 0) + 0.5) * cs, cs * 0.32, 0, 7)
    ctx.stroke()
  }
  lv.boxes.forEach((b, i) => {
    const x = ox + (b % lv.w + 0.5) * cs
    const y = oy + (((b / lv.w) | 0) + 0.5) * cs
    roundRect(ctx, x - cs * 0.42, y - cs * 0.42, cs * 0.84, cs * 0.84, 4, lv.goals.includes(b) ? t.good : t.blocks[(i + 1) % t.blocks.length], 'rgba(0,0,0,.4)', 1.5)
    emoji(ctx, t.items[i % t.items.length], x, y, 11)
  })
  emoji(ctx, t.hero, ox + (lv.player % lv.w + 0.5) * cs, oy + (((lv.player / lv.w) | 0) + 0.5) * cs, 18)
}
export default draw
