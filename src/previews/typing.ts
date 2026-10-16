import { background, emoji, roundRect, text } from '../engines/kit'
import { TOPICS } from '../engines/logic/words'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  background(ctx, w, h, t, 30, r.int(1, 1e6))
  const pool = Object.values(TOPICS).flat().filter((s) => s.length >= 4 && s.length <= 7)
  const labels = [0, 1, 2, 3].map(() => r.pick(pool))
  labels.forEach((s, i) => {
    const bw = s.length * 9 + 34
    const x = r.range(bw / 2 + 6, w - bw / 2 - 6)
    const y = 24 + i * 28 + r.range(-4, 10)
    const locked = i === 2
    ctx.shadowColor = locked ? t.accent : 'rgba(0,0,0,.5)'
    ctx.shadowBlur = locked ? 12 : 4
    roundRect(ctx, x - bw / 2, y - 12, bw, 24, 12, 'rgba(8,10,24,.82)', locked ? t.accent : t.accent2, locked ? 2.5 : 1.2)
    ctx.shadowBlur = 0
    emoji(ctx, r.pick(t.foes), x - bw / 2 + 14, y + 1, 14)
    const typed = locked ? s.slice(0, 2) : ''
    text(ctx, s, x - bw / 2 + 28, y + 1, { size: 12, align: 'left', color: '#f1f5f9', font: 'ui-monospace, monospace' })
    if (typed) text(ctx, typed, x - bw / 2 + 28, y + 1, { size: 12, align: 'left', color: '#facc15', font: 'ui-monospace, monospace' })
  })
  ctx.strokeStyle = t.accent
  ctx.globalAlpha = 0.6
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(w / 2, h - 34)
  ctx.lineTo(w * 0.62, 80)
  ctx.stroke()
  ctx.globalAlpha = 1
  roundRect(ctx, w / 2 - 28, h - 18, 56, 10, 5, t.bg2, t.accent, 1.5)
  emoji(ctx, t.hero, w / 2, h - 32, 34)
}
export default draw
