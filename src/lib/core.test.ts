import { describe, expect, it } from 'vitest'
import { solve } from './core'

describe('core', () => {
  it('matches a hand-worked reference value', () => {
    const r = solve({ voltage: 12, resistance: 220 })
    expect(r.current).toBeCloseTo(0.054545, 5)
    expect(r.power).toBeCloseTo(0.654545, 5)
  })
})
