// Starter domain logic: replace with the tool's real maths. Keep it pure (no DOM, no React) so vitest can check it.
export interface Inputs {
  voltage: number
  resistance: number
}

export const DEFAULTS: Inputs = { voltage: 12, resistance: 220 }

/** Ohm's law: current (A) and power (W) dissipated in a resistor. */
export function solve(i: Inputs): { current: number; power: number } {
  const current = i.voltage / i.resistance
  return { current, power: i.voltage * current }
}
