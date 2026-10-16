import { background, emoji, roundRect, text } from '../engines/kit'
import { ANSWERS, evalGuess, TOPICS } from '../engines/logic/words'
import { pickSub } from '../engines/logic/words-ui'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 20, r.int(1, 1e6))
  const sub = pickSub(new Set(game.mods), `${game.name} ${game.desc}`)
  const mono = 'ui-monospace, Menlo, monospace'
  const tile = (x: number, y: number, s: number, ch: string, fill: string | undefined, stroke?: string) => {
    roundRect(ctx, x, y, s, s, 6, fill, stroke, 2)
    if (ch) text(ctx, ch.toUpperCase(), x + s / 2, y + s / 2 + 1, { size: s * 0.55, color: '#fff', font: mono })
  }
  if (sub === 'wordle') {
    const ans = r.pick(ANSWERS)
    const gs = [r.pick(ANSWERS), r.pick(ANSWERS), ans]
    const s = 30
    const x0 = (w - 5 * (s + 4)) / 2
    for (let row = 0; row < 4; row++) for (let i = 0; i < 5; i++) {
      const x = x0 + i * (s + 4)
      const y = 10 + row * (s + 4)
      if (row < 3) {
        const m = evalGuess(gs[row], ans)[i]
        tile(x, y, s, gs[row][i], m === 'g' ? t.good : m === 'y' ? '#e0a800' : 'rgba(255,255,255,.22)')
      } else tile(x, y, s, '', undefined, 'rgba(255,255,255,.4)')
    }
    emoji(ctx, t.hero, w - 30, h - 30, 34)
  } else if (sub === 'hive') {
    const L = 'AEIRNST'
    const pos = [[0, 0], [0, -34], [30, -17], [30, 17], [0, 34], [-30, 17], [-30, -17]]
    pos.forEach(([dx, dy], i) => {
      ctx.beginPath()
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k
        const px = w / 2 + dx + Math.cos(a) * 19
        const py = h / 2 + dy + Math.sin(a) * 19
        if (k) ctx.lineTo(px, py)
        else ctx.moveTo(px, py)
      }
      ctx.closePath()
      ctx.fillStyle = i === 0 ? t.accent : 'rgba(255,255,255,.2)'
      ctx.fill()
      text(ctx, L[i], w / 2 + dx, h / 2 + dy + 1, { size: 15, color: '#fff', font: mono })
    })
    emoji(ctx, t.hero, 34, 34, 34)
  } else if (sub === 'hangman') {
    ctx.strokeStyle = t.accent2
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(40, 160)
    ctx.lineTo(120, 160)
    ctx.moveTo(70, 160)
    ctx.lineTo(70, 25)
    ctx.lineTo(125, 25)
    ctx.lineTo(125, 42)
    ctx.stroke()
    ctx.strokeStyle = t.fg
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(125, 80)
    ctx.lineTo(125, 115)
    ctx.moveTo(125, 90)
    ctx.lineTo(108, 105)
    ctx.moveTo(125, 90)
    ctx.lineTo(142, 105)
    ctx.stroke()
    emoji(ctx, t.hero, 125, 62, 34)
    const word = 'HANGMAN'
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = t.fg
      ctx.fillRect(170 + i * 24, 120, 18, 3)
      if (i % 2 === 0) text(ctx, 'ABCDEF'[i], 179 + i * 24, 110, { size: 14, color: t.fg, font: mono })
    }
    void word
  } else if (sub === 'cipher') {
    const msg = 'KHOOR ZRUOG'
    msg.split('').forEach((ch, i) => {
      const x = 20 + i * 24
      if (ch === ' ') return
      text(ctx, ch, x + 9, 70, { size: 16, color: t.accent2, font: mono })
      ctx.fillStyle = t.fg
      ctx.fillRect(x, 96, 18, 3)
      if (i < 4) text(ctx, 'HELLO'[i], x + 9, 88, { size: 16, color: t.accent, font: 'Segoe Script, cursive' })
    })
    roundRect(ctx, 30, 120, w - 60, 36, 8, '#f5ecd2')
    text(ctx, 'Look before you leap', w / 2, 139, { size: 15, color: '#3b2a14', font: 'Segoe Script, Comic Sans MS, cursive', weight: 400 })
    emoji(ctx, t.hero, w - 34, 34, 34)
  } else if (sub === 'crossword') {
    const s = 24
    const cells: [number, number, string][] = [[1, 2, 'C'], [2, 2, 'A'], [3, 2, 'S'], [4, 2, 'T'], [5, 2, 'L'], [6, 2, 'E'], [3, 0, 'K'], [3, 1, 'N'], [3, 3, 'G'], [3, 4, 'H'], [3, 5, 'T'], [6, 3, 'A'], [6, 4, 'R'], [6, 5, 'M']]
    cells.forEach(([cx, cy, ch], i) => {
      const x = 40 + cx * (s + 2)
      const y = 14 + cy * (s + 2)
      roundRect(ctx, x, y, s, s, 4, i % 5 === 0 ? t.accent : 'rgba(255,255,255,.88)')
      text(ctx, ch, x + s / 2, y + s / 2 + 1, { size: 14, color: i % 5 === 0 ? '#fff' : '#111', font: mono })
    })
    emoji(ctx, t.hero, w - 40, h - 40, 40)
  } else {
    const topic = r.pick(Object.values(TOPICS)).filter((x) => x.length >= 4 && x.length <= 6)
    const word = r.pick(topic).toUpperCase()
    const n = 9
    const s = 17
    const x0 = 24
    const y0 = 14
    const row = 3
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const inWord = y === row && x < word.length
      if (inWord) roundRect(ctx, x0 + x * s, y0 + y * s, s - 1, s - 1, 4, t.accent)
      const ch = inWord ? word[x] : String.fromCharCode(65 + r.int(0, 25))
      text(ctx, ch, x0 + x * s + s / 2, y0 + y * s + s / 2 + 1, { size: 11, color: inWord ? '#fff' : t.fg, font: mono })
    }
    emoji(ctx, t.hero, w - 60, 50, 40)
    roundRect(ctx, x0 + n * s + 14, 100, 110, 22, 11, 'rgba(255,255,255,.15)')
    text(ctx, word, x0 + n * s + 69, 112, { size: 11, color: t.fg, font: mono })
  }
}
export default draw
