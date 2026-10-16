// Pure wave/upgrade logic for the arena engine.
import type { Rng } from '../kit'

export type FoeKind = 'grunt' | 'runner' | 'brute' | 'shooter' | 'splitter' | 'boss'
export interface Spawn { kind: FoeKind; n: number }

/** Composition of a wave. The last wave (wave === total) is a boss wave. */
export function waveComposition(wave: number, total: number, diff: 0 | 1 | 2): Spawn[] {
  if (wave >= total) return [{ kind: 'boss', n: 1 }, { kind: 'grunt', n: 4 + diff * 2 }]
  const base = 4 + wave * 2 + diff * 2
  const out: Spawn[] = [{ kind: 'grunt', n: base }]
  if (wave >= 2) out.push({ kind: 'runner', n: Math.floor(wave / 2) + diff })
  if (wave >= 3) out.push({ kind: 'shooter', n: Math.floor((wave - 1) / 2) + diff })
  if (wave >= 4) out.push({ kind: 'brute', n: Math.floor((wave - 2) / 2) + (diff > 1 ? 1 : 0) })
  if (wave >= 5) out.push({ kind: 'splitter', n: Math.floor((wave - 3) / 2) })
  return out
}

export interface Upgrade { id: string; name: string; icon: string; desc: string; max: number }
export const UPGRADES: Upgrade[] = [
  { id: 'dmg', name: 'Power', icon: '💥', desc: '+30% damage', max: 5 },
  { id: 'rate', name: 'Rapid', icon: '⚡', desc: '+20% attack speed', max: 5 },
  { id: 'speed', name: 'Swift', icon: '👟', desc: '+12% move speed', max: 4 },
  { id: 'multi', name: 'Multi', icon: '🔱', desc: 'Extra shot / wider swing', max: 3 },
  { id: 'range', name: 'Reach', icon: '🎯', desc: 'Longer range', max: 4 },
  { id: 'pierce', name: 'Pierce', icon: '🗡️', desc: 'Hits more foes / knockback', max: 3 },
  { id: 'hp', name: 'Vital', icon: '❤️', desc: '+1 max health, heal', max: 3 },
  { id: 'magnet', name: 'Magnet', icon: '🧲', desc: 'Pickups come to you', max: 3 },
]

export function pickUpgrades(rng: Rng, taken: Record<string, number>, n = 3): Upgrade[] {
  const pool = UPGRADES.filter((u) => (taken[u.id] ?? 0) < u.max)
  return rng.shuffle(pool.slice()).slice(0, n)
}

/** Radius after eating: area-conserving growth. */
export const grow = (r: number, eatenR: number) => Math.sqrt(r * r + eatenR * eatenR * 0.8)
