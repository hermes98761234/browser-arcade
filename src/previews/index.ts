// Card thumbnails: each engine draws a small static scene (src/previews/<engine>.ts). Falls back to a themed collage.
import { background, emoji, makeRng, type Rng } from '../engines/kit'
import type { Game } from '../lib/catalog'
import { THEMES, type Theme } from '../lib/themes'

/** Draw a 320×180 logical thumbnail. Must be fast (≤ 2 ms) and must not use timers or the DOM. */
export type PreviewFn = (ctx: CanvasRenderingContext2D, w: number, h: number, theme: Theme, rng: Rng, game: Game) => void

const mods = import.meta.glob<{ default: PreviewFn }>(['./*.ts', '!./index.ts'], { eager: true })
const byEngine = new Map(Object.entries(mods).map(([p, m]) => [p.slice(2, -3), m.default]))

export const W = 320
export const H = 180

export function fallbackPreview(ctx: CanvasRenderingContext2D, w: number, h: number, t: Theme, r: Rng) {
  background(ctx, w, h, t, 30, r.int(1, 1e6))
  for (let i = 0; i < 9; i++) emoji(ctx, r.pick([...t.items, ...t.foes]), r.range(20, w - 20), r.range(20, h - 20), r.range(16, 30), r.range(-0.4, 0.4))
  emoji(ctx, t.hero, w / 2, h / 2, 64)
}

export function drawPreview(canvas: HTMLCanvasElement, game: Game, dpr = Math.min(2, window.devicePixelRatio || 1)) {
  canvas.width = W * dpr
  canvas.height = H * dpr
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const t = { ...THEMES[game.theme], hero: game.hero }
  const r = makeRng(game.seed)
  const fn = byEngine.get(game.engine)
  try {
    if (fn) fn(ctx, W, H, t, r, game)
    else fallbackPreview(ctx, W, H, t, r)
  } catch {
    fallbackPreview(ctx, W, H, t, makeRng(game.seed))
  }
}
