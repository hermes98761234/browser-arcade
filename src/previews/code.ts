import { background, emoji, roundRect, text } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r) => {
  background(ctx, w, h, t, 20, r.int(1, 1e6))
  const n = 5
  const tw = 46
  const th = 23
  const ox = w * 0.36
  const oy = 28
  const P = (x: number, y: number, z: number): [number, number] => [ox + ((x - y) * tw) / 2, oy + ((x + y) * th) / 2 - z * 14]
  const poly = (pts: [number, number][], fill: string) => {
    ctx.fillStyle = fill
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.closePath()
    ctx.fill()
  }
  const goals = new Set<number>()
  while (goals.size < 3) goals.add(r.int(1, n * n - 2))
  const hero = r.int(0, n * n - 1)
  const hs: number[] = []
  for (let i = 0; i < n * n; i++) hs.push(r.chance(0.25) ? 1 : 0)
  for (let s = 0; s < 2 * n - 1; s++)
    for (let x = 0; x < n; x++) {
      const y = s - x
      if (y < 0 || y >= n) continue
      const i = y * n + x
      const z = hs[i]
      const c = t.blocks[z]
      poly([P(x, y + 1, z), P(x + 1, y + 1, z), P(x + 1, y + 1, -0.3), P(x, y + 1, -0.3)], 'rgba(0,0,0,.35)')
      poly([P(x + 1, y + 1, z), P(x + 1, y, z), P(x + 1, y, -0.3), P(x + 1, y + 1, -0.3)], 'rgba(0,0,0,.5)')
      poly([P(x, y, z), P(x + 1, y, z), P(x + 1, y + 1, z), P(x, y + 1, z)], c)
      if ((x + y) % 2) poly([P(x, y, z), P(x + 1, y, z), P(x + 1, y + 1, z), P(x, y + 1, z)], 'rgba(255,255,255,.08)')
      const [cx, cy] = P(x + 0.5, y + 0.5, z)
      if (goals.has(i)) {
        ctx.fillStyle = r.chance(0.4) ? '#fde047' : 'rgba(0,0,0,.3)'
        ctx.beginPath()
        ctx.ellipse(cx, cy, 11, 5.5, 0, 0, Math.PI * 2)
        ctx.fill()
        emoji(ctx, r.pick(t.items), cx, cy - 6, 15)
      }
      if (i === hero) emoji(ctx, t.hero, cx, cy - 12, 34)
    }
  // program blocks
  const cols = ['#38bdf8', '#a78bfa', '#facc15', '#34d399', '#f472b6', '#fb923c']
  const gl = ['↑', '↶', '✦', 'P1', '×2', '⤴']
  for (let i = 0; i < 6; i++) {
    const x = w - 78 + (i % 2) * 36
    const y = 30 + Math.floor(i / 2) * 38
    const k = r.int(0, 5)
    roundRect(ctx, x, y, 32, 32, 8, cols[k])
    text(ctx, gl[k], x + 16, y + 16, { size: 14, color: '#fff', font: 'system-ui, sans-serif' })
  }
  for (let i = 0; i < 6; i++) roundRect(ctx, 14 + i * 24, h - 26, 20, 20, 5, undefined, 'rgba(255,255,255,.35)', 1.5)
}
export default draw
