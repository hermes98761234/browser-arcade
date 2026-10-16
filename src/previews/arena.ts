import { background, emoji } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 20, r.int(1, 1e6))
  ctx.strokeStyle = t.fg
  ctx.globalAlpha = 0.07
  for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
  for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
  ctx.globalAlpha = 1
  const cx = w / 2
  const cy = h / 2
  const io = game.mods.includes('io') || /\bio\b|agar|orb/i.test(game.name)
  if (io) {
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = r.pick(t.blocks)
      ctx.beginPath()
      ctx.arc(r.range(8, w - 8), r.range(8, h - 8), 2.5, 0, 7)
      ctx.fill()
    }
    for (let i = 0; i < 5; i++) {
      const x = r.range(30, w - 30)
      const y = r.range(30, h - 30)
      const rad = r.range(12, 30)
      ctx.fillStyle = i % 2 ? t.danger : t.good
      ctx.globalAlpha = 0.35
      ctx.beginPath()
      ctx.arc(x, y, rad, 0, 7)
      ctx.fill()
      ctx.globalAlpha = 1
      emoji(ctx, r.pick(t.foes), x, y, rad * 1.3)
    }
    ctx.fillStyle = t.accent
    ctx.globalAlpha = 0.4
    ctx.beginPath()
    ctx.arc(cx, cy, 26, 0, 7)
    ctx.fill()
    ctx.globalAlpha = 1
    emoji(ctx, t.hero, cx, cy, 34)
    return
  }
  const melee = game.mods.includes('melee')
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * 6.28 + r.range(-0.2, 0.2)
    emoji(ctx, r.pick(t.foes), cx + Math.cos(a) * r.range(60, 120), cy + Math.sin(a) * r.range(40, 70), r.range(18, 26))
  }
  ctx.fillStyle = t.accent2
  ctx.shadowColor = t.accent2
  ctx.shadowBlur = 8
  if (melee) {
    ctx.globalAlpha = 0.45
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, 44, -0.9, 0.9)
    ctx.fill()
    ctx.globalAlpha = 1
  } else for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.arc(cx + i * 15, cy - i * 3, 2.5, 0, 7); ctx.fill() }
  ctx.shadowBlur = 0
  emoji(ctx, t.hero, cx, cy, 36)
}
export default draw
