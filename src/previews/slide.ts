import { background, emoji, roundRect } from '../engines/kit'
import { genPipes, N_, E_, S_, W_, powered } from '../engines/logic/slide'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const s = `${game.name} ${game.desc}`.toLowerCase()
  const pipes = game.mods.some((m) => m === 'rotate' || m === 'pipe') && !/turnstile|swirl|roller|jigsaw/.test(s)
  if (pipes) {
    const n = 6
    const c = 26
    const bx = (w - n * c) / 2
    const by = (h - n * c) / 2
    const p = genPipes(n, r)
    const dist = powered(p.masks, n, p.src)
    for (let i = 0; i < n * n; i++) {
      const px = bx + (i % n) * c
      const py = by + Math.floor(i / n) * c
      roundRect(ctx, px + 1, py + 1, c - 2, c - 2, 5, 'rgba(0,0,0,0.3)')
      const lit = dist[i] >= 0 && dist[i] < 7
      ctx.strokeStyle = lit ? t.accent : '#7b8794'
      ctx.lineWidth = 6
      ctx.lineCap = 'round'
      ctx.shadowColor = lit ? t.accent : 'transparent'
      ctx.shadowBlur = lit ? 8 : 0
      ctx.beginPath()
      for (const [bit, dx, dy] of [[N_, 0, -1], [E_, 1, 0], [S_, 0, 1], [W_, -1, 0]] as const) {
        if (p.masks[i] & bit) {
          ctx.moveTo(px + c / 2, py + c / 2)
          ctx.lineTo(px + c / 2 + (dx * c) / 2, py + c / 2 + (dy * c) / 2)
        }
      }
      ctx.stroke()
      ctx.shadowBlur = 0
    }
    const sx = bx + (p.src % n) * c + c / 2
    const sy = by + Math.floor(p.src / n) * c + c / 2
    ctx.fillStyle = t.accent2
    ctx.beginPath()
    ctx.arc(sx, sy, 10, 0, 7)
    ctx.fill()
    emoji(ctx, t.hero, sx, sy, 15)
    for (let i = 0; i < 4; i++) emoji(ctx, r.pick(t.items), bx + r.int(0, n - 1) * c + c / 2, by + r.int(0, n - 1) * c + c / 2, 13)
    return
  }
  const n = 4
  const c = 36
  const bx = (w - n * c) / 2
  const by = (h - n * c) / 2
  roundRect(ctx, bx - 5, by - 5, n * c + 10, n * c + 10, 10, 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.2)', 1.5)
  const picture = /snap|photo|jigsaw|picture|image|roller/.test(s)
  const ids = r.shuffle(Array.from({ length: 15 }, (_, i) => i))
  for (let i = 0; i < 16; i++) {
    const px = bx + (i % n) * c
    const py = by + Math.floor(i / n) * c
    if (i === 10) {
      emoji(ctx, t.hero, px + c / 2, py + c / 2, 24)
      continue
    }
    const id = ids[i > 10 ? i - 1 : i]
    roundRect(ctx, px + 2, py + 2, c - 4, c - 4, 6, t.blocks[(id % 4 + Math.floor(id / 4)) % t.blocks.length], 'rgba(255,255,255,0.35)', 1)
    if (picture) emoji(ctx, t.items[id % t.items.length], px + c / 2, py + c / 2, 20)
    else {
      ctx.fillStyle = '#fff'
      ctx.font = '700 15px "Press Start 2P", monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${id + 1}`, px + c / 2, py + c / 2 + 1)
    }
  }
}
export default draw
