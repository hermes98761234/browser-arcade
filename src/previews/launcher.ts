import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const k = `${game.name} ${game.desc}`.toLowerCase()
  const g = h - 30
  const foe = t.foes[0] ?? '👾'
  const arty = /artillery|cannon|tank|siege|broadside|barrage/.test(k)
  const hoop = /basket|hoop|toss|flick|\bbin\b|dunk|chimney|paper|horseshoe|ring toss/.test(k) && !arty
  ctx.fillStyle = '#5a3d27'
  ctx.fillRect(0, g, w, 30)
  ctx.fillStyle = '#4b8a3f'
  ctx.fillRect(0, g, w, 8)
  const arc = (x0: number, y0: number, x1: number, y1: number, lift: number) => {
    ctx.fillStyle = '#fff'
    for (let i = 1; i < 9; i++) {
      const u = i / 9
      ctx.globalAlpha = 1 - u * 0.6
      ctx.beginPath()
      ctx.arc(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u - Math.sin(u * Math.PI) * lift, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }
  if (arty) {
    ctx.fillStyle = '#7a5a3a'
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += 10) ctx.lineTo(x, g - 10 + Math.sin(x * 0.03) * 14)
    ctx.lineTo(w, h)
    ctx.fill()
    for (const [x, c, e] of [[50, t.accent, t.hero], [w - 50, t.accent2, foe]] as const) {
      roundRect(ctx, x - 18, g - 22, 36, 14, 6, c)
      ctx.fillStyle = '#2b2f3a'
      ctx.save()
      ctx.translate(x, g - 24)
      ctx.rotate(x < w / 2 ? -0.7 : -Math.PI + 0.7)
      ctx.fillRect(0, -4, 26, 8)
      ctx.restore()
      emoji(ctx, e, x, g - 38, 26)
    }
    arc(70, g - 50, w - 70, g - 30, 80)
    return
  }
  if (hoop) {
    emoji(ctx, t.hero, 60, g - 50, 34)
    const hx = w - 70
    roundRect(ctx, hx + 22, g - 150, 8, 66, 3, '#f4f4f4')
    ctx.strokeStyle = t.danger
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(hx - 22, g - 100)
    ctx.lineTo(hx + 22, g - 100)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'
    ctx.lineWidth = 1.5
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(hx - 22 + i * 11, g - 98)
      ctx.lineTo(hx - 14 + i * 7, g - 70)
      ctx.stroke()
    }
    arc(80, g - 56, hx, g - 98, 90)
    emoji(ctx, t.hero, w * 0.52, g - 120, 24, 0.6)
    return
  }
  // slingshot level
  ctx.strokeStyle = '#5b3a1f'
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(52, g)
  ctx.lineTo(52, g - 36)
  ctx.moveTo(52, g - 36)
  ctx.lineTo(42, g - 56)
  ctx.moveTo(52, g - 36)
  ctx.lineTo(62, g - 56)
  ctx.stroke()
  emoji(ctx, t.hero, 46, g - 58, 28)
  arc(60, g - 62, w - 110, g - 70, 60)
  for (const cx of [w - 120, w - 60]) {
    const cols = ['#c28a52', '#8c94a1', 'rgba(176,232,255,0.7)']
    roundRect(ctx, cx - 26, g - 44, 8, 44, 2, r.pick(cols))
    roundRect(ctx, cx + 18, g - 44, 8, 44, 2, r.pick(cols))
    roundRect(ctx, cx - 32, g - 54, 64, 10, 2, r.pick(cols))
    emoji(ctx, foe, cx, g - 18, 24)
    roundRect(ctx, cx - 14, g - 88, 28, 6, 2, '#c28a52')
    emoji(ctx, r.pick(t.foes), cx, g - 68, 28)
  }
}
export default draw
