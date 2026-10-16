import { background, emoji, roundRect } from '../engines/kit'
import { pickCardMode } from '../engines/logic/cardmode'
import type { PreviewFn } from '.'

const SUIT = ['♠', '♥', '♦', '♣']
const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 20, r.int(1, 1e6))
  const mode = pickCardMode(game.name, game.desc, game.mods, game.seed)
  const felt = ['blackjack', 'poker', 'war', 'higher', 'solitaire', 'golf', 'pyramid'].includes(mode)
  if (felt) {
    const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7)
    g.addColorStop(0, mode === 'poker' ? '#1d3f8f' : '#1c6b3c')
    g.addColorStop(1, mode === 'poker' ? '#0b1740' : '#0d3a21')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
  const card = (x: number, y: number, cw: number, rot: number, rank?: string, suit = 0, back = false) => {
    const ch = cw * 1.4
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetY = 2
    if (back) {
      roundRect(ctx, -cw / 2, -ch / 2, cw, ch, 5, t.accent)
      ctx.shadowBlur = 0
      roundRect(ctx, -cw / 2 + 3, -ch / 2 + 3, cw - 6, ch - 6, 4, t.accent2)
      emoji(ctx, t.items[0], 0, 0, cw * 0.55)
    } else {
      roundRect(ctx, -cw / 2, -ch / 2, cw, ch, 5, '#fbf7ea')
      ctx.shadowBlur = 0
      ctx.fillStyle = suit === 1 || suit === 2 ? '#c1272d' : '#1b1b22'
      ctx.font = `800 ${cw * 0.3}px sans-serif`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(rank ?? 'A', -cw / 2 + 4, -ch / 2 + 3)
      ctx.font = `${cw * 0.7}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(SUIT[suit], 0, cw * 0.1)
    }
    ctx.restore()
  }
  if (mode === 'deck' || mode === 'battle') {
    emoji(ctx, t.foes[0] ?? '👾', w * 0.5, 44, 54)
    if (mode === 'battle') {
      for (let i = 0; i < 3; i++) {
        roundRect(ctx, w * 0.5 - 90 + i * 64, 70, 52, 34, 5, 'rgba(255,255,255,0.15)')
        roundRect(ctx, w * 0.5 - 90 + i * 64, 108, 52, 34, 5, 'rgba(255,255,255,0.15)')
      }
      emoji(ctx, t.foes[1] ?? '👹', w * 0.5 - 90 + 26, 87, 26)
      emoji(ctx, t.hero, w * 0.5 + 38, 125, 26)
    }
    emoji(ctx, t.hero, 46, h - 64, 44)
    const n = 5
    for (let i = 0; i < n; i++) {
      const a = (i - (n - 1) / 2) * 0.16
      ctx.save()
      ctx.translate(w / 2 + (i - (n - 1) / 2) * 44, h - 26 + Math.abs(i - 2) * 4)
      ctx.rotate(a)
      roundRect(ctx, -22, -34, 44, 62, 5, '#f6efdc', ['#d9534f', '#3b82d6', '#9b59d0', '#d9534f', '#3b82d6'][i], 3)
      emoji(ctx, r.pick(t.items), 0, -8, 22)
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(-18, -30, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    return
  }
  if (mode === 'solitaire' || mode === 'golf' || mode === 'pyramid') {
    for (let c = 0; c < 6; c++) {
      for (let k = 0; k <= Math.min(c, 3); k++) card(36 + c * 50, 52 + k * 14, 38, 0, k === Math.min(c, 3) ? ['K', 'Q', 'J', '10', '9', '8'][c] : undefined, (c + k) % 4, k !== Math.min(c, 3))
    }
    emoji(ctx, t.hero, w - 30, h - 24, 28)
    return
  }
  const hand = ['A', 'K', 'Q', 'J', '10']
  for (let i = 0; i < 5; i++) card(w / 2 + (i - 2) * 46, h / 2 + 8 - Math.abs(i - 2) * 4, 54, (i - 2) * 0.1, hand[i], i % 4)
  emoji(ctx, t.hero, 36, h - 28, 34)
  emoji(ctx, t.foes[0] ?? '🎩', w - 36, 32, 34)
}
export default draw
