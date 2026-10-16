// Pure helpers for the pong engine: ball prediction, paddle bounce, circle collisions.

/** Where a ball at (x,y) moving (vx,vy) will be (y) when it reaches targetX, with reflections off top/bottom walls. */
export function predictY(x: number, y: number, vx: number, vy: number, targetX: number, top: number, bottom: number): number {
  if (vx === 0) return y
  const t = (targetX - x) / vx
  if (t < 0) return y
  const span = bottom - top
  let yy = (y + vy * t - top) % (2 * span)
  if (yy < 0) yy += 2 * span
  return top + (yy > span ? 2 * span - yy : yy)
}

/** Outgoing velocity after hitting a paddle. off in [-1, 1] (hit position), dir = +1 when ball goes right. */
export function paddleBounce(speed: number, off: number, dir: 1 | -1, paddleVy = 0, maxAngle = 0.95): { vx: number; vy: number } {
  const a = Math.max(-1, Math.min(1, off)) * maxAngle
  let vx = Math.cos(a) * speed * dir
  let vy = Math.sin(a) * speed + paddleVy * 0.25
  // keep the ball travelling mostly sideways
  const min = Math.abs(speed) * 0.35
  if (Math.abs(vx) < min) vx = min * dir
  const k = speed / Math.hypot(vx, vy)
  vx *= k
  vy *= k
  return { vx, vy }
}

export interface Circ { x: number; y: number; vx: number; vy: number; r: number }

/**
 * Ball vs. a moving round obstacle (slime dome / air-hockey paddle). Mutates the ball.
 * Returns true on contact. restitution scales the bounce, `carry` how much of the obstacle's velocity is added.
 */
export function bounceOffCircle(b: Circ, ox: number, oy: number, ovx: number, ovy: number, or: number, restitution = 1, carry = 1): boolean {
  const dx = b.x - ox
  const dy = b.y - oy
  const d = Math.hypot(dx, dy)
  const min = b.r + or
  if (d >= min || d === 0) return false
  const nx = dx / d
  const ny = dy / d
  b.x = ox + nx * min
  b.y = oy + ny * min
  const rvx = b.vx - ovx
  const rvy = b.vy - ovy
  const vn = rvx * nx + rvy * ny
  if (vn < 0) {
    b.vx -= (1 + restitution) * vn * nx
    b.vy -= (1 + restitution) * vn * ny
  }
  b.vx += ovx * carry * 0.5
  b.vy += ovy * carry * 0.5
  return true
}

/** Landing x of a ball under gravity g at floor y (ignores bounces off the net). */
export function landingX(x: number, y: number, vx: number, vy: number, g: number, floor: number): number {
  // y + vy t + g t^2/2 = floor
  const disc = vy * vy + 2 * g * (floor - y)
  if (disc < 0) return x
  const t = (-vy + Math.sqrt(disc)) / g
  return x + vx * Math.max(0, t)
}
