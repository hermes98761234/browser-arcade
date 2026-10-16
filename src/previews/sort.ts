import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, g) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const water = /water|liquid|pour|potion|juice|spice|ink|fill/i.test(`${g.name} ${g.desc}`)
  const n = 7
  const tw = 30
  const bs = 24
  const gap = (w - 20 - n * tw) / (n - 1)
  const cols = r.shuffle([0, 1, 2, 3, 4, 5, 6].map((i) => i % t.blocks.length))
  for (let i = 0; i < n; i++) {
    const x = 10 + i * (tw + gap)
    const y = 34
    roundRect(ctx, x, y, tw, 4 * bs + 12, 12, 'rgba(255,255,255,.07)', 'rgba(255,255,255,.4)', 2)
    const count = i < 5 ? 4 : 0
    for (let j = 0; j < count; j++) {
      const ci = (i < 3 ? cols[i] : cols[r.int(0, 4)])
      const cy = y + 4 * bs + 6 - bs * (j + 0.5)
      ctx.fillStyle = t.blocks[ci]
      if (water) ctx.fillRect(x + 4, cy - bs / 2, tw - 8, bs)
      else {
        ctx.beginPath()
        ctx.arc(x + tw / 2, cy, bs / 2 - 2, 0, 7)
        ctx.fill()
        emoji(ctx, t.items[ci % t.items.length], x + tw / 2, cy + 1, 13)
      }
    }
  }
  emoji(ctx, t.hero, 32, 20, 26)
}
export default draw
