import { background, emoji } from '../engines/kit'
import { genPath } from '../engines/logic/towerdef'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  background(ctx, w, h, t, 20, r.int(1, 1e6))
  const c = 20
  const path = genPath(r, 16, 9)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const trace = () => {
    ctx.beginPath()
    path.forEach((p, i) => (i ? ctx.lineTo(p.x * c + 10, p.y * c + 10) : ctx.moveTo(p.x * c + 10, p.y * c + 10)))
    ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(0,0,0,.35)'
  ctx.lineWidth = c - 1
  trace()
  ctx.strokeStyle = t.blocks[2]
  ctx.globalAlpha = 0.6
  ctx.lineWidth = c - 5
  trace()
  ctx.globalAlpha = 1
  const on = new Set(path.map((p) => p.y * 16 + p.x))
  const cols = ['#facc15', '#fb923c', '#38bdf8', '#c084fc']
  let placed = 0
  for (let i = 0; i < 80 && placed < 7; i++) {
    const x = r.int(0, 15)
    const y = r.int(0, 8)
    if (on.has(y * 16 + x)) continue
    on.add(y * 16 + x)
    ctx.fillStyle = cols[placed % 4]
    ctx.beginPath()
    ctx.arc(x * c + 10, y * c + 10, 8, 0, 7)
    ctx.fill()
    emoji(ctx, t.items[placed % t.items.length], x * c + 10, y * c + 10, 11)
    placed++
  }
  for (let i = 0; i < 5; i++) {
    const p = path[Math.floor(path.length * (0.1 + i * 0.17))]
    emoji(ctx, t.foes[i % t.foes.length], p.x * c + 10, p.y * c + 10, 14)
    ctx.fillStyle = '#222'
    ctx.fillRect(p.x * c, p.y * c - 4, 20, 3)
    ctx.fillStyle = t.good
    ctx.fillRect(p.x * c, p.y * c - 4, 6 + r.int(4, 14), 3)
  }
  const e = path[path.length - 1]
  emoji(ctx, t.hero, e.x * c + 10, e.y * c + 10, 20)
  ctx.fillStyle = 'rgba(0,0,0,.5)'
  ctx.fillRect(0, h - 20, w, 20)
  emoji(ctx, '🪙', 14, h - 10, 12)
}
export default draw
