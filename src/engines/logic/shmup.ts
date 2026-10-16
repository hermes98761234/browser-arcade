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

export type BossKind = 'ring' | 'fan' | 'spiral' | 'rain' | 'flower' | 'snow' | 'star' | 'ribbon' | 'curtain'
export interface Shot { a: number; spd: number; dx?: number }
export type PatternStyle = 'mixed' | 'flower' | 'spiral' | 'snow' | 'star' | 'ribbon' | 'curtain'

/** Boss pattern kinds per phase, by the game's pattern style. */
export function kindsFor(style: PatternStyle, offset: number): BossKind[] {
  const L: Record<PatternStyle, BossKind[]> = {
    mixed: BOSS_KINDS,
    flower: ['flower', 'ring', 'flower', 'fan', 'flower'],
    spiral: ['spiral', 'ring', 'spiral', 'fan', 'spiral'],
    snow: ['snow', 'ring', 'snow', 'fan', 'snow'],
    star: ['star', 'fan', 'star', 'ring', 'star'],
    ribbon: ['ribbon', 'fan', 'ribbon', 'spiral', 'ribbon'],
    curtain: ['curtain', 'rain', 'curtain', 'fan', 'curtain'],
  }
  const l = L[style]
  return [l[offset % 5], l[(offset + 1) % 5], l[(offset + 3) % 5]]
}

/** Pattern style picked from a game's name and description. */
export function patternStyle(s: string): PatternStyle {
  if (/snowflake|fractal/.test(s)) return 'snow'
  if (/constellation|starlight|star path/.test(s)) return 'star'
  if (/flower|bloom|petal|garden|blossom|cathedral|stained/.test(s)) return 'flower'
  if (/ribbon|laser/.test(s)) return 'ribbon'
  if (/curtain/.test(s)) return 'curtain'
  if (/spiral|inferno|vortex|overload|reactor/.test(s)) return 'spiral'
  return 'mixed'
}

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
    case 'snow':
      for (let arm = 0; arm < 6; arm++) {
        const b = (arm / 6) * TAU + k * 0.07
        out.push({ a: b, spd: 1.1 }, { a: b + 0.13, spd: 0.85 }, { a: b - 0.13, spd: 0.85 }, { a: b + 0.26, spd: 0.65 }, { a: b - 0.26, spd: 0.65 })
      }
      break
    case 'star':
      for (let i = 0; i < n * 2; i++) {
        const a = (i / (n * 2)) * TAU
        const tri = Math.abs((((a * 5) / TAU + k * 0.02) % 1) - 0.5) * 2
        out.push({ a, spd: 0.55 + 0.75 * tri })
      }
      break
    case 'ribbon':
      for (let i = 0; i < 3; i++) out.push({ a: Math.PI / 2 + Math.sin(k * 0.17) * 1.15 + (i - 1) * 0.07, spd: 1.1 })
      break
    case 'curtain': {
      const gap = Math.floor((Math.sin(k * 0.6) * 0.5 + 0.5) * 11)
      for (let i = 0; i < 12; i++) if (Math.abs(i - gap) > 1) out.push({ a: Math.PI / 2, spd: 0.75, dx: (i / 11 - 0.5) * 400 })
      break
    }
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
