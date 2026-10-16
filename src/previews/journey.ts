import { background, emoji, roundRect } from '../engines/kit'
import { JFLAVORS, pickKind } from '../engines/logic/journeyEvents'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 30, r.int(1, 1e6))
  const fl = JFLAVORS[pickKind(`${game.name} ${game.desc}`, t.id)]
  // horizon + ground
  ctx.fillStyle = 'rgba(0,0,0,.28)'
  ctx.fillRect(0, 104, w, h - 104)
  ctx.strokeStyle = 'rgba(255,255,255,.35)'
  ctx.lineWidth = 3
  ctx.setLineDash([10, 8])
  ctx.beginPath(); ctx.moveTo(0, 138); ctx.lineTo(w, 138); ctx.stroke()
  ctx.setLineDash([])
  for (let i = 0; i < 6; i++) emoji(ctx, r.pick(t.items), 20 + i * 56 + r.int(0, 20), 96 + r.int(0, 10), 20)
  emoji(ctx, fl.vEmoji, 190, 112, 54)
  emoji(ctx, t.hero, 140, 118, 36)
  // progress bar
  roundRect(ctx, 14, 14, w - 28, 8, 4, 'rgba(255,255,255,.2)')
  roundRect(ctx, 14, 14, (w - 28) * r.range(0.3, 0.7), 8, 4, t.accent)
  for (let i = 1; i <= 5; i++) emoji(ctx, '🏘️', 14 + ((w - 28) * i) / 5, 18, 14)
  // resource chips
  const ic = [fl.fIcon, fl.wIcon, '🪙', '😊']
  ic.forEach((e, i) => {
    roundRect(ctx, 14 + i * 76, 32, 68, 24, 8, 'rgba(0,0,0,.45)')
    emoji(ctx, e, 28 + i * 76, 44, 14)
    roundRect(ctx, 40 + i * 76, 41, 34 - r.int(0, 18), 6, 3, i === 1 ? t.danger : t.good)
  })
  // party
  for (let i = 0; i < 4; i++) {
    roundRect(ctx, 14 + i * 76, 150, 68, 24, 8, 'rgba(255,255,255,.12)')
    emoji(ctx, i === 0 ? t.hero : t.heroes[i % t.heroes.length], 28 + i * 76, 162, 16)
    roundRect(ctx, 42 + i * 76, 160, 34, 5, 2, 'rgba(0,0,0,.4)')
    roundRect(ctx, 42 + i * 76, 160, 12 + r.int(8, 22), 5, 2, t.good)
  }
}
export default draw
