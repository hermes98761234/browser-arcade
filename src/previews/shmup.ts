import { background, emoji } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 45, r.int(1, 1e6))
  const hell = game.mods.includes('hell') || game.mods.includes('tiny')
  const cx = w / 2 + r.range(-30, 30)
  // formation
  for (let row = 0; row < 3; row++)
    for (let c = 0; c < 7; c++) if (!r.chance(0.15)) emoji(ctx, t.foes[row % t.foes.length], 40 + c * 40, 22 + row * 26, 22)
  // bullets
  const n = hell ? 70 : 14
  for (let i = 0; i < n; i++) {
    const a = r.range(0, 7)
    const d = r.range(20, 100)
    const x = hell ? w / 2 + Math.cos(a) * d * 1.8 : r.range(10, w - 10)
    const y = hell ? 50 + Math.abs(Math.sin(a)) * d : r.range(60, h - 50)
    ctx.fillStyle = i % 2 ? t.danger : t.accent2
    ctx.shadowColor = ctx.fillStyle
    ctx.shadowBlur = 5
    ctx.beginPath()
    ctx.arc(x, y, 2.6, 0, 7)
    ctx.fill()
  }
  ctx.shadowBlur = 0
  ctx.fillStyle = t.accent
  ctx.shadowColor = t.accent
  ctx.shadowBlur = 6
  for (let y = h - 60; y > 60; y -= 14) ctx.fillRect(cx - 1.5, y, 3, 8)
  ctx.shadowBlur = 0
  emoji(ctx, t.hero, cx, h - 30, 30)
}
export default draw
