import { background, emoji, roundRect, text } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const n = 4
  const c = 38
  const bx = (w - n * c) / 2
  const by = (h - n * c) / 2
  roundRect(ctx, bx - 5, by - 5, n * c + 10, n * c + 10, 10, 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.2)', 1.5)
  const chain = /alchemy|craft|merge|fusion|fluff|moon/i.test(`${game.name} ${game.desc}`)
  for (let i = 0; i < 16; i++) {
    const px = bx + (i % n) * c
    const py = by + Math.floor(i / n) * c
    roundRect(ctx, px + 2, py + 2, c - 4, c - 4, 6, 'rgba(255,255,255,0.08)')
    if (r.chance(0.35)) continue
    const v = r.int(1, 7)
    roundRect(ctx, px + 2, py + 2, c - 4, c - 4, 6, t.blocks[(v - 1) % t.blocks.length], 'rgba(255,255,255,0.4)', 1)
    if (chain) emoji(ctx, v > 6 ? t.hero : t.items[v - 1], px + c / 2, py + c / 2 + 1, 22)
    else text(ctx, `${2 ** v}`, px + c / 2, py + c / 2 + 1, { size: v > 6 ? 10 : 13, color: '#fff', shadow: '#000' })
  }
  emoji(ctx, t.hero, 40, h - 40, 40)
}
export default draw
