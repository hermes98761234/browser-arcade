import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const c = 16
  ctx.globalAlpha = 0.06
  ctx.strokeStyle = t.fg
  for (let x = 0; x < w; x += c) ctx.strokeRect(x, 0, c, h)
  for (let y = 0; y < h; y += c) ctx.strokeRect(0, y, w, c)
  ctx.globalAlpha = 1
  // A winding snake path.
  let x = r.int(3, 6)
  let y = r.int(3, 7)
  const body: [number, number][] = []
  let dx = 1
  let dy = 0
  for (let i = 0; i < 26; i++) {
    body.push([x, y])
    if (r.chance(0.25)) [dx, dy] = dy === 0 ? [0, r.chance(0.5) ? 1 : -1] : [r.chance(0.5) ? 1 : -1, 0]
    if (x + dx < 1 || x + dx > 18 || y + dy < 1 || y + dy > 9) [dx, dy] = [-dy || 1, dx]
    x += dx
    y += dy
  }
  ctx.shadowColor = t.accent
  ctx.shadowBlur = 10
  body.forEach(([bx, by], i) => {
    ctx.globalAlpha = 0.5 + (i / body.length) * 0.5
    roundRect(ctx, bx * c + 2, by * c + 2, c - 4, c - 4, 4, t.accent)
  })
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0
  for (let i = 0; i < 3; i++) emoji(ctx, r.pick(t.items), r.int(2, 18) * c + c / 2, r.int(1, 9) * c + c / 2, 14)
}
export default draw
