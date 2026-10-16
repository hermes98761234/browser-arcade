import { background, emoji } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  background(ctx, w, h, t, 40, r.int(1, 1e6))
  const cx = w / 2 + r.int(-30, 30)
  const cy = h / 2 + r.int(-10, 10)
  for (const [k, rad] of [[0, 52], [1, 30]] as const) {
    const x = cx + k * r.int(-60, 60)
    const y = cy + k * r.int(-30, 30)
    const col = k ? t.accent2 : t.accent
    const g = ctx.createRadialGradient(x, y, 4, x, y, rad)
    g.addColorStop(0, '#ffffffcc')
    g.addColorStop(0.4, col + 'aa')
    g.addColorStop(1, col + '22')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, rad, 0, 7)
    ctx.fill()
    ctx.strokeStyle = col
    ctx.lineWidth = 2.5
    ctx.shadowColor = col
    ctx.shadowBlur = 10
    ctx.stroke()
    ctx.shadowBlur = 0
  }
  emoji(ctx, t.hero, cx, cy, 34)
  for (let i = 0; i < 16; i++) {
    const x = r.range(16, w - 16)
    const y = r.range(16, h - 16)
    ctx.fillStyle = t.blocks[i % t.blocks.length]
    ctx.globalAlpha = 0.25
    ctx.beginPath()
    ctx.arc(x, y, 14, 0, 7)
    ctx.fill()
    ctx.globalAlpha = 1
    emoji(ctx, t.items[i % t.items.length], x, y, 18)
  }
}
export default draw
