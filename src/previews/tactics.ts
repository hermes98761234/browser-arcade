import { background, emoji, roundRect, text } from '../engines/kit'
import { CLS, CLS_LIST } from '../engines/logic/tactics'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 20, r.int(1, 1e6))
  if (/creature|monster|critter|cryptid|pets?\b|pals|kaiju|slime|wisps?|spirit|hatchery|fossil|coral|glitch/i.test(`${game.name} ${game.desc}`)) {
    ctx.fillStyle = 'rgba(0,0,0,.3)'
    ctx.beginPath(); ctx.ellipse(235, 80, 46, 10, 0, 0, 7); ctx.fill()
    ctx.beginPath(); ctx.ellipse(90, 128, 56, 12, 0, 0, 7); ctx.fill()
    emoji(ctx, r.pick(t.foes), 235, 52, 56)
    emoji(ctx, t.hero, 90, 92, 76)
    roundRect(ctx, 10, 10, 120, 28, 8, 'rgba(0,0,0,.6)', t.danger)
    roundRect(ctx, 16, 26, 80, 6, 3, t.good)
    roundRect(ctx, 190, 98, 120, 28, 8, 'rgba(0,0,0,.6)', t.accent)
    roundRect(ctx, 196, 114, 60, 6, 3, '#facc15')
    for (let i = 0; i < 4; i++) roundRect(ctx, 8 + i * 78, 142, 74, 28, 7, 'rgba(255,255,255,.14)')
    return
  }
  const c = 28
  const cols = 11
  const rows = 6
  const ox = (w - cols * c) / 2
  const oy = 8
  for (let q = 0; q < rows; q++) for (let p = 0; p < cols; p++) {
    ctx.fillStyle = (p + q) % 2 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.12)'
    ctx.fillRect(ox + p * c, oy + q * c, c, c)
    if (p >= 3 && p <= 5 && q >= 1 && q <= 3) { ctx.fillStyle = 'rgba(96,165,250,.35)'; ctx.fillRect(ox + p * c + 1, oy + q * c + 1, c - 2, c - 2) }
  }
  for (let i = 0; i < 7; i++) emoji(ctx, r.pick(['🌲', '⛰️', '🌲']), ox + r.int(2, 9) * c + c / 2, oy + r.int(0, 5) * c + c / 2, 20)
  ctx.fillStyle = 'rgba(248,113,113,.4)'
  ctx.fillRect(ox + 6 * c, oy + 2 * c, c, c)
  const put = (e: string, p: number, q: number, col: string, cl: number) => {
    ctx.fillStyle = col
    ctx.globalAlpha = 0.35
    ctx.beginPath(); ctx.arc(ox + p * c + c / 2, oy + q * c + c / 2, 12, 0, 7); ctx.fill()
    ctx.globalAlpha = 1
    emoji(ctx, e, ox + p * c + c / 2, oy + q * c + c / 2, 18)
    text(ctx, CLS[CLS_LIST[cl % 6]].icon, ox + p * c + c - 5, oy + q * c + c - 5, { size: 8 })
    roundRect(ctx, ox + p * c + 4, oy + q * c + 1, c - 8, 3, 1, t.good)
  }
  put(t.hero, 2, 3, t.accent, 0)
  put(t.heroes[1] ?? t.hero, 1, 1, t.accent, 2)
  put(t.heroes[2] ?? t.hero, 2, 5, t.accent, 4)
  put(t.foes[0], 8, 2, t.danger, 0)
  put(t.foes[1] ?? t.foes[0], 9, 4, t.danger, 3)
  put(t.foes[2] ?? t.foes[0], 7, 0, t.danger, 2)
  ctx.fillStyle = 'rgba(0,0,0,.5)'
  ctx.fillRect(0, h - 14, w, 14)
}
export default draw
