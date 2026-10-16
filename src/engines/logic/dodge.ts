// Pure helpers for the dodge engine: sub-mode detection and spawn pacing.
export type DodgeMode = 'catch' | 'rain' | 'sides' | 'homing' | 'zone' | 'rings' | 'laser' | 'walls' | 'bounce' | 'spin' | 'strike' | 'lanes' | 'gather' | 'sneak'

export function detectMode(name: string, desc: string, mods: Set<string>): { mode: DodgeMode; free: boolean } {
  const s = `${name} ${desc}`.toLowerCase()
  if (/footsteps|owl scout|sneak|stealth|unseen|light cones|hunters|camera|disguise|blend/.test(s)) return { mode: 'sneak', free: true }
  if (/closing wall|wall closer/.test(s)) return { mode: 'walls', free: true }
  if (/bouncing|saw blade|multiplying/.test(s)) return { mode: 'bounce', free: true }
  if (/spinning blade|rotating blade|blade arms/.test(s)) return { mode: 'spin', free: true }
  if (/thunder|lightning|strike warning/.test(s)) return { mode: 'strike', free: true }
  if (/hedgehog|cars\b|stamped|traffic|crossing/.test(s)) return { mode: 'lanes', free: true }
  if (/sonar|\bping/.test(s)) return { mode: 'rings', free: true }
  if (/scoop|dive for|dive and|bubbles to breathe|find light|release|midair|nocturnal|harvest|gas cloud|pearl|lure|rescue|capture|photograph/.test(s)) return { mode: 'gather', free: true }
  if (mods.has('laser') || /laser|beam/.test(s)) return { mode: 'laser', free: true }
  if (/zone|shrink|in circle/.test(s)) return { mode: 'zone', free: true }
  if (/shockwave|ring/.test(s)) return { mode: 'rings', free: true }
  if (/ghost|drift through|haunt|cursor|chase|missile|bee swarm|chasing|homing/.test(s)) return { mode: 'homing', free: true }
  if (/catch|collect|basket|bowl|jar|net\b|pounce|gather|egg|kernel|snack|chomp|\beat\b/.test(s)) return { mode: 'catch', free: false }
  if (/barrage|fireball|all sides|swat|shuriken|star storm|squares?\b|snowball/.test(s)) return { mode: 'sides', free: true }
  return { mode: 'rain', free: /dodge|survive|avoid|panic|storm|escape|getaway|rain|hail/.test(s) || mods.has('rotate') }
}

/** Seconds between spawns at time t (shrinks as the game gets harder), never below the floor. */
export function spawnGap(t: number, base: number, floor: number): number {
  return Math.max(floor, base / (1 + t / 25))
}

/** Fall speed multiplier at time t. */
export const speedAt = (t: number, diff: 0 | 1 | 2) => (0.85 + diff * 0.15) * (1 + Math.min(1.4, t / 70))


/** Is a point inside a guard's vision cone? (angle a, half-angle half, range len) */
export function inCone(gx: number, gy: number, a: number, half: number, len: number, px: number, py: number): boolean {
  const d = Math.hypot(px - gx, py - gy)
  if (d > len) return false
  let da = Math.atan2(py - gy, px - gx) - a
  da = Math.atan2(Math.sin(da), Math.cos(da))
  return Math.abs(da) < half
}

/** Distance from a point to a segment. */
export function segDist(ax: number, ay: number, bx: number, by: number, px: number, py: number): number {
  const vx = bx - ax
  const vy = by - ay
  const l2 = vx * vx + vy * vy || 1
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l2))
  return Math.hypot(px - (ax + vx * t), py - (ay + vy * t))
}
