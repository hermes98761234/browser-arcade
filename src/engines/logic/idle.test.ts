import { describe, expect, it } from 'vitest'
import { bulkCost, fmt, maxAffordable, pickFlavor, pickMode, pickShop, pickTrade, unitCost } from './idle'

describe('idle logic', () => {
  it('formats numbers', () => {
    expect(fmt(950)).toBe('950')
    expect(fmt(1500)).toBe('1.50K')
    expect(fmt(2.5e6)).toBe('2.50M')
    expect(fmt(7.25e9)).toBe('7.25B')
  })
  it('bulk cost matches repeated unit cost', () => {
    let s = 0
    for (let i = 0; i < 7; i++) s += unitCost(15, 3 + i)
    expect(bulkCost(15, 3, 7)).toBeCloseTo(s, 6)
    const n = maxAffordable(15, 3, 5000)
    expect(bulkCost(15, 3, n)).toBeLessThanOrEqual(5000)
    expect(bulkCost(15, 3, n + 1)).toBeGreaterThan(5000)
  })
  it('picks flavor and mode from keywords', () => {
    expect(pickFlavor('Black Hole Bakery').unit).toBe('loaves')
    expect(pickFlavor('Planet Terraformer').coin).toBe('🌍')
    expect(pickMode('Coffee Shop Barista', new Set())).toBe('shop')
    expect(pickMode('Space Trader', new Set(['trade']))).toBe('trade')
    expect(pickMode('Idle Farm Valley', new Set(['farm']))).toBe('farm')
    expect(pickMode('Cookie Empire', new Set())).toBe('idle')
  })
  it('routes management sims to fitting modes and names', () => {
    const none = new Set<string>()
    expect(pickMode('Hospital Manager treat patients', none)).toBe('shop')
    expect(pickShop('Hospital Manager treat patients').who).toBe('patients')
    expect(pickMode('Stock Market Sim trade stocks', none)).toBe('trade')
    expect(pickTrade('Stock Market Sim trade stocks').cargo).toBe('Portfolio')
    expect(pickMode('Space Colony manage oxygen & food', none)).toBe('colony')
    expect(pickMode('Pocket Metropolis tiny city on a 10x10 grid', none)).toBe('build')
    expect(pickMode('Idle Wizard Academy train wizards', none)).toBe('idle')
    expect(pickFlavor('Mini Football Manager').unit).toBe('fans')
    expect(pickFlavor('Idle Train Network rail empire').prod[3][0]).toBe('Station')
    expect(pickMode('Cookie Empire click cookies', none)).toBe('idle')
  })
})
