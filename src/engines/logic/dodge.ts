// Pure helpers for the dodge engine: sub-mode detection and spawn pacing.
export type DodgeMode = 'catch' | 'rain' | 'sides' | 'homing' | 'zone' | 'rings' | 'laser'

export function detectMode(name: string, desc: string, mods: Set<string>): { mode: DodgeMode; free: boolean } {
  const s = `${name} ${desc}`.toLowerCase()
  if (mods.has('laser') || /laser|beam/.test(s)) return { mode: 'laser', free: true }
  if (/zone|shrink/.test(s)) return { mode: 'zone', free: true }
  if (/shockwave|ring/.test(s)) return { mode: 'rings', free: true }
  if (/ghost|drift through|haunt|cursor|chase/.test(s)) return { mode: 'homing', free: true }
  if (/catch|collect|basket|bowl|jar|net\b|pounce|gather|egg|kernel|snack/.test(s)) return { mode: 'catch', free: false }
  if (/barrage|fireball|all sides|swat|shuriken|star storm|squares?\b/.test(s)) return { mode: 'sides', free: true }
  return { mode: 'rain', free: /dodge|survive|avoid|panic|storm|escape|getaway|rain|hail/.test(s) || mods.has('rotate') }
}

/** Seconds between spawns at time t (shrinks as the game gets harder), never below the floor. */
export function spawnGap(t: number, base: number, floor: number): number {
  return Math.max(floor, base / (1 + t / 25))
}

/** Fall speed multiplier at time t. */
export const speedAt = (t: number, diff: 0 | 1 | 2) => (0.85 + diff * 0.15) * (1 + Math.min(1.4, t / 70))
