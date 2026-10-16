import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const floor = h - 36
  ctx.globalAlpha = 0.25
  for (let i = 0; i < 5; i++) emoji(ctx, t.items[i % t.items.length], 30 + i * 65, floor - 70 - r.int(0, 30), 30)
  ctx.globalAlpha = 1
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fillRect(0, floor, w, h - floor)
  ctx.fillStyle = t.accent
  ctx.globalAlpha = 0.6
  ctx.fillRect(0, floor, w, 3)
  ctx.globalAlpha = 1
  const foe = t.foes.find((f) => f !== t.hero) ?? '👾'
  const limb = (x1: number, y1: number, x2: number, y2: number, wd: number, c: string) => {
    ctx.strokeStyle = c
    ctx.lineWidth = wd
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  const fighter = (x: number, dir: 1 | -1, col: string, e: string, punch: boolean) => {
    limb(x, floor - 30, x - 6 * dir, floor - 2, 8, 'rgba(0,0,0,0.45)')
    limb(x, floor - 30, x + 8 * dir, floor - 2, 8, col)
    roundRect(ctx, x - 12, floor - 70, 24, 42, 9, col)
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect(x - 12, floor - 38, 24, 5)
    if (punch) {
      limb(x, floor - 60, x + 44 * dir, floor - 62, 8, col)
      ctx.fillStyle = col
      ctx.beginPath()
      ctx.arc(x + 48 * dir, floor - 62, 7, 0, Math.PI * 2)
      ctx.fill()
    } else limb(x, floor - 60, x + 14 * dir, floor - 46, 8, col)
    emoji(ctx, e, x, floor - 90, 42)
  }
  fighter(100, 1, t.accent, t.hero, true)
  fighter(w - 100, -1, t.accent2, foe, false)
  // impact star
  ctx.fillStyle = '#fff8c0'
  ctx.beginPath()
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const rr = i % 2 ? 7 : 16
    ctx.lineTo(w - 128 + Math.cos(a) * rr, floor - 62 + Math.sin(a) * rr)
  }
  ctx.fill()
  // bars
  for (const [i, x] of [[0, 12], [1, w - 12 - 120]] as const) {
    roundRect(ctx, x, 12, 120, 12, 4, 'rgba(0,0,0,0.55)')
    const f = i ? 0.55 : 0.85
    roundRect(ctx, i ? x + 120 * (1 - f) : x, 12, 120 * f, 12, 4, t.good)
    roundRect(ctx, x, 12, 120, 12, 4, undefined, 'rgba(255,255,255,0.7)', 1.5)
  }
  roundRect(ctx, w / 2 - 16, 8, 32, 20, 6, 'rgba(0,0,0,0.6)')
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 12px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('42', w / 2, 23)
}
export default draw
