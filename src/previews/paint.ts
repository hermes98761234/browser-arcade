import { background, emoji } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  background(ctx, w, h, t, 20, r.int(1, 1e6))
  // symmetric flower-like strokes
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.lineCap = 'round'
  const n = r.pick([6, 8])
  const pts: [number, number][] = []
  for (let i = 0; i < 5; i++) pts.push([r.range(20, 120), r.range(-40, 40)])
  for (let k = 0; k < n; k++) {
    ctx.save()
    ctx.rotate((k * Math.PI * 2) / n)
    ctx.strokeStyle = t.blocks[k % t.blocks.length]
    ctx.shadowColor = ctx.strokeStyle
    ctx.shadowBlur = 8
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(10, 0)
    for (const [x, y] of pts) ctx.quadraticCurveTo(x, y * 1.2, x + 4, y)
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
  // palette strip
  t.blocks.slice(0, 7).forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(16 + i * 20, h - 14, 7, 0, 7)
    ctx.fill()
  })
  emoji(ctx, t.hero, w - 36, 36, 34)
}
export default draw
