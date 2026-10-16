import { background, emoji } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 40, r.int(1, 1e6))
  const cx = w / 2
  const cy = h * 0.46
  const space = t.id === 'space' || /space|asteroid|orbit/.test(game.name.toLowerCase())
  // tunnel frames / canyon lines converging to the vanishing point
  ctx.strokeStyle = t.accent
  ctx.globalAlpha = 0.5
  ctx.lineWidth = 1
  if (!space) {
    for (let i = 1; i < 9; i++) {
      const s = Math.pow(i / 9, 2.2)
      const fw = w * 0.9 * s + 6
      const fh = h * 0.8 * s + 4
      ctx.strokeRect(cx - fw / 2, cy - fh / 2, fw, fh)
    }
    ctx.beginPath()
    for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h]]) {
      ctx.moveTo(cx, cy)
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  // rings along a winding path
  const ph = r.range(0, 6)
  for (let i = 7; i >= 0; i--) {
    const s = Math.pow((i + 1) / 8, 2)
    const x = cx + Math.sin(i * 0.8 + ph) * 60 * s
    const y = cy + Math.cos(i * 0.7 + ph) * 22 * s
    const rr = 6 + s * 52
    ctx.strokeStyle = t.accent2
    ctx.shadowColor = t.accent2
    ctx.shadowBlur = 10
    ctx.lineWidth = 1 + s * 5
    ctx.beginPath()
    ctx.ellipse(x, y, rr, rr, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0
    if (i === 3 || i === 6) emoji(ctx, r.pick(t.foes), x + rr * 1.6, y - rr * 0.7, 10 + s * 28)
  }
  // speed lines
  ctx.strokeStyle = '#fff'
  ctx.globalAlpha = 0.3
  for (let i = 0; i < 18; i++) {
    const a = r.range(0, Math.PI * 2)
    const d1 = r.range(40, 120)
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * d1, cy + Math.sin(a) * d1 * 0.6)
    ctx.lineTo(cx + Math.cos(a) * (d1 + 40), cy + Math.sin(a) * (d1 + 40) * 0.6)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  // ship
  ctx.save()
  ctx.translate(cx + 6, h * 0.8)
  ctx.rotate(-0.12)
  ctx.fillStyle = t.accent2
  ctx.beginPath()
  ctx.moveTo(-42, 12)
  ctx.lineTo(0, -8)
  ctx.lineTo(42, 12)
  ctx.lineTo(0, 6)
  ctx.fill()
  ctx.fillStyle = t.accent
  ctx.shadowColor = t.accent
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.moveTo(0, -22)
  ctx.lineTo(12, 14)
  ctx.lineTo(-12, 14)
  ctx.fill()
  ctx.shadowBlur = 0
  emoji(ctx, t.hero, 0, -22, 26)
  ctx.restore()
}
export default draw
