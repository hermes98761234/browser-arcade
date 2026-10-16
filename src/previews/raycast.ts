import { emoji } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  const dark = game.mods.includes('dark') || t.id === 'horror'
  const hz = h / 2
  const cg = ctx.createLinearGradient(0, 0, 0, hz)
  cg.addColorStop(0, dark ? '#000' : t.bg)
  cg.addColorStop(1, dark ? '#0a0608' : t.bg2)
  ctx.fillStyle = cg
  ctx.fillRect(0, 0, w, hz)
  const fg = ctx.createLinearGradient(0, hz, 0, h)
  fg.addColorStop(0, dark ? '#0a0608' : t.bg2)
  fg.addColorStop(1, '#000')
  ctx.fillStyle = fg
  ctx.fillRect(0, hz, w, h - hz)
  // a corridor with a side opening, drawn as columns
  const cols = 80
  const cw = w / cols
  const open = r.int(20, 60)
  for (let c = 0; c < cols; c++) {
    const cam = (c / cols) * 2 - 1
    let d = 1.1 + Math.abs(cam) * 4.2
    if (c > open && c < open + 12) d += 3.5
    if (Math.abs(cam) < 0.1) d = 9
    const lh = Math.min(h * 1.4, (h * 0.9) / d)
    const col = t.blocks[(c >> 3) % t.blocks.length]
    ctx.fillStyle = col
    ctx.fillRect(c * cw, hz - lh / 2, cw + 0.6, lh)
    if (c % 8 === 0) {
      ctx.fillStyle = 'rgba(0,0,0,.35)'
      ctx.fillRect(c * cw, hz - lh / 2, cw + 0.6, lh)
    }
    const light = dark ? Math.max(0, 1 - Math.abs(cam) * 1.6) * 0.85 : Math.max(0.15, 1 - d / 9)
    ctx.fillStyle = `rgba(0,0,0,${(1 - light).toFixed(2)})`
    ctx.fillRect(c * cw, hz - lh / 2, cw + 0.6, lh)
  }
  // far exit door
  ctx.fillStyle = t.accent2
  ctx.shadowColor = t.accent2
  ctx.shadowBlur = 14
  ctx.fillRect(w / 2 - 6, hz - 10, 12, 22)
  ctx.shadowBlur = 0
  emoji(ctx, r.pick(t.foes), w * 0.58, hz + 8, 42)
  emoji(ctx, '🔑', w * 0.34, hz + 22, 20)
  // gun
  ctx.fillStyle = '#2b2b33'
  ctx.beginPath()
  ctx.moveTo(w / 2 + 16, h)
  ctx.lineTo(w / 2 + 28, h - 32)
  ctx.lineTo(w / 2 + 52, h - 32)
  ctx.lineTo(w / 2 + 64, h)
  ctx.fill()
  ctx.fillStyle = '#555563'
  ctx.fillRect(w / 2 + 34, h - 52, 12, 26)
  // portrait
  ctx.fillStyle = 'rgba(0,0,0,.55)'
  ctx.fillRect(6, h - 36, 70, 30)
  emoji(ctx, t.hero, 22, h - 21, 20)
  ctx.fillStyle = t.good
  ctx.fillRect(38, h - 30, 34, 5)
  ctx.strokeStyle = '#fff'
  ctx.globalAlpha = 0.8
  ctx.beginPath()
  ctx.moveTo(w / 2 - 5, hz)
  ctx.lineTo(w / 2 + 5, hz)
  ctx.moveTo(w / 2, hz - 5)
  ctx.lineTo(w / 2, hz + 5)
  ctx.stroke()
  ctx.globalAlpha = 1
}
export default draw
