import { background, emoji, roundRect, text } from '../engines/kit'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const s = `${game.name} ${game.desc}`.toLowerCase()
  const m = game.mods
  const sudoku = m.includes('sudoku') || /sudoku|kenken|kakuro|futoshiki|suguru|kropki|latin/.test(s)
  const nono = !sudoku && (m.includes('nonogram') || /nonogram|picross|billboard|pixel/.test(s))
  const n = sudoku ? 9 : nono ? 7 : 9
  const c = sudoku ? 17 : nono ? 19 : 17
  const bx = (w - n * c) / 2 + (nono ? 12 : 0)
  const by = (h - n * c) / 2 + (nono ? 8 : 0)
  roundRect(ctx, bx - 5, by - 5, n * c + 10, n * c + 10, 8, 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.25)', 1.5)
  if (sudoku) {
    for (let i = 0; i < 81; i++) {
      const x = bx + (i % 9) * c
      const y = by + Math.floor(i / 9) * c
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.fillRect(x + 0.5, y + 0.5, c - 1, c - 1)
      if (r.chance(0.4)) text(ctx, `${r.int(1, 9)}`, x + c / 2, y + c / 2 + 1, { size: 9, color: r.chance(0.3) ? t.accent2 : t.fg })
    }
    ctx.strokeStyle = t.fg
    ctx.lineWidth = 2
    for (let i = 0; i <= 3; i++) {
      ctx.strokeRect(bx, by, 9 * c, 9 * c)
      ctx.beginPath()
      ctx.moveTo(bx + i * 3 * c, by)
      ctx.lineTo(bx + i * 3 * c, by + 9 * c)
      ctx.moveTo(bx, by + i * 3 * c)
      ctx.lineTo(bx + 9 * c, by + i * 3 * c)
      ctx.stroke()
    }
  } else if (nono) {
    for (let i = 0; i < 49; i++) {
      const x = bx + (i % 7) * c
      const y = by + Math.floor(i / 7) * c
      const fill = (i % 7 < 4 ? r.chance(0.55) : false) || (i % 7 > 3 && i % 7 < 7 && r.chance(0.5))
      roundRect(ctx, x + 1, y + 1, c - 2, c - 2, 3, fill ? t.accent : 'rgba(255,255,255,0.1)')
    }
    for (let i = 0; i < 7; i++) {
      text(ctx, `${r.int(1, 4)}`, bx - 8, by + (i + 0.5) * c, { size: 8, color: t.fg })
      text(ctx, `${r.int(1, 4)}`, bx + (i + 0.5) * c, by - 10, { size: 8, color: t.fg })
    }
  } else {
    // minesweeper
    for (let i = 0; i < 81; i++) {
      const x = bx + (i % 9) * c
      const y = by + Math.floor(i / 9) * c
      const open = (i % 9) + Math.floor(i / 9) < 9 && r.chance(0.8)
      roundRect(ctx, x + 1, y + 1, c - 2, c - 2, 3, open ? 'rgba(15,15,25,0.62)' : t.blocks[(i + Math.floor(i / 9)) % 2 ? 0 : 3])
      if (open && r.chance(0.3)) text(ctx, `${r.int(1, 3)}`, x + c / 2, y + c / 2 + 1, { size: 9, color: ['#60a5fa', '#4ade80', '#f87171'][r.int(0, 2)] })
    }
    emoji(ctx, '🚩', bx + 6 * c + c / 2, by + 6 * c + c / 2, 12)
    emoji(ctx, t.foes[0] ?? '💣', bx + 7 * c + c / 2, by + 7 * c + c / 2, 12)
  }
  emoji(ctx, t.hero, 32, h - 28, 34)
}
export default draw
