import { emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  // wall + floor
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, t.bg2)
  g.addColorStop(0.64, t.bg)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.fillRect(0, h * 0.64, w, h * 0.36)
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, h * 0.64)
  ctx.lineTo(w, h * 0.64)
  ctx.stroke()
  const l = ctx.createRadialGradient(w / 2, 0, 5, w / 2, 0, h)
  l.addColorStop(0, 'rgba(255,240,200,0.3)')
  l.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = l
  ctx.fillRect(0, 0, w, h)
  // door with a keypad
  roundRect(ctx, w * 0.06, h * 0.12, w * 0.2, h * 0.62, 6, '#5b3a1e', '#2d1b0c', 3)
  roundRect(ctx, w * 0.1, h * 0.38, w * 0.12, h * 0.16, 3, '#111', t.accent, 1.5)
  ctx.fillStyle = t.good
  ctx.font = '700 9px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`${r.int(1, 9)} ${r.int(1, 9)} ${r.int(1, 9)}`, w * 0.16, h * 0.475)
  // hotspots
  const spots = [[0.4, 0.3], [0.62, 0.28], [0.82, 0.32], [0.5, 0.55], [0.76, 0.58]]
  for (const [x, y] of spots) {
    ctx.shadowColor = t.accent
    ctx.shadowBlur = 10
    emoji(ctx, r.pick(t.items), w * x, h * y, 28)
  }
  ctx.shadowBlur = 0
  emoji(ctx, '🔑', w * 0.34, h * 0.8, 24, -0.4)
  emoji(ctx, t.hero, w * 0.55, h * 0.84, 44)
  // timer chip
  roundRect(ctx, w - 66, 8, 58, 20, 10, 'rgba(0,0,0,0.5)')
  ctx.fillStyle = '#fff'
  ctx.fillText('⏱ 7:42', w - 37, 22)
  // bag
  roundRect(ctx, 0, h - 24, w, 24, 0, 'rgba(0,0,0,0.5)')
  emoji(ctx, '🗝️', 20, h - 12, 15)
  emoji(ctx, '📝', 44, h - 12, 15)
}
export default draw
