import { background, emoji } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 26, r.int(1, 1e6))
  const climb = game.mods.includes('climb')
  ctx.fillStyle = t.accent2
  ctx.globalAlpha = 0.2
  ctx.beginPath()
  ctx.arc(w * 0.75, h * 0.25, 28, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = t.accent
  ctx.globalAlpha = 0.2
  ctx.beginPath()
  ctx.moveTo(0, h)
  const p = r.range(0, 6)
  for (let x = 0; x <= w; x += 10) ctx.lineTo(x, h * 0.62 - 26 * Math.sin(x / 40 + p))
  ctx.lineTo(w, h)
  ctx.fill()
  ctx.globalAlpha = 1
  const tile = 20
  const main = t.blocks[0]
  const block = (x: number, y: number, n: number, rows = 1) => {
    for (let i = 0; i < n; i++)
      for (let j = 0; j < rows; j++) {
        ctx.fillStyle = main
        ctx.fillRect(x + i * tile, y + j * tile, tile + 0.5, tile + 0.5)
        ctx.fillStyle = 'rgba(0,0,0,.22)'
        ctx.fillRect(x + i * tile, y + j * tile, tile + 0.5, tile + 0.5)
        if (j === 0) {
          ctx.fillStyle = main
          ctx.fillRect(x + i * tile, y, tile + 0.5, 6)
          ctx.fillStyle = 'rgba(255,255,255,.3)'
          ctx.fillRect(x + i * tile, y, tile + 0.5, 2)
        }
      }
  }
  const gy = h - 44
  let ground: [number, number][] = [[0, 6], [8, 5], [14, 4]]
  if (climb) ground = [[0, 16]]
  for (const [x, n] of ground) block(x * tile, gy, n, 3)
  const plat = (x: number, y: number, n: number) => {
    ctx.fillStyle = t.accent2
    for (let i = 0; i < n; i++) ctx.fillRect(x + i * tile, y, tile + 0.5, 6)
  }
  plat(w * 0.2, gy - 54, 4)
  plat(w * 0.45, gy - 100, 4)
  plat(w * 0.7, gy - 60, 3)
  // spikes
  ctx.fillStyle = t.danger
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(6 * tile + i * 6, gy)
    ctx.lineTo(6 * tile + i * 6 + 3, gy - 9)
    ctx.lineTo(6 * tile + i * 6 + 6, gy)
    ctx.fill()
  }
  for (let i = 0; i < 5; i++) emoji(ctx, '⭐', w * 0.48 + i * 14, gy - 120 - (i % 2) * 5, 12)
  emoji(ctx, '⭐', w * 0.27, gy - 72, 12)
  emoji(ctx, r.pick(t.foes), w * 0.58, gy - 12, 22)
  ctx.shadowColor = t.accent
  ctx.shadowBlur = 10
  emoji(ctx, t.hero, w * 0.3, gy - 78 + 0, 32)
  ctx.shadowBlur = 0
  // goal flag
  ctx.fillStyle = t.fg
  ctx.fillRect(w - 38, gy - 56, 2, 56)
  ctx.fillStyle = t.accent
  ctx.beginPath()
  ctx.moveTo(w - 36, gy - 56)
  ctx.lineTo(w - 14, gy - 48)
  ctx.lineTo(w - 36, gy - 40)
  ctx.fill()
}
export default draw
