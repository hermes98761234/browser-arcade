import { background, emoji, text } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 30, r.int(1, 1e6))
  const hex = game.mods.includes('hex')
  const cols = [t.accent, t.danger, '#a78bfa', '#94a3b8']
  if (hex) {
    const R = 17
    for (let c = 0; c < 10; c++) {
      for (let q = 0; q < 6; q++) {
        const x = 24 + c * 1.5 * R + 8
        const y = 22 + q * Math.sqrt(3) * R + (c % 2) * (Math.sqrt(3) * R) / 2
        if (x > w - 14 || y > h - 12) continue
        const o = c < 3 ? 0 : c > 6 ? 1 : r.chance(0.3) ? 3 : r.int(0, 1)
        ctx.beginPath()
        for (let i = 0; i < 6; i++) ctx.lineTo(x + Math.cos((Math.PI / 3) * i) * (R - 1), y + Math.sin((Math.PI / 3) * i) * (R - 1))
        ctx.closePath()
        ctx.globalAlpha = o === 3 ? 0.2 : 0.45
        ctx.fillStyle = cols[o]
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.strokeStyle = cols[o]
        ctx.stroke()
        text(ctx, String(r.int(3, 40)), x, y, { size: 8, color: '#fff' })
      }
    }
    emoji(ctx, t.hero, 40, 90, 20)
    emoji(ctx, t.foes[0], w - 50, 90, 20)
    return
  }
  const nodes: [number, number, number, number][] = []
  for (let i = 0; i < 9; i++) {
    const rad = r.int(11, 24)
    const x = r.range(30, w - 30)
    const y = r.range(26, h - 26)
    if (nodes.some((n) => Math.hypot(n[0] - x, n[1] - y) < n[2] + rad + 18)) continue
    nodes.push([x, y, rad, i < 3 ? 0 : i < 5 ? 1 : 3])
  }
  ctx.setLineDash([6, 5])
  ctx.strokeStyle = t.accent
  ctx.globalAlpha = 0.5
  for (let i = 1; i < 4 && i < nodes.length; i++) { ctx.beginPath(); ctx.moveTo(nodes[0][0], nodes[0][1]); ctx.lineTo(nodes[i][0], nodes[i][1]); ctx.stroke() }
  ctx.setLineDash([])
  ctx.globalAlpha = 1
  const gl = ['🪐', '🌍', '🌕', '🏰', '🏯', '🛖']
  const sp = t.id === 'space' ? gl.slice(0, 3) : gl.slice(3)
  nodes.forEach(([x, y, rad, o], i) => {
    ctx.fillStyle = cols[o]
    ctx.globalAlpha = 0.8
    ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill()
    ctx.globalAlpha = 1
    ctx.strokeStyle = cols[o]; ctx.lineWidth = 3; ctx.stroke()
    emoji(ctx, sp[i % 3], x, y, rad * 1.1)
    text(ctx, String(r.int(5, 60)), x, y + rad + 8, { size: 8, color: '#fff' })
  })
  emoji(ctx, t.hero, nodes[0][0] + 18, nodes[0][1] - 18, 16)
}
export default draw
