import { background, emoji, roundRect } from '../engines/kit'
import { pickMode } from '../engines/logic/boardmode'
import type { PreviewFn } from '.'

const draw: PreviewFn = (ctx, w, h, t, r, game) => {
  background(ctx, w, h, t, 25, r.int(1, 1e6))
  const mode = pickMode(game.name, game.desc, game.mods)
  const foe = t.foes[0] ?? '👾'
  const p0 = (x: number, y: number, s: number) => {
    ctx.beginPath()
    ctx.arc(x, y, s, 0, Math.PI * 2)
    ctx.fillStyle = t.accent
    ctx.fill()
    emoji(ctx, t.hero, x, y, s * 1.2)
  }
  const p1 = (x: number, y: number, s: number) => {
    ctx.beginPath()
    ctx.arc(x, y, s, 0, Math.PI * 2)
    ctx.fillStyle = t.accent2
    ctx.fill()
    emoji(ctx, foe, x, y, s * 1.2)
  }
  const grid = (n: number, cs: number, x0: number, y0: number, light: string, dark: string) => {
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      ctx.fillStyle = (i + j) % 2 ? dark : light
      ctx.fillRect(x0 + j * cs, y0 + i * cs, cs, cs)
    }
  }
  const cx = w / 2
  if (mode === 'chess' || mode === 'checkers' || mode === 'reversi') {
    const n = 8
    const cs = 19
    const x0 = cx - (n * cs) / 2
    const y0 = (h - n * cs) / 2
    roundRect(ctx, x0 - 6, y0 - 6, n * cs + 12, n * cs + 12, 6, '#2a2118')
    if (mode === 'reversi') {
      ctx.fillStyle = t.good
      ctx.fillRect(x0, y0, n * cs, n * cs)
      ctx.fillStyle = 'rgba(0,0,0,.4)'
      ctx.fillRect(x0, y0, n * cs, n * cs)
    } else grid(n, cs, x0, y0, '#e9d8b4', mode === 'chess' ? '#9a6b45' : '#6b3f26')
    for (let i = 0; i < 26; i++) {
      const rr = r.int(0, 7)
      const c = r.int(0, 7)
      if (mode === 'checkers' && (rr + c) % 2 === 0) continue
      const x = x0 + c * cs + cs / 2
      const y = y0 + rr * cs + cs / 2
      if (mode === 'chess') {
        ctx.font = `${cs - 2}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const white = r.chance(0.5)
        ctx.fillStyle = white ? '#fbf6e8' : '#262633'
        ctx.strokeStyle = white ? '#14141c' : '#f0e6c8'
        ctx.lineWidth = 1.5
        const g = '♟♞♝♜♛♚'[r.int(0, 5)] + '︎'
        ctx.strokeText(g, x, y)
        ctx.fillText(g, x, y)
      } else (r.chance(0.5) ? p0 : p1)(x, y, cs * 0.4)
    }
  } else if (mode === 'connect') {
    const cs = 22
    const x0 = cx - 3.5 * cs
    const y0 = h / 2 - 3 * cs
    roundRect(ctx, x0 - 6, y0 - 6, 7 * cs + 12, 6 * cs + 12, 10, '#1d4ed8')
    for (let rr = 0; rr < 6; rr++) for (let c = 0; c < 7; c++) {
      const x = x0 + c * cs + cs / 2
      const y = y0 + rr * cs + cs / 2
      const v = rr > 2 && r.chance(0.8) ? (r.chance(0.5) ? 0 : 1) : -1
      if (v < 0) {
        ctx.beginPath()
        ctx.arc(x, y, cs * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = t.bg
        ctx.fill()
      } else (v ? p1 : p0)(x, y, cs * 0.4)
    }
  } else if (mode === 'ttt') {
    const cs = 52
    const x0 = cx - 1.5 * cs
    const y0 = h / 2 - 1.5 * cs
    ctx.strokeStyle = t.fg
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    for (let i = 1; i < 3; i++) {
      ctx.beginPath()
      ctx.moveTo(x0 + i * cs, y0 + 4)
      ctx.lineTo(x0 + i * cs, y0 + 3 * cs - 4)
      ctx.moveTo(x0 + 4, y0 + i * cs)
      ctx.lineTo(x0 + 3 * cs - 4, y0 + i * cs)
      ctx.stroke()
    }
    for (const [i, who] of [[0, 0], [4, 0], [8, 0], [1, 1], [5, 1], [6, 1]] as const) emoji(ctx, who ? foe : t.hero, x0 + (i % 3) * cs + cs / 2, y0 + ((i / 3) | 0) * cs + cs / 2, 38)
  } else if (mode === 'mancala') {
    roundRect(ctx, 30, 40, w - 60, 100, 40, '#6b4426')
    for (let i = 0; i < 6; i++) for (let rr = 0; rr < 2; rr++) {
      const x = 76 + i * 32
      const y = 72 + rr * 36
      ctx.beginPath()
      ctx.arc(x, y, 14, 0, Math.PI * 2)
      ctx.fillStyle = '#34200f'
      ctx.fill()
      for (let k = 0; k < r.int(1, 5); k++) {
        ctx.beginPath()
        ctx.arc(x + r.range(-6, 6), y + r.range(-6, 6), 3, 0, Math.PI * 2)
        ctx.fillStyle = r.pick(t.blocks)
        ctx.fill()
      }
    }
    for (const x of [48, w - 48]) {
      roundRect(ctx, x - 14, 56, 28, 68, 14, '#34200f')
    }
    emoji(ctx, t.hero, w - 48, 90, 22)
    emoji(ctx, foe, 48, 90, 22)
  } else if (mode === 'gomoku' || mode === 'go') {
    const n = mode === 'go' ? 9 : 11
    const cs = mode === 'go' ? 17 : 14
    const x0 = cx - ((n - 1) * cs) / 2
    const y0 = h / 2 - ((n - 1) * cs) / 2
    roundRect(ctx, x0 - 12, y0 - 12, (n - 1) * cs + 24, (n - 1) * cs + 24, 6, '#d2a35f')
    ctx.strokeStyle = 'rgba(50,30,8,.8)'
    ctx.lineWidth = 1
    for (let i = 0; i < n; i++) {
      ctx.beginPath()
      ctx.moveTo(x0, y0 + i * cs)
      ctx.lineTo(x0 + (n - 1) * cs, y0 + i * cs)
      ctx.moveTo(x0 + i * cs, y0)
      ctx.lineTo(x0 + i * cs, y0 + (n - 1) * cs)
      ctx.stroke()
    }
    for (let i = 0; i < 22; i++) {
      const x = x0 + r.int(1, n - 2) * cs
      const y = y0 + r.int(1, n - 2) * cs
      ctx.beginPath()
      ctx.arc(x, y, cs * 0.42, 0, Math.PI * 2)
      ctx.fillStyle = i % 2 ? '#f4f4f8' : '#16161d'
      ctx.fill()
    }
  } else if (mode === 'dots') {
    const n = 4
    const cs = 34
    const x0 = cx - (n * cs) / 2
    const y0 = h / 2 - (n * cs) / 2
    for (let i = 0; i < n * n; i++) {
      if (r.chance(0.4)) {
        ctx.globalAlpha = 0.4
        ctx.fillStyle = r.chance(0.5) ? t.accent : t.accent2
        ctx.fillRect(x0 + (i % n) * cs + 3, y0 + ((i / n) | 0) * cs + 3, cs - 6, cs - 6)
        ctx.globalAlpha = 1
        emoji(ctx, r.chance(0.5) ? t.hero : foe, x0 + (i % n) * cs + cs / 2, y0 + ((i / n) | 0) * cs + cs / 2, 18)
      }
    }
    ctx.strokeStyle = t.fg
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
      if (j < n && r.chance(0.6)) {
        ctx.beginPath()
        ctx.moveTo(x0 + j * cs, y0 + i * cs)
        ctx.lineTo(x0 + (j + 1) * cs, y0 + i * cs)
        ctx.stroke()
      }
      if (i < n && r.chance(0.6)) {
        ctx.beginPath()
        ctx.moveTo(x0 + j * cs, y0 + i * cs)
        ctx.lineTo(x0 + j * cs, y0 + (i + 1) * cs)
        ctx.stroke()
      }
    }
    ctx.fillStyle = '#fff'
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
      ctx.beginPath()
      ctx.arc(x0 + j * cs, y0 + i * cs, 3.5, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (mode === 'nim') {
    ;[3, 5, 7, 4].forEach((n, row) => {
      for (let k = 0; k < n; k++) emoji(ctx, t.items[row % t.items.length], 60 + k * 30, 36 + row * 36, 26)
    })
  } else {
    // hex
    const R = 13
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      const x = 70 + j * R * 1.73 + i * R * 0.87
      const y = 28 + i * R * 1.5
      ctx.beginPath()
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k + Math.PI / 6
        const px = x + Math.cos(a) * (R - 1)
        const py = y + Math.sin(a) * (R - 1)
        if (k) ctx.lineTo(px, py)
        else ctx.moveTo(px, py)
      }
      ctx.closePath()
      ctx.fillStyle = 'rgba(255,255,255,.12)'
      ctx.fill()
      if (r.chance(0.35)) (r.chance(0.5) ? p0 : p1)(x, y, R * 0.7)
    }
  }
  emoji(ctx, t.hero, 26, h - 24, 26)
}
export default draw
