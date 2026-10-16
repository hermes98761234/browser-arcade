import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 20, r.int(1, 1e6))
  const k = `${game.name} ${game.desc}`.toLowerCase()
  const foe = t.heroes.find((f) => f !== t.hero) ?? t.foes[0] ?? '👾'
  const hockey = /hockey|ice|penalty/.test(k) || game.mods.includes('ice')
  const slime = /volley|tennis|badminton/.test(k) && !/table tennis/.test(k)
  if (slime) {
    const floor = h - 36
    ctx.fillStyle = /tennis/.test(k) ? '#2f7d4f' : '#e2c27a'
    ctx.fillRect(0, floor, w, 36)
    ctx.fillStyle = '#fff'
    ctx.fillRect(w / 2 - 2, floor - 52, 4, 52)
    for (const [i, x] of [[0, w * 0.27], [1, w * 0.73]] as const) {
      ctx.fillStyle = i ? t.accent2 : t.accent
      ctx.beginPath()
      ctx.arc(x, floor, 30, Math.PI, 0)
      ctx.fill()
      emoji(ctx, i ? foe : t.hero, x, floor - 16, 24)
    }
    emoji(ctx, /tennis/.test(k) ? '🎾' : /badminton/.test(k) ? '🏸' : '🏐', w * 0.42, 56, 26, 0.5)
    return
  }
  if (hockey) {
    roundRect(ctx, 10, 10, w - 20, h - 20, 30, ice(t.id), t.accent, 3)
    ctx.strokeStyle = 'rgba(120,180,220,0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(w / 2, 10)
    ctx.lineTo(w / 2, h - 10)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, 34, 0, Math.PI * 2)
    ctx.stroke()
    for (const [i, x, y] of [[0, 80, 90], [1, w - 80, 80]] as const) {
      ctx.fillStyle = i ? t.accent2 : t.accent
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.fill()
      emoji(ctx, i ? foe : t.hero, x, y, 20)
    }
    ctx.fillStyle = '#222'
    ctx.beginPath()
    ctx.arc(w * 0.55, h * 0.58, 9, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  ctx.strokeStyle = t.fg
  ctx.globalAlpha = 0.3
  ctx.setLineDash([8, 8])
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(w / 2, 6)
  ctx.lineTo(w / 2, h - 6)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 1
  ctx.shadowBlur = 12
  for (const [i, x, y] of [[0, 22, 70], [1, w - 22, 108]] as const) {
    ctx.shadowColor = ctx.fillStyle = i ? t.accent2 : t.accent
    roundRect(ctx, x - 6, y - 30, 12, 60, 6, i ? t.accent2 : t.accent)
    emoji(ctx, i ? foe : t.hero, i ? x - 24 : x + 24, y, 22)
  }
  ctx.shadowColor = '#fff'
  ctx.fillStyle = '#fff'
  for (let i = 0; i < 6; i++) {
    ctx.globalAlpha = i / 8
    ctx.beginPath()
    ctx.arc(w * 0.5 - 70 + i * 14, h * 0.5 + 30 - i * 5, 5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.arc(w * 0.5 + 15, h * 0.5, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
  text2(ctx, w)
}
const ice = (id: string) => (id === 'arctic' ? '#dff3fb' : '#12344d')
function text2(ctx: CanvasRenderingContext2D, w: number) {
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.font = 'bold 40px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('3', w / 2 - 50, 50)
  ctx.fillText('2', w / 2 + 50, 50)
}
export default draw
