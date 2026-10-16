import { background, emoji, roundRect } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 20, r.int(1, 1e6))
  const k = `${game.name} ${game.desc}`.toLowerCase()
  if (/pool|billiard|snooker|8-ball|9-ball/.test(k)) {
    roundRect(ctx, 16, 22, w - 32, h - 44, 16, '#5a3a1e')
    ctx.fillStyle = '#1f8a4c'
    ctx.fillRect(34, 38, w - 68, h - 76)
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect(34, 38, w - 68, h - 76)
    ctx.fillStyle = '#050508'
    for (const [x, y] of [[34, 38], [w - 34, 38], [34, h - 38], [w - 34, h - 38], [w / 2, 36], [w / 2, h - 36]]) {
      ctx.beginPath()
      ctx.arc(x, y, 9, 0, Math.PI * 2)
      ctx.fill()
    }
    const cols = ['#f5d90a', '#1d4ed8', '#dc2626', '#7c3aed', '#f97316', '#16a34a', '#7f1d1d']
    let i = 0
    for (let row = 0; row < 4; row++) for (let j = 0; j <= row; j++) {
      ctx.fillStyle = cols[i++ % cols.length]
      ctx.beginPath()
      ctx.arc(200 + row * 13, h / 2 + (j - row / 2) * 15, 7, 0, Math.PI * 2)
      ctx.fill()
    }
    emoji(ctx, t.hero, 90, h / 2 + 8, 16)
    ctx.strokeStyle = 'rgba(255,255,255,.8)'
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(98, h / 2 + 8)
    ctx.lineTo(188, h / 2 + 2)
    ctx.stroke()
    ctx.setLineDash([])
    return
  }
  if (/bowling|bowl\b/.test(k)) {
    ctx.fillStyle = '#e0b46a'
    ctx.fillRect(0, 40, w, h - 80)
    ctx.fillStyle = '#2b1a2f'
    ctx.fillRect(0, 26, w, 14)
    ctx.fillRect(0, h - 40, w, 14)
    for (let row = 0; row < 4; row++) for (let j = 0; j <= row; j++) {
      ctx.fillStyle = '#fafafa'
      ctx.beginPath()
      ctx.arc(250 + row * 15, h / 2 + (j - row / 2) * 17, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = t.danger
      ctx.fillRect(244 + row * 15, h / 2 + (j - row / 2) * 17 - 1.5, 12, 3)
    }
    ctx.fillStyle = '#16161e'
    ctx.beginPath()
    ctx.arc(70, h / 2 + 6, 16, 0, Math.PI * 2)
    ctx.fill()
    emoji(ctx, t.hero, 70, h / 2 + 6, 22)
    return
  }
  if (/curling/.test(k)) {
    ctx.fillStyle = '#e4f4ff'
    ctx.fillRect(0, 36, w, h - 72)
    for (const [rad, c] of [[44, t.accent2], [30, '#fff'], [18, t.accent], [7, '#fff']] as const) {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(w - 80, h / 2, rad, 0, Math.PI * 2)
      ctx.fill()
    }
    for (const [x, y, c] of [[w - 92, h / 2 + 4, t.accent], [w - 60, h / 2 - 10, t.accent2], [160, h / 2 + 8, t.accent]] as const) {
      ctx.fillStyle = '#9aa3ad'
      ctx.beginPath()
      ctx.arc(x, y, 12, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()
    }
    emoji(ctx, t.hero, 160, h / 2 + 8, 14)
    return
  }
  // mini golf
  roundRect(ctx, 14, 14, w - 28, h - 28, 14, t.blocks[0])
  ctx.fillStyle = '#2e9a52'
  ctx.fillRect(26, 26, w - 52, h - 52)
  ctx.fillStyle = 'rgba(0,0,0,0.38)'
  ctx.fillRect(26, 26, w - 52, h - 52)
  ctx.fillStyle = t.blocks[0]
  ctx.fillRect(130, 26, 12, 70)
  ctx.fillRect(210, h - 96, 12, 70)
  ctx.fillStyle = '#2b79c9'
  ctx.fillRect(160, 70, 36, 44)
  ctx.fillStyle = '#e2c98a'
  ctx.fillRect(240, 44, 40, 34)
  ctx.fillStyle = '#0b0b10'
  ctx.beginPath()
  ctx.arc(w - 50, h / 2 + r.int(-20, 20), 10, 0, Math.PI * 2)
  ctx.fill()
  const fy = h / 2
  ctx.strokeStyle = '#eee'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(w - 50, fy)
  ctx.lineTo(w - 50, fy - 34)
  ctx.stroke()
  ctx.fillStyle = t.danger
  ctx.fillRect(w - 50, fy - 34, 16, 10)
  emoji(ctx, t.foes[0] ?? '👾', 190, h - 52, 18)
  emoji(ctx, t.hero, 56, h / 2 + 10, 22)
  ctx.strokeStyle = 'rgba(255,255,255,.85)'
  ctx.setLineDash([3, 6])
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(70, h / 2 + 8)
  ctx.quadraticCurveTo(110, h / 2 - 40, 150, h / 2 - 10)
  ctx.stroke()
  ctx.setLineDash([])
}
export default draw
