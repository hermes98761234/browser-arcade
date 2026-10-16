import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 30, r.int(1, 1e6))
  const gy = h * 0.78
  ctx.fillStyle = t.accent2
  ctx.globalAlpha = 0.22
  ctx.beginPath()
  ctx.arc(w * 0.74, h * 0.28, 30, 0, Math.PI * 2)
  ctx.fill()
  // parallax silhouettes
  const city = ['neon', 'cyberpunk', 'robot', 'steampunk', 'space', 'retro', 'hero', 'wasteland', 'gems', 'school'].includes(game.theme)
  for (const [col, a, hh] of [[t.accent2, 0.2, 70], [t.accent, 0.22, 48], ['#000', 0.3, 30]] as const) {
    ctx.fillStyle = col
    ctx.globalAlpha = a
    if (city) {
      for (let x = -10; x < w; ) {
        const bw = r.int(22, 46)
        const bh = r.range(0.4, 1) * hh
        ctx.fillRect(x, gy - bh, bw, bh)
        x += bw + r.int(0, 6)
      }
    } else {
      ctx.beginPath()
      ctx.moveTo(0, gy)
      const p = r.range(0, 6)
      for (let x = 0; x <= w; x += 10) ctx.lineTo(x, gy - hh * (0.6 + 0.4 * Math.sin(x / (30 + hh) + p)))
      ctx.lineTo(w, gy)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1
  const g = ctx.createLinearGradient(0, gy, 0, h)
  g.addColorStop(0, t.blocks[0])
  g.addColorStop(1, t.bg2)
  ctx.fillStyle = g
  ctx.fillRect(0, gy, w, h - gy)
  ctx.fillStyle = 'rgba(255,255,255,.12)'
  for (let x = 0; x < w; x += 40) ctx.fillRect(x, gy + 12, 18, 3)
  // pit
  ctx.fillStyle = t.danger
  ctx.globalAlpha = 0.8
  ctx.fillRect(w * 0.58, gy, 36, h - gy)
  ctx.globalAlpha = 1
  // blocks
  for (let i = 0; i < 2; i++) roundRect(ctx, w * 0.84 + i * 20, gy - 20, 20, 20, 3, t.blocks[(i + 1) % t.blocks.length])
  emoji(ctx, r.pick(t.foes), w * 0.43, gy - 16, 26)
  // coin arc
  const it = r.pick(t.items)
  for (let i = 0; i < 6; i++) emoji(ctx, it, w * 0.5 + i * 16, gy - 48 - Math.sin((i / 5) * Math.PI) * 30, 14)
  // hero in a jump with a shadow
  ctx.fillStyle = 'rgba(0,0,0,.3)'
  ctx.beginPath()
  ctx.ellipse(w * 0.22, gy + 3, 14, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowColor = t.accent
  ctx.shadowBlur = 12
  emoji(ctx, t.hero, w * 0.22, gy - 40, 44)
  ctx.shadowBlur = 0
  ctx.strokeStyle = t.fg
  ctx.globalAlpha = 0.25
  for (let i = 0; i < 4; i++) {
    const y = h * (0.2 + i * 0.13)
    ctx.beginPath()
    ctx.moveTo(w * 0.05 + i * 30, y)
    ctx.lineTo(w * 0.05 + i * 30 + 50, y)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}
export default draw
