// Pure tower-defense logic: winding path generator and wave composition.
import type { Rng } from '../kit'

export interface Cell { x: number; y: number }

/** A winding left-to-right path of orthogonally connected, unique cells. */
export function genPath(rng: Rng, cols: number, rows: number): Cell[] {
  const xs = [0]
  let x = 0
  while (x < cols - 1) {
    x = Math.min(cols - 1, x + rng.int(3, 4))
    if (cols - 1 - x < 3) x = cols - 1
    xs.push(x)
  }
  const rs = [rng.int(1, rows - 2)]
  for (let i = 1; i < xs.length; i++) {
    const prev = rs[i - 1]
    const opts: number[] = []
    for (let r = 1; r <= rows - 2; r++) if (Math.abs(r - prev) >= 3) opts.push(r)
    rs.push(opts.length ? rng.pick(opts) : prev)
  }
  const out: Cell[] = []
  const push = (c: Cell) => {
    const l = out[out.length - 1]
    if (!l || l.x !== c.x || l.y !== c.y) out.push(c)
  }
  for (let i = 0; i < xs.length - 1; i++) {
    for (let cx = xs[i]; cx <= xs[i + 1]; cx++) push({ x: cx, y: rs[i] })
    const dir = Math.sign(rs[i + 1] - rs[i])
    for (let cy = rs[i]; cy !== rs[i + 1] + dir; cy += dir) push({ x: xs[i + 1], y: cy })
  }
  return out
}

export type FoeKind = 'grunt' | 'runner' | 'tank' | 'swarm' | 'boss'
export interface WaveGroup { kind: FoeKind; count: number }

/** Composition of wave n (1-based) out of total waves. */
export function waveSpec(n: number, total: number, bossMod: boolean): WaveGroup[] {
  const g: WaveGroup[] = [{ kind: 'grunt', count: Math.min(24, 5 + n) }]
  if (n % 3 === 2) g.push({ kind: 'runner', count: 4 + Math.floor(n / 2) })
  if (n >= 4) g.push({ kind: 'tank', count: Math.floor(n / 3) })
  if (n >= 7 && n % 2 === 1) g.push({ kind: 'swarm', count: 10 + n })
  if (n === total || (bossMod && n % 5 === 0)) g.push({ kind: 'boss', count: n === total ? (bossMod ? 2 : 1) : 1 })
  return g
}

export const hpScale = (n: number) => Math.pow(1.17, n - 1)
