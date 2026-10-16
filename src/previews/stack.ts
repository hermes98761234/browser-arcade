import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, g) => {
  background(ctx, w, h, t, 30, r.int(1, 1e6))
  const phys = /balanc|jenga|\bpile\b|cairn|tipping|pull|seesaw|jelly|totem|plank/i.test(`${g.name} ${g.desc}`)
  const floor = h - 18
  ctx.fillStyle = 'rgba(0,0,0,.35)'
  ctx.fillRect(0, floor, w, 18)
  let cx = w / 2
  let ww = 120
  const n = 8
  for (let i = 0; i < n; i++) {
    const bh = phys ? r.int(18, 30) : 17
    const y = floor - (i + 1) * (phys ? 24 : 18)
    ww = phys ? r.int(40, 100) : Math.max(60, ww - r.int(0, 8))
    cx += phys ? r.int(-14, 14) : r.int(-6, 6)
    const col = t.blocks[i % t.blocks.length]
    roundRect(ctx, cx - ww / 2, y, ww, bh, 4, col, 'rgba(0,0,0,.35)', 1.5)
    ctx.fillStyle = 'rgba(255,255,255,.25)'
    ctx.fillRect(cx - ww / 2 + 3, y + 3, ww - 6, 3)
    if (i % 2 === 0) emoji(ctx, t.items[i % t.items.length], cx, y + bh / 2, 15)
  }
  emoji(ctx, t.hero, cx + 40, 22, 30)
  ctx.strokeStyle = 'rgba(255,255,255,.4)'
  ctx.beginPath()
  ctx.moveTo(cx + 40, 36)
  ctx.lineTo(cx + 40, 50)
  ctx.stroke()
  roundRect(ctx, cx + 40 - 22, 50, 44, 18, 4, t.accent)
}
export default draw
