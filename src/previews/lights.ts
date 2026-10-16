import { background, emoji, roundRect } from '../engines/kit'
import { genFlood, genLaser, hueGradient, trace } from '../engines/logic/lights'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const s = `${game.name} ${game.desc}`.toLowerCase()
  const m = game.mods
  const flood = m.includes('flood') || /flood/.test(s)
  const laser = !flood && (m.includes('laser') || /beam|mirrors|prism|lens|solar/.test(s))
  const hue = !flood && !laser && (/hue|gradient|spectrum|shade|palette|swatch|chroma|tint|dye|ink/.test(s) || (m.includes('color') && !m.includes('mirror')))
  const n = laser ? 6 : 7
  const c = laser ? 24 : 22
  const bx = (w - n * c) / 2
  const by = (h - n * c) / 2
  roundRect(ctx, bx - 6, by - 6, n * c + 12, n * c + 12, 10, 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.2)', 1.5)
  if (flood) {
    const g = genFlood(n, 5, r)
    g.forEach((v, i) => {
      ctx.fillStyle = t.blocks[i < 9 && i % n < 3 ? g[0] : v]
      ctx.fillRect(bx + (i % n) * c, by + Math.floor(i / n) * c, c, c)
    })
    emoji(ctx, t.hero, bx + c / 2, by + c / 2, 18)
  } else if (hue) {
    const g = hueGradient(n, r)
    g.forEach((_, i) => {
      const j = i % 5 === 2 ? (i + 8) % (n * n) : i
      const cc = g[j]
      ctx.fillStyle = `rgb(${cc[0]},${cc[1]},${cc[2]})`
      ctx.beginPath()
      ctx.roundRect(bx + (i % n) * c + 1, by + Math.floor(i / n) * c + 1, c - 2, c - 2, 4)
      ctx.fill()
    })
  } else if (laser) {
    const lv = genLaser(n, 4, 3, 1, r)
    const tr = trace(n, lv.src, lv.solution)
    ctx.strokeStyle = t.danger
    ctx.lineWidth = 3
    ctx.shadowColor = t.danger
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.moveTo(bx + 0.5 * c, by + (Math.floor(lv.src / n) + 0.5) * c)
    for (const i of tr.cells) ctx.lineTo(bx + ((i % n) + 0.5) * c, by + (Math.floor(i / n) + 0.5) * c)
    ctx.stroke()
    ctx.shadowBlur = 0
    lv.solution.forEach((mm, i) => {
      if (!mm) return
      const x = bx + (i % n) * c
      const y = by + Math.floor(i / n) * c
      ctx.strokeStyle = t.accent
      ctx.lineWidth = 3
      ctx.beginPath()
      if (mm === 1) {
        ctx.moveTo(x + 4, y + c - 4)
        ctx.lineTo(x + c - 4, y + 4)
      } else {
        ctx.moveTo(x + 4, y + 4)
        ctx.lineTo(x + c - 4, y + c - 4)
      }
      ctx.stroke()
    })
    for (const i of lv.targets) emoji(ctx, r.pick(t.items), bx + ((i % n) + 0.5) * c, by + (Math.floor(i / n) + 0.5) * c, 15)
    emoji(ctx, t.hero, bx + (lv.src % n + 0.5) * c, by + (Math.floor(lv.src / n) + 0.5) * c, 17)
  } else {
    // lights out / symmetry: a lit pattern
    const sym = m.includes('mirror') || /symmetr|mirror|fold|axis/.test(s)
    for (let i = 0; i < n * n; i++) {
      const x = i % n
      const y = Math.floor(i / n)
      const on = sym ? (r.chance(0.5) ? ((x * 3 + y * 5) % 4 < 2) : (Math.min(x, n - 1 - x) + y) % 3 === 0) : r.chance(0.4)
      const px = bx + x * c
      const py = by + y * c
      roundRect(ctx, px + 2, py + 2, c - 4, c - 4, 5, on ? (sym ? t.blocks[(x + y) % 3] : t.accent2) : 'rgba(0,0,0,0.45)')
      if (on && !sym) emoji(ctx, t.items[i % t.items.length], px + c / 2, py + c / 2, 12)
    }
  }
  emoji(ctx, t.hero, 34, h - 30, 36)
}
export default draw
