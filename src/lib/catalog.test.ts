import { describe, expect, it } from 'vitest'
import raw from '../data/raw.json'
import { buildCatalog, DEFAULT_FILTERS, featuredOrder, filterGames, filtersToQuery, pageList, paginate, queryToFilters, type RawGame } from './catalog'
import { ENGINE_IDS } from './engines'

const games = buildCatalog(raw.games as RawGame[])

describe('catalog', () => {
  it('parses all 3000 games with unique slugs', () => {
    expect(games).toHaveLength(3000)
    expect(new Set(games.map((g) => g.slug)).size).toBe(3000)
  })
  it('uses every engine and no engine dominates', () => {
    const count = new Map<string, number>()
    for (const g of games) count.set(g.engine, (count.get(g.engine) ?? 0) + 1)
    if (process.env.DIST) console.log([...count].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' '))
    for (const e of ENGINE_IDS) expect(count.get(e) ?? 0, e).toBeGreaterThan(0)
    for (const v of count.values()) expect(v).toBeLessThan(300)
  })
  it('classifies well-known entries sensibly', () => {
    const by = (name: string) => games.find((g) => g.name === name)!
    expect(by('Neon Snake').engine).toBe('snake')
    expect(by('Slide 15').engine).toBe('slide')
    expect(by('Flood Fill').engine).toBe('lights')
    expect(by('Dragon\'s Choice').engine).toBe('story')
    expect(by('Kingdom Reigns').engine).toBe('reigns')
    expect(by('Desert Caravan').engine).toBe('journey')
  })
  it('featured order is a permutation with stories first', () => {
    const f = featuredOrder(games)
    expect(f).toHaveLength(3000)
    expect(new Set(f.map((g) => g.id)).size).toBe(3000)
    expect(f[0].story).toBe(true)
  })
  it('filters, sorts and paginates', () => {
    const r = filterGames(games, { ...DEFAULT_FILTERS, q: 'snake', sort: 'az' })
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((g) => `${g.name} ${g.desc}`.toLowerCase().includes('snake'))).toBe(true)
    const p = paginate(games, 3)
    expect(p.items).toHaveLength(50)
    expect(p.pages).toBe(60)
    expect(p.items[0]).toBe(games[100])
    expect(paginate(games, 999).page).toBe(60)
    expect(pageList(30, 60)).toEqual([1, 0, 28, 29, 30, 31, 32, 0, 60])
    expect(filterGames(games, { ...DEFAULT_FILTERS, dim: '3' }).every((g) => g.dim === 3)).toBe(true)
  })
  it('round-trips filters through the URL', () => {
    const f = { ...DEFAULT_FILTERS, q: 'space war', genre: 'shooter' as const, story: true, page: 4, section: 12 }
    expect(queryToFilters(filtersToQuery(f))).toEqual(f)
    expect(filtersToQuery(DEFAULT_FILTERS)).toBe('')
  })
})
