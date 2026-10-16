import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const s = `${game.name} ${game.desc}`.toLowerCase()
  const spot = game.mods.includes('spot') || /spot|difference|twin scenes/.test(s)
  const pool = [...t.items, ...t.foes]
  if (spot) {
    for (const x0 of [12, 168]) {
      roundRect(ctx, x0, 34, 140, 112, 8, 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.35)', 1.5)
    }
    for (let i = 0; i < 9; i++) {
      const e = r.pick(pool)
      const x = r.range(30, 130)
      const y = r.range(52, 130)
      const sz = r.range(16, 26)
      emoji(ctx, e, 12 + x - 12, y, sz)
      if (i !== 3) emoji(ctx, e, 168 + x - 12, y, sz)
    }
    ctx.strokeStyle = t.good
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(168 + 70, 90, 18, 0, 7)
    ctx.stroke()
    emoji(ctx, t.hero, w / 2, 160, 28)
    return
  }
  if (/simon|sequence|echo|tone|signal/.test(s)) {
    const c = 56
    for (let i = 0; i < 4; i++) {
      const x = w / 2 - c + (i % 2) * c
      const y = 20 + Math.floor(i / 2) * c
      ctx.globalAlpha = i === 1 ? 1 : 0.55
      ctx.shadowColor = t.blocks[i]
      ctx.shadowBlur = i === 1 ? 16 : 0
      roundRect(ctx, x + 2, y + 2, c - 4, c - 4, 10, t.blocks[i], '#fff', 2)
    }
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
    emoji(ctx, t.hero, w / 2, 150, 34)
    return
  }
  const cols = 5
  const rows = 3
  const cw = 44
  const x0 = (w - cols * cw) / 2
  const y0 = (h - rows * cw) / 2 - 6
  for (let i = 0; i < cols * rows; i++) {
    const x = x0 + (i % cols) * cw
    const y = y0 + Math.floor(i / cols) * cw
    const up = i % 3 === 0
    roundRect(ctx, x + 3, y + 3, cw - 6, cw - 6, 8, up ? '#fff' : t.blocks[i % t.blocks.length], 'rgba(255,255,255,0.5)', 1.5)
    if (up) emoji(ctx, pool[(i / 3) % pool.length | 0], x + cw / 2, y + cw / 2 + 1, 26)
    else {
      ctx.globalAlpha = 0.5
      emoji(ctx, t.hero, x + cw / 2, y + cw / 2, 18)
      ctx.globalAlpha = 1
    }
  }
  emoji(ctx, t.hero, w - 28, h - 24, 30)
}
export default draw
