import { emoji, roundRect, text } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  ctx.fillStyle = '#05050a'
  ctx.fillRect(0, 0, w, h)
  const c = 16
  const cols = Math.floor(w / c)
  const rows = Math.floor((h - 26) / c)
  const hx = r.int(5, cols - 6)
  const hy = r.int(3, rows - 4)
  const ascii = ['retro', 'school', 'cyberpunk', 'robot', 'neon'].includes(t.id)
  const isRoom = (x: number, y: number) => (x > 1 && x < cols - 2 && y > 1 && y < rows - 2 && !((x + y * 3) % 11 === 0 && Math.hypot(x - hx, y - hy) > 4)) || (y === hy && x >= 0 && x < cols)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const d = Math.hypot(x - hx, y - hy)
      const room = isRoom(x, y)
      const X = x * c + (w - cols * c) / 2
      const Y = y * c + 4
      if (!room) {
        const edge = isRoom(x + 1, y) || isRoom(x - 1, y) || isRoom(x, y + 1) || isRoom(x, y - 1) || isRoom(x + 1, y + 1) || isRoom(x - 1, y - 1)
        if (d < 10 && edge) {
          if (ascii) text(ctx, '#', X + c / 2, Y + c / 2, { size: 16, color: t.accent2, font: 'ui-monospace, monospace' })
          else {
            ctx.fillStyle = t.blocks[2 % t.blocks.length]
            ctx.fillRect(X, Y, c, c)
            ctx.fillStyle = 'rgba(0,0,0,0.45)'
            ctx.fillRect(X, Y, c, c)
          }
        }
        continue
      }
      if (d > 9) continue
      if (ascii) text(ctx, '.', X + c / 2, Y + c / 2 + 2, { size: 14, color: t.accent, font: 'ui-monospace, monospace' })
      else {
        ctx.fillStyle = (x + y) % 2 ? t.bg2 : t.bg
        ctx.fillRect(X, Y, c, c)
      }
      const a = Math.min(0.8, (d / 9) ** 2 * 0.7)
      ctx.fillStyle = `rgba(0,0,0,${a})`
      ctx.fillRect(X, Y, c, c)
    }
  }
  const ox = (w - cols * c) / 2
  const place = (ch: string, x: number, y: number, s: number) => {
    const X = ox + x * c + c / 2
    const Y = 4 + y * c + c / 2
    if (ascii) text(ctx, ch.length > 1 || /\p{Emoji}/u.test(ch) ? 'g' : ch, X, Y, { size: 18, color: t.danger, font: 'ui-monospace, monospace', weight: 800 })
    else emoji(ctx, ch, X, Y, s)
  }
  place(r.pick(t.foes), Math.min(cols - 3, hx + 3), hy, 17)
  place(r.pick(t.foes), Math.max(2, hx - 4), hy - 1, 17)
  const ix = Math.min(cols - 3, hx + 2)
  if (ascii) text(ctx, '!', ox + ix * c + c / 2, 4 + (hy + 2) * c + c / 2, { size: 16, color: t.good, font: 'ui-monospace, monospace' })
  else emoji(ctx, '🧪', ox + ix * c + c / 2, 4 + (hy + 2) * c + c / 2, 15)
  if (ascii) text(ctx, '@', ox + hx * c + c / 2, 4 + hy * c + c / 2, { size: 20, color: t.fg, font: 'ui-monospace, monospace', weight: 800, shadow: t.accent })
  else {
    ctx.shadowColor = t.accent
    ctx.shadowBlur = 12
    emoji(ctx, t.hero, ox + hx * c + c / 2, 4 + hy * c + c / 2, 20)
    ctx.shadowBlur = 0
  }
  // HUD bar
  roundRect(ctx, 6, h - 20, 110, 12, 5, '#300')
  roundRect(ctx, 6, h - 20, 78, 12, 5, t.danger)
  text(ctx, `D${r.int(2, 9)}`, 134, h - 14, { size: 10, color: t.accent })
}
export default draw
