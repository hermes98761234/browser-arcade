import { background, emoji, roundRect } from '../engines/kit'
import { BLAST_SHAPES, cellsOf, genPacking } from '../engines/logic/blocks'
import type { PreviewFn } from '.'

const cell = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, c: string) => {
  roundRect(ctx, x + 1, y + 1, s - 2, s - 2, 3, c)
  ctx.fillStyle = 'rgba(255,255,255,.3)'
  ctx.fillRect(x + 2.5, y + 2.5, s - 5, 2)
}

const draw: PreviewFn = (ctx, w, h, t, r, g) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const label = `${g.name} ${g.desc}`
  const blast = /blast|grid|place/i.test(label)
  const classic = !blast && /tetris|falling|pile|terminal|body/i.test(g.name) && !/pack|polyomino|pentomino/i.test(g.name)
  if (classic) {
    const cs = 11
    const ox = w / 2 - 5 * cs
    const oy = 8
    roundRect(ctx, ox - 4, oy - 4, 10 * cs + 8, 18 * cs + 8, 5, 'rgba(0,0,0,.45)', t.accent, 1.5)
    for (let y = 8; y < 17; y++) for (let x = 0; x < 10; x++) if (r.chance(0.2 + (y - 8) * 0.085) && !(y > 13 && x === 4)) cell(ctx, ox + x * cs, oy + y * cs, cs, t.blocks[r.int(0, t.blocks.length - 1)])
    const ty = r.int(0, 6)
    for (const [cx, cy] of cellsOf(ty, r.int(0, 3))) cell(ctx, ox + (3 + cx) * cs, oy + (2 + cy) * cs, cs, t.blocks[ty % t.blocks.length])
    emoji(ctx, t.hero, ox - 50, 60, 40)
    emoji(ctx, r.pick(t.items), ox + 10 * cs + 50, 60, 30)
  } else if (blast) {
    const cs = 17
    const ox = w / 2 - 4 * cs - 40
    const oy = (h - 8 * cs) / 2
    roundRect(ctx, ox - 5, oy - 5, 8 * cs + 10, 8 * cs + 10, 6, 'rgba(0,0,0,.4)', t.accent, 1.5)
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (r.chance(0.4)) cell(ctx, ox + x * cs, oy + y * cs, cs, t.blocks[r.int(0, t.blocks.length - 1)])
    for (let i = 0; i < 3; i++) {
      const sh = BLAST_SHAPES[r.int(0, BLAST_SHAPES.length - 1)].cells
      for (const [cx, cy] of sh) cell(ctx, w / 2 + 70 + cx * 10, 30 + i * 46 + cy * 10, 10, t.blocks[(i + 2) % t.blocks.length])
    }
    emoji(ctx, t.hero, 40, 40, 34)
  } else {
    const p = genPacking(r, { w: 6, h: 5, size: 0, carve: 2 })
    const cs = 22
    const ox = 24
    const oy = (h - 5 * cs) / 2
    for (let y = 0; y < 5; y++) for (let x = 0; x < 6; x++) if (p.shape[y * 6 + x]) {
      ctx.fillStyle = 'rgba(255,255,255,.1)'
      ctx.fillRect(ox + x * cs, oy + y * cs, cs, cs)
    }
    p.solution.forEach((pc, i) => {
      if (i % 2) return
      for (const [cx, cy] of pc) cell(ctx, ox + cx * cs, oy + cy * cs, cs, t.blocks[i % t.blocks.length])
    })
    p.pieces.forEach((pc, i) => {
      if (!(i % 2)) return
      const bx = 190 + (i >> 1) * 40
      const by = 30 + ((i * 37) % 3) * 40
      for (const [cx, cy] of pc) cell(ctx, bx + cx * 11, by + cy * 11, 11, t.blocks[i % t.blocks.length])
    })
    emoji(ctx, t.hero, 270, 140, 32)
  }
}
export default draw
