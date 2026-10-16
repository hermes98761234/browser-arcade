// Pure wave and bullet-pattern logic for the shmup engine.
import type { Rng } from '../kit'

export type Formation = 'line' | 'vee' | 'sine' | 'swarm' | 'diver' | 'hover' | 'grid'
export interface Group { kind: Formation; n: number; delay: number; x: number; foe: number; hp: number }
export interface WaveSpec { groups: Group[]; boss: boolean }

export function waveSpec(wave: number, rng: Rng, diff: 0 | 1 | 2, boss: boolean, invaders = false): WaveSpec {
  if (boss) return { groups: [], boss: true }
  const groups: Group[] = []
  const kinds: Formation[] = invaders ? ['grid'] : ['line', 'vee', 'sine', 'swarm', 'diver', 'hover']
  const count = Math.min(2 + Math.floor((wave + diff) / 2), 5)
  let t = 0
  for (let i = 0; i < count; i++) {
    const kind = invaders ? 'grid' : rng.pick(kinds.slice(0, Math.min(kinds.length, 3 + Math.floor(wave / 2))))
    const n = kind === 'grid' ? 0 : kind === 'hover' ? rng.int(1, 2 + Math.floor(wave / 4)) : rng.int(4, Math.min(9, 5 + wave))
    groups.push({ kind, n, delay: t, x: rng.range(0.2, 0.8), foe: rng.int(0, 5), hp: 1 + Math.floor((wave + diff) / 3) + (kind === 'hover' ? 3 : 0) })
    t += kind === 'hover' ? 2.5 : 3.2 - Math.min(1.2, wave * 0.1)
    if (kind === 'grid') break
  }
  return { groups, boss: false }
}

export type BossKind = 'ring' | 'fan' | 'spiral' | 'rain' | 'flower'
export interface Shot { a: number; spd: number }

/** Bullet angles for one volley. n = density, k = volley counter (drives rotation), aim = angle to the player. */
export function bossVolley(kind: BossKind, n: number, k: number, aim: number): Shot[] {
  const out: Shot[] = []
  const TAU = Math.PI * 2
  switch (kind) {
    case 'ring':
      for (let i = 0; i < n; i++) out.push({ a: (i / n) * TAU + k * 0.21, spd: 1 })
      break
    case 'fan':
      for (let i = 0; i < n; i++) out.push({ a: aim + (i - (n - 1) / 2) * 0.16, spd: 1.15 })
      break
    case 'spiral':
      for (let i = 0; i < 3; i++) out.push({ a: k * 0.33 + (i * TAU) / 3, spd: 1 })
      break
    case 'rain':
      for (let i = 0; i < Math.ceil(n / 3); i++) out.push({ a: Math.PI / 2 + Math.sin(k * 1.7 + i * 2.1) * 0.9, spd: 0.8 + ((i * 37 + k * 11) % 10) / 20 })
      break
    case 'flower':
      for (let i = 0; i < n; i++) {
        const p = (i / n) * TAU
        out.push({ a: p, spd: 0.7 + 0.35 * Math.abs(Math.cos(p * 2.5 + k * 0.4)) })
      }
      break
  }
  return out
}

export const BOSS_KINDS: BossKind[] = ['ring', 'fan', 'spiral', 'rain', 'flower']
