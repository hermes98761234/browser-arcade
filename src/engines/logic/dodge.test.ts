import { describe, expect, it } from 'vitest'
import { detectMode, spawnGap, speedAt } from './dodge'

describe('dodge logic', () => {
  it('picks the new sub-modes', () => {
    expect(detectMode('Wall Closer', 'dodge closing walls gaps', new Set()).mode).toBe('walls')
    expect(detectMode('Ninja Lantern', 'avoid light cones, strike unseen', new Set()).mode).toBe('sneak')
    expect(detectMode('Hedgehog Hop', 'dodge cars rolling as hedgehog', new Set()).mode).toBe('lanes')
    expect(detectMode('Pearl Hunter', 'dive for pearls, avoid eels', new Set(['swim'])).mode).toBe('gather')
  })
  it('picks sub-modes from keywords', () => {
    expect(detectMode('Popcorn Popper', 'catch popping kernels', new Set()).mode).toBe('catch')
    expect(detectMode('Shrinking Safe Zone', 'stay inside', new Set()).mode).toBe('zone')
    expect(detectMode('X', 'y', new Set(['laser'])).mode).toBe('laser')
    expect(detectMode('Arrow Rain', 'dodge hail of arrows', new Set()).free).toBe(true)
    expect(detectMode('Egg Catch', 'catch eggs', new Set()).free).toBe(false)
  })
  it('gets harder over time but stays bounded', () => {
    expect(spawnGap(60, 1, 0.2)).toBeLessThan(spawnGap(0, 1, 0.2))
    expect(spawnGap(9999, 1, 0.2)).toBe(0.2)
    expect(speedAt(100, 1)).toBeGreaterThan(speedAt(0, 1))
    expect(speedAt(9999, 2)).toBeLessThan(3)
  })
})
