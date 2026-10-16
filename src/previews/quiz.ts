import { background, emoji, roundRect, text } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  background(ctx, w, h, t, 20, r.int(1, 1e6))
  roundRect(ctx, 24, 14, w - 48, 62, 14, 'rgba(255,255,255,.1)', t.accent, 2)
  text(ctx, '?', w / 2, 46, { size: 34, color: t.accent, shadow: t.accent })
  emoji(ctx, t.hero, 50, 45, 34)
  emoji(ctx, r.pick(t.items), w - 50, 45, 30)
  const right = r.int(0, 3)
  for (let i = 0; i < 4; i++) {
    const x = 24 + (i % 2) * ((w - 56) / 2 + 8)
    const y = 88 + Math.floor(i / 2) * 42
    const bw = (w - 56) / 2
    roundRect(ctx, x, y, bw, 34, 10, i === right ? t.good : 'rgba(255,255,255,.12)', i === right ? t.good : t.blocks[i], 2)
    roundRect(ctx, x + 6, y + 6, 22, 22, 6, t.blocks[i])
    text(ctx, String(i + 1), x + 17, y + 18, { size: 11, color: '#fff' })
    roundRect(ctx, x + 36, y + 14, bw - 60 - r.int(0, 30), 6, 3, 'rgba(255,255,255,.5)')
  }
}
export default draw
