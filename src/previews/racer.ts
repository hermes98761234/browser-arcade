import { emoji } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  const blurb = `${game.name} ${game.desc}`.toLowerCase()
  const top = /top-down|topdown|kart|drift|tabletop|micro machines|formula|oval|lawn|mower|ghost lap|ram racer|bike/.test(blurb)
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, t.bg)
  g.addColorStop(1, t.bg2)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  if (top) {
    ctx.fillStyle = t.good
    ctx.globalAlpha = 0.35
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = 1
    ctx.lineJoin = 'round'
    const pts: [number, number][] = []
    const ph = r.range(0, 6)
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2
      const rr = 1 + 0.22 * Math.sin(3 * a + ph) + 0.12 * Math.sin(2 * a)
      pts.push([w / 2 + Math.cos(a) * rr * 105, h / 2 + Math.sin(a) * rr * 52])
    }
    const path = () => {
      ctx.beginPath()
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.closePath()
    }
    ctx.lineWidth = 36
    ctx.strokeStyle = t.danger
    path()
    ctx.stroke()
    ctx.setLineDash([12, 12])
    ctx.strokeStyle = '#f5f5f5'
    path()
    ctx.stroke()
    ctx.setLineDash([])
    ctx.lineWidth = 30
    ctx.strokeStyle = '#4a4a56'
    path()
    ctx.stroke()
    const cols = [t.accent, t.accent2, t.blocks[2], t.blocks[3]]
    for (let i = 0; i < 4; i++) {
      const [x, y] = pts[(i * 9 + 4) % 40]
      ctx.fillStyle = cols[i]
      ctx.fillRect(x - 9, y - 5, 18, 10)
    }
    ctx.shadowColor = t.accent
    ctx.shadowBlur = 8
    emoji(ctx, t.hero, pts[4][0], pts[4][1] - 2, 20)
    ctx.shadowBlur = 0
    return
  }
  const hy = h * 0.42
  ctx.fillStyle = t.accent2
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.arc(w * 0.7, hy - 28, 22, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = t.accent
  ctx.globalAlpha = 0.25
  ctx.beginPath()
  ctx.moveTo(0, hy)
  for (let x = 0; x <= w; x += 12) ctx.lineTo(x, hy - 18 - 14 * Math.sin(x / 40 + r.range(0, 1)))
  ctx.lineTo(w, hy)
  ctx.fill()
  ctx.globalAlpha = 1
  // road: segment strips with a bend
  const bend = r.range(-60, 60)
  for (let i = 0; i < 26; i++) {
    const p1 = i / 26
    const p2 = (i + 1) / 26
    const y1 = hy + (h - hy) * p1 * p1
    const y2 = hy + (h - hy) * p2 * p2
    const cx = (p: number) => w / 2 + bend * (1 - p) * (1 - p) * 1.5
    const rw = (p: number) => 6 + p * p * w * 0.62
    const alt = i % 2
    const gr = t.good
    ctx.fillStyle = gr
    ctx.globalAlpha = alt ? 0.35 : 0.5
    ctx.fillRect(0, y1, w, y2 - y1 + 1)
    ctx.globalAlpha = 1
    ctx.fillStyle = alt ? t.danger : '#f5f5f5'
    ctx.beginPath()
    ctx.moveTo(cx(p1) - rw(p1) * 1.15, y1)
    ctx.lineTo(cx(p1) + rw(p1) * 1.15, y1)
    ctx.lineTo(cx(p2) + rw(p2) * 1.15, y2 + 1)
    ctx.lineTo(cx(p2) - rw(p2) * 1.15, y2 + 1)
    ctx.fill()
    ctx.fillStyle = alt ? '#4a4a56' : '#41414c'
    ctx.beginPath()
    ctx.moveTo(cx(p1) - rw(p1), y1)
    ctx.lineTo(cx(p1) + rw(p1), y1)
    ctx.lineTo(cx(p2) + rw(p2), y2 + 1)
    ctx.lineTo(cx(p2) - rw(p2), y2 + 1)
    ctx.fill()
    if (!alt) {
      ctx.fillStyle = 'rgba(255,255,255,.7)'
      ctx.fillRect(cx(p1) - 1 - p1 * 2, y1, 2 + p1 * 4, y2 - y1)
    }
  }
  for (let i = 0; i < 6; i++) {
    const p = 0.25 + (i % 3) * 0.22
    const side = i % 2 ? 1 : -1
    const y = hy + (h - hy) * p * p
    const x = w / 2 + bend * (1 - p) * (1 - p) * 1.5 + side * (10 + p * p * w * 0.62 + 12 + p * 20)
    emoji(ctx, r.pick(t.items), x, y - 6 - p * 14, 12 + p * 30)
  }
  // rival and player cars
  const car = (x: number, y: number, s: number, c: string, hero = false) => {
    ctx.fillStyle = 'rgba(0,0,0,.35)'
    ctx.fillRect(x - s * 0.55, y - 1, s * 1.1, s * 0.1)
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.roundRect(x - s / 2, y - s * 0.6, s, s * 0.5, s * 0.1)
    ctx.fill()
    ctx.fillStyle = 'rgba(0,0,0,.3)'
    ctx.fillRect(x - s * 0.34, y - s * 0.85, s * 0.68, s * 0.28)
    ctx.fillStyle = '#ff3030'
    ctx.fillRect(x - s * 0.44, y - s * 0.35, s * 0.2, s * 0.1)
    ctx.fillRect(x + s * 0.24, y - s * 0.35, s * 0.2, s * 0.1)
    if (hero) emoji(ctx, t.hero, x, y - s * 0.8, s * 0.45)
  }
  car(w / 2 - 28, hy + 36, 18, t.blocks[2])
  car(w / 2 + 22, hy + 56, 28, t.blocks[4])
  ctx.shadowColor = t.accent
  ctx.shadowBlur = 10
  car(w / 2 + 4, h - 14, 70, t.accent, true)
  ctx.shadowBlur = 0
}
export default draw
